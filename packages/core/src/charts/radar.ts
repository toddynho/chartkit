import type { ChartRenderer } from "../render";
import { renderRadar } from "../renderers/phase3";

export const radar: ChartRenderer = {
  name: "radar",
  types: ["radar"],
  render: renderRadar,
};
