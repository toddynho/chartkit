/**
 * Teaching copy and curated specs for /docs/charts/scatter.
 * Two quantitative fields, plus an optional size channel that turns the reading into bubbles.
 * Point shape is the mark a first scatter sets. Log scales and color rules stay in the playground.
 * Theme preset chips are not on this page.
 */

import { AREA_OPTIONS, LINE_LEGEND_OPTIONS, POINT_SHAPE_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const scatterPageTitle = "Scatter";

export const scatterPageDescription =
  "How to build a ChartKit scatter: two quantitative fields, when to use it, the data shape, a spec that renders, and the options that define the points.";

/** Core example 06-scatter.json with size, color, and the extra fields left off. x and y are enough. */
export const smallestScatterSpec: Record<string, unknown> = {
  version: "1",
  type: "scatter",
  data: [
    { revenue: 10, employees: 4 },
    { revenue: 18, employees: 7 },
    { revenue: 24, employees: 12 },
    { revenue: 40, employees: 22 },
  ],
  encoding: {
    x: { field: "revenue", type: "quantitative" },
    y: { field: "employees", type: "quantitative" },
  },
  a11y: { alt: "Companies with more employees also have more revenue." },
};

/**
 * Homepage seats chart (no size), the gallery yield bubbles, the core log bubble,
 * and the orchard showcase so a category color and a custom tooltip have a home.
 */
export const scatterExamples: TeachExample[] = [
  {
    id: "seats",
    title: "Seats vs. renewal rate",
    blurb: "Sixteen accounts. Renewal rate against seats, with one point radius.",
    meta: "16 points",
    spec: {
      version: "1",
      type: "scatter",
      title: "Seats vs. renewal rate",
      subtitle: "Accounts, Q3",
      data: [
        { seats: 8, renewal: 22 },
        { seats: 15, renewal: 35 },
        { seats: 22, renewal: 30 },
        { seats: 28, renewal: 48 },
        { seats: 35, renewal: 44 },
        { seats: 41, renewal: 58 },
        { seats: 48, renewal: 52 },
        { seats: 55, renewal: 70 },
        { seats: 62, renewal: 66 },
        { seats: 70, renewal: 78 },
        { seats: 77, renewal: 74 },
        { seats: 85, renewal: 88 },
        { seats: 90, renewal: 82 },
        { seats: 18, renewal: 50 },
        { seats: 60, renewal: 40 },
        { seats: 40, renewal: 72 },
      ],
      encoding: { x: "seats", y: "renewal" },
      mark: { pointSize: 5 },
      legend: false,
      size: { width: 520, height: 300 },
      a11y: { alt: "Renewal rate tends to rise with seat count, with a few smaller accounts already high." },
    },
  },
  {
    id: "yield",
    title: "Yield by temperature",
    blurb: "Bubble size is a third field, kept inside the plot.",
    meta: "7 points",
    spec: {
      version: "1",
      id: "yield-scatter",
      type: "scatter",
      data: [
        { temp: 14, yield: 3.1, plot: 8 },
        { temp: 16, yield: 3.8, plot: 10 },
        { temp: 18, yield: 4.1, plot: 11 },
        { temp: 21, yield: 5.2, plot: 16 },
        { temp: 23, yield: 5.0, plot: 14 },
        { temp: 26, yield: 4.2, plot: 12 },
        { temp: 29, yield: 3.4, plot: 9 },
      ],
      encoding: {
        x: { field: "temp", title: "Temperature" },
        y: { field: "yield", title: "Yield" },
        size: { field: "plot", range: [5, 16] },
      },
      size: { width: 560, height: 320 },
      a11y: { alt: "Yield peaks near 21 degrees and falls off at both cooler and hotter temperatures." },
    },
  },
  {
    id: "spend",
    title: "Spend vs usage",
    blurb: "Spend and usage on log scales. Bubble size is the customer count.",
    meta: "4 points",
    spec: {
      version: "1",
      id: "spend-usage",
      type: "scatter",
      title: "Spend vs usage",
      data: [
        { spend: 10, usage: 20, customers: 8, segment: "SMB" },
        { spend: 100, usage: 80, customers: 40, segment: "Mid-market" },
        { spend: 1000, usage: 400, customers: 120, segment: "Enterprise" },
        { spend: 10000, usage: 2000, customers: 30, segment: "Enterprise" },
      ],
      encoding: {
        x: { field: "spend", type: "quantitative", scale: { type: "log" } },
        y: { field: "usage", type: "quantitative", scale: { type: "log" } },
        size: { field: "customers", range: [8, 36] },
        color: "segment",
      },
      size: { width: 640, height: 320 },
      locale: "en-US",
      a11y: { alt: "Spend and usage both span orders of magnitude across segments." },
    },
  },
  {
    id: "sun",
    title: "Sun hours and sugar",
    blurb: "Each diamond is one crate. Color is the variety, and size is the weight.",
    meta: "15 points",
    spec: {
      version: "1",
      id: "orchard-sun",
      type: "scatter",
      theme: "soft",
      data: [
        { variety: "Pippin", grams: 168, hours: 4.2, brix: 12.4 },
        { variety: "Pippin", grams: 174, hours: 5.1, brix: 13.1 },
        { variety: "Pippin", grams: 181, hours: 6.4, brix: 13.8 },
        { variety: "Pippin", grams: 159, hours: 3.6, brix: 11.6 },
        { variety: "Pippin", grams: 188, hours: 7.2, brix: 14.2 },
        { variety: "Russet", grams: 142, hours: 3.1, brix: 14.8 },
        { variety: "Russet", grams: 151, hours: 4.4, brix: 15.4 },
        { variety: "Russet", grams: 136, hours: 2.8, brix: 14.1 },
        { variety: "Russet", grams: 158, hours: 5.5, brix: 16.2 },
        { variety: "Russet", grams: 147, hours: 4.0, brix: 15.0 },
        { variety: "Ashmead", grams: 192, hours: 6.8, brix: 13.2 },
        { variety: "Ashmead", grams: 205, hours: 8.1, brix: 14.6 },
        { variety: "Ashmead", grams: 184, hours: 5.9, brix: 12.8 },
        { variety: "Ashmead", grams: 210, hours: 8.6, brix: 15.1 },
        { variety: "Ashmead", grams: 176, hours: 4.8, brix: 12.2 },
      ],
      encoding: {
        x: { field: "hours", title: "Sun hours", scale: { padding: 0.08 } },
        y: { field: "brix", title: "Brix", scale: { nice: false, padding: { min: 0.08, max: 0.14 } } },
        size: { field: "grams", range: [8, 28] },
        color: "variety",
      },
      mark: { pointShape: "diamond", pointSize: 6 },
      axes: { x: { title: "Sun hours" }, y: { title: "Brix", ticks: [12, 13, 14, 15, 16] } },
      legend: { position: "bottom", interactive: true },
      tooltip: {
        position: "top",
        fields: [
          { field: "variety", title: "Variety" },
          { field: "brix", title: "Brix" },
          { field: "grams", title: "Grams" },
        ],
      },
      interaction: { select: "point" },
      size: { width: 560, height: 420 },
      a11y: { alt: "Russet crates are sweeter at fewer sun hours. Ashmead crates are heavier and sit toward more sun." },
    },
  },
];

const SCATTER_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

function encodingOf(spec: Record<string, unknown>): Record<string, unknown> | undefined {
  return isRecord(spec.encoding) ? spec.encoding : undefined;
}

/** The original example's size channel, whether restore is that channel or the whole example. */
function restoredSize(restore: unknown): Record<string, unknown> | undefined {
  if (!isRecord(restore)) return undefined;
  if (typeof restore.field === "string") return restore;
  const encoding = isRecord(restore.encoding) ? restore.encoding : undefined;
  if (encoding && isRecord(encoding.size) && typeof encoding.size.field === "string") return encoding.size;
  return undefined;
}

/**
 * Off deletes encoding.size. On puts back the example's size channel.
 * An example with no third field stays a fixed radius, and the control stays off.
 */
export function applyScatterSize(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const encoding = encodingOf(spec);
  if (!encoding) return;
  if (value === "off") {
    delete encoding.size;
    return;
  }
  const size = restoredSize(restore);
  if (!size) return;
  encoding.size = structuredClone(size);
}

export function scatterSizeMode(spec: Record<string, unknown>): "off" | "on" {
  const encoding = encodingOf(spec);
  return encoding && isRecord(encoding.size) && typeof encoding.size.field === "string" ? "on" : "off";
}

export function applyPointShape(spec: Record<string, unknown>, value: "circle" | "square" | "diamond"): void {
  editMark(spec, (mark) => {
    mark.pointShape = value;
  });
}

/** Omitted shape is circle. triangle, cross, and none are not on this control. */
export function pointShapeMode(spec: Record<string, unknown>): "circle" | "square" | "diamond" | "other" {
  const shape = isRecord(spec.mark) ? spec.mark.pointShape : undefined;
  if (shape === undefined || shape === "circle") return "circle";
  if (shape === "square" || shape === "diamond") return shape;
  return "other";
}

export function applyScatterAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "size" && (value === "off" || value === "on")) {
    applyScatterSize(spec, value, action.restore);
    return;
  }
  if (id === "shape" && (value === "circle" || value === "square" || value === "diamond")) {
    applyPointShape(spec, value);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function scatterControlState(spec: Record<string, unknown>): TeachState {
  return {
    size: scatterSizeMode(spec),
    shape: pointShapeMode(spec),
    legend: legendChoice(spec, SCATTER_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const scatterTeach: TeachModule = {
  type: "scatter",
  title: scatterPageTitle,
  description: scatterPageDescription,
  examples: scatterExamples,
  smallestSpec: smallestScatterSpec,
  controls: [
    choice("size", "Size", "encoding.size", "encoding.size", AREA_OPTIONS),
    choice("shape", "Point shape", "mark.pointShape", "mark.pointShape", POINT_SHAPE_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyScatterAction,
  controlState: scatterControlState,
};

for (const example of scatterExamples) {
  if (example.spec.type !== "scatter") throw new Error(`${example.id} is not a scatter`);
}
