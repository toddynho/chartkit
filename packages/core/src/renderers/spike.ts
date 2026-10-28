import { seriesPoints } from "../annotations";
import { axisTitleMarks, bottomLegendBand, categoryX, chooseTicks, heading, lockDomain, placedNotes } from "../chrome";
import { cssVar, lineStroke, paint } from "../theme";
import { formatAxisValue, formatValue } from "../format";
import {
  asNumber,
  axisOn,
  channelFormat,
  column,
  fieldOf,
  readFrame,
  readTable,
  resolveDomain,
} from "../frame";
import { readSamplingMode, sampleSeries } from "../sampling";
import { closeChart, esc, font, linear, n, openChart, readAxis, ticks } from "../svg";

/** Thin vertical spikes from mark.baseline (default 0) across x. */
export function renderSpike(spec: Record<string, unknown>): string | null {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width: 640, height: 200 });
  const yField = fieldOf(frame.encoding.y) ?? (table.columns.value ? "value" : undefined);
  const xField = fieldOf(frame.encoding.x);
  const values = column(table, yField).map(asNumber);
  const labels = xField ? column(table, xField).map((value) => (value === null || value === undefined ? "" : String(value))) : values.map((_, index) => String(index));
  if (!values.some((value) => value !== null)) return null;

  const baseline = typeof frame.mark.baseline === "number" ? frame.mark.baseline : 0;
  const width = typeof frame.mark.strokeWidth === "number" ? frame.mark.strokeWidth : frame.geometry.strokeWidth;
  const strokeAttr = typeof frame.mark.strokeWidth === "number" ? n(width) : `var(--ck-line-width, ${n(width)})`;
  const opacity = typeof frame.mark.opacity === "number" ? frame.mark.opacity : 1;
  const color = lineStroke(paint(undefined, frame.preset, 0), width, frame.preset.lines);
  const fitted = resolveDomain(
    values.filter((value): value is number => value !== null).concat(baseline),
    frame.encoding.y,
    true,
  );
  const domain = lockDomain(fitted[0], fitted[1], [frame.encoding.y]);
  const showX = axisOn(spec, "x");
  const showY = axisOn(spec, "y");
  let top = 16 + (frame.subtitle ? 18 : 0);
  if (frame.title) top = 32 + (frame.subtitle ? 18 : 0);
  const yTicks = chooseTicks(spec, "y", domain[0], domain[1], ticks(domain[0], domain[1], 4));
  const yFormat = channelFormat(frame.encoding.y);
  const yTickText = yTicks.map((tick) => formatAxisValue(tick, yFormat, frame.locale, yTicks));
  let left = 12;
  if (showY) {
    let width = 0;
    for (let i = 0; i < yTickText.length; i++) width = Math.max(width, yTickText[i].length * 6.7);
    left = Math.max(44, Math.ceil(width + 14));
  }
  if (showY && readAxis(spec, "y").title) left += 16;
  const legendBand = bottomLegendBand(spec, frame.preset, frame.width - 12 - left);
  const plot = { left, top, right: frame.width - 12, bottom: frame.height - (showX ? 28 : 12) - (showX && readAxis(spec, "x").title ? 14 : 0) - legendBand };
  const yScale = linear(domain[0], domain[1], plot.bottom, plot.top);
  const count = values.length;
  const slot = count > 0 ? (plot.right - plot.left) / count : plot.right - plot.left;

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "spike" }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  const head = heading(frame, plot.left);
  if (head) parts.push(head);
  const baseY = yScale(baseline);
  parts.push(
    `<line x1="${n(plot.left)}" y1="${n(baseY)}" x2="${n(plot.right)}" y2="${n(baseY)}" stroke="${cssVar("axis", frame.preset.axis)}" stroke-width="1.5" />`,
  );
  const plotWidth = Math.max(1, plot.right - plot.left);
  const sampled = sampleSeries(readSamplingMode(frame.mark.sampling), null, values, values.length, plotWidth, false);
  const drawSpike = (value: number, index: number, sampledAttr: string) => {
    const x = plot.left + slot * index + slot / 2;
    const y = yScale(value);
    const name = labels[index] ? `${labels[index]}: ` : "";
    const label = `${name}${formatValue(value, yFormat, frame.locale)}`;
    parts.push(
      `<line x1="${n(x)}" y1="${n(baseY)}" x2="${n(x)}" y2="${n(y)}" stroke="${color}" stroke-width="${strokeAttr}" stroke-linecap="round" stroke-opacity="${n(opacity)}" aria-label="${esc(label)}"${sampledAttr}><title>${esc(label)}</title></line>`,
    );
  };
  if (!sampled.reduced) {
    values.forEach((value, index) => {
      if (value === null) return;
      drawSpike(value, index, "");
    });
  } else {
    for (const run of sampled.runs) {
      for (let k = 0; k < run.length; k++) {
        const index = run[k];
        const value = values[index];
        if (value === null) continue;
        drawSpike(value, index, ` data-ck-sample="${sampled.mode}" data-ck-i="${index}"`);
      }
    }
  }
  if (showY) {
    for (let i = 0; i < yTicks.length; i++) {
      parts.push(text(plot.left - 8, yScale(yTicks[i]) + 4, yTickText[i] ?? "", cssVar("muted", frame.preset.muted), 11, "400", "end"));
    }
  }
  if (showX) {
    const step = count > 8 ? Math.ceil(count / 6) : 1;
    const labelY = frame.height - legendBand - (readAxis(spec, "x").title ? 26 : 12);
    for (let i = 0; i < count; i += step) {
      if (!labels[i]) continue;
      parts.push(text(plot.left + slot * i + slot / 2, labelY, labels[i], cssVar("muted", frame.preset.muted), 11, "400", "middle"));
    }
  }
  const xAt = (index: number) => plot.left + slot * index + slot / 2;
  const notes = placedNotes(spec, frame, plot, categoryX(labels, xAt), (value) => yScale(value), [
    { name: yField ?? "y", axis: "y", pts: seriesPoints(null, values) },
  ], labels);
  parts.push(notes.over);
  parts.push(axisTitleMarks(frame, spec, plot));
  parts.push(closeChart());
  return parts.join("");
}

function text(x: number, y: number, value: string, fill: string, size: number, weight: string, anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
}
