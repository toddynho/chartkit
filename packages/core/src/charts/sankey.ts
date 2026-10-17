import type { ChartRenderer } from "../render";
import { renderSankey } from "../renderers/phase3";

export const sankey: ChartRenderer = {
  name: "sankey",
  types: ["sankey"],
  render: renderSankey,
};
