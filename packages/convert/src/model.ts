import { repair, validate } from "@chartkitdev/core/validate";

export type Source = "chartjs" | "recharts" | "echarts";

export interface ConvertWarning {
  code: string;
  severity: "warning";
  message: string;
  path: string;
}

export interface ConvertResult {
  source: Source | null;
  spec: Record<string, unknown> | null;
  warnings: ConvertWarning[];
  /** What this conversion mapped, in source terms. */
  mapped: string[];
}

export function warn(code: string, message: string, path: string): ConvertWarning {
  return { code, severity: "warning", message, path };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A function, gradient, or other value the literal parser could not keep. */
export function isDropped(value: unknown): value is { __dropped: true; reason: string } {
  return isRecord(value) && value.__dropped === true && typeof value.reason === "string";
}

export function dropped(reason: string): { __dropped: true; reason: string } {
  return { __dropped: true, reason };
}

export class Used {
  private readonly exact = new Set<string>();

  mark(path: string): void {
    this.exact.add(path);
  }

  /** Warn once for each key that no mapper read. Children of an unread key are not listed again. */
  unread(value: unknown, path: string, warnings: ConvertWarning[]): void {
    if (Array.isArray(value)) {
      if (!this.exact.has(path) && !this.hasChild(path)) return;
      value.forEach((item, index) => this.unread(item, `${path}/${index}`, warnings));
      return;
    }
    if (!isRecord(value)) return;
    for (const key of Object.keys(value)) {
      const next = `${path}/${key}`;
      if (this.exact.has(next) || this.hasChild(next)) {
        this.unread(value[key], next, warnings);
        continue;
      }
      warnings.push(warn("CK8100", `Not mapped: ${key}.`, next));
    }
  }

  private hasChild(path: string): boolean {
    const prefix = `${path}/`;
    for (const item of this.exact) {
      if (item.startsWith(prefix)) return true;
    }
    return false;
  }
}

export function slug(label: string, index: number): string {
  const cleaned = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const base = cleaned && !/^[0-9]/.test(cleaned) ? cleaned : `series_${index + 1}`;
  return base === "cat" ? `series_${index + 1}` : base;
}

export function uniqueSlug(label: string, index: number, taken: Set<string>): string {
  let name = slug(label, index);
  if (!taken.has(name)) {
    taken.add(name);
    return name;
  }
  let n = 2;
  while (taken.has(`${name}_${n}`)) n += 1;
  name = `${name}_${n}`;
  taken.add(name);
  return name;
}

export function colorOf(value: unknown, warnings: ConvertWarning[], path: string): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string");
    if (typeof first === "string") {
      warnings.push(warn("CK8104", "Per-point colours are not a series colour. The first colour is kept.", path));
      return first;
    }
  }
  if (isDropped(value)) {
    warnings.push(warn("CK8102", `Dropped a ${value.reason} colour.`, path));
  }
  return undefined;
}

export function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

export function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

/** Chart.js stack, Recharts stackId, and ECharts stack. A number is a group name too. */
export function stackName(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return text(value);
}

export function altText(title: string | undefined, sentence: string): string {
  const body = title ? `${title}. ${sentence}` : sentence;
  return body.length >= 10 ? body : `${body} Values are plotted.`;
}

export function finish(
  spec: Record<string, unknown> | null,
  warnings: ConvertWarning[],
  source: Source | null,
  mapped: string[],
): ConvertResult {
  if (!spec) return { source, spec: null, warnings, mapped };
  let current = spec;
  const checked = validate(current);
  if (!checked.ok) {
    const fixed = repair(current);
    current = isRecord(fixed.spec) ? fixed.spec : current;
    if (fixed.applied.length) {
      warnings.push(
        warn("CK8106", `repair() applied ${fixed.applied.length} patch${fixed.applied.length === 1 ? "" : "es"}.`, ""),
      );
    }
    for (const item of fixed.errors) {
      warnings.push(warn("CK8105", `${item.code}: ${item.message}`, item.path || ""));
    }
  }
  return { source, spec: current, warnings, mapped };
}
