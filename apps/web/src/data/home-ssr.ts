import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../lib/repo-root";

type SsrCell = { library?: string; chart?: string; points?: number; status?: string; medianMs?: number | null };
type SsrFile = { measuredAt?: string; cells?: SsrCell[] };

/**
 * Rows for the homepage server-render section, read from bench/results/ssr.json.
 * Small categorical charts only. The dense line rows are sampled, so they stay out.
 */
const ROWS = [
  { chart: "bar", points: 48, note: "48 bars" },
  { chart: "pie", points: 8, note: "8 slices" },
  { chart: "donut", points: 8, note: "8 slices" },
  { chart: "radar", points: 8, note: "8 axes" },
  { chart: "treemap", points: 48, note: "48 tiles" },
] as const;

const NAMED = ["ECharts", "Observable Plot", "Vega-Lite"] as const;

export type HomeSsrDot = { library: string; ms: number };
export type HomeSsrRow = { type: string; note: string; dots: HomeSsrDot[] };

function ms(value: number): string {
  return value.toFixed(2);
}

export function homeSsr(): {
  rows: HomeSsrRow[];
  libraries: string[];
  stat: string;
  lead: string;
  statCaption: string;
  measuredOn: string;
} {
  const file = JSON.parse(readFileSync(join(repoRoot(), "bench/results/ssr.json"), "utf8")) as SsrFile;
  const cells = file.cells ?? [];
  const libraries: string[] = ["ChartKit"];
  const rows = ROWS.map((row) => {
    const dots: HomeSsrDot[] = [];
    for (const cell of cells) {
      if (cell.chart !== row.chart || cell.points !== row.points || cell.status !== "ok" || typeof cell.medianMs !== "number" || !cell.library) continue;
      const library = cell.library === "ChartKit minimal" ? "ChartKit" : cell.library;
      if (library.startsWith("ChartKit") && library !== "ChartKit") continue;
      if (!libraries.includes(library)) libraries.push(library);
      dots.push({ library, ms: cell.medianMs });
    }
    const chartkit = dots.find((dot) => dot.library === "ChartKit");
    if (!chartkit) throw new Error(`ssr.json has no ChartKit time for ${row.chart}`);
    const faster = dots.find((dot) => dot.library !== "ChartKit" && dot.ms <= chartkit.ms);
    if (faster) throw new Error(`ssr.json: ${faster.library} is not slower than ChartKit on ${row.chart}. Rewrite the homepage server section.`);
    return { type: row.chart, note: row.note, dots: [chartkit, ...dots.filter((dot) => dot !== chartkit)] };
  });
  const bar = rows[0]!;
  const at = (library: string): number => {
    const dot = bar.dots.find((item) => item.library === library);
    if (!dot) throw new Error(`ssr.json has no ${library} time for the bar row`);
    return dot.ms;
  };
  const named = NAMED.map((library) => ({ library, ms: at(library) })).sort((a, b) => a.ms - b.ms);
  const rivals = bar.dots.filter((dot) => dot.library !== "ChartKit");
  const next = rivals.reduce((lead, dot) => (dot.ms < lead.ms ? dot : lead));
  const measuredOn = (file.measuredAt ?? "").slice(0, 10);
  if (!measuredOn) throw new Error("ssr.json has no measuredAt");
  const [first, second, third] = named;
  return {
    rows,
    libraries,
    stat: ms(at("ChartKit")),
    lead: `render() returns an SVG string in Node. There is no browser, no canvas and no DOM. A 48-bar chart takes ${ms(at("ChartKit"))} ms. ${first!.library} takes ${ms(first!.ms)} ms, ${second!.library} ${ms(second!.ms)} ms and ${third!.library} ${ms(third!.ms)} ms.`,
    statCaption: `Next library, ${next.library}: ${ms(next.ms)} ms.`,
    measuredOn,
  };
}
