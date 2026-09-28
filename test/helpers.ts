import { beforeEach, vi } from 'vitest';
import { Bizgo, type ClientOptions, Environment } from '../src/index.js';
import { clock } from '../src/rate-limit.js';
import { timing } from '../src/transport.js';

export const API_KEY = 'test-api-key-not-real';
export const BASE = Environment.SANDBOX;

/** Delays (ms) the transport asked to sleep for; retries never really wait in tests. */
export const delays: number[] = [];
/** Delays (ms) the client-side rate limiter asked for; they do not really wait either (see rate-limit.test.ts). */
export const rateDelays: number[] = [];

beforeEach(() => {
  delays.length = 0;
  rateDelays.length = 0;
  vi.spyOn(timing, 'sleep').mockImplementation(async (ms: number) => {
    delays.push(ms);
  });
  vi.spyOn(clock, 'sleep').mockImplementation(async (ms: number) => {
    rateDelays.push(ms);
  });
});

export function envelope(data?: unknown, options: { code?: string; ref?: string } = {}): Record<string, unknown> {
  const code = options.code ?? 'A000';
  const inner: Record<string, unknown> = { code, result: code === 'A000' ? 'Success' : 'Failed' };
  if (data !== undefined) inner.data = data;
  if (options.ref !== undefined) inner.ref = options.ref;
  return { common: { authCode: 'A000', authResult: 'Success', infobankTrId: 'TR-TEST' }, data: inner };
}

export interface ReplySpec {
  status?: number;
  json?: unknown;
  text?: string;
  headers?: Record<string, string>;
}
/** A response to build, or an error for fetch to throw. */
export type Reply = ReplySpec | Error;

export interface Call {
  method: string;
  url: URL;
  headers: Headers;
  init: RequestInit;
  /** The body as fetch would send it (multipart included). */
  text: string;
  json(): any;
}

interface Route {
  method: string;
  path: string | RegExp;
  replies: Reply[];
  calls: Call[];
}

/** An in-memory stand-in for the Bizgo API. Pass `server.fetch` to the client. */
export class MockServer {
  readonly calls: Call[] = [];
  readonly #routes: Route[] = [];

  on(method: string, path: string | RegExp, ...replies: Reply[]): { calls: Call[] } {
    const route: Route = { method, path, replies: replies.length > 0 ? replies : [{ json: envelope() }], calls: [] };
    this.#routes.unshift(route); // later definitions win, like respx
    return route;
  }

  readonly fetch = async (input: string, init: RequestInit): Promise<Response> => {
    const url = new URL(input);
    const request = new Request(input, init);
    const text = init.body === undefined ? '' : await request.clone().text();
    const call: Call = {
      method: request.method,
      url,
      headers: request.headers,
      init,
      text,
      json: () => JSON.parse(text),
    };
    this.calls.push(call);
    const route = this.#routes.find(
      (r) =>
        r.method === request.method &&
        (typeof r.path === 'string' ? url.pathname === r.path : r.path.test(url.pathname)),
    );
    if (!route) throw new Error(`no mock route for ${request.method} ${url.pathname}`);
    route.calls.push(call);
    const reply = route.replies[Math.min(route.calls.length - 1, route.replies.length - 1)] as Reply;
    if (reply instanceof Error) throw reply;
    const headers = new Headers(reply.headers);
    let body: string | undefined = reply.text;
    if (reply.json !== undefined) {
      body = JSON.stringify(reply.json);
      headers.set('content-type', 'application/json');
    }
    return new Response(body ?? null, { status: reply.status ?? 200, headers });
  };
}

export function makeClient(server: MockServer, options: ClientOptions = {}): Bizgo {
  return new Bizgo({
    apiKey: API_KEY,
    environment: Environment.SANDBOX,
    fetch: server.fetch,
    trustFetch: true,
    ...options,
  });
}

/** A fetch error like undici's: the message and cause can contain the full URL. */
export function networkError(url = 'https://sandbox-mars.ibapi.kr/x?from=01000001234'): Error {
  return new TypeError('fetch failed', {
    cause: Object.assign(new Error(`connect ECONNREFUSED ${url}`), { code: 'ECONNREFUSED' }),
  });
}

export function timeoutError(): Error {
  return new DOMException('The operation was aborted due to timeout', 'TimeoutError');
}
