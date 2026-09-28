/**
 * `x-sdk-required-if` (bizgo-api-spec AGENTS.md rule 11, SDK-DESIGN.md §4): conditional requirements are read
 * from the spec by the generator (SCHEMAS[...].requiredIf) and checked by src/validation.ts before sending.
 */
import { describe, expect, it } from 'vitest';
import { SCHEMAS } from '../src/generated/schemas.js';
import { alimtalk, brandMessage, rcs, ValidationError } from '../src/index.js';
import type { ObjectRule } from '../src/validation.js';
import { envelope, MockServer, makeClient } from './helpers.js';

const PATH = '/api/comm/v1/send/omni';
const TO = '01000000000';
const SECRET_TEXT = 'SECRET-BODY-TEXT-1234';

function server() {
  const s = new MockServer();
  const route = s.on('POST', PATH, { json: envelope({ destinations: [{ to: TO, msgKey: 'K', code: 'A000' }] }) });
  return { s, route };
}

async function rejection(promise: Promise<unknown>): Promise<ValidationError> {
  const error = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(ValidationError);
  return error as ValidationError;
}

describe('x-sdk-required-if', () => {
  it('is generated from the spec for every schema that declares it', () => {
    const withRules = Object.entries(SCHEMAS)
      .filter(([, rule]) => rule.type === 'object' && (rule as ObjectRule).requiredIf)
      .map(([name]) => name)
      .sort();
    expect(withRules).toEqual([
      'AlimtalkMessage',
      'BrandMessage',
      'BrandMessageButton',
      'CounselPlainMessageRequest',
      'CounselRichMessageRequest',
      'RcsMessage',
    ]);
  });

  it('alimtalk full send without msgType fails before any HTTP call, naming paths only', async () => {
    const { s, route } = server();
    const error = await rejection(
      makeClient(s).send.omni({
        to: TO,
        messages: [alimtalk({ senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE', text: SECRET_TEXT })],
      }),
    );
    expect(route.calls).toHaveLength(0);
    expect(error.issues).toEqual([
      {
        path: 'messageFlow[0].alimtalk.msgType',
        message: 'messageFlow[0].alimtalk.sendType != template일 때 필수입니다',
      },
    ]);
    expect(error.message).not.toContain(SECRET_TEXT);
    expect(error.message).not.toContain(TO);
    expect(error.message).not.toContain('SENDER_KEY_EXAMPLE');
  });

  it('alimtalk full send needs text too', async () => {
    const { s, route } = server();
    const error = await rejection(
      makeClient(s).send.omni({
        to: TO,
        messages: [alimtalk({ senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE' })],
      }),
    );
    expect(route.calls).toHaveLength(0);
    expect(error.issues.map((i) => i.path)).toEqual([
      'messageFlow[0].alimtalk.msgType',
      'messageFlow[0].alimtalk.text',
    ]);
  });

  it('alimtalk full send with msgType and text is sent', async () => {
    const { s, route } = server();
    await makeClient(s).send.omni({
      to: TO,
      messages: [
        alimtalk({ senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE', msgType: 'AT', text: '안내' }),
      ],
    });
    expect(route.calls).toHaveLength(1);
  });

  it('alimtalk sendType=template needs destinations[].replaceWords (checked against the request root)', async () => {
    const { s, route } = server();
    const error = await rejection(
      makeClient(s).send.omni({
        to: [{ to: TO, replaceWords: { name: '홍길동' } }, { to: '01000001234' }],
        messages: [alimtalk({ senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE', sendType: 'template' })],
      }),
    );
    expect(route.calls).toHaveLength(0);
    expect(error.issues).toEqual([
      {
        path: 'destinations[1].replaceWords',
        message: 'messageFlow[0].alimtalk.sendType == template일 때 필수입니다',
      },
    ]);
    expect(error.message).not.toContain('01000001234');
    expect(error.message).not.toContain('홍길동');
  });

  it('alimtalk sendType=template with replaceWords is sent without msgType/text', async () => {
    const { s, route } = server();
    await makeClient(s).send.omni({
      to: [{ to: TO, replaceWords: { name: '홍길동' } }],
      messages: [alimtalk({ senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE', sendType: 'template' })],
    });
    expect(route.calls).toHaveLength(1);
    expect(route.calls[0]?.json().messageFlow[0].alimtalk).toEqual({
      senderKey: 'SENDER_KEY_EXAMPLE',
      templateCode: 'TEMPLATE_CODE',
      sendType: 'template',
    });
  });

  it('applies to raw request bodies (send.request) and to generated operations (reservations.create)', async () => {
    const { s, route } = server();
    const client = makeClient(s);
    const raw = {
      destinations: [{ to: TO }],
      messageFlow: [{ alimtalk: { senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE', text: 'x' } }],
    };
    const error = await rejection(client.send.request(raw as never));
    expect(error.issues.map((i) => i.path)).toEqual(['messageFlow[0].alimtalk.msgType']);
    const reservation = s.on('POST', '/api/comm/v1/reservation', { json: envelope({}) });
    const resv = await rejection(
      client.reservations.create({ body: { ...raw, resvSendTime: '20991231235900' } as never }),
    );
    expect(resv.issues.map((i) => i.path)).toContain('messageFlow[0].alimtalk.msgType');
    expect(reservation.calls).toHaveLength(0);
    expect(route.calls).toHaveLength(0);
  });

  it('brand message button WL needs urlPc and urlMobile; AL needs urlMobile', async () => {
    const { s, route } = server();
    const message = (button: Record<string, unknown>[]) =>
      brandMessage({
        sendType: 'free',
        msgType: 'FT',
        senderKey: 'SENDER_KEY_EXAMPLE',
        text: '안내',
        attachment: { button: button as never },
      });
    const error = await rejection(
      makeClient(s).send.omni({
        to: TO,
        messages: [
          message([
            { type: 'WL', name: '웹', urlMobile: 'https://example.com' },
            { type: 'AL', name: '앱' },
          ]),
        ],
      }),
    );
    expect(route.calls).toHaveLength(0);
    expect(error.issues).toEqual([
      {
        path: 'messageFlow[0].brandmessage.attachment.button[0].urlPc',
        message: 'messageFlow[0].brandmessage.attachment.button[0].type == WL일 때 필수입니다',
      },
      {
        path: 'messageFlow[0].brandmessage.attachment.button[1].urlMobile',
        message: 'messageFlow[0].brandmessage.attachment.button[1].type == AL일 때 필수입니다',
      },
    ]);
    expect(error.message).not.toContain('https://example.com');
    await makeClient(s).send.omni({
      to: TO,
      messages: [message([{ type: 'WL', name: '웹', urlPc: 'https://example.com', urlMobile: 'https://example.com' }])],
    });
    expect(route.calls).toHaveLength(1);
  });

  it('RCS header=1 needs footer', async () => {
    const { s, route } = server();
    const base = { from: TO, formatId: 'FORMAT_ID', brandKey: 'BRAND_KEY', body: { description: '안내' } };
    const error = await rejection(makeClient(s).send.omni({ to: TO, messages: [rcs({ ...base, header: '1' })] }));
    expect(error.issues).toEqual([
      { path: 'messageFlow[0].rcs.footer', message: 'messageFlow[0].rcs.header == 1일 때 필수입니다' },
    ]);
    await makeClient(s).send.omni({ to: TO, messages: [rcs({ ...base, header: '0' })] });
    await makeClient(s).send.omni({ to: TO, messages: [rcs({ ...base, header: '1', footer: '080-000-0000' })] });
    expect(route.calls).toHaveLength(2);
  });

  it('brand message sendType in (basic, free) needs msgType; template needs replaceWords', async () => {
    const { s, route } = server();
    const error = await rejection(
      makeClient(s).send.omni({
        to: TO,
        messages: [
          brandMessage({ sendType: 'free', senderKey: 'SENDER_KEY_EXAMPLE', text: '안내' }),
          brandMessage({
            sendType: 'template',
            senderKey: 'SENDER_KEY_EXAMPLE',
            templateCode: 'TEMPLATE_CODE',
            targeting: 'I',
          }),
        ],
      }),
    );
    expect(route.calls).toHaveLength(0);
    expect(error.issues).toEqual([
      {
        path: 'messageFlow[0].brandmessage.msgType',
        message: 'messageFlow[0].brandmessage.sendType in (basic, free)일 때 필수입니다',
      },
      {
        path: 'destinations[0].replaceWords',
        message: 'messageFlow[1].brandmessage.sendType == template일 때 필수입니다',
      },
    ]);
  });

  it('relative requiredPaths through a missing intermediate object (counsel plain FILE)', async () => {
    const s = new MockServer();
    const route = s.on('POST', '/api/comm/v1/cstalk/plain', { json: envelope({}) });
    const body = { userKey: 'USER_KEY', senderKey: 'SENDER_KEY_EXAMPLE', msgType: 'FILE', message: '파일' } as const;
    const error = await rejection(makeClient(s).counsel.messages.sendPlain({ body }));
    expect(error.issues.map((i) => i.path)).toEqual(['attachment.file.fileName', 'attachment.file.fileSize']);
    expect(error.issues[0]?.message).toBe('msgType == FILE일 때 필수입니다');
    expect(route.calls).toHaveLength(0);
    await makeClient(s).counsel.messages.sendPlain({
      body: { ...body, attachment: { file: { fileUrl: 'https://example.com/f', fileName: 'f.txt', fileSize: '1' } } },
    });
    expect(route.calls).toHaveLength(1);
  });
});
