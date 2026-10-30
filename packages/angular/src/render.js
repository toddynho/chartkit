import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { validate } from "@chartkitdev/core/validate";
import { validatePhase4 } from "@chartkitdev/core/validate/phase4";

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

export class ChartKitSpecError extends Error {
  constructor(errors) {
    const detail = errors.map((item) => `${item.code} ${item.path || "/"} ${item.message}`).join("; ");
    super(detail ? `ChartKit spec is invalid: ${detail}` : "ChartKit spec is invalid");
    this.name = "ChartKitSpecError";
    this.errors = errors;
  }
}

function typeOf(spec) {
  if (typeof spec !== "object" || spec === null) return "";
  const type = spec.type;
  return typeof type === "string" ? type : "";
}

function assertSvg(svg, type) {
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

/** Validate, then draw. Same split as the other adapters: extra charts and bar-list included. */
export function renderToSvg(spec, render) {
  const type = typeOf(spec);
  const checked = PHASE4.has(type) ? validatePhase4(spec) : validate(spec);
  if (!checked.ok) throw new ChartKitSpecError(checked.errors);
  const svg = render ? render(spec) : type === "bar-list" ? (renderBarList(spec) ?? "") : isExtra(type) ? renderExtra(spec) : renderCore(spec);
  return assertSvg(svg, type);
}
