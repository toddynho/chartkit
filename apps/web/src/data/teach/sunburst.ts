/**
 * Teaching copy and curated specs for /docs/charts/sunburst.
 * Rings share a treemap's hierarchy. Color follows the top branch.
 * mark.innerRadius is the hole. The default is 0.28. Closing it does not make a pie.
 * Slice names are placed when they fit. There is no mark.labels switch.
 */

import { applyInnerRadius, innerRadiusOf } from "./arc.ts";
import { LINE_LEGEND_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { DEPTH_OPTIONS, applyDepth, depthMode } from "./depth.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const sunburstPageTitle = "Sunburst";

export const sunburstPageDescription =
  "How to build a ChartKit sunburst: concentric rings for a hierarchy, color by the top branch, when to use it instead of a treemap, the data shape, a spec that renders, and the options that define the rings.";

/** README sunburst. One branch and two leaves. The hole uses the sunburst default. */
export const smallestSunburstSpec: Record<string, unknown> = {
  version: "1",
  type: "sunburst",
  data: [{ name: "Ads", children: [{ name: "Search", value: 25 }, { name: "Social", value: 15 }] }],
  a11y: { alt: "Search is most of Ads." },
};

const SUNBURST_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

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

const yard = [
  {
    name: "Skiff",
    children: [
      {
        name: "Cobble",
        children: [
          { name: "Keel", value: 48 },
          { name: "Plank", value: 36 },
          { name: "Paint", value: 18 },
        ],
      },
      { name: "Punt", children: [{ name: "Ribs", value: 22 }, { name: "Oars", value: 14 }] },
    ],
  },
  {
    name: "Lantern",
    children: [
      { name: "Ketch", children: [{ name: "Deck", value: 40 }, { name: "Rig", value: 28 }] },
      { name: "Yawl", children: [{ name: "Hull", value: 26 }, { name: "Sail", value: 16 }] },
    ],
  },
  {
    name: "Moth",
    children: [{ name: "Pram", children: [{ name: "Seams", value: 20 }, { name: "Glue", value: 12 }] }],
  },
];

/**
 * The core traffic sunburst, the Pell cellar in rings, and the Carrick yard hours.
 * The same cellar, in rings and Shed, boat, job are the showcase chart titles.
 */
export const sunburstExamples: TeachExample[] = [
  {
    id: "traffic",
    title: "Traffic by source",
    blurb: "Organic search is the largest share of traffic.",
    meta: "2 rings",
    spec: {
      version: "1",
      type: "sunburst",
      title: "Traffic by source",
      data: [
        { name: "Organic", children: [{ name: "Search", value: 4200 }, { name: "Referral", value: 1800 }] },
        { name: "Paid", children: [{ name: "Search", value: 2600 }, { name: "Social", value: 900 }] },
      ],
      a11y: { alt: "Organic search is the largest share of traffic." },
    },
  },
  {
    id: "cellar",
    title: "The same cellar, in rings",
    blurb: "The inner ring is the orchard, then the apple, then the cask.",
    meta: "3 rings",
    spec: {
      version: "1",
      id: "pell-press-rings",
      type: "sunburst",
      title: "The same cellar",
      subtitle: "Three rings, one total.",
      theme: "soft",
      locale: "en-GB",
      data: press,
      encoding: {
        x: "name",
        y: { field: "value", title: "Litres", format: { style: "number", suffix: " L" } },
      },
      mark: { innerRadius: 0.42 },
      legend: { position: "bottom" },
      size: { width: 560, height: 640 },
      a11y: {
        alt: "A sunburst of the same 7,460 litres. North, River, and Walled wrap the hole, then each apple, then each cask.",
      },
    },
  },
  {
    id: "yard",
    title: "Shed, boat, job",
    blurb: "Skiff, Lantern, and Moth. Cobble takes the longest job list.",
    meta: "3 rings",
    spec: {
      version: "1",
      id: "carrick-yard-sheds",
      type: "sunburst",
      title: "Winter hours",
      subtitle: "Shed, then boat, then job.",
      theme: "soft",
      locale: "en-GB",
      data: yard,
      encoding: {
        x: "name",
        y: { field: "value", title: "Hours", format: { style: "number", suffix: " h" } },
      },
      mark: { innerRadius: 0.4 },
      legend: { position: "bottom" },
      size: { width: 560, height: 620 },
      a11y: { alt: "280 hours of winter work. Cobble in the Skiff shed is the largest boat, then Ketch in the Lantern shed." },
    },
  },
];

export function applySunburstAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "innerRadius" && typeof value === "number") {
    applyInnerRadius(spec, value);
    return;
  }
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

export function sunburstControlState(spec: Record<string, unknown>): TeachState {
  return {
    innerRadius: innerRadiusOf(spec, 0.28),
    depth: depthMode(spec),
    legend: legendChoice(spec, SUNBURST_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const sunburstTeach: TeachModule = {
  type: "sunburst",
  title: sunburstPageTitle,
  description: sunburstPageDescription,
  examples: sunburstExamples,
  smallestSpec: smallestSunburstSpec,
  controls: [
    {
      kind: "range",
      id: "innerRadius",
      label: "Hole",
      code: "mark.innerRadius",
      min: 0,
      max: 0.75,
      step: 0.01,
      aria: "mark.innerRadius",
    },
    choice("depth", "Levels", "mark.depth", "mark.depth", DEPTH_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applySunburstAction,
  controlState: sunburstControlState,
};

for (const example of sunburstExamples) {
  if (example.spec.type !== "sunburst") throw new Error(`${example.id} is not a sunburst`);
}
