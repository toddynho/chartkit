/**
 * Teaching copy and curated specs for /docs/charts/sankey.
 * A row is a link. Width is the amount. Nodes fall into columns.
 * Node width, padding, and alignment are not spec keys, so they are not controls.
 * The node names are the labels. There is no legend.
 * Tooltip is on when the key is omitted.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const sankeyPageTitle = "Sankey";

export const sankeyPageDescription =
  "How to build a ChartKit sankey: nodes and links, width from the flow, when to use it instead of a funnel, the data shape, a spec that renders, and the tooltip.";

/** Feature-page sankey. Two links, three nodes. Columns and ribbon shape come from the graph. */
export const smallestSankeySpec: Record<string, unknown> = {
  version: "1",
  type: "sankey",
  data: [
    { source: "Ads", target: "Landing", value: 40 },
    { source: "Landing", target: "Paid", value: 18 },
  ],
  encoding: { source: "source", target: "target", y: "value" },
  a11y: { alt: "Ads reach paid through the landing page." },
};

/**
 * The core acquisition flow, the bike-share docks, and the ferry with return ribbons.
 * Titles are the spec title or the showcase chart title.
 * Mill flow is the same acquisition chart trimmed, so it is not a second example.
 */
export const sankeyExamples: TeachExample[] = [
  {
    id: "acquisition",
    title: "Acquisition flow",
    blurb: "Ads and search reach trial and paid mostly through the landing page and the product page.",
    meta: "10 links",
    spec: {
      version: "1",
      type: "sankey",
      title: "Acquisition flow",
      data: [
        { from: "Ads", to: "Landing", flow: 40 },
        { from: "Ads", to: "Product", flow: 25 },
        { from: "Search", to: "Landing", flow: 30 },
        { from: "Search", to: "Blog", flow: 20 },
        { from: "Search", to: "Product", flow: 15 },
        { from: "Landing", to: "Trial", flow: 35 },
        { from: "Landing", to: "Paid", flow: 20 },
        { from: "Product", to: "Trial", flow: 18 },
        { from: "Product", to: "Paid", flow: 16 },
        { from: "Blog", to: "Trial", flow: 8 },
      ],
      encoding: { source: "from", target: "to", y: "flow" },
      a11y: { alt: "Ads and search reach trial and paid mostly through the landing page and the product page." },
    },
  },
  {
    id: "docks",
    title: "Neighbourhood flows",
    blurb: "Lantern feeds Quay, Kiln, and Moth. Nothing rides back upstream.",
    meta: "6 links",
    spec: {
      version: "1",
      id: "bike-flows",
      type: "sankey",
      theme: "soft",
      data: [
        { from: "Lantern", to: "Quay", trips: 240 },
        { from: "Lantern", to: "Kiln", trips: 150 },
        { from: "Lantern", to: "Moth", trips: 80 },
        { from: "Quay", to: "Kiln", trips: 70 },
        { from: "Quay", to: "Moth", trips: 160 },
        { from: "Kiln", to: "Moth", trips: 110 },
      ],
      encoding: { source: "from", target: "to", y: "trips" },
      size: { width: 980, height: 560 },
      a11y: { alt: "Lantern sends the most trips to Quay. Quay and Kiln both feed Moth, and nothing rides back upstream." },
    },
  },
  {
    id: "ferry",
    title: "Where the boats go, and come back",
    blurb: "Kelp sends some boats straight back. Skiff and Dock return the rest, over the columns.",
    meta: "8 links",
    spec: {
      version: "1",
      id: "ferry-flows",
      type: "sankey",
      theme: "soft",
      data: [
        { from: "Brine", to: "Kelp", crossings: 180 },
        { from: "Brine", to: "Cairn", crossings: 100 },
        { from: "Kelp", to: "Skiff", crossings: 120 },
        { from: "Kelp", to: "Brine", crossings: 60 },
        { from: "Cairn", to: "Dock", crossings: 70 },
        { from: "Cairn", to: "Skiff", crossings: 30 },
        { from: "Skiff", to: "Brine", crossings: 150 },
        { from: "Dock", to: "Brine", crossings: 70 },
      ],
      encoding: { source: "from", target: "to", y: "crossings" },
      size: { width: 980, height: 560 },
      a11y: {
        alt: "280 crossings leave Brine. Kelp returns 60 directly. Skiff returns 150 and Dock returns 70, so every boat comes back.",
      },
    },
  },
];

export function applySankeyAction(spec: Record<string, unknown>, action: TeachAction): void {
  if (action.id === "tooltip" && (action.value === "off" || action.value === "on")) {
    applyTooltip(spec, action.value, action.restore);
  }
}

export function sankeyControlState(spec: Record<string, unknown>): TeachState {
  return { tooltip: tooltipMode(spec) };
}

export const sankeyTeach: TeachModule = {
  type: "sankey",
  title: sankeyPageTitle,
  description: sankeyPageDescription,
  examples: sankeyExamples,
  smallestSpec: smallestSankeySpec,
  controls: [choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS)],
  apply: applySankeyAction,
  controlState: sankeyControlState,
};

for (const example of sankeyExamples) {
  if (example.spec.type !== "sankey") throw new Error(`${example.id} is not a sankey`);
}
