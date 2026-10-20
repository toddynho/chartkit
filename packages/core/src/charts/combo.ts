import { mountAxes } from "../axis-extra";
import { readColorScale } from "../color-scale";
import type { ChartRenderer } from "../render";
import { mountColorScale, renderCombo } from "../renderers/cartesian";
import { mountRangeBand } from "../range-band";

mountAxes();
mountColorScale(readColorScale);
mountRangeBand();

export const combo: ChartRenderer = {
  name: "combo",
  types: ["combo"],
  render: renderCombo,
};
