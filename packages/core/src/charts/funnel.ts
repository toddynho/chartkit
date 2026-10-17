import type { ChartRenderer } from "../render";
import { renderFunnel } from "../renderers/phase3";

export const funnel: ChartRenderer = {
  name: "funnel",
  types: ["funnel"],
  render: renderFunnel,
};
