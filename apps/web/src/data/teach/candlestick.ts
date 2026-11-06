/**
 * Teaching copy and curated specs for /docs/charts/candlestick.
 * One session: body from open to close, wick from low to high.
 * A bar-range is only the low-to-high span. An error bar is a whisker around a point.
 * Volume is the pane a first price chart often adds. Body gap and zoom stay in the playground.
 * Up and down colors come from the theme, not a series legend. Theme preset chips are not on this page.
 */

import { AREA_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const candlestickPageTitle = "Candlestick";

export const candlestickPageDescription =
  "How to build a ChartKit candlestick: open, high, low, and close, when to use it instead of a line, a bar, a range bar, or an error bar, the data shape, a spec that renders, and the options that define the sessions.";

/** One session, no volume pane. The body and the wick are the chart. */
export const smallestCandlestickSpec: Record<string, unknown> = {
  version: "1",
  type: "candlestick",
  data: [{ day: "Mon", open: 5, high: 7, low: 4, close: 6 }],
  encoding: { x: "day", open: "open", high: "high", low: "low", close: "close" },
  a11y: { alt: "Monday opened at 5 and closed at 6, with a high of 7." },
};

/**
 * Northstar is the gallery candle, with a volume pane.
 * CK / USD is the homepage candle: day names, no volume.
 * A week of prices is five dated sessions and no volume field.
 * Titles are the chart titles. They are not shortened.
 */
export const candlestickExamples: TeachExample[] = [
  {
    id: "northstar",
    title: "Northstar",
    blurb: "Ten sessions and a volume pane. The price rises, drops on March 9, and closes at 107.5.",
    meta: "10 sessions",
    spec: {
      version: "1",
      id: "soft-candlestick",
      type: "candlestick",
      title: "Northstar",
      locale: "en-US",
      data: [
        { date: "2026-03-02", open: 101.2, high: 104, low: 100.4, close: 103.1, volume: 1820 },
        { date: "2026-03-03", open: 103.1, high: 105.6, low: 102.2, close: 104.8, volume: 1640 },
        { date: "2026-03-04", open: 104.8, high: 106.1, low: 103, close: 103.6, volume: 2100 },
        { date: "2026-03-05", open: 103.6, high: 107.4, low: 103.2, close: 106.9, volume: 1980 },
        { date: "2026-03-06", open: 106.9, high: 108.2, low: 104.5, close: 105.1, volume: 2410 },
        { date: "2026-03-09", open: 105.1, high: 105.8, low: 101.6, close: 102.4, volume: 2680 },
        { date: "2026-03-10", open: 102.4, high: 104.9, low: 101.8, close: 104.2, volume: 1760 },
        { date: "2026-03-11", open: 104.2, high: 109, low: 103.7, close: 108.4, volume: 3120 },
        { date: "2026-03-12", open: 108.4, high: 110.2, low: 107.1, close: 109.6, volume: 2240 },
        { date: "2026-03-13", open: 109.6, high: 111, low: 106.8, close: 107.5, volume: 2530 },
      ],
      encoding: {
        x: { field: "date", type: "temporal" },
        open: "open",
        high: "high",
        low: "low",
        close: "close",
        volume: "volume",
      },
      legend: false,
      size: { width: 640, height: 360 },
      a11y: { alt: "The price rises from 101 to a close of 107.5, with a drop on March 9 and a high of 111." },
    },
  },
  {
    id: "ck-usd",
    title: "CK / USD",
    blurb: "Twelve sessions on day names. No volume field, so there is no pane under the price.",
    meta: "12 sessions",
    spec: {
      version: "1",
      type: "candlestick",
      title: "CK / USD",
      subtitle: "Daily, 12 sessions",
      data: [
        { d: "Mon", open: 30, close: 55, low: 20, high: 65 },
        { d: "Tue", open: 55, close: 48, low: 40, high: 70 },
        { d: "Wed", open: 48, close: 62, low: 44, high: 68 },
        { d: "Thu", open: 62, close: 58, low: 50, high: 75 },
        { d: "Fri", open: 58, close: 72, low: 52, high: 78 },
        { d: "Sat", open: 72, close: 66, low: 60, high: 80 },
        { d: "Sun", open: 66, close: 80, low: 62, high: 86 },
        { d: "Mon 2", open: 80, close: 74, low: 70, high: 90 },
        { d: "Tue 2", open: 74, close: 70, low: 64, high: 82 },
        { d: "Wed 2", open: 70, close: 84, low: 66, high: 90 },
        { d: "Thu 2", open: 84, close: 78, low: 72, high: 92 },
        { d: "Fri 2", open: 78, close: 88, low: 74, high: 94 },
      ],
      encoding: { x: "d", open: "open", close: "close", low: "low", high: "high" },
      legend: false,
      size: { width: 520, height: 300 },
      a11y: { alt: "The session closes higher than it opens on most of the twelve days." },
    },
  },
  {
    id: "week",
    title: "A week of prices",
    blurb: "Five dated sessions. Wednesday is the only day that closed down.",
    meta: "5 sessions",
    spec: {
      version: "1",
      id: "week-candles",
      type: "candlestick",
      title: "A week of prices",
      data: [
        { day: "2024-06-03T00:00:00Z", open: 101, high: 108, low: 99, close: 106 },
        { day: "2024-06-04T00:00:00Z", open: 106, high: 112, low: 104, close: 110 },
        { day: "2024-06-05T00:00:00Z", open: 110, high: 111, low: 102, close: 104 },
        { day: "2024-06-06T00:00:00Z", open: 104, high: 115, low: 103, close: 113 },
        { day: "2024-06-07T00:00:00Z", open: 113, high: 118, low: 111, close: 116 },
      ],
      encoding: { x: "day", open: "open", high: "high", low: "low", close: "close" },
      size: { width: 560, height: 300 },
      a11y: { alt: "The week closed at 116 after opening Monday at 101. Wednesday was the only down day." },
    },
  },
];

function encodingOf(spec: Record<string, unknown>): Record<string, unknown> | undefined {
  return isRecord(spec.encoding) ? spec.encoding : undefined;
}

/** The example's volume channel: a field name, or a channel object. */
export function restoredVolume(restore: unknown): unknown {
  if (typeof restore === "string" && restore) return restore;
  if (!isRecord(restore)) return undefined;
  if (typeof restore.field === "string" && !("encoding" in restore) && !("data" in restore)) return restore;
  const encoding = isRecord(restore.encoding) ? restore.encoding : undefined;
  if (encoding && encoding.volume !== undefined) return encoding.volume;
  return undefined;
}

/**
 * Off deletes encoding.volume. On puts the example's volume channel back.
 * An example with no volume field stays a price plot, and the control stays off.
 */
export function applyCandleVolume(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const encoding = encodingOf(spec);
  if (!encoding) return;
  if (value === "off") {
    delete encoding.volume;
    return;
  }
  const volume = restoredVolume(restore);
  if (volume === undefined) return;
  encoding.volume = structuredClone(volume);
}

export function candleVolumeMode(spec: Record<string, unknown>): "off" | "on" {
  const volume = encodingOf(spec)?.volume;
  if (typeof volume === "string" && volume) return "on";
  if (isRecord(volume) && typeof volume.field === "string" && volume.field) return "on";
  return "off";
}

export function applyCandlestickAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "volume" && (value === "off" || value === "on")) {
    applyCandleVolume(spec, value, action.restore);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function candlestickControlState(spec: Record<string, unknown>): TeachState {
  return {
    volume: candleVolumeMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const candlestickTeach: TeachModule = {
  type: "candlestick",
  title: candlestickPageTitle,
  description: candlestickPageDescription,
  examples: candlestickExamples,
  smallestSpec: smallestCandlestickSpec,
  controls: [
    choice("volume", "Volume", "encoding.volume", "encoding.volume", AREA_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyCandlestickAction,
  controlState: candlestickControlState,
};

for (const example of candlestickExamples) {
  if (example.spec.type !== "candlestick") throw new Error(`${example.id} is not a candlestick`);
}
