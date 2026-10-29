/**
 * Chart-type paint matrix from bench/results/paint.json.
 * One row per gallery type, plus sampling-none rows for the dense line.
 * Cells are the measured median. Nothing here is a hover-steady time.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chartTypes } from "../../apps/web/src/data/chart-types.ts";

type RawCell = {
  chart: string;
  library: string;
  variant: string | null;
  points: number;
  status: string;
  initialMs: number | null;
  updateMs: number | null;
  error: string | null;
};

export type PaintState = "ok" | "dnf" | "na" | "absent";

export type PaintMatrixCell = {
  library: string;
  state: PaintState;
  initialMs: number | null;
  updateMs: number | null;
  text: string;
  title: string;
};

export type PaintMatrixRow = {
  chart: string;
  label: string;
  points: number;
  pointsLabel: string;
  sampling: string;
  cells: PaintMatrixCell[];
};

export type PaintMatrix = {
  measuredAt: string;
  measuredOn: string;
  samples: number;
  width: number;
  height: number;
  phase3MeasuredAt: string | null;
  libraries: string[];
  rows: PaintMatrixRow[];
  caption: string;
  notes: string[];
  missingChartKit: string[];
};

const SKIP_LIBRARY = new Set(["ChartKit canvas", "ChartKit sampling none"]);

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

function round1(ms: number): number {
  return Math.round(ms * 10) / 10;
}

function formatMs(ms: number): string {
  return round1(ms).toFixed(1);
}

function pointsLabel(points: number): string {
  return points.toLocaleString("en-US");
}

function titleFor(library: string, label: string, points: number, state: PaintState, initial: number | null, update: number | null, error: string | null): string {
  const where = `${library}, ${label}, ${pointsLabel(points)} points`;
  if (state === "ok" && initial != null && update != null) {
    return `${where}, ${formatMs(initial)} ms initial, ${formatMs(update)} ms update`;
  }
  if (state === "dnf") return `${where}, did not finish${error ? `. ${error}` : ""}`;
  if (state === "na") return `${where}, no native chart`;
  return `${where}, not in this run`;
}

function stateOf(status: string): PaintState {
  if (status === "ok") return "ok";
  if (status === "unsupported" || status === "skipped") return "na";
  if (status === "error" || status === "timeout" || status === "blocked") return "dnf";
  return "absent";
}

function textFor(state: PaintState, initial: number | null, update: number | null): string {
  if (state === "ok" && initial != null && update != null) return `${formatMs(initial)} / ${formatMs(update)}`;
  if (state === "dnf") return "DNF";
  if (state === "na") return "N/A";
  return "—";
}

function readPaint(): { measuredAt: string; samples: number; disclaimer: string; libraries: string[]; charts: RawCell[] } {
  const file = JSON.parse(readFileSync(join(repoRoot(), "bench/results/paint.json"), "utf8")) as {
    kind?: unknown;
    samples?: unknown;
    measuredAt?: unknown;
    disclaimer?: unknown;
    paintSchema?: { librariesThisPhase?: unknown };
    charts?: unknown;
  };
  if (file.kind !== "median" || file.samples !== 5 || !Array.isArray(file.charts)) {
    throw new Error("bench/results/paint.json is not a 5-sample median");
  }
  const libraries = Array.isArray(file.paintSchema?.librariesThisPhase)
    ? file.paintSchema.librariesThisPhase.filter((name): name is string => typeof name === "string" && !SKIP_LIBRARY.has(name))
    : [];
  const charts: RawCell[] = [];
  for (const item of file.charts) {
    if (!item || typeof item !== "object") continue;
    const cell = item as Record<string, unknown>;
    if (typeof cell.chart !== "string" || typeof cell.library !== "string" || typeof cell.points !== "number") continue;
    if (typeof cell.status !== "string") continue;
    charts.push({
      chart: cell.chart,
      library: cell.library,
      variant: typeof cell.variant === "string" ? cell.variant : null,
      points: cell.points,
      status: cell.status,
      initialMs: typeof cell.initialMs === "number" ? cell.initialMs : null,
      updateMs: typeof cell.updateMs === "number" ? cell.updateMs : null,
      error: typeof cell.error === "string" ? cell.error : null,
    });
  }
  return {
    measuredAt: typeof file.measuredAt === "string" ? file.measuredAt : "",
    samples: 5,
    disclaimer: typeof file.disclaimer === "string" ? file.disclaimer : "",
    libraries,
    charts,
  };
}

function canonicalPoints(chart: string, cells: RawCell[]): number {
  if (chart === "line") return 100_000;
  const rivals = cells.filter((cell) => cell.library !== "ChartKit" && !SKIP_LIBRARY.has(cell.library));
  const pool = rivals.length ? rivals : cells.filter((cell) => cell.library === "ChartKit");
  const counts = new Map<number, number>();
  for (const cell of pool) counts.set(cell.points, (counts.get(cell.points) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const best = ranked[0];
  if (!best) throw new Error(`paint matrix has no points for ${chart}`);
  return best[0];
}

function findCell(cells: RawCell[], chart: string, library: string, points: number, sampling: "auto" | "none"): RawCell | null {
  if (sampling === "none") {
    if (library !== "ChartKit") {
      return cells.find((cell) => cell.chart === chart && cell.library === library && cell.points === points && cell.variant === "sampling-none") ?? null;
    }
    return (
      cells.find((cell) => cell.chart === chart && cell.library === "ChartKit sampling none" && cell.points === points && cell.variant === "sampling-none") ?? null
    );
  }
  if (library === "ChartKit" && chart === "line") {
    return cells.find((cell) => cell.chart === chart && cell.library === "ChartKit" && cell.points === points && cell.variant === "sampling-auto") ?? null;
  }
  return cells.find((cell) => cell.chart === chart && cell.library === library && cell.points === points && cell.variant == null) ?? null;
}

function viewCell(cells: RawCell[], chart: string, label: string, library: string, points: number, sampling: "auto" | "none"): PaintMatrixCell {
  const found = findCell(cells, chart, library, points, sampling);
  if (!found) {
    return { library, state: "absent", initialMs: null, updateMs: null, text: "—", title: titleFor(library, label, points, "absent", null, null, null) };
  }
  const state = stateOf(found.status);
  const initial = state === "ok" ? found.initialMs : null;
  const update = state === "ok" ? found.updateMs : null;
  if (state === "ok" && (initial == null || update == null)) {
    return { library, state: "dnf", initialMs: null, updateMs: null, text: "DNF", title: titleFor(library, label, points, "dnf", null, null, "missing time") };
  }
  return {
    library,
    state,
    initialMs: initial == null ? null : round1(initial),
    updateMs: update == null ? null : round1(update),
    text: textFor(state, initial, update),
    title: titleFor(library, label, points, state, initial, update, found.error),
  };
}

function row(cells: RawCell[], libraries: string[], chart: string, label: string, points: number, sampling: "auto" | "none"): PaintMatrixRow {
  return {
    chart,
    label,
    points,
    pointsLabel: pointsLabel(points),
    sampling,
    cells: libraries.map((library) => viewCell(cells, chart, label, library, points, sampling)),
  };
}

export function paintMatrix(): PaintMatrix {
  const file = readPaint();
  const libraries = file.libraries.length ? file.libraries : [...new Set(file.charts.map((cell) => cell.library))].filter((name) => !SKIP_LIBRARY.has(name));
  if (!libraries.includes("ChartKit")) throw new Error("paint matrix is missing ChartKit");
  const titles = new Map(chartTypes.map((item) => [item.type, item.title]));
  const order = chartTypes.map((item) => item.type);
  for (const cell of file.charts) {
    if (!order.includes(cell.chart)) order.push(cell.chart);
  }
  const missingChartKit: string[] = [];
  const rows: PaintMatrixRow[] = [];
  for (const chart of order) {
    const mine = file.charts.filter((cell) => cell.chart === chart);
    if (!mine.length) {
      missingChartKit.push(chart);
      continue;
    }
    const points = canonicalPoints(chart, mine);
    const label = titles.get(chart) ?? chart;
    const chartkit = viewCell(mine, chart, label, "ChartKit", points, chart === "line" ? "auto" : "auto");
    if (chartkit.state !== "ok") {
      missingChartKit.push(chart);
      continue;
    }
    rows.push(row(mine, libraries, chart, label, points, "auto"));
    if (chart === "line") {
      for (const dense of [100_000, 1_000_000]) {
        const none = findCell(file.charts, "line", "ChartKit", dense, "none");
        if (!none || none.status !== "ok") continue;
        rows.push(row(file.charts, libraries, "line", "Line, sampling none", dense, "none"));
      }
    }
  }
  const measuredOn = /^\d{4}-\d{2}-\d{2}/.test(file.measuredAt) ? file.measuredAt.slice(0, 10) : "";
  const phase3 = /Phase 3 rival cells stay from (\d{4}-\d{2}-\d{2})/.exec(file.disclaimer)?.[1] ?? null;
  const candle = file.charts.find((cell) => cell.chart === "candlestick" && cell.library === "ChartKit" && cell.points === 2000 && cell.status === "ok");
  const notes: string[] = [];
  if (candle && candle.initialMs != null && candle.updateMs != null) {
    notes.push(
      `Candlestick in the table is 100,000 candles, the size the other libraries were timed at. ChartKit also finished 2,000 candles at ${formatMs(candle.initialMs)} ms initial and ${formatMs(candle.updateMs)} ms update.`,
    );
  }
  notes.push("Other line sizes (1,000, 10,000, and the 1,000,000-point sampling-auto cell) and the canvas line stay in paint.json. They are not extra rows here. Bundle size and server render are not in this matrix.");
  const phase3Clause = phase3 ? ` Phase 3 rival cells in the same file stay from ${phase3}.` : "";
  const caption = `Two-rAF completion, animation and tooltips off, sampling auto. Median of ${file.samples} at 640×360. Run date ${measuredOn}.${phase3Clause} A cell is initial ms / update ms. DNF means the run errored or timed out. N/A means that library has no native chart of that type. An em dash means this run did not include that cell. Spike is ChartKit only; every rival is N/A. The line row is sampling auto at 100,000 points. The sampling-none rows are the dense line, ChartKit only. This is not a hover-steady time.`;
  return {
    measuredAt: file.measuredAt,
    measuredOn,
    samples: file.samples,
    width: 640,
    height: 360,
    phase3MeasuredAt: phase3,
    libraries,
    rows,
    caption,
    notes,
    missingChartKit,
  };
}
