import type { JsonPatchOperation } from "../diagnostics";
import { emit, isPlainObject, nearMatches, quote, stringList, suggestHint, type Ctx } from "./util";

export const CHART_TYPES = [
  "line",
  "bar",
  "donut",
  "pie",
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
  "histogram",
  "boxplot",
  "radar",
  "funnel",
  "treemap",
  "sankey",
  "bullet",
  "waterfall",
  "area-range",
  "bar-range",
  "errorbar",
  "sunburst",
  "bar-list",
  "radial-bar",
  "rose",
  "strip",
  "streamgraph",
  "density",
  "tree",
] as const;

/** Types whose field rules live outside this schema. They stay out of the enum and in the CK1005 list. */
const DEFERRED_TYPES = ["gantt", "timeline", "quadrant", "venn", "journey", "choropleth", "map-points"] as const;

export function validTypeList(): string {
  return `${CHART_TYPES.join(", ")}, ${DEFERRED_TYPES.join(", ")}`;
}

export function yFieldReplacement(value: unknown): unknown {
  if (isPlainObject(value)) return expandFieldList(value);
  if (!Array.isArray(value)) return undefined;
  let changed = false;
  const out: unknown[] = [];
  for (const item of value) {
    if (!isPlainObject(item)) {
      out.push(item);
      continue;
    }
    const expanded = expandFieldList(item);
    if (expanded === undefined) {
      out.push(item);
      continue;
    }
    changed = true;
    if (Array.isArray(expanded)) out.push(...expanded);
    else out.push(expanded);
  }
  return changed ? out : undefined;
}

function expandFieldList(channel: Record<string, unknown>): unknown {
  const fields = stringList(channel.field);
  if (!fields) return undefined;
  const siblings: Record<string, unknown> = {};
  for (const key of Object.keys(channel)) {
    if (key !== "field") siblings[key] = channel[key];
  }
  if (Object.keys(siblings).length === 0) return fields;
  return fields.map((field) => ({ field, ...siblings }));
}

export function chartTypeName(raw: string, root: unknown): string | undefined {
  return aliasFor(raw, root)?.type ?? ((CHART_TYPES as readonly string[]).includes(raw) ? raw : undefined);
}

export function emitUnknownType(value: unknown, ctx: Ctx): void {
  if (ctx.skipUnknown.has("/type")) return;
  const raw = typeof value === "string" ? value : String(value);
  const kebab = raw.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`).replace(/^-/, "");
  const alias = aliasFor(raw, ctx.rootValue);
  const named = alias?.type ?? (CHART_TYPES as readonly string[]).find((t) => t === kebab);
  const matches = named ? [named] : nearMatches(raw, [...CHART_TYPES], 3);
  const closest = matches[0];
  const hintParts = [
    suggestHint(matches),
    `valid: ${validTypeList()}`,
    alias?.note,
  ].filter(Boolean);
  emit(ctx, {
    code: "CK1005",
    severity: "error",
    message: `unknown chart type ${quote(raw)}`,
    path: "/type",
    hint: hintParts.join(" "),
    fix: alias ? aliasFix(ctx.rootValue, alias) : closest && (CHART_TYPES as readonly string[]).includes(closest)
      ? [{ op: "replace", path: "/type", value: closest }]
      : undefined,
  });
}

interface Alias {
  type: string;
  note?: string;
  kind: "rename";
  layout?: "grid" | "calendar";
}

export function aliasFor(value: string, root: unknown): Alias | undefined {
  if (value === "arc") return { type: "donut", kind: "rename" };
  if (value === "point" || value === "circle" || value === "square") return { type: "scatter", kind: "rename" };
  if (value === "rect") return { type: "heatmap", kind: "rename" };
  if (value === "rule" || value === "tick") return { type: "spike", kind: "rename" };
  if (value === "metric") {
    const gauge = looksLikeGauge(root);
    return {
      type: gauge ? "gauge" : "kpi",
      note: 'A single number is "gauge" or "kpi", with metric: { value, min, max, label?, delta? }.',
      kind: "rename",
    };
  }
  if (value.startsWith("xychart")) return { type: xyKind(root), kind: "rename" };
  if (value.endsWith("-beta")) {
    const head = value.slice(0, -5);
    if (head === "sankey" || head === "radar" || head === "treemap") return { type: head, kind: "rename" };
  }
  if (value === "area") {
    const stacked = yCount(root) >= 2 || stackFlag(root);
    return stacked
      ? { type: "stacked-area", kind: "rename" }
      : { type: "mini-area", note: 'A full-size filled line is type "line" with mark.area true. Stacked layers are "stacked-area".', kind: "rename" };
  }
  if (value === "grid-heat" || value === "gridheat" || value === "grid_heat") return { type: "heatmap", kind: "rename" };
  if (value === "grid-heatmap") return { type: "heatmap", kind: "rename", layout: "grid" };
  if (value === "calendar-heatmap") return { type: "heatmap", kind: "rename", layout: "calendar" };
  if (value === "hist") return { type: "histogram", kind: "rename" };
  if (value === "box" || value === "box-plot") return { type: "boxplot", kind: "rename" };
  if (value === "stripplot" || value === "strip-plot" || value === "dotplot" || value === "dot-plot" || value === "cleveland") return { type: "strip", kind: "rename" };
  if (value === "kde" || value === "density" || value === "kernel-density") return { type: "density", kind: "rename" };
  if (value === "dendrogram" || value === "treegraph" || value === "tree-graph") return { type: "tree", kind: "rename" };
  if (value === "stream" || value === "stream-graph" || value === "themeriver" || value === "theme-river" || value === "themeRiver") return { type: "streamgraph", kind: "rename" };
  if (value === "radar-chart") return { type: "radar", kind: "rename" };
  if (value === "funnel-chart") return { type: "funnel", kind: "rename" };
  if (value === "tree-map") return { type: "treemap", kind: "rename" };
  if (value === "sankey-diagram") return { type: "sankey", kind: "rename" };
  if (value === "bullet-chart") return { type: "bullet", kind: "rename" };
  if (value === "waterfall-chart") return { type: "waterfall", kind: "rename" };
  if (value === "arearange" || value === "area_range" || value === "range-area" || value === "rangearea") return { type: "area-range", kind: "rename" };
  if (value === "columnrange" || value === "column-range" || value === "rangebar" || value === "range-bar" || value === "floating-bar") return { type: "bar-range", kind: "rename" };
  if (value === "error-bar" || value === "error-bars" || value === "errorbars") return { type: "errorbar", kind: "rename" };
  if (value === "sun-burst" || value === "sunburstchart" || value === "sunburst-chart" || value === "partition") return { type: "sunburst", kind: "rename" };
  const folded = value.trim().replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().replace(/[_]+/g, " ").replace(/-/g, " ").replace(/\s+/g, " ");
  const compact = folded.replace(/ /g, "");
  if (compact === "radialbar" || compact === "radialbars" || compact === "polarbar" || folded === "polar") {
    return { type: "radial-bar", kind: "rename", note: 'Bars around a circle are type "radial-bar". Equal-angle sectors are type "rose".' };
  }
  if (compact === "streamgraph" || compact === "themeriver" || folded === "stream graph" || folded === "theme river") {
    return { type: "streamgraph", kind: "rename", note: 'A streamgraph is type "streamgraph". The baseline is not zero. mark.baseline zero stacks on the axis.' };
  }
  if (compact === "stripplot" || compact === "dotplot" || folded === "dot plot" || folded === "strip plot" || folded === "cleveland") {
    return { type: "strip", kind: "rename", note: 'A strip, dot strip, or Cleveland dot plot is type "strip".' };
  }
  if (compact === "polararea" || compact === "rosechart" || folded === "nightingale" || folded === "rose chart") {
    return { type: "rose", kind: "rename", note: 'A nightingale rose is type "rose".' };
  }
  if (compact === "bubblemap" || folded === "map") return { type: "map-points", kind: "rename" };
  if (compact === "choroplethmap" || folded === "heat map of countries") return { type: "choropleth", kind: "rename" };
  return undefined;
}

function xyKind(root: unknown): "line" | "bar" | "combo" {
  const spec = isPlainObject(root) ? root : {};
  const rows = isPlainObject(spec.data) ? spec.data.datasets : 0;
  const blob = JSON.stringify([
    spec.encoding,
    spec.mark,
    spec.series,
    spec.marks,
    spec.layer,
    spec.layers,
    Array.isArray(rows) && rows.map((item) => (item as { type?: unknown })?.type),
  ]);
  const bar = blob.includes('"bar"');
  const line = blob.includes('"line"') || blob.includes('"area"');
  return bar && line ? "combo" : bar ? "bar" : "line";
}

function stackFlag(root: unknown): boolean {
  const spec = isPlainObject(root) ? root : undefined;
  const mark = spec && isPlainObject(spec.mark) ? spec.mark : undefined;
  const flag = spec?.stack ?? spec?.stacked ?? mark?.stack ?? mark?.stacked;
  return flag === true || flag === "stack" || flag === "stacked" || flag === "percent";
}

function looksLikeGauge(root: unknown): boolean {
  if (!isPlainObject(root)) return false;
  if (root.min !== undefined || root.max !== undefined || root.bands !== undefined || root.target !== undefined) return true;
  if (isPlainObject(root.metric) && (root.metric.min !== undefined || root.metric.max !== undefined || root.metric.target !== undefined)) return true;
  const enc = isPlainObject(root.encoding) ? root.encoding : undefined;
  return enc !== undefined && (enc.min !== undefined || enc.max !== undefined);
}

function yCount(root: unknown): number {
  if (!isPlainObject(root)) return 0;
  const enc = isPlainObject(root.encoding) ? root.encoding : undefined;
  if (!enc) return 0;
  const listed = yFieldReplacement(enc.y);
  let count = 0;
  if (Array.isArray(listed)) count = listed.length;
  else if (Array.isArray(enc.y)) count = enc.y.length;
  else if (enc.y !== undefined) count = 1;
  if (enc.y2 !== undefined) count += 1;
  return count;
}

export function noteChartType(spec: Record<string, unknown>, ctx: Ctx): void {
  if (ctx.skipUnknown.has("/chartType")) return;
  if (typeof spec.chartType !== "string" || hasKnownType(spec)) return;
  const mapped = chartTypeName(spec.chartType, spec);
  if (!mapped) return;
  const fix: JsonPatchOperation[] = [
    { op: typeof spec.type === "string" ? "replace" : "add", path: "/type", value: mapped },
    { op: "remove", path: "/chartType" },
  ];
  ctx.skipUnknown.add("/chartType");
  ctx.skipMissing.add("|type");
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "chartType belongs in type",
    path: "/chartType",
    hint: `The chart type is type: ${JSON.stringify(mapped)}. chartType is not a spec key.`,
    fix,
  });
}

export function hasKnownType(value: unknown): boolean {
  return isPlainObject(value) && typeof value.type === "string" && (CHART_TYPES as readonly string[]).includes(value.type);
}

function aliasFix(root: unknown, alias: Alias): JsonPatchOperation[] {
  const spec = isPlainObject(root) ? root : {};
  const fix: JsonPatchOperation[] = [{ op: "replace", path: "/type", value: alias.type }];
  if (!alias.layout) return fix;
  const rawMark = spec.mark;
  if (rawMark === undefined) fix.push({ op: "add", path: "/mark", value: { layout: alias.layout } });
  else if (isPlainObject(rawMark) && rawMark.layout === undefined) fix.push({ op: "add", path: "/mark/layout", value: alias.layout });
  else if (isPlainObject(rawMark)) fix.push({ op: "replace", path: "/mark/layout", value: alias.layout });
  return fix;
}
