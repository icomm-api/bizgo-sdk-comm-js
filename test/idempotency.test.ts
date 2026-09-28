import { describe, expect, it } from 'vitest';
import { SCHEMAS } from '../src/generated/schemas.js';
import { DEFAULT_IDEMPOTENCY_TTL, OPERATIONS, type SendOmniRequest, sms } from '../src/index.js';
import { type Operation, prepare } from '../src/operation.js';
import { envelope, MockServer, makeClient } from './helpers.js';

const PATH = '/api/comm/v1/send/omni';
const PHONE = '01000000000';
const accepted = envelope({ destinations: [{ to: PHONE, msgKey: 'KEY000', code: 'A000', result: 'r' }] });
const messages = [sms({ from: PHONE, text: 'x' })];

function setup() {
  const server = new MockServer();
  const route = server.on('POST', PATH, { json: accepted });
  const bodies = () => route.calls.map((call) => call.json());
  return { client: makeClient(server), bodies };
}

describe('idempotencyTtl default (A309: a key without a TTL is rejected)', () => {
  it('is 86400 seconds', () => {
    expect(DEFAULT_IDEMPOTENCY_TTL).toBe(86400);
  });

  it('fills 86400 when idempotencyKey is set without a TTL (omni, sms, lms, mms)', async () => {
    const { client, bodies } = setup();
    await client.send.omni({ to: PHONE, messages, idempotencyKey: 'k-omni' });
    await client.send.sms({ to: PHONE, from: PHONE, text: 'x', idempotencyKey: 'k-sms' });
    await client.send.lms({ to: PHONE, from: PHONE, text: 'x', idempotencyKey: 'k-lms' });
    await client.send.mms({ to: PHONE, from: PHONE, text: 'x', fileKeys: ['FILE_KEY'], idempotencyKey: 'k-mms' });
    expect(bodies().map((b) => [b.idempotencyKey, b.idempotencyTtl])).toEqual([
      ['k-omni', 86400],
      ['k-sms', 86400],
      ['k-lms', 86400],
      ['k-mms', 86400],
    ]);
  });

  it('keeps an explicit TTL, including 0', async () => {
    const { client, bodies } = setup();
    await client.send.omni({ to: PHONE, messages, idempotencyKey: 'k1', idempotencyTtl: 600 });
    await client.send.omni({ to: PHONE, messages, idempotencyKey: 'k2', idempotencyTtl: 0 });
    expect(bodies().map((b) => b.idempotencyTtl)).toEqual([600, 0]);
  });

  it('adds no TTL without a key, and keeps a TTL sent without a key', async () => {
    const { client, bodies } = setup();
    await client.send.omni({ to: PHONE, messages });
    await client.send.sms({ to: PHONE, from: PHONE, text: 'x' });
    await client.send.omni({ to: PHONE, messages, idempotencyTtl: 60 });
    const sent = bodies();
    expect('idempotencyTtl' in sent[0]).toBe(false);
    expect('idempotencyTtl' in sent[1]).toBe(false);
    expect(sent[2]).toMatchObject({ idempotencyTtl: 60 });
    expect('idempotencyKey' in sent[2]).toBe(false);
  });

  it('fills the TTL in every bulk chunk sent with idempotencyKeyPrefix, keeps an explicit one', async () => {
    const to = ['01000000000', '01000001234', '01000000000'];
    const withPrefix = setup();
    await withPrefix.client.send.bulk({ to, messages, chunkSize: 1, idempotencyKeyPrefix: 'camp' });
    expect(withPrefix.bodies()).toHaveLength(3);
    expect(withPrefix.bodies().every((b) => b.idempotencyKey && b.idempotencyTtl === 86400)).toBe(true);

    const explicit = setup();
    await explicit.client.send.bulk({ to, messages, chunkSize: 2, idempotencyKeyPrefix: 'camp', idempotencyTtl: 0 });
    expect(explicit.bodies().map((b) => b.idempotencyTtl)).toEqual([0, 0]);

    const noPrefix = setup();
    await noPrefix.client.send.bulk({ to, messages, chunkSize: 2 });
    expect(noPrefix.bodies().every((b) => !('idempotencyTtl' in b) && !('idempotencyKey' in b))).toBe(true);
  });

  it('fills the TTL for a plain request body without changing the caller object', async () => {
    const { client, bodies } = setup();
    const request: SendOmniRequest = { destinations: [{ to: PHONE }], messageFlow: messages, idempotencyKey: 'k' };
    const before = structuredClone(request);
    await client.send.request(request);
    expect(bodies()[0]).toMatchObject({ idempotencyKey: 'k', idempotencyTtl: 86400 });
    expect(request).toEqual(before);
  });
});

describe('idempotencyTtl default in generated operations', () => {
  const flagged = Object.values(OPERATIONS as Record<string, Operation>).filter((op) => op.body?.idempotencyTtl);

  it('is flagged exactly for JSON bodies that have both idempotencyKey and idempotencyTtl', () => {
    const expected = Object.values(OPERATIONS as Record<string, Operation>)
      .filter((op) => {
        const rule = op.body?.json ? (SCHEMAS as Record<string, any>)[op.body.json] : undefined;
        return rule?.properties?.idempotencyKey !== undefined && rule?.properties?.idempotencyTtl !== undefined;
      })
      .map((op) => op.id);
    expect(flagged.map((op) => op.id)).toEqual(expected);
    expect(expected).toContain('sendOmni');
  });

  it('adds the TTL to a plain object body only when absent, never mutating the input', async () => {
    const op = OPERATIONS.sendOmni as Operation;
    const base = { destinations: [{ to: PHONE }], messageFlow: messages };

    const keyOnly = { ...base, idempotencyKey: 'k' };
    const snapshot = structuredClone(keyOnly);
    const prepared = await prepare(op, { body: keyOnly });
    expect(prepared.json).toMatchObject({ idempotencyKey: 'k', idempotencyTtl: 86400 });
    expect(keyOnly).toEqual(snapshot);
    expect('idempotencyTtl' in keyOnly).toBe(false);

    expect((await prepare(op, { body: { ...base, idempotencyKey: 'k', idempotencyTtl: 0 } })).json).toMatchObject({
      idempotencyTtl: 0,
    });
    expect('idempotencyTtl' in ((await prepare(op, { body: base })).json as object)).toBe(false);
  });
});
