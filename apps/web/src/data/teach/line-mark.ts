import { editMark, isRecord } from "./spec.ts";

export function applyCurve(spec: Record<string, unknown>, value: "monotone" | "linear" | "step"): void {
  editMark(spec, (mark) => {
    mark.curve = value;
  });
}

/** Omitted curve is monotone. step-before and step-after are not on this control. */
export function curveMode(spec: Record<string, unknown>): "monotone" | "linear" | "step" | "other" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  if (mark.curve === undefined || mark.curve === "monotone") return "monotone";
  if (mark.curve === "linear" || mark.curve === "step") return mark.curve;
  return "other";
}

export function applyPoints(spec: Record<string, unknown>, value: "none" | "hover" | "always"): void {
  editMark(spec, (mark) => {
    mark.points = value;
  });
}

/** Omitted points are hover, the schema default. */
export function pointsMode(spec: Record<string, unknown>): "none" | "hover" | "always" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  if (mark.points === "none" || mark.points === "hover" || mark.points === "always") return mark.points;
  return "hover";
}

function channelList(spec: Record<string, unknown>): unknown[] {
  const encoding = spec.encoding;
  if (!isRecord(encoding) || !Array.isArray(encoding.y)) return [];
  return encoding.y;
}

/**
 * On writes mark.area true. Off writes mark.area false.
 * Either choice clears a per-channel `area` flag, so the control and the picture agree.
 * A spec that fills only some channels reads as "other" until the control is used.
 */
export function applyArea(spec: Record<string, unknown>, value: "off" | "on"): void {
  editMark(spec, (mark) => {
    mark.area = value === "on";
  });
  const encoding = spec.encoding;
  if (!isRecord(encoding) || !Array.isArray(encoding.y)) return;
  encoding.y = encoding.y.map((item) => {
    if (!isRecord(item) || !("area" in item)) return item;
    const next = { ...item };
    delete next.area;
    return next;
  });
}

export function areaMode(spec: Record<string, unknown>): "off" | "on" | "other" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  if (mark.area === true) return "on";
  const flagged = channelList(spec).some((item) => isRecord(item) && item.area === true);
  if (flagged && mark.area !== true) return "other";
  return "off";
}
