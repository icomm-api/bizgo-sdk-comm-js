import { inspect } from 'node:util';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  APIConnectionError,
  APIError,
  AuthenticationError,
  BadRequestError,
  Bizgo,
  BizgoError,
  ConfigurationError,
  Environment,
  InternalServerError,
  InvalidResponseError,
  NotFoundError,
  PermissionDeniedError,
  WebhookReceiver,
} from '../src/index.js';
import { API_KEY, envelope, MockServer, makeClient, networkError, timeoutError } from './helpers.js';

const STATS = '/api/comm/v1/message/statistics';
const MO = '/api/comm/v1/message/history/mo';

async function rejection(promise: Promise<unknown>): Promise<Error> {
  try {
    await promise;
  } catch (error) {
    return error as Error;
  }
  throw new Error('expected the promise to reject');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('error mapping', () => {
  it('maps a gateway 401 without data', async () => {
    // observed on sandbox: invalid key -> HTTP 401, common.authCode=A401, no data
    const server = new MockServer();
    server.on('GET', STATS, {
      status: 401,
      json: { common: { authCode: 'A401', authResult: 'Unauthorized', infobankTrId: 'TR-1' } },
    });
    const error = (await rejection(makeClient(server).messages.statistics({ startDate: '20260101' }))) as APIError;
    expect(error).toBeInstanceOf(AuthenticationError);
    expect([error.httpStatus, error.code, error.layer, error.trackingId]).toEqual([401, 'A401', 'gateway', 'TR-1']);
    expect(error.message).toBe('HTTP 401 | gateway code=A401 | Unauthorized | infobankTrId=TR-1');
    expect(String(error)).not.toContain(API_KEY);
    expect(inspect(error)).not.toContain(API_KEY);
  });

  it('uses the documented status for a service error inside HTTP 200', async () => {
    const server = new MockServer();
    server.on('GET', STATS, { json: envelope(undefined, { code: 'A306' }) });
    const error = (await rejection(makeClient(server).messages.statistics({ startDate: '20260101' }))) as APIError;
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.layer).toBe('service');
    expect(error.description).toBe('유효하지 않거나 비어있는 필드 (필드명 : to)');
    expect(error.message).toBe(
      'HTTP 200 | service code=A306 | Failed | 유효하지 않거나 비어있는 필드 (필드명 : to) | infobankTrId=TR-TEST',
    );
  });

  it('reads the same code differently per layer', async () => {
    const server = new MockServer();
    const client = makeClient(server);
    server.on('GET', STATS, { status: 400, json: envelope(undefined, { code: 'A401' }) }); // service A401 = paymentCode
    await expect(client.messages.statistics({ startDate: '20260101' })).rejects.toBeInstanceOf(BadRequestError);
    server.on('GET', STATS, { status: 401, json: { common: { authCode: 'A401', authResult: 'Unauthorized' } } });
    await expect(client.messages.statistics({ startDate: '20260101' })).rejects.toBeInstanceOf(AuthenticationError);
    server.on('GET', STATS, { json: envelope(undefined, { code: 'A110' }) });
    await expect(client.messages.statistics({ startDate: '20260101' })).rejects.toBeInstanceOf(PermissionDeniedError);
  });

  it('maps 404', async () => {
    const server = new MockServer();
    server.on('GET', STATS, { status: 404, json: { common: { authCode: 'A404', authResult: 'Not Found' } } });
    await expect(makeClient(server).messages.statistics({ startDate: '20260101' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('retries a 5xx with an HTML body, then raises', async () => {
    const server = new MockServer();
    const route = server.on('GET', STATS, { status: 502, text: '<html>bad gateway</html>' });
    const error = await rejection(makeClient(server).messages.statistics({ startDate: '20260101' }));
    expect(error).toBeInstanceOf(InternalServerError);
    expect(error.message).toMatch(/JSON이 아닙니다/);
    expect(route.calls).toHaveLength(3);
  });

  it('raises InvalidResponseError for a non-JSON success', async () => {
    const server = new MockServer();
    server.on('GET', STATS, { text: 'ok' });
    const error = await rejection(makeClient(server).messages.statistics({ startDate: '20260101' }));
    expect(error).toBeInstanceOf(InvalidResponseError);
    expect((error as InvalidResponseError).httpStatus).toBe(200);
  });

  it('keeps the hierarchy and names', () => {
    const error = new BadRequestError({ serverMessage: 'x', httpStatus: 400, code: 'A306', layer: 'service' });
    expect(error).toBeInstanceOf(APIError);
    expect(error).toBeInstanceOf(BizgoError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('BadRequestError');
  });
});

describe('secrets and personal data stay out of errors and logs', () => {
  it('does not chain the fetch error, which contains the URL', async () => {
    const server = new MockServer();
    server.on('GET', MO, networkError());
    const error = await rejection(
      makeClient(server).messages.moHistory({ occurredTime: '2026-04-23T14:11:01+09:00', from: '01000001234' }),
    );
    expect(error).toBeInstanceOf(APIConnectionError);
    expect(error.message).toBe('서버에 연결하지 못했습니다 (TypeError, ECONNREFUSED)');
    expect(error.cause).toBeUndefined();
    expect(inspect(error)).not.toContain('01000001234');
  });

  it('does not print the response body when an APIError is logged', async () => {
    const server = new MockServer();
    server.on('POST', '/api/comm/v1/send/omni', {
      status: 400,
      json: { ...envelope({ destinations: [{ to: '01000001234' }] }, { code: 'A306' }) },
    });
    const error = (await rejection(
      makeClient(server).send.sms({ to: '01000001234', from: '01000000000', text: 'x' }),
    )) as APIError;
    expect(error.body).toBeDefined(); // still available on purpose
    expect(inspect(error)).not.toContain('01000001234');
    expect(JSON.stringify(error)).not.toContain('01000001234');
  });

  it('logs only method, path, status, time and attempt', async () => {
    const server = new MockServer();
    server.on('GET', MO, timeoutError(), { json: envelope({ messages: [], hasNext: false }) });
    const lines: string[] = [];
    const client = makeClient(server, { logger: { debug: (line) => lines.push(line) } });
    await client.messages.moHistory({ occurredTime: '2026-04-23T14:11:01+09:00', from: '01000001234' });
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^GET \/api\/comm\/v1\/message\/history\/mo -> TimeoutError \(\d+ ms, attempt 1\)$/);
    expect(lines[1]).toMatch(/^GET \/api\/comm\/v1\/message\/history\/mo -> 200 \(\d+ ms, attempt 2\)$/);
    expect(lines.join('\n')).not.toContain(API_KEY);
    expect(lines.join('\n')).not.toContain('01000001234');
  });

  it('is silent without a logger', async () => {
    const spies = (['log', 'info', 'debug', 'warn', 'error'] as const).map((level) => vi.spyOn(console, level));
    const server = new MockServer();
    server.on('GET', STATS, { status: 500, text: 'x' });
    await expect(makeClient(server).messages.statistics({ startDate: '20260101' })).rejects.toThrow();
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
  });

  it('keeps the key out of toString, inspect and JSON', () => {
    const client = new Bizgo({ apiKey: API_KEY });
    expect(String(client)).toBe('Bizgo(baseUrl=https://mars.ibapi.kr)');
    expect(inspect(client, { depth: 10, showHidden: true })).not.toContain(API_KEY);
    expect(inspect(client.send, { depth: 10, showHidden: true })).not.toContain(API_KEY);
    expect(JSON.stringify(client)).not.toContain(API_KEY);
    const receiver = new WebhookReceiver('test-webhook-secret');
    expect(inspect(receiver, { depth: 10, showHidden: true })).not.toContain('test-webhook-secret');
  });
});

describe('configuration', () => {
  it.each(['Bearer abc', 'ApiKey abc', '  ', ''])('rejects a prefixed or blank key %j', (key) => {
    vi.stubEnv('BIZGO_API_KEY', '');
    expect(() => new Bizgo({ apiKey: key })).toThrow(ConfigurationError);
  });

  it('reads the key from BIZGO_API_KEY', () => {
    vi.stubEnv('BIZGO_API_KEY', API_KEY);
    expect(new Bizgo().baseUrl).toBe(Environment.PRODUCTION);
  });

  it('fails without a key', () => {
    vi.stubEnv('BIZGO_API_KEY', '');
    expect(() => new Bizgo()).toThrow(/BIZGO_API_KEY/);
  });

  it.each([
    'http://mars.ibapi.kr',
    'ftp://example.com',
    'not a url',
    'https://user:pw@mars.ibapi.kr',
    'https://x.kr/?a=1',
  ])('rejects base URL %j', (url) => {
    expect(() => new Bizgo({ apiKey: API_KEY, baseUrl: url })).toThrow(ConfigurationError);
  });

  it('allows plain http only for localhost mock servers', () => {
    expect(new Bizgo({ apiKey: API_KEY, baseUrl: 'http://localhost:4010/' }).baseUrl).toBe('http://localhost:4010');
    expect(new Bizgo({ apiKey: API_KEY, baseUrl: 'http://127.0.0.1:4010' }).baseUrl).toBe('http://127.0.0.1:4010');
  });

  it('rejects unknown environments and options', () => {
    expect(() => new Bizgo({ apiKey: API_KEY, environment: 'https://evil.example' as never })).toThrow(
      ConfigurationError,
    );
    expect(() => new Bizgo({ apiKey: API_KEY, api_key: 'x' } as never)).toThrow(/알 수 없는 옵션입니다: api_key/);
    expect(() => new Bizgo({ apiKey: API_KEY, maxRetries: -1 })).toThrow(ConfigurationError);
    expect(() => new Bizgo({ apiKey: API_KEY, timeoutMs: 0 })).toThrow(ConfigurationError);
  });

  it('keeps settings per instance', async () => {
    const a = new MockServer();
    const b = new MockServer();
    a.on('GET', STATS, { json: envelope({ statistics: [] }) });
    b.on('GET', STATS, { json: envelope({ statistics: [] }) });
    await new Bizgo({
      apiKey: 'test-key-a',
      environment: Environment.SANDBOX,
      fetch: a.fetch,
      trustFetch: true,
    }).messages.statistics({
      startDate: '20260101',
    });
    await new Bizgo({ apiKey: 'test-key-b', fetch: b.fetch, trustFetch: true }).messages.statistics({
      startDate: '20260101',
    });
    expect(a.calls[0]?.headers.get('authorization')).toBe('test-key-a');
    expect(a.calls[0]?.url.origin).toBe(Environment.SANDBOX);
    expect(b.calls[0]?.headers.get('authorization')).toBe('test-key-b');
    expect(b.calls[0]?.url.origin).toBe(Environment.PRODUCTION);
  });

  it('passes a per-attempt timeout signal to fetch', async () => {
    const server = new MockServer();
    server.on('GET', STATS, { json: envelope({ statistics: [] }) });
    await makeClient(server, { timeoutMs: 1234 }).messages.statistics({ startDate: '20260101' });
    expect(server.calls[0]?.init.signal).toBeInstanceOf(AbortSignal);
  });
});
