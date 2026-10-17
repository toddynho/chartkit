/**
 * Browser checks for tooltip, zoom, and legend toggle, plus Chrome update timing.
 * Uses the Playwright already installed under bench/. Run from the repo root:
 *   node scripts/interact-playwright.mjs
 */
import { mkdirSync, writeFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "packages/core/src");
const outDir = join(root, "scripts/.interact-out");
mkdirSync(outDir, { recursive: true });

const entry = join(tmpdir(), "chartkit-interact-page.mjs");
writeFileSync(
  entry,
  `import { render } from ${JSON.stringify(join(src, "all.ts"))};\nimport { createRenderer } from ${JSON.stringify(join(src, "render.ts"))};\nimport { line } from ${JSON.stringify(join(src, "charts/line.ts"))};\nimport { attach, patchSvg, buildHoverIndex, lookupIndex } from ${JSON.stringify(join(src, "interact.ts"))};\nexport const renderLine = createRenderer([line]);\nexport { render, attach, patchSvg, buildHoverIndex, lookupIndex };\n`,
);

const bundle = join(outDir, "ck.js");
await build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  globalName: "CK",
  platform: "browser",
  outfile: bundle,
  logLevel: "silent",
});

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const starter = [24, 28, 26, 31, 35, 33];
const pro = [40, 44, 49, 46, 52, 58];
const enterprise = [16, 19, 23, 27, 30, 34];
const data = months.map((month, i) => ({
  month,
  starter: starter[i],
  pro: pro[i],
  enterprise: enterprise[i],
}));

const html = `<!doctype html><meta charset="utf-8"><title>ChartKit interaction</title>
<style>
  html { color-scheme: light; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #f5f5f7; color: #1d1d1f; }
  section { padding: 16px 20px 28px; }
  h1 { font-size: 18px; font-weight: 600; margin: 0 0 4px; }
  p { margin: 0 0 12px; font-size: 13px; color: #6e6e73; }
  #dark, #kinds-dark { color-scheme: dark; background: #1c1c1e; color: #f5f5f7; }
  #dark p, #kinds-dark p { color: #a1a1a6; }
  .host { width: 640px; height: 360px; }
</style>
<body>
<section id="light">
  <h1>Soft light</h1>
  <p>Tooltip, crosshair, wheel zoom, and legend toggle.</p>
  <div id="light-host" class="host"></div>
</section>
<section id="dark">
  <h1>Soft dark</h1>
  <p>Same chart. Colours follow the section color-scheme.</p>
  <div id="dark-host" class="host"></div>
</section>
<section id="kinds-light">
  <h1>Other tooltips, light</h1>
  <p>Bar, stacked area, scatter, combo, and donut.</p>
  <div id="bar-light" class="host"></div>
  <div id="area-light" class="host"></div>
  <div id="scatter-light" class="host"></div>
  <div id="combo-light" class="host"></div>
  <div id="donut-light" class="host"></div>
</section>
<section id="kinds-dark">
  <h1>Other tooltips, dark</h1>
  <p>Same charts under a dark color-scheme.</p>
  <div id="bar-dark" class="host"></div>
  <div id="area-dark" class="host"></div>
  <div id="scatter-dark" class="host"></div>
  <div id="combo-dark" class="host"></div>
  <div id="donut-dark" class="host"></div>
</section>
<script src="${bundle}"></script>
<script>
const spec = {
  version: "1",
  type: "line",
  title: "Plans",
  data: ${JSON.stringify(data)},
  encoding: {
    x: { field: "month", type: "ordinal", title: "Month" },
    y: [
      { field: "starter", title: "Starter", type: "quantitative" },
      { field: "pro", title: "Pro", type: "quantitative" },
      { field: "enterprise", title: "Enterprise", type: "quantitative" }
    ]
  },
  legend: { interactive: true },
  interaction: { zoom: "x", brush: "x" },
  size: { width: 640, height: 360 },
  a11y: { alt: "Starter, Pro, and Enterprise from January through June." }
};
function mount(id) {
  const host = document.getElementById(id);
  host.innerHTML = CK.render(spec);
  host._events = [];
  host.addEventListener("legendtoggle", (event) => host._events.push(event.detail));
  host.addEventListener("rangechange", (event) => host._events.push(event.detail));
  CK.attach(host, spec, { render: (next) => CK.render(next) });
}
const months = ${JSON.stringify(months)};
const plans = ${JSON.stringify(data)};
const bar = { ...spec, type: "bar", title: "Plans, bars" };
const area = { ...spec, type: "stacked-area", title: "Plans, stacked" };
const scatter = {
  version: "1",
  type: "scatter",
  title: "Sites",
  data: [
    { x: 1, y: 12, site: "North" },
    { x: 2, y: 18, site: "North" },
    { x: 3, y: 15, site: "North" },
    { x: 4, y: 22, site: "North" },
    { x: 1.4, y: 9, site: "South" },
    { x: 2.2, y: 16, site: "South" },
    { x: 3.1, y: 11, site: "South" },
    { x: 3.8, y: 19, site: "South" }
  ],
  encoding: { x: { field: "x", type: "quantitative" }, y: { field: "y", type: "quantitative" }, color: "site" },
  size: { width: 640, height: 360 },
  a11y: { alt: "North and South sites." }
};
const combo = {
  version: "1",
  type: "combo",
  title: "Orders",
  data: [
    { week: "W1", orders: 42, rate: 0.31 },
    { week: "W2", orders: 48, rate: 0.36 },
    { week: "W3", orders: 45, rate: 0.33 },
    { week: "W4", orders: 53, rate: 0.41 }
  ],
  encoding: {
    x: "week",
    y: [
      { field: "orders", title: "Orders", mark: "bar" },
      { field: "rate", title: "Rate", mark: "line", axis: "y2" }
    ]
  },
  axes: { y2: true },
  size: { width: 640, height: 360 },
  a11y: { alt: "Orders and rate across four weeks." }
};
const donut = {
  version: "1",
  type: "donut",
  title: "Plans",
  data: [
    { plan: "Starter", total: 177 },
    { plan: "Pro", total: 289 },
    { plan: "Enterprise", total: 149 }
  ],
  encoding: { x: "plan", y: "total" },
  size: { width: 640, height: 360 },
  a11y: { alt: "Pro is the largest share of the plans." }
};
const kindSpecs = { bar, area, scatter, combo, donut };
function mountKind(id, kind) {
  const host = document.getElementById(id);
  host.innerHTML = CK.render(kindSpecs[kind]);
  CK.attach(host, kindSpecs[kind], { render: (next) => CK.render(next) });
}
mount("light-host");
mount("dark-host");
for (const theme of ["light", "dark"]) {
  for (const kind of ["bar", "area", "scatter", "combo", "donut"]) mountKind(kind + "-" + theme, kind);
}
document.body.dataset.ckReady = "1";
</script>
</body>`;

const pageFile = join(outDir, "interact.html");
writeFileSync(pageFile, html);

const { chromium } = await import(join(root, "bench/node_modules/playwright/index.mjs"));
const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({
  viewport: { width: 760, height: 980 },
  deviceScaleFactor: 2,
  recordVideo: { dir: outDir, size: { width: 760, height: 980 } },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

function fail(message) {
  errors.push(message);
}

await page.goto(`file://${pageFile}`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.body.dataset.ckReady === "1");

const staticSvg = await page.evaluate(() => CK.render({
  version: "1",
  type: "line",
  data: [{ month: "Jan", starter: 24 }],
  encoding: { x: "month", y: "starter" },
  a11y: { alt: "One point." },
}));
if (staticSvg.includes("data-ck-tip") || staticSvg.includes("data-ck-interact")) {
  fail("static render included an interaction hook");
}

async function plotPoint(hostId, fraction) {
  return page.evaluate(({ hostId, fraction }) => {
    const svg = document.querySelector(`#${hostId} svg`);
    const rect = svg && svg.querySelector("clipPath rect");
    if (!svg) throw new Error(`${hostId} has no svg`);
    if (!rect) {
      const circle = svg.querySelector("circle");
      const vb = svg.getAttribute("viewBox").split(/[\s,]+/).map(Number);
      const box = svg.getBoundingClientRect();
      const x = circle ? Number(circle.getAttribute("cx")) : vb[2] / 2;
      const y = circle ? Number(circle.getAttribute("cy")) : vb[3] / 2;
      return {
        x: box.left + (x / vb[2]) * box.width,
        y: box.top + (y / vb[3]) * box.height,
      };
    }
    const vb = svg.getAttribute("viewBox").split(/[\s,]+/).map(Number);
    const box = svg.getBoundingClientRect();
    const x = Number(rect.getAttribute("x")) + Number(rect.getAttribute("width")) * fraction;
    const y = Number(rect.getAttribute("y")) + Number(rect.getAttribute("height")) * 0.45;
    return {
      x: box.left + (x / vb[2]) * box.width,
      y: box.top + (y / vb[3]) * box.height,
    };
  }, { hostId, fraction });
}

async function shot(name, hostId) {
  const section = hostId.startsWith("dark") ? "#dark" : "#light";
  await page.locator(section).screenshot({ path: join(outDir, name) });
}

const shots = [];
for (const hostId of ["light-host", "dark-host"]) {
  const theme = hostId.startsWith("dark") ? "dark" : "light";
  const april = await plotPoint(hostId, 3.5 / 6);
  await page.mouse.move(april.x, april.y);
  await page.waitForTimeout(250);
  const tip = await page.evaluate((id) => {
    const host = document.getElementById(id);
    const node = host.querySelector("[data-ck-tip]");
    const style = node ? getComputedStyle(node) : null;
    return {
      text: node ? node.textContent : "",
      hidden: node ? node.hidden : true,
      bg: style ? style.backgroundColor : "",
      crosshair: Boolean(host.querySelector("[data-ck-crosshair]")),
    };
  }, hostId);
  if (tip.hidden) fail(`${theme} tooltip stayed hidden`);
  for (const needle of ["Apr", "Starter", "31", "Pro", "46", "Enterprise", "27"]) {
    if (!tip.text.includes(needle)) fail(`${theme} tooltip missing ${needle}: ${tip.text}`);
  }
  if (!tip.crosshair) fail(`${theme} crosshair missing`);
  const bg = tip.bg.replace(/\s/g, "");
  if (theme === "light" && bg !== "rgb(255,255,255)") fail(`${theme} tooltip background ${tip.bg}`);
  if (theme === "dark" && bg !== "rgb(44,44,46)") fail(`${theme} tooltip background ${tip.bg}`);
  await shot(`tooltip-${theme}.png`, hostId);
  shots.push(`tooltip-${theme}.png`);

  const before = await page.evaluate((id) => document.querySelector(`#${id} svg path`)?.getAttribute("d"), hostId);
  for (let step = 0; step < 4; step++) {
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(120);
  const zoomed = await page.evaluate((id) => {
    const svg = document.querySelector(`#${id} svg`);
    const labels = [...svg.querySelectorAll("text")].map((node) => node.textContent);
    return { d: svg.querySelector("path")?.getAttribute("d"), labels };
  }, hostId);
  if (!zoomed.d || zoomed.d === before) fail(`${theme} wheel zoom did not change the line`);
  const monthsShown = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].filter((month) => zoomed.labels.includes(month));
  if (monthsShown.length > 3) fail(`${theme} zoom still shows ${monthsShown.join(",")}`);
  await page.mouse.move(8, 8);
  await page.waitForTimeout(150);
  await shot(`zoom-${theme}.png`, hostId);
  shots.push(`zoom-${theme}.png`);

  await page.mouse.dblclick(april.x, april.y);
  await page.waitForTimeout(150);
  const reset = await page.evaluate((id) => document.querySelector(`#${id} svg path`)?.getAttribute("d"), hostId);
  if (reset !== before) fail(`${theme} double-click did not restore the line`);

  await page.locator(`#${hostId} svg text`, { hasText: "Pro" }).click();
  await page.waitForTimeout(200);
  const legend = await page.evaluate((id) => {
    const host = document.getElementById(id);
    const text = [...host.querySelectorAll("text")].find((node) => node.textContent === "Pro");
    const names = [...host.querySelectorAll("svg text")].map((node) => node.textContent);
    return {
      opacity: text ? text.getAttribute("opacity") : null,
      names,
      toggled: host._events.some((detail) => detail && detail.name === "Pro" && detail.hidden === true),
    };
  }, hostId);
  if (legend.opacity !== "0.35") fail(`${theme} legend opacity ${legend.opacity}`);
  if (!legend.toggled) fail(`${theme} legendtoggle did not fire`);
  if (legend.names.includes("Pro") === false) fail(`${theme} Pro left the legend`);
  await shot(`legend-${theme}.png`, hostId);
  shots.push(`legend-${theme}.png`);
}

async function hoverHost(hostId, kind) {
  if (kind === "donut") {
    return page.evaluate((id) => {
      const path = document.querySelector(`#${id} path[aria-label]`);
      const pt = path.getPointAtLength(path.getTotalLength() * 0.5);
      const ctm = path.getScreenCTM();
      const point = new DOMPoint(pt.x, pt.y).matrixTransform(ctm);
      return { x: point.x, y: point.y };
    }, hostId);
  }
  const fraction = kind === "combo" ? 1.5 / 4 : kind === "scatter" ? 0.45 : 3.5 / 6;
  return plotPoint(hostId, fraction);
}

for (const theme of ["light", "dark"]) {
  for (const kind of ["bar", "area", "scatter", "combo", "donut"]) {
    const hostId = `${kind}-${theme}`;
    await page.locator(`#${hostId}`).scrollIntoViewIfNeeded();
    const point = await hoverHost(hostId, kind);
    await page.mouse.move(point.x, point.y);
    if (kind === "donut") {
      await page.evaluate(({ id, point }) => {
        const path = document.querySelector(`#${id} path[aria-label]`);
        path.dispatchEvent(new PointerEvent("pointermove", { clientX: point.x, clientY: point.y, bubbles: true }));
      }, { id: hostId, point });
    }
    await page.waitForTimeout(200);
    const tip = await page.evaluate((id) => {
      const host = document.getElementById(id);
      const node = host.querySelector("[data-ck-tip]");
      const swatches = node ? [...node.querySelectorAll("i")].map((swatch) => getComputedStyle(swatch).backgroundColor) : [];
      const dots = [...host.querySelectorAll("[data-ck-dot]")].map((dot) => dot.getAttribute("fill"));
      return {
        text: node ? node.textContent : "",
        hidden: node ? node.hidden : true,
        swatches,
        dots: dots.length,
        rows: node ? node.querySelectorAll(".ck-row").length : 0,
      };
    }, hostId);
    if (tip.hidden) fail(`${hostId} tooltip stayed hidden`);
    const unique = new Set(tip.swatches.filter(Boolean));
    if (tip.rows > 1 && unique.size < 2) fail(`${hostId} swatches are not distinct: ${tip.swatches.join(" | ")}`);
    if (kind === "donut") {
      if (!tip.text.includes("Pro") && !tip.text.includes("Starter") && !tip.text.includes("Enterprise")) {
        fail(`${hostId} donut tooltip ${tip.text}`);
      }
    } else if (tip.dots < 1) fail(`${hostId} has no hover dot`);
    if (kind === "bar" || kind === "area") {
      for (const needle of ["Apr", "Starter", "Pro"]) {
        if (!tip.text.includes(needle)) fail(`${hostId} missing ${needle}: ${tip.text}`);
      }
    }
    if (kind === "combo" && !tip.text.includes("Orders")) fail(`${hostId} combo tooltip ${tip.text}`);
    await page.locator(`#${hostId}`).screenshot({ path: join(outDir, `tooltip-${kind}-${theme}.png`) });
    shots.push(`tooltip-${kind}-${theme}.png`);
    await page.mouse.move(4, 4);
    await page.waitForTimeout(40);
  }
}

const timing = await page.evaluate(async () => {
  function spec(rows, salt) {
    const data = [];
    for (let i = 0; i < rows; i++) data.push({ t: i, v: (i * 3 + salt) % 997 });
    return {
      version: "1",
      type: "line",
      data,
      encoding: { x: "t", y: "v" },
      a11y: { alt: "Synthetic line for an in-place update timing." },
    };
  }
  function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }
  const updates = [];
  for (const rows of [1000, 10000, 100000]) {
    const first = CK.render(spec(rows, 1));
    const second = CK.render(spec(rows, 2));
    const host = document.createElement("div");
    document.body.append(host);
    host.innerHTML = first;
    const inner = [];
    for (let i = 0; i < 8; i++) {
      const markup = i % 2 ? first : second;
      const start = performance.now();
      host.innerHTML = markup;
      inner.push(performance.now() - start);
    }
    host.innerHTML = first;
    CK.patchSvg(host, first);
    const svg = host.querySelector("svg");
    const patched = [];
    for (let i = 0; i < 8; i++) {
      const markup = i % 2 ? first : second;
      const start = performance.now();
      CK.patchSvg(host, markup);
      patched.push(performance.now() - start);
    }
    updates.push({
      rows,
      sameNode: host.querySelector("svg") === svg,
      innerHTMLMs: Number(median(inner).toFixed(2)),
      patchSvgMs: Number(median(patched).toFixed(2)),
    });
    host.remove();
  }

  const rows = 100000;
  const chart = spec(rows, 1);
  const host = document.createElement("div");
  document.body.append(host);
  host.innerHTML = CK.render(chart);
  CK.attach(host, chart, { render: (next) => CK.render(next) });
  const svg = host.querySelector("svg");
  const box = svg.getBoundingClientRect();
  const samples = [];
  for (let i = 0; i < 50; i++) {
    svg.dispatchEvent(new PointerEvent("pointermove", {
      clientX: box.left + (i / 50) * box.width,
      clientY: box.top + box.height * 0.4,
      bubbles: true,
    }));
  }
  for (let i = 0; i < 200; i++) {
    const start = performance.now();
    svg.dispatchEvent(new PointerEvent("pointermove", {
      clientX: box.left + ((i * 17) % Math.max(1, box.width)),
      clientY: box.top + box.height * 0.4,
      bubbles: true,
    }));
    samples.push(performance.now() - start);
  }
  const tip = host.querySelector("[data-ck-tip]");
  const index = CK.buildHoverIndex(rows, 0, 1000, null);
  const lookupStart = performance.now();
  for (let i = 0; i < 1000; i++) CK.lookupIndex(index, i % 1000);
  const lookupMs = performance.now() - lookupStart;
  function makeSeries(n, seed) {
    const xs = new Float64Array(n);
    const ys = new Float64Array(n);
    let state = seed >>> 0;
    for (let i = 0; i < n; i++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      xs[i] = i;
      ys[i] = (state / 4294967296) * 100 + Math.sin(i / 50) * 20;
    }
    return { xs, ys };
  }
  async function frames() {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
  const harness = [];
  for (const mode of ["columns", "rows", "default"]) {
    for (const rows of [1000, 10000, 100000]) {
      const chart = {
        version: "1",
        type: "line",
        data: [],
        encoding: { x: "x", y: "y" },
        size: { width: 640, height: 360 },
        locale: "en-US",
        a11y: { alt: "Indexed line of one series." },
      };
      if (mode !== "default") chart.mark = { curve: "linear", points: "none", sampling: "auto" };
      const host = document.createElement("div");
      document.body.append(host);
      const samples = [];
      for (let i = 0; i < 7; i++) {
        const next = makeSeries(rows, i + 2);
        chart.data = mode === "columns"
          ? { columns: { x: next.xs, y: next.ys } }
          : Array.from({ length: rows }, (_, index) => ({ x: next.xs[index], y: next.ys[index] }));
        const t0 = performance.now();
        const markup = CK.renderLine(chart);
        const t1 = performance.now();
        host.innerHTML = markup;
        const t2 = performance.now();
        await frames();
        const t3 = performance.now();
        samples.push({ render: t1 - t0, dom: t2 - t1, harness: t3 - t0 });
      }
      const mid = (key) => {
        const sorted = samples.map((sample) => sample[key]).sort((a, b) => a - b);
        return Number(sorted[3].toFixed(2));
      };
      harness.push({ mode, rows, renderMs: mid("render"), domMs: mid("dom"), updateMs: mid("harness") });
      host.remove();
    }
  }

  return {
    updates,
    harness,
    hover: {
      width: box.width,
      perOpMs: Number(median(samples).toFixed(3)),
      maxMs: Number(Math.max(...samples).toFixed(3)),
      tipShown: Boolean(tip && !tip.hidden),
      lookup1000Ms: Number(lookupMs.toFixed(3)),
    },
  };
});

if (timing.hover.width < 100) fail(`chart laid out at ${timing.hover.width}px`);
if (timing.hover.perOpMs >= 16) fail(`hover median ${timing.hover.perOpMs}ms`);
if (timing.hover.maxMs >= 16) fail(`hover max ${timing.hover.maxMs}ms`);
if (!timing.hover.tipShown) fail("100k hover did not show a tooltip");
if (timing.hover.lookup1000Ms >= 16) fail(`1000 lookups took ${timing.hover.lookup1000Ms}ms`);
for (const row of timing.updates) {
  if (!row.sameNode) fail(`${row.rows} patch replaced the svg node`);
}

await page.waitForTimeout(200);
const video = page.video();
await context.close();
await browser.close();

const store = "/cursor/stores/self/phase2";
const artifacts = "/opt/cursor/artifacts/phase2";
mkdirSync(store, { recursive: true });
mkdirSync(artifacts, { recursive: true });
for (const name of shots) {
  cpSync(join(outDir, name), join(store, name));
  cpSync(join(outDir, name), join(artifacts, name));
}
let videoPath = "";
if (video) {
  const saved = await video.path();
  videoPath = join(store, "interact-light-dark.webm");
  cpSync(saved, videoPath);
  cpSync(saved, join(artifacts, "interact-light-dark.webm"));
}

const report = { errors, timing, shots, videoPath, pageFile };
writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2));
writeFileSync(join(store, "playwright-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
