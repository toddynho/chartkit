/**
 * Teaching copy and curated specs for /docs/charts/spike.
 * A spike is a thin stem from mark.baseline. Axes are on unless the spec turns them off.
 * Baseline is the spike-only key a first spike sets when the origin is not zero.
 * The slider covers 0 to 12. Any other number still belongs in the spec.
 * Opacity, stroke width, sampling, and axis titles stay in the playground.
 * There is no legend control: a spike is one series and does not paint a legend.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachRangeControl, TeachState } from "./types.ts";

export const spikePageTitle = "Spike";

export const spikePageDescription =
  "How to build a ChartKit spike: thin stems for bursts over time, when to use it instead of a bar or a sparkline, the data shape, a spec that renders, and the baseline the stems rise from.";

/** Three numbers. The field is value, x is the index, and the baseline is 0. */
export const smallestSpikeSpec: Record<string, unknown> = {
  version: "1",
  type: "spike",
  data: [0, 6, 1],
  a11y: { alt: "Hits spike at the second bucket." },
};

const blocked = [
  { time: "00:00", count: 1 },
  { time: "00:05", count: 0 },
  { time: "00:10", count: 8 },
  { time: "00:15", count: 2 },
  { time: "00:20", count: 0 },
  { time: "00:25", count: 14 },
];

const ridge = [24, 7, 8, 9, 10, 10, 11, 11, 11, 11, 10, 27, 8, 7, 6, 5].map((jolts, index) => ({
  hour: index + 1,
  jolts,
}));

/**
 * Core blocked-requests example, and the showcase "Ridge, as spikes".
 * Ridge keeps its size and axis titles, and names the tooltip fields.
 */
export const spikeExamples: TeachExample[] = [
  {
    id: "blocked",
    title: "Blocked requests",
    blurb: "Five-minute buckets. The count stays low, then hits 14.",
    meta: "6 buckets",
    spec: {
      version: "1",
      type: "spike",
      title: "Blocked requests",
      data: blocked,
      encoding: { x: "time", y: "count" },
      mark: { baseline: 0 },
      a11y: { alt: "Blocked requests stayed low, then spiked to 14 at 00:25." },
    },
  },
  {
    id: "ridge",
    title: "Ridge, as spikes",
    blurb: "One stem per hour. The spec sets the size and names the axes.",
    meta: "16 hours",
    spec: {
      version: "1",
      id: "ashmere-spikes",
      type: "spike",
      data: ridge,
      encoding: { x: { field: "hour", type: "quantitative" }, y: "jolts" },
      mark: { baseline: 0 },
      axes: { x: { title: "Hour" }, y: { title: "Jolts" } },
      tooltip: { fields: ["hour", { field: "jolts", title: "Jolts" }] },
      size: { width: 640, height: 280 },
      a11y: { alt: "Ridge stays in single digits, then jumps above twenty once in the first sixteen hours." },
    },
  },
];

const baselineControl: TeachRangeControl = {
  kind: "range",
  id: "baseline",
  label: "Baseline",
  code: "mark.baseline",
  min: 0,
  max: 12,
  step: 1,
  aria: "mark.baseline",
};

export function applySpikeBaseline(spec: Record<string, unknown>, value: number): void {
  if (!Number.isFinite(value)) return;
  editMark(spec, (mark) => {
    mark.baseline = value;
  });
}

/** Omitted baseline is 0. */
export function spikeBaseline(spec: Record<string, unknown>): number {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  return typeof mark.baseline === "number" && Number.isFinite(mark.baseline) ? mark.baseline : 0;
}

export function applySpikeAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "baseline" && typeof value === "number") {
    applySpikeBaseline(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function spikeControlState(spec: Record<string, unknown>): TeachState {
  return {
    baseline: spikeBaseline(spec),
    tooltip: tooltipMode(spec),
  };
}

export const spikeTeach: TeachModule = {
  type: "spike",
  title: spikePageTitle,
  description: spikePageDescription,
  examples: spikeExamples,
  smallestSpec: smallestSpikeSpec,
  controls: [baselineControl, choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS)],
  apply: applySpikeAction,
  controlState: spikeControlState,
};

for (const example of spikeExamples) {
  if (example.spec.type !== "spike") throw new Error(`${example.id} is not a spike`);
}
