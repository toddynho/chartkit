import { axisTitleMarks, chooseTicks, labelStep, lockDomain, placedNotes } from "../../chrome";
import type { DataTable } from "../../data";
import { asNumber, column, fieldOf, readColor } from "../../frame";
import { formatValue } from "../../format";
import { legendPinned, legendSpace, paintLegend, readLegend, type LegendBox, type LegendItem } from "../../legend";
import { cssVar, paint } from "../../theme";
import { clientIntent, n, readAxis } from "../../svg";
import {
  axisLine,
  clip,
  domainTicks,
  fmt,
  hGrid,
  openMark,
  plotBox,
  scaleOf,
  text,
  viewOf,
  type Box,
} from "./plot";

interface Curve {
  name: string;
  sample: number[];
  xs: number[];
  ys: number[];
}

const SQRT2PI = Math.sqrt(2 * Math.PI);

/** A 1D Gaussian kernel density of encoding.x. Groups overlay. No transform is written back. */
export function renderDensity(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "density", 640, 360);
  if (!view) return null;
  const { frame, parts } = view;
  if (frame.mark.dims === 2) return null;
  const built = buildCurves(view.table, frame.encoding, frame.mark);
  if (!built) return null;
  const vertical = frame.mark.orientation === "vertical";
  const peak = Math.max(...built.curves.flatMap((curve) => curve.ys), 0);
  const yMax = peak === 0 ? 1 : peak * 1.08;
  const yFormat = built.normalize === "count" ? "number" : undefined;
  const [d0, d1] = lockDomain(0, yMax, [frame.encoding.y]);
  const dTicks = chooseTicks(spec, vertical ? "x" : "y", 0, Math.max(d1, yMax), domainTicks(0, Math.max(d1, yMax)));
  const dTop = Math.max(d1, dTicks[dTicks.length - 1] ?? d1, yMax);
  const sampleTicks = chooseTicks(spec, vertical ? "y" : "x", built.min, built.max, domainTicks(built.min, built.max));
  const s0 = Math.min(built.min, sampleTicks[0] ?? built.min);
  const s1 = Math.max(built.max, sampleTicks[sampleTicks.length - 1] ?? built.max);

  const names = built.curves.map((curve) => curve.name);
  const legendOn = frame.legend !== false && (built.curves.length > 1 || legendPinned(spec));
  const hide = legendHide(spec);
  const colorOf = (name: string) => {
    const color = readColor(frame.encoding.color);
    const index = Math.max(0, names.indexOf(name));
    if (built.curves.length === 1 && !color?.field) return paint("accent", frame.preset, 0);
    return paint(color?.constant, frame.preset, index);
  };
  const items: LegendItem[] = built.curves.filter((curve) => !hide.includes(curve.name)).map((curve) => ({ name: curve.name, color: colorOf(curve.name) }));
  const legend = legendOn && items.length ? legendBox(spec, frame.legend === false ? "bottom" : frame.legend) : null;
  const layoutSpec = { ...spec, legend: false as const };
  const draft = plotBox(frame, layoutSpec, { yTicks: vertical ? undefined : dTicks });
  const space = legend ? legendSpace(legend, items, Math.max(80, draft.right - draft.left)) : null;
  const box = insetLegend(draft, legend, space);
  const sampleAt = scaleOf(s0, s1, vertical ? box.bottom : box.left, vertical ? box.top : box.right);
  const densityAt = scaleOf(d0, dTop, vertical ? box.left : box.bottom, vertical ? box.right : box.top);
  const opacity = typeof frame.mark.fillOpacity === "number" ? frame.mark.fillOpacity : 0.22;
  const strokeWidth = typeof frame.mark.strokeWidth === "number" ? frame.mark.strokeWidth : 1.5;

  if (!vertical) parts.push(hGrid(spec, frame, box, dTicks, densityAt));
  parts.push(clip(frame, box));
  const notes = placedNotes(
    spec,
    frame,
    box,
    (value) => {
      const numeric = typeof value === "number" ? value : Number(value);
      return Number.isFinite(numeric) ? (vertical ? densityAt(numeric) : sampleAt(numeric)) : null;
    },
    (value) => (vertical ? sampleAt(value) : densityAt(value)),
    [],
  );
  if (notes.under) parts.push(notes.under);
  parts.push(`<g clip-path="url(#${frame.id}-p)">`);
  for (const curve of built.curves) {
    const color = colorOf(curve.name);
    const peakAt = curve.ys.reduce((best, value, index) => (value > curve.ys[best] ? index : best), 0);
    const label = `${curve.name}, peak at ${fmt(curve.xs[peakAt], frame.locale)} density ${fmt(curve.ys[peakAt], frame.locale, yFormat)}`;
    const d = areaD(curve, sampleAt, densityAt, vertical);
    parts.push(
      openMark(
        "path",
        "area",
        label,
        `data-ck-series="${escapeAttr(curve.name)}" tabindex="0" d="${d}" fill="${color}" fill-opacity="${n(opacity)}" stroke="${color}" stroke-width="${n(strokeWidth)}" stroke-linejoin="round"`,
        curve.name,
      ),
    );
    parts.push("</path>");
    curve.xs.forEach((x, index) => {
      const px = vertical ? densityAt(curve.ys[index]) : sampleAt(x);
      const py = vertical ? sampleAt(x) : densityAt(curve.ys[index]);
      const tip = `${curve.name}, ${fmt(x, frame.locale)}, density ${fmt(curve.ys[index], frame.locale, yFormat)}`;
      parts.push(openMark("circle", "point", tip, `data-ck-series="${escapeAttr(curve.name)}" cx="${n(px)}" cy="${n(py)}" r="7" fill="transparent" tabindex="0"`, curve.name, index));
      parts.push("</circle>");
    });
    if (frame.mark.rug === true) {
      const ink = cssVar("text", frame.preset.text);
      for (const value of curve.sample) {
        const at = sampleAt(value);
        if (vertical) {
          parts.push(`<line x1="${n(box.left)}" y1="${n(at)}" x2="${n(box.left + 8)}" y2="${n(at)}" stroke="${ink}" stroke-width="1" data-ck-mark="rug" />`);
        } else {
          parts.push(`<line x1="${n(at)}" y1="${n(box.bottom)}" x2="${n(at)}" y2="${n(box.bottom - 8)}" stroke="${ink}" stroke-width="1" data-ck-mark="rug" />`);
        }
      }
    }
  }
  parts.push("</g>");
  if (notes.over) parts.push(notes.over);
  parts.push(axisLine(frame, box));
  if (vertical) {
    parts.push(yTickLabels(frame, spec, box, sampleTicks, sampleAt));
    parts.push(xTickLabels(frame, spec, box, dTicks, densityAt, yFormat));
  } else {
    parts.push(yTickLabels(frame, spec, box, dTicks, densityAt, yFormat));
    parts.push(xTickLabels(frame, spec, box, sampleTicks, sampleAt));
  }
  parts.push(axisTitleMarks(frame, layoutSpec, box));
  if (legend && items.length) parts.push(paintLegend(legend, items, { plot: box, width: frame.width, height: frame.height, preset: frame.preset }));
  const intent = clientIntent(spec);
  if (intent && parts[0]?.startsWith("<svg ")) parts[0] = parts[0].replace("<svg ", `<svg data-ck-intent="${intent}" `);
  return view.done();
}

function buildCurves(table: DataTable, encoding: Record<string, unknown>, mark: Record<string, unknown>): { curves: Curve[]; min: number; max: number; normalize: "density" | "count" } | null {
  const xField = fieldOf(encoding.x);
  if (!xField) return null;
  const seriesField = fieldOf(encoding.series) || readColor(encoding.color)?.field;
  const values = column(table, xField);
  const series = column(table, seriesField);
  const groups = new Map<string, number[]>();
  for (let i = 0; i < table.length; i++) {
    const value = asNumber(values[i]);
    if (value === null) continue;
    const name = seriesField ? String(series[i] ?? "") : "sample";
    if (!name) continue;
    const list = groups.get(name);
    if (list) list.push(value);
    else groups.set(name, [value]);
  }
  const usable = [...groups.entries()].filter(([, sample]) => sample.length >= 2);
  if (!usable.length) return null;
  const steps = stepsOf(mark.steps);
  const normalize = mark.normalize === "count" ? "count" : "density";
  const bandwidths = usable.map(([, sample]) => bandwidthOf(mark.bandwidth, sample));
  if (bandwidths.some((value) => value === null)) return null;
  const h = bandwidths.map((value) => value ?? 1);
  let min = Infinity;
  let max = -Infinity;
  const padExtent = mark.extent !== "data";
  usable.forEach(([, sample], index) => {
    const pad = padExtent ? 3 * h[index] : 0;
    for (const value of sample) {
      min = Math.min(min, value - pad);
      max = Math.max(max, value + pad);
    }
  });
  if (Array.isArray(mark.extent) && mark.extent.length === 2 && typeof mark.extent[0] === "number" && typeof mark.extent[1] === "number" && mark.extent[1] > mark.extent[0]) {
    min = mark.extent[0];
    max = mark.extent[1];
  }
  if (!(max > min)) max = min + 1;
  const curves = usable.map(([name, sample], index) => evaluate(name, sample, h[index], min, max, steps, normalize));
  return { curves, min, max, normalize };
}

function stepsOf(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(16, Math.min(256, Math.round(value)));
  return 64;
}

function bandwidthOf(value: unknown, sample: number[]): number | null {
  if (typeof value === "number") return value > 0 ? value : null;
  return scott(sample);
}

function scott(sample: number[]): number {
  const n = sample.length;
  const mean = sample.reduce((sum, value) => sum + value, 0) / n;
  const variance = sample.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, n - 1);
  const sd = Math.sqrt(variance);
  const width = 1.06 * (sd || 1) * n ** -0.2;
  return width > 0 ? width : 1;
}

function evaluate(name: string, raw: number[], bandwidth: number, min: number, max: number, steps: number, normalize: "density" | "count"): Curve {
  const sample: Array<number | { x: number; w: number }> = raw.length > 5000 ? binSample(raw) : raw;
  const n = raw.length;
  const xs: number[] = [];
  const ys: number[] = [];
  const span = max - min || 1;
  for (let i = 0; i < steps; i++) {
    const x = min + (span * i) / Math.max(1, steps - 1);
    let sum = 0;
    for (const value of sample) {
      const point = typeof value === "number" ? value : value.x;
      const weight = typeof value === "number" ? 1 : value.w;
      const u = (x - point) / bandwidth;
      sum += weight * Math.exp(-0.5 * u * u);
    }
    const density = sum / (SQRT2PI * bandwidth * (raw.length > 5000 ? n : sample.length));
    xs.push(x);
    ys.push(normalize === "count" ? density * n : density);
  }
  return { name, sample: raw, xs, ys };
}

function binSample(raw: number[]): { x: number; w: number }[] {
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  const bins = 256;
  const span = max - min || 1;
  const counts = new Array<number>(bins).fill(0);
  for (const value of raw) {
    const index = Math.min(bins - 1, Math.floor(((value - min) / span) * bins));
    counts[index] += 1;
  }
  const out: { x: number; w: number }[] = [];
  for (let i = 0; i < bins; i++) if (counts[i]) out.push({ x: min + ((i + 0.5) / bins) * span, w: counts[i] });
  return out;
}

function areaD(curve: Curve, sampleAt: (value: number) => number, densityAt: (value: number) => number, vertical: boolean): string {
  const top = curve.xs.map((x, index) => (vertical ? { x: densityAt(curve.ys[index]), y: sampleAt(x) } : { x: sampleAt(x), y: densityAt(curve.ys[index]) }));
  const base = vertical ? densityAt(0) : densityAt(0);
  if (top.length < 2) return "";
  const forward = top.map((point, index) => `${index ? "L" : "M"} ${n(point.x)} ${n(point.y)}`).join(" ");
  if (vertical) return `${forward} L ${n(base)} ${n(top[top.length - 1].y)} L ${n(base)} ${n(top[0].y)} Z`;
  return `${forward} L ${n(top[top.length - 1].x)} ${n(base)} L ${n(top[0].x)} ${n(base)} Z`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function legendHide(spec: Record<string, unknown>): string[] {
  return isRecord(spec.legend) && Array.isArray(spec.legend.hide) ? spec.legend.hide.filter((item): item is string => typeof item === "string") : [];
}

function legendBox(spec: Record<string, unknown>, position: "top" | "right" | "bottom" | "left"): LegendBox {
  const rich = readLegend(spec);
  if (rich) return rich;
  const side = position === "left" || position === "right";
  return { position, anchor: "top-left", align: "start", orient: side ? "vertical" : "horizontal", title: "", hide: legendHide(spec), symbol: "", symbols: {} };
}

function insetLegend(box: Box, legend: LegendBox | null, space: { band: number; side: number } | null): Box {
  if (!legend || !space) return box;
  const next = { ...box };
  if (legend.position === "right") next.right -= space.side;
  else if (legend.position === "left") next.left += space.side;
  else if (legend.position === "top") next.top += space.band;
  else next.bottom -= space.band;
  return next;
}

function yTickLabels(frame: { locale: string; preset: { muted: string } }, spec: Record<string, unknown>, box: Box, values: number[], at: (value: number) => number, format?: unknown): string {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  if (axes && (axes.y === false || (isRecord(axes.y) && axes.y.show === false))) return "";
  const axis = readAxis(spec, "y");
  if (axis.labels === false) return "";
  const step = labelStep(values.length, axis.skip, 1);
  const ink = cssVar("muted", frame.preset.muted);
  return values
    .filter((_, index) => index % step === 0)
    .map((value) => text(box.left - 8, at(value) + 4, format ? formatValue(value, format, frame.locale) : fmt(value, frame.locale), ink, 11, "400", "end"))
    .join("");
}

function xTickLabels(frame: { locale: string; preset: { muted: string } }, spec: Record<string, unknown>, box: Box, values: number[], at: (value: number) => number, format?: unknown): string {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  if (axes && (axes.x === false || (isRecord(axes.x) && axes.x.show === false))) return "";
  const axis = readAxis(spec, "x");
  if (axis.labels === false) return "";
  const step = labelStep(values.length, axis.skip, values.length > 8 ? Math.ceil(values.length / 6) : 1);
  const ink = cssVar("muted", frame.preset.muted);
  return values
    .filter((_, index) => index % step === 0)
    .map((value) => text(at(value), box.bottom + 16, format ? formatValue(value, format, frame.locale) : fmt(value, frame.locale), ink, 11, "400", "middle"))
    .join("");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
