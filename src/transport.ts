/**
 * HTTP transport: headers, retries, envelope parsing and error mapping.
 *
 * Nothing here logs or throws request bodies, header values or query strings: they can contain the API key
 * and phone numbers.
 *
 * @module
 */
import {
  APIConnectionError,
  APIError,
  type APIErrorInit,
  APITimeoutError,
  DuplicateRequestError,
  type ErrorLayer,
  errorClass,
  InvalidResponseError,
  RateLimitError,
} from './errors.js';
import type { Hooks, RequestEvent } from './hooks.js';
import { SDK_CLIENT, userAgent } from './identity.js';
import { BodyTooLarge, MAX_JSON_DEPTH, readLimited, tooDeep } from './json.js';
import { maskForInspect } from './mask.js';
import type { Operation } from './operation.js';
import { type RateLimiter, requestCost } from './rate-limit.js';

/** Minimal logger. Only `METHOD path -> status (ms, attempt n)` lines are written to it. */
export interface Logger {
  debug(message: string): void;
}

/** A `fetch` implementation (the global one by default). */
export type Fetch = (input: string, init: RequestInit) => Promise<Response>;

/**
 * Which failures may be retried.
 * - `safe`: read-only or idempotent calls. Retry on 429, 500/502/503/504 and connection errors.
 * - `rateLimitOnly`: calls that could create a duplicate (send without idempotency key, uploads). Retry only on
 *   429, which the gateway returns before the request is processed.
 */
export type RetryPolicy = 'safe' | 'rateLimitOnly';

export type Json = Record<string, unknown>;
type Query = Record<string, string | number | undefined>;

/** What hooks and the rate limiter need to know about an operation. */
export type OperationInfo = Pick<Operation, 'id' | 'name' | 'method' | 'path' | 'rate'>;

export interface RequestSpec {
  retry: RetryPolicy;
  query?: Query;
  /** Extra request headers declared by the spec (for example `token`). Never logged or passed to hooks. */
  headers?: Record<string, string>;
  json?: unknown;
  form?: FormData;
  /** The spec operation, for hooks (path template) and the rate limit bucket. */
  operation?: OperationInfo;
}

export interface TransportConfig {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  fetch: Fetch;
  logger: Logger | undefined;
  rateLimiter?: RateLimiter | undefined;
  hooks?: Hooks | undefined;
  /** User-Agent value (built once per client, §2.1). Defaults to the one without app info. */
  userAgent?: string;
}

/** Headers the SDK sets itself; a spec header parameter can never replace them. */
const RESERVED_HEADERS = new Set([
  'authorization',
  'accept',
  'user-agent',
  'x-bizgo-client',
  'content-type',
  'content-length',
  'host',
]);

/** Ignore a rejected promise returned by a user callback, so it cannot become an unhandled rejection. */
function swallow(result: unknown): void {
  if (typeof (result as { then?: unknown } | null)?.then === 'function') {
    (result as Promise<unknown>).then(undefined, () => undefined);
  }
}

function callHook(hooks: Hooks | undefined, name: keyof Hooks, event: RequestEvent): void {
  const hook = hooks?.[name];
  if (typeof hook !== 'function') return;
  try {
    swallow(hook.call(hooks, event));
  } catch {
    // observability must never break a request (§12.15)
  }
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_BACKOFF_SECONDS = 8;
const MAX_RETRY_AFTER_SECONDS = 60;
const INSPECT = Symbol.for('nodejs.util.inspect.custom');

/** Replaceable in tests so retries do not slow the suite down. Not part of the public API. */
export const timing = {
  sleep: (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms)),
};

/** Default User-Agent (no app info), for reference. Each client builds its own at construction. */
export const USER_AGENT = userAgent();

/**
 * `Retry-After` in seconds (§12.9): only a finite decimal number >= 0 is used, capped at 60. Anything else
 * (negative, hex, HTTP-date, garbage) is ignored and the default backoff applies.
 */
export function retryAfterSeconds(headers: Headers): number | undefined {
  const value = headers.get('retry-after')?.trim();
  if (!value || !/^[0-9]{1,10}(\.[0-9]{1,6})?$/.test(value)) return undefined;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return undefined;
  return Math.min(seconds, MAX_RETRY_AFTER_SECONDS);
}

function backoffSeconds(attempt: number, retryAfter: number | undefined): number {
  if (retryAfter !== undefined) return retryAfter;
  const base = Math.min(0.5 * 2 ** attempt, MAX_BACKOFF_SECONDS);
  return base * (0.75 + Math.random() * 0.5); // jitter, not crypto
}

function shouldRetry(policy: RetryPolicy, status: number | undefined): boolean {
  if (status === 429) return true;
  if (policy === 'rateLimitOnly') return false;
  return status === undefined || RETRYABLE_STATUS.has(status);
}

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Wrap a fetch failure. The original error is not attached as `cause`: its message or stack can contain the
 * full URL, including the query string (phone numbers in MO history filters).
 */
function connectionError(error: unknown): APIConnectionError {
  const name = error instanceof Error ? error.name : typeof error;
  if (name === 'TimeoutError' || name === 'AbortError') {
    return new APITimeoutError(`요청 시간이 초과됐습니다 (${name})`);
  }
  const cause = error instanceof Error ? (error.cause as { code?: unknown } | undefined) : undefined;
  const code = typeof cause?.code === 'string' && /^[A-Z0-9_]{1,40}$/.test(cause.code) ? `, ${cause.code}` : '';
  return new APIConnectionError(`서버에 연결하지 못했습니다 (${name}${code})`);
}

/** A fetch that refuses redirects itself (undici `redirect: 'error'`, some custom fetches) throws this. */
function isRedirectFailure(error: unknown): boolean {
  const cause = error instanceof Error ? (error.cause as { message?: unknown } | undefined) : undefined;
  const text = `${error instanceof Error ? error.message : ''} ${typeof cause?.message === 'string' ? cause.message : ''}`;
  return /redirect/i.test(text);
}

const DUPLICATE_AFTER_RETRY =
  '이전 시도가 이미 접수된 것으로 보입니다(같은 idempotencyKey). 메시지는 다시 발송되지 않았으며, ' +
  '접수 결과는 상태 조회 API로 확인하세요.';

const MAYBE_ACCEPTED = ' 발송 요청은 접수됐을 수 있으니 다시 보내기 전에 상태 조회로 확인하세요.';

export interface ParseOptions {
  /** The request had been retried before this response (§12.4). */
  retried?: boolean;
  /** The operation sends messages: add the "may have been accepted" hint to InvalidResponseError (§12.1). */
  send?: boolean;
}

function apiError(
  status: number,
  headers: Headers,
  body: unknown,
  code: string | null,
  serverMessage: string,
  layer: ErrorLayer,
  trackingId: string | undefined,
  retried: boolean,
): Error {
  const cls = errorClass(status, code, layer);
  const init: APIErrorInit = { serverMessage, httpStatus: status, code, layer, trackingId, body, retried };
  if (cls === RateLimitError) return new RateLimitError({ ...init, retryAfter: retryAfterSeconds(headers) });
  if (cls === DuplicateRequestError && retried) {
    return new DuplicateRequestError({ ...init, serverMessage: DUPLICATE_AFTER_RETRY });
  }
  return new cls(init);
}

function invalid(message: string, status: number, text: string, send: boolean, trackingId?: string): Error {
  return new InvalidResponseError(`${message} (HTTP ${status})${send ? MAYBE_ACCEPTED : ''}`, status, {
    trackingId,
    body: text,
  });
}

/** `common.infobankTrId` from a body that may not parse (truncated JSON), for support inquiries. */
function sniffTrackingId(text: string): string | undefined {
  const match = /"infobankTrId"\s*:\s*"([A-Za-z0-9._:-]{1,100})"/.exec(text.slice(0, 4096));
  return match?.[1];
}

/** Return the JSON body, or throw the matching error (SDK-DESIGN.md §5, §12.1, §12.8, §12.17). */
export function parseEnvelope(
  status: number,
  headers: Headers,
  text: string,
  options: ParseOptions | boolean = {},
): Json {
  const { retried = false, send = false } = typeof options === 'boolean' ? { retried: options } : options;
  if (status >= 300 && status < 400) {
    // redirects are never followed (the key must not travel elsewhere) and never retried (§12.17)
    throw new InvalidResponseError(
      `HTTP ${status}: 리다이렉트 응답을 받았습니다. SDK는 리다이렉트를 따르지 않습니다. baseUrl을 확인하세요.${send ? MAYBE_ACCEPTED : ''}`,
      status,
      { trackingId: sniffTrackingId(text), body: text },
    );
  }
  if (tooDeep(text)) {
    throw invalid(
      `응답 JSON의 중첩이 너무 깊습니다(최대 ${MAX_JSON_DEPTH})`,
      status,
      text,
      send,
      sniffTrackingId(text),
    );
  }
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }
  if (!isRecord(body)) {
    if (status >= 400) {
      throw apiError(
        status,
        headers,
        undefined,
        null,
        `응답 본문이 JSON이 아닙니다 (HTTP ${status})`,
        'gateway',
        sniffTrackingId(text),
        false,
      );
    }
    throw invalid('응답 본문이 JSON 객체가 아닙니다', status, text, send, sniffTrackingId(text));
  }
  maskForInspect(body);
  const common = isRecord(body.common) ? body.common : {};
  const data = isRecord(body.data) ? body.data : undefined;
  const trackingId = typeof common.infobankTrId === 'string' ? common.infobankTrId : undefined;
  const authCode = common.authCode;
  const serviceCode = data?.code;

  if (authCode !== undefined && authCode !== null && authCode !== 'A000') {
    const message = String(common.authResult ?? '');
    throw apiError(status, headers, body, String(authCode), message, 'gateway', trackingId, retried);
  }
  if (serviceCode !== undefined && serviceCode !== null && serviceCode !== 'A000') {
    const message = String(data?.result ?? '');
    throw apiError(status, headers, body, String(serviceCode), message, 'service', trackingId, retried);
  }
  if (status >= 400) {
    throw apiError(status, headers, body, null, '요청이 실패했습니다', 'gateway', trackingId, retried);
  }
  return body;
}

export class Transport {
  readonly #apiKey: string;
  readonly #config: Omit<TransportConfig, 'apiKey'>;

  constructor(config: TransportConfig) {
    const { apiKey, ...rest } = config;
    this.#apiKey = apiKey;
    this.#config = rest;
  }

  get baseUrl(): string {
    return this.#config.baseUrl;
  }

  #log(method: string, path: string, status: number | string, started: number, attempt: number): void {
    const logger = this.#config.logger;
    if (!logger) return;
    // path only: query strings can carry phone numbers (for example MO history filters)
    const ms = Math.round(Date.now() - started);
    try {
      const result: unknown = logger.debug(`${method} ${path} -> ${status} (${ms} ms, attempt ${attempt + 1})`);
      swallow(result);
    } catch {
      // a broken logger must never change the result of a request (§12.15)
    }
  }

  async request(method: string, path: string, spec: RequestSpec): Promise<Json> {
    const { hooks } = this.#config;
    const op = spec.operation;
    const event: RequestEvent = {
      operationId: op?.id ?? 'unknown',
      operation: op?.name ?? 'unknown',
      method,
      pathTemplate: op?.path ?? 'unknown',
      attempts: 0,
    };
    const started = Date.now();
    callHook(hooks, 'onRequestStart', event);
    try {
      const body = await this.#send(method, path, spec, event);
      event.success = true;
      return body;
    } catch (error) {
      event.success = false;
      event.errorType = error instanceof Error ? error.constructor.name : 'Error';
      if (error instanceof APIError) {
        event.layer = error.layer;
        if (error.code !== null) event.code = error.code;
      }
      throw error;
    } finally {
      event.durationMs = Date.now() - started;
      callHook(hooks, 'onRequestEnd', event);
    }
  }

  async #send(method: string, path: string, spec: RequestSpec, event: RequestEvent): Promise<Json> {
    const { baseUrl, maxRetries, timeoutMs, fetch, rateLimiter } = this.#config;
    const search = new URLSearchParams();
    for (const [name, value] of Object.entries(spec.query ?? {})) {
      if (value !== undefined) search.append(name, String(value));
    }
    const query = search.toString();
    const url = `${baseUrl}${path}${query ? `?${query}` : ''}`;
    const headers: Record<string, string> = {};
    for (const [name, value] of Object.entries(spec.headers ?? {})) {
      if (!RESERVED_HEADERS.has(name.toLowerCase())) headers[name] = value;
    }
    // set last: spec header params can never replace these (§2.1)
    headers.Authorization = this.#apiKey;
    headers.Accept = 'application/json';
    headers['User-Agent'] = this.#config.userAgent ?? USER_AGENT;
    headers['X-Bizgo-Client'] = SDK_CLIENT;
    let body: string | FormData | undefined;
    if (spec.json !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(spec.json);
    } else if (spec.form !== undefined) {
      body = spec.form; // fetch sets multipart/form-data with the boundary; never set it by hand
    }
    const bucket = spec.operation?.rate ?? 'other';
    const cost = requestCost(bucket, spec.json);

    const send = spec.operation?.rate === 'send';
    for (let attempt = 0; ; attempt++) {
      const last = attempt >= maxRetries;
      if (rateLimiter) await rateLimiter.acquire(bucket, cost);
      event.attempts = attempt + 1;
      const started = Date.now();
      let response: Response;
      let text: string;
      let received: number | undefined;
      try {
        response = await fetch(url, {
          method,
          headers: { ...headers }, // a fresh copy per attempt: a custom fetch cannot change later attempts
          body,
          signal: AbortSignal.timeout(timeoutMs),
          // Never follow redirects: the Authorization header must only go to the configured base URL. 'manual'
          // hands the 3xx back so it is reported with its status and not retried (§12.17).
          redirect: 'manual',
        });
        received = response.status;
        text = await readLimited(response);
      } catch (error) {
        if (error instanceof BodyTooLarge) {
          this.#log(method, path, 'too large', started, attempt);
          throw new InvalidResponseError(
            `응답이 너무 큽니다(압축 해제 후 최대 16MB). 읽기를 중단했습니다.${send ? MAYBE_ACCEPTED : ''}`,
            received,
          );
        }
        this.#log(method, path, error instanceof Error ? error.name : 'Error', started, attempt);
        event.status = undefined;
        if (isRedirectFailure(error)) {
          // §12.17: a redirect is never retried; the fetch did not expose the exact status
          throw new InvalidResponseError(
            `HTTP 3xx: 리다이렉트 응답을 받았습니다. SDK는 리다이렉트를 따르지 않습니다. baseUrl을 확인하세요.${send ? MAYBE_ACCEPTED : ''}`,
            received,
          );
        }
        if (last || !shouldRetry(spec.retry, undefined)) throw connectionError(error);
        await timing.sleep(backoffSeconds(attempt, undefined) * 1000);
        continue;
      }
      // `opaqueredirect` (status 0) is what browsers-like fetch implementations return for redirect: 'manual'
      const status = response.type === 'opaqueredirect' ? 302 : response.status;
      this.#log(method, path, status, started, attempt);
      event.status = status;
      if (!last && shouldRetry(spec.retry, status)) {
        await timing.sleep(backoffSeconds(attempt, retryAfterSeconds(response.headers)) * 1000);
        continue;
      }
      return parseEnvelope(status, response.headers, text, { retried: attempt > 0, send });
    }
  }

  toString(): string {
    return `Transport(baseUrl=${this.#config.baseUrl})`;
  }
}

Object.defineProperty(Transport.prototype, INSPECT, {
  value(this: Transport) {
    return this.toString();
  },
});
