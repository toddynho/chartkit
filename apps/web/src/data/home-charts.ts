import type { ChartSpec } from "@chartkitdev/core";
import { homePaint, type HomePaintDot } from "./home-bench";
import { rivalSwatch } from "./rival-colors";
import { tokenObservations, tokenSpread } from "./token-eval";

/**
 * Three static sizes. The card shows one of them. size on the spec is the
 * drawing size; the gutter is fitted inside it.
 */
export const HOME_STRIP_SIZES = [
  { id: "narrow", width: 400 },
  { id: "mid", width: 680 },
  { id: "wide", width: 1040 },
] as const;

export type HomeStripChart = {
  size: (typeof HOME_STRIP_SIZES)[number]["id"];
  width: number;
  height: number;
  spec: ChartSpec;
};

const calm = {
  text: "#17181a",
  muted: "#6b6e75",
  grid: "#e6e6e2",
  axis: "#e6e6e2",
  accent: "#0a63e6",
  background: "#ffffff",
};

function sized(specId: string, size: HomeStripChart["size"], width: number, height: number, spec: Record<string, unknown>): HomeStripChart {
  return { size, width, height, spec: { ...spec, id: specId, size: { width, height } } as ChartSpec };
}

/** Log dot plot. ChartKit is a larger ringed dot. Runs past 5 s are pins. */
export function homePaintCharts(): HomeStripChart[] {
  const paint = homePaint();
  const libraries: string[] = [];
  const data: { type: string; library: string; ms: number; note: string }[] = [];
  for (const row of paint.rows) {
    const chartkit = row.dots.find((dot) => dot.lib === "ChartKit");
    const rest = row.dots.filter((dot) => dot.lib !== "ChartKit");
    const dots: HomePaintDot[] = chartkit ? [chartkit, ...rest] : rest;
    for (const dot of dots) {
      if (!libraries.includes(dot.lib)) libraries.push(dot.lib);
      data.push({ type: row.type, library: dot.lib, ms: dot.ms, note: row.note });
    }
  }
  const alt = `First paint by chart type on a log scale from 5 ms to 5 s. ChartKit's 100,000-point line is ${paint.stat} ms. ${paint.statCaption}`;
  const height = 392;
  const theme = {
    tokens: {
      ...calm,
      series: libraries.map((name) => rivalSwatch(name).fill),
      lines: libraries.map((name) => rivalSwatch(name).ink),
    },
  };
  return HOME_STRIP_SIZES.map((size) => {
    const spec = {
      version: "1",
      type: "strip",
      data,
      encoding: {
        x: { field: "ms", scale: { type: "log", domain: [5, 5000], padding: 0 } },
        y: "type",
        color: "library",
        label: "library",
        note: "note",
      },
      mark: {
        summary: "none",
        band: "none",
        jitter: "none",
        pointSize: 4.5,
        highlight: "ChartKit",
        emphasis: "ring",
        note: "field",
        pin: true,
        pinFormat: "duration-ms",
        value: "highlight",
        labelColor: "accent",
        labelFormat: { specifier: ".1f" },
        labelSuffix: " ms",
        zebra: true,
      },
      axes: {
        x: {
          ticks: [10, 100, 1000],
          format: "duration-ms",
          edgeLabel: size.id === "narrow" ? "5s+" : "5s+ →",
          grid: false,
        },
      },
      legend: false,
      theme,
      a11y: { alt },
    };
    return sized(`paint-${size.id}`, size.id, size.width, height, spec);
  });
}

/** Token spread. The range sits under the library name. ChartKit is accent. */
export function homeTokenCharts(): HomeStripChart[] {
  const spread = tokenSpread();
  const chartkit = spread.rows.find((row) => row.us);
  const next = spread.rows.find((row) => !row.us);
  if (!chartkit || !next || !spread.annotation) throw new Error("token chart is missing ChartKit or the compare note");
  const alt = `ChartKit's median is ${chartkit.medianText} tokens, ${spread.headline}× below ${next.name} at ${next.medianText}.`;
  const height = 360;
  const theme = {
    tokens: {
      ...calm,
      series: spread.rows.map((row) => rivalSwatch(row.name).fill),
      lines: spread.rows.map((row) => rivalSwatch(row.name).ink),
    },
  };
  const data = tokenObservations().map((cell) => ({ library: cell.library, model: cell.model, tokens: cell.tokens }));
  return HOME_STRIP_SIZES.map((size) => {
    const spec = {
      version: "1",
      type: "strip",
      data,
      encoding: {
        x: { field: "tokens", scale: { domain: [0, 2000] } },
        y: "library",
        color: "library",
        label: "model",
      },
      mark: {
        band: "range",
        bandColor: "series",
        sort: "asc",
        jitter: "none",
        pointSize: 4,
        highlight: "ChartKit",
        emphasis: "color",
        note: "range",
        notePrefix: size.id === "narrow" ? "" : "range ",
        labelColor: "series",
        labelSuffix: " tok",
        zebra: true,
      },
      axes: { x: { grid: false } },
      legend: false,
      annotations: [
        {
          type: "compare",
          from: { group: "ChartKit", at: "summary" },
          to: { group: next.name, at: "summary" },
          label: spread.annotation.text,
        },
      ],
      theme,
      a11y: { alt },
    };
    return sized(`tokens-${size.id}`, size.id, size.width, height, spec);
  });
}
