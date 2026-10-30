import { renderToString as renderSolid } from "solid-js/web";
import type { ChartSpec } from "@chartkitdev/core";
import { Chart } from "./Chart";
import { renderToSvg, type RenderChart } from "./render.js";

/**
 * Solid SSR HTML for a spec. This entry draws histogram through rose and bar-list,
 * so the SVG is in the string. The client component hydrates that node with `mount()`.
 */
export function renderToString(spec: ChartSpec, render?: RenderChart): string {
  const draw = render ?? ((value: ChartSpec) => renderToSvg(value));
  return renderSolid(() => <Chart spec={spec} render={draw} />);
}

export { renderToSvg, ChartKitSpecError } from "./render.js";
