import { cssVar } from "../theme";
import { formatValue } from "../format";
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
import { closeChart, esc, font, isRecord, linear, n, openChart, ticks } from "../svg";

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
  const domain = resolveDomain([Math.min(...prices) - pad, Math.max(...prices) + pad], frame.encoding.high, wantsZero(frame.encoding.high, false));
  const showVolume = volumeF !== undefined;
  const showX = axisOn(spec, "x");
  const showY = axisOn(spec, "y");
  let top = 12;
  if (frame.title) top = 36;
  const plot = { left: showY ? 56 : 12, top, right: frame.width - 12, bottom: frame.height - (showX ? 28 : 12) };
  const volumeH = showVolume ? Math.max(28, (plot.bottom - plot.top) * 0.2) : 0;
  const priceBottom = plot.bottom - volumeH - (showVolume ? 8 : 0);
  const yScale = linear(domain[0], domain[1], priceBottom, plot.top);
  const yTicks = ticks(domain[0], domain[1], 5);
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
  if (frame.title) parts.push(text(plot.left, 22, frame.title, cssVar("text", frame.preset.text), 15, "650"));
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
    const yAxis = isRecord(spec.axes) && isRecord(spec.axes.y) ? spec.axes.y.format : undefined;
    const priceFormat = yAxis ?? channelFormat(frame.encoding.close) ?? channelFormat(frame.encoding.high) ?? channelFormat(frame.encoding.open) ?? "number";
    for (const tick of yTicks) {
      parts.push(text(plot.left - 6, yScale(tick) + 4, formatValue(tick, priceFormat, frame.locale), cssVar("muted", frame.preset.muted), 11, "400", "end"));
    }
  }
  if (showX) {
    const step = candles.length > 8 ? Math.ceil(candles.length / 6) : 1;
    for (let i = 0; i < candles.length; i += step) {
      if (!candles[i].label) continue;
      parts.push(text(plot.left + slot * i + slot / 2, plot.bottom + 16, candles[i].label, cssVar("muted", frame.preset.muted), 11, "400", "middle"));
    }
  }
  parts.push(closeChart());
  return parts.join("");
}

function text(x: number, y: number, value: string, fill: string, size: number, weight: string, anchor = "start"): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
}
