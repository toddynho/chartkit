/**
 * Teaching copy and curated specs for /docs/charts/timeline.
 * Events are points. Periods are spans. There is no task bar and no dependency.
 * legend is not read, so it is not a control.
 * Tooltip is on when the key is omitted. Off writes false. On puts the example's tooltip back.
 * The card text is the mark label. tooltip.fields is not read.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const timelinePageTitle = "Timeline";

export const timelinePageDescription =
  "How to build a ChartKit timeline: events and periods on a date axis, when to use it instead of a gantt, the data shape, a spec that renders, and the tooltip.";

/** Feature-doc timeline. One event and one period. */
export const smallestTimelineSpec: Record<string, unknown> = {
  version: "1",
  type: "timeline",
  data: [
    { label: "Start", date: "2014-06-01" },
    { label: "Span", start: "2024-01-01", end: "2026-01-01", kind: "period" },
  ],
  a11y: { alt: "It starts in 2014." },
};

/**
 * The core Northstar timeline, the Lumen and Co showcase, and the Northline years.
 * Titles are the spec title, or the showcase heading when the spec has no title.
 * The hero shortens the core chart to "Northstar". This page keeps the full title.
 */
export const timelineExamples: TeachExample[] = [
  {
    id: "northstar",
    title: "Northstar, 2014 to 2026",
    blurb: "Founded in 2014, with a Series A, a Series B, and a platform era from 2024.",
    meta: "6 events",
    spec: {
      version: "1",
      type: "timeline",
      id: "company-timeline",
      title: "Northstar, 2014 to 2026",
      data: [
        { label: "Founded", date: "2014-04-02", start: "2014-04-02", end: "2014-04-02", kind: "event" },
        { label: "First paid plan", date: "2015-11-01", start: "2015-11-01", end: "2015-11-01", kind: "event" },
        { label: "Series A", start: "2016-03-01", end: "2019-08-01", kind: "period" },
        { label: "London office", date: "2018-02-14", start: "2018-02-14", end: "2018-02-14", kind: "event" },
        { label: "Remote years", start: "2019-09-01", end: "2022-12-01", kind: "period" },
        { label: "Series B", date: "2021-06-01", start: "2021-06-01", end: "2021-06-01", kind: "event" },
        { label: "Public API", date: "2023-03-20", start: "2023-03-20", end: "2023-03-20", kind: "event" },
        { label: "Platform", start: "2024-01-15", end: "2026-06-01", kind: "period" },
        { label: "ChartKit", date: "2026-02-02", start: "2026-02-02", end: "2026-02-02", kind: "event" },
      ],
      encoding: { x: "label", open: "start", close: "end", color: "kind" },
      a11y: { alt: "Northstar was founded in 2014, raised a Series A and a Series B, and opened the platform era in 2024." },
    },
  },
  {
    id: "lumen",
    title: "Lumen and Co",
    blurb: "Two desks in 2022, night builds across 2024 and 2025, and Paper Kite named in 2026.",
    meta: "3 events",
    spec: {
      version: "1",
      type: "timeline",
      data: [
        { label: "Two desks", date: "2022-05-02" },
        { label: "First prototype", date: "2023-09-14" },
        { label: "Night builds", start: "2024-02-01", end: "2025-11-01" },
        { label: "Paper Kite named", date: "2026-04-03" },
      ],
      a11y: { alt: "Lumen and Co" },
      title: "Lumen and Co",
      theme: "soft",
      size: { width: 880, height: 440 },
    },
  },
  {
    id: "northline",
    title: "Northline, year by year",
    blurb: "A pad leased in 2019, sounding flights through 2023, and a window booked for May 2026.",
    meta: "4 events",
    spec: {
      version: "1",
      id: "northline-years",
      type: "timeline",
      theme: "soft",
      data: [
        { label: "Pad leased", date: "2019-03-04", kind: "event" },
        { label: "First static fire", date: "2020-11-12", kind: "event" },
        { label: "Sounding flights", start: "2021-04-01", end: "2023-09-01", kind: "period" },
        { label: "Cinder crew", date: "2024-01-18", kind: "event" },
        { label: "Stack rehearsals", start: "2024-06-01", end: "2026-02-01", kind: "period" },
        { label: "Window booked", date: "2026-05-20", kind: "event" },
      ],
      encoding: { x: "label", open: "start", close: "end", color: "kind" },
      size: { width: 980, height: 360 },
      a11y: { alt: "Northline leased a pad in 2019, flew sounding missions through 2023, and booked a window for May 2026." },
    },
  },
];

export function applyTimelineAction(spec: Record<string, unknown>, action: TeachAction): void {
  if (action.id === "tooltip" && (action.value === "off" || action.value === "on")) {
    applyTooltip(spec, action.value, action.restore);
  }
}

export function timelineControlState(spec: Record<string, unknown>): TeachState {
  return { tooltip: tooltipMode(spec) };
}

export const timelineTeach: TeachModule = {
  type: "timeline",
  title: timelinePageTitle,
  description: timelinePageDescription,
  examples: timelineExamples,
  smallestSpec: smallestTimelineSpec,
  controls: [choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS)],
  apply: applyTimelineAction,
  controlState: timelineControlState,
};

for (const example of timelineExamples) {
  if (example.spec.type !== "timeline") throw new Error(`${example.id} is not a timeline`);
}
