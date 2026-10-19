import { mountAxes } from "../axis-extra";
import { readColorScale } from "../color-scale";
import type { ChartRenderer } from "../render";
import { mountColorScale, renderBar } from "../renderers/cartesian";
import { mountTotals } from "../totals";

mountAxes();
mountTotals();
mountColorScale(readColorScale);

export const bar: ChartRenderer = {
  name: "bar",
  types: ["bar"],
  render: renderBar,
};
