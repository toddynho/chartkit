import type { ChartRenderer } from "../render";
import { renderGantt } from "../renderers/extra/gantt";

export const gantt: ChartRenderer = {
  name: "gantt",
  types: ["gantt"],
  render: renderGantt,
};
