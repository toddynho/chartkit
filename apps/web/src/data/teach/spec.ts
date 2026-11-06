export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function editMark(spec: Record<string, unknown>, edit: (mark: Record<string, unknown>) => void): void {
  const current = spec.mark;
  const mark: Record<string, unknown> = isRecord(current) ? { ...current } : {};
  edit(mark);
  if (Object.keys(mark).length) spec.mark = mark;
  else delete spec.mark;
}

export function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}

export function roundStep(value: number, step: number): number {
  if (!Number.isFinite(value) || !(step > 0)) return value;
  const decimals = (step.toString().split(".")[1] ?? "").length;
  return Number((Math.round(value / step) * step).toFixed(decimals));
}

export function specText(spec: Record<string, unknown>): string {
  return JSON.stringify(spec, null, 2);
}

export function playgroundHref(spec: unknown): string {
  return `/playground#${encodeURIComponent(JSON.stringify(spec))}`;
}

/**
 * Load an example into the demo.
 * This copies the spec and does not run a control, so a custom tooltip object stays as the example wrote it.
 */
export function openTeachExample(spec: Record<string, unknown>): Record<string, unknown> {
  return structuredClone(spec);
}
