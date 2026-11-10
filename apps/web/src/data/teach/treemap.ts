/**
 * Teaching copy and curated specs for /docs/charts/treemap.
 * Flat tiles use encoding.color for the group. Nested children, a path, or id and parent
 * draw levels, and mark.depth caps them. Every example here is three levels deep, so 1, 2, and 3
 * each paint a different cut. Tile labels are drawn when the tile fits.
 * There is no mark.labels switch, and mark.palette does not apply, so neither is a control.
 */

import { LINE_LEGEND_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { DEPTH_OPTIONS, applyDepth, depthMode } from "./depth.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const treemapPageTitle = "Treemap";

export const treemapPageDescription =
  "How to build a ChartKit treemap: area tiles for a whole, flat groups or a hierarchy, when to use it instead of a sunburst, the data shape, a spec that renders, and the options that define the tiles.";

/** README treemap. Three tiles in two groups. Nested levels are not required. */
export const smallestTreemapSpec: Record<string, unknown> = {
  version: "1",
  type: "treemap",
  data: [
    { name: "Oak", size: 8, group: "Wood" },
    { name: "Pine", size: 5, group: "Wood" },
    { name: "Steel", size: 6, group: "Metal" },
  ],
  encoding: { x: "name", y: "size", color: "group" },
  a11y: { alt: "Oak is the largest tile." },
};

const TREEMAP_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

const press = [
  {
    name: "North",
    children: [
      { name: "Russet", children: [{ name: "Ash", value: 980 }, { name: "Elm", value: 820 }] },
      { name: "Pippin", children: [{ name: "Beech", value: 760 }, { name: "Holly", value: 540 }] },
    ],
  },
  {
    name: "River",
    children: [
      { name: "Bramley", children: [{ name: "Oak", value: 1120 }, { name: "Yew", value: 640 }] },
      { name: "Cox", children: [{ name: "Lime", value: 580 }, { name: "Alder", value: 420 }] },
    ],
  },
  {
    name: "Walled",
    children: [
      { name: "Quince", children: [{ name: "Maple", value: 610 }, { name: "Birch", value: 390 }] },
      { name: "Medlar", children: [{ name: "Cedar", value: 340 }, { name: "Thorn", value: 260 }] },
    ],
  },
];

const market = [
  {
    name: "Quay",
    children: [
      { name: "Salt", children: [{ name: "Oats", value: 200 }, { name: "Honey", value: 160 }] },
      { name: "Kelp", children: [{ name: "Bread", value: 160 }, { name: "Cheese", value: 120 }] },
    ],
  },
  {
    name: "Hill",
    children: [
      { name: "Wool", children: [{ name: "Yarn", value: 180 }, { name: "Felt", value: 140 }] },
      { name: "Tin", children: [{ name: "Spoons", value: 140 }, { name: "Lamps", value: 100 }] },
    ],
  },
  {
    name: "Lane",
    children: [
      { name: "Paper", children: [{ name: "Cards", value: 150 }, { name: "Maps", value: 120 }] },
      { name: "Ink", children: [{ name: "Black", value: 120 }, { name: "Red", value: 90 }] },
    ],
  },
];

/**
 * The core inventory, the Pell press cellar, and the brine-market stalls.
 * Litres by cask and Where the crates sat are the showcase chart titles.
 */
export const treemapExamples: TeachExample[] = [
  {
    id: "inventory",
    title: "Inventory by material",
    blurb: "Wood, metal, and glass, each split into a kind. Oak is the largest tile.",
    meta: "12 tiles",
    spec: {
      version: "1",
      type: "treemap",
      title: "Inventory by material",
      data: [
        {
          name: "Wood",
          children: [
            { name: "Hardwood", children: [{ name: "Oak", size: 42 }, { name: "Walnut", size: 12 }] },
            { name: "Softwood", children: [{ name: "Pine", size: 28 }, { name: "Maple", size: 18 }] },
          ],
        },
        {
          name: "Metal",
          children: [
            { name: "Ferrous", children: [{ name: "Steel", size: 36 }] },
            {
              name: "Nonferrous",
              children: [
                { name: "Aluminum", size: 22 },
                { name: "Copper", size: 14 },
                { name: "Tin", size: 8 },
              ],
            },
          ],
        },
        {
          name: "Glass",
          children: [
            { name: "Sheet", children: [{ name: "Clear", size: 24 }, { name: "Tinted", size: 16 }] },
            { name: "Worked", children: [{ name: "Laminated", size: 11 }, { name: "Mirror", size: 7 }] },
          ],
        },
      ],
      encoding: { x: "name", y: "size" },
      a11y: { alt: "Wood, metal, and glass each hold several products, and oak is the largest tile." },
    },
  },
  {
    id: "cellar",
    title: "Litres by cask",
    blurb: "North, River, and Walled. Oak, under Bramley, is the largest cask at 1,120 liters.",
    meta: "3 levels",
    spec: {
      version: "1",
      id: "pell-press-tiles",
      type: "treemap",
      title: "Pell press",
      subtitle: "Orchard, apple, then cask.",
      theme: "soft",
      locale: "en-GB",
      data: press,
      encoding: {
        x: "name",
        y: { field: "value", title: "Litres", format: { style: "number", suffix: " L" } },
      },
      legend: { position: "bottom" },
      size: { width: 560, height: 640 },
      a11y: {
        alt: "The Pell press holds 7,460 litres. North and River are the larger orchards. Oak, a Bramley cask, is the single largest tile at 1,120 litres.",
      },
    },
  },
  {
    id: "crates",
    title: "Where the crates sat",
    blurb: "Quay is 640 crates, Hill 560, Lane 480. Oats is the largest single good.",
    meta: "3 levels",
    spec: {
      version: "1",
      id: "brine-market-stalls",
      type: "treemap",
      title: "Crates in the market",
      subtitle: "Row, stall, then good.",
      theme: "soft",
      locale: "en-GB",
      data: market,
      encoding: { x: "name", y: { field: "value", title: "Crates", format: { style: "number" } } },
      legend: { position: "bottom" },
      size: { width: 560, height: 620 },
      a11y: { alt: "1,680 crates across Quay, Hill, and Lane. Oats at the Salt stall is the largest good, at 200 crates." },
    },
  },
];

export function applyTreemapAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "depth" && (value === "all" || value === "1" || value === "2" || value === "3")) {
    applyDepth(spec, value);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function treemapControlState(spec: Record<string, unknown>): TeachState {
  return {
    depth: depthMode(spec),
    legend: legendChoice(spec, TREEMAP_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const treemapTeach: TeachModule = {
  type: "treemap",
  title: treemapPageTitle,
  description: treemapPageDescription,
  examples: treemapExamples,
  smallestSpec: smallestTreemapSpec,
  controls: [
    choice("depth", "Levels", "mark.depth", "mark.depth", DEPTH_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyTreemapAction,
  controlState: treemapControlState,
};

for (const example of treemapExamples) {
  if (example.spec.type !== "treemap") throw new Error(`${example.id} is not a treemap`);
}
