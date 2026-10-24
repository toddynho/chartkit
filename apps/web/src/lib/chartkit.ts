import type { ValidationResult } from "@chartkitdev/core";
import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { validate } from "@chartkitdev/core/validate";
import { validatePhase4 } from "@chartkitdev/core/validate/phase4";

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

export type RailIssue = {
  code: string;
  path: string;
  message: string;
  severity: string;
};

export type RailResult = {
  ok: boolean;
  svg: string;
  status: "200" | "400";
  title: string;
  badge: string;
  footer: string;
  theme: string;
  issues: RailIssue[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function themeName(spec: unknown): string {
  if (!isRecord(spec)) return "soft";
  const theme = spec.theme;
  if (typeof theme === "string" && theme.length > 0) return theme;
  return "soft";
}

function titleOf(spec: unknown): string {
  if (!isRecord(spec)) return "Spec";
  if (typeof spec.title === "string" && spec.title) return spec.title;
  if (typeof spec.type === "string" && spec.type) return spec.type;
  return "Spec";
}

function issuesFrom(result: ValidationResult, severity: "error" | "warning"): RailIssue[] {
  const list = severity === "error" ? result.errors : result.warnings;
  return list.map((item) => ({
    code: item.code,
    path: item.path || "/",
    message: item.message,
    severity: item.severity,
  }));
}

/**
 * Validate, then render with the workspace core package.
 * Planning charts use validatePhase4. Extra chart types render from `@chartkitdev/core/extra`.
 * Invalid specs return the CK diagnostics and no chart. Cloud is not called.
 */
export function paintSpec(input: unknown): RailResult {
  const spec = typeof input === "string" ? parseOrRaw(input) : input;
  const type = isRecord(spec) && typeof spec.type === "string" ? spec.type : "";
  const checked = PHASE4.has(type) ? validatePhase4(spec) : validate(spec);
  const theme = themeName(spec);
  const badge = theme === "soft" || theme === "auto" ? "Soft" : theme;
  if (!checked.ok) {
    const issues = issuesFrom(checked, "error");
    return {
      ok: false,
      svg: "",
      status: "400",
      title: titleOf(spec),
      badge,
      theme,
      issues,
      footer: issues.length === 1 ? "1 error from validate()" : `${issues.length} errors from validate()`,
    };
  }
  const svg = isExtra(type) ? renderExtra(spec) : renderCore(spec);
  const warnings = issuesFrom(checked, "warning");
  return {
    ok: true,
    svg,
    status: "200",
    title: titleOf(spec),
    badge,
    theme,
    issues: warnings,
    footer: warnings.length
      ? `Rendered with @chartkitdev/core · ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`
      : "validate() ok · rendered with @chartkitdev/core",
  };
}

function parseOrRaw(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return input;
  }
}
