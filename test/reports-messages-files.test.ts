import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ValidationError } from '../src/index.js';
import { envelope, MockServer, makeClient } from './helpers.js';

const REPORT = { msgKey: 'KEY001', serviceType: 'SMS', msgType: 'SM', reportCode: '10000', reportType: '0' };

describe('reports', () => {
  it('acks each batch after the handler finished', async () => {
    const server = new MockServer();
    server.on(
      'GET',
      '/api/comm/v1/report/polling',
      { json: envelope({ reportId: 'R1', report: [REPORT, REPORT] }) },
      { json: envelope({ reportId: '', report: null }) },
    );
    const ack = server.on('DELETE', '/api/comm/v1/report/polling/R1', { json: envelope() });
    const seen: string[] = [];
    const handled = await makeClient(server).reports.consume(async (reports) => {
      seen.push(...reports.map((r) => r.msgKey ?? ''));
    });
    expect(handled).toBe(2);
    expect(seen).toEqual(['KEY001', 'KEY001']);
    expect(ack.calls).toHaveLength(1);
  });

  it('does not ack when the handler throws', async () => {
    const server = new MockServer();
    server.on('GET', '/api/comm/v1/report/polling', { json: envelope({ reportId: 'R1', report: [REPORT] }) });
    const ack = server.on('DELETE', '/api/comm/v1/report/polling/R1');
    await expect(
      makeClient(server).reports.consume(() => {
        throw new Error('db down');
      }),
    ).rejects.toThrow('db down');
    expect(ack.calls).toHaveLength(0);
  });

  it('stops after maxBatches', async () => {
    const server = new MockServer();
    const poll = server.on('GET', '/api/comm/v1/report/polling', {
      json: envelope({ reportId: 'R1', report: [REPORT] }),
    });
    server.on('DELETE', '/api/comm/v1/report/polling/R1');
    expect(await makeClient(server).reports.consume(() => {}, { maxBatches: 2 })).toBe(2);
    expect(poll.calls).toHaveLength(2);
  });

  it('returns an empty batch when there is nothing new', async () => {
    const server = new MockServer();
    server.on('GET', '/api/comm/v1/report/polling', { json: envelope({ reportId: '', report: null }) });
    const batch = await makeClient(server).reports.poll();
    expect(batch.empty).toBe(true);
    expect(batch.reportId).toBe('');
  });

  it('escapes path parameters', async () => {
    const server = new MockServer();
    server.on('GET', /\/report\/inquiry\//, { json: envelope({ report: [REPORT] }) });
    const reports = await makeClient(server).reports.inquiry('a/b?c#d');
    expect(reports).toHaveLength(1);
    expect(server.calls[0]?.url.pathname).toBe('/api/comm/v1/report/inquiry/a%2Fb%3Fc%23d');
    expect(server.calls[0]?.url.search).toBe('');
  });

  it.each(['', '.', '..'])('rejects the path segment %j', async (value) => {
    const server = new MockServer();
    const client = makeClient(server);
    await expect(client.reports.inquiry(value)).rejects.toBeInstanceOf(ValidationError);
    await expect(client.reports.ack(value)).rejects.toBeInstanceOf(ValidationError);
    await expect(client.messages.status(value)).rejects.toBeInstanceOf(ValidationError);
    expect(server.calls).toHaveLength(0);
  });
});

describe('messages', () => {
  it('follows lastSeq across pages', async () => {
    const server = new MockServer();
    const msg = { msgKey: 'K', serviceType: 'SMS' };
    const route = server.on(
      'GET',
      '/api/comm/v1/message/history',
      { json: envelope({ messages: [msg, msg], lastSeq: 10, hasNext: true }) },
      { json: envelope({ messages: [msg], lastSeq: 11, hasNext: false }) },
    );
    const items = [];
    for await (const item of makeClient(server).messages.iterHistory({
      requestTime: new Date('2026-09-23T00:00:00Z'),
      serviceType: ['SMS', 'RCS'],
      limit: 2,
    })) {
      items.push(item);
    }
    expect(items).toHaveLength(3);
    const [first, second] = route.calls.map((call) => call.url.searchParams);
    expect(first?.get('requestTime')).toBe('2026-09-23T09:00:00'); // converted to KST
    expect(first?.get('serviceType')).toBe('SMS,RCS');
    expect(first?.get('limit')).toBe('2');
    expect(first?.has('lastSeq')).toBe(false);
    expect(second?.get('lastSeq')).toBe('10');
  });

  it('stops if the cursor does not move or is missing', async () => {
    const server = new MockServer();
    const route = server.on('GET', '/api/comm/v1/message/history', {
      json: envelope({ messages: [{ msgKey: 'K' }], lastSeq: 5, hasNext: true }),
    });
    const items = [];
    for await (const item of makeClient(server).messages.iterHistory({ requestTime: '2026-09-23T09:00:00' })) {
      items.push(item);
    }
    expect(items).toHaveLength(2);
    expect(route.calls).toHaveLength(2);

    server.on('GET', '/api/comm/v1/message/history', {
      json: envelope({ messages: [{ msgKey: 'K' }], hasNext: true }),
    });
    const more = [];
    for await (const item of makeClient(server).messages.iterHistory({ requestTime: '2026-09-23T09:00:00' })) {
      more.push(item);
    }
    expect(more).toHaveLength(1);
  });

  it('iterates MO history', async () => {
    const server = new MockServer();
    server.on(
      'GET',
      '/api/comm/v1/message/history/mo',
      { json: envelope({ messages: [{ msgKey: 'M1' }], lastSeq: 1, hasNext: true }) },
      { json: envelope({ messages: [{ msgKey: 'M2' }], lastSeq: 2, hasNext: false }) },
    );
    const keys = [];
    for await (const mo of makeClient(server).messages.iterMoHistory({ occurredTime: '2026-04-23T14:11:01+09:00' })) {
      keys.push(mo.msgKey);
    }
    expect(keys).toEqual(['M1', 'M2']);
  });

  it('sends MO occurredTime with the KST offset', async () => {
    const server = new MockServer();
    const route = server.on('GET', '/api/comm/v1/message/history/mo', {
      json: envelope({ messages: [], hasNext: false }),
    });
    const page = await makeClient(server).messages.moHistory({
      occurredTime: new Date('2026-04-23T05:11:01Z'),
      from: '01000001234',
    });
    expect(route.calls[0]?.url.searchParams.get('occurredTime')).toBe('2026-04-23T14:11:01+09:00');
    expect(route.calls[0]?.url.searchParams.get('from')).toBe('01000001234');
    expect(page).toEqual({ messages: [], lastSeq: undefined, hasNext: false });
  });

  it('checks the limit range', async () => {
    const client = makeClient(new MockServer());
    await expect(client.messages.history({ requestTime: '2026-09-23T09:00:00', limit: 1001 })).rejects.toThrow(
      /1~1000/,
    );
    await expect(client.messages.moHistory({ occurredTime: '2026-09-23T09:00:00+09:00', limit: 0 })).rejects.toThrow(
      /1~1000/,
    );
    await expect(client.messages.history({ requestTime: new Date('invalid') })).rejects.toThrow(/Date/);
  });

  it('formats statistics dates in KST', async () => {
    const server = new MockServer();
    const route = server.on('GET', '/api/comm/v1/message/statistics', {
      json: envelope({ statistics: [{ statDate: '20260923', recvTotalCnt: 3 }] }),
    });
    const stats = await makeClient(server).messages.statistics({
      startDate: new Date('2026-08-31T15:00:00Z'), // 2026-09-01 00:00 KST
      endDate: '20260923',
      serviceType: 'SMS',
    });
    expect(stats[0]?.recvTotalCnt).toBe(3);
    expect(Object.fromEntries(route.calls[0]?.url.searchParams ?? [])).toEqual({
      startDate: '20260901',
      endDate: '20260923',
      serviceType: 'SMS',
    });
  });

  it('keeps unknown response fields', async () => {
    const server = new MockServer();
    server.on('GET', '/api/comm/v1/message/inquiry/msgKey/K', {
      json: envelope({ messages: [{ msgKey: 'K', newServerField: 'v' }] }),
    });
    const [status] = await makeClient(server).messages.status('K');
    expect(status?.newServerField).toBe('v');
  });

  it('looks up by request id and MO key', async () => {
    const server = new MockServer();
    server.on('GET', '/api/comm/v1/message/inquiry/requestId/REQ', { json: envelope({ messages: [{ msgKey: 'K' }] }) });
    server.on('GET', '/api/comm/v1/message/inquiry/mo/msgKey/MO1', {
      json: envelope({ messages: [{ msgKey: 'MO1' }] }),
    });
    const client = makeClient(server);
    expect(await client.messages.statusByRequestId('REQ')).toHaveLength(1);
    expect((await client.messages.mo('MO1'))[0]?.msgKey).toBe('MO1');
  });
});

describe('files', () => {
  it('uploads multipart with a typed file part and no hand-made Content-Type', async () => {
    const server = new MockServer();
    const route = server.on('POST', '/api/comm/v1/file/mms', {
      json: envelope({ fileKey: 'FILE_KEY_001', expired: '2027-04-24T10:45:24+09:00' }),
    });
    const result = await makeClient(server).files.uploadMms(Buffer.from([0xff, 0xd8, 0x6a]), {
      filename: 'a.jpg',
      imageName: 'banner',
    });
    const call = route.calls[0];
    expect(call?.init.headers).not.toHaveProperty('Content-Type');
    expect(call?.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/);
    expect(call?.text).toContain('name="file"; filename="a.jpg"');
    expect(call?.text).toContain('Content-Type: image/jpeg');
    expect(call?.text).toContain('name="imageName"');
    expect(call?.text).not.toContain('name="fileKey"');
    expect(result.fileKey).toBe('FILE_KEY_001');
  });

  it('checks the MMS size limit before sending', async () => {
    const server = new MockServer();
    const route = server.on('POST', '/api/comm/v1/file/mms');
    await expect(
      makeClient(server).files.uploadMms(new Uint8Array(300 * 1024 + 1), { filename: 'a.jpg' }),
    ).rejects.toThrow(/300KB/);
    expect(route.calls).toHaveLength(0);
  });

  it('reads a file path once and reuses it on retry', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'bizgo-test-'));
    try {
      const path = join(dir, 'card.png');
      await writeFile(path, Buffer.from('png-bytes'));
      const server = new MockServer();
      const route = server.on(
        'POST',
        '/api/comm/v1/file/rcs',
        { status: 429, json: {} },
        { json: envelope({ media: 'maapfile://MEDIA_KEY_EXAMPLE' }) },
      );
      const result = await makeClient(server).files.uploadRcs(path, { fileKey: 'my-key' });
      expect(result.media).toBe('maapfile://MEDIA_KEY_EXAMPLE');
      expect(route.calls).toHaveLength(2);
      for (const call of route.calls) {
        expect(call.text).toContain('filename="card.png"');
        expect(call.text).toContain('Content-Type: image/png');
        expect(call.text).toContain('png-bytes');
        expect(call.text).toContain('name="fileKey"');
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('retries uploads only on 429', async () => {
    const server = new MockServer();
    const route = server.on('POST', '/api/comm/v1/file/rcs', { status: 503, text: 'x' });
    await expect(makeClient(server).files.uploadRcs(new Uint8Array([1]))).rejects.toThrow(/HTTP 503/);
    expect(route.calls).toHaveLength(1);
  });

  it('accepts a Blob and uses the brand message kind path', async () => {
    const server = new MockServer();
    const route = server.on('POST', '/api/comm/v1/file/brandmessage/wideItemList/first', {
      json: envelope({ imgUrl: 'https://example.com/img.jpg' }),
    });
    const client = makeClient(server);
    const result = await client.files.uploadBrandMessage(new Blob(['img']), {
      filename: 'a.png',
      kind: 'wideItemList/first',
    });
    expect(result.imgUrl).toBe('https://example.com/img.jpg');
    expect(route.calls[0]?.text).toContain('filename="a.png"');
    server.on('POST', '/api/comm/v1/file/brandmessage/default', { json: envelope({ imgUrl: 'u' }) });
    expect((await client.files.uploadBrandMessage(new Uint8Array([1]))).imgUrl).toBe('u');
    await expect(client.files.uploadBrandMessage(new Uint8Array([1]), { kind: '../etc' as never })).rejects.toThrow(
      ValidationError,
    );
    await expect(client.files.uploadMms(123 as never)).rejects.toThrow(ValidationError);
    await expect(client.files.uploadMms(new Uint8Array([1]), { kind: 'wide' } as never)).rejects.toThrow(
      /알 수 없는 옵션/,
    );
  });
});
