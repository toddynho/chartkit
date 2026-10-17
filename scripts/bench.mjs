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
const tmpEntries = join(tmpdir(), "chartkit-bench-entries");
mkdirSync(tmpEntries, { recursive: true });

function entry(name, body) {
  const path = join(tmpEntries, name);
  writeFileSync(path, body);
  return path;
}

const chartNames = [
  "line",
  "bar",
  "donut",
  "stacked-area",
  "scatter",
  "combo",
  "heatmap",
  "gauge",
  "kpi",
  "sparkline",
  "mini-area",
  "progress-ring",
  "spike",
  "candlestick",
];

const minimalLine = entry(
  "minimal-line.mjs",
  `import { createRenderer } from ${JSON.stringify(join(srcDir, "render.ts"))};\nimport { line } from ${JSON.stringify(join(srcDir, "charts/line.ts"))};\nexport const render = createRenderer([line]);\n`,
);

const perRenderer = {};
const rendererCode = {};
for (const name of chartNames) {
  const file = join(srcDir, "charts", `${name}.ts`);
  const built = await bundle(file);
  const outfile = join(tmpdir(), `chartkit-bench-chart-${name}.mjs`);
  await build({
    entryPoints: [file],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  rendererCode[name] = readFileSync(outfile, "utf8");
  perRenderer[name] = built;
}

const lineCode = await (async () => {
  const outfile = join(tmpdir(), "chartkit-bench-minimal-line.mjs");
  await build({
    entryPoints: [minimalLine],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  return readFileSync(outfile, "utf8");
})();

const allCode = await (async () => {
  const outfile = join(tmpdir(), "chartkit-bench-all.mjs");
  await build({
    entryPoints: [join(srcDir, "all.ts")],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  return readFileSync(outfile, "utf8");
})();

const sizes = {
  source: {
    minimalLine: await bundle(minimalLine),
    all: await bundle(join(srcDir, "all.ts")),
    validate: await bundle(join(srcDir, "validate.ts")),
    registry: await bundle(join(srcDir, "index.ts")),
  },
  perRenderer,
  isolation: {
    note: "True when the minified minimal-line bundle omits strings that belong to other charts, themes, or the validator.",
    lineOmitsCandleMark: !lineCode.includes('data-ck-mark="candle"'),
    lineOmitsRetroAccent: !lineCode.includes("#ff7edb"),
    lineOmitsCk1004: !lineCode.includes("CK1004"),
    allIncludesRetroAccent: allCode.includes("#ff7edb"),
    allIncludesCandleMark: allCode.includes('data-ck-mark="candle"'),
    candlestickOmitsDonutFillRule: !rendererCode.candlestick.includes('fill-rule="evenodd"'),
    donutOmitsCandleMark: !rendererCode.donut.includes('data-ck-mark="candle"'),
  },
};

const outfile = join(tmpdir(), "chartkit-bench-runtime.mjs");
await build({
  entryPoints: [join(core, "src/validate.ts")],
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

const adapterSpec = {
  version: "1",
  type: "line",
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
  ],
  encoding: { x: "quarter", y: "units" },
  a11y: { alt: "Units rose from Q1 to Q2." },
};

async function timeAsync(fn, iterations) {
  for (let i = 0; i < 20; i++) await fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) await fn();
  const elapsedMs = performance.now() - start;
  return {
    iterations,
    elapsedMs: Number(elapsedMs.toFixed(2)),
    perOpUs: Number(((elapsedMs * 1000) / iterations).toFixed(2)),
    opsPerSec: Number((iterations / (elapsedMs / 1000)).toFixed(1)),
  };
}

async function adapterSsr() {
  const coreOut = join(tmpdir(), "chartkit-bench-adapter-core.mjs");
  await build({
    entryPoints: [join(srcDir, "all.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: coreOut,
    logLevel: "silent",
  });
  const core = await import(coreOut);
  const coreRow = time(() => {
    const svg = core.render(adapterSpec);
    if (!svg.includes('data-ck-type="line"')) throw new Error("core SSR missed the line chart");
  }, 200);

  const vueEntry = join(tmpEntries, "vue-ssr.mjs");
  writeFileSync(
    vueEntry,
    `export { renderToString } from ${JSON.stringify(join(root, "packages/vue/src/ssr.ts"))};\n`,
  );
  const vueOut = join(tmpdir(), "chartkit-bench-adapter-vue.mjs");
  await build({
    entryPoints: [vueEntry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: vueOut,
    absWorkingDir: root,
    logLevel: "silent",
  });
  const vue = await import(vueOut);
  const vueRow = await timeAsync(async () => {
    const html = await vue.renderToString(adapterSpec);
    if (!html.includes('data-ck-type="line"')) throw new Error("Vue SSR missed the line chart");
  }, 100);

  const { compile } = await import("svelte/compiler");
  const { render } = await import("svelte/server");
  const compiled = compile(readFileSync(join(root, "packages/svelte/src/Chart.svelte"), "utf8"), {
    filename: "Chart.svelte",
    generate: "server",
    css: "external",
  });
  const svelteEntry = join(tmpEntries, "svelte-ssr.mjs");
  writeFileSync(svelteEntry, compiled.js.code);
  const svelteOut = join(tmpdir(), "chartkit-bench-adapter-svelte.mjs");
  await build({
    entryPoints: [svelteEntry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: svelteOut,
    absWorkingDir: root,
    nodePaths: [join(root, "node_modules")],
    alias: {
      "@chartkitdev/core/all": join(srcDir, "all.ts"),
      "@chartkitdev/core/interact": join(srcDir, "interact.ts"),
    },
    logLevel: "silent",
  });
  const svelte = await import(svelteOut);
  const svelteRow = time(() => {
    const html = render(svelte.default, { props: { spec: adapterSpec } }).body;
    if (!html.includes('data-ck-type="line"')) throw new Error("Svelte SSR missed the line chart");
  }, 200);

  return {
    note: "Same two-point line spec. Core is render() from src/all.ts. Vue is renderToString from @chartkitdev/vue/ssr (async, 20 warmup, 100 iterations). Svelte is svelte/server render of the server-compiled Chart.svelte (sync, 50 warmup via time(), 200 iterations). These are not the published browser comparison.",
    core: coreRow,
    vue: vueRow,
    svelte: svelteRow,
  };
}

let adapters;
try {
  adapters = await adapterSsr();
} catch (error) {
  adapters = { error: error instanceof Error ? error.message : String(error) };
}

async function interactBench() {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><body></body>");
  const previous = globalThis.document;
  const previousWindow = globalThis.window;
  const previousRAF = globalThis.requestAnimationFrame;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.DOMParser = dom.window.DOMParser;
  globalThis.SVGSVGElement = dom.window.SVGSVGElement;
  globalThis.Element = dom.window.Element;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.PointerEvent = dom.window.PointerEvent;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
  const outfile = join(tmpdir(), "chartkit-bench-interact.mjs");
  await build({
    entryPoints: [entry("interact-bench.mjs", `import { render } from ${JSON.stringify(join(srcDir, "all.ts"))};\nimport { attach, buildHoverIndex, lookupIndex, patchSvg } from ${JSON.stringify(join(srcDir, "interact.ts"))};\nexport { render, attach, buildHoverIndex, lookupIndex, patchSvg };\n`)],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  const mod = await import(outfile);
  const values = new Float64Array(100_000);
  for (let i = 0; i < values.length; i++) values[i] = i * 1.5;
  const numeric = mod.buildHoverIndex(values.length, 48, 560, values);
  const uniform = mod.buildHoverIndex(100_000, 48, 560, null);
  const hoverNumeric = time(() => {
    mod.lookupIndex(numeric, (Math.random() * 560) + 48);
  }, 1000);
  const hoverUniform = time(() => {
    mod.lookupIndex(uniform, (Math.random() * 560) + 48);
  }, 1000);

  function spec(rows, salt) {
    const data = [];
    for (let i = 0; i < rows; i++) data.push({ month: `m${i}`, revenue: (i * 3 + salt) % 997 });
    return {
      version: "1",
      type: "line",
      data,
      encoding: { x: "month", y: "revenue" },
      a11y: { alt: "Synthetic line used only to time an in-place SVG update." },
    };
  }

  function quick(fn, iterations) {
    for (let i = 0; i < 2; i++) fn();
    const start = performance.now();
    for (let i = 0; i < iterations; i++) fn();
    const elapsedMs = performance.now() - start;
    return {
      iterations,
      elapsedMs: Number(elapsedMs.toFixed(2)),
      perOpMs: Number((elapsedMs / iterations).toFixed(2)),
    };
  }

  function timeUpdate(rows) {
    const host = dom.window.document.createElement("div");
    dom.window.document.body.append(host);
    const first = mod.render(spec(rows, 1));
    const second = mod.render(spec(rows, 2));
    let flip = false;
    const old = quick(() => {
      host.innerHTML = flip ? first : second;
      flip = !flip;
    }, 10);
    host.innerHTML = first;
    mod.patchSvg(host, first);
    const svg = host.querySelector("svg");
    let patchFlip = false;
    const patched = quick(() => {
      patchFlip = !patchFlip;
      mod.patchSvg(host, patchFlip ? second : first);
    }, 10);
    const sameNode = host.querySelector("svg") === svg;
    let salt = 3;
    const renderInner = quick(() => {
      salt += 1;
      host.innerHTML = mod.render(spec(rows, salt));
    }, 8);
    const renderPatch = quick(() => {
      salt += 1;
      mod.patchSvg(host, mod.render(spec(rows, salt)));
    }, 8);
    return {
      rows,
      sameNode,
      innerHTML: old,
      patchSvg: patched,
      renderPlusInnerHTML: renderInner,
      renderPlusPatch: renderPatch,
    };
  }

  function hoverDom(rows) {
    const host = dom.window.document.createElement("div");
    dom.window.document.body.append(host);
    const data = [];
    for (let i = 0; i < rows; i++) data.push({ t: i, v: (i * 3) % 997 });
    const chart = {
      version: "1",
      type: "line",
      data,
      encoding: { x: "t", y: "v" },
      a11y: { alt: "Synthetic line used only to time tooltip hover." },
    };
    host.innerHTML = mod.render(chart);
    mod.attach(host, chart, { render: (next) => mod.render(next) });
    const svg = host.querySelector("svg");
    const view = (svg.getAttribute("viewBox") || "0 0 640 320").split(/[\s,]+/).map(Number);
    const width = view[2] || 640;
    const sample = quick(() => {
      svg.dispatchEvent(new dom.window.PointerEvent("pointermove", {
        clientX: 48 + Math.random() * Math.max(1, width - 96),
        clientY: 80,
        bubbles: true,
      }));
    }, 100);
    const tip = host.querySelector("[data-ck-tip]");
    return { rows, perOpMs: sample.perOpMs, tipShown: Boolean(tip && !tip.hidden) };
  }

  const updates = [timeUpdate(1000), timeUpdate(10_000), timeUpdate(100_000)];
  const hoverDom100k = hoverDom(100_000);
  if (previous === undefined) delete globalThis.document;
  else globalThis.document = previous;
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
  globalThis.requestAnimationFrame = previousRAF;
  return {
    note: "Hover lookup is 50 warmup + 1000 calls on a 100k index. hoverDom is 2 warmup + 100 pointermove events on a mounted 100k line, tooltip included, in jsdom. Update DOM rows are 2 warmup + 10 applies of two pre-rendered strings. renderPlus rows are 2 warmup + 8 full render-and-apply cycles. Downsampling stays on. jsdom innerHTML is much slower than Chrome.",
    hoverNumeric100k: hoverNumeric,
    hoverUniform100k: hoverUniform,
    hoverDom100k,
    updates,
  };
}

let interact;
try {
  interact = await interactBench();
} catch (error) {
  interact = { error: error instanceof Error ? error.message : String(error) };
}

const report = {
  measuredAt: new Date().toISOString(),
  node: process.version,
  platform: `${os.platform()} ${os.release()} ${os.arch()}`,
  cpu: os.cpus()[0]?.model ?? "unknown",
  cpuCount: os.cpus().length,
  method: {
    bundle:
      "esbuild --bundle --minify, gzip -9, zero externals. minimalLine is createRenderer([line]) (registry + line + midnight). all is src/all.ts. validate is src/validate.ts. perRenderer bundles each charts/* entry alone.",
    throughput:
      "warmup 50, then performance.now() around validate() from src/validate.ts; examples loop validates every example spec per iteration.",
    perRenderer:
      "esbuild --bundle --minify of each charts/* module, gzip -9. A chart bundle includes the helpers it imports (midnight theme, svg) and not sibling charts.",
  },
  bundle: sizes,
  validate: {
    examples: { specsPerIteration: examples.length, ...exampleRun },
    rows5000TwoSeries: wideRun,
  },
  adapterSsr: adapters,
  interact,
};

mkdirSync(join(root, "bench"), { recursive: true });
writeFileSync(join(root, "bench/last-run.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
