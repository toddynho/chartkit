import type { ChartRenderer } from "../render";
import { renderFunnel } from "../renderers/extra/funnel";

export const funnel: ChartRenderer = {
  name: "funnel",
  types: ["funnel"],
  render: renderFunnel,
};
