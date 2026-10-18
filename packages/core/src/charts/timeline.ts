import type { ChartRenderer } from "../render";
import { renderTimeline } from "../renderers/extra/timeline";

export const timeline: ChartRenderer = {
  name: "timeline",
  types: ["timeline"],
  render: renderTimeline,
};
