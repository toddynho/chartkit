/**
 * Teaching copy and curated specs for /docs/charts/kpi.
 * A KPI is a number first: a label, a formatted value, a delta, and an optional sparkline.
 * A gauge is a dial. Use a KPI when the figure is the point.
 * goodDirection down paints a falling delta as the good color.
 * The sparkline is the data array. Off removes it. On puts that array back.
 * Thresholds color the card. Off removes the steps. On puts the example's steps back,
 * or one positive step when the example omitted them.
 */

import { AREA_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const kpiPageTitle = "KPI";

export const kpiPageDescription =
  "How to build a ChartKit KPI: a number first, when to use it instead of a gauge, the metric shape, a spec that renders, and the options that define the card.";

/** README KPI. No sparkline. Up is the good direction. The surface stays the theme surface. */
export const smallestKpiSpec: Record<string, unknown> = {
  version: "1",
  type: "kpi",
  metric: { label: "Tickets", value: 18, delta: -0.05 },
  a11y: { alt: "Open tickets are 18, slightly down." },
};

const DIRECTION_OPTIONS = [
  { value: "up", label: "Up" },
  { value: "down", label: "Down" },
] as const;

const FORMAT_OPTIONS = [
  { value: "compact", label: "Compact" },
  { value: "number", label: "Number" },
  { value: "percent", label: "Percent" },
] as const;

const KPI_FORMATS = new Set(["compact", "number", "percent"]);

/**
 * The core revenue card, the roastery green-bean bill, and the churn card.
 * Titles are the hero title, the showcase heading, and the dashboard heading.
 */
export const kpiExamples: TeachExample[] = [
  {
    id: "revenue",
    title: "Revenue",
    blurb: "Revenue is 125,000, up 12.5 percent versus the previous period.",
    meta: "sparkline",
    spec: {
      version: "1",
      type: "kpi",
      metric: { label: "Revenue", value: 125000, delta: 0.125, format: "compact" },
      data: [10, 12, 9, 14, 18, 17],
      a11y: { alt: "Revenue is 125,000, up 12.5 percent versus the previous period." },
    },
  },
  {
    id: "beans",
    title: "Green beans",
    blurb: "The green-bean bill is 24,600 pounds, down 6 percent, which is the good direction.",
    meta: "down is good",
    spec: {
      version: "1",
      id: "roastery-beans",
      type: "kpi",
      theme: "soft",
      locale: "en-GB",
      metric: {
        label: "Green beans",
        value: 24600,
        delta: -0.06,
        format: { style: "currency", currency: "GBP", decimals: 0 },
        goodDirection: "down",
      },
      data: [9, 8, 8, 7, 7, 6, 6],
      size: { width: 420, height: 240 },
      a11y: { alt: "The green-bean bill is 24,600 pounds, down 6 percent, which is the good direction." },
    },
  },
  {
    id: "churn",
    title: "Churn",
    blurb: "Logo churn is 2.4 percent, down 8 percent.",
    meta: "thresholds",
    spec: {
      version: "1",
      type: "kpi",
      theme: "soft",
      data: [3.4, 3.1, 2.9, 2.7, 2.6, 2.4],
      metric: {
        label: "Churn",
        value: 2.4,
        delta: -0.08,
        format: { style: "number", decimals: 1, suffix: "%" },
        goodDirection: "down",
        thresholds: [
          { value: 0, color: "#1f8a70" },
          { value: 3, color: "#f4b183" },
          { value: 5, color: "#d92d20" },
        ],
      },
      mark: { fillOpacity: 0.16, strokeWidth: 1.5 },
      size: { width: 300, height: 96 },
      a11y: { alt: "Logo churn is 2.4 percent, down 8 percent." },
    },
  },
];

function metricOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.metric) ? spec.metric : {};
}

function editMetric(spec: Record<string, unknown>, edit: (metric: Record<string, unknown>) => void): void {
  const metric: Record<string, unknown> = isRecord(spec.metric) ? { ...spec.metric } : {};
  edit(metric);
  spec.metric = metric;
}

function exampleSpec(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) ? restore : undefined;
}

/** Up is the default. Up removes the key. Down writes goodDirection down. */
export function applyKpiDirection(spec: Record<string, unknown>, value: "up" | "down"): void {
  editMetric(spec, (metric) => {
    if (value === "down") metric.goodDirection = "down";
    else delete metric.goodDirection;
  });
}

export function kpiDirectionMode(spec: Record<string, unknown>): "up" | "down" {
  return metricOf(spec).goodDirection === "down" ? "down" : "up";
}

/** A preset string. An object format, or any other preset, reads as other so no button is pressed. */
export function applyKpiFormat(spec: Record<string, unknown>, value: "compact" | "number" | "percent"): void {
  editMetric(spec, (metric) => {
    metric.format = value;
  });
}

export function kpiFormatMode(spec: Record<string, unknown>): "compact" | "number" | "percent" | "other" {
  const format = metricOf(spec).format;
  if (typeof format === "string" && KPI_FORMATS.has(format)) return format as "compact" | "number" | "percent";
  return "other";
}

/**
 * Off removes data, so the sparkline goes away.
 * On puts the example's data array back. An example that omitted data stays a number only.
 */
export function applyKpiSparkline(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = exampleSpec(restore);
  if (value === "off") {
    delete spec.data;
    return;
  }
  if (source && source.data !== undefined) spec.data = structuredClone(source.data);
  else delete spec.data;
}

export function kpiSparklineMode(spec: Record<string, unknown>): "off" | "on" {
  return spec.data === undefined ? "off" : "on";
}

/**
 * Off removes metric.thresholds.
 * On puts the example's steps back. An example that omitted them gets one positive step at 0.
 */
export function applyKpiThresholds(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = exampleSpec(restore);
  const saved = source && isRecord(source.metric) ? source.metric.thresholds : undefined;
  editMetric(spec, (metric) => {
    if (value === "off") {
      delete metric.thresholds;
      return;
    }
    metric.thresholds = Array.isArray(saved) ? structuredClone(saved) : [{ value: 0, color: "positive" }];
  });
}

export function kpiThresholdMode(spec: Record<string, unknown>): "off" | "on" {
  const steps = metricOf(spec).thresholds;
  return Array.isArray(steps) && steps.length > 0 ? "on" : "off";
}

export function applyKpiAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "direction" && (value === "up" || value === "down")) {
    applyKpiDirection(spec, value);
    return;
  }
  if (id === "format" && (value === "compact" || value === "number" || value === "percent")) {
    applyKpiFormat(spec, value);
    return;
  }
  if (id === "sparkline" && (value === "off" || value === "on")) {
    applyKpiSparkline(spec, value, action.restore);
    return;
  }
  if (id === "thresholds" && (value === "off" || value === "on")) {
    applyKpiThresholds(spec, value, action.restore);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function kpiControlState(spec: Record<string, unknown>): TeachState {
  return {
    direction: kpiDirectionMode(spec),
    format: kpiFormatMode(spec),
    sparkline: kpiSparklineMode(spec),
    thresholds: kpiThresholdMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const kpiTeach: TeachModule = {
  type: "kpi",
  title: kpiPageTitle,
  description: kpiPageDescription,
  examples: kpiExamples,
  smallestSpec: smallestKpiSpec,
  controls: [
    choice("direction", "Good when", "metric.goodDirection", "metric.goodDirection", DIRECTION_OPTIONS),
    choice("format", "Format", "metric.format", "metric.format", FORMAT_OPTIONS),
    choice("sparkline", "Sparkline", "data", "data", AREA_OPTIONS),
    choice("thresholds", "Thresholds", "metric.thresholds", "metric.thresholds", AREA_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyKpiAction,
  controlState: kpiControlState,
};

for (const example of kpiExamples) {
  if (example.spec.type !== "kpi") throw new Error(`${example.id} is not a kpi`);
}
