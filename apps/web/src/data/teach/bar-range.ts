/**
 * Teaching copy and curated specs for /docs/charts/bar-range.
 * A floating bar from a low to a high. It does not start at zero.
 * A bar encodes one amount from the baseline. An error bar marks a center and draws whiskers.
 * This type has no mark option a first chart sets. Tooltip is the shared key on that chart.
 * The renderer does not draw a legend, so this page has no legend control.
 * Theme preset chips are not on this page.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const barRangePageTitle = "Range bar";

export const barRangePageDescription =
  "How to build a ChartKit range bar: a floating bar from low to high, when to use it instead of a bar or an error bar, the data shape, a spec that renders, and the tooltip on that first chart.";

/** Core example 31-bar-range.json with the title left off. low and high are the ends. */
export const smallestBarRangeSpec: Record<string, unknown> = {
  version: "1",
  type: "bar-range",
  data: [
    { month: "Jan", min: -2, max: 6 },
    { month: "Apr", min: 6, max: 17 },
    { month: "Jul", min: 17, max: 29 },
    { month: "Oct", min: 7, max: 18 },
  ],
  encoding: { x: "month", low: "min", high: "max" },
  axes: { y: { format: { style: "number", suffix: "°C" } } },
  a11y: { alt: "July is the warmest month, from 17 to 29." },
};

/**
 * The gallery temperature span, with the four months from the core example,
 * and the Pell glasshouse showcase. Titles stay as published.
 */
export const barRangeExamples: TeachExample[] = [
  {
    id: "temperature",
    title: "Monthly temperature",
    blurb: "Each month floats from its low to its high.",
    meta: "4 months",
    spec: {
      version: "1",
      id: "temperature-range",
      type: "bar-range",
      title: "Temperature",
      data: [
        { month: "Jan", min: -2, max: 6 },
        { month: "Apr", min: 6, max: 17 },
        { month: "Jul", min: 17, max: 29 },
        { month: "Oct", min: 7, max: 18 },
      ],
      encoding: { x: "month", low: "min", high: "max" },
      axes: { y: { format: { style: "number", suffix: "°C" } } },
      size: { width: 560, height: 280 },
      a11y: { alt: "July is the warmest month, from 17 to 29." },
    },
  },
  {
    id: "glasshouse",
    title: "Pell glasshouse",
    blurb: "Low to high, with a linear season line through the midpoint.",
    meta: "8 months",
    spec: {
      version: "1",
      id: "glass-span",
      type: "bar-range",
      title: "Pell glasshouse",
      subtitle: "Low to high, with a linear season line through the midpoint.",
      theme: "soft",
      locale: "en-GB",
      data: [
        { month: "Mar", low: 10, high: 16 },
        { month: "Apr", low: 12, high: 18 },
        { month: "May", low: 14, high: 21 },
        { month: "Jun", low: 16, high: 23 },
        { month: "Jul", low: 18, high: 25 },
        { month: "Aug", low: 17, high: 24 },
        { month: "Sep", low: 15, high: 22 },
        { month: "Oct", low: 12, high: 19 },
      ],
      encoding: {
        x: { field: "month", title: "Month" },
        low: "low",
        high: { field: "high", scale: { domain: [8, 28], nice: false } },
      },
      axes: {
        x: { title: "Month" },
        y: { title: "Degrees", ticks: [10, 14, 18, 22, 26], format: { style: "number", suffix: "°C" } },
      },
      annotations: [
        { type: "trendline", method: "linear", label: "Season line" },
        { type: "marker", x: "Jul", y: 25, label: "July high", dx: -36, dy: 12 },
      ],
      size: { width: 1040, height: 480 },
      a11y: {
        alt: "The Pell glasshouse runs from 10 to 16 degrees in March and from 18 to 25 degrees in July. A linear season line leans upward through the midpoint.",
      },
    },
  },
];

export function applyBarRangeAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function barRangeControlState(spec: Record<string, unknown>): TeachState {
  return { tooltip: tooltipMode(spec) };
}

export const barRangeTeach: TeachModule = {
  type: "bar-range",
  title: barRangePageTitle,
  description: barRangePageDescription,
  examples: barRangeExamples,
  smallestSpec: smallestBarRangeSpec,
  controls: [choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS)],
  apply: applyBarRangeAction,
  controlState: barRangeControlState,
};

for (const example of barRangeExamples) {
  if (example.spec.type !== "bar-range") throw new Error(`${example.id} is not a range bar`);
}
