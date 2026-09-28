/** Regression tests for SDK-DESIGN.md §12 (security/usability review, 2026-09-24). One block per rule. */
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { inspect } from 'node:util';
import { gzipSync } from 'node:zlib';
import { afterEach, describe, expect, it } from 'vitest';
import {
  APIError,
  Bizgo,
  BizgoError,
  ConfigurationError,
  DuplicateRequestError,
  type Fetch,
  InvalidResponseError,
  RateLimitError,
  SendResult,
  sms,
  ValidationError,
  verifySignature,
  WebhookReceiver,
  WebhookVerificationError,
} from '../src/index.js';
import { MAX_JSON_DEPTH, tooDeep } from '../src/json.js';
import { signWebhook } from '../src/testing.js';
import { API_KEY, delays, envelope, MockServer, makeClient } from './helpers.js';

const PHONE = '01000005678';
const SECRET = 'test-webhook-secret';
const ok = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
const sequence = (...replies: (() => Response)[]): Fetch => {
  let n = 0;
  return async () => (replies[Math.min(n++, replies.length - 1)] as () => Response)();
};
const sendSms = (client: Bizgo, idempotencyKey?: string) =>
  client.send.sms({ to: PHONE, from: '01000000000', text: 'x', ...(idempotencyKey ? { idempotencyKey } : {}) });
const nested = (depth: number) =>
  `{"common":{"authCode":"A000"},"data":{"code":"A000","data":{"x":${'['.repeat(depth - 3)}${']'.repeat(depth - 3)}}}}`;

describe('§12.1 response parsing failures are InvalidResponseError with context', () => {
  it('adds status, trackingId, a non-enumerable body and the "may have been accepted" hint for sends', async () => {
    const text = '{"common":{"authCode":"A000","infobankTrId":"TR9"},"data":';
    const client = makeClient(new MockServer(), { fetch: sequence(() => new Response(text, { status: 200 })) });
    const error = (await sendSms(client).catch((e: unknown) => e)) as InvalidResponseError;
    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error.httpStatus).toBe(200);
    expect(error.trackingId).toBe('TR9');
    expect(error.body).toBe(text);
    expect(Object.keys(error)).not.toContain('body');
    expect(error.message).toMatch(/접수됐을 수/);
  });

  it('does not add the hint for non-send operations', async () => {
    const client = makeClient(new MockServer(), { fetch: sequence(() => new Response('<html>', { status: 200 })) });
    const error = (await client.reports.poll().catch((e: unknown) => e)) as InvalidResponseError;
    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error.message).not.toMatch(/접수됐을 수/);
  });
});

describe('§12.2 bulk keeps accepted chunks whatever a chunk throws', () => {
  it('records a non-Error throw from a custom fetch as a chunk error', async () => {
    const fetch: Fetch = () => {
      throw 'str';
    };
    const result = await makeClient(new MockServer(), { fetch }).send.bulk({
      to: [PHONE, '01000000000'],
      messages: [sms({ from: '01000000000', text: 'x' })],
      chunkSize: 1,
    });
    expect(result.errors).toHaveLength(2);
    expect(result.errors.every((e) => e.error instanceof Error)).toBe(true);
  });
});

describe('§12.4 A301 after any retry', () => {
  const dup = () => ok(envelope(undefined, { code: 'A301' }));
  it.each([
    ['503', () => ok({}, 503)],
    ['429', () => ok({}, 429)],
    ['connection error', () => Promise.reject(new TypeError('fetch failed')) as unknown as Response],
  ])('sets alreadyAccepted after a %s retry', async (_label, first) => {
    let n = 0;
    const fetch: Fetch = async () => (n++ === 0 ? first() : dup());
    const error = (await sendSms(makeClient(new MockServer(), { fetch }), 'order-1').catch(
      (e: unknown) => e,
    )) as DuplicateRequestError;
    expect(error).toBeInstanceOf(DuplicateRequestError);
    expect(error.alreadyAccepted).toBe(true);
    expect(error.message).toMatch(/이미 접수/);
  });

  it('is false without a retry', async () => {
    const error = (await sendSms(makeClient(new MockServer(), { fetch: sequence(dup) }), 'order-1').catch(
      (e: unknown) => e,
    )) as DuplicateRequestError;
    expect(error.alreadyAccepted).toBe(false);
  });
});

describe('§12.5 path values', () => {
  it('rejects . and .. and encodes everything else as one segment', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({ report: [] }) });
    const client = makeClient(server);
    await expect(client.reports.inquiry('..')).rejects.toBeInstanceOf(ValidationError);
    await expect(client.reports.inquiry('.')).rejects.toBeInstanceOf(ValidationError);
    await client.reports.inquiry('%2e%2e');
    await client.reports.inquiry('a/b?c#d%');
    expect(server.calls.map((c) => c.url.pathname)).toEqual([
      '/api/comm/v1/report/inquiry/%252e%252e',
      '/api/comm/v1/report/inquiry/a%2Fb%3Fc%23d%25',
    ]);
  });
});

describe('§12.6 the Authorization header cannot be taken over', () => {
  it.each(['https://user:pw@mars.ibapi.kr', 'https://mars.ibapi.kr?x=1', 'https://mars.ibapi.kr#f'])(
    'rejects baseUrl %s',
    (baseUrl) => {
      expect(() => new Bizgo({ apiKey: API_KEY, baseUrl })).toThrow(ConfigurationError);
    },
  );
});

describe('§12.7 webhook input defences', () => {
  it('rejects blank secrets and bad tolerances when constructing', () => {
    for (const secret of ['', '   ', '\n\t', new Uint8Array()]) {
      expect(() => new WebhookReceiver(secret)).toThrow(ConfigurationError);
    }
    for (const tolerance of [Number.POSITIVE_INFINITY, Number.NaN, -1, 0]) {
      expect(() => new WebhookReceiver(SECRET, { tolerance })).toThrow(ConfigurationError);
    }
    expect(() => new WebhookReceiver(SECRET, { tolerance: null })).not.toThrow();
  });

  it('verifySignature rejects bad tolerances and blank secrets', () => {
    const { headers } = signWebhook(SECRET, {});
    const params = { timestamp: headers['X-IB-Timestamp'] ?? '', signature: headers['X-IB-Signature'] ?? '' };
    expect(() => verifySignature({ ...params, secret: SECRET, tolerance: Number.POSITIVE_INFINITY })).toThrow(
      WebhookVerificationError,
    );
    expect(() => verifySignature({ ...params, secret: '  ' })).toThrow(WebhookVerificationError);
    expect(() => verifySignature({ ...params, secret: SECRET })).not.toThrow();
  });

  it('accepts 1-16 digit timestamps only', () => {
    const at = (timestamp: string) => () => {
      const { headers } = signWebhook(SECRET, {}, { timestamp });
      verifySignature({
        secret: SECRET,
        timestamp,
        signature: headers['X-IB-Signature'] ?? '',
        tolerance: null,
      });
    };
    expect(at('1'.repeat(16))).not.toThrow();
    expect(at('1'.repeat(17))).toThrow(/1~16자리/);
    expect(at('00000000000000000001')).toThrow(WebhookVerificationError);
    expect(at('１２')).toThrow(WebhookVerificationError); // full-width digits
  });

  it('rejects deep, malformed and mistyped bodies with WebhookVerificationError', () => {
    const { headers } = signWebhook(SECRET, {});
    const receiver = new WebhookReceiver(SECRET);
    const deep = `{"msgKey":"K","x":${'['.repeat(100_000)}${']'.repeat(100_000)}}`;
    expect(() => receiver.report(headers, deep)).toThrow(/중첩이 너무 깊습니다/);
    expect(() => receiver.report(headers, '{bad')).toThrow(WebhookVerificationError);
    expect(() => receiver.report(headers, '{"msgKey":5}')).toThrow(WebhookVerificationError);
  });
});

describe('§12.8 response size and depth limits', () => {
  it('limits JSON nesting to 64 levels (responses)', async () => {
    expect(MAX_JSON_DEPTH).toBe(64);
    expect(tooDeep(nested(64))).toBe(false);
    expect(tooDeep(nested(65))).toBe(true);
    expect(tooDeep('{"a":"[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[["}')).toBe(false);
    const client = (text: string) => makeClient(new MockServer(), { fetch: sequence(() => new Response(text)) });
    await expect(client(nested(64)).messages.status('K')).resolves.toBeDefined();
    await expect(client(nested(65)).messages.status('K')).rejects.toThrow(/중첩이 너무 깊습니다\(최대 64\)/);
  });

  it('stops reading after 16MB', async () => {
    const big = `{"common":{"authCode":"A000"},"data":{"code":"A000","data":{"x":"${'a'.repeat(16 * 1024 * 1024)}"}}}`;
    const client = makeClient(new MockServer(), { fetch: sequence(() => new Response(big)) });
    await expect(client.messages.status('K')).rejects.toThrow(/너무 큽니다/);
  });

  describe('against a local HTTP server (gzip bomb, redirects)', () => {
    let close: (() => void) | undefined;
    afterEach(() => close?.());

    async function serve(handler: Parameters<typeof createServer>[1]): Promise<string> {
      const server = createServer(handler);
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      close = () => {
        server.closeAllConnections?.();
        server.close();
      };
      return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    }

    it('limits the decompressed size of a gzip body', async () => {
      const bomb = gzipSync(Buffer.alloc(40 * 1024 * 1024, 0x20)); // 40MB of spaces, ~40KB compressed
      const base = await serve((_req, res) => {
        res.writeHead(200, { 'content-encoding': 'gzip', 'content-type': 'application/json' });
        res.end(bomb);
      });
      const client = new Bizgo({ apiKey: API_KEY, baseUrl: base, rateLimit: null, maxRetries: 0 });
      await expect(client.messages.status('K')).rejects.toBeInstanceOf(InvalidResponseError);
    });

    it('§12.17 reports a redirect with its status, never follows or retries it', async () => {
      let hits = 0;
      const base = await serve((_req, res) => {
        hits++;
        res.writeHead(302, { location: 'http://127.0.0.1:1/steal' });
        res.end();
      });
      const client = new Bizgo({ apiKey: API_KEY, baseUrl: base, rateLimit: null, maxRetries: 2 });
      const error = (await client.messages.status('K').catch((e: unknown) => e)) as InvalidResponseError;
      expect(error).toBeInstanceOf(InvalidResponseError);
      expect(error.httpStatus).toBe(302);
      expect(error.message).toMatch(/HTTP 302.*baseUrl/);
      expect(hits).toBe(1);
    });
  });
});

describe('§12.9 Retry-After', () => {
  it.each(['-5', '0x1', 'abc', '1e3', 'Infinity', ' '])('ignores %j and uses the default backoff', async (value) => {
    const client = makeClient(new MockServer(), {
      fetch: sequence(
        () => ok({}, 429, { 'retry-after': value }),
        () => ok(envelope({})),
      ),
    });
    await client.messages.status('K');
    expect(delays).toHaveLength(1);
    expect(delays[0]).toBeGreaterThanOrEqual(375);
    expect(delays[0]).toBeLessThanOrEqual(625);
  });

  it.each([
    ['2', 2000],
    ['1.5', 1500],
    ['0', 0],
    ['3600', 60_000],
  ])('uses %j as %d ms', async (value, ms) => {
    const client = makeClient(new MockServer(), {
      fetch: sequence(
        () => ok({}, 429, { 'retry-after': value }),
        () => ok(envelope({})),
      ),
    });
    await client.messages.status('K');
    expect(delays).toEqual([ms]);
  });
});

describe('§12.10 errors survive serialization', () => {
  it('round-trips through JSON with class and fields, without the body', async () => {
    const client = makeClient(new MockServer(), {
      maxRetries: 0,
      fetch: sequence(() =>
        ok({ common: { authCode: 'A000', infobankTrId: 'TR1' }, data: { code: 'A020' } }, 429, { 'retry-after': '3' }),
      ),
    });
    const error = (await sendSms(client).catch((e: unknown) => e)) as RateLimitError;
    const json = JSON.parse(JSON.stringify(error));
    expect(json).toMatchObject({
      name: 'RateLimitError',
      code: 'A020',
      layer: 'service',
      httpStatus: 429,
      retryAfter: 3,
    });
    expect(JSON.stringify(json)).not.toContain(PHONE);
    const copy = BizgoError.fromJSON(json);
    expect(copy).toBeInstanceOf(RateLimitError);
    expect(copy).toBeInstanceOf(APIError);
    expect(copy.message).toBe(error.message);
    expect((copy as RateLimitError).retryAfter).toBe(3);
    expect((copy as RateLimitError).trackingId).toBe('TR1');
  });

  it('round-trips validation, duplicate and invalid-response errors', () => {
    const validation = BizgoError.fromJSON(
      JSON.parse(JSON.stringify(new ValidationError([{ path: 'a', message: 'b' }]))),
    );
    expect(validation).toBeInstanceOf(ValidationError);
    expect((validation as ValidationError).issues).toEqual([{ path: 'a', message: 'b' }]);
    const dup = new DuplicateRequestError({
      serverMessage: 'x',
      httpStatus: 200,
      code: 'A301',
      layer: 'service',
      retried: true,
    });
    expect((BizgoError.fromJSON(JSON.parse(JSON.stringify(dup))) as DuplicateRequestError).alreadyAccepted).toBe(true);
    const invalid = new InvalidResponseError('bad', 200, { trackingId: 'T', body: PHONE });
    const text = JSON.stringify(invalid);
    expect(text).not.toContain(PHONE);
    expect(BizgoError.fromJSON(JSON.parse(text))).toBeInstanceOf(InvalidResponseError);
    expect(BizgoError.fromJSON({ name: 'Nope', message: 'm' })).toBeInstanceOf(BizgoError);
  });
});

describe('§12.11 phone numbers are masked when printed', () => {
  it('masks SendResult in inspect/toString and keeps the real data in JSON and properties', async () => {
    const server = new MockServer();
    server.on('POST', /.*/, { json: envelope({ destinations: [{ to: PHONE, msgKey: 'K1', code: 'A000' }] }) });
    const result = await sendSms(makeClient(server));
    expect(result).toBeInstanceOf(SendResult);
    for (const text of [inspect(result, { depth: 10 }), String(result)]) expect(text).not.toContain(PHONE);
    expect(inspect(result)).toContain('010****5678');
    expect(result.destinations[0]?.to).toBe(PHONE);
    expect(JSON.stringify(result)).toContain(PHONE);
  });

  it('masks generated results and webhook payloads, and shows only the length of counsel content', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({ report: [{ msgKey: 'K', to: PHONE, from: '01000000000' }] }) });
    const reports = await makeClient(server).reports.inquiry('K');
    expect(inspect(reports, { depth: 10 })).not.toContain(PHONE);
    expect(reports[0]?.to).toBe(PHONE);
    const payload = {
      msgKey: 'K',
      userKey: 'U',
      senderKey: 'S',
      serviceType: 'CSTALK',
      msgType: 'TEXT',
      sendTime: 't',
      reportTime: 't',
      content: '비밀 상담 내용',
      contents: [{ comment: '비밀' }],
    };
    const { headers, body } = signWebhook(SECRET, payload);
    const parsed = new WebhookReceiver(SECRET).counselMessage(headers, body);
    const printed = inspect(parsed, { depth: 10 });
    expect(printed).not.toContain('비밀');
    expect(printed).toContain('<8 chars>');
    expect(parsed.content).toBe('비밀 상담 내용');
  });
});

describe('§12.15 user callbacks are isolated', () => {
  it('keeps an accepted send when the logger throws', async () => {
    const server = new MockServer();
    server.on('POST', /.*/, { json: envelope({ destinations: [{ to: PHONE, msgKey: 'K1', code: 'A000' }] }) });
    const logger = {
      debug(): void {
        throw new Error('logger down');
      },
    };
    const result = await sendSms(makeClient(server, { logger }));
    expect(result.msgKeys).toEqual(['K1']);
  });

  it('swallows rejected async hooks (no unhandledRejection)', async () => {
    const seen: unknown[] = [];
    const listener = (reason: unknown) => seen.push(reason);
    process.on('unhandledRejection', listener);
    try {
      const server = new MockServer();
      server.on('GET', /.*/, { json: envelope({}) });
      const hooks = {
        async onRequestStart() {
          throw new Error('hook boom');
        },
        async onRequestEnd() {
          throw new Error('hook boom');
        },
      };
      await expect(makeClient(server, { hooks }).reports.poll()).resolves.toBeDefined();
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(seen).toEqual([]);
    } finally {
      process.off('unhandledRejection', listener);
    }
  });
});

describe('§12.16 API key format', () => {
  it.each([`${API_KEY}\n`, ` ${API_KEY}`, 'test-키-not-real', `${API_KEY}\u0000`, 'Bearer x'])(
    'rejects %j without trimming or echoing it',
    (apiKey) => {
      const error = (() => {
        try {
          new Bizgo({ apiKey });
        } catch (e) {
          return e;
        }
      })();
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(String(error)).not.toContain(apiKey.trim());
    },
  );

  it('applies to BIZGO_API_KEY too', () => {
    const previous = process.env.BIZGO_API_KEY;
    process.env.BIZGO_API_KEY = `${API_KEY}\n`;
    try {
      expect(() => new Bizgo()).toThrow(ConfigurationError);
    } finally {
      if (previous === undefined) delete process.env.BIZGO_API_KEY;
      else process.env.BIZGO_API_KEY = previous;
    }
  });
});

describe('§12.17 redirects (mock fetch)', () => {
  it('raises InvalidResponseError with the status and does not retry a safe call', async () => {
    const server = new MockServer();
    const route = server.on('GET', /.*/, { status: 301, headers: { location: 'https://example.invalid/' } });
    const error = (await makeClient(server)
      .reports.poll()
      .catch((e: unknown) => e)) as InvalidResponseError;
    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error.message).toMatch(/^HTTP 301/);
    expect(route.calls).toHaveLength(1);
  });
});

describe('§12.17 redirect failures raised by a custom fetch', () => {
  it('are reported as a redirect, without retry', async () => {
    let calls = 0;
    const fetch: Fetch = async () => {
      calls++;
      throw new TypeError('fetch failed', { cause: new Error('unexpected redirect') });
    };
    const error = (await makeClient(new MockServer(), { fetch })
      .reports.poll()
      .catch((e: unknown) => e)) as Error;
    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error.message).toMatch(/^HTTP 3xx: 리다이렉트/);
    expect(calls).toBe(1);
  });
});

describe('§12.18 unreadable upload files', () => {
  it('raises ValidationError with the file name only', async () => {
    const client = makeClient(new MockServer());
    const error = (await client.files
      .uploadMms('C:/secret/홍길동/customer-list.jpg')
      .catch((e: unknown) => e)) as Error;
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toContain('customer-list.jpg');
    expect(error.message).toMatch(/ENOENT/);
    expect(error.message).not.toContain('홍길동');
    expect(error.message).not.toContain('secret');
  });
});
