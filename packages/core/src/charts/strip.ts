import type { ChartRenderer } from "../render";
import { renderStrip } from "../renderers/extra/strip";

export const strip: ChartRenderer = {
  name: "strip",
  types: ["strip"],
  render: renderStrip,
};
