/**
 * Idempotency defaults shared by the handwritten send methods and the generated operations.
 *
 * @module
 */

/**
 * `idempotencyTtl` (seconds, 24 hours) the SDK sends when `idempotencyKey` is set without a TTL.
 *
 * Bizgo rejects a request that has `idempotencyKey` but no `idempotencyTtl` (A309; TTL range 0-86400 s), so every
 * request the SDK sends with a key also carries a TTL. An explicit TTL (including `0`) is sent as given, and no TTL
 * is added when there is no key.
 */
export const DEFAULT_IDEMPOTENCY_TTL = 86400;

/**
 * Return `body` with `idempotencyTtl: DEFAULT_IDEMPOTENCY_TTL` added when it has an `idempotencyKey` and no
 * `idempotencyTtl`. Otherwise `body` is returned unchanged. The input object is never mutated (a copy is returned).
 */
export function withDefaultIdempotencyTtl<T>(body: T): T {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return body;
  const record = body as Record<string, unknown>;
  if (record.idempotencyKey === undefined || record.idempotencyKey === null) return body;
  if (record.idempotencyTtl !== undefined && record.idempotencyTtl !== null) return body;
  return { ...record, idempotencyTtl: DEFAULT_IDEMPOTENCY_TTL } as T;
}
