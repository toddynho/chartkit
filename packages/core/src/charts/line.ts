import type { ChartRenderer } from "../render";
import { renderLine } from "../renderers/cartesian";

export const line: ChartRenderer = {
  name: "line",
  types: ["line"],
  render: renderLine,
};
