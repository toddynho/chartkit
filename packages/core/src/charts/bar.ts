import { mountAxes } from "../axis-extra";
import { readColorScale } from "../color-scale";
import type { ChartRenderer } from "../render";
import { mountColorScale, mountMarks, mountStacks, renderBar } from "../renderers/cartesian";
import { mountTotals } from "../totals";

function render(spec: Record<string, unknown>): string | null {
  mountAxes();
  mountTotals();
  mountColorScale(readColorScale);
  mountStacks();
  mountMarks();
  return renderBar(spec);
}

export const bar: ChartRenderer = {
  name: "bar",
  types: ["bar"],
  render,
};
