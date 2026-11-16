/**
 * Browser checks for the default keyboard model and the screen-reader data table.
 * Mounts every spec in packages/core/examples with `mount()` from the vanilla adapter,
 * then drives real Tab, arrow, Home, End, and Escape presses in Chromium.
 *   node scripts/a11y-playwright.mjs
 * The report lands in scripts/.interact-out/a11y-report.json. Exit code 1 on a failed check.
 * This proves DOM, focus, and live-region behaviour. It cannot prove what a screen reader says.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "packages/core/src");
const outDir = join(root, "scripts/.interact-out");
mkdirSync(outDir, { recursive: true });

const entry = join(outDir, "a11y-entry.mjs");
writeFileSync(
  entry,
  `export { mount } from ${JSON.stringify(join(root, "packages/vanilla/src/index.ts"))};\nexport { render } from ${JSON.stringify(join(src, "extra.ts"))};\n`,
);
const bundle = join(outDir, "a11y.js");
await build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  globalName: "CK",
  platform: "browser",
  outfile: bundle,
  logLevel: "silent",
  alias: {
    "@chartkitdev/core/canvas/hydrate": join(src, "canvas/hydrate.ts"),
    "@chartkitdev/core/export-menu": join(src, "export-menu.ts"),
    "@chartkitdev/core/export": join(src, "export.ts"),
    "@chartkitdev/core/extra-tip": join(src, "extra-tip.ts"),
    "@chartkitdev/core/extra": join(src, "extra.ts"),
    "@chartkitdev/core/all": join(src, "all.ts"),
    "@chartkitdev/core/interact": join(src, "interact.ts"),
    "@chartkitdev/core": join(src, "index.ts"),
  },
});

/** Types with the index model in `interact.ts` (KEY_TYPES), and the two with a mark model in `extra-tip.ts`. */
const INDEXED = new Set(["line", "bar", "stacked-area", "scatter", "combo", "donut", "pie", "sunburst", "candlestick", "sparkline", "mini-area", "spike"]);
const ARC = new Set(["donut", "pie", "sunburst"]);
const MARKED = new Set(["tree", "streamgraph"]);

const exampleDir = join(root, "packages/core/examples");
const specs = readdirSync(exampleDir)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => ({ id: name.replace(/\.json$/, ""), spec: JSON.parse(readFileSync(join(exampleDir, name), "utf8")) }));

const big = Array.from({ length: 5000 }, (_, i) => ({ t: i, load: Math.round(50 + 40 * Math.sin(i / 90)) }));
specs.push({
  id: "big-line",
  spec: { version: "1", type: "line", data: big, encoding: { x: "t", y: "load" }, a11y: { alt: "Load swings between 10 and 90 across 5,000 samples." } },
});
const months = ["Jan", "Feb", "Mar", "Apr"];
const longRows = months.flatMap((month, i) => [
  { month, plan: "Starter", seats: 10 + i },
  { month, plan: "Pro", seats: 20 + i * 2 },
]);
specs.push({
  id: "long-line",
  spec: { version: "1", type: "line", data: longRows, encoding: { x: "month", y: "seats", series: "plan" }, a11y: { alt: "Pro seats grow faster than Starter seats." } },
});
const wide = months.map((month, i) => ({ month, starter: 10 + i, pro: 20 + i * 2 }));
const wideLine = { version: "1", type: "line", title: "Seats", data: wide, encoding: { x: "month", y: ["starter", "pro"] } };
specs.push({ id: "opt-out", spec: { ...wideLine, a11y: { alt: "Seats by plan.", keyboard: false, dataTable: false } } });
specs.push({ id: "table-button", spec: { ...wideLine, a11y: { alt: "Seats by plan.", dataTable: true } } });
specs.push({ id: "no-tooltip", spec: { ...wideLine, tooltip: false, a11y: { alt: "Seats by plan." } } });

const html = `<!doctype html><meta charset="utf-8"><title>ChartKit keyboard and table</title>
<style>
  html { color-scheme: light; }
  body { margin: 0; padding: 16px; font-family: ui-sans-serif, system-ui, sans-serif; }
  .host { width: 640px; height: 360px; margin-bottom: 24px; }
</style>
<body>
<button id="before">before</button>
${specs.map((item) => `<div class="host" id="${item.id}"></div>`).join("\n")}
<button id="after">after</button>
<script src="./a11y.js"></script>
<script>
  window.SPECS = ${JSON.stringify(Object.fromEntries(specs.map((item) => [item.id, item.spec])))};
  window.STATIC = {};
  window.clicks = {};
  const t0 = performance.now();
  for (const id of Object.keys(SPECS)) {
    const host = document.getElementById(id);
    try { STATIC[id] = CK.render(SPECS[id]); } catch (error) { STATIC[id] = "error: " + error; }
    host.addEventListener("pointclick", (event) => { clicks[id] = event.detail.series; });
    host.addEventListener("seriesclick", (event) => { clicks[id] = event.detail.series; });
    CK.mount(host, SPECS[id]);
  }
  window.mountMs = performance.now() - t0;
  document.body.dataset.ckReady = "1";
</script>
`;
const pageFile = join(outDir, "a11y.html");
writeFileSync(pageFile, html);

const benchPlaywright = join(root, "bench/node_modules/playwright/index.mjs");
const { chromium } = await import(existsSync(benchPlaywright) ? benchPlaywright : "playwright");
const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await (await browser.newContext({ viewport: { width: 760, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
const fail = (message) => errors.push(message);

await page.goto(`file://${pageFile}`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.body.dataset.ckReady === "1");
await page.waitForTimeout(800);

const state = (id) =>
  page.evaluate((hostId) => {
    const host = document.getElementById(hostId);
    const svg = host.querySelector("svg");
    const tip = host.querySelector("[data-ck-tip]");
    const active = document.activeElement;
    const outline = svg ? getComputedStyle(svg) : null;
    const table = host.querySelector("[data-ck-table]");
    const wrap = host.querySelector("[data-ck-table-wrap]");
    const wrapBox = wrap?.getBoundingClientRect();
    return {
      type: svg?.getAttribute("data-ck-type") ?? "",
      role: svg?.getAttribute("role") ?? "",
      label: svg?.getAttribute("aria-label") ?? "",
      tabindex: svg?.getAttribute("tabindex") ?? null,
      focusOnSvg: active === svg,
      focusInHost: host.contains(active),
      activeLabel: active?.getAttribute?.("aria-label") ?? "",
      focusVisible: svg ? svg.matches(":focus-visible") : false,
      outline: outline ? `${outline.outlineStyle} ${outline.outlineWidth}` : "",
      live: host.querySelector("[data-ck-live]")?.textContent ?? null,
      liveRegions: host.querySelectorAll("[aria-live]").length,
      tipShown: tip ? !tip.hidden : false,
      tipText: tip && !tip.hidden ? tip.textContent : "",
      dots: svg?.querySelectorAll("[data-ck-dot]").length ?? 0,
      crosshair: Boolean(svg?.querySelector("[data-ck-crosshair]")),
      barsOn: svg?.querySelectorAll(".ck-bar-on").length ?? 0,
      slice: svg?.querySelector("[data-ck-kf]")?.getAttribute("aria-label") ?? "",
      dimmed: svg?.querySelectorAll("[data-ck-dim]").length ?? 0,
      table: table
        ? {
            caption: table.querySelector("caption")?.textContent ?? "",
            head: [...table.querySelectorAll("thead th")].map((cell) => cell.textContent),
            rows: table.querySelectorAll("tbody tr").length,
            first: [...(table.querySelector("tbody tr")?.children ?? [])].map((cell) => cell.textContent),
            last: [...(table.querySelector("tbody tr:last-child")?.children ?? [])].map((cell) => cell.textContent),
            ragged: [...table.querySelectorAll("tbody tr")].some((row) => row.children.length !== table.querySelectorAll("thead th").length),
            button: Boolean(host.querySelector("[data-ck-table-btn]")),
            visible: wrapBox ? wrapBox.width > 2 || wrapBox.height > 2 : false,
            repeatsAlt: (table.textContent ?? "").includes(svg?.getAttribute("aria-label") ?? "\u0000"),
          }
        : null,
    };
  }, id);

const report = { mountMs: await page.evaluate(() => window.mountMs), charts: {} };
const overflow = await page.evaluate(() => ({ x: document.documentElement.scrollWidth > document.documentElement.clientWidth }));
if (overflow.x) fail("the hidden tables widened the page");

for (const { id, spec } of specs) {
  const type = spec.type;
  const out = { type };
  report.charts[id] = out;
  out.mounted = await state(id);
  if (!out.mounted.type) {
    out.note = "did not paint";
    continue;
  }
  // Focus order: Tab from the control before the chart must land on the chart, or skip it when it is not focusable.
  await page.evaluate((hostId) => {
    const host = document.getElementById(hostId);
    let stop = document.getElementById(`stop-${hostId}`);
    if (!stop) {
      stop = document.createElement("button");
      stop.id = `stop-${hostId}`;
      stop.textContent = "stop";
      host.before(stop);
    }
    stop.focus();
  }, id);
  await page.keyboard.press("Tab");
  out.tab = await state(id);
  const indexed = INDEXED.has(type) && id !== "opt-out";
  if (id === "opt-out") {
    if (out.tab.tabindex !== null || out.tab.focusInHost) fail("opt-out: chart is still in the tab order");
    if (out.mounted.table) fail("opt-out: table was still built");
    continue;
  }
  if (!indexed) {
    out.model = MARKED.has(type) ? "marks" : "none";
    if (MARKED.has(type)) {
      if (!out.tab.focusInHost) fail(`${id}: Tab did not reach a mark`);
      await page.keyboard.press(type === "tree" ? "ArrowDown" : "ArrowRight");
      out.arrow = await state(id);
      if (!out.arrow.activeLabel || out.arrow.activeLabel === out.tab.activeLabel) fail(`${id}: arrow did not move mark focus (${out.arrow.activeLabel})`);
    } else if (out.tab.tabindex !== null) fail(`${id}: no keyboard model, but the svg is a tab stop`);
    continue;
  }
  out.model = ARC.has(type) ? "slices" : "index";
  if (!out.tab.focusOnSvg) fail(`${id}: Tab did not focus the chart`);
  if (!out.tab.focusVisible || !/^solid 2px/.test(out.tab.outline)) fail(`${id}: no visible focus ring (${out.tab.outline})`);
  if (out.tab.live) fail(`${id}: focus alone announced "${out.tab.live}"`);
  if (out.tab.liveRegions !== 1) fail(`${id}: ${out.tab.liveRegions} live regions`);
  if (out.tab.role !== "img" || !out.tab.label) fail(`${id}: svg lost role or alt`);

  await page.keyboard.press("ArrowRight");
  out.first = await state(id);
  await page.keyboard.press("ArrowRight");
  out.second = await state(id);
  if (!out.first.live) fail(`${id}: first arrow announced nothing`);
  if (!out.second.live || out.second.live === out.first.live) fail(`${id}: second arrow did not move (${out.second.live})`);
  if (out.second.live?.includes(out.tab.label)) fail(`${id}: the announcement repeats the alt text`);
  const visible = out.second.dots > 0 || out.second.barsOn > 0 || out.second.slice || out.second.crosshair;
  if (!visible) fail(`${id}: no visible mark for the focused point`);
  if (spec.tooltip !== false && !out.second.tipShown) fail(`${id}: tooltip stayed hidden on arrow`);

  await page.locator(`[id="${id}"]`).screenshot({ path: join(outDir, `a11y-${id}.png`) });

  await page.keyboard.press("ArrowDown");
  out.down = await state(id);
  if (out.seriesMove !== false) await page.locator(`[id="${id}"]`).screenshot({ path: join(outDir, `a11y-${id}-series.png`) });
  out.seriesMove = out.down.live !== out.second.live;
  await page.keyboard.press("ArrowDown");
  out.down2 = await state(id);

  await page.keyboard.press("End");
  out.end = await state(id);
  await page.keyboard.press("Home");
  out.home = await state(id);
  if (out.end.live === out.home.live) fail(`${id}: Home and End read the same point`);

  if (ARC.has(type) || type === "bar" || type === "line") {
    await page.keyboard.press("Enter");
    out.enterSeries = await page.evaluate((hostId) => window.clicks[hostId] ?? null, id);
    if (!out.enterSeries) fail(`${id}: Enter fired no click event`);
    if (ARC.has(type) && out.enterSeries && !out.home.live.startsWith(out.enterSeries)) fail(`${id}: Enter named ${out.enterSeries}, focus was ${out.home.live}`);
  }

  await page.keyboard.press("Escape");
  out.escape = await state(id);
  if (out.escape.live || out.escape.tipShown || out.escape.dots || out.escape.slice || out.escape.barsOn || out.escape.dimmed) fail(`${id}: Escape left ${JSON.stringify({ live: out.escape.live, tip: out.escape.tipShown, dots: out.escape.dots, slice: out.escape.slice, bars: out.escape.barsOn, dim: out.escape.dimmed })}`);
  if (!out.escape.focusOnSvg) fail(`${id}: Escape moved focus off the chart`);

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Tab");
  out.blur = await state(id);
  if (out.blur.focusOnSvg) fail(`${id}: Tab did not leave the chart`);
  if (out.blur.tipShown || out.blur.live) fail(`${id}: leaving the chart kept the tooltip or announcement`);

  const table = out.mounted.table;
  if (!table) fail(`${id}: no data table`);
  else {
    if (id !== "table-button" && (table.button || table.visible)) fail(`${id}: the default table is visible`);
    if (table.ragged) fail(`${id}: table rows do not match the header`);
    if (table.repeatsAlt) fail(`${id}: table repeats the alt text`);
    if (!table.rows) fail(`${id}: table is empty`);
  }
}

// Exact table contents for known data.
const wideTable = report.charts["no-tooltip"].mounted.table;
if (JSON.stringify(wideTable?.head) !== JSON.stringify(["month", "starter", "pro"]) || JSON.stringify(wideTable?.first) !== JSON.stringify(["Jan", "10", "20"]) || wideTable?.rows !== 4) fail(`wide table: ${JSON.stringify(wideTable)}`);
const longTable = report.charts["long-line"].mounted.table;
if (JSON.stringify(longTable?.head) !== JSON.stringify(["month", "plan", "seats"]) || JSON.stringify(longTable?.first) !== JSON.stringify(["Jan", "Starter", "10"]) || longTable?.rows !== 8) fail(`long table: ${JSON.stringify(longTable)}`);
const bigTable = report.charts["big-line"].mounted.table;
if (bigTable?.rows !== 1000 || bigTable.first[0] !== "0" || !/^4[,.]?999$/.test(bigTable.last[0]) || !bigTable.caption.includes("1000 of 5000")) fail(`sampled table: ${JSON.stringify(bigTable)}`);
if (!report.charts["table-button"].mounted.table?.button) fail("dataTable: true lost its button");
const quiet = report.charts["no-tooltip"];
if (quiet.second?.tipShown) fail("tooltip: false showed a tooltip from the keyboard");
if (!report.charts["long-line"].seriesMove) fail("ArrowDown did not narrow a two-series line to one series");

// Server output: the static string carries none of the client hooks.
const leaks = await page.evaluate(() => Object.entries(STATIC).filter(([, svg]) => /tabindex="0" [^>]*class="ck-chart"|data-ck-table|data-ck-live|aria-live/.test(svg)).map(([id]) => id));
if (leaks.length) fail(`static render carries client hooks: ${leaks.join(", ")}`);

report.covered = [...new Set(Object.values(report.charts).filter((c) => c.model && c.model !== "none").map((c) => c.type))].sort();
report.notCovered = [...new Set(Object.values(report.charts).filter((c) => c.model === "none").map((c) => c.type))].sort();
report.errors = errors;
writeFileSync(join(outDir, "a11y-report.json"), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();

console.log(JSON.stringify({ mountMs: report.mountMs, covered: report.covered, notCovered: report.notCovered, errors }, null, 2));
if (errors.length) process.exit(1);
