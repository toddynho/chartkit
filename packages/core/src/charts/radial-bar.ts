import type { ChartRenderer } from "../render";
import { renderPolar } from "../renderers/extra/polar";

/** On-demand radial bars. Not part of createRenderer([line]). */
export const radialBar: ChartRenderer = {
  name: "radial-bar",
  types: ["radial-bar"],
  render: (spec) => renderPolar(spec, "radial-bar"),
};

export { renderPolar };
