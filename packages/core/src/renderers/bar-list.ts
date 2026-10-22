import { asNumber, column, fieldOf, readFrame, readTable } from "../frame";
import { formatValue } from "../format";
import { cssVar } from "../theme";
import { closeChart, esc, font, n, openChart } from "../svg";

/**
 * Ranked rows. No axes. A tinted track sits behind the label, the fill shows
 * the value against the largest row, and the formatted value is right-aligned.
 * This module is an on-demand chart. The line and all bundles do not import it.
 */
export function renderBarList(spec: Record<string, unknown>): string | null {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width: 420, height: 180 });
  const encoding = frame.encoding;
  const xField = fieldOf(encoding.x) ?? table.fields[0];
  const yField = fieldOf(encoding.y) ?? table.fields.find((name) => name !== xField);
  if (!xField || !yField) return null;
  const labels = column(table, xField).map((value) => (value == null ? "" : String(value)));
  const values = column(table, yField).map(asNumber);
  const rows: { label: string; value: number }[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const value = values[i];
    if (!label || value === null) continue;
    rows.push({ label, value });
  }
  if (!rows.length) return null;
  const max = Math.max(...rows.map((row) => row.value), 1);
  const yFormat = isRecord(encoding.y) ? encoding.y.format : undefined;
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const rowMode = mark.track === "row";
  const rowH = 28;
  const pad = 6;
  const height = frame.heightFixed ? frame.height : pad * 2 + rows.length * rowH;
  const width = frame.width;
  const ink = cssVar("text", frame.preset.text);
  const muted = cssVar("muted", frame.preset.muted);
  const fill = cssVar("series-1", frame.preset.series[0] ?? "#1f6b45");
  const valueCol = 64;
  const trackRight = width - valueCol;
  const parts = [openChart({ ...frame, height, renderer: "bar-list" })];
  rows.forEach((row, index) => {
    const y = pad + index * rowH;
    const text = formatValue(row.value, yFormat, frame.locale);
    if (rowMode) {
      const span = Math.max(0, width - 8);
      const filled = Math.max(12, (row.value / max) * span);
      parts.push(
        `<rect data-ck-track="row" x="0" y="${n(y + 2)}" width="${n(filled)}" height="${rowH - 4}" rx="3" fill="${fill}" fill-opacity="0.16" />` +
          `<text x="8" y="${n(y + 18)}" fill="${ink}" font-size="12" font-weight="560" font-family="${font()}">${esc(row.label)}</text>` +
          `<text x="${n(width - 4)}" y="${n(y + 18)}" text-anchor="end" fill="${ink}" font-size="12" font-weight="650" font-family="${font()}">${esc(text)}</text>`,
      );
      return;
    }
    const trackY = y + 6;
    const trackH = 16;
    const span = Math.max(0, trackRight - 4);
    const filled = Math.max(8, (row.value / max) * span);
    parts.push(
      `<rect data-ck-track="1" x="0" y="${n(trackY)}" width="${n(span)}" height="${trackH}" rx="4" fill="${fill}" fill-opacity="0.14" />` +
        `<rect data-ck-bar="1" x="0" y="${n(trackY)}" width="${n(filled)}" height="${trackH}" rx="4" fill="${fill}" fill-opacity="0.42" />` +
        `<text x="8" y="${n(trackY + 12)}" fill="${ink}" font-size="12" font-weight="560" font-family="${font()}">${esc(row.label)}</text>` +
        `<text x="${n(width - 4)}" y="${n(trackY + 12)}" text-anchor="end" fill="${ink}" font-size="12" font-weight="650" font-family="${font()}">${esc(text)}</text>`,
    );
  });
  parts.push(closeChart());
  return parts.join("");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
