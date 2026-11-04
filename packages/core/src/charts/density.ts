import type { ChartRenderer } from "../render";
import { renderDensity } from "../renderers/extra/density";

export const density: ChartRenderer = {
  name: "density",
  types: ["density"],
  render: renderDensity,
};
