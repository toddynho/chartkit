import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { rivalSwatch } from "./rival-colors";
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
  methodology?: { agents?: string };
  headline: {
    lineGzipBytes: number;
    ssrMeanMs: number;
    repairNoDocs: { first: number; afterRepair: number };
  };
  agents: AgentCell[];
};

type Slot = { kind: "ok"; initial: number; update: number } | { kind: "hollow"; reason: string };

export type BenchLib = { name: string; color: string };
export type BenchDot = { title: string; left: string; size: string; fill: string; ring: string; solid: boolean };
export type BenchRow = { type: string; measured: boolean; note: string; aside: string; summary: string; dots: BenchDot[] };

const LIB_NAMES = ["ChartKit", "uPlot", "Chart.js", "Observable Plot", "Recharts", "ECharts", "Nivo"] as const;
const LIBS: BenchLib[] = LIB_NAMES.map((name) => ({ name, color: rivalSwatch(name).fill }));

const ROW_DEFS: { type: string; chart: string; points: number; note: string; scope: string; aside: string; chartkitOnly: boolean }[] = [
  { type: "line", chart: "line", points: 100_000, note: "100k", scope: "100,000 points, sampling auto", aside: "", chartkitOnly: false },
  { type: "area", chart: "stacked-area", points: 100_000, note: "100k", scope: "stacked area, 100,000 x positions, four series", aside: "", chartkitOnly: false },
  { type: "bar", chart: "bar", points: 48, note: "48", scope: "48 categories", aside: "", chartkitOnly: false },
  { type: "scatter", chart: "scatter", points: 100_000, note: "100k", scope: "100,000 points", aside: "", chartkitOnly: false },
  { type: "donut", chart: "donut", points: 8, note: "8", scope: "8 slices", aside: "", chartkitOnly: false },
  { type: "heatmap", chart: "heatmap", points: 1200, note: "1200", scope: "1,200 cells", aside: "", chartkitOnly: false },
  { type: "spike", chart: "spike", points: 100_000, note: "100k", scope: "100,000 points", aside: "ChartKit only", chartkitOnly: true },
];

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

type PublishedPaintCell = {
  library?: string;
  state?: string;
  initialMs?: number | null;
  updateMs?: number | null;
};

type PublishedPaintRow = {
  chart?: string;
  points?: number;
  sampling?: string;
  cells?: PublishedPaintCell[];
};

function slotForPublished(cell: PublishedPaintCell): Slot {
  if (cell.state === "ok" && typeof cell.initialMs === "number" && typeof cell.updateMs === "number") {
    return { kind: "ok", initial: round2(cell.initialMs), update: round2(cell.updateMs) };
  }
  if (cell.state === "absent") return { kind: "hollow", reason: "no native chart" };
  if (cell.state === "dnf") return { kind: "hollow", reason: "did not finish" };
  return { kind: "hollow", reason: "not measured" };
}

/** Two-frame paint rows from catalog/public/benchmarks.json. Not the round-13 browserMs line. */
function paintRows(): { slots: Record<string, Record<string, Slot>>; measuredOn: string; commit: string | null } {
  const file = JSON.parse(readFileSync(join(repoRoot(), "catalog/public/benchmarks.json"), "utf8")) as {
    paint?: { measuredOn?: string; rows?: PublishedPaintRow[] };
  };
  const rows = file.paint?.rows;
  if (!rows) throw new Error("benchmarks.json is missing the paint matrix");
  const names = new Set(LIBS.map((lib) => lib.name));
  const out: Record<string, Record<string, Slot>> = {};
  for (const spec of ROW_DEFS) {
    const found = rows.find((row) => row.chart === spec.chart && row.points === spec.points && row.sampling === "auto");
    if (!found?.cells) throw new Error(`benchmarks.json paint matrix is missing ${spec.type}`);
    const row: Record<string, Slot> = {};
    for (const cell of found.cells) {
      if (!cell.library || !names.has(cell.library) || row[cell.library]) continue;
      row[cell.library] = slotForPublished(cell);
    }
    if (row.ChartKit?.kind !== "ok") throw new Error(`benchmarks.json paint matrix has no ChartKit time for ${spec.type}`);
    if (spec.chartkitOnly) {
      out[spec.type] = { ChartKit: row.ChartKit };
      continue;
    }
    for (const lib of LIBS) {
      if (!row[lib.name]) row[lib.name] = { kind: "hollow", reason: "not measured" };
    }
    out[spec.type] = row;
  }
  const measuredOn = typeof file.paint?.measuredOn === "string" ? file.paint.measuredOn : "";
  if (!measuredOn) throw new Error("benchmarks.json paint matrix has no measuredOn");
  return { slots: out, measuredOn, commit: null };
}

function solidDot(lib: BenchLib, type: string, scope: string, slot: Extract<Slot, { kind: "ok" }>): BenchDot {
  const us = lib.name === "ChartKit";
  return {
    title: `${lib.name} · ${type} · ${scope} · ${formatMs(slot.initial)} ms initial, ${formatMs(slot.update)} ms update`,
    left: left(slot.initial),
    size: us ? "14px" : "10px",
    fill: lib.color,
    ring: us ? "0 0 0 3px #cfe0fa" : "none",
    solid: true,
  };
}

function joinAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function paintComparison(slots: Record<string, Record<string, Slot>>, metric: "initial" | "update"): { fastest: string[]; slower: string[] } {
  const fastest: string[] = [];
  const slower: string[] = [];
  for (const spec of ROW_DEFS) {
    if (spec.chartkitOnly) continue;
    const row = slots[spec.type];
    const chartkit = row?.ChartKit;
    if (chartkit?.kind !== "ok") throw new Error(`speed claim is missing ChartKit ${spec.type}`);
    const rivals = LIBS.flatMap((lib) => {
      if (lib.name === "ChartKit") return [];
      const slot = row[lib.name];
      if (slot?.kind !== "ok") return [];
      return [{ name: lib.name, ms: slot[metric] }];
    });
    if (rivals.length === 0) continue;
    const best = rivals.reduce((lead, item) => (item.ms < lead.ms ? item : lead));
    const ours = chartkit[metric];
    if (ours < best.ms) fastest.push(spec.type);
    else slower.push(`${spec.type} (${best.name} ${formatMs(best.ms)} ms, ChartKit ${formatMs(ours)} ms)`);
  }
  return { fastest, slower };
}

export function paintClaim(slots: Record<string, Record<string, Slot>>): string {
  const initial = paintComparison(slots, "initial");
  const update = paintComparison(slots, "update");
  const first =
    initial.fastest.length === 0
      ? "ChartKit does not have the lowest first paint on a compared row."
      : `ChartKit has the lowest first paint on ${joinAnd(initial.fastest)}.`;
  const firstSlower = initial.slower.length === 0 ? "" : ` A lower first paint: ${joinAnd(initial.slower)}.`;
  const later =
    update.fastest.length === 0
      ? " ChartKit does not have the lowest update on a compared row."
      : ` ChartKit has the lowest update on ${joinAnd(update.fastest)}.`;
  const laterSlower = update.slower.length === 0 ? "" : ` A lower update: ${joinAnd(update.slower)}.`;
  return `${first}${firstSlower}${later}${laterSlower} Spike has no other library in this plot.`;
}

let lineGzip: number | null = null;

function phase4LineBytes(): number {
  if (lineGzip != null) return lineGzip;
  const script = join(repoRoot(), "scripts/line-bundle.mjs");
  const run = spawnSync(process.execPath, [script, "--phase4"], { encoding: "utf8" });
  if (run.status !== 0) throw new Error(run.stderr || "line gzip measurement failed");
  const parsed = JSON.parse(run.stdout) as { gzipBytes?: number };
  if (typeof parsed.gzipBytes !== "number" || !Number.isInteger(parsed.gzipBytes)) {
    throw new Error("line gzip measurement was not an integer");
  }
  lineGzip = parsed.gzipBytes;
  return lineGzip;
}

function hollowDot(lib: BenchLib, type: string, reason: string): BenchDot {
  return {
    title: `${lib.name} · ${type} · ${reason}`,
    left: "",
    size: "10px",
    fill: lib.color,
    ring: "none",
    solid: false,
  };
}

export function proofFigures() {
  const bench = benchFile();
  const agent = bench.agents.find((row) => row.lib === "ChartKit");
  const note = bench.methodology?.agents ?? "";
  const tasks = Number(note.match(/(\d+) tasks/)?.[1] ?? agent?.officialWithinTwo);
  if (!Number.isInteger(tasks)) throw new Error("benchmarks.json is missing the agent task count");
  const noDocsFirst = agent?.noDocsFirst ?? bench.headline.repairNoDocs.first;
  const officialFirst = agent?.officialFirst;
  if (noDocsFirst == null || officialFirst == null) throw new Error("benchmarks.json is missing the ChartKit agent scores");
  const gzipBytes = phase4LineBytes();
  return {
    round: bench.round,
    measured: bench.measured,
    first: officialFirst,
    officialFirst,
    noDocsFirst,
    tasks,
    repairFrom: bench.headline.repairNoDocs.first,
    repairTo: bench.headline.repairNoDocs.afterRepair,
    agentMeasured: note.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "",
    gzipLabel: `${(gzipBytes / 1000).toFixed(1)} KB (${gzipBytes.toLocaleString("en-US")} bytes)`,
    gzipBytes,
    ssrMs: bench.headline.ssrMeanMs,
  };
}

export function speedPlot(): {
  libs: BenchLib[];
  rows: BenchRow[];
  ticks: { label: string; left: string }[];
  measuredOn: string;
  commit: string | null;
  claim: string;
} {
  const { slots, measuredOn, commit } = paintRows();
  const rows: BenchRow[] = ROW_DEFS.map((spec) => {
    const row = slots[spec.type];
    if (row?.ChartKit?.kind !== "ok") throw new Error(`speed plot is missing ChartKit ${spec.type}`);
    const inOrder = LIBS.flatMap((lib) => {
      const slot = row[lib.name];
      if (!slot) return [];
      return [slot.kind === "ok" ? solidDot(lib, spec.type, spec.scope, slot) : hollowDot(lib, spec.type, slot.reason)];
    });
    const dots = [...inOrder.filter((item) => !item.title.startsWith("ChartKit ·")), ...inOrder.filter((item) => item.title.startsWith("ChartKit ·"))];
    const chartkit = dots.filter((item) => item.title.startsWith("ChartKit ·"));
    if (chartkit.length !== 1 || !chartkit[0]?.solid) throw new Error(`speed plot ChartKit dot is not solid: ${spec.type}`);
    if (spec.chartkitOnly && dots.some((item) => !item.solid)) {
      throw new Error(`speed plot drew a hollow rival on ${spec.type}`);
    }
    for (const item of dots) {
      if (item.solid) {
        if (item.fill === "#fff" || item.left === "") throw new Error(`speed plot left a hollow measured dot: ${item.title}`);
        const at = Number(item.left.replace("%", ""));
        if (!(at >= 0 && at <= 100)) throw new Error(`speed plot dot is off the axis: ${item.title}`);
      } else if (item.left !== "") {
        throw new Error(`speed plot placed an unmeasured dot on the axis: ${item.title}`);
      }
    }
    return {
      type: spec.type,
      measured: true,
      note: spec.note,
      aside: spec.aside,
      summary: inOrder.map((item) => item.title).join(". "),
      dots,
    };
  });
  const ticks = [5, 10, 50, 100, 500, 1000, 5000, 20_000].map((ms) => ({
    label: ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`,
    left: left(ms),
  }));
  return { libs: LIBS, rows, ticks, measuredOn, commit, claim: paintClaim(slots) };
}

const HOME_LIBS: BenchLib[] = LIBS;

const HOME_NOTES: Record<string, string> = {
  line: "100k points",
  area: "100k points",
  bar: "48 categories",
  scatter: "100k points",
  donut: "8 slices",
  heatmap: "1,200 cells",
  spike: "100k · ChartKit only",
};

const HOME_LO = Math.log10(5);
const HOME_HI = Math.log10(30_000);

function homeLeft(ms: number): string {
  const at = ((Math.log10(ms) - HOME_LO) / (HOME_HI - HOME_LO)) * 100;
  if (!(at >= 0 && at <= 100)) throw new Error(`paint dot is off the 5 ms–30 s axis: ${ms}`);
  return `${at}%`;
}

function formatPaintMs(ms: number): string {
  const rounded = round2(ms);
  return rounded.toFixed(2).replace(/0$/, "").replace(/\.0$/, "");
}

export type HomePaintDot = { title: string; left: string; size: string; fill: string; ring: string; lib: string; ms: number };
export type HomePaintRow = { type: string; note: string; ck: string; dots: HomePaintDot[] };

export function homePaint(): {
  libs: { name: string; color: string; ink: string; us: boolean }[];
  rows: HomePaintRow[];
  ticks: { label: string; left: string }[];
  measuredOn: string;
  stat: string;
  statCaption: string;
  lead: string;
} {
  const { slots, measuredOn } = paintRows();
  let wins = 0;
  let compared = 0;
  const presentUnder = new Map<string, { rows: number; over: boolean }>();
  for (const lib of HOME_LIBS) presentUnder.set(lib.name, { rows: 0, over: false });
  const rows: HomePaintRow[] = ROW_DEFS.map((spec) => {
    const row = slots[spec.type];
    const chartkit = row?.ChartKit;
    if (chartkit?.kind !== "ok") throw new Error(`homepage paint is missing ChartKit ${spec.type}`);
    const rivals = HOME_LIBS.flatMap((lib) => {
      if (lib.name === "ChartKit") return [];
      const slot = row[lib.name];
      if (slot?.kind !== "ok") return [];
      return [{ lib, ms: slot.initial }];
    });
    if (!spec.chartkitOnly && rivals.length > 0) {
      compared += 1;
      const best = rivals.reduce((lead, item) => (item.ms < lead.ms ? item : lead));
      if (chartkit.initial < best.ms) wins += 1;
    }
    const dots: HomePaintDot[] = [];
    for (const lib of HOME_LIBS) {
      if (lib.name === "ChartKit") continue;
      const slot = row[lib.name];
      if (slot?.kind !== "ok") continue;
      const state = presentUnder.get(lib.name);
      if (state) {
        state.rows += 1;
        if (slot.initial >= 100) state.over = true;
      }
      dots.push({
        title: `${lib.name} · ${spec.type} · ${formatPaintMs(slot.initial)} ms`,
        left: homeLeft(slot.initial),
        size: "10px",
        fill: lib.color,
        ring: "none",
        lib: lib.name,
        ms: slot.initial,
      });
    }
    const ckState = presentUnder.get("ChartKit");
    if (ckState) {
      ckState.rows += 1;
      if (chartkit.initial >= 100) ckState.over = true;
    }
    dots.push({
      title: `ChartKit · ${spec.type} · ${formatPaintMs(chartkit.initial)} ms`,
      left: homeLeft(chartkit.initial),
      size: "16px",
      fill: "#0a63e6",
      ring: "0 0 0 4px #dbe7fb",
      lib: "ChartKit",
      ms: chartkit.initial,
    });
    const note = HOME_NOTES[spec.type];
    if (!note) throw new Error(`homepage paint is missing a note for ${spec.type}`);
    return { type: spec.type, note, ck: formatPaintMs(chartkit.initial), dots };
  });
  const line = slots.line?.ChartKit;
  if (line?.kind !== "ok") throw new Error("homepage paint is missing the line");
  const lineRivals = HOME_LIBS.flatMap((lib) => {
    if (lib.name === "ChartKit") return [];
    const slot = slots.line?.[lib.name];
    if (slot?.kind !== "ok") return [];
    return [{ name: lib.name, ms: slot.initial }];
  });
  const next = lineRivals.reduce((lead, item) => (item.ms < lead.ms ? item : lead));
  const rowCount = ROW_DEFS.length;
  const onlyUnder = [...presentUnder.entries()].filter(([name, state]) => {
    if (name === "ChartKit") return false;
    return state.rows === rowCount && !state.over;
  });
  const chartkitUnder = presentUnder.get("ChartKit");
  const chartkitStays = chartkitUnder?.rows === rowCount && chartkitUnder.over === false;
  const fiveOfSix = wins === 5 && compared === 6;
  const lead =
    fiveOfSix && chartkitStays && onlyUnder.length === 0
      ? "First paint by chart type against six libraries. ChartKit is fastest on five of six, and the only one that stays under 100 ms on every row."
      : `First paint by chart type against six libraries. ChartKit is fastest on ${wins} of ${compared}.${chartkitStays ? " ChartKit stays under 100 ms on every row." : ""}`;
  const ticks = [5, 10, 50, 100, 500, 1000, 5000, 20_000].map((ms) => ({
    label: ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`,
    left: homeLeft(ms),
  }));
  return {
    libs: HOME_LIBS.map((lib) => {
      const swatch = rivalSwatch(lib.name);
      return { name: lib.name, color: swatch.fill, ink: swatch.ink, us: lib.name === "ChartKit" };
    }),
    rows,
    ticks,
    measuredOn,
    stat: formatPaintMs(line.initial),
    statCaption: `Next library, ${next.name}: ${formatPaintMs(next.ms)} ms.`,
    lead,
  };
}
