/**
 * Teaching copy and curated specs for /docs/charts/line.
 * Line is a cartesian chart. Curve, points, and area fill are the type-defining controls.
 * Theme preset chips are not on this page. Axis titles and label format stay in the playground.
 */

import { AREA_OPTIONS, CURVE_OPTIONS, LINE_LEGEND_OPTIONS, POINT_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyArea, applyCurve, applyPoints, areaMode, curveMode, pointsMode } from "./line-mark.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const linePageTitle = "Line";

export const linePageDescription =
  "How to build a ChartKit line: a trend across ordered categories, when to use it, the data shape, a spec that renders, and the options that define the line.";

/** Core example 01-minimal-line.json. Three months, one series, no mark. */
export const smallestLineSpec: Record<string, unknown> = {
  version: "1",
  type: "line",
  data: [
    { month: "Jan", revenue: 120 },
    { month: "Feb", revenue: 150 },
    { month: "Mar", revenue: 132 },
  ],
  encoding: { x: "month", y: "revenue" },
  a11y: { alt: "Revenue rose from January to February, then eased in March." },
};

/**
 * Gallery lines: quarterly units, revenue against a target, and a step curve,
 * plus the core rich line (revenue and cost) so a custom tooltip has a home.
 */
export const lineExamples: TeachExample[] = [
  {
    id: "quarterly",
    title: "Quarterly units",
    blurb: "The smallest valid line: four rows and a sentence of alt text.",
    meta: "4 points",
    spec: {
      version: "1",
      id: "minimal-line",
      type: "line",
      data: [
        { quarter: "Q1", units: 40 },
        { quarter: "Q2", units: 55 },
        { quarter: "Q3", units: 48 },
        { quarter: "Q4", units: 62 },
      ],
      encoding: { x: "quarter", y: "units" },
      mark: { points: "always" },
      size: { width: 640, height: 280 },
      a11y: { alt: "Units rose from 40 in Q1 to 62 in Q4, with a dip in Q3." },
    },
  },
  {
    id: "target",
    title: "Revenue against target",
    blurb: "Filled revenue and a dashed target, one spec.",
    meta: "2 series",
    spec: {
      version: "1",
      id: "hero-revenue",
      type: "line",
      title: "Revenue",
      data: [
        { month: "Jan", revenue: 42, target: 40 },
        { month: "Feb", revenue: 46, target: 43 },
        { month: "Mar", revenue: 44, target: 46 },
        { month: "Apr", revenue: 51, target: 49 },
        { month: "May", revenue: 58, target: 52 },
        { month: "Jun", revenue: 55, target: 55 },
        { month: "Jul", revenue: 63, target: 58 },
        { month: "Aug", revenue: 61, target: 61 },
        { month: "Sep", revenue: 70, target: 64 },
        { month: "Oct", revenue: 74, target: 67 },
        { month: "Nov", revenue: 72, target: 70 },
        { month: "Dec", revenue: 81, target: 73 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "revenue", title: "Revenue", area: true },
          { field: "target", title: "Target", dash: "dashed" },
        ],
      },
      mark: { curve: "monotone", points: "none" },
      legend: { interactive: true },
      size: { width: 560, height: 320 },
      a11y: { alt: "Revenue stays near the target and finishes the year above it, at 81 against a target of 73." },
    },
  },
  {
    id: "deploys",
    title: "Deploys, step curve",
    blurb: "A step curve for values that jump and then hold.",
    meta: "5 points",
    spec: {
      version: "1",
      id: "step-deploys",
      type: "line",
      data: [
        { day: "Mon", deploys: 2 },
        { day: "Tue", deploys: 2 },
        { day: "Wed", deploys: 6 },
        { day: "Thu", deploys: 6 },
        { day: "Fri", deploys: 3 },
      ],
      encoding: { x: "day", y: { field: "deploys", title: "Deploys" } },
      mark: { curve: "step", points: "always" },
      legend: false,
      size: { width: 560, height: 260 },
      a11y: { alt: "Deploys jumped from 2 to 6 on Wednesday and settled at 3 on Friday." },
    },
  },
  {
    id: "cost",
    title: "Revenue and cost",
    blurb: "Six months. Revenue and cost are separate lines, and the tooltip names revenue.",
    meta: "2 series",
    spec: {
      $schema: "https://chartkit.dev/schema/v1.json",
      version: "1",
      id: "revenue-cost",
      type: "line",
      title: "Revenue and cost",
      subtitle: "First half of 2026",
      data: [
        { month: "Jan", revenue: 120, cost: 80 },
        { month: "Feb", revenue: 140, cost: 84 },
        { month: "Mar", revenue: 160, cost: 90 },
        { month: "Apr", revenue: 155, cost: 92 },
        { month: "May", revenue: 180, cost: 97 },
        { month: "Jun", revenue: 210, cost: 110 },
      ],
      encoding: {
        x: { field: "month", type: "ordinal", title: "Month" },
        y: [
          { field: "revenue", title: "Revenue", type: "quantitative", format: "compact", color: "series-1" },
          { field: "cost", title: "Cost", type: "quantitative", dash: "dashed", color: "series-2" },
        ],
      },
      mark: { curve: "monotone", points: "always", strokeWidth: 2 },
      axes: {
        x: { title: "Month" },
        y: { title: "USD", grid: "dashed", format: "compact" },
      },
      legend: { position: "top" },
      tooltip: { fields: ["month", { field: "revenue", title: "Revenue" }] },
      annotations: [{ type: "rule", axis: "y", value: 150, label: "Target", dash: "dotted" }],
      theme: "midnight",
      size: { width: 640, height: 240 },
      interaction: { hover: true, zoom: "none" },
      animation: { duration: 400, easing: "ease-out" },
      locale: "en-US",
      a11y: {
        alt: "Revenue rose from 120 in January to 210 in June, staying above cost.",
        description: "Monthly revenue and cost for the first half of 2026.",
      },
    },
  },
];

const LINE_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

export function applyLineAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "curve" && (value === "monotone" || value === "linear" || value === "step")) {
    applyCurve(spec, value);
    return;
  }
  if (id === "points" && (value === "none" || value === "hover" || value === "always")) {
    applyPoints(spec, value);
    return;
  }
  if (id === "area" && (value === "off" || value === "on")) {
    applyArea(spec, value);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function lineControlState(spec: Record<string, unknown>): TeachState {
  return {
    curve: curveMode(spec),
    points: pointsMode(spec),
    area: areaMode(spec),
    legend: legendChoice(spec, LINE_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const lineTeach: TeachModule = {
  type: "line",
  title: linePageTitle,
  description: linePageDescription,
  examples: lineExamples,
  smallestSpec: smallestLineSpec,
  controls: [
    choice("curve", "Curve", "mark.curve", "mark.curve", CURVE_OPTIONS),
    choice("points", "Points", "mark.points", "mark.points", POINT_OPTIONS),
    choice("area", "Area fill", "mark.area", "mark.area", AREA_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyLineAction,
  controlState: lineControlState,
};

for (const example of lineExamples) {
  if (example.spec.type !== "line") throw new Error(`${example.id} is not a line`);
}
