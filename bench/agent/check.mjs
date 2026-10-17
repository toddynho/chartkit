import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
// Node answers stay on disk under bench/.out (gitignored). Deleting the bundle before render()
// can drop the ESM module graph. Browser bundles are removed after the page has the source in memory.
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { build } from "esbuild";
import { createRenderer } from "../../packages/core/src/render.ts";
import { repair, validate } from "../../packages/core/src/validate.ts";
import { line } from "../../packages/core/src/charts/line.ts";
import { bar } from "../../packages/core/src/charts/bar.ts";
import { donut } from "../../packages/core/src/charts/donut.ts";
import { stackedArea } from "../../packages/core/src/charts/stacked-area.ts";
import { scatter } from "../../packages/core/src/charts/scatter.ts";
import { combo } from "../../packages/core/src/charts/combo.ts";
import { heatmap } from "../../packages/core/src/charts/heatmap.ts";
import { gauge } from "../../packages/core/src/charts/gauge.ts";
import { kpi } from "../../packages/core/src/charts/kpi.ts";
import { sparkline } from "../../packages/core/src/charts/sparkline.ts";
import { miniArea } from "../../packages/core/src/charts/mini-area.ts";
import { progressRing } from "../../packages/core/src/charts/progress-ring.ts";
import { spike } from "../../packages/core/src/charts/spike.ts";
import { candlestick } from "../../packages/core/src/charts/candlestick.ts";
import { ACCEPTED } from "./capabilities.mjs";
import { libraryCapturePlugin, numbersFromOption, typesFromOption } from "./capture.mjs";
import { noDocsHint, officialReference } from "./docs.mjs";

const render = createRenderer([
  line, bar, donut, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick,
]);

export { repair };

function observedChartTypes(facts) {
  if (!Array.isArray(facts?.chartTypes)) return [];
  const seen = new Set();
  const types = [];
  for (const item of facts.chartTypes) {
    if (typeof item !== "string" || !item || seen.has(item)) continue;
    seen.add(item);
    types.push(item);
  }
  return types;
}

/** How prompts and feedback name each library: display name plus the real npm package. "chartjs" is only an internal key. */
export const LIBRARY_LABEL = {
  recharts: 'Recharts (npm package "recharts")',
  echarts: 'ECharts (npm package "echarts")',
  chartjs: 'Chart.js (npm package "chart.js")',
};

const LIBRARY_PACKAGE = {
  recharts: /^recharts$/,
  echarts: /^echarts(?:\/.*)?$/,
  chartjs: /^chart\.js(?:\/.*)?$/,
};

export function benchRoot() {
  if (process.env.BENCH_ROOT) return process.env.BENCH_ROOT;
  const here = dirname(fileURLToPath(import.meta.url));
  return here.endsWith("/.out") ? dirname(here) : dirname(here);
}

export function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("no JSON object in the model output");
  return JSON.parse(raw.slice(start, end + 1));
}

export function extractModule(text) {
  const fenced = text.match(/```(?:jsx|tsx|javascript|js|typescript|ts|mjs)?[ \t]*\n?([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

function bindingsFromClause(clause) {
  const text = clause.trim().replace(/\/\*[\s\S]*?\*\//g, "");
  const names = [];
  const named = text.match(/\{([\s\S]*)\}/);
  if (named) {
    for (const part of named[1].split(",")) {
      const cleaned = part.replace(/\btype\b/g, "").trim();
      if (!cleaned) continue;
      const alias = cleaned.split(/\s+as\s+/i).pop().trim();
      if (/^[A-Za-z_$][\w$]*$/.test(alias)) names.push(alias);
    }
  }
  const star = text.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
  if (star) names.push(star[1]);
  const withoutNamed = text.replace(/\{[\s\S]*\}/, "").replace(/\*\s+as\s+[A-Za-z_$][\w$]*/, "");
  for (const part of withoutNamed.split(",")) {
    const cleaned = part.trim();
    if (!cleaned) continue;
    const alias = cleaned.split(/\s+as\s+/i).pop().trim();
    if (/^[A-Za-z_$][\w$]*$/.test(alias)) names.push(alias);
  }
  return names;
}

/** True when the source imports the library and mentions a binding it imported. */
export function libraryUse(source, library) {
  const pattern = LIBRARY_PACKAGE[library];
  if (!pattern) return { imports: false, uses: false, bindings: [] };
  const bindings = [];
  let imports = false;
  for (const match of source.matchAll(/import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g)) {
    if (!pattern.test(match[2])) continue;
    imports = true;
    bindings.push(...bindingsFromClause(match[1]));
  }
  for (const match of source.matchAll(/(?:const|let|var)\s+([\s\S]*?)\s*=\s*require\(\s*["']([^"']+)["']\s*\)/g)) {
    if (!pattern.test(match[2])) continue;
    imports = true;
    bindings.push(...bindingsFromClause(match[1]));
  }
  const sideEffect = library === "chartjs" && /import\s+["']chart\.js(?:\/auto)?["']/.test(source);
  if (sideEffect) imports = true;
  const body = source
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["']\s*;?/g, "")
    .replace(/import\s+["'][^"']+["']\s*;?/g, "")
    .replace(/(?:const|let|var)\s+[\s\S]*?=\s*require\(\s*["'][^"']+["']\s*\)\s*;?/g, "");
  const uses = bindings.some((name) => new RegExp(`\\b${name}\\b`).test(body))
    || (sideEffect && /\bChart\b/.test(body));
  return { imports, uses, bindings };
}

/** Chart.js and Recharts draw in a document. ECharts needs one unless it uses the Node SSR init. */
export function needsBrowser(library, source) {
  if (library === "chartjs" || library === "recharts") return true;
  if (library !== "echarts") return false;
  if (/\bdocument\b|\bwindow\b|\bHTMLElement\b/.test(source)) return true;
  if (/\.init\(\s*(?:null|undefined)\b/.test(source)) return false;
  if (/\.init\s*\(/.test(source)) return true;
  return false;
}

function svgHasMarks(text) {
  return /<svg[\s>]/i.test(text) && /<(?:path|rect|circle|polygon|polyline)\b/i.test(text);
}

export function renderedWithLibrary(library, rendered, facts = {}) {
  const text = String(rendered ?? "");
  if (library === "recharts") {
    return (facts.rechartsMarks ?? 0) > 0 && (/<svg[\s>]/i.test(text) || (facts.rechartsSurface ?? 0) > 0);
  }
  if (library === "echarts") {
    if (svgHasMarks(text)) return true;
    return (facts.echartsNodes ?? 0) > 0 && facts.canvasDrawn === true;
  }
  if (library === "chartjs") return facts.canvasDrawn === true;
  return false;
}

function textNumbers(rendered) {
  const text = String(rendered ?? "").replace(/<[^>]*>/g, " ");
  const out = [];
  for (const match of text.matchAll(/[-+]?(?:\d+\.\d+|\d+)(?:[eE][-+]?\d+)?/g)) {
    const value = Number(match[0]);
    if (Number.isFinite(value)) out.push(value);
  }
  return out;
}

function evidenceNumbers(rendered, facts) {
  const plotted = Array.isArray(facts?.plotted) ? facts.plotted.filter((value) => typeof value === "number" && Number.isFinite(value)) : [];
  if (plotted.length > 0) return plotted;
  const drawn = svgHasMarks(rendered) || facts?.canvasDrawn === true || (facts?.rechartsMarks ?? 0) > 0;
  if (!drawn) return [];
  return textNumbers(rendered);
}

function containsValue(evidence, value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return false;
  const tolerance = 1e-6 * Math.max(1, Math.abs(value));
  return evidence.some((item) => typeof item === "number" && Number.isFinite(item) && Math.abs(item - value) <= tolerance);
}

function specNumbers(spec) {
  const out = [];
  collectNumbers(spec?.data, out);
  collectNumbers(spec?.metric, out);
  return out;
}

function collectNumbers(value, out) {
  if (typeof value === "number" && Number.isFinite(value)) out.push(value);
  else if (Array.isArray(value)) {
    for (const item of value) collectNumbers(item, out);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectNumbers(item, out);
  }
}

function channelField(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(channelField);
  if (value && typeof value === "object" && typeof value.field === "string") return value.field;
  return undefined;
}

function fieldsMatch(encoding, expect) {
  const matches = (expected) => {
    for (const key of ["x", "y", "color", "open", "high", "low", "close"]) {
      if (expected[key] === undefined) continue;
      if (!sameField(channelField(encoding[key]), expected[key])) return false;
    }
    return true;
  };
  if (matches(expect)) return true;
  if (expect.swapAxes && expect.x !== undefined && expect.y !== undefined) {
    return matches({ ...expect, x: expect.y, y: expect.x });
  }
  return false;
}

function sameField(actual, expected) {
  if (Array.isArray(expected)) {
    const fields = Array.isArray(actual) ? actual : [actual];
    return expected.every((field) => fields.includes(field));
  }
  return actual === expected;
}

function formatDiagnostic(error) {
  const where = error.path ? ` at ${error.path}` : "";
  const hint = error.hint ? ` Hint: ${error.hint}` : "";
  const fix = Array.isArray(error.fix) && error.fix.length ? ` Fix: ${JSON.stringify(error.fix)}` : "";
  return `${error.code}${where}: ${error.message}${hint}${fix}`;
}

function viewBoxOf(svg) {
  const match = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!match) return null;
  return { x: 0, y: 0, width: Number(match[1]), height: Number(match[2]) };
}

function clipBoxOf(svg) {
  const match = svg.match(/<clipPath\b[^>]*>\s*<rect\b([^>]*?)\/?>/);
  if (!match) return null;
  const box = rectFromAttrs(match[1]);
  return Number.isFinite(box.width) ? box : null;
}

function clipGroup(svg) {
  const match = svg.match(/<g clip-path="url\(#[^)]+\)">([\s\S]*?)<\/g>/);
  return match?.[1] ?? "";
}

function rectFromAttrs(raw) {
  const num = (name) => {
    const found = new RegExp(`\\b${name}="(-?[\\d.]+)"`).exec(raw);
    return found ? Number(found[1]) : NaN;
  };
  return { x: num("x"), y: num("y"), width: num("width"), height: num("height"), raw };
}

function rectsFrom(fragment) {
  const out = [];
  for (const match of fragment.matchAll(/<rect\b([^>]*?)\/?>/g)) {
    const raw = match[1];
    if (/width="100%"/.test(raw) || /height="100%"/.test(raw)) continue;
    const box = rectFromAttrs(raw);
    if (box.width === 10 && box.height === 10) continue;
    if (!Number.isFinite(box.width) || !Number.isFinite(box.height)) continue;
    out.push(box);
  }
  return out;
}

function insideBox(mark, box) {
  const eps = 0.6;
  return mark.x >= box.x - eps
    && mark.y >= box.y - eps
    && mark.x + mark.width <= box.x + box.width + eps
    && mark.y + mark.height <= box.y + box.height + eps;
}

function rowCount(spec, task) {
  if (Array.isArray(spec?.data)) return spec.data.length;
  if (Array.isArray(task?.data)) return task.data.length;
  return 0;
}

/** One rect per row per bar series. A combo line on the other axis is not a bar. */
function barSeriesCount(spec, type) {
  const y = spec?.encoding?.y;
  const items = Array.isArray(y) ? y : y == null ? [] : [y];
  if (type === "bar") return Math.max(1, items.length);
  const marked = items.filter((item) => item && typeof item === "object" && item.mark === "bar").length;
  return marked > 0 ? marked : 1;
}

/**
 * A single-y bar with a series field (encoding.series, or encoding.color naming a
 * data column) is long-format: one rect per distinct x per distinct series value,
 * including a missing pair. A field equal to x colours the bars and is not a split.
 */
export function seriesBarCount(spec, type) {
  if (type !== "bar") return null;
  const encoding = spec?.encoding ?? {};
  const y = encoding.y;
  const items = Array.isArray(y) ? y : y == null ? [] : [y];
  if (items.length !== 1) return null;
  const data = Array.isArray(spec?.data) ? spec.data : null;
  if (!data || data.length === 0) return null;
  const has = (field) => typeof field === "string" && data.some((row) => row && typeof row === "object" && field in row);
  const xField = channelField(encoding.x);
  let seriesField = channelField(encoding.series);
  if (!has(seriesField) || seriesField === xField) seriesField = channelField(encoding.color);
  if (!has(seriesField) || seriesField === xField) return null;
  const key = (row, field) => (row?.[field] == null ? "" : String(row[field]));
  const xs = new Set(data.map((row, i) => (typeof xField === "string" ? key(row, xField) : String(i))));
  const groups = new Set(data.map((row) => key(row, seriesField)));
  return xs.size * groups.size;
}

/**
 * Drawn-shape check for a ChartKit SVG. Bars must sit inside the plot clip.
 * Mark counts follow the chart type, so a combo that clips its bars fails.
 */
export function chartGeometry(svg, task, spec) {
  if (typeof svg !== "string" || !svg.includes("<svg")) return { ok: false, issues: ["no svg"] };
  const type = task?.expect?.type;
  const rows = rowCount(spec, task);
  const issues = [];
  const view = viewBoxOf(svg);
  const clip = clipBoxOf(svg);
  const plot = clipGroup(svg);
  const note = (issue) => {
    if (!issues.includes(issue)) issues.push(issue);
  };

  if (type === "bar" || type === "combo") {
    const bars = rectsFrom(plot);
    if (!clip) note("missing plot clip");
    const expected = seriesBarCount(spec, type) ?? rows * barSeriesCount(spec, type);
    if (bars.length !== expected) note(`expected ${expected} bars, found ${bars.length}`);
    if (clip && bars.some((bar) => !insideBox(bar, clip))) note("a bar is outside the plot");
    if (type === "combo" && !/<path\b[^>]*\bfill="none"/.test(plot)) note("expected a line");
  } else if (type === "line" || type === "sparkline") {
    if (!/<path\b/.test(plot || svg)) note("expected a line");
  } else if (type === "mini-area") {
    if (!/<path\b/.test(plot || svg)) note("expected an area");
  } else if (type === "stacked-area") {
    const series = Array.isArray(task?.expect?.y) ? task.expect.y.length : 1;
    const areas = plot.match(/<path\b[^>]*\bfill="(?!none)/g) ?? [];
    if (areas.length < series) note(`expected ${series} areas, found ${areas.length}`);
  } else if (type === "donut") {
    const slices = svg.match(/<path\b/g) ?? [];
    if (slices.length < rows) note(`expected ${rows} slices, found ${slices.length}`);
  } else if (type === "scatter") {
    const points = svg.match(/<circle\b/g) ?? [];
    if (points.length < rows) note(`expected ${rows} points, found ${points.length}`);
  } else if (type === "heatmap") {
    const cells = rectsFrom(svg).filter((rect) => /aria-label=/.test(rect.raw));
    if (cells.length < rows) note(`expected at least ${rows} cells, found ${cells.length}`);
    if (view && cells.some((cell) => !insideBox(cell, view))) note("a cell is outside the chart");
  } else if (type === "candlestick") {
    const candles = rectsFrom(svg).filter((rect) => /data-ck-mark="candle"/.test(rect.raw));
    if (candles.length !== rows) note(`expected ${rows} candles, found ${candles.length}`);
    if (view && candles.some((candle) => !insideBox(candle, view))) note("a candle is outside the chart");
  } else if (type === "spike") {
    const spikes = svg.match(/<line\b[^>]*aria-label=/g) ?? [];
    if (spikes.length !== rows) note(`expected ${rows} spikes, found ${spikes.length}`);
  } else if (type === "gauge" || type === "progress-ring") {
    if (!/<path\b/.test(svg)) note("expected an arc");
  } else if (type === "kpi") {
    if (!/<text\b/.test(svg)) note("expected a value");
  } else {
    note("no drawn-shape check");
  }

  return { ok: issues.length === 0, issues };
}

export function checkChartKit(spec, task) {
  const stages = {};
  const validation = validate(spec);
  stages.validate = {
    ok: validation.ok,
    errors: validation.errors.slice(0, 8).map(formatDiagnostic),
  };
  if (!validation.ok) return { ok: false, stages };

  const svg = render(spec);
  const drew = typeof svg === "string" && svg.includes("data-ck-type=") && !svg.includes("ck-chart-error");
  stages.render = { ok: drew };
  stages.marks = drew ? chartGeometry(svg, task, spec) : { ok: false, issues: ["no chart"] };
  stages.type = {
    ok: spec?.type === task.expect.type && typeof svg === "string" && svg.includes(`data-ck-type="${task.expect.type}"`),
    actual: spec?.type ?? null,
  };

  const encoding = spec?.encoding ?? {};
  stages.fields = { ok: fieldsMatch(encoding, task.expect) };

  const values = task.expect.values ?? (task.expect.metric !== undefined ? [task.expect.metric] : []);
  const evidence = specNumbers(spec);
  const valuesOk = values.every((value) => containsValue(evidence, value));
  const metricOk = task.expect.metric === undefined || containsValue([spec?.metric?.value], task.expect.metric);
  const deltaOk = task.expect.delta === undefined || containsValue([spec?.metric?.delta], task.expect.delta);
  stages.values = { ok: valuesOk && metricOk && deltaOk };

  const ok = Object.values(stages).every((stage) => stage.ok);
  return { ok, stages };
}

export function scoreModule(mod, task, library, context = {}) {
  const accepted = ACCEPTED[library]?.[task.type];
  if (mod?.meta?.unsupported === true) {
    return {
      ok: accepted == null,
      status: accepted == null ? "unsupported" : "fail",
      stages: { capability: { ok: accepted == null, reason: mod.meta.reason ?? "model marked unsupported" } },
    };
  }
  if (accepted == null) {
    return {
      ok: false,
      status: "fail",
      stages: { capability: { ok: false, reason: `${library} has no ${task.type} chart; expected meta.unsupported` } },
    };
  }
  if (context.source != null) {
    const use = libraryUse(context.source, library);
    if (!use.imports || !use.uses) {
      return {
        ok: false,
        status: "fail",
        stages: {
          library: {
            ok: false,
            imports: use.imports,
            uses: use.uses,
            reason: `Import ${LIBRARY_LABEL[library] ?? library} and call it. A hand-written SVG does not pass.`,
          },
        },
      };
    }
  }
  let rendered = context.rendered;
  if (context.renderError) {
    const error = context.renderError;
    return {
      ok: false,
      status: "fail",
      stages: { render: { ok: false, error: error instanceof Error ? error.message : String(error) } },
    };
  }
  if (rendered == null) {
    try {
      rendered = String(mod.render());
    } catch (error) {
      return {
        ok: false,
        status: "fail",
        stages: { render: { ok: false, error: error instanceof Error ? error.message : String(error) } },
      };
    }
  }
  const observed = observedChartTypes(context.facts);
  const typeOk = observed.some((item) => accepted.includes(item));
  const evidence = evidenceNumbers(rendered, context.facts);
  const values = task.expect.values ?? (task.expect.metric !== undefined ? [task.expect.metric] : []);
  const valuesOk = values.every((value) => containsValue(evidence, value));
  const stages = {
    render: { ok: rendered.length > 0 && !/error\[CK/.test(rendered) },
    type: { ok: typeOk, actual: observed.length ? observed.join(",") : null, accepted },
    values: { ok: valuesOk },
  };
  if (context.source != null) {
    const marked = renderedWithLibrary(library, rendered, context.facts);
    stages.library = marked
      ? { ok: true, imports: true, uses: true }
      : {
        ok: false,
        imports: true,
        uses: true,
        reason: library === "recharts"
          ? "No Recharts SVG with data marks was found. Recharts 3 renderToStaticMarkup returns an empty recharts-wrapper; mount with createRoot and flushSync and return the container's HTML."
          : library === "chartjs"
            ? "The canvas has no painted pixels. A canvas tag or a data URL of a blank canvas does not pass."
            : `render() did not return markup produced by ${LIBRARY_LABEL[library] ?? library}.`,
      };
  }
  return { ok: Object.values(stages).every((stage) => stage.ok), status: "checked", stages };
}

export async function importModule(source) {
  const dir = join(benchRoot(), ".out", "agent-answers", randomBytes(8).toString("hex"));
  mkdirSync(dir, { recursive: true });
  const entry = join(dir, "answer.jsx");
  const outfile = join(dir, "bundle.mjs");
  writeFileSync(entry, source);
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    define: { "process.env.NODE_ENV": '"production"' },
    jsx: "automatic",
    packages: "external",
    plugins: [libraryCapturePlugin()],
    logLevel: "silent",
  });
  return import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
}

export function isDomError(error) {
  return /document is not defined|window is not defined|HTMLElement/.test(String(error?.message ?? error));
}

export async function renderInBrowser(browser, source) {
  const dir = join(benchRoot(), ".out", "agent-answers", randomBytes(8).toString("hex"));
  mkdirSync(dir, { recursive: true });
  const entry = join(dir, "answer.jsx");
  const outfile = join(dir, "browser.js");
  writeFileSync(entry, source);
  try {
    await build({
      entryPoints: [entry],
      bundle: true,
      format: "esm",
      platform: "browser",
      outfile,
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      plugins: [libraryCapturePlugin()],
      logLevel: "silent",
    });
    const code = readFileSync(outfile, "utf8");
    const page = await browser.newPage();
    try {
      await page.setContent("<!doctype html><html><body></body></html>");
      const result = await page.evaluate(async ({ bundled, readOption }) => {
        const numbersFromOption = new Function(`return (${readOption})`)();
        // Answers often draw into an element they never attach (createRoot on a detached div,
        // a detached canvas). Remember created elements so detached charts are inspected too.
        const created = [];
        const createElement = document.createElement.bind(document);
        document.createElement = (...args) => {
          const el = createElement(...args);
          created.push(el);
          return el;
        };
        const qsa = (selector) => {
          const found = new Set(document.querySelectorAll(selector));
          for (const el of created) {
            if (el.isConnected) continue;
            if (el.matches?.(selector)) found.add(el);
            for (const child of el.querySelectorAll?.(selector) ?? []) found.add(child);
          }
          return [...found];
        };
        const url = URL.createObjectURL(new Blob([bundled], { type: "text/javascript" }));
        const mod = await import(url);
        let rendered = "";
        let error = null;
        try {
          rendered = String(await mod.render());
        } catch (err) {
          error = err && err.message ? err.message : String(err);
        }
        for (const canvas of qsa("canvas")) {
          const chart = canvas.__ckChart;
          if (chart && typeof chart.stop === "function") {
            try { chart.stop(); chart.update("none"); } catch { /* a canvas that is not a chart stays blank */ }
          }
        }
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        // Recharts animates by default (Pie: 400 ms delay + 1500 ms). Let the entry animation finish
        // so a default animated pie is judged on its final sectors, as a user would see it.
        if (qsa("svg.recharts-surface").length > 0) await new Promise((resolve) => setTimeout(resolve, 2500));
        const plotted = [];
        const chartTypes = [];
        const seenTypes = new Set();
        const noteType = (name) => {
          if (typeof name !== "string" || !name || seenTypes.has(name)) return;
          seenTypes.add(name);
          chartTypes.push(name);
        };
        const noteOption = (option) => {
          const series = option?.series;
          const list = Array.isArray(series) ? series : series ? [series] : [];
          for (const item of list) if (typeof item?.type === "string") noteType(item.type);
        };
        const add = (option) => {
          for (const value of numbersFromOption(option)) plotted.push(value);
          noteOption(option);
        };
        for (const canvas of qsa("canvas")) {
          const chart = canvas.__ckChart;
          if (typeof chart?.config?.type === "string") noteType(chart.config.type);
          if (chart?.data?.datasets) add({ series: chart.data.datasets.map((dataset) => ({ data: dataset.data })) });
          if (typeof chart?.getOption === "function") {
            const option = chart.getOption();
            add(option);
          }
        }
        for (const node of qsa("[_echarts_instance_]")) {
          if (typeof node.__ckChart?.getOption === "function") add(node.__ckChart.getOption());
        }
        const seen = new Set();
        for (const node of qsa("*")) {
          const key = Object.keys(node).find((name) => name.startsWith("__reactFiber$") || name.startsWith("__reactContainer$"));
          if (!key) continue;
          const root = node[key];
          const stack = [root.current || root];
          while (stack.length) {
            const fiber = stack.pop();
            if (!fiber || seen.has(fiber)) continue;
            seen.add(fiber);
            const props = fiber.memoizedProps;
            const chartName = props?.chartName;
            if (chartName === "LineChart" || chartName === "BarChart" || chartName === "AreaChart" || chartName === "PieChart" || chartName === "ScatterChart" || chartName === "ComposedChart" || chartName === "RadarChart" || chartName === "RadialBarChart") noteType(chartName);
            const data = props?.data;
            if (data != null) add({ series: [{ data }] });
            if (fiber.child) stack.push(fiber.child);
            if (fiber.sibling) stack.push(fiber.sibling);
          }
        }
        for (const option of globalThis.__ckPlotted ?? []) add(option);
        function canvasHasInk(canvas) {
          if (!canvas || canvas.width < 2 || canvas.height < 2) return false;
          const ctx = canvas.getContext("2d");
          if (!ctx) return false;
          // Scan every pixel: a 32x32 sample grid misses thin line charts on large canvases.
          let ink = 0;
          for (let y = 0; y < canvas.height; y += 1) {
            let row;
            try { row = ctx.getImageData(0, y, canvas.width, 1).data; } catch { return false; }
            for (let x = 0; x < canvas.width; x += 1) {
              const i = x * 4;
              if (row[i + 3] < 12) continue;
              if (row[i] > 245 && row[i + 1] > 245 && row[i + 2] > 245) continue;
              ink += 1;
              if (ink >= 6) return true;
            }
          }
          return false;
        }
        let canvasDrawn = qsa("canvas").some(canvasHasInk);
        if (!canvasDrawn) {
          const dataUrl = rendered.match(/data:image\/png;base64,[A-Za-z0-9+/=]+/);
          if (dataUrl) {
            const image = new Image();
            image.src = dataUrl[0];
            try {
              await image.decode();
              const copy = document.createElement("canvas");
              copy.width = image.width;
              copy.height = image.height;
              copy.getContext("2d").drawImage(image, 0, 0);
              canvasDrawn = canvasHasInk(copy);
            } catch { /* a data URL that does not decode is not a drawn chart */ }
          }
        }
        const surface = qsa("svg.recharts-surface");
        const markSel = ".recharts-line-curve, .recharts-area-area, .recharts-area-curve, .recharts-bar-rectangle, .recharts-rectangle, .recharts-pie-sector, .recharts-sector, .recharts-radial-bar-sector, .recharts-scatter-symbol, .recharts-curve, .recharts-polygon";
        let rechartsMarks = 0;
        for (const svg of surface) rechartsMarks += svg.querySelectorAll(markSel).length;
        return {
          rendered,
          meta: mod.meta ?? null,
          error,
          facts: {
            canvases: qsa("canvas").length,
            canvasDrawn,
            echartsNodes: qsa("[_echarts_instance_]").length,
            rechartsSurface: surface.length,
            rechartsMarks,
            plotted,
            chartTypes,
          },
        };
      }, { bundled: code, readOption: numbersFromOption.toString() });
      return {
        mod: { meta: result.meta, render() { return result.rendered; } },
        rendered: result.rendered,
        facts: result.facts,
        renderError: result.error ? new Error(result.error) : null,
      };
    } finally {
      await page.close();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export async function executeAnswer(source, library, getBrowser) {
  const inBrowser = () => getBrowser().then((browser) => renderInBrowser(browser, source));
  if (needsBrowser(library, source)) return inBrowser();
  try {
    const mod = await importModule(source);
    try {
      globalThis.__ckPlotted = [];
      const rendered = String(await mod.render());
      const plotted = [];
      const chartTypes = [];
      for (const option of globalThis.__ckPlotted ?? []) {
        plotted.push(...numbersFromOption(option));
        for (const type of typesFromOption(option)) {
          if (!chartTypes.includes(type)) chartTypes.push(type);
        }
      }
      return { mod, rendered, facts: { plotted, chartTypes } };
    } catch (error) {
      if (library === "echarts" && isDomError(error)) return inBrowser();
      return { mod, rendered: "", renderError: error, facts: {} };
    }
  } catch (error) {
    if (library === "echarts" && isDomError(error)) return inBrowser();
    throw error;
  }
}

export function chartkitPrompt(task) {
  return [
    "Write a ChartKit v1 JSON spec for this request. Output one JSON object and nothing else.",
    noDocsHint("chartkit"),
    "Do not use a function formatter.",
    `Request: ${task.prompt}`,
    `Data: ${JSON.stringify(task.data)}`,
  ].join("\n");
}

export function codePrompt(task, library) {
  const accepted = ACCEPTED[library][task.type];
  const label = LIBRARY_LABEL[library] ?? library;
  const lines = [
    `Write a JavaScript module for this chart using ${label}.`,
    "Output only the module.",
    `Import ${label} and render with it. A hand-written SVG that does not call the library fails.`,
    "export function render() { return the SVG or HTML string the library produced }",
    "export const meta = { type, values }",
    noDocsHint(library),
  ];
  lines.push(
    accepted
      ? `meta.type must be one of: ${accepted.join(", ")}.`
      : `${label} cannot draw a ${task.type} chart. export const meta = { unsupported: true, reason } and export function render(){ return "" }. Do not invent a substitute chart.`,
    `Request: ${task.prompt}`,
    `Data: ${JSON.stringify(task.data)}`,
  );
  return lines.join("\n");
}

/** `none` is the minimal how-to hint. `official` prepends that library's own doc, cut to ChartKit llms.txt. */
export function promptFor(task, library, docs = "none") {
  const base = library === "chartkit" ? chartkitPrompt(task) : codePrompt(task, library);
  if (docs !== "official") return base;
  const doc = officialReference(library);
  if (!doc) return base;
  const where = [doc.url, ...doc.also].filter(Boolean).join(" ");
  return `Official reference (${doc.title}, ${doc.bytes} bytes, ${where}):\n${doc.text}\n${base}`;
}
