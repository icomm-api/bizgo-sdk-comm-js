/** Walk the send history of the last hour, then look up one message's status. */
import { Bizgo, Environment, type MessageStatus } from '@bizgo/bizgo-sdk-comm-js';
import { isMain } from './_env.ts';

export async function main(client: Bizgo): Promise<void> {
  const since = new Date(Date.now() - 60 * 60 * 1000); // sent as KST automatically
  const failed: MessageStatus[] = [];
  for await (const message of client.messages.iterHistory({ requestTime: since, serviceType: ['SMS', 'ALIMTALK'] })) {
    if (message.reportCode !== '10000') failed.push(message);
  }
  console.log(`최근 1시간 실패 ${failed.length}건`);
  const first = failed[0];
  if (first?.msgKey) {
    for (const step of await client.messages.status(first.msgKey)) {
      // one entry per channel tried (fallback)
      console.log(step.serviceType, step.reportCode, step.reportText);
    }
  }
}

if (isMain(import.meta.url)) {
  await main(new Bizgo({ environment: Environment.SANDBOX }));
}
