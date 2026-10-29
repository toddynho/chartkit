import { mountAxes } from "../axis-extra";
import { readColorScale } from "../color-scale";
import type { ChartRenderer } from "../render";
import { mountColorScale, mountMarks, mountStacks, renderCombo } from "../renderers/cartesian";
import { mountRangeBand } from "../range-band";

function render(spec: Record<string, unknown>): string | null {
  mountAxes();
  mountColorScale(readColorScale);
  mountRangeBand();
  mountStacks();
  mountMarks();
  return renderCombo(spec);
}

export const combo: ChartRenderer = {
  name: "combo",
  types: ["combo"],
  render,
};
