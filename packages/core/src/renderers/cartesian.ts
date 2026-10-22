import { annotationLayers, notesNeedSamples, seriesPoints } from "../annotations";
import { capturing, noteIngest, noteSvg, runCapture } from "../canvas/scene-hook";
import { isPaintColumn, matchRule, readRules, resolveColors, ruleCaption, ruleMatchesAny, withPalette, type ColorRule } from "../color";
import { loadTable } from "../data-prep";
import { isTypedArray, type DataTable } from "../data";
import { formatZoned, zoneOf, zonedTimeTicks } from "../timezone";
import { formatAxisValue, formatValue } from "../format";
import { bag, glyphOf, marker, named, nudge, type Bag } from "../glyphs";
import { canvasWanted } from "../render-mode";
import { beginFrame, dataSampling, noteDense, noteLinear, readSamplingMode, sampleSeries, type SamplingMode } from "../sampling";
import type { ColorScale } from "../color-scale";
import { exportList, readColor } from "../frame";
import { legendSpace, paintLegend, readLegend, type LegendBox, type LegendItem } from "../legend";
import { layoutPaint } from "../layout-hook";
import { boxId, clamp, clipPath, domainEnds, esc, font, hash, isRecord, linear, logNice, logScale, logTicks, n, niceDomain, padExtent, round, scaleClamp, scalePad, ticks } from "../svg";
import { cssVar, lineStroke, paint, resolveGeometry, resolvePreset, type PresetTokens } from "../theme";

export interface AxisBox {
  title?: string;
  count?: number;
  labels: boolean;
  /** Non-default side. Set when the axis extras are mounted. */
  end?: boolean;
  values?: number[];
  rotate?: number;
  titleAt?: string;
  titleSpin?: number;
  skip?: boolean;
  wrapW?: number;
  wrapN?: number;
  rule?: { on: boolean; color?: string; width?: number; dash?: string };
  tick?: string;
  tickLen?: number;
}

export interface Pad {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface PlotBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface AxisHooks {
  prepare(spec: Record<string, unknown>, shell: ChartShell): void;
  /** Vertical grid for `axes.x.grid`. Labels and padding use the shared axis routine. */
  grid(model: PlotModel, plot: PlotBox, horizontal: boolean, count: number, xScale: XScale): string | null;
  seriesName(model: PlotModel, series: Series): string | null;
}

let hooks: AxisHooks | null = null;
let totalHook: TotalHook | null = null;
let rangePainter: ((series: Series, index: number, xAt: (index: number) => number, yAt: (value: number) => number) => string) | null = null;
let rangePrepare:
  | ((table: DataTable, encoding: Record<string, unknown>, series: Series[], labels: string[]) => { series: Series[]; labels: string[] } | null)
  | null = null;

/** Combo mounts this. Line does not, so a lo/hi band stays out of createRenderer([line]). */
export function mountRange(
  painter: (series: Series, index: number, xAt: (index: number) => number, yAt: (value: number) => number) => string,
  prepare: (table: DataTable, encoding: Record<string, unknown>, series: Series[], labels: string[]) => { series: Series[]; labels: string[] } | null,
): void {
  rangePainter = painter;
  rangePrepare = prepare;
}

export type TotalHook = (
  model: PlotModel,
  layers: Layers,
  xScale: XScale,
  yScale: (value: number) => number,
  horizontal: boolean,
  held: Bag,
) => string;

/** Stack-total labels. Bar and stacked-area entries call this so the line bundle can omit them. */
export function mountTotals(hook: TotalHook): void {
  totalHook = hook;
}

/** Position, rotation, explicit ticks, and legend values. Chart entries call `mountAxes`. */
export function installAxes(next: AxisHooks): void {
  hooks = next;
}

type MarkDraw = (
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  horizontal: boolean,
) => string;

function renderTyped(
  spec: Record<string, unknown>,
  type: string,
  draw: MarkDraw,
  adjust?: (
    table: DataTable,
    encoding: Record<string, unknown>,
    channels: YChannel[],
    preset: PresetTokens,
    series: Series[],
    labels: string[],
  ) => { series: Series[]; labels: string[] } | null,
): string | null {
  if (spec.type !== type) return null;
  beginFrame();
  const t0 = performance.now();
  const model = toModel(spec, adjust);
  const ingest = performance.now() - t0;
  if (!model) return null;
  if (capturing()) noteIngest(ingest);
  return modelToSvg(model, draw);
}

type ColorScaleReader = (channel: unknown, preset: PresetTokens, values: ArrayLike<number>, fallback: boolean) => ColorScale | null;

let colorScaleReader: ColorScaleReader | null = null;

/**
 * Bar and combo mount this. Line, area, and sparkline do not, so a plain line
 * bundle pays for legend layout and not for sequential, diverging, quantize, or threshold.
 * A line chart never paints a quantitative ramp, including from the full bundle, so the
 * two entries stay in step.
 */
export function mountColorScale(reader: ColorScaleReader): void {
  colorScaleReader = reader;
}

/** Area is type "line" plus mark.area, so it stays in this entry. */
export function renderLine(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "line", drawLines);
}

export function renderBar(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "bar", drawBars, (table, encoding, channels, preset, series, labels) => {
    const pivoted = pivotBars(table, encoding, channels, preset);
    if (pivoted) return pivoted;
    return null;
  });
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
  return renderTyped(
    spec,
    "combo",
    drawCombo,
    rangePrepare ? (table, encoding, _channels, _preset, series, labels) => rangePrepare?.(table, encoding, series, labels) ?? null : undefined,
  );
}

/** Line, bar, area, sparkline, and combo. The canvas chunk calls this while capture is mounted. */
export function renderPlotted(spec: Record<string, unknown>): string | null {
  switch (spec.type) {
    case "line":
      return renderLine(spec);
    case "bar":
      return renderBar(spec);
    case "stacked-area":
      return renderStackedArea(spec);
    case "sparkline":
      return renderSparkline(spec);
    case "mini-area":
      return renderMiniArea(spec);
    case "combo":
      return renderCombo(spec);
    default:
      return null;
  }
}

export interface Series {
  name: string;
  values: ArrayLike<number | null>;
  color: string;
  /** One fill per bar when encoding.color names the x field. */
  colors?: string[];
  /** Caption of the colour rule that painted each value. Empty when that point has no label. */
  ruleLabels?: string[];
  /** Legend text when mark.baseLabel folds the unmatched colour into this series. */
  legendName?: string;
  /** Point is an outline in the rule colour, so it can share that legend entry with the bars. */
  ruleHollow?: boolean[];
  axis: "y" | "y2";
  mark: "line" | "bar" | "area" | "range";
  /** Low and high of a combo range band. The line entry never fills this. */
  span?: { lo: ArrayLike<number | null>; hi: ArrayLike<number | null> };
  /** Fill opacity of a combo range band. The line entry never reads this. */
  bandOpacity?: number;
  dash: string;
  area: boolean;
  shape?: string;
  radius?: number;
  hollow?: boolean;
  format?: unknown;
}

export interface PlotModel {
  type: string;
  title?: string;
  subtitle?: string;
  alt: string;
  locale: string;
  /** IANA zone for temporal ticks. UTC when the spec omits timezone. */
  zone: string;
  width: number;
  height: number;
  responsive: boolean;
  labels: string[];
  x: ArrayLike<number | null> | null;
  series: Series[];
  curve: Curve;
  sampling: SamplingMode;
  /** Marks paint on a canvas overlay. Chrome stays in this SVG. */
  canvas?: boolean;
  stack: "none" | "stack" | "percent";
  orientation: "vertical" | "horizontal";
  fillOpacity: number;
  /** Emitted fill-opacity. A var() when the spec did not set mark.fillOpacity. */
  fillPaint: string;
  strokeWidth: number;
  /** Emitted stroke-width. A var() when the spec did not set mark.strokeWidth. */
  strokePaint: string;
  gradient: boolean;
  /** Blurred understroke. The filter is omitted unless this is set. */
  glow: boolean;
  /** Colour-rule swatches. A bar rule uses the bar fill. Shown when the legend is. */
  ruleLegend?: { name: string; color: string; symbol?: "circle" | "square" }[];
  points: "none" | "hover" | "always";
  /** off omits circles. hidden keeps them so --ck-line-dots can show them. shown uses inline. */
  dots: "off" | "hidden" | "shown";
  pointSize: number;
  connectNulls: boolean;
  cornerRadius: number;
  /** When true, bar radius is var(--ck-bar-radius), outer end only. */
  radiusVar: boolean;
  gap: number;
  labelsOn: boolean;
  pointShape: string;
  pointHollow: boolean;
  labelAt: string;
  labelEnds: string;
  labelFormat: unknown;
  stackTotal: boolean;
  /** Data labels drawn after the plot clip so they are not cut off. */
  late: string;
  showX: boolean;
  showY: boolean;
  showY2: boolean;
  yGrid: false | "solid" | "dashed" | "dotted";
  legend: boolean;
  /** Spec asked for a legend. A one-series chart can still hide the series key. */
  legendOn: boolean;
  legendBox: LegendBox | null;
  exportMark: string;
  colorScale: ColorScale | null;
  swatches?: { name: string; color: string }[];
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
  bands?: { x?: unknown; y?: unknown; y2?: unknown };
  xAxis: AxisBox;
  yAxis: AxisBox;
  y2Axis: AxisBox;
  inset: { t?: number; r?: number; b?: number; l?: number };
  description?: string;
  intent?: string;
  /** Scale bits set by the axis extra. 0 keeps the classic scale. */
  f: number;
  /** Right-to-left: title on the right. The axis extra mirrors x and parks y on the right. */
  rtl?: boolean;
  /** Extra room on a quantitative x, as fractions of the span. */
  xPad?: { min: number; max: number } | null;
  /** Categorical line points sit on the plot edges. `scale.padding: 0`. Bars stay in bands. */
  xEdge?: boolean;
  xClamp?: boolean;
  lv?: boolean;
  gx?: false | "solid" | "dashed" | "dotted";
}

type Curve = "linear" | "monotone" | "step" | "step-before" | "step-after";

export interface ChartShell {
  /** Non-data spec contents. In-place edits change it; replacing `data` does not. */
  stamp: string;
  type: string;
  preset: PresetTokens;
  channels: YChannel[];
  xField?: string;
  xIsTemporal: boolean;
  continuousX: boolean;
  curve: Curve;
  sampling: SamplingMode;
  stack: PlotModel["stack"];
  width: number;
  height: number;
  responsive: boolean;
  alt: string;
  locale: string;
  zone: string;
  id: string;
  title?: string;
  subtitle?: string;
  orientation: PlotModel["orientation"];
  fillOpacity: number;
  fillPaint: string;
  strokeWidth: number;
  strokePaint: string;
  gradient: boolean;
  glow: boolean;
  points: PlotModel["points"];
  dots: PlotModel["dots"];
  pointSize: number;
  connectNulls: boolean;
  cornerRadius: number;
  radiusVar: boolean;
  gap: number;
  labelsOn: boolean;
  pointShape: string;
  pointHollow: boolean;
  labelAt: string;
  labelEnds: string;
  labelFormat: unknown;
  stackTotal: boolean;
  late: string;
  showX: boolean;
  showY: boolean;
  showY2: boolean;
  legendOn: boolean;
  legendBox: LegendBox | null;
  exportMark: string;
  swatches?: { name: string; color: string }[];
  yGrid: PlotModel["yGrid"];
  xFormat: unknown;
  yFormat: unknown;
  y2Format: unknown;
  yLog: boolean;
  y2Log: boolean;
  xAxis: AxisBox;
  yAxis: AxisBox;
  y2Axis: AxisBox;
  inset: { t?: number; r?: number; b?: number; l?: number };
  description?: string;
  intent?: string;
  /** Scale bits set by the axis extra. 0 keeps the classic scale. */
  f: number;
  rtl?: boolean;
  lv?: boolean;
  gx?: false | "solid" | "dashed" | "dotted";
}

function shellStamp(spec: Record<string, unknown>): string {
  return JSON.stringify(spec, (key, value) => (key === "data" ? undefined : value)) ?? "";
}

let chartShell: ChartShell | null = null;

/** Theme, channels, and geometry. Reused when a later spec only replaces `data`. */
function shellFor(spec: Record<string, unknown>): ChartShell {
  const stamp = shellStamp(spec);
  const hit = chartShell;
  if (hit && hit.stamp === stamp) return hit;
  const type = spec.type as string;
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const preset = withPalette(resolvePreset(spec.theme), mark);
  const channels = readYChannels(encoding.y);
  const size = isRecord(spec.size) ? spec.size : {};
  const width = typeof size.width === "number" ? size.width : 640;
  const compact = type === "sparkline" || type === "mini-area";
  const geometry = resolveGeometry(spec.theme);
  const opacitySet = typeof mark.fillOpacity === "number";
  const fillOpacity = opacitySet ? (mark.fillOpacity as number) : geometry.fillOpacity;
  const strokeSet = typeof mark.strokeWidth === "number";
  const strokeWidth = strokeSet ? (mark.strokeWidth as number) : compact ? geometry.compactStroke : geometry.strokeWidth;
  const radiusSet = typeof mark.cornerRadius === "number";
  const pointsSet = mark.points === "always" || mark.points === "none" || mark.points === "hover";
  const points = pointsSet ? (mark.points as "none" | "hover" | "always") : geometry.points;
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : "";
  const idSource = typeof spec.id === "string" ? spec.id : alt || type;
  const orientation = mark.orientation === "horizontal" && type === "bar" ? "horizontal" : "vertical";
  const xObj = isRecord(encoding.x) ? encoding.x : undefined;
  const next: ChartShell = {
    stamp,
    type,
    preset,
    channels,
    xField: channelField(encoding.x),
    xIsTemporal: isRecord(encoding.x) && encoding.x.type === "temporal",
    continuousX: type === "line" || type === "stacked-area" || type === "sparkline" || type === "mini-area",
    curve: curveOf(mark.curve),
    sampling: readSamplingMode(mark.sampling),
    stack: stackMode(type, mark.stackTotal === true && (type === "bar" || type === "stacked-area") && stackMode(type, mark.stack) === "none" ? "stack" : mark.stack),
    width,
    height: heightOf(type, size, width),
    responsive: size.width === undefined || size.width === "auto",
    alt,
    locale: typeof spec.locale === "string" ? spec.locale : "en-US",
    zone: zoneOf(spec),
    id: `ck${hash(idSource)}`,
    title: typeof spec.title === "string" ? spec.title : undefined,
    subtitle: typeof spec.subtitle === "string" ? spec.subtitle : undefined,
    orientation,
    fillOpacity,
    fillPaint: opacitySet ? n(fillOpacity) : `var(--ck-area-opacity, ${n(fillOpacity)})`,
    strokeWidth,
    strokePaint: strokeSet ? n(strokeWidth) : `var(--ck-line-width, ${n(strokeWidth)})`,
    gradient: mark.gradient !== false,
    glow: (type === "line" || type === "sparkline" || type === "combo") && mark.glow === true,
    points,
    dots: points === "always" ? "shown" : points === "none" && !pointsSet ? "hidden" : "off",
    pointSize: typeof mark.pointSize === "number" ? mark.pointSize : geometry.pointSize,
    connectNulls: mark.connectNulls === true,
    cornerRadius: radiusSet ? (mark.cornerRadius as number) : geometry.cornerRadius,
    radiusVar: !radiusSet,
    gap: typeof mark.gap === "number" ? mark.gap : geometry.gap,
    labelsOn: mark.labels === true,
    pointShape: glyphOf(mark.pointShape),
    pointHollow: mark.pointFill === "hollow",
    labelAt: named(mark.labelPosition, LABEL_AT),
    labelEnds: named(mark.labelEnds, LABEL_ENDS),
    labelFormat: mark.labelFormat,
    stackTotal: mark.stackTotal === true && (type === "bar" || type === "stacked-area"),
    late: "",
    showX: !compact && axisVisible(spec, "x"),
    showY: !compact && axisVisible(spec, "y"),
    showY2: !compact && axisVisible(spec, "y2"),
    legendOn: !compact && legendVisible(spec),
    legendBox: compact ? null : readLegend(spec),
    exportMark: exportList(spec),
    yGrid: compact ? false : gridOf(spec),
    xFormat: xObj?.format,
    yFormat: axisFormat(spec, "y", channels),
    y2Format: axisFormat(spec, "y2", channels),
    yLog: channels.some((channel) => channel.axis === "y" && channel.log),
    y2Log: channels.some((channel) => channel.axis === "y2" && channel.log),
    xAxis: { labels: true },
    yAxis: { labels: true },
    y2Axis: { labels: true },
    inset: {},
    f: 0,
    rtl: isRecord(spec.layout) && spec.layout.direction === "rtl",
  };
  hooks?.prepare(spec, next);
  chartShell = next;
  return next;
}

function toModel(
  spec: Record<string, unknown>,
  adjust?: (
    table: DataTable,
    encoding: Record<string, unknown>,
    channels: YChannel[],
    preset: PresetTokens,
    series: Series[],
    labels: string[],
  ) => { series: Series[]; labels: string[] } | null,
): PlotModel | null {
  const read = loadTable(spec);
  if (!read.ok) return null;
  const table = read.table;
  const shell = shellFor(spec);
  const { type, preset, channels: yChannels } = shell;
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const mark = isRecord(spec.mark) ? spec.mark : {};

  let labels: string[] = [];
  let x: ArrayLike<number | null> | null = null;
  let xTemporal = false;
  if (table.kind === "numbers") {
    const count = table.length;
    const indexes = new Float64Array(count);
    for (let i = 0; i < count; i++) indexes[i] = i;
    x = indexes;
  } else if (shell.xField && table.columns[shell.xField]) {
    const raw = table.columns[shell.xField];
    if (shell.continuousX && (isTypedArray(raw) || columnNumeric(raw))) {
      x = raw as ArrayLike<number | null>;
      xTemporal = shell.xIsTemporal;
    } else {
      const temporal = !isTypedArray(raw) && (columnTemporal(raw) || shell.xIsTemporal);
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
        shape: glyphOf(mark.pointShape),
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
        shape: channel.pointShape,
        radius: channel.pointSize,
        hollow: channel.pointHollow || undefined,
        format: channel.format,
      };
    });
  }

  const pivoted = adjust?.(table, encoding, yChannels, preset, series, labels) ?? null;
  if (pivoted) {
    series = pivoted.series;
    labels = pivoted.labels;
    x = null;
    xTemporal = false;
  }
  const colorScale = applyPointColors(table, encoding, mark, preset, series, labels, type === "bar" || type === "combo");
  const ruleLegend = colorScale ? [] : ruleSwatches(series, readRules(mark), preset, baseLabelOf(mark));
  const swatches = colorScale || ruleLegend.length ? undefined : categorySwatches(spec, series, labels);

  return {
    ...shell,
    labels,
    // Bars need category bands. A combo of only lines and areas keeps a temporal or linear x.
    x: type === "bar" || (type === "combo" && series.some((item) => item.mark === "bar")) ? null : x,
    series,
    showY2: shell.showY2 && series.some((item) => item.axis === "y2"),
    legend: shell.legendOn && (series.length > 1 || Boolean(swatches) || ruleLegend.length > 0),
    legendOn: shell.legendOn,
    sampling: dataSampling(spec) ?? shell.sampling,
    canvas: canvasWanted(spec),
    colorScale,
    swatches,
    ruleLegend,
    zero: zeroDefault(type, mark, series),
    xTemporal,
    notes: spec.annotations,
    bands: readBands(spec),
    xPad: scalePad(encoding.x),
    xEdge: xEdgeOf(encoding.x),
    xClamp: scaleClamp(encoding.x),
  };
}

function modelToSvg(model: PlotModel, draw: MarkDraw): string {
  const tScale = performance.now();
  const horizontal = model.orientation === "horizontal" && model.type === "bar";
  const yDomain = domain(model, "y");
  const y2Domain = domain(model, "y2");
  const yTicks = resolveTicks(model, "y", yDomain[0], yDomain[1], model.yAxis?.count ?? 5, model.yLog);
  const y2Ticks = resolveTicks(model, "y2", y2Domain[0], y2Domain[1], model.y2Axis?.count ?? 5, model.y2Log);
  const yTickText = tickText(yTicks, model, model.yFormat);
  const y2TickText = tickText(y2Ticks, model, model.y2Format);
  const count = model.series[0]?.values.length ?? model.labels.length;
  const pad = padding(model, yTickText, y2TickText, categoryTickText(model, count));
  const plot = {
    left: pad.left,
    top: pad.top,
    right: model.width - pad.right,
    bottom: model.height - pad.bottom,
  };
  const plotW = Math.max(1, plot.right - plot.left);
  const plotH = Math.max(1, plot.bottom - plot.top);
  const yRev = model.f & 8;
  const yFrom = horizontal ? (yRev ? plot.right : plot.left) : yRev ? plot.top : plot.bottom;
  const yTo = horizontal ? (yRev ? plot.left : plot.right) : yRev ? plot.bottom : plot.top;
  const yScaleRaw = model.yLog ? logScale(yDomain[0], yDomain[1], yFrom, yTo) : linear(yDomain[0], yDomain[1], yFrom, yTo);
  const yScale = modelClamp(yScaleRaw, yDomain, axisClamps(model, "y"));
  const y2Rev = model.f & 16;
  const y2From = y2Rev ? plot.top : plot.bottom;
  const y2To = y2Rev ? plot.bottom : plot.top;
  const y2ScaleRaw = model.y2Log ? logScale(y2Domain[0], y2Domain[1], y2From, y2To) : linear(y2Domain[0], y2Domain[1], y2From, y2To);
  const y2Scale = modelClamp(y2ScaleRaw, y2Domain, axisClamps(model, "y2"));
  const xScale = xPosition(model, count, plot.left, plot.right, plot.top, plot.bottom, horizontal);
  const pass = capturing()
    ? runCapture({
        model,
        xScale,
        yScale,
        y2Scale,
        plot,
        count,
        scalesMs: performance.now() - tScale,
        yDomain,
        y2Domain,
      })
    : "off";
  if (pass === "reuse") return "";

  const tSvg = performance.now();
  const paint = layoutPaint();
  textDir = paint ? paint.bidi(Boolean(model.rtl)) : "";
  const parts: string[] = [];
  parts.push(openSvg(model));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", model.preset.background)}" />`);
  const titleX = paint ? paint.titleX(Boolean(model.rtl), model.width, pad.left) : pad.left;
  const titleAnchor = paint ? paint.titleAttr(Boolean(model.rtl)) : "";
  if (model.title) {
    parts.push(`<text x="${n(titleX)}" y="22"${titleAnchor} fill="${cssVar("text", model.preset.text)}" font-size="15" font-weight="650" font-family="${font()}">${esc(model.title)}</text>`);
  }
  if (model.subtitle) {
    parts.push(`<text x="${n(titleX)}" y="${model.title ? 40 : 18}"${titleAnchor} fill="${cssVar("muted", model.preset.muted)}" font-size="12" font-weight="400" font-family="${font()}">${esc(model.subtitle)}</text>`);
  }
  if (model.legend && !model.legendBox) parts.push(legend(model, pad.left, model.title || model.subtitle ? (model.subtitle ? 54 : 36) : 8, plot.right));

  const clip = boxId(model.id, plot.left, plot.top, plotW, plotH);
  parts.push(`<defs>${clipPath(clip, plot.left, plot.top, plotW, plotH)}`);
  if (model.glow) {
    const blur = model.preset.text === "#ffffff" ? 3 : 1.8;
    parts.push(`<filter id="${model.id}glow" x="-25%" y="-50%" width="150%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>`);
  }
  if (model.gradient) {
    model.series.forEach((series, index) => {
      parts.push(
        `<linearGradient id="${model.id}-g${index}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${series.color}" stop-opacity="${model.fillPaint}" /><stop offset="62%" stop-color="${series.color}" stop-opacity="${areaMid(model)}" /><stop offset="100%" stop-color="${series.color}" stop-opacity="0" /></linearGradient>`,
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
  const grid = hooks?.grid(model, plot, horizontal, count, xScale);
  if (grid) parts.push(grid);

  const notes = annotationLayers(model.notes, {
    plot,
    taken: seriesLabelBoxes(model, xScale, yScale, y2Scale, horizontal),
    preset: model.preset,
    xAt: (value) => locateX(model, xScale, value, count),
    yAt: (value, axis) => {
      const numeric = dataNumber(value);
      if (numeric === null) return null;
      return (axis === "y2" ? y2Scale : yScale)(numeric);
    },
    samples: notesNeedSamples(model.notes)
      ? model.series.map((series) => ({ name: series.name, axis: series.axis, pts: seriesPoints(model.x, series.values) }))
      : undefined,
    labels: model.labels,
    temporal: model.xTemporal,
    xNum: model.x,
    slot: (index) => xScale.band(index),
    count,
    flip: horizontal,
    bands: model.bands,
  });
  parts.push(`<g clip-path="url(#${clip})">`);
  parts.push(notes.under);
  if (pass === "off") {
    const marks = draw(model, xScale, yScale, y2Scale, plot, horizontal);
    parts.push(model.canvas ? `<g data-ck-layer="marks">${marks}</g>` : marks);
  }
  parts.push(`</g>`);
  parts.push(notes.over);
  if (model.late) parts.push(model.late);

  parts.push(drawAxes(model, plot, horizontal, count, yTicks, y2Ticks, yTickText, y2TickText, yScale, y2Scale, xScale));
  if (model.legend && model.legendBox) {
    parts.push(paintLegend(model.legendBox, legendItems(model), { plot, width: model.width, height: model.height, preset: model.preset }));
  }
  if (model.colorScale && model.legendOn) parts.push(model.colorScale.legend(plot.left, model.height - 46, cssVar("muted", model.preset.muted)));

  parts.push(`</svg>`);
  if (pass !== "off") noteSvg(performance.now() - tSvg);
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
  const held = bag();
  let late = "";
  if (layers && totalHook) late += totalHook(model, layers, xScale, yScale, false, held);
  late += placeLineLabels(model, layers, xScale, yScale, y2Scale, held);
  if (late) model.late += late;
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
  const labs: Lab[] = [];
  const barSeries = model.series.filter((series) => series.mark === "bar");
  model.series.forEach((series, index) => {
    if (series.mark !== "bar") return;
    const scale = series.axis === "y2" ? y2Scale : yScale;
    const barIndex = model.series.slice(0, index).filter((item) => item.mark === "bar").length;
    out.push(bars(model, series, index, barSeries.length, layers, xScale, scale, plot, horizontal, barIndex, labs));
  });
  const held = bag();
  let late = "";
  if (layers && totalHook) late += totalHook(model, layers, xScale, yScale, horizontal, held);
  const fill = cssVar("text", model.preset.text);
  for (const lab of labs) late += held.put(lab.text, lab.x, lab.y, lab.anchor, fill);
  if (late) model.late += late;
  return out.join("");
}

/** Range bands paint first, so a band sits under a line even when the series is listed later. */
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
  const labs: Lab[] = [];
  const barSeries = model.series.filter((series) => series.mark === "bar");
  const plotWidth = Math.max(1, plot.right - plot.left);
  const shared = sharedSample(model, layers, plotWidth);
  if (rangePainter) {
    model.series.forEach((series, index) => {
      if (series.mark !== "range") return;
      const scale = series.axis === "y2" ? y2Scale : yScale;
      out.push(rangePainter?.(series, index, (i) => xScale.center(i), scale) ?? "");
    });
  }
  model.series.forEach((series, index) => {
    const scale = series.axis === "y2" ? y2Scale : yScale;
    if (series.mark === "range") return;
    if (series.mark === "bar") {
      const barIndex = model.series.slice(0, index).filter((item) => item.mark === "bar").length;
      out.push(bars(model, series, index, barSeries.length, layers, xScale, scale, plot, horizontal, barIndex, labs));
      return;
    }
    appendLineSeries(out, model, series, index, layers, xScale, scale, plotWidth, shared);
  });
  const held = bag();
  const fill = cssVar("text", model.preset.text);
  let late = placeLineLabels(model, layers, xScale, yScale, y2Scale, held);
  for (const lab of labs) late += held.put(lab.text, lab.x, lab.y, lab.anchor, fill);
  if (late) model.late += late;
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
    const points: Pt[] = [];
    const bottoms: Pt[] = [];
    const kept: number[] = [];
    for (let k = 0; k < run.length; k++) {
      const i = run[k];
      const raw = layers ? layers.top[index][i] : series.values[i];
      if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
      const x = xScale.center(i);
      const y = yScale(raw);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      points.push({ x, y });
      kept.push(i);
      if (area) {
        const base = layers ? layers.bottom[index][i] : 0;
        bottoms.push({ x, y: yScale(typeof base === "number" && Number.isFinite(base) ? base : 0) });
      }
    }
    if (points.length === 0) continue;
    const v0 = ys[kept[0]];
    const v1 = ys[kept[kept.length - 1]];
    const log = series.axis === "y2" ? model.y2Log : model.yLog;
    const scaleAttr =
      !layers && !log && typeof v0 === "number" && typeof v1 === "number" && v0 !== v1
        ? ` data-ck-ys="${n(points[0].y)},${n(points[points.length - 1].y)},${n(v0)},${n(v1)},${index}"`
        : "";
    const indexAttr = ` data-ck-sample="${sampled.mode}" data-ck-i="${kept.join(" ")}"${scaleAttr}`;
    if (area) {
      const fill = model.gradient ? `url(#${model.id}-g${index})` : series.color;
      out.push(`<path d="${areaPath(points, bottoms, model.curve)}" fill="${fill}" fill-opacity="${model.gradient ? 1 : model.fillPaint}" stroke="none"${indexAttr} />`);
    }
    pushStroke(out, linePath(points, model.curve), model, series, indexAttr);
    // Hidden circles exist so --ck-line-dots can reveal them. A downsampled line
    // already has a vertex per pixel, and those circles dominate the SVG, so
    // interact draws the hover dot from the path instead.
    paintPoints(out, points, model, series, kept);
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
  if (!layers && model.curve === "linear" && !series.area && model.type !== "stacked-area" && model.dots === "off" && !markerShape(model, series)) {
    appendLinear(out, model, series, xScale, yScale);
    return;
  }
  const points = pointsFor(series, index, layers, xScale, yScale, model);
  if (series.area || model.type === "stacked-area") {
    const bottoms = bottomPoints(series, index, layers, xScale, yScale, model);
    const fill = model.gradient ? `url(#${model.id}-g${index})` : series.color;
    for (const [top, bottom] of pairSegments(points, bottoms, model.connectNulls)) {
      out.push(`<path d="${areaPath(top, bottom, model.curve)}" fill="${fill}" fill-opacity="${model.gradient ? 1 : model.fillPaint}" stroke="none" />`);
    }
  }
  for (const segment of segments(points, model.connectNulls)) {
    pushStroke(out, linePath(segment, model.curve), model, series, "");
  }
  paintPoints(out, points, model, series);
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
  let parts: string[] = [];
  const flush = () => {
    if (parts.length === 0) return;
    pushStroke(out, parts.join(" "), model, series, "");
    parts = [];
  };
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      if (!model.connectNulls) flush();
      continue;
    }
    parts.push((parts.length === 0 ? "M " : "L ") + n(xScale.center(i)) + " " + n(yScale(value)));
  }
  flush();
}

function strokeOf(series: Series, model: PlotModel): string {
  return lineStroke(series.color, model.strokeWidth, model.preset.lines);
}

/** Crisp stroke, and a blurred copy under it when mark.glow is set. */
function pushStroke(out: string[], d: string, model: PlotModel, series: Series, extra: string): void {
  const stroke = strokeOf(series, model);
  const base = `fill="none" stroke="${stroke}" stroke-linejoin="round" stroke-linecap="round"${dashAttr(series.dash)}`;
  if (model.glow) out.push(`<path d="${d}" ${base} stroke-width="${n(model.strokeWidth + 2.5)}" filter="url(#${model.id}glow)" pointer-events="none" />`);
  out.push(`<path d="${d}" ${base} stroke-width="${model.strokePaint}"${extra} />`);
}

function areaMid(model: PlotModel): string {
  if (model.fillPaint.startsWith("var(")) return `calc(${model.fillPaint} * 0.35)`;
  return n(model.fillOpacity * 0.35);
}

function markerShape(model: PlotModel, series: Series): string | null {
  const shape = series.shape || model.pointShape;
  if (shape === "none") return null;
  if (shape) return shape;
  if (series.radius !== undefined || series.hollow || model.pointHollow) return "circle";
  if (model.dots === "off") return null;
  return "circle";
}

function explicitMark(model: PlotModel, series: Series): boolean {
  return Boolean(series.shape || model.pointShape || series.radius !== undefined || series.hollow || model.pointHollow);
}

function paintPoints(out: string[], points: (Pt | null)[], model: PlotModel, series: Series, indexes?: number[]): void {
  const colored = Boolean(series.colors && series.colors.length);
  const shape = markerShape(model, series) || (colored ? "circle" : null);
  if (!shape) return;
  const explicit = explicitMark(model, series) || colored;
  if (!explicit && model.dots === "off") return;
  if (!explicit && indexes && model.dots !== "shown") return;
  const radius = series.radius ?? model.pointSize;
  const hidden = !explicit && model.dots !== "shown" ? ` style="display:var(--ck-line-dots, none)"` : "";
  for (let k = 0; k < points.length; k++) {
    const point = points[k];
    if (!point) continue;
    const at = indexes ? indexes[k] : k;
    const override = series.colors?.[at];
    const ruled = Boolean(override && override !== series.color);
    const outlined = Boolean(series.ruleHollow?.[at]);
    const hollow = outlined || series.hollow || model.pointHollow;
    const color = ruled ? override : series.mark === "line" ? strokeOf(series, model) : series.color;
    const caption = series.ruleLabels?.[at] ?? "";
    const named = colored ? ` data-ck-name="${esc(series.name)}" data-ck-i="${at}"` : indexes ? ` data-ck-i="${indexes[k]}"` : "";
    const rule = caption ? ` data-ck-rule="${esc(caption)}"` : "";
    if (outlined) {
      const hole = cssVar("surface", model.preset.surface);
      const title = caption ? `><title>${esc(caption)}</title></circle>` : " />";
      out.push(
        `<circle cx="${n(point.x)}" cy="${n(point.y)}" r="${n(radius + 1.25)}" fill="${hole}" stroke="${color}" stroke-width="2"${hidden}${named}${rule}${title}`,
      );
      continue;
    }
    const ring = ruled ? ` stroke="${cssVar("background", model.preset.background)}" stroke-width="2"` : "";
    out.push(marker(point.x, point.y, radius + (ruled ? 1.25 : 0), shape, color, hollow, hidden + ring + named + rule, caption));
  }
}

/**
 * Round only the end away from the baseline. clip-path reads --ck-bar-radius
 * when the spec omitted mark.cornerRadius. A path would bake the radius.
 */
function barMark(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  useVar: boolean,
  edge: "top" | "bottom" | "left" | "right",
  fill: string,
  extra = "",
): string {
  const rect = `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" fill="${fill}"${extra}`;
  if (width <= 0 || height <= 0 || (!useVar && radius < 0.5)) return `${rect} />`;
  const cap = useVar
    ? `min(var(--ck-bar-radius, ${n(radius)}) * 1px, ${n(width / 2)}px, ${n(height / 2)}px)`
    : `min(${n(radius)}px, ${n(width / 2)}px, ${n(height / 2)}px)`;
  const round = edge === "top" ? `${cap} ${cap} 0 0` : edge === "bottom" ? `0 0 ${cap} ${cap}` : edge === "right" ? `0 ${cap} ${cap} 0` : `${cap} 0 0 ${cap}`;
  return `${rect} style="clip-path:inset(0 round ${round})" />`;
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
  labs: Lab[] = [],
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
    const caption = series.ruleLabels?.[i] ?? "";
    const extra = (series.colors ? ` data-ck-name="${esc(series.name)}" data-ck-i="${i}"` : "") + (caption ? ` data-ck-rule="${esc(caption)}"` : "");
    const outer = !layers || Math.abs((value ?? baseline) - layers.top[layers.top.length - 1][i]) <= 1e-6;
    const radius = outer ? model.cornerRadius : 0;
    const useVar = outer && model.radiusVar;
    if (horizontal) {
      const y = start;
      const x = Math.min(a, b);
      const width = Math.max(0, Math.abs(b - a));
      const height = Math.max(0, barSize - inset);
      const edge = b >= a ? "right" : "left";
      out.push(withTitle(barMark(x, y, width, height, radius, useVar, edge, fill, extra), caption));
      queueBarLabel(model, series, series.values[i], x, y, width, height, true, labs, b < a, plot.left, model.width);
    } else {
      const x = start;
      const y = Math.min(a, b);
      const height = Math.max(0, Math.abs(b - a));
      const width = Math.max(0, barSize - inset);
      const edge = b <= a ? "top" : "bottom";
      out.push(withTitle(barMark(x, y, width, height, radius, useVar, edge, fill, extra), caption));
      queueBarLabel(model, series, series.values[i], x, y, width, height, false, labs, false, plot.left, model.width);
    }
  }
  return out.join("");
}

const LABEL_AT = ["top", "bottom", "left", "right", "center", "inside", "outside"];
const LABEL_ENDS = ["all", "ends", "last"];

interface Lab {
  x: number;
  y: number;
  anchor: string;
  text: string;
}

function wantLabels(model: PlotModel): boolean {
  return model.labelsOn || model.labelAt !== "" || model.labelEnds !== "" || model.labelFormat !== undefined;
}

export function labelText(model: PlotModel, series: Series | undefined, value: number): string {
  const format = model.labelFormat ?? series?.format;
  if (format !== undefined) return formatValue(value, format, model.locale);
  return formatNumber(value, model.locale);
}

function endsOf(values: ArrayLike<number | null>): [number, number] {
  let first = -1;
  let last = -1;
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] !== "number") continue;
    if (first < 0) first = i;
    last = i;
  }
  return [first, last];
}

function labelIndex(mode: string, index: number, first: number, last: number): boolean {
  if (mode === "last") return index === last;
  if (mode === "ends") return index === first || index === last;
  return true;
}

function queueBarLabel(
  model: PlotModel,
  series: Series,
  value: number | null,
  x: number,
  y: number,
  w: number,
  h: number,
  horizontal: boolean,
  labs: Lab[],
  tipLeft = false,
  gutter = 0,
  viewWidth = 0,
): void {
  if (!wantLabels(model) || typeof value !== "number") return;
  let pos = model.labelAt || (model.stackTotal ? "inside" : horizontal ? "right" : "top");
  if ((pos === "inside" || pos === "center") && Math.min(w, h) < 16) pos = horizontal ? "right" : "top";
  const text = labelText(model, series, value);
  const textW = Math.max(8, text.length * 6.8);
  let lx = x + w / 2;
  let ly = y - 4;
  let anchor = "middle";
  if (horizontal) {
    ly = y + h / 2 + 3;
    const tipSide = model.labelAt === "" || model.labelAt === "outside";
    if (tipSide && tipLeft) {
      const outside = x - 4 - textW;
      if (outside >= gutter + 2) {
        lx = x - 4;
        anchor = "end";
      } else {
        lx = Math.max(gutter + textW + 2, Math.min(x + w - 2, x + textW + 2));
        anchor = "end";
      }
    } else if (pos === "left" || pos === "bottom") {
      lx = x + 4;
      anchor = "start";
    } else if (pos === "center" || pos === "inside") anchor = "middle";
    else {
      lx = x + w + 4;
      anchor = "start";
      const limit = viewWidth > 0 ? viewWidth - 4 : lx + textW;
      if (lx + textW > limit) lx = Math.max(x + 2, limit - textW);
    }
  } else if (pos === "bottom") ly = y + h - 2;
  else if (pos === "center" || pos === "inside") ly = y + Math.min(h - 2, Math.max(12, h / 2)) ;
  else if (pos === "left") {
    lx = x - 4;
    ly = y + h / 2 + 3;
    anchor = "end";
  } else if (pos === "right") {
    lx = x + w + 4;
    ly = y + h / 2 + 3;
    anchor = "start";
  }
  labs.push({ x: lx, y: ly, anchor, text });
}

function placeLineLabels(
  model: PlotModel,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  held: Bag,
): string {
  if (!wantLabels(model)) return "";
  const pos = model.labelAt || "top";
  const fill = cssVar("text", model.preset.text);
  let out = "";
  model.series.forEach((series, index) => {
    if (series.mark === "bar") return;
    const [first, last] = endsOf(series.values);
    if (first < 0) return;
    const scale = series.axis === "y2" ? y2Scale : yScale;
    const shift = nudge(pos, series.radius ?? model.pointSize);
    for (let i = 0; i < series.values.length; i++) {
      const value = series.values[i];
      if (typeof value !== "number" || !labelIndex(model.labelEnds, i, first, last)) continue;
      const plotted = layers ? layers.top[index]?.[i] : value;
      if (typeof plotted !== "number") continue;
      out += held.put(labelText(model, series, value), xScale.center(i) + shift[0], scale(plotted) + shift[1], shift[2], fill);
    }
  });
  return out;
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
    if (plotted === null || typeof plotted !== "number" || !Number.isFinite(plotted) || (value === null && !model.connectNulls && !layers)) out[i] = null;
    else out[i] = { x: xScale.center(i), y: yScale(plotted) };
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

export interface Layers {
  top: number[][];
  bottom: number[][];
}

export function stackLayers(series: Series[], mode: "stack" | "percent"): Layers {
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

export interface XScale {
  center(index: number): number;
  band(index: number): { start: number; size: number };
  at(value: number): number;
  min: number;
  max: number;
  /** False when x had no finite value and min/max are the 0..1 fallback. */
  live: boolean;
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
  let spanStart = horizontal ? top : left;
  let spanEnd = horizontal ? bottom : right;
  if (model.f & 32) {
    const swap = spanStart;
    spanStart = spanEnd;
    spanEnd = swap;
  }
  if (!model.x) {
    const placed = layoutPaint()?.cats(spanStart, spanEnd, count, Boolean(model.xEdge), model.type === "bar" || model.type === "combo");
    if (placed) return placed;
    const size = count > 0 ? (spanEnd - spanStart) / count : spanEnd - spanStart;
    return {
      center: (index) => spanStart + size * index + size / 2,
      band: (index) => ({ start: spanStart + size * index, size }),
      at: (value) => spanStart + size * value + size / 2,
      min: 0,
      max: Math.max(0, count - 1),
      live: false,
    };
  }
  let min = Infinity;
  let max = -Infinity;
  let seen = false;
  if (model.x instanceof Float64Array) {
    const extent = linearExtent(model.x);
    if (extent) {
      min = extent.min;
      max = extent.max;
      seen = true;
      if (extent.linear) noteLinear(model.x);
    }
  }
  if (!seen) {
    for (let i = 0; i < model.x.length; i++) {
      const value = model.x[i];
      if (value === null || !Number.isFinite(value)) continue;
      seen = true;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  if (!seen) {
    min = 0;
    max = 1;
  } else {
    if (model.f & 256) {
      if (min > 0) min = 0;
      if (max < 0) max = 0;
    }
    if (model.f & 4 && max > min) {
      const nice = niceDomain(min, max);
      min = nice[0];
      max = nice[1];
    }
    const padded = padExtent(min, max, model.xPad, null);
    min = padded[0];
    max = padded[1];
  }
  const scale = linear(min, max, spanStart, spanEnd);
  return {
    center: (index) => scale(model.x?.[index] ?? min),
    band: (index) => {
      const step = count > 1 ? (spanEnd - spanStart) / count : spanEnd - spanStart;
      return { start: spanStart + step * index, size: step };
    },
    at: (value) => scale(value),
    min,
    max,
    live: seen,
  };
}

/** Set for one draw when the layout chunk is mounted and the chart is rtl. */
let textDir = "";

function axText(x: number, y: number, anchor: string, body: string, fill: string, family: string, angle = 0, weight = "", rows?: string[] | null): string {
  const spin = angle ? ` transform="rotate(${n(angle)} ${n(x)} ${n(y)})"` : "";
  const text = rows ? rows.map((row, i) => `<tspan x="${n(x)}" dy="${i ? 12 : 0}">${esc(row)}</tspan>`).join("") : esc(body);
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="11"${weight} font-family="${family}"${textDir}${spin}>${text}</text>`;
}

function wrapWords(text: string, width: number, lines: number): string[] {
  const max = Math.max(1, Math.floor(width / TICK_PX));
  const cap = Math.max(1, lines);
  if (text.length <= max) return [text];
  if (cap === 1) return [text.slice(0, Math.max(1, max - 1)) + "…"];
  const words = text.split(" ");
  const out: string[] = [];
  let cur = "";
  const take = (value: string) => {
    if (out.length < cap) out.push(value);
  };
  for (let w = 0; w < words.length; w++) {
    let word = words[w] ?? "";
    if (word.length > max) {
      if (cur) {
        take(cur);
        cur = "";
      }
      while (word && out.length < cap) {
        if (out.length === cap - 1 && word.length > max) {
          take(word.slice(0, Math.max(1, max - 1)) + "…");
          word = "";
          break;
        }
        take(word.slice(0, max));
        word = word.slice(max);
      }
      if (word && out.length < cap) cur = word;
      continue;
    }
    const next = cur ? cur + " " + word : word;
    if (next.length <= max) cur = next;
    else {
      if (cur) take(cur);
      cur = out.length < cap ? word : "";
    }
  }
  if (cur) take(cur);
  return out.length ? out : [text];
}

/** Null keeps a single text node. An array, even of one line, is the wrap path. */
function linesOf(axis: AxisBox, label: string): string[] | null {
  if (axis.wrapW === undefined && axis.wrapN === undefined) return null;
  const width = axis.wrapW && axis.wrapW > 0 ? axis.wrapW : 72;
  return wrapWords(label, width, axis.wrapN ?? 3);
}

function lineCount(axis: AxisBox, labels: string[]): number {
  let count = 1;
  for (let i = 0; i < labels.length; i++) {
    const rows = linesOf(axis, labels[i] ?? "");
    if (rows && rows.length > count) count = rows.length;
  }
  return count;
}

function inkWidth(axis: AxisBox, labels: string[]): number {
  let width = 0;
  for (let i = 0; i < labels.length; i++) {
    const rows = linesOf(axis, labels[i] ?? "");
    const text = rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : labels[i] ?? "";
    const size = text.length * TICK_PX;
    if (size > width) width = size;
  }
  return width;
}

function outsideLen(axis: AxisBox): number {
  if (axis.tick === "inside" || axis.tick === "none") return 0;
  if (axis.tick === "outside" || typeof axis.tickLen === "number") return axis.tickLen || 4;
  return 0;
}

function tickInk(side: number, edge: number, at: number, axis: AxisBox, stroke: string): string {
  const mode = axis.tick === "inside" || axis.tick === "outside" ? axis.tick : typeof axis.tickLen === "number" ? "outside" : "";
  if (!mode) return "";
  const len = axis.tickLen ?? 4;
  if (!(len > 0)) return "";
  const dir = mode === "outside" ? 1 : -1;
  const x2 = side === 0 ? edge - dir * len : side === 1 ? edge + dir * len : at;
  const y2 = side === 2 ? edge - dir * len : side === 3 ? edge + dir * len : at;
  const x1 = side < 2 ? edge : at;
  const y1 = side < 2 ? at : edge;
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" />`;
}

function ruleLine(side: number, plot: PlotBox, model: PlotModel, axis: AxisBox): string {
  const rule = axis.rule;
  if (!rule?.on) return "";
  const dash = rule.dash === "dashed" ? ' stroke-dasharray="4 3"' : rule.dash === "dotted" ? ' stroke-dasharray="1 3"' : "";
  const width = rule.width ? ` stroke-width="${n(rule.width)}"` : "";
  const stroke = rule.color || cssVar("axis", model.preset.axis);
  const edge = side === 0 ? plot.left : side === 1 ? plot.right : side === 2 ? plot.top : plot.bottom;
  if (side < 2) return `<line data-ck-axis="line" x1="${n(edge)}" y1="${n(plot.top)}" x2="${n(edge)}" y2="${n(plot.bottom)}" stroke="${stroke}"${width}${dash} />`;
  return `<line data-ck-axis="line" x1="${n(plot.left)}" y1="${n(edge)}" x2="${n(plot.right)}" y2="${n(edge)}" stroke="${stroke}"${width}${dash} />`;
}

/** 0 left, 1 right, 2 top, 3 bottom. */
function place(side: number, edge: number, at: number, titled: boolean, height: number): [number, number, string] {
  if (side === 0) return [edge - 6, at + 4, "end"];
  if (side === 1) return [edge + 6, at + 4, "start"];
  if (side === 2) return [at, edge - 18, "middle"];
  return [at, titled ? edge + 14 : height - 8, "middle"];
}

function ySide(model: PlotModel, horizontal: boolean): number {
  return horizontal ? (model.yAxis.end ? 2 : 3) : model.yAxis.end ? 1 : 0;
}

function xSide(model: PlotModel, horizontal: boolean): number {
  return horizontal ? (model.xAxis.end ? 1 : 0) : model.xAxis.end ? 2 : 3;
}

function drawAxes(
  model: PlotModel,
  plot: PlotBox,
  horizontal: boolean,
  count: number,
  yTicks: number[],
  y2Ticks: number[],
  yText: string[],
  y2Text: string[],
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  xScale: XScale,
): string {
  let out = "";
  if (model.showY) {
    const side = ySide(model, horizontal);
    out += ruleLine(side, plot, model, model.yAxis);
    if (model.yAxis.labels !== false) out += band(yText, yTicks, yScale, model, plot, side, model.yAxis);
  }
  if (model.showY2) {
    const side = model.y2Axis.end !== false ? 1 : 0;
    out += ruleLine(side, plot, model, model.y2Axis);
    if (model.y2Axis.labels !== false) out += band(y2Text, y2Ticks, y2Scale, model, plot, side, model.y2Axis);
  }
  if (model.showX) {
    out += ruleLine(xSide(model, horizontal), plot, model, model.xAxis);
    if (model.xAxis.labels !== false) out += xBand(model, xScale, count, horizontal, plot);
  }
  out += axisTitles(model, plot, horizontal);
  return out;
}

function band(
  labels: string[],
  values: number[],
  scale: (value: number) => number,
  model: PlotModel,
  plot: PlotBox,
  side: number,
  axis: AxisBox,
): string {
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const ink = cssVar("axis", model.preset.axis);
  const edge = side === 0 ? plot.left : side === 1 ? plot.right : side === 2 ? plot.top : plot.bottom;
  const angle = axis.rotate || 0;
  const skip = axis.skip !== false;
  let out = "";
  let last = side < 2 ? Infinity : -Infinity;
  for (let i = 0; i < values.length; i++) {
    const label = labels[i] ?? "";
    const at = place(side, edge, scale(values[i]), Boolean(axis.title), model.height);
    const rows = linesOf(axis, label);
    if (skip && !angle) {
      if (side < 2) {
        if (Math.abs(last - at[1]) < 13) continue;
        last = at[1];
      } else {
        const width = ((rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : label).length || 1) * 6.4;
        if (at[0] - width / 2 < last) continue;
        last = at[0] + width / 2 + 8;
      }
    }
    out += tickInk(side, edge, scale(values[i]), axis, ink);
    out += axText(at[0], at[1], at[2], label, fill, family, angle, "", rows);
  }
  return out;
}

function xBand(model: PlotModel, xScale: XScale, count: number, horizontal: boolean, plot: PlotBox): string {
  if (model.xTemporal && model.x && !horizontal) return timeBand(model, xScale, plot);
  if (model.x && !horizontal) return numBand(model, xScale, plot);
  const angle = xAngle(model);
  const step = xStep(model, count, angle);
  if (step === 0) return "";
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const ink = cssVar("axis", model.preset.axis);
  const side = xSide(model, horizontal);
  const edge = side === 0 ? plot.left : side === 1 ? plot.right : side === 2 ? plot.top : plot.bottom;
  const y = model.xAxis.end && !horizontal ? plot.top - 18 : plot.bottom + 16;
  const keep = model.xAxis.skip === false;
  const seq = horizontal
    ? null
    : layoutPaint()?.order(
        count,
        step,
        (index) => xScale.center(index),
        (model.f & 32) !== 0,
        keep ? undefined : (index) => (tickLabel(model, index)?.length || 1) * 6.4,
      );
  let out = "";
  let last = -Infinity;
  const total = seq ? seq.length : count;
  for (let k = 0; k < total; k += seq ? 1 : step) {
    const i = seq ? (seq[k] ?? 0) : k;
    const label = tickLabel(model, i);
    if (!label) continue;
    const rows = linesOf(model.xAxis, label);
    if (horizontal) {
      const right = Boolean(model.xAxis.end);
      const at = xScale.center(i);
      out += tickInk(side, edge, at, model.xAxis, ink);
      out += axText(right ? plot.right + 8 : plot.left - 6, at + 4, right ? "start" : "end", label, fill, family, 0, "", rows);
      continue;
    }
    const x = xScale.center(i);
    const drawn = alongOne(label, x, y, angle, plot, 0, fill, family, seq || keep ? -Infinity : last, rows, model.width);
    if (!drawn) continue;
    out += tickInk(side, edge, x, model.xAxis, ink);
    out += drawn;
    if (!angle && !keep) {
      const width = ((rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : label).length) * 6.4;
      if (x - width / 2 >= last) last = x + width / 2 + 8;
    }
  }
  return out;
}

function numBand(model: PlotModel, xScale: XScale, plot: PlotBox): string {
  const values = resolveTicks(model, "x", xScale.min, xScale.max, model.xAxis.count ?? 6, false);
  return along(model, values, tickText(values, model, model.xFormat), (value) => xScale.at(value), plot, 8);
}

function timeBand(model: PlotModel, xScale: XScale, plot: PlotBox): string {
  if (!model.x || !xScale.live || !(xScale.max > xScale.min) || model.xAxis.count === 0) return "";
  const min = xScale.min;
  const max = xScale.max;
  const width = Math.max(1, plot.right - plot.left);
  const explicit = model.xAxis.count !== undefined || Boolean(model.xAxis.values?.length);
  const at = (value: number) => xScale.at(value);
  if (explicit || model.zone === "UTC") {
    const values = explicit
      ? resolveTicks(model, "x", min, max, model.xAxis.count ?? 6, false)
      : timeTicks(min, max, Math.max(2, Math.floor(width / 72)));
    const labels = values.map((tick) => formatTimeLabel(tick, max - min, model.locale, model.xFormat, model.zone));
    return along(model, values, labels, at, plot, 4);
  }
  let count = Math.max(2, Math.floor(width / 84));
  let values = timeTicks(min, max, count, model.zone);
  let labels = values.map((tick) => formatTimeLabel(tick, max - min, model.locale, model.xFormat, model.zone));
  while (count > 2 && model.xAxis.skip !== false && timeLabelsCollide(values, labels, at, plot.left, plot.right)) {
    count -= 1;
    values = timeTicks(min, max, count, model.zone);
    labels = values.map((tick) => formatTimeLabel(tick, max - min, model.locale, model.xFormat, model.zone));
  }
  return along(model, values, labels, at, plot, 4);
}

function timeLabelsCollide(
  values: number[],
  labels: string[],
  at: (value: number) => number,
  left: number,
  right: number,
): boolean {
  let last = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const x = at(values[i]);
    if (x < left - 8 || x > right + 8) continue;
    const half = ((labels[i]?.length || 1) * 6.4) / 2;
    if (x - half < last) return true;
    last = x + half + 8;
  }
  return false;
}

function along(
  model: PlotModel,
  values: number[],
  labels: string[],
  at: (value: number) => number,
  plot: PlotBox,
  slack: number,
): string {
  const angle = xAngle(model);
  const y = model.xAxis.end ? plot.top - 18 : plot.bottom + 16;
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const ink = cssVar("axis", model.preset.axis);
  const side = model.xAxis.end ? 2 : 3;
  const edge = model.xAxis.end ? plot.top : plot.bottom;
  const keep = model.xAxis.skip === false;
  let out = "";
  let last = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const label = labels[i];
    if (!label) continue;
    const x = at(values[i]);
    const rows = linesOf(model.xAxis, label);
    const drawn = alongOne(label, x, y, angle, plot, slack, fill, family, keep ? -Infinity : last, rows, model.width);
    if (!drawn) continue;
    out += tickInk(side, edge, x, model.xAxis, ink);
    out += drawn;
    if (!angle && !keep && x >= plot.left - slack && x <= plot.right + slack) {
      const width = ((rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : label).length) * 6.4;
      if (x - width / 2 >= last) last = x + width / 2 + 8;
    }
  }
  return out;
}

function alongOne(
  label: string,
  x: number,
  y: number,
  angle: number,
  plot: PlotBox,
  slack: number,
  fill: string,
  family: string,
  last: number,
  rows?: string[] | null,
  viewWidth = 0,
): string {
  if (slack && (x < plot.left - slack || x > plot.right + slack)) return "";
  const text = rows ? rows.reduce((best, row) => (row.length > best.length ? row : best), "") : label;
  const glyphs = text.length || 1;
  const width = glyphs * 6.4;
  if (!angle && x - width / 2 < last) return "";
  let anchor = angle < 0 ? "end" : angle > 0 ? "start" : "middle";
  let at = x;
  // 11px tabular digits run wider than the collision estimate. Measure the edge with
  // that wider box so "100,000" is end-anchored before the view box clips it.
  const edgeWidth = glyphs * 8;
  if (!angle && viewWidth > 0) {
    if (x + edgeWidth / 2 > viewWidth - 4) {
      at = viewWidth - 4;
      anchor = "end";
    } else if (x - edgeWidth / 2 < 4) {
      at = 4;
      anchor = "start";
    }
  }
  return axText(at, y, anchor, label, fill, family, angle, "", rows);
}

function titleSpin(axis: AxisBox, vertical: boolean, end: boolean): number {
  if (typeof axis.titleSpin === "number") return axis.titleSpin;
  if (!vertical) return 0;
  return end ? 90 : -90;
}

function titleAlong(at: string | undefined, mid: number, start: number, end: number): number {
  if (at === "start") return start;
  if (at === "end") return end;
  return mid;
}

function axisTitles(model: PlotModel, plot: PlotBox, horizontal: boolean): string {
  const fill = cssVar("muted", model.preset.muted);
  const family = font();
  const midY = (plot.top + plot.bottom) / 2;
  const midX = (plot.left + plot.right) / 2;
  const weight = ' font-weight="500"';
  const lo = Math.min(plot.top + 28, midY);
  const hi = Math.max(plot.bottom - 28, midY);
  let out = "";
  if (model.showY && model.yAxis.title) {
    const title = model.yAxis.title;
    const side = ySide(model, horizontal);
    const vertical = side < 2;
    const angle = titleSpin(model.yAxis, vertical, side === 1);
    if (vertical) out += axText(side === 0 ? 14 : model.width - 14, titleAlong(model.yAxis.titleAt, midY, hi, lo), "middle", title, fill, family, angle, weight);
    else {
      const anchor = model.yAxis.titleAt === "start" ? "start" : model.yAxis.titleAt === "end" ? "end" : "middle";
      const x = titleAlong(model.yAxis.titleAt, midX, plot.left, plot.right);
      out += axText(x, side === 2 ? Math.max(12, plot.top - 18) : model.height - 6 - colorLegendFoot(model) - bottomLegendFoot(model, plot), anchor, title, fill, family, angle, weight);
    }
  }
  if (model.showY2 && model.y2Axis.title) {
    const right = model.y2Axis.end !== false;
    const angle = titleSpin(model.y2Axis, true, right);
    out += axText(right ? model.width - 14 : 14, titleAlong(model.y2Axis.titleAt, midY, hi, lo), "middle", model.y2Axis.title, fill, family, angle, weight);
  }
  if (model.showX && model.xAxis.title) {
    const title = model.xAxis.title;
    if (horizontal) {
      const right = Boolean(model.xAxis.end);
      const angle = titleSpin(model.xAxis, true, right);
      out += axText(right ? model.width - 14 : 14, titleAlong(model.xAxis.titleAt, midY, hi, lo), "middle", title, fill, family, angle, weight);
    } else {
      const anchor = model.xAxis.titleAt === "start" ? "start" : model.xAxis.titleAt === "end" ? "end" : "middle";
      const x = titleAlong(model.xAxis.titleAt, midX, plot.left, plot.right);
      const angle = titleSpin(model.xAxis, false, false);
      out += axText(x, model.xAxis.end ? plot.top - 40 : model.height - 6 - colorLegendFoot(model) - bottomLegendFoot(model, plot), anchor, title, fill, family, angle, weight);
    }
  }
  return out;
}

/** Explicit rotate, or −40 when every category label fits once tilted. autoSkip replaces the tilt with a skip. */
export function xAngle(model: PlotModel): number {
  if (typeof model.xAxis.rotate === "number") return model.xAxis.rotate;
  if (model.xAxis.skip === true) return 0;
  if (!model.showX || !model.xAxis.labels || model.x) return 0;
  if (model.orientation === "horizontal" && model.type === "bar") return 0;
  const labels = model.labels;
  if (labels.length < 2) return 0;
  const slot = Math.max(1, (model.width - 64) / labels.length);
  if (widest(labels) <= slot) return 0;
  const rad = (40 * Math.PI) / 180;
  const spun = widest(labels) * Math.abs(Math.cos(rad)) + 11 * Math.abs(Math.sin(rad));
  return spun <= slot ? -40 : 0;
}

function xStep(model: PlotModel, count: number, angle: number): number {
  const target = model.xAxis.count;
  if (target === 0) return 0;
  if (target !== undefined) return Math.max(1, Math.ceil(count / Math.max(1, target)));
  if (model.xAxis.skip === false) return 1;
  const slot = Math.max(1, (model.width - 64) / Math.max(1, count));
  const labels = model.labels.length ? model.labels : [];
  if (model.xAxis.skip === true) return Math.max(1, Math.ceil(widest(labels) / slot));
  if (!angle) return count > 8 ? Math.ceil(count / 6) : 1;
  const rad = (Math.abs(angle) * Math.PI) / 180;
  const footprint = widest(labels) * Math.abs(Math.cos(rad)) + 11 * Math.abs(Math.sin(rad));
  return footprint <= slot ? 1 : Math.max(1, Math.ceil(footprint / slot));
}

function legendColor(model: PlotModel, series: Series): string {
  if (series.mark === "line") return strokeOf(series, model);
  return series.color;
}

/** Native tooltip on a bar, naming the colour rule that painted it. */
function withTitle(mark: string, title: string): string {
  if (!title) return mark;
  return mark.replace(/ \/>$/, `><title>${esc(title)}</title></rect>`);
}

function legendItems(model: PlotModel): LegendItem[] {
  const rules = model.legend ? ruleItems(model) : [];
  if (model.swatches && model.swatches.length > 1) return [...model.swatches.map((item) => ({ name: item.name, color: item.color })), ...rules];
  return [...model.series.map((series) => {
    const shape = markerShape(model, series);
    const marked = shape && (explicitMark(model, series) || model.dots === "shown") ? shape : undefined;
    const symbol = series.mark === "bar" ? "square" : marked;
    return { name: legendName(model, series), color: legendColor(model, series), symbol };
  }), ...rules];
}

function ruleItems(model: PlotModel): LegendItem[] {
  return (model.ruleLegend ?? []).map((item) => ({ name: item.name, color: item.color, symbol: item.symbol ?? "circle" }));
}

function legend(model: PlotModel, x: number, y: number, maxRight: number): string {
  if (model.swatches && model.swatches.length > 1) {
    let cx = x;
    let cy = y;
    const out: string[] = [];
    for (const item of model.swatches) {
      const width = 26 + item.name.length * 6.6;
      if (cx > x && cx + width > maxRight) {
        cx = x;
        cy += 18;
      }
      out.push(`<rect x="${n(cx)}" y="${n(cy)}" width="10" height="10" rx="2" fill="${item.color}" /><text x="${n(cx + 16)}" y="${n(cy + 9)}" fill="${cssVar("text", model.preset.text)}" font-size="12" font-family="${font()}">${esc(item.name)}</text>`);
      cx += width;
    }
    appendRules(out, model, cx, cy, x, maxRight);
    return out.join("");
  }
  return legendSeries(model, x, y, maxRight);
}

function legendIcon(model: PlotModel, series: Series, x: number, y: number): string {
  const color = legendColor(model, series);
  if (series.mark === "bar") return `<rect x="${n(x)}" y="${n(y)}" width="10" height="10" rx="2" fill="${color}" />`;
  const shape = markerShape(model, series);
  if (shape && (explicitMark(model, series) || model.dots === "shown")) {
    return marker(x + 5, y + 5, 4.5, shape, color, series.hollow ?? model.pointHollow);
  }
  return `<rect x="${n(x)}" y="${n(y)}" width="10" height="10" rx="2" fill="${color}" />`;
}

function legendSeries(model: PlotModel, x: number, y: number, maxRight: number): string {
  let cx = x;
  let cy = y;
  const out: string[] = [];
  for (const series of model.series) {
    const name = legendName(model, series);
    const width = 26 + name.length * 6.6;
    if (cx > x && cx + width > maxRight) {
      cx = x;
      cy += 18;
    }
    out.push(`${legendIcon(model, series, cx, cy)}<text x="${n(cx + 16)}" y="${n(cy + 9)}" fill="${cssVar("text", model.preset.text)}" font-size="12" font-family="${font()}">${esc(name)}</text>`);
    cx += width;
  }
  appendRules(out, model, cx, cy, x, maxRight);
  return out.join("");
}

function appendRules(out: string[], model: PlotModel, cx: number, cy: number, x: number, maxRight: number): void {
  for (const item of ruleItems(model)) {
    const width = 26 + item.name.length * 6.6;
    if (cx > x && cx + width > maxRight) {
      cx = x;
      cy += 18;
    }
    const swatch =
      item.symbol === "square"
        ? `<rect x="${n(cx)}" y="${n(cy)}" width="10" height="10" rx="2" fill="${item.color}" />`
        : `<circle cx="${n(cx + 5)}" cy="${n(cy + 5)}" r="4.5" fill="${item.color}" stroke="${cssVar("background", model.preset.background)}" stroke-width="1.5" />`;
    out.push(`${swatch}<text x="${n(cx + 16)}" y="${n(cy + 9)}" fill="${cssVar("text", model.preset.text)}" font-size="12" font-family="${font()}">${esc(item.name)}</text>`);
    cx += width;
  }
}

function openSvg(model: PlotModel): string {
  const width = model.responsive ? "100%" : String(model.width);
  const described = model.description ? ` aria-describedby="${model.id}-d"` : "";
  const intent = model.intent ? ` data-ck-intent="${esc(model.intent)}"` : "";
  const exported = model.exportMark ? ` data-ck-export="${esc(model.exportMark)}"` : "";
  const canvas = model.canvas ? ` data-ck-render="canvas"` : "";
  const sceneAttr = capturing() ? ` data-ck-scene="1"` : "";
  const desc = model.description ? `<desc id="${model.id}-d">${esc(model.description)}</desc>` : `<desc>${esc(model.alt)}</desc>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${model.height}" viewBox="0 0 ${model.width} ${model.height}" role="img" aria-label="${esc(model.alt)}"${described} class="ck-chart" data-ck-type="${esc(model.type)}" data-ck-id="${model.id}"${intent}${exported}${canvas}${sceneAttr} style="font-variant-numeric:tabular-nums;font-feature-settings:'tnum'">` +
    `<title>${esc(model.title || model.alt)}</title>${desc}`;
}

/** 11px tick labels are about 6.7px per character, plus the 6px anchor gap and a little edge. */
const TICK_PX = 6.7;

export function widest(labels: string[]): number {
  let width = 0;
  for (let i = 0; i < labels.length; i++) {
    const size = labels[i].length * TICK_PX;
    if (size > width) width = size;
  }
  return width;
}

function padding(model: PlotModel, yLabels: string[], y2Labels: string[], xLabels: string[]): Pad {
  if (model.type === "sparkline" || model.type === "mini-area") return { top: 2, right: 2, bottom: 2, left: 2 };
  const horizontal = model.orientation === "horizontal" && model.type === "bar";
  const yEnd = Boolean(model.yAxis.end);
  const xEnd = Boolean(model.xAxis.end);
  const y2End = model.y2Axis.end !== false;
  const yGap = Math.max(52, Math.ceil(inkWidth(model.yAxis, yLabels) + 12));
  const y2Gap = Math.max(52, Math.ceil(inkWidth(model.y2Axis, y2Labels) + 12));
  const xGap = Math.max(52, Math.ceil(inkWidth(model.xAxis, xLabels) + 12));
  let left = 12;
  let right = 16;
  let top = 14;
  let bottom = 12;
  if (model.title) top += 20;
  if (model.subtitle) top += 18;
  if (wantLabels(model)) {
    const pos = model.labelAt || "top";
    if (pos === "top" || pos === "outside" || pos === "") top += 16;
    if (pos === "bottom") bottom += 14;
    if (pos === "left") left += 28;
    if (pos === "right" || (horizontal && (pos === "outside" || pos === ""))) right = Math.max(right, 36);
    if (horizontal && (model.labelAt === "" || model.labelAt === "right" || model.labelAt === "outside")) {
      right = Math.max(right, Math.ceil(valueLabelWidth(model) + 16));
    }
  }
  if (model.stackTotal) {
    if (horizontal) right = Math.max(right, 48);
    else top += 16;
  }
  if (!horizontal && model.showY && model.yAxis.labels !== false) {
    if (yEnd) right = Math.max(right, yGap);
    else left = yGap;
  }
  if (horizontal && model.showY) {
    if (yEnd) top += 20;
    else bottom = 32;
  }
  if (model.showY2 && model.y2Axis.labels !== false) {
    if (y2End) right = Math.max(right, y2Gap);
    else left = Math.max(left, y2Gap);
  }
  if (model.showX && model.xAxis.labels !== false) {
    const lines = lineCount(model.xAxis, xLabels);
    const extra = (lines - 1) * 12;
    if (!horizontal && xEnd) top += 32 + extra;
    else if (!horizontal) bottom = 32 + extra;
    else if (xEnd) right = Math.max(right, xGap);
    else left = Math.max(left, xGap + (horizontal && diverges(model) ? 8 : 0));
  }
  const yTick = model.showY ? outsideLen(model.yAxis) : 0;
  const y2Tick = model.showY2 ? outsideLen(model.y2Axis) : 0;
  const xTick = model.showX ? outsideLen(model.xAxis) : 0;
  if (yTick) {
    if (!horizontal && yEnd) right += yTick;
    else if (!horizontal) left += yTick;
    else if (yEnd) top += yTick;
    else bottom += yTick;
  }
  if (y2Tick) {
    if (y2End) right += y2Tick;
    else left += y2Tick;
  }
  if (xTick) {
    if (!horizontal && xEnd) top += xTick;
    else if (!horizontal) bottom += xTick;
    else if (xEnd) right += xTick;
    else left += xTick;
  }
  if (model.showY && model.yAxis.title) {
    if (!horizontal && yEnd) right += 16;
    else if (!horizontal) left += 16;
    else if (yEnd) top += 16;
    else bottom += 16;
  }
  if (model.showX && model.xAxis.title) {
    if (!horizontal && xEnd) top += 22;
    else if (!horizontal) bottom += 16;
    else if (xEnd) right += 16;
    else left += 16;
  }
  if (model.showY2 && model.y2Axis.title) {
    if (y2End) right += 16;
    else left += 16;
  }
  const angle = xAngle(model);
  if (angle && model.showX && !horizontal) {
    const rad = (Math.abs(angle) * Math.PI) / 180;
    const extra = Math.ceil(Math.abs(Math.sin(rad)) * Math.max(24, widest(model.labels.length ? model.labels : xLabels)));
    if (xEnd) top += extra;
    else bottom += extra;
  }
  if (model.legend && model.legendBox) {
    const space = legendSpace(model.legendBox, legendItems(model), Math.max(80, model.width - left - right));
    const pos = model.legendBox.position;
    if (pos === "top") top += space.band;
    else if (pos === "bottom") bottom += space.band;
    else if (pos === "left") left += space.side;
    else if (pos === "right") right += space.side;
  } else if (model.legend) top += 12 + legendRows(model, left, model.width - right) * 18;
  if (model.colorScale && model.legendOn) bottom += 46;
  const inset = model.inset;
  return {
    top: typeof inset.t === "number" ? Math.max(top, inset.t) : top,
    right: typeof inset.r === "number" ? Math.max(right, inset.r) : right,
    bottom: typeof inset.b === "number" ? Math.max(bottom, inset.b) : bottom,
    left: typeof inset.l === "number" ? Math.max(left, inset.l) : left,
  };
}

/** Min and max of a typed column. Null when the extent is empty or non-finite. NaN does not move it. */
function floatExtent(values: Float64Array): { min: number; max: number; dense: boolean } | null {
  let min = Infinity;
  let max = -Infinity;
  let dense = true;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value < min) min = value;
    if (value > max) max = value;
    else if (value !== value) dense = false;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max, dense };
}

/** Extent plus an exact arithmetic-sequence check. Used for x, where index buckets need a linear axis. */
function linearExtent(values: Float64Array): { min: number; max: number; linear: boolean } | null {
  const count = values.length;
  if (count === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  const first = values[0];
  const stride = count === 1 ? 0 : (values[count - 1] - first) / (count - 1);
  let linear = Number.isFinite(first) && Number.isFinite(stride);
  for (let i = 0; i < count; i++) {
    const value = values[i];
    if (value < min) min = value;
    if (value > max) max = value;
    if (linear && value !== first + i * stride) linear = false;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { min, max, linear };
}

function xEdgeOf(channel: unknown): boolean {
  return isRecord(channel) && isRecord(channel.scale) && channel.scale.padding === 0;
}

function pinDomain(pair: [number, number], lock: DomainLock): [number, number] {
  if (!lock) return pair;
  const lo = lock[0] ?? pair[0];
  const hi = lock[1] ?? pair[1];
  return hi > lo ? [lo, hi] : pair;
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
      const values = series.values;
      if (values instanceof Float64Array) {
        const extent = floatExtent(values);
        if (extent) {
          consider(extent.min);
          consider(extent.max);
          if (extent.dense) noteDense(values);
          continue;
        }
      }
      let finite = 0;
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value === null || !Number.isFinite(value)) continue;
        finite += 1;
        consider(value);
      }
      if (values.length > 0 && finite === values.length) noteDense(values);
    }
  }
  const lock = axisLock(model, axis);
  const log = axis === "y2" ? model.y2Log : model.yLog;
  if (log) {
    if (!seen || !(max > 0)) return pinDomain([1, 10], lock);
    const lo = min > 0 ? min : max / 10;
    return pinDomain(logNice(lo, max), lock);
  }
  if (axisIncludesZero(model, axis)) consider(0);
  if (!seen) return pinDomain([0, 1], lock);
  if (min === max) {
    min -= Math.abs(min) || 1;
    max += Math.abs(max) || 1;
  }
  if (model.f & (axis === "y2" ? 2 : 1)) return pinDomain(padExtent(min, max, axisPad(model, axis), lock), lock);
  const [niceMin, niceMax] = niceDomain(min, max);
  let lo = niceMin;
  let hi = niceMax;
  const pinnedAtZero = axisIncludesZero(model, axis) && niceMin <= 0 && min >= 0;
  const span = hi > lo ? hi - lo : Math.abs(max) || 1;
  const gutter = strokeGutter(model, axis, span);
  if (gutter > 0 && max + gutter > hi) hi = round(max + gutter);
  if (!pinnedAtZero && gutter > 0 && min - gutter * 0.5 < lo) lo = round(min - gutter * 0.5);
  return pinDomain(padExtent(lo, hi, axisPad(model, axis), lock), lock);
}

/** Pixel air above a line, converted to data units, so the stroke does not sit on the plot edge. */
function strokeGutter(model: PlotModel, axis: "y" | "y2", span: number): number {
  let stroked = false;
  for (const series of model.series) {
    if (series.axis === axis && series.mark !== "bar") stroked = true;
  }
  if (!stroked) return 0;
  const compact = model.type === "sparkline" || model.type === "mini-area";
  const air = Math.max(model.strokeWidth, 2) * 0.5 + (compact ? 3 : 14);
  let top = compact ? 2 : 14;
  if (!compact && model.title) top += 20;
  if (!compact && model.subtitle) top += 18;
  if (!compact && model.legend && (!model.legendBox || model.legendBox.position === "top")) top += 30;
  const bottom = compact ? 2 : model.showX ? 32 : 12;
  const plotH = Math.max(24, model.height - top - bottom);
  return Math.max((air / plotH) * span, compact ? 0 : span * 0.06);
}

export function resolveTicks(model: PlotModel, key: "x" | "y" | "y2", min: number, max: number, count: number, log: boolean): number[] {
  const axis = key === "y" ? model.yAxis : key === "y2" ? model.y2Axis : model.xAxis;
  const values = axis.values;
  if (values && values.length) {
    const out: number[] = [];
    for (let i = 0; i < values.length; i++) if (values[i] >= min - 1e-6 && values[i] <= max + 1e-6) out.push(values[i]);
    return out;
  }
  if (count <= 0) return [];
  return log ? logTicks(min, max) : ticks(min, max, count);
}

function seriesLabelBoxes(
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  horizontal: boolean,
): { x: number; y: number; w: number; h: number }[] {
  if (!wantLabels(model) || horizontal) return [];
  const pos = model.labelAt || "top";
  const layers = model.stack === "none" ? null : stackLayers(model.series, model.stack === "percent" ? "percent" : "stack");
  const boxes: { x: number; y: number; w: number; h: number }[] = [];
  model.series.forEach((series, index) => {
    if (series.mark === "bar") return;
    const [first, last] = endsOf(series.values);
    if (first < 0) return;
    const scale = series.axis === "y2" ? y2Scale : yScale;
    const shift = nudge(pos, series.radius ?? model.pointSize);
    for (let i = 0; i < series.values.length; i++) {
      const value = series.values[i];
      if (typeof value !== "number" || !labelIndex(model.labelEnds, i, first, last)) continue;
      const plotted = layers ? layers.top[index]?.[i] : value;
      if (typeof plotted !== "number") continue;
      const text = labelText(model, series, value);
      const x = xScale.center(i) + shift[0];
      const y = scale(plotted) + shift[1];
      const w = Math.max(8, text.length * 6);
      const left = shift[2] === "middle" ? x - w / 2 : shift[2] === "end" ? x - w : x;
      boxes.push({ x: left, y: y - 9, w, h: 11 });
    }
  });
  return boxes;
}

function labelStep(model: PlotModel, count: number): number {
  const target = model.xAxis.count;
  if (target === 0) return 0;
  if (target !== undefined) return Math.max(1, Math.ceil(count / Math.max(1, target)));
  return count > 8 ? Math.ceil(count / 6) : 1;
}

function legendName(model: PlotModel, series: Series): string {
  if (series.legendName) return series.legendName;
  return hooks?.seriesName(model, series) ?? series.name;
}

function linePath(points: Pt[], curve: Curve): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${n(points[0].x)} ${n(points[0].y)}`;
  if (curve === "monotone") return monotone(points);
  if (curve === "step" || curve === "step-before" || curve === "step-after") return step(points, curve);
  const parts = new Array<string>(points.length);
  for (let i = 0; i < points.length; i++) parts[i] = (i === 0 ? "M " : "L ") + n(points[i].x) + " " + n(points[i].y);
  return parts.join(" ");
}

function areaPath(top: Pt[], bottom: Pt[], curve: Curve): string {
  if (top.length === 0) return "";
  const forward = linePath(top, curve);
  const back = [...bottom].reverse();
  const backward = linePath(back, curve).replace(/^M/, "L");
  return `${forward} ${backward} Z`;
}

/**
 * Fritsch–Carlson monotone cubic. Control points stay between the segment
 * ends, so a spike does not pass the peak or cross the low point.
 */
function monotone(points: Pt[]): string {
  const count = points.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    const span = points[i + 1].x - points[i].x;
    dx.push(span);
    slope.push(span === 0 ? 0 : (points[i + 1].y - points[i].y) / span);
  }
  const tangent = new Array<number>(count);
  tangent[0] = slope[0];
  tangent[count - 1] = slope[count - 2];
  for (let i = 1; i < count - 1; i++) {
    const left = slope[i - 1];
    const right = slope[i];
    tangent[i] = left * right <= 0 ? 0 : (left + right) / 2;
  }
  for (let i = 0; i < count - 1; i++) {
    const delta = slope[i];
    if (delta === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const alpha = tangent[i] / delta;
    const beta = tangent[i + 1] / delta;
    const sum = alpha * alpha + beta * beta;
    if (sum > 9) {
      const scale = 3 / Math.sqrt(sum);
      tangent[i] = scale * alpha * delta;
      tangent[i + 1] = scale * beta * delta;
    }
  }
  const parts = new Array<string>(count);
  parts[0] = "M " + n(points[0].x) + " " + n(points[0].y);
  for (let i = 0; i < count - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const span = dx[i];
    parts[i + 1] =
      "C " +
      n(from.x + span / 3) +
      " " +
      n(from.y + (tangent[i] * span) / 3) +
      ", " +
      n(to.x - span / 3) +
      " " +
      n(to.y - (tangent[i + 1] * span) / 3) +
      ", " +
      n(to.x) +
      " " +
      n(to.y);
  }
  return parts.join(" ");
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

function seriesMark(type: string, mark: unknown, area: boolean): "line" | "bar" | "area" | "range" {
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
  if (value === "linear" || value === "step" || value === "step-before" || value === "step-after") return value;
  return "monotone";
}

function zeroDefault(type: string, mark: Record<string, unknown>, series: Series[]): boolean {
  if (type === "bar" || type === "stacked-area" || type === "mini-area") return true;
  if (mark.area === true || series.some((item) => item.area)) return true;
  return false;
}

/** Bar and area marks include 0 on the axis they use. A combo line on the other axis does not. */
function axisIncludesZero(model: PlotModel, axis: "y" | "y2"): boolean {
  if (model.f & (axis === "y2" ? 1024 : 512)) return Boolean(model.f & (axis === "y2" ? 128 : 64));
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
  let height = 240;
  if (typeof size.height === "number") height = size.height;
  else if (size.height === "auto" && typeof size.aspectRatio === "number" && size.aspectRatio > 0) height = Math.max(1, Math.round(width / size.aspectRatio));
  else if (type === "sparkline") height = 32;
  else if (type === "mini-area") height = 40;
  if (typeof size.minHeight === "number" && size.minHeight > height) height = size.minHeight;
  return height;
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

type DomainLock = [number | null, number | null] | null;

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
  pointShape: string;
  pointSize?: number;
  pointHollow: boolean;
  lock?: [number | null, number | null];
  pad?: { min: number; max: number } | null;
  clamp?: boolean;
}

function readYChannels(y: unknown): YChannel[] {
  const list = Array.isArray(y) ? y : y === undefined ? [] : [y];
  return list.map((item) => {
    if (typeof item === "string") return { field: item, axis: "y" as const, dash: "solid", area: false, log: false, pointShape: "", pointHollow: false };
    if (!isRecord(item)) return { axis: "y" as const, dash: "solid", area: false, log: false, pointShape: "", pointHollow: false };
    const scale = isRecord(item.scale) ? item.scale : undefined;
    return {
      field: typeof item.field === "string" ? item.field : undefined,
      title: typeof item.title === "string" ? item.title : undefined,
      color: typeof item.color === "string" ? item.color : undefined,
      axis: item.axis === "y2" ? "y2" : "y",
      mark: typeof item.mark === "string" ? item.mark : undefined,
      dash: item.dash === "dashed" || item.dash === "dotted" ? item.dash : "solid",
      area: item.area === true,
      log: scale?.type === "log",
      format: item.format,
      pointShape: glyphOf(item.pointShape),
      pointSize: typeof item.pointSize === "number" ? item.pointSize : undefined,
      pointHollow: item.pointFill === "hollow",
      lock: scale ? domainEnds(scale.domain) : undefined,
      pad: scalePad(item),
      clamp: scaleClamp(item),
    };
  });
}

function axisChannels(model: PlotModel): YChannel[] | undefined {
  return (model as unknown as { channels?: YChannel[] }).channels;
}

function axisLock(model: PlotModel, axis: "y" | "y2"): DomainLock {
  const channels = axisChannels(model);
  if (!channels) return null;
  for (const channel of channels) if (channel.axis === axis && channel.lock) return channel.lock;
  return null;
}

function axisPad(model: PlotModel, axis: "y" | "y2"): { min: number; max: number } | null {
  const channels = axisChannels(model);
  if (!channels) return null;
  for (const channel of channels) if (channel.axis === axis && channel.pad) return channel.pad;
  return null;
}

function axisClamps(model: PlotModel, axis: "y" | "y2"): boolean {
  const channels = axisChannels(model);
  return Boolean(channels?.some((channel) => channel.axis === axis && channel.clamp));
}

function modelClamp(scale: (value: number) => number, domain: [number, number], on: boolean): (value: number) => number {
  if (!on) return scale;
  const lo = Math.min(domain[0], domain[1]);
  const hi = Math.max(domain[0], domain[1]);
  return (value) => scale(value < lo ? lo : value > hi ? hi : value);
}

function dashAttr(dash: string): string {
  if (dash === "dashed") return ' stroke-dasharray="6 4"';
  if (dash === "dotted") return ' stroke-dasharray="1.5 3"';
  return "";
}

export function legendRows(model: PlotModel, start: number, maxRight: number): number {
  let cx = start;
  let rows = 1;
  const names = model.swatches && model.swatches.length > 1 ? model.swatches.map((item) => item.name) : model.series.map((series) => legendName(model, series));
  if (model.legend) for (const item of model.ruleLegend ?? []) names.push(item.name);
  for (const name of names) {
    const width = 26 + name.length * 6.6;
    if (cx > start && cx + width > maxRight) {
      rows += 1;
      cx = start;
    }
    cx += width;
  }
  return rows;
}

function pivotBars(
  table: DataTable,
  encoding: Record<string, unknown>,
  yChannels: YChannel[],
  preset: PresetTokens,
): { series: Series[]; labels: string[] } | null {
  if (yChannels.length !== 1) return null;
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
  const column = color ? table.columns[color] : undefined;
  const scale = isRecord(encoding.color) && isRecord(encoding.color.scale) ? encoding.color.scale.type : undefined;
  const quantitative = scale === "sequential" || scale === "diverging" || scale === "quantize" || scale === "threshold" || (isRecord(encoding.color) && encoding.color.type === "quantitative");
  if (color && color !== xName && column && !isPaintColumn(column) && !quantitative) return color;
  return undefined;
}

const DISTINCT = ["#ffd60a", "#5e5ce6", "#ff9f0a", "#64d2ff", "#ac8e68", "#ff6961"];
/** CIE76. Below this, a rule colour is the same colour as a series in that theme. */
const RULE_DELTA_E = 25;

function rgbOf(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function labOf(hex: string): [number, number, number] {
  const [r, g, b] = rgbOf(hex);
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const R = channel(r);
  const G = channel(g);
  const B = channel(b);
  let x = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  let y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  let z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;
  x /= 0.95047;
  z /= 1.08883;
  const pivot = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = pivot(x);
  const fy = pivot(y);
  const fz = pivot(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE76(a: string, b: string): number {
  const left = labOf(a);
  const right = labOf(b);
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
}

/** Light and dark fallbacks, in theme order. A single hex is one theme. */
function themeSlots(color: string): string[] {
  const paired = /light-dark\(\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)/.exec(color);
  if (paired) return [paired[1].toLowerCase(), paired[2].toLowerCase()];
  const hex = /#([0-9a-fA-F]{6})/.exec(color);
  return hex ? [`#${hex[1].toLowerCase()}`] : [];
}

function tooClose(hex: string, others: string[]): boolean {
  return others.some((other) => deltaE76(hex, other) < RULE_DELTA_E);
}

/**
 * Move a rule colour off every series colour in the same theme.
 * Light is compared with light, and dark with dark. A shifted colour is the
 * new shade itself, so a host token cannot paint the collision back.
 */
function distinctPaint(painted: string, occupied: string[]): string {
  const slots = themeSlots(painted);
  if (!slots.length) return painted;
  const occupiedSlots = occupied.map(themeSlots);
  const next = slots.map((hex, index) => {
    const others: string[] = [];
    for (const row of occupiedSlots) {
      if (row.length === slots.length) {
        if (row[index]) others.push(row[index]);
      } else others.push(...row);
    }
    if (!tooClose(hex, others)) return hex;
    for (const alt of DISTINCT) {
      if (!tooClose(alt, others) && deltaE76(alt, hex) >= RULE_DELTA_E) return alt;
    }
    return hex;
  });
  if (next.every((hex, index) => hex === slots[index])) return painted;
  if (next.length === 2) return `light-dark(${next[0]}, ${next[1]})`;
  return next[0] ?? painted;
}

/** Series fills and line strokes. Rule paints are not occupied: they are what this shifts. */
function occupiedPaints(series: Series[], preset: PresetTokens): string[] {
  const occupied: string[] = [];
  for (const item of series) {
    occupied.push(item.color);
    if (item.mark !== "bar") occupied.push(lineStroke(item.color, 2, preset.lines));
  }
  return occupied;
}

function baseLabelOf(mark: Record<string, unknown>): string | undefined {
  return typeof mark.baseLabel === "string" && mark.baseLabel.trim() ? mark.baseLabel.trim() : undefined;
}

function hasUnmatched(values: ArrayLike<number | null>, rules: ColorRule[], preset: PresetTokens): boolean {
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    if (matchRule(value, rules, preset) === null) return true;
  }
  return false;
}

function repaint(item: Series, from: string, to: string): void {
  if (!item.colors || from === to) return;
  for (let i = 0; i < item.colors.length; i++) if (item.colors[i] === from) item.colors[i] = to;
}

/**
 * One swatch per rule colour. Bars and the points that share a rule use that
 * colour; the points are outlines so the bar and the dot stay distinct.
 * mark.baseLabel folds the unmatched series colour into that series' own entry.
 */
function ruleSwatches(
  series: Series[],
  rules: ColorRule[],
  preset: PresetTokens,
  baseLabel?: string,
): { name: string; color: string; symbol: "circle" | "square" }[] {
  const occupied = occupiedPaints(series, preset);
  if (baseLabel) {
    const bars = series.filter((item) => item.mark === "bar" && hasUnmatched(item.values, rules, preset));
    const item = bars[0] ?? series.find((entry) => hasUnmatched(entry.values, rules, preset));
    if (item) item.legendName = `${item.name}: ${baseLabel}`;
  }
  const out: { name: string; color: string; symbol: "circle" | "square" }[] = [];
  const seen = new Set<string>();
  for (const rule of rules) {
    if (!rule.color || seen.has(rule.color)) continue;
    const painted = paint(rule.color, preset, 0);
    const shifted = distinctPaint(painted, occupied);
    let barUsed = false;
    let pointUsed = false;
    for (const item of series) {
      if (!ruleMatchesAny(rule, item.values)) continue;
      if (item.mark === "bar") {
        barUsed = true;
        repaint(item, painted, shifted);
        continue;
      }
      if (!item.colors) continue;
      pointUsed = true;
      repaint(item, painted, shifted);
    }
    if (!barUsed && !pointUsed) continue;
    seen.add(rule.color);
    occupied.push(shifted);
    if (barUsed && pointUsed) {
      for (const item of series) {
        if (item.mark === "bar" || !item.colors) continue;
        const hollow = item.ruleHollow ?? item.colors.map(() => false);
        for (let i = 0; i < item.colors.length; i++) if (item.colors[i] === shifted) hollow[i] = true;
        item.ruleHollow = hollow;
      }
    }
    out.push({
      name: rule.label || rule.color,
      color: shifted,
      symbol: barUsed ? "square" : "circle",
    });
  }
  return out;
}

/** Per-point colour from a colour field, a domain map, a constant, or mark.colorRules. */
function colorLegendFoot(model: PlotModel): number {
  return model.colorScale && model.legendOn ? 46 : 0;
}

/** True when a bar crosses or sits left of zero, so the category gutter stays clear of the tip. */
function diverges(model: PlotModel): boolean {
  for (const series of model.series) {
    if (series.mark !== "bar") continue;
    for (let i = 0; i < series.values.length; i++) {
      const value = series.values[i];
      if (typeof value === "number" && value < 0) return true;
    }
  }
  return false;
}

/** Widest outside bar label, so the right margin can hold “+7.2%”. */
function valueLabelWidth(model: PlotModel): number {
  let width = 0;
  for (const series of model.series) {
    if (series.mark !== "bar") continue;
    for (let i = 0; i < series.values.length; i++) {
      const value = series.values[i];
      if (typeof value !== "number") continue;
      const size = labelText(model, series, value).length * 6.8;
      if (size > width) width = size;
    }
  }
  return width;
}

/** The bottom legend's own band, so the x title sits above it instead of in it. */
function bottomLegendFoot(model: PlotModel, plot: PlotBox): number {
  if (!model.legend || !model.legendBox || model.legendBox.position !== "bottom") return 0;
  return legendSpace(model.legendBox, legendItems(model), Math.max(80, plot.right - plot.left)).band;
}

function applyPointColors(
  table: DataTable,
  encoding: Record<string, unknown>,
  mark: Record<string, unknown>,
  preset: PresetTokens,
  series: Series[],
  labels: string[],
  useScale: boolean,
): ColorScale | null {
  const rules = readRules(mark);
  const colorEnc = readColor(encoding.color);
  if (rules.length === 0 && !colorEnc) return null;
  const colorField = colorEnc?.field;
  const xField = channelField(encoding.x);
  const pivot = seriesFieldName(encoding, table);
  const column = colorField && pivot !== colorField ? table.columns[colorField] : undefined;
  const paintCol = column ? isPaintColumn(column) : false;
  const numeric: number[] = [];
  if (column && !paintCol) {
    for (let i = 0; i < column.length; i++) {
      const value = column[i];
      if (typeof value === "number" && Number.isFinite(value)) numeric.push(value);
    }
  }
  const scale = useScale && colorScaleReader && column && !paintCol && numeric.length ? colorScaleReader(encoding.color, preset, numeric, false) : null;
  if (scale && column) {
    let used = false;
    for (const item of series) {
      if (column.length !== item.values.length) continue;
      const colors: string[] = [];
      let hits = 0;
      for (let i = 0; i < item.values.length; i++) {
        const value = column[i];
        if (typeof value === "number" && Number.isFinite(value)) {
          hits += 1;
          colors.push(scale.paint(value));
        } else colors.push(item.color);
      }
      if (hits) {
        item.colors = colors;
        used = true;
      }
    }
    if (used) return scale;
  }
  for (const item of series) {
    const count = item.values.length;
    const aligned = column && column.length === count ? column : null;
    const categorical = Boolean(colorEnc?.domain || colorEnc?.range || (colorField && colorField === xField) || (aligned && !paintCol));
    const colors = resolveColors({
      count,
      values: item.values,
      labels: labels.length === count ? labels : Array.from({ length: count }, (_, index) => labels[index] ?? String(index)),
      raw: aligned,
      range: colorEnc?.range,
      domain: colorEnc?.domain,
      constant: colorEnc?.constant,
      rules,
      preset,
      fallback: item.color,
      categorical,
    });
    if (!colors) continue;
    if (colorEnc?.constant) item.color = paint(colorEnc.constant, preset, 0);
    if (colors.some((color) => color !== item.color)) item.colors = colors;
  }
  applyRuleLabels(series, rules);
  return null;
}

function applyRuleLabels(series: Series[], rules: ColorRule[]): void {
  if (!rules.some((rule) => rule.label)) return;
  for (const item of series) {
    const captions: string[] = [];
    let any = false;
    for (let i = 0; i < item.values.length; i++) {
      const value = item.values[i];
      const caption = typeof value === "number" ? ruleCaption(value, rules) : "";
      if (caption) any = true;
      captions.push(caption);
    }
    if (any) item.ruleLabels = captions;
  }
}

function legendAsked(spec: Record<string, unknown>): boolean {
  if (spec.legend === true) return true;
  return isRecord(spec.legend) && spec.legend.show !== false;
}

/** Category swatches when the legend is requested and one series has more than one colour. */
function categorySwatches(spec: Record<string, unknown>, series: Series[], labels: string[]): { name: string; color: string }[] | undefined {
  if (!legendAsked(spec) || series.length !== 1) return undefined;
  const colors = series[0]?.colors;
  if (!colors) return undefined;
  const out: { name: string; color: string }[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < colors.length; i++) {
    const name = labels[i] ?? String(i);
    if (seen.has(name)) continue;
    seen.add(name);
    out.push({ name, color: colors[i] ?? series[0]?.color ?? "" });
  }
  if (out.length < 2) return undefined;
  if (new Set(out.map((item) => item.color)).size < 2) return undefined;
  return out;
}

function readBands(spec: Record<string, unknown>): { x?: unknown; y?: unknown; y2?: unknown } | undefined {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  if (!axes) return;
  const one = (key: string) => (isRecord(axes[key]) ? axes[key].bands : undefined);
  const bands = { x: one("x"), y: one("y"), y2: one("y2") };
  return bands.x === undefined && bands.y === undefined && bands.y2 === undefined ? undefined : bands;
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

const TICK_MIN = [1, 5, 15, 30, 60, 180, 360, 720, 1440, 2880, 10080, 20160, 43200, 129600, 525600];
const MONTHS = "JanFebMarAprMayJunJulAugSepOctNovDec";

export function timeTicks(min: number, max: number, count: number, zone = "UTC"): number[] {
  if (zone !== "UTC") return zonedTimeTicks(min, max, count, zone);
  const span = max - min || 1;
  let step = 525600 * 60000;
  for (let i = 0; i < TICK_MIN.length; i++) {
    const candidate = TICK_MIN[i] * 60000;
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
  return out.length ? out : [min, max];
}

export function formatTimeLabel(ms: number, span: number, locale: string, format: unknown, zone = "UTC"): string {
  if (format !== undefined) return formatValue(ms, format, locale, zone);
  if (zone !== "UTC") return formatZoned(ms, span, locale, zone);
  const date = new Date(ms);
  if (date.getTime() !== date.getTime()) return "";
  if (locale !== "en-US") {
    const opt: Intl.DateTimeFormatOptions =
      span < 1728e5
        ? { timeZone: "UTC", hour: "2-digit", minute: "2-digit" }
        : span < 6048e6
          ? { timeZone: "UTC", month: "short", day: "numeric" }
          : span < 6912e7
            ? { timeZone: "UTC", month: "short", year: "numeric" }
            : { timeZone: "UTC", year: "numeric" };
    return new Intl.DateTimeFormat(locale, opt).format(date);
  }
  if (span < 1728e5) {
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const h12 = hour % 12 || 12;
    return (h12 < 10 ? "0" : "") + h12 + ":" + (minute < 10 ? "0" : "") + minute + (hour < 12 ? " AM" : " PM");
  }
  const mo = date.getUTCMonth() * 3;
  const mon = MONTHS.slice(mo, mo + 3);
  if (span < 6048e6) return mon + " " + date.getUTCDate();
  const year = date.getUTCFullYear();
  return span < 6912e7 ? mon + " " + year : "" + year;
}

export function tickLabel(model: PlotModel, index: number): string {
  if (index < model.labels.length) return model.labels[index] ?? "";
  const value = model.x?.[index];
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function categoryTickText(model: PlotModel, count: number): string[] {
  const step = labelStep(model, count);
  if (step === 0) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i += step) {
    const label = tickLabel(model, i);
    if (label) out.push(label);
  }
  return out;
}

export function tickText(values: number[], model: PlotModel, format: unknown): string[] {
  const digits = tickDigits(values);
  const out = new Array<string>(values.length);
  for (let i = 0; i < values.length; i++) {
    out[i] = format === undefined ? formatNumber(values[i], model.locale, digits) : formatAxisValue(values[i], format, model.locale, values);
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

export function formatNumber(value: number, locale: string, digits = 2): string {
  if (Object.is(value, -0) || value === 0) value = 0;
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

