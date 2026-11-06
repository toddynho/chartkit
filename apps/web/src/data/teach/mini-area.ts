/**
 * Teaching copy and curated specs for /docs/charts/mini-area.
 * A mini area is a small filled trend with no axes. The band is the chart.
 * mark.curve and mark.gradient are the first drawing choices. Tooltip is shared.
 * fillOpacity, stroke width, and sampling stay in the playground.
 * A line with mark.area is a different chart: it has axes and can hold several series.
 */

import { AREA_OPTIONS, CURVE_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyCurve, curveMode } from "./line-mark.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const miniAreaPageTitle = "Mini area";

export const miniAreaPageDescription =
  "How to build a ChartKit mini area: a small filled trend with no axes, when to use it instead of a sparkline or a line with mark.area, the data shape, a spec that renders, and the options that define the band.";

/** Core example 13-mini-area.json. Six numbers. The fill is on, and the fade is the default. */
export const smallestMiniAreaSpec: Record<string, unknown> = {
  version: "1",
  type: "mini-area",
  data: [4, 6, 5, 8, 7, 11],
  a11y: { alt: "The mini area trends upward and ends at its highest point." },
};

/**
 * Hero signups, and the library showcase "Holds this week".
 * Holds sets a size, turns the fade off, and names the tooltip field.
 */
export const miniAreaExamples: TeachExample[] = [
  {
    id: "signups",
    title: "Signups",
    blurb: "Trailing six weeks. The band rises and ends at its highest point.",
    meta: "6 weeks",
    spec: {
      version: "1",
      type: "mini-area",
      data: [40, 46, 44, 58, 63, 71],
      a11y: { alt: "Signups trend upward and end at their highest point." },
    },
  },
  {
    id: "holds",
    title: "Holds this week",
    blurb: "Seven days. The fade is off, and the spec sets a size, so that size wins.",
    meta: "7 days",
    spec: {
      version: "1",
      id: "library-daily",
      type: "mini-area",
      data: [18, 22, 16, 25, 21, 14, 19],
      mark: { gradient: false },
      tooltip: { fields: [{ field: "value", title: "Holds" }] },
      size: { width: 640, height: 200 },
      a11y: { alt: "Holds peak midweek and dip before the last day." },
    },
  },
];

function exampleMark(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) && isRecord(restore.mark) ? restore.mark : undefined;
}

/**
 * Off writes mark.gradient false. On puts the example's gradient back.
 * An omitted key is deleted, because omission means the fade is on.
 */
export function applyMiniAreaGradient(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = exampleMark(restore);
  editMark(spec, (mark) => {
    if (value === "off") {
      mark.gradient = false;
      return;
    }
    if (source?.gradient === false) mark.gradient = false;
    else if (source?.gradient === true) mark.gradient = true;
    else delete mark.gradient;
  });
}

/** Omitted and true fade toward the baseline. false is a solid band. */
export function miniAreaGradientMode(spec: Record<string, unknown>): "off" | "on" {
  const mark = isRecord(spec.mark) ? spec.mark : {};
  return mark.gradient === false ? "off" : "on";
}

export function applyMiniAreaAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "curve" && (value === "monotone" || value === "linear" || value === "step")) {
    applyCurve(spec, value);
    return;
  }
  if (id === "gradient" && (value === "off" || value === "on")) {
    applyMiniAreaGradient(spec, value, action.restore);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function miniAreaControlState(spec: Record<string, unknown>): TeachState {
  return {
    curve: curveMode(spec),
    gradient: miniAreaGradientMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const miniAreaTeach: TeachModule = {
  type: "mini-area",
  title: miniAreaPageTitle,
  description: miniAreaPageDescription,
  examples: miniAreaExamples,
  smallestSpec: smallestMiniAreaSpec,
  controls: [
    choice("curve", "Curve", "mark.curve", "mark.curve", CURVE_OPTIONS),
    choice("gradient", "Gradient", "mark.gradient", "mark.gradient", AREA_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyMiniAreaAction,
  controlState: miniAreaControlState,
};

for (const example of miniAreaExamples) {
  if (example.spec.type !== "mini-area") throw new Error(`${example.id} is not a mini area`);
}
