/**
 * Defensive JSON input handling shared by responses and webhooks (SDK-DESIGN.md §12.7, §12.8).
 *
 * @module
 */

/** Deepest JSON nesting accepted in a response or webhook body (all SDKs use 64). */
export const MAX_JSON_DEPTH = 64;

/** Largest response body read, after decompression (16MB). */
export const MAX_RESPONSE_BYTES = 16 * 1024 * 1024;

/**
 * `true` if `text` nests objects/arrays deeper than `max` levels (the root container is level 1).
 * A linear scan that skips string contents, run before `JSON.parse` so a hostile body never reaches the parser.
 */
export function tooDeep(text: string, max = MAX_JSON_DEPTH): boolean {
  let depth = 0;
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (inString) {
      if (c === 0x5c)
        i++; // backslash: skip the escaped character
      else if (c === 0x22) inString = false;
      continue;
    }
    if (c === 0x22) inString = true;
    else if (c === 0x7b || c === 0x5b) {
      depth++;
      if (depth > max) return true;
    } else if (c === 0x7d || c === 0x5d) depth--;
  }
  return false;
}

/** Thrown by {@link readLimited} when the body is larger than the limit. */
export class BodyTooLarge extends Error {}

/**
 * Read a response body as UTF-8 text, stopping (and cancelling the stream) once more than `limit` bytes arrived.
 * `fetch` decompresses gzip/br/deflate itself, so the limit applies to the decompressed size.
 */
export async function readLimited(response: Response, limit = MAX_RESPONSE_BYTES): Promise<string> {
  const stream = response.body;
  if (!stream) return '';
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let size = 0;
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => undefined);
      throw new BodyTooLarge();
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}
