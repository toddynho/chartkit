import { seriesPoints } from "../annotations";
import { axisTitleMarks, categoryX, chooseTicks, heading, lockDomain, placedNotes } from "../chrome";
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
import { closeChart, esc, font, isRecord, linear, n, openChart, readAxis, ticks } from "../svg";

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

  const prices = candles.flatMap((candle) => [candle.high, candle.low]);
  const pad = (Math.max(...prices) - Math.min(...prices)) * 0.08 || 1;
  const fitted = resolveDomain([Math.min(...prices) - pad, Math.max(...prices) + pad], frame.encoding.high, wantsZero(frame.encoding.high, false));
  const domain = lockDomain(fitted[0], fitted[1], [frame.encoding.high, frame.encoding.low, frame.encoding.close, frame.encoding.y]);
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
    for (let i = 0; i < yTickText.length; i++) width = Math.max(width, yTickText[i].length * 6.7);
    left = Math.max(56, Math.ceil(width + 16));
  }
  if (showY && readAxis(spec, "y").title) left += 16;
  const plot = { left, top, right: frame.width - 12, bottom: frame.height - (showX ? 28 : 12) - (showX && readAxis(spec, "x").title ? 14 : 0) };
  const volumeH = showVolume ? Math.max(28, (plot.bottom - plot.top) * 0.2) : 0;
  const priceBottom = plot.bottom - volumeH - (showVolume ? 8 : 0);
  const yScale = linear(domain[0], domain[1], priceBottom, plot.top);
  const slot = (plot.right - plot.left) / candles.length;
  const gap = typeof frame.mark.gap === "number" ? frame.mark.gap : 0.3;
  const bodyW = Math.max(1, slot * (1 - gap));
  const grid = gridStyle(spec);
  const up = cssVar("positive", frame.preset.positive);
  const down = cssVar("negative", frame.preset.negative);
  const maxVol = Math.max(...candles.map((candle) => candle.volume ?? 0), 1);
  const volScale = linear(0, maxVol, plot.bottom, plot.bottom - volumeH);

  const parts: string[] = [];
  parts.push(openChart({ ...frame, renderer: "candlestick" }));
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

  candles.forEach((candle, index) => {
    const rising = candle.close >= candle.open;
    const color = rising ? up : down;
    const x = plot.left + slot * index + slot / 2;
    const highY = yScale(candle.high);
    const lowY = yScale(candle.low);
    const openY = yScale(candle.open);
    const closeY = yScale(candle.close);
    const bodyY = Math.min(openY, closeY);
    const bodyH = Math.max(1, Math.abs(closeY - openY));
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
        `<rect x="${n(x - bodyW / 2)}" y="${n(vy)}" width="${n(bodyW)}" height="${n(Math.max(0, plot.bottom - vy))}" fill="${color}" fill-opacity="0.35" />`,
      );
    }
    parts.push(`</g>`);
  });

  if (showY) {
    for (let i = 0; i < yTicks.length; i++) {
      parts.push(text(plot.left - 8, yScale(yTicks[i]) + 4, yTickText[i] ?? "", cssVar("muted", frame.preset.muted), 11, "400", "end"));
    }
  }
  if (showX) {
    const step = candles.length > 8 ? Math.ceil(candles.length / 6) : 1;
    const labelY = frame.height - (readAxis(spec, "x").title ? 26 : 12);
    for (let i = 0; i < candles.length; i += step) {
      if (!candles[i].label) continue;
      parts.push(text(plot.left + slot * i + slot / 2, labelY, candles[i].label, cssVar("muted", frame.preset.muted), 11, "400", "middle"));
    }
  }
  const xAt = (index: number) => plot.left + slot * index + slot / 2;
  const names = candles.map((candle) => candle.label);
  const notes = placedNotes(spec, frame, plot, categoryX(names, xAt), (value) => yScale(value), [
    { name: "close", axis: "y", pts: seriesPoints(null, candles.map((candle) => candle.close)) },
  ], names);
  parts.push(notes.over);
  parts.push(axisTitleMarks(frame, spec, plot));
  parts.push(closeChart());
  return parts.join("");
}

function text(x: number, y: number, value: string, fill: string, size: number, weight: string, anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
