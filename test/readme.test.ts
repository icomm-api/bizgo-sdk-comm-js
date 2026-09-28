/**
 * §12.13: every ```ts snippet in README.md must pass `tsc --strict` against the source. Snippets are checked as
 * separate modules with a few documented placeholders declared in a globals file (the client, your HTTP framework's
 * `req`/`res`, your database, ...).
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const ROOT = new URL('..', import.meta.url);
const root = (path: string) => new URL(path, ROOT).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const GLOBALS = `
import type * as B from '@bizgo/bizgo-sdk-comm-js';
declare global {
  const client: B.Bizgo;
  const recipients: string[];
  const payload: Record<string, unknown>;
  const req: { headers: Record<string, string> };
  const rawBody: string;
  const res: { status(code: number): { json(body: unknown): void }; json(body: unknown): void };
  const db: { upsert(msgKey: string | undefined, reportCode: string | undefined): Promise<void> };
  const metrics: { histogram(name: string, value: number | undefined, tags: Record<string, string>): void };
  const log: { debug(line: string): void };
  const myFetch: B.Fetch;
  function enqueue(value: unknown): void;
  const buffer: Uint8Array;
  const blob: Blob;
  const msgKey: string;
  const requestId: string;
  const expect: (value: unknown) => { toBe(v: unknown): void; toMatchObject(v: unknown): void };
}
export {};
`;

function snippets(): string[] {
  const text = readFileSync(root('README.md'), 'utf8');
  return [...text.matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1] ?? '');
}

describe('README', () => {
  it('has TypeScript snippets', () => {
    expect(snippets().length).toBeGreaterThan(10);
  });

  it('type-checks every ts snippet under strict mode', () => {
    const dir = mkdtempSync(join(tmpdir(), 'bizgo-readme-'));
    try {
      mkdirSync(join(dir, 'snippets'));
      writeFileSync(join(dir, 'globals.d.ts'), GLOBALS);
      const files = snippets().map((code, i) => {
        const file = join(dir, 'snippets', `s${String(i + 1).padStart(2, '0')}.mts`);
        writeFileSync(file, `${code}\nexport {};\n`);
        return file;
      });
      const src = root('src/');
      const program = ts.createProgram([join(dir, 'globals.d.ts'), ...files], {
        strict: true,
        noEmit: true,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
        types: ['node'],
        typeRoots: [root('node_modules/@types')],
        skipLibCheck: true,
        allowImportingTsExtensions: true,
        baseUrl: dir,
        paths: {
          '@bizgo/bizgo-sdk-comm-js': [`${src}index.ts`],
          '@bizgo/bizgo-sdk-comm-js/webhooks': [`${src}index.ts`],
          '@bizgo/bizgo-sdk-comm-js/testing': [`${src}testing.ts`],
          '@bizgo/bizgo-sdk-comm-js/otel': [`${src}otel.ts`],
          '@opentelemetry/api': [root('node_modules/@opentelemetry/api/build/src/index.d.ts')],
        },
      });
      const problems = ts
        .getPreEmitDiagnostics(program)
        .filter((d) => d.file === undefined || d.file.fileName.includes('snippets'))
        .map((d) => {
          const where = d.file
            ? `${d.file.fileName.split(/[\\/]/).pop()}:${d.file.getLineAndCharacterOfPosition(d.start ?? 0).line + 1}`
            : '';
          return `${where} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`;
        });
      expect(problems).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});
