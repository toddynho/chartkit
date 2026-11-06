/**
 * Teaching copy and curated specs for /docs/charts/area-range.
 * A band between a low and a high, with an optional center line.
 * A filled line is type line with mark.area. A stacked area adds series into one total.
 * mark.line omitted means the center line is on when y is set. mark.strokeDash dashes that line where the band is present.
 * The name row above the plot is drawn with the marks. legend.position does not place it, so this page has no legend control.
 * Theme preset chips are not on this page.
 */

import { AREA_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const areaRangePageTitle = "Range area";

export const areaRangePageDescription =
  "How to build a ChartKit range area: a band between a low and a high, when to use it instead of a filled line or a stacked area, the data shape, a spec that renders, and the options that define the band.";

/** Core example 30-area-range.json with the title and the today rule left off. The center line is on. */
export const smallestAreaRangeSpec: Record<string, unknown> = {
  version: "1",
  type: "area-range",
  data: [
    { month: "Jan", revenue: 420, lo: null, hi: null },
    { month: "Feb", revenue: 390, lo: null, hi: null },
    { month: "Mar", revenue: 450, lo: null, hi: null },
    { month: "Apr", revenue: 510, lo: 470, hi: 560 },
    { month: "May", revenue: 540, lo: 480, hi: 610 },
    { month: "Jun", revenue: 580, lo: 500, hi: 670 },
  ],
  encoding: {
    x: "month",
    y: { field: "revenue", title: "Forecast" },
    low: "lo",
    high: "hi",
  },
  a11y: { alt: "Revenue is forecast from April, with a band that widens through June." },
};

/**
 * The gallery and core forecast, and the Pell Hall showcase with nested bands and a dashed forecast.
 * Titles stay as published.
 */
export const areaRangeExamples: TeachExample[] = [
  {
    id: "forecast",
    title: "Revenue forecast",
    blurb: "A center line and a band that starts after today.",
    meta: "6 months",
    spec: {
      version: "1",
      id: "revenue-forecast",
      type: "area-range",
      title: "Revenue forecast",
      data: [
        { month: "Jan", revenue: 420, lo: null, hi: null },
        { month: "Feb", revenue: 390, lo: null, hi: null },
        { month: "Mar", revenue: 450, lo: null, hi: null },
        { month: "Apr", revenue: 510, lo: 470, hi: 560 },
        { month: "May", revenue: 540, lo: 480, hi: 610 },
        { month: "Jun", revenue: 580, lo: 500, hi: 670 },
      ],
      encoding: {
        x: "month",
        y: { field: "revenue", title: "Forecast" },
        low: "lo",
        high: "hi",
      },
      annotations: [{ type: "rule", axis: "x", value: "Apr", label: "today" }],
      size: { width: 640, height: 320 },
      a11y: { alt: "Revenue is forecast from April, with a band that widens through June." },
    },
  },
  {
    id: "pell",
    title: "Seats filled at Pell Hall",
    blurb: "Actuals through August. From September the line is dashed, inside an 80% band and a wider 95% band.",
    meta: "2 bands",
    spec: {
      version: "1",
      id: "pell-seats",
      type: "area-range",
      title: "Seats filled at Pell Hall",
      theme: "soft",
      locale: "en-GB",
      data: [
        { month: "Jan", seats: 640, tightLo: null, tightHi: null, wideLo: null, wideHi: null },
        { month: "Feb", seats: 610, tightLo: null, tightHi: null, wideLo: null, wideHi: null },
        { month: "Mar", seats: 720, tightLo: null, tightHi: null, wideLo: null, wideHi: null },
        { month: "Apr", seats: 810, tightLo: null, tightHi: null, wideLo: null, wideHi: null },
        { month: "May", seats: 860, tightLo: null, tightHi: null, wideLo: null, wideHi: null },
        { month: "Jun", seats: 940, tightLo: null, tightHi: null, wideLo: null, wideHi: null },
        { month: "Jul", seats: 980, tightLo: null, tightHi: null, wideLo: null, wideHi: null },
        { month: "Aug", seats: 1120, tightLo: null, tightHi: null, wideLo: null, wideHi: null },
        { month: "Sep", seats: 1080, tightLo: 980, tightHi: 1180, wideLo: 900, wideHi: 1280 },
        { month: "Oct", seats: 1140, tightLo: 1000, tightHi: 1280, wideLo: 900, wideHi: 1400 },
        { month: "Nov", seats: 1210, tightLo: 1040, tightHi: 1360, wideLo: 920, wideHi: 1500 },
        { month: "Dec", seats: 1260, tightLo: 1080, tightHi: 1440, wideLo: 960, wideHi: 1580 },
      ],
      encoding: {
        x: { field: "month", title: "Month" },
        y: [
          { lo: "wideLo", hi: "wideHi", title: "95%" },
          { lo: "tightLo", hi: "tightHi", title: "80%" },
          { field: "seats", title: "Seats" },
        ],
      },
      mark: { strokeDash: true },
      axes: { x: { title: "Month" }, y: { title: "Seats" } },
      annotations: [
        { type: "rule", axis: "x", value: "Sep", label: "Today", labelPosition: "start", dash: "dashed" },
        { type: "band", axis: "y", from: 1400, to: 1580, label: "Full house", opacity: 0.14 },
        { type: "marker", x: "Aug", y: 1120, label: "Best month", dx: -108, dy: -28 },
      ],
      size: { width: 1040, height: 480 },
      a11y: {
        alt: "Seats filled at Pell Hall rise from 640 in January to 1,120 in August, then a dashed forecast climbs toward the full-house band, inside an 80% band and a wider 95% band.",
      },
    },
  },
];

function restoredMark(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) && isRecord(restore.mark) ? restore.mark : undefined;
}

/**
 * Off writes mark.line false. On puts the example's on-state back:
 * an omitted key is deleted, and an explicit true is written true.
 * An example that started off becomes true, because On is the line.
 */
export function applyCenterLine(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = restoredMark(restore)?.line;
  editMark(spec, (mark) => {
    if (value === "off") {
      mark.line = false;
      return;
    }
    if (source === true) mark.line = true;
    else if (source === false) mark.line = true;
    else delete mark.line;
  });
}

/** Omitted and true draw the center line when y is set. false draws the band only. */
export function centerLineMode(spec: Record<string, unknown>): "off" | "on" | "other" {
  const line = isRecord(spec.mark) ? spec.mark.line : undefined;
  if (line === false) return "off";
  if (line === undefined || line === true) return "on";
  return "other";
}

/**
 * On writes mark.strokeDash true. Off writes false when the example set the key,
 * and deletes it when the example omitted it. Omitted means the line stays solid.
 */
export function applyForecastDash(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = restoredMark(restore)?.strokeDash;
  editMark(spec, (mark) => {
    if (value === "on") {
      mark.strokeDash = true;
      return;
    }
    if (source === true || source === false) mark.strokeDash = false;
    else delete mark.strokeDash;
  });
}

/** Omitted and false keep the center line solid. true dashes it where the band is present. */
export function forecastDashMode(spec: Record<string, unknown>): "off" | "on" | "other" {
  const dash = isRecord(spec.mark) ? spec.mark.strokeDash : undefined;
  if (dash === true) return "on";
  if (dash === undefined || dash === false) return "off";
  return "other";
}

export function applyAreaRangeAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "line" && (value === "off" || value === "on")) {
    applyCenterLine(spec, value, action.restore);
    return;
  }
  if (id === "dash" && (value === "off" || value === "on")) {
    applyForecastDash(spec, value, action.restore);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function areaRangeControlState(spec: Record<string, unknown>): TeachState {
  return {
    line: centerLineMode(spec),
    dash: forecastDashMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const areaRangeTeach: TeachModule = {
  type: "area-range",
  title: areaRangePageTitle,
  description: areaRangePageDescription,
  examples: areaRangeExamples,
  smallestSpec: smallestAreaRangeSpec,
  controls: [
    choice("line", "Center line", "mark.line", "mark.line", AREA_OPTIONS),
    choice("dash", "Forecast dash", "mark.strokeDash", "mark.strokeDash", AREA_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyAreaRangeAction,
  controlState: areaRangeControlState,
};

for (const example of areaRangeExamples) {
  if (example.spec.type !== "area-range") throw new Error(`${example.id} is not a range area`);
}
