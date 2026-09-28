/**
 * Runtime for the methods generated from the spec (src/generated/resources.ts): build the request from the
 * operation metadata (src/generated/operations.ts), validate it, send it, and pick the `x-sdk-result` part.
 *
 * @module
 */
import { ValidationError } from './errors.js';
import { withDefaultIdempotencyTtl } from './idempotency.js';
import type { Json, Transport } from './transport.js';
import { filePart, loadFile } from './upload.js';
import { isRecord, segment, yyyymmdd } from './util.js';
import { checkOptions, type ObjectRule, validate, validateWith } from './validation.js';

/** A path into a response body: property names, and array indexes (`-1` is the last item). */
export type ResultPath = readonly (string | number)[];

/** Metadata of one spec operation (generated). */
export interface Operation {
  /** `operationId`, for example `listAlimtalkTemplates`. */
  readonly id: string;
  /** `<x-sdk-resource>.<x-sdk-method>`, for example `alimtalk.templates.list`. */
  readonly name: string;
  readonly method: string;
  /** Path template, for example `/api/comm/v1/report/inquiry/{msgKey}`. */
  readonly path: string;
  readonly retry: 'safe' | 'rateLimitOnly';
  /** Client-side token bucket: `send` (send APIs) or `other`. */
  readonly rate: 'send' | 'other';
  readonly pathParams: readonly string[];
  readonly query?: ObjectRule;
  /** Query params sent comma-separated (`style: form, explode: false`). */
  readonly arrays?: readonly string[];
  /** Query params in `yyyyMMdd`; a `Date` is converted to the KST date. */
  readonly dates?: readonly string[];
  readonly headers?: ObjectRule;
  readonly body?: {
    readonly required: boolean;
    readonly json?: string;
    readonly form?: string;
    readonly fields?: Readonly<Record<string, 'file' | 'files' | 'json' | 'text'>>;
    readonly filename?: string;
    /**
     * The JSON body has both `idempotencyKey` and `idempotencyTtl`: when the key is set without a TTL, the SDK
     * sends `idempotencyTtl: 86400` ({@link DEFAULT_IDEMPOTENCY_TTL}).
     */
    readonly idempotencyTtl?: boolean;
  };
  readonly result: { readonly path: ResultPath; readonly kind: 'void' | 'array' | 'value' };
  readonly pagination?: {
    readonly style: 'cursor' | 'page' | 'offset';
    readonly request: string;
    readonly size?: string;
    readonly items: ResultPath;
    readonly cursor?: ResultPath;
    readonly hasNext?: ResultPath;
    readonly total?: ResultPath;
  };
}

/** Read a value at `path` (`-1` = last array item). */
export function pick(body: unknown, path: ResultPath): unknown {
  let node: unknown = body;
  for (const segment of path) {
    if (typeof segment === 'number') {
      if (!Array.isArray(node)) return undefined;
      node = node[segment < 0 ? node.length + segment : segment];
    } else {
      if (!isRecord(node)) return undefined;
      node = node[segment];
    }
  }
  return node;
}

const HEADER_VALUE = /^[\t\x20-\x7e\x80-\xff]*$/;

interface Prepared {
  path: string;
  query: Record<string, string | undefined>;
  headers: Record<string, string>;
  json?: unknown;
  form?: FormData;
}

function allowed(op: Operation): string[] {
  const names = [...op.pathParams];
  names.push(...Object.keys(op.query?.properties ?? {}));
  names.push(...Object.keys(op.headers?.properties ?? {}));
  if (op.body) names.push('body');
  return names;
}

function queryValues(op: Operation, params: Record<string, unknown>): Record<string, string | undefined> {
  if (!op.query) return {};
  const input: Record<string, unknown> = {};
  for (const name of Object.keys(op.query.properties ?? {})) {
    let value = params[name];
    if (value instanceof Date && op.dates?.includes(name)) value = yyyymmdd(value, name);
    if (typeof value === 'string' && op.arrays?.includes(name)) value = [value];
    if (value !== undefined) input[name] = value;
  }
  const checked = validateWith(op.query, input) as Record<string, unknown>;
  const out: Record<string, string | undefined> = {};
  for (const [name, value] of Object.entries(checked)) {
    if (value === undefined || value === null) continue;
    out[name] = Array.isArray(value) ? value.map(String).join(',') : String(value);
  }
  return out;
}

function headerValues(op: Operation, params: Record<string, unknown>): Record<string, string> {
  if (!op.headers) return {};
  const input: Record<string, unknown> = {};
  for (const name of Object.keys(op.headers.properties ?? {})) {
    if (params[name] !== undefined) input[name] = params[name];
  }
  const checked = validateWith(op.headers, input) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(checked)) {
    const text = String(value);
    // CR/LF would split the header; the value itself is never echoed back
    if (!HEADER_VALUE.test(text))
      throw new ValidationError([{ path: name, message: '헤더에 쓸 수 없는 문자가 있습니다' }]);
    out[name] = text;
  }
  return out;
}

function hasFile(op: Operation, body: unknown): boolean {
  if (!isRecord(body)) return false;
  return Object.entries(op.body?.fields ?? {}).some(
    ([name, kind]) => (kind === 'file' || kind === 'files') && body[name] !== undefined,
  );
}

async function multipart(op: Operation, body: unknown): Promise<FormData> {
  const spec = op.body;
  if (!spec?.form || !spec.fields) throw new Error(`${op.id}: no multipart body`);
  const checked = validate<Record<string, unknown>>(spec.form, body);
  const data = new FormData();
  const fallback = spec.filename ?? 'file';
  for (const [name, value] of Object.entries(checked)) {
    if (value === undefined || value === null) continue;
    const kind = spec.fields[name] ?? 'text';
    if (kind === 'file' || kind === 'files') {
      for (const file of kind === 'files' && Array.isArray(value) ? value : [value]) {
        const loaded = await loadFile(file, undefined, fallback);
        data.append(name, filePart(loaded), loaded.name);
      }
    } else if (kind === 'json') {
      data.append(name, new Blob([JSON.stringify(value)], { type: 'application/json' }));
    } else {
      data.append(name, String(value));
    }
  }
  return data;
}

/** Validate the params of an operation and build the request. Nothing is sent if this throws. */
export async function prepare(op: Operation, input: unknown): Promise<Prepared> {
  const params = checkOptions(input, allowed(op), op.name);
  let path = op.path;
  for (const name of op.pathParams) {
    if (params[name] === undefined || params[name] === null) {
      throw new ValidationError([{ path: name, message: '필수 경로 값입니다' }]);
    }
    path = path.replace(`{${name}}`, segment(params[name], name));
  }
  const prepared: Prepared = { path, query: queryValues(op, params), headers: headerValues(op, params) };
  const body = params.body;
  if (op.body) {
    if (body === undefined || body === null) {
      if (op.body.required) throw new ValidationError([{ path: 'body', message: '요청 본문이 필요합니다' }]);
    } else if (op.body.form && (!op.body.json || hasFile(op, body))) {
      prepared.form = await multipart(op, body);
    } else if (op.body.json) {
      const checked = validate(op.body.json, body, '');
      // a copy: the caller's object is never changed
      prepared.json = op.body.idempotencyTtl ? withDefaultIdempotencyTtl(checked) : checked;
    }
  }
  return prepared;
}

async function raw(transport: Transport, op: Operation, params: unknown): Promise<Json> {
  const prepared = await prepare(op, params);
  return transport.request(op.method, prepared.path, {
    retry: op.retry,
    query: prepared.query,
    headers: prepared.headers,
    json: prepared.json,
    form: prepared.form,
    operation: op,
  });
}

function result(op: Operation, body: Json): unknown {
  if (op.result.kind === 'void') return undefined;
  const value = pick(body, op.result.path);
  if (op.result.kind === 'array') return Array.isArray(value) ? value : [];
  return value ?? {};
}

/** Call one operation and return its `x-sdk-result` part (`undefined` for operations without data). */
export async function callOperation(transport: Transport, op: Operation, params: unknown): Promise<unknown> {
  return result(op, await raw(transport, op, params));
}

function count(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Iterate over every item of a paginated operation.
 *
 * - cursor: sends the previous page's cursor; stops when `hasNext` is false, the cursor is missing, or it did not
 *   move.
 * - page / offset: starts at page 1 / offset 0; stops when a page is empty, smaller than the requested size (or
 *   than the first page when no size was given), `total` is reached, or `hasNext` is false.
 */
export async function* iterateOperation(
  transport: Transport,
  op: Operation,
  input: unknown,
): AsyncGenerator<unknown, void, undefined> {
  const pagination = op.pagination;
  if (!pagination) throw new Error(`${op.id} is not paginated`);
  const params = checkOptions(
    input,
    allowed(op).filter((name) => name !== pagination.request),
    `${op.name} (iterate)`,
  );
  let position: unknown;
  if (pagination.style === 'page') position = 1;
  if (pagination.style === 'offset') position = 0;
  let size = pagination.size ? count(params[pagination.size]) : undefined;
  let seen = 0;
  for (;;) {
    const body = await raw(transport, op, { ...params, [pagination.request]: position });
    const items = pick(body, pagination.items);
    const list = Array.isArray(items) ? items : [];
    yield* list;
    seen += list.length;
    const hasNext = pagination.hasNext ? pick(body, pagination.hasNext) : undefined;
    if (pagination.style === 'cursor') {
      const next = pagination.cursor ? pick(body, pagination.cursor) : undefined;
      if (hasNext !== true || next === undefined || next === null || next === position) return;
      position = next;
      continue;
    }
    if (list.length === 0 || hasNext === false) return;
    size ??= list.length;
    if (list.length < size) return;
    const total = pagination.total ? count(pick(body, pagination.total)) : undefined;
    if (total !== undefined && seen >= total) return;
    position = pagination.style === 'page' ? (position as number) + 1 : (position as number) + list.length;
  }
}
