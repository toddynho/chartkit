/**
 * Teaching copy and curated specs for /docs/charts/bar.
 * A bar compares categories. Orientation, grouping versus stacking, and value labels
 * are the type-defining controls. Corner radius, gap, and label format stay in the playground.
 * Theme preset chips are not on this page.
 */

import { AREA_OPTIONS, BAR_STACK_OPTIONS, LINE_LEGEND_OPTIONS, ORIENTATION_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const barPageTitle = "Bar";

export const barPageDescription =
  "How to build a ChartKit bar: a comparison across categories, when to use it, the data shape, a spec that renders, and the options that define the bars.";

/** Core example 03-bar.json with title, locale, and mark left off. Vertical grouped bars are the defaults. */
export const smallestBarSpec: Record<string, unknown> = {
  version: "1",
  type: "bar",
  data: [
    { month: "Jan", signups: 100 },
    { month: "Feb", signups: 180 },
    { month: "Mar", signups: 150 },
  ],
  encoding: { x: "month", y: "signups" },
  a11y: { alt: "Signups peaked in February at 180, after 100 in January." },
};

/**
 * Gallery bars: one series, a horizontal list, and a stacked wide table,
 * plus the marathon showcase stack so a long-form series field and a custom tooltip have a home.
 */
export const barExamples: TeachExample[] = [
  {
    id: "signups",
    title: "Signups by month",
    blurb: "One series, rounded bars, German grouping on the axis.",
    meta: "5 months",
    spec: {
      version: "1",
      id: "signups-bar",
      type: "bar",
      locale: "de-DE",
      data: [
        { month: "Jan", signups: 8420 },
        { month: "Feb", signups: 12150 },
        { month: "Mar", signups: 10980 },
        { month: "Apr", signups: 14320 },
        { month: "May", signups: 13840 },
      ],
      encoding: { x: "month", y: "signups" },
      legend: false,
      size: { width: 560, height: 280 },
      a11y: { alt: "Signups peaked in April at 14,320, after 8,420 in January." },
    },
  },
  {
    id: "regions",
    title: "Revenue by region",
    blurb: "Horizontal bars for a short list of categories.",
    meta: "4 regions",
    spec: {
      version: "1",
      id: "regions-bar",
      type: "bar",
      data: [
        { region: "North", revenue: 82 },
        { region: "South", revenue: 64 },
        { region: "East", revenue: 96 },
        { region: "West", revenue: 71 },
      ],
      encoding: { x: "region", y: "revenue" },
      mark: { orientation: "horizontal" },
      legend: false,
      size: { width: 520, height: 260 },
      a11y: { alt: "East has the highest revenue at 96. South is lowest at 64." },
    },
  },
  {
    id: "channels",
    title: "Traffic by channel",
    blurb: "Three y channels, stacked.",
    meta: "3 series",
    spec: {
      version: "1",
      id: "channels-bar",
      type: "bar",
      data: [
        { month: "Jan", search: 40, direct: 22, social: 12 },
        { month: "Feb", search: 46, direct: 20, social: 16 },
        { month: "Mar", search: 44, direct: 26, social: 18 },
        { month: "Apr", search: 52, direct: 24, social: 15 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "search", title: "Search" },
          { field: "direct", title: "Direct" },
          { field: "social", title: "Social" },
        ],
      },
      mark: { stack: "stack" },
      size: { width: 560, height: 300 },
      a11y: { alt: "Search is the largest channel in every month. The stack is tallest in April." },
    },
  },
  {
    id: "effort",
    title: "Easy, steady, and hard",
    blurb: "Stacked minutes. Click a legend name to hide a band.",
    meta: "3 series",
    spec: {
      version: "1",
      id: "marathon-effort",
      type: "bar",
      theme: "soft",
      data: [
        { week: "W1", band: "Easy", minutes: 70 },
        { week: "W1", band: "Steady", minutes: 24 },
        { week: "W1", band: "Hard", minutes: 8 },
        { week: "W2", band: "Easy", minutes: 74 },
        { week: "W2", band: "Steady", minutes: 28 },
        { week: "W2", band: "Hard", minutes: 11 },
        { week: "W3", band: "Easy", minutes: 78 },
        { week: "W3", band: "Steady", minutes: 32 },
        { week: "W3", band: "Hard", minutes: 14 },
        { week: "W4", band: "Easy", minutes: 82 },
        { week: "W4", band: "Steady", minutes: 24 },
        { week: "W4", band: "Hard", minutes: 17 },
        { week: "W5", band: "Easy", minutes: 86 },
        { week: "W5", band: "Steady", minutes: 28 },
        { week: "W5", band: "Hard", minutes: 8 },
        { week: "W6", band: "Easy", minutes: 90 },
        { week: "W6", band: "Steady", minutes: 32 },
        { week: "W6", band: "Hard", minutes: 11 },
        { week: "W7", band: "Easy", minutes: 94 },
        { week: "W7", band: "Steady", minutes: 24 },
        { week: "W7", band: "Hard", minutes: 14 },
        { week: "W8", band: "Easy", minutes: 98 },
        { week: "W8", band: "Steady", minutes: 28 },
        { week: "W8", band: "Hard", minutes: 17 },
      ],
      encoding: { x: "week", y: "minutes", series: "band" },
      mark: { stack: "stack" },
      axes: { x: { title: "Week" }, y: { title: "Minutes", ticks: [40, 80, 120] } },
      legend: { position: "bottom", interactive: true },
      tooltip: { mode: "index", position: "top", crosshair: true },
      interaction: { select: "series" },
      size: { width: 760, height: 380 },
      a11y: { alt: "Easy minutes are the largest band each week, with a smaller hard band on top." },
    },
  },
];

const BAR_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

export function applyOrientation(spec: Record<string, unknown>, value: "vertical" | "horizontal"): void {
  editMark(spec, (mark) => {
    mark.orientation = value;
  });
}

/** Omitted orientation is vertical. */
export function orientationMode(spec: Record<string, unknown>): "vertical" | "horizontal" | "other" {
  const orientation = markOf(spec).orientation;
  if (orientation === undefined || orientation === "vertical") return "vertical";
  if (orientation === "horizontal") return "horizontal";
  return "other";
}

export function applyBarStack(spec: Record<string, unknown>, value: "none" | "stack" | "percent"): void {
  editMark(spec, (mark) => {
    mark.stack = value;
  });
}

/** Omitted stack is grouped. `true` is the same as stack. */
export function barStackMode(spec: Record<string, unknown>): "none" | "stack" | "percent" | "other" {
  const stack = markOf(spec).stack;
  if (stack === undefined || stack === "none") return "none";
  if (stack === "stack" || stack === true) return "stack";
  if (stack === "percent") return "percent";
  return "other";
}

function exampleMark(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) && isRecord(restore.mark) ? restore.mark : undefined;
}

/**
 * Off writes mark.labels false and clears the keys that force labels on.
 * On writes mark.labels true and, when the original example had them, puts label position and format back.
 */
export function applyBarLabels(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = exampleMark(restore);
  editMark(spec, (mark) => {
    if (value === "off") {
      mark.labels = false;
      delete mark.labelPosition;
      delete mark.labelFormat;
      return;
    }
    mark.labels = true;
    if (source && typeof source.labelPosition === "string") mark.labelPosition = source.labelPosition;
    if (source && source.labelFormat !== undefined) mark.labelFormat = structuredClone(source.labelFormat);
  });
}

/** A position or a format turns labels on even when mark.labels is omitted. */
export function barLabelMode(spec: Record<string, unknown>): "off" | "on" {
  const mark = markOf(spec);
  if (mark.labels === true || typeof mark.labelPosition === "string" || mark.labelFormat !== undefined) return "on";
  return "off";
}

export function applyBarAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "orientation" && (value === "vertical" || value === "horizontal")) {
    applyOrientation(spec, value);
    return;
  }
  if (id === "stack" && (value === "none" || value === "stack" || value === "percent")) {
    applyBarStack(spec, value);
    return;
  }
  if (id === "labels" && (value === "off" || value === "on")) {
    applyBarLabels(spec, value, action.restore);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function barControlState(spec: Record<string, unknown>): TeachState {
  return {
    orientation: orientationMode(spec),
    stack: barStackMode(spec),
    labels: barLabelMode(spec),
    legend: legendChoice(spec, BAR_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const barTeach: TeachModule = {
  type: "bar",
  title: barPageTitle,
  description: barPageDescription,
  examples: barExamples,
  smallestSpec: smallestBarSpec,
  controls: [
    choice("orientation", "Orientation", "mark.orientation", "mark.orientation", ORIENTATION_OPTIONS),
    choice("stack", "Stack", "mark.stack", "mark.stack", BAR_STACK_OPTIONS),
    choice("labels", "Labels", "mark.labels", "mark.labels", AREA_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyBarAction,
  controlState: barControlState,
};

for (const example of barExamples) {
  if (example.spec.type !== "bar") throw new Error(`${example.id} is not a bar`);
}
