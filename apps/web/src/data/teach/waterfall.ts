/**
 * Teaching copy and curated specs for /docs/charts/waterfall.
 * A step is a signed delta on a running total. A total row is a bar from zero.
 * mark.total names the flag column. The default name is total, so the smallest spec can omit it.
 * Labels are on when the key is omitted. Off writes false. On puts the example's labels back.
 * Connectors are always drawn. There is no legend: the colors are gain, loss, and total.
 */

import { AREA_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const waterfallPageTitle = "Waterfall";

export const waterfallPageDescription =
  "How to build a ChartKit waterfall: signed steps and a running total, when to use it instead of a bar or a funnel, the data shape, a spec that renders, and the options that define the steps.";

/** Feature-page waterfall. One gain between two totals. Labels and the total field use the defaults. */
export const smallestWaterfallSpec: Record<string, unknown> = {
  version: "1",
  type: "waterfall",
  data: [
    { step: "Open", amount: 120, total: true },
    { step: "Won", amount: 40 },
    { step: "Close", amount: 160, total: true },
  ],
  encoding: { x: "step", y: "amount" },
  a11y: { alt: "The close is 160 after one gain." },
};

/**
 * The core year, the homepage ARR bridge, and the harbour voyage.
 * Quarter bridge is Year to date with the middle steps removed, so it is not a separate example.
 * Receipts bridge is the same open-and-close shape as the voyage.
 */
export const waterfallExamples: TeachExample[] = [
  {
    id: "year",
    title: "Year to date",
    blurb: "The year closes at 160 after two gains and one loss.",
    meta: "5 steps",
    spec: {
      version: "1",
      type: "waterfall",
      title: "Year to date",
      data: [
        { step: "Open", amount: 120, total: true },
        { step: "Won", amount: 48 },
        { step: "Expand", amount: 22 },
        { step: "Lost", amount: -30 },
        { step: "Close", amount: 160, total: true },
      ],
      encoding: { x: "step", y: "amount" },
      mark: { total: "total" },
      a11y: { alt: "The year closes at 160 after two gains and one loss." },
    },
  },
  {
    id: "arr",
    title: "ARR bridge",
    blurb: "ARR starts at 40 and ends at 88 after new business, churn, credits, and expansion.",
    meta: "7 steps",
    spec: {
      version: "1",
      type: "waterfall",
      title: "ARR bridge",
      subtitle: "Q2 → Q3, USD millions",
      data: [
        { step: "Start", delta: 40, total: true },
        { step: "New", delta: 25 },
        { step: "Churn", delta: -13 },
        { step: "Upsell", delta: 26 },
        { step: "Credits", delta: -8 },
        { step: "Expansion", delta: 18 },
        { step: "End", delta: 88, total: true },
      ],
      encoding: { x: "step", y: "delta" },
      mark: { total: "total" },
      legend: false,
      size: { width: 520, height: 300 },
      a11y: { alt: "ARR starts at 40 and ends at 88 after new business, churn, credits, and expansion." },
    },
  },
  {
    id: "voyage",
    title: "One voyage, step by step",
    blurb: "The voyage opens at 8,400 pounds. Crane and berth add, cloth subtracts, and the close is 11,200.",
    meta: "5 steps",
    spec: {
      version: "1",
      id: "harbour-voyage",
      type: "waterfall",
      theme: "soft",
      locale: "en-GB",
      data: [
        { step: "Open", amount: 8400, total: true },
        { step: "Crane", amount: 2100 },
        { step: "Berth", amount: 1600 },
        { step: "Cloth", amount: -900 },
        { step: "Close", amount: 11200, total: true },
      ],
      encoding: {
        x: "step",
        y: { field: "amount", format: { style: "currency", currency: "GBP", decimals: 0 } },
      },
      axes: { x: { title: "Step" }, y: { title: "Pounds" } },
      tooltip: {
        position: "top",
        fields: [{ field: "amount", title: "Amount", format: { style: "currency", currency: "GBP", decimals: 0 } }],
      },
      interaction: { select: "point" },
      size: { width: 720, height: 380 },
      a11y: { alt: "The voyage opens at 8,400 pounds. Crane and berth add, cloth subtracts, and the close is 11,200." },
    },
  },
];

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

function exampleMark(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) && isRecord(restore.mark) ? restore.mark : undefined;
}

/**
 * Off writes mark.labels false and clears a value format.
 * On puts back the example's labels key and format. An omitted key is deleted, because omission means on.
 */
export function applyWaterfallLabels(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = exampleMark(restore);
  editMark(spec, (mark) => {
    if (value === "off") {
      mark.labels = false;
      delete mark.labelFormat;
      return;
    }
    if (source?.labels === true) mark.labels = true;
    else if (source?.labels === false) mark.labels = false;
    else delete mark.labels;
    if (source && source.labelFormat !== undefined) mark.labelFormat = structuredClone(source.labelFormat);
    else delete mark.labelFormat;
  });
}

/** Omitted labels are on. false is off. */
export function waterfallLabelMode(spec: Record<string, unknown>): "off" | "on" {
  return markOf(spec).labels === false ? "off" : "on";
}

export function applyWaterfallAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "labels" && (value === "off" || value === "on")) {
    applyWaterfallLabels(spec, value, action.restore);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function waterfallControlState(spec: Record<string, unknown>): TeachState {
  return {
    labels: waterfallLabelMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const waterfallTeach: TeachModule = {
  type: "waterfall",
  title: waterfallPageTitle,
  description: waterfallPageDescription,
  examples: waterfallExamples,
  smallestSpec: smallestWaterfallSpec,
  controls: [
    choice("labels", "Labels", "mark.labels", "mark.labels", AREA_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyWaterfallAction,
  controlState: waterfallControlState,
};

for (const example of waterfallExamples) {
  if (example.spec.type !== "waterfall") throw new Error(`${example.id} is not a waterfall`);
}
