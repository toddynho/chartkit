import type { Column, DataTable } from "./data";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface TransformIssue {
  index: number;
  message: string;
}

function columnOf(table: DataTable, field: unknown): Column | null {
  return typeof field === "string" && field.length > 0 ? table.columns[field] ?? null : null;
}

function hasTest(step: Record<string, unknown>): boolean {
  return "eq" in step || typeof step.gt === "number" || typeof step.gte === "number" || typeof step.lt === "number" || typeof step.lte === "number";
}

function issueOf(step: unknown, table: DataTable): string | null {
  if (!isRecord(step)) return "transform step must be an object";
  if (step.type === "filter") {
    if (!columnOf(table, step.field)) return "filter needs a field that is in the data";
    if (!hasTest(step)) return "filter needs eq, gt, gte, lt, or lte";
    return null;
  }
  if (step.type === "window") {
    if (!columnOf(table, step.field)) return "window needs a field that is in the data";
    if (typeof step.size !== "number" || !Number.isInteger(step.size) || step.size < 1) return "window size must be an integer of at least 1";
    if (typeof step.as !== "string" || step.as.length === 0) return "window needs as, the output field";
    if (step.op !== undefined && step.op !== "mean" && step.op !== "sum" && step.op !== "count") return 'window op must be "mean", "sum", or "count"';
    return null;
  }
  if (step.type === "aggregate") {
    if (!columnOf(table, step.group)) return "aggregate needs a group field that is in the data";
    if (step.op !== "sum" && step.op !== "mean" && step.op !== "count") return 'aggregate op must be "sum", "mean", or "count"';
    if (step.op !== "count" && !columnOf(table, step.field)) return "aggregate needs a field that is in the data";
    if (step.as !== undefined && typeof step.as !== "string") return "aggregate as must be a field name";
    return null;
  }
  return 'transform type must be "filter", "window", or "aggregate"';
}

export function transformIssues(steps: unknown, table: DataTable): TransformIssue[] {
  if (steps === undefined) return [];
  if (!Array.isArray(steps)) return [{ index: -1, message: "transform must be an array" }];
  const out: TransformIssue[] = [];
  for (let i = 0; i < steps.length; i++) {
    const message = issueOf(steps[i], table);
    if (message) out.push({ index: i, message });
  }
  return out;
}

function pick(table: DataTable, index: number[]): DataTable {
  const columns: Record<string, Column> = {};
  for (const field of table.fields) {
    const src = table.columns[field];
    const col = new Array<unknown>(index.length);
    for (let i = 0; i < index.length; i++) col[i] = src[index[i]];
    columns[field] = col;
  }
  return { kind: "rows", fields: table.fields.slice(), length: index.length, columns };
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function pass(value: unknown, step: Record<string, unknown>): boolean {
  if ("eq" in step && value !== step.eq) return false;
  if (typeof step.gt !== "number" && typeof step.gte !== "number" && typeof step.lt !== "number" && typeof step.lte !== "number") return true;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return false;
  if (typeof step.gt === "number" && !(n > step.gt)) return false;
  if (typeof step.gte === "number" && !(n >= step.gte)) return false;
  if (typeof step.lt === "number" && !(n < step.lt)) return false;
  return typeof step.lte !== "number" || n <= step.lte;
}

function applyOne(table: DataTable, step: Record<string, unknown>): DataTable {
  if (step.type === "filter") {
    const column = table.columns[step.field as string];
    const index: number[] = [];
    for (let i = 0; i < table.length; i++) if (pass(column[i], step)) index.push(i);
    return index.length === table.length ? table : pick(table, index);
  }
  if (step.type === "window") {
    const src = table.columns[step.field as string];
    const size = step.size as number;
    const op = step.op === "sum" || step.op === "count" ? step.op : "mean";
    const out = new Array<number | null>(table.length);
    let sum = 0;
    let count = 0;
    for (let i = 0; i < table.length; i++) {
      const value = num(src[i]);
      if (value !== null) sum += value, count += 1;
      if (i >= size) {
        const old = num(src[i - size]);
        if (old !== null) sum -= old, count -= 1;
      }
      const full = i + 1 >= size;
      out[i] = !full || (op !== "count" && count < size) ? null : op === "count" ? count : op === "sum" ? sum : count ? sum / count : null;
    }
    const fields = table.fields.includes(step.as as string) ? table.fields.slice() : table.fields.concat(step.as as string);
    return { kind: "rows", fields, length: table.length, columns: { ...table.columns, [step.as as string]: out } };
  }
  const group = step.group as string;
  const op = step.op as string;
  const field = typeof step.field === "string" ? step.field : "";
  const as = typeof step.as === "string" && step.as.length > 0 ? step.as : op === "count" ? "count" : field;
  const keys = table.columns[group];
  const values = field ? table.columns[field] : null;
  const order: string[] = [];
  const bins = new Map<string, { key: unknown; sum: number; count: number; rows: number }>();
  for (let i = 0; i < table.length; i++) {
    const key = keys[i];
    const id = key == null ? "" : String(key);
    let bin = bins.get(id);
    if (!bin) {
      bin = { key, sum: 0, count: 0, rows: 0 };
      bins.set(id, bin);
      order.push(id);
    }
    bin.rows += 1;
    const value = values ? num(values[i]) : null;
    if (value !== null) bin.sum += value, bin.count += 1;
  }
  const labels = new Array<unknown>(order.length);
  const totals = new Array<number | null>(order.length);
  for (let i = 0; i < order.length; i++) {
    const bin = bins.get(order[i])!;
    labels[i] = bin.key;
    totals[i] = op === "count" ? bin.rows : op === "sum" ? bin.sum : bin.count ? bin.sum / bin.count : null;
  }
  const fields = group === as ? [group] : [group, as];
  return { kind: "rows", fields, length: order.length, columns: { [group]: labels, [as]: totals } };
}

/** Apply valid steps in order. Invalid steps are left for the validator. */
export function applyTransforms(table: DataTable, steps: unknown): DataTable {
  if (!Array.isArray(steps) || steps.length === 0) return table;
  let current = table;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!issueOf(step, current)) current = applyOne(current, step as Record<string, unknown>);
  }
  return current;
}
