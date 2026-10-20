import type { ChartRenderer } from "../render";
import { renderBarRange } from "../renderers/extra/uncertainty";

export const barRange: ChartRenderer = {
  name: "bar-range",
  types: ["bar-range"],
  render: renderBarRange,
};
