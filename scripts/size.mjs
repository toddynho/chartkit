/**
 * Gzip budgets for the three headline bundles.
 * esbuild --bundle --minify, gzip -9, zero externals, same method as npm run bench.
 * Budgets live in scripts/size-budget.json. Exceeding one fails CI.
 */
import { gzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "packages/core/src");

async function gzipOf(entry) {
  const outfile = join(tmpdir(), `chartkit-size-${Math.random().toString(36).slice(2)}.mjs`);
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
  return { minBytes: code.length, gzipBytes: gzipSync(code, { level: 9 }).length, code: code.toString("utf8") };
}

const minimalLine = join(tmpdir(), "chartkit-size-minimal-line.mjs");
writeFileSync(
  minimalLine,
  `import { createRenderer } from ${JSON.stringify(join(src, "render.ts"))};\nimport { line } from ${JSON.stringify(join(src, "charts/line.ts"))};\nexport const render = createRenderer([line]);\n`,
);

const line = await gzipOf(minimalLine);
const all = await gzipOf(join(src, "all.ts"));
const validate = await gzipOf(join(src, "validate.ts"));

const debugOut = join(tmpdir(), "chartkit-size-line-debug.mjs");
await build({
  entryPoints: [minimalLine],
  bundle: true,
  minify: false,
  format: "esm",
  platform: "node",
  outfile: debugOut,
  logLevel: "silent",
});
const debug = readFileSync(debugOut, "utf8");
const isolation = {
  lineOmitsBars: !debug.includes("function bars"),
  lineOmitsCandle: !line.code.includes('data-ck-mark="candle"'),
  lineOmitsRetro: !line.code.includes("#ff7edb"),
  lineOmitsValidator: !line.code.includes("CK1004"),
  allIncludesRetro: all.code.includes("#ff7edb"),
  allIncludesCandle: all.code.includes('data-ck-mark="candle"'),
};

const measured = { line: line.gzipBytes, all: all.gzipBytes, validate: validate.gzipBytes };
const budget = JSON.parse(readFileSync(join(root, "scripts/size-budget.json"), "utf8"));
const failures = [];
for (const key of ["line", "all", "validate"]) {
  if (typeof budget[key] !== "number") failures.push(`${key} budget missing`);
  else if (measured[key] > budget[key]) failures.push(`${key} gzip ${measured[key]} > budget ${budget[key]}`);
}
for (const [key, ok] of Object.entries(isolation)) {
  if (!ok) failures.push(`isolation ${key} failed`);
}

console.log(JSON.stringify({ measured, budget, minBytes: { line: line.minBytes, all: all.minBytes, validate: validate.minBytes }, isolation }, null, 2));
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
