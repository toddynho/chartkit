import type { ChartRenderer } from "../render";
import { renderScatter } from "../renderers/scatter";

export const scatter: ChartRenderer = {
  name: "scatter",
  types: ["scatter"],
  render: renderScatter,
};
