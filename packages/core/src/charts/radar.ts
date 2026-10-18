import type { ChartRenderer } from "../render";
import { renderRadar } from "../renderers/extra/radar";

export const radar: ChartRenderer = {
  name: "radar",
  types: ["radar"],
  render: renderRadar,
};
