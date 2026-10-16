import type { ChartRenderer } from "../render";
import { renderCombo } from "../renderers/cartesian";

export const combo: ChartRenderer = {
  name: "combo",
  types: ["combo"],
  render: renderCombo,
};
