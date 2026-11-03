import { csvEscape } from "./race-data";
import type { OddsReplayOptions } from "./odds";

/**
 * Illustrative series. The shape is a two-outcome market: the prices are
 * complementary and they move in steps. They are not a record of any match,
 * election, or exchange.
 */

function iso(start: number, minutes: number): string {
  return new Date(start + minutes * 60_000).toISOString().replace(".000Z", "Z");
}

function table(start: number, points: Array<[number, number]>, names: [string, string]): Array<Record<string, string | number>> {
  return points.map(([minute, first]) => ({
    time: iso(start, minute),
    [names[0]]: first,
    [names[1]]: Math.round((100 - first) * 10) / 10,
  }));
}

function csvOf(rows: Array<Record<string, string | number>>, names: [string, string]): string {
  const header = ["time", ...names].join(",");
  const lines = rows.map((row) => ["time", ...names].map((field) => csvEscape(String(row[field] ?? ""))).join(","));
  return [header, ...lines].join("\n");
}

/** Intraday match. One price climbs and breaks; the other is the complement. */
const MATCH: Array<[number, number]> = [
  [0, 36],
  [7, 38],
  [16, 56],
  [24, 62],
  [36, 67],
  [48, 71],
  [58, 69],
  [66, 63],
  [74, 45],
  [82, 40],
  [90, 43],
  [98, 51],
  [106, 49],
  [112, 54],
  [116, 54],
];

/** A week of daily steps. The lead changes near the end, inside a narrow band. */
const ELECTION: Array<[number, number]> = [
  [0, 58],
  [10, 57],
  [22, 57.5],
  [36, 55],
  [52, 54],
  [70, 53],
  [90, 55],
  [110, 56],
  [128, 52],
  [146, 49],
  [160, 47],
  [176, 48],
  [196, 46],
  [216, 46],
];

const matchNames = ["Alder", "Marin"] as [string, string];
const electionNames = ["Crimson", "Cobalt"] as [string, string];

export function matchOddsReplay(): OddsReplayOptions {
  const start = Date.parse("2026-06-12T08:10:00Z");
  return {
    title: "Alder vs Marin",
    subtitle: "Illustrative win probability over one match. Not a live market.",
    theme: "light",
    legend: false,
    scale: "fit",
    x: "time",
    duration: 8000,
    fps: 30,
    width: 1280,
    height: 720,
    series: [
      { name: "Alder", field: "Alder", color: "#1c1e21" },
      { name: "Marin", field: "Marin", color: "#1aa36a" },
    ],
    data: table(start, MATCH, matchNames),
  };
}

export function electionOddsReplay(): OddsReplayOptions {
  const start = Date.parse("2026-10-25T12:00:00Z");
  return {
    title: "State election winner",
    subtitle: "Illustrative prices over one week. Not a forecast.",
    theme: "dark",
    legend: true,
    scale: "fit",
    x: "time",
    duration: 8000,
    fps: 30,
    width: 1280,
    height: 720,
    series: [
      { name: "Crimson", field: "Crimson", color: "#f07167" },
      { name: "Cobalt", field: "Cobalt", color: "#5aa2ff" },
    ],
    data: table(start, ELECTION.map(([hour, price]) => [hour * 40, price]), electionNames),
  };
}

export function matchOddsCsv(): string {
  return csvOf(matchOddsReplay().data as Array<Record<string, string | number>>, matchNames);
}

export function electionOddsCsv(): string {
  return csvOf(electionOddsReplay().data as Array<Record<string, string | number>>, electionNames);
}
