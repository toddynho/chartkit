import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../lib/repo-root";

export type PublishedSizeCell = {
  library: string;
  state: "ok" | "unsupported" | "error" | "timeout";
  text: string;
  title: string;
};

export type PublishedBundleRow = {
  chart: string;
  label: string;
  cells: PublishedSizeCell[];
};

export type PublishedSsrRow = PublishedBundleRow & {
  points: number;
  pointsLabel: string;
};

export type PublishedSizeCounts = {
  ok: number;
  unsupported: number;
  error: number;
  timeout: number;
};

export type PublishedBundleMatrix = {
  measuredAt: string;
  measuredOn: string;
  commit: string;
  libraries: string[];
  rows: PublishedBundleRow[];
  counts: PublishedSizeCounts;
  caption: string;
  notes: string[];
};

export type PublishedSsrMatrix = {
  measuredAt: string;
  measuredOn: string;
  commit: string;
  samples: number;
  libraries: string[];
  rows: PublishedSsrRow[];
  counts: PublishedSizeCounts;
  caption: string;
  notes: string[];
};

function load(): { bundleMatrix?: PublishedBundleMatrix; ssrMatrix?: PublishedSsrMatrix } {
  return JSON.parse(readFileSync(join(repoRoot(), "catalog/public/benchmarks.json"), "utf8")) as {
    bundleMatrix?: PublishedBundleMatrix;
    ssrMatrix?: PublishedSsrMatrix;
  };
}

function assertCounts(kind: string, counts: PublishedSizeCounts | undefined): PublishedSizeCounts {
  if (!counts || [counts.ok, counts.unsupported, counts.error, counts.timeout].some((value) => typeof value !== "number")) {
    throw new Error(`catalog/public/benchmarks.json is missing ${kind} cell counts`);
  }
  return counts;
}

/** Bundle matrix published in catalog/public/benchmarks.json, built from bench/results/bundle.json. */
export function loadPublishedBundle(): PublishedBundleMatrix {
  const bundle = load().bundleMatrix;
  if (!bundle || !Array.isArray(bundle.rows) || !Array.isArray(bundle.libraries) || typeof bundle.caption !== "string") {
    throw new Error("catalog/public/benchmarks.json is missing the bundle matrix");
  }
  const line = bundle.rows.find((row) => row.chart === "line")?.cells.find((cell) => cell.library === "ChartKit");
  if (!line || line.text !== "32,110") {
    throw new Error(`bundle matrix ChartKit line gzip is ${line?.text ?? "missing"}, expected 32,110`);
  }
  assertCounts("bundle", bundle.counts);
  return bundle;
}

/** SSR matrix published in catalog/public/benchmarks.json, built from bench/results/ssr.json. */
export function loadPublishedSsr(): PublishedSsrMatrix {
  const ssr = load().ssrMatrix;
  if (!ssr || !Array.isArray(ssr.rows) || !Array.isArray(ssr.libraries) || typeof ssr.caption !== "string") {
    throw new Error("catalog/public/benchmarks.json is missing the SSR matrix");
  }
  assertCounts("SSR", ssr.counts);
  const threw = ssr.rows.some((row) => row.chart === "sparkline" && row.cells.some((cell) => cell.library === "MUI X Charts" && cell.state === "error"));
  const timeouts = ["Victory", "ApexCharts"].every((library) =>
    ssr.rows.some((row) => row.chart === "stacked-area" && row.cells.some((cell) => cell.library === library && cell.state === "timeout")),
  );
  const range = ssr.rows.some((row) => row.chart === "area-range" && row.cells.some((cell) => cell.library === "ApexCharts" && cell.state === "timeout"));
  if (!threw || !timeouts || !range) {
    throw new Error("SSR matrix is missing the named error and timeout cells");
  }
  return ssr;
}
