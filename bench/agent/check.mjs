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

const render = createRenderer([
  line, bar, donut, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick,
]);

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

/** Chart.js always needs a document. ECharts needs one unless it uses the Node SSR init. */
export function needsBrowser(library, source) {
  if (library === "chartjs") return true;
  if (library !== "echarts") return false;
  if (/\bdocument\b|\bwindow\b|\bHTMLElement\b/.test(source)) return true;
  if (/\.init\(\s*(?:null|undefined)\b/.test(source)) return false;
  if (/\.init\s*\(/.test(source)) return true;
  return false;
}

export function renderedWithLibrary(library, rendered, facts = {}) {
  const text = String(rendered ?? "");
  if (library === "recharts") return /recharts-/.test(text);
  if (library === "echarts") return /xmlns:xlink|_echarts_instance_/.test(text) || (facts.echartsNodes ?? 0) > 0;
  if (library === "chartjs") {
    return (facts.canvases ?? 0) > 0 || /data:image\/png|<canvas[\s>]/.test(text);
  }
  return false;
}

function channelField(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(channelField);
  if (value && typeof value === "object" && typeof value.field === "string") return value.field;
  return undefined;
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
  let fieldsOk = true;
  for (const key of ["x", "y", "color", "open", "high", "low", "close"]) {
    if (task.expect[key] === undefined) continue;
    if (!sameField(channelField(encoding[key]), task.expect[key])) fieldsOk = false;
  }
  stages.fields = { ok: fieldsOk };

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
            reason: `Import ${library} and call it. A hand-written SVG does not pass.`,
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
  const blob = `${rendered}\n${JSON.stringify(mod.meta ?? {})}`;
  const values = task.expect.values ?? (task.expect.metric !== undefined ? [task.expect.metric] : []);
  const valuesOk = values.every((value) => blob.includes(String(value)));
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
        reason: `render() did not return markup produced by ${library}.`,
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
      logLevel: "silent",
    });
    const code = readFileSync(outfile, "utf8");
    const page = await browser.newPage();
    try {
      await page.setContent("<!doctype html><html><body></body></html>");
      const result = await page.evaluate(async (bundled) => {
        const url = URL.createObjectURL(new Blob([bundled], { type: "text/javascript" }));
        const mod = await import(url);
        let rendered = "";
        let error = null;
        try {
          rendered = String(await mod.render());
        } catch (err) {
          error = err && err.message ? err.message : String(err);
        }
        return {
          rendered,
          meta: mod.meta ?? null,
          error,
          facts: {
            canvases: document.querySelectorAll("canvas").length,
            echartsNodes: document.querySelectorAll("[_echarts_instance_]").length,
          },
        };
      }, code);
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
      const rendered = String(await mod.render());
      return { mod, rendered, facts: {} };
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
    'Rules: "version" is "1". "a11y.alt" is one sentence. Use encoding field names. Do not use a function formatter.',
    `Request: ${task.prompt}`,
    `Data: ${JSON.stringify(task.data)}`,
  ].join("\n");
}

export function codePrompt(task, library) {
  const accepted = ACCEPTED[library][task.type];
  const lines = [
    `Write a JavaScript module for this chart using ${library}.`,
    "Output only the module.",
    `Import ${library} and render with it. A hand-written SVG that does not call the library fails.`,
    "export function render() { return the SVG or HTML string the library produced }",
    "export const meta = { type, values }",
  ];
  if (library === "chartjs") {
    lines.push("render() runs in a browser document. document and canvas exist. Create a canvas, construct the chart, and return the canvas markup or a data URL.");
  }
  if (library === "echarts") {
    lines.push('In Node, use echarts.init(null, null, { renderer: "svg", ssr: true, width, height }) and return chart.renderToSVGString(). Code that touches document runs in a browser instead.');
  }
  if (library === "recharts") {
    lines.push("Use renderToStaticMarkup from react-dom/server and return that string. JSX is allowed.");
  }
  lines.push(
    accepted
      ? `meta.type must be one of: ${accepted.join(", ")}.`
      : `${library} cannot draw a ${task.type} chart. export const meta = { unsupported: true, reason } and export function render(){ return "" }. Do not invent a substitute chart.`,
    `Request: ${task.prompt}`,
    `Data: ${JSON.stringify(task.data)}`,
  );
  return lines.join("\n");
}
