/**
 * Teaching copy and curated specs for /docs/charts/sparkline.
 * A sparkline is a small line with no axes, for a cell or a KPI.
 * mark.curve is the first drawing choice. Tooltip is the shared hover key.
 * mark.area fills the stroke, but a fill that is the point is type mini-area.
 * Legend, points, glow, stroke width, and sampling are not controls:
 * a sparkline draws no legend, points do not apply, and the rest are refinements.
 */

import { CURVE_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyCurve, curveMode } from "./line-mark.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const sparklinePageTitle = "Sparkline";

export const sparklinePageDescription =
  "How to build a ChartKit sparkline: a small line with no axes, when to use it instead of a line or a mini area, the data shape, a spec that renders, and the options that define the stroke.";

/** Core example 12-sparkline.json. Six numbers, no encoding, no mark. */
export const smallestSparklineSpec: Record<string, unknown> = {
  version: "1",
  type: "sparkline",
  data: [10, 25, 15, 30, 22, 28],
  a11y: { alt: "The sparkline trends upward from 10 to 28, with a dip in the middle." },
};

/**
 * The visual Requests series, the Stripe net-volume KPI line, and Disputes as rows.
 * Titles are the spec or dashboard titles. Net volume keeps tooltip false.
 * Disputes carries a tooltip object so Off and On can put it back.
 */
export const sparklineExamples: TeachExample[] = [
  {
    id: "requests",
    title: "Requests",
    blurb: "Twelve samples. The line rises from 1,200 to 3,000, with dips along the way.",
    meta: "12 points",
    spec: {
      version: "1",
      id: "soft-sparkline",
      type: "sparkline",
      data: [1200, 1800, 2100, 1900, 2400, 2600, 2300, 2500, 2700, 2400, 2800, 3000],
      a11y: { alt: "Requests rise from 1,200 to 3,000, with dips along the way." },
    },
  },
  {
    id: "net-volume",
    title: "Net volume",
    blurb: "A KPI sparkline. The number sits beside the chart, so the tooltip is off.",
    meta: "16 days",
    spec: {
      version: "1",
      type: "sparkline",
      legend: false,
      tooltip: false,
      data: [600, 1060, 1480, 1520, 1660, 1660, 1300, 1100, 900, 500, 440, 520, 500, 860, 1300, 1540],
      a11y: { alt: "Net volume trends up across sixteen days." },
    },
  },
  {
    id: "disputes",
    title: "Disputes",
    blurb: "Row objects in a v column. The tooltip names the dispute count.",
    meta: "16 days",
    spec: {
      version: "1",
      type: "sparkline",
      legend: false,
      data: [
        { v: 56 },
        { v: 71 },
        { v: 35 },
        { v: 60 },
        { v: 48 },
        { v: 71 },
        { v: 45 },
        { v: 55 },
        { v: 65 },
        { v: 61 },
        { v: 59 },
        { v: 42 },
        { v: 75 },
        { v: 46 },
        { v: 66 },
        { v: 25 },
      ],
      encoding: { y: { field: "v", color: "negative" } },
      tooltip: { fields: [{ field: "v", title: "Disputes" }] },
      a11y: { alt: "Disputes ease across the period." },
    },
  },
];

export function applySparklineAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "curve" && (value === "monotone" || value === "linear" || value === "step")) {
    applyCurve(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function sparklineControlState(spec: Record<string, unknown>): TeachState {
  return {
    curve: curveMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const sparklineTeach: TeachModule = {
  type: "sparkline",
  title: sparklinePageTitle,
  description: sparklinePageDescription,
  examples: sparklineExamples,
  smallestSpec: smallestSparklineSpec,
  controls: [
    choice("curve", "Curve", "mark.curve", "mark.curve", CURVE_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applySparklineAction,
  controlState: sparklineControlState,
};

for (const example of sparklineExamples) {
  if (example.spec.type !== "sparkline") throw new Error(`${example.id} is not a sparkline`);
}
