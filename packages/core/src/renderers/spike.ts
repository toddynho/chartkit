import { explicitGrid, gridLines, majorTicks, spine, turned } from "../axis-ink";
import { seriesPoints } from "../annotations";
import { readTimeScale } from "../time-x";
import { axisTitleMarks, bottomLegendBand, categoryX, chooseTicks, heading, labelStep, lockDomain, minorTickMarks, placedNotes } from "../chrome";
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
import { closeChart, esc, font, isRecord, linear, n, openChart, readAxis, readAxisFormat, ticks, ch } from "../svg";

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
  const yFormat = readAxisFormat(spec, "y") ?? channelFormat(frame.encoding.y);
  const yTickText = yTicks.map((tick) => formatAxisValue(tick, yFormat, frame.locale, yTicks));
  let left = 12;
  if (showY) {
    let width = 0;
    for (let i = 0; i < yTickText.length; i++) width = Math.max(width, ch(yTickText[i].length, 6.7));
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
  const time = readTimeScale(spec, labels);
  const sampled = sampleSeries(readSamplingMode(frame.mark.sampling), null, values, values.length, plotWidth, false);
  const drawSpike = (value: number, index: number, sampledAttr: string) => {
    const x = time ? time.at(index, plotWidth, plot.left) : plot.left + slot * index + slot / 2;
    const y = yScale(value);
    const name = labels[index] ? `${labels[index]}: ` : "";
    const label = `${name}${formatValue(value, yFormat, frame.locale)}`;
    parts.push(
      `<line data-ck-mark="spike" x1="${n(x)}" y1="${n(baseY)}" x2="${n(x)}" y2="${n(y)}" stroke="${color}" stroke-width="${strokeAttr}" stroke-linecap="round" stroke-opacity="${n(opacity)}" aria-label="${esc(label)}"${sampledAttr}><title>${esc(label)}</title></line>`,
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
    const yAxis = readAxis(spec, "y");
    const step = labelStep(yTicks.length, yAxis.skip, 1);
    const ink = cssVar("muted", frame.preset.muted);
    const axisInk = cssVar("axis", frame.preset.axis);
    const shift = yAxis.offset || 0;
    const edge = yAxis.end ? plot.right : plot.left;
    const ys: number[] = [];
    for (let i = 0; i < yTicks.length; i += step) {
      const y = yScale(yTicks[i] ?? 0) + 4;
      ys.push(yScale(yTicks[i] ?? 0));
      const rich = Boolean(yAxis.rotate || yAxis.offset || yAxis.end);
      if (!rich) parts.push(text(plot.left - 8, y, yTickText[i] ?? "", ink, 11, "400", "end"));
      else parts.push(turned((yAxis.end ? edge + 8 : edge - 8) + (yAxis.end ? shift : -shift), y, yTickText[i] ?? "", ink, 11, yAxis.end ? "start" : "end", yAxis.rotate));
    }
    parts.push(minorTickMarks(yAxis.minor ?? 0, yTicks, yScale, edge, false, yAxis.end ? 3 : -3, axisInk));
    parts.push(majorTicks(yAxis, false, edge, ys, yAxis.end ? 1 : -1, axisInk));
    if (yAxis.rule) parts.push(spine(edge + (yAxis.end ? shift : -shift), plot.top, edge + (yAxis.end ? shift : -shift), plot.bottom, yAxis.rule, axisInk));
    const yGrid = explicitGrid(isRecord(spec.axes) && isRecord(spec.axes.y) ? spec.axes.y.grid : undefined);
    if (yGrid) parts.push(gridLines(true, plot.left, plot.right, yTicks.map((value) => yScale(value)), yGrid, cssVar("grid", frame.preset.grid)));
  }
  if (showX) {
    const xAxis = readAxis(spec, "x");
    const omitted = count > 8 ? Math.ceil(count / 6) : 1;
    const step = labelStep(count, xAxis.skip, omitted);
    const labelY = (xAxis.end ? plot.top - 8 : frame.height - legendBand - (xAxis.title ? 26 : 12)) + (xAxis.end ? 0 : xAxis.offset || 0);
    const xs: number[] = [];
    const ink = cssVar("muted", frame.preset.muted);
    const axisInk = cssVar("axis", frame.preset.axis);
    const shownX: number[] = [];
    for (let i = 0; i < count; i++) xs.push(time ? time.at(i, plotWidth, plot.left) : plot.left + slot * i + slot / 2);
    if (time) {
      for (const tick of time.ticks(frame.locale)) {
        const x = time.px(tick.t, plotWidth, plot.left);
        shownX.push(x);
        if (!xAxis.rotate) parts.push(text(x, labelY, tick.text, ink, 11, "400", "middle"));
        else parts.push(turned(x, labelY, tick.text, ink, 11, "middle", xAxis.rotate));
      }
    }
    for (let i = 0; i < count && !time; i += step) {
      if (!labels[i]) continue;
      shownX.push(xs[i] ?? 0);
      if (!xAxis.rotate) parts.push(text(xs[i] ?? 0, labelY, labels[i] ?? "", ink, 11, "400", "middle"));
      else parts.push(turned(xs[i] ?? 0, labelY, labels[i] ?? "", ink, 11, "middle", xAxis.rotate));
    }
    const edge = xAxis.end ? plot.top : plot.bottom;
    parts.push(minorTickMarks(xAxis.minor ?? 0, xs, (value) => value, edge, true, xAxis.end ? -3 : 3, axisInk));
    parts.push(majorTicks(xAxis, true, edge, shownX, xAxis.end ? -1 : 1, axisInk));
    if (xAxis.rule || xAxis.offset) parts.push(spine(plot.left, edge + (xAxis.offset || 0), plot.right, edge + (xAxis.offset || 0), xAxis.rule, axisInk));
    const xGrid = explicitGrid(isRecord(spec.axes) && isRecord(spec.axes.x) ? spec.axes.x.grid : undefined);
    if (xGrid) parts.push(gridLines(false, plot.top, plot.bottom, xs, xGrid, cssVar("grid", frame.preset.grid)));
  }
  const xAt = (index: number) => (time ? time.at(index, plotWidth, plot.left) : plot.left + slot * index + slot / 2);
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
