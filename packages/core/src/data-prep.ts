import { readData, type ReadResult } from "./data";
import { applySort } from "./sort";
import { applyTransforms } from "./transform";

/** Read rows, then transform, then sort. Charts share this so every entry paints the same table. */
export function loadTable(spec: Record<string, unknown>): ReadResult {
  const read = readData(spec.data);
  if (!read.ok) return read;
  const transformed = spec.transform === undefined ? read.table : applyTransforms(read.table, spec.transform);
  const sorted = spec.sort === undefined ? transformed : applySort(transformed, spec);
  if (sorted.length === 0) return { ok: false, reason: "empty" };
  return { ok: true, table: sorted };
}
