export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function fieldName(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (isRecord(value) && typeof value.field === "string" && value.field) return value.field;
  return null;
}

export function rowsOf(spec: Record<string, unknown>): Record<string, unknown>[] {
  return Array.isArray(spec.data) ? spec.data.filter(isRecord) : [];
}

export function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

export function sizeOf(spec: Record<string, unknown>): { width: number; height: number } {
  const size = isRecord(spec.size) ? spec.size : {};
  const width = num(size.width) ?? num(spec.width) ?? 640;
  const height = num(size.height) ?? num(spec.height) ?? 400;
  return { width: Math.max(120, width), height: Math.max(80, height) };
}

export function pointer(parts: (string | number)[]): string {
  return `/${parts.map((part) => String(part).replace(/~/g, "~0").replace(/\//g, "~1")).join("/")}`;
}

export function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function round(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}
