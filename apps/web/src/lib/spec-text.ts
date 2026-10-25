/** Theme and JSON helpers shared by showcase, the playground, and examples. */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Next's showcase stage always writes `theme` onto the spec the radios show. */
export function forceTheme(spec: unknown, theme: string): Record<string, unknown> {
  if (!isRecord(spec)) return { theme };
  return { ...spec, theme };
}

/** Playground select: "site" removes theme so the page CSS variables show through. */
export function applyTheme(spec: unknown, themeName: string): unknown {
  if (!isRecord(spec)) return spec;
  const next = { ...spec };
  if (themeName === "site") delete next.theme;
  else next.theme = themeName;
  return next;
}

export function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/** Safe to drop inside `<script type="application/json">`. */
export function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Same trimming as `optionText` in catalog/lib/matrix.ts. */
export function optionText(cell: { apiPaths?: string[] } | undefined): string {
  const paths = cell?.apiPaths ?? [];
  const concrete = paths.filter((path) => !path.startsWith("~"));
  const shown = (concrete.length ? concrete : paths).slice(0, 2);
  return shown.length ? shown.join(", ") : "—";
}
