import type { Diagnostic, JsonPatchOperation } from "./diagnostics";
import { readData, type DataTable } from "./data";
import { MARK_APPLIES } from "./marks";
import { nearest } from "./walker";

const CHART_TYPES = new Set([
  "line",
  "bar",
  "donut",
  "stacked-area",
  "scatter",
  "combo",
  "heatmap",
  "gauge",
  "kpi",
  "sparkline",
  "mini-area",
  "progress-ring",
  "spike",
  "candlestick",
]);

const SVG_BUDGET = 5000;
const DONUT_SLICE_BUDGET = 7;

interface Channel {
  field?: string;
  type?: string;
  scaleType?: string;
  axis?: "y" | "y2";
  /** JSON pointer of the channel value. */
  path: string;
  /** JSON pointer of the field itself (the string, or /field). */
  fieldPath: string;
}

export function semanticChecks(spec: unknown, diagnostics: Diagnostic[]): void {
  if (!isRecord(spec)) return;
  const type = typeof spec.type === "string" ? spec.type : undefined;
  const known = type !== undefined && CHART_TYPES.has(type);

  if (known && isRecord(spec.mark)) warnUnusedMarks(type, spec.mark, diagnostics);
  if (isRecord(spec.encoding)) warnSeriesShape(spec.encoding, diagnostics);

  const dataSource = spec.data;
  if (dataSource === undefined) {
    if (known) warnDesign(spec, type, undefined, diagnostics);
    return;
  }

  const read = readData(dataSource);
  if (!read.ok && read.reason === "empty") {
    diagnostics.push({
      code: "CK2004",
      severity: "error",
      message: "data is empty",
      path: "/data",
      hint: "provide at least 1 row (2 for line/area)",
    });
    return;
  }
  if (!read.ok && read.reason === "mismatch") {
    diagnostics.push({
      code: "CK2005",
      severity: "error",
      message: `columns have different lengths (${read.a}: ${read.an}, ${read.b}: ${read.bn})`,
      path: "/data/columns",
      hint: "All columns must be equal length",
    });
    return;
  }
  if (!read.ok) return;

  const table = read.table;
  if (isRecord(spec.encoding)) checkEncoding(spec, spec.encoding, table, diagnostics);
  if (type === "candlestick") checkCandles(spec, table, diagnostics);
  if (known) warnDesign(spec, type, table, diagnostics);
}

function checkEncoding(
  spec: Record<string, unknown>,
  encoding: Record<string, unknown>,
  table: DataTable,
  diagnostics: Diagnostic[],
): void {
  const channels: Channel[] = [];
  for (const key of ["x", "series", "color", "size", "open", "high", "low", "close", "volume"] as const) {
    const channel = readChannel(encoding[key], `/encoding/${key}`);
    if (channel?.field) channels.push(channel);
  }
  const yChannels = readY(encoding.y);
  channels.push(...yChannels);

  for (const channel of channels) {
    if (!channel.field) continue;
    const resolved = resolveField(channel.field, table.fields);
    if (!resolved.match) {
      const suggestion = resolved.caseMatch ?? resolved.closest;
      const hintParts = [`available fields: ${table.fields.join(", ") || "(none)"}`];
      if (resolved.caseMatch) hintParts.push(`did you mean ${JSON.stringify(resolved.caseMatch)}? (case differs)`);
      else if (resolved.closest) hintParts.push(`did you mean ${JSON.stringify(resolved.closest)}?`);
      const fix: JsonPatchOperation[] | undefined = suggestion
        ? [{ op: "replace", path: channel.fieldPath, value: suggestion }]
        : undefined;
      diagnostics.push({
        code: "CK2001",
        severity: "error",
        message: `field ${JSON.stringify(channel.field)} not found in data`,
        path: channel.fieldPath,
        hint: hintParts.join("; "),
        fix,
      });
      continue;
    }
    const values = table.columns[resolved.match] ?? [];
    checkColumn(spec, channel, resolved.match, values, table, diagnostics);
  }

  const x = readChannel(encoding.x, "/encoding/x");
  if (x?.field) {
    const resolved = resolveField(x.field, table.fields);
    if (resolved.match) {
      const values = table.columns[resolved.match] ?? [];
      if (x.type && x.type !== "temporal" && columnLooksLikeDates(values)) {
        diagnostics.push({
          code: "CK2003",
          severity: "warning",
          message: `${JSON.stringify(resolved.match)} looks like dates but type is ${JSON.stringify(x.type)}`,
          path: "/encoding/x",
          hint: 'set "type": "temporal" for a time axis',
          fix: temporalFix(encoding.x),
        });
      }
      const xType = x.type ?? inferType(values);
      if ((xType === "temporal" || xType === "quantitative") && !isSorted(values, xType)) {
        const index = firstUnsorted(values, xType);
        diagnostics.push({
          code: "CK2008",
          severity: "warning",
          message: `x values are not sorted (first out of order at row ${index})`,
          path: table.kind === "columns" ? `/data/columns/${resolved.match}/${index}` : `/data/${index}`,
          hint: "They'll be sorted for rendering; sort upstream to save time on large data",
        });
      }
    }
  }

  checkY2(spec, yChannels, diagnostics);
}

function checkColumn(
  spec: Record<string, unknown>,
  channel: Channel,
  field: string,
  values: ArrayLike<unknown>,
  table: DataTable,
  diagnostics: Diagnostic[],
): void {
  const declared = channel.type;
  const quantitative = declared === "quantitative" || (declared === undefined && inferType(values) === "quantitative");
  if (declared === "quantitative" || (declared === undefined && hasMixedNumbers(values))) {
    const bad: { index: number; value: unknown }[] = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value === null || value === undefined) continue;
      if (typeof value !== "number" || !Number.isFinite(value)) bad.push({ index: i, value });
    }
    if (bad.length > 0 && (declared === "quantitative" || quantitative || hasMixedNumbers(values))) {
      const first = bad[0];
      diagnostics.push({
        code: "CK2002",
        severity: "error",
        message: `field ${JSON.stringify(field)} has non-numeric values (${bad.length} of ${values.length} rows, first at row ${first.index}: ${JSON.stringify(first.value)})`,
        path: channel.path,
        hint: 'quantitative channels need numbers; strip units like "$" or "%", or set type: "nominal"',
      });
    }
  }

  const missing: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i] === null || values[i] === undefined) missing.push(i);
  }
  if (missing.length > 0) {
    const first = missing[0];
    const pointer = table.kind === "numbers" ? `/data/${first}` : table.kind === "columns" ? `/data/columns/${field}/${first}` : `/data/${first}/${field}`;
    diagnostics.push({
      code: "CK2007",
      severity: "warning",
      message: `${missing.length} missing values in ${JSON.stringify(field)} (first at row ${first})`,
      path: pointer,
      hint: "Gaps are drawn; set mark.connectNulls: true to bridge them",
    });
  }

  if (channel.scaleType === "log") {
    const bad: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (typeof value === "number" && value <= 0) bad.push(i);
    }
    if (bad.length > 0) {
      diagnostics.push({
        code: "CK3001",
        severity: "error",
        message: `log scale requires positive values; ${bad.length} values ≤ 0 in ${JSON.stringify(field)} (first at row ${bad[0]})`,
        path: `${channel.path}/scale/type`,
        hint: 'Use "sqrt", filter non-positive rows, or offset the data',
      });
    }
  }
  void spec;
}

function checkY2(spec: Record<string, unknown>, yChannels: Channel[], diagnostics: Diagnostic[]): void {
  if (yChannels.length === 0) return;
  const usesY2 = yChannels.some((channel) => channel.axis === "y2");
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const y2 = axes ? axes.y2 : undefined;
  const configured = y2 === true || isRecord(y2);
  if (configured && !usesY2) {
    diagnostics.push({
      code: "CK3002",
      severity: "error",
      message: 'y2 axis configured but no y series uses axis "y2"',
      path: "/axes/y2",
      hint: 'Add "axis": "y2" to a y item, or remove axes.y2',
    });
  } else if (usesY2 && (y2 === false || y2 === undefined)) {
    diagnostics.push({
      code: "CK3002",
      severity: "error",
      message: 'y series uses axis "y2" but no y2 axis is configured',
      path: "/encoding/y",
      hint: 'Add axes.y2, or set the series "axis" to "y"',
    });
  }
}

function checkCandles(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return;
  const fields = {
    open: readChannel(encoding.open, "/encoding/open")?.field,
    high: readChannel(encoding.high, "/encoding/high")?.field,
    low: readChannel(encoding.low, "/encoding/low")?.field,
    close: readChannel(encoding.close, "/encoding/close")?.field,
  };
  if (!fields.open || !fields.high || !fields.low || !fields.close) return;
  const open = table.columns[fields.open];
  const high = table.columns[fields.high];
  const low = table.columns[fields.low];
  const close = table.columns[fields.close];
  if (!open || !high || !low || !close) return;
  for (let i = 0; i < table.length; i++) {
    const o = open[i];
    const h = high[i];
    const l = low[i];
    const c = close[i];
    if ([o, h, l, c].some((value) => typeof value !== "number")) continue;
    const bodyHigh = Math.max(o as number, c as number);
    const bodyLow = Math.min(o as number, c as number);
    if ((h as number) < bodyHigh) {
      diagnostics.push({
        code: "CK3003",
        severity: "error",
        message: `candlestick row ${i}: high < max(open, close)`,
        path: `/data/${i}`,
        hint: "Check field mapping: are high/low swapped?",
      });
    }
    if ((l as number) > bodyLow) {
      diagnostics.push({
        code: "CK3003",
        severity: "error",
        message: `candlestick row ${i}: low > min(open, close)`,
        path: `/data/${i}`,
        hint: "Check field mapping: are high/low swapped?",
      });
    }
  }
}

function warnUnusedMarks(type: string, mark: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  for (const key of Object.keys(mark)) {
    const applies = MARK_APPLIES[key];
    if (!applies || applies.includes(type)) continue;
    diagnostics.push({
      code: "CK3010",
      severity: "warning",
      message: `"mark.${key}" has no effect on type ${JSON.stringify(type)}`,
      path: `/mark/${key}`,
      hint: `applies to: ${applies.join(", ")}. Remove it or change the type`,
    });
  }
}

function warnSeriesShape(encoding: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (encoding.series !== undefined && Array.isArray(encoding.y)) {
    diagnostics.push({
      code: "CK2006",
      severity: "error",
      message: '"encoding.series" and an array "encoding.y" cannot be combined',
      path: "/encoding/series",
      hint: "Use wide (y array) or long (series field) data, not both",
    });
  }
}

function warnDesign(
  spec: Record<string, unknown>,
  type: string,
  table: DataTable | undefined,
  diagnostics: Diagnostic[],
): void {
  if (type === "donut" && table && table.length > DONUT_SLICE_BUDGET) {
    diagnostics.push({
      code: "CK4001",
      severity: "warning",
      message: `${table.length} slices; donuts are hard to read beyond ~7`,
      path: "/data",
      hint: 'Use "type": "bar" (same encoding) or group small slices into "Other"',
    });
  }

  const seriesCount = countSeries(spec, table);
  const palette = paletteSize(spec);
  if (seriesCount > palette) {
    diagnostics.push({
      code: "CK4002",
      severity: "warning",
      message: `${seriesCount} series; colors repeat after ${palette}`,
      path: "/encoding/y",
      hint: "Use encoding.series with fewer groups, or add theme.tokens.series",
    });
  }

  if (table && table.length * Math.max(seriesCount, 1) > SVG_BUDGET) {
    const n = table.length * Math.max(seriesCount, 1);
    diagnostics.push({
      code: "CK4003",
      severity: "warning",
      message: `${n} points exceed SVG budget; switching to canvas`,
      path: "/data",
      hint: "Set size/renderer explicitly or pass columnar data for speed",
    });
  }

  const contrastIssue = textContrast(spec);
  if (contrastIssue) {
    diagnostics.push({
      code: "CK4004",
      severity: "warning",
      message: `text contrast ${contrastIssue.ratio}:1 below WCAG AA 4.5:1 for token ${JSON.stringify(contrastIssue.token)}`,
      path: `/theme/tokens/${contrastIssue.token}`,
      hint: `Suggest the nearest passing color ${contrastIssue.suggestion}`,
      fix: [{ op: "replace", path: `/theme/tokens/${contrastIssue.token}`, value: contrastIssue.suggestion }],
    });
  }
}

function countSeries(spec: Record<string, unknown>, table: DataTable | undefined): number {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return 1;
  if (Array.isArray(encoding.y)) return encoding.y.length;
  const series = readChannel(encoding.series, "/encoding/series");
  if (series?.field && table) {
    const values = table.columns[series.field];
    if (values) {
      const seen = new Set<string>();
      for (let i = 0; i < values.length; i++) seen.add(String(values[i]));
      return seen.size;
    }
  }
  return encoding.y !== undefined ? 1 : 1;
}

function paletteSize(spec: Record<string, unknown>): number {
  const theme = spec.theme;
  if (isRecord(theme) && isRecord(theme.tokens) && Array.isArray(theme.tokens.series) && theme.tokens.series.length > 0) {
    return theme.tokens.series.length;
  }
  return 8;
}

function textContrast(
  spec: Record<string, unknown>,
): { token: string; ratio: string; suggestion: string } | undefined {
  const theme = spec.theme;
  if (!isRecord(theme) || !isRecord(theme.tokens)) return undefined;
  const text = theme.tokens.text;
  const background = theme.tokens.background;
  if (typeof text !== "string" || typeof background !== "string") return undefined;
  const ratio = contrast(text, background);
  if (ratio === null || ratio >= 4.5) return undefined;
  return {
    token: "text",
    ratio: ratio.toFixed(2),
    suggestion: nearestPassing(text, background),
  };
}

function readY(y: unknown): Channel[] {
  if (Array.isArray(y)) {
    return y
      .map((item, index) => readChannel(item, `/encoding/y/${index}`))
      .filter((channel): channel is Channel => channel !== undefined && Boolean(channel.field));
  }
  const channel = readChannel(y, "/encoding/y");
  return channel?.field ? [channel] : [];
}

function readChannel(value: unknown, path: string): Channel | undefined {
  if (typeof value === "string") {
    return { field: value, path, fieldPath: path };
  }
  if (!isRecord(value)) return undefined;
  const field = typeof value.field === "string" ? value.field : undefined;
  const scale = isRecord(value.scale) && typeof value.scale.type === "string" ? value.scale.type : undefined;
  const axis = value.axis === "y" || value.axis === "y2" ? value.axis : undefined;
  return {
    field,
    type: typeof value.type === "string" ? value.type : undefined,
    scaleType: scale,
    axis,
    path,
    fieldPath: field ? `${path}/field` : path,
  };
}

function resolveField(name: string, fields: string[]): { match?: string; caseMatch?: string; closest?: string } {
  if (fields.includes(name)) return { match: name };
  const lower = name.toLowerCase();
  const caseMatch = fields.find((field) => field.toLowerCase() === lower);
  const closest = nearest(name, fields, name.length <= 4 ? 1 : 3);
  return { caseMatch, closest: caseMatch ?? closest };
}

function temporalFix(x: unknown): JsonPatchOperation[] {
  if (typeof x === "string") {
    return [{ op: "replace", path: "/encoding/x", value: { field: x, type: "temporal" } }];
  }
  if (isRecord(x)) {
    return [{ op: x.type === undefined ? "add" : "replace", path: "/encoding/x/type", value: "temporal" }];
  }
  return [{ op: "add", path: "/encoding/x/type", value: "temporal" }];
}

function inferType(values: ArrayLike<unknown>): "quantitative" | "temporal" | "nominal" {
  let present = 0;
  let numeric = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined) continue;
    present += 1;
    if (typeof value === "number" && Number.isFinite(value)) numeric += 1;
  }
  if (present === 0) return "nominal";
  if (numeric === present) return "quantitative";
  if (columnLooksLikeDates(values)) return "temporal";
  return "nominal";
}

function hasMixedNumbers(values: ArrayLike<unknown>): boolean {
  let numbers = 0;
  let others = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined) continue;
    if (typeof value === "number" && Number.isFinite(value)) numbers += 1;
    else others += 1;
  }
  return numbers > 0 && others > 0;
}

function columnLooksLikeDates(values: ArrayLike<unknown>): boolean {
  let present = 0;
  let hits = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined) continue;
    present += 1;
    if (looksLikeDate(value)) hits += 1;
  }
  return present > 0 && hits / present >= 0.8;
}

function looksLikeDate(value: unknown): boolean {
  if (typeof value === "number") return value > 1e11 && value < 1e14;
  if (typeof value !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}(?:[T ][\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(value);
}

function isSorted(values: ArrayLike<unknown>, type: string): boolean {
  return firstUnsorted(values, type) === -1;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function firstUnsorted(values: ArrayLike<unknown>, type: string): number {
  let prev: number | undefined;
  for (let i = 0; i < values.length; i++) {
    const current = type === "temporal" ? timeValue(values[i]) : asNumber(values[i]);
    if (current === undefined) continue;
    if (prev !== undefined && current < prev) return i;
    prev = current;
  }
  return -1;
}

function timeValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function contrast(a: string, b: string): number | null {
  const left = hexToRgb(a);
  const right = hexToRgb(b);
  if (!left || !right) return null;
  const l1 = luminance(left);
  const l2 = luminance(right);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function nearestPassing(text: string, background: string): string {
  const start = hexToRgb(text) ?? [0, 0, 0];
  const bg = hexToRgb(background) ?? [255, 255, 255];
  const toward: [number, number, number] = luminance(bg) > 0.4 ? [0, 0, 0] : [255, 255, 255];
  for (let step = 0; step <= 20; step++) {
    const t = step / 20;
    const mixed: [number, number, number] = [
      Math.round(start[0] + (toward[0] - start[0]) * t),
      Math.round(start[1] + (toward[1] - start[1]) * t),
      Math.round(start[2] + (toward[2] - start[2]) * t),
    ];
    const hex = rgbToHex(mixed);
    const ratio = contrast(hex, background);
    if (ratio !== null && ratio >= 4.5) return hex;
  }
  return rgbToHex(toward);
}

function hexToRgb(value: string): [number, number, number] | null {
  const match = /^#([\da-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const n = Number.parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function luminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
