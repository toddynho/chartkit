export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function fieldName(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (isRecord(value) && typeof value.field === "string" && value.field) return value.field;
  return null;
}

/** Top-level atlas is mark.atlas. A spec that only sets atlas still selects that atlas. */
export function resolveMark(spec: Record<string, unknown>): Record<string, unknown> {
  const mark = isRecord(spec.mark) ? { ...spec.mark } : {};
  if (typeof mark.atlas !== "string" && typeof spec.atlas === "string") mark.atlas = spec.atlas;
  return mark;
}

/** location is region. lat and lon are latitude and longitude. */
export function resolveEncoding(spec: Record<string, unknown>): Record<string, unknown> {
  const encoding = isRecord(spec.encoding) ? { ...spec.encoding } : {};
  if (encoding.region == null && encoding.location != null) encoding.region = encoding.location;
  if (encoding.latitude == null && encoding.lat != null) encoding.latitude = encoding.lat;
  if (encoding.longitude == null && encoding.lon != null) encoding.longitude = encoding.lon;
  return encoding;
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
