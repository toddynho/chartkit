import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
// Node answers stay on disk under bench/.out (gitignored). Deleting the bundle before render()
// can drop the ESM module graph. Browser bundles are removed after the page has the source in memory.
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { build } from "esbuild";
import { createRenderer } from "../../packages/core/src/render.ts";
import { validate } from "../../packages/core/src/validate.ts";
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
import { libraryCapturePlugin, numbersFromOption } from "./capture.mjs";
import { noDocsHint, officialReference } from "./docs.mjs";

const render = createRenderer([
  line, bar, donut, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick,
]);

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
  return evidence.some((item) => Math.abs(item - value) <= tolerance);
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
  stages.type = {
    ok: spec?.type === task.expect.type && typeof svg === "string" && svg.includes(`data-ck-type="${task.expect.type}"`),
    actual: spec?.type ?? null,
  };

  const encoding = spec?.encoding ?? {};
  stages.fields = { ok: fieldsMatch(encoding, task.expect) };

  const blob = JSON.stringify(spec?.data ?? spec?.metric ?? spec);
  const values = task.expect.values ?? (task.expect.metric !== undefined ? [task.expect.metric] : []);
  const valuesOk = values.every((value) => blob.includes(String(value)));
  const metricOk = task.expect.metric === undefined || spec?.metric?.value === task.expect.metric;
  const deltaOk = task.expect.delta === undefined || spec?.metric?.delta === task.expect.delta;
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
  const type = mod.meta?.type;
  const typeOk = typeof type === "string" && accepted.includes(type);
  const evidence = evidenceNumbers(rendered, context.facts);
  const values = task.expect.values ?? (task.expect.metric !== undefined ? [task.expect.metric] : []);
  const valuesOk = values.every((value) => containsValue(evidence, value));
  const stages = {
    render: { ok: rendered.length > 0 && !/error\[CK/.test(rendered) },
    type: { ok: typeOk, actual: type ?? null, accepted },
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
          ? "Recharts 3 renderToStaticMarkup returns an empty recharts-wrapper. Mount with createRoot and flushSync so the SVG contains data marks."
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
        const url = URL.createObjectURL(new Blob([bundled], { type: "text/javascript" }));
        const mod = await import(url);
        let rendered = "";
        let error = null;
        try {
          rendered = String(await mod.render());
        } catch (err) {
          error = err && err.message ? err.message : String(err);
        }
        for (const canvas of document.querySelectorAll("canvas")) {
          const chart = canvas.__ckChart;
          if (chart && typeof chart.stop === "function") {
            try { chart.stop(); chart.update("none"); } catch { /* a canvas that is not a chart stays blank */ }
          }
        }
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const plotted = [];
        const add = (option) => {
          for (const value of numbersFromOption(option)) plotted.push(value);
        };
        for (const canvas of document.querySelectorAll("canvas")) {
          const chart = canvas.__ckChart;
          if (chart?.data?.datasets) add({ series: chart.data.datasets.map((dataset) => ({ data: dataset.data })) });
          if (typeof chart?.getOption === "function") add(chart.getOption());
        }
        for (const node of document.querySelectorAll("[_echarts_instance_]")) {
          if (typeof node.__ckChart?.getOption === "function") add(node.__ckChart.getOption());
        }
        const seen = new Set();
        for (const node of document.querySelectorAll("*")) {
          const key = Object.keys(node).find((name) => name.startsWith("__reactFiber$") || name.startsWith("__reactContainer$"));
          if (!key) continue;
          const root = node[key];
          const stack = [root.current || root];
          while (stack.length) {
            const fiber = stack.pop();
            if (!fiber || seen.has(fiber)) continue;
            seen.add(fiber);
            const data = fiber.memoizedProps?.data;
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
          const stepX = Math.max(1, Math.floor(canvas.width / 32));
          const stepY = Math.max(1, Math.floor(canvas.height / 32));
          let ink = 0;
          for (let y = 0; y < canvas.height; y += stepY) {
            let row;
            try { row = ctx.getImageData(0, y, canvas.width, 1).data; } catch { return false; }
            for (let x = 0; x < canvas.width; x += stepX) {
              const i = x * 4;
              if (row[i + 3] < 12) continue;
              if (row[i] > 245 && row[i + 1] > 245 && row[i + 2] > 245) continue;
              ink += 1;
              if (ink >= 6) return true;
            }
          }
          return false;
        }
        let canvasDrawn = [...document.querySelectorAll("canvas")].some(canvasHasInk);
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
        const surface = document.querySelectorAll("svg.recharts-surface");
        const markSel = ".recharts-line-curve, .recharts-area-area, .recharts-area-curve, .recharts-bar-rectangle, .recharts-rectangle, .recharts-pie-sector, .recharts-sector, .recharts-radial-bar-sector, .recharts-scatter-symbol, .recharts-curve, .recharts-polygon";
        let rechartsMarks = 0;
        for (const svg of surface) rechartsMarks += svg.querySelectorAll(markSel).length;
        return {
          rendered,
          meta: mod.meta ?? null,
          error,
          facts: {
            canvases: document.querySelectorAll("canvas").length,
            canvasDrawn,
            echartsNodes: document.querySelectorAll("[_echarts_instance_]").length,
            rechartsSurface: surface.length,
            rechartsMarks,
            plotted,
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
      for (const option of globalThis.__ckPlotted ?? []) plotted.push(...numbersFromOption(option));
      return { mod, rendered, facts: { plotted } };
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
