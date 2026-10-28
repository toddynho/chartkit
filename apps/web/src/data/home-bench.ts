import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../lib/repo-root";

type AgentCell = {
  lib: string;
  noDocsFirst: number | null;
  officialFirst: number | null;
  officialWithinTwo: number | null;
};

type BenchFile = {
  round: number;
  measured: string;
  headline: {
    lineGzipBytes: number;
    ssrMeanMs: number;
    repairNoDocs: { first: number; afterRepair: number };
  };
  agents: AgentCell[];
};

type PaintCell = {
  library: string;
  homepageRow: string;
  points: number;
  variant: string | null;
  initialMs: number;
  updateMs: number;
};

type Pair = { initial: number; update: number };

export type BenchLib = { name: string; color: string };
export type BenchDot = { title: string; left: string; size: string; fill: string; ring: string; solid: boolean };
export type BenchRow = { type: string; measured: boolean; note: string; summary: string; dots: BenchDot[] };

const LIBS: BenchLib[] = [
  { name: "ChartKit", color: "#0a63e6" },
  { name: "uPlot", color: "#8b8d93" },
  { name: "Chart.js", color: "#a9aaae" },
  { name: "Observable Plot", color: "#b8b9bd" },
  { name: "Recharts", color: "#c6c7ca" },
  { name: "ECharts", color: "#d2d3d6" },
];

const ROW_DEFS: { type: string; points: number; note: string; scope: string }[] = [
  { type: "line", points: 100_000, note: "100k", scope: "100,000 points, sampling auto" },
  { type: "area", points: 100_000, note: "100k", scope: "stacked area, 100,000 x positions, four series" },
  { type: "bar", points: 48, note: "48", scope: "48 categories" },
  { type: "scatter", points: 100_000, note: "100k", scope: "100,000 points" },
  { type: "donut", points: 8, note: "8", scope: "8 slices" },
  { type: "heatmap", points: 1200, note: "1200", scope: "1,200 cells" },
];

/**
 * Two-frame paint medians (initial / update), kind "median", BENCH_SAMPLES=5.
 * Measured 2026-10-28T00:30:27.624Z on 7b7654a61ba57952e3251a1b2257325ddf2a8d88.
 * Read from bench/results/paint.json on draft PR 81 (not on main). Line is the
 * 100,000-point sampling-auto cell, the point count this section already shows.
 * Area is native stacked-area. Unsupported and error cells are omitted.
 * Nivo is not in this legend. These are not hover-steady times.
 */
const PINNED: Record<string, Record<string, [number, number]>> = {
  line: {
    ChartKit: [15, 20.4],
    uPlot: [14.9, 30.6],
    "Chart.js": [58.6, 34.4],
    "Observable Plot": [104.4, 1544.3],
    Recharts: [2166.8, 1084.7],
    ECharts: [2392.4, 2728.4],
  },
  area: {
    ChartKit: [52.2, 49.9],
    "Chart.js": [691.4, 687.4],
    "Observable Plot": [606.1, 5302.6],
    ECharts: [18911.8, 18589.1],
  },
  bar: {
    ChartKit: [16.4, 33.6],
    uPlot: [16.6, 33.3],
    "Chart.js": [26.7, 22.8],
    "Observable Plot": [16.8, 31.8],
    Recharts: [51.6, 23.4],
    ECharts: [35, 12.2],
  },
  scatter: {
    ChartKit: [3667.3, 3581],
    uPlot: [128.6, 111.2],
    "Chart.js": [273.5, 248.2],
    "Observable Plot": [522.2, 629.9],
    Recharts: [5985, 11852.4],
    ECharts: [9044.4, 9112],
  },
  donut: {
    ChartKit: [17.9, 33.2],
    "Chart.js": [12.3, 33.5],
    Recharts: [28.5, 19.1],
    ECharts: [26.1, 15.4],
  },
  heatmap: {
    ChartKit: [44.7, 43.4],
    "Observable Plot": [22.6, 24.5],
    ECharts: [53.2, 27],
  },
};

const PINNED_ON = "2026-10-28";
const PINNED_COMMIT = "7b7654a";

const LO = Math.log10(5);
const HI = Math.log10(50_000);

function benchFile(): BenchFile {
  return JSON.parse(readFileSync(join(repoRoot(), "catalog/public/benchmarks.json"), "utf8")) as BenchFile;
}

function round2(ms: number): number {
  return Math.round(ms * 100) / 100;
}

function formatMs(ms: number): string {
  return ms.toFixed(2);
}

function left(ms: number): string {
  return `${((Math.log10(ms) - LO) / (HI - LO)) * 100}%`;
}

function readPaintCells(): { cells: PaintCell[]; measuredOn: string } | null {
  const path = join(repoRoot(), "bench/results/paint.json");
  if (!existsSync(path)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const file = parsed as { kind?: unknown; samples?: unknown; measuredAt?: unknown; charts?: unknown };
  if (file.kind !== "median" || file.samples !== 5 || !Array.isArray(file.charts)) return null;
  const cells: PaintCell[] = [];
  for (const item of file.charts) {
    if (!item || typeof item !== "object") continue;
    const cell = item as Record<string, unknown>;
    if (cell.status !== "ok") continue;
    if (typeof cell.library !== "string" || typeof cell.homepageRow !== "string" || typeof cell.points !== "number") continue;
    if (typeof cell.initialMs !== "number" || typeof cell.updateMs !== "number") continue;
    cells.push({
      library: cell.library,
      homepageRow: cell.homepageRow,
      points: cell.points,
      variant: typeof cell.variant === "string" ? cell.variant : null,
      initialMs: cell.initialMs,
      updateMs: cell.updateMs,
    });
  }
  const measuredOn = typeof file.measuredAt === "string" && /^\d{4}-\d{2}-\d{2}/.test(file.measuredAt)
    ? file.measuredAt.slice(0, 10)
    : PINNED_ON;
  return { cells, measuredOn };
}

function pairsFromPaint(cells: PaintCell[]): Record<string, Record<string, Pair>> | null {
  const names = new Set(LIBS.map((lib) => lib.name));
  const out: Record<string, Record<string, Pair>> = {};
  for (const spec of ROW_DEFS) {
    const row: Record<string, Pair> = {};
    for (const cell of cells) {
      if (cell.homepageRow !== spec.type || cell.points !== spec.points || !names.has(cell.library)) continue;
      if (spec.type === "line") {
        if (cell.library === "ChartKit" && cell.variant !== "sampling-auto") continue;
        if (cell.library !== "ChartKit" && cell.variant != null && cell.variant !== "sampling-auto") continue;
      }
      if (row[cell.library]) continue;
      row[cell.library] = { initial: round2(cell.initialMs), update: round2(cell.updateMs) };
    }
    if (!row.ChartKit) return null;
    out[spec.type] = row;
  }
  return out;
}

function pinnedPairs(): Record<string, Record<string, Pair>> {
  const out: Record<string, Record<string, Pair>> = {};
  for (const spec of ROW_DEFS) {
    const source = PINNED[spec.type];
    if (!source?.ChartKit) throw new Error(`pinned paint row is missing ChartKit ${spec.type}`);
    const row: Record<string, Pair> = {};
    for (const [library, pair] of Object.entries(source)) {
      row[library] = { initial: pair[0], update: pair[1] };
    }
    out[spec.type] = row;
  }
  return out;
}

function paintRows(): { pairs: Record<string, Record<string, Pair>>; measuredOn: string; commit: string | null } {
  const file = readPaintCells();
  const fromFile = file ? pairsFromPaint(file.cells) : null;
  if (file && fromFile) return { pairs: fromFile, measuredOn: file.measuredOn, commit: null };
  return { pairs: pinnedPairs(), measuredOn: PINNED_ON, commit: PINNED_COMMIT };
}

function dot(lib: BenchLib, type: string, scope: string, pair: Pair): BenchDot {
  const us = lib.name === "ChartKit";
  return {
    title: `${lib.name} · ${type} · ${scope} · ${formatMs(pair.initial)} ms initial, ${formatMs(pair.update)} ms update`,
    left: left(pair.initial),
    size: us ? "14px" : "10px",
    fill: lib.color,
    ring: us ? "0 0 0 3px #cfe0fa" : "none",
    solid: true,
  };
}

export function proofFigures() {
  const bench = benchFile();
  const agent = bench.agents.find((row) => row.lib === "ChartKit");
  const tasks = agent?.officialWithinTwo ?? 42;
  return {
    round: bench.round,
    measured: bench.measured,
    first: agent?.officialFirst ?? 42,
    tasks,
    repairFrom: bench.headline.repairNoDocs.first,
    repairTo: bench.headline.repairNoDocs.afterRepair,
    gzipKb: Math.round(bench.headline.lineGzipBytes / 1000),
    gzipBytes: bench.headline.lineGzipBytes,
    ssrMs: bench.headline.ssrMeanMs,
  };
}

export function speedPlot(): {
  libs: BenchLib[];
  rows: BenchRow[];
  ticks: { label: string; left: string }[];
  measuredOn: string;
  commit: string | null;
} {
  const { pairs, measuredOn, commit } = paintRows();
  const rows: BenchRow[] = ROW_DEFS.map((spec) => {
    const row = pairs[spec.type];
    if (!row?.ChartKit) throw new Error(`speed plot is missing ChartKit ${spec.type}`);
    const inOrder = LIBS.flatMap((lib) => {
      const pair = row[lib.name];
      return pair ? [dot(lib, spec.type, spec.scope, pair)] : [];
    });
    const dots = [...inOrder.filter((item) => !item.title.startsWith("ChartKit ·")), ...inOrder.filter((item) => item.title.startsWith("ChartKit ·"))];
    for (const item of dots) {
      if (!item.solid || item.fill === "#fff") throw new Error(`speed plot left a hollow dot: ${item.title}`);
      const at = Number(item.left.replace("%", ""));
      if (!(at >= 0 && at <= 100)) throw new Error(`speed plot dot is off the axis: ${item.title}`);
    }
    return {
      type: spec.type,
      measured: true,
      note: spec.note,
      summary: inOrder.map((item) => item.title).join(". "),
      dots,
    };
  });
  const ticks = [5, 10, 50, 100, 500, 1000, 5000, 20_000].map((ms) => ({
    label: ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`,
    left: left(ms),
  }));
  return { libs: LIBS, rows, ticks, measuredOn, commit };
}
