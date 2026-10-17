import type { ChartRenderer } from "../render";
import { renderBoxplot } from "../renderers/phase3";

export const boxplot: ChartRenderer = {
  name: "boxplot",
  types: ["boxplot"],
  render: renderBoxplot,
};
