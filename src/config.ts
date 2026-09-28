import { ConfigurationError } from './errors.js';

/** Bizgo API servers. */
export const Environment = Object.freeze({
  /** 운영 서버. 실제로 발송됩니다. */
  PRODUCTION: 'https://mars.ibapi.kr',
  /** 테스트 서버. 운영과 같은 API Key를 쓰며 실제로 발송되지 않습니다. */
  SANDBOX: 'https://sandbox-mars.ibapi.kr',
} as const);

/** One of the {@link Environment} URLs. */
export type Environment = (typeof Environment)[keyof typeof Environment];

export const API_KEY_ENV = 'BIZGO_API_KEY';
export const DEFAULT_TIMEOUT_MS = 30_000;
export const DEFAULT_MAX_RETRIES = 2;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function env(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name];
}

export function resolveApiKey(apiKey: string | undefined): string {
  if (apiKey !== undefined && typeof apiKey !== 'string') {
    throw new ConfigurationError('apiKey는 문자열이어야 합니다.');
  }
  const key = apiKey ?? env(API_KEY_ENV) ?? '';
  if (key.trim() === '') {
    throw new ConfigurationError(
      `API Key가 없습니다. apiKey 옵션으로 넘기거나 환경변수 ${API_KEY_ENV}에 설정하세요. ` +
        '키는 코드에 직접 쓰지 말고 환경변수나 시크릿 저장소에서 읽어 오세요.',
    );
  }
  // §12.16: printable ASCII only, nothing trimmed silently (the key itself is never echoed)
  if (/\s/.test(key)) {
    throw new ConfigurationError(
      "API Key에 공백·줄바꿈이 있습니다(앞뒤 포함). 'Bearer '나 'ApiKey ' 같은 접두어 없이 키만 넣고, 파일에서 읽었다면 끝의 줄바꿈을 지우세요.",
    );
  }
  if (!/^[\x21-\x7e]+$/.test(key)) {
    throw new ConfigurationError(
      'API Key에 쓸 수 없는 문자(제어문자·비ASCII)가 있습니다. 콘솔에서 발급한 키를 그대로 넣으세요.',
    );
  }
  return key;
}

export function resolveBaseUrl(environment: string | undefined, baseUrl: string | undefined): string {
  const environments: readonly string[] = Object.values(Environment);
  if (environment !== undefined && !environments.includes(environment)) {
    throw new ConfigurationError('environment는 Environment.PRODUCTION 또는 Environment.SANDBOX여야 합니다.');
  }
  const raw = baseUrl ?? environment ?? Environment.PRODUCTION;
  let url: URL;
  try {
    url = new URL(String(raw));
  } catch {
    throw new ConfigurationError('baseUrl이 올바른 URL이 아닙니다.');
  }
  // The API key travels in a header, so it must never be sent over plain HTTP (localhost is allowed for mocks).
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname))) {
    throw new ConfigurationError(`baseUrl은 https여야 합니다: ${url.protocol}//${url.hostname}`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new ConfigurationError('baseUrl에는 사용자 정보, 쿼리, 해시를 넣을 수 없습니다.');
  }
  return `${url.origin}${url.pathname}`.replace(/\/+$/, '');
}
