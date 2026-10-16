/**
 * Honest local numbers for @chartkitdev/core.
 * Bundle size: esbuild minify + gzip -9, no externals (the package has zero runtime deps).
 * Throughput: validate() on the committed examples and on one wider spec.
 * Run from the repo root: npm run bench
 */
import { gzipSync } from "node:zlib";
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import os from "node:os";
import { performance } from "node:perf_hooks";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const core = join(root, "packages/core");

async function bundle(entry) {
  const outfile = join(tmpdir(), `chartkit-bench-${Math.random().toString(36).slice(2)}.mjs`);
  await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  const code = readFileSync(outfile);
  return {
    minBytes: code.length,
    gzipBytes: gzipSync(code, { level: 9 }).length,
  };
}

function loadExamples() {
  const dir = join(core, "examples");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")));
}

function wideSpec(rows) {
  const data = [];
  for (let i = 0; i < rows; i++) data.push({ month: `m${i}`, revenue: i, cost: i / 2 });
  return {
    version: "1",
    type: "line",
    data,
    encoding: {
      x: "month",
      y: [
        { field: "revenue", type: "quantitative" },
        { field: "cost", type: "quantitative" },
      ],
    },
    a11y: { alt: "Synthetic line of revenue and cost used only for the benchmark." },
  };
}

function time(fn, iterations) {
  for (let i = 0; i < 50; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsedMs = performance.now() - start;
  return {
    iterations,
    elapsedMs: Number(elapsedMs.toFixed(2)),
    perOpUs: Number(((elapsedMs * 1000) / iterations).toFixed(2)),
    opsPerSec: Number((iterations / (elapsedMs / 1000)).toFixed(1)),
  };
}

const srcDir = join(core, "src");
const dist = join(core, "dist/index.js");
const tmpEntries = join(tmpdir(), "chartkit-bench-entries");
mkdirSync(tmpEntries, { recursive: true });

function entry(name, body) {
  const path = join(tmpEntries, name);
  writeFileSync(path, body);
  return path;
}

const sizes = {
  source: {
    core: await bundle(join(srcDir, "index.ts")),
    validate: await bundle(join(srcDir, "validate.ts")),
    render: await bundle(join(srcDir, "render.ts")),
  },
  dist: {
    core: await bundle(entry("dist-core.mjs", `export { validate, render } from ${JSON.stringify(dist)};\n`)),
    validate: await bundle(entry("dist-validate.mjs", `export { validate } from ${JSON.stringify(dist)};\n`)),
    render: await bundle(entry("dist-render.mjs", `export { render } from ${JSON.stringify(dist)};\n`)),
  },
};

const outfile = join(tmpdir(), "chartkit-bench-runtime.mjs");
await build({
  entryPoints: [join(core, "src/index.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  logLevel: "silent",
});
const { validate } = await import(outfile);

const examples = loadExamples();
const exampleRun = time(() => {
  for (const spec of examples) validate(spec);
}, 200);
const wide = wideSpec(5000);
const wideRun = time(() => validate(wide), 50);

const report = {
  measuredAt: new Date().toISOString(),
  node: process.version,
  platform: `${os.platform()} ${os.release()} ${os.arch()}`,
  cpu: os.cpus()[0]?.model ?? "unknown",
  cpuCount: os.cpus().length,
  method: {
    bundle:
      "esbuild --bundle --minify, gzip -9, zero externals. source/* bundles the TS modules directly (tree-shaken). dist/* bundles packages/core/dist/index.js, which is what the package exports.",
    throughput:
      "warmup 50, then performance.now() around validate(); examples loop validates all 12 specs per iteration. Runtime is the bundled TS entry, not a separate implementation.",
  },
  bundle: sizes,
  validate: {
    examples: { specsPerIteration: examples.length, ...exampleRun },
    rows5000TwoSeries: wideRun,
  },
};

mkdirSync(join(root, "bench"), { recursive: true });
writeFileSync(join(root, "bench/last-run.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
