import { annotationLayers } from "../annotations";
import { isTypedArray, readData, type DataTable } from "../data";
import { formatValue } from "../format";
import { readSamplingMode, sampleSeries, type SamplingMode } from "../sampling";
import { clamp, esc, font, hash, isRecord, linear, logNice, logScale, logTicks, n, niceDomain, niceNum, round } from "../svg";
import { cssVar, lineStroke, paint, resolvePreset, type PresetTokens } from "../theme";

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
  values: ArrayLike<number | null>;
  color: string;
  /** One fill per bar when encoding.color names the x field. */
  colors?: string[];
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
  x: ArrayLike<number | null> | null;
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
  xTemporal: boolean;
  xFormat: unknown;
  yFormat: unknown;
  y2Format: unknown;
  yLog: boolean;
  y2Log: boolean;
  notes: unknown;
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
  let x: ArrayLike<number | null> | null = null;
  let xTemporal = false;
  const xIsTemporal = isRecord(encoding.x) && encoding.x.type === "temporal";
  const continuousX = type === "line" || type === "stacked-area" || type === "sparkline" || type === "mini-area";
  if (table.kind === "numbers") {
    const count = table.length;
    const indexes = new Float64Array(count);
    for (let i = 0; i < count; i++) indexes[i] = i;
    x = indexes;
  } else if (xChannel && table.columns[xChannel]) {
    const raw = table.columns[xChannel];
    if (continuousX && (isTypedArray(raw) || columnNumeric(raw))) {
      x = raw as ArrayLike<number | null>;
      xTemporal = xIsTemporal;
    } else {
      const temporal = !isTypedArray(raw) && (columnTemporal(raw) || xIsTemporal);
      if (temporal && type !== "bar") {
        x = mapNumbers(raw, toNumber);
        xTemporal = true;
      } else labels = stringLabels(raw);
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
        values: asNumbers(table.columns.value),
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
      const values = column ? asNumbers(column) : new Array<number | null>(length).fill(null);
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

  const pivoted = pivotBars(type, table, encoding, yChannels, preset);
  if (pivoted) {
    series = pivoted.series;
    labels = pivoted.labels;
    x = null;
    xTemporal = false;
  } else if (type === "bar" && series.length === 1) {
    colorBarsByX(series[0], labels, encoding, preset);
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
    cornerRadius: typeof mark.cornerRadius === "number" ? mark.cornerRadius : 3,
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
    xTemporal,
    xFormat: isRecord(encoding.x) ? encoding.x.format : undefined,
    yFormat: axisFormat(spec, "y", yChannels),
    y2Format: axisFormat(spec, "y2", yChannels),
    yLog: yChannels.some((channel) => channel.axis === "y" && channel.log),
    y2Log: yChannels.some((channel) => channel.axis === "y2" && channel.log),
    notes: spec.annotations,
  };
}

function modelToSvg(model: PlotModel, draw: MarkDraw): string {
  const horizontal = model.orientation === "horizontal" && model.type === "bar";
  const yDomain = domain(model, "y");
  const y2Domain = domain(model, "y2");
  const yTicks = model.yLog ? logTicks(yDomain[0], yDomain[1]) : ticks(yDomain[0], yDomain[1], 5);
  const y2Ticks = model.y2Log ? logTicks(y2Domain[0], y2Domain[1]) : ticks(y2Domain[0], y2Domain[1], 5);
  const yTickText = tickText(yTicks, model, model.yFormat);
  const y2TickText = tickText(y2Ticks, model, model.y2Format);
  const count = model.series[0]?.values.length ?? model.labels.length;
  const pad = padding(model, horizontal ? categoryTickText(model, count) : yTickText, y2TickText);
  const plot = {
    left: pad.left,
    top: pad.top,
    right: model.width - pad.right,
    bottom: model.height - pad.bottom,
  };
  const plotW = Math.max(1, plot.right - plot.left);
  const plotH = Math.max(1, plot.bottom - plot.top);
  const yScale = model.yLog
    ? logScale(yDomain[0], yDomain[1], horizontal ? plot.left : plot.bottom, horizontal ? plot.right : plot.top)
    : linear(yDomain[0], yDomain[1], horizontal ? plot.left : plot.bottom, horizontal ? plot.right : plot.top);
  const y2Scale = model.y2Log ? logScale(y2Domain[0], y2Domain[1], plot.bottom, plot.top) : linear(y2Domain[0], y2Domain[1], plot.bottom, plot.top);
  const xScale = xPosition(model, count, plot.left, plot.right, plot.top, plot.bottom, horizontal);

  const parts: string[] = [];
  parts.push(openSvg(model));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", model.preset.background)}" />`);
  if (model.title) {
    parts.push(`<text x="${n(pad.left)}" y="22" fill="${cssVar("text", model.preset.text)}" font-size="15" font-weight="650" font-family="${font()}">${esc(model.title)}</text>`);
  }
  if (model.subtitle) {
    parts.push(`<text x="${n(pad.left)}" y="${model.title ? 40 : 18}" fill="${cssVar("muted", model.preset.muted)}" font-size="12" font-weight="400" font-family="${font()}">${esc(model.subtitle)}</text>`);
  }
  if (model.legend) parts.push(legend(model, pad.left, model.title || model.subtitle ? (model.subtitle ? 54 : 36) : 8, plot.right));

  parts.push(`<defs><clipPath id="${model.id}-clip"><rect x="${n(plot.left)}" y="${n(plot.top)}" width="${n(plotW)}" height="${n(plotH)}" /></clipPath>`);
  if (model.gradient) {
    model.series.forEach((series, index) => {
      parts.push(
        `<linearGradient id="${model.id}-g${index}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${series.color}" stop-opacity="${model.fillOpacity}" /><stop offset="62%" stop-color="${series.color}" stop-opacity="${n(model.fillOpacity * 0.35)}" /><stop offset="100%" stop-color="${series.color}" stop-opacity="0" /></linearGradient>`,
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

  const notes = annotationLayers(model.notes, {
    plot,
    preset: model.preset,
    xAt: (value) => locateX(model, xScale, value, count),
    yAt: (value, axis) => {
      const numeric = dataNumber(value);
      if (numeric === null) return null;
      return (axis === "y2" ? y2Scale : yScale)(numeric);
    },
  });
  parts.push(`<g clip-path="url(#${model.id}-clip)">`);
  parts.push(notes.under);
  parts.push(draw(model, xScale, yScale, y2Scale, plot, horizontal));
  parts.push(`</g>`);
  parts.push(notes.over);

  if (model.showY) parts.push(yAxisLabels(yTickText, yTicks, yScale, plot.left, horizontal, model, false));
  if (model.showY2) parts.push(yAxisLabels(y2TickText, y2Ticks, y2Scale, plot.right, false, model, true));
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
      `<path d="${linePath(points, model.curve)}" fill="none" stroke="${strokeOf(series, model)}" stroke-width="${model.strokeWidth}" stroke-linejoin="round" stroke-linecap="round"${dashAttr(series.dash)}${indexAttr} />`,
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
  if (!layers && model.curve === "linear" && !series.area && model.type !== "stacked-area" && model.points !== "always") {
    appendLinear(out, model, series, xScale, yScale);
    return;
  }
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
      `<path d="${linePath(segment, model.curve)}" fill="none" stroke="${strokeOf(series, model)}" stroke-width="${model.strokeWidth}" stroke-linejoin="round" stroke-linecap="round"${dashAttr(series.dash)} />`,
    );
  }
  if (model.points === "always") {
    for (const point of points) {
      if (!point) continue;
      out.push(`<circle cx="${n(point.x)}" cy="${n(point.y)}" r="${n(model.pointSize)}" fill="${series.color}" />`);
    }
  }
}

/** Linear stroke with no area and no markers. Same commands as linePath, without a point object per row. */
function appendLinear(
  out: string[],
  model: PlotModel,
  series: Series,
  xScale: XScale,
  yScale: (value: number) => number,
): void {
  const values = series.values;
  let path = "";
  let open = false;
  const flush = () => {
    if (!path) return;
    out.push(
      `<path d="${path}" fill="none" stroke="${strokeOf(series, model)}" stroke-width="${model.strokeWidth}" stroke-linejoin="round" stroke-linecap="round"${dashAttr(series.dash)} />`,
    );
    path = "";
    open = false;
  };
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null) {
      if (!model.connectNulls) flush();
      continue;
    }
    const x = n(xScale.center(i));
    const y = n(yScale(value));
    if (!open) path = "M " + x + " " + y;
    else path += " L " + x + " " + y;
    open = true;
  }
  flush();
}

function strokeOf(series: Series, model: PlotModel): string {
  return lineStroke(series.color, model.strokeWidth);
}

/** Round only the end away from the baseline. A full rx would also round the base. */
function barMark(x: number, y: number, width: number, height: number, radius: number, edge: "top" | "bottom" | "left" | "right", fill: string): string {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  if (r < 0.5 || width <= 0 || height <= 0) {
    return `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" fill="${fill}" />`;
  }
  const x2 = x + width;
  const y2 = y + height;
  let d = "";
  if (edge === "top") {
    d = `M ${n(x + r)} ${n(y)} H ${n(x2 - r)} Q ${n(x2)} ${n(y)} ${n(x2)} ${n(y + r)} V ${n(y2)} H ${n(x)} V ${n(y + r)} Q ${n(x)} ${n(y)} ${n(x + r)} ${n(y)} Z`;
  } else if (edge === "bottom") {
    d = `M ${n(x)} ${n(y)} H ${n(x2)} V ${n(y2 - r)} Q ${n(x2)} ${n(y2)} ${n(x2 - r)} ${n(y2)} H ${n(x + r)} Q ${n(x)} ${n(y2)} ${n(x)} ${n(y2 - r)} Z`;
  } else if (edge === "right") {
    d = `M ${n(x)} ${n(y)} H ${n(x2 - r)} Q ${n(x2)} ${n(y)} ${n(x2)} ${n(y + r)} V ${n(y2 - r)} Q ${n(x2)} ${n(y2)} ${n(x2 - r)} ${n(y2)} H ${n(x)} Z`;
  } else {
    d = `M ${n(x + r)} ${n(y)} H ${n(x2)} V ${n(y2)} H ${n(x + r)} Q ${n(x)} ${n(y2)} ${n(x)} ${n(y2 - r)} V ${n(y + r)} Q ${n(x)} ${n(y)} ${n(x + r)} ${n(y)} Z`;
  }
  return `<path d="${d}" fill="${fill}" />`;
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
    const inset = slots > 1 ? 2 : 0;
    const fill = series.colors?.[i] ?? series.color;
    if (horizontal) {
      const y = start;
      const x = Math.min(a, b);
      const width = Math.max(0, Math.abs(b - a));
      const height = Math.max(0, barSize - inset);
      const edge = b >= a ? "right" : "left";
      out.push(barMark(x, y, width, height, model.cornerRadius, edge, fill));
    } else {
      const x = start;
      const y = Math.min(a, b);
      const height = Math.max(0, Math.abs(b - a));
      const width = Math.max(0, barSize - inset);
      const edge = b <= a ? "top" : "bottom";
      out.push(barMark(x, y, width, height, model.cornerRadius, edge, fill));
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
  const out: (Pt | null)[] = new Array(series.values.length);
  for (let i = 0; i < series.values.length; i++) {
    const value = series.values[i];
    const plotted = layers ? layers.top[index][i] : value;
    if (plotted === null || (value === null && !model.connectNulls && !layers)) out[i] = null;
    else out[i] = { x: xScale.center(i), y: yScale(plotted ?? 0) };
  }
  return out;
}

function bottomPoints(
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  model: PlotModel,
): (Pt | null)[] {
  const out: (Pt | null)[] = new Array(series.values.length);
  for (let i = 0; i < series.values.length; i++) {
    const value = series.values[i];
    if (value === null && !layers && !model.connectNulls) out[i] = null;
    else {
      const baseline = layers ? layers.bottom[index][i] : 0;
      out[i] = { x: xScale.center(i), y: yScale(baseline) };
    }
  }
  return out;
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
  at(value: number): number;
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
      at: (value) => spanStart + size * value + size / 2,
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
    at: (value) => scale(value),
  };
}

function yAxisLabels(
  labels: string[],
  values: number[],
  scale: (value: number) => number,
  x: number,
  horizontal: boolean,
  model: PlotModel,
  right = false,
): string {
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  let out = "";
  for (let i = 0; i < values.length; i++) {
    const pos = scale(values[i]);
    const label = esc(labels[i] ?? "");
    if (horizontal) {
      out += `<text x="${n(pos)}" y="${n(model.height - 8)}" text-anchor="middle" fill="${fill}" font-size="11" font-family="${family}">${label}</text>`;
    } else {
      const anchor = right ? "start" : "end";
      const tx = right ? x + 6 : x - 6;
      out += `<text x="${n(tx)}" y="${n(pos + 4)}" text-anchor="${anchor}" fill="${fill}" font-size="11" font-family="${family}">${label}</text>`;
    }
  }
  return out;
}

function xAxisLabels(
  model: PlotModel,
  xScale: XScale,
  count: number,
  horizontal: boolean,
  plot: { left: number; right?: number; bottom: number; top: number },
): string {
  if (model.xTemporal && model.x && !horizontal) return timeAxisLabels(model, xScale, plot);
  const step = count > 8 ? Math.ceil(count / 6) : 1;
  const out: string[] = [];
  let lastRight = -Infinity;
  for (let i = 0; i < count; i += step) {
    const label = tickLabel(model, i);
    if (!label) continue;
    if (horizontal) {
      out.push(`<text x="${n(plot.left - 6)}" y="${n(xScale.center(i) + 4)}" text-anchor="end" fill="${cssVar("muted", model.preset.muted)}" font-size="11" font-family="${font()}">${esc(label)}</text>`);
      continue;
    }
    const x = xScale.center(i);
    const width = label.length * 6.4;
    if (x - width / 2 < lastRight) continue;
    lastRight = x + width / 2 + 8;
    out.push(`<text x="${n(x)}" y="${n(plot.bottom + 16)}" text-anchor="middle" fill="${cssVar("muted", model.preset.muted)}" font-size="11" font-family="${font()}">${esc(label)}</text>`);
  }
  return out.join("");
}

function timeAxisLabels(model: PlotModel, xScale: XScale, plot: { left: number; right?: number; bottom: number }): string {
  let min = Infinity;
  let max = -Infinity;
  const column = model.x;
  if (!column) return "";
  for (let i = 0; i < column.length; i++) {
    const value = column[i];
    if (value === null || !Number.isFinite(value)) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!(max > min)) return "";
  const span = max - min;
  const plotWidth = Math.max(1, (plot.right ?? model.width) - plot.left);
  const ticks = timeTicks(min, max, Math.max(2, Math.floor(plotWidth / 72)));
  const out: string[] = [];
  let lastRight = -Infinity;
  for (const tick of ticks) {
    const label = formatTimeLabel(tick, span, model.locale, model.xFormat);
    if (!label) continue;
    const x = xScale.at(tick);
    const width = label.length * 6.4;
    if (x - width / 2 < lastRight) continue;
    if (x < plot.left - 4 || x > (plot.right ?? model.width) + 4) continue;
    lastRight = x + width / 2 + 8;
    out.push(`<text x="${n(x)}" y="${n(plot.bottom + 16)}" text-anchor="middle" fill="${cssVar("muted", model.preset.muted)}" font-size="11" font-family="${font()}">${esc(label)}</text>`);
  }
  return out.join("");
}

function legend(model: PlotModel, x: number, y: number, maxRight: number): string {
  let cx = x;
  let cy = y;
  const out: string[] = [];
  for (const series of model.series) {
    const width = 26 + series.name.length * 6.6;
    if (cx > x && cx + width > maxRight) {
      cx = x;
      cy += 18;
    }
    out.push(`<rect x="${n(cx)}" y="${n(cy)}" width="10" height="10" rx="2" fill="${series.color}" /><text x="${n(cx + 16)}" y="${n(cy + 9)}" fill="${cssVar("text", model.preset.text)}" font-size="12" font-family="${font()}">${esc(series.name)}</text>`);
    cx += width;
  }
  return out.join("");
}

function openSvg(model: PlotModel): string {
  const width = model.responsive ? "100%" : String(model.width);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${model.height}" viewBox="0 0 ${model.width} ${model.height}" role="img" aria-label="${esc(model.alt)}" class="ck-chart" data-ck-type="${esc(model.type)}" data-ck-id="${model.id}" style="font-variant-numeric:tabular-nums;font-feature-settings:'tnum'">` +
    `<title>${esc(model.title || model.alt)}</title><desc>${esc(model.alt)}</desc>`;
}

/** 11px tick labels are about 6.7px per character, plus the 6px anchor gap and a little edge. */
const TICK_PX = 6.7;

function widest(labels: string[]): number {
  let width = 0;
  for (let i = 0; i < labels.length; i++) {
    const size = labels[i].length * TICK_PX;
    if (size > width) width = size;
  }
  return width;
}

function padding(model: PlotModel, leftLabels: string[], rightLabels: string[]): { top: number; right: number; bottom: number; left: number } {
  const compact = model.type === "sparkline" || model.type === "mini-area";
  if (compact) return { top: 2, right: 2, bottom: 2, left: 2 };
  const horizontal = model.orientation === "horizontal" && model.type === "bar";
  const left = (horizontal ? model.showX : model.showY) ? Math.max(52, Math.ceil(widest(leftLabels) + 12)) : 12;
  const right = model.showY2 ? Math.max(52, Math.ceil(widest(rightLabels) + 12)) : 16;
  let top = 14;
  if (model.title) top += 20;
  if (model.subtitle) top += 18;
  if (model.legend) top += 12 + legendRows(model, left, model.width - right) * 18;
  return {
    top,
    right,
    bottom: model.showX ? 32 : 12,
    left,
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
  const log = axis === "y2" ? model.y2Log : model.yLog;
  if (log) {
    if (!seen || !(max > 0)) return [1, 10];
    const lo = min > 0 ? min : max / 10;
    return logNice(lo, max);
  }
  if (axisIncludesZero(model, axis)) consider(0);
  if (!seen) return [0, 1];
  if (min === max) {
    min -= Math.abs(min) || 1;
    max += Math.abs(max) || 1;
  }
  const [niceMin, niceMax] = niceDomain(min, max);
  const head = monotoneHeadroom(model, axis);
  let lo = niceMin;
  let hi = niceMax;
  if (head.above > 0 && max + head.above > niceMax) hi = round(max + head.above);
  const pinnedAtZero = axisIncludesZero(model, axis) && niceMin <= 0 && min >= 0;
  if (!pinnedAtZero && head.below > 0 && min - head.below < niceMin) lo = round(min - head.below);
  return [lo, hi];
}

/** How far a monotone control point leaves the data range. Linear and step curves stay on the points. */
function monotoneHeadroom(model: PlotModel, axis: "y" | "y2"): { above: number; below: number } {
  if (model.curve !== "monotone" || model.stack !== "none") return { above: 0, below: 0 };
  let above = 0;
  let below = 0;
  for (const series of model.series) {
    if (series.axis !== axis || series.mark === "bar") continue;
    const values: number[] = [];
    for (let i = 0; i < series.values.length; i++) {
      const value = series.values[i];
      if (value !== null && Number.isFinite(value)) values.push(value);
    }
    if (values.length < 3) continue;
    let hi = values[0];
    let lo = values[0];
    for (let i = 1; i < values.length; i++) {
      if (values[i] > hi) hi = values[i];
      if (values[i] < lo) lo = values[i];
    }
    for (let i = 0; i < values.length - 1; i++) {
      const p0 = values[Math.max(0, i - 1)];
      const p1 = values[i];
      const p2 = values[i + 1];
      const p3 = values[Math.min(values.length - 1, i + 2)];
      const cps = [p1 + (p2 - p0) / 6, p2 - (p3 - p1) / 6];
      for (let c = 0; c < cps.length; c++) {
        if (cps[c] > hi) above = Math.max(above, cps[c] - hi);
        if (cps[c] < lo) below = Math.max(below, lo - cps[c]);
      }
    }
  }
  return { above, below };
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
  if (stack === true) return "stack";
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

/** Bar and area marks include 0 on the axis they use. A combo line on the other axis does not. */
function axisIncludesZero(model: PlotModel, axis: "y" | "y2"): boolean {
  if (model.type === "bar" || model.type === "stacked-area" || model.type === "mini-area") return true;
  if (model.stack !== "none" && axis === "y") return true;
  for (let i = 0; i < model.series.length; i++) {
    const item = model.series[i];
    if (item.axis !== axis) continue;
    if (item.mark === "bar" || item.mark === "area" || item.area) return true;
  }
  return model.zero && model.series.every((item) => item.axis === axis);
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
  if (!axes || axes[key] === undefined) return true;
  return axes[key] !== false;
}

function gridOf(spec: Record<string, unknown>): false | "solid" | "dashed" | "dotted" {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const y = axes && isRecord(axes.y) ? axes.y.grid : undefined;
  if (y === false) return false;
  if (y === true || y === undefined) return "solid";
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
  log: boolean;
  format?: unknown;
}

function readYChannels(y: unknown): YChannel[] {
  const list = Array.isArray(y) ? y : y === undefined ? [] : [y];
  return list.map((item) => {
    if (typeof item === "string") return { field: item, axis: "y" as const, dash: "solid", area: false, log: false };
    if (!isRecord(item)) return { axis: "y" as const, dash: "solid", area: false, log: false };
    return {
      field: typeof item.field === "string" ? item.field : undefined,
      title: typeof item.title === "string" ? item.title : undefined,
      color: typeof item.color === "string" ? item.color : undefined,
      axis: item.axis === "y2" ? "y2" : "y",
      mark: typeof item.mark === "string" ? item.mark : undefined,
      dash: item.dash === "dashed" || item.dash === "dotted" ? item.dash : "solid",
      area: item.area === true,
      log: isRecord(item.scale) && item.scale.type === "log",
      format: item.format,
    };
  });
}

function dashAttr(dash: string): string {
  if (dash === "dashed") return ' stroke-dasharray="6 4"';
  if (dash === "dotted") return ' stroke-dasharray="1.5 3"';
  return "";
}

function legendRows(model: PlotModel, start: number, maxRight: number): number {
  let cx = start;
  let rows = 1;
  for (const series of model.series) {
    const width = 26 + series.name.length * 6.6;
    if (cx > start && cx + width > maxRight) {
      rows += 1;
      cx = start;
    }
    cx += width;
  }
  return rows;
}

function pivotBars(
  type: string,
  table: DataTable,
  encoding: Record<string, unknown>,
  yChannels: YChannel[],
  preset: PresetTokens,
): { series: Series[]; labels: string[] } | null {
  if (type !== "bar" || yChannels.length !== 1) return null;
  const yField = yChannels[0]?.field;
  const seriesField = seriesFieldName(encoding, table);
  if (!yField || !seriesField) return null;
  const yColumn = table.columns[yField];
  const seriesColumn = table.columns[seriesField];
  if (!yColumn || !seriesColumn) return null;
  const xName = channelField(encoding.x);
  const xColumn = xName ? table.columns[xName] : undefined;
  const categories: string[] = [];
  const groups: string[] = [];
  const sums = new Map<string, number>();
  for (let i = 0; i < table.length; i++) {
    const category = xColumn ? (xColumn[i] == null ? "" : String(xColumn[i])) : String(i);
    const group = seriesColumn[i] == null ? "" : String(seriesColumn[i]);
    if (!categories.includes(category)) categories.push(category);
    if (!groups.includes(group)) groups.push(group);
    const key = `${category}\0${group}`;
    const raw = yColumn[i];
    const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
    sums.set(key, (sums.get(key) ?? 0) + value);
  }
  const channel = yChannels[0];
  return {
    labels: categories,
    series: groups.map((group, index) => ({
      name: group,
      values: categories.map((category) => sums.get(`${category}\0${group}`) ?? 0),
      color: paint(undefined, preset, index),
      axis: channel.axis,
      mark: "bar" as const,
      dash: "solid",
      area: false,
    })),
  };
}

function seriesFieldName(encoding: Record<string, unknown>, table: DataTable): string | undefined {
  const xName = channelField(encoding.x);
  const named = channelField(encoding.series);
  if (named && named !== xName && table.columns[named]) return named;
  const color = channelField(encoding.color);
  if (color && color !== xName && table.columns[color]) return color;
  return undefined;
}

/** Colour each bar by its category. Does not run when color names a different column (that pivots). */
function colorBarsByX(series: Series, labels: string[], encoding: Record<string, unknown>, preset: PresetTokens): void {
  const colorName = channelField(encoding.color);
  const xName = channelField(encoding.x);
  if (!colorName || colorName !== xName || labels.length === 0) return;
  const palette = new Map<string, string>();
  let next = 0;
  const colors = new Array<string>(labels.length);
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i] ?? "";
    let color = palette.get(label);
    if (!color) {
      color = paint(undefined, preset, next);
      next += 1;
      palette.set(label, color);
    }
    colors[i] = color;
  }
  series.colors = colors;
}

function axisFormat(spec: Record<string, unknown>, key: "y" | "y2", channels: YChannel[]): unknown {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const axis = axes && isRecord(axes[key]) ? axes[key] : undefined;
  if (axis && axis.format !== undefined) return axis.format;
  return channels.find((channel) => channel.axis === key && channel.format !== undefined)?.format;
}

function locateX(model: PlotModel, xScale: XScale, value: number | string, count: number): number | null {
  if (typeof value === "number") {
    if (model.x) return xScale.at(value);
    if (value >= 0 && value < count) return xScale.center(value);
    return null;
  }
  if (model.xTemporal && model.x) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return xScale.at(parsed);
  }
  const index = model.labels.indexOf(value);
  if (index >= 0) return xScale.center(index);
  const numeric = Number(value);
  if (model.x && Number.isFinite(numeric)) return xScale.at(numeric);
  return null;
}

function dataNumber(value: number | string): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function timeTicks(min: number, max: number, count: number): number[] {
  const span = Math.max(max - min, 1);
  const steps = [MINUTE, 5 * MINUTE, 15 * MINUTE, 30 * MINUTE, HOUR, 3 * HOUR, 6 * HOUR, 12 * HOUR, DAY, 2 * DAY, 7 * DAY, 14 * DAY, 30 * DAY, 90 * DAY, 365 * DAY];
  let step = steps[steps.length - 1];
  for (const candidate of steps) {
    if (span / candidate <= count + 1) {
      step = candidate;
      break;
    }
  }
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let value = start; value <= max + step * 0.001 && out.length < 12; value += step) {
    if (value >= min - step * 0.001) out.push(value);
  }
  return out.length > 0 ? out : [min, max];
}

function formatTimeLabel(ms: number, span: number, locale: string, format: unknown): string {
  if (format !== undefined) return formatValue(ms, format, locale);
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  const options: Intl.DateTimeFormatOptions = { timeZone: "UTC" };
  if (span < 2 * DAY) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  } else if (span < 70 * DAY) {
    options.month = "short";
    options.day = "numeric";
  } else if (span < 800 * DAY) {
    options.month = "short";
    options.year = "numeric";
  } else options.year = "numeric";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function tickLabel(model: PlotModel, index: number): string {
  if (index < model.labels.length) return model.labels[index] ?? "";
  const value = model.x?.[index];
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function categoryTickText(model: PlotModel, count: number): string[] {
  const step = count > 8 ? Math.ceil(count / 6) : 1;
  const out: string[] = [];
  for (let i = 0; i < count; i += step) {
    const label = tickLabel(model, i);
    if (label) out.push(label);
  }
  return out;
}

function tickText(values: number[], model: PlotModel, format: unknown): string[] {
  const digits = tickDigits(values);
  const out = new Array<string>(values.length);
  for (let i = 0; i < values.length; i++) {
    out[i] = format === undefined ? formatNumber(values[i], model.locale, digits) : formatValue(values[i], format, model.locale);
  }
  return out;
}

function asNumbers(column: ArrayLike<unknown>): ArrayLike<number | null> {
  if (isTypedArray(column)) return column as ArrayLike<number | null>;
  return mapNumbers(column, toNullableNumber);
}

function mapNumbers(column: ArrayLike<unknown>, convert: (value: unknown) => number | null): (number | null)[] {
  const out = new Array<number | null>(column.length);
  for (let i = 0; i < column.length; i++) out[i] = convert(column[i]);
  return out;
}

function stringLabels(column: ArrayLike<unknown>): string[] {
  const out = new Array<string>(column.length);
  for (let i = 0; i < column.length; i++) {
    const value = column[i];
    out[i] = value == null ? "" : String(value);
  }
  return out;
}

function columnNumeric(column: ArrayLike<unknown>): boolean {
  for (let i = 0; i < column.length; i++) {
    const value = column[i];
    if (value !== null && typeof value !== "number") return false;
  }
  return true;
}

function columnTemporal(column: ArrayLike<unknown>): boolean {
  for (let i = 0; i < column.length; i++) {
    const value = column[i];
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return true;
  }
  return false;
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

function tickDigits(values: number[]): number {
  let gap = Infinity;
  for (let i = 1; i < values.length; i++) {
    const step = Math.abs(values[i] - values[i - 1]);
    if (step > 0 && step < gap) gap = step;
  }
  if (gap === Infinity) return 0;
  const digits = Math.ceil(-Math.log10(gap / 2));
  if (!Number.isFinite(digits) || digits < 0) return 0;
  return digits > 6 ? 6 : digits;
}

function formatNumber(value: number, locale: string, digits = 2): string {
  if (locale === "en-US") {
    const text = formatEn(value, digits);
    if (text !== null) return text;
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
}

/** en-US, then strip trailing zeros. Null sends huge or non-finite values to Intl. */
function formatEn(value: number, digits: number): string | null {
  if (!Number.isFinite(value)) return null;
  const neg = value < 0;
  const abs = Math.abs(value);
  if (abs >= 1e15) return null;
  const fixed = abs.toFixed(digits);
  if (fixed.includes("e")) return null;
  const dot = fixed.indexOf(".");
  const whole = dot === -1 ? fixed : fixed.slice(0, dot);
  let frac = dot === -1 ? "" : fixed.slice(dot + 1).replace(/0+$/, "");
  let grouped = "";
  for (let i = 0; i < whole.length; i++) {
    if (i > 0 && (whole.length - i) % 3 === 0) grouped += ",";
    grouped += whole[i];
  }
  const body = frac ? `${grouped}.${frac}` : grouped;
  return neg ? `-${body}` : body;
}

