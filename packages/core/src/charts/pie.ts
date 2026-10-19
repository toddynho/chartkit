import type { ChartRenderer } from "../render";
import { renderPie } from "../renderers/donut";

export const pie: ChartRenderer = {
  name: "pie",
  types: ["pie"],
  render: renderPie,
};
