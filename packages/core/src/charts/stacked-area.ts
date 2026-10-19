import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderStackedArea } from "../renderers/cartesian";

mountAxes();

export const stackedArea: ChartRenderer = {
  name: "stackedArea",
  types: ["stacked-area"],
  render: renderStackedArea,
};
