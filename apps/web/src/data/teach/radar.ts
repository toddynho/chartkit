/**
 * Teaching copy and curated specs for /docs/charts/radar.
 * One polygon per series around shared spokes. The distance from the center is the value.
 * A rose fills an equal angle out to one number. A radial bar draws a bar on a track.
 * The legend is part of a first radar with two series. It sits along the bottom when omitted.
 * Top is the shared legend default and this chart keeps those bottom names for it, so the control offers the places that move.
 * mark.rings and mark.fillOpacity do not apply. Theme preset chips are not on this page.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const radarPageTitle = "Radar";

export const radarPageDescription =
  "How to build a ChartKit radar: spokes and one polygon per series, when to use it instead of a rose or a radial bar, the data shape, a spec that renders, and the options that define the polygons.";

/** Three spokes and two series. That is enough to draw, and enough for a legend. */
export const smallestRadarSpec: Record<string, unknown> = {
  version: "1",
  type: "radar",
  data: [
    { spoke: "Speed", car: 4, bike: 2 },
    { spoke: "Comfort", car: 3, bike: 5 },
    { spoke: "Cost", car: 2, bike: 4 },
  ],
  encoding: { x: "spoke", y: ["car", "bike"] },
  a11y: { alt: "The bike leads on comfort and cost. The car leads on speed." },
};

const RADAR_LEGEND_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "bottom", label: "Bottom" },
  { value: "right", label: "Right" },
] as const;

const RADAR_LEGEND = { omitted: "bottom" as const, known: ["bottom", "right"] as const };

/**
 * Model comparison is the core example and the gallery chart.
 * Team skills is the homepage radar: one series, legend hidden.
 */
export const radarExamples: TeachExample[] = [
  {
    id: "models",
    title: "Model comparison",
    blurb: "Two polygons. The car leads on comfort. The bike leads on cost and handling.",
    meta: "2 series",
    spec: {
      version: "1",
      type: "radar",
      title: "Model comparison",
      data: [
        { spoke: "Speed", car: 7, bike: 5 },
        { spoke: "Handling", car: 6, bike: 8 },
        { spoke: "Comfort", car: 8, bike: 4 },
        { spoke: "Safety", car: 7, bike: 6 },
        { spoke: "Range", car: 5, bike: 7 },
        { spoke: "Cost", car: 3, bike: 8 },
      ],
      encoding: { x: "spoke", y: ["car", "bike"] },
      a11y: { alt: "The car leads on comfort and the bike leads on cost and handling." },
    },
  },
  {
    id: "skills",
    title: "Team skills",
    blurb: "One polygon. Design is the high spoke. Data is the low one.",
    meta: "1 series",
    spec: {
      version: "1",
      type: "radar",
      title: "Team skills",
      subtitle: "Self-assessed, 6 axes",
      data: [
        { axis: "Design", score: 88 },
        { axis: "Infra", score: 62 },
        { axis: "Product", score: 74 },
        { axis: "Data", score: 50 },
        { axis: "Support", score: 68 },
        { axis: "Research", score: 80 },
      ],
      encoding: { x: "axis", y: "score" },
      legend: false,
      size: { width: 520, height: 300 },
      a11y: { alt: "Design scores highest at 88. Data is the low spoke at 50." },
    },
  },
];

export function applyRadarAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "legend" && (value === "off" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function radarControlState(spec: Record<string, unknown>): TeachState {
  return {
    legend: legendChoice(spec, RADAR_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const radarTeach: TeachModule = {
  type: "radar",
  title: radarPageTitle,
  description: radarPageDescription,
  examples: radarExamples,
  smallestSpec: smallestRadarSpec,
  controls: [
    choice("legend", "Legend", "legend", "legend", RADAR_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyRadarAction,
  controlState: radarControlState,
};

for (const example of radarExamples) {
  if (example.spec.type !== "radar") throw new Error(`${example.id} is not a radar`);
}
