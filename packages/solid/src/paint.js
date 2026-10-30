import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { assertSpec, assertSvg, typeOf } from "./check.js";

/**
 * SVG for the component's own server render.
 * Core charts are drawn here. Histogram through rose and bar-list stay empty in this
 * entry so the client bundle does not import `@chartkitdev/core/extra`. `mount()` loads
 * those on the client. Pass `render` (the SSR entry does) to include them in the HTML.
 *
 * @param {import("@chartkitdev/core").ChartSpec} spec
 * @param {(spec: import("@chartkitdev/core").ChartSpec) => string} [render]
 * @returns {string}
 */
export function paint(spec, render) {
  assertSpec(spec);
  const type = typeOf(spec);
  if (!render && (isExtra(type) || type === "bar-list")) return "";
  return assertSvg((render ?? renderCore)(spec), type);
}
