import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../lib/repo-root";

type HoverCell = { lib: string; paintedMs: number };
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
  hoverSteady100k: HoverCell[];
  agents: AgentCell[];
};

export type BenchLib = { name: string; color: string };
export type BenchDot = { title: string; left: string; size: string; fill: string; ring: string; solid: boolean };
export type BenchRow = { type: string; measured: boolean; note: string; dots: BenchDot[] };

const LIBS: BenchLib[] = [
  { name: "ChartKit", color: "#0a63e6" },
  { name: "uPlot", color: "#8b8d93" },
  { name: "Chart.js", color: "#a9aaae" },
  { name: "Observable Plot", color: "#b8b9bd" },
  { name: "Recharts", color: "#c6c7ca" },
  { name: "ECharts", color: "#d2d3d6" },
];

/**
 * Unmeasured rows keep the handoff's hollow placement so the axis is readable.
 * They are not timings. A null means that library has no dot on the row.
 */
const PENDING: { type: string; ms: (number | null)[] }[] = [
  { type: "area", ms: [17.1, 19, 22.8, 30.1, 31.4, 2902] },
  { type: "bar", ms: [14.2, null, 19.6, 26.4, 27.8, 2410] },
  { type: "scatter", ms: [15.8, 17.4, 21.9, 29.6, 33.2, 3105] },
  { type: "donut", ms: [9.4, null, 12.1, 18.7, 21.3, 640] },
  { type: "heatmap", ms: [21.6, null, null, 41.2, null, 1890] },
];

const LO = Math.log10(5);
const HI = Math.log10(5000);

function benchFile(): BenchFile {
  return JSON.parse(readFileSync(join(repoRoot(), "catalog/public/benchmarks.json"), "utf8")) as BenchFile;
}

function left(ms: number): string {
  return `${((Math.log10(ms) - LO) / (HI - LO)) * 100}%`;
}

function dot(lib: BenchLib, type: string, ms: number, solid: boolean, index: number): BenchDot {
  return {
    title: solid ? `${lib.name} · ${type} · ${ms} ms` : `${lib.name} · ${type} · not measured`,
    left: left(ms),
    size: index === 0 ? "14px" : "10px",
    fill: solid ? lib.color : "#fff",
    ring: solid ? (index === 0 ? "0 0 0 3px #cfe0fa" : "none") : `inset 0 0 0 2px ${lib.color}`,
    solid,
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

export function speedPlot(): { libs: BenchLib[]; rows: BenchRow[]; ticks: { label: string; left: string }[] } {
  const bench = benchFile();
  const byName = new Map(bench.hoverSteady100k.map((row) => [row.lib, row.paintedMs]));
  const line = LIBS.map((lib) => byName.get(lib.name) ?? null);
  if (line.some((ms) => ms == null)) {
    throw new Error("benchmarks.json is missing a published line hover time");
  }
  const rows: BenchRow[] = [
    {
      type: "line",
      measured: true,
      note: "",
      dots: line.map((ms, index) => dot(LIBS[index], "line", ms as number, true, index)),
    },
    ...PENDING.map((row) => ({
      type: row.type,
      measured: false,
      note: "pending",
      dots: row.ms.flatMap((ms, index) => (ms == null ? [] : [dot(LIBS[index], row.type, ms, false, index)])),
    })),
  ];
  const ticks = [5, 10, 50, 100, 500, 1000, 5000].map((ms) => ({
    label: ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`,
    left: left(ms),
  }));
  return { libs: LIBS, rows, ticks };
}
