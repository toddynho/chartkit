import { cssVar, lineStroke, paint } from "../theme";
import { formatValue } from "../format";
import { asNumber, column, fieldOf, readFrame, readMetric, readTable } from "../frame";
import { closeChart, esc, font, isRecord, n, openChart } from "../svg";

/** Metric card: label, formatted value, delta, and an optional sparkline from data. */
export function renderKpi(spec: Record<string, unknown>): string | null {
  const metric = readMetric(spec);
  if (!metric) return null;
  const frame = readFrame(spec, { width: 280, height: spec.data === undefined ? 112 : 148 });
  const valueText = formatValue(metric.value, metric.format, frame.locale);
  const upGood = metric.goodDirection !== "down";
  const deltaUp = (metric.delta ?? 0) >= 0;
  const good = metric.delta === undefined ? true : upGood ? deltaUp : !deltaUp;
  const deltaColor = good ? cssVar("positive", frame.preset.positive) : cssVar("negative", frame.preset.negative);
  const series = paint(undefined, frame.preset, 0);
  const spark = sparklineValues(spec);
  const strokeSet = typeof frame.mark.strokeWidth === "number";
  const stroke = strokeSet ? (frame.mark.strokeWidth as number) : frame.geometry.compactStroke;
  const strokeAttr = strokeSet ? n(stroke) : `var(--ck-line-width, ${n(stroke)})`;
  const opacitySet = typeof frame.mark.fillOpacity === "number";
  const fillPaint = opacitySet ? n(frame.mark.fillOpacity as number) : `var(--ck-area-opacity, ${n(frame.geometry.fillOpacity)})`;

  const step = activeThreshold(metric.value, readThresholds(spec));
  const surface = step ? paint(step.color, frame.preset, 0) : cssVar("surface", frame.preset.surface);
  const ink = step ? inkFor(surface, cssVar("text", frame.preset.text)) : cssVar("text", frame.preset.text);
  const muted = step ? ink : cssVar("muted", frame.preset.muted);
  const deltaInk = step ? ink : deltaColor;
  const sparkColor = step ? ink : series;
  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "kpi" }));
  const thresholdAttr = step ? ` data-ck-threshold="${esc(step.color)}"` : "";
  parts.push(
    `<rect x="0.5" y="0.5" width="${n(frame.width - 1)}" height="${n(frame.height - 1)}" rx="12" fill="${surface}" stroke="${step ? ink : cssVar("grid", frame.preset.grid)}"${thresholdAttr} />`,
  );
  if (frame.title) {
    parts.push(text(20, 18, frame.title, ink, 12, "600"));
  }
  const label = metric.label ?? frame.title;
  if (label) parts.push(text(20, frame.title ? 40 : 32, label, muted, 13, "500"));
  const valueY = label ? (frame.title ? 72 : 64) : 48;
  parts.push(text(20, valueY, valueText, ink, 28, "700"));
  if (metric.delta !== undefined) {
    const deltaText = `${deltaUp ? "↗" : "↘"} ${formatValue(metric.delta, metric.deltaFormat, frame.locale)}`;
    const valueWidth = valueText.length * 17;
    parts.push(text(28 + valueWidth, valueY - 2, deltaText, deltaInk, 14, "600"));
  }
  if (spark && spark.length > 1) {
    const x = 20;
    const y = valueY + 14;
    const w = frame.width - 40;
    const h = Math.max(24, frame.height - y - 16);
    parts.push(sparkPath(spark, x, y, w, h, sparkColor, frame.preset.lines, stroke, strokeAttr, fillPaint));
  }
  parts.push(closeChart());
  return parts.join("");
}

function hasNumber(values: ArrayLike<unknown> | undefined): boolean {
  if (!values) return false;
  for (let i = 0; i < values.length; i++) if (typeof values[i] === "number") return true;
  return false;
}

function sparklineValues(spec: Record<string, unknown>): number[] | null {
  if (spec.data === undefined) return null;
  const table = readTable(spec);
  if (!table) return null;
  const frame = isRecord(spec.encoding) ? spec.encoding : {};
  const field = fieldOf(frame.y) ?? (table.columns.value ? "value" : table.fields.find((name) => hasNumber(table.columns[name])));
  const values = column(table, field).map(asNumber).filter((value): value is number => value !== null);
  return values.length > 1 ? values : null;
}

function sparkPath(
  values: number[],
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  lines: readonly string[],
  stroke: number,
  strokeAttr: string,
  fillPaint: string,
): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pad = Math.max(stroke, 2) * 0.5 + 2;
  const inner = Math.max(1, h - pad * 2);
  const pts = values.map((value, index) => ({
    x: x + step * index,
    y: y + pad + inner - ((value - min) / span) * inner,
  }));
  const line = pts.map((point, index) => `${index === 0 ? "M" : "L"} ${n(point.x)} ${n(point.y)}`).join(" ");
  const area = `${line} L ${n(pts[pts.length - 1].x)} ${n(y + h)} L ${n(pts[0].x)} ${n(y + h)} Z`;
  return `<path d="${area}" fill="${color}" fill-opacity="${fillPaint}" stroke="none" /><path d="${line}" fill="none" stroke="${lineStroke(color, stroke, lines)}" stroke-width="${strokeAttr}" stroke-linejoin="round" stroke-linecap="round" />`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface Step {
  value: number;
  color: string;
}

function readThresholds(spec: Record<string, unknown>): Step[] {
  if (!isRecord(spec.metric) || !Array.isArray(spec.metric.thresholds)) return [];
  const steps: Step[] = [];
  for (const item of spec.metric.thresholds) {
    if (!isRecord(item) || typeof item.value !== "number" || !Number.isFinite(item.value)) return [];
    if (typeof item.color !== "string" || item.color.length === 0) return [];
    if (item.label !== undefined && typeof item.label !== "string") return [];
    steps.push({ value: item.value, color: item.color });
  }
  const seen = new Set<number>();
  for (const step of steps) {
    if (seen.has(step.value)) return [];
    seen.add(step.value);
  }
  return steps.length > 8 ? [] : steps;
}

/** Last step at or below the value. A value under every step still uses the first. */
function activeThreshold(value: number, steps: Step[]): Step | undefined {
  if (!steps.length) return undefined;
  const sorted = [...steps].sort((a, b) => a.value - b.value);
  let active = sorted[0];
  for (const step of sorted) if (value >= step.value) active = step;
  return active;
}

function inkFor(color: string, fallback: string): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (!hex) return fallback;
  const bits = Number.parseInt(hex[1], 16);
  const r = (bits >> 16) & 255;
  const g = (bits >> 8) & 255;
  const b = bits & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.62 ? "#1a1a1a" : "#ffffff";
}

function text(x: number, y: number, value: string, fill: string, size: number, weight: string): string {
  return `<text x="${n(x)}" y="${n(y)}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
