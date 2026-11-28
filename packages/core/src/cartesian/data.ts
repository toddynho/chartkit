import { isPaintColumn } from "../color";
import { isTypedArray, type DataTable } from "../data";
import { glyphOf } from "../glyphs";
import { notedLinear } from "../sampling";
import { asNumber } from "../frame";
import { domainEnds, isRecord, repeatKey, scaleClamp, scalePad } from "../svg";
import { paint, type PresetTokens } from "../theme";
import { parseTime } from "../timezone";
import type { PlotModel, Series, YChannel } from "./types";

const catCache = new WeakMap<PlotModel, string[]>();

export function numKey(value: number): string {
  if (Object.is(value, -0)) return "0";
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 1e6) / 1e6);
}

export function catKey(model: PlotModel, index: number): string {
  if (!model.labels.length) {
    const value = model.x?.[index];
    if (typeof value === "number" && Number.isFinite(value)) return numKey(value);
    return String(index);
  }
  let keys = catCache.get(model);
  if (!keys) {
    keys = repeatKey(model.labels);
    catCache.set(model, keys);
  }
  return keys[index] ?? String(index);
}

/** Min and max of a typed column. Null when the extent is empty or non-finite. NaN does not move it. */
export function floatExtent(values: Float64Array): { min: number; max: number; dense: boolean } | null {
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

/** x[i] === i for every index. One compare per point, no stride multiply. */
function isIndexAxis(values: Float64Array): boolean {
  const count = values.length;
  if (!(count > 1) || values[0] !== 0 || values[count - 1] !== count - 1) return false;
  for (let i = 1; i < count - 1; i++) if (values[i] !== i) return false;
  return true;
}

/** Extent plus an exact arithmetic-sequence check. Used for x, where index buckets need a linear axis. */
export function linearExtent(values: Float64Array): { min: number; max: number; linear: boolean } | null {
  const count = values.length;
  if (count === 0) return null;
  if (indexAxes.has(values) || notedLinear(values)) return { min: 0, max: Math.max(0, count - 1), linear: true };
  if (count > 1 && isIndexAxis(values)) return { min: 0, max: count - 1, linear: true };
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

export function channelField(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.field === "string") return value.field;
  return undefined;
}

export function numericColumn(table: { fields: readonly string[]; columns: Record<string, ArrayLike<unknown> | undefined> }, skip?: string): string | undefined {
  for (const name of table.fields) {
    if (name === skip) continue;
    const values = table.columns[name];
    if (!values) continue;
    const list = Array.isArray(values) ? values : Array.from(values);
    if (list.some((item) => typeof item === "number" && Number.isFinite(item))) return name;
  }
  return undefined;
}

export function readYChannels(y: unknown): YChannel[] {
  const list = Array.isArray(y) ? y : y === undefined ? [] : [y];
  return list.map((item) => {
    if (typeof item === "string") return { field: item, axis: "y" as const, dash: "solid", area: false, log: false, sym: false, symC: 1, pointShape: "", pointHollow: false };
    if (!isRecord(item)) return { axis: "y" as const, dash: "solid", area: false, log: false, sym: false, symC: 1, pointShape: "", pointHollow: false };
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
      sym: scale?.type === "symlog",
      symC: typeof scale?.constant === "number" && scale.constant > 0 ? scale.constant : 1,
      z: typeof item.z === "number" && Number.isFinite(item.z) ? item.z : undefined,
      format: item.format,
      pointShape: glyphOf(item.pointShape),
      pointSize: typeof item.pointSize === "number" && Number.isFinite(item.pointSize) && item.pointSize >= 1 ? item.pointSize : undefined,
      pointHollow: item.pointFill === "hollow",
      stack: typeof item.stack === "string" && item.stack.length > 0 ? item.stack : undefined,
      fillOpacity: unitOpacity(item.fillOpacity),
      lock: scale ? domainEnds(scale.domain) : undefined,
      pad: scalePad(item),
      clamp: scaleClamp(item),
    };
  });
}

function unitOpacity(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function pivotBars(
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
      stackId: channel.stack,
    })),
  };
}

export function seriesFieldName(encoding: Record<string, unknown>, table: DataTable): string | undefined {
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

export function asNumbers(column: ArrayLike<unknown>): ArrayLike<number | null> {
  if (isTypedArray(column)) return column as ArrayLike<number | null>;
  if (Array.isArray(column)) {
    for (let i = 0; i < column.length; i++) {
      const value = column[i];
      if (value !== null && typeof value !== "number") return mapNumbers(column, toNullableNumber);
    }
    return column as (number | null)[];
  }
  return mapNumbers(column, toNullableNumber);
}

const indexAxes = new WeakSet<Float64Array>();
let indexAxisCache: Float64Array | null = null;

/** x[i] = i. Reused for the same length so a second paint does not fill it again. */
export function indexAxis(count: number): Float64Array {
  if (indexAxisCache && indexAxisCache.length === count) return indexAxisCache;
  const indexes = new Float64Array(count);
  for (let i = 0; i < count; i++) indexes[i] = i;
  indexAxisCache = indexes;
  indexAxes.add(indexes);
  return indexes;
}

export function mapNumbers(column: ArrayLike<unknown>, convert: (value: unknown) => number | null): (number | null)[] {
  const out = new Array<number | null>(column.length);
  for (let i = 0; i < column.length; i++) out[i] = convert(column[i]);
  return out;
}

export function stringLabels(column: ArrayLike<unknown>): string[] {
  const out = new Array<string>(column.length);
  for (let i = 0; i < column.length; i++) {
    const value = column[i];
    out[i] = value == null ? "" : String(value);
  }
  return out;
}

export function columnNumeric(column: ArrayLike<unknown>): boolean {
  for (let i = 0; i < column.length; i++) {
    const value = column[i];
    if (value !== null && typeof value !== "number") return false;
  }
  return true;
}

export function columnTemporal(column: ArrayLike<unknown>): boolean {
  for (let i = 0; i < column.length; i++) {
    const value = column[i];
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return true;
  }
  return false;
}

export function toNumber(value: unknown, zone: string): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseTime(value, zone);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toNullableNumber(value: unknown): number | null {
  return asNumber(value);
}

export function num(value: number | null): number {
  return value ?? 0;
}
