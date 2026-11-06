/**
 * Teaching copy and curated specs for /docs/charts/streamgraph.
 * Layers stack around a moving baseline. The default offset is wiggle, not zero.
 * silhouette is the same picture as center. mark.stack is not this chart's stack.
 * Omitted order is inside-out on wiggle, and first-seen order otherwise.
 * A legend is on, at the top, when several series are drawn.
 * Tooltip is on when the key is omitted.
 */

import { CURVE_OPTIONS, LINE_LEGEND_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyCurve, curveMode } from "./line-mark.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const streamgraphPageTitle = "Streamgraph";

export const streamgraphPageDescription =
  "How to build a ChartKit streamgraph: stacked layers around a moving baseline, when to use it instead of a stacked area, the data shape, a spec that renders, and the options that set the offset.";

/** Design-doc streamgraph. Two genres, three years. Wiggle, inside-out, monotone. The baseline is not zero. */
export const smallestStreamgraphSpec: Record<string, unknown> = {
  version: "1",
  type: "streamgraph",
  data: [
    { year: "2020", fiction: 20, history: 12 },
    { year: "2021", fiction: 28, history: 18 },
    { year: "2022", fiction: 22, history: 30 },
  ],
  encoding: { x: "year", y: ["fiction", "history"] },
  a11y: { alt: "History overtook fiction by 2022. The baseline is not zero." },
};

const OFFSET_OPTIONS = [
  { value: "wiggle", label: "Wiggle" },
  { value: "center", label: "Center" },
  { value: "zero", label: "Zero" },
  { value: "expand", label: "Expand" },
] as const;

const ORDER_OPTIONS = [
  { value: "inside-out", label: "Inside-out" },
  { value: "none", label: "As listed" },
  { value: "ascending", label: "Ascending" },
  { value: "descending", label: "Descending" },
] as const;

const STREAM_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

/**
 * Copies by genre is the wiggle gallery chart.
 * Centered genres is long data, centered, with the legend on the right.
 * Weekly streams is the share offset on a time axis. The gallery tile calls it Weekly share.
 * The visual-catalog streamgraph is Copies by genre with fewer years, so it is not a fourth example.
 */
export const streamgraphExamples: TeachExample[] = [
  {
    id: "copies",
    title: "Copies by genre",
    blurb: "History overtook fiction in 2022. Science keeps climbing. The baseline is not zero.",
    meta: "4 series",
    spec: {
      version: "1",
      type: "streamgraph",
      title: "Copies by genre",
      data: [
        { year: "2018", fiction: 18, history: 8, poetry: 6, science: 4 },
        { year: "2019", fiction: 22, history: 11, poetry: 7, science: 6 },
        { year: "2020", fiction: 26, history: 14, poetry: 8, science: 7 },
        { year: "2021", fiction: 28, history: 20, poetry: 9, science: 10 },
        { year: "2022", fiction: 22, history: 30, poetry: 11, science: 14 },
        { year: "2023", fiction: 20, history: 34, poetry: 12, science: 16 },
        { year: "2024", fiction: 18, history: 36, poetry: 13, science: 18 },
        { year: "2025", fiction: 16, history: 33, poetry: 14, science: 20 },
      ],
      encoding: {
        x: { field: "year", title: "Year" },
        y: ["fiction", "history", "poetry", "science"],
      },
      mark: { labels: true },
      a11y: { alt: "History overtook fiction in 2022. The baseline is not zero." },
    },
  },
  {
    id: "centered",
    title: "Centered genres",
    blurb: "Long rows, each column centered, legend on the right.",
    meta: "2 series",
    spec: {
      version: "1",
      type: "streamgraph",
      title: "Centered genres",
      data: [
        { year: "2020", genre: "Fiction", copies: 20 },
        { year: "2020", genre: "History", copies: 12 },
        { year: "2021", genre: "Fiction", copies: 28 },
        { year: "2021", genre: "History", copies: 18 },
        { year: "2022", genre: "Fiction", copies: 22 },
        { year: "2022", genre: "History", copies: 30 },
      ],
      encoding: { x: "year", y: "copies", color: "genre" },
      mark: { streamOffset: "center", order: "none" },
      legend: { position: "right" },
      a11y: { alt: "Fiction stays the larger share in 2020. Layers are centered, not stacked on zero." },
    },
  },
  {
    id: "weekly",
    title: "Weekly streams",
    blurb: "Video's share grows through 2024. The layers are shares, not counts.",
    meta: "expand",
    spec: {
      version: "1",
      type: "streamgraph",
      title: "Weekly streams",
      data: [
        { week: "2024-01-01", audio: 12, video: 8 },
        { week: "2024-04-01", audio: 18, video: 14 },
        { week: "2024-07-01", audio: 16, video: 22 },
        { week: "2024-10-01", audio: 20, video: 26 },
      ],
      encoding: { x: "week", y: ["audio", "video"] },
      mark: { labels: true, streamOffset: "expand" },
      timezone: "UTC",
      a11y: { alt: "Video's share grows through 2024. The layers are shares, not counts." },
    },
  },
];

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

export function applyStreamOffset(spec: Record<string, unknown>, value: "wiggle" | "center" | "zero" | "expand"): void {
  editMark(spec, (mark) => {
    mark.streamOffset = value;
  });
}

/** Omitted offset is wiggle. silhouette is center. */
export function streamOffsetMode(spec: Record<string, unknown>): "wiggle" | "center" | "zero" | "expand" | "other" {
  const offset = markOf(spec).streamOffset;
  if (offset === undefined || offset === "wiggle") return "wiggle";
  if (offset === "center" || offset === "silhouette") return "center";
  if (offset === "zero" || offset === "expand") return offset;
  return "other";
}

export function applyStreamOrder(spec: Record<string, unknown>, value: "inside-out" | "none" | "ascending" | "descending"): void {
  editMark(spec, (mark) => {
    mark.order = value;
  });
}

/** Omitted order is inside-out when the offset is wiggle, and first-seen order otherwise. */
export function streamOrderMode(spec: Record<string, unknown>): "inside-out" | "none" | "ascending" | "descending" | "other" {
  const order = markOf(spec).order;
  if (order === "inside-out" || order === "none" || order === "ascending" || order === "descending") return order;
  if (order !== undefined) return "other";
  return streamOffsetMode(spec) === "wiggle" ? "inside-out" : "none";
}

export function applyStreamgraphAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "offset" && (value === "wiggle" || value === "center" || value === "zero" || value === "expand")) {
    applyStreamOffset(spec, value);
    return;
  }
  if (id === "order" && (value === "inside-out" || value === "none" || value === "ascending" || value === "descending")) {
    applyStreamOrder(spec, value);
    return;
  }
  if (id === "curve" && (value === "monotone" || value === "linear" || value === "step")) {
    applyCurve(spec, value);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function streamgraphControlState(spec: Record<string, unknown>): TeachState {
  return {
    offset: streamOffsetMode(spec),
    order: streamOrderMode(spec),
    curve: curveMode(spec),
    legend: legendChoice(spec, STREAM_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const streamgraphTeach: TeachModule = {
  type: "streamgraph",
  title: streamgraphPageTitle,
  description: streamgraphPageDescription,
  examples: streamgraphExamples,
  smallestSpec: smallestStreamgraphSpec,
  controls: [
    choice("offset", "Offset", "mark.streamOffset", "mark.streamOffset", OFFSET_OPTIONS),
    choice("order", "Order", "mark.order", "mark.order", ORDER_OPTIONS),
    choice("curve", "Curve", "mark.curve", "mark.curve", CURVE_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyStreamgraphAction,
  controlState: streamgraphControlState,
};

for (const example of streamgraphExamples) {
  if (example.spec.type !== "streamgraph") throw new Error(`${example.id} is not a streamgraph`);
}
