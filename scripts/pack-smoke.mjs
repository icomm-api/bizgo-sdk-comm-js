// Smoke-test the packed package the way users get it from npm:
//   1. `npm pack` and check that only the whitelisted files are published
//   2. install the tarball into a temporary project
//   3. `import` (ESM) and `require` (CJS) the root, ./webhooks, ./testing and ./otel entries, and run a mocked send
//      (the ./otel entry needs the optional peer @opentelemetry/api, installed from this repo's node_modules)
//   4. type-check an ESM and a CJS consumer against the published .d.ts/.d.cts
//
// Run `npm run build` first. No network access to Bizgo is made: fetch is replaced by a stub.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const WINDOWS = process.platform === 'win32';
const REQUIRED = [
  'package.json',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'llms.txt',
  ...['index', 'testing', 'otel'].flatMap((entry) =>
    ['.js', '.cjs', '.d.ts', '.d.cts'].map((ext) => `dist/${entry}${ext}`),
  ),
];
// declaration chunks shared by the entries (tsup names them <module>-<hash>.d.ts)
const CHUNK = /^dist\/[a-z-]+-[A-Za-z0-9_-]{8}\.d\.c?ts$/;

// `npm run smoke:pack` sets npm_execpath to npm's JS entry point, which runs without a shell on every OS.
const NPM_CLI = process.env.npm_execpath?.endsWith('.js') ? process.env.npm_execpath : undefined;

function run(command, args, cwd) {
  const options = { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] };
  if (command !== 'npm') return execFileSync(command, args, options);
  if (NPM_CLI) return execFileSync(process.execPath, [NPM_CLI, ...args], options);
  if (!WINDOWS) return execFileSync('npm', args, options);
  // npm is a .cmd shim on Windows, which Node only starts through a shell; our arguments are paths we created
  const quoted = args.map((arg) => (/[\s"&|<>^]/.test(arg) ? `"${arg.replaceAll('"', '')}"` : arg));
  return execFileSync(`npm.cmd ${quoted.join(' ')}`, { ...options, shell: true });
}

function fail(message) {
  console.error(`pack smoke test failed: ${message}`);
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), 'bizgo-pack-'));
try {
  const [packed] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', work], ROOT));
  const files = packed.files.map((file) => file.path.replaceAll('\\', '/'));
  const unexpected = files.filter((file) => !REQUIRED.includes(file) && !CHUNK.test(file));
  const missing = REQUIRED.filter((file) => !files.includes(file));
  if (unexpected.length) fail(`unexpected files in the package: ${unexpected.join(', ')}`);
  if (missing.length) fail(`missing files in the package: ${missing.join(', ')}`);
  console.log(`packed ${packed.filename}: ${files.length} files, ${packed.size} bytes`);

  const app = join(work, 'app');
  mkdirSync(app);
  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'consumer', private: true }));
  const otelApi = join(ROOT, 'node_modules', '@opentelemetry', 'api');
  run(
    'npm',
    ['install', join(work, packed.filename), otelApi, '--ignore-scripts', '--no-audit', '--no-fund', '--install-links'],
    app,
  );
  const installed = JSON.parse(
    readFileSync(join(app, 'node_modules', '@bizgo', 'bizgo-sdk-comm-js', 'package.json'), 'utf8'),
  );
  if (Object.keys(installed.dependencies ?? {}).length) fail('the package must have no runtime dependencies');
  if (!installed.peerDependenciesMeta?.['@opentelemetry/api']?.optional) fail('@opentelemetry/api must be optional');

  const check = (label) => `
    const ok = (cond, what) => { if (!cond) { console.error('${label}: ' + what); process.exit(1); } };
    ok(root.VERSION === ${JSON.stringify(packed.version)}, 'VERSION');
    ok(webhooks.WebhookReceiver === root.WebhookReceiver, 'webhooks entry is the same module');
    ok(typeof testing.FakeFetch === 'function' && typeof testing.signWebhook === 'function', 'testing entry');
    ok(typeof otel.openTelemetryHooks === 'function', 'otel entry');
    ok(new root.ValidationError('x') instanceof root.BizgoError, 'error hierarchy');
    const calls = [];
    const fetch = async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ common: { authCode: 'A000' }, data: { code: 'A000', result: 'Success',
        data: { destinations: [{ to: '01000000000', msgKey: 'K1', code: 'A000' }] } } }), { status: 200 });
    };
    const client = new root.Bizgo({ apiKey: 'test-api-key-not-real', environment: root.Environment.SANDBOX, fetch, trustFetch: true });
    ok(!String(client).includes('test-api-key-not-real'), 'toString hides the key');
    const run = async () => {
      const result = await client.send.omni({ to: '01000000000', messages: [root.sms({ from: '01000000000', text: 'x' })] });
      ok(result.msgKeys[0] === 'K1', 'send result');
      ok(calls[0].url === 'https://sandbox-mars.ibapi.kr/api/comm/v1/send/omni', 'url');
      ok(calls[0].init.headers.Authorization === 'test-api-key-not-real', 'raw key header');
      const fake = new testing.FakeFetch();
      const tested = new root.Bizgo(fake.clientOptions({ hooks: otel.openTelemetryHooks() }));
      const templates = await tested.alimtalk.templates.list({ senderKey: 'SENDER_KEY_EXAMPLE' });
      ok(Array.isArray(templates) && fake.lastRequest.operationId === 'listAlimtalkTemplates', 'generated method');
      const bulk = await tested.send.bulk({ to: ['01000000000', '01000000001'], messages: [root.sms({ from: '01000000000', text: 'x' })], chunkSize: 1 });
      ok(bulk.msgKeys.length === 2, 'bulk');
      fake.on('sendOmni').fail('service', 200, 'A020');
      let limited = false;
      try { await tested.send.sms({ to: '01000000000', from: '01000000000', text: 'x' }); }
      catch (error) { limited = error instanceof root.RateLimitError; }
      ok(limited, 'testing errors are the root error classes');
      const counsel = testing.webhookRequest({ msgKey: 'K1', userKey: 'USER_KEY_EXAMPLE', senderKey: 'SENDER_KEY_EXAMPLE', serviceType: 'CSTALK', msgType: 'TEXT', sendTime: '2026-01-01T00:00:00.000+09:00', reportTime: '2026-01-01T00:00:00.000+09:00' });
      const receiver = new webhooks.WebhookReceiver('test-webhook-secret');
      ok(receiver.counselMessage(counsel.headers, counsel.body).msgKey === 'K1', 'counsel webhook');
      ok(webhooks.parseWebhook('counselMessage', counsel.body).msgKey === 'K1', 'counsel webhook without a secret');
      ok(receiver.counselAck().code === 'A000', 'counsel ack');
      let rejected = false;
      try { await client.send.sms({ to: '01000000000', from: '01000000000', text: '😀' }); }
      catch (error) { rejected = error instanceof root.ValidationError; }
      ok(rejected, 'validation');
      console.log('${label}: ok');
    };
    run().catch((error) => { console.error(error); process.exit(1); });
  `;
  writeFileSync(
    join(app, 'esm.mjs'),
    `import * as root from '@bizgo/bizgo-sdk-comm-js';\nimport * as webhooks from '@bizgo/bizgo-sdk-comm-js/webhooks';\nimport * as testing from '@bizgo/bizgo-sdk-comm-js/testing';\nimport * as otel from '@bizgo/bizgo-sdk-comm-js/otel';\n${check('esm import')}`,
  );
  writeFileSync(
    join(app, 'cjs.cjs'),
    `const root = require('@bizgo/bizgo-sdk-comm-js');\nconst webhooks = require('@bizgo/bizgo-sdk-comm-js/webhooks');\nconst testing = require('@bizgo/bizgo-sdk-comm-js/testing');\nconst otel = require('@bizgo/bizgo-sdk-comm-js/otel');\n${check('cjs require')}`,
  );
  process.stdout.write(run('node', ['esm.mjs'], app));
  process.stdout.write(run('node', ['cjs.cjs'], app));

  // Types: both resolution modes must find declarations for the root and ./webhooks.
  const consumer = `
    const client = new Bizgo({ environment: Environment.SANDBOX, apiKey: 'test-api-key-not-real' });
    const item: MessageFlowItem = sms({ from: '01000000000', text: 'x' });
    const pending: Promise<SendResult> = client.send.omni({ to: '01000000000', messages: [item] });
    const receiver: WebhookReceiver = new WebhookReceiver('test-webhook-secret', { tolerance: 300 });
    const counsel: CounselMessageWebhookPayload = parseWebhook('counselMessage', '{}');
    const fake = new FakeFetch();
    const tested = new Bizgo(fake.clientOptions({ hooks: openTelemetryHooks() }));
    const list: Promise<AlimtalkTemplate[]> = tested.alimtalk.templates.list({ senderKey: 'SENDER_KEY_EXAMPLE' });
    const bulk: Promise<BulkSendResult> = tested.send.bulk({ to: ['01000000000'], messages: [item] });
    void pending; void receiver; void counsel; void list; void bulk;
  `;
  const typeImports = [
    "import { Bizgo, Environment, sms, type AlimtalkTemplate, type BulkSendResult, type CounselMessageWebhookPayload, type MessageFlowItem, type SendResult } from '@bizgo/bizgo-sdk-comm-js';",
    "import { WebhookReceiver, parseWebhook } from '@bizgo/bizgo-sdk-comm-js/webhooks';",
    "import { FakeFetch } from '@bizgo/bizgo-sdk-comm-js/testing';",
    "import { openTelemetryHooks } from '@bizgo/bizgo-sdk-comm-js/otel';",
  ].join('\n');
  writeFileSync(join(app, 'types.mts'), `${typeImports}\n${consumer}`);
  writeFileSync(join(app, 'types.cts'), `${typeImports}\n${consumer}`);
  const tsc = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
  const tscArgs = ['--noEmit', '--strict', '--module', 'nodenext', '--moduleResolution', 'nodenext'];
  run('node', [tsc, ...tscArgs, '--target', 'es2022', '--lib', 'es2022,dom', 'types.mts', 'types.cts'], app);
  console.log('types (import + require, all entries): ok');
} finally {
  rmSync(work, { recursive: true, force: true });
}
