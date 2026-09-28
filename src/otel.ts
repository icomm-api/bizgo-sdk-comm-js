/**
 * OpenTelemetry tracing for the SDK (`@bizgo/bizgo-sdk-comm-js/otel`), built on {@link Hooks}.
 *
 * `@opentelemetry/api` is an **optional peer dependency**: install it yourself (`npm i @opentelemetry/api`) and
 * configure an OpenTelemetry SDK/exporter as usual. The core package never imports this module, so it has no
 * runtime dependencies.
 *
 * ```ts
 * import { Bizgo } from '@bizgo/bizgo-sdk-comm-js';
 * import { openTelemetryHooks } from '@bizgo/bizgo-sdk-comm-js/otel';
 *
 * const client = new Bizgo({ hooks: openTelemetryHooks() });
 * ```
 *
 * One client span per API call (retries included): name `bizgo <resource>.<method>` (for example
 * `bizgo send.omni`), attributes `http.request.method`, `url.template`, `bizgo.operation_id`,
 * `http.response.status_code`, `bizgo.code`, `bizgo.layer`, `bizgo.retry_count`. Spans never carry bodies, query
 * strings, header values, real path values, phone numbers or the API key.
 *
 * @module
 */
import { type Span, SpanKind, SpanStatusCode, type Tracer, trace } from '@opentelemetry/api';
import type { Hooks, RequestEvent } from './hooks.js';
import { VERSION } from './version.js';

export interface OpenTelemetryOptions {
  /** Tracer to use (default `trace.getTracer('@bizgo/bizgo-sdk-comm-js', VERSION)`). */
  tracer?: Tracer;
}

/** Hooks that record one span per Bizgo API call. Combine with your own hooks via `combineHooks`. */
export function openTelemetryHooks(options: OpenTelemetryOptions = {}): Hooks {
  const tracer = options.tracer ?? trace.getTracer('@bizgo/bizgo-sdk-comm-js', VERSION);
  const spans = new WeakMap<RequestEvent, Span>();
  return {
    onRequestStart(event) {
      const span = tracer.startSpan(`bizgo ${event.operation}`, {
        kind: SpanKind.CLIENT,
        attributes: {
          'http.request.method': event.method,
          'url.template': event.pathTemplate,
          'bizgo.operation_id': event.operationId,
        },
      });
      spans.set(event, span);
    },
    onRequestEnd(event) {
      const span = spans.get(event);
      if (!span) return;
      spans.delete(event);
      if (event.status !== undefined) span.setAttribute('http.response.status_code', event.status);
      if (event.code !== undefined) span.setAttribute('bizgo.code', event.code);
      if (event.layer !== undefined) span.setAttribute('bizgo.layer', event.layer);
      span.setAttribute('bizgo.retry_count', Math.max(0, event.attempts - 1));
      if (event.success) {
        span.setStatus({ code: SpanStatusCode.OK });
      } else {
        if (event.errorType !== undefined) span.setAttribute('error.type', event.errorType);
        // the error class and code only: error messages are not copied into spans
        span.setStatus({ code: SpanStatusCode.ERROR, message: event.errorType ?? 'error' });
      }
      span.end();
    },
  };
}
