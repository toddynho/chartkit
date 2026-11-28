import type { Diagnostic, JsonPatchOperation } from "../diagnostics";
import { readData, type DataTable } from "../data";
import { nearMatches } from "../walker";
import { utcTime } from "../timezone";

export interface Channel {
  field?: string;
  type?: string;
  scaleType?: string;
  axis?: "y" | "y2";
  /** JSON pointer of the channel value. */
  path: string;
  /** JSON pointer of the field itself (the string, or /field). */
  fieldPath: string;
}

export function flagged(diagnostics: Diagnostic[], item: Diagnostic): void {
  diagnostics.push(item);
  diagnostics.push({ ...item, severity: "warning", fix: undefined });
}

export function pointerToken(value: string): string {
  return value.replace(/~/g, "~0").replace(/\//g, "~1");
}

export function knownFields(table: DataTable | undefined): Set<string> {
  if (!table) return new Set();
  if (table.fields.length) return new Set(table.fields);
  return new Set(Object.keys(table.columns));
}

export function flag(diagnostics: Diagnostic[], path: string, why: string): void {
  const name = path.slice(1).split("/").join(".");
  diagnostics.push({
    code: "CK3012",
    severity: "warning",
    message: `${name} is ${why}`,
    path,
    hint: "kept",
  });
}

export function at(root: unknown, path: string): unknown {
  let cur = root;
  for (const key of path.split("/")) {
    if (!isRecord(cur)) return;
    cur = cur[key];
  }
  return cur;
}

export function fieldName(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.field === "string") return value.field;
  return undefined;
}

export function columnStrings(table: DataTable | undefined, field: string | undefined): Set<string> {
  const seen = new Set<string>();
  if (!table || !field) return seen;
  const column = table.columns[field];
  if (!column) return seen;
  for (let i = 0; i < column.length; i++) if (column[i] != null && String(column[i]) !== "") seen.add(String(column[i]));
  return seen;
}

export function plottedNumbers(spec: Record<string, unknown>, table: DataTable | undefined): number[] {
  if (!table) return [];
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const fields: string[] = [];
  const y = encoding.y;
  if (Array.isArray(y)) {
    for (const item of y) {
      const name = fieldName(item);
      if (name) fields.push(name);
    }
  } else {
    const name = fieldName(y);
    if (name) fields.push(name);
  }
  const numbers: number[] = [];
  for (const field of fields) {
    const column = table.columns[field];
    if (!column) continue;
    for (let i = 0; i < column.length; i++) if (typeof column[i] === "number" && Number.isFinite(column[i])) numbers.push(column[i] as number);
  }
  return numbers;
}

export function boundChannels(y: unknown): Channel[] {
  const items = Array.isArray(y) ? y : isRecord(y) ? [y] : [];
  const out: Channel[] = [];
  items.forEach((item, index) => {
    if (!isRecord(item)) return;
    const base = Array.isArray(y) ? `/encoding/y/${index}` : "/encoding/y";
    for (const key of ["lo", "hi", "error"] as const) {
      if (typeof item[key] !== "string") continue;
      out.push({ field: item[key], path: `${base}/${key}`, fieldPath: `${base}/${key}` });
    }
  });
  return out;
}

export function readY(y: unknown): Channel[] {
  if (Array.isArray(y)) {
    return y
      .map((item, index) => readChannel(item, `/encoding/y/${index}`))
      .filter((channel): channel is Channel => channel !== undefined && Boolean(channel.field));
  }
  const channel = readChannel(y, "/encoding/y");
  return channel?.field ? [channel] : [];
}

export function readChannel(value: unknown, path: string): Channel | undefined {
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

export function resolveField(name: string, fields: string[]): { match?: string; caseMatch?: string; suggestions: string[] } {
  if (fields.includes(name)) return { match: name, suggestions: [] };
  const lower = name.toLowerCase();
  const caseMatch = fields.find((field) => field.toLowerCase() === lower);
  const suggestions = caseMatch ? [] : nearMatches(name, fields, name.length <= 4 ? 1 : 3);
  return { caseMatch, suggestions };
}

export function temporalFix(x: unknown): JsonPatchOperation[] {
  if (typeof x === "string") {
    return [{ op: "replace", path: "/encoding/x", value: { field: x, type: "temporal" } }];
  }
  if (isRecord(x)) {
    return [{ op: x.type === undefined ? "add" : "replace", path: "/encoding/x/type", value: "temporal" }];
  }
  return [{ op: "add", path: "/encoding/x/type", value: "temporal" }];
}

const QUOTED_NUMBER = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/;

export function quotedNumber(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!QUOTED_NUMBER.test(text)) return undefined;
  const number = Number(text);
  return Number.isFinite(number) ? number : undefined;
}

export function cellPointer(table: DataTable, field: string, index: number): string {
  if (table.kind === "numbers") return `/data/${index}`;
  if (table.kind === "columns") return `/data/columns/${field}/${index}`;
  return `/data/${index}/${field}`;
}

export function inferType(values: ArrayLike<unknown>): "quantitative" | "temporal" | "nominal" {
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

export function hasMixedNumbers(values: ArrayLike<unknown>): boolean {
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

export function columnLooksLikeDates(values: ArrayLike<unknown>): boolean {
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

export function isSorted(values: ArrayLike<unknown>, type: string): boolean {
  return firstUnsorted(values, type) === -1;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function firstUnsorted(values: ArrayLike<unknown>, type: string): number {
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
    const parsed = utcTime(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function xLooksDated(spec: Record<string, unknown>): boolean {
  const read = readData(spec.data);
  if (!read.ok) return false;
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const x = encoding?.x;
  const field = typeof x === "string" ? x : isRecord(x) && typeof x.field === "string" ? x.field : "";
  const values = field ? read.table.columns[field] : undefined;
  if (!values || values.length === 0) return false;
  let seen = 0;
  let dated = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined || value === "") continue;
    seen += 1;
    if (typeof value === "number" && value > 1e11) dated += 1;
    else if (typeof value === "string" && /\d{4}/.test(value) && Number.isFinite(Date.parse(value))) dated += 1;
  }
  return seen > 0 && dated === seen;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
