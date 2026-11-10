/**
 * Teaching copy and curated specs for /docs/charts/strip.
 * Every observation is a dot on one numeric axis, with one row per group.
 * Summary, band, orientation, jitter, and sort are the options a first strip sets.
 * Highlight, notes, pins, zebra rows, and compare brackets stay in the playground.
 * Theme preset chips are not on this page.
 */

import { LINE_LEGEND_OPTIONS, SORT_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const stripPageTitle = "Strip";

export const stripPageDescription =
  "How to build a ChartKit strip: every observation as a dot on a shared numeric axis, one row per group, when to use it instead of a box plot or a scatter, the data shape, a spec that renders, and the options that mark the rows.";

/** Two times in each region. Omitted summary is a median tick. Omitted orientation is horizontal. */
export const smallestStripSpec: Record<string, unknown> = {
  version: "1",
  type: "strip",
  data: [
    { region: "North", ms: 42 },
    { region: "North", ms: 51 },
    { region: "South", ms: 55 },
    { region: "South", ms: 33 },
    { region: "East", ms: 31 },
    { region: "East", ms: 48 },
  ],
  encoding: { x: "ms", y: "region" },
  a11y: { alt: "South reaches 55 ms. East includes the fastest time at 31." },
};

const SUMMARY_OPTIONS = [
  { value: "median", label: "median" },
  { value: "mean", label: "mean" },
  { value: "none", label: "none" },
] as const;

const BAND_OPTIONS = [
  { value: "none", label: "none" },
  { value: "range", label: "range" },
  { value: "iqr", label: "iqr" },
] as const;

const JITTER_OPTIONS = [
  { value: "auto", label: "auto" },
  { value: "none", label: "none" },
] as const;

const STRIP_ORIENTATION = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical" },
] as const;

const tokenRows: [string, string, number][] = [
  ["ChartKit", "Claude Haiku 4.5", 133],
  ["Plot", "Claude Haiku 4.5", 711],
  ["Chart.js", "Claude Haiku 4.5", 1193],
  ["Recharts", "Claude Haiku 4.5", 1285],
  ["ECharts", "Claude Haiku 4.5", 882],
  ["ChartKit", "Claude Sonnet 4.5", 124],
  ["Plot", "Claude Sonnet 4.5", 333],
  ["Chart.js", "Claude Sonnet 4.5", 887],
  ["Recharts", "Claude Sonnet 4.5", 1499],
  ["ECharts", "Claude Sonnet 4.5", 544],
  ["ChartKit", "Claude Opus 4.5", 127],
  ["Plot", "Claude Opus 4.5", 356],
  ["Chart.js", "Claude Opus 4.5", 901],
  ["Recharts", "Claude Opus 4.5", 1713],
  ["ECharts", "Claude Opus 4.5", 469],
  ["ChartKit", "Claude Fable 5", 115],
  ["Plot", "Claude Fable 5", 300],
  ["Chart.js", "Claude Fable 5", 656],
  ["Recharts", "Claude Fable 5", 1468],
  ["ECharts", "Claude Fable 5", 379],
  ["ChartKit", "GPT-5 Luna", 94],
  ["Plot", "GPT-5 Luna", 464],
  ["Chart.js", "GPT-5 Luna", 820],
  ["Recharts", "GPT-5 Luna", 874],
  ["ECharts", "GPT-5 Luna", 675],
  ["ChartKit", "GPT-5.1 Terra", 82.5],
  ["Plot", "GPT-5.1 Terra", 332],
  ["Chart.js", "GPT-5.1 Terra", 808],
  ["Recharts", "GPT-5.1 Terra", 1594],
  ["ECharts", "GPT-5.1 Terra", 488],
  ["ChartKit", "GPT-5.1 Sol", 86.5],
  ["Plot", "GPT-5.1 Sol", 244],
  ["Chart.js", "GPT-5.1 Sol", 491],
  ["Recharts", "GPT-5.1 Sol", 1273],
  ["ECharts", "GPT-5.1 Sol", 492],
  ["ChartKit", "GPT-5 Astra", 88],
  ["Plot", "GPT-5 Astra", 266],
  ["Chart.js", "GPT-5 Astra", 492],
  ["Recharts", "GPT-5 Astra", 1358],
  ["ECharts", "GPT-5 Astra", 536],
  ["ChartKit", "Grok 4", 78.5],
  ["Plot", "Grok 4", 166],
  ["Chart.js", "Grok 4", 444.5],
  ["Recharts", "Grok 4", 365],
  ["ECharts", "Grok 4", 284],
];

/**
 * Tokens by library is the reference strip. Latency by region is one dot per group.
 * Minutes by desk is vertical, with a mean and an interquartile band.
 * Titles stay the full example titles.
 */
export const stripExamples: TeachExample[] = [
  {
    id: "tokens",
    title: "Tokens by library",
    blurb: "Nine models per library. ChartKit's median is 94, 3.5× below Plot.",
    meta: "5 libraries",
    spec: {
      version: "1",
      id: "tokens-strip",
      type: "strip",
      title: "Output tokens per working chart",
      data: tokenRows.map(([library, model, tokens]) => ({ library, model, tokens })),
      encoding: {
        x: { field: "tokens", scale: { domain: [0, 2000] } },
        y: "library",
        label: "model",
      },
      mark: {
        band: "range",
        highlight: "ChartKit",
        sort: "asc",
        pointSize: 5,
        jitter: "none",
      },
      annotations: [
        {
          type: "compare",
          from: { group: "ChartKit", at: "summary" },
          to: { group: "Plot", at: "summary" },
          label: "← 3.5× fewer than Plot, next best",
        },
      ],
      a11y: { alt: "ChartKit's median is 94 tokens, 3.5× below Plot at 332." },
    },
  },
  {
    id: "regions",
    title: "Latency by region",
    blurb: "Several times in each region, including ties the jitter can split.",
    meta: "3 regions",
    spec: {
      version: "1",
      id: "regions-strip",
      type: "strip",
      data: [
        { region: "North", ms: 42 },
        { region: "North", ms: 42 },
        { region: "North", ms: 60 },
        { region: "South", ms: 55 },
        { region: "South", ms: 55 },
        { region: "South", ms: 33 },
        { region: "East", ms: 31 },
        { region: "East", ms: 48 },
        { region: "East", ms: 48 },
      ],
      encoding: { x: "ms", y: "region" },
      a11y: { alt: "South is slowest at 55 ms." },
    },
  },
  {
    id: "desks",
    title: "Minutes by desk",
    blurb: "Vertical groups, a mean tick, and an interquartile band.",
    meta: "2 desks",
    spec: {
      version: "1",
      id: "desks-strip",
      type: "strip",
      data: [
        { desk: "A", minutes: 12, shift: "Weeknight" },
        { desk: "A", minutes: 18, shift: "Weeknight" },
        { desk: "A", minutes: 18, shift: "Weeknight" },
        { desk: "A", minutes: 28, shift: "Saturday" },
        { desk: "A", minutes: 40, shift: "Saturday" },
        { desk: "B", minutes: 14, shift: "Weeknight" },
        { desk: "B", minutes: 22, shift: "Weeknight" },
        { desk: "B", minutes: 22, shift: "Weeknight" },
        { desk: "B", minutes: 36, shift: "Saturday" },
        { desk: "B", minutes: 44, shift: "Saturday" },
      ],
      encoding: { x: "desk", y: "minutes", color: "shift" },
      mark: { orientation: "vertical", summary: "mean", band: "iqr" },
      a11y: { alt: "Saturday runs longer on both desks." },
    },
  },
];

const STRIP_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

export function applySummary(spec: Record<string, unknown>, value: "median" | "mean" | "none"): void {
  editMark(spec, (mark) => {
    mark.summary = value;
  });
}

/** Omitted summary is a median tick. A strip where every group has one point hides the tick. */
export function summaryMode(spec: Record<string, unknown>): "median" | "mean" | "none" | "other" {
  const summary = markOf(spec).summary;
  if (summary === undefined || summary === "median") return "median";
  if (summary === "mean" || summary === "none") return summary;
  return "other";
}

export function applyBand(spec: Record<string, unknown>, value: "none" | "range" | "iqr"): void {
  editMark(spec, (mark) => {
    mark.band = value;
  });
}

/** Omitted band draws no bar behind the dots. */
export function bandMode(spec: Record<string, unknown>): "none" | "range" | "iqr" | "other" {
  const band = markOf(spec).band;
  if (band === undefined || band === "none") return "none";
  if (band === "range" || band === "iqr") return band;
  return "other";
}

function channelField(value: unknown): string {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.field === "string") return value.field;
  return "";
}

/** True when the first filled cells in this column are numbers. */
function numericColumn(spec: Record<string, unknown>, field: string): boolean {
  if (!field || !Array.isArray(spec.data)) return false;
  let seen = 0;
  for (const row of spec.data) {
    if (!isRecord(row)) continue;
    const value = row[field];
    if (value == null || value === "") continue;
    if (typeof value !== "number") return false;
    seen += 1;
    if (seen >= 3) return true;
  }
  return seen > 0;
}

/**
 * Strip treats an omission as horizontal. Categories run down the y axis.
 * Vertical reads y as the number and x as the group. The published horizontal
 * examples keep the number on x, so the toggle swaps the two channels or the
 * chart has no numeric axis and does not draw.
 */
export function applyStripOrientation(spec: Record<string, unknown>, value: "horizontal" | "vertical"): void {
  editMark(spec, (mark) => {
    mark.orientation = value;
  });
  if (!isRecord(spec.encoding)) return;
  const encoding = spec.encoding;
  const xField = channelField(encoding.x);
  const yField = channelField(encoding.y);
  const xNumeric = numericColumn(spec, xField);
  const yNumeric = numericColumn(spec, yField);
  const vertical = value === "vertical";
  const swap = (vertical && xNumeric && !yNumeric) || (!vertical && yNumeric && !xNumeric);
  if (!swap) return;
  const x = encoding.x;
  encoding.x = encoding.y;
  encoding.y = x;
}

export function stripOrientationMode(spec: Record<string, unknown>): "horizontal" | "vertical" | "other" {
  const orientation = markOf(spec).orientation;
  if (orientation === undefined || orientation === "horizontal") return "horizontal";
  if (orientation === "vertical") return "vertical";
  return "other";
}

export function applyJitter(spec: Record<string, unknown>, value: "auto" | "none"): void {
  editMark(spec, (mark) => {
    mark.jitter = value;
  });
}

/** Omitted jitter is auto. A number is a pixel distance and is not on this control. */
export function jitterMode(spec: Record<string, unknown>): "auto" | "none" | "other" {
  const jitter = markOf(spec).jitter;
  if (jitter === undefined || jitter === "auto") return "auto";
  if (jitter === "none") return "none";
  return "other";
}

export function applyStripSort(spec: Record<string, unknown>, value: "none" | "asc" | "desc"): void {
  editMark(spec, (mark) => {
    mark.sort = value;
  });
}

/** Omitted sort keeps the first-seen group order. */
export function stripSortMode(spec: Record<string, unknown>): "none" | "asc" | "desc" | "other" {
  const sort = markOf(spec).sort;
  if (sort === undefined || sort === "none") return "none";
  if (sort === "asc" || sort === "desc") return sort;
  return "other";
}

export function applyStripAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "summary" && (value === "median" || value === "mean" || value === "none")) {
    applySummary(spec, value);
    return;
  }
  if (id === "band" && (value === "none" || value === "range" || value === "iqr")) {
    applyBand(spec, value);
    return;
  }
  if (id === "orientation" && (value === "horizontal" || value === "vertical")) {
    applyStripOrientation(spec, value);
    return;
  }
  if (id === "jitter" && (value === "auto" || value === "none")) {
    applyJitter(spec, value);
    return;
  }
  if (id === "sort" && (value === "none" || value === "asc" || value === "desc")) {
    applyStripSort(spec, value);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function stripControlState(spec: Record<string, unknown>): TeachState {
  return {
    summary: summaryMode(spec),
    band: bandMode(spec),
    orientation: stripOrientationMode(spec),
    jitter: jitterMode(spec),
    sort: stripSortMode(spec),
    legend: legendChoice(spec, STRIP_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const stripTeach: TeachModule = {
  type: "strip",
  title: stripPageTitle,
  description: stripPageDescription,
  examples: stripExamples,
  smallestSpec: smallestStripSpec,
  controls: [
    choice("summary", "Summary", "mark.summary", "mark.summary", SUMMARY_OPTIONS),
    choice("band", "Band", "mark.band", "mark.band", BAND_OPTIONS),
    choice("orientation", "Orientation", "mark.orientation", "mark.orientation", STRIP_ORIENTATION),
    choice("jitter", "Jitter", "mark.jitter", "mark.jitter", JITTER_OPTIONS),
    choice("sort", "Sort", "mark.sort", "mark.sort", SORT_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyStripAction,
  controlState: stripControlState,
};

for (const example of stripExamples) {
  if (example.spec.type !== "strip") throw new Error(`${example.id} is not a strip`);
}
