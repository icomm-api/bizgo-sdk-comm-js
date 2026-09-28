import { ValidationError } from './errors.js';

/**
 * Marks the testing kit's `FakeFetch.fetch`, which is accepted without `trustFetch` (it never touches the network).
 * A registered symbol so the separately bundled `./testing` entry sets the same key.
 */
export const FAKE_FETCH = Symbol.for('@bizgo/bizgo-sdk-comm-js/fake-fetch');

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** `data.data` of a response envelope, or `{}`. */
export function inner(body: Record<string, unknown>): Record<string, unknown> {
  const data = body.data;
  if (!isRecord(data) || !isRecord(data.data)) return {};
  return data.data;
}

export function list<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Encode one path segment (`/`, `?`, `#` included). `.` and `..` are rejected because URL parsers treat them
 * (and their percent-encoded forms) as dot segments, which would change the endpoint.
 */
export function segment(value: unknown, name: string): string {
  if (typeof value !== 'string' || value === '') throw new ValidationError(`${name}: 빈 값은 경로에 쓸 수 없습니다`);
  if (value === '.' || value === '..') throw new ValidationError(`${name}: '.'과 '..'은 경로에 쓸 수 없습니다`);
  return encodeURIComponent(value);
}

function kstParts(value: Date, name: string): string[] {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new ValidationError(`${name}: 올바른 Date가 아닙니다`);
  }
  const kst = new Date(value.getTime() + KST_OFFSET_MS);
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return [
    pad(kst.getUTCFullYear(), 4),
    pad(kst.getUTCMonth() + 1),
    pad(kst.getUTCDate()),
    pad(kst.getUTCHours()),
    pad(kst.getUTCMinutes()),
    pad(kst.getUTCSeconds()),
  ];
}

function passString(value: unknown, name: string): string | undefined {
  if (typeof value === 'string') {
    if (value === '') throw new ValidationError(`${name}: 빈 문자열은 쓸 수 없습니다`);
    return value;
  }
  if (!(value instanceof Date)) throw new ValidationError(`${name}: Date 또는 문자열이어야 합니다`);
  return undefined;
}

/** `YYYYMMDD` in KST (statistics). Strings are sent as is. */
export function yyyymmdd(value: Date | string, name: string): string {
  const text = passString(value, name);
  if (text !== undefined) return text;
  const [y, m, d] = kstParts(value as Date, name);
  return `${y}${m}${d}`;
}

/** `yyyy-MM-dd'T'HH:mm:ss` in KST (send history `requestTime`). Strings are sent as is. */
export function localTime(value: Date | string, name: string): string {
  const text = passString(value, name);
  if (text !== undefined) return text;
  const [y, mo, d, h, mi, s] = kstParts(value as Date, name);
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

/** `yyyy-MM-dd'T'HH:mm:ss+09:00` (MO history `occurredTime`). Strings are sent as is. */
export function offsetTime(value: Date | string, name: string): string {
  const text = passString(value, name);
  if (text !== undefined) return text;
  return `${localTime(value, name)}+09:00`;
}

export function limit(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 1000) {
    throw new ValidationError('limit은 1~1000 사이의 정수입니다');
  }
  return value;
}

export function optionalText(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new ValidationError(`${name}: 문자열이어야 합니다`);
  return value;
}

export function cursor(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new ValidationError('lastSeq: 정수여야 합니다');
  }
  return value;
}
