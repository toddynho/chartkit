import type { ChartRenderer } from "../render";
import { renderErrorbar } from "../renderers/extra/uncertainty";

export const errorbar: ChartRenderer = {
  name: "errorbar",
  types: ["errorbar"],
  render: renderErrorbar,
};
