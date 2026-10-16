import type { ChartRenderer } from "../render";
import { renderMiniArea } from "../renderers/cartesian";

export const miniArea: ChartRenderer = {
  name: "miniArea",
  types: ["mini-area"],
  render: renderMiniArea,
};
