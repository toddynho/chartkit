import { validate } from "@chartkitdev/core/validate";
import { validatePhase4 } from "@chartkitdev/core/validate/phase4";

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

/**
 * The spec failed validation. `errors` are the CK diagnostics from the same pass the docs site uses.
 */
export class ChartKitSpecError extends Error {
  /**
   * @param {readonly { code: string; path: string; message: string; severity: string }[]} errors
   */
  constructor(errors) {
    const detail = errors.map((item) => `${item.code} ${item.path || "/"} ${item.message}`).join("; ");
    super(detail ? `ChartKit spec is invalid: ${detail}` : "ChartKit spec is invalid");
    this.name = "ChartKitSpecError";
    this.errors = errors;
  }
}

/**
 * @param {unknown} spec
 * @returns {string}
 */
export function typeOf(spec) {
  if (typeof spec !== "object" || spec === null) return "";
  const type = /** @type {{ type?: unknown }} */ (spec).type;
  return typeof type === "string" ? type : "";
}

/**
 * @param {import("@chartkitdev/core").ChartSpec} spec
 */
export function assertSpec(spec) {
  const checked = PHASE4.has(typeOf(spec)) ? validatePhase4(spec) : validate(spec);
  if (!checked.ok) throw new ChartKitSpecError(checked.errors);
}

/**
 * @param {string} svg
 * @param {string} type
 * @returns {string}
 */
export function assertSvg(svg, type) {
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
