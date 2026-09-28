import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigurationError, DEFAULT_RATE_LIMIT, type Fetch, OPERATIONS, sms } from '../src/index.js';
import { clock, requestCost, TokenBucket } from '../src/rate-limit.js';
import { envelope, MockServer, makeClient, rateDelays } from './helpers.js';
import { specOperations } from './spec-samples.js';

function numbers(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `0100000${String(i).padStart(4, '0')}`);
}

/** A fetch that answers sends (one A000 per destination) and records when each attempt went out (fake ms). */
function timedFetch(options: { failFirst?: number } = {}) {
  const times: number[] = [];
  const start = Date.now();
  let failures = options.failFirst ?? 0;
  const fetch: Fetch = async (_input, init) => {
    times.push(Date.now() - start);
    if (failures > 0) {
      failures--;
      return new Response('{}', { status: 503 });
    }
    const body = init.body ? JSON.parse(String(init.body)) : {};
    const destinations = (body.destinations ?? []).map((d: { to: string }) => ({
      to: d.to,
      msgKey: 'K',
      code: 'A000',
    }));
    return new Response(JSON.stringify(envelope({ destinations })), { status: 200 });
  };
  return { fetch, times };
}

const messages = [sms({ from: '01000000000', text: 'hello' })];

describe('token bucket (fake timers)', () => {
  beforeEach(() => {
    vi.mocked(clock.sleep).mockRestore(); // really wait, on the fake clock
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows a burst of `rate` requests and then paces them (other bucket)', async () => {
    const bucket = new TokenBucket(5);
    const done: number[] = [];
    const start = Date.now();
    const all = Array.from({ length: 8 }, (_, i) =>
      bucket.acquire().then(() => {
        done[i] = Date.now() - start;
      }),
    );
    await vi.advanceTimersByTimeAsync(0);
    expect(done.filter((t) => t !== undefined)).toHaveLength(5);
    await vi.advanceTimersByTimeAsync(1000);
    await Promise.all(all);
    expect(done.slice(5)).toEqual([200, 400, 600]);
  });

  it('a 200-recipient send uses the whole second; the next one goes ~1s later', async () => {
    const { fetch, times } = timedFetch();
    const client = makeClient(new MockServer(), { fetch });
    const first = client.send.omni({ to: numbers(200), messages });
    const second = client.send.omni({ to: numbers(200), messages });
    await vi.advanceTimersByTimeAsync(2000);
    await Promise.all([first, second]);
    expect(times).toEqual([0, 1000]);
  });

  it('does not delay a 1-recipient send on an idle bucket', async () => {
    const { fetch, times } = timedFetch();
    const client = makeClient(new MockServer(), { fetch });
    await client.send.sms({ to: '01000000000', from: '01000000000', text: 'x' });
    await client.send.sms({ to: '01000000000', from: '01000000000', text: 'x' });
    expect(times).toEqual([0, 0]);
  });

  it('never deadlocks when a request costs more than the capacity, and keeps the average rate', async () => {
    const { fetch, times } = timedFetch();
    const client = makeClient(new MockServer(), { fetch, rateLimit: { send: 100 } });
    const sends = [client.send.omni({ to: numbers(200), messages }), client.send.omni({ to: numbers(200), messages })];
    await vi.advanceTimersByTimeAsync(5000);
    await Promise.all(sends);
    // first goes on a full bucket (debt 100), second waits for the debt plus a full bucket: 400 messages in 2 s
    expect(times).toEqual([0, 2000]);
  });

  it('paces bulk sends: 1,000 recipients in 200-recipient chunks take about 4 seconds', async () => {
    const { fetch, times } = timedFetch();
    const client = makeClient(new MockServer(), { fetch });
    const bulk = client.send.bulk({ to: numbers(1000), messages });
    await vi.advanceTimersByTimeAsync(6000);
    const result = await bulk;
    expect(result.msgKeys).toHaveLength(1000);
    expect(times).toEqual([0, 1000, 2000, 3000, 4000]);
  });

  it('waits again before every retry', async () => {
    const { fetch, times } = timedFetch({ failFirst: 1 });
    const client = makeClient(new MockServer(), { fetch });
    const send = client.send.omni({ to: numbers(200), messages, idempotencyKey: 'order-1' });
    await vi.advanceTimersByTimeAsync(2000);
    await send;
    expect(times).toEqual([0, 1000]); // the retry of a 200-recipient send costs another 200 tokens
  });

  it('counsel sends use the send bucket with cost 1', async () => {
    const { fetch, times } = timedFetch();
    const client = makeClient(new MockServer(), { fetch, rateLimit: { send: 2, other: 1000 } });
    const body = {
      senderKey: 'SENDER_KEY_EXAMPLE',
      userKey: 'USER_KEY_EXAMPLE',
      msgType: 'TEXT' as const,
      message: 'x',
    };
    const sends = [1, 2, 3].map(() => client.counsel.messages.sendPlain({ body }));
    await vi.advanceTimersByTimeAsync(1000);
    await Promise.all(sends);
    expect(times).toEqual([0, 0, 500]); // 2 tokens of burst, then 1 token per 0.5 s
  });

  it('paces the other bucket per request and does not hold sends back', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({}) });
    server.on('POST', '/api/comm/v1/send/omni', { json: envelope({ destinations: [] }) });
    const client = makeClient(server);
    const reads = Array.from({ length: 7 }, () => client.reports.inquiry('MSG_KEY'));
    await vi.advanceTimersByTimeAsync(0);
    expect(server.calls).toHaveLength(5);
    await client.send.sms({ to: '01000000000', from: '01000000000', text: 'x' });
    expect(server.calls).toHaveLength(6);
    await vi.advanceTimersByTimeAsync(400);
    await Promise.all(reads);
    expect(server.calls).toHaveLength(8);
  });

  it('can be disabled with rateLimit: null', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({}) });
    const client = makeClient(server, { rateLimit: null });
    await Promise.all(Array.from({ length: 20 }, () => client.reports.inquiry('MSG_KEY')));
    expect(server.calls).toHaveLength(20);
  });
});

describe('rate limit options', () => {
  it('defaults to 200 messages/s for send and 5 requests/s for everything else', () => {
    expect(DEFAULT_RATE_LIMIT).toEqual({ send: 200, other: 5 });
  });

  it('accepts custom rates and rejects bad ones', () => {
    const server = new MockServer();
    expect(() => makeClient(server, { rateLimit: { send: 50 } })).not.toThrow();
    expect(() => makeClient(server, { rateLimit: { other: 0 } })).toThrow(ConfigurationError);
    expect(() => makeClient(server, { rateLimit: { send: Number.NaN } })).toThrow(ConfigurationError);
    expect(() => makeClient(server, { rateLimit: { sends: 1 } as never })).toThrow(ConfigurationError);
    expect(() => makeClient(server, { rateLimit: 5 as never })).toThrow(ConfigurationError);
  });

  it('uses the send bucket exactly for the spec operations tagged x-sdk-rate: send', () => {
    const tagged = specOperations
      .filter((o) => o.op['x-sdk-rate'] === 'send')
      .map((o) => o.id)
      .sort();
    const send = Object.values(OPERATIONS)
      .filter((op) => op.rate === 'send')
      .map((op) => op.id)
      .sort();
    expect(send).toEqual(tagged);
    expect(send).toEqual([
      'addReservationRecipients',
      'createBrandMessageGroupSend',
      'createReservation',
      'sendCounselPlain',
      'sendCounselRich',
      'sendOmni',
    ]);
  });

  it('costs the number of destinations for sends (minimum 1) and 1 otherwise', () => {
    expect(requestCost('send', { destinations: numbers(37) })).toBe(37);
    expect(requestCost('send', { destinations: [] })).toBe(1);
    expect(requestCost('send', { senderKey: 'S' })).toBe(1);
    expect(requestCost('send', undefined)).toBe(1);
    expect(requestCost('other', { destinations: numbers(37) })).toBe(1);
  });

  it('takes tokens per attempt, retries included (other bucket)', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { status: 503, json: {} }, { status: 503, json: {} }, { json: envelope({}) });
    const client = makeClient(server, { rateLimit: { other: 1 } });
    await client.reports.inquiry('MSG_KEY');
    expect(server.calls).toHaveLength(3);
    expect(rateDelays).toHaveLength(2);
  });

  it('reserves in call order with debt (unit)', () => {
    vi.spyOn(clock, 'now').mockReturnValue(0);
    const bucket = new TokenBucket(200);
    expect(bucket.reserve(200)).toBeCloseTo(0, 6);
    expect(bucket.reserve(200)).toBeCloseTo(1000, 6);
    expect(bucket.reserve(1)).toBeCloseTo(1005, 6);
    const small = new TokenBucket(100);
    expect(small.reserve(300)).toBeCloseTo(0, 6); // full bucket: goes, leaves debt of 200
    expect(small.reserve(1)).toBeCloseTo(2010, 6);
  });
});
