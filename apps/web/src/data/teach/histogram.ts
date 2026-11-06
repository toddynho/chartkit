/**
 * Teaching copy and curated specs for /docs/charts/histogram.
 * A histogram counts one quantitative field into equal-width bins.
 * The bin count and the bin rule are the options a first histogram sets.
 * Bin width, the corner badge, and a pre-binned count column stay in the playground.
 * A histogram is one series. The renderer draws no legend, so there is no legend control.
 * Theme preset chips are not on this page.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const histogramPageTitle = "Histogram";

export const histogramPageDescription =
  "How to build a ChartKit histogram: one quantitative field split into bins, when to use it instead of a bar or a density, the data shape, a spec that renders, and the options that set the bins.";

/** Four observations. Omitted mark.bins is 8. The renderer counts encoding.x. */
export const smallestHistogramSpec: Record<string, unknown> = {
  version: "1",
  type: "histogram",
  data: [{ ms: 12 }, { ms: 18 }, { ms: 18 }, { ms: 40 }],
  encoding: { x: "ms" },
  a11y: { alt: "Most times sit low, with one slower value at 40 milliseconds." },
};

/** Core example 16-histogram.json. Two hundred checkout times, sixteen bins. */
const checkoutMs = [
  152, 120, 152, 77, 385, 260, 330, 257, 231, 285, 260, 224, 270, 176, 244, 263, 283, 169, 308, 219, 272, 178, 217, 284,
  210, 179, 302, 266, 258, 235, 362, 278, 276, 185, 331, 173, 267, 321, 242, 286, 234, 237, 233, 383, 278, 263, 246, 285,
  219, 298, 258, 255, 285, 231, 301, 345, 224, 220, 177, 295, 123, 270, 230, 347, 338, 274, 174, 222, 329, 373, 238, 264,
  375, 261, 291, 267, 363, 238, 243, 306, 234, 155, 260, 291, 298, 173, 286, 258, 235, 289, 306, 264, 258, 224, 314, 248,
  245, 335, 240, 288, 238, 202, 250, 210, 272, 250, 196, 258, 155, 217, 210, 343, 151, 361, 236, 249, 235, 276, 250, 277,
  195, 325, 115, 269, 283, 219, 289, 253, 65, 304, 220, 191, 196, 288, 216, 221, 259, 201, 177, 247, 295, 187, 253, 358,
  152, 204, 257, 175, 226, 258, 318, 356, 155, 243, 242, 268, 204, 240, 268, 104, 281, 268, 254, 223, 130, 297, 236, 147,
  293, 278, 210, 231, 159, 227, 180, 261, 214, 196, 238, 134, 153, 185, 248, 250, 253, 204, 126, 74, 327, 221, 247, 60,
  268, 239, 317, 313, 226, 172, 159, 162,
];

/** Homepage hero histogram. Fourteen bins of response time. */
function responseTimes(): { ms: number }[] {
  const weights = [6, 12, 22, 38, 55, 74, 92, 100, 88, 66, 44, 26, 13, 5];
  const rows: { ms: number }[] = [{ ms: 12 }, { ms: 41 }];
  weights.forEach((count, bin) => {
    const n = Math.max(1, Math.round(count / 8));
    const center = bin * 10 + 5;
    for (let i = 0; i < n; i++) rows.push({ ms: Math.round(center + ((i % 5) - 2)) });
  });
  return rows;
}

const BIN_OPTIONS = [
  { value: "count", label: "count" },
  { value: "sturges", label: "sturges" },
  { value: "sqrt", label: "sqrt" },
  { value: "fd", label: "fd" },
] as const;

/**
 * Checkout time is the core sample. Checkout scores is the docs example with two bins.
 * Response time distribution is the homepage histogram.
 * Titles stay the full example titles.
 */
export const histogramExamples: TeachExample[] = [
  {
    id: "checkout",
    title: "Checkout time",
    blurb: "Two hundred checkout times, split into sixteen bins.",
    meta: "16 bins",
    spec: {
      version: "1",
      type: "histogram",
      title: "Checkout time",
      data: checkoutMs.map((ms) => ({ ms })),
      encoding: { x: "ms" },
      mark: { bins: 16 },
      a11y: { alt: "Most checkouts finish between about two and five minutes, with a few slower ones." },
    },
  },
  {
    id: "scores",
    title: "Checkout scores",
    blurb: "Two bins. Most scores sit in the low one.",
    meta: "2 bins",
    spec: {
      version: "1",
      id: "checkout-histogram",
      type: "histogram",
      title: "Scores",
      data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
      encoding: { x: "score" },
      mark: { bins: 2 },
      size: { width: 560, height: 280 },
      a11y: { alt: "Scores cluster low." },
    },
  },
  {
    id: "response",
    title: "Response time distribution",
    blurb: "Response times in fourteen bins, with a thin tail of slower requests.",
    meta: "14 bins",
    spec: {
      version: "1",
      type: "histogram",
      title: "Response time distribution",
      subtitle: "Milliseconds, 14 bins",
      data: responseTimes(),
      encoding: { x: "ms" },
      mark: { bins: 14 },
      legend: false,
      size: { width: 520, height: 300 },
      a11y: { alt: "Response times bunch in the middle of the range, with a thin tail of slower requests." },
    },
  },
];

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

/** The slider writes mark.bins. The renderer caps the count at 60. Omitted is 8. */
export function applyBins(spec: Record<string, unknown>, value: number): void {
  const bins = Math.min(60, Math.max(1, Math.round(value)));
  editMark(spec, (mark) => {
    mark.bins = bins;
  });
}

/** Omitted bins is 8, the renderer default. */
export function binsOf(spec: Record<string, unknown>): number {
  const bins = markOf(spec).bins;
  if (typeof bins !== "number" || !Number.isFinite(bins)) return 8;
  return Math.min(60, Math.max(1, Math.round(bins)));
}

export function applyBinRule(spec: Record<string, unknown>, value: "count" | "sturges" | "sqrt" | "fd"): void {
  editMark(spec, (mark) => {
    mark.bin = value;
  });
}

/** Omitted rule is count, which uses mark.bins. width is not on this control. */
export function binRuleMode(spec: Record<string, unknown>): "count" | "sturges" | "sqrt" | "fd" | "other" {
  const rule = markOf(spec).bin;
  if (rule === undefined || rule === "count") return "count";
  if (rule === "sturges" || rule === "sqrt" || rule === "fd") return rule;
  return "other";
}

export function applyHistogramAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "bins" && typeof value === "number") {
    applyBins(spec, value);
    return;
  }
  if (id === "bin" && (value === "count" || value === "sturges" || value === "sqrt" || value === "fd")) {
    applyBinRule(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function histogramControlState(spec: Record<string, unknown>): TeachState {
  return {
    bins: binsOf(spec),
    bin: binRuleMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const histogramTeach: TeachModule = {
  type: "histogram",
  title: histogramPageTitle,
  description: histogramPageDescription,
  examples: histogramExamples,
  smallestSpec: smallestHistogramSpec,
  controls: [
    {
      kind: "range",
      id: "bins",
      label: "Bins",
      code: "mark.bins",
      min: 1,
      max: 30,
      step: 1,
      aria: "mark.bins",
    },
    choice("bin", "Bin rule", "mark.bin", "mark.bin", BIN_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyHistogramAction,
  controlState: histogramControlState,
};

for (const example of histogramExamples) {
  if (example.spec.type !== "histogram") throw new Error(`${example.id} is not a histogram`);
}
