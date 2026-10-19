import type { Bag } from "./glyphs";
import { cssVar } from "./theme";
import { labelText, mountTotals as install, type Layers, type PlotModel, type XScale } from "./renderers/cartesian";

/** Registers stack-total labels. Bar and stacked-area call this; the line entry does not. */
export function mountTotals(): void {
  install(place);
}

function place(
  model: PlotModel,
  layers: Layers,
  xScale: XScale,
  yScale: (value: number) => number,
  horizontal: boolean,
  held: Bag,
): string {
  if (!model.stackTotal || model.stack === "none") return "";
  const top = layers.top[layers.top.length - 1];
  if (!top) return "";
  const fill = cssVar("text", model.preset.text);
  let out = "";
  for (let i = 0; i < top.length; i++) {
    let sum = 0;
    let any = false;
    for (const series of model.series) {
      const value = series.values[i];
      if (typeof value === "number") {
        sum += value;
        any = true;
      }
    }
    if (!any) continue;
    const band = xScale.band(i);
    const text = labelText(model, model.series[0], sum);
    const y = top[i] ?? 0;
    if (horizontal) out += held.put(text, yScale(y) + 6, band.start + band.size / 2 + 3, "start", fill);
    else out += held.put(text, model.x ? xScale.center(i) : band.start + band.size / 2, yScale(y) - 4, "middle", fill);
  }
  return out;
}
