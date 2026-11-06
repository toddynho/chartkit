import type { TeachChoiceControl } from "./types.ts";

/** Labels that already exist on the donut demo. Pie reuses the same words. */
export const LABEL_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "inside", label: "Inside" },
  { value: "outside", label: "Outside" },
] as const;

export const ARC_LEGEND_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "bottom", label: "Bottom" },
  { value: "right", label: "Right" },
] as const;

export const LINE_LEGEND_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "right", label: "Right" },
] as const;

export const TOOLTIP_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "on", label: "On" },
] as const;

export const SORT_OPTIONS = [
  { value: "none", label: "none" },
  { value: "asc", label: "asc" },
  { value: "desc", label: "desc" },
] as const;

export const START_OPTIONS = [
  { value: "0", label: "0" },
  { value: "90", label: "90" },
  { value: "180", label: "180" },
  { value: "-90", label: "-90" },
] as const;

export const CURVE_OPTIONS = [
  { value: "monotone", label: "Smooth" },
  { value: "linear", label: "Linear" },
  { value: "step", label: "Step" },
] as const;

export const POINT_OPTIONS = [
  { value: "none", label: "Off" },
  { value: "hover", label: "Hover" },
  { value: "always", label: "On" },
] as const;

export const AREA_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "on", label: "On" },
] as const;

export function choice(
  id: string,
  label: string,
  code: string,
  aria: string,
  options: readonly { value: string; label: string }[],
): TeachChoiceControl {
  return { kind: "choice", id, label, code, aria, options: options.map((option) => ({ ...option })) };
}
