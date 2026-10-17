import type { ChartRenderer } from "../render";
import { renderSpike } from "../renderers/spike";

export const spike: ChartRenderer = {
  name: "spike",
  types: ["spike"],
  render: renderSpike,
};
