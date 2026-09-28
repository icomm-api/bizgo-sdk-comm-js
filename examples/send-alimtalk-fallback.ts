/** Send a Kakao AlimTalk message; if it fails, Bizgo sends the SMS instead (fallback). */
import { createHash } from 'node:crypto';
import { alimtalk, Bizgo, DuplicateRequestError, Environment, sms } from '@bizgo/bizgo-sdk-comm-js';
import { env, isMain } from './_env.ts';

interface Options {
  from: string;
  to: string;
  senderKey: string;
  templateCode: string;
}

export async function main(client: Bizgo, { from, to, senderKey, templateCode }: Options): Promise<void> {
  const orderId = '20260923-0001';
  // same key => Bizgo rejects a second send, so retries after a timeout are safe
  const recipientHash = createHash('sha256').update(to).digest('hex').slice(0, 16);
  try {
    const result = await client.send.omni({
      to: [{ to, replaceWords: { name: '홍길동', order: orderId } }],
      messages: [
        alimtalk({
          senderKey,
          templateCode,
          msgType: 'AT',
          text: '#{name}님, 주문(#{order})이 접수되었습니다.', // must match the approved template
        }),
        sms({ from, text: '#{name}님, 주문(#{order})이 접수되었습니다.' }),
      ],
      idempotencyKey: `order-${orderId}-${recipientHash}`,
      ref: orderId,
    });
    console.log(
      '접수:',
      result.msgKeys,
      '실패:',
      result.failed.map((d) => d.code),
    );
  } catch (error) {
    if (error instanceof DuplicateRequestError) {
      console.log('이미 발송된 주문입니다.');
      return;
    }
    throw error;
  }
}

if (isMain(import.meta.url)) {
  const client = new Bizgo({ environment: Environment.SANDBOX });
  await main(client, {
    from: env('BIZGO_FROM'),
    to: env('BIZGO_TO'),
    senderKey: env('BIZGO_KAKAO_SENDER_KEY'),
    templateCode: env('BIZGO_KAKAO_TEMPLATE_CODE'),
  });
}
