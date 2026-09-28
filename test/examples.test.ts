/** Run every example against the mock server so the examples never drift from the SDK. */
import { createHmac } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { WebhookReceiver } from '../src/index.js';
import { envelope, MockServer, makeClient } from './helpers.js';

const ACCEPTED = envelope({ destinations: [{ to: '01000000000', msgKey: 'K001', code: 'A000', result: 'Success' }] });

function quiet(): void {
  vi.spyOn(console, 'log').mockImplementation(() => {});
}

describe('examples', () => {
  it('send-sms', async () => {
    quiet();
    const server = new MockServer();
    const route = server.on('POST', '/api/comm/v1/send/omni', { json: ACCEPTED });
    const { main } = await import('../examples/send-sms.ts');
    await main(makeClient(server), { from: '01000000000', to: '01000000000' });
    expect(route.calls).toHaveLength(1);
  });

  it('send-alimtalk-fallback', async () => {
    quiet();
    const server = new MockServer();
    const route = server.on('POST', '/api/comm/v1/send/omni', { json: ACCEPTED });
    const { main } = await import('../examples/send-alimtalk-fallback.ts');
    await main(makeClient(server), {
      from: '01000000000',
      to: '01000000000',
      senderKey: 'SENDER_KEY_EXAMPLE',
      templateCode: 'TEMPLATE_CODE_EXAMPLE',
    });
    const body = route.calls[0]?.json();
    expect(body.messageFlow.map((item: object) => Object.keys(item)[0])).toEqual(['alimtalk', 'sms']);
    expect(body.idempotencyKey).toMatch(/^order-20260923-0001-[0-9a-f]{16}$/);
    expect(body.idempotencyKey).not.toContain('01000000000');
  });

  it('send-alimtalk-fallback handles a duplicate', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const server = new MockServer();
    server.on('POST', '/api/comm/v1/send/omni', { json: envelope(undefined, { code: 'A301' }) });
    const { main } = await import('../examples/send-alimtalk-fallback.ts');
    await main(makeClient(server), { from: '0', to: '0', senderKey: 'S', templateCode: 'T' });
    expect(log).toHaveBeenCalledWith('이미 발송된 주문입니다.');
  });

  it('send-mms', async () => {
    quiet();
    const server = new MockServer();
    server.on('POST', '/api/comm/v1/file/mms', { json: envelope({ fileKey: 'FILE_KEY_001' }) });
    const route = server.on('POST', '/api/comm/v1/send/omni', { json: ACCEPTED });
    const { main } = await import('../examples/send-mms.ts');
    await main(makeClient(server), { from: '01000000000', to: '01000000000', image: new Uint8Array([0xff, 0xd8]) });
    expect(route.calls[0]?.json().messageFlow[0].mms.fileKey).toEqual(['FILE_KEY_001']);
  });

  it('poll-reports', async () => {
    quiet();
    const server = new MockServer();
    server.on(
      'GET',
      '/api/comm/v1/report/polling',
      { json: envelope({ reportId: 'R1', report: [{ msgKey: 'K001', reportCode: '10000' }] }) },
      { json: envelope({ reportId: '', report: null }) },
    );
    server.on('DELETE', '/api/comm/v1/report/polling/R1', { json: envelope() });
    const module = await import('../examples/poll-reports.ts');
    await module.main(makeClient(server));
    expect(Object.fromEntries(module.store)).toEqual({ K001: 'delivered' });
  });

  it('message-history', async () => {
    quiet();
    const server = new MockServer();
    server.on('GET', '/api/comm/v1/message/history', {
      json: envelope({ messages: [{ msgKey: 'K001', reportCode: '63020' }], hasNext: false }),
    });
    const status = server.on('GET', '/api/comm/v1/message/inquiry/msgKey/K001', {
      json: envelope({ messages: [{ msgKey: 'K001', serviceType: 'ALIMTALK', reportCode: '63020' }] }),
    });
    const { main } = await import('../examples/message-history.ts');
    await main(makeClient(server));
    expect(status.calls).toHaveLength(1);
  });

  it('webhook-server', async () => {
    const { handle } = await import('../examples/webhook-server.ts');
    const receiver = new WebhookReceiver('test-webhook-secret');
    const timestamp = String(Date.now());
    const signature = createHmac('sha256', 'test-webhook-secret').update(timestamp).digest('hex');
    const body = JSON.stringify({
      msgKey: 'K001',
      serviceType: 'SMS',
      reportTime: 't',
      reportType: '0',
      reportCode: '10000',
    });
    const headers = { 'x-ib-timestamp': timestamp, 'x-ib-signature': signature };
    expect(handle(receiver, headers, body)).toEqual([200, { msgKey: 'K001' }]);
    expect(handle(receiver, { ...headers, 'x-ib-signature': '0'.repeat(64) }, body)).toEqual([401, {}]);
  });

  it('concurrent-send', async () => {
    quiet();
    const server = new MockServer();
    const route = server.on('POST', '/api/comm/v1/send/omni', { json: ACCEPTED });
    const { main } = await import('../examples/concurrent-send.ts');
    await main(makeClient(server), { from: '01000000000', groups: [['01000000000'], ['01000001234']] });
    expect(route.calls).toHaveLength(2);
  });
});
