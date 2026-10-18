/** A plain array or a typed array. Typed columns stay in place; callers must not use `.map`. */
export type Column = ArrayLike<unknown> & Iterable<unknown>;

export interface DataTable {
  kind: "rows" | "numbers" | "columns";
  fields: string[];
  length: number;
  columns: Record<string, Column>;
}

export type ReadResult =
  | { ok: true; table: DataTable }
  | { ok: false; reason: "empty" }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "mismatch"; a: string; an: number; b: string; bn: number };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !isTypedArray(value);
}

export function isTypedArray(value: unknown): value is ArrayLike<number> {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

function toValues(value: unknown): Column | null {
  if (Array.isArray(value) || isTypedArray(value)) return value as Column;
  return null;
}

export function readData(data: unknown): ReadResult {
  if (Array.isArray(data) || isTypedArray(data)) {
    const list = toValues(data);
    if (!list) return { ok: false, reason: "invalid" };
    if (list.length === 0) return { ok: false, reason: "empty" };
    const allScalarNumbers = everyItem(list, (item) => item === null || typeof item === "number");
    const allObjects = everyItem(list, (item) => isPlainObject(item));
    if (allScalarNumbers && !allObjects) {
      return {
        ok: true,
        table: {
          kind: "numbers",
          fields: ["value"],
          length: list.length,
          columns: { value: list },
        },
      };
    }
    if (!allObjects) return { ok: false, reason: "invalid" };
    const rows = list as Record<string, unknown>[];
    const fast = uniformColumns(rows);
    const fields = fast ? fast.fields : collectFields(rows);
    const columns = fast ? fast.columns : columnsFrom(rows, fields);
    return {
      ok: true,
      table: { kind: "rows", fields, length: list.length, columns },
    };
  }

  if (isPlainObject(data) && isPlainObject(data.columns)) {
    const entries = Object.entries(data.columns);
    if (entries.length === 0) return { ok: false, reason: "invalid" };
    let length: number | null = null;
    let a = "";
    const columns: Record<string, Column> = {};
    for (const [name, raw] of entries) {
      const values = toValues(raw);
      if (!values) return { ok: false, reason: "invalid" };
      if (length === null) {
        length = values.length;
        a = name;
      } else if (values.length !== length) {
        return {
          ok: false,
          reason: "mismatch",
          a,
          an: length,
          b: name,
          bn: values.length,
        };
      }
      columns[name] = values;
    }
    if (length === 0) return { ok: false, reason: "empty" };
    return {
      ok: true,
      table: {
        kind: "columns",
        fields: entries.map(([name]) => name),
        length: length ?? 0,
        columns,
      },
    };
  }

  return { ok: false, reason: "invalid" };
}

/**
 * One pass when every row has the first row's keys.
 * Numeric columns are written straight into a Float64Array.
 * A later row with a different key falls back to the general copier.
 */
function uniformColumns(rows: Record<string, unknown>[]): { fields: string[]; columns: Record<string, Column> } | null {
  const n = rows.length;
  if (n === 0) return null;
  const fields = Object.keys(rows[0]);
  const width = fields.length;
  if (width === 0) return null;
  const numeric = new Array<boolean>(width).fill(true);
  const cols: (Float64Array | unknown[])[] = new Array(width);
  for (let k = 0; k < width; k++) cols[k] = new Float64Array(n);
  const known = new Set(fields);
  for (let i = 0; i < n; i++) {
    const row = rows[i];
    let count = 0;
    for (const key in row) {
      count += 1;
      if (!known.has(key)) return null;
    }
    if (count !== width) return null;
    for (let k = 0; k < width; k++) {
      const value = row[fields[k]];
      if (numeric[k]) {
        if (typeof value === "number" && Number.isFinite(value)) {
          (cols[k] as Float64Array)[i] = value;
          continue;
        }
        numeric[k] = false;
        const arr = new Array<unknown>(n);
        const prev = cols[k] as Float64Array;
        for (let j = 0; j < i; j++) arr[j] = prev[j];
        arr[i] = value;
        cols[k] = arr;
      } else (cols[k] as unknown[])[i] = value;
    }
  }
  const columns: Record<string, Column> = {};
  for (let k = 0; k < width; k++) columns[fields[k]] = cols[k] as Column;
  return { fields, columns };
}

function collectFields(rows: Record<string, unknown>[]): string[] {
  const fields: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    const keys = Object.keys(rows[i]);
    for (let k = 0; k < keys.length; k++) {
      if (!seen.has(keys[k])) {
        seen.add(keys[k]);
        fields.push(keys[k]);
      }
    }
  }
  return fields;
}

function columnsFrom(rows: Record<string, unknown>[], fields: string[]): Record<string, Column> {
  const columns: Record<string, Column> = {};
  for (let k = 0; k < fields.length; k++) {
    const field = fields[k];
    const column = new Array<unknown>(rows.length);
    for (let i = 0; i < rows.length; i++) column[i] = rows[i][field];
    columns[field] = column;
  }
  return columns;
}

function everyItem(list: Column, test: (item: unknown) => boolean): boolean {
  for (let i = 0; i < list.length; i++) if (!test(list[i])) return false;
  return true;
}
