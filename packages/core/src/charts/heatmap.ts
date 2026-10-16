import type { ChartRenderer } from "../render";
import { renderHeatmap } from "../renderers/heatmap";

export const heatmap: ChartRenderer = {
  name: "heatmap",
  types: ["heatmap"],
  render: renderHeatmap,
};
