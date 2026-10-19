import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderBar } from "../renderers/cartesian";
import { mountTotals } from "../totals";

mountAxes();
mountTotals();

export const bar: ChartRenderer = {
  name: "bar",
  types: ["bar"],
  render: renderBar,
};
