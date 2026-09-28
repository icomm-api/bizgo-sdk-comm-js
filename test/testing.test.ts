/** The `@bizgo/bizgo-sdk-comm-js/testing` subpath, used the way customers use it. */
import {
  APITimeoutError,
  AuthenticationError,
  Bizgo,
  RateLimitError,
  sms,
  WebhookReceiver,
  WebhookVerificationError,
} from '@bizgo/bizgo-sdk-comm-js';
import { FAKE_API_KEY, FakeFetch, signWebhook, successEnvelope } from '@bizgo/bizgo-sdk-comm-js/testing';
import { describe, expect, it } from 'vitest';

const SECRET = 'test-webhook-secret';
const REPORT = {
  msgKey: 'KEY001',
  serviceType: 'SMS',
  msgType: 'SM',
  reportCode: '10000',
  reportType: '0',
  reportTime: '2026-01-01T00:00:00+09:00',
};

function setup() {
  const fake = new FakeFetch();
  return { fake, client: new Bizgo(fake.clientOptions({ maxRetries: 0 })) };
}

describe('FakeFetch', () => {
  it('answers sends with A000 and a fake msgKey per recipient, and records the request', async () => {
    const { fake, client } = setup();
    const result = await client.send.omni({
      to: ['01000000000', '01000001234'],
      messages: [sms({ from: '01000000000', text: 'hello' })],
      ref: 'order-1',
    });
    expect(result.msgKeys).toEqual(['FAKE-MSGKEY-000001', 'FAKE-MSGKEY-000002']);
    expect(result.ref).toBe('order-1');
    const request = fake.lastRequest;
    expect(request).toMatchObject({
      operationId: 'sendOmni',
      operation: 'send.omni',
      method: 'POST',
      path: '/api/comm/v1/send/omni',
      pathTemplate: '/api/comm/v1/send/omni',
    });
    expect((request?.json as { destinations?: unknown[] } | undefined)?.destinations).toHaveLength(2);
    expect(fake.requestsFor('sendOmni')).toHaveLength(1);
  });

  it('never records header values (the API key)', async () => {
    const { fake, client } = setup();
    await client.reports.poll();
    expect(fake.lastRequest?.headerNames).toContain('Authorization');
    expect(JSON.stringify(fake.requests)).not.toContain(FAKE_API_KEY);
    expect(String(fake)).toBe('FakeFetch(requests=1)');
  });

  it('includes resvKey in the default createReservation response', async () => {
    const { client } = setup();
    const reservation = await client.reservations.create({
      body: {
        resvSendTime: '2026-10-01T09:00:00',
        destinations: [{ to: '01000000000' }],
        messageFlow: [{ sms: { from: '01000000000', text: 'hello' } }],
      } as never,
    });
    expect(reservation.resvKey).toBe('FAKE-RESVKEY-000001');
    expect(reservation.data?.destinations?.[0]?.code).toBe('A000');
  });

  it('returns empty lists for other operations by default', async () => {
    const { client } = setup();
    expect(await client.alimtalk.templates.list({ senderKey: 'SENDER_KEY_EXAMPLE' })).toEqual([]);
    const all = [];
    for await (const template of client.alimtalk.templates.iterList({ senderKey: 'SENDER_KEY_EXAMPLE' })) {
      all.push(template);
    }
    expect(all).toEqual([]);
  });

  it('injects errors, per-recipient failures, network errors and timeouts', async () => {
    const { fake, client } = setup();
    const send = () => client.send.sms({ to: ['01000000000', '01000001234'], from: '01000000000', text: 'x' });
    fake.on('sendOmni').fail('service', 200, 'A020').sendResult('A000', 'A306').networkError().timeout();
    await expect(send()).rejects.toBeInstanceOf(RateLimitError);
    const partial = await send();
    expect(partial.failed.map((d) => d.code)).toEqual(['A306']);
    await expect(send()).rejects.toThrow(/연결하지 못했습니다/);
    await expect(send()).rejects.toBeInstanceOf(APITimeoutError);
    await expect(send()).rejects.toBeInstanceOf(APITimeoutError); // the last stub repeats
  });

  it('stubs per-recipient A301 (already accepted with the same idempotency key) as duplicates', async () => {
    const { fake, client } = setup();
    fake.on('sendOmni').sendResult('A000', 'A301');
    const result = await client.send.sms({ to: ['01000000000', '01000001234'], from: '01000000000', text: 'x' });
    expect(result.duplicates.map((d) => d.code)).toEqual(['A301']);
    expect(result.succeeded).toHaveLength(1);
    expect(result.failed).toEqual([]);
  });

  it('stubs by method + path template, with data and gateway errors', async () => {
    const { fake, client } = setup();
    fake
      .on('GET', '/api/comm/v1/report/inquiry/{msgKey}')
      .data({ report: [{ msgKey: 'KEY001' }] })
      .fail('gateway', 401, 'A401');
    expect((await client.reports.inquiry('KEY001'))[0]?.msgKey).toBe('KEY001');
    await expect(client.reports.inquiry('KEY001')).rejects.toBeInstanceOf(AuthenticationError);
    expect(fake.lastRequest?.path).toBe('/api/comm/v1/report/inquiry/KEY001');
    expect(() => fake.on('nope')).toThrow(/unknown operation/);
    fake.reset();
    expect(fake.requests).toHaveLength(0);
    expect(await client.reports.inquiry('KEY001')).toEqual([]);
  });

  it('records query and multipart fields (files by size only)', async () => {
    const { fake, client } = setup();
    await client.insights.alimtalk.get({
      startDate: '20260101',
      endDate: '20260131',
      senderKey: ['SENDER_KEY_A', 'SENDER_KEY_B'],
    });
    expect(fake.lastRequest?.query).toEqual({
      startDate: '20260101',
      endDate: '20260131',
      senderKey: 'SENDER_KEY_A,SENDER_KEY_B',
    });
    await client.files.uploadAlimtalkTemplateImage({ body: { file: new Uint8Array(10), imageName: 'logo' } });
    expect(fake.lastRequest?.form).toEqual({
      file: { filename: 'image.jpg', type: 'image/jpeg', size: 10 },
      imageName: 'logo',
    });
  });

  it('answers unknown paths with 404', async () => {
    const fake = new FakeFetch();
    const response = await fake.fetch('https://sandbox-mars.ibapi.kr/api/unknown', { method: 'GET' });
    expect(response.status).toBe(404);
    expect(successEnvelope({ a: 1 })).toMatchObject({ data: { code: 'A000', data: { a: 1 } } });
  });
});

describe('signWebhook', () => {
  it('produces requests that WebhookReceiver accepts (hex and base64)', () => {
    const receiver = new WebhookReceiver(SECRET);
    for (const encoding of ['hex', 'base64'] as const) {
      const { headers, body } = signWebhook(SECRET, REPORT, { encoding });
      expect(receiver.report(headers, body).msgKey).toBe('KEY001');
    }
  });

  it('uses the given timestamp and fails with a wrong secret', () => {
    const { headers, body } = signWebhook('other-secret', { msgKey: 'KEY001' }, { timestamp: 1700000000000 });
    expect(headers['X-IB-Timestamp']).toBe('1700000000000');
    expect(() => new WebhookReceiver(SECRET, { tolerance: null }).report(headers, body)).toThrow(
      WebhookVerificationError,
    );
  });
});
