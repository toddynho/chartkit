import type { ChartRenderer } from "../render";
import { renderVenn } from "../renderers/extra/venn";

export const venn: ChartRenderer = {
  name: "venn",
  types: ["venn"],
  render: renderVenn,
};
