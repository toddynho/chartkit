/**
 * Teaching copy and curated specs for /docs/charts/bar-list.
 * A bar list is ranked rows with no axes. The label and the value are on the row.
 * mark.track is the type-defining choice: bar is a short bar, row is a full-height wash.
 * Tooltip is the shared hover key. The row already prints the number.
 * Sort does not apply. Legend and axes are not drawn. Format stays on encoding.y.
 * The chart is not in the line or all bundle.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const barListPageTitle = "Bar list";

export const barListPageDescription =
  "How to build a ChartKit bar list: ranked rows with no axes, when to use it instead of a bar, the data shape, a spec that renders, and the track behind each label.";

/** Three rows. The short bar is the default track. encoding.y can be a field name. */
export const smallestBarListSpec: Record<string, unknown> = {
  version: "1",
  type: "bar-list",
  data: [
    { page: "/pricing", visits: 1840 },
    { page: "/docs", visits: 1420 },
    { page: "/gallery", visits: 980 },
  ],
  encoding: { x: "page", y: "visits" },
  a11y: { alt: "Pricing leads the page list." },
};

const TRACK_OPTIONS = [
  { value: "bar", label: "Bar" },
  { value: "row", label: "Row" },
] as const;

/**
 * Hero top pages, the visual payments list with a row track, and Datadog top services.
 * Titles stay as published. Top pages names the tooltip fields. Top services turns the card off.
 */
export const barListExamples: TeachExample[] = [
  {
    id: "pages",
    title: "Top pages",
    blurb: "Five pages, ranked. The short bar is the default track, and the tooltip names visits.",
    meta: "5 pages",
    spec: {
      version: "1",
      type: "bar-list",
      title: "Top pages",
      data: [
        { page: "/pricing", visits: 1840 },
        { page: "/docs", visits: 1420 },
        { page: "/gallery", visits: 980 },
        { page: "/cloud", visits: 760 },
        { page: "/about", visits: 640 },
      ],
      encoding: { x: "page", y: { field: "visits", format: "compact" } },
      tooltip: { fields: ["page", { field: "visits", title: "Visits" }] },
      a11y: { alt: "Pricing leads the page list at 1,840 visits." },
    },
  },
  {
    id: "payments",
    title: "Payments by method",
    blurb: "A full-height wash behind each method. The value is on the right.",
    meta: "12 methods",
    spec: {
      version: "1",
      id: "soft-bar-list",
      type: "bar-list",
      title: "Payments by method",
      data: [
        { method: "Card", amount: 168400 },
        { method: "Bank", amount: 64200 },
        { method: "Wallet", amount: 28400 },
        { method: "Wire", amount: 22100 },
        { method: "ACH", amount: 18600 },
        { method: "Cash", amount: 9400 },
        { method: "Check", amount: 6100 },
        { method: "Crypto", amount: 2800 },
        { method: "Invoice", amount: 1900 },
        { method: "Gift", amount: 1200 },
        { method: "Points", amount: 800 },
        { method: "Other", amount: 400 },
      ],
      encoding: { x: "method", y: { field: "amount", format: { style: "compact", prefix: "$" } } },
      mark: { track: "row" },
      size: { width: 640, height: 360 },
      a11y: { alt: "Card is the largest method at about 168 thousand dollars. Other is the smallest." },
    },
  },
  {
    id: "services",
    title: "Top services",
    blurb: "Four services. The tooltip is off because the rate is already on the row.",
    meta: "4 services",
    spec: {
      version: "1",
      type: "bar-list",
      title: "Top services",
      legend: false,
      tooltip: false,
      data: [
        { name: "render", value: 612 },
        { name: "validate", value: 390 },
        { name: "repair", value: 232 },
        { name: "geo-tiles", value: 121 },
      ],
      encoding: { x: "name", y: { field: "value", format: { style: "number", suffix: " rps", decimals: 0 } } },
      a11y: { alt: "render leads at 612 requests per second, then validate, repair, and geo-tiles." },
    },
  },
];

function exampleMark(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) && isRecord(restore.mark) ? restore.mark : undefined;
}

/**
 * Row writes mark.track row.
 * Bar writes mark.track bar when the example set a track, and deletes the key when the example omitted it.
 */
export function applyBarListTrack(spec: Record<string, unknown>, value: "bar" | "row", restore?: unknown): void {
  const source = exampleMark(restore);
  editMark(spec, (mark) => {
    if (value === "row") {
      mark.track = "row";
      return;
    }
    if (source?.track === "bar") mark.track = "bar";
    else if (source?.track === "row") mark.track = "bar";
    else delete mark.track;
  });
}

/** Omitted track is the short bar. */
export function barListTrackMode(spec: Record<string, unknown>): "bar" | "row" | "other" {
  const track = isRecord(spec.mark) ? spec.mark.track : undefined;
  if (track === undefined || track === "bar") return "bar";
  if (track === "row") return "row";
  return "other";
}

export function applyBarListAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "track" && (value === "bar" || value === "row")) {
    applyBarListTrack(spec, value, action.restore);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function barListControlState(spec: Record<string, unknown>): TeachState {
  return {
    track: barListTrackMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const barListTeach: TeachModule = {
  type: "bar-list",
  title: barListPageTitle,
  description: barListPageDescription,
  examples: barListExamples,
  smallestSpec: smallestBarListSpec,
  controls: [
    choice("track", "Track", "mark.track", "mark.track", TRACK_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyBarListAction,
  controlState: barListControlState,
};

for (const example of barListExamples) {
  if (example.spec.type !== "bar-list") throw new Error(`${example.id} is not a bar list`);
}
