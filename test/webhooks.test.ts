import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ack,
  ConfigurationError,
  parseMo,
  parseReport,
  verifySignature,
  WebhookReceiver,
  WebhookVerificationError,
} from '../src/index.js';
import * as webhooksEntry from '../src/webhooks.js';

const SECRET = 'test-webhook-secret';
const NOW_MS = 1743381600000;
const TIMESTAMP = '1743381600000'; // epoch ms, as in the API reference example
const BODY = JSON.stringify({
  msgKey: 'KEY001',
  serviceType: 'SMS',
  reportTime: 't',
  reportType: '0',
  reportCode: '10000',
});

function sign(timestamp = TIMESTAMP, secret = SECRET): Buffer {
  return createHmac('sha256', secret).update(timestamp).digest();
}

describe('verifySignature', () => {
  it.each([
    ['hex', (d: Buffer) => d.toString('hex')],
    ['upper-case hex', (d: Buffer) => d.toString('hex').toUpperCase()],
    ['base64', (d: Buffer) => d.toString('base64')],
  ])('accepts %s', (_name, encode) => {
    expect(() =>
      verifySignature({ secret: SECRET, timestamp: TIMESTAMP, signature: encode(sign()), now: NOW_MS }),
    ).not.toThrow();
  });

  it.each([
    ['sha256= prefix', (d: Buffer) => `sha256=${d.toString('hex')}`],
    ['SHA256= prefix with base64', (d: Buffer) => `SHA256=${d.toString('base64')}`],
  ])('rejects a %s', (_name, encode) => {
    expect(() =>
      verifySignature({ secret: SECRET, timestamp: TIMESTAMP, signature: encode(sign()), now: NOW_MS }),
    ).toThrow(/일치하지/);
  });

  it('rejects a wrong secret', () => {
    expect(() =>
      verifySignature({
        secret: SECRET,
        timestamp: TIMESTAMP,
        signature: sign(TIMESTAMP, 'other').toString('hex'),
        now: NOW_MS,
      }),
    ).toThrow(/일치하지/);
  });

  it('rejects signatures of the wrong length without throwing a RangeError', () => {
    expect(() => verifySignature({ secret: SECRET, timestamp: TIMESTAMP, signature: 'abc', now: NOW_MS })).toThrow(
      WebhookVerificationError,
    );
    const long = `${sign().toString('hex')}00`;
    expect(() => verifySignature({ secret: SECRET, timestamp: TIMESTAMP, signature: long, now: NOW_MS })).toThrow(
      WebhookVerificationError,
    );
  });

  it('rejects an old or future timestamp to limit replay', () => {
    const signature = sign().toString('hex');
    expect(() => verifySignature({ secret: SECRET, timestamp: TIMESTAMP, signature, now: NOW_MS + 301_000 })).toThrow(
      /허용 범위/,
    );
    expect(() => verifySignature({ secret: SECRET, timestamp: TIMESTAMP, signature, now: NOW_MS - 301_000 })).toThrow(
      /허용 범위/,
    );
    expect(() =>
      verifySignature({ secret: SECRET, timestamp: TIMESTAMP, signature, now: new Date(NOW_MS + 299_000) }),
    ).not.toThrow();
    expect(() =>
      verifySignature({ secret: SECRET, timestamp: TIMESTAMP, signature, now: NOW_MS + 10_000_000, tolerance: null }),
    ).not.toThrow();
  });

  it('accepts a timestamp in seconds', () => {
    const signature = sign('1743381600').toString('hex');
    expect(() => verifySignature({ secret: SECRET, timestamp: '1743381600', signature, now: NOW_MS })).not.toThrow();
  });

  it.each([
    ['', 'x'],
    ['abc', 'x'],
    ['-1', 'x'],
    [TIMESTAMP, ''],
  ])('rejects missing or malformed headers (%j, %j)', (timestamp, signature) => {
    expect(() => verifySignature({ secret: SECRET, timestamp, signature, now: NOW_MS })).toThrow(
      WebhookVerificationError,
    );
  });

  it('rejects an empty secret', () => {
    expect(() => verifySignature({ secret: '', timestamp: TIMESTAMP, signature: 'x', now: NOW_MS })).toThrow(
      WebhookVerificationError,
    );
    expect(() => new WebhookReceiver('')).toThrow(ConfigurationError);
  });
});

describe('WebhookReceiver', () => {
  it('verifies, then parses (header names are case-insensitive)', () => {
    const receiver = new WebhookReceiver(SECRET, { tolerance: null });
    const headers = { 'x-ib-timestamp': TIMESTAMP, 'X-IB-SIGNATURE': sign().toString('hex') };
    const report = receiver.report(headers, BODY);
    expect(report.msgKey).toBe('KEY001');
    expect(receiver.ack(report.msgKey)).toEqual({ msgKey: 'KEY001' });
    expect(String(receiver)).not.toContain(SECRET);
  });

  it('accepts Headers objects, Node header arrays and Buffers', () => {
    const receiver = new WebhookReceiver(Buffer.from(SECRET), { tolerance: null });
    const signature = sign().toString('base64');
    expect(
      receiver.report(new Headers({ 'X-IB-Timestamp': TIMESTAMP, 'X-IB-Signature': signature }), Buffer.from(BODY))
        .msgKey,
    ).toBe('KEY001');
    expect(receiver.report({ 'x-ib-timestamp': [TIMESTAMP], 'x-ib-signature': [signature] }, BODY).msgKey).toBe(
      'KEY001',
    );
    expect(
      receiver.report(
        [
          ['X-IB-Timestamp', TIMESTAMP],
          ['X-IB-Signature', signature],
        ],
        JSON.parse(BODY),
      ).msgKey,
    ).toBe('KEY001');
  });

  it('rejects an unsigned request', () => {
    expect(() => new WebhookReceiver(SECRET).report({}, BODY)).toThrow(WebhookVerificationError);
  });

  it('applies the default 300 second tolerance', () => {
    const receiver = new WebhookReceiver(SECRET);
    const headers = { 'X-IB-Timestamp': TIMESTAMP, 'X-IB-Signature': sign().toString('hex') };
    expect(() => receiver.report(headers, BODY)).toThrow(/허용 범위/); // the timestamp is from 2025
  });

  it('parses MO payloads and rejects invalid bodies', () => {
    const mo = parseMo({
      msgKey: 'K',
      serviceType: 'MO',
      msgType: 'SM',
      to: '#000000',
      from: '01000000000',
      carrier: '10001',
      originator: '01000000000',
      content: '투표 1',
      occurredTime: 't',
    });
    expect(mo.from).toBe('01000000000');
    expect(() => parseMo('not json')).toThrow(/JSON이 아닙니다/);
    expect(() => parseReport('[1]')).toThrow(/JSON 객체가 아닙니다/);
    expect(() => parseReport('x'.repeat(1024 * 1024 + 1))).toThrow(/너무 큽니다/);
    expect(() => parseReport({ serviceType: 'SMS' })).toThrow(/msgKey: 필수 필드입니다/);
  });

  it('keeps unknown payload fields', () => {
    const report = parseReport({ ...JSON.parse(BODY), newField: 1 });
    expect(report.newField).toBe(1);
  });

  it('builds the ack body', () => {
    expect(ack('K')).toEqual({ msgKey: 'K' });
  });

  it('is exposed from the webhooks entry', () => {
    expect(webhooksEntry.WebhookReceiver).toBe(WebhookReceiver);
    expect(webhooksEntry.verifySignature).toBe(verifySignature);
  });
});
