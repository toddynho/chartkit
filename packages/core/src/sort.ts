import type { Column, DataTable } from "./data";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** First y field, used when sort says `by: "value"` or only sets `order`. */
export function valueField(spec: Record<string, unknown>): string {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const y = encoding?.y;
  if (typeof y === "string") return y;
  if (isRecord(y) && typeof y.field === "string") return y.field;
  if (Array.isArray(y) && y.length > 0) {
    const first = y[0];
    if (typeof first === "string") return first;
    if (isRecord(first) && typeof first.field === "string") return first.field;
  }
  return "";
}

export function sortField(spec: Record<string, unknown>): string {
  const sort = spec.sort;
  if (!isRecord(sort)) return "";
  if (typeof sort.field === "string" && sort.field.length > 0) return sort.field;
  if (sort.by === "value" || sort.order === "ascending" || sort.order === "descending" || sort.field === undefined) return valueField(spec);
  return "";
}

export function sortIssue(spec: Record<string, unknown>, table: DataTable): string | null {
  const sort = spec.sort;
  if (sort === undefined) return null;
  if (!isRecord(sort)) return "sort must be an object";
  const hasField = typeof sort.field === "string" && sort.field.length > 0;
  const byValue = sort.by === "value";
  const orderOnly = !hasField && !byValue && (sort.order === "ascending" || sort.order === "descending");
  if (!hasField && !byValue && !orderOnly) return 'sort needs field, by: "value", or order';
  if (sort.by !== undefined && sort.by !== "value") return 'sort.by must be "value"';
  if (sort.order !== undefined && sort.order !== "ascending" && sort.order !== "descending") return "sort.order must be ascending or descending";
  const field = sortField(spec);
  if (!field || !table.columns[field]) {
    return byValue || orderOnly ? "sort by value needs a y field" : `sort field ${JSON.stringify(sort.field)} is not in the data`;
  }
  return null;
}

function compare(a: unknown, b: unknown): number {
  const an = a === null || a === undefined || a === "";
  const bn = b === null || b === undefined || b === "";
  if (an || bn) return an === bn ? 0 : an ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  const as = typeof a === "number" ? a : Number(a);
  const bs = typeof b === "number" ? b : Number(b);
  if (typeof a !== "string" && typeof b !== "string" && Number.isFinite(as) && Number.isFinite(bs)) return as - bs;
  return String(a).localeCompare(String(b));
}

function reorder(column: Column, index: number[]): Column {
  const out = new Array<unknown>(index.length);
  for (let i = 0; i < index.length; i++) out[i] = column[index[i]];
  return out;
}

/** Stable reorder. The same table comes back when sort is omitted or cannot apply. */
export function applySort(table: DataTable, spec: Record<string, unknown>): DataTable {
  if (sortIssue(spec, table)) return table;
  const sort = spec.sort;
  if (!isRecord(sort)) return table;
  const field = sortField(spec);
  const column = table.columns[field];
  if (!column) return table;
  const dir = sort.order === "descending" ? -1 : 1;
  const index = new Array<number>(table.length);
  for (let i = 0; i < table.length; i++) index[i] = i;
  index.sort((a, b) => {
    const cmp = compare(column[a], column[b]);
    return cmp === 0 ? a - b : cmp * dir;
  });
  let moved = false;
  for (let i = 0; i < index.length; i++) if (index[i] !== i) moved = true;
  if (!moved) return table;
  const columns: Record<string, Column> = {};
  for (const name of table.fields) columns[name] = reorder(table.columns[name], index);
  return { kind: table.kind, fields: table.fields, length: table.length, columns };
}
