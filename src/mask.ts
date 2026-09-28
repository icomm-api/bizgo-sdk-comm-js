/**
 * One masking helper for everything the SDK prints (SDK-DESIGN.md §12.11): result/response models, webhook
 * payloads, and — through {@link redact} — request params/options and query objects you want to log.
 *
 * Rules, by field name (API names, any nesting level):
 * - phone numbers (`to`, `from`, `phoneNumber`, `callback`, ...): 11+ chars keep the first 3 and last 4
 *   (`010****0000`); 8-10 chars keep the first 3 and mask at least half (`158****4`); 7 or fewer are fully masked
 * - person fields (`userName`, `nickname`/`nickName`, `email`/`userEmail`, `name` inside `personalInfo`): first
 *   character kept, the rest masked
 * - content/text (`content`, `contents`, `text`, `message`, `comment`, `replaceWords`): length only (`<12 chars>`)
 * - tokens/keys/secrets (`token`, `apiKey`, `secret`, `password`, `authorization`, ...): fully hidden
 *
 * Printing (`util.inspect`/`console.log`/`toString`) is masked; property access and `JSON.stringify` keep the real
 * values, because code that serializes a result does so on purpose (to store it). Log with `redact(value)` or
 * `util.inspect(value)`, never with `JSON.stringify`.
 *
 * @module
 */

export const INSPECT = Symbol.for('nodejs.util.inspect.custom');

/** API names of fields that hold phone numbers. */
export const PHONE_FIELDS: ReadonlySet<string> = new Set([
  'to',
  'from',
  'phoneNumber',
  'phoneNumbers',
  'phone_number',
  'mdn',
  'originator',
  'callback',
  'dialPhoneNumber',
  'telNumber',
  'unsubscribePhoneNumber',
]);

/** Fields that identify a person. `name` counts only inside `personalInfo` (elsewhere it names templates etc.). */
export const PERSON_FIELDS: ReadonlySet<string> = new Set(['userName', 'nickname', 'nickName', 'email', 'userEmail']);

/** Free-text fields: only their length is shown. */
export const CONTENT_FIELDS: ReadonlySet<string> = new Set([
  'content',
  'contents',
  'text',
  'message',
  'comment',
  'replaceWords',
]);

/** Credentials: never shown. */
export const SECRET_FIELDS: ReadonlySet<string> = new Set([
  'token',
  'apiKey',
  'secret',
  'password',
  'authorization',
  'Authorization',
  'accessToken',
  'refreshToken',
]);

const HIDDEN = '[hidden]';

/** Mask a phone number by length (see the module rules). Arrays are masked item by item. */
export function maskPhone(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskPhone);
  if (typeof value !== 'string') return value;
  const n = value.length;
  if (n <= 7) return '*'.repeat(n);
  if (n >= 11) return `${value.slice(0, 3)}${'*'.repeat(n - 7)}${value.slice(-4)}`;
  const masked = Math.ceil(n / 2);
  const tail = n - 3 - masked;
  return `${value.slice(0, 3)}${'*'.repeat(masked)}${tail > 0 ? value.slice(-tail) : ''}`;
}

/** First character kept, the rest masked (`홍**`, `u*************`). */
export function maskPerson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskPerson);
  if (typeof value !== 'string') return value;
  const chars = [...value];
  return chars.length <= 1 ? '*'.repeat(chars.length) : `${chars[0]}${'*'.repeat(chars.length - 1)}`;
}

function length(value: unknown): unknown {
  if (typeof value === 'string') return `<${[...value].length} chars>`;
  if (Array.isArray(value)) return `<${value.length} items>`;
  if (typeof value === 'object' && value !== null) return '<object>';
  return value;
}

/** The printed form of one field. `parent` is the key that holds the object (for `personalInfo.name`). */
export function maskField(key: string, value: unknown, parent?: string): unknown {
  if (value === null || value === undefined) return value;
  if (SECRET_FIELDS.has(key)) return HIDDEN;
  if (PHONE_FIELDS.has(key)) return maskPhone(value);
  if (PERSON_FIELDS.has(key) || (parent === 'personalInfo' && key === 'name')) return maskPerson(value);
  if (CONTENT_FIELDS.has(key)) return length(value);
  return value;
}

/** A shallow copy for printing: every field passed through {@link maskField}. */
export function masked(value: Record<string, unknown>, parent?: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(value)) out[key] = maskField(key, field, parent);
  return out;
}

function sensitive(key: string, parent: string | undefined): boolean {
  return (
    PHONE_FIELDS.has(key) ||
    PERSON_FIELDS.has(key) ||
    CONTENT_FIELDS.has(key) ||
    SECRET_FIELDS.has(key) ||
    (parent === 'personalInfo' && key === 'name')
  );
}

/**
 * A deep, masked copy of any value, safe to log: request params/options (`client.x.y(params)`), query objects,
 * results, webhook payloads. The input is not changed. Depth is capped at 64 (deeper values become `'<deep>'`);
 * non-plain objects (Blob, Uint8Array, Date) are summarized.
 *
 * ```ts
 * logger.info('sending', redact(params)); // { body: { destinations: [{ to: '010****0000' }], ... } }
 * ```
 */
export function redact(value: unknown): unknown {
  const walk = (node: unknown, parent: string | undefined, depth: number): unknown => {
    if (depth > 64) return '<deep>';
    if (Array.isArray(node)) return node.map((item) => walk(item, parent, depth + 1));
    if (node instanceof Date) return node.toISOString();
    if (node instanceof Uint8Array || node instanceof ArrayBuffer) return `<${node.byteLength} bytes>`;
    if (typeof Blob !== 'undefined' && node instanceof Blob) return `<${node.size} bytes>`;
    if (typeof node !== 'object' || node === null) return node;
    const out: Record<string, unknown> = {};
    for (const [key, field] of Object.entries(node as Record<string, unknown>)) {
      out[key] = sensitive(key, parent) ? maskField(key, field, parent) : walk(field, key, depth + 1);
    }
    return out;
  };
  return walk(value, undefined, 1);
}

type Inspect = (value: unknown, options: unknown) => string;

/**
 * Give every object in a parsed body (depth-limited already) a non-enumerable `util.inspect` hook that prints it
 * through {@link redact}. JSON serialization and property access are unchanged. Returns the same value.
 */
export function maskForInspect<T>(value: T): T {
  const stack: [unknown, string | undefined][] = [[value, undefined]];
  while (stack.length > 0) {
    const [node, parent] = stack.pop() as [unknown, string | undefined];
    if (Array.isArray(node)) {
      for (const item of node) stack.push([item, parent]);
    } else if (typeof node === 'object' && node !== null) {
      const record = node as Record<string, unknown>;
      const keys = Object.keys(record);
      if (keys.some((key) => sensitive(key, parent)) && Object.isExtensible(record)) {
        const inspectMasked = function (this: Record<string, unknown>, _d: number, options: unknown, inspect: Inspect) {
          return inspect(masked(this, parent), options);
        };
        Object.defineProperty(record, INSPECT, { value: inspectMasked, enumerable: false, configurable: true });
      }
      for (const key of keys) stack.push([record[key], key]);
    }
  }
  return value;
}
