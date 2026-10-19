import type { DataTable } from "../../data";
import { column, fieldOf, readTable } from "../../frame";
import { isRecord } from "../../svg";

export function tableOf(spec: Record<string, unknown>): { table: DataTable; encoding: Record<string, unknown> } | null {
  const table = readTable(spec);
  if (!table) return null;
  return { table, encoding: isRecord(spec.encoding) ? spec.encoding : {} };
}

/** Encoding channel, or a column that is actually present. */
export function channel(encoding: Record<string, unknown>, key: string, fallback: string, fields: string[]): string | undefined {
  const named = fieldOf(encoding[key]);
  if (named) return named;
  return fields.includes(fallback) ? fallback : undefined;
}

export function cells(table: DataTable, field: string | undefined): unknown[] {
  return field ? column(table, field) : [];
}

export function textAt(value: unknown): string {
  if (value == null) return "";
  return typeof value === "string" ? value : String(value);
}

export function splitList(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function rowAt(spec: Record<string, unknown>, index: number): Record<string, unknown> | undefined {
  return Array.isArray(spec.data) && isRecord(spec.data[index]) ? spec.data[index] : undefined;
}

export function writeOp(row: Record<string, unknown> | undefined, field: string, path: string, value: unknown): { op: "add" | "replace"; path: string; value: unknown } {
  return { op: row && row[field] !== undefined ? "replace" : "add", path, value };
}
