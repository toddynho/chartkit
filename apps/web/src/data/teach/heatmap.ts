/**
 * Teaching copy and curated specs for /docs/charts/heatmap.
 * A heatmap paints cells by a number. The position is the category. The color is the value.
 * Grid versus calendar is the chart you choose with the data, not a toggle on one table:
 * a date calendar has no row field, and a category grid has no dates, so layout is the examples.
 * The scheme is the ramp a first heatmap sets. Gap, corner radius, weeks, and binned scales stay in the playground.
 * The color ramp is not the series legend. Theme preset chips are not on this page.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const heatmapPageTitle = "Heatmap";

export const heatmapPageDescription =
  "How to build a ChartKit heatmap: cells colored by a value, when to use a grid or a calendar instead of a bar or a table, the data shape, a spec that renders, and the options that define the color.";

/** Feature-page matrix. Two cells. encoding.y makes this a grid, so mark.layout can be omitted. */
export const smallestHeatmapSpec: Record<string, unknown> = {
  version: "1",
  type: "heatmap",
  data: [
    { x: "A", y: "Low", v: 1 },
    { x: "B", y: "Low", v: 4 },
  ],
  encoding: { x: "x", y: "y", color: "v" },
  a11y: { alt: "B is darker than A on the same row." },
};

const SCHEME_OPTIONS = [
  { value: "blue", label: "Blue" },
  { value: "teal", label: "Teal" },
  { value: "orange", label: "Orange" },
  { value: "violet", label: "Violet" },
] as const;

export type HeatScheme = (typeof SCHEME_OPTIONS)[number]["value"];

const HOURS = ["6", "8", "10", "12", "14", "16", "18", "20"] as const;

/** Gallery heatmap. Weekday middays are the busiest cells. */
const REQUESTS: Record<string, readonly number[]> = {
  Mon: [2, 4, 7, 11, 9, 6, 3, 1],
  Tue: [11, 9, 6, 3, 1, 3, 6, 10],
  Wed: [3, 1, 3, 6, 10, 14, 12, 8],
  Thu: [6, 10, 14, 12, 8, 4, 2, 1],
  Fri: [12, 8, 4, 2, 1, 3, 5, 8],
  Sat: [2, 1, 3, 5, 8, 6, 4, 2],
  Sun: [5, 8, 6, 4, 2, 1, 2, 4],
};

function commitRows(): { date: string; value: number }[] {
  const start = Date.UTC(2026, 0, 5);
  const pattern = [1, 3, 2, 6, 4, 0, 5, 8, 2, 7, 3, 1, 9, 4, 2];
  return Array.from({ length: 84 }, (_, index) => {
    const date = new Date(start + index * 86_400_000).toISOString().slice(0, 10);
    return { date, value: pattern[index % pattern.length] ?? 0 };
  });
}

/**
 * Requests by hour is the gallery grid. Load by service is the category matrix.
 * Commit calendar is the date layout, twelve weeks.
 * Titles are the chart titles. They are not shortened.
 */
export const heatmapExamples: TeachExample[] = [
  {
    id: "requests",
    title: "Requests by hour",
    blurb: "A grid. Weekday middays are the darkest cells. Nights and Sunday evening stay quiet.",
    meta: "7 days",
    spec: {
      version: "1",
      type: "heatmap",
      title: "Requests by hour",
      locale: "en-US",
      data: Object.entries(REQUESTS).flatMap(([day, values]) =>
        values.map((value, index) => ({ day, hour: HOURS[index], value })),
      ),
      encoding: {
        x: { field: "hour", title: "Hour" },
        y: "day",
        color: { field: "value", type: "quantitative", title: "Requests" },
      },
      mark: { layout: "grid" },
      size: { width: 640, height: 360 },
      a11y: { alt: "Weekday middays are the busiest. Early morning and Sunday evening are quiet." },
    },
  },
  {
    id: "load",
    title: "Load by service",
    blurb: "A grid that reads like a table. Jobs on Thursday and Auth on Friday are the heavy cells.",
    meta: "4 services",
    spec: {
      version: "1",
      id: "load-grid",
      type: "heatmap",
      title: "Load by service",
      data: ["API", "Web", "Jobs", "Auth"].flatMap((service, row) =>
        ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, col) => ({
          day,
          service,
          load: [2, 5, 3, 8, 4, 1, 6, 7, 3, 9, 4, 2, 5, 8, 6, 3, 4, 7, 5, 8][row * 5 + col],
        })),
      ),
      encoding: { x: "day", y: "service", color: "load" },
      mark: { layout: "grid" },
      size: { width: 560, height: 280 },
      a11y: { alt: "Jobs on Thursday and Auth on Friday are the heaviest cells. API on Monday is light." },
    },
  },
  {
    id: "commits",
    title: "Commit calendar",
    blurb: "Dates on x, no row field. Twelve weeks, ending on the week of the latest day.",
    meta: "12 weeks",
    spec: {
      version: "1",
      id: "activity-calendar",
      type: "heatmap",
      title: "Commit calendar",
      data: commitRows(),
      encoding: {
        x: { field: "date", type: "temporal" },
        color: { field: "value", type: "quantitative" },
      },
      mark: { layout: "calendar", weeks: 12 },
      size: { width: 720, height: 180 },
      a11y: { alt: "Commit activity over twelve weeks, with a repeating mix of quiet days and heavier days." },
    },
  },
];

function encodingOf(spec: Record<string, unknown>): Record<string, unknown> | undefined {
  return isRecord(spec.encoding) ? spec.encoding : undefined;
}

function colorFromExample(restore: unknown): unknown {
  if (!isRecord(restore)) return undefined;
  const encoding = isRecord(restore.encoding) ? restore.encoding : undefined;
  if (encoding && "color" in encoding) return encoding.color;
  return undefined;
}

function colorRecord(color: unknown): Record<string, unknown> {
  if (typeof color === "string" && color) return { field: color };
  if (!isRecord(color)) return { field: "value" };
  const next: Record<string, unknown> = { ...color };
  if (isRecord(color.scale)) next.scale = { ...color.scale };
  return next;
}

/** Omitted scheme is blue. A name outside the four ramps reads as other, so no button is pressed. */
export function heatSchemeMode(spec: Record<string, unknown>): HeatScheme | "other" {
  const color = encodingOf(spec)?.color;
  const scale = isRecord(color) && isRecord(color.scale) ? color.scale : undefined;
  const scheme = scale && typeof scale.scheme === "string" ? scale.scheme : "blue";
  if (scheme === "blue" || scheme === "teal" || scheme === "orange" || scheme === "violet") return scheme;
  return "other";
}

/**
 * Writes encoding.color.scale.scheme and keeps the field, title, and other scale keys.
 * Choosing the example's scheme puts that color channel back, including a bare field name.
 */
export function applyHeatScheme(spec: Record<string, unknown>, value: HeatScheme, restore?: unknown): void {
  const encoding = encodingOf(spec);
  if (!encoding) return;
  const original = colorFromExample(restore);
  const base = original !== undefined ? original : encoding.color;
  if (original !== undefined && heatSchemeMode({ encoding: { color: original } }) === value) {
    encoding.color = structuredClone(original);
    return;
  }
  const channel = colorRecord(structuredClone(base));
  const scale = isRecord(channel.scale) ? { ...channel.scale } : {};
  scale.scheme = value;
  channel.scale = scale;
  encoding.color = channel;
}

export function applyHeatmapAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "scheme" && (value === "blue" || value === "teal" || value === "orange" || value === "violet")) {
    applyHeatScheme(spec, value, action.restore);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function heatmapControlState(spec: Record<string, unknown>): TeachState {
  return {
    scheme: heatSchemeMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const heatmapTeach: TeachModule = {
  type: "heatmap",
  title: heatmapPageTitle,
  description: heatmapPageDescription,
  examples: heatmapExamples,
  smallestSpec: smallestHeatmapSpec,
  controls: [
    choice("scheme", "Scheme", "encoding.color.scale.scheme", "encoding.color.scale.scheme", SCHEME_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyHeatmapAction,
  controlState: heatmapControlState,
};

for (const example of heatmapExamples) {
  if (example.spec.type !== "heatmap") throw new Error(`${example.id} is not a heatmap`);
}
