/**
 * Gzip budgets for the headline bundles and the framework adapters.
 * esbuild --bundle --minify, gzip -9, platform node, same method as npm run bench.
 * Core bundles have zero externals. Adapter bundles externalize @chartkitdev/core and the framework.
 * Budgets live in scripts/size-budget.json. Exceeding one fails CI.
 */
import { gzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { compile } from "svelte/compiler";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "packages/core/src");

const externalFramework = {
  name: "external-framework",
  setup(build) {
    build.onResolve({ filter: /^(vue|svelte|@chartkitdev\/core)(\/|$)/ }, (args) => ({
      path: args.path,
      external: true,
    }));
  },
};

async function gzipOf(entry, { external = false } = {}) {
  const outfile = join(tmpdir(), `chartkit-size-${Math.random().toString(36).slice(2)}.mjs`);
  await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "node",
    outfile,
    plugins: external ? [externalFramework] : [],
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

const vue = await gzipOf(join(root, "packages/vue/src/Chart.ts"), { external: true });
const vanilla = await gzipOf(join(root, "packages/vanilla/src/index.ts"), { external: true });
const svelteCompiled = compile(readFileSync(join(root, "packages/svelte/src/Chart.svelte"), "utf8"), {
  filename: "Chart.svelte",
  generate: "client",
  css: "external",
});
const svelteEntry = join(tmpdir(), "chartkit-size-svelte.js");
writeFileSync(svelteEntry, svelteCompiled.js.code);
const svelte = await gzipOf(svelteEntry, { external: true });
for (const [name, built] of [["vue", vue], ["svelte", svelte], ["vanilla", vanilla]]) {
  if (built.code.includes("function bars") || built.code.includes("CK1004")) {
    isolation[`${name}OmitsCore`] = false;
  } else {
    isolation[`${name}OmitsCore`] = true;
  }
}

const extra = await gzipOf(join(src, "extra.ts"));
const extraTypes = ["histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall"];
const chartSizes = {};
for (const name of extraTypes) chartSizes[name] = await gzipOf(join(src, "charts", `${name}.ts`));
if (all.code.includes('data-ck-renderer="histogram"') || all.code.includes('data-ck-mark="whisker"')) {
  isolation.allOmitsExtra = false;
} else {
  isolation.allOmitsExtra = true;
}

const measured = {
  line: line.gzipBytes,
  all: all.gzipBytes,
  validate: validate.gzipBytes,
  vue: vue.gzipBytes,
  svelte: svelte.gzipBytes,
  vanilla: vanilla.gzipBytes,
  extra: extra.gzipBytes,
};
for (const name of extraTypes) measured[name] = chartSizes[name].gzipBytes;
const budget = JSON.parse(readFileSync(join(root, "scripts/size-budget.json"), "utf8"));
const failures = [];
for (const key of ["line", "all", "validate", "vue", "svelte", "vanilla", "extra", "histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall"]) {
  if (typeof budget[key] !== "number") failures.push(`${key} budget missing`);
  else if (measured[key] > budget[key]) failures.push(`${key} gzip ${measured[key]} > budget ${budget[key]}`);
}
for (const [key, ok] of Object.entries(isolation)) {
  if (!ok) failures.push(`isolation ${key} failed`);
}

console.log(JSON.stringify({
  measured,
  budget,
  minBytes: {
    line: line.minBytes,
    all: all.minBytes,
    validate: validate.minBytes,
    vue: vue.minBytes,
    svelte: svelte.minBytes,
    vanilla: vanilla.minBytes,
    extra: extra.minBytes,
    ...Object.fromEntries(extraTypes.map((name) => [name, chartSizes[name].minBytes])),
  },
  isolation,
}, null, 2));
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
