/** Concatenate streamed rows and optionally keep the last `window` of them. */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function trim<T>(rows: T[], window: number | undefined): T[] {
  if (typeof window !== "number" || !Number.isFinite(window)) return rows;
  const n = Math.max(0, Math.floor(window));
  if (n === 0) return [];
  return rows.length > n ? rows.slice(rows.length - n) : rows;
}

function columnsOf(data: unknown): Record<string, unknown[]> | null {
  if (!isRecord(data) || !isRecord(data.columns)) return null;
  const columns: Record<string, unknown[]> = {};
  for (const [name, value] of Object.entries(data.columns)) {
    columns[name] = Array.isArray(value) ? value.slice() : Array.from(value as ArrayLike<unknown>);
  }
  return columns;
}

interface FloatBuf {
  full: Float64Array;
  length: number;
}

const floatBufs = new WeakMap<object, FloatBuf>();

function floatView(full: Float64Array, length: number): Float64Array {
  const next = full.subarray(0, length);
  floatBufs.set(next, { full, length });
  return next;
}

function growFloat(column: Float64Array, add: number): Float64Array {
  const known = floatBufs.get(column);
  const full = known?.full ?? column;
  const length = known?.length ?? column.length;
  const need = length + add;
  if (full.length >= need) return floatView(full, need);
  const cap = Math.max(need, Math.max(8, full.length * 2));
  const next = new Float64Array(cap);
  next.set(full.subarray(0, length));
  return floatView(next, need);
}

function typedColumns(data: unknown, rows: unknown[], window?: number): { columns: Record<string, Float64Array>; sampling?: unknown } | null {
  if (!isRecord(data) || !isRecord(data.columns)) return null;
  const source = data.columns;
  const keys = Object.keys(source);
  if (keys.length === 0 || !keys.every((key) => source[key] instanceof Float64Array)) return null;
  const extra = rows.filter(isRecord);
  let grown: Record<string, Float64Array> = {};
  for (const key of keys) grown[key] = growFloat(source[key] as Float64Array, extra.length);
  const start = (floatBufs.get(grown[keys[0]])?.length ?? grown[keys[0]].length) - extra.length;
  for (let i = 0; i < extra.length; i++) {
    const row = extra[i];
    for (const key of keys) {
      const value = row[key];
      if (typeof value !== "number" || !Number.isFinite(value)) return null;
      grown[key][start + i] = value;
    }
  }
  if (typeof window === "number" && Number.isFinite(window)) {
    const n = Math.max(0, Math.floor(window));
    const trimmed: Record<string, Float64Array> = {};
    for (const key of keys) {
      const column = grown[key];
      const known = floatBufs.get(column);
      const length = known?.length ?? column.length;
      const from = Math.max(0, length - n);
      const full = known?.full ?? column;
      const next = new Float64Array(Math.max(n, 8));
      if (n > 0) next.set(full.subarray(from, length));
      trimmed[key] = floatView(next, Math.min(n, length - from));
    }
    grown = trimmed;
  }
  return data.sampling === undefined ? { columns: grown } : { columns: grown, sampling: data.sampling };
}

/**
 * Append `rows` onto array data or a `{ columns }` table.
 * `window` keeps that many trailing rows after the append.
 * Float64Array columns grow by doubling so a one-point append does not copy the whole series every time.
 */
export function joinRows(data: unknown, rows: unknown[], window?: number): unknown {
  const extra = Array.isArray(rows) ? rows : [];
  const typed = typedColumns(data, extra, window);
  if (typed) return typed;
  const columns = columnsOf(data);
  if (columns) {
    let length = 0;
    for (const key of Object.keys(columns)) length = columns[key].length;
    for (let i = 0; i < extra.length; i++) {
      const row = extra[i];
      if (!isRecord(row)) continue;
      for (const key of Object.keys(row)) {
        if (!columns[key]) columns[key] = new Array(length);
      }
      for (const key of Object.keys(columns)) columns[key].push(row[key]);
      length += 1;
    }
    if (typeof window === "number" && Number.isFinite(window)) {
      const n = Math.max(0, Math.floor(window));
      for (const key of Object.keys(columns)) columns[key] = n === 0 ? [] : columns[key].slice(-n);
    }
    return isRecord(data) && data.sampling !== undefined ? { columns, sampling: data.sampling } : { columns };
  }
  const base = Array.isArray(data) ? data : [];
  return trim(base.concat(extra), window);
}
