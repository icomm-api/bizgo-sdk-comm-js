/** Process delivery reports with polling (the API key must be set to POLLING in the console). */
import { Bizgo, Environment, type Report } from '@bizgo/bizgo-sdk-comm-js';
import { isMain } from './_env.ts';

export const store = new Map<string, string>(); // stand-in for your database

async function save(reports: readonly Report[]): Promise<void> {
  for (const report of reports) {
    // upsert by msgKey: a batch is delivered again if this function throws before the ack
    const state = report.reportCode === '10000' ? 'delivered' : `failed:${report.reportCode}`;
    store.set(report.msgKey ?? '', state);
  }
}

export async function main(client: Bizgo): Promise<void> {
  const handled = await client.reports.consume(save); // polls, calls save(), acks only after save() succeeded
  console.log(`리포트 ${handled}건 처리`);
}

if (isMain(import.meta.url)) {
  await main(new Bizgo({ environment: Environment.SANDBOX }));
}
