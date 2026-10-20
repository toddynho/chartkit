// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import type { ValidationResult } from "../diagnostics";
import { render } from "../extra";
import { attach } from "../interact";
import type { ChartRenderer } from "../render";
import { validate } from "../validate";

const schema = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../schema/chartkit.schema.json"), "utf8")) as SchemaNode;

const alt = "Revenue rose from January to March.";
const rows = [
  { month: "Jan", revenue: 1000, cost: 400, region: "NA", date: "2024-01-01", open: 10, high: 14, low: 9, close: 12, source: "a", target: "b", value: 1000 },
  { month: "Feb", revenue: 3000, cost: 1200, region: "EU", date: "2024-02-01", open: 12, high: 16, low: 11, close: 15, source: "b", target: "c", value: 3000 },
  { month: "Mar", revenue: 1800, cost: 900, region: "NA", date: "2024-03-01", open: 15, high: 18, low: 13, close: 14, source: "a", target: "c", value: 1800 },
];

interface SchemaNode {
  $ref?: string;
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
  oneOf?: SchemaNode[];
  anyOf?: SchemaNode[];
  allOf?: SchemaNode[];
  $defs?: Record<string, SchemaNode>;
}

interface Leaf {
  path: string;
  enums: unknown[];
  consts: unknown[];
  types: Set<string>;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  color: boolean;
  children: boolean;
}

interface Host {
  name: string;
  spec: Record<string, unknown>;
  svg: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deref(node: SchemaNode | undefined, guard = 0): SchemaNode | undefined {
  if (!node || guard > 10) return node;
  if (!node.$ref) return node;
  const name = node.$ref.replace("#/$defs/", "");
  const base = deref(schema.$defs?.[name], guard + 1) ?? {};
  const local: SchemaNode = { ...node };
  delete local.$ref;
  return { ...base, ...local };
}

function absorb(leaf: Leaf, node: SchemaNode | undefined): void {
  const resolved = deref(node);
  if (!resolved) return;
  if (resolved.const !== undefined) leaf.consts.push(resolved.const);
  if (Array.isArray(resolved.enum)) leaf.enums.push(...resolved.enum);
  const types = Array.isArray(resolved.type) ? resolved.type : resolved.type ? [resolved.type] : [];
  for (const type of types) leaf.types.add(type);
  if (resolved.pattern) leaf.pattern = resolved.pattern;
  if (typeof resolved.minimum === "number") leaf.minimum = resolved.minimum;
  if (typeof resolved.maximum === "number") leaf.maximum = resolved.maximum;
  if (resolved.$ref?.endsWith("/color") || node?.$ref?.endsWith("/color")) leaf.color = true;
  for (const key of ["oneOf", "anyOf", "allOf"] as const) {
    const list = resolved[key];
    if (Array.isArray(list)) for (const branch of list) absorb(leaf, branch);
  }
}

function collect(): Leaf[] {
  const leaves = new Map<string, Leaf>();
  const hits = new Map<string, number>();
  const visit = (node: SchemaNode | undefined, path: string) => {
    const resolved = deref(node);
    if (!resolved) return;
    const seen = (hits.get(path) ?? 0) + 1;
    if (seen > 6 || path.split("/").length > 16) return;
    hits.set(path, seen);
    if (resolved.properties) {
      for (const [key, child] of Object.entries(resolved.properties)) {
        const childPath = `${path}/${key}`;
        const leaf = leaves.get(childPath) ?? {
          path: childPath,
          enums: [],
          consts: [],
          types: new Set<string>(),
          color: key === "color" || (key === "series" && childPath.includes("/tokens/")),
          children: false,
        };
        absorb(leaf, child);
        const childNode = deref(child);
        leaf.children = Boolean(childNode?.properties) || (childNode?.oneOf ?? childNode?.anyOf ?? []).some((branch) => deref(branch)?.properties);
        leaves.set(childPath, leaf);
        visit(child, childPath);
      }
    }
    if (resolved.items && !Array.isArray(resolved.items)) visit(resolved.items, `${path}/0`);
    for (const key of ["oneOf", "anyOf", "allOf"] as const) {
      const list = resolved[key];
      if (Array.isArray(list)) for (const branch of list) visit(branch, path);
    }
  };
  visit(schema, "");
  return [...leaves.values()];
}

function probes(leaf: Leaf): unknown[] {
  if (leaf.path === "/data") {
    return [[{ month: "Jan", revenue: 5, cost: 1, region: "NA", date: "2024-01-01", open: 8, high: 12, low: 7, close: 11, source: "a", target: "b", value: 5 }]];
  }
  if (leaf.path === "/data/columns") return [{ month: ["Jan", "Feb", "Mar"], revenue: [5, 9, 4], cost: [1, 2, 3] }];
  if (leaf.path === "/annotations") return [[{ type: "rule", axis: "y", value: 2500, label: "Goal" }]];
  if (leaf.path === "/transform") return [[{ type: "filter", field: "region", eq: "EU" }]];
  if (leaf.path === "/timezone") return ["America/New_York"];
  const values = [...leaf.enums, ...leaf.consts];
  const out: unknown[] = [];
  const unique = new Set<string>();
  const push = (value: unknown) => {
    const key = JSON.stringify(value);
    if (unique.has(key)) return;
    unique.add(key);
    out.push(value);
  };
  for (const value of values) push(value);
  if (leaf.types.has("boolean")) {
    push(true);
    push(false);
  }
  if (leaf.types.has("integer")) push(leaf.maximum !== undefined && leaf.maximum < 3 ? leaf.maximum : 3);
  if (leaf.types.has("number")) {
    if (leaf.maximum !== undefined && leaf.maximum <= 1) push(leaf.maximum === 0 ? 0 : Math.min(leaf.maximum, 0.2));
    else push(typeof leaf.maximum === "number" ? Math.min(80, leaf.maximum) : 80);
  }
  const fieldPath =
    /\/encoding\/(x|y|color|size|series|open|high|low|close|volume|source|target|error)$/.test(leaf.path) ||
    leaf.path.endsWith("/field") ||
    /\/(lo|hi|error)$/.test(leaf.path);
  if (leaf.types.has("string") && values.length === 0) {
    if (leaf.pattern === "^[A-Z]{3}$") push("USD");
    else if (leaf.path.endsWith("/locale")) push("de-DE");
    else if (fieldPath) push("region");
    else if (leaf.color || leaf.path.endsWith("/value") || leaf.path.includes("/tokens/")) push("#c0ffee");
    else if (leaf.pattern) push("ProbeId");
    else push("ProbeLabel");
  }
  if (leaf.path.endsWith("/minHeight")) push(400);
  if (leaf.path === "/metric/target") push(40);
  if (leaf.types.has("array")) {
    if (leaf.path.endsWith("/ticks")) push([1234, 2500]);
    else if (leaf.path.endsWith("/bands")) push([{ from: 0, to: 40, label: "Low", color: "#c0ffee" }]);
    else if (leaf.path.endsWith("/fields")) push([{ field: "revenue", title: "ProbeLabel" }]);
    else if (leaf.path.endsWith("/ranges")) push(["cost"]);
    else if (leaf.path.includes("/color/")) push(["#c0ffee", "#111111"]);
    else if (leaf.path.endsWith("/range") || leaf.path.endsWith("/domain")) push([2, 18]);
    else if (leaf.color || leaf.path.includes("/tokens/")) push(["#c0ffee", "#111111"]);
    else push(["region"]);
  }
  if (leaf.path.endsWith("/domain")) push([500, 4000]);
  if (leaf.path === "/mark/explode") push(["Jan"]);
  if (leaf.path === "/mark/colorRules") push([{ color: "#c0ffee", gt: 0 }]);
  if (leaf.path === "/encoding/color/domain") push(["NA", "EU"]);
  if (leaf.path === "/legend/hide") push(["cost"]);
  if (leaf.path === "/legend/symbols") push([{ series: "revenue", symbol: "circle" }]);
  if (leaf.path === "/legend/maxRows") push(1);
  if (leaf.path === "/interaction/export") push(["png", "svg", "csv"]);
  if (leaf.path === "/encoding/color/scale/thresholds") push([1200, 2000]);
  if (leaf.path === "/encoding/color/scale/scheme") push("teal");
  if (leaf.path === "/mark/palette") push(["#c0ffee", "#111111"]);
  if (leaf.path.endsWith("/initialRange")) push([0, 1]);
  if (/^\/axes\/(x|y|y2)$/.test(leaf.path)) push({ title: "ProbeLabel" });
  return out;
}

function annotationSeed(path: string): Record<string, unknown> {
  if (path.endsWith("/bandwidth") || path.endsWith("/band")) return { type: "regression", method: "loess", band: true, bandwidth: 0.6, label: "Fit" };
  if (path.endsWith("/dx") || path.endsWith("/dy")) return { type: "marker", x: "Feb", y: 2000, label: "Note" };
  if (path.endsWith("/method") || path.endsWith("/series")) return { type: "trendline", method: "mean", label: "Mean" };
  if (path.endsWith("/from") || path.endsWith("/to") || path.endsWith("/opacity")) return { type: "band", axis: "y", from: 0, to: 2200, label: "Band" };
  if (path.endsWith("/x") || (path.endsWith("/y") && path.startsWith("/annotations"))) return { type: "text", x: "Feb", y: 2000, label: "Note" };
  return { type: "rule", axis: "y", value: 2500, label: "Goal" };
}

function apply(host: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const spec = structuredClone(host);
  if (path.startsWith("/annotations/")) spec.annotations = [annotationSeed(path)];
  if (path.startsWith("/transform/")) {
    spec.transform = [{ type: "filter", field: "region", eq: "EU" }];
  }
  if (/^\/axes\/(x|y|y2)\/bands\//.test(path)) {
    const key = path.split("/")[2] ?? "x";
    const axes = isRecord(spec.axes) ? spec.axes : {};
    const box = isRecord(axes[key]) ? axes[key] : {};
    const bands = Array.isArray(box.bands) ? box.bands : [{}];
    if (!isRecord(bands[0])) bands[0] = {};
    const row = bands[0] as Record<string, unknown>;
    if (typeof row.from !== "number" && typeof row.from !== "string") row.from = 0;
    if (typeof row.to !== "number" && typeof row.to !== "string") row.to = key === "x" ? 2 : 1000;
    box.bands = bands;
    axes[key] = box;
    spec.axes = axes;
  }
  if (path.startsWith("/metric/bands/")) {
    const metric = isRecord(spec.metric) ? spec.metric : { value: 64, label: "Capacity used", min: 0, max: 100 };
    spec.metric = { ...metric, bands: [{ from: 0, to: 100, label: "Low", color: "#c0ffee" }] };
  }
  if (path.startsWith("/metric/deltaFormat") || path === "/metric/goodDirection") {
    const metric = isRecord(spec.metric) ? spec.metric : { value: 64, label: "Capacity used", min: 0, max: 100 };
    spec.metric = { ...metric, delta: metric.delta ?? 5 };
  }
  if (path === "/encoding/size/range" || path === "/encoding/color/range") {
    const encoding = isRecord(spec.encoding) ? spec.encoding : {};
    if (path.endsWith("size/range")) encoding.size = { ...(isRecord(encoding.size) ? encoding.size : {}), field: "revenue" };
    else encoding.color = { field: "region" };
    spec.encoding = encoding;
  }
  if (path === "/size/aspectRatio") {
    const size = isRecord(spec.size) ? spec.size : {};
    spec.size = { ...size, width: 400, height: "auto" };
  }
  const parts = path.split("/").filter(Boolean);
  let cursor: Record<string, unknown> | unknown[] = spec;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i] ?? "";
    const next = parts[i + 1] ?? "";
    const record = cursor as Record<string, unknown>;
    let here = record[key];
    if (Array.isArray(here) && !/^\d+$/.test(next)) {
      if (key === "data") {
        here = { columns: { month: ["Jan", "Feb", "Mar"], revenue: [5, 9, 4] } };
        record[key] = here;
      } else {
        if (here.length === 0) here.push({});
        if (typeof here[0] === "string" || typeof here[0] === "number") here[0] = { field: String(here[0]) };
        if (!isRecord(here[0])) here[0] = {};
        cursor = here[0] as Record<string, unknown>;
        continue;
      }
    }
    if (typeof here === "string") here = next === "value" || next === "range" ? {} : { field: here };
    else if (!isRecord(here) && !Array.isArray(here)) here = /^\d+$/.test(next) ? [] : {};
    if ((key === "format" || key.endsWith("Format")) && isRecord(here)) {
      if (next === "currency") here.style = "currency";
      if (here.style === undefined) here.style = "number";
      if (here.style === "currency" && here.currency === undefined) here.currency = "EUR";
    }
    record[key] = here;
    cursor = here as Record<string, unknown> | unknown[];
  }
  const last = parts[parts.length - 1] ?? "";
  (cursor as Record<string, unknown>)[last] = value;
  if (/^\/axes\/(x|y|y2)\/bands\/0\/(from|to)$/.test(path)) {
    const key = path.split("/")[2] ?? "x";
    const axes = isRecord(spec.axes) ? spec.axes : {};
    const box = isRecord(axes[key]) ? axes[key] : {};
    const row = Array.isArray(box.bands) && isRecord(box.bands[0]) ? (box.bands[0] as Record<string, unknown>) : undefined;
    if (row && typeof row.from === "number" && typeof row.to === "number" && row.from > row.to) {
      const swap = row.from;
      row.from = row.to;
      row.to = swap;
    }
  }
  if (/^\/axes\/(x|y|y2)\/(titlePosition|titleRotate)$/.test(path)) {
    const key = path.split("/")[2] ?? "x";
    const axes = isRecord(spec.axes) ? spec.axes : {};
    const box = isRecord(axes[key]) ? axes[key] : {};
    if (typeof box.title !== "string") box.title = "ProbeLabel";
    axes[key] = box;
    spec.axes = axes;
  }
  if (path.startsWith("/mark/colorRules")) {
    const mark = isRecord(spec.mark) ? spec.mark : {};
    const rules = Array.isArray(mark.colorRules) ? mark.colorRules : [{}];
    if (!isRecord(rules[0])) rules[0] = {};
    if (typeof (rules[0] as Record<string, unknown>).color !== "string") (rules[0] as Record<string, unknown>).color = "#c0ffee";
    mark.colorRules = rules;
    spec.mark = mark;
  }
  if (path.startsWith("/mark/other/")) {
    const mark = isRecord(spec.mark) ? spec.mark : {};
    const other = isRecord(mark.other) ? mark.other : {};
    if (typeof other.threshold !== "number") other.threshold = 0.2;
    mark.other = other;
    spec.mark = mark;
  }
  if (path.startsWith("/encoding/color/scale/")) {
    const encoding = isRecord(spec.encoding) ? spec.encoding : {};
    const color = isRecord(encoding.color) ? encoding.color : { field: "revenue" };
    if (typeof color.field !== "string") color.field = "revenue";
    const scale = isRecord(color.scale) ? color.scale : {};
    const kinds = ["sequential", "diverging", "quantize", "threshold"];
    if (typeof scale.type !== "string" || !kinds.includes(String(scale.type))) {
      scale.type = path.endsWith("/midpoint") ? "diverging" : path.endsWith("/thresholds") ? "threshold" : path.endsWith("/bins") ? "quantize" : "sequential";
    }
    color.scale = scale;
    encoding.color = color;
    spec.encoding = encoding;
  }
  if (path.startsWith("/legend/symbols")) {
    const legend = isRecord(spec.legend) ? spec.legend : {};
    const symbols = Array.isArray(legend.symbols) ? legend.symbols : [{}];
    if (!isRecord(symbols[0])) symbols[0] = {};
    const row = symbols[0] as Record<string, unknown>;
    if (typeof row.series !== "string" || row.series === "ProbeLabel" || row.series === "region") row.series = "revenue";
    if (typeof row.symbol !== "string") row.symbol = "circle";
    legend.symbols = symbols;
    spec.legend = legend;
  }
  if (path === "/encoding/color/domain") {
    const encoding = isRecord(spec.encoding) ? spec.encoding : {};
    const color = isRecord(encoding.color) ? encoding.color : {};
    if (!Array.isArray(color.range)) color.range = ["#c0ffee", "#111111"];
    encoding.color = color;
    spec.encoding = encoding;
  }
  if (path.startsWith("/tooltip/fields/")) {
    const tooltip = isRecord(spec.tooltip) ? spec.tooltip : {};
    const fields = Array.isArray(tooltip.fields) ? tooltip.fields : [];
    if (isRecord(fields[0]) && typeof fields[0].field !== "string") fields[0].field = "revenue";
    tooltip.fields = fields;
    spec.tooltip = tooltip;
  }
  return spec;
}

function mentions(diagnosticPath: string | undefined, path: string): boolean {
  if (!diagnosticPath) return false;
  return diagnosticPath === path || diagnosticPath.startsWith(`${path}/`) || path.startsWith(`${diagnosticPath}/`);
}

function warned(result: ValidationResult, path: string): boolean {
  return result.warnings.some((warning) => mentions(warning.path, path));
}

function chart(spec: Record<string, unknown>): string | null {
  try {
    return render(spec);
  } catch {
    return null;
  }
}

function hosts(): Host[] {
  const specs: Array<[string, Record<string, unknown>]> = [
    ["line", { version: "1", type: "line", data: rows, encoding: { x: "month", y: ["revenue", "cost"] }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["number", { version: "1", type: "line", data: rows, encoding: { x: { field: "revenue", type: "quantitative" }, y: { field: "cost", type: "quantitative" } }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["bar", { version: "1", type: "bar", data: rows, encoding: { x: "month", y: ["revenue", "cost"] }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["donut", { version: "1", type: "donut", data: rows, encoding: { x: "month", y: "revenue" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["scatter", { version: "1", type: "scatter", data: rows, encoding: { x: "revenue", y: "cost", color: "region" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["combo", { version: "1", type: "combo", data: rows, encoding: { x: "month", y: [{ field: "revenue", mark: "bar" }, { field: "cost", axis: "y2", mark: "line" }] }, axes: { y2: true }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["heatmap", { version: "1", type: "heatmap", data: rows, encoding: { x: "month", y: "region", color: "revenue" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["split", { version: "1", type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["gauge", { version: "1", type: "gauge", metric: { value: 64, label: "Capacity used", min: 0, max: 100, target: 80 }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["kpi", { version: "1", type: "kpi", metric: { value: 64, label: "Capacity used", min: 0, max: 100 }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["candle", { version: "1", type: "candlestick", data: rows, encoding: { x: "date", open: "open", high: "high", low: "low", close: "close" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["sankey", { version: "1", type: "sankey", data: rows, encoding: { source: "source", target: "target", y: "value" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["histogram", { version: "1", type: "histogram", data: rows, encoding: { x: "revenue" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["area-range", { version: "1", type: "area-range", data: rows, encoding: { x: "month", y: { field: "revenue", lo: "cost", hi: "value" } }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["bar-range", { version: "1", type: "bar-range", data: rows, encoding: { x: "month", low: "cost", high: "revenue" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["errorbar", { version: "1", type: "errorbar", data: rows, encoding: { x: "month", y: "revenue", error: "cost" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    [
      "crowd",
      {
        version: "1",
        type: "line",
        data: Array.from({ length: 8 }, (_, index) => ({ month: `Warehouse ${index + 1} north`, revenue: 80 + index * 40, other: 20 + index * 15 })),
        encoding: { x: "month", y: [{ field: "revenue" }, { field: "other", axis: "y2" }] },
        axes: { y: { ticks: 14 }, y2: { ticks: 14 } },
        a11y: { alt },
        size: { width: 280, height: 150 },
      },
    ],
  ];
  const ready: Host[] = [];
  for (const [name, spec] of specs) {
    const result = validate(spec);
    const svg = chart(spec);
    if (!result.ok || !svg || svg.includes("ck-chart-error")) continue;
    ready.push({ name, spec, svg });
  }
  return ready;
}

interface EntrySet {
  draw: Map<string, (spec: unknown) => string | null>;
  base: Map<string, string | null>;
}

function covered(leaf: Leaf, ready: Host[], entries?: EntrySet): boolean {
  const values = probes(leaf);
  if (values.length === 0) return leaf.children && !leaf.types.has("boolean") && leaf.enums.length === 0 && leaf.consts.length <= 1;
  let drew = false;
  for (const value of values) {
    for (const host of ready) {
      const spec = apply(host.spec, leaf.path, value);
      const result = validate(spec);
      const warnedPath = warned(result, leaf.path);
      if (!result.ok) {
        if (warnedPath) drew = true;
        continue;
      }
      const svg = chart(spec);
      const fullChanged = Boolean(svg && svg !== host.svg);
      if (fullChanged && entries) {
        const type = String(host.spec.type);
        const draw = entries.draw.get(type);
        const small = draw?.(spec) ?? null;
        if (draw && small === entries.base.get(host.name)) return false;
      }
      if (fullChanged || warnedPath) drew = true;
    }
  }
  return drew;
}

const ENTRY_FILES: Array<[string, string]> = [
  ["line", "line"],
  ["bar", "bar"],
  ["donut", "donut"],
  ["pie", "pie"],
  ["stacked-area", "stackedArea"],
  ["scatter", "scatter"],
  ["combo", "combo"],
  ["heatmap", "heatmap"],
  ["gauge", "gauge"],
  ["kpi", "kpi"],
  ["sparkline", "sparkline"],
  ["mini-area", "miniArea"],
  ["progress-ring", "progressRing"],
  ["spike", "spike"],
  ["candlestick", "candlestick"],
  ["histogram", "histogram"],
  ["boxplot", "boxplot"],
  ["radar", "radar"],
  ["funnel", "funnel"],
  ["treemap", "treemap"],
  ["sankey", "sankey"],
  ["bullet", "bullet"],
  ["waterfall", "waterfall"],
  ["gantt", "gantt"],
  ["timeline", "timeline"],
  ["quadrant", "quadrant"],
  ["venn", "venn"],
  ["journey", "journey"],
  ["area-range", "areaRange"],
  ["bar-range", "barRange"],
  ["errorbar", "errorbar"],
];

const FRESH_ENTRY = new Set(["line", "bar", "stacked-area", "combo", "sparkline", "mini-area"]);

async function entrySet(ready: Host[]): Promise<EntrySet> {
  const draw = new Map<string, (spec: unknown) => string | null>();
  for (const [file, name] of ENTRY_FILES) {
    // These six share the cartesian hook. The test file imports extra, which mounts it,
    // so each one needs a fresh module graph. The other entries do not use that hook.
    if (FRESH_ENTRY.has(file)) vi.resetModules();
    const { createRenderer } = await import("../render");
    const mod = (await import(`../charts/${file}.ts`)) as Record<string, ChartRenderer>;
    const chart = mod[name];
    const renderEntry = createRenderer([chart]);
    draw.set(chart.types[0] ?? file, (spec) => {
      try {
        return renderEntry(spec);
      } catch {
        return null;
      }
    });
  }
  const base = new Map<string, string | null>();
  for (const host of ready) {
    const renderEntry = draw.get(String(host.spec.type));
    base.set(host.name, renderEntry ? renderEntry(host.spec) : null);
  }
  return { draw, base };
}

/** Pixel y of a data value, interpolated from the rendered tick baselines. */
function scaleY(svg: string, value: number): number {
  const ticks = [...svg.matchAll(/<text x="[^"]+" y="([^"]+)"[^>]*>([\d,]+)<\/text>/g)].map((mark) => ({
    y: Number(mark[1]) - 4,
    v: Number(mark[2].replace(/,/g, "")),
  }));
  const sorted = ticks.sort((a, b) => a.v - b.v);
  const lo = [...sorted].reverse().find((tick) => tick.v <= value) ?? sorted[0];
  const hi = sorted.find((tick) => tick.v >= value) ?? sorted[sorted.length - 1];
  if (!lo || !hi || hi.v === lo.v) return lo?.y ?? NaN;
  return lo.y + ((hi.y - lo.y) * (value - lo.v)) / (hi.v - lo.v);
}

describe("schema honesty", () => {
  const line = {
    version: "1",
    type: "line",
    data: rows,
    encoding: { x: "month", y: { field: "revenue", scale: {} } },
    a11y: { alt },
    size: { width: 420, height: 220 },
  };

  it("draws axis titles, tick counts, rotation, side, reverse, padding, min height, and description", () => {
    const titled = render({ ...line, axes: { x: { title: "Month", rotate: -40 }, y: { title: "Revenue", ticks: 3 } } });
    expect(titled).toContain("Month");
    expect(titled).toContain("Revenue");
    expect(titled).toContain("rotate(-40");
    const base = render(line);
    const fewer = render({ ...line, axes: { y: { ticks: 2 } } });
    expect(fewer).not.toBe(base);
    const explicit = render({ ...line, axes: { y: { ticks: [1234, 2500] } } });
    expect(explicit).toContain("1,234");
    const right = render({ ...line, axes: { y: { position: "right", title: "Revenue" } } });
    expect(right).toContain('transform="rotate(90');
    const reversed = render({ ...line, encoding: { x: "month", y: { field: "revenue", scale: { reverse: true } } } });
    expect(reversed).not.toBe(base);
    const plain = render({ ...line, encoding: { x: "month", y: { field: "revenue", scale: { nice: false } } } });
    expect(plain).not.toBe(base);
    const padded = render({ ...line, size: { width: 420, height: 220, padding: { left: 80 } } });
    expect(padded).not.toBe(base);
    const tall = render({ ...line, size: { width: 420, height: 220, minHeight: 400 } });
    expect(tall).toContain('viewBox="0 0 420 400"');
    const described = render({ ...line, a11y: { alt, description: "Monthly revenue for three regions." } });
    expect(described).toContain("aria-describedby=");
    expect(described).toContain("Monthly revenue for three regions.");
    const keys = render({ ...line, a11y: { alt, keyboard: true } });
    expect(keys).toContain('data-ck-intent="keys"');
  });

  it("covers the y-scale range of the data when x is on top, on the bottom, and padded", () => {
    const data = [
      { month: "January", revenue: 1200 },
      { month: "February", revenue: 1800 },
      { month: "March", revenue: 1400 },
      { month: "April", revenue: 2600 },
      { month: "May", revenue: 2200 },
      { month: "June", revenue: 3100 },
    ];
    const base = {
      version: "1",
      type: "line",
      data,
      encoding: { x: "month", y: "revenue" },
      size: { width: 460, height: 250 },
      a11y: { alt: "Revenue from January to June." },
    };
    const specs = [
      { ...base, axes: { x: { title: "Month" }, y: { title: "Revenue" } } },
      { ...base, axes: { x: { title: "Month", position: "top" }, y: { title: "Revenue", position: "right" } } },
      {
        ...base,
        size: { width: 460, height: 250, padding: { top: 36, right: 72, bottom: 48, left: 96 } },
        axes: { x: { title: "Month" }, y: { title: "Revenue" } },
      },
    ];
    const svgs = specs.map((spec) => render(spec));
    const page = svgs.join("");
    const ids = svgs.map((svg) => /clip-path="url\(#([^"]+)\)"/.exec(svg)?.[1] ?? "");
    expect(new Set(ids).size).toBe(svgs.length);
    for (const svg of svgs) {
      const id = /clip-path="url\(#([^"]+)\)"/.exec(svg)?.[1] ?? "";
      const own = new RegExp(`<clipPath id="${id}"><rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"`).exec(svg);
      const first = new RegExp(`<clipPath id="${id}"><rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"`).exec(page);
      expect(own && first).toBeTruthy();
      expect(first?.[2]).toBe(own?.[2]);
      expect(first?.[4]).toBe(own?.[4]);
      const boxTop = Number(own?.[2]);
      const boxBottom = boxTop + Number(own?.[4]);
      const low = scaleY(svg, 1200);
      const high = scaleY(svg, 3100);
      expect(boxTop).toBeLessThanOrEqual(Math.min(low, high) + 0.5);
      expect(boxBottom).toBeGreaterThanOrEqual(Math.max(low, high) - 0.5);
    }
    const top = svgs[1];
    const texts = [...top.matchAll(/<text x="([^"]+)" y="([^"]+)"([^>]*)>([^<]*)<\/text>/g)];
    const bounds = (mark: RegExpMatchArray) => {
      const x = Number(mark[1]);
      const y = Number(mark[2]);
      const anchor = /text-anchor="([^"]+)"/.exec(mark[3])?.[1] ?? "start";
      const width = mark[4].length * 6.4;
      const left = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
      return { left, right: left + width, top: y - 9, bottom: y + 3 };
    };
    const month = texts.find((mark) => mark[4] === "Month");
    const march = texts.find((mark) => mark[4] === "March");
    expect(month && march).toBeTruthy();
    const title = bounds(month!);
    const label = bounds(march!);
    expect(title.left < label.right && label.left < title.right && title.top < label.bottom && label.top < title.bottom).toBe(false);
  });

  it("warns for easing and font family, and accepts selection", () => {
    const easing = validate({ ...line, animation: { easing: "linear" } });
    expect(easing.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/animation/easing")).toBe(true);
    const select = validate({ ...line, interaction: { select: "point" } });
    expect(select.ok).toBe(true);
    expect(select.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/interaction/select")).toBe(false);
    const fields = validate({ ...line, tooltip: { fields: [{ field: "revenue", title: "Sales", format: "currency" }], position: "top", crosshairLabel: true } });
    expect(fields.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/tooltip/fields")).toBe(false);
    expect(fields.ok).toBe(true);
    const font = validate({ ...line, theme: { tokens: { fontFamily: "Georgia" } } });
    expect(font.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/theme/tokens/fontFamily")).toBe(true);
    const labels = validate({ ...line, mark: { labels: true } });
    expect(labels.ok).toBe(true);
    expect(labels.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/mark/labels")).toBe(false);
    const quantitative = validate({
      ...line,
      encoding: { x: "month", y: { field: "revenue", type: "quantitative" } },
    });
    expect(quantitative.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/encoding/y/type")).toBe(false);
    const nominal = validate({
      ...line,
      encoding: { x: "month", y: { field: "revenue", type: "nominal" } },
    });
    const typeWarning = nominal.warnings.find((warning) => warning.code === "CK3012" && warning.path === "/encoding/y/type");
    expect(typeWarning?.message).toBe("encoding.y.type is ignored; ChartKit infers the scale type");
  });

  it("changes the tooltip when fields, format, position, or the crosshair label change", () => {
    const spec = {
      version: "1",
      type: "line",
      data: rows,
      encoding: { x: "month", y: ["revenue", "cost"] },
      a11y: { alt },
      size: { width: 420, height: 240 },
    };
    const hover = (extra: Record<string, unknown>) => {
      const host = document.createElement("div");
      document.body.append(host);
      const next = { ...spec, ...extra };
      host.innerHTML = render(next);
      const ctl = attach(host, next, { render });
      const svg = host.querySelector("svg");
      const plot = svg?.querySelector("clipPath rect");
      const x = Number(plot?.getAttribute("x")) + Number(plot?.getAttribute("width")) * 0.5;
      const y = Number(plot?.getAttribute("y")) + Number(plot?.getAttribute("height")) * 0.45;
      svg?.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, bubbles: true }));
      const tip = host.querySelector("[data-ck-tip]") as HTMLElement | null;
      const shot = {
        text: tip?.textContent ?? "",
        left: Number.parseFloat(tip?.style.left ?? ""),
        top: Number.parseFloat(tip?.style.top ?? ""),
        label: svg?.querySelector("[data-ck-xlabel]")?.textContent ?? "",
      };
      ctl.destroy();
      host.remove();
      return shot;
    };
    const plain = hover({});
    const ordered = hover({
      tooltip: { fields: ["cost", { field: "revenue", title: "Sales", format: "currency" }] },
    });
    const subset = hover({ tooltip: { fields: ["region"] } });
    expect(plain.text.indexOf("revenue")).toBeGreaterThanOrEqual(0);
    expect(plain.text.indexOf("revenue")).toBeLessThan(plain.text.indexOf("cost"));
    expect(plain.text).not.toContain("$");
    expect(ordered.text.indexOf("cost")).toBeGreaterThanOrEqual(0);
    expect(ordered.text.indexOf("cost")).toBeLessThan(ordered.text.indexOf("Sales"));
    expect(ordered.text).toContain("$");
    expect(ordered.text).not.toBe(plain.text);
    expect(subset.text).not.toContain("revenue");
    expect(subset.text).not.toContain("cost");
    expect(subset.text).not.toBe(ordered.text);
    const places = (["top", "bottom", "left", "right"] as const).map((position) => {
      const shot = hover({ tooltip: { position } });
      return `${shot.left},${shot.top}`;
    });
    expect(new Set(places).size).toBe(4);
    const labeled = hover({ tooltip: { crosshairLabel: true } });
    const quiet = hover({ tooltip: { crosshairLabel: false } });
    expect(labeled.label.length).toBeGreaterThan(0);
    expect(quiet.label).toBe("");
    expect(labeled.label).not.toBe(quiet.label);
  });

  it("changes the picture when a point or series is selected, and when the legend is hovered", () => {
    const spec = {
      version: "1",
      type: "line",
      data: rows,
      encoding: { x: "month", y: ["revenue", "cost"] },
      a11y: { alt },
      size: { width: 420, height: 240 },
    };
    const open = (select?: "point" | "series") => {
      const host = document.createElement("div");
      document.body.append(host);
      const next = select ? { ...spec, interaction: { select } } : spec;
      host.innerHTML = render(next);
      const ctl = attach(host, next, { render });
      const svg = host.querySelector("svg")!;
      const plot = svg.querySelector("clipPath rect")!;
      const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.5;
      return { host, ctl, svg, x };
    };
    const idle = open();
    idle.svg.querySelector("path")!.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: idle.x, clientY: 40 }));
    expect(idle.svg.querySelector("[data-ck-dim],.ck-pick,[data-ck-pick]")).toBeNull();
    idle.ctl.destroy();
    idle.host.remove();

    const point = open("point");
    let clicked: { series: string; index: number; row: { month?: string }; value: unknown } | null = null;
    point.host.addEventListener("pointclick", ((event: CustomEvent) => {
      clicked = event.detail;
    }) as EventListener);
    point.svg.querySelector("path")!.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: point.x, clientY: 40 }));
    expect(clicked?.series).toBeTruthy();
    expect(clicked?.row.month).toBeTruthy();
    expect(clicked?.value).not.toBeUndefined();
    expect(point.svg.querySelector("[data-ck-dim]")).toBeTruthy();
    expect(point.svg.querySelector(".ck-pick,[data-ck-pick]")).toBeTruthy();
    const dimmed = point.svg.querySelectorAll("[data-ck-dim]").length;
    point.svg.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(point.svg.querySelector("[data-ck-dim]")).toBeNull();
    expect(dimmed).toBeGreaterThan(0);
    point.ctl.destroy();
    point.host.remove();

    const series = open("series");
    let seriesName = "";
    series.host.addEventListener("seriesclick", ((event: CustomEvent) => {
      seriesName = event.detail.series;
    }) as EventListener);
    series.svg.querySelector("path")!.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: series.x, clientY: 40 }));
    expect(seriesName).toBeTruthy();
    expect(series.svg.querySelector("[data-ck-dim]")).toBeTruthy();
    const legend = [...series.svg.querySelectorAll("text")].find((node) => node.textContent && node.textContent !== seriesName);
    legend?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    const hovered = series.svg.querySelector("[data-ck-dim]");
    expect(hovered).toBeTruthy();
    expect(legend?.hasAttribute("data-ck-dim")).toBe(false);
    series.ctl.destroy();
    series.host.remove();
  });

  it("draws shapes, labels, and stack totals on the small chart entry", async () => {
    vi.resetModules();
    const { createRenderer } = await import("../render");
    const { line: lineChart } = await import("../charts/line");
    const drawLine = createRenderer([lineChart]);
    const marked = drawLine({
      ...line,
      encoding: {
        x: "month",
        y: [
          { field: "revenue", pointShape: "diamond" },
          { field: "cost", pointShape: "square", pointFill: "hollow" },
        ],
      },
      mark: { pointShape: "circle", labels: true, labelEnds: "last", labelFormat: { style: "integer", suffix: "u" } },
    });
    expect(marked).toContain("<path");
    expect(marked).toMatch(/<rect x="[^"]+" y="[^"]+" width="[^"]+" height="[^"]+" fill="none" stroke="/);
    expect(marked).toContain("1,800u");
    expect(marked).toContain("900u");
    expect(marked).not.toContain("1,000u");
    expect(marked).not.toContain("3,000u");
    vi.resetModules();
    const { createRenderer: createBar } = await import("../render");
    const { bar } = await import("../charts/bar");
    const drawBar = createBar([bar]);
    const totals = drawBar({
      version: "1",
      type: "bar",
      data: rows,
      encoding: { x: "month", y: ["revenue", "cost"] },
      mark: { stackTotal: true, labels: true, labelPosition: "inside" },
      a11y: { alt },
      size: { width: 420, height: 260 },
    });
    expect(totals).toContain("1,400");
    expect(totals).toContain("4,200");
    expect(totals).toContain("2,700");
    const crowded = drawLine({
      version: "1",
      type: "line",
      data: Array.from({ length: 12 }, (_, index) => ({ month: `M${index}`, revenue: 100 + index })),
      encoding: { x: "month", y: "revenue" },
      mark: { labels: true, labelFormat: { style: "integer", suffix: "u" } },
      a11y: { alt: "Revenue steps up." },
      size: { width: 280, height: 160 },
    });
    const hits = crowded?.match(/u</g) ?? [];
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThan(12);
  });

  it("walks every schema property on the full renderer and on each chart entry", async () => {
    const ready = hosts();
    expect(ready.length).toBeGreaterThan(5);
    const entries = await entrySet(ready);
    expect(entries.draw.size).toBe(ENTRY_FILES.length);
    const lineDraw = entries.draw.get("line");
    const lineSvg = lineDraw?.({
      ...line,
      axes: { x: { title: "Month", position: "top" }, y: { title: "Revenue", position: "right" } },
      a11y: { alt, description: "Monthly revenue." },
    });
    expect(lineSvg).toContain("Month");
    expect(lineSvg).toContain("Revenue");
    expect(lineSvg).toContain("Monthly revenue.");
    const silent: string[] = [];
    for (const leaf of collect()) {
      const only = [...new Set([...leaf.consts, ...leaf.enums].map((value) => JSON.stringify(value)))];
      if (only.length === 1 && leaf.enums.length === 0 && !leaf.types.has("boolean") && !leaf.types.has("number") && !leaf.types.has("integer") && !leaf.types.has("array")) continue;
      if (!covered(leaf, ready, entries)) silent.push(leaf.path);
    }
    expect(silent, silent.join("\n")).toEqual([]);
  }, 20_000);
});
