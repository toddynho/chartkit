import type { ChartRenderer } from "../render";
import { renderBar } from "../renderers/cartesian";

export const bar: ChartRenderer = {
  name: "bar",
  types: ["bar"],
  render: renderBar,
};
