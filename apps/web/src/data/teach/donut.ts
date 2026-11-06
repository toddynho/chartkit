/**
 * Teaching copy and curated specs for /docs/charts/donut.
 * Examples are existing donut specs. A spec with the hole closed is a pie
 * and is not listed here.
 */

import {
  applyInnerRadius,
  applyPadAngle,
  applyPalette,
  applySliceLabels,
  applySort,
  applyStartAngle,
  innerRadiusOf,
  padAngleOf,
  paletteMode,
  sliceLabelMode,
  sortMode,
  startAngleMode,
} from "./arc.ts";
import { ARC_LEGEND_OPTIONS, LABEL_OPTIONS, SORT_OPTIONS, START_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { formatNumber, isRecord, playgroundHref, roundStep, specText } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule } from "./types.ts";

export const donutPageTitle = "Donut";

export const donutPageDescription =
  "How to build a ChartKit donut: parts of a whole, when to use it, the data shape, a spec that renders, and the options that define the ring.";

/** Colours from the nursery showcase donut. The palette control writes this list to mark.palette. */
export const DONUT_PALETTE = ["#0f6e56", "#c45c26", "#1d4e89", "#5b4b8a"] as const;

export type DonutExample = TeachExample;

/** Smallest spec that validates and draws. Defaults supply the hole and the gap. */
export const smallestDonutSpec: Record<string, unknown> = {
  version: "1",
  type: "donut",
  data: [
    { label: "Search", value: 42 },
    { label: "Direct", value: 28 },
    { label: "Social", value: 18 },
    { label: "Email", value: 12 },
  ],
  encoding: { x: "label", y: "value" },
  a11y: { alt: "Search is the largest traffic source at 42 percent of sessions." },
};

/**
 * Gallery example `traffic-donut`, the docs eight-source series, and two showcase donuts.
 * `budget-pie` is omitted: it sets mark.innerRadius to 0.
 * Eight session sources uses the donut preview size so the pasted spec matches the picture.
 */
export const donutExamples: DonutExample[] = [
  {
    id: "sessions",
    title: "Sessions by source",
    blurb: "Four slices and a center total.",
    meta: "4 slices",
    spec: {
      version: "1",
      id: "traffic-donut",
      type: "donut",
      data: [
        { source: "Search", sessions: 42 },
        { source: "Direct", sessions: 28 },
        { source: "Social", sessions: 18 },
        { source: "Email", sessions: 12 },
      ],
      encoding: { x: "source", y: "sessions" },
      mark: { innerRadius: 0.62 },
      legend: { position: "bottom" },
      size: { width: 420, height: 340 },
      a11y: { alt: "Search is the largest source at 42 of 100 sessions. Email is the smallest at 12." },
    },
  },
  {
    id: "sources",
    title: "Eight session sources",
    blurb: "Search is the largest of eight session sources. Other is the smallest slice.",
    meta: "8 slices",
    spec: {
      version: "1",
      type: "donut",
      data: [
        { label: "Search", value: 1840 },
        { label: "Direct", value: 1260 },
        { label: "Social", value: 980 },
        { label: "Email", value: 740 },
        { label: "Referral", value: 610 },
        { label: "Affiliates", value: 420 },
        { label: "Partners", value: 280 },
        { label: "Other", value: 160 },
      ],
      encoding: { x: "label", y: "value" },
      mark: { innerRadius: 0.6 },
      legend: true,
      size: { width: 480, height: 420 },
      a11y: { alt: "Search is the largest of eight session sources. Other is the smallest slice." },
    },
  },
  {
    id: "yard",
    title: "What left the yard",
    blurb: "Fern is the largest share of trays that left the yard, then ivy, sage, and rue.",
    meta: "4 slices",
    spec: {
      version: "1",
      id: "low-fern-mix",
      type: "donut",
      theme: "soft",
      data: [
        { kind: "Fern", trays: 86 },
        { kind: "Ivy", trays: 54 },
        { kind: "Sage", trays: 41 },
        { kind: "Rue", trays: 28 },
      ],
      encoding: { x: "kind", y: "trays" },
      mark: { palette: [...DONUT_PALETTE] },
      legend: { position: "bottom", values: true, interactive: true },
      interaction: { select: "point" },
      size: { width: 560, height: 360 },
      a11y: { alt: "Fern is the largest share of trays that left the yard, then ivy, sage, and rue." },
    },
  },
  {
    id: "fleet",
    title: "Fleet",
    blurb: "Slice labels and legend values.",
    meta: "2 slices",
    spec: {
      version: "1",
      id: "bike-fleet",
      type: "donut",
      theme: "soft",
      data: [
        { kind: "Classic", trips: 1840 },
        { kind: "E-bike", trips: 1260 },
      ],
      encoding: { x: "kind", y: "trips" },
      mark: { labels: true },
      legend: { values: true, position: "bottom", interactive: true },
      tooltip: { position: "top", fields: [{ field: "trips", title: "Trips" }] },
      interaction: { select: "point" },
      size: { width: 420, height: 380 },
      a11y: { alt: "Classic bikes take 1,840 trips and e-bikes take 1,260." },
    },
  },
];

export type DonutAction =
  | { type: "innerRadius"; value: number }
  | { type: "padAngle"; value: number }
  | { type: "labels"; value: "off" | "inside" | "outside" }
  | { type: "legend"; value: "off" | "bottom" | "right" }
  | { type: "tooltip"; value: "off" | "on"; restore?: unknown }
  | { type: "palette"; value: "theme" | "set" }
  | { type: "sort"; value: "none" | "asc" | "desc" }
  | { type: "startAngle"; value: number };

export type DonutControlState = {
  innerRadius: number;
  padAngle: number;
  labels: "off" | "inside" | "outside";
  legend: "off" | "bottom" | "right" | "other";
  tooltip: "off" | "on";
  palette: "theme" | "set" | "other";
  sort: "none" | "asc" | "desc";
  startAngle: number | "other";
};

const ARC_LEGEND = { omitted: "bottom" as const, known: ["bottom", "right"] as const };

export function applyDonutAction(spec: Record<string, unknown>, action: DonutAction): void {
  if (action.type === "innerRadius") {
    applyInnerRadius(spec, action.value);
    return;
  }
  if (action.type === "padAngle") {
    applyPadAngle(spec, action.value);
    return;
  }
  if (action.type === "labels") {
    applySliceLabels(spec, action.value);
    return;
  }
  if (action.type === "tooltip") {
    applyTooltip(spec, action.value, action.restore);
    return;
  }
  if (action.type === "palette") {
    applyPalette(spec, action.value, DONUT_PALETTE);
    return;
  }
  if (action.type === "sort") {
    applySort(spec, action.value);
    return;
  }
  if (action.type === "startAngle") {
    applyStartAngle(spec, action.value);
    return;
  }
  applyLegend(spec, action.value);
}

export function donutControlState(spec: Record<string, unknown>): DonutControlState {
  return {
    innerRadius: innerRadiusOf(spec, 0.6),
    padAngle: padAngleOf(spec, 2),
    labels: sliceLabelMode(spec),
    legend: legendChoice(spec, ARC_LEGEND),
    tooltip: tooltipMode(spec),
    palette: paletteMode(spec, DONUT_PALETTE),
    sort: sortMode(spec),
    startAngle: startAngleMode(spec),
  };
}

export function formatDonutNumber(value: number): string {
  return formatNumber(value);
}

export function roundDonut(value: number, step: number): number {
  return roundStep(value, step);
}

export { playgroundHref, specText };

function applyTeach(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "innerRadius" && typeof value === "number") applyDonutAction(spec, { type: "innerRadius", value });
  else if (id === "padAngle" && typeof value === "number") applyDonutAction(spec, { type: "padAngle", value });
  else if (id === "labels" && (value === "off" || value === "inside" || value === "outside")) applyDonutAction(spec, { type: "labels", value });
  else if (id === "legend" && (value === "off" || value === "bottom" || value === "right")) applyDonutAction(spec, { type: "legend", value });
  else if (id === "tooltip" && (value === "off" || value === "on")) applyDonutAction(spec, { type: "tooltip", value, restore: action.restore });
  else if (id === "palette" && (value === "theme" || value === "set")) applyDonutAction(spec, { type: "palette", value });
  else if (id === "sort" && (value === "none" || value === "asc" || value === "desc")) applyDonutAction(spec, { type: "sort", value });
  else if (id === "startAngle") applyDonutAction(spec, { type: "startAngle", value: Number(value) });
}

export const donutTeach: TeachModule = {
  type: "donut",
  title: donutPageTitle,
  description: donutPageDescription,
  examples: donutExamples,
  smallestSpec: smallestDonutSpec,
  controls: [
    { kind: "range", id: "innerRadius", label: "Hole", code: "mark.innerRadius", min: 0.35, max: 0.95, step: 0.01, aria: "mark.innerRadius" },
    { kind: "range", id: "padAngle", label: "Gap", code: "mark.padAngle", min: 0, max: 10, step: 0.5, aria: "mark.padAngle" },
    choice("labels", "Labels", "mark.labels", "mark.labels and mark.labelPosition", LABEL_OPTIONS),
    choice("legend", "Legend", "legend", "legend", ARC_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
    choice("palette", "Colours", "mark.palette", "mark.palette", [
      { value: "theme", label: "Theme" },
      { value: "set", label: "Four colours" },
    ]),
    choice("sort", "Sort", "mark.sort", "mark.sort", SORT_OPTIONS),
    choice("startAngle", "Start", "mark.startAngle", "mark.startAngle", START_OPTIONS),
  ],
  apply: applyTeach,
  controlState: donutControlState,
};

function holeOf(spec: Record<string, unknown>): number | undefined {
  const mark = spec.mark;
  if (!isRecord(mark)) return undefined;
  return typeof mark.innerRadius === "number" ? mark.innerRadius : undefined;
}

for (const example of donutExamples) {
  if (example.spec.type !== "donut") throw new Error(`${example.id} is not a donut`);
  const hole = holeOf(example.spec);
  if (hole !== undefined && hole <= 0) throw new Error(`${example.id} closes the hole. A closed hole is a pie.`);
  if (example.blurb.toLowerCase().includes("hole closed")) throw new Error(`${example.id} describes a closed hole`);
}
