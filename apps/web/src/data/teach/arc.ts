import { editMark, isRecord } from "./spec.ts";

/** Slice labels. Off clears the keys. Inside and outside turn labels on and set the place. */
export function applySliceLabels(spec: Record<string, unknown>, value: "off" | "inside" | "outside"): void {
  editMark(spec, (mark) => {
    if (value === "off") {
      delete mark.labels;
      delete mark.labelPosition;
      return;
    }
    mark.labels = true;
    mark.labelPosition = value;
  });
}

export function sliceLabelMode(spec: Record<string, unknown>): "off" | "inside" | "outside" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const position = typeof mark.labelPosition === "string" ? mark.labelPosition : "";
  if (position === "inside" || position === "center") return "inside";
  if (position !== "" || mark.labels === true || mark.labelFormat !== undefined) return "outside";
  return "off";
}

export function applySort(spec: Record<string, unknown>, value: "none" | "asc" | "desc"): void {
  editMark(spec, (mark) => {
    mark.sort = value;
  });
}

export function sortMode(spec: Record<string, unknown>): "none" | "asc" | "desc" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  return mark.sort === "asc" || mark.sort === "desc" ? mark.sort : "none";
}

const STARTS = new Set([0, 90, 180, -90]);

export function applyStartAngle(spec: Record<string, unknown>, value: number): void {
  editMark(spec, (mark) => {
    mark.startAngle = value;
  });
}

export function startAngleMode(spec: Record<string, unknown>): number | "other" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const start = typeof mark.startAngle === "number" ? mark.startAngle : 0;
  return STARTS.has(start) ? start : "other";
}

export function applyPadAngle(spec: Record<string, unknown>, value: number): void {
  editMark(spec, (mark) => {
    mark.padAngle = value;
  });
}

export function padAngleOf(spec: Record<string, unknown>, fallback: number): number {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  return typeof mark.padAngle === "number" ? mark.padAngle : fallback;
}

export function applyInnerRadius(spec: Record<string, unknown>, value: number): void {
  editMark(spec, (mark) => {
    mark.innerRadius = value;
  });
}

export function innerRadiusOf(spec: Record<string, unknown>, fallback: number): number {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  return typeof mark.innerRadius === "number" ? mark.innerRadius : fallback;
}

export function applyPalette(spec: Record<string, unknown>, value: "theme" | "set", colors: readonly string[]): void {
  editMark(spec, (mark) => {
    if (value === "theme") delete mark.palette;
    else mark.palette = [...colors];
  });
}

export function paletteMode(spec: Record<string, unknown>, colors: readonly string[]): "theme" | "set" | "other" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const palette = mark.palette;
  if (!Array.isArray(palette)) return "theme";
  const same = palette.length === colors.length && palette.every((color, index) => color === colors[index]);
  return same ? "set" : "other";
}
