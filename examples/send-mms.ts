/** Upload an image, then send an MMS with it. */
import { readFile } from 'node:fs/promises';
import { Bizgo, Environment } from '@bizgo/bizgo-sdk-comm-js';
import { env, isMain } from './_env.ts';

export async function main(client: Bizgo, { from, to, image }: { from: string; to: string; image: Uint8Array }) {
  const uploaded = await client.files.uploadMms(image, { filename: 'banner.jpg' }); // jpg, max 300KB
  if (!uploaded.fileKey) throw new Error('업로드 응답에 fileKey가 없습니다');
  const result = await client.send.mms({
    to,
    from,
    title: '이벤트 안내',
    text: '첨부 이미지를 확인해 주세요.',
    fileKeys: [uploaded.fileKey],
  });
  console.log('접수:', result.msgKeys, '파일 키 만료:', uploaded.expired);
}

if (isMain(import.meta.url)) {
  const client = new Bizgo({ environment: Environment.SANDBOX });
  await main(client, { from: env('BIZGO_FROM'), to: env('BIZGO_TO'), image: await readFile(env('BIZGO_IMAGE')) });
}
