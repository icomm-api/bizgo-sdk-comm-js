import { describe, expect, it } from 'vitest';
import {
  counselAck,
  MAX_BODY_BYTES,
  parseWebhook,
  WEBHOOKS,
  WebhookReceiver,
  WebhookVerificationError,
} from '../src/index.js';
import { signWebhook, webhookRequest } from '../src/testing.js';
import { sample, spec } from './spec-samples.js';

const SECRET = 'test-webhook-secret';
const COUNSEL = Object.entries(WEBHOOKS)
  .filter(([, w]) => w.ack === 'codeResult')
  .map(([name]) => name as keyof typeof WEBHOOKS);

/** The request example of each webhook in the spec. */
function example(name: string): Record<string, unknown> {
  const item = Object.values(spec.webhooks as Record<string, any>).find((w) => w.post['x-sdk-webhook'] === name);
  return item.post.requestBody.content['application/json'].example ?? {};
}

describe('webhook table', () => {
  it('has a receiver method for every x-sdk-webhook', () => {
    const names = Object.values(spec.webhooks as Record<string, any>).map((w) => w.post['x-sdk-webhook']);
    expect(Object.keys(WEBHOOKS).sort()).toEqual([...names].sort());
    const receiver = new WebhookReceiver(SECRET);
    for (const name of names) expect(typeof (receiver as any)[name]).toBe('function');
  });

  it('requires signatures for report/MO and none for counsel, per the spec header parameters', () => {
    expect(WEBHOOKS.report.signature).toBe('required');
    expect(WEBHOOKS.mo.signature).toBe('required');
    expect(COUNSEL).toHaveLength(7);
    for (const name of COUNSEL) expect(WEBHOOKS[name].signature).toBe('none');
  });
});

describe.each(COUNSEL)('counsel webhook %s', (name) => {
  const payload = example(name);
  const receiver: any = new WebhookReceiver(SECRET);

  it('parses a request without signature headers', () => {
    const { headers, body } = webhookRequest(payload);
    expect(headers).not.toHaveProperty('X-IB-Signature');
    expect(receiver[name](headers, body)).toEqual(payload);
    expect(receiver[name]({}, body)).toEqual(payload);
  });

  it('ignores signature headers if present, even bogus or partial ones', () => {
    const body = JSON.stringify(payload);
    const wrong = signWebhook('other-secret', payload);
    expect(receiver[name](wrong.headers, wrong.body)).toEqual(payload);
    expect(receiver[name]({ 'X-IB-Timestamp': 'not-a-number', 'X-IB-Signature': 'bogus' }, body)).toEqual(payload);
    expect(receiver[name]({ 'X-IB-Signature': 'bogus' }, body)).toEqual(payload);
    const old = signWebhook(SECRET, payload, { timestamp: Date.now() - 3_600_000 });
    expect(receiver[name](old.headers, old.body)).toEqual(payload);
  });

  it('parses without a secret via parseWebhook', () => {
    expect(parseWebhook(name, JSON.stringify(payload))).toEqual(payload);
  });

  it('still enforces the body checks: JSON object, size cap, depth 64, types', () => {
    for (const parse of [(b: string) => receiver[name]({}, b), (b: string) => parseWebhook(name, b)]) {
      expect(() => parse('not json')).toThrow(WebhookVerificationError);
      expect(() => parse('[]')).toThrow(WebhookVerificationError);
      expect(() => parse(`{"x":"${'a'.repeat(MAX_BODY_BYTES)}"}`)).toThrow(/너무 큽니다/);
      expect(() => parse(`${'{"a":'.repeat(65)}1${'}'.repeat(65)}`)).toThrow(/중첩이 너무 깊습니다/);
      expect(() => parse(JSON.stringify({ ...payload, msgKey: 12345 }))).toThrow(/형식이 올바르지 않습니다/);
    }
  });
});

describe('counsel webhooks', () => {
  it('ack with {code, result}', () => {
    expect(counselAck()).toEqual({ code: 'A000', result: 'Success' });
    expect(new WebhookReceiver(SECRET).counselAck()).toEqual({ code: 'A000', result: 'Success' });
  });

  it('do not make report or MO webhooks unsigned', () => {
    const receiver = new WebhookReceiver(SECRET);
    const report = sample(spec.components.schemas.ReportWebhookPayload);
    const mo = sample(spec.components.schemas.MoWebhookPayload);
    for (const headers of [{}, webhookRequest({}).headers, signWebhook('other-secret', {}).headers]) {
      expect(() => receiver.report(headers, report)).toThrow(/X-IB-|서명/);
      expect(() => receiver.mo(headers, mo)).toThrow(/X-IB-|서명/);
    }
    const signed = signWebhook(SECRET, report);
    expect(receiver.report(signed.headers, signed.body)).toEqual(report);
    const signedMo = signWebhook(SECRET, mo);
    expect(receiver.mo(signedMo.headers, signedMo.body)).toEqual(mo);
  });

  it('parseWebhook parses by name without verifying and rejects unknown names', () => {
    expect(parseWebhook('counselMessage', JSON.stringify(example('counselMessage')))).toEqual(
      example('counselMessage'),
    );
    expect(() => parseWebhook('nope' as never, '{}')).toThrow(WebhookVerificationError);
    expect(() => parseWebhook('toString' as never, '{}')).toThrow(WebhookVerificationError);
  });

  it('toString shows the tolerance, never the secret', () => {
    const text = String(new WebhookReceiver(SECRET));
    expect(text).toBe('WebhookReceiver(tolerance=300)');
    expect(text).not.toContain(SECRET);
  });
});
