import type { ChartRenderer } from "../render";
import { renderQuadrant } from "../renderers/extra/quadrant";

export const quadrant: ChartRenderer = {
  name: "quadrant",
  types: ["quadrant"],
  render: renderQuadrant,
};
