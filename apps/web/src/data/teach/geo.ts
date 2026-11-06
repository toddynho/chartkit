/**
 * Controls shared by choropleth and map-points.
 * The geo renderer reads mark.atlas, and only two legend positions.
 * legend: false does not hide the legend. mark.legend: false does.
 */

import { editMark, isRecord } from "./spec.ts";
import type { TeachChoiceControl } from "./types.ts";
import { choice } from "./controls.ts";

export const ATLAS_OPTIONS = [
  { value: "world", label: "World" },
  { value: "us", label: "US" },
  { value: "canada", label: "Canada" },
  { value: "eu", label: "EU" },
] as const;

export const SCALE_OPTIONS = [
  { value: "sequential", label: "Sequential" },
  { value: "diverging", label: "Diverging" },
  { value: "threshold", label: "Threshold" },
] as const;

export const GEO_LEGEND_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
] as const;

const ATLAS_PROJECTION = {
  world: "equalEarth",
  us: "albersUsa",
  canada: "equalEarth",
  eu: "equalEarth",
} as const;

export type GeoAtlas = keyof typeof ATLAS_PROJECTION;
export type GeoScale = (typeof SCALE_OPTIONS)[number]["value"];
export type GeoLegend = (typeof GEO_LEGEND_OPTIONS)[number]["value"];

export function atlasChoice(id = "atlas"): TeachChoiceControl {
  return choice(id, "Atlas", "mark.atlas", "mark.atlas", ATLAS_OPTIONS);
}

export function scaleChoice(): TeachChoiceControl {
  return choice("scale", "Scale", "mark.scale", "mark.scale", SCALE_OPTIONS);
}

export function geoLegendChoiceControl(): TeachChoiceControl {
  return choice("legend", "Legend", "mark.legend", "legend", GEO_LEGEND_OPTIONS);
}

/** Writes mark.atlas and the projection that atlas uses by default. */
export function applyAtlas(spec: Record<string, unknown>, value: GeoAtlas): void {
  editMark(spec, (mark) => {
    mark.atlas = value;
    mark.projection = ATLAS_PROJECTION[value];
  });
}

/** Omitted atlas is world. An inline GeoJSON atlas reads as other, so no button is pressed. */
export function atlasMode(spec: Record<string, unknown>): GeoAtlas | "other" {
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  const atlas = mark && typeof mark.atlas === "string" ? mark.atlas : typeof spec.atlas === "string" ? spec.atlas : "world";
  if (atlas === "world" || atlas === "us" || atlas === "canada" || atlas === "eu") return atlas;
  return "other";
}

export function applyScale(spec: Record<string, unknown>, value: GeoScale): void {
  editMark(spec, (mark) => {
    mark.scale = value;
  });
}

/** Omitted scale is sequential. */
export function scaleMode(spec: Record<string, unknown>): GeoScale | "other" {
  const scale = isRecord(spec.mark) ? spec.mark.scale : undefined;
  if (scale === undefined || scale === "sequential") return "sequential";
  if (scale === "diverging" || scale === "threshold") return scale;
  return "other";
}

/**
 * Off writes mark.legend false. Right and bottom set legend.position.
 * A boolean legend: false is left alone by Off's opposite: the renderer ignores it,
 * so the choice stays on the side the map actually draws.
 */
export function applyGeoLegend(spec: Record<string, unknown>, value: GeoLegend): void {
  if (value === "off") {
    editMark(spec, (mark) => {
      mark.legend = false;
    });
    return;
  }
  editMark(spec, (mark) => {
    if (mark.legend === false) delete mark.legend;
  });
  const current = spec.legend;
  const next: Record<string, unknown> = isRecord(current) ? { ...current } : {};
  delete next.show;
  next.position = value;
  spec.legend = next;
}

export function geoLegendMode(spec: Record<string, unknown>): GeoLegend | "other" {
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (mark?.legend === false) return "off";
  const legend = spec.legend;
  if (!isRecord(legend)) return "right";
  if (legend.position === undefined || legend.position === "right") return "right";
  if (legend.position === "bottom") return "bottom";
  return "other";
}
