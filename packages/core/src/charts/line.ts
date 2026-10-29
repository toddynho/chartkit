import { mountAxes } from "../axis-extra";
import type { ChartRenderer } from "../render";
import { renderLine } from "../renderers/cartesian";

/**
 * Axes mount inside render, not at import. The module initializer stays pure
 * so `sideEffects` can omit this file and unused imports still tree-shake.
 */
function render(spec: Record<string, unknown>): string | null {
  mountAxes();
  return renderLine(spec);
}

export const line: ChartRenderer = {
  name: "line",
  types: ["line"],
  render,
};
