/**
 * Teaching copy and curated specs for /docs/charts/gauge.
 * A gauge is one number on a dial: ticks, a needle, and a center readout.
 * A progress ring is a full circle of progress and has no needle.
 * A KPI is the number first, with no dial.
 * The default sweep is -135° to 135°. The default cap is butt.
 * metric.target is stored on the track. It is not drawn as a mark.
 * Bands are on when the example sets them. Off removes the list. On puts that list back,
 * or writes a low and an OK band when the example omitted them.
 */

import { AREA_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const gaugePageTitle = "Gauge";

export const gaugePageDescription =
  "How to build a ChartKit gauge: one value on a dial, when to use it instead of a progress ring or a KPI, the metric shape, a spec that renders, and the options that define the arc.";

/** README gauge. The dial, the ticks, and the readout use the defaults. */
export const smallestGaugeSpec: Record<string, unknown> = {
  version: "1",
  type: "gauge",
  metric: { label: "Capacity", value: 64, min: 0, max: 100 },
  a11y: { alt: "Capacity is 64 out of 100." },
};

const SWEEP_OPTIONS = [
  { value: "dial", label: "Dial" },
  { value: "half", label: "Half" },
  { value: "full", label: "Full" },
] as const;

const GAUGE_CAP_OPTIONS = [
  { value: "butt", label: "Butt" },
  { value: "round", label: "Round" },
  { value: "square", label: "Square" },
] as const;

/**
 * The core capacity gauge, the launch readiness dial, and the nursery water gauge.
 * Titles are the metric label or the showcase heading.
 */
export const gaugeExamples: TeachExample[] = [
  {
    id: "capacity",
    title: "Capacity",
    blurb: "Capacity is 72 out of 100, below the target of 80.",
    meta: "2 bands",
    spec: {
      version: "1",
      type: "gauge",
      metric: {
        label: "Capacity",
        value: 72,
        min: 0,
        max: 100,
        target: 80,
        format: "integer",
        bands: [
          { from: 0, to: 50, color: "negative", label: "Low" },
          { from: 50, to: 100, color: "positive", label: "OK" },
        ],
      },
      a11y: { alt: "Capacity is 72 out of 100, below the target of 80." },
    },
  },
  {
    id: "readiness",
    title: "Readiness",
    blurb: "The needle reads 72. The target of 80 is stored on the track.",
    meta: "2 bands",
    spec: {
      version: "1",
      id: "cinder-readiness",
      type: "gauge",
      theme: "soft",
      metric: {
        label: "Readiness",
        value: 72,
        min: 0,
        max: 100,
        target: 80,
        format: { style: "number", decimals: 0 },
        bands: [
          { from: 0, to: 50, color: "negative", label: "Hold" },
          { from: 50, to: 100, color: "positive", label: "Go" },
        ],
      },
      size: { width: 420, height: 250 },
      a11y: { alt: "The needle reads 72. A target of 80 is stored on the track." },
    },
  },
  {
    id: "water",
    title: "Water used",
    blurb: "The yard used 64 litres, under the mark of 80.",
    meta: "no bands",
    spec: {
      version: "1",
      id: "low-fern-water",
      type: "gauge",
      theme: "soft",
      metric: {
        label: "Litres",
        value: 64,
        min: 0,
        max: 100,
        target: 80,
        format: { style: "number", decimals: 0 },
      },
      size: { width: 420, height: 280 },
      a11y: { alt: "The yard used 64 litres, under the mark of 80." },
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

/** Two bands across the scale when the example did not set its own. */
function fallbackBands(metric: Record<string, unknown>): Record<string, unknown>[] {
  const min = typeof metric.min === "number" ? metric.min : 0;
  const max = typeof metric.max === "number" ? metric.max : 100;
  const mid = min + (max - min) / 2;
  return [
    { from: min, to: mid, color: "negative", label: "Low" },
    { from: mid, to: max, color: "positive", label: "OK" },
  ];
}

/**
 * Off removes metric.bands.
 * On puts the example's bands back. An example that omitted them gets a low band and an OK band.
 */
export function applyGaugeBands(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = exampleMetric(restore);
  editMetric(spec, (metric) => {
    if (value === "off") {
      delete metric.bands;
      return;
    }
    metric.bands = Array.isArray(source?.bands) ? structuredClone(source.bands) : fallbackBands(metric);
  });
}

export function gaugeBandMode(spec: Record<string, unknown>): "off" | "on" {
  const bands = metricOf(spec).bands;
  return Array.isArray(bands) && bands.length > 0 ? "on" : "off";
}

/** Dial is the default sweep, -135° to 135°. Half is the top semicircle. Full closes the circle. */
export function applyGaugeSweep(spec: Record<string, unknown>, value: "dial" | "half" | "full"): void {
  editMark(spec, (mark) => {
    if (value === "dial") {
      delete mark.startAngle;
      delete mark.endAngle;
      return;
    }
    if (value === "half") {
      mark.startAngle = -90;
      mark.endAngle = 90;
      return;
    }
    mark.startAngle = 0;
    mark.endAngle = 360;
  });
}

export function gaugeSweepMode(spec: Record<string, unknown>): "dial" | "half" | "full" | "other" {
  const mark = markOf(spec);
  const start = mark.startAngle;
  const end = mark.endAngle;
  if (start === undefined && end === undefined) return "dial";
  if (start === -135 && end === 135) return "dial";
  if (start === -90 && end === 90) return "half";
  if (start === 0 && end === 360) return "full";
  return "other";
}

/** Omitted cap is butt. Butt removes the key. */
export function applyGaugeLinecap(spec: Record<string, unknown>, value: "butt" | "round" | "square"): void {
  editMark(spec, (mark) => {
    if (value === "butt") delete mark.linecap;
    else mark.linecap = value;
  });
}

export function gaugeLinecapMode(spec: Record<string, unknown>): "butt" | "round" | "square" | "other" {
  const cap = markOf(spec).linecap;
  if (cap === undefined || cap === "butt") return "butt";
  if (cap === "round" || cap === "square") return cap;
  return "other";
}

export function applyGaugeAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "bands" && (value === "off" || value === "on")) {
    applyGaugeBands(spec, value, action.restore);
    return;
  }
  if (id === "sweep" && (value === "dial" || value === "half" || value === "full")) {
    applyGaugeSweep(spec, value);
    return;
  }
  if (id === "linecap" && (value === "butt" || value === "round" || value === "square")) {
    applyGaugeLinecap(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function gaugeControlState(spec: Record<string, unknown>): TeachState {
  return {
    bands: gaugeBandMode(spec),
    sweep: gaugeSweepMode(spec),
    linecap: gaugeLinecapMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const gaugeTeach: TeachModule = {
  type: "gauge",
  title: gaugePageTitle,
  description: gaugePageDescription,
  examples: gaugeExamples,
  smallestSpec: smallestGaugeSpec,
  controls: [
    choice("bands", "Bands", "metric.bands", "metric.bands", AREA_OPTIONS),
    choice("sweep", "Sweep", "mark.startAngle", "mark.startAngle and mark.endAngle", SWEEP_OPTIONS),
    choice("linecap", "Cap", "mark.linecap", "mark.linecap", GAUGE_CAP_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyGaugeAction,
  controlState: gaugeControlState,
};

for (const example of gaugeExamples) {
  if (example.spec.type !== "gauge") throw new Error(`${example.id} is not a gauge`);
}
