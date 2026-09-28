/**
 * Error hierarchy.
 *
 * ```
 * BizgoError
 * ├── ConfigurationError        missing API key, insecure base URL, unknown option, ...
 * ├── ValidationError           the request was rejected before sending (field path + reason, never values)
 * ├── APIConnectionError        network failure; a send may or may not have reached Bizgo
 * │   └── APITimeoutError
 * ├── APIError                  Bizgo answered with a failure code
 * │   ├── BadRequestError         400 / invalid field
 * │   ├── AuthenticationError     401 / gateway A401, service A001, A002, A100
 * │   ├── PermissionDeniedError   403 / gateway A403, service A110, A111
 * │   ├── NotFoundError           404 / gateway A404
 * │   ├── DuplicateRequestError   service A301 (same idempotencyKey within its TTL)
 * │   ├── RateLimitError          429 / service A020
 * │   └── InternalServerError     5xx
 * ├── InvalidResponseError      the body is not the documented {common, data} envelope
 * └── WebhookVerificationError  webhook signature / timestamp / body check failed
 * ```
 *
 * Error messages never contain the API key, request bodies, query strings or phone numbers.
 *
 * @module
 */
import { SERVICE_CODES } from './generated/error-codes.js';

/** Serialized form of a {@link BizgoError} (`JSON.stringify(error)`). Never contains the response body. */
export interface BizgoErrorJSON {
  /** Class name, for example `RateLimitError`. */
  name: string;
  message: string;
  [field: string]: unknown;
}

/** Fields that are copied by `toJSON` / `fromJSON`. `body` is left out: it can contain phone numbers. */
const SERIALIZED_FIELDS = [
  'issues',
  'httpStatus',
  'code',
  'layer',
  'serverMessage',
  'description',
  'trackingId',
  'retryAfter',
  'alreadyAccepted',
] as const;

const REGISTRY = new Map<string, { prototype: BizgoError }>();

/**
 * Base class for every error thrown by this SDK.
 *
 * Errors survive `JSON.stringify` and can be rebuilt with {@link BizgoError.fromJSON} (for job queues, worker
 * threads and multi-process setups). `structuredClone` / `postMessage` keep only `message` and `name` of custom
 * error classes, so serialize with JSON instead:
 *
 * ```ts
 * const copy = BizgoError.fromJSON(JSON.parse(JSON.stringify(error))); // same class, same fields (no body)
 * ```
 */
export class BizgoError extends Error {
  /** Plain data with the class name and the public fields. The response `body` is not included. */
  toJSON(): BizgoErrorJSON {
    const out: BizgoErrorJSON = { name: this.name, message: this.message };
    const own = this as unknown as Record<string, unknown>;
    for (const field of SERIALIZED_FIELDS) {
      if (Object.hasOwn(this, field) && own[field] !== undefined) out[field] = own[field];
    }
    return out;
  }

  /**
   * Rebuild an error from {@link BizgoError.toJSON} output. The result is an instance of the original class
   * (`instanceof RateLimitError` works). Unknown class names become a plain `BizgoError`.
   */
  static fromJSON(json: unknown): BizgoError {
    const data = (typeof json === 'object' && json !== null ? json : {}) as Record<string, unknown>;
    const name = typeof data.name === 'string' ? data.name : 'BizgoError';
    const cls = REGISTRY.get(name) ?? BizgoError;
    const error = Object.create(cls.prototype) as BizgoError;
    const message = typeof data.message === 'string' ? data.message : '';
    Object.defineProperty(error, 'message', { value: message, writable: true, configurable: true });
    Object.defineProperty(error, 'stack', { value: `${name}: ${message}`, writable: true, configurable: true });
    for (const field of SERIALIZED_FIELDS) {
      if (data[field] !== undefined) Object.defineProperty(error, field, { value: data[field], enumerable: true });
    }
    if (error instanceof APIError || error instanceof InvalidResponseError) {
      Object.defineProperty(error, 'body', { value: undefined, enumerable: false });
    }
    return error;
  }
}

/** The client is configured incorrectly (for example the API key is missing). */
export class ConfigurationError extends BizgoError {}

/** One problem found by request validation. */
export interface ValidationIssue {
  /** Field path, for example `messageFlow[0].sms.text`. Empty for the request itself. */
  readonly path: string;
  /** Why the value was rejected. Never contains the value itself. */
  readonly message: string;
}

/**
 * The request was rejected by the SDK before anything was sent: a required field is missing, a field is
 * unknown (typo), a value is too long (for example SMS text over 90 bytes in EUC-KR), and so on.
 */
export class ValidationError extends BizgoError {
  readonly issues: readonly ValidationIssue[];

  constructor(issues: readonly ValidationIssue[] | string) {
    const list = typeof issues === 'string' ? [{ path: '', message: issues }] : issues;
    const shown = list.slice(0, 10).map((issue) => (issue.path ? `${issue.path}: ${issue.message}` : issue.message));
    if (list.length > shown.length) shown.push(`외 ${list.length - shown.length}건`);
    super(`요청 검증 실패: ${shown.join('; ')}`);
    this.issues = list;
  }
}

export interface InvalidResponseInit {
  /** `common.infobankTrId`, if it could be read. */
  trackingId?: string | undefined;
  /** The raw response text (can contain phone numbers; stored non-enumerable). */
  body?: unknown;
}

/**
 * The response could not be used: not the documented `{common, data}` envelope, not JSON, too large (16MB),
 * nested too deeply (64 levels), or a redirect (3xx). For a send the request may have been accepted: check the
 * status with the inquiry APIs before sending again.
 */
export class InvalidResponseError extends BizgoError {
  readonly httpStatus: number | undefined;
  /** `common.infobankTrId`, if it could be read. */
  readonly trackingId: string | undefined;
  /** The raw response text. Not enumerable, so `console.log(error)` does not print it. Do not log it. */
  declare readonly body: unknown;

  constructor(message: string, httpStatus?: number, init: InvalidResponseInit = {}) {
    super(message);
    this.httpStatus = httpStatus;
    this.trackingId = init.trackingId;
    Object.defineProperty(this, 'body', { value: init.body, enumerable: false, writable: false });
  }
}

/** A webhook request failed signature, timestamp or body verification. Answer it with HTTP 401. */
export class WebhookVerificationError extends BizgoError {}

/**
 * The request failed before a response arrived. For a send the message may or may not have been accepted:
 * re-sending can deliver twice unless you set `idempotencyKey`.
 */
export class APIConnectionError extends BizgoError {}

/** The request timed out (`timeoutMs`). */
export class APITimeoutError extends APIConnectionError {}

/** `gateway`: `common.authCode` (authentication/format checks). `service`: `data.code` (the product API). */
export type ErrorLayer = 'gateway' | 'service';

export interface APIErrorInit {
  /** `authResult` / `result` text from the server. */
  serverMessage: string;
  httpStatus: number;
  code: string | null;
  layer: ErrorLayer;
  trackingId?: string | undefined;
  body?: unknown;
  /** The request was retried before this response (see {@link DuplicateRequestError.alreadyAccepted}). */
  retried?: boolean;
}

/**
 * Bizgo returned a failure.
 *
 * `message` is the formatted text (`HTTP 400 | service code=A306 | <result> | <description> | infobankTrId=...`).
 */
export class APIError extends BizgoError {
  /** HTTP status code. */
  readonly httpStatus: number;
  /** `common.authCode` (gateway layer) or `data.code` (service layer), for example `A401`. */
  readonly code: string | null;
  /** Which layer failed. The same code can mean different things in each layer (for example `A301`). */
  readonly layer: ErrorLayer;
  /** `authResult` / `result` text from the server. */
  readonly serverMessage: string;
  /** Korean description of a service-layer `code` from the error code table, if known. */
  readonly description: string | undefined;
  /** `common.infobankTrId`. Give this to Bizgo support when asking about a request. */
  readonly trackingId: string | undefined;
  /**
   * The parsed response body. It can contain phone numbers: do not log it as is.
   * Not enumerable, so `console.log(error)` does not print it.
   */
  declare readonly body: unknown;

  constructor(init: APIErrorInit) {
    const known = init.layer === 'service' && init.code ? SERVICE_CODES[init.code] : undefined;
    const description = known?.[1];
    const parts = [`HTTP ${init.httpStatus}`, `${init.layer} code=${init.code ?? '-'}`, init.serverMessage];
    if (description && description !== init.serverMessage) parts.push(description);
    if (init.trackingId) parts.push(`infobankTrId=${init.trackingId}`);
    super(parts.filter(Boolean).join(' | '));
    this.httpStatus = init.httpStatus;
    this.code = init.code;
    this.layer = init.layer;
    this.serverMessage = init.serverMessage;
    this.description = description;
    this.trackingId = init.trackingId;
    Object.defineProperty(this, 'body', { value: init.body, enumerable: false, writable: false });
  }
}

/** The request was rejected as invalid. */
export class BadRequestError extends APIError {}

/** The API key is missing, wrong or expired, or the calling IP is not registered. */
export class AuthenticationError extends APIError {}

/** The key is valid but not allowed to do this (blocked account, IP not allowed, ...). */
export class PermissionDeniedError extends APIError {}

/** The resource does not exist. */
export class NotFoundError extends APIError {}

/** A request with the same `idempotencyKey` was already accepted. The message was not sent again. */
export class DuplicateRequestError extends APIError {
  /**
   * `true` when the SDK had retried this request (after a timeout, connection error, 5xx or 429): an earlier
   * attempt was most likely accepted, so the message is already on its way. Check it with the inquiry APIs.
   */
  readonly alreadyAccepted: boolean;

  constructor(init: APIErrorInit) {
    super(init);
    this.alreadyAccepted = init.retried === true;
  }
}

/** Too many requests (HTTP 429 / A020). Default limits: 200 TPS for send APIs, 5 TPS for the others. */
export class RateLimitError extends APIError {
  /** Seconds from the `Retry-After` header, if the server sent one. */
  readonly retryAfter: number | undefined;

  constructor(init: APIErrorInit & { retryAfter?: number | undefined }) {
    super(init);
    this.retryAfter = init.retryAfter;
  }
}

/** Bizgo had an internal error (5xx). */
export class InternalServerError extends APIError {}

// Class names are set explicitly so they survive minification by the user's bundler.
for (const [cls, name] of [
  [BizgoError, 'BizgoError'],
  [ConfigurationError, 'ConfigurationError'],
  [ValidationError, 'ValidationError'],
  [InvalidResponseError, 'InvalidResponseError'],
  [WebhookVerificationError, 'WebhookVerificationError'],
  [APIConnectionError, 'APIConnectionError'],
  [APITimeoutError, 'APITimeoutError'],
  [APIError, 'APIError'],
  [BadRequestError, 'BadRequestError'],
  [AuthenticationError, 'AuthenticationError'],
  [PermissionDeniedError, 'PermissionDeniedError'],
  [NotFoundError, 'NotFoundError'],
  [DuplicateRequestError, 'DuplicateRequestError'],
  [RateLimitError, 'RateLimitError'],
  [InternalServerError, 'InternalServerError'],
] as const) {
  Object.defineProperty(cls.prototype, 'name', { value: name, writable: true, configurable: true });
  REGISTRY.set(name, cls);
}

type APIErrorClass = new (init: APIErrorInit) => APIError;

const GATEWAY_CODES: Readonly<Record<string, APIErrorClass>> = {
  A400: BadRequestError,
  A401: AuthenticationError,
  A403: PermissionDeniedError,
  A404: NotFoundError,
};

const SERVICE_CODE_CLASSES: Readonly<Record<string, APIErrorClass>> = {
  A001: AuthenticationError,
  A002: AuthenticationError,
  A100: AuthenticationError,
  A110: PermissionDeniedError,
  A111: PermissionDeniedError,
  A020: RateLimitError,
  A301: DuplicateRequestError,
};

const STATUS_CLASSES: Readonly<Record<number, APIErrorClass>> = {
  400: BadRequestError,
  401: AuthenticationError,
  403: PermissionDeniedError,
  404: NotFoundError,
  429: RateLimitError,
};

/**
 * Pick the error class. Gateway (`common.authCode`) and service (`data.code`) codes are looked up in separate
 * tables because the same code means different things (service `A401` is an invalid `paymentCode`, not an
 * authentication failure).
 */
export function errorClass(httpStatus: number, code: string | null, layer: ErrorLayer): APIErrorClass {
  const table = layer === 'gateway' ? GATEWAY_CODES : SERVICE_CODE_CLASSES;
  if (code && Object.hasOwn(table, code)) return table[code] as APIErrorClass;
  let status = httpStatus;
  if (layer === 'service' && status < 400 && code && Object.hasOwn(SERVICE_CODES, code)) {
    // a failure reported inside HTTP 200: use the status documented for the code
    status = SERVICE_CODES[code]?.[0] || status;
  }
  const byStatus = STATUS_CLASSES[status];
  if (byStatus) return byStatus;
  if (status >= 500) return InternalServerError;
  if (status >= 400) return BadRequestError;
  return APIError;
}
