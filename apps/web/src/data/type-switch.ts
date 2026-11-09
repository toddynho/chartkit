/**
 * Playground type changes.
 *
 * The Type control used to write `type` and leave the old data in place, so
 * bar to sankey drew nothing. A switch now keeps the rows when the new type
 * can use them, and otherwise loads that type's first example.
 *
 * Labels already in the data, the title, the subtitle, and the alt text are copied through.
 * Nothing here shortens or rewrites them.
 *
 * Families (a type can sit in only one test family; nested treemaps still
 * convert with sunburst and tree):
 *
 * - series: line, bar, bar-list, stacked-area, streamgraph, combo, pie, donut,
 *   funnel, waterfall, radial-bar, rose, radar, sparkline, mini-area, spike,
 *   and a flat treemap. Category or time on x, numbers on y. One series is
 *   enough for pie, donut, funnel, waterfall, bar-list, and treemap; the first
 *   y channel is kept and the rest stay in the rows. Line and stacked area
 *   share this shape, which is the line to area switch. Combo series that
 *   have no mark become bar, then line.
 * - points: scatter and quadrant, when x and y are both numbers. A quadrant
 *   gets a domain around the data so the points stay on the square.
 * - range: area-range, bar-range, and errorbar, when low and high exist.
 *   Area range and error bar also need y. Bar range does not.
 * - sample: histogram and density, when x is a numeric sample.
 * - distribution: boxplot and strip. The group and the value trade channels.
 *   Strip's value is x and its group is y. Box plot is the other way.
 * - hierarchy: sunburst, tree, and a treemap whose rows nest or name a parent.
 * - flow: sankey (source, target, y).
 * - candles: candlestick.
 * - matrix: heatmap.
 * - metric: gauge, kpi, and progress ring, sharing metric.
 * - bullet: needs a target column as well as x and y.
 * - gantt, timeline, venn, journey, choropleth, and map-points stand alone.
 *
 * Anything else is replaced by the first example of the new type. A width,
 * height, or aspect the caller asks to keep is copied onto that spec.
 * Otherwise those keys are removed so the playground preview size applies.
 * Options the new type does not list, and options the playground marks
 * "not yet", are removed. Channel titles and field names are kept.
 */
import { optionCatalog, type OptionField } from "@chartkitdev/core/options";
import pieExample from "../../../../packages/core/examples/29-pie.json";
import sunburstExample from "../../../../packages/core/examples/33-sunburst.json";
import choroplethExample from "../../../../catalog/visual/specs/choropleth.json";
import mapPointsExample from "../../../../catalog/visual/specs/map-points.json";
import { optionEffect } from "./option-effect";
import { readExplicitSize, stripPreviewSize } from "./preview-size";

export interface PlayExample {
  type?: string;
  spec: Record<string, unknown>;
}

export interface SwitchOptions {
  /** Copy width, height, aspectRatio, and minHeight from the spec being edited. */
  keepSize?: boolean;
  /** Type before this edit. Defaults to spec.type. */
  fromType?: string;
}

export interface TypeFamily {
  id: string;
  types: readonly string[];
}

export const TYPE_FAMILIES: readonly TypeFamily[] = [
  {
    id: "series",
    types: ["line", "bar", "bar-list", "stacked-area", "streamgraph", "combo", "pie", "donut", "funnel", "waterfall", "radial-bar", "rose", "radar", "sparkline", "mini-area", "spike", "treemap"],
  },
  { id: "points", types: ["scatter", "quadrant"] },
  { id: "range", types: ["area-range", "bar-range", "errorbar"] },
  { id: "sample", types: ["histogram", "density"] },
  { id: "distribution", types: ["boxplot", "strip"] },
  { id: "hierarchy", types: ["sunburst", "tree"] },
  { id: "flow", types: ["sankey"] },
  { id: "candles", types: ["candlestick"] },
  { id: "matrix", types: ["heatmap"] },
  { id: "metric", types: ["gauge", "kpi", "progress-ring"] },
  { id: "bullet", types: ["bullet"] },
  { id: "gantt", types: ["gantt"] },
  { id: "timeline", types: ["timeline"] },
  { id: "venn", types: ["venn"] },
  { id: "journey", types: ["journey"] },
  { id: "choropleth", types: ["choropleth"] },
  { id: "map-points", types: ["map-points"] },
];

const SERIES = new Set(TYPE_FAMILIES.find((family) => family.id === "series")?.types ?? []);
const POINTS = new Set(["scatter", "quadrant"]);
const RANGE = new Set(["area-range", "bar-range", "errorbar"]);
const SAMPLE = new Set(["histogram", "density"]);
const DISTRIBUTION = new Set(["boxplot", "strip"]);
const HIERARCHY = new Set(["sunburst", "tree", "treemap"]);
const METRIC = new Set(["gauge", "kpi", "progress-ring"]);
const NUMBER_ARRAY = new Set(["sparkline", "mini-area", "spike", "kpi"]);
const PART = new Set(["pie", "donut", "funnel", "treemap"]);
const NON_NEGATIVE = new Set(["pie", "donut", "funnel", "treemap", "streamgraph"]);
const SINGLE = new Set(["bar-list", "pie", "donut", "funnel", "waterfall", "treemap", "bullet"]);
const CONTINUOUS = new Set(["line", "stacked-area", "streamgraph", "combo", "spike", "sparkline", "mini-area", "scatter"]);

const FALLBACKS: Record<string, Record<string, unknown>> = {
  pie: pieExample as Record<string, unknown>,
  sunburst: sunburstExample as Record<string, unknown>,
  choropleth: choroplethExample as Record<string, unknown>,
  "map-points": mapPointsExample as Record<string, unknown>,
};

const byPath = new Map<string, OptionField>(optionCatalog.map((field) => [field.path, field]));
const childPrefix = new Set<string>();
for (const field of optionCatalog) {
  const dot = field.path.lastIndexOf(".");
  if (dot > 0) childPrefix.add(field.path.slice(0, dot));
}

export function switchChartType(
  spec: Record<string, unknown>,
  nextType: string,
  examples: readonly PlayExample[] = [],
  options: SwitchOptions = {},
): Record<string, unknown> {
  const fromType = options.fromType ?? (typeof spec.type === "string" ? spec.type : "");
  if (!nextType || nextType === fromType) {
    const same = clone(spec);
    prune(same, nextType || fromType);
    applySize(same, spec, options.keepSize === true);
    carryHeading(same, spec);
    return same;
  }

  const draft = clone(spec);
  draft.type = nextType;
  if (canUseData(draft, fromType, nextType)) {
    reshape(draft, fromType, nextType);
    prune(draft, nextType);
    finish(draft, nextType);
    applySize(draft, spec, options.keepSize === true);
    carryHeading(draft, spec);
    return draft;
  }

  const loaded = clone(firstSpec(nextType, examples) ?? spec);
  loaded.type = nextType;
  applySize(loaded, spec, options.keepSize === true);
  carryHeading(loaded, spec);
  return loaded;
}

/** A set title or subtitle stays on the spec so the chart heading can paint it. */
function carryHeading(result: Record<string, unknown>, source: Record<string, unknown>): void {
  if (typeof source.title === "string" && source.title.trim()) result.title = source.title;
  if (typeof source.subtitle === "string" && source.subtitle.trim()) result.subtitle = source.subtitle;
}

/** First spec of this type: the playground list, then the built-in fallbacks. */
export function firstSpec(type: string, examples: readonly PlayExample[]): Record<string, unknown> | undefined {
  const hit = examples.find((item) => item.spec && (item.spec.type === type || item.type === type));
  if (hit) return hit.spec;
  return FALLBACKS[type];
}

function canUseData(spec: Record<string, unknown>, fromType: string, nextType: string): boolean {
  if (ready(spec, nextType)) return true;
  if (DISTRIBUTION.has(fromType) && DISTRIBUTION.has(nextType)) return hasGroupAndValue(spec);
  if (NUMBER_ARRAY.has(nextType) && isNumberArray(spec.data)) return true;
  if (SERIES.has(nextType) && isNumberArray(spec.data)) return true;
  if (SAMPLE.has(nextType) && isNumberArray(spec.data)) return true;
  return false;
}

function ready(spec: Record<string, unknown>, nextType: string): boolean {
  if (nextType === "tree") return treeReady(spec);
  if (HIERARCHY.has(nextType) && isHierarchy(spec)) return true;
  if (nextType === "treemap" && seriesReady(spec, nextType)) return true;
  if (SERIES.has(nextType) && nextType !== "treemap" && seriesReady(spec, nextType)) return true;
  if (POINTS.has(nextType) && bothNumeric(spec)) return true;
  if (RANGE.has(nextType) && rangeReady(spec, nextType)) return true;
  if (SAMPLE.has(nextType) && sampleReady(spec)) return true;
  if (nextType === "sankey" && sankeyReady(spec)) return true;
  if (nextType === "candlestick" && candleReady(spec)) return true;
  if (nextType === "heatmap" && heatmapReady(spec)) return true;
  if (METRIC.has(nextType) && metricReady(spec)) return true;
  if (nextType === "bullet" && bulletReady(spec)) return true;
  if (DISTRIBUTION.has(nextType) && distributionReady(spec, nextType)) return true;
  return false;
}

function reshape(spec: Record<string, unknown>, fromType: string, nextType: string): void {
  if (isNumberArray(spec.data) && !NUMBER_ARRAY.has(nextType)) expandNumbers(spec);
  if (DISTRIBUTION.has(nextType) && !distributionReady(spec, nextType) && DISTRIBUTION.has(fromType)) swapXY(spec);

  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (encoding && SINGLE.has(nextType)) {
    const list = asList(encoding.y);
    if (list.length > 1) encoding.y = list[0];
  }
  if (encoding && nextType === "combo" && encoding.y !== undefined) encoding.y = comboMarks(encoding.y);
  if (nextType === "streamgraph") {
    const count = encoding ? asList(encoding.y).length : 0;
    if (count < 2) {
      const mark = isRecord(spec.mark) ? spec.mark : {};
      if (mark.streamOffset == null) mark.streamOffset = "zero";
      spec.mark = mark;
    }
  }
  if (nextType === "gauge" || nextType === "progress-ring") delete spec.data;
  if (!METRIC.has(nextType)) delete spec.metric;
  if (nextType !== "quadrant") delete spec.quadrants;
}

function finish(spec: Record<string, unknown>, nextType: string): void {
  if (nextType === "quadrant") applyQuadrantDomain(spec);
  dropMissingChannels(spec);
  reconcileY2(spec);
}

function seriesReady(spec: Record<string, unknown>, nextType: string): boolean {
  if (isNumberArray(spec.data)) {
    if (nextType === "radar") return spec.data.length >= 3;
    return NUMBER_ARRAY.has(nextType) || SERIES.has(nextType);
  }
  const xName = channelName(isRecord(spec.encoding) ? spec.encoding.x : undefined);
  const ys = yChannels(spec);
  if (!xName || !ys.length) return false;
  if (!ys.every((field) => kindOf(column(spec, field)) === "number")) return false;
  const xKind = kindOf(column(spec, xName));
  if (xKind !== "text" && xKind !== "number") return false;
  if (PART.has(nextType) && xKind !== "text") return false;
  if (NON_NEGATIVE.has(nextType)) {
    const fields = SINGLE.has(nextType) ? ys.slice(0, 1) : ys;
    if (!fields.every((field) => nonNegative(column(spec, field)))) return false;
  }
  if (nextType === "radar") {
    const spokes = new Set(column(spec, xName).filter((value) => value != null && value !== "").map((value) => String(value)));
    if (spokes.size < 3) return false;
  }
  if (CONTINUOUS.has(nextType) || nextType === "bar" || nextType === "bar-list" || nextType === "waterfall" || nextType === "radar" || nextType === "radial-bar" || nextType === "rose" || PART.has(nextType)) {
    return true;
  }
  return false;
}

function bothNumeric(spec: Record<string, unknown>): boolean {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return false;
  const xName = channelName(encoding.x);
  const yName = yChannels(spec)[0];
  if (!xName || !yName) return false;
  return kindOf(column(spec, xName)) === "number" && kindOf(column(spec, yName)) === "number";
}

function rangeReady(spec: Record<string, unknown>, nextType: string): boolean {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return false;
  const low = channelName(encoding.low);
  const high = channelName(encoding.high);
  if (!low || !high) return false;
  if (kindOf(column(spec, low)) !== "number" || kindOf(column(spec, high)) !== "number") return false;
  if (nextType === "bar-range") return true;
  const y = yChannels(spec)[0];
  return Boolean(y) && kindOf(column(spec, y)) === "number";
}

function sampleReady(spec: Record<string, unknown>): boolean {
  if (isNumberArray(spec.data)) return true;
  const xName = channelName(isRecord(spec.encoding) ? spec.encoding.x : undefined);
  return Boolean(xName) && kindOf(column(spec, xName ?? "")) === "number";
}

function sankeyReady(spec: Record<string, unknown>): boolean {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return false;
  const source = channelName(encoding.source);
  const target = channelName(encoding.target);
  const y = yChannels(spec)[0];
  if (!source || !target || !y) return false;
  return kindOf(column(spec, y)) === "number";
}

function candleReady(spec: Record<string, unknown>): boolean {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return false;
  const names = ["open", "high", "low", "close"].map((key) => channelName(encoding[key]));
  if (names.some((name) => !name)) return false;
  return names.every((name) => kindOf(column(spec, name ?? "")) === "number");
}

function heatmapReady(spec: Record<string, unknown>): boolean {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return false;
  const xName = channelName(encoding.x);
  const color = channelName(encoding.color);
  if (!xName || !color) return false;
  return kindOf(column(spec, color)) === "number";
}

function metricReady(spec: Record<string, unknown>): boolean {
  return isRecord(spec.metric) && typeof spec.metric.value === "number" && Number.isFinite(spec.metric.value);
}

function bulletReady(spec: Record<string, unknown>): boolean {
  if (!seriesReady(spec, "bar")) return false;
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const target = encoding ? channelName(encoding.target) : undefined;
  return Boolean(target) && kindOf(column(spec, target ?? "")) === "number";
}

function distributionReady(spec: Record<string, unknown>, nextType: string): boolean {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return false;
  const xName = channelName(encoding.x);
  const yName = channelName(encoding.y);
  if (!xName || !yName) return false;
  const xKind = kindOf(column(spec, xName));
  const yKind = kindOf(column(spec, yName));
  if (nextType === "strip") return xKind === "number" && yKind === "text";
  return xKind === "text" && yKind === "number";
}

function hasGroupAndValue(spec: Record<string, unknown>): boolean {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return false;
  const xName = channelName(encoding.x);
  const yName = channelName(encoding.y);
  if (!xName || !yName) return false;
  const xKind = kindOf(column(spec, xName));
  const yKind = kindOf(column(spec, yName));
  return (xKind === "number" && yKind === "text") || (xKind === "text" && yKind === "number");
}

function treeReady(spec: Record<string, unknown>): boolean {
  if (!isHierarchy(spec)) return false;
  const rows = readRows(spec.data);
  if (!rows?.length) return false;
  if (rows.some((row) => Array.isArray(row.children))) return rows.length === 1;
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const parent = encoding ? channelName(encoding.parent) : undefined;
  if (!parent) return false;
  const roots = rows.filter((row) => row[parent] == null || row[parent] === "");
  return roots.length === 1;
}

function isHierarchy(spec: Record<string, unknown>): boolean {
  const rows = readRows(spec.data);
  if (rows?.some((row) => Array.isArray(row.children) && row.children.length > 0)) return true;
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return false;
  return Boolean(channelName(encoding.id) && channelName(encoding.parent)) || Boolean(channelName(encoding.path));
}

function expandNumbers(spec: Record<string, unknown>): void {
  const values = spec.data as unknown[];
  spec.data = values.map((value, index) => ({ index: index + 1, value: typeof value === "number" ? value : null }));
  spec.encoding = { x: "index", y: "value" };
}

function swapXY(spec: Record<string, unknown>): void {
  if (!isRecord(spec.encoding)) return;
  const x = spec.encoding.x;
  spec.encoding.x = spec.encoding.y;
  spec.encoding.y = x;
}

function comboMarks(y: unknown): unknown {
  const list = asList(y);
  if (!list.length) return y;
  const next = list.map((item, index) => {
    const mark = index === 0 ? "bar" : "line";
    if (typeof item === "string") return { field: item, mark };
    if (!isRecord(item)) return item;
    if (item.mark === "bar" || item.mark === "line" || item.mark === "area" || item.mark === "range") return item;
    return { ...item, mark };
  });
  return next.length === 1 ? next[0] : next;
}

function applyQuadrantDomain(spec: Record<string, unknown>): void {
  if (!isRecord(spec.encoding)) return;
  const xName = channelName(spec.encoding.x);
  const yName = yChannels(spec)[0];
  if (!xName || !yName) return;
  spec.encoding.x = withDomain(spec.encoding.x, extent(column(spec, xName)));
  spec.encoding.y = withDomain(spec.encoding.y, extent(column(spec, yName)));
}

function withDomain(channel: unknown, span: [number, number] | undefined): unknown {
  if (!span) return channel;
  const [min, max] = span;
  const base: Record<string, unknown> = typeof channel === "string" ? { field: channel } : isRecord(channel) ? { ...channel } : {};
  const scale: Record<string, unknown> = isRecord(base.scale) ? { ...base.scale } : {};
  const domain = scale.domain;
  if (Array.isArray(domain) && domain.length >= 2 && typeof domain[0] === "number" && typeof domain[1] === "number" && domain[0] <= min && domain[1] >= max) {
    return channel;
  }
  const pad = max > min ? (max - min) * 0.08 : 1;
  scale.domain = [min - pad, max + pad];
  base.scale = scale;
  return base;
}

function prune(spec: Record<string, unknown>, type: string): void {
  for (const key of Object.keys(spec)) {
    if (key === "version" || key === "type" || key === "data" || key === "id" || key === "a11y" || key === "theme") continue;
    if (key === "encoding" && isRecord(spec.encoding)) {
      for (const channel of Object.keys(spec.encoding)) {
        const path = `encoding.${channel}`;
        if (!pathAllowed(type, path)) {
          delete spec.encoding[channel];
          continue;
        }
        spec.encoding[channel] = pruneChannel(spec.encoding[channel], path, type);
      }
      if (!Object.keys(spec.encoding).length) delete spec.encoding;
      continue;
    }
    if (key === "mark" && isRecord(spec.mark)) {
      pruneObject(spec.mark, "mark", type);
      if (!Object.keys(spec.mark).length) delete spec.mark;
      continue;
    }
    if (!pathAllowed(type, key) && byPath.has(key)) {
      delete spec[key];
      continue;
    }
    if (isRecord(spec[key]) && childPrefix.has(key)) pruneObject(spec[key] as Record<string, unknown>, key, type);
  }
  if (nextLayoutUseless(spec, type)) delete spec.layout;
}

function pruneObject(node: Record<string, unknown>, prefix: string, type: string): void {
  for (const key of Object.keys(node)) {
    const path = `${prefix}.${key}`;
    if (!pathAllowed(type, path)) {
      delete node[key];
      continue;
    }
    if (isRecord(node[key]) && childPrefix.has(path)) pruneObject(node[key], path, type);
  }
}

function pruneChannel(value: unknown, prefix: string, type: string): unknown {
  if (Array.isArray(value)) return value.map((item) => pruneChannel(item, prefix, type));
  if (typeof value === "string" || typeof value === "number" || value == null || !isRecord(value)) return value;
  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "field" || key === "title") {
      next[key] = child;
      continue;
    }
    const path = `${prefix}.${key}`;
    if (!pathAllowed(type, path)) continue;
    if (key === "scale" && isRecord(child)) {
      const scale: Record<string, unknown> = {};
      for (const [scaleKey, scaleValue] of Object.entries(child)) {
        if (pathAllowed(type, `${path}.${scaleKey}`)) scale[scaleKey] = scaleValue;
      }
      if (Object.keys(scale).length) next.scale = scale;
      continue;
    }
    next[key] = child;
  }
  if (Object.keys(next).length === 1 && typeof next.field === "string") return next.field;
  return next;
}

function pathAllowed(type: string, path: string): boolean {
  const field = byPath.get(path);
  if (!field) return true;
  if (field.appliesTo && !field.appliesTo.includes(type)) return false;
  if (optionEffect(type, path).status === "not-yet") return false;
  return true;
}

function nextLayoutUseless(spec: Record<string, unknown>, type: string): boolean {
  if (!isRecord(spec.layout)) return false;
  if (type === "radial-bar" || type === "rose") return false;
  return spec.layout.coordinate === "polar" && Object.keys(spec.layout).length === 1;
}

function dropMissingChannels(spec: Record<string, unknown>): void {
  const rows = readRows(spec.data);
  if (!rows || !isRecord(spec.encoding)) return;
  const fields = new Set<string>();
  for (const row of rows) for (const key of Object.keys(row)) fields.add(key);
  for (const key of Object.keys(spec.encoding)) {
    const value = spec.encoding[key];
    if (Array.isArray(value)) {
      const kept = value.filter((item) => channelKnown(item, fields));
      if (kept.length) spec.encoding[key] = kept.length === value.length ? value : kept;
      else delete spec.encoding[key];
      continue;
    }
    if (!channelKnown(value, fields)) delete spec.encoding[key];
  }
  if (isRecord(spec.tooltip) && Array.isArray(spec.tooltip.fields)) {
    spec.tooltip.fields = spec.tooltip.fields.filter((item) => channelKnown(item, fields));
  }
}

function channelKnown(value: unknown, fields: Set<string>): boolean {
  const name = channelName(value);
  if (!name) return true;
  if (fields.has(name)) return true;
  return isLiteral(name);
}

function isLiteral(name: string): boolean {
  return name.startsWith("#") || name.startsWith("rgb") || name.startsWith("hsl") || name.startsWith("oklch") || name.startsWith("var(") || /^(series-\d+|accent|positive|negative|text|muted|grid|transparent)$/.test(name);
}

function reconcileY2(spec: Record<string, unknown>): void {
  const uses = yItems(spec).some((item) => isRecord(item) && item.axis === "y2");
  if (!isRecord(spec.axes)) {
    if (uses) spec.axes = { y2: true };
    return;
  }
  if (uses && spec.axes.y2 == null) spec.axes.y2 = true;
  if (!uses) delete spec.axes.y2;
  if (!Object.keys(spec.axes).length) delete spec.axes;
}

function applySize(spec: Record<string, unknown>, source: Record<string, unknown>, keepSize: boolean): void {
  if (!keepSize) {
    stripPreviewSize(spec);
    return;
  }
  const explicit = readExplicitSize(source);
  const size = isRecord(spec.size) ? { ...spec.size } : {};
  delete size.width;
  delete size.height;
  delete size.aspectRatio;
  if (explicit.width != null) size.width = explicit.width;
  if (explicit.height != null) size.height = explicit.height;
  if (explicit.aspectRatio != null) size.aspectRatio = explicit.aspectRatio;
  if (explicit.minHeight != null) size.minHeight = explicit.minHeight;
  if (Object.keys(size).length) spec.size = size;
  else delete spec.size;
}

function yChannels(spec: Record<string, unknown>): string[] {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return [];
  return asList(encoding.y).map(channelName).filter((name): name is string => Boolean(name));
}

function yItems(spec: Record<string, unknown>): unknown[] {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return [];
  return asList(encoding.y);
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function channelName(value: unknown): string | undefined {
  if (typeof value === "string" && value) return value;
  if (isRecord(value) && typeof value.field === "string" && value.field) return value.field;
  return undefined;
}

function column(spec: Record<string, unknown>, field: string): unknown[] {
  const rows = readRows(spec.data);
  if (!rows) return [];
  return rows.map((row) => row[field]);
}

function kindOf(values: unknown[]): "number" | "text" | "empty" | "mixed" {
  let numbers = 0;
  let texts = 0;
  for (const value of values) {
    if (value == null || value === "") continue;
    if (typeof value === "number" && Number.isFinite(value)) numbers += 1;
    else texts += 1;
  }
  if (numbers && texts) return "mixed";
  if (numbers) return "number";
  if (texts) return "text";
  return "empty";
}

function nonNegative(values: unknown[]): boolean {
  let seen = false;
  for (const value of values) {
    if (value == null || value === "") continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return false;
    seen = true;
  }
  return seen;
}

function extent(values: unknown[]): [number, number] | undefined {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  return [min, max];
}

function readRows(data: unknown): Record<string, unknown>[] | undefined {
  if (Array.isArray(data)) {
    if (data.every((row) => isRecord(row))) return data;
    return undefined;
  }
  if (!isRecord(data) || !isRecord(data.columns)) return undefined;
  const columns = data.columns;
  const keys = Object.keys(columns);
  const length = Math.max(0, ...keys.map((key) => (Array.isArray(columns[key]) ? columns[key].length : 0)));
  const rows: Record<string, unknown>[] = [];
  for (let index = 0; index < length; index += 1) {
    const row: Record<string, unknown> = {};
    for (const key of keys) row[key] = Array.isArray(columns[key]) ? columns[key][index] : undefined;
    rows.push(row);
  }
  return rows;
}

function isNumberArray(data: unknown): data is Array<number | null> {
  return Array.isArray(data) && data.length > 0 && data.every((item) => item == null || typeof item === "number");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
