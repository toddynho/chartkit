import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderCombo } from "../renderers/cartesian";

mountAxes();

export const combo: ChartRenderer = {
  name: "combo",
  types: ["combo"],
  render: renderCombo,
};
