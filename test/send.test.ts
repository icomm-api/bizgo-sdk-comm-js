import { inspect } from 'node:util';
import { describe, expect, it } from 'vitest';
import {
  APIConnectionError,
  alimtalk,
  brandMessage,
  DuplicateRequestError,
  international,
  mms,
  naverTalk,
  RateLimitError,
  rcs,
  sms,
  ValidationError,
} from '../src/index.js';
import { API_KEY, delays, envelope, MockServer, makeClient, timeoutError } from './helpers.js';

const PATH = '/api/comm/v1/send/omni';

function accepted(...codes: string[]) {
  return envelope(
    {
      destinations: codes.map((code, i) => ({
        to: '01000000000',
        msgKey: `KEY${String(i).padStart(3, '0')}`,
        code,
        result: 'r',
      })),
    },
    { ref: 'ref-1' },
  );
}

async function rejection(promise: Promise<unknown>): Promise<Error> {
  try {
    await promise;
  } catch (error) {
    return error as Error;
  }
  throw new Error('expected the promise to reject');
}

describe('send', () => {
  it('sends the raw key and serializes only what was set', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH, { json: accepted('A000') });
    const result = await makeClient(server).send.sms({
      to: '01000000000',
      from: '01000000000',
      text: '인증번호는 123456 입니다.',
      ref: 'ref-1',
    });

    const call = route.calls[0];
    expect(call?.headers.get('authorization')).toBe(API_KEY); // raw key, no prefix (verified on sandbox)
    expect(call?.headers.get('user-agent')).toMatch(/^bizgo-sdk-comm-js\/1\.2\.0 /);
    expect(call?.headers.get('accept')).toBe('application/json');
    expect(call?.headers.get('content-type')).toBe('application/json');
    expect(call?.init.redirect).toBe('manual'); // 3xx is reported, never followed (§12.17)
    expect(call?.json()).toEqual({
      destinations: [{ to: '01000000000' }],
      messageFlow: [{ sms: { from: '01000000000', text: '인증번호는 123456 입니다.' } }],
      ref: 'ref-1',
    });
    expect(result.msgKeys).toEqual(['KEY000']);
    expect(result.failed).toEqual([]);
    expect(result.ref).toBe('ref-1');
    expect(result.trackingId).toBe('TR-TEST');
  });

  it('keeps the fallback order and omits unset spec defaults', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH, { json: accepted('A000') });
    await makeClient(server).send.omni({
      to: [{ to: '01000000000', replaceWords: { name: '홍길동' } }],
      messages: [
        alimtalk({
          senderKey: 'SENDER_KEY_EXAMPLE',
          templateCode: 'TEMPLATE_CODE_EXAMPLE',
          msgType: 'AT',
          text: '#{name}님 주문 완료',
        }),
        sms({ from: '01000000000', text: '#{name}님 주문 완료' }),
      ],
      idempotencyKey: 'order-1',
    });
    const body = route.calls[0]?.json();
    expect(body.messageFlow.map((item: object) => Object.keys(item)[0])).toEqual(['alimtalk', 'sms']);
    // responseMethod/timeout defaults are not sent
    expect(body.messageFlow[0].alimtalk).toEqual({
      senderKey: 'SENDER_KEY_EXAMPLE',
      templateCode: 'TEMPLATE_CODE_EXAMPLE',
      msgType: 'AT',
      text: '#{name}님 주문 완료',
    });
    expect(body.destinations).toEqual([{ to: '01000000000', replaceWords: { name: '홍길동' } }]);
    expect(body.idempotencyKey).toBe('order-1');
  });

  it('drops undefined members and optional nulls, keeps nulls where the spec allows them', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH, { json: accepted('A000') });
    await makeClient(server).send.omni({
      to: '01000000000',
      messages: [
        brandMessage({
          sendType: 'free',
          msgType: 'FM',
          senderKey: 'SENDER_KEY_EXAMPLE',
          text: undefined,
          attachment: { commerce: { title: '상품', regularPrice: 1000, discountRate: null } },
        }),
      ],
      ref: undefined,
    });
    expect(route.calls[0]?.json()).toEqual({
      destinations: [{ to: '01000000000' }],
      messageFlow: [
        {
          brandmessage: {
            sendType: 'free',
            msgType: 'FM',
            senderKey: 'SENDER_KEY_EXAMPLE',
            attachment: { commerce: { title: '상품', regularPrice: 1000, discountRate: null } },
          },
        },
      ],
    });
  });

  it('wraps every channel with its key', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH, { json: accepted('A000') });
    await makeClient(server).send.omni({
      to: '01000000000',
      messages: [
        rcs({ from: '01000000000', formatId: 'RCS_FORMAT_ID', brandKey: 'RCS_BRAND_KEY', body: { description: 'x' } }),
        international({ from: '01000000000', text: 'hello' }),
        naverTalk({ partnerKey: 'PARTNER_KEY_EXAMPLE', templateCode: 'T', productCode: 'INFORMATION' }),
        mms({ from: '01000000000', text: 'x' }),
      ],
    });
    const keys = route.calls[0]?.json().messageFlow.map((item: object) => Object.keys(item));
    expect(keys).toEqual([['rcs'], ['international'], ['navertalk'], ['mms']]);
  });

  it('reports partial failure per recipient', async () => {
    const server = new MockServer();
    server.on('POST', PATH, { json: accepted('A000', 'A306') });
    const result = await makeClient(server).send.sms({
      to: ['01000000000', '01000001234'],
      from: '01000000000',
      text: 'x',
    });
    expect(result.failed.map((d) => d.code)).toEqual(['A306']);
    expect(result.succeeded).toHaveLength(1);
  });

  it('puts per-recipient A301 (same idempotency key, already accepted) in duplicates, not failed/succeeded', async () => {
    const server = new MockServer();
    server.on('POST', PATH, { json: accepted('A301', 'A301') });
    const result = await makeClient(server).send.sms({
      to: ['01000000000', '01000001234'],
      from: '01000000000',
      text: 'x',
      idempotencyKey: 'k-1',
    });
    expect(result.duplicates.map((d) => d.code)).toEqual(['A301', 'A301']);
    expect(result.failed).toEqual([]);
    expect(result.succeeded).toEqual([]);
    expect(result.msgKeys).toEqual([]);
    expect(String(result)).toBe('SendResult(destinations=2, succeeded=0, failed=0, duplicates=2)');
  });

  it('splits a mixed response into succeeded, failed and duplicates, masking duplicates like the others', async () => {
    const server = new MockServer();
    server.on('POST', PATH, { json: accepted('A000', 'A301', 'A306') });
    const result = await makeClient(server).send.sms({
      to: ['01000000000', '01000001234', '01000005678'],
      from: '01000000000',
      text: 'x',
      idempotencyKey: 'k-2',
    });
    expect(result.succeeded.map((d) => d.msgKey)).toEqual(['KEY000']);
    expect(result.duplicates.map((d) => d.msgKey)).toEqual(['KEY001']);
    expect(result.failed.map((d) => d.code)).toEqual(['A306']);
    expect(result.msgKeys).toEqual(['KEY000']);
    expect(String(result)).toBe('SendResult(destinations=3, succeeded=1, failed=1, duplicates=1)');
    const printed = inspect(result);
    expect(printed).not.toContain('01000000000');
    expect(printed).toContain('010****0000');
    expect(JSON.stringify(result)).toContain('01000000000');
  });

  it('still raises DuplicateRequestError for a request-level A301', async () => {
    const server = new MockServer();
    server.on('POST', PATH, { json: envelope(undefined, { code: 'A301' }) });
    const error = await rejection(
      makeClient(server).send.sms({ to: '01000000000', from: '01000000000', text: 'x', idempotencyKey: 'k-3' }),
    );
    expect(error).toBeInstanceOf(DuplicateRequestError);
  });

  it('sends MMS with file keys and LMS without', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH, { json: accepted('A000') });
    const client = makeClient(server);
    await client.send.mms({
      to: '01000000000',
      from: '01000000000',
      text: '본문',
      title: '제목',
      fileKeys: ['FILE_KEY_001'],
    });
    expect(route.calls[0]?.json().messageFlow[0].mms).toEqual({
      from: '01000000000',
      title: '제목',
      text: '본문',
      fileKey: ['FILE_KEY_001'],
    });
    await client.send.lms({ to: '01000000000', from: '01000000000', text: '본문' });
    expect(route.calls[1]?.json().messageFlow[0].mms).not.toHaveProperty('fileKey');
    await expect(client.send.mms({ to: '01000000000', from: '01000000000', text: 'x' } as never)).rejects.toThrow(
      /fileKeys/,
    );
  });
});

describe('validation before sending', () => {
  it.each([
    ['가'.repeat(46), /최대 90byte인데 92byte/],
    ['안녕😀', /EUC-KR로 표현할 수 없습니다/],
  ])('checks the SMS byte limit (%#)', async (text, message) => {
    const server = new MockServer();
    const route = server.on('POST', PATH);
    const error = await rejection(makeClient(server).send.sms({ to: '01000000000', from: '01000000000', text }));
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toMatch(message);
    expect((error as ValidationError).issues[0]?.path).toBe('messageFlow[0].sms.text');
    expect(route.calls).toHaveLength(0);
  });

  it('counts EUC-KR bytes, not characters', async () => {
    const server = new MockServer();
    server.on('POST', PATH, { json: accepted('A000') });
    const client = makeClient(server);
    await client.send.sms({ to: '01000000000', from: '01000000000', text: '가'.repeat(45) }); // 90 bytes
    await client.send.sms({ to: '01000000000', from: '01000000000', text: 'a'.repeat(90) });
    await client.send.lms({ to: '01000000000', from: '01000000000', text: '가'.repeat(1000) }); // 2,000 bytes
    await expect(client.send.lms({ to: '01000000000', from: '01000000000', text: '가'.repeat(1001) })).rejects.toThrow(
      ValidationError,
    );
  });

  it('rejects unknown fields in messages and in the request', async () => {
    const client = makeClient(new MockServer());
    const typo = alimtalk({ senderKey: 'S', templateCode: 'T', templatecode: 'typo' } as never);
    await expect(client.send.omni({ to: '01000000000', messages: [typo] })).rejects.toThrow(
      /messageFlow\[0\]\.alimtalk\.templatecode: 알 수 없는 필드입니다/,
    );
    await expect(
      client.send.request({
        destinations: [{ to: '01000000000' }],
        messageFlow: [sms({ from: '1', text: 'x' })],
        idempotency_key: 'k',
      } as never),
    ).rejects.toThrow(/idempotency_key: 알 수 없는 필드입니다/);
  });

  it('rejects unknown method options (snake_case typos)', async () => {
    const client = makeClient(new MockServer());
    await expect(
      client.send.sms({ to: '01000000000', from: '01000000000', text: 'x', idempotency_key: 'k' } as never),
    ).rejects.toThrow(/idempotency_key: send\.sms에서 알 수 없는 옵션입니다/);
  });

  it('checks required fields, types, enums and ranges', async () => {
    const client = makeClient(new MockServer());
    const error = (await rejection(
      client.send.omni({
        to: '01000000000',
        messages: [alimtalk({ senderKey: 'S', msgType: 'XX', timeout: 180 } as never)],
        idempotencyTtl: 90000,
      }),
    )) as ValidationError;
    expect(error.issues).toEqual(
      expect.arrayContaining([
        { path: 'messageFlow[0].alimtalk.templateCode', message: '필수 필드입니다' },
        { path: 'messageFlow[0].alimtalk.msgType', message: '허용된 값이 아닙니다 (허용: AT, AI)' },
        { path: 'messageFlow[0].alimtalk.timeout', message: '문자열이어야 합니다' },
        { path: 'idempotencyTtl', message: '86400 이하여야 합니다' },
      ]),
    );
  });

  it('rejects more than 200 recipients', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH);
    const to = Array.from({ length: 201 }, (_, i) => `010${String(i).padStart(8, '0')}`);
    await expect(makeClient(server).send.sms({ to, from: '01000000000', text: 'x' })).rejects.toThrow(
      /destinations: 최대 200개인데 201개입니다/,
    );
    expect(route.calls).toHaveLength(0);
  });

  it('needs exactly one channel key per messageFlow item', async () => {
    const client = makeClient(new MockServer());
    const both = { sms: { from: '1', text: 'x' }, mms: { from: '1', text: 'x' } };
    await expect(
      client.send.request({ destinations: [{ to: '01000000000' }], messageFlow: [both as never] }),
    ).rejects.toThrow(/정확히 하나/);
    await expect(client.send.omni({ to: '01000000000', messages: [{} as never] })).rejects.toThrow(/정확히 하나/);
    await expect(client.send.omni({ to: '01000000000', messages: [] })).rejects.toThrow(/messages: 비어 있습니다/);
  });

  it('never echoes input values in validation errors', async () => {
    const client = makeClient(new MockServer());
    const error = (await rejection(
      client.send.sms({ to: '01000001234', from: '01000000000', text: '비밀 문구 😀' }),
    )) as ValidationError;
    expect(error.message).not.toContain('01000001234');
    expect(error.message).not.toContain('비밀');
    expect(JSON.stringify(error.issues)).not.toContain('😀');
  });
});

describe('retries', () => {
  it('does not retry a send without idempotency key after a timeout', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH, timeoutError());
    const error = await rejection(makeClient(server).send.sms({ to: '01000000000', from: '01000000000', text: 'x' }));
    expect(error).toBeInstanceOf(APIConnectionError);
    expect(error.name).toBe('APITimeoutError');
    expect(route.calls).toHaveLength(1);
  });

  it('does not retry a send without idempotency key after a 5xx', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH, { status: 503, json: envelope(undefined, { code: 'A920' }) });
    await expect(makeClient(server).send.sms({ to: '01000000000', from: '01000000000', text: 'x' })).rejects.toThrow(
      /HTTP 503/,
    );
    expect(route.calls).toHaveLength(1);
  });

  it('retries a send with idempotency key after a timeout', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH, timeoutError(), { json: accepted('A000') });
    const result = await makeClient(server).send.sms({
      to: '01000000000',
      from: '01000000000',
      text: 'x',
      idempotencyKey: 'k-1',
    });
    expect(route.calls).toHaveLength(2);
    expect(result.msgKeys).toEqual(['KEY000']);
    expect(delays).toHaveLength(1);
    expect(delays[0]).toBeGreaterThanOrEqual(375);
    expect(delays[0]).toBeLessThanOrEqual(625);
  });

  it('explains a duplicate after a lost response', async () => {
    const server = new MockServer();
    server.on('POST', PATH, timeoutError(), { json: envelope(undefined, { code: 'A301' }) });
    const error = await rejection(
      makeClient(server).send.sms({ to: '01000000000', from: '01000000000', text: 'x', idempotencyKey: 'k-1' }),
    );
    expect(error).toBeInstanceOf(DuplicateRequestError);
    expect(error.message).toMatch(/이미 접수/);
  });

  it('retries rate limits using Retry-After', async () => {
    const server = new MockServer();
    const limited = {
      status: 429,
      headers: { 'Retry-After': '2' },
      json: { common: { authCode: 'A020', authResult: 'Ratelimit' } },
    };
    const route = server.on('POST', PATH, limited, { json: accepted('A000') });
    await makeClient(server).send.sms({ to: '01000000000', from: '01000000000', text: 'x' });
    expect(route.calls).toHaveLength(2);
    expect(delays).toEqual([2000]);
  });

  it('caps Retry-After at 60 seconds', async () => {
    const server = new MockServer();
    server.on('POST', PATH, { status: 429, headers: { 'Retry-After': '3600' }, json: {} }, { json: accepted('A000') });
    await makeClient(server).send.sms({ to: '01000000000', from: '01000000000', text: 'x' });
    expect(delays).toEqual([60000]);
  });

  it('gives up after maxRetries on rate limits', async () => {
    const server = new MockServer();
    const route = server.on('POST', PATH, {
      status: 429,
      headers: { 'Retry-After': '1' },
      json: { data: { code: 'A020', result: "Number of 'Ratelimit' exceeded" } },
    });
    const error = await rejection(makeClient(server).send.sms({ to: '01000000000', from: '01000000000', text: 'x' }));
    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfter).toBe(1);
    expect(route.calls).toHaveLength(3); // 1 + maxRetries(2)
  });

  it('uses exponential backoff with jitter when there is no Retry-After', async () => {
    const server = new MockServer();
    server.on('GET', '/api/comm/v1/message/statistics', { status: 500, text: 'oops' });
    await expect(
      makeClient(server, { maxRetries: 4 }).messages.statistics({ startDate: '20260101' }),
    ).rejects.toThrow();
    expect(delays).toHaveLength(4);
    [500, 1000, 2000, 4000].forEach((base, i) => {
      expect(delays[i]).toBeGreaterThanOrEqual(base * 0.75);
      expect(delays[i]).toBeLessThanOrEqual(base * 1.25);
    });
  });
});
