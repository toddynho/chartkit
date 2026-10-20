import type { ChartRenderer } from "../render";
import { renderSunburst } from "../renderers/extra/sunburst";

export const sunburst: ChartRenderer = {
  name: "sunburst",
  types: ["sunburst"],
  render: renderSunburst,
};
