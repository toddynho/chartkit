/**
 * Teaching copy and curated specs for /docs/charts/radial-bar.
 * Categories sit around a circle. Bar length is the radius.
 * A rose gives every category the same angle and fills the sector out to the value.
 * A regular bar is the chart when the categories should sit on a straight axis.
 * mark.sort does not apply. Labels follow the bar rule: omitted is off, and On puts the example's label keys back.
 */

import { applyInnerRadius, applyStartAngle, innerRadiusOf, startAngleMode } from "./arc.ts";
import { applyBarLabels, applyBarStack, barLabelMode, barStackMode } from "./bar.ts";
import { AREA_OPTIONS, BAR_STACK_OPTIONS, LINE_LEGEND_OPTIONS, START_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const radialBarPageTitle = "Radial bar";

export const radialBarPageDescription =
  "How to build a ChartKit radial bar: categories around a circle, length from the value, when to use it instead of a rose or a bar, the data shape, a spec that renders, and the options that define the bars.";

/** Feature-page radial bar. Four desks, two series, grouped. The hole uses the radial-bar default. */
export const smallestRadialBarSpec: Record<string, unknown> = {
  version: "1",
  type: "radial-bar",
  data: [
    { desk: "Music", weeknight: 186, saturday: 210 },
    { desk: "Talk", weeknight: 74, saturday: 48 },
    { desk: "News", weeknight: 36, saturday: 22 },
    { desk: "Sky", weeknight: 18, saturday: 16 },
  ],
  encoding: { x: "desk", y: ["weeknight", "saturday"] },
  layout: { coordinate: "polar" },
  a11y: { alt: "Saturday music runs longer, and talk shrinks." },
};

const RADIAL_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

/**
 * The core Lumen desks, and the homepage minutes chart, which drops Ident and hides the legend.
 */
export const radialBarExamples: TeachExample[] = [
  {
    id: "lumen",
    title: "Lumen, minutes by desk",
    blurb: "Saturday music runs longer, and talk shrinks.",
    meta: "6 categories",
    spec: {
      version: "1",
      id: "lumen-radial-bar",
      type: "radial-bar",
      title: "Lumen, minutes by desk",
      data: [
        { desk: "Music", weeknight: 186, saturday: 210 },
        { desk: "Talk", weeknight: 74, saturday: 48 },
        { desk: "News", weeknight: 36, saturday: 22 },
        { desk: "Sky", weeknight: 18, saturday: 16 },
        { desk: "Spots", weeknight: 28, saturday: 40 },
        { desk: "Ident", weeknight: 8, saturday: 6 },
      ],
      encoding: {
        x: "desk",
        y: [
          { field: "weeknight", title: "Weeknight" },
          { field: "saturday", title: "Saturday" },
        ],
      },
      mark: { innerRadius: 0.34, padAngle: 2, cornerRadius: 4 },
      layout: { coordinate: "polar" },
      a11y: { alt: "Saturday music runs longer, and talk shrinks." },
    },
  },
  {
    id: "minutes",
    title: "Minutes by desk",
    blurb: "Music is the longest desk on both weeknights and Saturday.",
    meta: "5 categories",
    spec: {
      version: "1",
      type: "radial-bar",
      title: "Minutes by desk",
      subtitle: "Weeknight vs Saturday",
      data: [
        { desk: "Music", weeknight: 186, saturday: 210 },
        { desk: "Talk", weeknight: 74, saturday: 48 },
        { desk: "News", weeknight: 36, saturday: 22 },
        { desk: "Sky", weeknight: 18, saturday: 16 },
        { desk: "Spots", weeknight: 28, saturday: 40 },
      ],
      encoding: {
        x: "desk",
        y: [
          { field: "weeknight", title: "Weeknight" },
          { field: "saturday", title: "Saturday" },
        ],
      },
      legend: false,
      size: { width: 520, height: 300 },
      a11y: { alt: "Music is the longest desk on both weeknights and Saturday." },
    },
  },
];

export function applyRadialBarAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "innerRadius" && typeof value === "number") {
    applyInnerRadius(spec, value);
    return;
  }
  if (id === "startAngle") {
    applyStartAngle(spec, Number(value));
    return;
  }
  if (id === "stack" && (value === "none" || value === "stack" || value === "percent")) {
    applyBarStack(spec, value);
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

export function radialBarControlState(spec: Record<string, unknown>): TeachState {
  return {
    innerRadius: innerRadiusOf(spec, 0.34),
    startAngle: startAngleMode(spec),
    stack: barStackMode(spec),
    labels: barLabelMode(spec),
    legend: legendChoice(spec, RADIAL_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const radialBarTeach: TeachModule = {
  type: "radial-bar",
  title: radialBarPageTitle,
  description: radialBarPageDescription,
  examples: radialBarExamples,
  smallestSpec: smallestRadialBarSpec,
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
    choice("startAngle", "Start", "mark.startAngle", "mark.startAngle", START_OPTIONS),
    choice("stack", "Stack", "mark.stack", "mark.stack", BAR_STACK_OPTIONS),
    choice("labels", "Labels", "mark.labels", "mark.labels", AREA_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyRadialBarAction,
  controlState: radialBarControlState,
};

for (const example of radialBarExamples) {
  if (example.spec.type !== "radial-bar") throw new Error(`${example.id} is not a radial bar`);
}
