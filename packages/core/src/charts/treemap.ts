import type { ChartRenderer } from "../render";
import { renderTreemap } from "../renderers/phase3";

export const treemap: ChartRenderer = {
  name: "treemap",
  types: ["treemap"],
  render: renderTreemap,
};
