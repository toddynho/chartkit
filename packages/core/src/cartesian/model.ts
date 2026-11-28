import { withPalette } from "../color";
import { loadTable } from "../data-prep";
import { isTypedArray, type DataTable } from "../data";
import { zoneOf } from "../timezone";
import { localeTagOk } from "../format";
import { glyphOf, named } from "../glyphs";
import { canvasWanted } from "../render-mode";
import { dataSampling, readSamplingMode } from "../sampling";
import type { ColorScale } from "../color-scale";
import { chartSize, exportList } from "../frame";
import { legendPinned, readLegend } from "../legend";
import { clamp, hash, isRecord, n, pointRadius, scaleClamp, scalePad } from "../svg";
import { revision, slots } from "../feature-hooks";
import { paint, resolveGeometry, resolvePreset, type PresetTokens } from "../theme";
import type { ChartShell, Curve, Headline, PlotModel, Series, TipChrome, YChannel } from "./types";
import { hooks } from "./hooks";
import { asNumbers, channelField, columnNumeric, columnTemporal, indexAxis, mapNumbers, numericColumn, readYChannels, stringLabels, toNumber } from "./data";
import { idleStacks, xEdgeOf } from "./scales";

function shellStamp(spec: Record<string, unknown>): string {
  return JSON.stringify(spec, (key, value) => (key === "data" ? undefined : value)) ?? "";
}

let chartShell: ChartShell | null = null;

function cssText(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  const text = value.trim().replace(/["<>]/g, "");
  return text.length > 0 && text.length <= limit ? text : "";
}

export function readChromeOf(spec: Record<string, unknown>): { headline?: Headline; tip?: TipChrome } {
  return { headline: readHeadline(spec), tip: readTip(spec) };
}

function readHeadline(spec: Record<string, unknown>): Headline | undefined {
  if (!isRecord(spec.headline)) return;
  const label = cssText(spec.headline.label, 80);
  const value = cssText(spec.headline.value, 40);
  const compare = cssText(spec.headline.compare, 40);
  const delta = cssText(spec.headline.delta, 24);
  const tone = spec.headline.tone === "negative" || spec.headline.tone === "neutral" ? spec.headline.tone : spec.headline.tone === "positive" ? "positive" : "";
  if (!label && !value && !compare && !delta && !tone) return;
  return { label, value, compare, delta, tone: tone || "positive" };
}

function readTip(spec: Record<string, unknown>): TipChrome | undefined {
  if (!isRecord(spec.tooltip)) return;
  const background = cssText(spec.tooltip.background, 80);
  const shadow = cssText(spec.tooltip.shadow, 80);
  const crosshair = cssText(spec.tooltip.crosshairColor, 80);
  const radius = typeof spec.tooltip.radius === "number" && Number.isFinite(spec.tooltip.radius) ? clamp(spec.tooltip.radius, 0, 24) : undefined;
  if (!background && !shadow && !crosshair && radius === undefined) return;
  return { background, shadow, crosshair, radius };
}

/** Theme, channels, and geometry. Reused when a later spec only replaces `data`. */
function shellFor(spec: Record<string, unknown>): ChartShell {
  const stamp = `${shellStamp(spec)}|${revision}`;
  const hit = chartShell;
  if (hit && hit.stamp === stamp) return hit;
  const type = spec.type as string;
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const preset = withPalette(resolvePreset(spec.theme), mark);
  const channels = readYChannels(encoding.y);
  const size = isRecord(spec.size) ? spec.size : {};
  const compact = type === "sparkline" || type === "mini-area";
  const sized = chartSize({ size }, { width: 640, height: compact ? (type === "sparkline" ? 32 : 40) : 320 });
  const width = sized.width;
  const geometry = resolveGeometry(spec.theme);
  const opacitySet = typeof mark.fillOpacity === "number";
  const fillOpacity = opacitySet ? (mark.fillOpacity as number) : geometry.fillOpacity;
  const strokeSet = typeof mark.strokeWidth === "number";
  const strokeWidth = strokeSet ? (mark.strokeWidth as number) : compact ? geometry.compactStroke : geometry.strokeWidth;
  const radiusSet = typeof mark.cornerRadius === "number";
  const pointsSet = mark.points === "always" || mark.points === "none" || mark.points === "hover";
  const points = pointsSet ? (mark.points as "none" | "hover" | "always") : geometry.points;
  const chrome = slots.chromeRead?.(spec);
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
    height: sized.height,
    responsive: size.width === undefined || size.width === "auto",
    alt,
    locale: typeof spec.locale === "string" && localeTagOk(spec.locale) ? spec.locale.trim() : "en-US",
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
    pointSize: pointRadius(mark.pointSize, geometry.pointSize),
    connectNulls: mark.connectNulls === true,
    cornerRadius: radiusSet ? (mark.cornerRadius as number) : geometry.cornerRadius,
    radiusVar: !radiusSet,
    stackGap: typeof mark.stackGap === "number" ? clamp(mark.stackGap, 0, 24) : 0,
    radiusEnds: mark.radiusEnds === "all" ? "all" : "outer",
    partial: mark.partial === "dashed" || mark.partial === "dotted" ? mark.partial : "",
    partialOpacity: typeof mark.partialOpacity === "number" ? clamp(mark.partialOpacity, 0, 1) : undefined,
    headline: chrome?.headline,
    tip: chrome?.tip,
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
    ySym: channels.some((channel) => channel.axis === "y" && channel.sym),
    y2Sym: channels.some((channel) => channel.axis === "y2" && channel.sym),
    symC: channels.find((channel) => channel.axis === "y" && channel.sym)?.symC ?? 1,
    symC2: channels.find((channel) => channel.axis === "y2" && channel.sym)?.symC ?? 1,
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

export function toModel(
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
    x = indexAxis(table.length);
  } else if (shell.xField && table.columns[shell.xField]) {
    const raw = table.columns[shell.xField];
    if (shell.continuousX && (isTypedArray(raw) || columnNumeric(raw))) {
      x = raw as ArrayLike<number | null>;
      xTemporal = shell.xIsTemporal;
    } else {
      const temporal = !isTypedArray(raw) && (columnTemporal(raw) || shell.xIsTemporal);
      if (temporal && type !== "bar") {
        x = mapNumbers(raw, (value) => toNumber(value, shell.zone));
        xTemporal = true;
      } else labels = stringLabels(raw);
    }
  } else {
    labels = Array.from({ length: table.length }, (_, index) => String(index));
  }

  const length = table.length;
  let series: Series[];
  const fallbackName = yChannels.length === 0 || yChannels.every((channel) => !channel.field || !table.columns[channel.field])
    ? numericColumn(table, shell.xField)
    : undefined;
  if (fallbackName && (yChannels.length === 0 || yChannels.every((channel) => !channel.field || !table.columns[channel.field]))) {
    series = [
      {
        name: fallbackName,
        values: asNumbers(table.columns[fallbackName]),
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
      const named = channel.field && table.columns[channel.field] ? table.columns[channel.field] : undefined;
      const column = named;
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
        fillOpacity: channel.fillOpacity,
        shape: channel.pointShape,
        radius: channel.pointSize,
        hollow: channel.pointHollow || undefined,
        format: channel.format,
        stackId: channel.stack,
        z: channel.z,
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
  const useScale = type === "bar" || type === "combo";
  let colorScale: ColorScale | null = null;
  let ruleLegend: NonNullable<PlotModel["ruleLegend"]> = [];
  let swatches: { name: string; color: string }[] | undefined;
  if (slots.colors) {
    const painted = slots.colors(spec, table, encoding, mark, preset, series, labels, useScale);
    colorScale = painted.scale;
    ruleLegend = painted.rules;
    swatches = painted.swatches;
  } else if (slots.scale) colorScale = slots.scale(table, encoding, preset, series, useScale);
  const planned = slots.stacks ? slots.stacks(series, shell.stack) : idleStacks(series);

  return {
    ...shell,
    layers: planned.layers,
    barSlot: planned.barSlot,
    barSlots: planned.barSlots,
    labels,
    // Bars need category bands. A combo of only lines and areas keeps a temporal or linear x.
    x: type === "bar" || (type === "combo" && series.some((item) => item.mark === "bar")) ? null : x,
    series,
    showY2: shell.showY2 && series.some((item) => item.axis === "y2"),
    legend: shell.legendOn && (series.length > 1 || Boolean(swatches) || ruleLegend.length > 0 || legendPinned(spec)),
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

const LABEL_AT = ["top", "bottom", "left", "right", "center", "inside", "outside"];
const LABEL_ENDS = ["all", "ends", "last"];

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
