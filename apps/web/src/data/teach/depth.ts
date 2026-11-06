import { editMark, isRecord } from "./spec.ts";

/** Levels under the root. All deletes mark.depth, which draws the default of 8. */
export const DEPTH_OPTIONS = [
  { value: "all", label: "All" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
] as const;

export function applyDepth(spec: Record<string, unknown>, value: "all" | "1" | "2" | "3"): void {
  editMark(spec, (mark) => {
    if (value === "all") delete mark.depth;
    else mark.depth = Number(value);
  });
}

/** Omitted depth is the default, All. 1, 2, and 3 are the caps this control offers. */
export function depthMode(spec: Record<string, unknown>): "all" | "1" | "2" | "3" | "other" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const depth = mark.depth;
  if (depth === undefined) return "all";
  if (depth === 1 || depth === 2 || depth === 3) return String(depth) as "1" | "2" | "3";
  return "other";
}
