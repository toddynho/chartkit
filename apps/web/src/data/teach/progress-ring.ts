/**
 * Teaching copy and curated specs for /docs/charts/progress-ring.
 * One value between min and max, drawn as an arc on a circular track.
 * A donut splits a total into slices. A gauge is a dial with a needle and ticks.
 * Omit metric.format and the center is the share of the range. A format prints the value.
 * The default cap is round. The default sweep is a full circle, 0° to 360°.
 * mark.rings draws concentric goals, outer first. That list is the example, not a toggle,
 * because turning rings on for a single value would replace that value.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const progressRingPageTitle = "Progress ring";

export const progressRingPageDescription =
  "How to build a ChartKit progress ring: one value as a share of a maximum, when to use it instead of a donut or a gauge, the metric shape, a spec that renders, and the options that define the ring.";

/** README progress ring. The center is the share, because format is omitted. The cap and the sweep use the defaults. */
export const smallestProgressRingSpec: Record<string, unknown> = {
  version: "1",
  type: "progress-ring",
  metric: { label: "Done", value: 3, min: 0, max: 8 },
  a11y: { alt: "3 of 8 items are done." },
};

const READOUT_OPTIONS = [
  { value: "share", label: "Share" },
  { value: "value", label: "Value" },
] as const;

const RING_CAP_OPTIONS = [
  { value: "round", label: "Round" },
  { value: "butt", label: "Butt" },
  { value: "square", label: "Square" },
] as const;

const SPAN_OPTIONS = [
  { value: "full", label: "Full" },
  { value: "open", label: "Open" },
] as const;

/**
 * The core uptime ring, the launch checks ring, and the activity rings.
 * Titles are the hero title, the showcase heading, and the dashboard heading.
 */
export const progressRingExamples: TeachExample[] = [
  {
    id: "uptime",
    title: "Uptime",
    blurb: "Uptime is 99.2 percent.",
    meta: "99.2%",
    spec: {
      version: "1",
      type: "progress-ring",
      metric: {
        label: "Uptime",
        value: 99.2,
        min: 0,
        max: 100,
        format: { style: "number", decimals: 1, suffix: "%" },
      },
      a11y: { alt: "Uptime is 99.2 percent." },
    },
  },
  {
    id: "checks",
    title: "Checks closed",
    blurb: "Seven of ten pre-flight checks are closed.",
    meta: "7 of 10",
    spec: {
      version: "1",
      id: "cinder-checks",
      type: "progress-ring",
      theme: "soft",
      metric: {
        label: "Checks",
        value: 7,
        min: 0,
        max: 10,
        format: { style: "number", decimals: 0 },
      },
      size: { width: 240, height: 240 },
      a11y: { alt: "Seven of ten pre-flight checks are closed." },
    },
  },
  {
    id: "activity",
    title: "Activity",
    blurb: "Move is 530 of 600, exercise is 32 of 45 minutes, and stand is 10 of 12 hours.",
    meta: "3 rings",
    spec: {
      version: "1",
      type: "progress-ring",
      theme: "soft",
      metric: { label: "Today", value: 530, min: 0, max: 600 },
      mark: {
        rings: [
          { value: 530, max: 600, color: "#ff375f", label: "Move" },
          { value: 32, max: 45, color: "#30d158", label: "Exercise" },
          { value: 10, max: 12, color: "#0a84ff", label: "Stand" },
        ],
      },
      size: { width: 460, height: 320 },
      a11y: { alt: "Move is 530 of 600, exercise is 32 of 45 minutes, and stand is 10 of 12 hours." },
    },
  },
];

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

function metricOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.metric) ? spec.metric : {};
}

function editMetric(spec: Record<string, unknown>, edit: (metric: Record<string, unknown>) => void): void {
  const metric: Record<string, unknown> = isRecord(spec.metric) ? { ...spec.metric } : {};
  edit(metric);
  spec.metric = metric;
}

function exampleMetric(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) && isRecord(restore.metric) ? restore.metric : undefined;
}

/**
 * Share removes metric.format. The center is then the percent of the range.
 * Value puts the example's format back. An example that omitted it gets "number".
 */
export function applyRingReadout(spec: Record<string, unknown>, value: "share" | "value", restore?: unknown): void {
  const source = exampleMetric(restore);
  editMetric(spec, (metric) => {
    if (value === "share") {
      delete metric.format;
      return;
    }
    if (source && source.format !== undefined) metric.format = structuredClone(source.format);
    else metric.format = "number";
  });
}

export function ringReadoutMode(spec: Record<string, unknown>): "share" | "value" {
  return metricOf(spec).format === undefined ? "share" : "value";
}

/** Omitted cap is round. Round removes the key. */
export function applyRingLinecap(spec: Record<string, unknown>, value: "round" | "butt" | "square"): void {
  editMark(spec, (mark) => {
    if (value === "round") delete mark.linecap;
    else mark.linecap = value;
  });
}

export function ringLinecapMode(spec: Record<string, unknown>): "round" | "butt" | "square" | "other" {
  const cap = markOf(spec).linecap;
  if (cap === undefined || cap === "round") return "round";
  if (cap === "butt" || cap === "square") return cap;
  return "other";
}

/** Full is the default circle. Open is 0° to 270°. */
export function applyRingSpan(spec: Record<string, unknown>, value: "full" | "open"): void {
  editMark(spec, (mark) => {
    if (value === "full") {
      delete mark.startAngle;
      delete mark.endAngle;
      return;
    }
    mark.startAngle = 0;
    mark.endAngle = 270;
  });
}

export function ringSpanMode(spec: Record<string, unknown>): "full" | "open" | "other" {
  const mark = markOf(spec);
  const start = mark.startAngle;
  const end = mark.endAngle;
  if (start === undefined && end === undefined) return "full";
  if (start === 0 && end === 360) return "full";
  if ((start === undefined || start === 0) && end === 270) return "open";
  return "other";
}

export function applyProgressRingAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "readout" && (value === "share" || value === "value")) {
    applyRingReadout(spec, value, action.restore);
    return;
  }
  if (id === "linecap" && (value === "round" || value === "butt" || value === "square")) {
    applyRingLinecap(spec, value);
    return;
  }
  if (id === "span" && (value === "full" || value === "open")) {
    applyRingSpan(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function progressRingControlState(spec: Record<string, unknown>): TeachState {
  return {
    readout: ringReadoutMode(spec),
    linecap: ringLinecapMode(spec),
    span: ringSpanMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const progressRingTeach: TeachModule = {
  type: "progress-ring",
  title: progressRingPageTitle,
  description: progressRingPageDescription,
  examples: progressRingExamples,
  smallestSpec: smallestProgressRingSpec,
  controls: [
    choice("readout", "Center", "metric.format", "metric.format", READOUT_OPTIONS),
    choice("linecap", "Cap", "mark.linecap", "mark.linecap", RING_CAP_OPTIONS),
    choice("span", "Sweep", "mark.endAngle", "mark.startAngle and mark.endAngle", SPAN_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyProgressRingAction,
  controlState: progressRingControlState,
};

for (const example of progressRingExamples) {
  if (example.spec.type !== "progress-ring") throw new Error(`${example.id} is not a progress ring`);
}
