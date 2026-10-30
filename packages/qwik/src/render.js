import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { assertSpec, assertSvg, typeOf } from "./check.js";

export { ChartKitSpecError } from "./check.js";

/**
 * Validate, then draw. Phase-4 types use validatePhase4. Bar-list has its own renderer.
 * Extra charts come from `@chartkitdev/core/extra`. Core charts come from `@chartkitdev/core/all`.
 *
 * @param {import("@chartkitdev/core").ChartSpec} spec
 * @param {(spec: import("@chartkitdev/core").ChartSpec) => string} [render]
 * @returns {string}
 */
export function renderToSvg(spec, render) {
  assertSpec(spec);
  const type = typeOf(spec);
  const svg = render ? render(spec) : type === "bar-list" ? (renderBarList(spec) ?? "") : isExtra(type) ? renderExtra(spec) : renderCore(spec);
  return assertSvg(svg, type);
}
