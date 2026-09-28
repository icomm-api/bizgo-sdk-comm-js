/**
 * TypeScript/JavaScript SDK for the Bizgo Communication API.
 *
 * ```ts
 * import { Bizgo, Environment, alimtalk, sms } from '@bizgo/bizgo-sdk-comm-js';
 *
 * const client = new Bizgo({ environment: Environment.SANDBOX }); // API key from BIZGO_API_KEY
 *
 * // AlimTalk, falling back to SMS if it fails
 * const result = await client.send.omni({
 *   to: '01000000000',
 *   messages: [
 *     alimtalk({ senderKey: 'SENDER_KEY', templateCode: 'TEMPLATE_CODE', msgType: 'AT', text: '...' }),
 *     sms({ from: '01000000000', text: '...' }),
 *   ],
 *   idempotencyKey: 'order-1234',
 * });
 * ```
 *
 * See https://developers.bizgo.io/api-sdk/api-reference for the API itself.
 *
 * @packageDocumentation
 */
export { alimtalk, brandMessage, international, mms, naverTalk, rcs, sms } from './channels.js';
export { Bizgo, type ClientOptions } from './client.js';
export { Environment } from './config.js';
export {
  APIConnectionError,
  APIError,
  type APIErrorInit,
  APITimeoutError,
  AuthenticationError,
  BadRequestError,
  BizgoError,
  ConfigurationError,
  DuplicateRequestError,
  type ErrorLayer,
  InternalServerError,
  InvalidResponseError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  ValidationError,
  type ValidationIssue,
  WebhookVerificationError,
} from './errors.js';
export { SERVICE_CODES } from './generated/error-codes.js';
export { OPERATIONS, type OperationId } from './generated/operations.js';
export * from './generated/resources.js';
export type * from './generated/types.js';
export { WEBHOOKS, type WebhookName, type WebhookPayloads, type WebhookSpec } from './generated/webhooks.js';
export { combineHooks, type Hooks, type RequestEvent } from './hooks.js';
export { DEFAULT_IDEMPOTENCY_TTL } from './idempotency.js';
export type { AppInfo } from './identity.js';
export { maskPhone, redact } from './mask.js';
export type { Operation, ResultPath } from './operation.js';
export { DEFAULT_RATE_LIMIT, type RateLimitOptions } from './rate-limit.js';
export {
  type BrandImageKind,
  type BrandUploadOptions,
  type FileInput,
  Files,
  MMS_MAX_BYTES,
  type UploadOptions,
} from './resources/files.js';
export {
  type HistoryParams,
  type IterHistoryParams,
  type IterMoHistoryParams,
  Messages,
  type MoHistoryParams,
  type ServiceType,
  type StatisticsParams,
} from './resources/messages.js';
export { type ConsumeOptions, Reports } from './resources/reports.js';
export {
  type BulkParams,
  type LmsParams,
  type MmsParams,
  type OmniParams,
  type Recipient,
  type Recipients,
  Send,
  type SmsParams,
} from './resources/send.js';
export {
  type BulkChunk,
  type BulkChunkError,
  BulkSendResult,
  type MessagePage,
  type MoPage,
  ReportBatch,
  SendResult,
} from './results.js';
export type { Fetch, Logger } from './transport.js';
export type { NamedFile, UploadFile } from './upload.js';
export { VERSION } from './version.js';
export {
  ack,
  counselAck,
  DEFAULT_TOLERANCE_SECONDS,
  MAX_BODY_BYTES,
  parseMo,
  parseReport,
  parseWebhook,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  type VerifySignatureParams,
  verifySignature,
  type WebhookBody,
  type WebhookHeaders,
  WebhookReceiver,
  type WebhookReceiverOptions,
  type WebhookSecret,
} from './webhooks.js';
