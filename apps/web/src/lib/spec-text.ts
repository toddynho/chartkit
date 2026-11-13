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

/** A grep probe is not an option name. Show the token, not the raw pattern. */
export function readableOption(option: string): string {
  const raw = option.trim();
  if (!raw || raw === "—") return "—";
  if (!raw.startsWith("~") && !raw.includes("\\") && !raw.includes("|")) return raw;
  const token = raw.replace(/^~/, "").split("|")[0]?.replace(/[^\w./-]/g, "") ?? "";
  return token ? `grep: ${token}` : "grep only";
}

const CHECK_NAMES: Record<string, string> = {
  "dts-path": "types",
  "dts-grep": "grep",
  "dts-absence": "absence",
  "dts-mechanism": "mechanism",
  "dts-index": "index",
  "schema-path": "schema",
  "runtime-probe": "runtime",
  "source-review": "source",
  "pkg-license": "license",
  "doc-cited": "docs",
  npm: "npm",
  conflict: "conflict",
  unverified: "unverified",
};

/** Verification codes stay in the data. The page shows a short name. */
export function readableCheck(verified: string, strength: string): string {
  const name = CHECK_NAMES[verified] ?? verified;
  const weight = strength === "strong" || strength === "weak" || strength === "absence" || strength === "unknown" ? strength : strength;
  return `${name} · ${weight}`;
}

/** Same trimming as `optionText` in catalog/lib/matrix.ts. */
export function optionText(cell: { apiPaths?: string[] } | undefined): string {
  const paths = cell?.apiPaths ?? [];
  const concrete = paths.filter((path) => !path.startsWith("~") && !path.includes("|") && !path.includes("\\"));
  if (concrete.length) return concrete.slice(0, 2).join(", ");
  return readableOption(paths[0] ?? "");
}
