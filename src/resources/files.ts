export type { FileInput } from '../upload.js';

import { ValidationError } from '../errors.js';
import { OPERATIONS } from '../generated/operations.js';
import { FilesResource } from '../generated/resources.js';
import type { BrandMessageFileUploadResult, FileUploadResult, RcsFileUploadResult } from '../generated/types.js';
import type { Json, Transport } from '../transport.js';
import { type FileInput, filePart, loadFile } from '../upload.js';
import { inner, isRecord } from '../util.js';
import { checkOptions } from '../validation.js';

/** Maximum MMS image size: 300KB. */
export const MMS_MAX_BYTES = 300 * 1024;

/** Brand message image type. Each has its own size/ratio rules (see the API reference). */
export type BrandImageKind =
  | 'default'
  | 'wide'
  | 'wideItemList'
  | 'wideItemList/first'
  | 'carouselFeed'
  | 'carouselCommerce';

const BRAND_KINDS: readonly string[] = [
  'default',
  'wide',
  'wideItemList',
  'wideItemList/first',
  'carouselFeed',
  'carouselCommerce',
];

export interface UploadOptions {
  /** File name sent to the server. Defaults to the path's base name, `File.name`, or `image.jpg`. */
  filename?: string;
  /** Your key for the file. The server generates one if omitted. */
  fileKey?: string;
  /** Image name. Defaults to the file name without extension. */
  imageName?: string;
}

export interface BrandUploadOptions extends UploadOptions {
  /** Image type (default `'default'`). */
  kind?: BrandImageKind;
}

const BRAND_OPERATIONS = {
  default: 'uploadBrandMessageDefaultImage',
  wide: 'uploadBrandMessageWideImage',
  wideItemList: 'uploadBrandMessageWideItemListImage',
  'wideItemList/first': 'uploadBrandMessageWideItemListFirstImage',
  carouselFeed: 'uploadBrandMessageCarouselFeedImage',
  carouselCommerce: 'uploadBrandMessageCarouselCommerceImage',
} as const satisfies Record<BrandImageKind, keyof typeof OPERATIONS>;

const UPLOAD_OPTIONS = ['filename', 'fileKey', 'imageName'];

function textOption(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value === '')
    throw new ValidationError(`${name}: 비어 있지 않은 문자열이어야 합니다`);
  return value;
}

async function form(file: FileInput, options: unknown, maxBytes?: number): Promise<FormData> {
  const opts = checkOptions(options, [...UPLOAD_OPTIONS, 'kind'], 'files.upload');
  const filename = textOption(opts.filename, 'filename');
  const fileKey = textOption(opts.fileKey, 'fileKey');
  const imageName = textOption(opts.imageName, 'imageName');
  const loaded = await loadFile(file, filename, 'image.jpg');
  if (maxBytes !== undefined && loaded.bytes.byteLength > maxBytes) {
    throw new ValidationError('file: MMS 이미지는 최대 300KB입니다 (jpg, 권장 1,500×1,440px 이하)');
  }
  const data = new FormData();
  // The Blob is typed from the file name; the multipart Content-Type header itself is left to fetch.
  data.append('file', filePart(loaded), loaded.name);
  if (fileKey !== undefined) data.append('fileKey', fileKey);
  if (imageName !== undefined) data.append('imageName', imageName);
  return data;
}

function unwrap<T>(body: Json): T {
  const data = inner(body);
  return (isRecord(data) ? data : {}) as T;
}

/**
 * Upload images. Access as `client.files`. Uploads are retried only on HTTP 429.
 *
 * The hand-written methods here (`uploadMms`, `uploadRcs`, `uploadBrandMessage`) take the file first; the other
 * upload operations (`uploadBrandMessageWide`, `uploadAlimtalkTemplateImage`, ...) are generated from the spec and
 * take `{ body: { file, ... } }`.
 */
export class Files extends FilesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    super(transport);
    this.#transport = transport;
  }

  /** Upload an MMS image (jpg, max 300KB). Use `result.fileKey` in `mms({ fileKey: [...] })`. */
  async uploadMms(file: FileInput, options?: UploadOptions): Promise<FileUploadResult> {
    checkOptions(options, UPLOAD_OPTIONS, 'files.uploadMms');
    const body = await form(file, options, MMS_MAX_BYTES);
    const response = await this.#transport.request('POST', '/api/comm/v1/file/mms', {
      retry: 'rateLimitOnly',
      form: body,
      operation: OPERATIONS.uploadMmsFile,
    });
    return unwrap<FileUploadResult>(response);
  }

  /** Upload an RCS image. Use `result.media` in the RCS message `body.media`. */
  async uploadRcs(file: FileInput, options?: UploadOptions): Promise<RcsFileUploadResult> {
    checkOptions(options, UPLOAD_OPTIONS, 'files.uploadRcs');
    const body = await form(file, options);
    const response = await this.#transport.request('POST', '/api/comm/v1/file/rcs', {
      retry: 'rateLimitOnly',
      form: body,
      operation: OPERATIONS.uploadRcsFile,
    });
    return unwrap<RcsFileUploadResult>(response);
  }

  /** Upload a Kakao brand message image. Use `result.imgUrl` in the message. */
  async uploadBrandMessage(file: FileInput, options?: BrandUploadOptions): Promise<BrandMessageFileUploadResult> {
    const opts = checkOptions(options, [...UPLOAD_OPTIONS, 'kind'], 'files.uploadBrandMessage');
    const kind = opts.kind ?? 'default';
    if (typeof kind !== 'string' || !BRAND_KINDS.includes(kind)) {
      throw new ValidationError(`kind: 지원하지 않는 브랜드메시지 이미지 종류입니다 (허용: ${BRAND_KINDS.join(', ')})`);
    }
    const body = await form(file, options);
    const path = `/api/comm/v1/file/brandmessage/${kind}`; // whitelisted above; `/` in wideItemList/first is intended
    const response = await this.#transport.request('POST', path, {
      retry: 'rateLimitOnly',
      form: body,
      operation: OPERATIONS[BRAND_OPERATIONS[kind as BrandImageKind]],
    });
    return unwrap<BrandMessageFileUploadResult>(response);
  }
}
