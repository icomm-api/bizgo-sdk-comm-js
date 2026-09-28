import { DEFAULT_MAX_RETRIES, DEFAULT_TIMEOUT_MS, type Environment, resolveApiKey, resolveBaseUrl } from './config.js';
import { ConfigurationError } from './errors.js';
import { GeneratedClient } from './generated/resources.js';
import type { Hooks } from './hooks.js';
import { type AppInfo, checkAppInfo, userAgent } from './identity.js';
import { createRateLimiter, type RateLimitOptions } from './rate-limit.js';
import { Files } from './resources/files.js';
import { Messages } from './resources/messages.js';
import { Reports } from './resources/reports.js';
import { Send } from './resources/send.js';
import { type Fetch, type Logger, Transport } from './transport.js';
import { FAKE_FETCH, isRecord } from './util.js';

export interface ClientOptions {
  /**
   * Integrated API key from the console (`발송관리 > 연동관리`). Defaults to the `BIZGO_API_KEY` environment
   * variable. Pass the key only, without `Bearer`/`ApiKey` prefixes. Never hard-code it.
   */
  apiKey?: string;
  /** {@link Environment.PRODUCTION} (default, real sends) or {@link Environment.SANDBOX}. */
  environment?: Environment;
  /** Override the server URL (must be https, except localhost for mock servers). */
  baseUrl?: string;
  /** Total time per attempt, in milliseconds (default 30000). */
  timeoutMs?: number;
  /**
   * Retries for rate limits and transient errors (default 2). Sends are retried after a timeout or 5xx only
   * when `idempotencyKey` is set.
   */
  maxRetries?: number;
  /**
   * Custom `fetch`. Defaults to the global `fetch`. The SDK cannot inspect a custom fetch, so it is **refused unless
   * `trustFetch: true`** is also set (SDK-DESIGN.md §12.6). The testing kit's `FakeFetch` is accepted without it.
   */
  fetch?: Fetch;
  /**
   * Required to use a custom `fetch`. By setting it you guarantee that the fetch does **not** follow redirects,
   * retry by itself, add or change authentication/cookies, or disable TLS verification, and you accept the risks
   * if it does: duplicate sends (its retries bypass the SDK's idempotency rules) and leaking the API key (a
   * followed redirect would carry the `Authorization` header elsewhere). For CA certificates and proxies prefer the
   * Node.js settings described in the README (`NODE_EXTRA_CA_CERTS`, `NODE_USE_ENV_PROXY`) with the global fetch.
   */
  trustFetch?: boolean;
  /** Receives one debug line per attempt: `METHOD path -> status (ms, attempt n)`. Silent by default. */
  logger?: Logger;
  /**
   * Client-side token buckets in requests/second: `{ send: 200, other: 5 }` by default. `null` disables them.
   * They pace this client instance only; the Bizgo limit is per account (see the README).
   */
  rateLimit?: RateLimitOptions | null;
  /** Observability callbacks (operation, path template, status, code, attempts, duration; never bodies or keys). */
  hooks?: Hooks;
  /**
   * Your application, appended to the User-Agent as `app/<name>-<version>` (§2.1). `name`: letters, digits, `._-`,
   * 1-50 chars; `version`: letters, digits, `._+-`, 1-30 chars. Never put e-mails or phone numbers here.
   */
  appInfo?: AppInfo;
}

const OPTIONS = [
  'apiKey',
  'environment',
  'baseUrl',
  'timeoutMs',
  'maxRetries',
  'fetch',
  'trustFetch',
  'logger',
  'rateLimit',
  'hooks',
  'appInfo',
];
const INSPECT = Symbol.for('nodejs.util.inspect.custom');

function defaultFetch(): Fetch {
  if (typeof globalThis.fetch !== 'function') {
    throw new ConfigurationError(
      '전역 fetch가 없습니다. Node.js 18 이상을 쓰거나 fetch와 trustFetch: true를 넘기세요.',
    );
  }
  return (input, init) => globalThis.fetch(input, init);
}

/**
 * Bizgo Communication API client.
 *
 * ```ts
 * import { Bizgo, Environment } from '@bizgo/bizgo-sdk-comm-js';
 *
 * const client = new Bizgo({ environment: Environment.SANDBOX }); // API key from BIZGO_API_KEY
 * const result = await client.send.sms({ to: '01000000000', from: '01000000000', text: '인증번호는 123456 입니다.' });
 * console.log(result.msgKeys, result.failed);
 * ```
 *
 * The key and settings belong to this instance only. The key is never included in `toString()`,
 * `util.inspect()`, logs or error messages.
 */
function transportFor(options: ClientOptions): Transport {
  const input: unknown = options;
  if (!isRecord(input)) throw new ConfigurationError('Bizgo 옵션은 객체여야 합니다.');
  const unknown = Object.keys(options).filter((name) => !OPTIONS.includes(name));
  if (unknown.length > 0) {
    throw new ConfigurationError(`알 수 없는 옵션입니다: ${unknown.join(', ')} (허용: ${OPTIONS.join(', ')})`);
  }
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (typeof timeoutMs !== 'number' || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new ConfigurationError('timeoutMs는 0보다 큰 숫자(밀리초)여야 합니다.');
  }
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  if (typeof maxRetries !== 'number' || !Number.isInteger(maxRetries) || maxRetries < 0) {
    throw new ConfigurationError('maxRetries는 0 이상의 정수여야 합니다.');
  }
  if (options.fetch !== undefined && typeof options.fetch !== 'function') {
    throw new ConfigurationError('fetch는 함수여야 합니다.');
  }
  if (options.trustFetch !== undefined && typeof options.trustFetch !== 'boolean') {
    throw new ConfigurationError('trustFetch는 true/false여야 합니다.');
  }
  const fake = (options.fetch as { [FAKE_FETCH]?: unknown } | undefined)?.[FAKE_FETCH] === true;
  if (options.fetch !== undefined && options.trustFetch !== true && !fake) {
    throw new ConfigurationError(
      '사용자 fetch는 trustFetch: true와 함께만 쓸 수 있습니다. SDK는 사용자 fetch가 리다이렉트·자체 재시도·인증 변경을 ' +
        '하지 않는지 확인할 수 없습니다(중복 발송·API Key 유출 위험). CA·프록시는 README의 Node.js 설정을 쓰세요.',
    );
  }
  if (options.logger !== undefined && typeof options.logger?.debug !== 'function') {
    throw new ConfigurationError('logger에는 debug(message) 함수가 있어야 합니다.');
  }
  const hooks = options.hooks;
  if (hooks !== undefined) {
    const valid =
      isRecord(hooks) &&
      Object.keys(hooks).every((name) => name === 'onRequestStart' || name === 'onRequestEnd') &&
      Object.values(hooks).every((hook) => hook === undefined || typeof hook === 'function');
    if (!valid) throw new ConfigurationError('hooks에는 onRequestStart/onRequestEnd 함수만 넣을 수 있습니다.');
  }
  return new Transport({
    apiKey: resolveApiKey(options.apiKey),
    baseUrl: resolveBaseUrl(options.environment, options.baseUrl),
    timeoutMs,
    maxRetries,
    fetch: options.fetch ?? defaultFetch(),
    logger: options.logger,
    rateLimiter: createRateLimiter(options.rateLimit),
    hooks,
    userAgent: userAgent(checkAppInfo(options.appInfo)),
  });
}

/**
 * Bizgo Communication API client.
 *
 * ```ts
 * import { Bizgo, Environment } from '@bizgo/bizgo-sdk-comm-js';
 *
 * const client = new Bizgo({ environment: Environment.SANDBOX }); // API key from BIZGO_API_KEY
 * const result = await client.send.sms({ to: '01000000000', from: '01000000000', text: '인증번호는 123456 입니다.' });
 * console.log(result.msgKeys, result.failed);
 *
 * // every other API is generated from the spec, nested per resource
 * const templates = await client.alimtalk.templates.list({ senderKey: 'SENDER_KEY_EXAMPLE' });
 * ```
 *
 * The key and settings belong to this instance only. The key is never included in `toString()`,
 * `util.inspect()`, logs, hook events or error messages.
 */
export class Bizgo extends GeneratedClient {
  /** Send messages (`omni`, `sms`, `lms`, `mms`, `request`, `bulk`). */
  readonly send: Send;
  /** Upload images and files. */
  readonly files: Files;
  /** Delivery reports (polling and inquiry). */
  readonly reports: Reports;
  /** Message status, history and statistics. */
  readonly messages: Messages;
  /** The server URL in use. */
  readonly baseUrl: string;

  constructor(options: ClientOptions = {}) {
    const transport = transportFor(options);
    super(transport);
    this.baseUrl = transport.baseUrl;
    this.send = new Send(transport);
    this.files = new Files(transport);
    this.reports = new Reports(transport);
    this.messages = new Messages(transport);
  }

  override toString(): string {
    return `Bizgo(baseUrl=${this.baseUrl})`;
  }
}

Object.defineProperty(Bizgo.prototype, INSPECT, {
  value(this: Bizgo) {
    return this.toString();
  },
});
