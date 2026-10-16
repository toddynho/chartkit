import type { ChartRenderer } from "../render";
import { renderSparkline } from "../renderers/cartesian";

export const sparkline: ChartRenderer = {
  name: "sparkline",
  types: ["sparkline"],
  render: renderSparkline,
};
