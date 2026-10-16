import { readData, type DataTable } from "./data";
import type { PresetTokens } from "./theme";
import { resolvePreset } from "./theme";
import { hash, isRecord, niceDomain } from "./svg";

export interface Frame {
  type: string;
  alt: string;
  title?: string;
  subtitle?: string;
  locale: string;
  width: number;
  height: number;
  responsive: boolean;
  heightFixed: boolean;
  widthFixed: boolean;
  preset: PresetTokens;
  id: string;
  mark: Record<string, unknown>;
  encoding: Record<string, unknown>;
  /** false hides the legend. Otherwise the placement. */
  legend: false | "top" | "right" | "bottom" | "left";
  legendValues: boolean;
}

export function readFrame(
  spec: Record<string, unknown>,
  fallback: { width: number; height: number },
): Frame {
  const size = isRecord(spec.size) ? spec.size : {};
  const widthFixed = typeof size.width === "number";
  const heightFixed = typeof size.height === "number";
  const width = widthFixed ? (size.width as number) : fallback.width;
  const responsive = size.width === undefined || size.width === "auto";
  let height = fallback.height;
  if (heightFixed) height = size.height as number;
  else if (size.height === "auto" && typeof size.aspectRatio === "number" && size.aspectRatio > 0) {
    height = Math.max(1, Math.round(width / size.aspectRatio));
  }
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : "";
  const type = typeof spec.type === "string" ? spec.type : "chart";
  const idSource = typeof spec.id === "string" ? spec.id : alt || type;
  return {
    type,
    alt,
    title: typeof spec.title === "string" ? spec.title : undefined,
    subtitle: typeof spec.subtitle === "string" ? spec.subtitle : undefined,
    locale: typeof spec.locale === "string" ? spec.locale : "en-US",
    width,
    height,
    responsive,
    heightFixed,
    widthFixed,
    preset: resolvePreset(spec.theme),
    id: `ck${hash(idSource)}`,
    mark: isRecord(spec.mark) ? spec.mark : {},
    encoding: isRecord(spec.encoding) ? spec.encoding : {},
    legend: legendPlacement(spec),
    legendValues: isRecord(spec.legend) && spec.legend.values === true,
  };
}

export function readTable(spec: Record<string, unknown>): DataTable | null {
  const read = readData(spec.data);
  return read.ok ? read.table : null;
}

export interface MetricBand {
  from: number;
  to: number;
  color?: string;
  label?: string;
}

export interface Metric {
  value: number;
  label?: string;
  min: number;
  max: number;
  target?: number;
  delta?: number;
  deltaFormat: unknown;
  goodDirection: "up" | "down";
  format?: unknown;
  bands: MetricBand[];
}

export function readMetric(spec: Record<string, unknown>): Metric | null {
  if (!isRecord(spec.metric) || typeof spec.metric.value !== "number" || !Number.isFinite(spec.metric.value)) {
    return null;
  }
  const metric = spec.metric;
  const value = metric.value;
  if (typeof value !== "number") return null;
  const bands: MetricBand[] = [];
  if (Array.isArray(metric.bands)) {
    for (const band of metric.bands) {
      if (!isRecord(band) || typeof band.from !== "number" || typeof band.to !== "number") continue;
      bands.push({
        from: band.from,
        to: band.to,
        color: typeof band.color === "string" ? band.color : undefined,
        label: typeof band.label === "string" ? band.label : undefined,
      });
    }
  }
  return {
    value,
    label: typeof metric.label === "string" ? metric.label : undefined,
    min: typeof metric.min === "number" ? metric.min : 0,
    max: typeof metric.max === "number" ? metric.max : 100,
    target: typeof metric.target === "number" ? metric.target : undefined,
    delta: typeof metric.delta === "number" ? metric.delta : undefined,
    deltaFormat: metric.deltaFormat === undefined ? { style: "percent", signed: true } : metric.deltaFormat,
    goodDirection: metric.goodDirection === "down" ? "down" : "up",
    format: metric.format,
    bands,
  };
}

export function fieldOf(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return fieldOf(value[0]);
  if (isRecord(value) && typeof value.field === "string") return value.field;
  return undefined;
}

export function channelFormat(value: unknown): unknown {
  const channel = Array.isArray(value) ? value[0] : value;
  if (!isRecord(channel)) return undefined;
  return channel.format;
}

export function column(table: DataTable, field: string | undefined): unknown[] {
  if (!field) return [];
  return table.columns[field] ?? [];
}

export function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export interface ColorEncoding {
  field?: string;
  constant?: string;
  range?: string[];
  title?: string;
}

export function readColor(value: unknown): ColorEncoding | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return { field: value };
  if (!isRecord(value)) return undefined;
  if (typeof value.value === "string" && typeof value.field !== "string") return { constant: value.value };
  const range = Array.isArray(value.range) ? value.range.filter((item): item is string => typeof item === "string") : undefined;
  return {
    field: typeof value.field === "string" ? value.field : undefined,
    range: range && range.length >= 2 ? range : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
  };
}

export function readSizeRange(value: unknown): { field?: string; range: [number, number] } | undefined {
  if (typeof value === "string") return { field: value, range: [3, 24] };
  if (!isRecord(value) || typeof value.field !== "string") return undefined;
  const range =
    Array.isArray(value.range) && value.range.length >= 2 && typeof value.range[0] === "number" && typeof value.range[1] === "number"
      ? ([value.range[0], value.range[1]] as [number, number])
      : ([3, 24] as [number, number]);
  return { field: value.field, range };
}

export function scaleTypeOf(channel: unknown): string | undefined {
  if (!isRecord(channel) || !isRecord(channel.scale) || typeof channel.scale.type !== "string") return undefined;
  return channel.scale.type;
}

export function wantsZero(channel: unknown, fallback: boolean): boolean {
  if (isRecord(channel) && isRecord(channel.scale) && typeof channel.scale.zero === "boolean") return channel.scale.zero;
  return fallback;
}

export function resolveDomain(values: number[], channel: unknown, zero: boolean): [number, number] {
  const finite = values.filter((value) => Number.isFinite(value));
  if (zero) finite.push(0);
  let min = finite.length ? Math.min(...finite) : 0;
  let max = finite.length ? Math.max(...finite) : 1;
  if (min === max) {
    min -= Math.abs(min) || 1;
    max += Math.abs(max) || 1;
  }
  const [niceMin, niceMax] = niceDomain(min, max);
  min = niceMin;
  max = niceMax;
  if (isRecord(channel) && isRecord(channel.scale) && Array.isArray(channel.scale.domain)) {
    const domain = channel.scale.domain;
    if (typeof domain[0] === "number") min = domain[0];
    if (typeof domain[1] === "number") max = domain[1];
  }
  if (min === max) max = min + 1;
  return [min, max];
}

export function axisOn(spec: Record<string, unknown>, key: "x" | "y" | "y2"): boolean {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  if (!axes || axes[key] === undefined) return key !== "y2";
  return axes[key] !== false;
}

export function gridStyle(spec: Record<string, unknown>): false | "solid" | "dashed" | "dotted" {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const y = axes && isRecord(axes.y) ? axes.y.grid : undefined;
  if (y === false) return false;
  if (y === true || y === undefined) return "dashed";
  if (y === "solid" || y === "dashed" || y === "dotted") return y;
  return "dashed";
}

export function axisTitle(spec: Record<string, unknown>, key: "x" | "y"): string | undefined {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const axis = axes && isRecord(axes[key]) ? axes[key] : undefined;
  if (axis && typeof axis.title === "string") return axis.title;
  return undefined;
}

function legendPlacement(spec: Record<string, unknown>): Frame["legend"] {
  if (spec.legend === false) return false;
  if (isRecord(spec.legend)) {
    if (spec.legend.show === false) return false;
    const position = spec.legend.position;
    if (position === "top" || position === "right" || position === "bottom" || position === "left") return position;
  }
  return "top";
}
