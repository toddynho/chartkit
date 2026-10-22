/** Shared SVG primitives. Renderers import this module, not each other. */
import { capturing } from "./canvas/scene-hook";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Explicit `scale.domain` ends. `null` leaves that end automatic. */
export function domainEnds(domain: unknown): [number | null, number | null] | undefined {
  if (!Array.isArray(domain)) return;
  const lo = domain[0];
  const hi = domain[1];
  const end = (value: unknown): value is number | null => value === null || (typeof value === "number" && Number.isFinite(value));
  return end(lo) && end(hi) ? [lo, hi] : undefined;
}

export function clipPath(id: string, x: number, y: number, w: number, h: number): string {
  return `<clipPath id="${id}"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" /></clipPath>`;
}

export function n(value: number): string {
  const r = Math.round(value * 100);
  const a = r < 0 ? -r : r;
  if (a !== a || a > 1e7) return Number.isFinite(value) ? String(r / 100) : "0";
  const w = (a / 100) | 0;
  const f = a % 100;
  const s = r < 0 ? "-" : "";
  return f ? s + w + "." + (f < 10 ? "0" : "") + (f % 10 ? f : f / 10) : s + w;
}

export function font(): string {
  return "var(--ck-font-family, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif)";
}

export function hash(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h) ^ value.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/** Clip id for one plot box. Charts that share an alt still need distinct ids in one document. */
export function boxId(id: string, x: number, y: number, w: number, h: number): string {
  return id + hash((x | 0) + "," + (y | 0) + "," + (w | 0) + "," + (h | 0));
}

export function round(value: number): number {
  return Math.round(value * 1e8) / 1e8;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function linear(d0: number, d1: number, r0: number, r1: number): (value: number) => number {
  const span = d1 - d0 || 1;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

export function niceNum(range: number, roundTo: boolean): number {
  if (!(range > 0) || !Number.isFinite(range)) return 1;
  const exp = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exp;
  let nice: number;
  if (roundTo) {
    if (fraction < 1.5) nice = 1;
    else if (fraction < 3) nice = 2;
    else if (fraction < 7) nice = 5;
    else nice = 10;
  } else if (fraction <= 1) nice = 1;
  else if (fraction <= 2) nice = 2;
  else if (fraction <= 5) nice = 5;
  else nice = 10;
  return nice * 10 ** exp;
}

export function niceDomain(min: number, max: number): [number, number] {
  const span = niceNum(max - min, false);
  const step = niceNum(span / 4, true) || 1;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  return [round(niceMin), round(niceMax === niceMin ? niceMin + step : niceMax)];
}

/** Positive domain on a log scale, padded so a point is not stuck to the spine. Never includes 0. */
export function logNice(min: number, max: number): [number, number] {
  const lo = Math.log10(Math.max(min, Number.MIN_VALUE));
  const hi = Math.log10(Math.max(max, min, Number.MIN_VALUE));
  const pad = 0.15;
  const start = 10 ** (Math.min(lo, hi) - pad);
  const end = 10 ** (Math.max(lo, hi) + pad);
  return end > start ? [start, end] : [start, start * 10];
}

export function logScale(d0: number, d1: number, r0: number, r1: number): (value: number) => number {
  const a = Math.log10(Math.max(d0, Number.MIN_VALUE));
  const b = Math.log10(Math.max(d1, d0 * 1.0000001));
  const span = b - a || 1;
  return (value) => r0 + ((Math.log10(Math.max(value, Number.MIN_VALUE)) - a) / span) * (r1 - r0);
}

/** Signed log. `constant` is the half-width of the linear region around zero. */
export function symlogScale(d0: number, d1: number, r0: number, r1: number, constant = 1): (value: number) => number {
  const c = constant > 0 ? constant : 1;
  const a = Math.asinh(d0 / c);
  const b = Math.asinh(d1 / c);
  const span = b - a || 1;
  return (value) => r0 + ((Math.asinh(value / c) - a) / span) * (r1 - r0);
}

/** Ticks at zero and at powers of ten times the symlog constant. */
export function symlogTicks(min: number, max: number, constant = 1): number[] {
  const c = constant > 0 ? constant : 1;
  const out: number[] = [];
  const push = (value: number) => {
    if (value < min - 1e-6 || value > max + 1e-6) return;
    const next = round(value);
    if (!out.includes(next)) out.push(next);
  };
  push(0);
  for (let exp = -1; exp <= 6; exp++) {
    const step = c * 10 ** exp;
    push(-step);
    push(step);
  }
  if (out.length < 2) return ticks(min, max, 5);
  out.sort((a, b) => a - b);
  return out.slice(0, 8);
}

export interface AxisGap {
  from: number;
  to: number;
  /** Fraction of the axis for the segment below this break. Default 0.4. */
  share?: number;
}

function tidyGaps(gaps: AxisGap[], lo: number, hi: number): AxisGap[] {
  const list = gaps
    .filter((gap) => gap.to !== gap.from)
    .map((gap) => {
      const share = gap.share;
      return gap.from < gap.to ? { from: gap.from, to: gap.to, share } : { from: gap.to, to: gap.from, share };
    })
    .filter((gap) => gap.to > lo && gap.from < hi)
    .sort((a, b) => a.from - b.from);
  const out: AxisGap[] = [];
  for (const gap of list) {
    const last = out[out.length - 1];
    if (last && gap.from < last.to) continue;
    const from = Math.max(gap.from, lo);
    const to = Math.min(gap.to, hi);
    if (to > from) out.push({ from, to, share: gap.share });
  }
  return out;
}

/**
 * Pixel weights for data segments and the gaps between them.
 * Each break keeps about 16 px. The segment below a break takes `share` of the
 * axis (default 0.4) so a short lower range is not crushed against the gap.
 */
function breakWeights(pieces: { a: number; b: number; gap: boolean; share?: number }[], spanPx: number): number[] {
  const gapFrac = Math.min(0.08, 16 / Math.max(spanPx, 1));
  const fracs = new Array<number>(pieces.length).fill(0);
  let gapSum = 0;
  for (let i = 0; i < pieces.length; i++) {
    if (!pieces[i].gap) continue;
    fracs[i] = gapFrac;
    gapSum += gapFrac;
  }
  const claimed = new Set<number>();
  let claim = 0;
  for (let i = 0; i < pieces.length; i++) {
    if (!pieces[i].gap) continue;
    let below = i - 1;
    while (below >= 0 && pieces[below].gap) below--;
    if (below < 0 || claimed.has(below)) continue;
    const raw = pieces[i].share;
    const share = typeof raw === "number" && raw > 0 ? Math.min(0.7, Math.max(0.15, raw)) : 0.4;
    fracs[below] = share;
    claimed.add(below);
    claim += share;
  }
  const rest: number[] = [];
  for (let i = 0; i < pieces.length; i++) if (!pieces[i].gap && !claimed.has(i)) rest.push(i);
  const reserve = 0.18 * Math.max(1, rest.length);
  const cap = Math.max(0.2, 1 - gapSum - reserve);
  if (claim > cap && claim > 0) {
    const scale = cap / claim;
    for (const index of claimed) fracs[index] *= scale;
    claim *= scale;
  }
  const room = Math.max(0, 1 - gapSum - claim);
  let width = 0;
  for (const index of rest) width += Math.max(pieces[index].b - pieces[index].a, 1e-9);
  if (!(width > 0)) width = rest.length || 1;
  for (const index of rest) fracs[index] = room * (Math.max(pieces[index].b - pieces[index].a, 1e-9) / width);
  if (!rest.length) {
    let last = -1;
    for (let i = 0; i < pieces.length; i++) if (!pieces[i].gap) last = i;
    if (last >= 0) fracs[last] += Math.max(0, 1 - gapSum - claim);
  }
  return fracs;
}

/**
 * Map a domain onto a range, collapsing each break to a short fraction of the span.
 * `spans` are the pixel intervals of those breaks, low to high.
 */
export function brokenScale(
  d0: number,
  d1: number,
  r0: number,
  r1: number,
  gaps: AxisGap[] | undefined,
  kind: "linear" | "log" | "symlog",
  constant = 1,
): { at: (value: number) => number; spans: Array<[number, number]> } {
  const plain = kind === "log" ? logScale(d0, d1, r0, r1) : kind === "symlog" ? symlogScale(d0, d1, r0, r1, constant) : linear(d0, d1, r0, r1);
  const c = constant > 0 ? constant : 1;
  const fwd = (value: number) => (kind === "log" ? Math.log10(Math.max(value, 1e-12)) : kind === "symlog" ? Math.asinh(value / c) : value);
  const a0 = fwd(d0);
  const a1 = fwd(d1);
  if (!(gaps && gaps.length) || a0 === a1) return { at: plain, spans: [] };
  const lo = Math.min(d0, d1);
  const hi = Math.max(d0, d1);
  const cuts = tidyGaps(gaps, lo, hi);
  if (!cuts.length) return { at: plain, spans: [] };
  const start = Math.min(a0, a1);
  const end = Math.max(a0, a1);
  const pieces: { a: number; b: number; gap: boolean }[] = [];
  let cursor = start;
  for (const gap of cuts) {
    const from = Math.max(Math.min(fwd(gap.from), fwd(gap.to)), start);
    const to = Math.min(Math.max(fwd(gap.from), fwd(gap.to)), end);
    if (!(to > from)) continue;
    if (from > cursor) pieces.push({ a: cursor, b: from, gap: false });
    pieces.push({ a: from, b: to, gap: true, share: gap.share });
    cursor = to;
  }
  if (cursor < end) pieces.push({ a: cursor, b: end, gap: false });
  if (!pieces.some((piece) => piece.gap)) return { at: plain, spans: [] };
  const weights = breakWeights(pieces, Math.abs(r1 - r0) || 1);
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const starts: number[] = [];
  let acc = 0;
  for (const weight of weights) {
    starts.push(acc / total);
    acc += weight;
  }
  const unit = (value: number) => {
    const x = Math.min(end, Math.max(start, fwd(value)));
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (x > piece.b && i < pieces.length - 1) continue;
      const u = piece.b === piece.a ? 0 : (x - piece.a) / (piece.b - piece.a);
      return starts[i] + Math.max(0, Math.min(1, u)) * (weights[i] / total);
    }
    return 0;
  };
  const at = (value: number) => {
    const u = a0 <= a1 ? unit(value) : 1 - unit(value);
    return r0 + u * (r1 - r0);
  };
  const spans: Array<[number, number]> = [];
  for (let i = 0; i < pieces.length; i++) {
    if (!pieces[i].gap) continue;
    const share = weights[i] / total;
    const u0 = a0 <= a1 ? starts[i] : 1 - (starts[i] + share);
    const u1 = a0 <= a1 ? starts[i] + share : 1 - starts[i];
    spans.push([r0 + Math.min(u0, u1) * (r1 - r0), r0 + Math.max(u0, u1) * (r1 - r0)]);
  }
  return { at, spans };
}

export function logTicks(min: number, max: number): number[] {
  if (!(max > 0) || !(min > 0)) return [1];
  const start = Math.floor(Math.log10(min));
  const end = Math.ceil(Math.log10(max));
  const multipliers = end - start <= 4 ? [1, 2, 5] : [1];
  const out: number[] = [];
  for (let exp = start; exp <= end; exp++) {
    for (const factor of multipliers) {
      const value = factor * 10 ** exp;
      if (value >= min * 0.999 && value <= max * 1.001) out.push(value);
      if (out.length > 8) return out;
    }
  }
  return out.length > 0 ? out : [min, max];
}

function stepTicks(min: number, max: number, step: number): number[] {
  if (!(step > 0)) return [];
  const start = Math.ceil((min - step * 1e-8) / step) * step;
  const out: number[] = [];
  for (let value = start; value <= max + step * 1e-6; value += step) {
    const next = round(value);
    if (next < min - step * 1e-6) continue;
    out.push(Object.is(next, -0) ? 0 : next);
    if (out.length > 12) break;
  }
  return out;
}

/**
 * Nice ticks for a domain. A short whole-number span keeps a step of 1 or 2,
 * so a 2–5 point series does not pick up 8.5 labels or skip the data.
 * Wider domains keep the usual 1-2-5 step.
 */
export function ticks(min: number, max: number, count: number): number[] {
  if (count <= 0) return [];
  if (!(max > min) || !Number.isFinite(min) || !Number.isFinite(max)) return [Object.is(round(min), -0) ? 0 : round(min)];
  const near = (value: number) => Math.abs(value - Math.round(value)) <= 0.35;
  if (near(min) && near(max)) {
    const lo = Math.round(min);
    const hi = Math.round(max);
    const width = hi - lo;
    if (width >= 1 && width <= 12) {
      const step = width <= 7 ? 1 : 2;
      const list = stepTicks(Math.min(lo, min), Math.max(hi, max), step).filter((value) => value >= min - 1e-6 && value <= max + 1e-6);
      if (list.length >= 2) return list;
    }
  }
  const step = niceNum((max - min) / Math.max(1, count - 1), true) || 1;
  const start = Math.ceil((min - step * 1e-8) / step) * step;
  const out: number[] = [];
  for (let value = start; value <= max + step * 1e-6; value += step) {
    const next = round(value);
    if (next + step * 1e-8 < min) continue;
    out.push(Object.is(next, -0) ? 0 : next);
    if (out.length > 12) break;
  }
  return out.length > 0 ? out : [min, max];
}

export interface ScalePad {
  min: number;
  max: number;
}

/** Fraction of the span added past the data. A number pads both ends. */
export function scalePad(channel: unknown): ScalePad | null {
  if (!isRecord(channel) || !isRecord(channel.scale)) return null;
  const pad = channel.scale.padding;
  const frac = (value: unknown) => (typeof value === "number" && value > 0 && Number.isFinite(value) ? Math.min(1, value) : 0);
  if (typeof pad === "number") {
    const amount = frac(pad);
    return amount > 0 ? { min: amount, max: amount } : null;
  }
  if (!isRecord(pad)) return null;
  const min = frac(pad.min);
  const max = frac(pad.max);
  return min > 0 || max > 0 ? { min, max } : null;
}

/** True when clamp can pull marks to an explicit domain edge. */
export function scaleClamp(channel: unknown): boolean {
  if (!isRecord(channel) || !isRecord(channel.scale) || channel.scale.clamp !== true) return false;
  return domainEnds(channel.scale.domain) !== undefined;
}

/** Grows an extent by `pad`. A locked end stays put. */
export function padExtent(min: number, max: number, pad: ScalePad | null, lock?: [number | null, number | null] | null): [number, number] {
  if (!pad) return [min, max];
  const span = max > min ? max - min : Math.abs(max) || 1;
  let lo = min;
  let hi = max;
  if (!(lock && typeof lock[0] === "number")) lo = round(min - span * pad.min);
  if (!(lock && typeof lock[1] === "number")) hi = round(max + span * pad.max);
  return hi > lo ? [lo, hi] : [min, max];
}

/** 0° is the top of the circle; positive angles run clockwise. */
export function polar(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/** Open stroke arc. A full turn is drawn as two semicircles. */
export function arcStroke(cx: number, cy: number, radius: number, start: number, end: number): string {
  let span = end - start;
  while (span <= 0) span += 360;
  if (span >= 359.99) {
    const a = polar(cx, cy, radius, start);
    const b = polar(cx, cy, radius, start + 180);
    return `M ${n(a.x)} ${n(a.y)} A ${n(radius)} ${n(radius)} 0 1 1 ${n(b.x)} ${n(b.y)} A ${n(radius)} ${n(radius)} 0 1 1 ${n(a.x)} ${n(a.y)}`;
  }
  const from = polar(cx, cy, radius, start);
  const to = polar(cx, cy, radius, start + span);
  const large = span > 180 ? 1 : 0;
  return `M ${n(from.x)} ${n(from.y)} A ${n(radius)} ${n(radius)} 0 ${large} 1 ${n(to.x)} ${n(to.y)}`;
}

export interface ChartOpen {
  width: number;
  height: number;
  responsive: boolean;
  alt: string;
  title?: string;
  type: string;
  id: string;
  renderer: string;
  exportMark?: string;
  /** Marks will hydrate onto a canvas. Chrome in this SVG stays the accessible picture. */
  canvas?: boolean;
}

export function openChart(chart: ChartOpen): string {
  const width = chart.responsive ? "100%" : String(chart.width);
  const label = chart.alt || chart.title || chart.type;
  const exported = chart.exportMark ? ` data-ck-export="${esc(chart.exportMark)}"` : "";
  const canvas = chart.canvas ? ` data-ck-render="canvas"` : "";
  const scene = capturing() ? ` data-ck-scene="1"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${chart.height}" viewBox="0 0 ${n(chart.width)} ${n(chart.height)}" role="img" aria-label="${esc(label)}" class="ck-chart" data-ck-type="${esc(chart.type)}" data-ck-renderer="${esc(chart.renderer)}" data-ck-id="${chart.id}"${exported}${canvas}${scene} style="font-variant-numeric:tabular-nums;font-feature-settings:'tnum'">` +
    `<title>${esc(chart.title || chart.alt)}</title><desc>${esc(chart.alt)}</desc>`
  );
}

export function closeChart(): string {
  return "</svg>";
}

export interface AxisRule {
  on: boolean;
  color?: string;
  width?: number;
  dash?: string;
}

export interface AxisSpec {
  on: boolean;
  title?: string;
  count?: number;
  values?: number[];
  labels: boolean;
  /** Right or top, rather than the default left or bottom. */
  end: boolean;
  rotate?: number;
  /** start, center, or end. */
  titleAt?: string;
  titleSpin?: number;
  /** true forces skip, false draws every label, omitted keeps the tilt default on x. */
  skip?: boolean;
  wrapW?: number;
  wrapN?: number;
  rule?: AxisRule;
  /** inside, outside, or none. */
  tick?: string;
  tickLen?: number;
  /** Positive shifts the baseline away from the plot, in pixels. */
  offset?: number;
  /** Data value where this axis crosses the other. */
  crosses?: number;
  /** Minor marks between major ticks. */
  minor?: number;
  breaks?: AxisGap[];
}

function axisRule(value: unknown): AxisRule | undefined {
  if (value === true) return { on: true };
  if (value === false) return { on: false };
  if (!isRecord(value)) return undefined;
  const dash = value.dash === "dashed" || value.dash === "dotted" || value.dash === "solid" ? value.dash : undefined;
  const width = typeof value.width === "number" && Number.isFinite(value.width) ? Math.max(0, Math.min(8, value.width)) : undefined;
  const color = typeof value.color === "string" && value.color ? value.color : undefined;
  if (value.show === false) return { on: false, color, width, dash };
  const on = value.show === true || color !== undefined || width !== undefined || dash !== undefined;
  return { on, color, width, dash };
}

/** Axis box from `axes.x`, `axes.y`, or `axes.y2`. Perpendicular sides map onto that axis. */
export function readAxis(spec: Record<string, unknown>, key: "x" | "y" | "y2", horizontal = false): AxisSpec {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const raw = axes ? axes[key] : undefined;
  const axis = isRecord(raw) ? raw : {};
  const ticks = axis.ticks;
  const values = Array.isArray(ticks) ? ticks.filter((item): item is number => typeof item === "number" && Number.isFinite(item)) : undefined;
  const pos = axis.position;
  const drawnVertical = key === "x" ? horizontal : !horizontal;
  let end = key === "y2";
  if (pos === "right" || pos === "top" || pos === "left" || pos === "bottom") {
    end = drawnVertical ? pos === "right" || pos === "top" : pos === "top" || pos === "left";
  }
  const at = axis.titlePosition;
  const marks = axis.tickMarks;
  const offset = typeof axis.offset === "number" && Number.isFinite(axis.offset) ? Math.max(-80, Math.min(80, axis.offset)) : undefined;
  const crosses = typeof axis.crosses === "number" && Number.isFinite(axis.crosses) ? axis.crosses : undefined;
  const minor = typeof axis.minorTicks === "number" && Number.isFinite(axis.minorTicks) ? Math.max(0, Math.min(8, Math.round(axis.minorTicks))) : undefined;
  return {
    on: raw !== false,
    title: typeof axis.title === "string" && axis.title ? axis.title : undefined,
    count: typeof ticks === "number" ? Math.max(0, Math.min(50, Math.round(ticks))) : undefined,
    values: values && values.length ? values : undefined,
    labels: axis.labels !== false,
    end,
    rotate: typeof axis.rotate === "number" && Number.isFinite(axis.rotate) ? axis.rotate : undefined,
    titleAt: at === "start" || at === "end" || at === "center" ? at : undefined,
    titleSpin: typeof axis.titleRotate === "number" && Number.isFinite(axis.titleRotate) ? axis.titleRotate : undefined,
    skip: typeof axis.autoSkip === "boolean" ? axis.autoSkip : undefined,
    wrapW: typeof axis.labelWidth === "number" && Number.isFinite(axis.labelWidth) ? Math.max(0, Math.min(240, axis.labelWidth)) : undefined,
    wrapN: typeof axis.labelLines === "number" && Number.isFinite(axis.labelLines) ? Math.max(1, Math.min(6, Math.round(axis.labelLines))) : undefined,
    rule: axisRule(axis.line),
    tick: marks === "inside" || marks === "outside" || marks === "none" ? marks : undefined,
    tickLen: typeof axis.tickLength === "number" && Number.isFinite(axis.tickLength) ? Math.max(0, Math.min(24, axis.tickLength)) : undefined,
    offset,
    crosses,
    minor: minor || undefined,
    breaks: readBreaks(axis.breaks),
  };
}

function readBreaks(value: unknown): AxisGap[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out: AxisGap[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.from !== "number" || typeof item.to !== "number") continue;
    if (!Number.isFinite(item.from) || !Number.isFinite(item.to) || item.from === item.to) continue;
    const share = typeof item.share === "number" && Number.isFinite(item.share) ? item.share : undefined;
    out.push(item.from < item.to ? { from: item.from, to: item.to, share } : { from: item.to, to: item.from, share });
  }
  return out.length ? out : undefined;
}

export function pickTicks(min: number, max: number, count: number, values?: number[], log = false): number[] {
  if (values && values.length) return values.filter((value) => value >= min - 1e-6 && value <= max + 1e-6);
  if (count <= 0) return [];
  return log ? logTicks(min, max) : ticks(min, max, count);
}

export function readInset(spec: Record<string, unknown>): { t?: number; r?: number; b?: number; l?: number } {
  const size = isRecord(spec.size) ? spec.size : undefined;
  const pad = size?.padding;
  if (typeof pad === "number") return { t: pad, r: pad, b: pad, l: pad };
  if (!isRecord(pad)) return {};
  const side = (key: string) => (typeof pad[key] === "number" ? (pad[key] as number) : undefined);
  return { t: side("top"), r: side("right"), b: side("bottom"), l: side("left") };
}

/** Client-only options, recorded on the SVG so a static render does not drop them. */
export function clientIntent(spec: Record<string, unknown>): string {
  const bits: string[] = [];
  const a11y = isRecord(spec.a11y) ? spec.a11y : undefined;
  if (a11y?.keyboard === true) bits.push("keys");
  if (a11y?.dataTable === true) bits.push("table");
  if (isRecord(spec.legend) && spec.legend.interactive === true) bits.push("legend");
  if (spec.tooltip === false || isRecord(spec.tooltip)) bits.push("tip");
  if (spec.animation === true) bits.push("anim");
  else if (isRecord(spec.animation)) bits.push(typeof spec.animation.easing === "string" ? `anim:${spec.animation.easing}` : "anim");
  if (isRecord(spec.interaction)) bits.push("ix");
  return bits.join(" ");
}

export function longDesc(spec: Record<string, unknown>): string | undefined {
  const a11y = isRecord(spec.a11y) ? spec.a11y : undefined;
  return a11y && typeof a11y.description === "string" ? a11y.description : undefined;
}
