import type { ChartRenderer } from "../render";
import { renderPolar } from "../renderers/extra/polar";

/** On-demand nightingale rose. Not part of createRenderer([line]). */
export const rose: ChartRenderer = {
  name: "rose",
  types: ["rose"],
  render: (spec) => renderPolar(spec, "rose"),
};
