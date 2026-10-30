import type { ChartSpec } from "@chartkitdev/core";
import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { assertSpec, assertSvg, typeOf } from "./check";

export type RenderChart = (spec: ChartSpec) => string;

/**
 * SVG for the component's own server render.
 * Core charts are drawn here. Histogram through rose and bar-list stay empty in this
 * entry so the client bundle does not import `@chartkitdev/core/extra`. `mount()` loads
 * those on the client. Pass `render` to include them in the HTML.
 */
export function paint(spec: ChartSpec, render?: RenderChart): string {
  assertSpec(spec);
  const type = typeOf(spec);
  if (!render && (isExtra(type) || type === "bar-list")) return "";
  return assertSvg((render ?? renderCore)(spec), type);
}
