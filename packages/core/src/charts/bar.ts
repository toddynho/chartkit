import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderBar } from "../renderers/cartesian";

mountAxes();

export const bar: ChartRenderer = {
  name: "bar",
  types: ["bar"],
  render: renderBar,
};
