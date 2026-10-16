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

export function n(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function font(): string {
  return "var(--ck-font-family, ui-sans-serif)";
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
  type: string;
  id: string;
  renderer: string;
}

export function openChart(chart: ChartOpen): string {
  const width = chart.responsive ? "100%" : String(chart.width);
  const label = chart.alt || chart.title || chart.type;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${chart.height}" viewBox="0 0 ${n(chart.width)} ${n(chart.height)}" role="img" aria-label="${esc(label)}" class="ck-chart" data-ck-type="${esc(chart.type)}" data-ck-renderer="${esc(chart.renderer)}" data-ck-id="${chart.id}">` +
    `<title>${esc(chart.title || chart.alt)}</title><desc>${esc(chart.alt)}</desc>`
  );
}

export function closeChart(): string {
  return "</svg>";
}
