import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderStackedArea } from "../renderers/cartesian";
import { mountTotals } from "../totals";

mountAxes();
mountTotals();

export const stackedArea: ChartRenderer = {
  name: "stackedArea",
  types: ["stacked-area"],
  render: renderStackedArea,
};
