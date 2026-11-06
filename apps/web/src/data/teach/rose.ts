/**
 * Teaching copy and curated specs for /docs/charts/rose.
 * Equal angles. The radius is the value. A pie encodes share as the angle.
 * A radial bar puts categories around a circle and uses bar length for the radius.
 * mark.sort does not apply here. One published rose is enough. The others are the same audience.
 * Labels are off when omitted. On puts the example's label keys back, the same way a bar does.
 */

import { applyStartAngle, startAngleMode } from "./arc.ts";
import { applyBarLabels, barLabelMode } from "./bar.ts";
import { AREA_OPTIONS, LINE_LEGEND_OPTIONS, START_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const rosePageTitle = "Rose";

export const rosePageDescription =
  "How to build a ChartKit rose: equal angles, radius from the value, when to use it instead of a pie or a radial bar, the data shape, a spec that renders, and the options that define the sectors.";

/** Feature-page rose. Four places. The gap and the labels use the rose defaults until you set them. */
export const smallestRoseSpec: Record<string, unknown> = {
  version: "1",
  type: "rose",
  data: [
    { place: "Hale", listeners: 4200 },
    { place: "Mill", listeners: 3100 },
    { place: "Quay", listeners: 5600 },
    { place: "Ridge", listeners: 1800 },
  ],
  encoding: { x: "place", y: "listeners" },
  layout: { coordinate: "polar" },
  a11y: { alt: "Quay is the largest share of the evening audience." },
};

const ROSE_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

/**
 * Lumen desk, Saturday audience. Gallery, homepage, and the core example are this same chart.
 */
export const roseExamples: TeachExample[] = [
  {
    id: "audience",
    title: "Saturday audience",
    blurb: "Equal angles. The radius is listeners. Quay reaches farthest.",
    meta: "6 categories",
    spec: {
      version: "1",
      id: "lumen-desk-audience",
      type: "rose",
      title: "Saturday audience",
      subtitle: "Listeners by neighbourhood.",
      theme: "soft",
      locale: "en-GB",
      data: [
        { place: "Hale", listeners: 4200 },
        { place: "Mill", listeners: 3100 },
        { place: "Quay", listeners: 5600 },
        { place: "Ridge", listeners: 1800 },
        { place: "Yard", listeners: 2400 },
        { place: "Orchard", listeners: 3900 },
      ],
      encoding: {
        x: { field: "place", title: "Place" },
        y: { field: "listeners", title: "Listeners", format: { specifier: ",.0f" } },
      },
      mark: { padAngle: 1.2, labels: true },
      layout: { coordinate: "polar" },
      size: { width: 520, height: 480 },
      a11y: { alt: "Quay is the largest share of the evening audience." },
    },
  },
];

export function applyRoseAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "startAngle") {
    applyStartAngle(spec, Number(value));
    return;
  }
  if (id === "labels" && (value === "off" || value === "on")) {
    applyBarLabels(spec, value, action.restore);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function roseControlState(spec: Record<string, unknown>): TeachState {
  return {
    startAngle: startAngleMode(spec),
    labels: barLabelMode(spec),
    legend: legendChoice(spec, ROSE_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const roseTeach: TeachModule = {
  type: "rose",
  title: rosePageTitle,
  description: rosePageDescription,
  examples: roseExamples,
  smallestSpec: smallestRoseSpec,
  controls: [
    choice("startAngle", "Start", "mark.startAngle", "mark.startAngle", START_OPTIONS),
    choice("labels", "Labels", "mark.labels", "mark.labels", AREA_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyRoseAction,
  controlState: roseControlState,
};

for (const example of roseExamples) {
  if (example.spec.type !== "rose") throw new Error(`${example.id} is not a rose`);
}
