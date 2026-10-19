import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderMiniArea } from "../renderers/cartesian";

mountAxes();

export const miniArea: ChartRenderer = {
  name: "miniArea",
  types: ["mini-area"],
  render: renderMiniArea,
};
