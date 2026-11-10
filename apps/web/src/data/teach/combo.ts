/**
 * Teaching copy and curated specs for /docs/charts/combo.
 * Each y channel names its own mark. The controls edit the non-bar series
 * (line or area, left axis or right) and the points on that line.
 * Theme preset chips are not on this page.
 */

import { LINE_AXIS_OPTIONS, LINE_LEGEND_OPTIONS, POINT_OPTIONS, SERIES_MARK_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyPoints, pointsMode } from "./line-mark.ts";
import { isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const comboPageTitle = "Combo";

export const comboPageDescription =
  "How to build a ChartKit combo: bars and a line in one spec, when to use it, how series map to marks, a spec that renders, and the options that define the mix.";

/**
 * Core example 07-combo.json with locale left off.
 * A y2 series warns CK3002 unless axes.y2 is set, so the axis block stays.
 */
export const smallestComboSpec: Record<string, unknown> = {
  version: "1",
  type: "combo",
  data: [
    { month: "Jan", revenue: 100, margin: 0.2 },
    { month: "Feb", revenue: 140, margin: 0.24 },
    { month: "Mar", revenue: 130, margin: 0.22 },
  ],
  encoding: {
    x: "month",
    y: [
      { field: "revenue", title: "Revenue", mark: "bar" },
      { field: "margin", title: "Margin", mark: "line", axis: "y2", format: "percent" },
    ],
  },
  axes: { y2: { title: "Margin", format: "percent" } },
  a11y: { alt: "Revenue and margin both finished the quarter higher than they started." },
};

/**
 * Gallery orders, the visual revenue-and-margin spec, and two showcase combos:
 * jars share one axis, and kilometres draws the line with points on a reversed right axis.
 */
export const comboExamples: TeachExample[] = [
  {
    id: "orders",
    title: "Orders and fill rate",
    blurb: "Bars on the left axis, a rate line on the right.",
    meta: "5 weeks",
    spec: {
      version: "1",
      id: "orders-combo",
      type: "combo",
      data: [
        { week: "W1", orders: 120, rate: 0.62 },
        { week: "W2", orders: 140, rate: 0.66 },
        { week: "W3", orders: 132, rate: 0.7 },
        { week: "W4", orders: 158, rate: 0.74 },
        { week: "W5", orders: 150, rate: 0.71 },
      ],
      encoding: {
        x: "week",
        y: [
          { field: "orders", title: "Orders", mark: "bar" },
          { field: "rate", title: "Fill rate", mark: "line", axis: "y2" },
        ],
      },
      axes: { y2: { title: "Fill rate" } },
      size: { width: 560, height: 300 },
      a11y: { alt: "Orders and the fill rate both finish higher than they started. Orders dip in week 3 and week 5." },
    },
  },
  {
    id: "margin",
    title: "Revenue and margin",
    blurb: "Bars for revenue. The margin line uses the right axis.",
    meta: "6 months",
    spec: {
      version: "1",
      id: "soft-combo",
      type: "combo",
      title: "Revenue and margin",
      theme: {
        preset: "soft",
        tokens: { fontFamily: "Inter" },
      },
      locale: "en-US",
      size: { width: 640, height: 360 },
      data: [
        { month: "Jan", revenue: 100, margin: 0.2 },
        { month: "Feb", revenue: 140, margin: 0.24 },
        { month: "Mar", revenue: 130, margin: 0.22 },
        { month: "Apr", revenue: 160, margin: 0.26 },
        { month: "May", revenue: 155, margin: 0.25 },
        { month: "Jun", revenue: 172, margin: 0.28 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "revenue", title: "Revenue", mark: "bar" },
          { field: "margin", title: "Margin", mark: "line", axis: "y2", format: "percent" },
        ],
      },
      axes: { y2: { title: "Margin", format: "percent" } },
      a11y: { alt: "Revenue and margin both finish the half higher than they started." },
    },
  },
  {
    id: "jars",
    title: "Jars this month",
    blurb: "Bars are jars out. The line is lids that came back.",
    meta: "10 weeks",
    spec: {
      version: "1",
      id: "saltwharf-jars",
      type: "combo",
      title: "Jars this month",
      subtitle: "Bars are jars out. The line is lids that came back.",
      theme: "soft",
      data: [
        { week: "W1", jars: 28, lids: 4 },
        { week: "W2", jars: 34, lids: 6 },
        { week: "W3", jars: 31, lids: 5 },
        { week: "W4", jars: 40, lids: 7 },
        { week: "W5", jars: 46, lids: 8 },
        { week: "W6", jars: 44, lids: 6 },
        { week: "W7", jars: 52, lids: 9 },
        { week: "W8", jars: 49, lids: 8 },
        { week: "W9", jars: 58, lids: 10 },
        { week: "W10", jars: 63, lids: 11 },
      ],
      encoding: {
        x: { field: "week", title: "Week" },
        y: [
          { field: "jars", mark: "bar", title: "Jars" },
          { field: "lids", mark: "line", title: "Lids" },
        ],
      },
      axes: { x: { title: "Week", ticks: 10 }, y: { title: "Count" } },
      legend: { position: "bottom", interactive: true },
      tooltip: { mode: "index", position: "top" },
      size: { width: 1040, height: 420 },
      a11y: { alt: "Jars out at Saltwharf climb from 28 in week one to 63 in week ten. Lids that came back stay between 4 and 11." },
    },
  },
  {
    id: "pace",
    title: "Kilometres and pace",
    blurb: "Bars are kilometres. The line is pace, on a reversed right axis.",
    meta: "16 weeks",
    spec: {
      version: "1",
      id: "marathon-block",
      type: "combo",
      theme: "soft",
      locale: "en-GB",
      data: [
        { week: "W1", km: 28, pace: 6.4 },
        { week: "W2", km: 32, pace: 6.3 },
        { week: "W3", km: 30, pace: 6.3 },
        { week: "W4", km: 36, pace: 6.1 },
        { week: "W5", km: 40, pace: 6.0 },
        { week: "W6", km: 38, pace: 6.0 },
        { week: "W7", km: 44, pace: 5.8 },
        { week: "W8", km: 42, pace: 5.8 },
        { week: "W9", km: 48, pace: 5.7 },
        { week: "W10", km: 46, pace: 5.6 },
        { week: "W11", km: 52, pace: 5.5 },
        { week: "W12", km: 50, pace: 5.5 },
        { week: "W13", km: 55, pace: 5.4 },
        { week: "W14", km: 48, pace: 5.4 },
        { week: "W15", km: 58, pace: 5.2 },
        { week: "W16", km: 36, pace: 5.1 },
      ],
      encoding: {
        x: "week",
        y: [
          { field: "km", title: "Kilometres", mark: "bar" },
          {
            field: "pace",
            title: "Pace",
            mark: "line",
            axis: "y2",
            pointShape: "diamond",
            pointSize: 5,
            scale: { reverse: true },
          },
        ],
      },
      axes: {
        x: { title: "Week", titlePosition: "start" },
        y: { title: "Kilometres", ticks: [20, 40, 60], titlePosition: "end" },
        y2: { title: "Minutes per km", position: "right", ticks: [5, 5.5, 6, 6.5], titlePosition: "end" },
      },
      mark: { points: "always", labelEnds: "ends" },
      legend: { position: "bottom", interactive: true },
      tooltip: { mode: "index", position: "top", crosshair: true, crosshairLabel: true },
      interaction: { select: "series" },
      size: { width: 980, height: 460, padding: { left: 72, right: 88 } },
      a11y: {
        alt: "Kilometres climb through the block and ease in the last week. Pace falls from 6.4 to 5.1 minutes per kilometre, drawn upward because the right axis is reversed.",
      },
    },
  },
];

const COMBO_LEGEND = { omitted: "top" as const, known: ["top", "bottom", "right"] as const };

/** A y channel this control may retarget. Bars and range bands stay as the example wrote them. */
function isFlexible(item: Record<string, unknown>): boolean {
  return item.mark === undefined || item.mark === "line" || item.mark === "area";
}

function yChannels(spec: Record<string, unknown>): unknown[] {
  const encoding = spec.encoding;
  if (!isRecord(encoding) || !Array.isArray(encoding.y)) return [];
  return encoding.y;
}

function flexibleChannels(spec: Record<string, unknown>): Record<string, unknown>[] {
  return yChannels(spec).filter((item): item is Record<string, unknown> => isRecord(item) && isFlexible(item));
}

function editFlexible(spec: Record<string, unknown>, edit: (channel: Record<string, unknown>) => void): void {
  const encoding = spec.encoding;
  if (!isRecord(encoding) || !Array.isArray(encoding.y)) return;
  let changed = false;
  const next = encoding.y.map((item) => {
    if (!isRecord(item) || !isFlexible(item)) return item;
    const copy = { ...item };
    edit(copy);
    changed = true;
    return copy;
  });
  if (changed) encoding.y = next;
}

export function applySeriesMark(spec: Record<string, unknown>, value: "line" | "area"): void {
  editFlexible(spec, (channel) => {
    channel.mark = value;
  });
}

/** Every non-bar series agrees, or the control presses nothing. An omitted mark reads as a line. */
export function seriesMarkMode(spec: Record<string, unknown>): "line" | "area" | "other" {
  const channels = flexibleChannels(spec);
  if (channels.length === 0) return "other";
  const marks = new Set(channels.map((channel) => (channel.mark === "area" ? "area" : "line")));
  if (marks.size !== 1) return "other";
  return marks.has("area") ? "area" : "line";
}

function y2InUse(spec: Record<string, unknown>): boolean {
  return yChannels(spec).some((item) => isRecord(item) && item.axis === "y2");
}

function y2Configured(value: unknown): boolean {
  return value === true || isRecord(value);
}

/** The example's axes.y2, when restore is that example. A bare true is a configured axis. */
function savedY2(restore: unknown): unknown {
  if (!isRecord(restore) || !isRecord(restore.axes) || !("y2" in restore.axes)) return undefined;
  return restore.axes.y2;
}

/**
 * CK3002 is an error both ways: a y2 axis with no series, or a y2 series with no axis.
 * Left drops axes.y2 once nothing uses it. Right puts the example's axis back, or true.
 */
function syncY2Axis(spec: Record<string, unknown>, restore?: unknown): void {
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  if (!y2InUse(spec)) {
    if (!axes || !("y2" in axes)) return;
    delete axes.y2;
    if (Object.keys(axes).length === 0) delete spec.axes;
    return;
  }
  if (axes && y2Configured(axes.y2)) return;
  const saved = savedY2(restore);
  const next = y2Configured(saved) ? structuredClone(saved) : true;
  if (axes) axes.y2 = next;
  else spec.axes = { y2: next };
}

export function applyLineAxis(spec: Record<string, unknown>, value: "y" | "y2", restore?: unknown): void {
  editFlexible(spec, (channel) => {
    if (value === "y") delete channel.axis;
    else channel.axis = "y2";
  });
  syncY2Axis(spec, restore);
}

/** Omitted axis is the left axis. Mixed axes press nothing. */
export function lineAxisMode(spec: Record<string, unknown>): "y" | "y2" | "other" {
  const channels = flexibleChannels(spec);
  if (channels.length === 0) return "other";
  const axes = channels.map((channel) => {
    if (channel.axis === undefined || channel.axis === "y") return "y";
    if (channel.axis === "y2") return "y2";
    return "other";
  });
  if (axes.some((axis) => axis === "other")) return "other";
  if (axes.every((axis) => axis === "y2")) return "y2";
  if (axes.every((axis) => axis === "y")) return "y";
  return "other";
}

/**
 * A per-series pointShape or pointSize draws even when mark.points is none or hover.
 * Drop both unless the control asks for always, then put the example's markers back.
 */
function syncPointShape(spec: Record<string, unknown>, value: "none" | "hover" | "always", restore?: unknown): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding || !Array.isArray(encoding.y)) return;
  const source = isRecord(restore) && isRecord(restore.encoding) && Array.isArray(restore.encoding.y) ? restore.encoding.y : undefined;
  encoding.y = encoding.y.map((item, index) => {
    if (!isRecord(item)) return item;
    const saved = source && isRecord(source[index]) ? source[index] : undefined;
    const marked = "pointShape" in item || "pointSize" in item || (saved && ("pointShape" in saved || "pointSize" in saved));
    if (!marked) return item;
    const next = { ...item };
    if (value === "always" && saved) {
      if ("pointShape" in saved) next.pointShape = saved.pointShape;
      if ("pointSize" in saved) next.pointSize = saved.pointSize;
    } else {
      delete next.pointShape;
      delete next.pointSize;
    }
    return next;
  });
}

export function applyComboAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "seriesMark" && (value === "line" || value === "area")) {
    applySeriesMark(spec, value);
    return;
  }
  if (id === "lineAxis" && (value === "y" || value === "y2")) {
    applyLineAxis(spec, value, action.restore);
    return;
  }
  if (id === "points" && (value === "none" || value === "hover" || value === "always")) {
    applyPoints(spec, value);
    syncPointShape(spec, value, action.restore);
    return;
  }
  if (id === "legend" && (value === "off" || value === "top" || value === "bottom" || value === "right")) {
    applyLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function comboControlState(spec: Record<string, unknown>): TeachState {
  return {
    seriesMark: seriesMarkMode(spec),
    lineAxis: lineAxisMode(spec),
    points: pointsMode(spec),
    legend: legendChoice(spec, COMBO_LEGEND),
    tooltip: tooltipMode(spec),
  };
}

export const comboTeach: TeachModule = {
  type: "combo",
  title: comboPageTitle,
  description: comboPageDescription,
  examples: comboExamples,
  smallestSpec: smallestComboSpec,
  controls: [
    choice("seriesMark", "Series mark", "encoding.y.mark", "encoding.y.mark", SERIES_MARK_OPTIONS),
    choice("lineAxis", "Line axis", "encoding.y.axis", "encoding.y.axis", LINE_AXIS_OPTIONS),
    choice("points", "Points", "mark.points", "mark.points", POINT_OPTIONS),
    choice("legend", "Legend", "legend", "legend", LINE_LEGEND_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyComboAction,
  controlState: comboControlState,
};

for (const example of comboExamples) {
  if (example.spec.type !== "combo") throw new Error(`${example.id} is not a combo`);
}
