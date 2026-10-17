import type { ChartRenderer } from "../render";
import { renderSankey } from "../renderers/extra/sankey";

export const sankey: ChartRenderer = {
  name: "sankey",
  types: ["sankey"],
  render: renderSankey,
};
