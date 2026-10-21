import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ChartSlot } from "./showcase-data";

interface Measured {
  commit: string;
  coreCommit: string;
  sizeScript: { measuredAt: string; measured: { line: number }; command: string };
  bench: {
    command: string;
    measuredAt: string;
    rows: {
      id: string;
      chart: string;
      status: string;
      gzipBytes: number | null;
      cssGzipBytes: number | null;
      reactExternalGzipBytes: number | null;
    }[];
  };
}

interface BenchmarkFile {
  round: number;
  measured: string;
  core: { commit: string };
  browserMs: {
    shape: string;
    points: number;
    chartkit: { initial: number; update: number };
    uplot: { initial: number; update: number };
    result: string;
  }[];
  hoverSteady100k: { lib: string; paintedMs: number }[];
  losses: string[];
}

function docsRoot(): string {
  const cwd = process.cwd();
  return cwd.endsWith("/docs") ? cwd : join(cwd, "docs");
}

export function loadMeasured(): Measured {
  return JSON.parse(readFileSync(join(docsRoot(), "data/measured-sizes.json"), "utf8")) as Measured;
}

export function loadBenchmarks(): BenchmarkFile {
  return JSON.parse(readFileSync(join(docsRoot(), "public/benchmarks.json"), "utf8")) as BenchmarkFile;
}

function shapeLabel(shape: string): string {
  if (shape === "jitter") return "jittered";
  if (shape === "tsgaps") return "gapped";
  return shape;
}

function cellLabel(shape: string, points: number): string {
  const pointsLabel = points >= 1000000 ? "1M" : points >= 1000 ? `${points / 1000}k` : String(points);
  return `${shapeLabel(shape)} ${pointsLabel}`;
}

export interface BenchSources {
  sizeMeasured: string;
  sizeCommit: string;
  benchMeasured: string;
  round: number;
  roundMeasured: string;
  roundCommit: string;
}

export function benchSources(): BenchSources {
  const measured = loadMeasured();
  const bench = loadBenchmarks();
  return {
    sizeMeasured: measured.sizeScript.measuredAt.slice(0, 10),
    sizeCommit: measured.commit,
    benchMeasured: measured.bench.measuredAt.slice(0, 10),
    round: bench.round,
    roundMeasured: bench.measured,
    roundCommit: bench.core.commit,
  };
}

export function benchmarkCharts(): ChartSlot[] {
  const measured = loadMeasured();
  const bench = loadBenchmarks();
  const line = (id: string) => measured.bench.rows.find((row) => row.id === id && row.chart === "line" && row.status === "ok");
  const bytes = (id: string) => {
    const row = line(id);
    if (!row) return null;
    return row.reactExternalGzipBytes ?? row.gzipBytes;
  };
  const bundles = [
    { name: "ChartKit", bytes: measured.sizeScript.measured.line },
    { name: "CK bench", bytes: line("chartkit-minimal")?.gzipBytes },
    { name: "uPlot", bytes: bytes("uplot") },
    { name: "Chart.js", bytes: bytes("chartjs") },
    { name: "Plot", bytes: bytes("plot") },
    { name: "Recharts", bytes: bytes("recharts") },
    { name: "Nivo", bytes: bytes("nivo") },
    { name: "ECharts", bytes: bytes("echarts") },
  ].filter((row): row is { name: string; bytes: number } => typeof row.bytes === "number" && row.bytes > 0);

  const updates = bench.browserMs.map((row) => ({
    cell: cellLabel(row.shape, row.points),
    library: "ChartKit",
    ms: row.chartkit.update,
  })).concat(
    bench.browserMs.map((row) => ({
      cell: cellLabel(row.shape, row.points),
      library: "uPlot",
      ms: row.uplot.update,
    })),
  );

  const delta = bench.browserMs.map((row) => ({
    cell: cellLabel(row.shape, row.points),
    gap: Math.round((row.chartkit.update - row.uplot.update) * 10) / 10,
  }));
  const gaps = delta.map((row) => row.gap);
  const low = Math.min(...gaps, 0);
  const high = Math.max(...gaps, 0);

  const smallest = bundles.reduce((a, b) => (a.bytes < b.bytes ? a : b));
  const largest = bundles.reduce((a, b) => (a.bytes > b.bytes ? a : b));
  const chartkit = bundles.find((item) => item.name === "ChartKit");
  const uplot = bundles.find((item) => item.name === "uPlot");
  const bundleLoss = chartkit != null && uplot != null && chartkit.bytes > uplot.bytes;
  const bundleAlt = bundleLoss
    ? `uPlot’s line is the smallest bar. ChartKit’s measured line is larger, ${chartkit.bytes.toLocaleString("en-US")} bytes against uPlot’s ${uplot.bytes.toLocaleString("en-US")}. ${largest.name} is the largest on this log scale.`
    : `${smallest.name}’s measured line is the smallest bar. ${largest.name} is the largest on this log scale.`;
  const bundleCaption = bundleLoss
    ? "Log scale. ChartKit is the size script and is larger than uPlot. The other bars are the bench line, using the React-external gzip when that row has one. uPlot’s CSS is a separate measured file and is not added to its bar."
    : "Log scale. ChartKit is the size script. The other bars are the bench line, using the React-external gzip when that row has one. uPlot’s CSS is a separate measured file and is not added to its bar.";

  const hover = bench.hoverSteady100k
    .filter((row) => row.lib === "ChartKit" || row.lib === "uPlot" || row.lib === "Chart.js" || row.lib === "Observable Plot" || row.lib === "Recharts" || row.lib === "ECharts")
    .map((row) => ({ lib: row.lib, ms: row.paintedMs }));

  return [
    {
      id: "bundles",
      title: "Line chart, gzip",
      caption: bundleCaption,
      span: "board-12",
      spec: {
        version: "1",
        id: "bench-bundles",
        type: "bar",
        theme: "soft",
        data: bundles,
        encoding: {
          x: "name",
          y: { field: "bytes", title: "Bytes", scale: { type: "log" } },
        },
        mark: { orientation: "horizontal" },
        axes: { x: { title: "Library" }, y: { title: "Gzip bytes" } },
        tooltip: { position: "top", fields: [{ field: "bytes", title: "Gzip bytes" }] },
        interaction: { select: "point" },
        size: { width: 980, height: 460, padding: { left: 72 } },
        a11y: { alt: bundleAlt },
      },
    },
    {
      id: "updates",
      title: "Aligned update, ChartKit and uPlot",
      caption: "Grouped bars from the round 13 browser rows. A taller uPlot bar is a loss. Click a legend name to hide that library.",
      span: "board-12",
      spec: {
        version: "1",
        id: "bench-updates",
        type: "bar",
        theme: "soft",
        data: updates,
        encoding: { x: "cell", y: "ms", series: "library" },
        axes: { x: { title: "Cell", rotate: -32 }, y: { title: "Milliseconds" } },
        legend: { position: "bottom", interactive: true },
        tooltip: { mode: "index", position: "top", crosshair: true },
        interaction: { select: "series" },
        size: { width: 980, height: 440, padding: { left: 88 } },
        a11y: { alt: "uPlot’s aligned update is faster than ChartKit’s in several of the twelve cells, including the smaller point counts." },
      },
    },
    {
      id: "gap",
      title: "Update gap",
      caption: "ChartKit minus uPlot. The band below zero is a loss. The band above zero is a lead.",
      span: "board-12",
      spec: {
        version: "1",
        id: "bench-gap",
        type: "bar",
        theme: "soft",
        data: delta,
        encoding: { x: "cell", y: { field: "gap", title: "ms" } },
        axes: { x: { title: "Cell", rotate: -32 }, y: { title: "Gap (ms)" } },
        annotations: [
          { type: "band", axis: "y", from: low, to: 0, label: "uPlot faster", opacity: 0.2 },
          { type: "band", axis: "y", from: 0, to: high, label: "ChartKit faster", opacity: 0.12 },
        ],
        tooltip: { position: "top", fields: [{ field: "gap", title: "Gap (ms)" }] },
        interaction: { select: "point" },
        size: { width: 980, height: 400, padding: { left: 84 } },
        a11y: { alt: "Bars below zero are cells where uPlot’s aligned update is faster. Bars above zero are cells where ChartKit is faster." },
      },
    },
    {
      id: "hover",
      title: "Steady hover at 100k",
      caption: "Painted median from the same round 13 file. uPlot is ahead of ChartKit here.",
      span: "board-12",
      spec: {
        version: "1",
        id: "bench-hover",
        type: "bar",
        theme: "soft",
        data: hover,
        encoding: {
          x: "lib",
          y: { field: "ms", scale: { type: "log" } },
        },
        mark: { orientation: "horizontal" },
        axes: { x: { title: "Library" }, y: { title: "Milliseconds" } },
        tooltip: { position: "top", fields: [{ field: "ms", title: "Painted ms" }] },
        interaction: { select: "point" },
        size: { width: 980, height: 380, padding: { left: 72 } },
        a11y: { alt: "At 100,000 points, uPlot’s painted hover is slightly faster than ChartKit’s. ECharts is far slower." },
      },
    },
  ];
}

interface CanvasBenchRow {
  id: string;
  library: string;
  points: number;
  status: string;
  renderMs?: number | null;
  initialMs?: number | null;
  updateMs?: number | null;
  error?: string;
}

/** Canvas line at 10k, 100k, and 1M. Absent until the browser bench writes it. */
function canvasLosses(): { label: string; detail: string }[] {
  const file = join(docsRoot(), "data/canvas-bench.json");
  if (!existsSync(file)) return [];
  const bench = JSON.parse(readFileSync(file, "utf8")) as { rows: CanvasBenchRow[] };
  const losses: { label: string; detail: string }[] = [];
  const metrics: { key: "renderMs" | "initialMs" | "updateMs"; name: string; peers: boolean }[] = [
    { key: "renderMs", name: "render", peers: false },
    { key: "initialMs", name: "first paint", peers: true },
    { key: "updateMs", name: "update", peers: true },
  ];
  for (const points of [10_000, 100_000, 1_000_000]) {
    const label = points >= 1_000_000 ? "1M" : `${points / 1000}k`;
    const rows = bench.rows.filter((row) => row.points === points);
    const canvas = rows.find((row) => row.id === "chartkit-canvas");
    if (!canvas || canvas.status !== "ok") {
      losses.push({
        label: `${label} canvas`,
        detail: `ChartKit canvas ${canvas?.status ?? "missing"}${canvas?.error ? `: ${canvas.error}` : "."}`,
      });
      continue;
    }
    for (const metric of metrics) {
      const mine = canvas[metric.key];
      if (typeof mine !== "number") continue;
      const peers = rows.filter((row) => {
        if (row.status !== "ok" || row.id === "chartkit-canvas" || row.id === "chartkit-full") return false;
        if (!metric.peers && row.id !== "chartkit") return false;
        return typeof row[metric.key] === "number";
      });
      let best: { library: string; value: number } | null = null;
      for (const row of peers) {
        const value = row[metric.key];
        if (typeof value !== "number") continue;
        if (!best || value < best.value) best = { library: row.library, value };
      }
      if (best && mine > best.value) {
        losses.push({
          label: `${label} ${metric.name}`,
          detail: `ChartKit canvas ${mine.toFixed(1)} ms, ${best.library} ${best.value.toFixed(1)} ms.`,
        });
      }
    }
  }
  return losses;
}

export function timingLosses(): { label: string; detail: string }[] {
  const bench = loadBenchmarks();
  const fromRows = bench.browserMs
    .filter((row) => row.chartkit.update > row.uplot.update)
    .map((row) => ({
      label: cellLabel(row.shape, row.points),
      detail: `Aligned update: ChartKit ${row.chartkit.update} ms, uPlot ${row.uplot.update} ms.`,
    }));
  const hoverChartkit = bench.hoverSteady100k.find((row) => row.lib === "ChartKit");
  const hoverUplot = bench.hoverSteady100k.find((row) => row.lib === "uPlot");
  const hover =
    hoverChartkit && hoverUplot && hoverUplot.paintedMs < hoverChartkit.paintedMs
      ? [{ label: "Hover 100k", detail: `Painted median: ChartKit ${hoverChartkit.paintedMs} ms, uPlot ${hoverUplot.paintedMs} ms.` }]
      : [];
  return [...fromRows, ...hover, ...canvasLosses()];
}
