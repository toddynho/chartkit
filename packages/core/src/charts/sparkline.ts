import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderSparkline } from "../renderers/cartesian";

function render(spec: Record<string, unknown>): string | null {
  mountAxes();
  return renderSparkline(spec);
}

export const sparkline: ChartRenderer = {
  name: "sparkline",
  types: ["sparkline"],
  render,
};
