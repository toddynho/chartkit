/** Shared SVG primitives. Renderers import this module, not each other. */

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

export function ticks(min: number, max: number, count: number): number[] {
  if (!(max > min)) return [min];
  const step = niceNum((max - min) / Math.max(1, count - 1), true) || 1;
  const start = Math.ceil((min - step * 1e-8) / step) * step;
  const out: number[] = [];
  for (let value = start; value <= max + step * 1e-6; value += step) {
    const next = round(value);
    if (next + step * 1e-8 < min) continue;
    out.push(next);
    if (out.length > 12) break;
  }
  return out.length > 0 ? out : [min, max];
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
  description?: string;
  intent?: string;
  type: string;
  id: string;
  renderer: string;
}

export function openChart(chart: ChartOpen): string {
  const width = chart.responsive ? "100%" : String(chart.width);
  const label = chart.alt || chart.title || chart.type;
  const described = chart.description ? ` aria-describedby="${chart.id}-d"` : "";
  const intent = chart.intent ? ` data-ck-intent="${esc(chart.intent)}"` : "";
  const desc = chart.description
    ? `<desc id="${chart.id}-d">${esc(chart.description)}</desc>`
    : `<desc>${esc(chart.alt)}</desc>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${chart.height}" viewBox="0 0 ${n(chart.width)} ${n(chart.height)}" role="img" aria-label="${esc(label)}"${described} class="ck-chart" data-ck-type="${esc(chart.type)}" data-ck-renderer="${esc(chart.renderer)}" data-ck-id="${chart.id}"${intent} style="font-variant-numeric:tabular-nums;font-feature-settings:'tnum'">` +
    `<title>${esc(chart.title || chart.alt)}</title>${desc}`
  );
}

export function closeChart(): string {
  return "</svg>";
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
  return {
    on: raw !== false,
    title: typeof axis.title === "string" && axis.title ? axis.title : undefined,
    count: typeof ticks === "number" ? Math.max(0, Math.min(50, Math.round(ticks))) : undefined,
    values: values && values.length ? values : undefined,
    labels: axis.labels !== false,
    end,
    rotate: typeof axis.rotate === "number" && Number.isFinite(axis.rotate) ? axis.rotate : undefined,
  };
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
  if (spec.animation === true || isRecord(spec.animation)) bits.push("anim");
  if (isRecord(spec.interaction)) bits.push("ix");
  return bits.join(" ");
}

export function longDesc(spec: Record<string, unknown>): string | undefined {
  const a11y = isRecord(spec.a11y) ? spec.a11y : undefined;
  return a11y && typeof a11y.description === "string" ? a11y.description : undefined;
}
