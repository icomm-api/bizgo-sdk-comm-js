import { context, type Span, type SpanOptions, type Tracer } from '@opentelemetry/api';
import { describe, expect, it } from 'vitest';
import { ConfigurationError, combineHooks, RateLimitError, type RequestEvent } from '../src/index.js';
import { openTelemetryHooks } from '../src/otel.js';
import { API_KEY, envelope, MockServer, makeClient } from './helpers.js';

const PHONE = '01000001234';

function recorder() {
  const starts: RequestEvent[] = [];
  const ends: RequestEvent[] = [];
  return {
    starts,
    ends,
    hooks: {
      onRequestStart: (e: RequestEvent) => starts.push({ ...e }),
      onRequestEnd: (e: RequestEvent) => ends.push(e),
    },
  };
}

describe('hooks', () => {
  it('report one start and one end per call with the path template, never values', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { status: 503, json: {} }, { json: envelope({ report: [] }) });
    const { starts, ends, hooks } = recorder();
    await makeClient(server, { hooks }).reports.inquiry(`MSG-${PHONE}`);
    expect(starts).toEqual([
      {
        operationId: 'getReportInquiry',
        operation: 'reports.inquiry',
        method: 'GET',
        pathTemplate: '/api/comm/v1/report/inquiry/{msgKey}',
        attempts: 0,
      },
    ]);
    expect(ends).toHaveLength(1);
    expect(ends[0]).toMatchObject({ status: 200, attempts: 2, success: true });
    expect(ends[0]?.durationMs).toBeGreaterThanOrEqual(0);
    expect(JSON.stringify(ends)).not.toContain(PHONE);
  });

  it('carry layer, code and error type on failure, and nothing sensitive', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope(undefined, { code: 'A020' }) });
    const { ends, hooks } = recorder();
    const client = makeClient(server, { hooks });
    await expect(
      client.messages.moHistory({ occurredTime: '2026-01-01T00:00:00+09:00', from: PHONE }),
    ).rejects.toBeInstanceOf(RateLimitError);
    expect(ends[0]).toMatchObject({
      operationId: 'getMoHistory',
      operation: 'messages.moHistory',
      pathTemplate: '/api/comm/v1/message/history/mo',
      layer: 'service',
      code: 'A020',
      errorType: 'RateLimitError',
      success: false,
      attempts: 1,
    });
    const text = JSON.stringify(ends);
    for (const secret of [PHONE, API_KEY, 'occurredTime', '2026-01-01']) expect(text).not.toContain(secret);
  });

  it('cover generated operations and sends; a throwing hook never breaks the request', async () => {
    const server = new MockServer();
    server.on('POST', /.*/, { json: envelope({ destinations: [{ to: PHONE, msgKey: 'K', code: 'A000' }] }) });
    server.on('GET', /.*/, { json: envelope({}) });
    const { ends, hooks } = recorder();
    const boom = {
      onRequestStart() {
        throw new Error('boom');
      },
    };
    const client = makeClient(server, { hooks: combineHooks(boom, hooks) });
    await client.send.sms({ to: PHONE, from: PHONE, text: '본문' });
    await client.alimtalk.templates.get({ senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE' });
    expect(ends.map((e) => e.operation)).toEqual(['send.omni', 'alimtalk.templates.get']);
    const text = JSON.stringify(ends);
    for (const secret of [PHONE, '본문', 'SENDER_KEY_EXAMPLE', 'TEMPLATE_CODE']) expect(text).not.toContain(secret);
    const direct = makeClient(server, { hooks: { onRequestEnd: boom.onRequestStart } });
    await expect(direct.reports.poll()).resolves.toBeDefined();
  });

  it('are validated', () => {
    const server = new MockServer();
    expect(() => makeClient(server, { hooks: { onRequestEnd: 1 } as never })).toThrow(ConfigurationError);
    expect(() => makeClient(server, { hooks: { onResponse: () => {} } as never })).toThrow(ConfigurationError);
  });
});

/** A minimal tracer that records what the adapter sets. */
function fakeTracer() {
  const spans: {
    name: string;
    options: SpanOptions;
    attributes: Record<string, unknown>;
    status?: unknown;
    ended: boolean;
  }[] = [];
  const tracer = {
    startSpan(name: string, options: SpanOptions = {}) {
      const record = {
        name,
        options,
        attributes: { ...(options.attributes ?? {}) },
        ended: false,
      } as (typeof spans)[0];
      spans.push(record);
      const span = {
        setAttribute(key: string, value: unknown) {
          record.attributes[key] = value;
          return span;
        },
        setStatus(status: unknown) {
          record.status = status;
          return span;
        },
        end() {
          record.ended = true;
        },
      };
      return span as unknown as Span;
    },
    startActiveSpan() {
      throw new Error('not used');
    },
  } as unknown as Tracer;
  void context;
  return { tracer, spans };
}

describe('OpenTelemetry adapter', () => {
  it('records one span per call with the documented attributes', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { status: 429, json: {} }, { json: envelope({ report: [] }) });
    const { tracer, spans } = fakeTracer();
    await makeClient(server, { hooks: openTelemetryHooks({ tracer }) }).reports.inquiry(`MSG-${PHONE}`);
    expect(spans).toHaveLength(1);
    expect(spans[0]).toMatchObject({
      name: 'bizgo reports.inquiry',
      ended: true,
      attributes: {
        'http.request.method': 'GET',
        'url.template': '/api/comm/v1/report/inquiry/{msgKey}',
        'bizgo.operation_id': 'getReportInquiry',
        'http.response.status_code': 200,
        'bizgo.retry_count': 1,
      },
      status: { code: 1 },
    });
    expect(JSON.stringify(spans)).not.toContain(PHONE);
  });

  it('marks failed calls with the code and layer', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { status: 401, json: { common: { authCode: 'A401', authResult: 'Unauthorized' } } });
    const { tracer, spans } = fakeTracer();
    await expect(makeClient(server, { hooks: openTelemetryHooks({ tracer }) }).reports.poll()).rejects.toThrow();
    expect(spans[0]?.attributes).toMatchObject({
      'bizgo.code': 'A401',
      'bizgo.layer': 'gateway',
      'bizgo.retry_count': 0,
    });
    expect(spans[0]?.status).toEqual({ code: 2, message: 'AuthenticationError' });
  });

  it('works with the global (no-op) tracer when none is given', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({}) });
    await expect(makeClient(server, { hooks: openTelemetryHooks() }).reports.poll()).resolves.toBeDefined();
  });
});
