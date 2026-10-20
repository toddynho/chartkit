import type { ChartRenderer } from "../render";
import { renderAreaRange } from "../renderers/extra/uncertainty";

export const areaRange: ChartRenderer = {
  name: "area-range",
  types: ["area-range"],
  render: renderAreaRange,
};
