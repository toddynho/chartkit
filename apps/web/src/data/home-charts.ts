import type { ChartSpec } from "@chartkitdev/core";
import { homePaint, type HomePaintDot } from "./home-bench";
import { rivalSwatch } from "./rival-colors";
import { tokenObservations, tokenSpread } from "./token-eval";

/**
 * Three static sizes. The card shows one of them with a container query so a
 * 390px phone does not scale a 1040px drawing down until the labels vanish.
 */
export const HOME_STRIP_SIZES = [
  { id: "narrow", width: 400 },
  { id: "mid", width: 680 },
  { id: "wide", width: 1040 },
] as const;

export type HomeStripChart = {
  /** Matches `.ckx-chart--narrow`, `--mid`, and `--wide`. */
  size: (typeof HOME_STRIP_SIZES)[number]["id"];
  width: number;
  height: number;
  spec: ChartSpec;
};

const calm = {
  text: "#17181a",
  muted: "#55575c",
  grid: "#e6e6e2",
  axis: "#e6e6e2",
  accent: "#0a63e6",
  background: "#ffffff",
};

function sized(specId: string, size: HomeStripChart["size"], width: number, height: number, spec: Record<string, unknown>): HomeStripChart {
  return { size, width, height, spec: { ...spec, id: specId, size: { width, height } } as ChartSpec };
}

/**
 * Log dot plot of first-paint medians.
 * ChartKit is the first dot in each group. With the summary hidden, the end
 * label is that first value, which is the number the page already prints.
 * A strip has no per-row subtitle, so the workload note stays in the caption.
 */
export function homePaintCharts(): HomeStripChart[] {
  const paint = homePaint();
  const libraries: string[] = [];
  const data: { type: string; library: string; ms: number }[] = [];
  for (const row of paint.rows) {
    const chartkit = row.dots.find((dot) => dot.lib === "ChartKit");
    const rest = row.dots.filter((dot) => dot.lib !== "ChartKit");
    const dots: HomePaintDot[] = chartkit ? [chartkit, ...rest] : rest;
    for (const dot of dots) {
      if (!libraries.includes(dot.lib)) libraries.push(dot.lib);
      data.push({ type: row.type, library: dot.lib, ms: dot.ms });
    }
  }
  const alt = `First paint by chart type on a log scale from 5 ms to 5 s. ChartKit's 100,000-point line is ${paint.stat} ms. ${paint.statCaption}`;
  const height = 392;
  const spec = {
    version: "1",
    type: "strip",
    data,
    encoding: {
      x: {
        field: "ms",
        scale: { type: "log", domain: [5, 5000], clamp: true, padding: 0 },
      },
      y: "type",
      color: "library",
      label: "library",
    },
    mark: { summary: "none", band: "none", jitter: "none", pointSize: 4.5 },
    axes: { x: { ticks: [10, 100, 1000, 5000], format: "number" } },
    legend: false,
    theme: { tokens: { ...calm, series: libraries.map((name) => rivalSwatch(name).fill) } },
    a11y: { alt },
  };
  return HOME_STRIP_SIZES.map((size) => sized(`paint-${size.id}`, size.id, size.width, height, spec));
}

/** Token spread. Medians, the range band, and the compare note come from tokenSpread(). */
export function homeTokenCharts(): HomeStripChart[] {
  const spread = tokenSpread();
  const chartkit = spread.rows.find((row) => row.us);
  const next = spread.rows.find((row) => !row.us);
  if (!chartkit || !next || !spread.annotation) throw new Error("token chart is missing ChartKit or the compare note");
  const alt = `ChartKit's median is ${chartkit.medianText} tokens, ${spread.headline}× below ${next.name} at ${next.medianText}.`;
  const height = 340;
  const spec = {
    version: "1",
    type: "strip",
    data: tokenObservations().map((cell) => ({ library: cell.library, model: cell.model, tokens: cell.tokens })),
    encoding: {
      x: { field: "tokens", scale: { domain: [0, 2000] } },
      y: "library",
      color: "library",
      label: "model",
    },
    mark: { band: "range", sort: "asc", jitter: "none", pointSize: 4 },
    legend: false,
    annotations: [
      {
        type: "compare",
        from: { group: "ChartKit", at: "summary" },
        to: { group: next.name, at: "summary" },
        label: spread.annotation.text,
      },
    ],
    theme: { tokens: { ...calm, series: spread.rows.map((row) => rivalSwatch(row.name).fill) } },
    a11y: { alt },
  };
  return HOME_STRIP_SIZES.map((size) => sized(`tokens-${size.id}`, size.id, size.width, height, spec));
}
