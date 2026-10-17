import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'themes/index': 'src/themes/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', /^@chartkitdev\/core(\/.*)?$/],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
