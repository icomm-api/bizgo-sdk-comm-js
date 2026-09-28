import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', testing: 'src/testing.ts', otel: 'src/otel.ts' },
  // optional peer dependency of the ./otel entry; never bundled
  external: ['@opentelemetry/api'],
  tsconfig: 'tsconfig.build.json',
  format: ['esm', 'cjs'],
  dts: true,
  target: 'node18',
  platform: 'node',
  sourcemap: false,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  removeNodeProtocol: false,
});
