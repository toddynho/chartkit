/**
 * Teaching copy and curated specs for /docs/charts/errorbar.
 * Whiskers on a point or a bar. The point is the center. The whisker is the uncertainty.
 * A range bar floats from low to high and has no center mark. A scatter places points on two quantitative axes.
 * mark.error omitted means point. bar draws a bar from zero to y and keeps the whisker.
 * The renderer does not draw a legend, so this page has no legend control.
 * Theme preset chips are not on this page.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const errorbarPageTitle = "Error bar";

export const errorbarPageDescription =
  "How to build a ChartKit error bar: whiskers on a point or a bar, when to use it instead of a range bar or a scatter, the data shape, a spec that renders, and the options that define the whiskers.";

/** Core example 32-errorbar.json with the title left off. The anchor is a point. */
export const smallestErrorbarSpec: Record<string, unknown> = {
  version: "1",
  type: "errorbar",
  data: [
    { assay: "Control", mean: 18.2, lo: 17.1, hi: 19.3 },
    { assay: "Batch A", mean: 21.4, lo: 20.6, hi: 22.2 },
    { assay: "Batch B", mean: 16.7, lo: 15.3, hi: 18.1 },
  ],
  encoding: { x: "assay", y: "mean", low: "lo", high: "hi" },
  a11y: { alt: "Batch A is highest, with a whisker from 20.6 to 22.2." },
};

const ANCHOR_OPTIONS = [
  { value: "point", label: "Point" },
  { value: "bar", label: "Bar" },
] as const;

/**
 * The gallery and core lab chart, plus both Salt assay figures.
 * Dish means is the bar anchor. Salt, Monday to Friday keeps an explicit point and a radius.
 * Titles stay as published.
 */
export const errorbarExamples: TeachExample[] = [
  {
    id: "lab",
    title: "Lab measurements",
    blurb: "Each assay is a point with a whisker.",
    meta: "3 assays",
    spec: {
      version: "1",
      id: "lab-error-bars",
      type: "errorbar",
      title: "Lab measurements",
      data: [
        { assay: "Control", mean: 18.2, lo: 17.1, hi: 19.3 },
        { assay: "Batch A", mean: 21.4, lo: 20.6, hi: 22.2 },
        { assay: "Batch B", mean: 16.7, lo: 15.3, hi: 18.1 },
      ],
      encoding: { x: "assay", y: "mean", low: "lo", high: "hi" },
      size: { width: 560, height: 280 },
      a11y: { alt: "Batch A is highest, with a whisker from 20.6 to 22.2." },
    },
  },
  {
    id: "dishes",
    title: "Dish means",
    blurb: "The bar is the mean. The whisker is the low and high of three runs.",
    meta: "6 dishes",
    spec: {
      version: "1",
      id: "salt-dishes",
      type: "errorbar",
      title: "Dish means",
      subtitle: "Three runs. Salt sits clear of the blank.",
      theme: "soft",
      data: [
        { dish: "Blank", mean: 12.4, lo: 11.6, hi: 13.1 },
        { dish: "Brine", mean: 13.1, lo: 12.2, hi: 14 },
        { dish: "Kelp", mean: 14.8, lo: 13.9, hi: 15.6 },
        { dish: "Salt", mean: 18.6, lo: 17.9, hi: 19.4 },
        { dish: "Iodine", mean: 15.2, lo: 14.1, hi: 16.4 },
        { dish: "Copper", mean: 11.8, lo: 10.4, hi: 13.2 },
      ],
      encoding: {
        x: { field: "dish", title: "Dish" },
        y: { field: "mean", title: "Mean", scale: { domain: [0, 24], nice: false } },
        low: "lo",
        high: "hi",
      },
      mark: { error: "bar" },
      axes: { x: { title: "Dish" }, y: { title: "Reading", ticks: [0, 6, 12, 18, 24] } },
      annotations: [
        { type: "rule", axis: "y", value: 12.4, label: "Blank", dash: "dashed", labelPosition: "end" },
        { type: "marker", x: "Salt", y: 19.4, label: "Clear of the blank", dx: 18, dy: -28 },
      ],
      size: { width: 1040, height: 480 },
      a11y: {
        alt: "Salt averages 18.6, with a whisker from 17.9 to 19.4. The blank averages 12.4. A callout marks Salt clear of that line. Copper is the lowest dish.",
      },
    },
  },
  {
    id: "salt-week",
    title: "Salt, Monday to Friday",
    blurb: "The same dish, one point and whisker each weekday.",
    meta: "5 days",
    spec: {
      version: "1",
      id: "salt-week",
      type: "errorbar",
      title: "Salt, Monday to Friday",
      subtitle: "The same dish, one whisker each weekday.",
      theme: "soft",
      data: [
        { day: "Mon", mean: 18.2, lo: 17.4, hi: 19 },
        { day: "Tue", mean: 18.8, lo: 18.1, hi: 19.5 },
        { day: "Wed", mean: 17.9, lo: 17.2, hi: 18.6 },
        { day: "Thu", mean: 19.1, lo: 18.4, hi: 19.8 },
        { day: "Fri", mean: 18.6, lo: 18, hi: 19.2 },
      ],
      encoding: {
        x: { field: "day", title: "Day" },
        y: { field: "mean", title: "Mean", scale: { domain: [16, 21], nice: false } },
        low: "lo",
        high: "hi",
      },
      mark: { error: "point", pointSize: 5 },
      axes: { x: { title: "Day" }, y: { title: "Reading", ticks: [16, 17, 18, 19, 20, 21] } },
      annotations: [{ type: "marker", x: "Thu", y: 19.8, label: "Highest morning", dx: -8, dy: -40 }],
      size: { width: 1040, height: 440 },
      a11y: { alt: "Salt stays between 17.2 and 19.8 across the week. Thursday is the highest morning." },
    },
  },
];

function restoredMark(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) && isRecord(restore.mark) ? restore.mark : undefined;
}

/**
 * Bar writes mark.error bar. Point puts the example's point back:
 * an omitted key is deleted, and an explicit "point" is written point.
 * An example that started as a bar becomes point, because Point is the marker.
 * pointSize and the other mark keys stay.
 */
export function applyErrorAnchor(spec: Record<string, unknown>, value: "point" | "bar", restore?: unknown): void {
  const source = restoredMark(restore)?.error;
  editMark(spec, (mark) => {
    if (value === "bar") {
      mark.error = "bar";
      return;
    }
    if (source === "point") mark.error = "point";
    else if (source === undefined) delete mark.error;
    else mark.error = "point";
  });
}

/** Omitted and point draw a marker at y. bar draws a bar from zero to y. */
export function errorAnchorMode(spec: Record<string, unknown>): "point" | "bar" | "other" {
  const error = isRecord(spec.mark) ? spec.mark.error : undefined;
  if (error === undefined || error === "point") return "point";
  if (error === "bar") return "bar";
  return "other";
}

export function applyErrorbarAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "anchor" && (value === "point" || value === "bar")) {
    applyErrorAnchor(spec, value, action.restore);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function errorbarControlState(spec: Record<string, unknown>): TeachState {
  return {
    anchor: errorAnchorMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const errorbarTeach: TeachModule = {
  type: "errorbar",
  title: errorbarPageTitle,
  description: errorbarPageDescription,
  examples: errorbarExamples,
  smallestSpec: smallestErrorbarSpec,
  controls: [
    choice("anchor", "Anchor", "mark.error", "mark.error", ANCHOR_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyErrorbarAction,
  controlState: errorbarControlState,
};

for (const example of errorbarExamples) {
  if (example.spec.type !== "errorbar") throw new Error(`${example.id} is not an error bar`);
}
