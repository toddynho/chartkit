import type { ChartRenderer } from "../render";
import { renderStackedArea } from "../renderers/cartesian";

export const stackedArea: ChartRenderer = {
  name: "stackedArea",
  types: ["stacked-area"],
  render: renderStackedArea,
};
