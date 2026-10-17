import type { ChartRenderer } from "../render";
import { renderBoxplot } from "../renderers/extra/boxplot";

export const boxplot: ChartRenderer = {
  name: "boxplot",
  types: ["boxplot"],
  render: renderBoxplot,
};
