import type { ChartSpec } from "@chartkitdev/core";
import { homeSsr } from "./home-ssr";
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

/** Server render, log dot plot. ChartKit is a larger ringed dot. */
export function homeServerCharts(): HomeStripChart[] {
  const ssr = homeSsr();
  const data = ssr.rows.flatMap((row) => row.dots.map((dot) => ({ type: row.type, library: dot.library, ms: dot.ms, note: row.note })));
  const alt = `Server render time by chart type on a log scale from 0.01 ms to 100 ms. ChartKit's 48-bar chart is ${ssr.stat} ms. ${ssr.statCaption}`;
  const theme = {
    tokens: {
      ...calm,
      series: ssr.libraries.map((name) => rivalSwatch(name).fill),
      lines: ssr.libraries.map((name) => rivalSwatch(name).ink),
    },
  };
  return HOME_STRIP_SIZES.map((size) => {
    const spec = {
      version: "1",
      type: "strip",
      data,
      encoding: {
        x: { field: "ms", scale: { type: "log", domain: [0.01, 100], padding: 0 } },
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
        value: "highlight",
        labelColor: "accent",
        labelFormat: { specifier: ".2f" },
        labelSuffix: " ms",
        zebra: true,
      },
      axes: { x: { ticks: [0.1, 1, 10], grid: false } },
      legend: false,
      theme,
      a11y: { alt },
    };
    return sized(`server-${size.id}`, size.id, size.width, 300, spec);
  });
}

/** Token spread. The range sits under the library name. ChartKit is accent. */
export function homeTokenCharts(): HomeStripChart[] {
  const spread = tokenSpread();
  const chartkit = spread.rows.find((row) => row.us);
  const next = spread.rows.find((row) => !row.us);
  const annotation = spread.annotation;
  if (!chartkit || !next || !annotation) throw new Error("token chart is missing ChartKit or the compare note");
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
          label: annotation.text,
        },
      ],
      theme,
      a11y: { alt },
    };
    return sized(`tokens-${size.id}`, size.id, size.width, height, spec);
  });
}
