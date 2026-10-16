export interface DataTable {
  kind: "rows" | "numbers" | "columns";
  fields: string[];
  length: number;
  columns: Record<string, unknown[]>;
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

function toValues(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (isTypedArray(value)) return Array.from(value as ArrayLike<number>);
  return null;
}

export function readData(data: unknown): ReadResult {
  if (Array.isArray(data) || isTypedArray(data)) {
    const list = toValues(data);
    if (!list) return { ok: false, reason: "invalid" };
    if (list.length === 0) return { ok: false, reason: "empty" };
    const allScalarNumbers = list.every((item) => item === null || typeof item === "number");
    const allObjects = list.every((item) => isPlainObject(item));
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
    const fields: string[] = [];
    const seen = new Set<string>();
    for (const row of list) {
      for (const key of Object.keys(row as Record<string, unknown>)) {
        if (!seen.has(key)) {
          seen.add(key);
          fields.push(key);
        }
      }
    }
    const columns: Record<string, unknown[]> = {};
    for (const field of fields) {
      columns[field] = list.map((row) => (row as Record<string, unknown>)[field]);
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
    const columns: Record<string, unknown[]> = {};
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
