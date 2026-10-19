import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@chartkitdev/core/export', replacement: path.resolve(__dirname, '../core/src/export.ts') },
      { find: '@chartkitdev/core/extra-tip', replacement: path.resolve(__dirname, '../core/src/extra-tip.ts') },
      { find: '@chartkitdev/core/extra', replacement: path.resolve(__dirname, '../core/src/extra.ts') },
      { find: '@chartkitdev/core/load', replacement: path.resolve(__dirname, '../core/src/load.ts') },
      { find: '@chartkitdev/core/interact', replacement: path.resolve(__dirname, '../core/src/interact.ts') },
      { find: '@chartkitdev/core/all', replacement: path.resolve(__dirname, '../core/src/all.ts') },
      { find: '@chartkitdev/core/validate', replacement: path.resolve(__dirname, '../core/src/validate.ts') },
      { find: '@chartkitdev/core/charts', replacement: path.resolve(__dirname, '../core/src/charts') },
      { find: '@chartkitdev/core/themes', replacement: path.resolve(__dirname, '../core/src/themes') },
      { find: '@chartkitdev/core', replacement: path.resolve(__dirname, '../core/src/index.ts') },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/setup.ts',
      ],
    },
  },
});
