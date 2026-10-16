import type { ChartRenderer } from "../render";
import { renderProgressRing } from "../renderers/progress-ring";

export const progressRing: ChartRenderer = {
  name: "progressRing",
  types: ["progress-ring"],
  render: renderProgressRing,
};
