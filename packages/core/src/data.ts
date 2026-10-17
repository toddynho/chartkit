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
    const fields: string[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          fields.push(key);
        }
      }
    }
    const columns: Record<string, Column> = {};
    for (const field of fields) {
      const column = new Array<unknown>(rows.length);
      for (let i = 0; i < rows.length; i++) column[i] = rows[i][field];
      columns[field] = column;
    }
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

function everyItem(list: Column, test: (item: unknown) => boolean): boolean {
  for (let i = 0; i < list.length; i++) if (!test(list[i])) return false;
  return true;
}
