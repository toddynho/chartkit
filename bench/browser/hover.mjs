/**
 * Pointer interaction timing on a mounted ChartKit chart: first hover, steady hover, legend highlight.
 *
 *   node bench/browser/hover.mjs                 # table to stdout, JSON to bench/results/hover.json
 *   node bench/browser/hover.mjs --runs 15       # fresh pages per case (default 15)
 *   node bench/browser/hover.mjs --case line-100k --profile   # where the time goes: stages and functions
 *   node bench/browser/hover.mjs --case line-100k --profile --dom   # also time and count the DOM calls
 *   node bench/browser/hover.mjs --base <dir>    # another checkout's packages/core/src, alternated run by run (before/after)
 *   node bench/browser/hover.mjs --src <dir>     # time this packages/core/src and not the checkout's own
 *   node bench/browser/hover.mjs --out <file>    # write the JSON somewhere else
 *   node bench/browser/hover.mjs --adapter       # call update(spec, markup) right after attach, as the React adapter does on mount
 *   node bench/browser/hover.mjs --vsync         # leave the frame-rate limit on, as the round 13 numbers did
 *
 * Protocol. Every sample is a fresh page. Data is built in the page, the chart is drawn with
 * `host.innerHTML = render(spec)` and `attach(host, spec, { render })`, then the page sits for
 * `--delay` ms (default 200). The pointer is Playwright's real mouse (CDP input), starting outside the chart.
 *   first    the first move into the plot.
 *   rested   one move after the steady moves and another `--delay` ms of no input: an idle page, a chart already hovered.
 *   steady   the next `--moves` moves (default 30), each to another x, each awaited, `--gap` ms apart (default 16).
 *   legend   multi-series cases only: moves between legend labels (the highlight).
 * Two clocks per move, both started in a capture listener on `window` at the first pointer event of that move:
 *   handler  to the end of the bubbling `mousemove`, so every synchronous listener and forced layout is in it.
 *   painted  to a MessageChannel task after the next animation frame, so style, layout and paint are in it.
 * Chromium runs with the frame-rate limit off, so `painted` is work and not a wait for vsync.
 * uPlot runs the same protocol, alternating with ChartKit run by run, when `uplot` resolves from bench/node_modules or `--uplot <dir>`. It runs with default options:
 * a cursor crosshair, a hover point per series and its live legend. It has no tooltip. ChartKit fills and places one on every move.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { machineInfo } from "../lib/machine.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const require = createRequire(join(root, "package.json"));
const { build } = require("esbuild");
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at < 0 ? fallback : args[at + 1];
};
const RUNS = Number(flag("runs", 15));
const MOVES = Number(flag("moves", 30));
const DELAY = Number(flag("delay", 200));
const ONLY = flag("case", "");
const PROFILE = args.includes("--profile");
const VSYNC = args.includes("--vsync");
const DOM = args.includes("--dom");
const ADAPTER = args.includes("--adapter");
const GAP = Number(flag("gap", 16));
const BASE = flag("base", "");
const SRC = resolve(flag("src", join(root, "packages/core/src")));
const OUT = resolve(flag("out", join(root, "bench/results/hover.json")));

const work = join(tmpdir(), `chartkit-hover-${process.pid}`);
mkdirSync(work, { recursive: true });
async function bundleOf(src, id) {
  const entry = join(work, `${id}.mjs`);
  writeFileSync(entry, `import { render } from ${JSON.stringify(join(src, "all.ts"))};\nimport { attach } from ${JSON.stringify(join(src, "interact.ts"))};\nexport { render, attach };\n`);
  const outfile = join(work, `${id}.js`);
  await build({ entryPoints: [entry], bundle: true, minify: !PROFILE, format: "iife", globalName: "CK", platform: "browser", outfile, logLevel: "silent" });
  return readFileSync(outfile, "utf8");
}
const sources = { chartkit: await bundleOf(SRC, "ck") };
if (BASE) sources.base = await bundleOf(resolve(BASE), "base");

let uplot = null;
for (const dir of [flag("uplot", ""), join(root, "bench/node_modules/uplot")]) {
  if (dir && existsSync(join(dir, "dist/uPlot.iife.min.js"))) {
    uplot = { version: JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).version, js: readFileSync(join(dir, "dist/uPlot.iife.min.js"), "utf8"), css: readFileSync(join(dir, "dist/uPlot.min.css"), "utf8") };
    break;
  }
}

/** Runs in the page. Deterministic data, so both checkouts draw the same chart. */
function pageSetup() {
  const wave = (i, k) => Math.round((50 + 30 * Math.sin(i / (7 + k * 3)) + ((i * (13 + k * 4)) % 17)) * 10) / 10;
  const names = ["alpha", "beta", "gamma", "delta", "epsilon"];
  const wide = (n, k) => {
    const rows = [];
    for (let i = 0; i < n; i++) {
      const row = { t: i };
      for (let s = 0; s < k; s++) row[names[s]] = wave(i, s);
      rows.push(row);
    }
    return rows;
  };
  const cats = (n, k) => {
    const rows = [];
    for (let i = 0; i < n; i++) {
      const row = { label: `C${i + 1}` };
      for (let s = 0; s < k; s++) row[names[s]] = wave(i, s);
      rows.push(row);
    }
    return rows;
  };
  const long = (n, k) => {
    const rows = [];
    for (let i = 0; i < n; i++) for (let s = 0; s < k; s++) rows.push({ label: `C${i + 1}`, team: names[s], value: wave(i, s) });
    return rows;
  };
  const base = { version: "1", size: { width: 640, height: 360 }, a11y: { alt: "Synthetic chart used only to time pointer interaction." } };
  const line = (n) => ({ ...base, type: "line", data: wide(n, 1), encoding: { x: "t", y: "alpha" } });
  const multi = (n, k) => ({ ...base, type: "line", data: wide(n, k), encoding: { x: "t", y: names.slice(0, k) } });
  const bar = (n, k) => ({ ...base, type: "bar", data: cats(n, k), encoding: { x: "label", y: k === 1 ? "alpha" : names.slice(0, k) } });
  window.CASES = {
    "line-1k": () => line(1000),
    "line-100k": () => line(100000),
    "multi-line-5x1k": () => multi(1000, 5),
    "multi-line-5x20k": () => multi(20000, 5),
    "long-line-5x200": () => ({ ...base, type: "line", data: long(200, 5), encoding: { x: "label", y: "value", series: "team" } }),
    "long-line-5x2k": () => ({ ...base, type: "line", data: long(2000, 5), encoding: { x: "label", y: "value", series: "team" } }),
    "bar-12": () => bar(12, 1),
    "bar-50": () => bar(50, 1),
    "grouped-bar-3x12": () => bar(12, 3),
    "grouped-bar-3x100": () => bar(100, 3),
    "area-3x1k": () => ({ ...base, type: "stacked-area", data: wide(1000, 3), encoding: { x: "t", y: names.slice(0, 3) } }),
  };
  window.UPLOT_CASES = {
    "line-1k": [1000, 1],
    "line-100k": [100000, 1],
    "multi-line-5x1k": [1000, 5],
    "multi-line-5x20k": [20000, 5],
  };
  window.mountUplot = (name) => {
    const [n, k] = window.UPLOT_CASES[name];
    const cols = [new Float64Array(n)];
    for (let s = 0; s < k; s++) cols.push(new Float64Array(n));
    for (let i = 0; i < n; i++) {
      cols[0][i] = i;
      for (let s = 0; s < k; s++) cols[s + 1][i] = wave(i, s);
    }
    const series = [{}];
    const inks = ["#007aff", "#ff9500", "#34c759", "#af52de", "#ff3b30"];
    for (let s = 0; s < k; s++) series.push({ label: names[s], stroke: inks[s] });
    // eslint-disable-next-line no-undef
    new uPlot({ width: 640, height: 360, scales: { x: { time: false } }, series }, cols, document.getElementById("host"));
  };

  const probe = { t0: 0, tH: 0, resolve: null };
  const start = () => {
    if (!probe.t0 && probe.resolve) probe.t0 = performance.now();
  };
  for (const type of ["pointerover", "pointerenter", "pointermove", "mouseover", "mousemove"]) window.addEventListener(type, start, true);
  window.addEventListener("mousemove", () => {
    if (!probe.resolve) return;
    probe.tH = performance.now();
    const done = probe.resolve;
    const t0 = probe.t0;
    const tH = probe.tH;
    probe.resolve = null;
    requestAnimationFrame(() => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => done({ handler: tH - t0, painted: performance.now() - t0, t0, end: performance.now() });
      channel.port2.postMessage(0);
    });
  });
  window.armProbe = () => {
    probe.t0 = 0;
    window.lastMove = new Promise((res) => {
      probe.resolve = res;
    });
  };

  /** Profile mode: time spent inside DOM calls made by the handlers. */
  window.tapDom = () => {
    const spent = {};
    const wrap = (proto, name, kind) => {
      const desc = Object.getOwnPropertyDescriptor(proto, name);
      if (!desc) return;
      const label = `${proto.constructor.name}.${name}`;
      const timed = (fn) =>
        function (...rest) {
          const from = performance.now();
          try {
            return fn.apply(this, rest);
          } finally {
            const slot = (spent[label] ||= { ms: 0, calls: 0 });
            slot.ms += performance.now() - from;
            slot.calls += 1;
          }
        };
      if (kind === "get") Object.defineProperty(proto, name, { ...desc, get: timed(desc.get) });
      else if (kind === "set") Object.defineProperty(proto, name, { ...desc, set: timed(desc.set) });
      else Object.defineProperty(proto, name, { ...desc, value: timed(desc.value) });
    };
    wrap(Element.prototype, "querySelectorAll");
    wrap(Element.prototype, "querySelector");
    wrap(Element.prototype, "getBoundingClientRect");
    wrap(Element.prototype, "insertAdjacentHTML");
    wrap(Element.prototype, "closest");
    wrap(Element.prototype, "matches");
    wrap(Element.prototype, "innerHTML", "set");
    wrap(HTMLElement.prototype, "offsetWidth", "get");
    wrap(HTMLElement.prototype, "offsetHeight", "get");
    wrap(Element.prototype, "getAttribute");
    wrap(Element.prototype, "setAttribute");
    window.spent = spent;
    window.resetSpent = () => {
      for (const key of Object.keys(spent)) delete spent[key];
    };
  };
}

const HTML = `<!doctype html><meta charset="utf-8"><style>html{color-scheme:light}body{margin:0;font-family:system-ui,sans-serif}#host{position:absolute;left:80px;top:80px;width:640px;height:360px}</style><body><div id="host"></div>`;

const browser = await chromium.launch({ args: VSYNC ? [] : ["--disable-frame-rate-limit", "--disable-gpu-vsync"] });

async function openPage(lib) {
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  await page.setContent(HTML);
  if (lib === "uplot") {
    await page.addStyleTag({ content: uplot.css });
    await page.addScriptTag({ content: uplot.js });
  } else await page.addScriptTag({ content: sources[lib] });
  await page.evaluate(pageSetup);
  return page;
}

async function move(page, x, y) {
  await page.evaluate(() => window.armProbe());
  await page.mouse.move(x, y);
  return page.evaluate(() => window.lastMove);
}

/** Client points across the plot, never the same x twice in a row. */
function sweep(count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push({ x: 80 + 70 + ((i * 37) % 500) + 0.5, y: 80 + 120 + ((i * 53) % 120) });
  return out;
}

async function sample(lib, name, wantProfile) {
  const page = await openPage(lib);
  if (lib === "uplot") await page.evaluate((id) => window.mountUplot(id), name);
  else {
    await page.evaluate(([id, adapter]) => {
      const spec = window.CASES[id]();
      window.spec = spec;
      const host = document.getElementById("host");
      const markup = window.CK.render(spec);
      host.innerHTML = markup;
      window.ctl = window.CK.attach(host, spec, { render: (next) => window.CK.render(next) });
      if (adapter) window.ctl.update(spec, markup);
    }, [name, ADAPTER]);
  }
  await page.mouse.move(5, 5);
  await page.waitForTimeout(DELAY);
  let profile = null;
  let cdp = null;
  if (wantProfile) {
    if (DOM) await page.evaluate(() => window.tapDom());
    else await page.evaluate(() => { window.spent = {}; window.resetSpent = () => {}; });
    cdp = await page.context().newCDPSession(page);
    await cdp.send("Profiler.enable");
    await cdp.send("Profiler.setSamplingInterval", { interval: 50 });
    await browser.startTracing(page, { categories: ["devtools.timeline", "blink.user_timing"] });
    await cdp.send("Profiler.start");
  }
  const first = await move(page, 80 + 320.5, 80 + 180);
  if (wantProfile) {
    const cpu = (await cdp.send("Profiler.stop")).profile;
    const trace = JSON.parse((await browser.stopTracing()).toString("utf8"));
    const dom = await page.evaluate(() => window.spent);
    profile = { first, dom, functions: topFunctions(cpu), stages: stages(trace, first) };
    await page.evaluate(() => window.resetSpent());
  }
  const steady = [];
  if (wantProfile) {
    await browser.startTracing(page, { categories: ["devtools.timeline"] });
    const one = await move(page, 80 + 200.5, 80 + 150);
    profile.steadyStages = stages(JSON.parse((await browser.stopTracing()).toString("utf8")), one);
    profile.steady = one;
  }
  for (const point of sweep(MOVES)) {
    if (GAP) await page.waitForTimeout(GAP);
    steady.push(await move(page, point.x, point.y));
  }
  if (wantProfile) profile.steadyDom = await page.evaluate((moves) => Object.fromEntries(Object.entries(window.spent).map(([key, value]) => [key, { ms: value.ms / moves, calls: value.calls / moves }])), MOVES);
  // A move after a pause: the page has been idle, but nothing about the chart is new.
  await page.waitForTimeout(DELAY);
  const rested = await move(page, 80 + 431.5, 80 + 170);
  const legend = [];
  if (lib !== "uplot") {
    const spots = await page.evaluate(() => {
      const out = [];
      for (const text of document.querySelectorAll("#host svg text")) {
        const prev = text.previousElementSibling;
        if (!prev || prev.localName !== "rect" || prev.getAttribute("width") !== "10") continue;
        const box = text.getBoundingClientRect();
        out.push({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
      }
      return out;
    });
    if (spots.length > 1 && wantProfile) {
      await move(page, spots[0].x, spots[0].y);
      await browser.startTracing(page, { categories: ["devtools.timeline"] });
      const one = await move(page, spots[1].x, spots[1].y);
      profile.legendStages = stages(JSON.parse((await browser.stopTracing()).toString("utf8")), one);
      profile.legend = one;
    }
    if (spots.length > 1) {
      for (let i = 0; i < 12; i++) {
        if (GAP) await page.waitForTimeout(GAP);
        legend.push(await move(page, spots[i % spots.length].x, spots[i % spots.length].y));
      }
    }
  }
  const state = lib === "uplot" ? null : await page.evaluate(() => ({ tip: !document.querySelector("[data-ck-tip]")?.hidden, nodes: document.querySelectorAll("#host svg *").length }));
  await page.close();
  return { first, rested, steady, legend, profile, state };
}

function topFunctions(cpu) {
  const byId = new Map(cpu.nodes.map((node) => [node.id, node]));
  const parent = new Map();
  for (const node of cpu.nodes) for (const child of node.children || []) parent.set(child, node.id);
  const self = new Map();
  const total = new Map();
  for (let i = 0; i < cpu.samples.length; i++) {
    const ms = (cpu.timeDeltas[i] || 0) / 1000;
    let id = cpu.samples[i];
    const leaf = byId.get(id).callFrame.functionName || "(anonymous)";
    if (leaf === "(idle)" || leaf === "(program)") continue;
    self.set(leaf, (self.get(leaf) || 0) + ms);
    const seen = new Set();
    while (id !== undefined) {
      const name = byId.get(id).callFrame.functionName || "(anonymous)";
      if (!seen.has(name)) total.set(name, (total.get(name) || 0) + ms);
      seen.add(name);
      id = parent.get(id);
    }
  }
  const top = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([name, ms]) => ({ name, ms: round(ms) }));
  return { self: top(self), total: top(total) };
}

/** Renderer main-thread time by stage inside the first-hover window. */
function stages(trace, first) {
  const events = trace.traceEvents || trace;
  const marks = events.filter((event) => event.name === "EventDispatch" && event.args?.data?.type === "pointerover" || event.name === "EventDispatch" && event.args?.data?.type === "pointermove");
  if (!marks.length) return {};
  const from = Math.min(...marks.map((event) => event.ts));
  const to = from + first.painted * 1000 + 2000;
  const tid = marks[0].tid;
  const out = {};
  for (const event of events) {
    if (event.ph !== "X" || event.tid !== tid || event.ts < from || event.ts > to) continue;
    if (!["UpdateLayoutTree", "Layout", "PrePaint", "Paint", "Layerize", "Commit", "ParseHTML", "EventDispatch", "HitTest", "FireAnimationFrame"].includes(event.name)) continue;
    const key = event.name === "EventDispatch" ? `EventDispatch:${event.args?.data?.type}` : event.name;
    const slot = (out[key] ||= { ms: 0, count: 0 });
    slot.ms = round(slot.ms + event.dur / 1000);
    slot.count += 1;
  }
  return out;
}

const round = (value) => Math.round(value * 100) / 100;
function commitOf() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();
  } catch {
    return "unknown";
  }
}
function stats(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const at = (q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1))];
  return { median: round(at(0.5)), p95: round(at(0.95)), min: round(sorted[0]), max: round(sorted[sorted.length - 1]), n: sorted.length };
}

const caseNames = await (async () => {
  const page = await openPage("chartkit");
  const names = await page.evaluate(() => ({ ck: Object.keys(window.CASES), up: Object.keys(window.UPLOT_CASES) }));
  await page.close();
  return names;
})();

const rows = [];
const jobs = [];
for (const name of caseNames.ck) {
  if (ONLY && !ONLY.split(",").includes(name)) continue;
  // Every library timed for a case shares one job, so they alternate run by run and see the same machine state.
  const libs = BASE && !PROFILE ? ["base", "chartkit"] : ["chartkit"];
  if (uplot && !PROFILE && caseNames.up.includes(name)) libs.push("uplot");
  jobs.push([libs, name]);
}

// One discarded page first, so the browser's own cold start is in no sample.
await sample("chartkit", jobs[0]?.[1] ?? "line-1k", false);
const version = browser.version();

for (const [libs, name] of jobs) {
  if (PROFILE) {
    const runs = [];
    for (let i = 0; i < Math.min(RUNS, 5); i++) runs.push((await sample(libs[0], name, true)).profile);
    runs.sort((a, b) => a.first.handler - b.first.handler);
    const mid = runs[runs.length >> 1];
    console.log(`\n## ${name}  first hover: handler ${round(mid.first.handler)} ms, painted ${round(mid.first.painted)} ms (median run of ${runs.length}, profiler on, so slower than the timed runs)`);
    console.log("main-thread stages, first hover:", JSON.stringify(mid.stages));
    if (mid.steadyStages) console.log(`steady move: handler ${round(mid.steady.handler)} ms, painted ${round(mid.steady.painted)} ms`, JSON.stringify(mid.steadyStages));
    if (mid.legendStages) console.log(`legend move: handler ${round(mid.legend.handler)} ms, painted ${round(mid.legend.painted)} ms`, JSON.stringify(mid.legendStages));
    if (DOM) {
      console.log("dom calls, first hover (ms, calls; the wrappers add time):");
      for (const [key, value] of Object.entries(mid.dom).sort((a, b) => b[1].ms - a[1].ms)) console.log(`  ${key.padEnd(34)} ${String(round(value.ms)).padStart(7)}  ${value.calls}`);
      console.log("dom calls, per steady move (ms, calls):");
      for (const [key, value] of Object.entries(mid.steadyDom).sort((a, b) => b[1].ms - a[1].ms).slice(0, 8)) console.log(`  ${key.padEnd(34)} ${String(round(value.ms)).padStart(7)}  ${round(value.calls)}`);
    }
    console.log("self ms by function:", mid.functions.self.map((item) => `${item.name} ${item.ms}`).join(", "));
    console.log("inclusive ms by function:", mid.functions.total.map((item) => `${item.name} ${item.ms}`).join(", "));
    continue;
  }
  const acc = {};
  for (const lib of libs) acc[lib] = { first: { handler: [], painted: [] }, rested: { handler: [], painted: [] }, steady: { handler: [], painted: [] }, legend: { handler: [], painted: [] }, state: null };
  // Libraries alternate inside a case, and the order flips every run.
  for (let i = 0; i < RUNS; i++) {
    for (const lib of i % 2 ? [...libs].reverse() : libs) {
      const one = await sample(lib, name, false);
      const into = acc[lib];
      into.state = one.state;
      into.first.handler.push(one.first.handler);
      into.first.painted.push(one.first.painted);
      into.rested.handler.push(one.rested.handler);
      into.rested.painted.push(one.rested.painted);
      for (const item of one.steady) {
        into.steady.handler.push(item.handler);
        into.steady.painted.push(item.painted);
      }
      // The first legend move also carries the pointer out of the plot, so it is left out.
      for (const item of one.legend.slice(1)) {
        into.legend.handler.push(item.handler);
        into.legend.painted.push(item.painted);
      }
    }
  }
  for (const lib of libs) {
    const { first, rested, steady, legend, state } = acc[lib];
    if (state && !state.tip) console.error(`warning: ${name} ended with no tooltip showing`);
    const row = {
      lib,
      case: name,
      nodes: state?.nodes ?? null,
      firstHandler: stats(first.handler),
      firstPainted: stats(first.painted),
      restedHandler: stats(rested.handler),
      restedPainted: stats(rested.painted),
      steadyHandler: stats(steady.handler),
      steadyPainted: stats(steady.painted),
      legendHandler: stats(legend.handler),
      legendPainted: stats(legend.painted),
    };
    rows.push(row);
    const cell = (value) => (value ? `${value.median.toFixed(2)} / ${value.p95.toFixed(2)}` : "—");
    console.log(`${lib.padEnd(9)} ${name.padEnd(20)} first ${cell(row.firstHandler)} | ${cell(row.firstPainted)}   rested ${cell(row.restedHandler)} | ${cell(row.restedPainted)}   steady ${cell(row.steadyHandler)} | ${cell(row.steadyPainted)}   legend ${cell(row.legendHandler)} | ${cell(row.legendPainted)}`);
  }
}
await browser.close();

if (!PROFILE) {
  const result = {
    measured: new Date().toISOString().slice(0, 10),
    commit: commitOf(),
    machine: machineInfo(),
    uplot: uplot
      ? { version: uplot.version, setup: "Default options: cursor crosshair, a hover point per series, and the live legend under the plot. uPlot has no tooltip, so its moves place no tooltip. ChartKit's moves fill and place one." }
      : null,
    method: `Playwright Chromium ${version}, frame-rate limit ${VSYNC ? "on" : "off"}, 640×360, fresh page per run. ${RUNS} runs per case: one first hover and one rested hover each, ${MOVES} steady moves each, 11 legend moves each on multi-series cases, ${GAP} ms apart. ${DELAY} ms between mount and the first move.${BASE ? " base is the --base checkout." : ""} Libraries timed for the same case alternate run by run. Cells are median / p95 in ms. handler ends with the bubbling mousemove. painted ends in a MessageChannel task after the next animation frame.`,
    runs: RUNS,
    moves: MOVES,
    delayMs: DELAY,
    gapMs: GAP,
    rows,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`\nwrote ${OUT}`);
  console.log("columns: handler median / p95 | painted median / p95, in ms");
}
