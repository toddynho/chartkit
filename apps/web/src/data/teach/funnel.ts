/**
 * Teaching copy and curated specs for /docs/charts/funnel.
 * A funnel is stages in data order. Width comes from the value.
 * mark.shape is the geometry a first funnel sets. mark.sort and mark.orientation
 * do not apply to this type, so they are not controls.
 * Labels are on when the key is omitted. Off writes false. On puts the example's labels back.
 */

import { AREA_OPTIONS, LINE_LEGEND_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend } from "./legend.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const funnelPageTitle = "Funnel";

export const funnelPageDescription =
  "How to build a ChartKit funnel: stages in order, width from the value, when to use it instead of a bar, the data shape, a spec that renders, and the options that define the stages.";

/** README funnel. Three stages, trapezoid geometry, labels on. mark can be omitted. */
export const smallestFunnelSpec: Record<string, unknown> = {
  version: "1",
  type: "funnel",
  data: [
    { stage: "Visit", count: 80 },
    { stage: "Start", count: 40 },
    { stage: "Pay", count: 12 },
  ],
  encoding: { x: "stage", y: "count" },
  a11y: { alt: "12 of 80 visits pay." },
};

const SHAPE_OPTIONS = [
  { value: "trapezoid", label: "Trapezoid" },
  { value: "bar", label: "Bar" },
] as const;

/**
 * The core signup funnel, the launch-manifest queue, and the hall booking path.
 * Titles are the spec title or the showcase chart title.
 */
export const funnelExamples: TeachExample[] = [
  {
    id: "signup",
    title: "Signup funnel",
    blurb: "640 of 12,840 visits pay, and the biggest drop is from visit to signup.",
    meta: "5 stages",
    spec: {
      version: "1",
      type: "funnel",
      title: "Signup funnel",
      data: [
        { stage: "Visit", count: 12840 },
        { stage: "Signup", count: 5420 },
        { stage: "Activate", count: 2610 },
        { stage: "Trial", count: 1380 },
        { stage: "Pay", count: 640 },
      ],
      encoding: { x: "stage", y: "count" },
      a11y: { alt: "640 of 12,840 visits pay, and the biggest drop is from visit to signup." },
    },
  },
  {
    id: "pitch",
    title: "From pitch to liftoff",
    blurb: "How many proposals are still in the queue.",
    meta: "5 stages",
    spec: {
      version: "1",
      id: "northline-funnel",
      type: "funnel",
      theme: "soft",
      data: [
        { stage: "Pitch", count: 48 },
        { stage: "Shortlist", count: 22 },
        { stage: "Pad slot", count: 9 },
        { stage: "Stacked", count: 4 },
        { stage: "Away", count: 1 },
      ],
      encoding: { x: "stage", y: "count" },
      legend: { position: "top" },
      size: { width: 720, height: 380 },
      a11y: { alt: "Forty-eight pitches narrow to one vehicle that leaves the pad." },
    },
  },
  {
    id: "enquiry",
    title: "From enquiry to a seat",
    blurb: "The legend names each stage. Most of the drop is between enquiry and a hold.",
    meta: "4 stages",
    spec: {
      version: "1",
      id: "marlow-path",
      type: "funnel",
      theme: "soft",
      data: [
        { stage: "Enquiry", people: 240 },
        { stage: "Hold", people: 150 },
        { stage: "Paid", people: 96 },
        { stage: "Seated", people: 81 },
      ],
      encoding: { x: "stage", y: "people" },
      legend: { position: "top" },
      mark: { shape: "trapezoid" },
      size: { width: 520, height: 420 },
      a11y: { alt: "240 enquiries become 150 holds, 96 paid, and 81 seated." },
    },
  },
];

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

export function applyFunnelShape(spec: Record<string, unknown>, value: "trapezoid" | "bar"): void {
  editMark(spec, (mark) => {
    mark.shape = value;
  });
}

/** Omitted shape is the tapering funnel. */
export function funnelShapeMode(spec: Record<string, unknown>): "trapezoid" | "bar" | "other" {
  const shape = markOf(spec).shape;
  if (shape === undefined || shape === "trapezoid") return "trapezoid";
  if (shape === "bar") return "bar";
  return "other";
}

function exampleMark(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) && isRecord(restore.mark) ? restore.mark : undefined;
}

/**
 * Off writes mark.labels false and clears a value format.
 * On puts back the example's labels key and format. An omitted key is deleted, because omission means on.
 */
export function applyFunnelLabels(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = exampleMark(restore);
  editMark(spec, (mark) => {
    if (value === "off") {
      mark.labels = false;
      delete mark.labelFormat;
      return;
    }
    if (source?.labels === true) mark.labels = true;
    else if (source?.labels === false) mark.labels = false;
    else delete mark.labels;
    if (source && source.labelFormat !== undefined) mark.labelFormat = structuredClone(source.labelFormat);
    else delete mark.labelFormat;
  });
}

/** Omitted labels are on. false is off. */
export function funnelLabelMode(spec: Record<string, unknown>): "off" | "on" {
  return markOf(spec).labels === false ? "off" : "on";
}

/**
 * A funnel draws no legend until one is asked for. Omitted and false are off.
 * true, and an object with no position, sit on top.
 */
export function funnelLegendMode(spec: Record<string, unknown>): "off" | "top" | "bottom" | "right" | "other" {
  const legend = spec.legend;
  if (legend == null || legend === false) return "off";
  if (legend === true) return "top";
  if (!isRecord(legend) || legend.show === false) return "off";
  const position = legend.position;
  if (position === undefined) return "top";
  if (position === "top" || position === "bottom" || position === "right") return position;
  return "other";
}

export function applyFunnelAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "shape" && (value === "trapezoid" || value === "bar")) {
    applyFunnelShape(spec, value);
    return;
  }
  if (id === "labels" && (value === "off" || value === "on")) {
    applyFunnelLabels(spec, value, action.restore);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function funnelControlState(spec: Record<string, unknown>): TeachState {
  return {
    shape: funnelShapeMode(spec),
    labels: funnelLabelMode(spec),
    legend: funnelLegendMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const funnelTeach: TeachModule = {
  type: "funnel",
  title: funnelPageTitle,
  description: funnelPageDescription,
  examples: funnelExamples,
  smallestSpec: smallestFunnelSpec,
  controls: [
    choice("shape", "Shape", "mark.shape", "mark.shape", SHAPE_OPTIONS),
    choice("labels", "Labels", "mark.labels", "mark.labels", AREA_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyFunnelAction,
  controlState: funnelControlState,
};

for (const example of funnelExamples) {
  if (example.spec.type !== "funnel") throw new Error(`${example.id} is not a funnel`);
}
