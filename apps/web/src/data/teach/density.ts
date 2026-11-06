/**
 * Teaching copy and curated specs for /docs/charts/density.
 * A density draws a kernel curve of the raw sample. The rows stay the observations.
 * Bandwidth, normalize, the rug, and orientation are the options a first density sets.
 * Steps, extent, and a 2D contour stay in the playground. mark.dims 2 is not drawn.
 * Theme preset chips are not on this page.
 */

import { AREA_OPTIONS, LINE_LEGEND_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const densityPageTitle = "Density";

export const densityPageDescription =
  "How to build a ChartKit density: a kernel curve of one quantitative sample, when to use it instead of a histogram, the data shape, a spec that renders, and the options that shape the curve.";

/** Five waits. Omitted bandwidth is Scott's rule. The curve integrates to 1. */
export const smallestDensitySpec: Record<string, unknown> = {
  version: "1",
  type: "density",
  data: [{ wait: 12 }, { wait: 15 }, { wait: 18 }, { wait: 14 }, { wait: 40 }],
  encoding: { x: "wait" },
  a11y: { alt: "Most waits sit near 15 minutes, with a tail out to 40." },
};

const BANDWIDTH_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "3", label: "3" },
  { value: "8", label: "8" },
] as const;

const NORMALIZE_OPTIONS = [
  { value: "density", label: "density" },
  { value: "count", label: "count" },
] as const;

const DENSITY_ORIENTATION = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
] as const;

/**
 * Wait time, Wait by desk, and Vertical waits are the published density examples.
 * Titles stay the full example titles.
 */
export const densityExamples: TeachExample[] = [
  {
    id: "wait",
    title: "Wait time",
    blurb: "Most waits sit near 15 minutes. A smaller bump sits out near 40.",
    meta: "21 waits",
    spec: {
      version: "1",
      id: "wait-density",
      type: "density",
      title: "Wait time",
      data: [
        { wait: 11 },
        { wait: 12 },
        { wait: 12 },
        { wait: 13 },
        { wait: 14 },
        { wait: 14 },
        { wait: 14 },
        { wait: 15 },
        { wait: 15 },
        { wait: 15 },
        { wait: 16 },
        { wait: 16 },
        { wait: 17 },
        { wait: 18 },
        { wait: 19 },
        { wait: 20 },
        { wait: 36 },
        { wait: 38 },
        { wait: 40 },
        { wait: 42 },
        { wait: 44 },
      ],
      encoding: { x: { field: "wait", title: "Minutes" } },
      axes: { y: { title: "Density" } },
      a11y: { alt: "Most waits sit near 15 minutes, with a tail out to 40." },
    },
  },
  {
    id: "desks",
    title: "Wait by desk",
    blurb: "Front desk near 14 minutes, back desk near 33. Counts, not a unit density.",
    meta: "2 groups",
    spec: {
      version: "1",
      id: "desk-density",
      type: "density",
      title: "Wait by desk",
      data: [
        { wait: 10, desk: "Front" },
        { wait: 12, desk: "Front" },
        { wait: 13, desk: "Front" },
        { wait: 14, desk: "Front" },
        { wait: 14, desk: "Front" },
        { wait: 15, desk: "Front" },
        { wait: 16, desk: "Front" },
        { wait: 18, desk: "Front" },
        { wait: 28, desk: "Back" },
        { wait: 30, desk: "Back" },
        { wait: 32, desk: "Back" },
        { wait: 33, desk: "Back" },
        { wait: 34, desk: "Back" },
        { wait: 36, desk: "Back" },
        { wait: 38, desk: "Back" },
        { wait: 40, desk: "Back" },
      ],
      encoding: { x: { field: "wait", title: "Minutes" }, color: "desk" },
      mark: { bandwidth: 3, normalize: "count" },
      axes: { y: { title: "Waits" } },
      a11y: { alt: "Front desk clusters near 14 minutes. Back desk clusters near 33." },
    },
  },
  {
    id: "vertical",
    title: "Vertical waits",
    blurb: "The sample runs down the page, with a rug of the raw points.",
    meta: "12 waits",
    spec: {
      version: "1",
      id: "rug-density",
      type: "density",
      title: "Vertical waits",
      data: [
        { wait: 10 },
        { wait: 11 },
        { wait: 12 },
        { wait: 13 },
        { wait: 14 },
        { wait: 15 },
        { wait: 16 },
        { wait: 28 },
        { wait: 30 },
        { wait: 32 },
        { wait: 34 },
        { wait: 36 },
      ],
      encoding: { x: "wait" },
      mark: { orientation: "vertical", rug: true, extent: "data" },
      a11y: { alt: "Waits bunch near 14 and again near 32. Ticks show the raw sample." },
    },
  },
];

const DENSITY_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

/** Auto removes mark.bandwidth. 3 and 8 write that Gaussian width in data units. */
export function applyBandwidth(spec: Record<string, unknown>, value: "auto" | "3" | "8"): void {
  editMark(spec, (mark) => {
    if (value === "auto") delete mark.bandwidth;
    else mark.bandwidth = Number(value);
  });
}

/** Omitted bandwidth is Scott's rule, the same as "auto". Any other number reads as other. */
export function bandwidthMode(spec: Record<string, unknown>): "auto" | "3" | "8" | "other" {
  const bandwidth = markOf(spec).bandwidth;
  if (bandwidth === undefined || bandwidth === "auto") return "auto";
  if (bandwidth === 3) return "3";
  if (bandwidth === 8) return "8";
  return "other";
}

export function applyNormalize(spec: Record<string, unknown>, value: "density" | "count"): void {
  editMark(spec, (mark) => {
    mark.normalize = value;
  });
}

/** Omitted normalize integrates to 1. */
export function normalizeMode(spec: Record<string, unknown>): "density" | "count" | "other" {
  const normalize = markOf(spec).normalize;
  if (normalize === undefined || normalize === "density") return "density";
  if (normalize === "count") return "count";
  return "other";
}

export function applyRug(spec: Record<string, unknown>, value: "off" | "on"): void {
  editMark(spec, (mark) => {
    if (value === "off") delete mark.rug;
    else mark.rug = true;
  });
}

export function rugMode(spec: Record<string, unknown>): "off" | "on" {
  return markOf(spec).rug === true ? "on" : "off";
}

/** Density treats an omission as horizontal. The sample runs along x. */
export function applyDensityOrientation(spec: Record<string, unknown>, value: "horizontal" | "vertical"): void {
  editMark(spec, (mark) => {
    mark.orientation = value;
  });
}

export function densityOrientationMode(spec: Record<string, unknown>): "horizontal" | "vertical" | "other" {
  const orientation = markOf(spec).orientation;
  if (orientation === undefined || orientation === "horizontal") return "horizontal";
  if (orientation === "vertical") return "vertical";
  return "other";
}

export function applyDensityAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "bandwidth" && (value === "auto" || value === "3" || value === "8")) {
    applyBandwidth(spec, value);
    return;
  }
  if (id === "normalize" && (value === "density" || value === "count")) {
    applyNormalize(spec, value);
    return;
  }
  if (id === "rug" && (value === "off" || value === "on")) {
    applyRug(spec, value);
    return;
  }
  if (id === "orientation" && (value === "horizontal" || value === "vertical")) {
    applyDensityOrientation(spec, value);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function densityControlState(spec: Record<string, unknown>): TeachState {
  return {
    bandwidth: bandwidthMode(spec),
    normalize: normalizeMode(spec),
    rug: rugMode(spec),
    orientation: densityOrientationMode(spec),
    legend: legendChoice(spec, DENSITY_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const densityTeach: TeachModule = {
  type: "density",
  title: densityPageTitle,
  description: densityPageDescription,
  examples: densityExamples,
  smallestSpec: smallestDensitySpec,
  controls: [
    choice("bandwidth", "Bandwidth", "mark.bandwidth", "mark.bandwidth", BANDWIDTH_OPTIONS),
    choice("normalize", "Normalize", "mark.normalize", "mark.normalize", NORMALIZE_OPTIONS),
    choice("rug", "Rug", "mark.rug", "mark.rug", AREA_OPTIONS),
    choice("orientation", "Orientation", "mark.orientation", "mark.orientation", DENSITY_ORIENTATION),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyDensityAction,
  controlState: densityControlState,
};

for (const example of densityExamples) {
  if (example.spec.type !== "density") throw new Error(`${example.id} is not a density`);
}
