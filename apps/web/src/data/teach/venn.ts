/**
 * Teaching copy and curated specs for /docs/charts/venn.
 * Two or three sets. An intersection joins set names with +.
 * Two-set areas follow the sizes. Three-set areas are approximate.
 * legend is not read, so it is not a control.
 * Tooltip is on when the key is omitted. Off writes false. On puts the example's tooltip back.
 * The card text is the mark label. tooltip.fields is not read.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const vennPageTitle = "Venn";

export const vennPageDescription =
  "How to build a ChartKit venn: two or three overlapping sets, when to use it instead of a pie or a treemap, the data shape, a spec that renders, and the tooltip.";

/** Feature-doc venn. Two sets and one intersection. Two-set areas follow the sizes. */
export const smallestVennSpec: Record<string, unknown> = {
  version: "1",
  type: "venn",
  data: [
    { set: "A", size: 12 },
    { set: "B", size: 8 },
    { set: "A+B", size: 3 },
  ],
  a11y: { alt: "A and B overlap." },
};

/**
 * The core customer sets, the kiln showcase, and the Quill notebook sets.
 * Titles are the spec title, or the showcase heading when the spec has no title.
 */
export const vennExamples: TeachExample[] = [
  {
    id: "customers",
    title: "What customers use together",
    blurb: "Search, filters, and saved views overlap. 90 customers use all three.",
    meta: "3 sets",
    spec: {
      version: "1",
      type: "venn",
      id: "feature-venn",
      title: "What customers use together",
      data: [
        { set: "Search", size: 1280 },
        { set: "Filters", size: 860 },
        { set: "Saved views", size: 540 },
        { set: "Search+Filters", size: 410 },
        { set: "Search+Saved views", size: 220 },
        { set: "Filters+Saved views", size: 140 },
        { set: "Search+Filters+Saved views", size: 90 },
      ],
      encoding: { x: "set", y: "size" },
      a11y: { alt: "Search, filters, and saved views overlap. 90 customers use all three. Three-set areas are approximate." },
    },
  },
  {
    id: "kiln",
    title: "Wheel, glaze, kiln",
    blurb: "Wheel, glaze, and kiln overlap. Eight pieces use all three.",
    meta: "3 sets",
    spec: {
      version: "1",
      type: "venn",
      data: [
        { set: "Wheel", size: 70 },
        { set: "Glaze", size: 54 },
        { set: "Kiln", size: 46 },
        { set: "Wheel+Glaze", size: 22 },
        { set: "Wheel+Kiln", size: 16 },
        { set: "Glaze+Kiln", size: 12 },
        { set: "Wheel+Glaze+Kiln", size: 8 },
      ],
      a11y: { alt: "Wheel, glaze, kiln" },
      title: "Wheel, glaze, kiln",
      theme: "soft",
      size: { width: 880, height: 480 },
    },
  },
  {
    id: "notebooks",
    title: "What notebooks combine",
    blurb: "Ink, pins, and search overlap. Thirty-six notebooks use all three.",
    meta: "3 sets",
    spec: {
      version: "1",
      id: "quill-sets",
      type: "venn",
      theme: "soft",
      data: [
        { set: "Ink", size: 640 },
        { set: "Pins", size: 410 },
        { set: "Search", size: 280 },
        { set: "Ink+Pins", size: 190 },
        { set: "Ink+Search", size: 120 },
        { set: "Pins+Search", size: 70 },
        { set: "Ink+Pins+Search", size: 36 },
      ],
      encoding: { x: "set", y: "size" },
      size: { width: 640, height: 460 },
      a11y: { alt: "Ink, pins, and search overlap. Thirty-six notebooks use all three." },
    },
  },
];

export function applyVennAction(spec: Record<string, unknown>, action: TeachAction): void {
  if (action.id === "tooltip" && (action.value === "off" || action.value === "on")) {
    applyTooltip(spec, action.value, action.restore);
  }
}

export function vennControlState(spec: Record<string, unknown>): TeachState {
  return { tooltip: tooltipMode(spec) };
}

export const vennTeach: TeachModule = {
  type: "venn",
  title: vennPageTitle,
  description: vennPageDescription,
  examples: vennExamples,
  smallestSpec: smallestVennSpec,
  controls: [choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS)],
  apply: applyVennAction,
  controlState: vennControlState,
};

for (const example of vennExamples) {
  if (example.spec.type !== "venn") throw new Error(`${example.id} is not a venn`);
}
