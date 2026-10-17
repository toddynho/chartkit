import type { ChartRenderer } from "../render";
import { renderHistogram } from "../renderers/extra/histogram";

export const histogram: ChartRenderer = {
  name: "histogram",
  types: ["histogram"],
  render: renderHistogram,
};
