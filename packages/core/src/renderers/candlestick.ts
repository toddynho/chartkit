import { explicitGrid, gridLines, majorTicks, spine, turned } from "../axis-ink";
import { seriesPoints } from "../annotations";
import { readTimeScale } from "../time-x";
import { axisTitleMarks, bottomLegendBand, categoryX, chooseTicks, heading, labelStep, lockDomain, minorTickMarks, placedNotes } from "../chrome";
import { cssVar } from "../theme";
import { formatAxisValue, formatValue } from "../format";
import {
  asNumber,
  axisOn,
  channelFormat,
  column,
  fieldOf,
  gridStyle,
  readFrame,
  readTable,
  resolveDomain,
  wantsZero,
} from "../frame";
import { activeScene, pushRect, takeMark, type SceneMark } from "../canvas/sink";
import { canvasWanted } from "../render-mode";
import { closeChart, esc, font, isRecord, linear, n, openChart, readAxis, ticks, ch } from "../svg";

/** OHLC candles. A volume pane is drawn when encoding.volume is set. */
export function renderCandlestick(spec: Record<string, unknown>): string | null {
  const table = readTable(spec);
  if (!table) return null;
  const frame = readFrame(spec, { width: 640, height: 320 });
  const xField = fieldOf(frame.encoding.x);
  const openF = fieldOf(frame.encoding.open);
  const highF = fieldOf(frame.encoding.high);
  const lowF = fieldOf(frame.encoding.low);
  const closeF = fieldOf(frame.encoding.close);
  const volumeF = fieldOf(frame.encoding.volume);
  const labels = column(table, xField).map((value) => (value === null || value === undefined ? "" : String(value)));
  const candles: { label: string; open: number; high: number; low: number; close: number; volume: number | null }[] = [];
  const opens = column(table, openF);
  const highs = column(table, highF);
  const lows = column(table, lowF);
  const closes = column(table, closeF);
  const volumes = column(table, volumeF);
  for (let i = 0; i < table.length; i++) {
    const open = asNumber(opens[i]);
    const high = asNumber(highs[i]);
    const low = asNumber(lows[i]);
    const close = asNumber(closes[i]);
    if (open === null || high === null || low === null || close === null) continue;
    candles.push({ label: labels[i] ?? "", open, high, low, close, volume: volumeF ? asNumber(volumes[i]) : null });
  }
  if (candles.length === 0) return null;

  let lo = Infinity;
  let hi = -Infinity;
  let maxVol = 1;
  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i];
    if (candle.high > hi) hi = candle.high;
    if (candle.low < lo) lo = candle.low;
    if (candle.volume !== null && candle.volume > maxVol) maxVol = candle.volume;
  }
  const pad = (hi - lo) * 0.08 || 1;
  const fitted = resolveDomain([lo - pad, hi + pad], frame.encoding.high, wantsZero(frame.encoding.high, false));
  const domain = lockDomain(fitted[0], fitted[1], [frame.encoding.open, frame.encoding.high, frame.encoding.low, frame.encoding.close, frame.encoding.y]);
  const showVolume = volumeF !== undefined;
  const showX = axisOn(spec, "x");
  const showY = axisOn(spec, "y");
  const yAxisFormat = isRecord(spec.axes) && isRecord(spec.axes.y) ? spec.axes.y.format : undefined;
  const priceFormat = yAxisFormat ?? channelFormat(frame.encoding.close) ?? channelFormat(frame.encoding.high) ?? channelFormat(frame.encoding.open) ?? "number";
  const yTicks = chooseTicks(spec, "y", domain[0], domain[1], ticks(domain[0], domain[1], 5));
  const yTickText = yTicks.map((tick) => formatAxisValue(tick, priceFormat, frame.locale, yTicks));
  let top = 12 + (frame.subtitle ? 18 : 0);
  if (frame.title) top = 36 + (frame.subtitle ? 18 : 0);
  let left = 12;
  if (showY) {
    let width = 0;
    for (let i = 0; i < yTickText.length; i++) width = Math.max(width, ch(yTickText[i].length, 6.7));
    left = Math.max(56, Math.ceil(width + 16));
  }
  if (showY && readAxis(spec, "y").title) left += 16;
  const legendBand = bottomLegendBand(spec, frame.preset, frame.width - 12 - left);
  const plot = { left, top, right: frame.width - 12, bottom: frame.height - (showX ? 28 : 12) - (showX && readAxis(spec, "x").title ? 14 : 0) - legendBand };
  const volumeH = showVolume ? Math.max(28, (plot.bottom - plot.top) * 0.2) : 0;
  const priceBottom = plot.bottom - volumeH - (showVolume ? 8 : 0);
  const yScale = linear(domain[0], domain[1], priceBottom, plot.top);
  const slot = (plot.right - plot.left) / candles.length;
  const time = readTimeScale(spec, candles.map((candle) => candle.label));
  const plotWidth = Math.max(1, plot.right - plot.left);
  const gap = typeof frame.mark.gap === "number" ? frame.mark.gap : 0.3;
  const bodyW = Math.max(1, slot * (1 - gap));
  const grid = gridStyle(spec);
  const up = cssVar("positive", frame.preset.positive);
  const down = cssVar("negative", frame.preset.negative);
  const volScale = linear(0, maxVol, plot.bottom, plot.bottom - volumeH);

  const canvas = canvasWanted(spec);
  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "candlestick", canvas }));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", frame.preset.background)}" />`);
  const head = heading(frame, plot.left);
  if (head) parts.push(head);
  if (grid && showY) {
    const dash = grid === "dashed" ? ' stroke-dasharray="3 3"' : grid === "dotted" ? ' stroke-dasharray="1 3"' : "";
    for (const tick of yTicks) {
      const y = yScale(tick);
      parts.push(`<line x1="${n(plot.left)}" y1="${n(y)}" x2="${n(plot.right)}" y2="${n(y)}" stroke="${cssVar("grid", frame.preset.grid)}"${dash} />`);
    }
  }

  const scene = activeScene();
  let body: SceneMark | null = null;
  let volume: SceneMark | null = null;
  if (scene) {
    scene.plot = { left: 0, top: 0, right: frame.width, bottom: frame.height };
    scene.width = frame.width;
    scene.height = frame.height;
    scene.count = candles.length;
    scene.linear = true;
    scene.x0 = 0;
    scene.stride = 1;
    scene.xMin = 0;
    scene.xMax = candles.length;
    scene.key = `candle|${frame.width}|${frame.height}|${candles.length}|${domain[0]}|${domain[1]}|${showVolume ? 1 : 0}`;
    body = takeMark();
    body.kind = "bar";
    body.fillOpacity = 1;
    scene.marks.push(body);
    if (showVolume) {
      volume = takeMark();
      volume.kind = "bar";
      volume.fillOpacity = 0.35;
      scene.marks.push(volume);
    }
  } else if (canvas) parts.push(`<g data-ck-layer="marks">`);
  candles.forEach((candle, index) => {
    const rising = candle.close >= candle.open;
    const color = rising ? up : down;
    const x = time ? time.at(index, plotWidth, plot.left) : plot.left + slot * index + slot / 2;
    const highY = yScale(candle.high);
    const lowY = yScale(candle.low);
    const openY = yScale(candle.open);
    const closeY = yScale(candle.close);
    const bodyY = Math.min(openY, closeY);
    const bodyH = Math.max(1, Math.abs(closeY - openY));
    if (body) {
      pushRect(body, x - 0.5, Math.min(highY, lowY), 1, Math.abs(lowY - highY), color);
      pushRect(body, x - bodyW / 2, bodyY, bodyW, bodyH, color);
      if (volume && candle.volume !== null) {
        const vy = volScale(candle.volume);
        pushRect(volume, x - bodyW / 2, vy, bodyW, Math.max(0, plot.bottom - vy), color);
      }
      return;
    }
    const label = `${candle.label} open ${candle.open} high ${candle.high} low ${candle.low} close ${candle.close}`;
    parts.push(`<g aria-label="${esc(label)}"><title>${esc(label)}</title>`);
    parts.push(
      `<line x1="${n(x)}" y1="${n(highY)}" x2="${n(x)}" y2="${n(lowY)}" stroke="${color}" stroke-width="1" />`,
    );
    parts.push(
      `<rect data-ck-mark="candle" x="${n(x - bodyW / 2)}" y="${n(bodyY)}" width="${n(bodyW)}" height="${n(bodyH)}" fill="${color}" />`,
    );
    if (showVolume && candle.volume !== null) {
      const vy = volScale(candle.volume);
      parts.push(
        `<rect data-ck-mark="volume" x="${n(x - bodyW / 2)}" y="${n(vy)}" width="${n(bodyW)}" height="${n(Math.max(0, plot.bottom - vy))}" fill="${color}" fill-opacity="0.35" />`,
      );
    }
    parts.push(`</g>`);
  });
  if (canvas && !body) parts.push(`</g>`);

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
    const omitted = candles.length > 8 ? Math.ceil(candles.length / 6) : 1;
    const step = labelStep(candles.length, xAxis.skip, omitted);
    const labelY = (xAxis.end ? plot.top - 8 : frame.height - legendBand - (xAxis.title ? 26 : 12)) + (xAxis.end ? 0 : xAxis.offset || 0);
    const ink = cssVar("muted", frame.preset.muted);
    const axisInk = cssVar("axis", frame.preset.axis);
    const xs: number[] = [];
    const shownX: number[] = [];
    for (let i = 0; i < candles.length; i++) xs.push(time ? time.at(i, plotWidth, plot.left) : plot.left + slot * i + slot / 2);
    if (time) {
      for (const tick of time.ticks(frame.locale)) {
        const x = time.px(tick.t, plotWidth, plot.left);
        shownX.push(x);
        if (!xAxis.rotate) parts.push(text(x, labelY, tick.text, ink, 11, "400", "middle"));
        else parts.push(turned(x, labelY, tick.text, ink, 11, "middle", xAxis.rotate));
      }
    }
    for (let i = 0; i < candles.length && !time; i += step) {
      if (!candles[i]?.label) continue;
      shownX.push(xs[i] ?? 0);
      if (!xAxis.rotate) parts.push(text(xs[i] ?? 0, labelY, candles[i]?.label ?? "", ink, 11, "400", "middle"));
      else parts.push(turned(xs[i] ?? 0, labelY, candles[i]?.label ?? "", ink, 11, "middle", xAxis.rotate));
    }
    const edge = xAxis.end ? plot.top : plot.bottom;
    parts.push(majorTicks(xAxis, true, edge, shownX, xAxis.end ? -1 : 1, axisInk));
    if (xAxis.rule || xAxis.offset) parts.push(spine(plot.left, edge + (xAxis.offset || 0), plot.right, edge + (xAxis.offset || 0), xAxis.rule, axisInk));
    const xGrid = explicitGrid(isRecord(spec.axes) && isRecord(spec.axes.x) ? spec.axes.x.grid : undefined);
    if (xGrid) parts.push(gridLines(false, plot.top, plot.bottom, xs, xGrid, cssVar("grid", frame.preset.grid)));
  }
  const xAt = (index: number) => (time ? time.at(index, plotWidth, plot.left) : plot.left + slot * index + slot / 2);
  const notes = spec.annotations
    ? placedNotes(spec, frame, plot, categoryX(candles.map((candle) => candle.label), xAt), (value) => yScale(value), [
        { name: "close", axis: "y", pts: seriesPoints(null, candles.map((candle) => candle.close)) },
      ], candles.map((candle) => candle.label))
    : { under: "", over: "" };
  parts.push(notes.over);
  parts.push(axisTitleMarks(frame, spec, plot));
  parts.push(closeChart());
  return parts.join("");
}

function text(x: number, y: number, value: string, fill: string, size: number, weight: string, anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
}
