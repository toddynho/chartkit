// @vitest-environment node
import path from 'node:path';
import { build } from 'esbuild';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../..');
const legacyDirs = ['src/components/', 'src/hooks/', 'src/themes/', 'src/utils/'];

/** Bundle one import statement the way an app bundler would, and list the source files that ended up in the output. */
async function bundledFiles(code: string): Promise<string[]> {
  const result = await build({
    stdin: { contents: code, resolveDir: root, loader: 'ts' },
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    jsx: 'automatic',
    metafile: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', '@chartkitdev/core', '@chartkitdev/core/*'],
    logLevel: 'silent',
  });
  return Object.values(result.metafile.outputs).flatMap((output) =>
    Object.entries(output.inputs)
      .filter(([, input]) => input.bytesInOutput > 0)
      .map(([file]) => file),
  );
}

const legacyFiles = (files: string[]) => files.filter((file) => legacyDirs.some((dir) => file.includes(dir)));

describe('entry isolation', () => {
  it('keeps the legacy components out of a bundle that imports only Chart', async () => {
    const files = await bundledFiles(`import { Chart } from './src/index'; console.log(Chart);`);
    expect(files.some((file) => file.endsWith('src/Chart.tsx'))).toBe(true);
    expect(legacyFiles(files)).toEqual([]);
  });

  it('keeps them out when the spec helpers are imported too', async () => {
    const files = await bundledFiles(
      `import { Chart, validate, render, toSVG, attach } from './src/index'; console.log(Chart, validate, render, toSVG, attach);`,
    );
    expect(legacyFiles(files)).toEqual([]);
  });

  it('still serves the deprecated names from the main entry', async () => {
    const files = await bundledFiles(`import { LineChart } from './src/index'; console.log(LineChart);`);
    expect(files.some((file) => file.endsWith('src/components/LineChart.tsx'))).toBe(true);
  });

  it('serves the same components from the legacy entry, without Chart', async () => {
    const files = await bundledFiles(`import { LineChart } from './src/legacy'; console.log(LineChart);`);
    expect(files.some((file) => file.endsWith('src/components/LineChart.tsx'))).toBe(true);
    expect(files.some((file) => file.endsWith('src/Chart.tsx'))).toBe(false);
  });

  it('exports the same names from the main entry as from the legacy entry', async () => {
    const main = await import('../index');
    const legacy = await import('../legacy');
    for (const name of Object.keys(legacy)) {
      expect(main[name as keyof typeof main], name).toBe(legacy[name as keyof typeof legacy]);
    }
  });
});
