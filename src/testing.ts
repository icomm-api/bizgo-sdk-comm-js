/**
 * Test your own code against the SDK without a network or an API key (`@bizgo/bizgo-sdk-comm-js/testing`).
 *
 * ```ts
 * import { Bizgo, RateLimitError, sms } from '@bizgo/bizgo-sdk-comm-js';
 * import { FakeFetch, signWebhook, webhookRequest } from '@bizgo/bizgo-sdk-comm-js/testing';
 *
 * const fake = new FakeFetch();
 * const client = new Bizgo(fake.clientOptions()); // placeholder key, sandbox URL, no rate limit, never connects
 *
 * await client.send.sms({ to: '01000000000', from: '01000000000', text: 'hello' }); // default: every recipient A000
 * fake.lastRequest?.operationId;                 // 'sendOmni'
 * fake.lastRequest?.json;                        // the JSON body that would have been sent
 *
 * fake.on('sendOmni').fail('service', 200, 'A020');          // next call: rate limited (RateLimitError)
 * fake.on('sendOmni').sendResult('A000', 'A306');            // then: second recipient rejected
 * fake.on('GET', '/api/comm/v1/report/inquiry/{msgKey}').data({ report: [] });
 *
 * const { headers, body } = signWebhook('test-webhook-secret', { msgKey: 'KEY001' }); // report/MO webhook tests
 * const counsel = webhookRequest(counselPayload); // counsel webhook tests: no signature headers
 * ```
 *
 * Every request is recorded with its operation, method, path, query and JSON body (or multipart field names and
 * file sizes). Header values, including the API key, are never recorded. Without a stub an operation answers with
 * a success envelope: sends (`sendOmni`, `createReservation`, `addReservationRecipients`) accept every recipient
 * with a fake `msgKey` (`createReservation` also returns a fake `resvKey`), other operations return
 * `data.data = {}` (empty lists, no next page). An unknown path answers HTTP 404 (gateway `A404`).
 *
 * This module is for tests only; production code never needs to import it.
 *
 * @module
 */
import { createHmac } from 'node:crypto';
import { Environment } from './config.js';
import { OPERATIONS } from './generated/operations.js';
import type { Operation } from './operation.js';
import { FAKE_FETCH } from './util.js';

/** The placeholder API key used by {@link FakeFetch.clientOptions}. */
export const FAKE_API_KEY = 'test-api-key-not-real';

type Json = Record<string, unknown>;

/** A multipart field as recorded: text as is, files by name, type and size only. */
export type RecordedField = string | { filename: string; type: string; size: number };

/** One request the client made. */
export interface RecordedRequest {
  /** Matched operation (`undefined` for an unknown path). */
  readonly operationId: string | undefined;
  /** `<resource>.<method>` of the matched operation. */
  readonly operation: string | undefined;
  readonly method: string;
  /** Real path (with the encoded path values). */
  readonly path: string;
  /** Path template of the matched operation. */
  readonly pathTemplate: string | undefined;
  readonly query: Readonly<Record<string, string>>;
  /** Parsed JSON body, if any. */
  readonly json: unknown;
  /** Multipart fields, if any. */
  readonly form: Readonly<Record<string, RecordedField | RecordedField[]>> | undefined;
  /** Names (not values) of the request headers. */
  readonly headerNames: readonly string[];
}

type Reply = (request: RecordedRequest) => Response | Promise<Response>;

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

/** `{"common": {"authCode": "A000", ...}, "data": {"code": "A000", "result": "Success", "data": <data>}}` */
export function successEnvelope(data?: unknown, extra: Json = {}): Json {
  const inner: Json = { code: 'A000', result: 'Success', ...extra };
  if (data !== undefined) inner.data = data;
  return { common: { authCode: 'A000', authResult: 'Success', infobankTrId: 'FAKE-TR-ID' }, data: inner };
}

/** An error envelope: gateway errors set `common.authCode`, service errors set `data.code`. */
export function errorEnvelope(layer: 'gateway' | 'service', code: string, message = 'Failed'): Json {
  if (layer === 'gateway') return { common: { authCode: code, authResult: message, infobankTrId: 'FAKE-TR-ID' } };
  return {
    common: { authCode: 'A000', authResult: 'Success', infobankTrId: 'FAKE-TR-ID' },
    data: { code, result: message },
  };
}

interface Matcher {
  op: Operation;
  pattern: RegExp;
  variables: number;
}

const MATCHERS: readonly Matcher[] = (Object.values(OPERATIONS) as Operation[])
  .map((op) => {
    const source = op.path
      .split(/\{[^}]+\}/)
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('[^/]+');
    return { op, pattern: new RegExp(`^${source}$`), variables: op.pathParams.length };
  })
  .sort((a, b) => a.variables - b.variables); // literal paths win over templates

function match(method: string, path: string): Operation | undefined {
  return MATCHERS.find((m) => m.op.method === method && m.pattern.test(path))?.op;
}

async function formFields(body: FormData): Promise<Record<string, RecordedField | RecordedField[]>> {
  const entries: [string, FormDataEntryValue][] = [];
  body.forEach((value, name) => {
    entries.push([name, value]);
  });
  const out: Record<string, RecordedField | RecordedField[]> = {};
  for (const [name, value] of entries) {
    let field: RecordedField;
    if (typeof value === 'string') field = value;
    else if (value.type === 'application/json')
      field = await value.text(); // JSON parts: show the text
    else field = { filename: (value as { name?: string }).name ?? '', type: value.type, size: value.size };
    const existing = out[name];
    if (existing === undefined) out[name] = field;
    else out[name] = Array.isArray(existing) ? [...existing, field] : [existing, field];
  }
  return out;
}

function names(headers: HeadersInit | undefined): string[] {
  if (headers === undefined) return [];
  if (headers instanceof Headers) {
    const out: string[] = [];
    headers.forEach((_value, name) => {
      out.push(name);
    });
    return out;
  }
  if (Array.isArray(headers)) return headers.map(([name]) => String(name));
  return Object.keys(headers);
}

/** Stubbed responses for one operation. Each call adds one response; the last one repeats. */
export class Stub {
  readonly #add: (reply: Reply) => void;
  readonly #fake: FakeFetch;

  /** @internal */
  constructor(fake: FakeFetch, add: (reply: Reply) => void) {
    this.#fake = fake;
    this.#add = add;
  }

  /** Answer with a raw status and JSON body (and optional headers such as `Retry-After`). */
  respond(status: number, body: unknown, headers?: Record<string, string>): this {
    this.#add(() => json(status, body, headers));
    return this;
  }

  /** Answer with a success envelope whose `data.data` is `data`. */
  data(data: unknown, extra?: Json): this {
    return this.respond(200, successEnvelope(data, extra));
  }

  /**
   * Answer a send with one destination result per code: `'A000'` accepted (`succeeded`), `'A301'` already accepted
   * with the same idempotency key (`duplicates`), anything else rejected (`failed`).
   */
  sendResult(...codes: string[]): this {
    this.#add((request) => json(200, this.#fake.sendBody(request.json, codes)));
    return this;
  }

  /** Answer with an API error, for example `fail('service', 200, 'A020')` or `fail('gateway', 401, 'A401')`. */
  fail(layer: 'gateway' | 'service', status: number, code: string, options: { retryAfter?: number } = {}): this {
    const headers = options.retryAfter === undefined ? undefined : { 'retry-after': String(options.retryAfter) };
    return this.respond(status, errorEnvelope(layer, code), headers);
  }

  /** Fail like a refused connection (`APIConnectionError`). */
  networkError(): this {
    this.#add(() => {
      throw new TypeError('fetch failed');
    });
    return this;
  }

  /** Fail like a timeout (`APITimeoutError`). */
  timeout(): this {
    this.#add(() => {
      throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
    });
    return this;
  }

  /** Answer with the default success response. */
  default(): this {
    this.#add((request) => this.#fake.defaultResponse(request));
    return this;
  }
}

/**
 * An in-memory stand-in for the Bizgo API: pass `fake.fetch` (or `fake.clientOptions()`) to `new Bizgo()`.
 */
export class FakeFetch {
  readonly #requests: RecordedRequest[] = [];
  readonly #stubs = new Map<string, Reply[]>();
  #msgKeys = 0;

  /** Options for `new Bizgo()`: placeholder key, sandbox URL, this fake as `fetch`, rate limit off. */
  constructor() {
    // accepted by `new Bizgo({ fetch })` without `trustFetch`: this fetch never leaves the process
    Object.defineProperty(this.fetch, FAKE_FETCH, { value: true });
  }

  clientOptions<T extends object>(
    overrides?: T,
  ): { apiKey: string; environment: typeof Environment.SANDBOX; fetch: FakeFetch['fetch']; rateLimit: null } & T {
    return {
      apiKey: FAKE_API_KEY,
      environment: Environment.SANDBOX,
      fetch: this.fetch,
      rateLimit: null,
      ...(overrides ?? ({} as T)),
    };
  }

  /** Stub an operation by `operationId`, or by HTTP method and path template. */
  on(operationId: string): Stub;
  on(method: string, pathTemplate: string): Stub;
  on(idOrMethod: string, pathTemplate?: string): Stub {
    const ops = Object.values(OPERATIONS) as Operation[];
    const op =
      pathTemplate === undefined
        ? ops.find((o) => o.id === idOrMethod)
        : ops.find((o) => o.method === idOrMethod.toUpperCase() && o.path === pathTemplate);
    if (!op)
      throw new Error(
        `unknown operation: ${pathTemplate === undefined ? idOrMethod : `${idOrMethod} ${pathTemplate}`}`,
      );
    return new Stub(this, (reply) => {
      const queue = this.#stubs.get(op.id) ?? [];
      queue.push(reply);
      this.#stubs.set(op.id, queue);
    });
  }

  /** Every recorded request, oldest first. */
  get requests(): readonly RecordedRequest[] {
    return [...this.#requests];
  }

  /** Recorded requests of one operation. */
  requestsFor(operationId: string): RecordedRequest[] {
    return this.#requests.filter((r) => r.operationId === operationId);
  }

  get lastRequest(): RecordedRequest | undefined {
    return this.#requests[this.#requests.length - 1];
  }

  /** Forget recorded requests and stubs. */
  reset(): void {
    this.#requests.length = 0;
    this.#stubs.clear();
  }

  /** The `fetch` to pass to the client. */
  readonly fetch = async (input: string, init: RequestInit): Promise<Response> => {
    const url = new URL(input);
    const method = (init.method ?? 'GET').toUpperCase();
    const op = match(method, url.pathname);
    let body: unknown;
    let form: RecordedRequest['form'];
    if (typeof init.body === 'string') {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = undefined;
      }
    } else if (init.body instanceof FormData) {
      form = await formFields(init.body);
    }
    const headerNames = names(init.headers);
    const request: RecordedRequest = {
      operationId: op?.id,
      operation: op?.name,
      method,
      path: url.pathname,
      pathTemplate: op?.path,
      query: Object.fromEntries(url.searchParams.entries()),
      json: body,
      form,
      headerNames,
    };
    this.#requests.push(request);
    if (!op) return json(404, errorEnvelope('gateway', 'A404', 'Not Found'), {});
    const queue = this.#stubs.get(op.id);
    const reply = queue && queue.length > 0 ? (queue.length > 1 ? queue.shift() : queue[0]) : undefined;
    return reply ? reply(request) : this.defaultResponse(request);
  };

  /** @internal The default success response of an operation. */
  defaultResponse(request: RecordedRequest): Response {
    switch (request.operationId) {
      case 'sendOmni':
      case 'createReservation':
      case 'addReservationRecipients': {
        const count = this.#destinations(request.json).length || 1;
        const body = this.sendBody(
          request.json,
          Array.from({ length: count }, () => 'A000'),
        );
        if (request.operationId === 'createReservation') {
          // the reservation key sits next to data.data (x-sdk-result: data)
          (body.data as Json).resvKey = 'FAKE-RESVKEY-000001';
        }
        return json(200, body);
      }
      default:
        return json(200, successEnvelope({}));
    }
  }

  #destinations(request: unknown): Json[] {
    const list = (request as { destinations?: unknown } | undefined)?.destinations;
    return Array.isArray(list) ? (list as Json[]) : [];
  }

  /** @internal A send response with one destination result per code. */
  sendBody(request: unknown, codes: readonly string[]): Json {
    const given = this.#destinations(request);
    const destinations = codes.map((code, i) => {
      const d: Json = {};
      if (typeof given[i]?.to === 'string') d.to = given[i]?.to;
      if (typeof given[i]?.ref === 'string') d.ref = given[i]?.ref;
      this.#msgKeys += 1;
      d.msgKey = `FAKE-MSGKEY-${String(this.#msgKeys).padStart(6, '0')}`;
      d.code = code;
      d.result = code === 'A000' ? 'Success' : 'Failed';
      return d;
    });
    const ref = (request as { ref?: unknown } | undefined)?.ref;
    return successEnvelope({ destinations }, typeof ref === 'string' ? { ref } : {});
  }

  toString(): string {
    return `FakeFetch(requests=${this.#requests.length})`;
  }
}

export interface SignWebhookOptions {
  /** `X-IB-Timestamp` value; default now in epoch milliseconds (as Bizgo sends it). */
  timestamp?: string | number;
  /** Signature encoding (default `hex`). */
  encoding?: 'hex' | 'base64';
}

/**
 * Build a signed report/MO webhook request for testing your {@link WebhookReceiver} handler: headers
 * (`X-IB-Timestamp`, `X-IB-Signature` = HmacSHA256(secret, timestamp)) and the JSON body text.
 * Counsel (상담톡) webhooks carry no signature: use {@link webhookRequest} for them.
 */
export function signWebhook(
  secret: string | Uint8Array,
  payload: unknown,
  options: SignWebhookOptions = {},
): { headers: Record<string, string>; body: string } {
  const timestamp = String(options.timestamp ?? Date.now());
  const signature = createHmac('sha256', secret)
    .update(timestamp, 'utf8')
    .digest(options.encoding ?? 'hex');
  return {
    headers: { 'Content-Type': 'application/json', 'X-IB-Timestamp': timestamp, 'X-IB-Signature': signature },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  };
}

/**
 * Build a counsel (상담톡) webhook request as Bizgo sends it: plain headers (`Content-Type` only, no signature
 * headers) and the JSON body text.
 */
export function webhookRequest(payload: unknown): { headers: Record<string, string>; body: string } {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  };
}
