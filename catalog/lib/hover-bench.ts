/**
 * Hover timings from bench/results/hover.json and bench/results/hover-50ms.json,
 * the output of bench/browser/hover.mjs. Nothing here is entered by hand.
 * Both files are the 100,000-point line. One waits 200 ms after mount before the first move, the other 50 ms.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Stat = { median: number; p95: number };
type Row = {
  lib: string;
  case: string;
  firstHandler: Stat;
  firstPainted: Stat;
  steadyHandler: Stat;
  steadyPainted: Stat;
};
type File = {
  measured: string;
  commit: string;
  machine: { cpu: string; platform: string };
  uplot: { version: string; setup: string } | null;
  method: string;
  runs: number;
  moves: number;
  delayMs: number;
  rows: Row[];
};

const CASE = "line-100k";

function load(name: string): File {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  return JSON.parse(readFileSync(join(root, "bench/results", name), "utf8")) as File;
}

function pair(file: File, name: string): { chartkit: Row; uplot: Row } {
  const chartkit = file.rows.find((row) => row.lib === "chartkit" && row.case === CASE);
  const uplot = file.rows.find((row) => row.lib === "uplot" && row.case === CASE);
  if (!chartkit || !uplot) throw new Error(`${name} has no ${CASE} row for ChartKit and uPlot. Run bench/browser/hover.mjs with --uplot.`);
  return { chartkit, uplot };
}

export function hoverBench() {
  const main = load("hover.json");
  const early = load("hover-50ms.json");
  if (!main.uplot || !early.uplot) throw new Error("the hover run has no uPlot rows");
  const steady = pair(main, "hover.json");
  const first = [early, main]
    .map((file) => {
      const rows = pair(file, `hover at ${file.delayMs} ms`);
      return {
        afterMountMs: file.delayMs,
        chartkit: rows.chartkit.firstPainted.median,
        chartkitP95: rows.chartkit.firstPainted.p95,
        chartkitHandler: rows.chartkit.firstHandler.median,
        uplot: rows.uplot.firstPainted.median,
        uplotP95: rows.uplot.firstPainted.p95,
        uplotHandler: rows.uplot.firstHandler.median,
      };
    })
    .sort((a, b) => a.afterMountMs - b.afterMountMs);
  return {
    measured: main.measured,
    commit: main.commit,
    runs: main.runs,
    moves: main.moves,
    case: CASE,
    source: ["bench/results/hover.json", "bench/results/hover-50ms.json"],
    script: "bench/browser/hover.mjs",
    machine: `${main.machine.cpu}, ${main.machine.platform}`,
    uplotVersion: main.uplot.version,
    uplotSetup: main.uplot.setup,
    protocol: main.method,
    steady: [
      { lib: "ChartKit", handlerMs: steady.chartkit.steadyHandler.median, paintedMs: steady.chartkit.steadyPainted.median, p95Ms: steady.chartkit.steadyPainted.p95 },
      { lib: "uPlot", handlerMs: steady.uplot.steadyHandler.median, paintedMs: steady.uplot.steadyPainted.median, p95Ms: steady.uplot.steadyPainted.p95 },
    ],
    first,
  };
}
