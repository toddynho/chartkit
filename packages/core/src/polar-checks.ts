import type { Diagnostic } from "./diagnostics";

/**
 * Polar, radial bar, and rose. CK3073–CK3080.
 * CK3073 negative radius. CK3074 fewer than three categories.
 * CK3075 hole above 0.85. CK3076 gap above 8 degrees.
 * CK3077 coordinate polar on another type. CK3078 cartesian on a polar chart.
 * CK3079 more than 16 categories. CK3080 radius domain excludes 0.
 */

const POLAR = new Set(["radial-bar", "rose"]);

export function polarChecks(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const type = typeof spec.type === "string" ? spec.type : "";
  coordinateIssue(spec, type, diagnostics);
  if (!POLAR.has(type)) return;
  holeIssue(spec, diagnostics);
  gapIssue(spec, diagnostics);
  const rows = readRows(spec);
  if (!rows) return;
  const categories = new Set<string>();
  for (const row of rows) {
    const label = categoryOf(spec, row);
    if (label) categories.add(label);
    for (const cell of radiiOf(spec, row)) {
      if (cell.value >= 0) continue;
      const item: Diagnostic = {
        code: "CK3073",
        severity: "error",
        message: "polar radius cannot be negative",
        path: cell.path,
        hint: "a radius starts at zero; the patch sets this value to 0",
        fix: [{ op: "replace", path: cell.path, value: 0 }],
      };
      diagnostics.push(item);
      diagnostics.push({ ...item, severity: "warning", fix: undefined });
    }
  }
  if (categories.size > 0 && categories.size < 3) {
    diagnostics.push({
      code: "CK3074",
      severity: "warning",
      message: "polar charts need at least 3 categories",
      path: "/data",
      hint: "add categories, or use a bar chart for two",
    });
  }
  if (categories.size > 16) {
    diagnostics.push({
      code: "CK3079",
      severity: "warning",
      message: "polar labels crowd past 16 categories",
      path: "/data",
      hint: "a bar chart keeps the labels readable",
    });
  }
  domainIssue(spec, diagnostics);
}

function coordinateIssue(spec: Record<string, unknown>, type: string, diagnostics: Diagnostic[]): void {
  const layout = record(spec.layout);
  if (!layout || (layout.coordinate !== "polar" && layout.coordinate !== "cartesian")) return;
  if (layout.coordinate === "polar" && !POLAR.has(type)) {
    const next = type === "pie" || type === "donut" ? "rose" : type === "bar" ? "radial-bar" : "";
    const fix = next
      ? [{ op: "replace" as const, path: "/type", value: next }]
      : [{ op: "remove" as const, path: "/layout/coordinate" }];
    const item: Diagnostic = {
      code: "CK3077",
      severity: "error",
      message: "layout.coordinate polar draws on radial-bar or rose",
      path: "/layout/coordinate",
      hint: next ? `the patch sets type to ${next}` : "remove layout.coordinate, or set type to radial-bar or rose",
      fix,
    };
    diagnostics.push(item);
    diagnostics.push({ ...item, severity: "warning", fix: undefined });
    return;
  }
  if (layout.coordinate === "cartesian" && POLAR.has(type)) {
    const item: Diagnostic = {
      code: "CK3078",
      severity: "error",
      message: "radial-bar and rose always use polar coordinates",
      path: "/layout/coordinate",
      hint: 'the patch sets layout.coordinate to "polar"',
      fix: [{ op: "replace", path: "/layout/coordinate", value: "polar" }],
    };
    diagnostics.push(item);
    diagnostics.push({ ...item, severity: "warning", fix: undefined });
  }
}

function holeIssue(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const mark = record(spec.mark);
  const hole = mark?.innerRadius;
  if (typeof hole !== "number" || !(hole > 0.85)) return;
  const item: Diagnostic = {
    code: "CK3075",
    severity: "error",
    message: "polar hole is larger than 0.85 of the radius",
    path: "/mark/innerRadius",
    hint: "the patch clamps the hole to 0.85",
    fix: [{ op: "replace", path: "/mark/innerRadius", value: 0.85 }],
  };
  diagnostics.push(item);
  diagnostics.push({ ...item, severity: "warning", fix: undefined });
}

function gapIssue(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const mark = record(spec.mark);
  const gap = mark?.padAngle;
  if (typeof gap !== "number" || !(gap > 8)) return;
  const item: Diagnostic = {
    code: "CK3076",
    severity: "error",
    message: "polar gap is wider than 8 degrees",
    path: "/mark/padAngle",
    hint: "the patch clamps the gap to 8 degrees",
    fix: [{ op: "replace", path: "/mark/padAngle", value: 8 }],
  };
  diagnostics.push(item);
  diagnostics.push({ ...item, severity: "warning", fix: undefined });
}

function domainIssue(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const encoding = record(spec.encoding);
  if (!encoding) return;
  const y = encoding.y;
  const list = Array.isArray(y) ? y : [y];
  list.forEach((item, index) => {
    if (!record(item) || !record(item.scale) || !Array.isArray(item.scale.domain)) return;
    const min = item.scale.domain[0];
    if (typeof min !== "number" || !(min > 0)) return;
    const path = Array.isArray(y) ? `/encoding/y/${index}/scale/domain/0` : "/encoding/y/scale/domain/0";
    const issue: Diagnostic = {
      code: "CK3080",
      severity: "error",
      message: "polar radius domain should include 0",
      path,
      hint: "the patch sets the domain minimum to 0",
      fix: [{ op: "replace", path, value: 0 }],
    };
    diagnostics.push(issue);
    diagnostics.push({ ...issue, severity: "warning", fix: undefined });
  });
}

interface Cell {
  path: string;
  value: number;
}

function readRows(spec: Record<string, unknown>): Record<string, unknown>[] | null {
  if (!Array.isArray(spec.data)) return null;
  return spec.data.filter(record);
}

function categoryOf(spec: Record<string, unknown>, row: Record<string, unknown>): string {
  const encoding = record(spec.encoding);
  const field = fieldName(encoding?.x) ?? "x";
  const value = row[field];
  return value == null ? "" : String(value);
}

function radiiOf(spec: Record<string, unknown>, row: Record<string, unknown>): Cell[] {
  const encoding = record(spec.encoding);
  const y = encoding?.y;
  const fields = Array.isArray(y) ? y.map(fieldName) : [fieldName(y)];
  const rowIndex = Array.isArray(spec.data) ? spec.data.indexOf(row) : -1;
  if (rowIndex < 0) return [];
  const out: Cell[] = [];
  for (const field of fields) {
    if (!field) continue;
    const value = row[field];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    out.push({ path: `/data/${rowIndex}/${escapePointer(field)}`, value });
  }
  return out;
}

function fieldName(channel: unknown): string | undefined {
  if (typeof channel === "string" && channel) return channel;
  if (record(channel) && typeof channel.field === "string" && channel.field) return channel.field;
  return undefined;
}

function escapePointer(value: string): string {
  return value.replace(/~/g, "~0").replace(/\//g, "~1");
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}
