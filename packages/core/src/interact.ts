/**
 * Client interaction for a chart that is already in the DOM.
 * `@chartkitdev/core/all` does not import this module, so a static render stays the same string.
 * Adapters call `attach` after the SVG is mounted and `patchSvg` when the spec changes.
 */
import { formatValue } from "./format";
import { formatInstant, instantOf, namedZone } from "./timezone";
import { readTooltip, type TooltipDetail, type TooltipRender } from "./tooltip-slot";

export type { TooltipDetail, TooltipRender };
export { readTooltip, writeTooltip } from "./tooltip-slot";

export interface InteractSpec {
  type?: string;
  data?: unknown;
  encoding?: unknown;
  tooltip?: unknown;
  interaction?: unknown;
  animation?: unknown;
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
  update(spec: InteractSpec, markup?: string): void;
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
}

const TIP_TYPES = new Set(["line", "bar", "stacked-area", "scatter", "combo", "donut", "pie", "waterfall", "sunburst"]);

function arcChart(type: string | undefined): boolean {
  return type === "donut" || type === "pie" || type === "sunburst";
}
const lastMarkup = new WeakMap<object, string>();

/** Pixel centers for a category axis, or a numeric x scaled across the plot. Unsorted x is indexed. */
export function buildHoverIndex(
  count: number,
  left: number,
  width: number,
  values: ArrayLike<number> | null,
): HoverIndex {
  const xs = new Float64Array(count);
  if (!values) {
    const slot = count > 0 ? width / count : width;
    for (let i = 0; i < count; i++) xs[i] = left + slot * i + slot / 2;
    return { xs, order: null, pixels: xs, uniform: true, count, left, width };
  }
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < count; i++) {
    const value = Number(values[i]);
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const span = max - min || 1;
  for (let i = 0; i < count; i++) xs[i] = left + ((Number(values[i]) - min) / span) * width;
  let sorted = true;
  for (let i = 1; i < count; i++) {
    if (xs[i] < xs[i - 1]) {
      sorted = false;
      break;
    }
  }
  if (sorted) return { xs, order: null, pixels: xs, uniform: false, count, left, width };
  const order = new Int32Array(count);
  for (let i = 0; i < count; i++) order[i] = i;
  order.sort((a, b) => xs[a] - xs[b] || a - b);
  const sortedXs = new Float64Array(count);
  for (let i = 0; i < count; i++) sortedXs[i] = xs[order[i]];
  return { xs: sortedXs, order, pixels: xs, uniform: false, count, left, width };
}

/** Nearest precomputed x. Category axes are O(1). Numeric axes are a binary search. */
export function lookupIndex(index: HoverIndex, x: number): number {
  const n = index.count;
  if (n <= 1) return 0;
  if (index.uniform) {
    const slot = index.width / n;
    const i = Math.round((x - index.left) / slot - 0.5);
    return i < 0 ? 0 : i >= n ? n - 1 : i;
  }
  const xs = index.xs;
  if (x <= xs[0]) return index.order ? index.order[0] : 0;
  const last = n - 1;
  if (x >= xs[last]) return index.order ? index.order[last] : last;
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const pick = x - xs[lo] <= xs[hi] - x ? lo : hi;
  return index.order ? index.order[pick] : pick;
}

function exportFormats(spec: InteractSpec): string[] {
  const interaction = isRecord(spec.interaction) ? spec.interaction : undefined;
  const list = interaction && Array.isArray(interaction.export) ? interaction.export : [];
  const out: string[] = [];
  for (const item of list) if ((item === "png" || item === "svg" || item === "csv") && !out.includes(item)) out.push(item);
  return out;
}

/** Page a legend that drew more rows than legend.maxRows. */
function turnLegendPage(svg: SVGElement, target: Element | null): boolean {
  const hit = target?.closest?.("[data-ck-legend-page]");
  if (!hit || !svg.contains(hit)) return false;
  const group = hit.closest("[data-ck-legend]");
  if (!group) return false;
  const rows = Array.from(group.querySelectorAll("[data-ck-legend-row]"));
  const per = Number(group.getAttribute("data-ck-legend-max") || rows.length) || rows.length;
  const pages = Math.max(1, Math.ceil(rows.length / per));
  let page = Number(group.getAttribute("data-ck-legend-at") || 0);
  page = hit.getAttribute("data-ck-legend-page") === "next" ? Math.min(pages - 1, page + 1) : Math.max(0, page - 1);
  group.setAttribute("data-ck-legend-at", String(page));
  rows.forEach((row, index) => {
    (row as SVGElement).style.display = Math.floor(index / per) === page ? "" : "none";
  });
  const label = group.querySelector("[data-ck-legend-count]");
  if (label) label.textContent = `${page + 1}/${pages}`;
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fieldOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.field === "string") return value.field;
  return "";
}

interface Table {
  n: number;
  cell(field: string, index: number): unknown;
}

function openTable(data: unknown): Table {
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

function seriesOf(spec: InteractSpec, table: Table): SeriesMeta[] {
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
  return channels.length ? channels.map((c) => ({ name: c.title, field: c.field, format: c.format })) : [{ name: "value", field: "value" }];
}

function axisFormat(spec: InteractSpec, axis: "y" | "y2"): unknown {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const node = axes && isRecord(axes[axis]) ? axes[axis] : undefined;
  return node?.format;
}

function tooltipOn(spec: InteractSpec): boolean {
  if (isRecord(spec.interaction) && spec.interaction.hover === false) return false;
  const tooltip = spec.tooltip;
  if (tooltip === false || (isRecord(tooltip) && tooltip.show === false)) return false;
  return tooltip === true || isRecord(tooltip) || TIP_TYPES.has(spec.type ?? "");
}

function crosshairOn(spec: InteractSpec): boolean {
  return tooltipOn(spec) && !arcChart(spec.type) && spec.type !== "waterfall" && !(isRecord(spec.tooltip) && spec.tooltip.crosshair === false);
}

function tipFields(spec: InteractSpec): { field: string; title?: string; format?: unknown }[] | null {
  const tooltip = spec.tooltip;
  if (!isRecord(tooltip) || !Array.isArray(tooltip.fields)) return null;
  const out: { field: string; title?: string; format?: unknown }[] = [];
  for (let i = 0; i < tooltip.fields.length; i++) {
    const item = tooltip.fields[i];
    if (typeof item === "string") {
      if (item) out.push({ field: item });
    } else if (isRecord(item) && typeof item.field === "string" && item.field) {
      out.push({
        field: item.field,
        title: typeof item.title === "string" ? item.title : undefined,
        format: item.format,
      });
    }
  }
  return out.length ? out : null;
}

function tipSide(spec: InteractSpec): number {
  const place = isRecord(spec.tooltip) ? spec.tooltip.position : 0;
  return place === "bottom" ? 2 : place === "left" ? 3 : place === "right" ? 4 : place === "top" ? 1 : 0;
}

function zoomMode(spec: InteractSpec): "none" | "x" | "xy" {
  const zoom = isRecord(spec.interaction) ? spec.interaction.zoom : 0;
  return zoom === "x" || zoom === "xy" || zoom === "none" ? zoom : spec.type === "candlestick" ? "x" : "none";
}

function reducedMotion(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function durationMs(spec: InteractSpec, count: number): number {
  const animation = spec.animation;
  if (animation == null || animation === false || count > 2000 || reducedMotion()) return 0;
  if (animation === true) return 400;
  if (!isRecord(animation) || animation.duration === 0) return 0;
  return typeof animation.duration === "number" ? animation.duration : 400;
}

function esc(value: string): string {
  return value.replace(/[&<>"]/g, (ch) => (ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : "&quot;"));
}

function ensureCss(): void {
  if (typeof document === "undefined" || document.getElementById("ck-interact-style")) return;
  const style = document.createElement("style");
  style.id = "ck-interact-style";
  style.textContent =
    ".ck-tip{position:absolute;z-index:5;pointer-events:none;padding:8px 10px;border-radius:10px;font:12px/1.35 ui-sans-serif,system-ui,sans-serif;background:light-dark(#fff,#2c2c2e);color:light-dark(#1d1d1f,#f5f5f7);box-shadow:0 8px 24px #0003;font-variant-numeric:tabular-nums}.ck-row{display:flex;align-items:center;gap:6px}.ck-tip b{margin-left:auto;padding-left:12px}.ck-tip i{width:8px;height:8px;border-radius:2px;flex:none}.ck-xhair{stroke:light-dark(#0006,#fff8);stroke-dasharray:3 3}.ck-xlabel{font:11px ui-sans-serif,system-ui,sans-serif;fill:light-dark(#1d1d1f,#f5f5f7);stroke:light-dark(#fff,#1c1c1e);stroke-width:3px;paint-order:stroke;pointer-events:none}.ck-pick{stroke:var(--ck-selected,light-dark(#1d1d1f,#f5f5f7));stroke-width:2}[data-ck-dim]{opacity:var(--ck-dim,.32)}.ck-clip{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}";
  document.head.append(style);
}

interface Box {
  l: number;
  t: number;
  w: number;
  h: number;
}

function plotBox(svg: SVGSVGElement): Box {
  const rect = svg.querySelector("clipPath rect");
  if (rect) {
    const num = (name: string) => Number(rect.getAttribute(name)) || 0;
    return { l: num("x"), t: num("y"), w: num("width") || 1, h: num("height") || 1 };
  }
  const parts = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
  return { l: 0, t: 0, w: parts[2] || 640, h: parts[3] || 240 };
}

function viewPoint(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  const parts = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
  const vw = parts[2] || rect.width || 1;
  const vh = parts[3] || rect.height || 1;
  const rw = rect.width || vw;
  const rh = rect.height || vh;
  return {
    x: ((clientX - rect.left) / rw) * vw,
    y: ((clientY - rect.top) / rh) * vh,
  };
}

function fmt(value: unknown, format: unknown, locale: string): string {
  if (typeof value === "number" && Number.isFinite(value)) return formatValue(value, format ?? "number", locale);
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return formatValue(Number(value), format ?? "number", locale);
  }
  return value == null ? "" : String(value);
}

function dec(value: string): string {
  return value.replace(/&amp;|&lt;|&gt;|&quot;/g, (ch) => (ch[1] === "a" ? "&" : ch[1] === "l" ? "<" : ch[1] === "g" ? ">" : "\""));
}

function patchRoot(el: Element, attrs: string): void {
  const keep = new Set<string>(["tabindex", "xmlns"]);
  const re = /([\w:-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(attrs))) {
    if (match[1] === "xmlns") continue;
    keep.add(match[1]);
    const value = dec(match[2]);
    if (value.length > 80 || el.getAttribute(match[1]) !== value) el.setAttribute(match[1], value);
  }
  for (let i = el.attributes.length - 1; i >= 0; i--) if (!keep.has(el.attributes[i].name)) el.removeAttribute(el.attributes[i].name);
}

function putText(el: Element, text: string): void {
  if (!el.firstElementChild && el.textContent !== text) el.textContent = text;
}

/** Same tags, in order: copy attributes and text. False when the shape changed, before any write. */
function paint(svg: Element, markup: string): boolean {
  const nodes = svg.querySelectorAll("*");
  let opens = 0;
  const need = nodes.length + 1;
  for (let p = 0; p < markup.length; p++) {
    if (markup.charCodeAt(p) === 60 && markup.charCodeAt(p + 1) !== 47 && ++opens > need) return false;
  }
  if (opens !== need) return false;
  let n = 0;
  let el: Element = svg;
  let i = 0;
  while (i < markup.length) {
    if (markup.charCodeAt(i) !== 60) {
      const j = markup.indexOf("<", i);
      putText(el, dec(markup.slice(i, j < 0 ? markup.length : j)));
      if (j < 0) break;
      i = j;
      continue;
    }
    if (markup.charCodeAt(i + 1) === 47) {
      i = markup.indexOf(">", i) + 1;
      continue;
    }
    const gt = markup.indexOf(">", i);
    if (gt < 0) return false;
    const head = markup.slice(i + 1, gt);
    const cut = head.search(/[\s/]/);
    const target = n ? nodes[n - 1] : svg;
    if (!target || target.localName !== (cut < 0 ? head : head.slice(0, cut))) return false;
    el = target;
    patchRoot(el, head);
    if (markup.charCodeAt(gt + 1) === 60 || gt + 1 >= markup.length) putText(el, "");
    n++;
    i = gt + 1;
  }
  return n === need;
}

function fade(el: Element, ms: number, from = "0.45"): void {
  if (ms <= 0) return;
  const node = el as SVGSVGElement;
  node.style.transition = "none";
  node.style.opacity = from;
  requestAnimationFrame(() => {
    node.style.transition = `opacity ${ms}ms ease-out`;
    node.style.opacity = "1";
  });
}

/**
 * Write `markup` into the existing `<svg>`. When the tags and attribute names
 * still match, path `d`, tick text, positions, and aria/alt update in place.
 * A structure change, or a host without an svg, replaces the markup.
 * The svg node keeps its listeners. Crosshair and brush stay mounted.
 */
export function patchSvg(host: PatchHost, markup: string, duration = 0): void {
  if (lastMarkup.get(host) === markup) return;
  const current = host.querySelector?.("svg");
  const open = markup.startsWith("<svg") ? markup.indexOf(">") : -1;
  const close = open > 0 ? markup.lastIndexOf("</svg>") : -1;
  if (!current || open < 0 || close < open) {
    if (host.innerHTML !== markup) host.innerHTML = markup;
    lastMarkup.set(host, markup);
    return;
  }
  const held: Element[] = [];
  const keep = current.querySelectorAll("[data-ck-crosshair],[data-ck-brush]");
  for (let i = 0; i < keep.length; i++) held.push(keep[i]);
  for (let i = 0; i < held.length; i++) held[i].remove();
  if (!paint(current, markup)) {
    patchRoot(current, markup.slice(4, open));
    current.innerHTML = markup.slice(open + 1, close);
  }
  for (let i = 0; i < held.length; i++) current.append(held[i]);
  fade(current, duration);
  lastMarkup.set(host, markup);
}

function legendSwatch(node: Element | null): boolean {
  if (!node) return false;
  if (node.localName === "rect") {
    const w = Number(node.getAttribute("width"));
    const h = Number(node.getAttribute("height"));
    return w > 0 && w <= 12 && h > 0 && h <= 12;
  }
  if (node.localName === "circle") {
    const r = Number(node.getAttribute("r"));
    return r > 0 && r <= 6;
  }
  const d = node.localName === "path" ? node.getAttribute("d") || "" : "";
  return d.length > 0 && d.length < 80 && !node.hasAttribute("stroke-dasharray");
}

function legendItems(svg: SVGSVGElement): { name: string; text: SVGTextElement; swatch: Element | null }[] {
  const out: { name: string; text: SVGTextElement; swatch: Element | null }[] = [];
  const texts = svg.querySelectorAll("text");
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i] as SVGTextElement;
    const prev = text.previousElementSibling;
    if (!legendSwatch(prev)) continue;
    out.push({ name: text.textContent ?? "", text, swatch: prev });
  }
  return out;
}

function numericValues(spec: InteractSpec, table: Table): Float64Array | null {
  if (spec.type === "bar" || spec.type === "combo" || spec.type === "heatmap" || arcChart(spec.type)) return null;
  const enc = isRecord(spec.encoding) ? spec.encoding : {};
  const field = fieldOf(enc.x);
  const declared = isRecord(enc.x) ? enc.x.type : undefined;
  if (declared === "nominal" || declared === "ordinal") return null;
  if (!field) {
    if (!(Array.isArray(spec.data) && (spec.data.length === 0 || typeof spec.data[0] === "number"))) return null;
    const values = new Float64Array(table.n);
    for (let i = 0; i < table.n; i++) values[i] = i;
    return values;
  }
  if (!table.n) return null;
  const data = spec.data;
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

function materialize(data: unknown): unknown[] | null {
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

function copySelection(value: Selection | null | undefined): Selection {
  return {
    points: value?.points ? value.points.map((point) => ({ series: point.series, index: point.index })) : [],
    series: value?.series ? value.series.slice() : [],
  };
}

/**
 * Listen on `host` for tooltip, crosshair, legend toggle, clicks, selection,
 * x zoom/pan/brush, enter/update motion, keyboard focus, and an optional data table.
 * Tears down with `destroy`. Does nothing when the spec leaves interaction off.
 */
export function attach(host: Element, spec: InteractSpec, options: AttachOptions): Controller {
  const found = host.querySelector?.("svg");
  if (!(found instanceof SVGSVGElement) || typeof document === "undefined") {
    return { update() {}, setSelection() {}, destroy() {}, ready: Promise.resolve() };
  }
  const svg: SVGSVGElement = found;
  ensureCss();
  host.setAttribute("data-ck-interact", "1");
  if (getComputedStyle(host).position === "static") (host as HTMLElement).style.position = "relative";

  let base = spec;
  let table = openTable(spec.data);
  let series = seriesOf(spec, table);
  let n = table.n;
  let lo = 0;
  let hi = Math.max(0, n - 1);
  const hidden = new Set<string>();
  let alive = true;
  let focus = 0;
  let hover = buildHoverIndex(0, 0, 1, null);
  let box: Box = { l: 0, t: 0, w: 1, h: 1 };
  let colors = new Map<string, string>();
  const locale = () => (typeof base.locale === "string" ? base.locale : "en-US");
  const xField = () => fieldOf(isRecord(base.encoding) ? base.encoding.x : undefined);

  const tip = document.createElement("div");
  tip.className = "ck-tip";
  tip.setAttribute("data-ck-tip", "");
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  const live = document.createElement("div");
  live.className = "ck-clip";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("data-ck-live", "");
  const showTip = tooltipOn(spec);
  const showCross = crosshairOn(spec);
  const legend = isRecord(spec.legend) && spec.legend.interactive === true;
  const keys = isRecord(spec.a11y) && spec.a11y.keyboard === true;
  const dataTable = isRecord(spec.a11y) && spec.a11y.dataTable === true;
  const zoom = zoomMode(spec);
  const zooming = zoom !== "none";
  const pan = zooming && !(isRecord(spec.interaction) && spec.interaction.pan === false);
  const brush = isRecord(spec.interaction) && spec.interaction.brush === "x";
  const mode = isRecord(spec.tooltip) && spec.tooltip.mode === "nearest" ? "nearest" : "index";
  const selMode = () => {
    const value = isRecord(base.interaction) ? base.interaction.select : 0;
    return value === "point" || value === "series" ? value : 0;
  };
  let picked = copySelection(options.selection);
  let locked = options.selection !== undefined;
  let lit = "";

  if (showTip) host.append(tip);
  if (keys || selMode()) svg.setAttribute("tabindex", "0");
  if (keys) host.append(live);
  const offs: (() => void)[] = [];
  const on = (target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    offs.push(() => target.removeEventListener(type, fn, opts));
  };

  function xText(index: number): string {
    const field = xField();
    const raw = field ? table.cell(field, index) : index;
    const format = isRecord(base.encoding) && isRecord(base.encoding.x) ? base.encoding.x.format : undefined;
    const zone = namedZone(base.timezone);
    if (zone) {
      const ms = instantOf(raw);
      if (ms !== null) return format !== undefined ? formatValue(ms, format, locale(), zone) : formatInstant(ms, locale(), zone);
    }
    if (typeof raw === "number") return formatValue(raw, format ?? "number", locale());
    return raw == null ? String(index) : String(raw);
  }

  function inkAt(name: string, index: number): string | null {
    const nodes = svg.querySelectorAll("[data-ck-i]");
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node || node.getAttribute("data-ck-i") !== String(index)) continue;
      const called = node.getAttribute("data-ck-name");
      if (called !== name && owner(node) !== name) continue;
      const fill = node.getAttribute("fill");
      const stroke = node.getAttribute("stroke");
      const ink = fill && fill !== "none" ? fill : stroke && stroke !== "none" ? stroke : "";
      if (ink) return legendPaint(ink, 0);
    }
    return null;
  }

  function entriesAt(index: number, pointerY: number | null): { name: string; text: string; color: string }[] {
    const chosen = tipFields(base);
    const grouped = !chosen && series.some((item) => item.match) && !arcChart(base.type);
    const rows: { name: string; text: string; color: string; raw: number }[] = [];
    const yFormat = axisFormat(base, "y");
    const push = (name: string, raw: unknown, color: string, format?: unknown) => {
      if (raw == null || raw === "") return;
      const num = typeof raw === "number" ? raw : Number(raw);
      rows.push({
        name,
        text: fmt(raw, format ?? series.find((s) => s.name === name)?.format ?? yFormat, locale()),
        color,
        raw: Number.isFinite(num) ? num : 0,
      });
    };
    if (chosen) {
      for (let i = 0; i < chosen.length; i++) {
        const item = chosen[i];
        const known = series.find((s) => s.field === item.field || s.name === item.field);
        if (known && hidden.has(known.name)) continue;
        push(
          item.title || known?.name || item.field,
          table.cell(item.field, index),
          known ? colorFor(known.name, series.indexOf(known)) : "transparent",
          item.format ?? known?.format,
        );
      }
      return tint(rows, index);
    }
    if (!grouped) {
      for (let i = 0; i < series.length; i++) {
        const item = series[i];
        if (!hidden.has(item.name)) push(item.name, table.cell(item.field, index), colorFor(item.name, i));
      }
    } else {
      const key = String(table.cell(xField(), index) ?? index);
      for (let i = 0; i < n; i++) {
        if (String(table.cell(xField(), i) ?? i) !== key) continue;
        const name = String(table.cell(series[0]?.match ?? "", i) ?? "");
        if (!name || hidden.has(name)) continue;
        const item = series.find((s) => s.name === name);
        push(name, table.cell(item?.field || series[0]?.field || "", i), colorFor(name, rows.length));
      }
    }
    let best = 0;
    if (mode === "nearest" && rows.length > 1 && pointerY != null) {
      const fraction = box.h ? (pointerY - box.t) / box.h : 0;
      let min = Infinity;
      let max = -Infinity;
      for (const row of rows) {
        if (row.raw < min) min = row.raw;
        if (row.raw > max) max = row.raw;
      }
      const span = max - min || 1;
      let bestDist = Infinity;
      for (let i = 0; i < rows.length; i++) {
        const dist = Math.abs(1 - (rows[i].raw - min) / span - fraction);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      const picked = rows[best];
      return picked ? tint([picked], index) : [];
    }
    return tint(rows, index);
  }

  function tint(
    list: { name: string; text: string; color: string; raw: number }[],
    index: number,
  ): { name: string; text: string; color: string; raw: number }[] {
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      if (!row) continue;
      const ink = inkAt(row.name, index);
      if (ink) row.color = ink;
    }
    return list;
  }

  /** Legend fill for a series name, or the paint that names the same `--ck-series-N`. */
  function colorFor(name: string, index: number): string {
    const known = colors.get(name);
    if (known) return known;
    return paintAt(index);
  }

  function paintAt(index: number): string {
    const fills = [...colors.values()];
    return fills[index] || "light-dark(#007aff,#0a84ff)";
  }

  function legendPaint(paint: string | null, index: number): string {
    const id = paint ? /--ck-(?:line|series)-(\d+)/.exec(paint) : null;
    if (id) {
      const want = `--ck-series-${id[1]}`;
      for (const fill of colors.values()) if (fill.includes(want)) return fill;
    }
    if (paint && colors.size === 0) return paint;
    return paintAt(index);
  }

  function refreshColors(): void {
    colors = new Map();
    for (const item of legendItems(svg)) {
      const fill = item.swatch?.getAttribute("fill");
      const ink = fill && fill !== "none" ? fill : item.swatch?.getAttribute("stroke");
      if (ink) colors.set(item.name, ink);
    }
  }

  function placeTip(
    clientX: number,
    clientY: number,
    title: string,
    rows: { name: string; text: string; color: string }[],
    marks: { x: number; y: number }[],
    index = -1,
  ): void {
    if (!showTip) return;
    const custom = options.tooltip ?? readTooltip(host);
    if (custom) {
      const body = custom({ title, index, x: title, rows });
      tip.replaceChildren();
      if (body == null || body === "") {
        tip.hidden = true;
        return;
      }
      if (typeof body === "string") tip.innerHTML = body;
      else tip.append(body);
    } else {
      tip.innerHTML =
        (title ? `<div>${esc(title)}</div>` : "") +
        rows.map((row) => `<div class="ck-row"><i style="background:${row.color}"></i>${esc(row.name)}<b>${esc(row.text)}</b></div>`).join("");
    }
    tip.hidden = false;
    const bounds = host.getBoundingClientRect();
    const rect = svg.getBoundingClientRect();
    const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    const sx = (rect.width || vb[2] || 1) / (vb[2] || rect.width || 1);
    const sy = (rect.height || vb[3] || 1) / (vb[3] || rect.height || 1);
    const cluster = marks.length > 0 ? marks : [viewPoint(svg, clientX, clientY)];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < cluster.length; i++) {
      const lx = rect.left + cluster[i].x * sx - bounds.left;
      const ly = rect.top + cluster[i].y * sy - bounds.top;
      if (lx < minX) minX = lx;
      if (lx > maxX) maxX = lx;
      if (ly < minY) minY = ly;
      if (ly > maxY) maxY = ly;
    }
    const width = tip.offsetWidth || 160;
    const height = tip.offsetHeight || 48;
    const gap = 14;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const place = tipSide(base);
    let top = minY - height - gap;
    let left = midX - width / 2;
    if (place === 2) top = maxY + gap;
    else if (place > 2) {
      left = place === 3 ? minX - width - gap : maxX + gap;
      top = midY - height / 2;
    } else if (!place) {
      if (top < 4) top = maxY + gap;
      if (top + height > bounds.height - 4) top = Math.max(4, bounds.height - height - 4);
      left = midX + gap;
      if (left + width > bounds.width - 4) left = Math.max(4, midX - width - gap);
      if (left < maxX && left + width > minX && top < maxY && top + height > minY && midX - width - gap >= 4) left = midX - width - gap;
    }
    if (place && bounds.width > width + 8 && bounds.height > height + 8) {
      left = Math.max(4, Math.min(left, bounds.width - width - 4));
      top = Math.max(4, Math.min(top, bounds.height - height - 4));
    }
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function moveCross(x: number, title: string): void {
    if (!showCross) return;
    let line = svg.querySelector("[data-ck-crosshair]");
    if (!line) {
      svg.insertAdjacentHTML("beforeend", `<line data-ck-crosshair class="ck-xhair"/>`);
      line = svg.lastElementChild as Element;
    }
    line.setAttribute("x1", String(x));
    line.setAttribute("x2", String(x));
    line.setAttribute("y1", String(box.t));
    line.setAttribute("y2", String(box.t + box.h));
    const showLabel = isRecord(base.tooltip) && base.tooltip.crosshairLabel === true;
    let label = svg.querySelector("[data-ck-xlabel]");
    if (!showLabel) {
      label?.remove();
      return;
    }
    if (!label) {
      svg.insertAdjacentHTML("beforeend", `<text data-ck-xlabel class="ck-xlabel"/>`);
      label = svg.lastElementChild as Element;
    }
    const y = tipSide(base) === 2 ? box.t + 14 : box.t + box.h - 6;
    const pad = 36;
    const anchor = x < box.l + pad ? "start" : x > box.l + box.w - pad ? "end" : "middle";
    const lx = anchor === "start" ? x + 4 : anchor === "end" ? x - 4 : x;
    label.setAttribute("x", String(Math.round(lx)));
    label.setAttribute("y", String(Math.round(y)));
    label.setAttribute("text-anchor", anchor);
    label.textContent = title;
  }

  function hideHover(): void {
    tip.hidden = true;
    svg.querySelector("[data-ck-crosshair]")?.remove();
    svg.querySelector("[data-ck-xlabel]")?.remove();
    clearDots();
  }

  function clearDots(): void {
    const nodes = svg.querySelectorAll("[data-ck-dot]");
    for (let i = 0; i < nodes.length; i++) nodes[i].remove();
  }

  function addDot(x: number, y: number, fill: string): { x: number; y: number } {
    const cx = String(Math.round(x * 100) / 100);
    const cy = String(Math.round(y * 100) / 100);
    svg.insertAdjacentHTML("beforeend", `<circle data-ck-dot cx="${cx}" cy="${cy}" r="3.5" fill="${esc(fill)}" stroke="light-dark(#fff,#1c1c1e)" stroke-width="1.5" pointer-events="none"/>`);
    return { x, y };
  }

  function yOnPath(d: string, x: number): number | null {
    const t = d.split(/[\s,]+/);
    let c = "", x0 = 0, y0 = 0;
    for (let i = 0; i < t.length; i++) {
      const p = t[i];
      if (p === "Z") c = "";
      else if (p === "M" || p === "L" || p === "C") c = p;
      else if (c === "M") {
        x0 = +p;
        y0 = +t[++i];
      } else if (c === "L" || c === "C") {
        const curve = c === "C";
        const x1 = curve ? +t[i + 4] : +p;
        const y1 = curve ? +t[i + 5] : +t[++i];
        if (curve) i += 5;
        if (x1 === x1 && y1 === y1 && (x - x0) * (x - x1) <= 0) {
          return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
        }
        x0 = x1;
        y0 = y1;
      }
    }
    return null;
  }

  function dataDotY(path: Element, index: number): number | null {
    const c = (path as SVGElement).dataset.ckYs?.split(",");
    if (!c) return null;
    const s = +(table.cell(series[+c[4]]?.field || "", index) as number);
    const y = +c[0] + ((s - +c[2]) * (+c[1] - +c[0])) / (+c[3] - +c[2]);
    return Number.isFinite(y) ? y : null;
  }

  function placeDots(snapped: number, horizontal: boolean, index: number): { x: number; y: number }[] {
    clearDots();
    if (arcChart(base.type) || base.type === "heatmap") return [];
    const marks: { x: number; y: number }[] = [];
    if (!horizontal) {
      const paths = svg.querySelectorAll("path");
      let seen = 0;
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        if (path.closest("defs,clipPath")) continue;
        const stroke = path.getAttribute("stroke");
        if (!stroke || stroke === "none") continue;
        const d = path.getAttribute("d");
        if (!d) continue;
        const y = dataDotY(path, index) ?? yOnPath(d, snapped);
        if (y == null) continue;
        marks.push(addDot(snapped, y, legendPaint(stroke, seen)));
        seen += 1;
      }
    }
    const slot = hover.uniform ? hover.width / Math.max(1, hover.count) : Math.max(24, box.w / 8);
    const tol = Math.max(slot / 2, 8);
    let best = Infinity;
    const hits: { x: number; y: number; fill: string | null }[] = [];
    const rects = svg.querySelectorAll("rect");
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (rect.closest("defs,clipPath")) continue;
      const x = +(rect.getAttribute("x") || 0);
      const y = +(rect.getAttribute("y") || 0);
      const w = +(rect.getAttribute("width") || 0);
      const h = +(rect.getAttribute("height") || 0);
      if (!(w > 12) || !(h > 0) || w > box.w * 0.85) continue;
      const dist = Math.abs((horizontal ? y + h / 2 : x + w / 2) - snapped);
      if (dist > tol) continue;
      const dot = { x: horizontal ? x + w : x + w / 2, y: horizontal ? y + h / 2 : y, fill: rect.getAttribute("fill") };
      if (dist < best - 0.5) {
        best = dist;
        hits.length = 0;
      }
      if (dist <= best + 0.5) hits.push(dot);
    }
    for (let i = 0; i < hits.length; i++) marks.push(addDot(hits[i].x, hits[i].y, legendPaint(hits[i].fill, marks.length)));
    if (marks.length === 0) {
      const circles = svg.querySelectorAll("circle");
      const nearest = new Map<string, { x: number; y: number; dist: number; fill: string }>();
      for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];
        if (circle.getAttribute("data-ck-dot")) continue;
        const cx = Number(circle.getAttribute("cx"));
        const cy = Number(circle.getAttribute("cy"));
        const dist = Math.abs((horizontal ? cy : cx) - snapped);
        if (dist > tol) continue;
        const fill = circle.getAttribute("fill") || "";
        const prev = nearest.get(fill);
        if (!prev || dist < prev.dist) nearest.set(fill, { x: cx, y: cy, dist, fill });
      }
      let seen = 0;
      for (const point of nearest.values()) {
        marks.push(addDot(point.x, point.y, legendPaint(point.fill, seen)));
        seen += 1;
      }
    }
    return marks;
  }

  let dirty = false;
  let ticket = 0;
  function rebuild(): void {
    dirty = false;
    const viewN = Math.max(0, hi - lo + 1);
    box = plotBox(svg);
    const values = numericValues(base, table);
    const slice = values && viewN ? (lo === 0 && values.length === viewN ? values : values.subarray(lo, hi + 1)) : null;
    hover = buildHoverIndex(viewN, box.l, box.w, slice);
    refreshColors();
  }
  function arm(now?: 1): void {
    const mine = ++ticket;
    if (now) {
      if (dirty) rebuild();
      return;
    }
    dirty = true;
    const go = () => mine === ticket && dirty && rebuild();
    const ric = globalThis.requestIdleCallback;
    ric ? ric(go, { timeout: 400 }) : setTimeout(go);
  }

  function crossX(local: number): number {
    arm(1);
    return hover.pixels[local] ?? box.l;
  }

  function dim(): void {
    if (!legend) return;
    svg.querySelectorAll("[data-ck-hidden-key]").forEach((node) => node.remove());
    const items = legendItems(svg);
    for (const item of items) {
      const off = hidden.has(item.name);
      item.text.setAttribute("opacity", off ? "0.35" : "1");
      item.swatch?.setAttribute("opacity", off ? "0.35" : "1");
      item.text.style.cursor = "pointer";
    }
    if (!arcChart(base.type)) return;
    const visible = new Set(items.map((item) => item.name));
    const last = items[items.length - 1];
    let y = last ? Number(last.text.getAttribute("y")) + 20 : 28;
    const x = last?.swatch ? Number(last.swatch.getAttribute("x")) : 8;
    for (const item of series) {
      if (!hidden.has(item.name) || visible.has(item.name)) continue;
      const name = esc(item.name);
      svg.insertAdjacentHTML("beforeend", `<rect data-ck-hidden-key="${name}" x="${x}" y="${y - 9}" width="10" height="10" rx="2" fill="var(--ck-series-1, #007aff)" opacity="0.35"/><text data-ck-hidden-key="${name}" x="${x + 16}" y="${y}" font-size="12" opacity="0.35">${name}</text>`);
      (svg.lastElementChild as SVGTextElement).style.cursor = "pointer";
      y += 20;
    }
  }

  function paintTable(): void {
    const tableEl = dataTable ? host.querySelector("table.ck-table") : null;
    if (!tableEl) return;
    const cap = Math.min(n, 1000);
    const head = [`<th>${esc(xField() || "x")}</th>`].concat(series.map((item) => `<th>${esc(item.name)}</th>`)).join("");
    const body: string[] = [];
    for (let i = 0; i < cap; i++) {
      const cells = [`<td>${esc(xText(i))}</td>`];
      for (const item of series) {
        if (item.match && String(table.cell(item.match, i)) !== item.name && arcChart(base.type)) continue;
        cells.push(`<td>${esc(fmt(table.cell(item.field, i), item.format, locale()))}</td>`);
      }
      body.push(`<tr>${cells.join("")}</tr>`);
    }
    const note = n > cap ? `<caption>Showing ${cap} of ${n} rows.</caption>` : "";
    tableEl.innerHTML = `${note}<thead><tr>${head}</tr></thead><tbody>${body.join("")}</tbody>`;
  }

  function project(): InteractSpec {
    const rows = materialize(base.data);
    if (!rows) return base;
    const ranged = lo > 0 || hi < n - 1;
    let data = ranged ? rows.slice(lo, hi + 1) : rows;
    if (hidden.size > 0 && data.length && isRecord(data[0])) {
      const drop = arcChart(base.type);
      data = data.flatMap((row) => {
        const record = row as Record<string, unknown>;
        if (drop && series.some((item) => hidden.has(item.name) && item.match && String(record[item.match]) === item.name)) return [];
        if (!series.some((item) => hidden.has(item.name) && !item.match)) return [record];
        const copy = { ...record };
        for (const item of series) if (hidden.has(item.name) && !item.match) copy[item.field] = null;
        return [copy];
      });
    } else if (!ranged && hidden.size === 0) return base;
    return { ...base, data };
  }

  function redraw(markup?: string): void {
    const partial = lo > 0 || hi < n - 1 || hidden.size > 0;
    const ms = durationMs(base, n);
    const next = partial ? options.render(project()) : markup ?? options.render(base);
    patchSvg(host as PatchHost, next, ms);
    if (keys || selMode()) svg.setAttribute("tabindex", "0");
    dim();
    paintPick();
    arm();
  }

  function choose(next: Selection): void {
    if (!locked) picked = next;
    paintPick();
    emit("selectionchange", next);
  }

  function addKey(event: MouseEvent | KeyboardEvent): boolean {
    return event.shiftKey || event.metaKey || event.ctrlKey;
  }

  function togglePoint(name: string, index: number, add: boolean): void {
    const has = picked.points.some((point) => point.series === name && point.index === index);
    const points = add
      ? has
        ? picked.points.filter((point) => point.series !== name || point.index !== index)
        : picked.points.concat({ series: name, index })
      : has && picked.points.length === 1
        ? []
        : [{ series: name, index }];
    choose({ points, series: [] });
  }

  function toggleSeries(name: string, add: boolean): void {
    const has = picked.series.includes(name);
    const names = add ? (has ? picked.series.filter((item) => item !== name) : picked.series.concat(name)) : has && picked.series.length === 1 ? [] : [name];
    choose({ points: [], series: names });
  }

  function rowAt(index: number): unknown {
    const data = base.data;
    if (Array.isArray(data) || ArrayBuffer.isView(data)) return (data as ArrayLike<unknown>)[index];
    if (!isRecord(data) || !isRecord(data.columns) || index < 0) return null;
    const columns = data.columns as Record<string, ArrayLike<unknown>>;
    const row: Record<string, unknown> = {};
    for (const key of Object.keys(columns)) row[key] = columns[key][index];
    return row;
  }

  function payload(name: string, index: number, color?: string): ClickDetail {
    const item = series.find((entry) => entry.name === name);
    const field = item?.field ?? "";
    const x = index < 0 ? null : xField() ? table.cell(xField(), index) : index;
    let y: unknown = null;
    if (item && index >= 0) {
      if (!item.match) y = table.cell(field, index);
      else {
        for (let i = 0; i < n; i++) {
          if (String(table.cell(item.match, i)) !== name) continue;
          y = table.cell(field, i);
          if (!xField() || table.cell(xField(), i) === x) break;
        }
      }
    }
    return { series: name, datum: y, index, x, y, value: y, row: index < 0 ? null : rowAt(index), ...(color ? { color } : {}) };
  }

  function legendTarget(target: Element | null): { name: string; index: number } | null {
    const text =
      target?.closest?.("text") ||
      (target?.localName === "rect" && target.getAttribute("width") === "10" ? target.nextElementSibling : null);
    if (!text) return null;
    const item = legendItems(svg).find((entry) => entry.text === text);
    if (!item) return null;
    const index = series.findIndex((entry) => entry.name === item.name);
    return index < 0 ? null : { name: item.name, index };
  }

  function owner(node: Element): string {
    const named = node.getAttribute("data-ck-name");
    if (named) return named;
    const ys = node.getAttribute("data-ck-ys");
    if (ys) {
      const index = +ys.slice(ys.lastIndexOf(",") + 1);
      if (series[index]) return series[index].name;
    }
    const stroke = node.getAttribute("stroke");
    const paint = stroke && stroke !== "none" ? stroke : node.getAttribute("fill");
    if (!paint || paint === "none") return "";
    for (const [name, fill] of colors) if (fill === paint) return name;
    const id = /--ck-(?:line|series)-(\d+)/.exec(paint);
    if (!id) return "";
    const want = "--ck-series-" + id[1];
    for (const [name, fill] of colors) if (fill.includes(want)) return name;
    return series[+id[1] - 1]?.name ?? "";
  }

  function indexAt(clientX: number, clientY: number): number {
    arm(1);
    const point = viewPoint(svg, clientX, clientY);
    const horizontal = isRecord(base.mark) && base.mark.orientation === "horizontal";
    return Math.min(n - 1, Math.max(0, lo + lookupIndex(hover, horizontal ? point.y : point.x)));
  }

  function nodeInk(node: Element): string | undefined {
    const fill = node.getAttribute("fill");
    if (fill && fill !== "none") return fill;
    const stroke = node.getAttribute("stroke");
    if (stroke && stroke !== "none") return stroke;
    return undefined;
  }

  function hitOf(event: MouseEvent): { kind: "point" | "series"; name: string; index: number; color?: string } | null {
    const node = (event.target as Element | null)?.closest?.("path,circle,rect");
    if (!node || node.closest("defs,clipPath")) return null;
    if (node.hasAttribute("data-ck-dot") || node.hasAttribute("data-ck-pick")) return null;
    if (node.localName === "rect" && (node.getAttribute("width") === "10" || node.getAttribute("width") === "100%")) return null;
    let kind: "point" | "series" = node.localName === "path" ? "series" : "point";
    let name = "";
    let index = 0;
    if (node.localName === "path" && node.hasAttribute("aria-label") && arcChart(base.type)) {
      const named = node.getAttribute("data-ck-name");
      const label = node.getAttribute("aria-label") || "";
      const cut = label.indexOf(": ");
      name = named || (cut >= 0 ? label.slice(0, cut) : label).trim();
      index = Math.max(0, series.findIndex((entry) => entry.name === name));
    } else {
      name = owner(node);
      const raw = node.getAttribute("data-ck-i");
      index = raw && !raw.includes(" ") ? +raw : indexAt(event.clientX, event.clientY);
    }
    if (!name) return null;
    const picking = selMode();
    if (picking === "point") kind = "point";
    else if (picking === "series") kind = "series";
    return { kind, name, index, color: nodeInk(node) };
  }

  function paintPick(): void {
    arm(1);
    refreshColors();
    const picking = selMode();
    const hot = lit ? [lit] : picking === "series" ? picked.series : picking === "point" ? picked.points.map((point) => point.series) : [];
    const on = hot.length > 0;
    const nodes = svg.querySelectorAll("path,circle,rect");
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.closest("defs,clipPath") || node.hasAttribute("data-ck-dot") || node.hasAttribute("data-ck-pick") || node.hasAttribute("data-ck-crosshair")) continue;
      if (node.localName === "rect" && (node.getAttribute("width") === "10" || node.getAttribute("width") === "100%")) continue;
      const name = owner(node);
      const raw = node.getAttribute("data-ck-i");
      const one = raw && !raw.includes(" ") ? +raw : -1;
      const dimmed =
        !name || !on
          ? false
          : lit
            ? name !== lit
            : picking === "series"
              ? !picked.series.includes(name)
              : picking === "point"
                ? one >= 0
                  ? !picked.points.some((point) => point.series === name && point.index === one)
                  : !hot.includes(name)
                : false;
      if (dimmed) node.setAttribute("data-ck-dim", "");
      else node.removeAttribute("data-ck-dim");
    }
    const items = legendItems(svg);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (hidden.has(item.name)) continue;
      const dimmed = on && !hot.includes(item.name);
      if (dimmed) {
        item.text.setAttribute("data-ck-dim", "");
        item.swatch?.setAttribute("data-ck-dim", "");
      } else {
        item.text.removeAttribute("data-ck-dim");
        item.swatch?.removeAttribute("data-ck-dim");
      }
    }
    svg.querySelectorAll("[data-ck-pick]").forEach((node) => node.remove());
    svg.querySelectorAll(".ck-pick").forEach((node) => node.classList.remove("ck-pick"));
    if (picking !== "point") return;
    for (let i = 0; i < picked.points.length; i++) {
      const point = picked.points[i];
      const x = hover.pixels[point.index - lo] ?? box.l;
      let bar: Element | null = null;
      let best = 48;
      const rects = svg.querySelectorAll("rect");
      for (let r = 0; r < rects.length; r++) {
        const rect = rects[r];
        if (owner(rect) !== point.series) continue;
        const dist = Math.abs(+(rect.getAttribute("x") || 0) + +(rect.getAttribute("width") || 0) / 2 - x);
        if (dist < best) {
          best = dist;
          bar = rect;
        }
      }
      if (arcChart(base.type)) {
        const paths = svg.querySelectorAll("path[data-ck-name]");
        for (let p = 0; p < paths.length; p++) {
          const path = paths[p];
          if (!path || path.getAttribute("data-ck-name") !== point.series) continue;
          path.classList.add("ck-pick");
          const fill = path.getAttribute("fill");
          if (fill && fill !== "none") (path as SVGElement).style.stroke = fill;
        }
        continue;
      }
      if (bar) {
        bar.classList.add("ck-pick");
        const fill = bar.getAttribute("fill");
        if (fill && fill !== "none") (bar as SVGElement).style.stroke = fill;
        continue;
      }
      let y = box.t + box.h / 2;
      const paths = svg.querySelectorAll("path");
      for (let p = 0; p < paths.length; p++) {
        if (owner(paths[p]) !== point.series) continue;
        const d = paths[p].getAttribute("d");
        const found = d ? yOnPath(d, x) : null;
        if (found != null) {
          y = found;
          break;
        }
      }
      let ink = "";
      const marks = svg.querySelectorAll("[data-ck-i]");
      for (let m = 0; m < marks.length; m++) {
        const mark = marks[m];
        if (!mark || mark.getAttribute("data-ck-i") !== String(point.index)) continue;
        if (owner(mark) !== point.series && mark.getAttribute("data-ck-name") !== point.series) continue;
        const fill = mark.getAttribute("fill");
        if (fill && fill !== "none") ink = fill;
        break;
      }
      const ring = ink ? ` style="stroke:${ink}"` : "";
      svg.insertAdjacentHTML("beforeend", `<circle data-ck-pick class="ck-pick"${ring} cx="${Math.round(x)}" cy="${Math.round(y)}" r="5" fill="none" pointer-events="none"/>`);
    }
  }

  function emit(name: string, detail: unknown): void {
    host.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  }

  function rangeDetail() {
    return { from: xText(lo), to: xText(hi), start: lo, end: hi };
  }

  function zoomAt(local: number, factor: number): void {
    const len = hi - lo + 1;
    let next = Math.round(len * factor);
    next = Math.max(2, Math.min(n, next));
    const anchor = lo + Math.min(len - 1, Math.max(0, local));
    const rel = len <= 1 ? 0 : (anchor - lo) / len;
    let start = Math.round(anchor - rel * next);
    let end = start + next - 1;
    if (start < 0) {
      end -= start;
      start = 0;
    }
    if (end > n - 1) {
      start -= end - (n - 1);
      end = n - 1;
    }
    start = Math.max(0, start);
    if (end <= start) return;
    if (start === lo && end === hi) return;
    lo = start;
    hi = end;
    redraw();
    emit("rangechange", rangeDetail());
  }

  function resetRange(): void {
    if (lo === 0 && hi === n - 1) return;
    lo = 0;
    hi = Math.max(0, n - 1);
    redraw();
    emit("rangechange", rangeDetail());
  }

  function hoverMove(event: PointerEvent | MouseEvent): void {
    arm(1);
    if (base.type === "waterfall") {
      const mark = (event.target as Element | null)?.closest?.("[data-ck-mark]");
      if (!mark || mark.getAttribute("data-ck-mark") === "connector") {
        hideHover();
        return;
      }
      const label = mark.getAttribute("aria-label") || "";
      const cut = label.indexOf(": ");
      const name = mark.getAttribute("data-ck-name") || (cut >= 0 ? label.slice(0, cut) : label).trim();
      const text = cut >= 0 ? label.slice(cut + 2) : label;
      placeTip(event.clientX, event.clientY, name, [{ name, text, color: legendPaint(mark.getAttribute("fill"), 0) }], [viewPoint(svg, event.clientX, event.clientY)]);
      return;
    }
    if (arcChart(base.type)) {
      const path = (event.target as Element | null)?.closest?.("path[aria-label]");
      if (!path) {
        hideHover();
        return;
      }
      const label = path.getAttribute("aria-label") || "";
      const cut = label.indexOf(": ");
      const name = (cut >= 0 ? label.slice(0, cut) : label).trim();
      const text = cut >= 0 ? label.slice(cut + 2) : label;
      let rows = [{ name, text, color: legendPaint(path.getAttribute("fill"), 0) }];
      if (tipFields(base)) {
        const slices = svg.querySelectorAll("path[aria-label]");
        let index = 0;
        for (let i = 0; i < slices.length; i++) if (slices[i] === path) index = i;
        rows = entriesAt(index, null);
      }
      placeTip(event.clientX, event.clientY, name, rows, [viewPoint(svg, event.clientX, event.clientY)]);
      return;
    }
    if (!showTip && !showCross && !keys) return;
    const point = viewPoint(svg, event.clientX, event.clientY);
    const horizontal = isRecord(base.mark) && base.mark.orientation === "horizontal";
    const local = lookupIndex(hover, horizontal ? point.y : point.x);
    const index = Math.min(n - 1, Math.max(0, lo + local));
    focus = index;
    const title = xText(index);
    const rows = entriesAt(index, point.y);
    const px = crossX(local);
    moveCross(px, title);
    const marks = placeDots(px, horizontal, index);
    if (showTip) placeTip(event.clientX, event.clientY, title, rows, marks, index);
  }

  function announce(index: number): void {
    const rows = entriesAt(index, null);
    live.textContent = `${xText(index)}: ${rows.map((row) => `${row.name} ${row.text}`.trim()).join(", ")}`;
  }

  arm();
  paintTable();
  fade(svg, durationMs(spec, n), "0");
  if (picked.points.length || picked.series.length) paintPick();

  if (showTip || showCross) {
    on(svg, "pointermove", hoverMove as EventListener);
    on(svg, "pointerleave", () => hideHover());
  }
  if (legend) dim();
  on(svg, "click", ((event: MouseEvent) => {
    if (turnLegendPage(svg, event.target as Element | null)) return;
    const legendItem = legendTarget(event.target as Element | null);
    if (legendItem) {
      emit("legendclick", { series: legendItem.name, datum: null, index: legendItem.index, x: null, y: null, value: null, row: null });
      if (!legend) return;
      if (hidden.has(legendItem.name)) hidden.delete(legendItem.name);
      else hidden.add(legendItem.name);
      emit("legendtoggle", { index: legendItem.index, hidden: hidden.has(legendItem.name), name: legendItem.name });
      redraw();
      return;
    }
    const hit = hitOf(event);
    if (!hit) {
      if (selMode() && (picked.points.length || picked.series.length)) choose(copySelection(null));
      return;
    }
    emit(hit.kind === "point" ? "pointclick" : "seriesclick", payload(hit.name, hit.index, hit.color));
    if (selMode() === "point" && hit.kind === "point") togglePoint(hit.name, hit.index, addKey(event));
    else if (selMode() === "series") toggleSeries(hit.name, addKey(event));
  }) as EventListener);
  on(svg, "pointerover", ((event: PointerEvent) => {
    const name = legendTarget(event.target as Element | null)?.name ?? "";
    if (name === lit) return;
    lit = name;
    paintPick();
  }) as EventListener);
  on(svg, "keydown", ((event: KeyboardEvent) => {
    if ((event.key === "Enter" || event.key === " ") && turnLegendPage(svg, event.target as Element | null)) {
      event.preventDefault();
      return;
    }
    if (event.key === "Escape") {
      if (selMode() && (picked.points.length || picked.series.length)) {
        event.preventDefault();
        choose(copySelection(null));
      }
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    const name = series.find((item) => !hidden.has(item.name))?.name || series[0]?.name || "";
    if (!name) return;
    event.preventDefault();
    emit("pointclick", payload(name, focus, inkAt(name, focus) ?? undefined));
    if (selMode() === "point") togglePoint(name, focus, addKey(event));
    else if (selMode() === "series") toggleSeries(name, addKey(event));
  }) as EventListener);

  const formats = exportFormats(spec);
  let exportStop = () => {};
  let specNow: { data?: unknown } = spec;
  if (formats.length) {
    void import("./export-menu").then((mod) => {
      if (!alive) return;
      exportStop = mod.armExport(svg, () => specNow, formats);
    });
  }

  const wantsExtra = zooming || brush || keys || dataTable;
  const ready: Promise<void> = wantsExtra
    ? import("./interact-extra").then((mod) => {
        if (!alive) return;
        mod.armExtras([
          svg,
          on,
          zooming,
          pan,
          brush,
          keys,
          dataTable,
          showTip,
          () => alive,
          (clientX, clientY) => viewPoint(svg, clientX, clientY),
          (x) => (arm(1), lookupIndex(hover, x)),
          zoomAt,
          resetRange,
          () => redraw(),
          emit,
          rangeDetail,
          () => box,
          () => ({ lo, hi, n }),
          (start, end) => {
            lo = start;
            hi = end;
          },
          crossX,
          moveCross,
          entriesAt,
          placeTip,
          xText,
          () => focus,
          (value) => {
            focus = value;
          },
          announce,
          paintTable,
        ]);
      })
    : Promise.resolve();

  const initial = isRecord(spec.interaction) ? spec.interaction.initialRange : 0;
  if (Array.isArray(initial) && n > 1) {
    const cmp = (a: unknown, b: unknown) =>
      typeof a === "number" && typeof b === "number" ? a - b : +(String(a) > String(b)) - +(String(a) < String(b));
    let start = 0;
    let end = n - 1;
    for (let i = 0; i < n; i++) {
      const raw = xField() ? table.cell(xField(), i) : i;
      if (cmp(raw, initial[0]) >= 0 && !start && i) start = i;
      if (cmp(raw, initial[1]) <= 0) end = i;
    }
    if (end > start) {
      lo = start;
      hi = end;
      redraw();
    }
  }

  return {
    update(next, markup) {
      if (!alive) return;
      specNow = next;
      base = next;
      const follow = lo === 0 && (n === 0 || hi === n - 1);
      table = openTable(next.data);
      series = seriesOf(next, table);
      n = table.n;
      if (follow) {
        lo = 0;
        hi = Math.max(0, n - 1);
      } else if (hi >= n) hi = Math.max(0, n - 1);
      if (lo > hi) lo = 0;
      if (lo === 0 && hi === n - 1 && hidden.size === 0 && markup) {
        patchSvg(host as PatchHost, markup, durationMs(next, n));
        if (keys || selMode()) svg.setAttribute("tabindex", "0");
        dim();
        paintPick();
        arm();
        paintTable();
        return;
      }
      redraw(markup);
      paintTable();
    },
    setSelection(selection) {
      if (!alive) return;
      locked = true;
      picked = copySelection(selection);
      paintPick();
    },
    destroy() {
      if (!alive) return;
      alive = false;
      ticket++;
      for (const off of offs) off();
      tip.remove();
      live.remove();
      exportStop();
      host.querySelector("[data-ck-table-wrap]")?.remove();
      svg.querySelectorAll("[data-ck-crosshair],[data-ck-brush],[data-ck-dot],[data-ck-pick]").forEach((node) => node.remove());
      svg.removeAttribute("tabindex");
      host.removeAttribute("data-ck-interact");
    },
    ready,
  };
}

/** Forward host events to adapter callbacks. Returns the unlisten function. */
export function listen(
  host: EventTarget,
  handlers: {
    pointclick?: (detail: ClickDetail) => void;
    seriesclick?: (detail: ClickDetail) => void;
    legendclick?: (detail: ClickDetail) => void;
    selectionchange?: (detail: Selection) => void;
  },
): () => void {
  const names = ["pointclick", "seriesclick", "legendclick", "selectionchange"] as const;
  const offs: (() => void)[] = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const fn = handlers[name];
    if (!fn) continue;
    const listener = (event: Event) => fn((event as CustomEvent).detail);
    host.addEventListener(name, listener);
    offs.push(() => host.removeEventListener(name, listener));
  }
  return () => {
    for (let i = 0; i < offs.length; i++) offs[i]();
  };
}
