import type { ChartRenderer } from "../render";
import { renderKpi } from "../renderers/kpi";

export const kpi: ChartRenderer = {
  name: "kpi",
  types: ["kpi"],
  render: renderKpi,
};
