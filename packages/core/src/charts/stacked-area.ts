import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { mountMarks, mountStacks, renderStackedArea } from "../renderers/cartesian";
import { mountTotals } from "../totals";

function render(spec: Record<string, unknown>): string | null {
  mountAxes();
  mountTotals();
  mountStacks();
  mountMarks();
  return renderStackedArea(spec);
}

export const stackedArea: ChartRenderer = {
  name: "stackedArea",
  types: ["stacked-area"],
  render,
};
