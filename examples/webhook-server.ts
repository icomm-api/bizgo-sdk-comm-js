/**
 * Receive delivery report webhooks with node:http.
 *
 * Production checklist:
 * - serve over HTTPS and allow only the Bizgo webhook source IPs (see the API overview page)
 * - answer within 5 seconds; do slow work asynchronously
 * - deduplicate by msgKey (Bizgo retries up to 3 times)
 */
import { createServer, type IncomingHttpHeaders } from 'node:http';
import { MAX_BODY_BYTES, WebhookReceiver, WebhookVerificationError } from '@bizgo/bizgo-sdk-comm-js/webhooks';
import { env, isMain } from './_env.ts';

const seen = new Set<string>(); // stand-in for a persistent dedup store

/** Returns [HTTP status, JSON body]. Framework-independent so it is easy to test and reuse. */
export function handle(
  receiver: WebhookReceiver,
  headers: IncomingHttpHeaders | Record<string, string>,
  body: Uint8Array | string,
): [number, Record<string, unknown>] {
  let report: ReturnType<WebhookReceiver['report']>;
  try {
    report = receiver.report(headers, body);
  } catch (error) {
    if (error instanceof WebhookVerificationError) return [401, {}];
    throw error;
  }
  if (!seen.has(report.msgKey)) {
    seen.add(report.msgKey);
    // enqueue the report for processing here
  }
  return [200, receiver.ack(report.msgKey)];
}

if (isMain(import.meta.url)) {
  const receiver = new WebhookReceiver(env('BIZGO_WEBHOOK_SECRET'));
  createServer((req, res) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) req.destroy();
      else chunks.push(chunk);
    });
    req.on('end', () => {
      const [status, payload] = handle(receiver, req.headers, Buffer.concat(chunks));
      res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(payload));
    });
    // no access log: request lines and bodies can contain phone numbers
  }).listen(8080, '127.0.0.1'); // put a TLS reverse proxy in front
}
