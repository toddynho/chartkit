import { csvEscape, type LineRaceOptions } from "./race-data";

/**
 * Illustrative monthly series shaped like a lab-mentions promo:
 * a quiet start, then a steep climb, with the lead changing near the end.
 * The figures are not a measurement from any lab or podcast index.
 */
const STOPS = [0, 3, 6, 9, 12, 15, 18, 21, 23];

const SERIES: { name: string; color: string; values: number[] }[] = [
  { name: "OpenAI", color: "#2D3A8C", values: [68, 200, 420, 900, 1800, 6000, 12000, 14800, 15540] },
  { name: "Google", color: "#C77A29", values: [50, 160, 340, 700, 1400, 4500, 9000, 11000, 11715] },
  { name: "Anthropic", color: "#3B824B", values: [32, 140, 380, 1000, 2200, 7500, 13500, 15500, 15950] },
  { name: "Hugging Face", color: "#8A3E98", values: [12, 40, 90, 180, 340, 620, 1000, 1550, 1885] },
  { name: "xAI", color: "#333333", values: [8, 24, 55, 110, 200, 400, 700, 1050, 1330] },
  { name: "Mistral", color: "#C4A035", values: [16, 48, 110, 220, 420, 780, 1400, 2100, 2572] },
  { name: "Meta", color: "#4A90E2", values: [18, 50, 105, 190, 340, 640, 1100, 1600, 1965] },
];

function at(values: number[], index: number): number {
  const last = STOPS.length - 1;
  if (index <= STOPS[0]) return values[0] ?? 0;
  if (index >= (STOPS[last] ?? index)) return values[last] ?? 0;
  let i = 0;
  while (i < last - 1 && (STOPS[i + 1] ?? 0) < index) i += 1;
  const span = (STOPS[i + 1] ?? 0) - (STOPS[i] ?? 0) || 1;
  const t = (index - (STOPS[i] ?? 0)) / span;
  const s = t * t * (3 - 2 * t);
  return Math.round((values[i] ?? 0) + ((values[i + 1] ?? 0) - (values[i] ?? 0)) * s);
}

function monthIso(index: number): string {
  const date = new Date(Date.UTC(2024, 10 + index, 1));
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-01`;
}

export function podcastMentionsRace(): LineRaceOptions {
  const data: Array<Record<string, string | number>> = [];
  for (let index = 0; index < 24; index++) {
    const row: Record<string, string | number> = { month: monthIso(index) };
    for (const series of SERIES) row[series.name] = at(series.values, index);
    data.push(row);
  }
  return {
    title: "AI Lab Mentions in Podcasts",
    subtitle: "# of episodes per month mentioning labs in full-text transcripts, since Nov 2024",
    unit: "episodes/mo",
    x: "month",
    duration: 9000,
    fps: 30,
    width: 1280,
    height: 720,
    scale: "expand",
    series: SERIES.map((series) => ({ name: series.name, field: series.name, color: series.color })),
    data,
  };
}

export function podcastMentionsCsv(): string {
  const race = podcastMentionsRace();
  const fields = (race.series ?? []).map((series) => series.field ?? series.name);
  const header = ["month", ...fields].map(csvEscape).join(",");
  const lines = race.data.map((row) =>
    ["month", ...fields].map((field) => csvEscape(String(row[field] ?? ""))).join(","),
  );
  return [header, ...lines].join("\n");
}
