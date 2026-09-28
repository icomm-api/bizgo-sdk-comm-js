import { createHash } from 'node:crypto';
import { ValidationError, type ValidationIssue } from '../errors.js';
import { OPERATIONS } from '../generated/operations.js';
import { SendResource } from '../generated/resources.js';
import type { Destination, MessageFlowItem, SendDestinationResult, SendOmniRequest } from '../generated/types.js';
import { withDefaultIdempotencyTtl } from '../idempotency.js';
import { type BulkChunk, type BulkChunkError, BulkSendResult, SendResult } from '../results.js';
import type { Json, Transport } from '../transport.js';
import { inner, isRecord, list, optionalString } from '../util.js';
import { checkOptions, validate } from '../validation.js';

const PATH = '/api/comm/v1/send/omni';

/** A phone number (`'01000000000'`) or a {@link Destination} (for `replaceWords` or a per-recipient `ref`). */
export type Recipient = string | Destination;
/** One recipient or a list of up to 200. */
export type Recipients = Recipient | readonly Recipient[];

export interface OmniParams {
  /** Recipient(s). Max 200 per request. */
  to: Recipients;
  /**
   * Channel messages in fallback order: if the first fails, the next is sent.
   * Build them with the channel helpers: `[alimtalk({...}), sms({...})]`.
   */
  messages: readonly MessageFlowItem[];
  /** Your reference value; returned in reports. */
  ref?: string;
  /** Groups messages in message insight statistics. */
  groupKey?: string;
  /** Department code for billing. */
  paymentCode?: string;
  /**
   * Up to 200 characters. A resend with the same key within `idempotencyTtl` is rejected with
   * {@link DuplicateRequestError} instead of being delivered twice. It also enables automatic retry after
   * timeouts and 5xx; without it a send is retried only on HTTP 429. Sent with `idempotencyTtl` (default
   * {@link DEFAULT_IDEMPOTENCY_TTL}, 86400).
   */
  idempotencyKey?: string;
  /**
   * Seconds (0-86400) the idempotency key is remembered; default 86400 when `idempotencyKey` is set. An explicit
   * value (including `0`) is sent as given.
   */
  idempotencyTtl?: number;
}

export interface SmsParams {
  to: Recipients;
  /** Sender number registered in the Bizgo console. */
  from: string;
  /** Up to 90 bytes in EUC-KR (Hangul 2 bytes, ASCII 1 byte). Emoji are rejected. */
  text: string;
  ref?: string;
  /** Idempotency key; sent with `idempotencyTtl` 86400 ({@link DEFAULT_IDEMPOTENCY_TTL}). */
  idempotencyKey?: string;
}

export interface LmsParams extends SmsParams {
  /** Up to 2,000 bytes in EUC-KR. */
  text: string;
  title?: string;
}

export interface MmsParams extends LmsParams {
  /** File keys from `client.files.uploadMms()` (max 3). */
  fileKeys: readonly string[];
}

export interface BulkParams extends Omit<OmniParams, 'to' | 'idempotencyKey'> {
  /** Any number of recipients. They are sent `chunkSize` at a time. */
  to: Recipients;
  /** Recipients per request, 1-200 (default 200). */
  chunkSize?: number;
  /** Requests in flight at the same time (default 4). The client rate limit applies as well. */
  concurrency?: number;
  /**
   * When set, each chunk is sent with idempotency key `<prefix>-<chunkSize>-<startIndex>-<hash8>` (hash of the
   * chunk's phone numbers, the same formula in every Bizgo SDK). Re-run with the **same list and the same
   * `chunkSize`** (within `idempotencyTtl`): recipients already accepted come back in `result.duplicates`
   * (code `A301`) instead of being delivered twice. To resend only failed chunks, use the chunk numbers in `result.errors`. Also enables retries
   * after timeouts and 5xx; without it, chunks are retried only on 429. Generated keys must fit in 200 characters.
   * Each chunk is sent with `idempotencyTtl` (default 86400 when the prefix is set).
   */
  idempotencyKeyPrefix?: string;
}

const OMNI_OPTIONS = ['to', 'messages', 'ref', 'groupKey', 'paymentCode', 'idempotencyKey', 'idempotencyTtl'];
const BULK_OPTIONS = [
  'to',
  'messages',
  'ref',
  'groupKey',
  'paymentCode',
  'idempotencyTtl',
  'chunkSize',
  'concurrency',
  'idempotencyKeyPrefix',
];
const SMS_OPTIONS = ['to', 'from', 'text', 'ref', 'idempotencyKey'];
const LMS_OPTIONS = [...SMS_OPTIONS, 'title'];
const MMS_OPTIONS = [...LMS_OPTIONS, 'fileKeys'];

function destinations(to: unknown): unknown[] {
  const items = Array.isArray(to) ? to : [to];
  return items.map((item) => (typeof item === 'string' ? { to: item } : item));
}

function defined(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

function result(body: Json): SendResult {
  const data = isRecord(body.data) ? body.data : {};
  const common = isRecord(body.common) ? body.common : {};
  return new SendResult(
    list<SendDestinationResult>(inner(body).destinations),
    optionalString(data.ref),
    optionalString(common.infobankTrId),
  );
}

function positiveInteger(value: unknown, name: string, fallback: number, max?: number): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || (max !== undefined && value > max)) {
    throw new ValidationError(`${name}: ${max !== undefined ? `1~${max}` : '1 이상의'} 정수여야 합니다`);
  }
  return value;
}

/**
 * `<prefix>-<chunkSize>-<startIndex>-<hash8>` (SDK-DESIGN.md §12.3): `hash8` is the first 8 hex digits of
 * SHA-256 over the chunk's phone numbers in order, joined by a line feed (UTF-8) — the same formula in every Bizgo
 * SDK.
 * Re-running the same list with the same `chunkSize` reproduces the keys (no duplicate delivery), and a key is never
 * reused for a different group of recipients.
 */
export function bulkIdempotencyKey(prefix: string, chunkSize: number, start: number, to: readonly unknown[]): string {
  const numbers = to.map((d) => (typeof d === 'string' ? d : String((d as { to?: unknown } | null)?.to ?? '')));
  const hash = createHash('sha256').update(numbers.join('\n'), 'utf8').digest('hex').slice(0, 8);
  return `${prefix}-${chunkSize}-${start}-${hash}`;
}

const MAX_IDEMPOTENCY_KEY = 200;

/** Point a chunk's issue paths at the input list (`destinations[3]` of the chunk starting at 400 -> `to[403]`). */
function reindex(issues: readonly ValidationIssue[], from: number): ValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.replace(/^destinations\[(\d+)\]/, (_match, i: string) => `to[${from + Number(i)}]`),
    message: issue.message,
  }));
}

/** Send messages. Access as `client.send`. */
export class Send extends SendResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    super(transport);
    this.#transport = transport;
  }

  /**
   * Send one message, with optional fallback channels, to up to 200 recipients.
   *
   * @returns Acceptance result. Check `result.failed` for rejected recipients; with a reused `idempotencyKey`,
   *   recipients already accepted earlier are in `result.duplicates` (`A301`). Final delivery results arrive
   *   later via `client.reports` or webhooks.
   * @throws {@link ValidationError} the request is invalid (checked before anything is sent).
   * @throws {@link APIError} Bizgo rejected the request.
   * @throws {@link APIConnectionError} network failure; the message may or may not have been accepted.
   */
  async omni(params: OmniParams): Promise<SendResult> {
    const options = checkOptions(params, OMNI_OPTIONS, 'send.omni');
    const messages = options.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ValidationError(
        'messages: 비어 있습니다. 채널 메시지를 1개 이상 넣으세요 (예: [sms({ from, text })]).',
      );
    }
    const request = defined({
      destinations: destinations(options.to),
      messageFlow: messages,
      ref: options.ref,
      groupKey: options.groupKey,
      paymentCode: options.paymentCode,
      idempotencyKey: options.idempotencyKey,
      idempotencyTtl: options.idempotencyTtl,
    });
    return this.request(request as unknown as SendOmniRequest);
  }

  /** Send a prepared request body (API field names). It is validated first. */
  async request(request: SendOmniRequest): Promise<SendResult> {
    return this.#submit(validate<SendOmniRequest>('SendOmniRequest', request));
  }

  async #submit(body: SendOmniRequest): Promise<SendResult> {
    // Without an idempotency key a retried send after a timeout could deliver twice.
    const retry = body.idempotencyKey ? 'safe' : 'rateLimitOnly';
    // Bizgo rejects a key without a TTL (A309): fill the default, keep an explicit value (including 0).
    const json = withDefaultIdempotencyTtl(body);
    return result(await this.#transport.request('POST', PATH, { retry, json, operation: OPERATIONS.sendOmni }));
  }

  /**
   * Send one message to any number of recipients, `chunkSize` (max 200) per request with up to `concurrency`
   * requests in flight.
   *
   * Every chunk is validated before anything is sent. A failed chunk does not stop the others: check
   * `result.errors` (chunk number, recipient index range, error), `result.failed` (recipients rejected inside
   * accepted chunks) and `result.duplicates` (recipients already accepted by an earlier run with the same prefix). Recipient numbers never appear in errors or `toString()`.
   *
   * @throws {@link ValidationError} the request is invalid (nothing was sent).
   */
  async bulk(params: BulkParams): Promise<BulkSendResult> {
    const options = checkOptions(params, BULK_OPTIONS, 'send.bulk');
    const chunkSize = positiveInteger(options.chunkSize, 'chunkSize', 200, 200);
    const concurrency = positiveInteger(options.concurrency, 'concurrency', 4);
    const prefix = options.idempotencyKeyPrefix;
    if (prefix !== undefined && (typeof prefix !== 'string' || prefix === '')) {
      throw new ValidationError('idempotencyKeyPrefix: 비어 있지 않은 문자열이어야 합니다');
    }
    const messages = options.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ValidationError(
        'messages: 비어 있습니다. 채널 메시지를 1개 이상 넣으세요 (예: [sms({ from, text })]).',
      );
    }
    const all = destinations(options.to);
    if (all.length === 0) throw new ValidationError('to: 수신자가 없습니다');

    const chunks: { index: number; from: number; to: number; body: SendOmniRequest }[] = [];
    const issues: ValidationIssue[] = [];
    for (let from = 0, index = 0; from < all.length; from += chunkSize, index++) {
      const to = Math.min(from + chunkSize, all.length);
      const chunk = all.slice(from, to);
      const key = prefix === undefined ? undefined : bulkIdempotencyKey(prefix as string, chunkSize, from, chunk);
      if (key !== undefined && key.length > MAX_IDEMPOTENCY_KEY) {
        throw new ValidationError(
          `idempotencyKeyPrefix: 너무 깁니다. 생성되는 키(<prefix>-<chunkSize>-<시작 인덱스>-<hash8>)가 ${MAX_IDEMPOTENCY_KEY}자를 넘습니다`,
        );
      }
      const request = defined({
        destinations: chunk,
        messageFlow: messages,
        ref: options.ref,
        groupKey: options.groupKey,
        paymentCode: options.paymentCode,
        idempotencyKey: key,
        idempotencyTtl: options.idempotencyTtl,
      });
      try {
        chunks.push({ index, from, to, body: validate<SendOmniRequest>('SendOmniRequest', request) });
      } catch (error) {
        if (!(error instanceof ValidationError)) throw error;
        // problems outside `destinations` repeat in every chunk: report each once
        for (const issue of reindex(error.issues, from)) {
          if (!issues.some((seen) => seen.path === issue.path && seen.message === issue.message)) issues.push(issue);
        }
      }
    }
    if (issues.length > 0) throw new ValidationError(issues);

    const results: BulkChunk[] = [];
    const errors: BulkChunkError[] = [];
    let next = 0;
    const worker = async (): Promise<void> => {
      for (let chunk = chunks[next++]; chunk !== undefined; chunk = chunks[next++]) {
        try {
          const sent = await this.#submit(chunk.body);
          results.push({ chunkIndex: chunk.index, fromIndex: chunk.from, toIndex: chunk.to, result: sent });
        } catch (error) {
          const wrapped = error instanceof Error ? error : new Error('알 수 없는 오류');
          errors.push({ chunkIndex: chunk.index, fromIndex: chunk.from, toIndex: chunk.to, error: wrapped });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, chunks.length) }, worker));
    return new BulkSendResult(results, errors);
  }

  /** Send an SMS (text up to 90 bytes in EUC-KR). `from` must be registered in the Bizgo console. */
  async sms(params: SmsParams): Promise<SendResult> {
    const { to, from, text, ref, idempotencyKey } = checkOptions(params, SMS_OPTIONS, 'send.sms');
    return this.omni(
      defined({ to, messages: [{ sms: { from, text } }], ref, idempotencyKey }) as unknown as OmniParams,
    );
  }

  /** Send an LMS (text up to 2,000 bytes in EUC-KR). */
  async lms(params: LmsParams): Promise<SendResult> {
    const { to, from, text, title, ref, idempotencyKey } = checkOptions(params, LMS_OPTIONS, 'send.lms');
    const message = defined({ from, title, text });
    return this.omni(defined({ to, messages: [{ mms: message }], ref, idempotencyKey }) as unknown as OmniParams);
  }

  /** Send an MMS. Get `fileKeys` (max 3) from `client.files.uploadMms()` first. */
  async mms(params: MmsParams): Promise<SendResult> {
    const { to, from, text, title, fileKeys, ref, idempotencyKey } = checkOptions(params, MMS_OPTIONS, 'send.mms');
    if (fileKeys === undefined) {
      throw new ValidationError('fileKeys: 필수 필드입니다 (client.files.uploadMms()로 받은 키, 최대 3개)');
    }
    const fileKey = Array.isArray(fileKeys) ? [...fileKeys] : fileKeys;
    const message = defined({ from, title, text, fileKey });
    return this.omni(defined({ to, messages: [{ mms: message }], ref, idempotencyKey }) as unknown as OmniParams);
  }
}
