import { inspect } from 'node:util';
import { describe, expect, it } from 'vitest';
import { BulkSendResult, type Fetch, RateLimitError, sms, ValidationError } from '../src/index.js';
import { bulkIdempotencyKey } from '../src/resources/send.js';
import { envelope, MockServer, makeClient } from './helpers.js';

function numbers(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `0100000${String(i).padStart(4, '0')}`);
}

interface SendServer {
  fetch: Fetch;
  bodies: any[];
}

/** Start index encoded in a bulk key `<prefix>-<chunkSize>-<startIndex>-<hash8>`. */
function startOf(key: string | undefined): number | undefined {
  return key === undefined ? undefined : Number(key.split('-').at(-2));
}

/**
 * Answers each send with one result per destination. The first recipient of the chunk starting at index 0 is
 * rejected (A306); the chunk starting at `failStart` fails with service A020.
 */
function sendServer(options: { failStart?: number; delayMs?: number; onFlight?: (n: number) => void } = {}) {
  const bodies: any[] = [];
  let inFlight = 0;
  const fetch: Fetch = async (_input, init) => {
    const body = JSON.parse(String(init.body));
    bodies.push(body);
    inFlight++;
    options.onFlight?.(inFlight);
    if (options.delayMs) await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    inFlight--;
    if (options.failStart !== undefined && startOf(body.idempotencyKey) === options.failStart) {
      return new Response(JSON.stringify(envelope(undefined, { code: 'A020' })), { status: 200 });
    }
    const first = startOf(body.idempotencyKey) === 0;
    const destinations = body.destinations.map((d: { to: string }, i: number) => ({
      to: d.to,
      msgKey: `K${bodies.length}-${i}`,
      code: first && i === 0 ? 'A306' : 'A000',
    }));
    return new Response(JSON.stringify(envelope({ destinations })), { status: 200 });
  };
  return { fetch, bodies } satisfies SendServer;
}

const messages = [sms({ from: '01000000000', text: 'hello' })];

describe('send.bulk', () => {
  it('splits recipients into chunks of 200 by default and aggregates the results', async () => {
    const server = sendServer();
    const result = await makeClient(new MockServer(), { fetch: server.fetch }).send.bulk({
      to: numbers(450),
      messages,
    });
    expect(server.bodies.map((b) => b.destinations.length).sort()).toEqual([200, 200, 50]);
    expect(result).toBeInstanceOf(BulkSendResult);
    expect(result.results.map((r) => [r.chunkIndex, r.fromIndex, r.toIndex])).toEqual([
      [0, 0, 200],
      [1, 200, 400],
      [2, 400, 450],
    ]);
    expect(result.errors).toEqual([]);
    expect(result.succeeded).toHaveLength(450);
    expect(result.msgKeys).toHaveLength(450);
    expect(result.complete).toBe(true);
    // same message flow in every chunk, no idempotency key without a prefix
    expect(server.bodies.every((b) => b.idempotencyKey === undefined && b.messageFlow.length === 1)).toBe(true);
  });

  it('uses <prefix>-<chunkSize>-<startIndex>-<hash8> keys and keeps going after a failed chunk', async () => {
    const server = sendServer({ failStart: 2 });
    const result = await makeClient(new MockServer(), { fetch: server.fetch }).send.bulk({
      to: numbers(5),
      messages,
      chunkSize: 2,
      concurrency: 2,
      idempotencyKeyPrefix: 'campaign-7',
    });
    expect(server.bodies.map((b) => b.idempotencyKey).sort()).toEqual([
      bulkIdempotencyKey('campaign-7', 2, 0, numbers(5).slice(0, 2)),
      bulkIdempotencyKey('campaign-7', 2, 2, numbers(5).slice(2, 4)),
      bulkIdempotencyKey('campaign-7', 2, 4, numbers(5).slice(4)),
    ]);
    expect(server.bodies.every((b) => /^campaign-7-2-[024]-[0-9a-f]{8}$/.test(b.idempotencyKey))).toBe(true);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({ chunkIndex: 1, fromIndex: 2, toIndex: 4 });
    expect(result.errors[0]?.error).toBeInstanceOf(RateLimitError);
    expect(result.results.map((r) => r.chunkIndex)).toEqual([0, 2]);
    expect(result.failed.map((d) => d.code)).toEqual(['A306']);
    expect(result.succeeded).toHaveLength(2);
    expect(result.complete).toBe(false);
  });

  it('aggregates per-recipient A301 into duplicates; an all-A301 chunk is not an error', async () => {
    // re-run: chunk 0 was fully accepted before (all A301), chunk 2 partly (A301 + A000)
    const codes: Record<number, string[]> = { 0: ['A301', 'A301'], 2: ['A301', 'A000'], 4: ['A306'] };
    const fetch: Fetch = async (_input, init) => {
      const body = JSON.parse(String(init.body));
      const start = startOf(body.idempotencyKey) ?? 0;
      const destinations = body.destinations.map((d: { to: string }, i: number) => ({
        to: d.to,
        msgKey: `K${start}-${i}`,
        code: codes[start]?.[i] ?? 'A000',
      }));
      return new Response(JSON.stringify(envelope({ destinations })), { status: 200 });
    };
    const result = await makeClient(new MockServer(), { fetch }).send.bulk({
      to: numbers(5),
      messages,
      chunkSize: 2,
      idempotencyKeyPrefix: 'campaign-8',
    });
    expect(result.errors).toEqual([]);
    expect(result.results.map((r) => r.chunkIndex)).toEqual([0, 1, 2]);
    expect(result.duplicates.map((d) => d.msgKey)).toEqual(['K0-0', 'K0-1', 'K2-0']);
    expect(result.succeeded.map((d) => d.msgKey)).toEqual(['K2-1']);
    expect(result.failed.map((d) => d.code)).toEqual(['A306']);
    expect(String(result)).toBe('BulkSendResult(chunks=3, failedChunks=0, succeeded=1, failed=1, duplicates=3)');
    expect(result.complete).toBe(false); // because of the A306, not the duplicates
  });

  it('treats a re-run where every recipient is A301 as complete', async () => {
    const fetch: Fetch = async (_input, init) => {
      const body = JSON.parse(String(init.body));
      const destinations = body.destinations.map((d: { to: string }) => ({ to: d.to, code: 'A301' }));
      return new Response(JSON.stringify(envelope({ destinations })), { status: 200 });
    };
    const result = await makeClient(new MockServer(), { fetch }).send.bulk({
      to: numbers(3),
      messages,
      chunkSize: 2,
      idempotencyKeyPrefix: 'campaign-9',
    });
    expect(result.errors).toEqual([]);
    expect(result.duplicates).toHaveLength(3);
    expect(result.failed).toEqual([]);
    expect(result.succeeded).toEqual([]);
    expect(result.complete).toBe(true);
  });

  it('builds keys with the cross-SDK formula (SHA-256 of the numbers joined by a line feed)', () => {
    // same vector as the Python and Java SDKs: first 8 hex of sha256 over the two numbers joined by a line feed
    expect(bulkIdempotencyKey('camp', 2, 0, ['01000000000', { to: '01000000001' }])).toBe('camp-2-0-32fe30d2');
  });

  it('never reuses a key for a different group of recipients, and repeats keys for the same run', async () => {
    const keys = async (to: string[], chunkSize: number) => {
      const server = sendServer();
      await makeClient(new MockServer(), { fetch: server.fetch }).send.bulk({
        to,
        messages,
        chunkSize,
        idempotencyKeyPrefix: 'camp',
      });
      return server.bodies.map(
        (b) => `${b.idempotencyKey}:${b.destinations.map((d: { to: string }) => d.to).join(',')}`,
      );
    };
    const first = await keys(numbers(5), 2);
    expect(await keys(numbers(5), 2)).toEqual(first); // re-run: same keys, same groups
    const other = [...(await keys(numbers(5), 3)), ...(await keys(numbers(6).slice(1), 2))];
    const byKey = new Map(first.map((entry) => entry.split(':') as [string, string]));
    for (const entry of other) {
      const [key, group] = entry.split(':') as [string, string];
      if (byKey.has(key)) expect(byKey.get(key)).toBe(group);
    }
  });

  it('rejects a prefix whose keys would exceed 200 characters', async () => {
    const server = sendServer();
    await expect(
      makeClient(new MockServer(), { fetch: server.fetch }).send.bulk({
        to: numbers(2),
        messages,
        idempotencyKeyPrefix: 'x'.repeat(186), // 186 + '-200-0-' + 8 = 201
      }),
    ).rejects.toThrow(/200자/);
    expect(server.bodies).toHaveLength(0);
  });

  it('never has more than `concurrency` requests in flight', async () => {
    let peak = 0;
    const server = sendServer({ delayMs: 5, onFlight: (n) => (peak = Math.max(peak, n)) });
    const result = await makeClient(new MockServer(), { fetch: server.fetch, rateLimit: null }).send.bulk({
      to: numbers(20),
      messages,
      chunkSize: 1,
      concurrency: 3,
    });
    expect(result.results).toHaveLength(20);
    expect(peak).toBe(3);
  });

  it('validates every chunk before sending anything, with input indexes and no phone numbers', async () => {
    const server = sendServer();
    const to: unknown[] = numbers(5);
    to[3] = { to: '01000001234', unknownField: 1 };
    const error = await makeClient(new MockServer(), { fetch: server.fetch })
      .send.bulk({ to: to as never, messages, chunkSize: 2 })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues.map((i) => i.path)).toEqual(['to[3].unknownField']);
    expect(String(error)).not.toContain('01000001234');
    expect(server.bodies).toHaveLength(0);
  });

  it('reports a problem shared by every chunk once', async () => {
    const server = sendServer();
    const error = await makeClient(new MockServer(), { fetch: server.fetch })
      .send.bulk({ to: numbers(5), messages: [sms({ from: '01000000000', text: '😀' })], chunkSize: 1 })
      .catch((e: unknown) => e);
    expect((error as ValidationError).issues).toHaveLength(1);
    expect(server.bodies).toHaveLength(0);
  });

  it('rejects bad options', async () => {
    const client = makeClient(new MockServer());
    const base = { to: numbers(2), messages };
    await expect(client.send.bulk({ ...base, chunkSize: 201 })).rejects.toBeInstanceOf(ValidationError);
    await expect(client.send.bulk({ ...base, chunkSize: 0 })).rejects.toBeInstanceOf(ValidationError);
    await expect(client.send.bulk({ ...base, concurrency: 0 })).rejects.toBeInstanceOf(ValidationError);
    await expect(client.send.bulk({ ...base, idempotencyKeyPrefix: '' })).rejects.toBeInstanceOf(ValidationError);
    await expect(client.send.bulk({ ...base, to: [] })).rejects.toBeInstanceOf(ValidationError);
    await expect(client.send.bulk({ ...base, messages: [] })).rejects.toBeInstanceOf(ValidationError);
    await expect(client.send.bulk({ ...base, idempotencyKey: 'x' } as never)).rejects.toBeInstanceOf(ValidationError);
  });

  it('shows counts only in toString/inspect', async () => {
    const server = sendServer();
    const result = await makeClient(new MockServer(), { fetch: server.fetch }).send.bulk({ to: numbers(3), messages });
    for (const text of [String(result), inspect(result)]) {
      expect(text).toBe('BulkSendResult(chunks=1, failedChunks=0, succeeded=3, failed=0, duplicates=0)');
    }
  });

  it('uses the send rate limit bucket', async () => {
    const server = sendServer();
    const client = makeClient(new MockServer(), { fetch: server.fetch, rateLimit: { send: 2, other: 1000 } });
    const { rateDelays } = await import('./helpers.js');
    await client.send.bulk({ to: numbers(4), messages, chunkSize: 1, concurrency: 1 });
    expect(rateDelays.length).toBeGreaterThanOrEqual(2); // burst of 2, then the send bucket makes it wait
  });
});
