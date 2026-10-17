import type { ChartRenderer } from "../render";
import { renderHistogram } from "../renderers/phase3";

export const histogram: ChartRenderer = {
  name: "histogram",
  types: ["histogram"],
  render: renderHistogram,
};
