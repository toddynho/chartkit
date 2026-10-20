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

/**
 * Append `rows` onto array data or a `{ columns }` table.
 * `window` keeps that many trailing rows after the append.
 */
export function joinRows(data: unknown, rows: unknown[], window?: number): unknown {
  const extra = Array.isArray(rows) ? rows : [];
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
    return { columns };
  }
  const base = Array.isArray(data) ? data : [];
  return trim(base.concat(extra), window);
}
