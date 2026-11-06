/**
 * Teaching copy and curated specs for /docs/charts/stacked-area.
 * Several series add into one shape. The default stack is stack. Percent is the other first choice.
 * Curve is shared with line. A filled line (type line, mark.area) is a different chart.
 * Theme preset chips are not on this page.
 */

import { AREA_STACK_OPTIONS, CURVE_OPTIONS, LINE_LEGEND_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyCurve, curveMode } from "./line-mark.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const stackedAreaPageTitle = "Stacked area";

export const stackedAreaPageDescription =
  "How to build a ChartKit stacked area: several series in one shape, when to use it, how it differs from a filled line, a spec that renders, and the options that define the stack.";

/** Core example 05-stacked-area.json with locale left off. The default stack is stack. */
export const smallestStackedAreaSpec: Record<string, unknown> = {
  version: "1",
  type: "stacked-area",
  data: [
    { month: "Jan", free: 40, pro: 20 },
    { month: "Feb", free: 42, pro: 28 },
    { month: "Mar", free: 45, pro: 36 },
  ],
  encoding: {
    x: "month",
    y: [
      { field: "free", title: "Free" },
      { field: "pro", title: "Pro" },
    ],
  },
  a11y: { alt: "Pro accounts grew faster than free accounts from January to March." },
};

/**
 * Gallery absolute and percent stacks, the homepage plan mix,
 * and the bike-share percent stack so a custom tooltip has a home.
 */
export const stackedAreaExamples: TeachExample[] = [
  {
    id: "spend",
    title: "Spend by team",
    blurb: "Stacked areas for parts that add up.",
    meta: "3 series",
    spec: {
      version: "1",
      id: "spend-area",
      type: "stacked-area",
      data: [
        { month: "Jan", product: 20, design: 12, support: 8 },
        { month: "Feb", product: 24, design: 11, support: 9 },
        { month: "Mar", product: 22, design: 14, support: 10 },
        { month: "Apr", product: 28, design: 13, support: 11 },
        { month: "May", product: 30, design: 15, support: 12 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "product", title: "Product" },
          { field: "design", title: "Design" },
          { field: "support", title: "Support" },
        ],
      },
      size: { width: 560, height: 300 },
      a11y: { alt: "Total spend rises from January to May, and product remains the largest share." },
    },
  },
  {
    id: "mix",
    title: "Channel mix",
    blurb: "The same stack, normalized to 100%.",
    meta: "3 series",
    spec: {
      version: "1",
      id: "mix-area",
      type: "stacked-area",
      data: [
        { month: "Jan", paid: 30, organic: 50, partner: 20 },
        { month: "Feb", paid: 28, organic: 48, partner: 24 },
        { month: "Mar", paid: 34, organic: 42, partner: 24 },
        { month: "Apr", paid: 26, organic: 46, partner: 28 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "organic", title: "Organic" },
          { field: "paid", title: "Paid" },
          { field: "partner", title: "Partner" },
        ],
      },
      mark: { stack: "percent" },
      size: { width: 560, height: 300 },
      a11y: { alt: "Organic stays the largest share of the mix. Partner grows slightly by April." },
    },
  },
  {
    id: "plans",
    title: "Plan mix over time",
    blurb: "Free, Pro, and Team, stacked from January to June.",
    meta: "3 series",
    spec: {
      version: "1",
      type: "stacked-area",
      size: { width: 520, height: 300 },
      legend: false,
      title: "Plan mix over time",
      subtitle: "Accounts, thousands",
      data: [
        { month: "Jan", free: 40, pro: 22, team: 8 },
        { month: "Feb", free: 42, pro: 28, team: 11 },
        { month: "Mar", free: 45, pro: 36, team: 14 },
        { month: "Apr", free: 44, pro: 41, team: 18 },
        { month: "May", free: 46, pro: 48, team: 22 },
        { month: "Jun", free: 47, pro: 55, team: 27 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "free", title: "Free" },
          { field: "pro", title: "Pro" },
          { field: "team", title: "Team" },
        ],
      },
      a11y: { alt: "Free, Pro, and Team accounts all grow from January to June." },
    },
  },
  {
    id: "bikes",
    title: "Classic and e-bike share",
    blurb: "Each span sums to 100 percent.",
    meta: "2 series",
    spec: {
      version: "1",
      id: "bike-mix",
      type: "stacked-area",
      theme: "soft",
      data: [
        { span: "Belt", classic: 80, ebike: 20 },
        { span: "Cinder", classic: 74, ebike: 32 },
        { span: "Glass", classic: 70, ebike: 41 },
        { span: "Hearth", classic: 66, ebike: 48 },
        { span: "Iron", classic: 62, ebike: 55 },
        { span: "Jade", classic: 58, ebike: 64 },
      ],
      encoding: {
        x: "span",
        y: [
          { field: "classic", title: "Classic" },
          { field: "ebike", title: "E-bike" },
        ],
      },
      mark: { stack: "percent" },
      axes: { x: { title: "Span", rotate: -28 }, y: { title: "Share", format: "percent" } },
      legend: { position: "bottom", interactive: true },
      tooltip: { mode: "index", position: "top", crosshair: true, crosshairLabel: true },
      interaction: { select: "series" },
      size: { width: 760, height: 380 },
      a11y: { alt: "E-bike's share of trips grows from Belt to Jade, and classic shrinks to just under half." },
    },
  },
];

const STACKED_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

export function applyAreaStack(spec: Record<string, unknown>, value: "stack" | "percent"): void {
  editMark(spec, (mark) => {
    mark.stack = value;
  });
}

/**
 * Omitted stack is stack, the type default. none is not on this control:
 * an unstacked fill is a line with mark.area.
 */
export function areaStackMode(spec: Record<string, unknown>): "stack" | "percent" | "other" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  if (mark.stack === undefined || mark.stack === "stack" || mark.stack === true) return "stack";
  if (mark.stack === "percent") return "percent";
  return "other";
}

export function applyStackedAreaAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "curve" && (value === "monotone" || value === "linear" || value === "step")) {
    applyCurve(spec, value);
    return;
  }
  if (id === "stack" && (value === "stack" || value === "percent")) {
    applyAreaStack(spec, value);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function stackedAreaControlState(spec: Record<string, unknown>): TeachState {
  return {
    curve: curveMode(spec),
    stack: areaStackMode(spec),
    legend: legendChoice(spec, STACKED_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const stackedAreaTeach: TeachModule = {
  type: "stacked-area",
  title: stackedAreaPageTitle,
  description: stackedAreaPageDescription,
  examples: stackedAreaExamples,
  smallestSpec: smallestStackedAreaSpec,
  controls: [
    choice("curve", "Curve", "mark.curve", "mark.curve", CURVE_OPTIONS),
    choice("stack", "Stack", "mark.stack", "mark.stack", AREA_STACK_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyStackedAreaAction,
  controlState: stackedAreaControlState,
};

for (const example of stackedAreaExamples) {
  if (example.spec.type !== "stacked-area") throw new Error(`${example.id} is not a stacked area`);
}
