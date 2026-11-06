/**
 * Teaching copy and curated specs for /docs/charts/boxplot.
 * A box plot draws quartiles, whiskers, a median, and outlier dots for each category.
 * Those parts are always drawn. The schema has no switch for outliers, the median, or orientation.
 * Tooltip is the shared key a first box plot sets. Gap stays in the playground.
 * Theme preset chips are not on this page.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const boxplotPageTitle = "Box plot";

export const boxplotPageDescription =
  "How to build a ChartKit box plot: quartiles, whiskers, a median, and outliers for each category, when to use it instead of a strip or a bar, the data shape, and a spec that renders.";

/** Two groups of raw observations. The box, the median, and the whiskers need no mark. */
export const smallestBoxplotSpec: Record<string, unknown> = {
  version: "1",
  type: "boxplot",
  data: [
    { group: "A", days: 2 },
    { group: "A", days: 4 },
    { group: "A", days: 5 },
    { group: "A", days: 9 },
    { group: "B", days: 3 },
    { group: "B", days: 3 },
    { group: "B", days: 4 },
    { group: "B", days: 6 },
  ],
  encoding: { x: "group", y: "days" },
  a11y: { alt: "Group A stretches higher than group B." },
};

const daysByRegion: Record<string, number[]> = {
  North: [40, 43, 39, 38, 36, 46, 34, 44, 46, 41, 44, 54, 46, 46, 36, 30, 35, 34],
  East: [64, 56, 50, 63, 54, 66, 63, 62, 56, 52, 54, 56, 47, 52, 58, 41, 52, 49],
  South: [45, 52, 49, 30, 32, 28, 24, 85, 51, 15, 32, 16, 8, 30, 26, 31, 30, 57],
  West: [61, 82, 48, 71, 65, 57, 58, 62, 67, 69, 59, 47, 63, 68, 70, 55, 71, 69],
  Central: [43, 52, 32, 52, 59, 58, 69, 55, 58, 55, 33, 55, 42, 47, 62, 52, 55, 31],
};

const closeDays = Object.entries(daysByRegion).flatMap(([region, days]) => days.map((value) => ({ region, days: value })));

/**
 * Days to close is the core regional sample. Weight by variety is the orchard showcase box.
 * Titles stay the full example titles.
 */
export const boxplotExamples: TeachExample[] = [
  {
    id: "close",
    title: "Days to close",
    blurb: "Five regions. South has a short deal and a long one outside the whiskers.",
    meta: "5 regions",
    spec: {
      version: "1",
      type: "boxplot",
      title: "Days to close",
      data: closeDays,
      encoding: { x: "region", y: "days" },
      a11y: { alt: "West deals take longer to close than South deals, and each region has a wide spread." },
    },
  },
  {
    id: "weight",
    title: "Weight by variety",
    blurb: "A box for each variety. Ashmead weighs more than Russet.",
    meta: "3 varieties",
    spec: {
      version: "1",
      id: "orchard-spread",
      type: "boxplot",
      theme: "soft",
      data: [
        { variety: "Pippin", grams: 168 },
        { variety: "Pippin", grams: 174 },
        { variety: "Pippin", grams: 181 },
        { variety: "Pippin", grams: 159 },
        { variety: "Pippin", grams: 188 },
        { variety: "Russet", grams: 142 },
        { variety: "Russet", grams: 151 },
        { variety: "Russet", grams: 136 },
        { variety: "Russet", grams: 158 },
        { variety: "Russet", grams: 147 },
        { variety: "Ashmead", grams: 192 },
        { variety: "Ashmead", grams: 205 },
        { variety: "Ashmead", grams: 184 },
        { variety: "Ashmead", grams: 210 },
        { variety: "Ashmead", grams: 176 },
      ],
      encoding: { x: "variety", y: "grams" },
      axes: { x: { title: "Variety" }, y: { title: "Grams" } },
      size: { width: 560, height: 340 },
      a11y: { alt: "Ashmead weighs more than Russet. Pippin sits between them." },
    },
  },
];

export function applyBoxplotAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function boxplotControlState(spec: Record<string, unknown>): TeachState {
  return { tooltip: tooltipMode(spec) };
}

export const boxplotTeach: TeachModule = {
  type: "boxplot",
  title: boxplotPageTitle,
  description: boxplotPageDescription,
  examples: boxplotExamples,
  smallestSpec: smallestBoxplotSpec,
  controls: [choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS)],
  apply: applyBoxplotAction,
  controlState: boxplotControlState,
};

for (const example of boxplotExamples) {
  if (example.spec.type !== "boxplot") throw new Error(`${example.id} is not a boxplot`);
}
