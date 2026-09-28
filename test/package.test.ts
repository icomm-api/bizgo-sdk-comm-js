import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as sdk from '../src/index.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

describe('package', () => {
  it('keeps VERSION in sync with package.json', () => {
    expect(sdk.VERSION).toBe(pkg.version);
  });

  it('has no runtime dependencies; OpenTelemetry is an optional peer used only by ./otel', () => {
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.license).toBe('Apache-2.0');
    expect(Object.keys(pkg.peerDependencies ?? {})).toEqual(['@opentelemetry/api']);
    expect(pkg.peerDependenciesMeta['@opentelemetry/api'].optional).toBe(true);
    const src = new URL('../src/', import.meta.url);
    const files = readdirSync(src, { recursive: true, withFileTypes: true })
      .filter((f) => f.isFile() && f.name.endsWith('.ts'))
      .map((f) => `${f.parentPath ?? (f as { path?: string }).path}/${f.name}`);
    expect(files.length).toBeGreaterThan(20);
    for (const file of files) {
      if (file.endsWith('otel.ts')) continue;
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/@opentelemetry/);
    }
  });

  it('exports the root, ./webhooks, ./testing and ./otel for import and require', () => {
    expect(Object.keys(pkg.exports)).toEqual(['.', './webhooks', './testing', './otel', './package.json']);
    for (const entry of ['testing', 'otel']) {
      expect(pkg.exports[`./${entry}`]).toEqual({
        import: { types: `./dist/${entry}.d.ts`, default: `./dist/${entry}.js` },
        require: { types: `./dist/${entry}.d.cts`, default: `./dist/${entry}.cjs` },
      });
    }
  });

  it('publishes only the build output and docs', () => {
    expect(pkg.files).toEqual(['dist', 'README.md', 'LICENSE', 'CHANGELOG.md', 'llms.txt']);
    expect(pkg.sideEffects).toBe(false);
  });

  it('exports the public API from the root', () => {
    for (const name of [
      'Bizgo',
      'Environment',
      'sms',
      'mms',
      'international',
      'rcs',
      'alimtalk',
      'brandMessage',
      'naverTalk',
      'SendResult',
      'ReportBatch',
      'WebhookReceiver',
      'verifySignature',
      'BizgoError',
      'ValidationError',
      'APIError',
      'RateLimitError',
      'BulkSendResult',
      'OPERATIONS',
      'WEBHOOKS',
      'GeneratedClient',
      'AlimtalkTemplatesResource',
      'combineHooks',
      'counselAck',
      'parseWebhook',
      'DEFAULT_RATE_LIMIT',
    ]) {
      expect(sdk, name).toHaveProperty(name);
    }
  });

  it('has no feature that sends requests to user-provided URLs', () => {
    // The 1.0.x webhook module POSTed the Authorization header to arbitrary URLs. Nothing like it may come back:
    // the only request path is Transport, whose URL is always baseUrl + a fixed API path.
    for (const name of ['webhooks.ts', 'testing.ts', 'otel.ts', 'operation.ts']) {
      const source = readFileSync(new URL(`../src/${name}`, import.meta.url), 'utf8');
      expect(source, name).not.toMatch(/(?<![.\w])fetch\(|globalThis\.fetch/);
    }
  });
});
