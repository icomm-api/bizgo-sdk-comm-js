/**
 * Observability hooks (SDK-DESIGN.md §11.4).
 *
 * ```ts
 * const client = new Bizgo({
 *   hooks: {
 *     onRequestEnd(event) {
 *       metrics.histogram('bizgo.request', event.durationMs, { op: event.operationId, status: event.status });
 *     },
 *   },
 * });
 * ```
 *
 * One API call (including its retries) produces one `onRequestStart` and one `onRequestEnd`, with the **same**
 * event object (so a tracer can keep per-call state in a `WeakMap`). An event carries the operation, the HTTP
 * method, the **path template** (`/api/comm/v1/report/inquiry/{msgKey}`), the status, the error layer/code/type,
 * the number of attempts and the duration. It never carries request or response bodies, query strings, header
 * values, real path values, phone numbers or the API key.
 *
 * Exceptions thrown by a hook, and rejections of promises returned by async hooks, are ignored so observability
 * cannot break sending or crash the process (§12.15). The same holds for `logger`. Keep hooks fast.
 *
 * @module
 */
import type { ErrorLayer } from './errors.js';

export interface RequestEvent {
  /** `operationId` from the spec, for example `sendOmni`. */
  readonly operationId: string;
  /** `<resource>.<method>`, for example `send.omni` or `alimtalk.templates.list`. */
  readonly operation: string;
  /** HTTP method. */
  readonly method: string;
  /** Path template, never the real path values. */
  readonly pathTemplate: string;
  /** HTTP status of the last attempt (undefined after a network error or before the end). */
  status?: number;
  /** `gateway` or `service` when the call failed with an API error code. */
  layer?: ErrorLayer;
  /** API error code (`A020`, `A401`, ...) when the call failed with one. */
  code?: string;
  /** Error class name (`RateLimitError`, `APITimeoutError`, ...) when the call failed. */
  errorType?: string;
  /** `true` when the call succeeded (set at the end). */
  success?: boolean;
  /** Number of HTTP attempts made so far (1 = no retry). */
  attempts: number;
  /** Time from the first attempt to the end, in milliseconds (set at the end). */
  durationMs?: number;
}

export interface Hooks {
  /** Before the first attempt of a call. Only the operation fields are set. */
  onRequestStart?(event: RequestEvent): void;
  /** After the call finished (successfully or not), after all retries. */
  onRequestEnd?(event: RequestEvent): void;
}

/** Run several hook sets in order (for example your metrics hooks and `openTelemetryHooks()`). */
export function combineHooks(...hooks: readonly Hooks[]): Hooks {
  const run = (name: keyof Hooks, event: RequestEvent): void => {
    for (const set of hooks) {
      try {
        const result: unknown = set[name]?.(event);
        if (typeof (result as { then?: unknown } | null)?.then === 'function') {
          (result as Promise<unknown>).then(undefined, () => undefined); // async hooks: no unhandled rejection
        }
      } catch {
        // one failing hook must not stop the others (or the request)
      }
    }
  };
  return {
    onRequestStart: (event) => run('onRequestStart', event),
    onRequestEnd: (event) => run('onRequestEnd', event),
  };
}
