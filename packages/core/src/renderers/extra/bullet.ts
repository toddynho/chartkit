import { channelFormat, column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { n } from "../../svg";
import { fill, fmt, num, openMark, str, text, valueFormat, viewOf } from "./plot";

/** Qualitative bands, a measure bar, and a target marker. */
export function renderBullet(spec: Record<string, unknown>): string | null {
  const rows = readRows(spec);
  if (!rows) return null;
  const height = Math.max(180, 28 + rows.length * 64);
  const view = viewOf(spec, "bullet", 640, height);
  if (!view) return null;
  const { frame, parts } = view;
  const top = frame.title ? 40 : 16;
  rows.forEach((row, index) => {
    const y = top + index * 64;
    const max = Math.max(row.scale, row.value, row.target ?? 0, 1);
    const left = 132;
    const width = frame.width - left - 20;
    const xAt = (value: number) => left + (Math.max(0, value) / max) * width;
    const bands = row.bands.length ? row.bands : [max * 0.5, max * 0.75, max];
    bands.forEach((edge, band) => {
      const start = band === 0 ? 0 : bands[band - 1];
      const opacity = 0.55 - band * 0.15;
      parts.push(`<rect x="${n(xAt(start))}" y="${n(y)}" width="${n(Math.max(0, xAt(edge) - xAt(start)))}" height="36" rx="6" fill="${cssVar("track", frame.preset.track)}" fill-opacity="${n(Math.max(0.12, opacity))}" />`);
    });
    const shown = valueFormat(frame, spec, frame.encoding.y);
    const targetShown = channelFormat(frame.encoding.target) ?? shown;
    const label = `${row.name}: ${fmt(row.value, frame.locale, shown)}${row.target !== undefined ? `, target ${fmt(row.target, frame.locale, targetShown)}` : ""}`;
    parts.push(openMark("rect", "measure", label, `x="${n(left)}" y="${n(y + 11)}" width="${n(Math.max(2, xAt(row.value) - left))}" height="14" rx="4" fill="${fill(frame, index)}"`));
    parts.push("</rect>");
    if (row.target !== undefined) {
      const tx = xAt(row.target);
      parts.push(openMark("line", "target", label, `x1="${n(tx)}" y1="${n(y + 4)}" x2="${n(tx)}" y2="${n(y + 32)}" stroke="${cssVar("text", frame.preset.text)}" stroke-width="2"`));
      parts.push("</line>");
    }
    parts.push(text(16, y + 16, row.name, cssVar("text", frame.preset.text), 13, "650"));
    parts.push(text(16, y + 32, fmt(row.value, frame.locale, shown), cssVar("muted", frame.preset.muted), 12, "500"));
  });
  return view.done();
}

interface BulletRow {
  name: string;
  value: number;
  target?: number;
  bands: number[];
  scale: number;
}

function readRows(spec: Record<string, unknown>): BulletRow[] | null {
  const view = viewOf(spec, "bullet", 640, 180);
  if (!view) return null;
  const { frame, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  const targetField = fieldOf(frame.encoding.target);
  if (!yField) return null;
  const rangeFields = Array.isArray(frame.mark.ranges) ? frame.mark.ranges.filter((item): item is string => typeof item === "string") : [];
  const xs = column(table, xField);
  const ys = num(table, yField);
  const targets = num(table, targetField);
  const rangeCols = rangeFields.map((field) => num(table, field));
  const rows: BulletRow[] = [];
  ys.forEach((value, index) => {
    if (value === null) return;
    const bands = rangeCols.map((col) => col[index]).filter((item): item is number => item !== null).sort((a, b) => a - b);
    const target = targetField ? targets[index] ?? undefined : undefined;
    const scale = Math.max(value, target ?? 0, bands[bands.length - 1] ?? 0, 1) * (bands.length ? 1 : 1.15);
    rows.push({ name: xField ? str(xs[index]) : `Item ${index + 1}`, value, target: target ?? undefined, bands, scale });
  });
  return rows.length ? rows : null;
}
