/**
 * Render the default-look sheets.
 *   node scripts/design/sheets.mjs
 * Writes PNGs under scripts/design/.out. Set CHARTKIT_SHOT_DIR to also copy
 * them (the path delimiter separates more than one directory).
 */
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { donut, rows } from "./sample.mjs";

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), "../../package.json"));
const esbuild = require("esbuild");
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = join(dirname(fileURLToPath(import.meta.url)), ".out");
const css = readFileSync(join(root, "packages/core/themes/candidates.css"), "utf8");

mkdirSync(outDir, { recursive: true });

const entry = join("/tmp", "ck-sheet-entry.mjs");
await esbuild.build({
  stdin: {
    contents: `import { render } from ${JSON.stringify(join(root, "packages/core/src/all.ts"))};
import { candidates } from ${JSON.stringify(join(root, "packages/core/src/themes/candidates.ts"))};
export { render, candidates };
`,
    resolveDir: root,
    sourcefile: "sheet-entry.ts",
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: entry,
  logLevel: "silent",
});
const { render, candidates } = await import(entry);

function shoot(html, png, width, height) {
  const file = png.replace(/\.png$/, ".html");
  writeFileSync(file, html);
  try {
    execFileSync(
      "timeout",
      [
        "30",
        "google-chrome",
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--hide-scrollbars",
        "--virtual-time-budget=2500",
        `--user-data-dir=/tmp/chrome-sheet-${process.pid}-${Math.random().toString(36).slice(2)}`,
        `--window-size=${width},${height}`,
        `--screenshot=${png}`,
        `file://${file}`,
      ],
      { stdio: "pipe" },
    );
  } catch (error) {
    if (!readFileSync(png).length) throw error;
  }
}

function markOf(_look, extra = {}) {
  return {
    curve: "monotone",
    ...extra,
  };
}

function charts(look) {
  const mark = markOf(look);
  const size = { width: 340, height: 220 };
  const alt = "Sample chart for the default-look sheet.";
  const items = [
    {
      name: "Line",
      spec: {
        version: "1",
        type: "line",
        title: "Pipeline",
        subtitle: "Six months, three plans",
        size,
        data: rows,
        encoding: { x: "month", y: ["Starter", "Pro", "Enterprise"] },
        mark,
        a11y: { alt },
      },
    },
    {
      name: "Grouped bar",
      spec: {
        version: "1",
        type: "bar",
        title: "Plans by month",
        subtitle: "Grouped, not stacked",
        size,
        data: rows,
        encoding: { x: "month", y: ["Starter", "Pro", "Enterprise"] },
        mark,
        a11y: { alt },
      },
    },
    {
      name: "Donut",
      spec: {
        version: "1",
        type: "donut",
        title: "Share of total",
        subtitle: "Same months, summed",
        size,
        data: donut,
        encoding: { x: "plan", y: "revenue" },
        a11y: { alt },
      },
    },
    {
      name: "Stacked area",
      spec: {
        version: "1",
        type: "stacked-area",
        title: "Combined pipeline",
        subtitle: "Stack of the three plans",
        size,
        data: rows,
        encoding: { x: "month", y: ["Starter", "Pro", "Enterprise"] },
        mark,
        a11y: { alt },
      },
    },
    {
      name: "Scatter",
      spec: {
        version: "1",
        type: "scatter",
        title: "Hours and output",
        subtitle: "Three desks",
        size,
        data: [
          { hours: 3, output: 8, desk: "North" },
          { hours: 5, output: 11, desk: "North" },
          { hours: 4, output: 7, desk: "West" },
          { hours: 7, output: 14, desk: "West" },
          { hours: 6, output: 9, desk: "East" },
          { hours: 8, output: 15, desk: "East" },
        ],
        encoding: { x: "hours", y: "output", color: "desk" },
        mark,
        a11y: { alt },
      },
    },
    {
      name: "Combo",
      spec: {
        version: "1",
        type: "combo",
        title: "Orders and fill",
        subtitle: "Bars on the left, rate on the right",
        size,
        data: [
          { week: "W1", orders: 42, rate: 0.31 },
          { week: "W2", orders: 48, rate: 0.36 },
          { week: "W3", orders: 45, rate: 0.33 },
          { week: "W4", orders: 53, rate: 0.41 },
        ],
        encoding: {
          x: "week",
          y: [
            { field: "orders", mark: "bar" },
            { field: "rate", mark: "line", axis: "y2" },
          ],
        },
        axes: { y2: { title: "Fill" } },
        mark,
        a11y: { alt },
      },
    },
    {
      name: "Heatmap",
      spec: {
        version: "1",
        type: "heatmap",
        title: "Desk load",
        subtitle: "Sequential scale",
        size,
        data: heatmap(),
        encoding: {
          x: "slot",
          y: "day",
          color: { field: "level", range: [1, 2, 3, 4, 5, 6].map((n) => `var(--ck-seq-${n})`) },
        },
        mark: { curve: "monotone" },
        a11y: { alt },
      },
    },
    {
      name: "Candlestick",
      spec: {
        version: "1",
        type: "candlestick",
        title: "Session range",
        subtitle: "Up and down from the theme",
        size,
        data: [
          { day: "D1", open: 22, high: 26, low: 20, close: 25 },
          { day: "D2", open: 25, high: 27, low: 23, close: 24 },
          { day: "D3", open: 24, high: 29, low: 23, close: 28 },
          { day: "D4", open: 28, high: 30, low: 21, close: 22 },
          { day: "D5", open: 22, high: 26, low: 21, close: 25 },
          { day: "D6", open: 25, high: 28, low: 24, close: 27 },
        ],
        encoding: { x: "day", open: "open", high: "high", low: "low", close: "close" },
        a11y: { alt },
      },
    },
    {
      name: "Gauge",
      spec: {
        version: "1",
        type: "gauge",
        title: "Load",
        size: { width: 340, height: 200 },
        metric: { label: "Load", value: 58, min: 0, max: 100 },
        a11y: { alt },
      },
    },
    {
      name: "KPI",
      spec: {
        version: "1",
        type: "kpi",
        size: { width: 340, height: 150 },
        metric: { label: "Open items", value: 1840, delta: 0.06 },
        data: [8, 9, 8, 11, 10, 13, 12],
        a11y: { alt },
      },
    },
    {
      name: "Progress ring",
      spec: {
        version: "1",
        type: "progress-ring",
        size: { width: 340, height: 200 },
        metric: { label: "Shipped", value: 5, min: 0, max: 8 },
        a11y: { alt },
      },
    },
    {
      name: "Spike",
      spec: {
        version: "1",
        type: "spike",
        title: "Hits",
        subtitle: "One busy slot",
        size: { width: 340, height: 180 },
        data: [
          { slot: "t1", hits: 1 },
          { slot: "t2", hits: 2 },
          { slot: "t3", hits: 9 },
          { slot: "t4", hits: 3 },
          { slot: "t5", hits: 2 },
          { slot: "t6", hits: 4 },
        ],
        encoding: { x: "slot", y: "hits" },
        mark,
        a11y: { alt },
      },
    },
    {
      name: "Sparkline",
      spec: {
        version: "1",
        type: "sparkline",
        size: { width: 340, height: 88 },
        data: [8, 11, 9, 14, 13, 16, 15],
        mark,
        a11y: { alt },
      },
    },
    {
      name: "Mini area",
      spec: {
        version: "1",
        type: "mini-area",
        size: { width: 340, height: 88 },
        data: [5, 7, 6, 10, 9, 12, 11],
        mark,
        a11y: { alt },
      },
    },
  ];
  return items.map((chart) => {
    const slug = chart.name.toLowerCase().replace(/\s+/g, "-");
    return {
      ...chart,
      spec: {
        ...chart.spec,
        id: `${look.id}-${slug}`,
        theme: look.id,
        a11y: { alt: `${look.title}, ${chart.name}.` },
      },
    };
  });
}

function heatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu"];
  const slots = ["9a", "12p", "3p", "6p"];
  const levels = [
    [2, 5, 8, 4],
    [3, 6, 7, 5],
    [1, 4, 9, 6],
    [2, 3, 5, 8],
  ];
  const data = [];
  days.forEach((day, row) => {
    slots.forEach((slot, col) => data.push({ day, slot, level: levels[row][col] }));
  });
  return data;
}

function swatches(tokens) {
  const chip = (color, label) =>
    `<span class="chip"><i style="background:${color}"></i>${label}</span>`;
  const series = tokens.series.map((color, index) => chip(color, String(index + 1))).join("");
  const seq = tokens.sequential.map((color) => `<i style="background:${color}"></i>`).join("");
  const div = tokens.diverging.map((color) => `<i style="background:${color}"></i>`).join("");
  return `<div class="swatches"><div class="series">${series}</div><div class="ramps"><span>Seq</span><span class="ramp">${seq}</span><span>Div</span><span class="ramp">${div}</span></div></div>`;
}

function sheetHtml(look, scheme) {
  const tokens = look[scheme];
  const page = scheme === "dark" ? tokens.background : tokens.surface;
  const cards = charts(look)
    .map((chart) => {
      const svg = render(chart.spec);
      if (!svg || svg.includes("ck-chart-error")) {
        throw new Error(`${look.id} ${scheme} ${chart.name} failed: ${svg}`);
      }
      return `<figure class="card"><figcaption>${chart.name}</figcaption>${svg}</figure>`;
    })
    .join("");
  return `<!doctype html><meta charset="utf-8"><title>${look.title} ${scheme}</title>
<style>
${css}
html,body{margin:0;width:1480px;background:${page};color:${tokens.text}}
body{font-family:${look.fontFamily};font-variant-numeric:tabular-nums}
.page{padding:22px 24px 28px}
header{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin-bottom:16px}
h1{font-size:22px;line-height:1.2;margin:0;font-weight:650}
p{margin:4px 0 0;color:${tokens.muted};font-size:13px}
.swatches{display:flex;flex-direction:column;gap:8px;align-items:flex-end}
.series,.ramps{display:flex;gap:6px;align-items:center}
.chip{display:flex;align-items:center;gap:4px;font-size:11px;color:${tokens.muted}}
.chip i,.ramp i{width:18px;height:18px;border-radius:4px;display:inline-block}
.ramps{font-size:11px;color:${tokens.muted}}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 12px}
figure{margin:0}
figcaption{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${tokens.muted};margin:0 0 4px}
figure svg{width:100%;height:auto;display:block;border-radius:12px}
</style>
<body data-ck-theme="${look.id}" data-ck-scheme="${scheme}">
<div class="page">
<header>
  <div><h1>${look.title}</h1><p>${scheme} · ${look.note}</p></div>
  ${swatches(tokens)}
</header>
<div class="grid">${cards}</div>
</div>
</body>`;
}

const paths = [];
if (process.env.SKIP_CANDIDATES !== "1") {
  for (const look of candidates) {
    for (const scheme of ["light", "dark"]) {
      const png = join(outDir, `${look.id}-${scheme}.png`);
      shoot(sheetHtml(look, scheme), png, 1480, 980);
      paths.push(png);
      console.log("wrote", png);
    }
  }
}

const compareBundle = join("/tmp", "ck-compare.js");
await esbuild.build({
  entryPoints: [join(root, "scripts/design/competitors.jsx")],
  bundle: true,
  format: "iife",
  platform: "browser",
  outfile: compareBundle,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    react: join(root, "bench/node_modules/react"),
    "react-dom": join(root, "bench/node_modules/react-dom"),
  },
  nodePaths: [join(root, "bench/node_modules")],
  logLevel: "silent",
});

function compareCell(id, svg) {
  if (svg) return `<div class="plot">${svg}</div>`;
  if (id.startsWith("chartjs")) return `<canvas id="${id}" width="250" height="188"></canvas>`;
  return `<div class="plot" id="${id}" style="width:250px;height:188px"></div>`;
}

const compareColumns = [
  ...candidates.map((look) => ({
    id: look.id,
    title: look.title,
    note: "ChartKit candidate, light",
    cells: {
      line: render(compareSpec(look, "line")),
      bar: render(compareSpec(look, "bar")),
      donut: render(compareSpec(look, "donut")),
      area: render(compareSpec(look, "area")),
    },
  })),
  {
    id: "recharts",
    title: "Recharts 3.10",
    note: "Component defaults. No palette, so every series is the default stroke.",
    cells: { line: null, bar: null, donut: null, area: null },
  },
  {
    id: "chartjs",
    title: "Chart.js 4.5",
    note: "chart.js/auto. Colours plugin on, animation off.",
    cells: { line: null, bar: null, donut: null, area: null },
  },
  {
    id: "echarts",
    title: "ECharts 6.1",
    note: "No colour option. Library theme palette, animation off.",
    cells: { line: null, bar: null, donut: null, area: null },
  },
  {
    id: "tremor",
    title: "Tremor",
    note: "Default colors is one blue. Grid and ticks follow Tremor. Drawn with Recharts.",
    cells: { line: null, bar: null, donut: null, area: null },
  },
];

function compareSpec(look, kind) {
  const mark = kind === "donut" ? undefined : markOf(look, kind === "area" ? { area: true } : {});
  const size = { width: 250, height: 188 };
  const base = { version: "1", size, id: `${look.id}-${kind}`, theme: look.id, a11y: { alt: `${look.title} ${kind} comparison.` }, mark };
  if (kind === "line" || kind === "area") {
    return { ...base, type: "line", data: rows, encoding: { x: "month", y: ["Starter", "Pro", "Enterprise"] } };
  }
  if (kind === "bar") {
    return { ...base, type: "bar", data: rows, encoding: { x: "month", y: ["Starter", "Pro", "Enterprise"] } };
  }
  return { ...base, type: "donut", data: donut, encoding: { x: "plan", y: "revenue" }, mark: undefined };
}

const kinds = [
  ["line", "Line"],
  ["bar", "Grouped bar"],
  ["donut", "Donut"],
  ["area", "Area"],
];
const head = compareColumns.map((column) => `<th><strong>${column.title}</strong><span>${column.note}</span></th>`).join("");
const body = kinds
  .map(([kind, label]) => {
    const cells = compareColumns
      .map((column) => {
        const id = `${column.id}-${kind}`;
        const svg = column.cells[kind];
        if (svg && svg.includes("ck-chart-error")) throw new Error(id + " failed");
        const themed = candidates.some((look) => look.id === column.id);
        const attrs = themed ? ` data-ck-theme="${column.id}" data-ck-scheme="light"` : "";
        return `<td><div class="slot"${attrs}><div class="kind">${label}</div>${compareCell(id, svg)}</div></td>`;
      })
      .join("");
    return `<tr>${cells}</tr>`;
  })
  .join("");

const compareHtml = `<!doctype html><meta charset="utf-8"><title>Default look comparison</title>
<style>
${css}
html,body{margin:0;background:#e7e5e4;color:#1c1917;font-family:ui-sans-serif,system-ui,sans-serif}
body{width:1960px}
.wrap{padding:18px 16px 24px}
h1{font-size:20px;margin:0 0 4px}
.lead{margin:0 0 12px;font-size:13px;color:#57534e}
table{border-collapse:separate;border-spacing:8px 10px;table-layout:fixed}
th{font-weight:500;text-align:left;vertical-align:bottom;width:266px}
th strong{display:block;font-size:14px}
th span{display:block;font-size:11px;color:#57534e;max-width:250px}
td{vertical-align:top;background:#fff;border-radius:12px;padding:8px;width:250px;overflow:hidden}
.slot{width:250px;height:208px;overflow:hidden}
.kind{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#78716c;margin:0 0 4px;height:16px}
.plot{width:250px;height:188px;overflow:hidden;position:relative}
.plot > .recharts-wrapper,.plot > svg,.plot > canvas,svg.ck-chart{width:250px;height:188px;display:block}
canvas{display:block;width:250px;height:188px}
</style>
<body>
<div class="wrap">
<h1>Same data, library defaults</h1>
<p class="lead">Line, grouped bar, donut, and area. ChartKit columns are the light candidates. Animations are off. Recharts has no series palette. Tremor’s default colour list is a single blue.</p>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
</div>
<script src="${compareBundle}"></script>
</body>`;

const comparePng = join(outDir, "compare-defaults.png");
await shootCompare(compareHtml, comparePng);
paths.push(comparePng);
console.log("wrote", comparePng);
console.log(paths.join("\n"));
const shotDirs = (process.env.CHARTKIT_SHOT_DIR ?? "").split(delimiter).map((dir) => dir.trim()).filter(Boolean);
for (const dir of shotDirs) {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(outDir)) {
    if (name.endsWith(".png")) cpSync(join(outDir, name), join(dir, name));
  }
}

async function shootCompare(html, png) {
  const file = png.replace(/\.png$/, ".html");
  writeFileSync(file, html);
  const { chromium } = await import(join(root, "bench/node_modules/playwright/index.mjs"));
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const page = await browser.newPage({ viewport: { width: 1960, height: 1280 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto(`file://${file}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.body.dataset.ckReady === "1" || document.body.dataset.ckError, null, { timeout: 20000 });
  const ckError = await page.evaluate(() => document.body.dataset.ckError || "");
  if (ckError) errors.push(ckError);
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() => {
    const bad = [];
    for (const slot of document.querySelectorAll("td .slot")) {
      const box = slot.getBoundingClientRect();
      for (const el of slot.querySelectorAll("svg, canvas, .recharts-wrapper")) {
        const rect = el.getBoundingClientRect();
        const id = el.id || el.getAttribute("class") || el.tagName;
        if (rect.width > box.width + 8 || rect.height > box.height + 24) {
          bad.push(`${id} ${Math.round(rect.width)}x${Math.round(rect.height)} in slot ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
        if (rect.right > box.right + 8 || rect.bottom > box.bottom + 8 || rect.left < box.left - 8 || rect.top < box.top - 8) {
          bad.push(`${id} outside slot by ${Math.round(rect.left - box.left)},${Math.round(rect.top - box.top)}`);
        }
      }
    }
    return bad;
  });
  if (overflow.length) errors.push(overflow.join("\n"));
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: 1960, height: Math.max(1280, height) });
  const boxes = await page.evaluate(() => {
    return ["recharts", "chartjs", "echarts", "tremor"].flatMap((lib) =>
      ["line", "bar", "donut", "area"].map((kind) => {
        const el = document.getElementById(`${lib}-${kind}`);
        const rect = el.getBoundingClientRect();
        return { id: `${lib}-${kind}`, x: rect.x, y: rect.y, w: rect.width, h: rect.height };
      }),
    );
  });
  await page.screenshot({ path: png });
  await browser.close();
  if (errors.length) throw new Error(errors.join("\n"));
  const check = join("/tmp", "ck-pixel-check.py");
  writeFileSync(
    check,
    `import json, sys
from PIL import Image
boxes = json.loads(sys.argv[2])
im = Image.open(sys.argv[1]).convert("RGB")
print("png", im.size)
fail = []
for box in boxes:
    x, y, w, h = [int(round(v)) for v in (box["x"], box["y"], box["w"], box["h"])]
    crop = im.crop((x, y, min(im.width, x + w), min(im.height, y + h)))
    ink = 0
    px = crop.load()
    for yy in range(crop.height):
        for xx in range(crop.width):
            r, g, b = px[xx, yy]
            if abs(r - g) > 12 or abs(g - b) > 12 or abs(r - b) > 12 or min(r, g, b) < 236:
                ink += 1
    print(f"{box['id']} ink={ink} box={w:.0f}x{h:.0f}")
    if ink < 40:
        fail.append(box["id"])
if fail:
    raise SystemExit("blank cells: " + ", ".join(fail))
`,
  );
  execFileSync("python3", [check, png, JSON.stringify(boxes)], { stdio: "inherit" });
}
