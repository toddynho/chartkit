import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { MatrixLibrary } from "@/lib/matrix";

export interface MeasuredSizes {
  commit: string;
  coreCommit: string;
  coreMatchesMain: boolean;
  sizeScript: {
    command: string;
    method: string;
    measuredAt: string;
    measured: { line: number; all: number };
    minBytes: { line: number; all: number };
  };
  bench: {
    command: string;
    measuredAt: string;
    method: string;
    versions: Record<string, string>;
    rows: {
      id: string;
      library: string;
      chart: string;
      status: string;
      gzipBytes: number | null;
      cssGzipBytes: number | null;
      reactExternalGzipBytes: number | null;
      note: string | null;
    }[];
  };
}

interface BenchmarkFile {
  round: number;
  measured: string;
  core: { commit: string };
  methodology: { ssr: string };
  browserMs: {
    shape: string;
    points: number;
    chartkit: { initial: number; update: number };
    uplot: { initial: number; update: number };
  }[];
  hoverSteady100k: { lib: string; paintedMs: number }[];
  firstHoverPainted: { afterMountMs: number; chartkit: number; uplot: number }[];
  ssrMs: { lib: string; meanMs: number | null; medianMs: number | null; supported: boolean }[];
}

const BENCH_NAME: Record<string, string> = {
  uplot: "uPlot",
  chartjs: "Chart.js",
  plot: "Observable Plot",
  recharts: "Recharts",
  echarts: "ECharts",
  nivo: "Nivo",
};

let sizes: MeasuredSizes | null = null;
let benchmarks: BenchmarkFile | null = null;

export function measuredSizes(): MeasuredSizes {
  if (!sizes) {
    sizes = JSON.parse(readFileSync(join(process.cwd(), "data/measured-sizes.json"), "utf8")) as MeasuredSizes;
  }
  return sizes;
}

function publishedBenchmarks(): BenchmarkFile {
  if (!benchmarks) {
    benchmarks = JSON.parse(readFileSync(join(process.cwd(), "public/benchmarks.json"), "utf8")) as BenchmarkFile;
  }
  return benchmarks;
}

function bytes(value: number): string {
  return value.toLocaleString("en-US");
}

function day(iso: string): string {
  return iso.slice(0, 10);
}

export function sizeParagraph(library: MatrixLibrary): string {
  const measured = measuredSizes();
  const core = measured.coreMatchesMain ? `core ${measured.coreCommit}, same tree as origin/main` : `core ${measured.coreCommit}`;
  const parts = [
    `ChartKit line gzip is ${bytes(measured.sizeScript.measured.line)} bytes from ${measured.sizeScript.command} on ${measured.commit} (${core}), measured ${day(measured.sizeScript.measuredAt)}. ${measured.sizeScript.method}`,
  ];
  const row = measured.bench.rows.find((item) => item.id === library.id && item.chart === "line" && item.status === "ok");
  if (row?.gzipBytes != null) {
    if (row.reactExternalGzipBytes != null) {
      parts.push(
        `${library.name} line gzip is ${bytes(row.reactExternalGzipBytes)} bytes with React external, and ${bytes(row.gzipBytes)} bytes with React included, from ${measured.bench.command} at ${measured.bench.measuredAt}.`,
      );
    } else {
      parts.push(`${library.name} line gzip is ${bytes(row.gzipBytes)} bytes from ${measured.bench.command} at ${measured.bench.measuredAt}.`);
    }
    if (row.cssGzipBytes != null) {
      parts.push(
        `The stylesheet is ${bytes(row.cssGzipBytes)} bytes gzip, a separate response. JS plus stylesheet is ${bytes(row.gzipBytes + row.cssGzipBytes)} bytes as a sum of the two, not one stream.`,
      );
    }
    const harness = measured.bench.rows.find((item) => item.id === "chartkit-minimal" && item.chart === "line" && item.status === "ok");
    if (harness?.gzipBytes != null) {
      parts.push(`The bench browser bundle of ChartKit’s line entry on that same run is ${bytes(harness.gzipBytes)} bytes.`);
    }
  } else if (library.bundleGzip && typeof library.bundleGzip.minimalLine === "number") {
    parts.push(
      `${library.name} line gzip is ${bytes(library.bundleGzip.minimalLine)} bytes from ${library.bundleGzip.source ?? "the matrix extract"}, measured ${library.bundleGzip.measured ?? "the matrix date"}. The bench bundle set does not include this library, so this figure was not remeasured with the ChartKit line above.`,
    );
    if (typeof library.bundleGzip.fullEntry === "number") {
      parts.push(`Full entry gzip on that extract is ${bytes(library.bundleGzip.fullEntry)} bytes.`);
    }
  } else {
    parts.push(`${library.name} has no measured bundle in the bench run or the matrix extract. This page does not invent one.`);
  }
  return parts.join(" ");
}

function shapeLabel(shape: string): string {
  if (shape === "jitter") return "jittered";
  if (shape === "tsgaps") return "gapped";
  return shape;
}

export function perfParagraph(libraryId: string, libraryName: string): string {
  const bench = publishedBenchmarks();
  const measured = measuredSizes();
  const lead = `Older round ${bench.round} timings, measured ${bench.measured} on ${bench.core.commit}. Not re-run on ${measured.commit}.`;
  const name = BENCH_NAME[libraryId];
  if (!name) return `${lead} benchmarks.json has no timing row for ${libraryName}.`;
  const parts = [lead];
  const hoverChartkit = bench.hoverSteady100k.find((row) => row.lib === "ChartKit");
  const hover = bench.hoverSteady100k.find((row) => row.lib === name);
  if (hover && hoverChartkit) {
    parts.push(`Steady hover at 100k, painted median: ChartKit ${hoverChartkit.paintedMs} ms, ${name} ${hover.paintedMs} ms.`);
  }
  const ssrChartkit = bench.ssrMs.find((row) => row.lib === "ChartKit");
  const ssr = bench.ssrMs.find((row) => row.lib === name);
  if (ssr && ssrChartkit?.supported) {
    if (!ssr.supported) {
      parts.push(`${name} did not produce a chart without a DOM.`);
      if (bench.methodology.ssr.includes(name)) parts.push(bench.methodology.ssr);
    } else if (ssr.meanMs != null) {
      parts.push(
        `Server render of a 1,000 point line: ChartKit ${ssrChartkit.meanMs} ms mean, ${name} ${ssr.meanMs} ms mean (median ${ssr.medianMs}).`,
      );
    }
  }
  if (libraryId === "uplot") {
    const rows = bench.browserMs;
    const initialWins = rows.filter((row) => row.chartkit.initial < row.uplot.initial).length;
    const updateSlower = rows.filter((row) => row.chartkit.update > row.uplot.update);
    parts.push(
      `Browser initial and update rows in that file are ChartKit against uPlot only (${rows.length} cells). ChartKit’s initial render is faster in ${initialWins} of ${rows.length}. Aligned update is slower in ${updateSlower.length}: ${updateSlower.map((row) => `${shapeLabel(row.shape)} ${row.points.toLocaleString("en-US")} ${row.chartkit.update} vs ${row.uplot.update}`).join(", ")}.`,
    );
    const first = bench.firstHoverPainted;
    parts.push(
      `First hover painted medians: ChartKit ${first.map((row) => row.chartkit).join(", ")} ms against uPlot ${first.map((row) => row.uplot).join(", ")} at ${first.map((row) => row.afterMountMs).join(", ")} ms after mount.`,
    );
  } else {
    parts.push(`Browser initial and update rows in that file are ChartKit against uPlot only, so ${name} has no browser millisecond there.`);
  }
  return parts.join(" ");
}
