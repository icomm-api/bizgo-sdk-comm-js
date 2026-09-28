/** Behaviour of the methods generated from the spec (src/operation.ts). */
import { describe, expect, it } from 'vitest';
import { ValidationError } from '../src/index.js';
import { envelope, MockServer, makeClient } from './helpers.js';

const PHONE = '01000001234';

function server(json: unknown = envelope({})) {
  const s = new MockServer();
  s.on('GET', /.*/, { json });
  s.on('POST', /.*/, { json });
  s.on('PUT', /.*/, { json });
  s.on('DELETE', /.*/, { json });
  return s;
}

describe('generated methods', () => {
  it('encode path values and reject dot segments', async () => {
    const s = server();
    const client = makeClient(s);
    await client.reservations.recipients.delete({ resvKey: 'RESV/1?x', msgKey: 'MSG#1' });
    expect(s.calls[0]?.url.pathname).toBe('/api/comm/v1/reservation/resvKey/RESV%2F1%3Fx/destinations/msgKey/MSG%231');
    await expect(client.reservations.get({ resvKey: '..' })).rejects.toBeInstanceOf(ValidationError);
    await expect(client.reservations.get({} as never)).rejects.toThrow(/resvKey/);
    expect(s.calls).toHaveLength(1);
  });

  it('return undefined for operations without data', async () => {
    const client = makeClient(server());
    await expect(
      client.alimtalk.templates.delete({ senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE' }),
    ).resolves.toBeUndefined();
  });

  it('return the x-sdk-result part of the response', async () => {
    const profile = { senderKey: 'SENDER_KEY_EXAMPLE', uuid: '@example' };
    const client = makeClient(server(envelope({ kakao: { senderProfile: profile } })));
    await expect(client.kakao.senders.get({ senderKey: 'SENDER_KEY_EXAMPLE' })).resolves.toEqual(profile);
    // account paths return data.kakao without data.data (x-sdk-result: data.kakao.senderProfile)
    const account = { common: { authCode: 'A000' }, data: { code: 'A000', kakao: { senderProfile: profile } } };
    await expect(makeClient(server(account)).kakao.senders.find({ senderKey: 'SENDER_KEY_EXAMPLE' })).resolves.toEqual(
      profile,
    );
  });

  it('return resvKey next to the per-recipient results for createReservation (x-sdk-result: data)', async () => {
    const body = {
      common: { authCode: 'A000' },
      data: { code: 'A000', result: 'Success', resvKey: 'RESV_KEY_EXAMPLE', data: { destinations: [] } },
    };
    const reservation = await makeClient(server(body)).reservations.create({
      body: {
        resvSendTime: '2026-10-01T09:00:00',
        destinations: [{ to: PHONE }],
        messageFlow: [{ sms: { from: PHONE, text: 'hello' } }],
      } as never,
    });
    expect(reservation.resvKey).toBe('RESV_KEY_EXAMPLE');
    expect(reservation.data).toEqual({ destinations: [] });
  });

  it('send array query params comma-separated and convert Date to the KST date', async () => {
    const s = server();
    await makeClient(s).insights.alimtalk.get({
      startDate: new Date('2026-01-31T16:00:00Z'), // 2026-02-01 01:00 KST
      endDate: '20260210',
      senderKey: ['SENDER_KEY_A', 'SENDER_KEY_B'],
      templateCode: 'TEMPLATE_CODE',
    });
    const query = s.calls[0]?.url.searchParams;
    expect(query?.get('startDate')).toBe('20260201');
    expect(query?.get('senderKey')).toBe('SENDER_KEY_A,SENDER_KEY_B');
    expect(query?.get('templateCode')).toBe('TEMPLATE_CODE');
  });

  it('validate query params: required, type, enum, unknown option', async () => {
    const s = server();
    const client = makeClient(s);
    await expect(client.alimtalk.templates.list({} as never)).rejects.toThrow(/senderKey: 필수/);
    await expect(client.alimtalk.templates.list({ senderKey: 'S', limit: 'x' as never })).rejects.toThrow(/limit/);
    await expect(client.alimtalk.templates.list({ senderKey: 'S', senderKeyType: 'X' as never })).rejects.toThrow(
      /허용된 값이 아닙니다/,
    );
    await expect(client.alimtalk.templates.list({ senderKey: 'S', sender_key: 'S' } as never)).rejects.toThrow(
      /알 수 없는 옵션/,
    );
    expect(s.calls).toHaveLength(0);
  });

  it('validate JSON bodies against the spec (unknown fields, required fields) without echoing values', async () => {
    const s = server();
    const client = makeClient(s);
    const error = await client.counsel.messages
      .sendPlain({ body: { senderKey: 'SENDER_KEY_EXAMPLE', userKey: PHONE, unknownField: PHONE } as never })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).issues.map((i) => i.path)).toContain('unknownField');
    expect(String(error)).not.toContain(PHONE);
    await expect(client.alimtalk.templates.create({} as never)).rejects.toThrow(/body/);
    expect(s.calls).toHaveLength(0);
  });

  it('send header params as headers, never in the query, and reject CR/LF', async () => {
    const s = server({ common: { authCode: 'A000' }, data: { code: 'A000', kakao: { senderProfile: {} } } });
    const client = makeClient(s);
    await client.kakao.senders.create({
      token: 'CHANNEL_TOKEN_EXAMPLE',
      phoneNumber: PHONE,
      body: { yellowId: '@example', categoryCode: '00100010001' },
    });
    const call = s.calls[0];
    expect(call?.headers.get('token')).toBe('CHANNEL_TOKEN_EXAMPLE');
    expect(call?.headers.get('phoneNumber')).toBe(PHONE);
    expect(call?.url.search).toBe('');
    expect(call?.json()).toEqual({ yellowId: '@example', categoryCode: '00100010001' });
    await expect(
      client.kakao.senders.create({
        token: 'x\r\nAuthorization: evil',
        phoneNumber: PHONE,
        body: { yellowId: '@example', categoryCode: '00100010001' },
      }),
    ).rejects.toThrow(/헤더에 쓸 수 없는 문자/);
    expect(s.calls).toHaveLength(1);
  });

  it('build multipart bodies: files once, JSON parts, text fields', async () => {
    const s = server();
    await makeClient(s).rcs.brands.update({
      body: {
        brandId: 'BRAND_ID_EXAMPLE',
        regBrand: { brandId: 'BRAND_ID_EXAMPLE', name: 'Example' },
        brandProfile: { data: new Uint8Array([1, 2, 3]), filename: 'profile.png' },
      } as never,
    });
    const text = s.calls[0]?.text ?? '';
    expect(s.calls[0]?.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/);
    expect(text).toContain('name="brandId"');
    expect(text).toMatch(/name="regBrand"[\s\S]*application\/json[\s\S]*"name":"Example"/);
    expect(text).toMatch(/name="brandProfile"; filename="profile.png"\r\nContent-Type: image\/png/);
  });

  it('pick JSON or multipart for operations that accept both', async () => {
    const s = server();
    const client = makeClient(s);
    const fields = { senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE' };
    await client.alimtalk.templates.requestInspection({ body: { alimtalk: fields } });
    expect(s.calls[0]?.headers.get('content-type')).toBe('application/json');
    expect(s.calls[0]?.json()).toEqual({ alimtalk: fields });
    await client.alimtalk.templates.requestInspection({
      body: {
        ...fields,
        comment: '검수 요청',
        attachment: [new Uint8Array([1]), { data: new Uint8Array([2]), filename: 'b.pdf' }],
      },
    });
    expect(s.calls[1]?.headers.get('content-type')).toMatch(/^multipart\/form-data/);
    expect(s.calls[1]?.text.match(/name="attachment"/g)).toHaveLength(2);
  });

  it('reject invalid files before sending', async () => {
    const s = server();
    const client = makeClient(s);
    await expect(client.files.uploadAlimtalkTemplateImage({ body: { file: 42 as never } })).rejects.toThrow(
      /file: 파일 경로/,
    );
    await expect(client.files.uploadAlimtalkTemplateImage({} as never)).rejects.toThrow(/body/);
    expect(s.calls).toHaveLength(0);
  });

  it('keep the hand-written P0 methods (they win on name clashes)', () => {
    const client = makeClient(server());
    expect(client.files.uploadMms.length).toBe(2); // (file, options) — not the generated ({ body }) form
    expect(typeof client.files.uploadBrandMessage).toBe('function');
    expect(typeof client.files.uploadBrandMessageWide).toBe('function'); // generated alongside
    expect(typeof client.send.bulk).toBe('function');
  });
});
