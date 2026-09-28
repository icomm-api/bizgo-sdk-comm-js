/** Send to several recipient groups concurrently. */
import { Bizgo, Environment, sms } from '@bizgo/bizgo-sdk-comm-js';
import { env, isMain } from './_env.ts';

export async function main(client: Bizgo, { from, groups }: { from: string; groups: string[][] }): Promise<void> {
  const message = sms({ from, text: '[비즈고] 점검 안내: 오늘 23시부터 1시간' });
  // each request takes up to 200 recipients; the default send limit is 200 requests per second
  const results = await Promise.all(groups.map((group) => client.send.omni({ to: group, messages: [message] })));
  const accepted = results.reduce((sum, r) => sum + r.succeeded.length, 0);
  const rejected = results.reduce((sum, r) => sum + r.failed.length, 0);
  console.log('접수:', accepted, '실패:', rejected);
}

if (isMain(import.meta.url)) {
  const client = new Bizgo({ environment: Environment.SANDBOX });
  await main(client, { from: env('BIZGO_FROM'), groups: [[env('BIZGO_TO')]] });
}
