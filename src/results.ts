import type { MessageStatus, MoMessage, Report, SendDestinationResult } from './generated/types.js';
import { INSPECT, masked } from './mask.js';

type Inspect = (value: unknown, options: unknown) => string;

function maskAll(items: readonly unknown[]): unknown[] {
  return items.map((item) =>
    typeof item === 'object' && item !== null && !Array.isArray(item) ? masked(item as Record<string, unknown>) : item,
  );
}

/**
 * Acceptance result of a send request.
 *
 * Acceptance is not delivery: the final result arrives later as a report (polling, webhook or inquiry).
 * Always check {@link SendResult.failed} — a request can succeed while some recipients were rejected.
 * When you resend with the same `idempotencyKey`, recipients already accepted earlier come back with code `A301`
 * in {@link SendResult.duplicates} (not in `failed` or `succeeded`); they are not sent again.
 */
export class SendResult {
  /** Per-recipient acceptance results, in request order. */
  readonly destinations: readonly SendDestinationResult[];
  /** The `ref` you sent with the request. */
  readonly ref: string | undefined;
  /** `common.infobankTrId` for support inquiries. */
  readonly trackingId: string | undefined;

  constructor(destinations: readonly SendDestinationResult[], ref?: string, trackingId?: string) {
    this.destinations = destinations;
    this.ref = ref;
    this.trackingId = trackingId;
  }

  /** Recipients accepted with code `A000`. */
  get succeeded(): SendDestinationResult[] {
    return this.destinations.filter((d) => d.code === 'A000');
  }

  /**
   * Recipients rejected at acceptance (code other than `A000` and `A301`). They will not receive the message.
   * Retrying with the same idempotency key is safe: already-accepted recipients come back in {@link duplicates}.
   */
  get failed(): SendDestinationResult[] {
    return this.destinations.filter((d) => d.code !== 'A000' && d.code !== 'A301');
  }

  /**
   * Recipients already accepted earlier with the same `idempotencyKey` (per-recipient code `A301`, §12.4).
   * They were not accepted again by this request, so they are neither {@link succeeded} nor {@link failed};
   * their messages from the earlier request are still on the way.
   */
  get duplicates(): SendDestinationResult[] {
    return this.destinations.filter((d) => d.code === 'A301');
  }

  /** Message keys of accepted recipients, for report and status lookups. */
  get msgKeys(): string[] {
    return this.succeeded.flatMap((d) => (d.msgKey ? [d.msgKey] : []));
  }

  /** Counts only; phone numbers never appear (§12.11). */
  toString(): string {
    return `SendResult(destinations=${this.destinations.length}, succeeded=${this.succeeded.length}, failed=${this.failed.length}, duplicates=${this.duplicates.length})`;
  }

  /**
   * The real data (phone numbers included), for code that stores results on purpose. Printing (`console.log`,
   * `util.inspect`, `toString`) is masked instead.
   */
  toJSON(): {
    destinations: readonly SendDestinationResult[];
    ref: string | undefined;
    trackingId: string | undefined;
  } {
    return { destinations: this.destinations, ref: this.ref, trackingId: this.trackingId };
  }

  /** `util.inspect` / `console.log`: phone numbers masked as `010****0000`. */
  [INSPECT](_depth: number, options: unknown, inspect: Inspect): string {
    const view = { destinations: maskAll(this.destinations), ref: this.ref, trackingId: this.trackingId };
    return `SendResult ${inspect(view, options)}`;
  }
}

/** One batch from report polling. Call `client.reports.ack(batch.reportId)` after you stored it. */
export class ReportBatch {
  readonly reportId: string;
  readonly reports: readonly Report[];

  constructor(reportId: string, reports: readonly Report[]) {
    this.reportId = reportId;
    this.reports = reports;
  }

  /** `true` when there were no new reports. */
  get empty(): boolean {
    return this.reports.length === 0;
  }

  toString(): string {
    return `ReportBatch(reportId=${this.reportId}, reports=${this.reports.length})`;
  }

  /** The real data, for code that stores batches on purpose. */
  toJSON(): { reportId: string; reports: readonly Report[] } {
    return { reportId: this.reportId, reports: this.reports };
  }

  /** `util.inspect` / `console.log`: phone numbers masked. */
  [INSPECT](_depth: number, options: unknown, inspect: Inspect): string {
    return `ReportBatch ${inspect({ reportId: this.reportId, reports: maskAll(this.reports) }, options)}`;
  }
}

/** One page of send history. */
export interface MessagePage {
  readonly messages: readonly MessageStatus[];
  /** Cursor for the next page (`lastSeq`). */
  readonly lastSeq: number | undefined;
  readonly hasNext: boolean;
}

/** One page of MO (inbound) history. */
export interface MoPage {
  readonly messages: readonly MoMessage[];
  readonly lastSeq: number | undefined;
  readonly hasNext: boolean;
}

/** One accepted request (chunk) of `send.bulk`. Recipient indexes refer to the input list. */
export interface BulkChunk {
  /** 0-based chunk number. */
  readonly chunkIndex: number;
  /** Index of the chunk's first recipient in the input list (inclusive). */
  readonly fromIndex: number;
  /** Index after the chunk's last recipient (exclusive). */
  readonly toIndex: number;
  readonly result: SendResult;
}

/** One request (chunk) of `send.bulk` that failed as a whole. Its error message never contains phone numbers. */
export interface BulkChunkError {
  readonly chunkIndex: number;
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly error: Error;
}

/**
 * Result of `client.send.bulk()`. A failed chunk does not stop the others.
 *
 * Like {@link SendResult}, acceptance is not delivery. {@link BulkSendResult.failed} lists recipients rejected
 * inside accepted chunks; recipients of failed chunks are in {@link BulkSendResult.errors} (as index ranges).
 * On a re-run with the same `idempotencyKeyPrefix`, recipients already accepted earlier are in
 * {@link BulkSendResult.duplicates} (a chunk whose recipients are all `A301` is not an error).
 * `toString()` shows counts only, never phone numbers.
 */
export class BulkSendResult {
  /** Accepted chunks, in chunk order. */
  readonly results: readonly BulkChunk[];
  /** Chunks that failed as a whole, in chunk order. */
  readonly errors: readonly BulkChunkError[];

  constructor(results: readonly BulkChunk[], errors: readonly BulkChunkError[]) {
    this.results = [...results].sort((a, b) => a.chunkIndex - b.chunkIndex);
    this.errors = [...errors].sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  /** Recipients accepted (`A000`) over all accepted chunks. */
  get succeeded(): SendDestinationResult[] {
    return this.results.flatMap((chunk) => chunk.result.succeeded);
  }

  /** Recipients rejected inside accepted chunks (not `A000`, not `A301`). */
  get failed(): SendDestinationResult[] {
    return this.results.flatMap((chunk) => chunk.result.failed);
  }

  /** Recipients already accepted earlier with the same idempotency key (`A301`), over all accepted chunks. */
  get duplicates(): SendDestinationResult[] {
    return this.results.flatMap((chunk) => chunk.result.duplicates);
  }

  /** Message keys of accepted recipients, in chunk order. */
  get msgKeys(): string[] {
    return this.results.flatMap((chunk) => chunk.result.msgKeys);
  }

  /** `true` when every chunk was accepted and no recipient was rejected. Duplicates (`A301`) do not count as rejected. */
  get complete(): boolean {
    return this.errors.length === 0 && this.failed.length === 0;
  }

  toString(): string {
    return (
      `BulkSendResult(chunks=${this.results.length + this.errors.length}, failedChunks=${this.errors.length}, ` +
      `succeeded=${this.succeeded.length}, failed=${this.failed.length}, duplicates=${this.duplicates.length})`
    );
  }
}

Object.defineProperty(BulkSendResult.prototype, Symbol.for('nodejs.util.inspect.custom'), {
  value(this: BulkSendResult) {
    return this.toString();
  },
});
