import type { ChartRenderer } from "../render";
import { renderGauge } from "../renderers/gauge";

export const gauge: ChartRenderer = {
  name: "gauge",
  types: ["gauge"],
  render: renderGauge,
};
