import { compare, sortField } from "../sort";
import type { TooltipRender } from "../tooltip-slot";

export interface InteractSpec {
  type?: string;
  data?: unknown;
  encoding?: unknown;
  tooltip?: unknown;
  interaction?: unknown;
  animation?: unknown;
  /** BETA. The API may change. `"auto"` eases updates. Omitted and `"none"` stay still. */
  motion?: unknown;
  legend?: unknown;
  a11y?: unknown;
  locale?: string;
  axes?: unknown;
  mark?: unknown;
  version?: string;
  [key: string]: unknown;
}

export interface ClickDetail {
  series: string;
  datum: unknown;
  index: number;
  x: unknown;
  y: unknown;
  value: unknown;
  row: unknown;
  /** Resolved fill of the clicked mark, when the node has one. */
  color?: string;
}

export interface PointRef {
  series: string;
  index: number;
}

export interface Selection {
  points: PointRef[];
  series: string[];
}

export interface AttachOptions {
  /** Same renderer the adapter used to draw the SVG. Called again for zoom and legend rescale. */
  render: (spec: InteractSpec) => string;
  /** When set, including null, selection is controlled. Clicks emit `selectionchange` and wait for `setSelection`. */
  selection?: Selection | null;
  /** Replaces the tooltip card. Return HTML, a node, or null to hide it. */
  tooltip?: TooltipRender;
}

export interface Controller {
  /** `markup` is the adapter's render of the full spec. Zoom and hidden series render internally. */
  update(spec: InteractSpec, markup?: string | null): void;
  /** Show this selection without emitting. Later clicks stay controlled. */
  setSelection(selection: Selection | null): void;
  destroy(): void;
  /** Resolves once zoom, brush, keyboard, and the data table are listening. Tooltip does not wait. */
  ready: Promise<void>;
}

export interface PatchHost {
  innerHTML: string;
  querySelector?(selector: string): Element | null;
}

export interface HoverIndex {
  /** Sorted pixel centers used by the binary search. */
  xs: Float64Array;
  order: Int32Array | null;
  /** Pixel center of each original row. Equals `xs` when x is already sorted. */
  pixels: Float64Array;
  uniform: boolean;
  count: number;
  left: number;
  width: number;
  /** Canvas scenes resolve the row from the pointer without a pixel buffer. */
  at?: (px: number) => number;
  pixel?: (index: number) => number;
}

const TIP_TYPES = new Set([
  "line",
  "bar",
  "stacked-area",
  "scatter",
  "combo",
  "donut",
  "pie",
  "waterfall",
  "sunburst",
  "area-range",
  "bar-range",
  "errorbar",
  "sparkline",
  "mini-area",
  "spike",
  "candlestick",
  "heatmap",
  "bar-list",
]);

/** Types with a keyboard index model and a data table. Other types stay out of the tab order unless the spec asks. */
export const KEY_TYPES = new Set(["line", "bar", "stacked-area", "scatter", "combo", "donut", "pie", "sunburst", "candlestick", "sparkline", "mini-area", "spike"]);

export function arcChart(type: string | undefined): boolean {
  return type === "donut" || type === "pie" || type === "sunburst";
}

export function exportFormats(spec: InteractSpec): string[] {
  const interaction = isRecord(spec.interaction) ? spec.interaction : undefined;
  const list = interaction && Array.isArray(interaction.export) ? interaction.export : [];
  const out: string[] = [];
  for (const item of list) if ((item === "png" || item === "svg" || item === "csv") && !out.includes(item)) out.push(item);
  return out;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function fieldOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.field === "string") return value.field;
  return "";
}

interface Table {
  n: number;
  cell(field: string, index: number): unknown;
}

export function openTable(data: unknown): Table {
  if (Array.isArray(data) || ArrayBuffer.isView(data)) {
    const list = data as ArrayLike<unknown>;
    const n = list.length;
    if (n === 0 || typeof list[0] === "number" || list[0] == null) {
      return { n, cell: (_field, index) => list[index] };
    }
    return { n, cell: (field, index) => (list[index] as Record<string, unknown> | undefined)?.[field] };
  }
  if (isRecord(data) && isRecord(data.columns)) {
    const columns = data.columns as Record<string, ArrayLike<unknown>>;
    const keys = Object.keys(columns);
    const n = keys.length ? columns[keys[0]].length : 0;
    return { n, cell: (field, index) => columns[field]?.[index] };
  }
  return { n: 0, cell: () => undefined };
}

interface SeriesMeta {
  name: string;
  field: string;
  format?: unknown;
  /** When set, the series is the rows whose `match` field equals `name`. */
  match?: string;
}

function yChannels(y: unknown): { field: string; title: string; format?: unknown }[] {
  const list = Array.isArray(y) ? y : y == null ? [] : [y];
  const out: { field: string; title: string; format?: unknown }[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (typeof item === "string") out.push({ field: item, title: item });
    else if (isRecord(item) && typeof item.field === "string") {
      out.push({
        field: item.field,
        title: typeof item.title === "string" ? item.title : item.field,
        format: item.format,
      });
    }
  }
  return out;
}

function sunburstNames(spec: InteractSpec, table: Table): SeriesMeta[] {
  const enc = isRecord(spec.encoding) ? spec.encoding : {};
  const field = fieldOf(enc.y) || "value";
  const names: string[] = [];
  const push = (name: unknown) => {
    const text = typeof name === "string" ? name : name == null ? "" : String(name);
    if (text && !names.includes(text)) names.push(text);
  };
  const path = Array.isArray(enc.path) && typeof enc.path[0] === "string" ? enc.path[0] : "";
  const id = typeof enc.id === "string" ? enc.id : "";
  const parent = typeof enc.parent === "string" ? enc.parent : "";
  if (path) {
    for (let i = 0; i < table.n; i++) push(table.cell(path, i));
  } else if (id && parent) {
    const nameField = fieldOf(enc.x) || id;
    for (let i = 0; i < table.n; i++) {
      const up = table.cell(parent, i);
      if (up === null || up === undefined || up === "") push(table.cell(nameField, i) ?? table.cell(id, i));
    }
  } else if (table.n === 1 && Array.isArray(table.cell("children", 0))) {
    const kids = table.cell("children", 0) as unknown[];
    for (const child of kids) {
      if (!isRecord(child)) continue;
      push(typeof child.name === "string" ? child.name : typeof child.label === "string" ? child.label : child.id);
    }
  } else {
    for (let i = 0; i < table.n; i++) push(table.cell("name", i) ?? table.cell("label", i) ?? table.cell("id", i));
  }
  return names.length ? names.map((name) => ({ name, field })) : [{ name: "value", field }];
}

export function seriesOf(spec: InteractSpec, table: Table): SeriesMeta[] {
  const enc = isRecord(spec.encoding) ? spec.encoding : {};
  if (spec.type === "sunburst") return sunburstNames(spec, table);
  if (spec.type === "candlestick") return ["open", "high", "low", "close"].map((key) => ({ name: key, field: fieldOf(enc[key]) || key }));
  const channels = yChannels(enc.y);
  const arc = arcChart(spec.type);
  const group = arc ? fieldOf(enc.x) : typeof enc.series === "string" ? enc.series : fieldOf(enc.series);
  if (group && (arc || channels.length === 1)) {
    const field = arc ? fieldOf(enc.y) : channels[0].field;
    const format = arc ? (isRecord(enc.y) ? enc.y.format : undefined) : channels[0].format;
    const seen = new Set<string>();
    const out: SeriesMeta[] = [];
    for (let i = 0; i < table.n; i++) {
      const name = String(table.cell(group, i) ?? (arc ? i : ""));
      if (!name || seen.has(name)) continue;
      seen.add(name);
      out.push({ name, field, format, match: group });
    }
    return out;
  }
  const named = channels.map((c) => ({ name: c.title, field: c.field, format: c.format }));
  if (named.length === 1 && named[0].name === named[0].field) {
    const title = typeof spec.title === "string" ? spec.title.trim() : "";
    if (title) named[0] = { ...named[0], name: title };
  }
  return named.length ? named : [{ name: "value", field: "value" }];
}

export function axisFormat(spec: InteractSpec, axis: "y" | "y2"): unknown {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const node = axes && isRecord(axes[axis]) ? axes[axis] : undefined;
  return node?.format;
}

export function tooltipOn(spec: InteractSpec): boolean {
  if (isRecord(spec.interaction) && spec.interaction.hover === false) return false;
  const tooltip = spec.tooltip;
  if (tooltip === false || (isRecord(tooltip) && tooltip.show === false)) return false;
  return tooltip === true || isRecord(tooltip) || TIP_TYPES.has(spec.type ?? "");
}

export function barChart(spec: InteractSpec): boolean {
  return spec.type === "bar" || spec.type === "bar-range";
}

export function crosshairOn(spec: InteractSpec): boolean {
  if (barChart(spec)) return isRecord(spec.tooltip) && spec.tooltip.crosshair === true;
  return tooltipOn(spec) && !arcChart(spec.type) && spec.type !== "waterfall" && !(isRecord(spec.tooltip) && spec.tooltip.crosshair === false);
}

export function breakKey(rules: unknown[], width: number): string {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (!isRecord(rule)) continue;
    if (typeof rule.maxWidth === "number" && !(width <= rule.maxWidth)) continue;
    if (typeof rule.minWidth === "number" && !(width >= rule.minWidth)) continue;
    return String(i);
  }
  return "";
}

export function tipFields(spec: InteractSpec): { field: string; title?: string; format?: unknown; unit?: string }[] | null {
  const tooltip = spec.tooltip;
  if (!isRecord(tooltip) || !Array.isArray(tooltip.fields)) return null;
  const out: { field: string; title?: string; format?: unknown; unit?: string }[] = [];
  for (let i = 0; i < tooltip.fields.length; i++) {
    const item = tooltip.fields[i];
    if (typeof item === "string") {
      if (item) out.push({ field: item });
    } else if (isRecord(item) && typeof item.field === "string" && item.field) {
      out.push({
        field: item.field,
        title: typeof item.title === "string" ? item.title : undefined,
        format: item.format,
        unit: typeof item.unit === "string" ? item.unit : undefined,
      });
    }
  }
  return out.length ? out : null;
}

export function tipTemplate(spec: InteractSpec): string {
  return isRecord(spec.tooltip) && typeof spec.tooltip.template === "string" ? spec.tooltip.template : "";
}

export function hitPx(spec: InteractSpec): number {
  const tip = isRecord(spec.tooltip) ? spec.tooltip : null;
  const raw = tip && typeof tip.hit === "number" ? tip.hit : tip?.pin === true ? 18 : 8;
  return Math.max(8, Math.min(48, raw));
}

export function easeCss(name: unknown): string {
  if (name === "linear") return "linear";
  if (name === "ease-in-out") return "ease-in-out";
  if (name === "spring") return "cubic-bezier(0.22, 1.35, 0.36, 1)";
  return "ease-out";
}

export function easeOf(spec: InteractSpec): string {
  const name = isRecord(spec.animation) ? spec.animation.easing : 0;
  return typeof name === "string" ? name : "ease-out";
}

export function tipSide(spec: InteractSpec): number {
  const place = isRecord(spec.tooltip) ? spec.tooltip.position : 0;
  return place === "bottom" ? 2 : place === "left" ? 3 : place === "right" ? 4 : place === "top" ? 1 : 0;
}

export function zoomMode(spec: InteractSpec): "none" | "x" | "xy" {
  const zoom = isRecord(spec.interaction) ? spec.interaction.zoom : 0;
  return zoom === "x" || zoom === "xy" || zoom === "none" ? zoom : spec.type === "candlestick" ? "x" : "none";
}

export function reducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function durationMs(spec: InteractSpec, count: number): number {
  const animation = spec.animation;
  if (animation == null || animation === false || count > 2000 || reducedMotion()) return 0;
  if (animation === true) return 400;
  if (!isRecord(animation) || animation.duration === 0) return 0;
  return typeof animation.duration === "number" ? animation.duration : 400;
}

export function numericValues(spec: InteractSpec, table: Table, data: unknown): Float64Array | null {
  if (spec.type === "bar" || spec.type === "combo" || spec.type === "heatmap" || arcChart(spec.type)) return null;
  const enc = isRecord(spec.encoding) ? spec.encoding : {};
  const field = fieldOf(enc.x);
  const declared = isRecord(enc.x) ? enc.x.type : undefined;
  if (declared === "nominal" || declared === "ordinal") return null;
  if (!field) {
    if (!(Array.isArray(data) && (data.length === 0 || typeof data[0] === "number"))) return null;
    const values = new Float64Array(table.n);
    for (let i = 0; i < table.n; i++) values[i] = i;
    return values;
  }
  if (!table.n) return null;
  if (isRecord(data) && isRecord(data.columns)) {
    const column = data.columns[field];
    if (column instanceof Float64Array && column.length === table.n) return column;
  }
  const values = new Float64Array(table.n);
  for (let i = 0; i < table.n; i++) {
    const value = table.cell(field, i);
    if (i < 8 && (typeof value !== "number" || !Number.isFinite(value))) return null;
    values[i] = Number(value);
  }
  return values;
}

export function materialize(data: unknown): unknown[] | null {
  if (Array.isArray(data) || ArrayBuffer.isView(data)) return [].slice.call(data as ArrayLike<unknown>);
  if (!isRecord(data) || !isRecord(data.columns)) return null;
  const columns = data.columns as Record<string, ArrayLike<unknown>>;
  const keys = Object.keys(columns);
  const n = keys.length ? columns[keys[0]].length : 0;
  const rows: Record<string, unknown>[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const row: Record<string, unknown> = {};
    for (const key of keys) row[key] = columns[key][i];
    rows[i] = row;
  }
  return rows;
}

/** Rows in drawn order: the top-level `sort`, applied the way `loadTable` applies it. */
export function drawnData(spec: InteractSpec): unknown {
  const sort = spec.sort;
  const field = sortField(spec);
  // The cases `sortIssue` rejects draw unsorted, so they read unsorted.
  if (!field || !isRecord(sort) || (sort.by ?? "value") !== "value" || !["ascending", "descending", undefined].includes(sort.order as string) || !(sort.field || sort.by || sort.order)) return spec.data;
  const rows = materialize(spec.data);
  if (!rows || !isRecord(rows[0])) return spec.data;
  const dir = sort.order === "descending" ? -1 : 1;
  return rows.sort((a, b) => compare((a as Record<string, unknown>)[field], (b as Record<string, unknown>)[field]) * dir);
}

export function copySelection(value: Selection | null | undefined): Selection {
  return {
    points: value?.points ? value.points.map((point) => ({ series: point.series, index: point.index })) : [],
    series: value?.series ? value.series.slice() : [],
  };
}

function interactionOf(spec: InteractSpec): Record<string, unknown> | null {
  return isRecord(spec.interaction) ? spec.interaction : null;
}

export function navigatorOn(spec: InteractSpec): boolean {
  const nav = interactionOf(spec)?.navigator;
  return nav === true || isRecord(nav);
}

export function syncIdOf(spec: InteractSpec): string {
  const sync = interactionOf(spec)?.sync;
  return typeof sync === "string" && sync.trim() ? sync : "";
}

export function drillOf(spec: InteractSpec): Record<string, unknown> | null {
  const drill = interactionOf(spec)?.drilldown;
  return isRecord(drill) ? drill : null;
}

export function titleOf(spec: InteractSpec): string {
  return typeof spec.title === "string" && spec.title.trim() ? spec.title : "Overview";
}
