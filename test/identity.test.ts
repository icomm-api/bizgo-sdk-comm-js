import { describe, expect, it } from 'vitest';
import { archName, checkAppInfo, detectRuntime, osName, SDK_CLIENT, userAgent } from '../src/identity.js';
import { ConfigurationError, type Fetch, VERSION } from '../src/index.js';
import { Transport } from '../src/transport.js';
import { API_KEY, BASE, envelope, MockServer, makeClient } from './helpers.js';

const UA =
  /^bizgo-sdk-comm-js\/\d+\.\d+\.\d+ (node|bun|deno)\/[\w.+-]+ \((linux|windows|darwin|freebsd|other); (x64|arm64|x86|arm|other)\)( app\/[\w.-]+-[\w.+-]+)?$/;

describe('SDK identification headers (§2.1)', () => {
  it('sends User-Agent and X-Bizgo-Client on every request', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({}) });
    await makeClient(server).reports.poll();
    const headers = server.calls[0]?.headers;
    expect(headers?.get('user-agent')).toMatch(UA);
    expect(headers?.get('user-agent')).toContain(`bizgo-sdk-comm-js/${VERSION} node/${process.versions.node} (`);
    expect(headers?.get('x-bizgo-client')).toBe(`bizgo-sdk-comm-js/${VERSION}`);
    expect(SDK_CLIENT).toBe(`bizgo-sdk-comm-js/${VERSION}`);
  });

  it('appends app/<name>-<version> from appInfo', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({}) });
    await makeClient(server, { appInfo: { name: 'myshop', version: '1.4.2+build.7' } }).reports.poll();
    const ua = server.calls[0]?.headers.get('user-agent') ?? '';
    expect(ua).toMatch(UA);
    expect(ua.endsWith(' app/myshop-1.4.2+build.7')).toBe(true);
  });

  it.each([
    { name: 'my shop', version: '1' },
    { name: 'shop\r\nX-Evil: 1', version: '1' },
    { name: 'user@example.com', version: '1' },
    { name: 'a'.repeat(51), version: '1' },
    { name: '', version: '1' },
    { name: 'shop', version: '1 2' },
    { name: 'shop', version: '1\n' },
    { name: 'shop', version: '1'.repeat(31) },
    { name: 'shop', version: 'v@1' },
    { name: 'shop' },
    { name: 'shop', version: '1', extra: 'x' },
  ])('rejects appInfo %j with ConfigurationError, without echoing it', (appInfo) => {
    const error = (() => {
      try {
        makeClient(new MockServer(), { appInfo: appInfo as never });
      } catch (e) {
        return e;
      }
    })();
    expect(error).toBeInstanceOf(ConfigurationError);
    if (appInfo.name.length > 3) expect(String(error)).not.toContain(appInfo.name);
  });

  it('accepts names up to the documented limits', () => {
    expect(checkAppInfo({ name: `a._-${'b'.repeat(46)}`, version: `1.0+-_${'c'.repeat(24)}` })).toBeDefined();
    expect(checkAppInfo(undefined)).toBeUndefined();
    expect(() => checkAppInfo('shop')).toThrow(ConfigurationError);
  });

  it('maps OS and CPU coarsely', () => {
    expect(['linux', 'win32', 'darwin', 'freebsd', 'aix', 'sunos', undefined].map(osName)).toEqual([
      'linux',
      'windows',
      'darwin',
      'freebsd',
      'other',
      'other',
      'other',
    ]);
    expect(['x64', 'arm64', 'ia32', 'arm', 'x86_64', 'aarch64', 'riscv64', 'ppc64', undefined].map(archName)).toEqual([
      'x64',
      'arm64',
      'x86',
      'arm',
      'x64',
      'arm64',
      'other',
      'other',
      'other',
    ]);
  });

  it('detects node, bun and deno', () => {
    expect(detectRuntime({ process: { versions: { node: '20.1.0' }, platform: 'linux', arch: 'x64' } })).toEqual({
      runtime: 'node',
      version: '20.1.0',
      platform: 'linux',
      arch: 'x64',
    });
    expect(
      userAgent(
        undefined,
        detectRuntime({ process: { versions: { node: '1', bun: '1.1.0' }, platform: 'darwin', arch: 'arm64' } }),
      ),
    ).toBe(`bizgo-sdk-comm-js/${VERSION} bun/1.1.0 (darwin; arm64)`);
    expect(
      userAgent(
        { name: 'app', version: '2' },
        detectRuntime({ Deno: { version: { deno: '2.0.0' }, build: { os: 'windows', arch: 'x86_64' } } }),
      ),
    ).toBe(`bizgo-sdk-comm-js/${VERSION} deno/2.0.0 (windows; x64) app/app-2`);
    expect(userAgent(undefined, detectRuntime({}))).toBe(`bizgo-sdk-comm-js/${VERSION} runtime/unknown (other; other)`);
    // a strange runtime version never breaks the header
    expect(userAgent(undefined, { runtime: 'node', version: '1\r\nX: y', platform: 'linux', arch: 'x64' })).toBe(
      `bizgo-sdk-comm-js/${VERSION} node/unknown (linux; x64)`,
    );
  });

  it('never lets spec header params replace Authorization, User-Agent or X-Bizgo-Client', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({}) });
    const transport = new Transport({
      apiKey: API_KEY,
      baseUrl: BASE,
      timeoutMs: 1000,
      maxRetries: 0,
      fetch: server.fetch,
      logger: undefined,
      userAgent: userAgent(),
    });
    await transport.request('GET', '/x', {
      retry: 'safe',
      headers: {
        authorization: 'evil',
        'User-Agent': 'evil',
        'x-bizgo-client': 'evil',
        token: 'CHANNEL_TOKEN_EXAMPLE',
      },
    });
    const headers = server.calls[0]?.headers;
    expect(headers?.get('authorization')).toBe(API_KEY);
    expect(headers?.get('user-agent')).toMatch(UA);
    expect(headers?.get('x-bizgo-client')).toBe(SDK_CLIENT);
    expect(headers?.get('token')).toBe('CHANNEL_TOKEN_EXAMPLE');
  });

  it('gives each attempt fresh headers, so a custom fetch cannot change the next attempt', async () => {
    const seen: Record<string, string>[] = [];
    const fetch: Fetch = async (_input, init) => {
      const headers = init.headers as Record<string, string>;
      seen.push({ ...headers });
      headers['User-Agent'] = 'tampered';
      headers['X-Bizgo-Client'] = 'tampered';
      headers.Authorization = 'tampered';
      return new Response(JSON.stringify(envelope({})), { status: seen.length === 1 ? 503 : 200 });
    };
    await makeClient(new MockServer(), { fetch }).reports.poll();
    expect(seen).toHaveLength(2);
    expect(seen[1]?.['User-Agent']).toMatch(UA);
    expect(seen[1]?.['X-Bizgo-Client']).toBe(SDK_CLIENT);
    expect(seen[1]?.Authorization).toBe(API_KEY);
  });

  it('keeps the identification headers per client instance', async () => {
    const server = new MockServer();
    server.on('GET', /.*/, { json: envelope({}) });
    await makeClient(server, { appInfo: { name: 'one', version: '1' } }).reports.poll();
    await makeClient(server).reports.poll();
    expect(server.calls[0]?.headers.get('user-agent')).toContain('app/one-1');
    expect(server.calls[1]?.headers.get('user-agent')).not.toContain('app/');
  });
});
