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
  // The method sentence is written once for both files, so they must be the same build, run count and uPlot.
  if (main.commit !== early.commit || main.runs !== early.runs || main.moves !== early.moves || main.uplot.version !== early.uplot.version || main.machine.cpu !== early.machine.cpu) {
    throw new Error("hover.json and hover-50ms.json are not from the same commit, run count, uPlot version and machine. Re-run both.");
  }
  const steadyRow = (file: File) => {
    const rows = pair(file, `hover at ${file.delayMs} ms`);
    return [
      { lib: "ChartKit", handlerMs: rows.chartkit.steadyHandler.median, paintedMs: rows.chartkit.steadyPainted.median, p95Ms: rows.chartkit.steadyPainted.p95 },
      { lib: "uPlot", handlerMs: rows.uplot.steadyHandler.median, paintedMs: rows.uplot.steadyPainted.median, p95Ms: rows.uplot.steadyPainted.p95 },
    ];
  };
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
    // The two files must come from the same machine (checked above). Its name is not published.
    machine: "one machine",
    uplotVersion: main.uplot.version,
    uplotSetup: main.uplot.setup,
    protocol: main.method,
    /** Steady moves from hover.json, the run the tables show. */
    steady: steadyRow(main),
    /** The same steady moves from hover-50ms.json: a second run to read the first against. */
    steadyOther: steadyRow(early),
    first,
  };
}
