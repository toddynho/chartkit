import type { ChartRenderer } from "../render";
import { renderWaterfall } from "../renderers/extra/waterfall";

export const waterfall: ChartRenderer = {
  name: "waterfall",
  types: ["waterfall"],
  render: renderWaterfall,
};
