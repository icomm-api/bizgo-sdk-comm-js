import { ValidationError } from '../errors.js';
import { OPERATIONS } from '../generated/operations.js';
import { MessagesResource } from '../generated/resources.js';
import type { MessageStatistics, MessageStatus, MoMessage } from '../generated/types.js';
import type { MessagePage, MoPage } from '../results.js';
import type { Json, Transport } from '../transport.js';
import {
  cursor,
  inner,
  limit,
  list,
  localTime,
  offsetTime,
  optionalNumber,
  optionalText,
  segment,
  yyyymmdd,
} from '../util.js';
import { checkOptions } from '../validation.js';

/** `SMS`, `MMS`, `RCS`, `ALIMTALK`, `BRANDMESSAGE` (other values are passed through). */
export type ServiceType = 'SMS' | 'MMS' | 'RCS' | 'ALIMTALK' | 'BRANDMESSAGE' | (string & {});

export interface StatisticsParams {
  /** Start date. A `Date` is converted to the KST date; a string must be `YYYYMMDD`. */
  startDate: Date | string;
  /** End date (same format as `startDate`). */
  endDate?: Date | string;
  serviceType?: ServiceType;
  groupKey?: string;
}

export interface HistoryParams {
  /** Start time. A `Date` is converted to KST `yyyy-MM-dd'T'HH:mm:ss`; a string is sent as is. */
  requestTime: Date | string;
  /** One type or several (sent comma-separated). */
  serviceType?: ServiceType | readonly ServiceType[];
  groupKey?: string;
  /** Cursor from the previous page. */
  lastSeq?: number;
  /** Page size, 1-1000 (server default 100). */
  limit?: number;
}

export type IterHistoryParams = Omit<HistoryParams, 'lastSeq'>;

export interface MoHistoryParams {
  /** Start time. A `Date` is sent in KST with `+09:00`; a string must carry an offset. */
  occurredTime: Date | string;
  /** Filter by sender number. */
  from?: string;
  /** Filter by MO number. */
  to?: string;
  lastSeq?: number;
  /** Page size, 1-1000 (server default 100). */
  limit?: number;
}

export type IterMoHistoryParams = Omit<MoHistoryParams, 'lastSeq'>;

const STATS_OPTIONS = ['startDate', 'endDate', 'serviceType', 'groupKey'];
const HISTORY_OPTIONS = ['requestTime', 'serviceType', 'groupKey', 'lastSeq', 'limit'];
const MO_OPTIONS = ['occurredTime', 'from', 'to', 'lastSeq', 'limit'];

function required<T>(value: T | undefined, name: string): T {
  if (value === undefined || value === null) throw new ValidationError(`${name}: 필수 필드입니다`);
  return value;
}

function serviceTypes(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item)) {
    return value.join(',');
  }
  throw new ValidationError('serviceType: 문자열 또는 문자열 배열이어야 합니다');
}

function page<T>(body: Json): { messages: T[]; lastSeq: number | undefined; hasNext: boolean } {
  const data = inner(body);
  return { messages: list<T>(data.messages), lastSeq: optionalNumber(data.lastSeq), hasNext: data.hasNext === true };
}

/** Message status, history and statistics. Access as `client.messages`. Default limit: 5 requests/second. */
export class Messages extends MessagesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    super(transport);
    this.#transport = transport;
  }

  /** Acceptance/send/report status of one message. With fallback there is one entry per channel tried. */
  async status(msgKey: string): Promise<MessageStatus[]> {
    const path = `/api/comm/v1/message/inquiry/msgKey/${segment(msgKey, 'msgKey')}`;
    const op = OPERATIONS.getMessageStatusByMsgKey;
    return page<MessageStatus>(await this.#transport.request('GET', path, { retry: 'safe', operation: op })).messages;
  }

  /** Status of every message in one broadcast request. `requestId` is `msgKey` without its last 3 characters. */
  async statusByRequestId(requestId: string): Promise<MessageStatus[]> {
    const path = `/api/comm/v1/message/inquiry/requestId/${segment(requestId, 'requestId')}`;
    const op = OPERATIONS.getMessageStatusByRequestId;
    return page<MessageStatus>(await this.#transport.request('GET', path, { retry: 'safe', operation: op })).messages;
  }

  /** Daily acceptance and report counts. */
  async statistics(params: StatisticsParams): Promise<MessageStatistics[]> {
    const options = checkOptions(params, STATS_OPTIONS, 'messages.statistics');
    const query = {
      startDate: yyyymmdd(required(options.startDate as Date | string, 'startDate'), 'startDate'),
      endDate: options.endDate === undefined ? undefined : yyyymmdd(options.endDate as Date | string, 'endDate'),
      serviceType: optionalText(options.serviceType, 'serviceType'),
      groupKey: optionalText(options.groupKey, 'groupKey'),
    };
    const body = await this.#transport.request('GET', '/api/comm/v1/message/statistics', {
      retry: 'safe',
      query,
      operation: OPERATIONS.getMessageStatistics,
    });
    return list<MessageStatistics>(inner(body).statistics);
  }

  /** One page of send history from `requestTime` (KST). Use {@link Messages.iterHistory} to walk all pages. */
  async history(params: HistoryParams): Promise<MessagePage> {
    const options = checkOptions(params, HISTORY_OPTIONS, 'messages.history');
    const query = {
      requestTime: localTime(required(options.requestTime as Date | string, 'requestTime'), 'requestTime'),
      serviceType: serviceTypes(options.serviceType),
      groupKey: optionalText(options.groupKey, 'groupKey'),
      lastSeq: cursor(options.lastSeq),
      limit: limit(options.limit),
    };
    const body = await this.#transport.request('GET', '/api/comm/v1/message/history', {
      retry: 'safe',
      query,
      operation: OPERATIONS.getMessageHistory,
    });
    return page<MessageStatus>(body);
  }

  /**
   * Iterate over all send history from `requestTime`, following `lastSeq` across pages.
   * Stops when `hasNext` is false, `lastSeq` is missing, or the cursor does not move.
   */
  async *iterHistory(params: IterHistoryParams): AsyncGenerator<MessageStatus, void, undefined> {
    const options = checkOptions(
      params,
      HISTORY_OPTIONS.filter((name) => name !== 'lastSeq'),
      'messages.iterHistory',
    );
    let lastSeq: number | undefined;
    while (true) {
      const current: MessagePage = await this.history({ ...(options as unknown as HistoryParams), lastSeq });
      yield* current.messages;
      if (!current.hasNext || current.lastSeq === undefined || current.lastSeq === lastSeq) return;
      lastSeq = current.lastSeq;
    }
  }

  /** Look up an MO (inbound) message by key. The same key can have several entries. */
  async mo(msgKey: string): Promise<MoMessage[]> {
    const path = `/api/comm/v1/message/inquiry/mo/msgKey/${segment(msgKey, 'msgKey')}`;
    const op = OPERATIONS.getMoByMsgKey;
    return page<MoMessage>(await this.#transport.request('GET', path, { retry: 'safe', operation: op })).messages;
  }

  /** One page of MO history, newest first, from `occurredTime`. */
  async moHistory(params: MoHistoryParams): Promise<MoPage> {
    const options = checkOptions(params, MO_OPTIONS, 'messages.moHistory');
    const query = {
      occurredTime: offsetTime(required(options.occurredTime as Date | string, 'occurredTime'), 'occurredTime'),
      from: optionalText(options.from, 'from'),
      to: optionalText(options.to, 'to'),
      lastSeq: cursor(options.lastSeq),
      limit: limit(options.limit),
    };
    const body = await this.#transport.request('GET', '/api/comm/v1/message/history/mo', {
      retry: 'safe',
      query,
      operation: OPERATIONS.getMoHistory,
    });
    return page<MoMessage>(body);
  }

  /** Iterate over all MO history pages. Same stop rules as {@link Messages.iterHistory}. */
  async *iterMoHistory(params: IterMoHistoryParams): AsyncGenerator<MoMessage, void, undefined> {
    const options = checkOptions(
      params,
      MO_OPTIONS.filter((name) => name !== 'lastSeq'),
      'messages.iterMoHistory',
    );
    let lastSeq: number | undefined;
    while (true) {
      const current: MoPage = await this.moHistory({ ...(options as unknown as MoHistoryParams), lastSeq });
      yield* current.messages;
      if (!current.hasNext || current.lastSeq === undefined || current.lastSeq === lastSeq) return;
      lastSeq = current.lastSeq;
    }
  }
}
