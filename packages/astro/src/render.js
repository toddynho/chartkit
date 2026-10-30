import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { validate } from "@chartkitdev/core/validate";
import { validatePhase4 } from "@chartkitdev/core/validate/phase4";

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

/**
 * The build failed validation. `errors` are the CK diagnostics from the same pass the docs site uses.
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
function typeOf(spec) {
  if (typeof spec !== "object" || spec === null) return "";
  const type = /** @type {{ type?: unknown }} */ (spec).type;
  return typeof type === "string" ? type : "";
}

/**
 * Validate, then draw. Same split as the chartkit.dev homepage hero:
 * phase-4 types use validatePhase4, bar-list has its own renderer, and the
 * extra charts (histogram through rose, including the planning charts) come
 * from `@chartkitdev/core/extra`. Core charts come from `@chartkitdev/core/all`.
 *
 * @param {import("@chartkitdev/core").ChartSpec} spec
 * @param {(spec: import("@chartkitdev/core").ChartSpec) => string} [render]
 * @returns {string}
 */
export function renderToString(spec, render) {
  const type = typeOf(spec);
  const checked = PHASE4.has(type) ? validatePhase4(spec) : validate(spec);
  if (!checked.ok) throw new ChartKitSpecError(checked.errors);
  const svg = render ? render(spec) : type === "bar-list" ? (renderBarList(spec) ?? "") : isExtra(type) ? renderExtra(spec) : renderCore(spec);
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
