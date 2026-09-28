import { pathToFileURL } from 'node:url';

/** Read example settings from environment variables (never hard-code keys or phone numbers). */
export function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`환경변수 ${name}를 설정하세요 (examples/README.md 참고)`);
    process.exit(1);
  }
  return value;
}

/** True when the file is run directly (`node examples/send-sms.ts`), false when a test imports it. */
export function isMain(moduleUrl: string): boolean {
  const script = process.argv[1];
  return script !== undefined && moduleUrl === pathToFileURL(script).href;
}
