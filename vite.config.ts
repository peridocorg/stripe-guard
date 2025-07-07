import { availableParallelism, cpus } from 'node:os'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [Inspect(), tsconfigPaths()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'stripe-guard',
    },
    rollupOptions: {
      external: [/^node:/, 'stripe'],
    },
    target: 'es2022',
    outDir: 'dist',
    minify: true,
    emptyOutDir: true,
  },
  test: {
    ui: true,
    // watchTriggerPatterns: [{ pattern: /src\/.*\.ts$/ }],
    maxConcurrency: Math.max(
      Math.floor((availableParallelism() ?? cpus().length) / 2),
      1,
    ),
    coverage: {
      enabled: true,
      provider: 'v8',
      excludeAfterRemap: true,
      reportsDirectory: './test/coverage',
      include: ['src/**/*.{ts,tsx}'],
    },
    // setupFiles: ["./test/apply-migrations.ts"],
    globalSetup: ['./test/global-setup.ts'],
  },
})
