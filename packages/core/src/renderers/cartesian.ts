import { readData } from "../data";
import { readSamplingMode, sampleSeries, type SamplingMode } from "../sampling";
import { clamp, esc, font, hash, isRecord, linear, n, niceDomain, niceNum, round } from "../svg";
import { cssVar, paint, resolvePreset, type PresetTokens } from "../theme";

type MarkDraw = (
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  horizontal: boolean,
) => string;

function renderTyped(spec: Record<string, unknown>, type: string, draw: MarkDraw): string | null {
  if (spec.type !== type) return null;
  const model = toModel(spec);
  if (!model) return null;
  return modelToSvg(model, draw);
}

/** Area is type "line" plus mark.area, so it stays in this entry. */
export function renderLine(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "line", drawLines);
}

export function renderBar(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "bar", drawBars);
}

export function renderStackedArea(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "stacked-area", drawLines);
}

export function renderSparkline(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "sparkline", drawLines);
}

export function renderMiniArea(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "mini-area", drawLines);
}

export function renderCombo(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "combo", drawCombo);
}

interface Series {
  name: string;
  values: (number | null)[];
  color: string;
  axis: "y" | "y2";
  mark: "line" | "bar" | "area";
  dash: string;
  area: boolean;
}

interface PlotModel {
  type: string;
  title?: string;
  subtitle?: string;
  alt: string;
  locale: string;
  width: number;
  height: number;
  responsive: boolean;
  labels: string[];
  x: (number | null)[] | null;
  series: Series[];
  curve: Curve;
  sampling: SamplingMode;
  stack: "none" | "stack" | "percent";
  orientation: "vertical" | "horizontal";
  fillOpacity: number;
  strokeWidth: number;
  gradient: boolean;
  points: "none" | "hover" | "always";
  pointSize: number;
  connectNulls: boolean;
  cornerRadius: number;
  gap: number;
  labelsOn: boolean;
  showX: boolean;
  showY: boolean;
  showY2: boolean;
  yGrid: false | "solid" | "dashed" | "dotted";
  legend: boolean;
  zero: boolean;
  preset: PresetTokens;
  id: string;
}

type Curve = "linear" | "monotone" | "step" | "step-before" | "step-after";

function toModel(spec: Record<string, unknown>): PlotModel | null {
  const type = spec.type as string;
  const preset = resolvePreset(spec.theme);
  const read = readData(spec.data);
  if (!read.ok) return null;
  const table = read.table;
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const xChannel = channelField(encoding.x);
  const yChannels = readYChannels(encoding.y);

  let labels: string[] = [];
  let x: (number | null)[] | null = null;
  if (table.kind === "numbers") {
    labels = table.columns.value.map((_, index) => String(index));
    x = table.columns.value.map((_, index) => index);
  } else if (xChannel && table.columns[xChannel]) {
    const raw = table.columns[xChannel];
    const numeric = raw.every((value) => value === null || typeof value === "number");
    const temporal = raw.some((value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value));
    if ((numeric || temporal) && type !== "bar") {
      x = raw.map((value) => toNumber(value));
      labels = raw.map((value) => (value === null || value === undefined ? "" : String(value)));
    } else {
      labels = raw.map((value) => (value === null || value === undefined ? "" : String(value)));
    }
  } else {
    labels = Array.from({ length: table.length }, (_, index) => String(index));
  }

  const length = table.length;
  let series: Series[];
  if (yChannels.length === 0 && table.columns.value) {
    series = [
      {
        name: "value",
        values: table.columns.value.map(toNullableNumber),
        color: paint(undefined, preset, 0),
        axis: "y",
        mark: type === "bar" ? "bar" : type === "mini-area" || type === "stacked-area" ? "area" : "line",
        dash: "solid",
        area: type === "mini-area" || type === "stacked-area" || mark.area === true,
      },
    ];
  } else {
    series = yChannels.map((channel, index) => {
      const column = channel.field ? table.columns[channel.field] : undefined;
      const values = column
        ? column.map(toNullableNumber)
        : Array.from({ length }, () => null);
      const markKind = seriesMark(type, channel.mark, mark.area === true || channel.area === true);
      return {
        name: channel.title || channel.field || `Series ${index + 1}`,
        values,
        color: paint(channel.color, preset, index),
        axis: channel.axis,
        mark: markKind,
        dash: channel.dash,
        area: markKind === "area" || channel.area === true || mark.area === true || type === "stacked-area" || type === "mini-area",
      };
    });
  }

  const stack = stackMode(type, mark.stack);
  const curve = curveOf(mark.curve);
  const sampling = readSamplingMode(mark.sampling);
  const size = isRecord(spec.size) ? spec.size : {};
  const width = typeof size.width === "number" ? size.width : 640;
  const responsive = size.width === undefined || size.width === "auto";
  const height = heightOf(type, size, width);
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : "";
  const idSource = typeof spec.id === "string" ? spec.id : alt || type;
  const compact = type === "sparkline" || type === "mini-area";

  return {
    type,
    title: typeof spec.title === "string" ? spec.title : undefined,
    subtitle: typeof spec.subtitle === "string" ? spec.subtitle : undefined,
    alt,
    locale: typeof spec.locale === "string" ? spec.locale : "en-US",
    width,
    height,
    responsive,
    labels,
    x: type === "bar" || type === "combo" ? null : x,
    series,
    curve,
    sampling,
    stack,
    orientation: mark.orientation === "horizontal" ? "horizontal" : "vertical",
    fillOpacity: typeof mark.fillOpacity === "number" ? mark.fillOpacity : 0.28,
    strokeWidth: typeof mark.strokeWidth === "number" ? mark.strokeWidth : compact ? 1.5 : 2,
    gradient: mark.gradient !== false,
    points: mark.points === "always" || mark.points === "none" || mark.points === "hover" ? mark.points : "hover",
    pointSize: typeof mark.pointSize === "number" ? mark.pointSize : 3,
    connectNulls: mark.connectNulls === true,
    cornerRadius: typeof mark.cornerRadius === "number" ? mark.cornerRadius : 2,
    gap: typeof mark.gap === "number" ? mark.gap : 0.25,
    labelsOn: mark.labels === true,
    showX: !compact && axisVisible(spec, "x"),
    showY: !compact && axisVisible(spec, "y"),
    showY2: !compact && series.some((item) => item.axis === "y2") && axisVisible(spec, "y2"),
    yGrid: compact ? false : gridOf(spec),
    legend: !compact && series.length > 1 && legendVisible(spec),
    zero: zeroDefault(type, mark, series),
    preset,
    id: `ck${hash(idSource)}`,
  };
}

function modelToSvg(model: PlotModel, draw: MarkDraw): string {
  const pad = padding(model);
  const plot = {
    left: pad.left,
    top: pad.top,
    right: model.width - pad.right,
    bottom: model.height - pad.bottom,
  };
  const plotW = Math.max(1, plot.right - plot.left);
  const plotH = Math.max(1, plot.bottom - plot.top);
  const horizontal = model.orientation === "horizontal" && model.type === "bar";
  const yDomain = domain(model, "y");
  const y2Domain = domain(model, "y2");
  const yScale = linear(yDomain[0], yDomain[1], horizontal ? plot.left : plot.bottom, horizontal ? plot.right : plot.top);
  const y2Scale = linear(y2Domain[0], y2Domain[1], plot.bottom, plot.top);
  const yTicks = ticks(yDomain[0], yDomain[1], 5);
  const count = model.series[0]?.values.length ?? model.labels.length;
  const xScale = xPosition(model, count, plot.left, plot.right, plot.top, plot.bottom, horizontal);

  const parts: string[] = [];
  parts.push(openSvg(model));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", model.preset.background)}" />`);
  if (model.title) {
    parts.push(`<text x="${n(pad.left)}" y="20" fill="${cssVar("text", model.preset.text)}" font-size="14" font-weight="600" font-family="${font()}">${esc(model.title)}</text>`);
  }
  if (model.subtitle) {
    parts.push(`<text x="${n(pad.left)}" y="${model.title ? 36 : 18}" fill="${cssVar("muted", model.preset.muted)}" font-size="12" font-family="${font()}">${esc(model.subtitle)}</text>`);
  }
  if (model.legend) parts.push(legend(model, pad.left, model.title || model.subtitle ? (model.subtitle ? 48 : 32) : 8));

  parts.push(`<defs><clipPath id="${model.id}-clip"><rect x="${n(plot.left)}" y="${n(plot.top)}" width="${n(plotW)}" height="${n(plotH)}" /></clipPath>`);
  if (model.gradient) {
    model.series.forEach((series, index) => {
      parts.push(
        `<linearGradient id="${model.id}-g${index}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${series.color}" stop-opacity="${model.fillOpacity}" /><stop offset="100%" stop-color="${series.color}" stop-opacity="0" /></linearGradient>`,
      );
    });
  }
  parts.push(`</defs>`);

  if (model.yGrid && model.showY) {
    for (const tick of yTicks) {
      const pos = yScale(tick);
      const dash = model.yGrid === "dashed" ? ' stroke-dasharray="3 3"' : model.yGrid === "dotted" ? ' stroke-dasharray="1 3"' : "";
      if (horizontal) {
        parts.push(`<line x1="${n(pos)}" y1="${n(plot.top)}" x2="${n(pos)}" y2="${n(plot.bottom)}" stroke="${cssVar("grid", model.preset.grid)}"${dash} />`);
      } else {
        parts.push(`<line x1="${n(plot.left)}" y1="${n(pos)}" x2="${n(plot.right)}" y2="${n(pos)}" stroke="${cssVar("grid", model.preset.grid)}"${dash} />`);
      }
    }
  }

  parts.push(`<g clip-path="url(#${model.id}-clip)">`);
  parts.push(draw(model, xScale, yScale, y2Scale, plot, horizontal));
  parts.push(`</g>`);

  if (model.showY) parts.push(yAxisLabels(yTicks, yScale, plot.left, horizontal, model));
  if (model.showY2) parts.push(yAxisLabels(ticks(y2Domain[0], y2Domain[1], 5), y2Scale, plot.right, false, model, true));
  if (model.showX) parts.push(xAxisLabels(model, xScale, count, horizontal, plot));

  parts.push(`</svg>`);
  return parts.join("");
}

function drawLines(
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  _horizontal: boolean,
): string {
  const stackMode = model.stack === "none" ? null : model.stack;
  const layers = stackMode ? stackLayers(model.series, stackMode) : null;
  const out: string[] = [];
  const plotWidth = Math.max(1, plot.right - plot.left);
  const shared = sharedSample(model, layers, plotWidth);
  model.series.forEach((series, index) => {
    if (series.mark === "bar") return;
    appendLineSeries(out, model, series, index, layers, xScale, series.axis === "y2" ? y2Scale : yScale, plotWidth, shared);
  });
  return out.join("");
}

function drawBars(
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  horizontal: boolean,
): string {
  const stackMode = model.stack === "none" ? null : model.stack;
  const layers = stackMode ? stackLayers(model.series, stackMode) : null;
  const out: string[] = [];
  const barSeries = model.series.filter((series) => series.mark === "bar");
  model.series.forEach((series, index) => {
    if (series.mark !== "bar") return;
    const scale = series.axis === "y2" ? y2Scale : yScale;
    const barIndex = model.series.slice(0, index).filter((item) => item.mark === "bar").length;
    out.push(bars(model, series, index, barSeries.length, layers, xScale, scale, plot, horizontal, barIndex));
  });
  return out.join("");
}

/** Combo paints each series in order so a line can sit between bars. */
function drawCombo(
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  horizontal: boolean,
): string {
  const stackMode = model.stack === "none" ? null : model.stack;
  const layers = stackMode ? stackLayers(model.series, stackMode) : null;
  const out: string[] = [];
  const barSeries = model.series.filter((series) => series.mark === "bar");
  const plotWidth = Math.max(1, plot.right - plot.left);
  const shared = sharedSample(model, layers, plotWidth);
  model.series.forEach((series, index) => {
    const scale = series.axis === "y2" ? y2Scale : yScale;
    if (series.mark === "bar") {
      const barIndex = model.series.slice(0, index).filter((item) => item.mark === "bar").length;
      out.push(bars(model, series, index, barSeries.length, layers, xScale, scale, plot, horizontal, barIndex));
      return;
    }
    appendLineSeries(out, model, series, index, layers, xScale, scale, plotWidth, shared);
  });
  return out.join("");
}

function sharedSample(model: PlotModel, layers: Layers | null, plotWidth: number): ReturnType<typeof sampleSeries> | null {
  if (!layers || model.series.length === 0) return null;
  const top = layers.top[layers.top.length - 1];
  return sampleSeries(model.sampling, model.x, top, top.length, plotWidth, true);
}

function appendLineSeries(
  out: string[],
  model: PlotModel,
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  plotWidth: number,
  shared: ReturnType<typeof sampleSeries> | null,
): void {
  const ys = layers ? layers.top[index] : series.values;
  const sampled = shared ?? sampleSeries(model.sampling, model.x, ys, series.values.length, plotWidth, model.connectNulls);
  if (!sampled.reduced) {
    appendFullLine(out, model, series, index, layers, xScale, yScale);
    return;
  }
  const area = series.area || model.type === "stacked-area";
  for (const run of sampled.runs) {
    const points: Pt[] = new Array(run.length);
    const bottoms: Pt[] = area ? new Array(run.length) : [];
    for (let k = 0; k < run.length; k++) {
      const i = run[k];
      const x = xScale.center(i);
      const y = layers ? layers.top[index][i] : (series.values[i] ?? 0);
      points[k] = { x, y: yScale(y) };
      if (area) bottoms[k] = { x, y: yScale(layers ? layers.bottom[index][i] : 0) };
    }
    const indexAttr = ` data-ck-sample="${sampled.mode}" data-ck-i="${run.join(" ")}"`;
    if (area) {
      const fill = model.gradient ? `url(#${model.id}-g${index})` : series.color;
      out.push(`<path d="${areaPath(points, bottoms, model.curve)}" fill="${fill}" fill-opacity="${model.gradient ? 1 : model.fillOpacity}" stroke="none"${indexAttr} />`);
    }
    out.push(
      `<path d="${linePath(points, model.curve)}" fill="none" stroke="${series.color}" stroke-width="${model.strokeWidth}" stroke-linejoin="round" stroke-linecap="round"${dashAttr(series.dash)}${indexAttr} />`,
    );
    if (model.points === "always") {
      for (let k = 0; k < run.length; k++) {
        const point = points[k];
        out.push(`<circle cx="${n(point.x)}" cy="${n(point.y)}" r="${n(model.pointSize)}" fill="${series.color}" data-ck-i="${run[k]}" />`);
      }
    }
  }
}

function appendFullLine(
  out: string[],
  model: PlotModel,
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
): void {
  const points = pointsFor(series, index, layers, xScale, yScale, model);
  if (series.area || model.type === "stacked-area") {
    const bottoms = bottomPoints(series, index, layers, xScale, yScale, model);
    const fill = model.gradient ? `url(#${model.id}-g${index})` : series.color;
    for (const [top, bottom] of pairSegments(points, bottoms, model.connectNulls)) {
      out.push(`<path d="${areaPath(top, bottom, model.curve)}" fill="${fill}" fill-opacity="${model.gradient ? 1 : model.fillOpacity}" stroke="none" />`);
    }
  }
  for (const segment of segments(points, model.connectNulls)) {
    out.push(
      `<path d="${linePath(segment, model.curve)}" fill="none" stroke="${series.color}" stroke-width="${model.strokeWidth}" stroke-linejoin="round" stroke-linecap="round"${dashAttr(series.dash)} />`,
    );
  }
  if (model.points === "always") {
    for (const point of points) {
      if (!point) continue;
      out.push(`<circle cx="${n(point.x)}" cy="${n(point.y)}" r="${n(model.pointSize)}" fill="${series.color}" />`);
    }
  }
}

function bars(
  model: PlotModel,
  series: Series,
  index: number,
  barCount: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  plot: { left: number; right: number; top: number; bottom: number },
  horizontal: boolean,
  barIndex: number,
): string {
  const gap = clamp(model.gap, 0, 0.9);
  const out: string[] = [];
  const slot = layers ? 0 : barIndex;
  const slots = layers ? 1 : Math.max(1, barCount);
  for (let i = 0; i < series.values.length; i++) {
    const value = layers ? layers.top[index][i] : series.values[i];
    if (value === null && !layers) continue;
    const baseline = layers ? layers.bottom[index][i] : 0;
    const band = xScale.band(i);
    const inner = band.size * (1 - gap);
    const barSize = inner / slots;
    const start = band.start + (band.size - inner) / 2 + slot * barSize;
    const a = yScale(baseline);
    const b = yScale(value ?? baseline);
    const radius = n(model.cornerRadius);
    if (horizontal) {
      const y = start;
      const x = Math.min(a, b);
      const width = Math.max(0, Math.abs(b - a));
      out.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(Math.max(0, barSize - 1))}" rx="${radius}" fill="${series.color}" />`);
    } else {
      const x = start;
      const y = Math.min(a, b);
      const height = Math.max(0, Math.abs(b - a));
      out.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(Math.max(0, barSize - 1))}" height="${n(height)}" rx="${radius}" fill="${series.color}" />`);
      if (model.labelsOn && value !== null) {
        out.push(`<text x="${n(x + barSize / 2)}" y="${n(y - 4)}" text-anchor="middle" fill="${cssVar("text", model.preset.text)}" font-size="10" font-family="${font()}">${esc(formatNumber(value, model.locale))}</text>`);
      }
    }
  }
  return out.join("");
}

interface Pt {
  x: number;
  y: number;
}

function pointsFor(
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  model: PlotModel,
): (Pt | null)[] {
  return series.values.map((value, i) => {
    const plotted = layers ? layers.top[index][i] : value;
    if (plotted === null || (value === null && !model.connectNulls && !layers)) return null;
    return { x: xScale.center(i), y: yScale(plotted ?? 0) };
  });
}

function bottomPoints(
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  model: PlotModel,
): (Pt | null)[] {
  return series.values.map((value, i) => {
    if (value === null && !layers && !model.connectNulls) return null;
    const baseline = layers ? layers.bottom[index][i] : 0;
    return { x: xScale.center(i), y: yScale(baseline) };
  });
}

interface Layers {
  top: number[][];
  bottom: number[][];
}

function stackLayers(series: Series[], mode: "stack" | "percent"): Layers {
  const count = series[0]?.values.length ?? 0;
  const top = series.map(() => Array<number>(count).fill(0));
  const bottom = series.map(() => Array<number>(count).fill(0));
  for (let i = 0; i < count; i++) {
    let base = 0;
    let total = 0;
    if (mode === "percent") {
      for (const item of series) total += num(item.values[i]);
      if (total === 0) total = 1;
    }
    for (let s = 0; s < series.length; s++) {
      const raw = num(series[s].values[i]);
      const value = mode === "percent" ? (raw / total) * 100 : raw;
      bottom[s][i] = base;
      base += value;
      top[s][i] = base;
    }
  }
  return { top, bottom };
}

interface XScale {
  center(index: number): number;
  band(index: number): { start: number; size: number };
}

function xPosition(
  model: PlotModel,
  count: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  horizontal: boolean,
): XScale {
  const spanStart = horizontal ? top : left;
  const spanEnd = horizontal ? bottom : right;
  if (!model.x) {
    const size = count > 0 ? (spanEnd - spanStart) / count : spanEnd - spanStart;
    return {
      center: (index) => spanStart + size * index + size / 2,
      band: (index) => ({ start: spanStart + size * index, size }),
    };
  }
  let min = Infinity;
  let max = -Infinity;
  let seen = false;
  for (let i = 0; i < model.x.length; i++) {
    const value = model.x[i];
    if (value === null || !Number.isFinite(value)) continue;
    seen = true;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!seen) {
    min = 0;
    max = 1;
  }
  const scale = linear(min, max, spanStart, spanEnd);
  return {
    center: (index) => scale(model.x?.[index] ?? min),
    band: (index) => {
      const step = count > 1 ? (spanEnd - spanStart) / count : spanEnd - spanStart;
      return { start: spanStart + step * index, size: step };
    },
  };
}

function yAxisLabels(
  values: number[],
  scale: (value: number) => number,
  x: number,
  horizontal: boolean,
  model: PlotModel,
  right = false,
): string {
  return values
    .map((tick) => {
      const pos = scale(tick);
      const label = esc(formatNumber(tick, model.locale));
      if (horizontal) {
        return `<text x="${n(pos)}" y="${n(model.height - 8)}" text-anchor="middle" fill="${cssVar("muted", model.preset.muted)}" font-size="11" font-family="${font()}">${label}</text>`;
      }
      const anchor = right ? "start" : "end";
      const tx = right ? x + 6 : x - 6;
      return `<text x="${n(tx)}" y="${n(pos + 4)}" text-anchor="${anchor}" fill="${cssVar("muted", model.preset.muted)}" font-size="11" font-family="${font()}">${label}</text>`;
    })
    .join("");
}

function xAxisLabels(
  model: PlotModel,
  xScale: XScale,
  count: number,
  horizontal: boolean,
  plot: { left: number; bottom: number; top: number },
): string {
  const step = count > 8 ? Math.ceil(count / 6) : 1;
  const out: string[] = [];
  for (let i = 0; i < count; i += step) {
    const label = model.labels[i] ?? "";
    if (!label) continue;
    if (horizontal) {
      out.push(`<text x="${n(plot.left - 6)}" y="${n(xScale.center(i) + 4)}" text-anchor="end" fill="${cssVar("muted", model.preset.muted)}" font-size="11" font-family="${font()}">${esc(label)}</text>`);
    } else {
      out.push(`<text x="${n(xScale.center(i))}" y="${n(plot.bottom + 16)}" text-anchor="middle" fill="${cssVar("muted", model.preset.muted)}" font-size="11" font-family="${font()}">${esc(label)}</text>`);
    }
  }
  return out.join("");
}

function legend(model: PlotModel, x: number, y: number): string {
  return model.series
    .map((series, index) => {
      const dx = x + index * 120;
      return `<rect x="${n(dx)}" y="${n(y)}" width="10" height="10" rx="2" fill="${series.color}" /><text x="${n(dx + 16)}" y="${n(y + 9)}" fill="${cssVar("text", model.preset.text)}" font-size="12" font-family="${font()}">${esc(series.name)}</text>`;
    })
    .join("");
}

function openSvg(model: PlotModel): string {
  const width = model.responsive ? "100%" : String(model.width);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${model.height}" viewBox="0 0 ${model.width} ${model.height}" role="img" aria-label="${esc(model.alt)}" class="ck-chart" data-ck-type="${esc(model.type)}" data-ck-id="${model.id}">` +
    `<title>${esc(model.title || model.alt)}</title><desc>${esc(model.alt)}</desc>`;
}

function padding(model: PlotModel): { top: number; right: number; bottom: number; left: number } {
  const compact = model.type === "sparkline" || model.type === "mini-area";
  if (compact) return { top: 2, right: 2, bottom: 2, left: 2 };
  let top = 12;
  if (model.title) top += 22;
  if (model.subtitle) top += 16;
  if (model.legend) top += 22;
  return {
    top,
    right: model.showY2 ? 52 : 16,
    bottom: model.showX ? 32 : 12,
    left: model.showY ? 52 : 12,
  };
}

function domain(model: PlotModel, axis: "y" | "y2"): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  let seen = false;
  const consider = (value: number) => {
    if (!Number.isFinite(value)) return;
    seen = true;
    if (value < min) min = value;
    if (value > max) max = value;
  };
  if (model.stack !== "none" && axis === "y") {
    const layers = stackLayers(model.series, model.stack === "percent" ? "percent" : "stack");
    for (let s = 0; s < model.series.length; s++) {
      if (model.series[s].axis !== "y") continue;
      for (const value of layers.top[s]) consider(value);
      for (const value of layers.bottom[s]) consider(value);
    }
  } else {
    for (const series of model.series) {
      if (series.axis !== axis) continue;
      for (let i = 0; i < series.values.length; i++) {
        const value = series.values[i];
        if (value !== null) consider(value);
      }
    }
  }
  if (model.zero || model.stack !== "none") consider(0);
  if (!seen) return [0, 1];
  if (min === max) {
    min -= Math.abs(min) || 1;
    max += Math.abs(max) || 1;
  }
  return niceDomain(min, max);
}

function ticks(min: number, max: number, count: number): number[] {
  if (!(max > min)) return [min];
  const step = niceNum((max - min) / (count - 1), true) || 1;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let value = start; value <= max + step * 1e-6; value += step) {
    out.push(round(value));
    if (out.length > 12) break;
  }
  return out.length > 0 ? out : [min, max];
}

function linePath(points: Pt[], curve: Curve): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${n(points[0].x)} ${n(points[0].y)}`;
  if (curve === "monotone") return monotone(points);
  if (curve === "step" || curve === "step-before" || curve === "step-after") return step(points, curve);
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${n(point.x)} ${n(point.y)}`).join(" ");
}

function areaPath(top: Pt[], bottom: Pt[], curve: Curve): string {
  if (top.length === 0) return "";
  const forward = linePath(top, curve);
  const back = [...bottom].reverse();
  const backward = linePath(back, curve).replace(/^M/, "L");
  return `${forward} ${backward} Z`;
}

function monotone(points: Pt[]): string {
  let path = `M ${n(points[0].x)} ${n(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + ((p2.x - p0.x) / 6);
    const cp1y = p1.y + ((p2.y - p0.y) / 6);
    const cp2x = p2.x - ((p3.x - p1.x) / 6);
    const cp2y = p2.y - ((p3.y - p1.y) / 6);
    path += ` C ${n(cp1x)} ${n(cp1y)}, ${n(cp2x)} ${n(cp2y)}, ${n(p2.x)} ${n(p2.y)}`;
  }
  return path;
}

function step(points: Pt[], curve: Curve): string {
  let path = `M ${n(points[0].x)} ${n(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (curve === "step-before") path += ` L ${n(prev.x)} ${n(curr.y)} L ${n(curr.x)} ${n(curr.y)}`;
    else if (curve === "step-after") path += ` L ${n(curr.x)} ${n(prev.y)} L ${n(curr.x)} ${n(curr.y)}`;
    else {
      const mid = (prev.x + curr.x) / 2;
      path += ` L ${n(mid)} ${n(prev.y)} L ${n(mid)} ${n(curr.y)} L ${n(curr.x)} ${n(curr.y)}`;
    }
  }
  return path;
}

function segments(points: (Pt | null)[], connect: boolean): Pt[][] {
  if (connect) {
    const kept = points.filter((point): point is Pt => point !== null);
    return kept.length ? [kept] : [];
  }
  const out: Pt[][] = [];
  let current: Pt[] = [];
  for (const point of points) {
    if (!point) {
      if (current.length) out.push(current);
      current = [];
    } else current.push(point);
  }
  if (current.length) out.push(current);
  return out;
}

function pairSegments(top: (Pt | null)[], bottom: (Pt | null)[], connect: boolean): [Pt[], Pt[]][] {
  const pairs: [Pt[], Pt[]][] = [];
  let a: Pt[] = [];
  let b: Pt[] = [];
  for (let i = 0; i < top.length; i++) {
    if (!top[i] || !bottom[i]) {
      if (!connect && a.length) {
        pairs.push([a, b]);
        a = [];
        b = [];
      }
      continue;
    }
    a.push(top[i] as Pt);
    b.push(bottom[i] as Pt);
  }
  if (a.length) pairs.push([a, b]);
  return pairs;
}

function seriesMark(type: string, mark: unknown, area: boolean): "line" | "bar" | "area" {
  if (type === "bar") return "bar";
  if (type === "stacked-area" || type === "mini-area") return "area";
  if (mark === "bar" || mark === "line" || mark === "area") return mark;
  return area ? "area" : "line";
}

function stackMode(type: string, stack: unknown): "none" | "stack" | "percent" {
  if (stack === "none" || stack === "stack" || stack === "percent") {
    if (type === "stacked-area" && stack === "none") return "none";
    return stack;
  }
  return type === "stacked-area" ? "stack" : "none";
}

function curveOf(value: unknown): Curve {
  if (value === "linear" || value === "monotone" || value === "step" || value === "step-before" || value === "step-after") return value;
  return "monotone";
}

function zeroDefault(type: string, mark: Record<string, unknown>, series: Series[]): boolean {
  if (type === "bar" || type === "stacked-area" || type === "mini-area") return true;
  if (mark.area === true || series.some((item) => item.area)) return true;
  return false;
}

function heightOf(type: string, size: Record<string, unknown>, width: number): number {
  if (typeof size.height === "number") return size.height;
  if (size.height === "auto" && typeof size.aspectRatio === "number" && size.aspectRatio > 0) {
    return Math.max(1, Math.round(width / size.aspectRatio));
  }
  if (type === "sparkline") return 32;
  if (type === "mini-area") return 40;
  return 240;
}

function axisVisible(spec: Record<string, unknown>, key: "x" | "y" | "y2"): boolean {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  if (!axes || axes[key] === undefined) return key !== "y2" || false;
  return axes[key] !== false;
}

function gridOf(spec: Record<string, unknown>): false | "solid" | "dashed" | "dotted" {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const y = axes && isRecord(axes.y) ? axes.y.grid : undefined;
  if (y === false) return false;
  if (y === true || y === undefined) return "dashed";
  if (y === "solid" || y === "dashed" || y === "dotted") return y;
  return "dashed";
}

function legendVisible(spec: Record<string, unknown>): boolean {
  if (spec.legend === false) return false;
  if (spec.legend === true || spec.legend === undefined) return true;
  if (isRecord(spec.legend)) return spec.legend.show !== false;
  return true;
}

function channelField(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.field === "string") return value.field;
  return undefined;
}

interface YChannel {
  field?: string;
  title?: string;
  color?: string;
  axis: "y" | "y2";
  mark?: string;
  dash: string;
  area: boolean;
}

function readYChannels(y: unknown): YChannel[] {
  const list = Array.isArray(y) ? y : y === undefined ? [] : [y];
  return list.map((item) => {
    if (typeof item === "string") return { field: item, axis: "y" as const, dash: "solid", area: false };
    if (!isRecord(item)) return { axis: "y" as const, dash: "solid", area: false };
    return {
      field: typeof item.field === "string" ? item.field : undefined,
      title: typeof item.title === "string" ? item.title : undefined,
      color: typeof item.color === "string" ? item.color : undefined,
      axis: item.axis === "y2" ? "y2" : "y",
      mark: typeof item.mark === "string" ? item.mark : undefined,
      dash: item.dash === "dashed" || item.dash === "dotted" ? item.dash : "solid",
      area: item.area === true,
    };
  });
}

function dashAttr(dash: string): string {
  if (dash === "dashed") return ' stroke-dasharray="6 4"';
  if (dash === "dotted") return ' stroke-dasharray="1.5 3"';
  return "";
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function num(value: number | null): number {
  return value ?? 0;
}

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

