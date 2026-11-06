import { isRecord } from "./spec.ts";

/**
 * Tooltip Off writes `false`. On puts back the example's previous on-state.
 * An omitted tooltip deletes the key. `true` writes `true`. An object is copied back.
 * A stored `false` turns the card on with `true`, because Off is the only way the control writes `false`.
 */
export function applyTooltip(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  if (value === "off") {
    spec.tooltip = false;
    return;
  }
  if (isRecord(restore) && restore.show !== false) {
    spec.tooltip = structuredClone(restore);
    return;
  }
  if (restore === true || restore === false) {
    spec.tooltip = true;
    return;
  }
  delete spec.tooltip;
}

/** Omitted, true, and a tooltip object are on. `false` and `show: false` are off. */
export function tooltipMode(spec: Record<string, unknown>): "off" | "on" {
  const tip = spec.tooltip;
  return tip === false || (isRecord(tip) && tip.show === false) ? "off" : "on";
}
