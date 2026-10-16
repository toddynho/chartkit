import { cssVar, paint } from "../theme";
import { formatValue } from "../format";
import { asNumber, column, fieldOf, readFrame, readMetric, readTable } from "../frame";
import { closeChart, esc, font, n, openChart } from "../svg";

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

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "kpi" }));
  parts.push(
    `<rect x="0.5" y="0.5" width="${n(frame.width - 1)}" height="${n(frame.height - 1)}" rx="12" fill="${cssVar("surface", frame.preset.surface)}" stroke="${cssVar("grid", frame.preset.grid)}" />`,
  );
  if (frame.title) {
    parts.push(text(20, 18, frame.title, cssVar("text", frame.preset.text), 12, "600"));
  }
  const label = metric.label ?? frame.title;
  if (label) parts.push(text(20, frame.title ? 40 : 32, label, cssVar("muted", frame.preset.muted), 13, "500"));
  const valueY = label ? (frame.title ? 72 : 64) : 48;
  parts.push(text(20, valueY, valueText, cssVar("text", frame.preset.text), 28, "700"));
  if (metric.delta !== undefined) {
    const deltaText = `${deltaUp ? "↗" : "↘"} ${formatValue(metric.delta, metric.deltaFormat, frame.locale)}`;
    const valueWidth = valueText.length * 17;
    parts.push(text(28 + valueWidth, valueY - 2, deltaText, deltaColor, 14, "600"));
  }
  if (spark && spark.length > 1) {
    const x = 20;
    const y = valueY + 14;
    const w = frame.width - 40;
    const h = Math.max(24, frame.height - y - 16);
    parts.push(sparkPath(spark, x, y, w, h, series));
  }
  parts.push(closeChart());
  return parts.join("");
}

function sparklineValues(spec: Record<string, unknown>): number[] | null {
  if (spec.data === undefined) return null;
  const table = readTable(spec);
  if (!table) return null;
  const frame = isRecord(spec.encoding) ? spec.encoding : {};
  const field = fieldOf(frame.y) ?? (table.columns.value ? "value" : table.fields.find((name) => table.columns[name]?.some((value) => typeof value === "number")));
  const values = column(table, field).map(asNumber).filter((value): value is number => value !== null);
  return values.length > 1 ? values : null;
}

function sparkPath(values: number[], x: number, y: number, w: number, h: number, color: string): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((value, index) => ({
    x: x + step * index,
    y: y + h - ((value - min) / span) * h,
  }));
  const line = pts.map((point, index) => `${index === 0 ? "M" : "L"} ${n(point.x)} ${n(point.y)}`).join(" ");
  const area = `${line} L ${n(pts[pts.length - 1].x)} ${n(y + h)} L ${n(pts[0].x)} ${n(y + h)} Z`;
  return `<path d="${area}" fill="${color}" fill-opacity="0.18" stroke="none" /><path d="${line}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(x: number, y: number, value: string, fill: string, size: number, weight: string): string {
  return `<text x="${n(x)}" y="${n(y)}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
