/**
 * SDK identification headers (SDK-DESIGN.md §2.1).
 *
 * Every request carries
 * - `User-Agent: bizgo-sdk-comm-js/<sdkVer> <node|bun|deno>/<runtimeVer> (<os>; <arch>)[ app/<name>-<ver>]`
 * - `X-Bizgo-Client: bizgo-sdk-comm-js/<sdkVer>` (kept even if a proxy rewrites the User-Agent)
 *
 * `<os>` is one of `linux`, `windows`, `darwin`, `freebsd`, `other`; `<arch>` one of `x64`, `arm64`, `x86`, `arm`,
 * `other`. Nothing more detailed (host name, user name, kernel version, ...) is sent, and the SDK never sends data
 * anywhere else (no phone-home). The values are built once per client.
 *
 * @module
 */
import { ConfigurationError } from './errors.js';
import { VERSION } from './version.js';

/** Your application, appended to the User-Agent as `app/<name>-<version>`. Never put e-mails or phone numbers here. */
export interface AppInfo {
  /** `^[A-Za-z0-9._-]{1,50}$` */
  name: string;
  /** `^[A-Za-z0-9._+-]{1,30}$` */
  version: string;
}

export const SDK_CLIENT = `bizgo-sdk-comm-js/${VERSION}`;

const APP_NAME = /^[A-Za-z0-9._-]{1,50}$/;
const APP_VERSION = /^[A-Za-z0-9._+-]{1,30}$/;

/** What the runtime reports; injectable for tests. */
export interface RuntimeInfo {
  runtime: 'node' | 'bun' | 'deno' | 'unknown';
  version: string;
  platform: string | undefined;
  arch: string | undefined;
}

interface Globals {
  process?: { versions?: Record<string, string | undefined>; platform?: string; arch?: string };
  Deno?: { version?: { deno?: string }; build?: { os?: string; arch?: string } };
}

export function detectRuntime(globals: Globals = globalThis as Globals): RuntimeInfo {
  const proc = globals.process;
  if (proc?.versions?.bun) {
    return { runtime: 'bun', version: proc.versions.bun, platform: proc.platform, arch: proc.arch };
  }
  const deno = globals.Deno;
  if (deno?.version?.deno) {
    return { runtime: 'deno', version: deno.version.deno, platform: deno.build?.os, arch: deno.build?.arch };
  }
  if (proc?.versions?.node) {
    return { runtime: 'node', version: proc.versions.node, platform: proc.platform, arch: proc.arch };
  }
  return { runtime: 'unknown', version: 'unknown', platform: undefined, arch: undefined };
}

/** Coarse OS name only. */
export function osName(platform: string | undefined): string {
  switch (platform) {
    case 'linux':
      return 'linux';
    case 'win32':
    case 'windows':
      return 'windows';
    case 'darwin':
      return 'darwin';
    case 'freebsd':
      return 'freebsd';
    default:
      return 'other';
  }
}

/** Coarse CPU architecture only. */
export function archName(arch: string | undefined): string {
  switch (arch) {
    case 'x64':
    case 'x86_64':
      return 'x64';
    case 'arm64':
    case 'aarch64':
      return 'arm64';
    case 'ia32':
    case 'x86':
      return 'x86';
    case 'arm':
      return 'arm';
    default:
      return 'other';
  }
}

/** Validate the `appInfo` option (header injection / personal data guard). */
export function checkAppInfo(appInfo: unknown): AppInfo | undefined {
  if (appInfo === undefined) return undefined;
  if (typeof appInfo !== 'object' || appInfo === null || Array.isArray(appInfo)) {
    throw new ConfigurationError('appInfo는 { name, version } 객체여야 합니다.');
  }
  const unknown = Object.keys(appInfo).filter((key) => key !== 'name' && key !== 'version');
  if (unknown.length > 0) throw new ConfigurationError(`appInfo에서 알 수 없는 옵션입니다: ${unknown.join(', ')}`);
  const { name, version } = appInfo as Record<string, unknown>;
  // the values are not echoed back: they could be anything the caller passed
  if (typeof name !== 'string' || !APP_NAME.test(name)) {
    throw new ConfigurationError('appInfo.name은 영문·숫자·._- 1~50자여야 합니다 (이메일·전화번호 금지).');
  }
  if (typeof version !== 'string' || !APP_VERSION.test(version)) {
    throw new ConfigurationError('appInfo.version은 영문·숫자·._+- 1~30자여야 합니다.');
  }
  return { name, version };
}

function token(value: string): string {
  // runtime versions come from the runtime itself; keep them header-safe anyway
  return /^[A-Za-z0-9._+-]{1,40}$/.test(value) ? value : 'unknown';
}

/** The User-Agent value for one client. */
export function userAgent(appInfo?: AppInfo, info: RuntimeInfo = detectRuntime()): string {
  const runtime = info.runtime === 'unknown' ? 'runtime/unknown' : `${info.runtime}/${token(info.version)}`;
  const app = appInfo ? ` app/${appInfo.name}-${appInfo.version}` : '';
  return `${SDK_CLIENT} ${runtime} (${osName(info.platform)}; ${archName(info.arch)})${app}`;
}
