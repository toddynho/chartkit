import { isRecord } from "./spec.ts";

export type LegendPlace = "top" | "bottom" | "right";

/**
 * Off writes `legend: false`. A place keeps the other legend keys and sets position.
 * `whenOmitted` is the place the chart uses when position is missing: bottom for pie and donut, top for a line.
 * `known` is the places this control offers. Any other position reads as "other", so no button is pressed.
 */
export function legendChoice<T extends LegendPlace>(
  spec: Record<string, unknown>,
  options: { omitted: T; known: readonly T[] },
): "off" | T | "other" {
  const known = new Set<string>(options.known);
  const legend = spec.legend;
  if (legend === false) return "off";
  if (isRecord(legend)) {
    if (legend.show === false) return "off";
    if (legend.position === undefined) return options.omitted;
    if (typeof legend.position === "string" && known.has(legend.position)) return legend.position as T;
    return "other";
  }
  return options.omitted;
}

export function applyLegend(spec: Record<string, unknown>, value: "off" | LegendPlace): void {
  if (value === "off") {
    spec.legend = false;
    return;
  }
  const current = spec.legend;
  const next: Record<string, unknown> = isRecord(current) ? { ...current } : {};
  delete next.show;
  next.position = value;
  spec.legend = next;
}
