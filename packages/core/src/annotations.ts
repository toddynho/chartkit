import { cssVar, paint, type PresetTokens } from "./theme";
import { esc, font, isRecord, n } from "./svg";

export interface PlotBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Pt {
  x: number;
  y: number;
}

export interface NoteSeries {
  name: string;
  axis: "y" | "y2";
  pts: Pt[];
}

export interface AnnotationGeom {
  plot: PlotBox;
  preset: PresetTokens;
  xAt: (value: number | string) => number | null;
  yAt: (value: number | string, axis: "y" | "y2") => number | null;
  samples?: NoteSeries[];
  labels?: string[];
  temporal?: boolean;
  xNum?: ArrayLike<number | null> | null;
  slot?: (index: number) => { start: number; size: number };
  count?: number;
  flip?: boolean;
  bands?: { x?: unknown; y?: unknown; y2?: unknown };
  /** Boxes already taken by series labels, so a fit label can step aside. */
  taken?: Box[];
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Trend lines, regressions, and markers look up a series point. Bands and rules do not. */
export function notesNeedSamples(notes: unknown): boolean {
  if (!Array.isArray(notes)) return false;
  for (let i = 0; i < notes.length; i++) {
    const item = notes[i];
    if (!isRecord(item)) continue;
    if (item.type === "trendline" || item.type === "regression" || item.type === "marker") return true;
  }
  return false;
}

/** Bands sit under the marks. Rules, fits, and callouts sit above, outside the plot clip. */
export function annotationLayers(notes: unknown, geom: AnnotationGeom): { under: string; over: string } {
  const under: string[] = [];
  const over: string[] = [];
  const boxes: Box[] = geom.taken ? geom.taken.map((box) => ({ x: box.x, y: box.y, w: box.w, h: box.h })) : [];
  paintAxisBands(geom, under, over, boxes);
  if (Array.isArray(notes)) {
    for (const item of notes) {
      if (!isRecord(item)) continue;
      if (item.type === "band") rangeBand(item, geom, under, over, boxes);
      else if (item.type === "rule") rule(item, geom, over, boxes);
      else if (item.type === "text") textNote(item, geom, over);
      else if (item.type === "trendline") trend(item, geom, over, boxes);
      else if (item.type === "regression") regress(item, geom, under, over, boxes);
      else if (item.type === "marker") callout(item, geom, over, boxes);
    }
  }
  return { under: under.join(""), over: over.join("") };
}

/** Category index, or the numeric x already stored on a series. Nulls drop out. */
export function seriesPoints(xs: ArrayLike<number | null> | null, ys: ArrayLike<number | null>): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < ys.length; i++) {
    const y = ys[i];
    const x = xs ? xs[i] : i;
    if (typeof y !== "number" || typeof x !== "number" || y !== y || x !== x) continue;
    out.push({ x, y });
  }
  return out;
}

function paintAxisBands(geom: AnnotationGeom, under: string[], over: string[], boxes: Box[]): void {
  const bands = geom.bands;
  if (!bands) return;
  paintOne("x", bands.x, geom, under, over, boxes);
  paintOne("y", bands.y, geom, under, over, boxes);
  paintOne("y2", bands.y2, geom, under, over, boxes);
}

function paintOne(axis: "x" | "y" | "y2", bands: unknown, geom: AnnotationGeom, under: string[], over: string[], boxes: Box[]): void {
  if (bands === "weekends") {
    if (axis === "x") weekends(geom, under, over, boxes);
    return;
  }
  if (!Array.isArray(bands)) return;
  for (const item of bands) {
    if (!isRecord(item)) continue;
    shade(axis, item.from, item.to, item, geom, under, over, boxes, "axis-band");
  }
}

function weekends(geom: AnnotationGeom, under: string[], over: string[], boxes: Box[]): void {
  const color = cssVar("muted", geom.preset.muted);
  const paintSpan = (from: number, to: number, label: string) => {
    shade("x", from, to, { color, opacity: 0.1, label }, geom, under, over, boxes, "axis-band");
  };
  if (geom.temporal && geom.xNum) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < geom.xNum.length; i++) {
      const value = geom.xNum[i];
      if (typeof value !== "number" || value !== value) continue;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    if (min === Infinity) return;
    for (const [from, to] of weekendSpans(min, max)) paintSpan(from, to, "Weekend");
    return;
  }
  const labels = geom.labels;
  const slot = geom.slot;
  if (!labels || !slot) return;
  let run = -1;
  const flush = (end: number) => {
    if (run < 0) return;
    const a = slot(run);
    const b = slot(end);
    shade("x", a.start, b.start + b.size, { color, opacity: 0.1, label: "Weekend" }, geom, under, over, boxes, "axis-band", true);
    run = -1;
  };
  for (let i = 0; i < labels.length; i++) {
    const day = parseDay(labels[i] ?? "");
    const weekend = day !== null && (new Date(day).getUTCDay() === 0 || new Date(day).getUTCDay() === 6);
    if (weekend && run < 0) run = i;
    if (!weekend) flush(i - 1);
  }
  flush(labels.length - 1);
}

function weekendSpans(min: number, max: number): [number, number][] {
  const day = 86400000;
  const start = Math.floor(min / day) * day;
  const out: [number, number][] = [];
  let open: number | null = null;
  for (let t = start; t <= max + day; t += day) {
    const dow = new Date(t).getUTCDay();
    const on = dow === 0 || dow === 6;
    if (on && open === null) open = Math.max(t, min);
    if (!on && open !== null) {
      out.push([open, Math.min(t, max)]);
      open = null;
    }
  }
  if (open !== null) out.push([open, max]);
  return out.filter(([from, to]) => to > from);
}

function parseDay(value: string): number | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  if (!/\d{4}/.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rangeBand(item: Record<string, unknown>, geom: AnnotationGeom, under: string[], over: string[], boxes: Box[]): void {
  shade(axisOf(item), item.from, item.to, item, geom, under, over, boxes, "band");
}

function shade(
  axis: "x" | "y" | "y2",
  from: unknown,
  to: unknown,
  item: Record<string, unknown>,
  geom: AnnotationGeom,
  under: string[],
  over: string[],
  boxes: Box[],
  kind: string,
  pixels = false,
): void {
  const a = pixels && typeof from === "number" ? from : at(geom, axis, from, true);
  const b = pixels && typeof to === "number" ? to : at(geom, axis, to, true);
  if (a === null || b === null) return;
  const rect = clipRect(strip(axis, a, b, geom.plot, geom.flip), geom.plot);
  if (!rect) return;
  const opacity = typeof item.opacity === "number" ? item.opacity : 0.12;
  const color = markColor(item.color, geom.preset);
  under.push(`<rect data-ck-annotation="${kind}" x="${n(rect.x)}" y="${n(rect.y)}" width="${n(rect.w)}" height="${n(rect.h)}" fill="${color}" fill-opacity="${n(opacity)}" stroke="none" />`);
  if (typeof item.label === "string" && item.label) {
    const vertical = (axis === "x") !== Boolean(geom.flip);
    const x = vertical ? rect.x + 4 : rect.x + 4;
    const y = vertical ? geom.plot.top + 14 : rect.y + 14;
    over.push(label(item.label, x, y, "start", color, kind));
    boxes.push({ x, y: y - 11, w: item.label.length * 6.3, h: 14 });
  }
}

function rule(item: Record<string, unknown>, geom: AnnotationGeom, over: string[], boxes: Box[]): void {
  const axis = axisOf(item);
  const atPx = at(geom, axis, item.value, false);
  if (atPx === null) return;
  const color = markColor(item.color, geom.preset);
  const dash = dashAttr(item.dash, "dashed");
  const [x1, y1, x2, y2] = strokeAt(axis, atPx, geom.plot, geom.flip);
  over.push(`<line data-ck-annotation="rule" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="1"${dash} />`);
  if (typeof item.label !== "string") return;
  const where = item.labelPosition === "start" || item.labelPosition === "center" ? item.labelPosition : "end";
  const vertical = (axis === "x") !== Boolean(geom.flip);
  const { plot } = geom;
  if (vertical) {
    const y = where === "start" ? plot.bottom - 4 : where === "center" ? (plot.top + plot.bottom) / 2 : plot.top + 12;
    over.push(label(item.label, atPx + 4, y, "start", color));
    boxes.push({ x: atPx + 4, y: y - 11, w: item.label.length * 6.3, h: 14 });
    return;
  }
  const x = where === "start" ? plot.left + 4 : where === "center" ? (plot.left + plot.right) / 2 : plot.right - 4;
  const anchor = where === "start" ? "start" : where === "center" ? "middle" : "end";
  over.push(label(item.label, x, atPx - 4, anchor, color));
  const w = item.label.length * 6.3;
  boxes.push({ x: anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x, y: atPx - 16, w, h: 14 });
}

function textNote(item: Record<string, unknown>, geom: AnnotationGeom, over: string[]): void {
  if (typeof item.label !== "string") return;
  const xValue = typeof item.x === "number" || typeof item.x === "string" ? item.x : null;
  if (xValue === null) return;
  const x = geom.xAt(xValue);
  if (x === null) return;
  const y = typeof item.y === "number" || typeof item.y === "string" ? at(geom, "y", item.y, false) : geom.plot.top + 14;
  if (y === null) return;
  over.push(label(item.label, x, y, "start", markColor(item.color, geom.preset), "text"));
}

function trend(item: Record<string, unknown>, geom: AnnotationGeom, over: string[], boxes: Box[]): void {
  const pts = pickPts(geom, item);
  if (!pts || pts.length === 0) return;
  const method = item.method === "median" || item.method === "linear" ? item.method : "mean";
  const axis = item.axis === "y2" ? "y2" : "y";
  const color = markColor(item.color, geom.preset);
  const text = typeof item.label === "string" && item.label ? item.label : method === "median" ? "Median" : method === "linear" ? "Linear" : "Mean";
  if (method === "linear") {
    drawFit(geom, pts, axis, color, dashAttr(item.dash, "solid"), text, "trendline", false, "linear", 0.6, null, over, boxes);
    return;
  }
  const stat = method === "median" ? median(pts.map((pt) => pt.y)) : mean(pts.map((pt) => pt.y));
  const atPx = geom.yAt(stat, axis);
  if (atPx === null) return;
  const [x1, y1, x2, y2] = strokeAt(axis, atPx, geom.plot, geom.flip);
  over.push(`<line data-ck-annotation="trendline" data-ck-method="${method}" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="1.5"${dashAttr(item.dash, "dashed")} />`);
  placeLineLabel(text, x2, y2, axis, geom, color, "trendline", over, boxes);
}

function regress(item: Record<string, unknown>, geom: AnnotationGeom, under: string[], over: string[], boxes: Box[]): void {
  const pts = pickPts(geom, item);
  if (!pts || pts.length < 2) return;
  const method = item.method === "loess" ? "loess" : "linear";
  const axis = item.axis === "y2" ? "y2" : "y";
  const color = markColor(item.color, geom.preset);
  const text = typeof item.label === "string" && item.label ? item.label : method === "loess" ? "Loess" : "Linear fit";
  const frac = typeof item.bandwidth === "number" && item.bandwidth > 0 ? Math.min(1, item.bandwidth) : 0.6;
  drawFit(geom, pts, axis, color, dashAttr(item.dash, "solid"), text, "regression", item.band === true, method, frac, under, over, boxes);
}

function drawFit(
  geom: AnnotationGeom,
  pts: Pt[],
  axis: "y" | "y2",
  color: string,
  dash: string,
  text: string,
  kind: string,
  band: boolean,
  method: "linear" | "loess",
  frac: number,
  under: string[] | null,
  over: string[],
  boxes: Box[],
): void {
  const used = thin(pts.slice().sort((p, q) => p.x - q.x), 240);
  if (used.length < 2) return;
  const fit = method === "linear" ? linFit(used) : null;
  if (method === "linear" && !fit) return;
  const x0 = used[0]!.x;
  const x1 = used[used.length - 1]!.x;
  const steps = x0 === x1 ? 2 : Math.min(24, Math.max(8, used.length));
  const up: string[] = [];
  const dn: string[] = [];
  const mid: string[] = [];
  let last: [number, number] | null = null;
  const residual = band && method === "loess" ? loessSigma(used, frac) : 0;
  for (let i = 0; i < steps; i++) {
    const x = x0 + (x1 - x0) * (steps === 1 ? 0 : i / (steps - 1));
    const y = fit ? fit.a + fit.b * x : loessAt(used, x, frac);
    if (y === null) continue;
    const px = xPixel(geom, x);
    const py = geom.yAt(y, axis);
    if (px === null || py === null) continue;
    const [cx, cy] = inside(px, py, geom.plot);
    mid.push(`${n(cx)},${n(cy)}`);
    last = [cx, cy];
    if (!band || !under) continue;
    const delta = fit ? 1.96 * seAt(fit, x) : 1.96 * residual;
    const hi = geom.yAt(y + delta, axis);
    const lo = geom.yAt(y - delta, axis);
    if (hi === null || lo === null) continue;
    up.push(`${n(cx)} ${n(inside(px, hi, geom.plot)[1])}`);
    dn.push(`${n(cx)} ${n(inside(px, lo, geom.plot)[1])}`);
  }
  if (under && up.length > 1) {
    under.push(`<path data-ck-annotation="regression-band" d="M${up.join(" L")} L${dn.reverse().join(" L")} Z" fill="${color}" fill-opacity="0.16" stroke="none" />`);
  }
  if (mid.length > 1) {
    over.push(`<polyline data-ck-annotation="${kind}" data-ck-method="${method}" points="${mid.join(" ")}" fill="none" stroke="${color}" stroke-width="1.5"${dash} />`);
  }
  if (last) placeLineLabel(text, last[0], last[1], "x", geom, color, kind, over, boxes);
}

function callout(item: Record<string, unknown>, geom: AnnotationGeom, over: string[], boxes: Box[]): void {
  if (typeof item.label !== "string" || !item.label) return;
  const xValue = typeof item.x === "number" || typeof item.x === "string" ? item.x : null;
  if (xValue === null) return;
  const px = geom.xAt(xValue);
  if (px === null) return;
  const axis = item.axis === "y2" ? "y2" : "y";
  let yValue: number | null = typeof item.y === "number" && item.y === item.y ? item.y : null;
  if (yValue === null) yValue = nearestY(geom, xValue, axis);
  if (yValue === null) return;
  const py = geom.yAt(yValue, axis);
  if (py === null) return;
  const color = markColor(item.color, geom.preset);
  const text = item.label;
  const w = Math.min(geom.plot.right - geom.plot.left - 8, Math.max(44, text.length * 6.3 + 16));
  const h = 22;
  const dx = typeof item.dx === "number" ? item.dx : null;
  const dy = typeof item.dy === "number" ? item.dy : null;
  const box = placeBox(geom.plot, px, py, w, h, dx, dy, boxes);
  boxes.push(box);
  const [lx, ly] = aim(px, py, box);
  const { preset } = geom;
  over.push(
    `<line data-ck-annotation="marker-line" x1="${n(px)}" y1="${n(py)}" x2="${n(lx)}" y2="${n(ly)}" stroke="${color}" stroke-width="1" />`,
    `<rect data-ck-annotation="marker-box" x="${n(box.x)}" y="${n(box.y)}" width="${n(box.w)}" height="${n(box.h)}" rx="4" fill="${cssVar("surface", preset.surface)}" stroke="${color}" stroke-width="1" />`,
    `<circle data-ck-annotation="marker" cx="${n(px)}" cy="${n(py)}" r="3.5" fill="${color}" stroke="${cssVar("background", preset.background)}" stroke-width="1.5" />`,
    label(text, box.x + 8, box.y + 15, "start", cssVar("text", preset.text), "marker"),
  );
}

function placeBox(plot: PlotBox, px: number, py: number, w: number, h: number, dx: number | null, dy: number | null, taken: Box[]): Box {
  const point: Box = { x: px - 8, y: py - 8, w: 16, h: 16 };
  const gap = 8;
  const options: Box[] = [];
  if (dx !== null || dy !== null) options.push({ x: px + (dx ?? 12), y: py + (dy ?? -h - gap), w, h });
  options.push(
    { x: px + gap, y: py - h - gap, w, h },
    { x: px - w - gap, y: py - h - gap, w, h },
    { x: px + gap, y: py + gap, w, h },
    { x: px - w - gap, y: py + gap, w, h },
    { x: px - w / 2, y: py - h - gap, w, h },
    { x: px - w / 2, y: py + gap, w, h },
    { x: px + gap, y: py - h / 2, w, h },
    { x: px - w - gap, y: py - h / 2, w, h },
  );
  for (const box of options) {
    if (!fits(plot, box)) continue;
    if (taken.some((other) => hit(box, other)) || hit(box, point)) continue;
    return box;
  }
  let best = clampBox(plot, options[0] ?? { x: px, y: py, w, h });
  let score = Infinity;
  for (const raw of options) {
    const box = clampBox(plot, raw);
    let area = hit(box, point) ? 4 : 0;
    for (const other of taken) if (hit(box, other)) area += 1;
    if (area < score) {
      score = area;
      best = box;
    }
  }
  return best;
}

function placeLineLabel(text: string, x: number, y: number, _axis: "x" | "y" | "y2", geom: AnnotationGeom, color: string, kind: string, over: string[], boxes: Box[]): void {
  const w = text.length * 6.3;
  const h = 14;
  const point: Box = { x: x - 6, y: y - 6, w: 12, h: 12 };
  const options: Box[] = [];
  for (const lift of [14, 30, 46]) {
    for (const gap of [10, 24, 40]) {
      options.push({ x: x - gap - w, y: y - lift - 11, w, h });
      options.push({ x: x + gap, y: y - lift - 11, w, h });
    }
  }
  options.push({ x: x - w / 2, y: y + 8, w, h });
  let chosen: Box | null = null;
  for (const box of options) {
    if (!fits(geom.plot, box)) continue;
    if (hit(box, point) || boxes.some((other) => hit(box, other))) continue;
    chosen = box;
    break;
  }
  if (!chosen) {
    const gap = 10;
    const roomLeft = x - gap - w >= geom.plot.left + 2;
    const px = roomLeft ? x - gap - w : Math.min(geom.plot.right - w - 4, Math.max(geom.plot.left + 4, x + gap));
    const py = Math.min(geom.plot.bottom - h - 4, Math.max(geom.plot.top + 2, y - 14 - 11));
    chosen = clampBox(geom.plot, { x: px, y: py, w, h });
  }
  const anchor = chosen.x + w <= x + 1 ? "end" : "start";
  const px = anchor === "end" ? chosen.x + w : chosen.x;
  const py = chosen.y + 11;
  over.push(label(text, px, py, anchor, color, kind));
  boxes.push(chosen);
}

function pickPts(geom: AnnotationGeom, item: Record<string, unknown>): Pt[] | null {
  const list = geom.samples;
  if (!list || list.length === 0) return null;
  const axis = item.axis === "y2" ? "y2" : "y";
  const named = typeof item.series === "string" ? item.series : "";
  const found = (named ? list.find((series) => series.name === named) : undefined) ?? list.find((series) => series.axis === axis) ?? list[0];
  return found && found.pts.length ? found.pts : null;
}

function nearestY(geom: AnnotationGeom, xValue: number | string, axis: "y" | "y2"): number | null {
  const pts = pickPts(geom, { axis });
  if (!pts) return null;
  let x: number | null = typeof xValue === "number" ? xValue : null;
  if (x === null && geom.labels) {
    const index = geom.labels.indexOf(String(xValue));
    if (index >= 0) x = pts.some((pt) => pt.x === index) ? index : null;
  }
  if (x === null && typeof xValue === "string") {
    const day = parseDay(xValue);
    if (day !== null) x = day;
    else if (Number.isFinite(Number(xValue))) x = Number(xValue);
  }
  if (x === null) return null;
  let best = pts[0]!;
  let dist = Infinity;
  for (const pt of pts) {
    const d = Math.abs(pt.x - x);
    if (d < dist) {
      dist = d;
      best = pt;
    }
  }
  return best.y;
}

function linFit(pts: Pt[]): { a: number; b: number; s: number; n: number; xb: number; sxx: number } | null {
  const count = pts.length;
  if (count < 2) return null;
  let sx = 0;
  let sy = 0;
  for (const pt of pts) {
    sx += pt.x;
    sy += pt.y;
  }
  const xb = sx / count;
  const yb = sy / count;
  let sxx = 0;
  let sxy = 0;
  for (const pt of pts) {
    const dx = pt.x - xb;
    sxx += dx * dx;
    sxy += dx * (pt.y - yb);
  }
  const b = sxx === 0 ? 0 : sxy / sxx;
  const a = yb - b * xb;
  let sse = 0;
  for (const pt of pts) {
    const err = pt.y - (a + b * pt.x);
    sse += err * err;
  }
  return { a, b, s: count > 2 ? Math.sqrt(sse / (count - 2)) : 0, n: count, xb, sxx };
}

function seAt(fit: { s: number; n: number; xb: number; sxx: number }, x: number): number {
  if (fit.n < 3 || fit.s === 0) return 0;
  const leverage = fit.sxx > 0 ? ((x - fit.xb) * (x - fit.xb)) / fit.sxx : 0;
  return fit.s * Math.sqrt(1 / fit.n + leverage);
}

function loessAt(pts: Pt[], x: number, frac: number): number | null {
  const count = pts.length;
  if (count === 0) return null;
  const k = Math.max(2, Math.min(count, Math.round(frac * count) || 2));
  const dist = pts.map((pt) => Math.abs(pt.x - x)).sort((p, q) => p - q);
  const reach = dist[k - 1] ?? 0;
  if (reach === 0) {
    let sy = 0;
    let m = 0;
    for (const pt of pts) {
      if (pt.x !== x) continue;
      sy += pt.y;
      m += 1;
    }
    return m ? sy / m : pts[0]!.y;
  }
  let sw = 0;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (const pt of pts) {
    const u = Math.abs(pt.x - x) / reach;
    if (u >= 1) continue;
    const t = 1 - u * u * u;
    const w = t * t * t;
    sw += w;
    sx += w * pt.x;
    sy += w * pt.y;
    sxx += w * pt.x * pt.x;
    sxy += w * pt.x * pt.y;
  }
  if (sw === 0) return null;
  const denom = sw * sxx - sx * sx;
  const b = denom === 0 ? 0 : (sw * sxy - sx * sy) / denom;
  const a = (sy - b * sx) / sw;
  return a + b * x;
}

function loessSigma(pts: Pt[], frac: number): number {
  const sample = thin(pts, 48);
  let sse = 0;
  let m = 0;
  for (const pt of sample) {
    const y = loessAt(pts, pt.x, frac);
    if (y === null) continue;
    sse += (pt.y - y) * (pt.y - y);
    m += 1;
  }
  return m > 2 ? Math.sqrt(sse / (m - 2)) : 0;
}

function thin(pts: Pt[], cap: number): Pt[] {
  if (pts.length <= cap) return pts;
  const out: Pt[] = [];
  const step = (pts.length - 1) / (cap - 1);
  for (let i = 0; i < cap; i++) out.push(pts[Math.round(i * step)]!);
  return out;
}

function mean(values: number[]): number {
  let sum = 0;
  for (const value of values) sum += value;
  return sum / values.length;
}

function median(values: number[]): number {
  const sorted = values.slice().sort((p, q) => p - q);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function label(text: string, x: number, y: number, anchor: string, color: string, kind = "rule"): string {
  return `<text data-ck-annotation="${kind}" x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${color}" font-size="11" font-weight="600" font-family="${font()}">${esc(text)}</text>`;
}

function axisOf(item: Record<string, unknown>): "x" | "y" | "y2" {
  return item.axis === "x" || item.axis === "y2" ? item.axis : "y";
}

function at(geom: AnnotationGeom, axis: "x" | "y" | "y2", value: unknown, extrapolate: boolean): number | null {
  if (axis === "x") return extrapolate ? xPixel(geom, value) : typeof value === "number" || typeof value === "string" ? geom.xAt(value) : null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  return geom.yAt(value, axis === "y2" ? "y2" : "y");
}

function xPixel(geom: AnnotationGeom, value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const direct = geom.xAt(value);
  if (direct !== null) return direct;
  if (typeof value !== "number" || !geom.slot || !geom.count) return null;
  const origin = geom.slot(0);
  const step = geom.count > 1 ? geom.slot(1).start - origin.start : origin.size;
  if (!Number.isFinite(step) || step === 0) return origin.start + origin.size / 2;
  return origin.start + value * step + origin.size / 2;
}

function strokeAt(axis: "x" | "y" | "y2", atPx: number, plot: PlotBox, flip?: boolean): [number, number, number, number] {
  const vertical = (axis === "x") !== Boolean(flip);
  return vertical ? [atPx, plot.top, atPx, plot.bottom] : [plot.left, atPx, plot.right, atPx];
}

function strip(axis: "x" | "y" | "y2", a: number, b: number, plot: PlotBox, flip?: boolean): Box {
  const vertical = (axis === "x") !== Boolean(flip);
  if (vertical) {
    const x = Math.min(a, b);
    return { x, y: plot.top, w: Math.abs(b - a), h: plot.bottom - plot.top };
  }
  const y = Math.min(a, b);
  return { x: plot.left, y, w: plot.right - plot.left, h: Math.abs(b - a) };
}

function clipRect(rect: Box, plot: PlotBox): Box | null {
  const x = Math.max(rect.x, plot.left);
  const y = Math.max(rect.y, plot.top);
  const right = Math.min(rect.x + rect.w, plot.right);
  const bottom = Math.min(rect.y + rect.h, plot.bottom);
  if (right - x < 0.5 || bottom - y < 0.5) return null;
  return { x, y, w: right - x, h: bottom - y };
}

function inside(x: number, y: number, plot: PlotBox): [number, number] {
  return [Math.min(plot.right, Math.max(plot.left, x)), Math.min(plot.bottom, Math.max(plot.top, y))];
}

function dashAttr(dash: unknown, fallback: "solid" | "dashed" | "dotted"): string {
  const kind = dash === "solid" || dash === "dashed" || dash === "dotted" ? dash : fallback;
  return kind === "dashed" ? ' stroke-dasharray="4 3"' : kind === "dotted" ? ' stroke-dasharray="1.5 3"' : "";
}

function markColor(color: unknown, preset: PresetTokens): string {
  if (typeof color === "string" && color.length > 0) return paint(color, preset, 0);
  return cssVar("accent", preset.accent);
}

function fits(plot: PlotBox, box: Box): boolean {
  return box.x >= plot.left + 1 && box.y >= plot.top + 1 && box.x + box.w <= plot.right - 1 && box.y + box.h <= plot.bottom - 1;
}

function clampBox(plot: PlotBox, box: Box): Box {
  const w = Math.min(box.w, Math.max(8, plot.right - plot.left - 4));
  const h = Math.min(box.h, Math.max(8, plot.bottom - plot.top - 4));
  return {
    x: Math.min(Math.max(plot.left + 2, box.x), plot.right - w - 2),
    y: Math.min(Math.max(plot.top + 2, box.y), plot.bottom - h - 2),
    w,
    h,
  };
}

function hit(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function aim(px: number, py: number, box: Box): [number, number] {
  return [Math.max(box.x, Math.min(px, box.x + box.w)), Math.max(box.y, Math.min(py, box.y + box.h))];
}
