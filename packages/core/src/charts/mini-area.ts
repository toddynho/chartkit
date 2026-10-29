import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderMiniArea } from "../renderers/cartesian";

function render(spec: Record<string, unknown>): string | null {
  mountAxes();
  return renderMiniArea(spec);
}

export const miniArea: ChartRenderer = {
  name: "miniArea",
  types: ["mini-area"],
  render,
};
