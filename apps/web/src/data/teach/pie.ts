/**
 * Teaching copy and curated specs for /docs/charts/pie.
 * Pie is type "pie", the closed disk. A hole is a donut, so this module has no innerRadius control.
 * budget-pie stays off this list: that spec is type donut with mark.innerRadius 0.
 */

import {
  applyPadAngle,
  applyPalette,
  applySliceLabels,
  applySort,
  applyStartAngle,
  padAngleOf,
  paletteMode,
  sliceLabelMode,
  sortMode,
  startAngleMode,
} from "./arc.ts";
import { ARC_LEGEND_OPTIONS, LABEL_OPTIONS, SORT_OPTIONS, START_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const piePageTitle = "Pie";

export const piePageDescription =
  "How to build a ChartKit pie: parts of a whole, when to use it instead of a donut, the data shape, a spec that renders, and the options that define the disk.";

/** Colours from the library showcase pie, Loans by shelf. The palette control writes this list to mark.palette. */
export const PIE_PALETTE = ["#0f6e56", "#c45c26", "#1d4e89", "#a15c38", "#5b4b8a", "#8a6a2f"] as const;

/**
 * Core example 29-pie.json with mark and title left off.
 * Pie defaults are a solid disk and no gap, so mark can be omitted.
 */
export const smallestPieSpec: Record<string, unknown> = {
  version: "1",
  type: "pie",
  data: [
    { label: "Search", value: 42 },
    { label: "Direct", value: 28 },
    { label: "Social", value: 18 },
    { label: "Email", value: 8 },
    { label: "Other ads", value: 4 },
  ],
  encoding: { x: "label", y: "value" },
  a11y: { alt: "Search is the largest share of revenue. Other ads is the smallest slice." },
};

/**
 * The core pie, the library showcase pie, the homepage plan mix, and the mermaid kiln pie.
 */
export const pieExamples: TeachExample[] = [
  {
    id: "revenue",
    title: "Share of revenue",
    blurb: "Search is the largest share of revenue. Other ads is the smallest slice.",
    meta: "5 slices",
    spec: {
      version: "1",
      type: "pie",
      title: "Share of revenue",
      data: [
        { label: "Search", value: 42 },
        { label: "Direct", value: 28 },
        { label: "Social", value: 18 },
        { label: "Email", value: 8 },
        { label: "Other ads", value: 4 },
      ],
      encoding: { x: "label", y: "value" },
      mark: { labels: true, labelPosition: "outside", padAngle: 1.5 },
      a11y: { alt: "Search is the largest share of revenue. Other ads is the smallest slice." },
    },
  },
  {
    id: "shelves",
    title: "Loans by shelf",
    blurb: "A real pie. Names sit outside the slices on leader lines, in a palette set on this chart.",
    meta: "6 slices",
    spec: {
      version: "1",
      id: "library-shelves",
      type: "pie",
      theme: "soft",
      locale: "en-GB",
      data: [
        { shelf: "Folio", loans: 840 },
        { shelf: "Atlas", loans: 310 },
        { shelf: "Verse", loans: 460 },
        { shelf: "Cookery", loans: 520 },
        { shelf: "Scores", loans: 190 },
        { shelf: "Maps", loans: 260 },
      ],
      encoding: { x: "shelf", y: "loans" },
      mark: {
        labels: true,
        labelPosition: "outside",
        palette: [...PIE_PALETTE],
      },
      legend: { position: "bottom", interactive: true },
      tooltip: { position: "top", fields: [{ field: "loans", title: "Loans" }] },
      interaction: { select: "point" },
      size: { width: 560, height: 440 },
      a11y: { alt: "Folio is the largest shelf of loans, then cookery and verse. Scores is the smallest." },
    },
  },
  {
    id: "plans",
    title: "Plan mix",
    blurb: "Free is just over half of active accounts. Enterprise is the smallest slice.",
    meta: "4 slices",
    spec: {
      version: "1",
      type: "pie",
      title: "Plan mix",
      subtitle: "Active accounts",
      data: [
        { plan: "Free", n: 52 },
        { plan: "Pro", n: 24 },
        { plan: "Team", n: 14 },
        { plan: "Enterprise", n: 10 },
      ],
      encoding: { x: "plan", y: "n" },
      size: { width: 520, height: 300 },
      a11y: { alt: "Free is just over half of active accounts. Enterprise is the smallest slice." },
    },
  },
  {
    id: "kiln",
    title: "Kiln hours",
    blurb: "A pie fence. showData puts the numbers in the legend.",
    meta: "3 slices",
    spec: {
      version: "1",
      type: "pie",
      data: [
        { label: "Bisque", value: 18 },
        { label: "Glaze", value: 27 },
        { label: "Cool", value: 11 },
      ],
      encoding: { x: "label", y: "value" },
      a11y: { alt: "Kiln hours" },
      title: "Kiln hours",
      legend: { values: true },
      theme: "soft",
      size: { width: 520, height: 460 },
    },
  },
];

const ARC_LEGEND = { omitted: "bottom" as const, known: ["bottom", "right"] as const };

export function applyPieAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "padAngle" && typeof value === "number") {
    applyPadAngle(spec, value);
    return;
  }
  if (id === "labels" && (value === "off" || value === "inside" || value === "outside")) {
    applySliceLabels(spec, value);
    return;
  }
  if (id === "legend" && (value === "off" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) {
    applyTooltip(spec, value, action.restore);
    return;
  }
  if (id === "palette" && (value === "theme" || value === "set")) {
    applyPalette(spec, value, PIE_PALETTE);
    return;
  }
  if (id === "sort" && (value === "none" || value === "asc" || value === "desc")) {
    applySort(spec, value);
    return;
  }
  if (id === "startAngle") applyStartAngle(spec, Number(value));
}

export function pieControlState(spec: Record<string, unknown>): TeachState {
  const start = startAngleMode(spec);
  return {
    padAngle: padAngleOf(spec, 0),
    labels: sliceLabelMode(spec),
    legend: legendChoice(spec, ARC_LEGEND),
    tooltip: tooltipMode(spec),
    palette: paletteMode(spec, PIE_PALETTE),
    sort: sortMode(spec),
    startAngle: start,
  };
}

export const pieTeach: TeachModule = {
  type: "pie",
  title: piePageTitle,
  description: piePageDescription,
  examples: pieExamples,
  smallestSpec: smallestPieSpec,
  controls: [
    { kind: "range", id: "padAngle", label: "Gap", code: "mark.padAngle", min: 0, max: 10, step: 0.5, aria: "mark.padAngle" },
    choice("labels", "Labels", "mark.labels", "mark.labels and mark.labelPosition", LABEL_OPTIONS),
    choice("legend", "Legend", "legend", "legend", ARC_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
    choice("palette", "Colors", "mark.palette", "mark.palette", [
      { value: "theme", label: "Theme" },
      { value: "set", label: "Six colors" },
    ]),
    choice("sort", "Sort", "mark.sort", "mark.sort", SORT_OPTIONS),
    choice("startAngle", "Start", "mark.startAngle", "mark.startAngle", START_OPTIONS),
  ],
  apply: applyPieAction,
  controlState: pieControlState,
};

for (const example of pieExamples) {
  if (example.spec.type !== "pie") throw new Error(`${example.id} is not a pie`);
  const mark = example.spec.mark;
  if (isRecord(mark) && typeof mark.innerRadius === "number" && mark.innerRadius > 0) {
    throw new Error(`${example.id} opens a hole. A hole is a donut.`);
  }
}
