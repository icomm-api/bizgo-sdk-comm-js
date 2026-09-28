import { ValidationError } from '../errors.js';
import { OPERATIONS } from '../generated/operations.js';
import { ReportsResource } from '../generated/resources.js';
import type { Report } from '../generated/types.js';
import { ReportBatch } from '../results.js';
import type { Transport } from '../transport.js';
import { inner, list, optionalString, segment } from '../util.js';
import { checkOptions } from '../validation.js';

export interface ConsumeOptions {
  /** Stop after this many batches (default: until a poll returns no reports). */
  maxBatches?: number;
}

/**
 * Delivery reports. Access as `client.reports`.
 *
 * Pick one primary method per API key in the console: POLLING (this resource) or WEBHOOK (`WebhookReceiver`).
 * Use {@link Reports.inquiry} to fill gaps.
 */
export class Reports extends ReportsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    super(transport);
    this.#transport = transport;
  }

  /**
   * Fetch the next batch of reports. `batch.empty` is `true` when there is nothing new.
   *
   * Call {@link Reports.ack} with `batch.reportId` after storing the batch; otherwise the same reports are
   * returned again. Prefer {@link Reports.consume}, which does this for you.
   */
  async poll(): Promise<ReportBatch> {
    const body = await this.#transport.request('GET', '/api/comm/v1/report/polling', {
      retry: 'safe',
      operation: OPERATIONS.getReportPolling,
    });
    const data = inner(body);
    return new ReportBatch(optionalString(data.reportId) ?? '', list<Report>(data.report));
  }

  /** Confirm receipt of a polled batch. */
  async ack(reportId: string): Promise<void> {
    const path = `/api/comm/v1/report/polling/${segment(reportId, 'reportId')}`;
    await this.#transport.request('DELETE', path, { retry: 'safe', operation: OPERATIONS.ackReportPolling });
  }

  /**
   * Poll until no reports are left, calling `handler` for each batch and acking it only after the handler
   * finished without throwing. Returns the number of reports handled.
   *
   * If `handler` throws, the batch is not acked and will be delivered again, so make the handler idempotent
   * (for example upsert by `msgKey`).
   */
  async consume(
    handler: (reports: readonly Report[]) => void | Promise<void>,
    options?: ConsumeOptions,
  ): Promise<number> {
    const { maxBatches } = checkOptions(options, ['maxBatches'], 'reports.consume');
    if (
      maxBatches !== undefined &&
      !(typeof maxBatches === 'number' && Number.isInteger(maxBatches) && maxBatches > 0)
    ) {
      throw new ValidationError('maxBatches: 1 이상의 정수여야 합니다');
    }
    if (typeof handler !== 'function') throw new ValidationError('handler: 함수여야 합니다');
    let handled = 0;
    for (let batches = 0; maxBatches === undefined || batches < maxBatches; batches++) {
      const batch = await this.poll();
      if (batch.empty) break;
      await handler(batch.reports);
      await this.ack(batch.reportId);
      handled += batch.reports.length;
    }
    return handled;
  }

  /** Look up the reports of one message (up to 30 days old). */
  async inquiry(msgKey: string): Promise<Report[]> {
    const path = `/api/comm/v1/report/inquiry/${segment(msgKey, 'msgKey')}`;
    return list<Report>(
      inner(await this.#transport.request('GET', path, { retry: 'safe', operation: OPERATIONS.getReportInquiry }))
        .report,
    );
  }
}
