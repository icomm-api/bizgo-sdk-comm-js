/** Consistency with the vendored OpenAPI spec. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import type { Bizgo, SendOmniRequest, SendOmniResponse } from '../src/index.js';
import { InternalServerError, OPERATIONS as META, SERVICE_CODES } from '../src/index.js';
import { validate } from '../src/validation.js';
import { envelope, MockServer, makeClient } from './helpers.js';
import { type SpecOperation, sampleParams, specOperations } from './spec-samples.js';

const spec = parse(readFileSync(new URL('../spec/openapi.yaml', import.meta.url), 'utf8'));
const errorCodes = JSON.parse(readFileSync(new URL('../spec/error-codes.json', import.meta.url), 'utf8'));
const send = spec.paths['/api/comm/v1/send/omni'].post;
const examples: Record<string, { value: SendOmniRequest }> = send.requestBody.content['application/json'].examples;

describe('spec examples', () => {
  it.each(Object.keys(examples))('request example %s validates and round-trips', async (name) => {
    const value = examples[name]?.value as SendOmniRequest;
    expect(validate('SendOmniRequest', value)).toEqual(value);
    const server = new MockServer();
    const route = server.on('POST', '/api/comm/v1/send/omni', { json: envelope({ destinations: [] }) });
    await makeClient(server).send.request(value);
    expect(route.calls[0]?.json()).toEqual(value);
  });

  it('parses the send response example', async () => {
    const example: SendOmniResponse = send.responses['200'].content['application/json'].example;
    const server = new MockServer();
    server.on('POST', '/api/comm/v1/send/omni', { json: example });
    const result = await makeClient(server).send.sms({ to: '01000000000', from: '01000000000', text: 'x' });
    expect(result.msgKeys).toEqual(['20260424104234546POM101182450000']);
    expect(result.ref).toBe('sms-20260330-001');
    expect(result.trackingId).toBe('Infobank-Tracking-Id');
  });

  it('embeds every service code from the error code table', () => {
    const codes = errorCodes.service.map((entry: { code: string }) => entry.code);
    expect(Object.keys(SERVICE_CODES)).toEqual(codes);
  });
});

type Call = (client: Bizgo) => Promise<unknown>;
const blob = new Uint8Array([0xff, 0xd8]);

/** Hand-written P0 methods (they win over the generated ones); every other operation is generated. */
const HAND_WRITTEN: Record<string, Call> = {
  sendOmni: (c) => c.send.sms({ to: '01000000000', from: '01000000000', text: 'x' }),
  uploadMmsFile: (c) => c.files.uploadMms(blob),
  uploadRcsFile: (c) => c.files.uploadRcs(blob),
  getReportPolling: (c) => c.reports.poll(),
  ackReportPolling: (c) => c.reports.ack('REPORT_ID'),
  getReportInquiry: (c) => c.reports.inquiry('MSG_KEY'),
  getMessageStatistics: (c) => c.messages.statistics({ startDate: '20260101' }),
  getMessageHistory: (c) => c.messages.history({ requestTime: '2026-01-01T00:00:00' }),
  getMessageStatusByMsgKey: (c) => c.messages.status('MSG_KEY'),
  getMessageStatusByRequestId: (c) => c.messages.statusByRequestId('REQUEST_ID'),
  getMoHistory: (c) => c.messages.moHistory({ occurredTime: '2026-01-01T00:00:00+09:00' }),
  getMoByMsgKey: (c) => c.messages.mo('MSG_KEY'),
};

/** `client.<x-sdk-resource>` (nested). */
function resource(client: Bizgo, path: string): any {
  return path.split('.').reduce((node: any, name) => node?.[name], client);
}

function generatedCall(o: SpecOperation): Call {
  return (client) => {
    const target = resource(client, o.resource);
    if (typeof target?.[o.name] !== 'function') throw new Error(`client.${o.resource}.${o.name} is missing`);
    return target[o.name](sampleParams(o));
  };
}

const call = (o: SpecOperation): Call => HAND_WRITTEN[o.id] ?? generatedCall(o);

describe('operations', () => {
  it('covers every operation in the spec', () => {
    expect(specOperations).toHaveLength(146);
    expect(Object.keys(META).sort()).toEqual(specOperations.map((o) => o.id).sort());
  });

  it.each(specOperations)('$id: metadata matches the spec', (o) => {
    const meta = META[o.id as keyof typeof META];
    expect(meta.method).toBe(o.method);
    expect(meta.path).toBe(o.path);
    expect(meta.name).toBe(`${o.resource}.${o.name}`);
    expect(meta.retry).toBe(o.retry === 'safe' ? 'safe' : 'rateLimitOnly');
    expect(meta.rate).toBe(o.op['x-sdk-rate'] === 'send' ? 'send' : 'other');
    expect('pagination' in meta ? meta.pagination.style : undefined).toBe(o.pagination?.style);
  });

  it.each(specOperations)('$id is reachable on the client and calls $method $path', async (o) => {
    const server = new MockServer();
    server.on(o.method, /.*/, { json: envelope({}) });
    await call(o)(makeClient(server));
    expect(server.calls).toHaveLength(1);
    const sent = server.calls[0];
    expect(sent?.method).toBe(o.method);
    const pattern = new RegExp(`^${o.path.replace(/\{[^}]+\}/g, '[^/]+')}$`);
    expect(sent?.url.pathname).toMatch(pattern);
    if (!HAND_WRITTEN[o.id]) expect(typeof resource(makeClient(server), o.resource)[o.name]).toBe('function');
  });

  it.each(specOperations.filter((o) => !HAND_WRITTEN[o.id]))('$id retries per x-sdk-retry ($retry)', async (o) => {
    const server = new MockServer();
    server.on(o.method, /.*/, { status: 503, json: {} }, { json: envelope({}) });
    const client = makeClient(server);
    if (o.retry === 'safe') {
      await call(o)(client);
      expect(server.calls).toHaveLength(2);
    } else {
      await expect(call(o)(client)).rejects.toBeInstanceOf(InternalServerError);
      expect(server.calls).toHaveLength(1);
    }
  });
});

function put(body: Record<string, any>, path: readonly (string | number)[], value: unknown): void {
  let node = body;
  for (const segment of path.slice(0, -1)) {
    if (typeof segment === 'number') return;
    node[segment] ??= {};
    node = node[segment];
  }
  const last = path[path.length - 1];
  if (typeof last === 'string') node[last] = value;
}

function page(meta: any, items: unknown[], more: boolean, cursor?: string | number): Record<string, unknown> {
  const body: Record<string, any> = {
    common: { authCode: 'A000', authResult: 'Success' },
    data: { code: 'A000', result: 'Success' },
  };
  put(body, meta.pagination.items, items);
  if (meta.pagination.hasNext) put(body, meta.pagination.hasNext, more);
  if (meta.pagination.cursor && cursor !== undefined) put(body, meta.pagination.cursor, cursor);
  return body;
}

const paginated = specOperations.filter((o) => o.pagination);

describe('pagination', () => {
  it('has an iterator for every x-sdk-pagination operation', () => {
    expect(paginated.length).toBeGreaterThanOrEqual(12);
  });

  it.each(paginated)('$id: iter walks every page ($pagination.style)', async (o) => {
    const meta: any = META[o.id as keyof typeof META];
    const server = new MockServer();
    const request = o.params.find((p) => p.name === meta.pagination.request);
    const numeric = request?.schema?.type === 'integer';
    const cursor = (n: number) => (numeric ? n : `R${n}`);
    const sizeParam = o.params.find((p) => p.name === meta.pagination.size);
    const size = Math.max(2, sizeParam?.schema?.minimum ?? 0);
    const item = (n: number) => ({ requestId: cursor(n), seq: n });
    const first = Array.from({ length: size }, (_, i) => item(i + 1));
    const route = server.on(
      o.method,
      /.*/,
      { json: page(meta, first, true, cursor(size)) },
      { json: page(meta, [item(size + 1)], false, cursor(size + 1)) },
      { json: page(meta, [], false) },
    );
    const client = makeClient(server);
    const target = resource(client, o.resource);
    const iterName = `iter${o.name.charAt(0).toUpperCase()}${o.name.slice(1)}`;
    const params: Record<string, unknown> = sampleParams(o);
    delete params[meta.pagination.request];
    if (meta.pagination.size) params[meta.pagination.size] = size;
    const seen: unknown[] = [];
    for await (const value of target[iterName](params)) seen.push(value);
    expect(seen).toHaveLength(size + 1);
    expect(route.calls).toHaveLength(2);
    const second = route.calls[1]?.url.searchParams.get(meta.pagination.request);
    if (meta.pagination.style === 'cursor') expect(second).toBe(String(cursor(size)));
    if (meta.pagination.style === 'page') expect(second).toBe('2');
    if (meta.pagination.style === 'offset') expect(second).toBe(String(size));
    expect(route.calls[0]?.url.searchParams.has(meta.pagination.request)).toBe(meta.pagination.style !== 'cursor');
  });
});
