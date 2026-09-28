/**
 * Receive Bizgo webhooks (delivery reports and MO messages).
 *
 * ```ts
 * import { WebhookReceiver, WebhookVerificationError } from '@bizgo/bizgo-sdk-comm-js/webhooks';
 *
 * const receiver = new WebhookReceiver(process.env.BIZGO_WEBHOOK_SECRET!);
 *
 * // inside your HTTP handler, with the raw body
 * try {
 *   const report = receiver.report(req.headers, rawBody);
 *   await store(report);                        // idempotent: the same report can arrive again
 *   return json(200, receiver.ack(report.msgKey)); // answer within 5 seconds
 * } catch (error) {
 *   if (error instanceof WebhookVerificationError) return json(401, {});
 *   throw error;
 * }
 * ```
 *
 * Security notes:
 * - The signature is `X-IB-Signature = HmacSHA256(secret, X-IB-Timestamp)`; it is verified together with the
 *   timestamp window. As general practice, serve the endpoint over HTTPS, allow only the Bizgo webhook source IPs,
 *   and confirm important results with the inquiry APIs.
 * - Bizgo retries a webhook up to 3 times when it does not get `{"msgKey": ...}` back: deduplicate by `msgKey`.
 * - The signature output encoding (hex or base64) is not confirmed yet; both are accepted (hex in any case).
 * - The webhook secret is obtained by requesting it from Bizgo (it is delivered separately).
 * - This module only receives webhooks. The SDK never sends requests (or the API key) to URLs you provide.
 *
 * Counsel (상담톡) webhooks (`counselMessage`, `counselReference`, ...):
 * - Counsel webhooks carry no signature (signatures apply only to report/MO webhooks). The counsel methods do not
 *   require or check `X-IB-Timestamp`/`X-IB-Signature` and ignore them if present; they apply the body checks (size
 *   cap, JSON depth, type/shape) and return the typed payload. Report/MO webhooks always require a signature.
 * - Counsel parsing needs no webhook secret: `parseWebhook('counselMessage', rawBody)` returns the same typed payload.
 * - As for every webhook endpoint, serve it over HTTPS, allow only the Bizgo webhook source IPs, and deduplicate
 *   by `msgKey` where present.
 * - Answer counsel webhooks with `receiver.counselAck()` (`{"code": "A000", "result": "Success"}`), not `ack()`.
 * - Counsel bodies contain end-user identifiers, chat content and (personal_info) phone numbers: never log them.
 *
 * @module
 */
import { Buffer } from 'node:buffer';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { ConfigurationError, WebhookVerificationError } from './errors.js';
import type { CounselWebhookAck, MoWebhookPayload, ReportWebhookPayload, WebhookAck } from './generated/types.js';
import { GeneratedWebhookReceiver, WEBHOOKS, type WebhookName, type WebhookPayloads } from './generated/webhooks.js';
import { MAX_JSON_DEPTH, tooDeep } from './json.js';
import { maskForInspect } from './mask.js';
import { problems } from './validation.js';

export const TIMESTAMP_HEADER = 'X-IB-Timestamp';
export const SIGNATURE_HEADER = 'X-IB-Signature';
/** Default maximum age of a webhook, in seconds. */
export const DEFAULT_TOLERANCE_SECONDS = 300;
/** Bodies larger than this are rejected. */
export const MAX_BODY_BYTES = 1024 * 1024;

const INSPECT = Symbol.for('nodejs.util.inspect.custom');
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** Webhook secret: a string (UTF-8) or raw bytes. */
export type WebhookSecret = string | Uint8Array;

/**
 * Request headers in any common shape: a `Headers` object, Node's `IncomingHttpHeaders`
 * (`req.headers`), a plain object or `[name, value]` pairs. Names are matched case-insensitively.
 */
export type WebhookHeaders =
  | Headers
  | Record<string, string | readonly string[] | undefined>
  | Iterable<readonly [string, string]>;

/** Raw request body. A parsed object is also accepted. */
export type WebhookBody = string | Uint8Array | ArrayBuffer | Record<string, unknown>;

export interface VerifySignatureParams {
  /** Webhook secret (request it from Bizgo). Read it from an environment variable or a vault. */
  secret: WebhookSecret;
  /** `X-IB-Timestamp` header value. 13+ digits = epoch milliseconds, otherwise seconds. */
  timestamp: string;
  /** `X-IB-Signature` header value: hex (any case) or base64. */
  signature: string;
  /** Maximum age in **seconds** (default 300) to limit replay. `null` disables the check (not recommended). */
  tolerance?: number | null;
  /** Current time, for tests: a `Date` or epoch **milliseconds** (like `Date.now()`). */
  now?: Date | number;
}

function bytes(value: WebhookSecret): Buffer {
  return typeof value === 'string' ? Buffer.from(value, 'utf8') : Buffer.from(value);
}

/** A usable secret: not empty and, for strings, not only whitespace (§12.7). */
function usableSecret(secret: unknown): secret is WebhookSecret {
  if (typeof secret === 'string') return secret.trim() !== '';
  return secret instanceof Uint8Array && secret.byteLength > 0;
}

/** `tolerance` must be a finite number of seconds > 0, or `null` to disable the check explicitly (§12.7). */
function checkTolerance(tolerance: unknown): number | null {
  if (tolerance === null) return null;
  if (typeof tolerance !== 'number' || !Number.isFinite(tolerance) || tolerance <= 0) {
    throw new ConfigurationError('tolerance는 0보다 큰 유한한 초 단위 숫자이거나, 검사를 끄려면 null이어야 합니다.');
  }
  return tolerance;
}

function timestampSeconds(timestamp: string): number {
  if (typeof timestamp !== 'string' || !/^[0-9]{1,16}$/.test(timestamp)) {
    throw new WebhookVerificationError('X-IB-Timestamp가 없거나 1~16자리 숫자가 아닙니다');
  }
  const value = Number(timestamp);
  return timestamp.length >= 13 ? value / 1000 : value; // epoch ms (documented example) or seconds
}

/** Constant-time comparison; the lengths are not secret. */
function same(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Verify `X-IB-Signature` for a webhook request, or throw {@link WebhookVerificationError}.
 */
export function verifySignature(params: VerifySignatureParams): void {
  const { secret, timestamp, signature, now } = params;
  if (!usableSecret(secret)) throw new WebhookVerificationError('웹훅 secret이 비어 있습니다');
  let tolerance: number | null;
  try {
    tolerance = checkTolerance(params.tolerance === undefined ? DEFAULT_TOLERANCE_SECONDS : params.tolerance);
  } catch {
    throw new WebhookVerificationError('tolerance가 올바르지 않습니다 (0보다 큰 유한한 초 또는 null)');
  }
  if (typeof signature !== 'string' || signature.trim() === '') {
    throw new WebhookVerificationError('X-IB-Signature 헤더가 없습니다');
  }
  const sentAt = timestampSeconds(timestamp);
  if (tolerance !== null) {
    const nowMs = now === undefined ? Date.now() : now instanceof Date ? now.getTime() : now;
    if (!(Math.abs(nowMs / 1000 - sentAt) <= tolerance)) {
      throw new WebhookVerificationError(`X-IB-Timestamp가 허용 범위(${tolerance}초)를 벗어났습니다`);
    }
  }

  const digest = createHmac('sha256', bytes(secret)).update(timestamp, 'utf8').digest();
  const received = signature.trim();
  const hexOk = same(Buffer.from(received.toLowerCase(), 'utf8'), Buffer.from(digest.toString('hex'), 'utf8'));
  const decoded =
    received.length % 4 === 0 && BASE64.test(received) ? Buffer.from(received, 'base64') : Buffer.alloc(0);
  const base64Ok = same(decoded, digest);
  if (!(hexOk || base64Ok)) throw new WebhookVerificationError('서명이 일치하지 않습니다');
}

function load(body: WebhookBody): Record<string, unknown> {
  let parsed: unknown = body;
  if (typeof body === 'string' || body instanceof Uint8Array || body instanceof ArrayBuffer) {
    const raw = typeof body === 'string' ? Buffer.from(body, 'utf8') : Buffer.from(body as Uint8Array);
    if (raw.length > MAX_BODY_BYTES) throw new WebhookVerificationError('웹훅 본문이 너무 큽니다 (최대 1MB)');
    const text = raw.toString('utf8');
    if (tooDeep(text)) {
      throw new WebhookVerificationError(`웹훅 본문 JSON의 중첩이 너무 깊습니다 (최대 ${MAX_JSON_DEPTH})`);
    }
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new WebhookVerificationError('웹훅 본문이 JSON이 아닙니다');
    }
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new WebhookVerificationError('웹훅 본문이 JSON 객체가 아닙니다');
  }
  return maskForInspect(parsed as Record<string, unknown>);
}

function payload<T>(schema: string, body: WebhookBody): T {
  const value = load(body);
  const issues = problems(schema, value);
  if (issues.length > 0) {
    const detail = issues.slice(0, 5).map((issue) => `${issue.path}: ${issue.message}`);
    throw new WebhookVerificationError(`웹훅 본문 형식이 올바르지 않습니다 (${detail.join('; ')})`);
  }
  return value as T;
}

/** Parse a report webhook body. Does not verify the signature: use {@link WebhookReceiver} for that. */
export function parseReport(body: WebhookBody): ReportWebhookPayload {
  return payload<ReportWebhookPayload>(WEBHOOKS.report.schema, body);
}

/** Parse an MO webhook body. Does not verify the signature: use {@link WebhookReceiver} for that. */
export function parseMo(body: WebhookBody): MoWebhookPayload {
  return payload<MoWebhookPayload>(WEBHOOKS.mo.schema, body);
}

/**
 * Parse any webhook body by its `x-sdk-webhook` name (`report`, `mo`, `counselMessage`, ...) and return the typed
 * payload. Applies the body checks (size cap, JSON depth, type/shape) but no signature check, and needs no secret.
 * This is the way to receive counsel (상담톡) webhooks without a webhook secret:
 *
 * ```ts
 * const event = parseWebhook('counselMessage', rawBody); // CounselMessageWebhookPayload
 * return json(200, counselAck());
 * ```
 *
 * Report/MO webhooks are signed: receive them with {@link WebhookReceiver}, which verifies the signature.
 */
export function parseWebhook<N extends WebhookName>(name: N, body: WebhookBody): WebhookPayloads[N] {
  const spec = Object.hasOwn(WEBHOOKS, name) ? WEBHOOKS[name] : undefined;
  if (!spec) throw new WebhookVerificationError('알 수 없는 웹훅 종류입니다');
  return payload<WebhookPayloads[N]>(spec.schema, body);
}

/** The response body Bizgo expects for report/MO webhooks: `{"msgKey": "<received msgKey>"}`. */
export function ack(msgKey: string): WebhookAck {
  return { msgKey };
}

/** The response body Bizgo expects for counsel (상담톡) webhooks: `{"code": "A000", "result": "Success"}`. */
export function counselAck(): CounselWebhookAck {
  return { code: 'A000', result: 'Success' };
}

function header(headers: WebhookHeaders, name: string): string {
  const lowered = name.toLowerCase();
  if (typeof headers !== 'object' || headers === null) return '';
  if (typeof Headers !== 'undefined' && headers instanceof Headers) return headers.get(name) ?? '';
  const entries: Iterable<readonly [string, unknown]> =
    Symbol.iterator in headers
      ? (headers as Iterable<readonly [string, string]>)
      : Object.entries(headers as Record<string, unknown>);
  for (const [key, value] of entries) {
    if (key.toLowerCase() !== lowered) continue;
    const first = Array.isArray(value) ? value[0] : value;
    return typeof first === 'string' ? first : '';
  }
  return '';
}

export interface WebhookReceiverOptions {
  /** Maximum age in seconds (default 300). `null` disables the check (not recommended). */
  tolerance?: number | null;
}

/**
 * Verify and parse webhook requests with one secret. One method per webhook: `report`, `mo`, `counselMessage`,
 * `counselReference`, `counselExpiredSession`, `counselSeenInfo`, `counselPersonalInfo`, `counselCertResult`,
 * `counselResult`. Report/MO methods verify the signature; counsel methods only parse (counsel webhooks carry no
 * signature). Counsel-only receivers that have no secret use {@link parseWebhook} instead.
 * The webhook secret is obtained by requesting it from Bizgo.
 */
export class WebhookReceiver extends GeneratedWebhookReceiver {
  readonly #secret: Buffer;
  readonly #tolerance: number | null;

  constructor(secret: WebhookSecret, options: WebhookReceiverOptions = {}) {
    super();
    if (!usableSecret(secret)) throw new ConfigurationError('웹훅 secret이 비어 있거나 공백뿐입니다');
    this.#secret = bytes(secret);
    this.#tolerance = checkTolerance(options.tolerance === undefined ? DEFAULT_TOLERANCE_SECONDS : options.tolerance);
  }

  protected override receive(name: WebhookName, headers: WebhookHeaders, body: WebhookBody): unknown {
    const spec = Object.hasOwn(WEBHOOKS, name) ? WEBHOOKS[name] : undefined;
    if (!spec) throw new WebhookVerificationError('알 수 없는 웹훅 종류입니다');
    // Signed webhooks (report/MO) are always verified; counsel webhooks carry no signature and are only parsed.
    if (spec.signature === 'required') this.verify(headers);
    return parseWebhook(name, body);
  }

  /** Verify the signature headers of a request. */
  verify(headers: WebhookHeaders): void {
    verifySignature({
      secret: this.#secret,
      timestamp: header(headers, TIMESTAMP_HEADER),
      signature: header(headers, SIGNATURE_HEADER),
      tolerance: this.#tolerance,
    });
  }

  /** Verify, then parse a delivery report webhook. The signature is always required. */
  override report(headers: WebhookHeaders, body: WebhookBody): ReportWebhookPayload {
    this.verify(headers);
    return parseReport(body);
  }

  /** Verify, then parse an MO webhook. The signature is always required. */
  override mo(headers: WebhookHeaders, body: WebhookBody): MoWebhookPayload {
    this.verify(headers);
    return parseMo(body);
  }

  /** Response body for report/MO webhooks. See {@link ack}. */
  ack(msgKey: string): WebhookAck {
    return ack(msgKey);
  }

  /** Response body for counsel webhooks. See {@link counselAck}. */
  counselAck(): CounselWebhookAck {
    return counselAck();
  }

  override toString(): string {
    return `WebhookReceiver(tolerance=${this.#tolerance})`;
  }
}

Object.defineProperty(WebhookReceiver.prototype, INSPECT, {
  value(this: WebhookReceiver) {
    return this.toString();
  },
});
