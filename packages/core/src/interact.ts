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
}

export interface PatchHost {
  innerHTML: string;
  querySelector?(selector: string): Element | null;
}

export interface HoverIndex {
  xs: Float64Array;
  order: Int32Array | null;
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
    return { xs, order: null, uniform: true, count, left, width };
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
  if (sorted) return { xs, order: null, uniform: false, count, left, width };
  const order = new Int32Array(count);
  for (let i = 0; i < count; i++) order[i] = i;
  order.sort((a, b) => xs[a] - xs[b] || a - b);
  const sortedXs = new Float64Array(count);
  for (let i = 0; i < count; i++) sortedXs[i] = xs[order[i]];
  return { xs: sortedXs, order, uniform: false, count, left, width };
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
  const type = spec.type;
  if (type === "candlestick") {
    return ["open", "high", "low", "close"].map((key) => ({
      name: key,
      field: fieldOf(enc[key]) || key,
    }));
  }
  if (type === "donut") {
    const x = fieldOf(enc.x);
    const y = fieldOf(enc.y);
    const format = isRecord(enc.y) ? enc.y.format : undefined;
    const seen = new Set<string>();
    const out: SeriesMeta[] = [];
    for (let i = 0; i < table.n; i++) {
      const name = String(table.cell(x, i) ?? i);
      if (seen.has(name)) continue;
      seen.add(name);
      out.push({ name, field: y, format, match: x });
    }
    return out;
  }
  const seriesField = typeof enc.series === "string" ? enc.series : fieldOf(enc.series);
  const channels = yChannels(enc.y);
  if (seriesField && channels.length === 1) {
    const seen = new Set<string>();
    const out: SeriesMeta[] = [];
    for (let i = 0; i < table.n; i++) {
      const name = String(table.cell(seriesField, i) ?? "");
      if (!name || seen.has(name)) continue;
      seen.add(name);
      out.push({ name, field: channels[0].field, format: channels[0].format, match: seriesField });
    }
    return out;
  }
  if (channels.length === 0) return [{ name: "value", field: "value" }];
  return channels.map((channel) => ({ name: channel.title, field: channel.field, format: channel.format }));
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
    ".ck-tip{position:absolute;z-index:5;pointer-events:none;padding:8px 10px;border-radius:10px;font:12px/1.35 ui-sans-serif,system-ui,sans-serif;background:light-dark(#fff,#2c2c2e);color:light-dark(#1d1d1f,#f5f5f7);box-shadow:0 8px 24px #0003;font-variant-numeric:tabular-nums}.ck-tip b{margin-left:8px}.ck-tip i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:6px}.ck-xhair{stroke:light-dark(#0006,#fff8);stroke-dasharray:3 3}.ck-clip{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.ck-table{border-collapse:collapse;font:12px/1.4 ui-sans-serif,system-ui,sans-serif}.ck-table td,.ck-table th{border:1px solid #0002;padding:2px 6px;text-align:right}.ck-table td:first-child,.ck-table th:first-child{text-align:left}";
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

function decodeAttr(value: string): string {
  return value.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot);/g, (all, entity: string) => {
    if (entity === "amp") return "&";
    if (entity === "lt") return "<";
    if (entity === "gt") return ">";
    if (entity === "quot") return "\"";
    const code = entity[1] === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : all;
  });
}

/** Patch root attributes. `tabindex` is a client hook and stays. */
function patchRoot(el: Element, attrs: string): void {
  const keep = new Set<string>(["tabindex"]);
  const re = /([\w:-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(attrs))) {
    const name = match[1];
    if (name === "xmlns") continue;
    keep.add(name);
    const value = decodeAttr(match[2]);
    if (el.getAttribute(name) !== value) el.setAttribute(name, value);
  }
  for (let i = el.attributes.length - 1; i >= 0; i--) {
    const name = el.attributes[i].name;
    if (!keep.has(name)) el.removeAttribute(name);
  }
}

function fade(el: Element, ms: number): void {
  if (ms <= 0) return;
  const node = el as SVGSVGElement;
  node.style.transition = "none";
  node.style.opacity = "0.45";
  requestAnimationFrame(() => {
    node.style.transition = `opacity ${ms}ms ease-out`;
    node.style.opacity = "1";
  });
}

/**
 * Write `markup` into the existing `<svg>`. Root attributes are patched.
 * Children (path `d`, rects, ticks) are replaced in one write: walking every
 * hidden dot is slower than the parser, and the svg node keeps its listeners.
 * A host without an svg falls back to `innerHTML`.
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
  patchRoot(current, markup.slice(4, open));
  current.innerHTML = markup.slice(open + 1, close);
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
  const type = spec.type;
  if (type === "bar" || type === "combo" || type === "heatmap" || type === "donut") return null;
  const enc = isRecord(spec.encoding) ? spec.encoding : {};
  const field = fieldOf(enc.x);
  if (!field) {
    if (Array.isArray(spec.data) && (spec.data.length === 0 || typeof spec.data[0] === "number")) {
      const values = new Float64Array(table.n);
      for (let i = 0; i < table.n; i++) values[i] = i;
      return values;
    }
    return null;
  }
  const declared = isRecord(enc.x) ? enc.x.type : undefined;
  if (declared === "nominal" || declared === "ordinal") return null;
  const sample = Math.min(table.n, 8);
  for (let i = 0; i < sample; i++) {
    const value = table.cell(field, i);
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
  }
  if (sample === 0) return null;
  const values = new Float64Array(table.n);
  for (let i = 0; i < table.n; i++) values[i] = Number(table.cell(field, i));
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
    return { update() {}, destroy() {} };
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
    if (!grouped) {
      for (let i = 0; i < series.length; i++) {
        const item = series[i];
        if (hidden.has(item.name)) continue;
        const raw = table.cell(item.field, index);
        const num = typeof raw === "number" ? raw : Number(raw);
        rows.push({
          name: item.name,
          text: fmt(raw, item.format ?? yFormat, locale()),
          color: `var(--ck-series-${(i % 8) + 1}, light-dark(#007aff,#0a84ff))`,
          raw: Number.isFinite(num) ? num : 0,
        });
      }
    } else {
      const key = String(table.cell(xField(), index) ?? index);
      for (let i = 0; i < n; i++) {
        if (String(table.cell(xField(), i) ?? i) !== key) continue;
        const name = String(table.cell(series[0]?.match ?? "", i) ?? "");
        if (hidden.has(name)) continue;
        const item = series.find((s) => s.name === name);
        const raw = table.cell(item?.field || series[0]?.field || "", i);
        const num = typeof raw === "number" ? raw : Number(raw);
        rows.push({
          name,
          text: fmt(raw, item?.format ?? yFormat, locale()),
          color: `var(--ck-series-${(rows.length % 8) + 1}, light-dark(#007aff,#0a84ff))`,
          raw: Number.isFinite(num) ? num : 0,
        });
      }
    }
    let chosen = rows;
    if (mode === "nearest" && rows.length > 1 && pointerY != null) {
      const fraction = box.h ? (pointerY - box.t) / box.h : 0;
      let min = Infinity;
      let max = -Infinity;
      for (const row of rows) {
        if (row.raw < min) min = row.raw;
        if (row.raw > max) max = row.raw;
      }
      const span = max - min || 1;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < rows.length; i++) {
        const y = 1 - (rows[i].raw - min) / span;
        const dist = Math.abs(y - fraction);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      chosen = [rows[best]];
    }
    return chosen.map(({ name, text, color }) => ({ name, text, color }));
  }

  function placeTip(clientX: number, clientY: number, title: string, rows: { name: string; text: string; color: string }[]): void {
    if (!showTip) return;
    const body = rows
      .map((row) => `<div><i style="background:${row.color}"></i>${esc(row.name)}<b>${esc(row.text)}</b></div>`)
      .join("");
    tip.innerHTML = `<div>${esc(title)}</div>${body}`;
    tip.hidden = false;
    const bounds = host.getBoundingClientRect();
    const width = tip.offsetWidth || 160;
    const height = tip.offsetHeight || 48;
    let left = clientX - bounds.left + 14;
    let top = clientY - bounds.top + 14;
    if (left + width > bounds.width) left = Math.max(4, clientX - bounds.left - width - 10);
    if (top + height > bounds.height) top = Math.max(4, clientY - bounds.top - height - 10);
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function moveCross(x: number): void {
    if (!showCross) return;
    let line = svg.querySelector("[data-ck-crosshair]");
    if (!line) {
      line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("data-ck-crosshair", "");
      line.setAttribute("class", "ck-xhair");
      svg.append(line);
    }
    line.setAttribute("x1", String(x));
    line.setAttribute("x2", String(x));
    line.setAttribute("y1", String(box.t));
    line.setAttribute("y2", String(box.t + box.h));
  }

  function hideHover(): void {
    tip.hidden = true;
    svg.querySelector("[data-ck-crosshair]")?.remove();
  }

  function absoluteIndex(local: number): number {
    return lo + local;
  }

  function rebuild(): void {
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
    const ns = "http://www.w3.org/2000/svg";
    for (const item of series) {
      if (!hidden.has(item.name) || visible.has(item.name)) continue;
      const swatch = document.createElementNS(ns, "rect");
      swatch.setAttribute("data-ck-hidden-key", item.name);
      swatch.setAttribute("x", String(x));
      swatch.setAttribute("y", String(y - 9));
      swatch.setAttribute("width", "10");
      swatch.setAttribute("height", "10");
      swatch.setAttribute("rx", "2");
      swatch.setAttribute("fill", "var(--ck-series-1, #007aff)");
      swatch.setAttribute("opacity", "0.35");
      const text = document.createElementNS(ns, "text");
      text.setAttribute("data-ck-hidden-key", item.name);
      text.setAttribute("x", String(x + 16));
      text.setAttribute("y", String(y));
      text.setAttribute("font-size", "12");
      text.setAttribute("opacity", "0.35");
      text.textContent = item.name;
      text.style.cursor = "pointer";
      svg.append(swatch, text);
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
    if (base.type === "donut") {
      const path = (event.target as Element | null)?.closest?.("path[aria-label]");
      if (!path) {
        hideHover();
        return;
      }
      const label = path.getAttribute("aria-label") || "";
      placeTip(event.clientX, event.clientY, label.split(":")[0]?.trim() || "", [
        { name: "", text: label, color: path.getAttribute("fill") || "var(--ck-series-1, #007aff)" },
      ]);
      return;
    }
    if (!showTip && !showCross && !keys) return;
    const point = viewPoint(svg, event.clientX, event.clientY);
    const horizontal = isRecord(base.mark) && base.mark.orientation === "horizontal";
    const local = lookupIndex(hover, horizontal ? point.y : point.x);
    const index = Math.min(n - 1, Math.max(0, absoluteIndex(local)));
    focus = index;
    const title = xText(index);
    const rows = entriesAt(index, point.y);
    if (showTip) placeTip(event.clientX, event.clientY, title, rows);
    const px = hover.uniform ? hover.left + (hover.width / Math.max(1, hover.count)) * (local + 0.5) : hover.order ? point.x : hover.xs[local] ?? point.x;
    moveCross(px);
  }

  function announce(index: number): void {
    const rows = entriesAt(index, null);
    live.textContent = `${xText(index)}: ${rows.map((row) => `${row.name} ${row.text}`.trim()).join(", ")}`;
  }

  rebuild();
  paintTable();
  const enter = durationMs(spec, n);
  if (enter > 0) {
    svg.style.opacity = "0";
    requestAnimationFrame(() => {
      svg.style.transition = `opacity ${enter}ms ease-out`;
      svg.style.opacity = "1";
    });
  }

  if (showTip || showCross) {
    on(svg, "pointermove", hoverMove as EventListener);
    on(svg, "pointerleave", () => hideHover());
  }
  if (keys) {
    on(svg, "keydown", ((event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      focus = event.key === "ArrowRight" ? Math.min(hi, focus + 1) : Math.max(lo, focus - 1);
      announce(focus);
      const local = focus - lo;
      moveCross(hover.uniform ? hover.left + (hover.width / Math.max(1, hover.count)) * (local + 0.5) : hover.xs[local] ?? box.l);
      if (showTip) {
        const rows = entriesAt(focus, null);
        const bounds = svg.getBoundingClientRect();
        placeTip(bounds.left + 24, bounds.top + 24, xText(focus), rows);
      }
    }) as EventListener);
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
  if (dataTable) {
    on(tableBtn, "click", () => {
      const open = tableEl.classList.toggle("ck-clip");
      tableBtn.textContent = open ? "Show data table" : "Hide data table";
    });
  }

  let drag: { kind: "pan" | "brush"; x: number; lo: number; hi: number } | null = null;
  if (zooming || brush) {
    on(svg, "wheel", ((event: WheelEvent) => {
      if (!zooming) return;
      try {
        event.preventDefault();
      } catch {
        /* A passive listener must not block the zoom. */
      }
      const point = viewPoint(svg, event.clientX, event.clientY);
      const local = lookupIndex(hover, point.x);
      zoomAt(local, event.deltaY > 0 ? 1.25 : 0.8);
    }) as EventListener, { passive: false });
    on(svg, "dblclick", ((event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.("text")) return;
      resetRange();
    }) as EventListener);
    on(svg, "pointerdown", ((event: PointerEvent) => {
      if (event.button !== 0) return;
      const brushing = brush && (!pan || event.shiftKey || !zooming);
      const panning = pan && !brushing && (lo > 0 || hi < n - 1);
      if (!brushing && !panning) return;
      drag = { kind: brushing ? "brush" : "pan", x: viewPoint(svg, event.clientX, event.clientY).x, lo, hi };
      svg.setPointerCapture?.(event.pointerId);
    }) as EventListener);
    on(svg, "pointermove", ((event: PointerEvent) => {
      if (!drag) return;
      const x = viewPoint(svg, event.clientX, event.clientY).x;
      if (drag.kind === "brush") {
        let mark = svg.querySelector("[data-ck-brush]");
        if (!mark) {
          mark = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          mark.setAttribute("data-ck-brush", "");
          mark.setAttribute("fill", "rgb(0 122 255 / .16)");
          mark.setAttribute("stroke", "#007aff");
          svg.append(mark);
        }
        const left = Math.min(drag.x, x);
        mark.setAttribute("x", String(left));
        mark.setAttribute("y", String(box.t));
        mark.setAttribute("width", String(Math.abs(x - drag.x)));
        mark.setAttribute("height", String(box.h));
        return;
      }
      const len = drag.hi - drag.lo + 1;
      const delta = Math.round(((drag.x - x) / Math.max(1, box.w)) * len);
      let start = drag.lo + delta;
      let end = drag.hi + delta;
      if (start < 0) {
        end -= start;
        start = 0;
      }
      if (end > n - 1) {
        start -= end - (n - 1);
        end = n - 1;
      }
      start = Math.max(0, start);
      if (start === lo && end === hi) return;
      lo = start;
      hi = end;
      redraw();
    }) as EventListener);
    on(svg, "pointerup", ((event: PointerEvent) => {
      if (!drag) return;
      const state = drag;
      drag = null;
      svg.querySelector("[data-ck-brush]")?.remove();
      if (state.kind === "brush") {
        const x = viewPoint(svg, event.clientX, event.clientY).x;
        const a = lookupIndex(hover, Math.min(state.x, x));
        const b = lookupIndex(hover, Math.max(state.x, x));
        const start = lo + Math.min(a, b);
        const end = lo + Math.max(a, b);
        if (end > start) {
          lo = Math.max(0, start);
          hi = Math.min(n - 1, end);
          redraw();
        }
      }
      emit("rangechange", rangeDetail());
    }) as EventListener);
  }

  const pointers = new Map<number, { x: number; y: number }>();
  let pinch = 0;
  if (zooming) {
    on(svg, "pointerdown", ((event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) pinch = pairDistance(pointers);
    }) as EventListener);
    on(svg, "pointermove", ((event: PointerEvent) => {
      if (!pointers.has(event.pointerId) || pointers.size < 2) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const next = pairDistance(pointers);
      if (pinch > 0 && next > 0) {
        const point = viewPoint(svg, event.clientX, event.clientY);
        zoomAt(lookupIndex(hover, point.x), pinch / next);
        pinch = next;
      }
    }) as EventListener);
    on(svg, "pointerup", ((event: PointerEvent) => {
      pointers.delete(event.pointerId);
      pinch = 0;
    }) as EventListener);
    on(svg, "pointercancel", ((event: PointerEvent) => {
      pointers.delete(event.pointerId);
      pinch = 0;
    }) as EventListener);
  }

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
        rebuild();
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
      svg.querySelector("[data-ck-crosshair]")?.remove();
      svg.querySelector("[data-ck-brush]")?.remove();
      svg.removeAttribute("tabindex");
      host.removeAttribute("data-ck-interact");
    },
  };
}

function pairDistance(points: Map<number, { x: number; y: number }>): number {
  const all = [...points.values()];
  if (all.length < 2) return 0;
  const dx = all[0].x - all[1].x;
  const dy = all[0].y - all[1].y;
  return Math.hypot(dx, dy);
}
