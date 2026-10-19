import { column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { n, polar } from "../../svg";
import { asNumber } from "../../frame";
import { fieldsOf, fill, fit, openMark, str, stroke, text, viewOf } from "./plot";

/** Spokes, rings, labels, and one polygon per series. */
export function renderRadar(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "radar", 520, 460);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yFields = fieldsOf(frame.encoding.y);
  const seriesField = fieldOf(frame.encoding.series);
  if (!xField || !yFields.length) return null;
  const xs = column(table, xField);
  const axes = [...new Set(xs.map(str))].filter(Boolean);
  if (axes.length < 3) return null;

  const series: { name: string; values: number[] }[] = [];
  if (seriesField && yFields.length === 1) {
    const names = column(table, seriesField).map(str);
    const measure = column(table, yFields[0]);
    const byName = new Map<string, number[]>();
    for (let i = 0; i < table.length; i++) {
      const name = names[i] || yFields[0];
      const list = byName.get(name) ?? axes.map(() => 0);
      const axis = axes.indexOf(str(xs[i]));
      if (axis >= 0) list[axis] = asNumber(measure[i]) ?? list[axis];
      byName.set(name, list);
    }
    for (const [name, values] of byName) series.push({ name, values });
  } else {
    yFields.forEach((field) => {
      const measure = column(table, field);
      const values = axes.map(() => 0);
      for (let i = 0; i < table.length; i++) {
        const axis = axes.indexOf(str(xs[i]));
        if (axis >= 0) values[axis] = asNumber(measure[i]) ?? values[axis];
      }
      series.push({ name: field, values });
    });
  }
  if (!series.length) return null;

  const capped = spokeMax(frame.encoding.y);
  const max = capped ?? Math.max(1, ...series.flatMap((item) => item.values));
  const cx = frame.width / 2;
  const cy = frame.height / 2 + (frame.title ? 8 : 0);
  const radius = Math.min(frame.width, frame.height) * 0.32;
  const rings = 4;
  const at = (index: number, value: number) => polar(cx, cy, (radius * Math.max(0, value)) / max, (360 / axes.length) * index);
  const grid = cssVar("grid", frame.preset.grid);
  const axis = cssVar("axis", frame.preset.axis);
  for (let ring = 1; ring <= rings; ring++) {
    const points = axes.map((_, index) => at(index, (max * ring) / rings));
    parts.push(`<polygon points="${points.map((point) => `${n(point.x)},${n(point.y)}`).join(" ")}" fill="none" stroke="${grid}" />`);
  }
  axes.forEach((name, index) => {
    const end = at(index, max);
    parts.push(`<line data-ck-mark="spoke" x1="${n(cx)}" y1="${n(cy)}" x2="${n(end.x)}" y2="${n(end.y)}" stroke="${axis}" />`);
    const labelAt = at(index, max * 1.18);
    const anchor = labelAt.x < cx - 8 ? "end" : labelAt.x > cx + 8 ? "start" : "middle";
    parts.push(text(labelAt.x, labelAt.y, fit(name, 80, 12), cssVar("text", frame.preset.text), 12, "500", anchor));
  });
  series.forEach((item, index) => {
    const color = fill(frame, index);
    const ink = stroke(frame, index, 2);
    const points = item.values.map((value, axisIndex) => at(axisIndex, Math.min(value, max)));
    const label = `${item.name}: ${axes.map((name, axisIndex) => `${name} ${item.values[axisIndex]}`).join(", ")}`;
    parts.push(openMark("polygon", "polygon", label, `points="${points.map((point) => `${n(point.x)},${n(point.y)}`).join(" ")}" fill="${color}" fill-opacity="${n(frame.geometry.fillOpacity)}" stroke="${ink}" stroke-width="2"`));
    parts.push("</polygon>");
    for (const point of points) parts.push(`<circle cx="${n(point.x)}" cy="${n(point.y)}" r="3" fill="${color}" />`);
  });
  if (frame.legend !== false && series.length > 1) {
    let x = 16;
    const y = frame.height - 18;
    series.forEach((item, index) => {
      parts.push(`<rect x="${n(x)}" y="${n(y - 9)}" width="10" height="10" rx="2" fill="${fill(frame, index)}" />`);
      parts.push(text(x + 14, y, item.name, cssVar("text", frame.preset.text), 12, "500"));
      x += 14 + item.name.length * 7 + 16;
    });
  }
  return view.done();
}

function spokeMax(channel: unknown): number | undefined {
  if (!channel || typeof channel !== "object" || !("scale" in channel)) return undefined;
  const scale = (channel as { scale?: { domain?: unknown } }).scale;
  const max = Array.isArray(scale?.domain) ? scale.domain[1] : undefined;
  return typeof max === "number" && max > 0 ? max : undefined;
}
