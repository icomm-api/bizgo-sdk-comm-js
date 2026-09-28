/** Send an SMS and check the per-recipient acceptance result. */
import { Bizgo, Environment } from '@bizgo/bizgo-sdk-comm-js';
import { env, isMain } from './_env.ts';

export async function main(client: Bizgo, { from, to }: { from: string; to: string }): Promise<void> {
  const result = await client.send.sms({ to, from, text: '[비즈고] 인증번호는 123456 입니다.', ref: 'signup-otp' });

  for (const rejected of result.failed) {
    // accepted != delivered; rejected recipients never get the message
    console.log('접수 실패:', rejected.code, rejected.result);
  }
  console.log('접수된 메시지 키:', result.msgKeys); // the final delivery result comes later as a report
}

if (isMain(import.meta.url)) {
  const client = new Bizgo({ environment: Environment.SANDBOX }); // API key from BIZGO_API_KEY
  await main(client, { from: env('BIZGO_FROM'), to: env('BIZGO_TO') });
}
