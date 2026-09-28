/**
 * Shared multipart helpers: read a file once (reused on retries), pick a content type from the file name.
 *
 * @module
 */
import { ValidationError } from './errors.js';

/**
 * A file path (read with `node:fs/promises`), raw bytes (`Buffer`/`Uint8Array`/`ArrayBuffer`) or a `Blob`/`File`.
 * The content is read once and reused if the upload is retried.
 */
export type FileInput = string | Uint8Array | ArrayBuffer | Blob;

/** A file with an explicit name (sent as the multipart file name; the extension picks the content type). */
export interface NamedFile {
  data: Uint8Array | ArrayBuffer | Blob;
  filename: string;
}

/** A file field of a generated multipart operation. */
export type UploadFile = FileInput | NamedFile;

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  pdf: 'application/pdf',
  txt: 'text/plain',
  csv: 'text/csv',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  mp4: 'video/mp4',
  zip: 'application/zip',
};

export function contentType(filename: string): string {
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.') + 1).toLowerCase() : '';
  return CONTENT_TYPES[ext] ?? 'application/octet-stream';
}

export interface LoadedFile {
  name: string;
  bytes: Uint8Array;
}

function isNamed(file: unknown): file is NamedFile {
  return (
    typeof file === 'object' &&
    file !== null &&
    !(file instanceof Uint8Array) &&
    !(file instanceof ArrayBuffer) &&
    !(typeof Blob !== 'undefined' && file instanceof Blob) &&
    'data' in file &&
    'filename' in file
  );
}

/** True for anything {@link loadFile} accepts. Used by request validation (no I/O). */
export function isUploadFile(file: unknown): boolean {
  if (typeof file === 'string') return file !== '';
  if (file instanceof Uint8Array || file instanceof ArrayBuffer) return true;
  if (typeof Blob !== 'undefined' && file instanceof Blob) return true;
  if (isNamed(file)) return typeof file.filename === 'string' && file.filename !== '' && isUploadFile(file.data);
  return false;
}

/** Read a file once. Error messages name the field, never the path or content. */
export async function loadFile(file: unknown, filename: string | undefined, fallbackName: string): Promise<LoadedFile> {
  if (isNamed(file)) {
    if (typeof file.filename !== 'string' || file.filename === '') {
      throw new ValidationError('file: filename은 비어 있지 않은 문자열이어야 합니다');
    }
    return loadFile(file.data, filename ?? file.filename, fallbackName);
  }
  if (typeof file === 'string') {
    if (file === '') throw new ValidationError('file: 파일 경로가 비어 있습니다');
    const [{ readFile }, { basename }] = await Promise.all([import('node:fs/promises'), import('node:path')]);
    let bytes: Uint8Array;
    try {
      bytes = new Uint8Array(await readFile(file));
    } catch (error) {
      // §12.18: an SDK error with the file name only (the full path can contain user or customer names)
      const code = (error as { code?: unknown } | null)?.code;
      const reason = typeof code === 'string' && /^[A-Z0-9_]{1,20}$/.test(code) ? code : 'read error';
      throw new ValidationError([{ path: 'file', message: `파일을 읽을 수 없습니다: ${basename(file)} (${reason})` }]);
    }
    return { name: filename ?? basename(file), bytes };
  }
  if (file instanceof Uint8Array) return { name: filename ?? fallbackName, bytes: file };
  if (file instanceof ArrayBuffer) return { name: filename ?? fallbackName, bytes: new Uint8Array(file) };
  if (typeof Blob !== 'undefined' && file instanceof Blob) {
    const own = (file as { name?: unknown }).name;
    const name = filename ?? (typeof own === 'string' && own ? own : fallbackName);
    return { name, bytes: new Uint8Array(await file.arrayBuffer()) };
  }
  throw new ValidationError(
    'file: 파일 경로(string), Buffer/Uint8Array, ArrayBuffer, Blob, { data, filename } 중 하나여야 합니다',
  );
}

/** The multipart part for a loaded file. The multipart Content-Type header itself is left to fetch. */
export function filePart(loaded: LoadedFile): Blob {
  return new Blob([loaded.bytes as Uint8Array<ArrayBuffer>], { type: contentType(loaded.name) });
}
