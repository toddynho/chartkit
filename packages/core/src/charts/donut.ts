import type { ChartRenderer } from "../render";
import { renderDonut } from "../renderers/donut";

export const donut: ChartRenderer = {
  name: "donut",
  types: ["donut"],
  render: renderDonut,
};
