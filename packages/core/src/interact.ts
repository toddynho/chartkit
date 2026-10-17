/**
 * Client interaction for a chart that is already in the DOM.
 * `@chartkitdev/core/all` does not import this module, so a static render stays the same string.
 * Adapters call `attach` after the SVG is mounted and `patchSvg` when the spec changes.
 */
import { formatValue } from "./format";

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

export interface AttachOptions {
  /** Same renderer the adapter used to draw the SVG. Called again for zoom and legend rescale. */
  render: (spec: InteractSpec) => string;
}

export interface Controller {
  /** `markup` is the adapter's render of the full spec. Zoom and hidden series render internally. */
  update(spec: InteractSpec, markup?: string): void;
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

const TIP_TYPES = new Set(["line", "bar", "stacked-area", "scatter", "combo", "donut"]);
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

function seriesOf(spec: InteractSpec, table: Table): SeriesMeta[] {
  const enc = isRecord(spec.encoding) ? spec.encoding : {};
  if (spec.type === "candlestick") return ["open", "high", "low", "close"].map((key) => ({ name: key, field: fieldOf(enc[key]) || key }));
  const channels = yChannels(enc.y);
  const group = spec.type === "donut" ? fieldOf(enc.x) : typeof enc.series === "string" ? enc.series : fieldOf(enc.series);
  if (group && (spec.type === "donut" || channels.length === 1)) {
    const field = spec.type === "donut" ? fieldOf(enc.y) : channels[0].field;
    const format = spec.type === "donut" ? (isRecord(enc.y) ? enc.y.format : undefined) : channels[0].format;
    const seen = new Set<string>();
    const out: SeriesMeta[] = [];
    for (let i = 0; i < table.n; i++) {
      const name = String(table.cell(group, i) ?? (spec.type === "donut" ? i : ""));
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
  const interaction = isRecord(spec.interaction) ? spec.interaction : undefined;
  if (interaction?.hover === false) return false;
  const tooltip = spec.tooltip;
  if (tooltip === false) return false;
  if (isRecord(tooltip) && tooltip.show === false) return false;
  if (tooltip === true || isRecord(tooltip)) return true;
  return TIP_TYPES.has(spec.type ?? "");
}

function crosshairOn(spec: InteractSpec): boolean {
  if (!tooltipOn(spec) || spec.type === "donut") return false;
  const tooltip = spec.tooltip;
  if (isRecord(tooltip) && tooltip.crosshair === false) return false;
  return true;
}

function zoomMode(spec: InteractSpec): "none" | "x" | "xy" {
  const interaction = isRecord(spec.interaction) ? spec.interaction : undefined;
  const zoom = interaction?.zoom;
  if (zoom === "x" || zoom === "xy" || zoom === "none") return zoom;
  return spec.type === "candlestick" ? "x" : "none";
}

function reducedMotion(): boolean {
  try {
    return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function durationMs(spec: InteractSpec, count: number): number {
  const animation = spec.animation;
  if (animation == null || animation === false || count > 2000 || reducedMotion()) return 0;
  if (animation === true) return 400;
  if (isRecord(animation)) {
    if (animation.duration === 0) return 0;
    return typeof animation.duration === "number" ? animation.duration : 400;
  }
  return 0;
}

function esc(value: string): string {
  return value.replace(/[&<>"]/g, (ch) => (ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : "&quot;"));
}

function ensureCss(): void {
  if (typeof document === "undefined" || document.getElementById("ck-interact-style")) return;
  const style = document.createElement("style");
  style.id = "ck-interact-style";
  style.textContent =
    ".ck-tip{position:absolute;z-index:5;pointer-events:none;padding:8px 10px;border-radius:10px;font:12px/1.35 ui-sans-serif,system-ui,sans-serif;background:light-dark(#fff,#2c2c2e);color:light-dark(#1d1d1f,#f5f5f7);box-shadow:0 8px 24px #0003;font-variant-numeric:tabular-nums}.ck-row{display:flex;align-items:center;gap:6px}.ck-tip b{margin-left:auto;padding-left:12px}.ck-tip i{width:8px;height:8px;border-radius:2px;flex:none}.ck-xhair{stroke:light-dark(#0006,#fff8);stroke-dasharray:3 3}.ck-clip{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}";
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
    return {
      l: Number(rect.getAttribute("x")) || 0,
      t: Number(rect.getAttribute("y")) || 0,
      w: Number(rect.getAttribute("width")) || 1,
      h: Number(rect.getAttribute("height")) || 1,
    };
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
    if (el.getAttribute(match[1]) !== value) el.setAttribute(match[1], value);
  }
  for (let i = el.attributes.length - 1; i >= 0; i--) if (!keep.has(el.attributes[i].name)) el.removeAttribute(el.attributes[i].name);
}

/** Same tags, in order: copy attributes and text. False when the shape changed. */
function paint(svg: Element, markup: string): boolean {
  const nodes = svg.querySelectorAll("*");
  let n = 0;
  let el: Element = svg;
  let i = 0;
  while (i < markup.length) {
    if (markup.charCodeAt(i) !== 60) {
      const j = markup.indexOf("<", i);
      const text = dec(markup.slice(i, j < 0 ? markup.length : j));
      const node = el.firstChild;
      if (text && node && node.nodeType === 3 && node.nodeValue !== text) node.nodeValue = text;
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
    n++;
    i = gt + 1;
  }
  return n === nodes.length + 1;
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

function legendItems(svg: SVGSVGElement): { name: string; text: SVGTextElement; swatch: Element | null }[] {
  const out: { name: string; text: SVGTextElement; swatch: Element | null }[] = [];
  const texts = svg.querySelectorAll("text");
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i] as SVGTextElement;
    const prev = text.previousElementSibling;
    if (!prev || prev.localName !== "rect" || prev.getAttribute("width") !== "10") continue;
    out.push({ name: text.textContent ?? "", text, swatch: prev });
  }
  return out;
}

function numericValues(spec: InteractSpec, table: Table): ArrayLike<number> | null {
  if (spec.type === "bar" || spec.type === "combo" || spec.type === "heatmap" || spec.type === "donut") return null;
  const enc = isRecord(spec.encoding) ? spec.encoding : {};
  const field = fieldOf(enc.x);
  const declared = isRecord(enc.x) ? enc.x.type : undefined;
  if (declared === "nominal" || declared === "ordinal") return null;
  const values = new Float64Array(table.n);
  if (!field) {
    if (!(Array.isArray(spec.data) && (spec.data.length === 0 || typeof spec.data[0] === "number"))) return null;
    for (let i = 0; i < table.n; i++) values[i] = i;
    return values;
  }
  if (!table.n) return null;
  for (let i = 0; i < table.n; i++) {
    const value = table.cell(field, i);
    if (i < 8 && (typeof value !== "number" || !Number.isFinite(value))) return null;
    values[i] = Number(value);
  }
  return values;
}

function materialize(data: unknown): unknown[] | null {
  if (Array.isArray(data) || ArrayBuffer.isView(data)) return Array.prototype.slice.call(data as ArrayLike<unknown>);
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

/**
 * Listen on `host` for tooltip, crosshair, legend toggle, x zoom/pan/brush,
 * enter/update motion, keyboard focus, and an optional data table.
 * Tears down with `destroy`. Does nothing when the spec leaves interaction off.
 */
export function attach(host: Element, spec: InteractSpec, options: AttachOptions): Controller {
  const found = host.querySelector?.("svg");
  if (!(found instanceof SVGSVGElement) || typeof document === "undefined") {
    return { update() {}, destroy() {}, ready: Promise.resolve() };
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
  const tableWrap = document.createElement("div");
  tableWrap.setAttribute("data-ck-table-wrap", "");
  const tableBtn = document.createElement("button");
  tableBtn.type = "button";
  tableBtn.setAttribute("data-ck-table-btn", "");
  tableBtn.textContent = "Show data table";
  const tableEl = document.createElement("table");
  tableEl.className = "ck-table ck-clip";
  tableEl.setAttribute("data-ck-table", "");
  tableWrap.append(tableBtn, tableEl);

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

  if (showTip) host.append(tip);
  if (keys) {
    svg.setAttribute("tabindex", "0");
    host.append(live);
  }
  if (dataTable) host.append(tableWrap);

  const offs: (() => void)[] = [];
  const on = (target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    offs.push(() => target.removeEventListener(type, fn, opts));
  };

  function xText(index: number): string {
    const field = xField();
    const raw = field ? table.cell(field, index) : index;
    const format = isRecord(base.encoding) && isRecord(base.encoding.x) ? base.encoding.x.format : undefined;
    if (typeof raw === "number") return formatValue(raw, format ?? "number", locale());
    return raw == null ? String(index) : String(raw);
  }

  function entriesAt(index: number, pointerY: number | null): { name: string; text: string; color: string }[] {
    const grouped = series.some((item) => item.match) && base.type !== "donut";
    const rows: { name: string; text: string; color: string; raw: number }[] = [];
    const yFormat = axisFormat(base, "y");
    const push = (name: string, raw: unknown, color: string) => {
      if (raw == null || raw === "") return;
      const num = typeof raw === "number" ? raw : Number(raw);
      rows.push({ name, text: fmt(raw, series.find((s) => s.name === name)?.format ?? yFormat, locale()), color, raw: Number.isFinite(num) ? num : 0 });
    };
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
      return [rows[best]];
    }
    return rows;
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
      if (fill) colors.set(item.name, fill);
    }
  }

  function placeTip(
    clientX: number,
    clientY: number,
    title: string,
    rows: { name: string; text: string; color: string }[],
    marks: { x: number; y: number }[],
  ): void {
    if (!showTip) return;
    tip.innerHTML =
      (title ? `<div>${esc(title)}</div>` : "") +
      rows.map((row) => `<div class="ck-row"><i style="background:${row.color}"></i>${esc(row.name)}<b>${esc(row.text)}</b></div>`).join("");
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
    let top = minY - height - 14;
    if (top < 4) top = maxY + 14;
    if (top + height > bounds.height - 4) top = Math.max(4, bounds.height - height - 4);
    const mid = (minX + maxX) / 2;
    let left = mid + 14;
    if (left + width > bounds.width - 4) left = Math.max(4, mid - width - 14);
    if (left < maxX && left + width > minX && top < maxY && top + height > minY && mid - width - 14 >= 4) left = mid - width - 14;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function moveCross(x: number): void {
    if (!showCross) return;
    let line = svg.querySelector("[data-ck-crosshair]");
    if (!line) {
      svg.insertAdjacentHTML("beforeend", `<line data-ck-crosshair="" class="ck-xhair"/>`);
      line = svg.lastElementChild as Element;
    }
    line.setAttribute("x1", String(x));
    line.setAttribute("x2", String(x));
    line.setAttribute("y1", String(box.t));
    line.setAttribute("y2", String(box.t + box.h));
  }

  function hideHover(): void {
    tip.hidden = true;
    svg.querySelector("[data-ck-crosshair]")?.remove();
    clearDots();
  }

  function clearDots(): void {
    const nodes = svg.querySelectorAll("[data-ck-dot]");
    for (let i = 0; i < nodes.length; i++) nodes[i].remove();
  }

  function addDot(x: number, y: number, fill: string): { x: number; y: number } {
    const cx = String(Math.round(x * 100) / 100);
    const cy = String(Math.round(y * 100) / 100);
    svg.insertAdjacentHTML("beforeend", `<circle data-ck-dot="" cx="${cx}" cy="${cy}" r="3.5" fill="${esc(fill)}" stroke="light-dark(#fff,#1c1c1e)" stroke-width="1.5" pointer-events="none"/>`);
    return { x, y };
  }

  function yOnPath(d: string, x: number): number | null {
    const t = d.split(/[\s,]+/);
    let c = "", x0 = 0, y0 = 0, hit: number | null = null;
    for (let i = 0; i < t.length && hit == null; i++) {
      const p = t[i];
      if (p === "M" || p === "L" || p === "C" || p === "Z") {
        c = p === "Z" ? "" : p;
        continue;
      }
      if (c === "M") {
        x0 = +p;
        y0 = +t[++i];
        continue;
      }
      if (c !== "L" && c !== "C") continue;
      const x1 = c === "L" ? +p : +t[i + 4];
      const y1 = c === "L" ? +t[++i] : +t[i + 5];
      if (c === "C") i += 5;
      if (x1 === x1 && y1 === y1 && ((x0 <= x && x <= x1) || (x1 <= x && x <= x0))) {
        hit = x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
      }
      x0 = x1;
      y0 = y1;
    }
    return hit;
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
    if (base.type === "donut" || base.type === "heatmap") return [];
    const marks: { x: number; y: number }[] = [];
    if (!horizontal) {
      const paths = svg.querySelectorAll("path");
      let seen = 0;
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        if (path.closest("defs") || path.closest("clipPath")) continue;
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
    const rects = svg.querySelectorAll("rect");
    let best = Infinity;
    const hits: SVGRectElement[] = [];
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i] as SVGRectElement;
      if (rect.closest("defs") || rect.closest("clipPath")) continue;
      const w = Number(rect.getAttribute("width"));
      const h = Number(rect.getAttribute("height"));
      if (!(w > 12) || !(h > 0) || w > box.w * 0.85) continue;
      const cx = Number(rect.getAttribute("x")) + w / 2;
      const cy = Number(rect.getAttribute("y")) + h / 2;
      const dist = Math.abs((horizontal ? cy : cx) - snapped);
      if (dist > tol) continue;
      if (dist < best - 0.5) {
        best = dist;
        hits.length = 0;
        hits.push(rect);
      } else if (dist <= best + 0.5) hits.push(rect);
    }
    for (let i = 0; i < hits.length; i++) {
      const rect = hits[i];
      const x = Number(rect.getAttribute("x"));
      const y = Number(rect.getAttribute("y"));
      const w = Number(rect.getAttribute("width"));
      const h = Number(rect.getAttribute("height"));
      const dx = horizontal ? x + w : x + w / 2;
      const dy = horizontal ? y + h / 2 : y;
      marks.push(addDot(dx, dy, legendPaint(rect.getAttribute("fill"), marks.length)));
    }
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
  function rebuild(): void {
    dirty = false;
    const viewN = Math.max(0, hi - lo + 1);
    box = plotBox(svg);
    const values = numericValues(base, table);
    let slice: ArrayLike<number> | null = null;
    if (values && viewN > 0) {
      const next = new Float64Array(viewN);
      for (let i = 0; i < viewN; i++) next[i] = Number(values[lo + i]);
      slice = next;
    }
    hover = buildHoverIndex(viewN, box.l, box.w, slice);
    refreshColors();
  }

  function crossX(local: number): number {
    if (dirty) rebuild();
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
    if (base.type !== "donut") return;
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
    if (!dataTable) return;
    const cap = Math.min(n, 1000);
    const head = [`<th>${esc(xField() || "x")}</th>`].concat(series.map((item) => `<th>${esc(item.name)}</th>`)).join("");
    const body: string[] = [];
    for (let i = 0; i < cap; i++) {
      const cells = [`<td>${esc(xText(i))}</td>`];
      for (const item of series) {
        if (item.match && String(table.cell(item.match, i)) !== item.name && base.type === "donut") continue;
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
      const drop = base.type === "donut";
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
    if (keys) svg.setAttribute("tabindex", "0");
    dim();
    rebuild();
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
    if (dirty) rebuild();
    if (base.type === "donut") {
      const path = (event.target as Element | null)?.closest?.("path[aria-label]");
      if (!path) {
        hideHover();
        return;
      }
      const label = path.getAttribute("aria-label") || "";
      const cut = label.indexOf(": ");
      const name = (cut >= 0 ? label.slice(0, cut) : label).trim();
      const text = cut >= 0 ? label.slice(cut + 2) : label;
      placeTip(event.clientX, event.clientY, name, [
        { name, text, color: legendPaint(path.getAttribute("fill"), 0) },
      ], [viewPoint(svg, event.clientX, event.clientY)]);
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
    moveCross(px);
    const marks = placeDots(px, horizontal, index);
    if (showTip) placeTip(event.clientX, event.clientY, title, rows, marks);
  }

  function announce(index: number): void {
    const rows = entriesAt(index, null);
    live.textContent = `${xText(index)}: ${rows.map((row) => `${row.name} ${row.text}`.trim()).join(", ")}`;
  }

  rebuild();
  paintTable();
  fade(svg, durationMs(spec, n), "0");

  if (showTip || showCross) {
    on(svg, "pointermove", hoverMove as EventListener);
    on(svg, "pointerleave", () => hideHover());
  }
  if (legend) {
    dim();
    on(svg, "click", ((event: MouseEvent) => {
      const target = event.target as Element | null;
      const text =
        target?.closest?.("text") ||
        (target?.localName === "rect" && target.getAttribute("width") === "10" ? target.nextElementSibling : null);
      if (!text) return;
      const item = legendItems(svg).find((entry) => entry.text === text);
      if (!item || !series.some((entry) => entry.name === item.name)) return;
      if (hidden.has(item.name)) hidden.delete(item.name);
      else hidden.add(item.name);
      const index = series.findIndex((entry) => entry.name === item.name);
      emit("legendtoggle", { index, hidden: hidden.has(item.name), name: item.name });
      redraw();
    }) as EventListener);
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
          (x) => (dirty && rebuild(), lookupIndex(hover, x)),
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
          tableBtn,
          tableEl,
        ]);
      })
    : Promise.resolve();

  const initial = isRecord(spec.interaction) && Array.isArray(spec.interaction.initialRange) ? spec.interaction.initialRange : null;
  if (initial && n > 1) {
    const [from, to] = initial;
    const within = (raw: unknown, bound: unknown, above: boolean) => {
      if (typeof raw === "number" && typeof bound === "number") return above ? raw >= bound : raw <= bound;
      return above ? String(raw) >= String(bound) : String(raw) <= String(bound);
    };
    let start = 0;
    let end = n - 1;
    for (let i = 0; i < n; i++) {
      const raw = xField() ? table.cell(xField(), i) : i;
      if (within(raw, from, true) && start === 0 && i !== 0) start = i;
      if (within(raw, to, false)) end = i;
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
      base = next;
      table = openTable(next.data);
      series = seriesOf(next, table);
      n = table.n;
      if (hi >= n) hi = Math.max(0, n - 1);
      if (lo > hi) lo = 0;
      if (lo === 0 && hi === n - 1 && hidden.size === 0 && markup) {
        patchSvg(host as PatchHost, markup, durationMs(next, n));
        if (keys) svg.setAttribute("tabindex", "0");
        dim();
        dirty = true;
        paintTable();
        return;
      }
      redraw(markup);
      paintTable();
    },
    destroy() {
      if (!alive) return;
      alive = false;
      for (const off of offs) off();
      tip.remove();
      live.remove();
      tableWrap.remove();
      svg.querySelectorAll("[data-ck-crosshair],[data-ck-brush],[data-ck-dot]").forEach((node) => node.remove());
      svg.removeAttribute("tabindex");
      host.removeAttribute("data-ck-interact");
    },
    ready,
  };
}
