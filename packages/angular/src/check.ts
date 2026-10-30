import type { ChartSpec, Diagnostic } from "@chartkitdev/core";
import { validate } from "@chartkitdev/core/validate";
import { validatePhase4 } from "@chartkitdev/core/validate/phase4";

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

/** Thrown when `validate()` reports errors. Rendering should fail. */
export class ChartKitSpecError extends Error {
  readonly errors: readonly Diagnostic[];

  constructor(errors: readonly Diagnostic[]) {
    const detail = errors.map((item) => `${item.code} ${item.path || "/"} ${item.message}`).join("; ");
    super(detail ? `ChartKit spec is invalid: ${detail}` : "ChartKit spec is invalid");
    this.name = "ChartKitSpecError";
    this.errors = errors;
  }
}

export function typeOf(spec: unknown): string {
  if (typeof spec !== "object" || spec === null) return "";
  const type = (spec as { type?: unknown }).type;
  return typeof type === "string" ? type : "";
}

export function assertSpec(spec: ChartSpec): void {
  const checked = PHASE4.has(typeOf(spec)) ? validatePhase4(spec) : validate(spec);
  if (!checked.ok) throw new ChartKitSpecError(checked.errors);
}

export function assertSvg(svg: string, type: string): string {
  if (!svg.includes("<svg") || svg.includes("ck-chart-error")) {
    throw new ChartKitSpecError([
      {
        code: "CK1010",
        path: "/type",
        message: `${type || "chart"} did not render.`,
        severity: "error",
      },
    ]);
  }
  return svg;
}
