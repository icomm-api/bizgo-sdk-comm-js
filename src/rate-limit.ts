/**
 * Client-side token buckets (SDK-DESIGN.md §11.2, §11.5).
 *
 * Every client instance has two buckets:
 * - `send`: default **200 messages per second, counted per recipient** (not per request). A send request costs the
 *   number of its `destinations` (minimum 1; a send without a recipient list, such as a counsel message or a brand
 *   message group send to a friend group, costs 1). One 200-recipient request therefore uses the whole second.
 * - `other`: default 5 requests per second; every request costs 1.
 *
 * The capacity (burst) of a bucket equals its per-second rate. Each HTTP attempt, retries included, waits (without
 * blocking the event loop) until its tokens are available. A request that costs more than the capacity (you lowered
 * the rate below your chunk size) waits until the bucket is full and then leaves the balance negative (debt), so it
 * never deadlocks and the average rate still holds.
 *
 * Only operations tagged `x-sdk-rate: send` in the spec use the `send` bucket: today `sendOmni` (and
 * `send.sms/lms/mms/request/bulk`), `createReservation`, `addReservationRecipients`, `createBrandMessageGroupSend`,
 * `sendCounselPlain` and `sendCounselRich`. The bucket of each operation is `OPERATIONS[id].rate`.
 *
 * The Bizgo limit is per account. These buckets only pace one process: several processes or servers sharing a key
 * still need their own coordination, and HTTP 429 is still retried (§6).
 *
 * @module
 */
import { ConfigurationError } from './errors.js';

/** Per-second limits of the two buckets. */
export interface RateLimitOptions {
  /** Send APIs: messages (recipients) per second (default 200). */
  send?: number;
  /** Every other API: requests per second (default 5). */
  other?: number;
}

export const DEFAULT_RATE_LIMIT = Object.freeze({ send: 200, other: 5 });

/** Replaceable in tests. Not part of the public API. */
export const clock = {
  now: (): number => Date.now(),
  sleep: (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms)),
};

/**
 * Holds up to `rate` tokens (one second of burst), refilled continuously at `rate` per second. Callers reserve
 * tokens in call order: the balance may go negative and each caller waits until its own tokens have been refilled.
 */
export class TokenBucket {
  readonly rate: number;
  readonly capacity: number;
  #tokens: number;
  #updated: number;

  constructor(rate: number) {
    this.rate = rate;
    this.capacity = rate;
    this.#tokens = rate;
    this.#updated = clock.now();
  }

  /**
   * Take `cost` tokens and return how many milliseconds the caller must wait. The caller may go once the balance
   * reaches `min(cost, capacity)`; the rest is left as debt.
   */
  reserve(cost = 1): number {
    const amount = Math.max(1, Number.isFinite(cost) ? cost : 1);
    const now = clock.now();
    this.#tokens = Math.min(this.capacity, this.#tokens + ((now - this.#updated) / 1000) * this.rate);
    this.#updated = now;
    const need = Math.min(amount, this.capacity);
    const wait = Math.max(0, ((need - this.#tokens) / this.rate) * 1000);
    this.#tokens -= amount;
    return wait;
  }

  /** Take `cost` tokens, waiting if they are not available yet. */
  async acquire(cost = 1): Promise<void> {
    const wait = this.reserve(cost);
    if (wait > 0) await clock.sleep(wait);
  }
}

export interface RateLimiter {
  /** Wait for `cost` tokens of the bucket (`other` always costs 1). */
  acquire(bucket: 'send' | 'other', cost: number): Promise<void>;
}

function rate(value: unknown, name: string, fallback: number): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new ConfigurationError(`rateLimit.${name}는 0보다 큰 숫자(초당 한도)여야 합니다.`);
  }
  return value;
}

/** Build the per-client limiter. `null`/`false` disables it. */
export function createRateLimiter(options: RateLimitOptions | null | false | undefined): RateLimiter | undefined {
  if (options === null || options === false) return undefined;
  const input: unknown = options ?? {};
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new ConfigurationError('rateLimit은 { send, other } 객체이거나 null이어야 합니다.');
  }
  const unknown = Object.keys(input).filter((name) => name !== 'send' && name !== 'other');
  if (unknown.length > 0) throw new ConfigurationError(`rateLimit에서 알 수 없는 옵션입니다: ${unknown.join(', ')}`);
  const opts = input as RateLimitOptions;
  const buckets = {
    send: new TokenBucket(rate(opts.send, 'send', DEFAULT_RATE_LIMIT.send)),
    other: new TokenBucket(rate(opts.other, 'other', DEFAULT_RATE_LIMIT.other)),
  };
  return { acquire: (bucket, cost) => buckets[bucket].acquire(bucket === 'send' ? cost : 1) };
}

/** Cost of a request in its bucket: the number of `destinations` for sends (minimum 1), otherwise 1. */
export function requestCost(bucket: 'send' | 'other', json: unknown): number {
  if (bucket !== 'send') return 1;
  const destinations = (json as { destinations?: unknown } | null | undefined)?.destinations;
  return Array.isArray(destinations) ? Math.max(1, destinations.length) : 1;
}
