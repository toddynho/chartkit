/**
 * Teaching copy and curated specs for /docs/charts/quadrant.
 * Points sit on a square split into four named regions. The default domain is 0..1.
 * Size and color are columns. Dropping encoding.size or encoding.color does not
 * clear a column that is still named size or color, so those are not controls.
 * legend is not read.
 * Tooltip is on when the key is omitted. Off writes false. On puts the example's tooltip back.
 * The card text is the mark label. tooltip.fields is not read.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const quadrantPageTitle = "Quadrant";

export const quadrantPageDescription =
  "How to build a ChartKit quadrant: four named regions, when to use it instead of a scatter, the data shape, a spec that renders, and the tooltip.";

/** Feature-doc quadrant. Two points and four region names. The domain defaults to 0..1. */
export const smallestQuadrantSpec: Record<string, unknown> = {
  version: "1",
  type: "quadrant",
  quadrants: ["A", "B", "C", "D"],
  data: [
    { name: "SSO", x: 0.2, y: 0.8 },
    { name: "R", x: 0.8, y: 0.3 },
  ],
  encoding: { x: "x", y: "y" },
  a11y: { alt: "SSO is a win." },
};

/**
 * The core priority chart, the Paper Kite bets, and the Quill discovery map.
 * Titles are the spec title, or the showcase heading when the spec has no title.
 */
export const quadrantExamples: TeachExample[] = [
  {
    id: "quarter",
    title: "Where the quarter goes",
    blurb: "SSO is a quick win. The checkout rewrite is a big bet. PDF export is high effort and low impact.",
    meta: "7 points",
    spec: {
      version: "1",
      type: "quadrant",
      id: "priority-quadrant",
      title: "Where the quarter goes",
      subtitle: "Effort against impact",
      quadrants: ["Quick wins", "Big bets", "Fill-ins", "Thankless"],
      data: [
        { name: "SSO", x: 0.18, y: 0.84, size: 16, color: "positive" },
        { name: "Saved replies", x: 0.3, y: 0.68, size: 10, color: "positive" },
        { name: "Checkout rewrite", x: 0.8, y: 0.88, size: 18, color: "accent" },
        { name: "Search ranking", x: 0.64, y: 0.72, size: 14, color: "accent" },
        { name: "Dark mode", x: 0.24, y: 0.28, size: 8, color: "muted" },
        { name: "PDF export", x: 0.84, y: 0.24, size: 12, color: "negative" },
        { name: "Audit log", x: 0.46, y: 0.56, size: 11, color: "accent" },
      ],
      encoding: {
        x: { field: "x", title: "Low effort|High effort", scale: { domain: [0, 1] } },
        y: { field: "y", title: "Low impact|High impact", scale: { domain: [0, 1] } },
        size: "size",
        color: "color",
      },
      a11y: { alt: "SSO is a quick win. The checkout rewrite is a big bet. PDF export is high effort and low impact." },
    },
  },
  {
    id: "paper-kite",
    title: "Paper Kite bets",
    blurb: "Kite skin is light effort and high delight. Split screen is heavy and quiet.",
    meta: "4 points",
    spec: {
      version: "1",
      type: "quadrant",
      data: [
        { name: "Kite skin", x: 0.24, y: 0.78 },
        { name: "Wind hint", x: 0.7, y: 0.82 },
        { name: "Night mode", x: 0.3, y: 0.28 },
        { name: "Split screen", x: 0.74, y: 0.26 },
      ],
      encoding: {
        x: { field: "x", title: "Light effort|Heavy effort" },
        y: { field: "y", title: "Quiet delight|Loud delight" },
      },
      a11y: { alt: "Paper Kite bets" },
      quadrants: ["Do it now", "Worth it", "Leave it", "Later"],
      title: "Paper Kite bets",
      theme: "soft",
      size: { width: 880, height: 440 },
    },
  },
  {
    id: "quill",
    title: "Where the next build sits",
    blurb: "Ink search is light and delightful. A shared notebook is heavy and still delightful.",
    meta: "5 points",
    spec: {
      version: "1",
      id: "quill-bets",
      type: "quadrant",
      theme: "soft",
      quadrants: ["Do it now", "Worth the wait", "Leave it", "Later"],
      data: [
        { name: "Ink search", x: 0.22, y: 0.8 },
        { name: "Pinned lines", x: 0.34, y: 0.62 },
        { name: "Shared notebook", x: 0.78, y: 0.84 },
        { name: "Offline pad", x: 0.7, y: 0.3 },
        { name: "Side notes", x: 0.28, y: 0.26 },
      ],
      encoding: {
        x: { field: "x", title: "Light effort|Heavy effort", scale: { domain: [0, 1] } },
        y: { field: "y", title: "Quiet delight|Loud delight", scale: { domain: [0, 1] } },
      },
      size: { width: 640, height: 460 },
      a11y: { alt: "Ink search is a quick win. A shared notebook is heavy and still delightful. Offline pad is heavy and quiet." },
    },
  },
];

export function applyQuadrantAction(spec: Record<string, unknown>, action: TeachAction): void {
  if (action.id === "tooltip" && (action.value === "off" || action.value === "on")) {
    applyTooltip(spec, action.value, action.restore);
  }
}

export function quadrantControlState(spec: Record<string, unknown>): TeachState {
  return { tooltip: tooltipMode(spec) };
}

export const quadrantTeach: TeachModule = {
  type: "quadrant",
  title: quadrantPageTitle,
  description: quadrantPageDescription,
  examples: quadrantExamples,
  smallestSpec: smallestQuadrantSpec,
  controls: [choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS)],
  apply: applyQuadrantAction,
  controlState: quadrantControlState,
};

for (const example of quadrantExamples) {
  if (example.spec.type !== "quadrant") throw new Error(`${example.id} is not a quadrant`);
}
