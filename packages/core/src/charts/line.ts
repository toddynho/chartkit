import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderLine } from "../renderers/cartesian";

mountAxes();

export const line: ChartRenderer = {
  name: "line",
  types: ["line"],
  render: renderLine,
};
