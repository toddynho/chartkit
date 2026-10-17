import type { ChartRenderer } from "../render";
import { renderTreemap } from "../renderers/extra/treemap";

export const treemap: ChartRenderer = {
  name: "treemap",
  types: ["treemap"],
  render: renderTreemap,
};
