import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
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

export function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("no JSON object in the model output");
  return JSON.parse(raw.slice(start, end + 1));
}

export function extractModule(text) {
  const fenced = text.match(/```(?:jsx|tsx|javascript|js)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
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

export function checkChartKit(spec, task) {
  const stages = {};
  const validation = validate(spec);
  stages.validate = {
    ok: validation.ok,
    errors: validation.errors.slice(0, 4).map((error) => `${error.code} ${error.message}`),
  };
  if (!validation.ok) return { ok: false, stages };

  const svg = render(spec);
  const rendered = typeof svg === "string" && svg.includes(`data-ck-type="${task.expect.type}"`) && !svg.includes("ck-chart-error");
  stages.render = { ok: rendered };
  stages.type = { ok: spec?.type === task.expect.type, actual: spec?.type ?? null };

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

export function scoreModule(mod, task, library) {
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
  let rendered = "";
  try {
    rendered = String(mod.render());
  } catch (error) {
    return {
      ok: false,
      status: "fail",
      stages: { render: { ok: false, error: error instanceof Error ? error.message : String(error) } },
    };
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
  return { ok: Object.values(stages).every((stage) => stage.ok), status: "checked", stages };
}

export async function importModule(source) {
  const dir = join(tmpdir(), `chartkit-agent-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  const entry = join(dir, "answer.mjs");
  const outfile = join(dir, "bundle.mjs");
  writeFileSync(entry, source);
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
  });
  return import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
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
  return [
    `Write a JavaScript module for this chart using ${library}.`,
    "Output only the module.",
    "export function render() { return an SVG or HTML string }",
    "export const meta = { type, values }",
    accepted
      ? `meta.type must be one of: ${accepted.join(", ")}.`
      : `${library} cannot draw a ${task.type} chart. export const meta = { unsupported: true, reason } and export function render(){ return "" }.`,
    `Request: ${task.prompt}`,
    `Data: ${JSON.stringify(task.data)}`,
  ].join("\n");
}
