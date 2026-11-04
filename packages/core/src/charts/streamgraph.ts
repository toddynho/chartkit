import type { ChartRenderer } from "../render";
import { renderStreamgraph } from "../renderers/extra/streamgraph";

export const streamgraph: ChartRenderer = {
  name: "streamgraph",
  types: ["streamgraph"],
  render: renderStreamgraph,
};
