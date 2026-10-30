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
import { stubDynamicCharts } from "./stub-dynamic-charts.mjs";
import { lineEntrySource, measureLineGzip } from "./line-bundle.mjs";

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

const externalDynamicEntries = {
  name: "external-dynamic-entries",
  setup(build) {
    build.onResolve({ filter: /^\.\/(load|extra-tip)$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: `@chartkitdev/core/${args.path.slice(2)}`, external: true };
    });
    build.onResolve({ filter: /^\.\/canvas\/hydrate$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/canvas/hydrate", external: true };
    });
    build.onResolve({ filter: /^\.\/layout$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/layout", external: true };
    });
    build.onResolve({ filter: /^\.\/sampling-run$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/sampling", external: true };
    });
    build.onResolve({ filter: /^\.\/validate-phase4$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/validate/phase4", external: true };
    });
    build.onResolve({ filter: /^\.\/mermaid-phase4$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: "@chartkitdev/core/mermaid/phase4", external: true };
    });
  },
};

const externalInteractExtra = {
  name: "external-interact-extra",
  setup(build) {
    build.onResolve({ filter: /interact-extra(\.ts)?$/ }, (args) => {
      if (args.kind === "entry-point") return null;
      return { path: "@chartkitdev/core/interact/extra", external: true };
    });
    build.onResolve({ filter: /export-menu(\.ts)?$/ }, (args) => {
      if (args.kind === "entry-point") return null;
      return { path: "@chartkitdev/core/export-menu", external: true };
    });
  },
};

const externalGeoAtlas = {
  name: "external-geo-atlas",
  setup(build) {
    build.onResolve({ filter: /\/data\/(world|us|canada|eu)\.json$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: args.path, external: true };
    });
  },
};

async function gzipOf(entry, { external = false, splitExtra = false, plugins = [] } = {}) {
  const outfile = join(tmpdir(), `chartkit-size-${Math.random().toString(36).slice(2)}.mjs`);
  await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "node",
    outfile,
    plugins: [externalDynamicEntries, ...(external ? [externalFramework] : []), ...(splitExtra ? [externalInteractExtra] : []), ...plugins],
    logLevel: "silent",
  });
  const code = readFileSync(outfile);
  return { minBytes: code.length, gzipBytes: gzipSync(code, { level: 9 }).length, code: code.toString("utf8") };
}

const line = await measureLineGzip();
const minimalLine = join(tmpdir(), "chartkit-size-minimal-line.mjs");
writeFileSync(minimalLine, lineEntrySource(src));
const all = await gzipOf(join(src, "all.ts"));
const validate = await gzipOf(join(src, "validate.ts"));
const interact = await gzipOf(join(src, "interact.ts"), { splitExtra: true });
const interactExtra = await gzipOf(join(src, "interact-extra.ts"));

const debugOut = join(tmpdir(), "chartkit-size-line-debug.mjs");
await build({
  entryPoints: [minimalLine],
  bundle: true,
  minify: false,
  format: "esm",
  platform: "node",
  outfile: debugOut,
  plugins: [externalDynamicEntries],
  logLevel: "silent",
});
const debug = readFileSync(debugOut, "utf8");
const isolation = {
  lineOmitsBars: !debug.includes("function bars"),
  lineOmitsCandle: !line.code.includes('data-ck-mark="candle"'),
  lineOmitsRetro: !line.code.includes("#ff7edb"),
  lineOmitsValidator: !line.code.includes("CK1004"),
  lineOmitsMermaid: !debug.includes("fromMermaid") && !debug.includes("xychart"),
  lineOmitsInteract: !line.code.includes("data-ck-tip") && !debug.includes("data-ck-tip"),
  lineOmitsCanvas: !debug.includes("ck-canvas-paint"),
  lineOmitsLayout: !debug.includes("data-ck-facet") && !debug.includes("data-ck-views"),
  lineOmitsSampling: !debug.includes("ck-sampling-run"),
  lineOmitsSceneSink: !debug.includes("ck-scene-sink"),
  interactOmitsCanvas: !interact.code.includes("ck-canvas-paint"),
  lineOmitsPng: !line.code.includes("toDataURL") && !debug.includes("toDataURL"),
  interactOmitsPng: !interact.code.includes("toDataURL"),
  allIncludesRetro: all.code.includes("#ff7edb"),
  allIncludesCandle: all.code.includes('data-ck-mark="candle"'),
};

const lineStub = join(tmpdir(), "chartkit-size-line-stub.mjs");
writeFileSync(
  lineStub,
  `${lineEntrySource(src)}export function isExtra(type){return /^(histogram|boxplot|radar|funnel|treemap|sankey|bullet|waterfall)$/.test(type);}\nexport function adopt(){}\nexport function open(){return false}\n`,
);

const withLine = {
  name: "adapter-with-line",
  setup(build) {
    build.onResolve({ filter: /^@chartkitdev\/core\/all$/ }, () => ({ path: lineStub }));
    build.onResolve({ filter: /^@chartkitdev\/core(\/|$)/ }, (args) => ({
      path: args.path,
      external: true,
    }));
    build.onResolve({ filter: /^(vue|svelte)(\/|$)/ }, (args) => ({ path: args.path, external: true }));
  },
};

async function gzipLine(entry) {
  const outfile = join(tmpdir(), `chartkit-size-line-${Math.random().toString(36).slice(2)}.mjs`);
  await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "node",
    outfile,
    plugins: [externalDynamicEntries, withLine],
    logLevel: "silent",
  });
  const code = readFileSync(outfile);
  return { minBytes: code.length, gzipBytes: gzipSync(code, { level: 9 }).length, code: code.toString("utf8") };
}

const vue = await gzipOf(join(root, "packages/vue/src/Chart.ts"), { external: true });
const vanilla = await gzipOf(join(root, "packages/vanilla/src/index.ts"), { external: true });
const element = await gzipOf(join(root, "packages/element/src/index.ts"), { external: true });
const svelteCompiled = compile(readFileSync(join(root, "packages/svelte/src/Chart.svelte"), "utf8"), {
  filename: "Chart.svelte",
  generate: "client",
  css: "external",
});
const svelteEntry = join(tmpdir(), "chartkit-size-svelte.js");
writeFileSync(svelteEntry, svelteCompiled.js.code);
const svelte = await gzipOf(svelteEntry, { external: true });
const vueLine = await gzipLine(join(root, "packages/vue/src/Chart.ts"));
const vanillaLine = await gzipLine(join(root, "packages/vanilla/src/index.ts"));
const svelteLine = await gzipLine(svelteEntry);
const elementLine = await gzipLine(join(root, "packages/element/src/index.ts"));
for (const [name, built] of [["vue", vue], ["svelte", svelte], ["vanilla", vanilla], ["element", element]]) {
  if (built.code.includes("function bars") || built.code.includes("CK1004")) {
    isolation[`${name}OmitsCore`] = false;
  } else {
    isolation[`${name}OmitsCore`] = true;
  }
  const pullsExtra = built.code.includes('@chartkitdev/core/extra"') || built.code.includes("@chartkitdev/core/extra'");
  isolation[`${name}OmitsExtra`] = !pullsExtra;
}
isolation.vanillaOmitsMermaid = !vanilla.code.includes("fromMermaid") && !vanilla.code.includes("xychart");
for (const [name, built] of [["vueLine", vueLine], ["svelteLine", svelteLine], ["vanillaLine", vanillaLine], ["elementLine", elementLine]]) {
  const leaked = built.code.includes('data-ck-mark="whisker"') || built.code.includes('data-ck-renderer="histogram"') || built.code.includes("function renderHistogram");
  isolation[`${name}OmitsExtra`] = !leaked;
}

const mermaid = await gzipOf(join(src, "mermaid.ts"));
const vanillaAuto = await gzipOf(join(root, "packages/vanilla/src/auto.ts"), { external: true });
const markdown = await gzipOf(join(root, "packages/markdown/src/index.ts"), { external: true });

const globalAlias = {
  "@chartkitdev/core/export-menu": join(src, "export-menu.ts"),
  "@chartkitdev/core/export": join(src, "export.ts"),
  "@chartkitdev/core/mermaid/phase4": join(src, "mermaid-phase4.ts"),
  "@chartkitdev/core/mermaid": join(src, "mermaid.ts"),
  "@chartkitdev/core/extra-tip": join(src, "extra-tip.ts"),
  "@chartkitdev/core/extra": join(src, "extra.ts"),
  "@chartkitdev/core/all": join(src, "all.ts"),
  "@chartkitdev/core/interact": join(src, "interact.ts"),
  "@chartkitdev/core": join(src, "index.ts"),
};
async function iife(entry) {
  const outfile = join(tmpdir(), `chartkit-size-global-${Math.random().toString(36).slice(2)}.js`);
  await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    legalComments: "none",
    outfile,
    alias: globalAlias,
    plugins: [stubDynamicCharts],
    logLevel: "silent",
  });
  const code = readFileSync(outfile);
  return { minBytes: code.length, gzipBytes: gzipSync(code, { level: 9 }).length, code: code.toString("utf8") };
}
const vanillaSrc = join(root, "packages/vanilla/src");
const globalBundle = await iife(join(vanillaSrc, "global.ts"));
const globalAuto = await iife(join(vanillaSrc, "global-auto.ts"));
const globalMermaid = await iife(join(vanillaSrc, "global-mermaid.ts"));
isolation.globalAutoOmitsMermaid = !globalAuto.code.includes("xychart") && !globalAuto.code.includes("CK8004");
const extraMark = 'data-ck-mark="whisker"';
const ganttMark = 'data-ck-mark="milestone"';
isolation.globalOmitsExtraCharts = !globalBundle.code.includes(extraMark) && !globalBundle.code.includes(ganttMark);
isolation.globalAutoOmitsExtraCharts = !globalAuto.code.includes(extraMark) && !globalAuto.code.includes(ganttMark);

const extra = await gzipOf(join(src, "extra.ts"));
const canvasPainter = await gzipOf(join(src, "canvas/hydrate.ts"));
const extraTypes = ["histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall", "gantt", "timeline", "quadrant", "venn", "journey", "area-range", "bar-range", "errorbar", "sunburst", "bar-list", "radial-bar", "rose"];
const chartSizes = {};
for (const name of extraTypes) chartSizes[name] = await gzipOf(join(src, "charts", `${name}.ts`));
if (all.code.includes('data-ck-renderer="histogram"') || all.code.includes('data-ck-mark="whisker"')) {
  isolation.allOmitsExtra = false;
} else {
  isolation.allOmitsExtra = true;
}

const geoSrc = join(root, "packages/geo/src");
const geo = await gzipOf(join(geoSrc, "index.ts"), { plugins: [externalGeoAtlas] });
const geoWorld = await gzipOf(join(geoSrc, "data/world.json"));
const geoUs = await gzipOf(join(geoSrc, "data/us.json"));
const geoCanada = await gzipOf(join(geoSrc, "data/canada.json"));
const geoEu = await gzipOf(join(geoSrc, "data/eu.json"));
isolation.geoOmitsAtlases = !geo.code.includes('"arcs":');

const measured = {
  line: line.gzipBytes,
  all: all.gzipBytes,
  validate: validate.gzipBytes,
  vue: vue.gzipBytes,
  svelte: svelte.gzipBytes,
  vanilla: vanilla.gzipBytes,
  element: element.gzipBytes,
  interact: interact.gzipBytes,
  interactExtra: interactExtra.gzipBytes,
  vueLine: vueLine.gzipBytes,
  svelteLine: svelteLine.gzipBytes,
  vanillaLine: vanillaLine.gzipBytes,
  elementLine: elementLine.gzipBytes,
  extra: extra.gzipBytes,
  canvas: canvasPainter.gzipBytes,
  mermaid: mermaid.gzipBytes,
  vanillaAuto: vanillaAuto.gzipBytes,
  markdown: markdown.gzipBytes,
  global: globalBundle.gzipBytes,
  globalAuto: globalAuto.gzipBytes,
  globalMermaid: globalMermaid.gzipBytes,
  geo: geo.gzipBytes,
  geoWorld: geoWorld.gzipBytes,
  geoUs: geoUs.gzipBytes,
  geoCanada: geoCanada.gzipBytes,
  geoEu: geoEu.gzipBytes,
};
for (const name of extraTypes) measured[name] = chartSizes[name].gzipBytes;
const budget = JSON.parse(readFileSync(join(root, "scripts/size-budget.json"), "utf8"));
const failures = [];
for (const key of ["line", "all", "validate", "vue", "svelte", "vanilla", "element", "interact", "interactExtra", "vueLine", "svelteLine", "vanillaLine", "elementLine", "extra", "canvas", "histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall", "gantt", "timeline", "quadrant", "venn", "journey", "area-range", "bar-range", "errorbar", "sunburst", "bar-list", "radial-bar", "rose", "mermaid", "vanillaAuto", "markdown", "global", "globalAuto", "globalMermaid", "geo", "geoWorld", "geoUs", "geoCanada", "geoEu"]) {
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
    element: element.minBytes,
    interact: interact.minBytes,
    interactExtra: interactExtra.minBytes,
    vueLine: vueLine.minBytes,
    svelteLine: svelteLine.minBytes,
    vanillaLine: vanillaLine.minBytes,
    elementLine: elementLine.minBytes,
    extra: extra.minBytes,
    canvas: canvasPainter.minBytes,
    mermaid: mermaid.minBytes,
    vanillaAuto: vanillaAuto.minBytes,
    markdown: markdown.minBytes,
    global: globalBundle.minBytes,
    globalAuto: globalAuto.minBytes,
    globalMermaid: globalMermaid.minBytes,
    geo: geo.minBytes,
    geoWorld: geoWorld.minBytes,
    geoUs: geoUs.minBytes,
    geoCanada: geoCanada.minBytes,
    geoEu: geoEu.minBytes,
    ...Object.fromEntries(extraTypes.map((name) => [name, chartSizes[name].minBytes])),
  },
  isolation,
}, null, 2));
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
