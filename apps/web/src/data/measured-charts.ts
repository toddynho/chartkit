import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../lib/repo-root";

type BundleRow = { id: string; lib: string; bytes: number };
type BrowserRow = {
  shape: string;
  points: number;
  chartkit: { initial: number; update: number };
  uplot: { initial: number; update: number };
};

type BenchmarkFile = {
  measured: string;
  headline: { lineGzipMeasured: string };
  bundleGzip: BundleRow[];
  browserMs: BrowserRow[];
};

export interface MeasuredSpec {
  version: "1";
  type: string;
  title: string;
  subtitle: string;
  data: Record<string, unknown>[];
  encoding: unknown;
  legend?: unknown;
  size: { width: number; height: number };
  theme?: unknown;
  a11y: { alt: string };
}

let cached: BenchmarkFile | undefined;

function benchmarks(): BenchmarkFile {
  if (cached) return cached;
  cached = JSON.parse(readFileSync(join(repoRoot(), "catalog/public/benchmarks.json"), "utf8")) as BenchmarkFile;
  if (!Array.isArray(cached.bundleGzip) || !Array.isArray(cached.browserMs)) {
    throw new Error("catalog/public/benchmarks.json is missing bundleGzip or browserMs");
  }
  return cached;
}

function bytes(n: number): string {
  return n.toLocaleString("en-US");
}

/** Published line-bundle gzip and even-x first paint. The numbers are the file, not a sample. */
export function measuredSpecs(theme?: unknown): MeasuredSpec[] {
  const file = benchmarks();
  const bundles = file.bundleGzip;
  const chartkit = bundles.find((row) => row.id === "chartkit-line");
  const sorted = [...bundles].sort((a, b) => a.bytes - b.bytes);
  const small = sorted[0];
  const big = sorted[sorted.length - 1];
  if (!chartkit || !small || !big) throw new Error("bundleGzip is missing a row");
  const bundleAlt = `Published line-bundle gzip. ${chartkit.lib} is ${bytes(chartkit.bytes)} bytes. ${small.lib} is the smallest at ${bytes(small.bytes)}. ${big.lib} is the largest at ${bytes(big.bytes)}.`;

  const even = file.browserMs.filter((row) => row.shape === "even");
  const first = even[0];
  const last = even[even.length - 1];
  if (!first || !last) throw new Error("browserMs is missing the even-x rows");
  const paintAlt = `Even x, round 13, measured ${file.measured}. ChartKit first paint is ${first.chartkit.initial} ms at ${bytes(first.points)} points and ${last.chartkit.initial} ms at ${bytes(last.points)}. uPlot is ${first.uplot.initial} ms and ${last.uplot.initial} ms.`;

  const withTheme = (spec: MeasuredSpec): MeasuredSpec => (theme === undefined ? spec : { ...spec, theme });

  return [
    withTheme({
      version: "1",
      type: "line",
      title: "First paint, even x",
      subtitle: `Round 13, measured ${file.measured}`,
      data: even.map((row) => ({
        points: row.points >= 1000000 ? "1M" : row.points >= 1000 ? `${row.points / 1000}k` : String(row.points),
        chartkit: row.chartkit.initial,
        uplot: row.uplot.initial,
      })),
      encoding: {
        x: { field: "points", type: "ordinal", title: "Points" },
        y: [
          { field: "chartkit", title: "ChartKit", type: "quantitative" },
          { field: "uplot", title: "uPlot", type: "quantitative" },
        ],
      },
      legend: { position: "top" },
      size: { width: 640, height: 260 },
      a11y: { alt: paintAlt },
    }),
    withTheme({
      version: "1",
      type: "bar",
      title: "Line bundle gzip",
      subtitle: `ChartKit figure dated ${file.headline.lineGzipMeasured}`,
      data: bundles.map((row) => ({ library: row.lib, bytes: row.bytes })),
      encoding: { x: "library", y: { field: "bytes", title: "Bytes" }, color: "library" },
      legend: false,
      size: { width: 640, height: 280 },
      a11y: { alt: bundleAlt },
    }),
    withTheme({
      version: "1",
      type: "donut",
      title: "Same gzip, as shares",
      subtitle: "Slice size is the published byte count",
      data: bundles.map((row) => ({ library: row.lib, bytes: row.bytes })),
      encoding: { x: "library", y: "bytes" },
      legend: { position: "right" },
      size: { width: 640, height: 280 },
      a11y: { alt: bundleAlt },
    }),
  ];
}
