import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { render as renderExtra } from "@chartkitdev/core/extra";

export function chartType(spec: unknown): string {
  if (typeof spec !== "object" || spec === null) return "";
  const type = (spec as { type?: unknown }).type;
  return typeof type === "string" ? type : "";
}

/**
 * Draw with the same split ChartView uses: extra and phase-4 types from
 * `@chartkitdev/core/extra`, everything else from `@chartkitdev/core/all`.
 * An error SVG is returned as-is so the playground can show it.
 */
export function drawChart(spec: unknown): string {
  const type = chartType(spec);
  return isExtra(type) ? renderExtra(spec) : renderCore(spec);
}

export function renderChart(spec: unknown): string {
  const type = chartType(spec);
  const svg = drawChart(spec);
  if (!svg.includes("<svg") || svg.includes("ck-chart-error") || svg.includes("Unknown atlas")) {
    throw new Error(`${type || "chart"} render failed`);
  }
  return svg;
}
