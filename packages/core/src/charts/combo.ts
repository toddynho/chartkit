import { mountAxes } from "../axis-extra";
import { readColorScale } from "../color-scale";
import type { ChartRenderer } from "../render";
import { mountColorScale, renderCombo } from "../renderers/cartesian";

mountAxes();
mountColorScale(readColorScale);

export const combo: ChartRenderer = {
  name: "combo",
  types: ["combo"],
  render: renderCombo,
};
