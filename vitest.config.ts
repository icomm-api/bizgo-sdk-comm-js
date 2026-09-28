import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // examples import the published package name; run them against the source
    alias: [
      {
        find: /^@bizgo\/bizgo-sdk-comm-js\/testing$/,
        replacement: fileURLToPath(new URL('./src/testing.ts', import.meta.url)),
      },
      {
        find: /^@bizgo\/bizgo-sdk-comm-js\/otel$/,
        replacement: fileURLToPath(new URL('./src/otel.ts', import.meta.url)),
      },
      {
        find: /^@bizgo\/bizgo-sdk-comm-js(\/webhooks)?$/,
        replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
    ],
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
    setupFiles: ['test/setup.ts'],
  },
});
