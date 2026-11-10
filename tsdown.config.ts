import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'dist',
  format: 'esm',
  platform: 'node',
  target: 'node16',
  dts: false,
  clean: true,
  minify: true,
  sourcemap: false,
  treeshake: true,
  external: [
    'node:fs',
    'node:path',
    'node:url',
    'node:module',
    'node:util',
    'typescript',
    'stripe',
    'rollup',
    '@rollup/plugin-node-resolve',
    'rollup-plugin-sourcemaps',
    'terser',
    'expect-type',
    'type-fest',
    'ts-patch',
    'ts-runtime-checks',
  ],
  outExtensions: ({ format }) => ({
    js: format === 'es' ? '.js' : '.cjs',
  }),
})
