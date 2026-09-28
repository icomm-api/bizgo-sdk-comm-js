/** SDK-DESIGN.md §12.6 (user fetch opt-in), §12.11 (masking), §12.19 (no null results). */
import { inspect } from 'node:util';
import { describe, expect, it } from 'vitest';
import { Bizgo, ConfigurationError, type Fetch, maskPhone, OPERATIONS, redact } from '../src/index.js';
import { FakeFetch } from '../src/testing.js';
import { API_KEY, envelope, MockServer, makeClient } from './helpers.js';
import { type SpecOperation, sampleParams, specOperations } from './spec-samples.js';

const PHONE = '01000005678';
const okFetch: Fetch = async () => new Response(JSON.stringify(envelope({})), { status: 200 });

describe('§12.6 a user fetch needs an explicit trust opt-in', () => {
  it('refuses a custom fetch without trustFetch: true', () => {
    expect(() => new Bizgo({ apiKey: API_KEY, fetch: okFetch })).toThrow(ConfigurationError);
    expect(() => new Bizgo({ apiKey: API_KEY, fetch: okFetch, trustFetch: false })).toThrow(/trustFetch: true/);
    expect(() => new Bizgo({ apiKey: API_KEY, fetch: okFetch, trustFetch: 'yes' as never })).toThrow(
      ConfigurationError,
    );
  });

  it('accepts it with trustFetch: true, and the testing FakeFetch without it', async () => {
    await expect(
      new Bizgo({ apiKey: API_KEY, fetch: okFetch, trustFetch: true }).reports.poll(),
    ).resolves.toBeDefined();
    const fake = new FakeFetch();
    await expect(new Bizgo({ apiKey: API_KEY, fetch: fake.fetch }).reports.poll()).resolves.toBeDefined();
    await expect(new Bizgo(fake.clientOptions()).reports.poll()).resolves.toBeDefined();
  });

  it('uses the global fetch by default (no opt-in needed) and still never follows redirects', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({}) });
    await makeClient(server).reports.poll();
    expect(server.calls[0]?.init.redirect).toBe('manual');
    expect(() => new Bizgo({ apiKey: API_KEY })).not.toThrow();
  });
});

describe('§12.11 one masking helper', () => {
  it('masks phone numbers by length', () => {
    expect(maskPhone('01000005678')).toBe('010****5678');
    expect(maskPhone('821000005678')).toBe('821*****5678');
    expect(maskPhone('15881234')).toBe('158****4'); // 8 chars: first 3, half or more masked
    expect(maskPhone('158812345')).toBe('158*****5');
    expect(maskPhone('0215881234')).toBe('021*****34');
    expect(maskPhone('1588123')).toBe('*******');
    expect(maskPhone('112')).toBe('***');
    for (const n of ['15881234', '158812345', '0215881234']) {
      const out = maskPhone(n) as string;
      expect(out.split('').filter((c) => c === '*').length).toBeGreaterThanOrEqual(n.length / 2);
    }
  });

  it('redacts params/options and query objects: phones, person fields, content, tokens', () => {
    const params = {
      token: 'CHANNEL_TOKEN_EXAMPLE',
      phoneNumber: PHONE,
      body: {
        destinations: [{ to: PHONE, replaceWords: { name: '홍길동' } }],
        messageFlow: [{ sms: { from: '15881234', text: '인증번호 123456' } }],
        userEmail: 'user@example.com',
      },
      query: { from: PHONE, lastSeq: 3 },
      personalInfo: { name: '홍길동', nickname: 'NICK', phone_number: PHONE },
      file: new Uint8Array(10),
    };
    const out = JSON.stringify(redact(params));
    for (const secret of [
      'CHANNEL_TOKEN_EXAMPLE',
      PHONE,
      '인증번호',
      'user@example.com',
      '홍길동',
      'NICK',
      '15881234',
    ]) {
      expect(out).not.toContain(secret);
    }
    expect(redact(params)).toMatchObject({
      token: '[hidden]',
      phoneNumber: '010****5678',
      body: {
        messageFlow: [{ sms: { from: '158****4', text: '<11 chars>' } }],
        userEmail: expect.stringMatching(/^u\*+$/),
      },
      personalInfo: { name: '홍**', nickname: 'N***' },
      file: '<10 bytes>',
      query: { lastSeq: 3 },
    });
    expect(params.phoneNumber).toBe(PHONE); // input untouched
  });

  it('masks person and content fields in printed responses, keeping real values', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, {
      json: envelope({ userName: '홍길동', email: 'user@example.com', message: '상담 내용', token: 'SECRET_TOKEN' }),
    });
    const session = await makeClient(server).counsel.sessions.get({ userKey: 'USER_KEY_EXAMPLE' });
    const printed = inspect(session, { depth: 10 });
    for (const secret of ['홍길동', 'user@example.com', '상담 내용', 'SECRET_TOKEN'])
      expect(printed).not.toContain(secret);
    expect((session as Record<string, unknown>).userName).toBe('홍길동');
  });
});

/** An envelope whose `data.data` is missing (or null): the "no data" success response. */
function noData(variant: 'missing' | 'null'): Record<string, unknown> {
  const data: Record<string, unknown> = { code: 'A000', result: 'Success' };
  if (variant === 'null') data.data = null;
  return { common: { authCode: 'A000', authResult: 'Success' }, data };
}

const HAND_WRITTEN: Record<string, (c: Bizgo) => Promise<unknown>> = {
  sendOmni: (c) => c.send.sms({ to: PHONE, from: '01000000000', text: 'x' }),
  uploadMmsFile: (c) => c.files.uploadMms(new Uint8Array([1])),
  uploadRcsFile: (c) => c.files.uploadRcs(new Uint8Array([1])),
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
const VOID = new Set(['ackReportPolling']);

function call(o: SpecOperation): (c: Bizgo) => Promise<unknown> {
  const hand = HAND_WRITTEN[o.id];
  if (hand) return hand;
  return (c) => {
    const target = o.resource.split('.').reduce((node: any, name) => node?.[name], c);
    return target[o.name](sampleParams(o));
  };
}

describe('§12.19 success responses never return null/undefined', () => {
  const cases = specOperations.flatMap((o) => (['missing', 'null'] as const).map((variant) => ({ ...o, variant })));

  it.each(cases)('$id with data.data $variant', async (o) => {
    const server = new MockServer();
    server.on(o.method, /.*/, { json: noData(o.variant) });
    const result = await call(o)(makeClient(server));
    const meta = OPERATIONS[o.id as keyof typeof OPERATIONS];
    if (meta.result.kind === 'void' || VOID.has(o.id)) {
      expect(result).toBeUndefined();
      return;
    }
    expect(result).not.toBeNull();
    expect(result).toBeDefined();
    if (meta.result.kind === 'array') expect(result).toEqual([]);
    else expect(typeof result).toBe('object');
  });
});
