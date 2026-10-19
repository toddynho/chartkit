import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderSparkline } from "../renderers/cartesian";

mountAxes();

export const sparkline: ChartRenderer = {
  name: "sparkline",
  types: ["sparkline"],
  render: renderSparkline,
};
