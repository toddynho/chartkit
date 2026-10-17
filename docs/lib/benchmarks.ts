/**
 * Round 7 figures, from the Phase 1 bench (PR #6 core dccdbe6, harness PR #4 afd7edb).
 * Pages read this file. A later round replaces the values here and nowhere else.
 * The full run was on a loaded box. Quiet-box reruns are the parenthetical numbers.
 */

export const ROUND = 7;
export const MEASURED = "2026-10-16";
export const CORE_COMMIT = "dccdbe6";
export const HARNESS_COMMIT = "afd7edb";

export const headline = {
  lineGzipLabel: "12.2 KB",
  lineGzipBytes: "12,171",
  nextLib: "uPlot",
  nextGzipBytes: "23,867",
  ssrLabel: "0.95 ms",
  repairFrom: "20/42",
  repairTo: "42/42",
  repair: "20/42 → 42/42",
};

export interface Race {
  id: string;
  title: string;
  alt: string;
  unit: string;
  caption: string;
  rows: { lib: string; value: number }[];
}

export const bundleRace: Race = {
  id: "bundle-gzip",
  title: "Line chart, gzip",
  unit: "KB",
  alt: "ChartKit’s minimal line chart is 12.2 KB gzip. uPlot is 23.9, Chart.js is 49.2, Nivo is 95.5, Recharts is 95.8, and Plot is 97.2. ECharts is 162 KB and is off this scale.",
  caption:
    "Minimal line entry, gzip -9, from the bench harness. ECharts modular line is 162.4 KB and is left off the chart so the rest stay readable. The table has every library.",
  rows: [
    { lib: "ChartKit", value: 12.2 },
    { lib: "uPlot", value: 23.9 },
    { lib: "Chart.js", value: 49.2 },
    { lib: "Nivo", value: 95.5 },
    { lib: "Recharts", value: 95.8 },
    { lib: "Plot", value: 97.2 },
  ],
};

export const initial1k: Race = {
  id: "initial-1k",
  title: "1k points, initial",
  unit: "ms",
  alt: "At 1,000 points ChartKit’s initial render is 11.9 ms and uPlot’s is 15.0 ms. ChartKit wins the initial and loses the update.",
  caption:
    "New row in round 7. ChartKit wins the initial (11.9 ms, quiet-box 13.7). The update is a loss, and ChartKit is last of the seven: 32.8 ms against Chart.js at 20.2 and Plot at 21.3. On the quiet box Nivo’s update is 19.4 ms.",
  rows: [
    { lib: "ChartKit", value: 11.9 },
    { lib: "uPlot", value: 15.0 },
  ],
};

export const initial100k: Race = {
  id: "initial-100k",
  title: "100k points, initial",
  unit: "ms",
  alt: "At 100,000 points ChartKit’s initial render is 17.4 ms and uPlot’s is 20.2 ms. The 100k update is a loss.",
  caption:
    "Sampling auto. ChartKit wins the initial (17.4 ms vs uPlot 20.2). The update is a loss: ChartKit 22.9 ms, uPlot 17.5 ms. Quiet-box: initial 18.3 vs 21.9, update 23.5 vs 15.1.",
  rows: [
    { lib: "ChartKit", value: 17.4 },
    { lib: "uPlot", value: 20.2 },
  ],
};

export const initial1m: Race = {
  id: "initial-1m",
  title: "1M points, initial",
  unit: "ms",
  alt: "At one million points uPlot’s initial render is 32.0 ms and ChartKit’s is 34.8 ms on the full run. A quiet rerun ties them at 36.3 and 36.9.",
  caption:
    "Full run: uPlot 32.0 ms, ChartKit 34.8 ms. Quiet rerun: ChartKit 36.3, uPlot 36.9, a tie. The update stays a loss (33.4 vs 29.2; quiet 36.8 vs 33.9). Sampling is on.",
  rows: [
    { lib: "uPlot", value: 32.0 },
    { lib: "ChartKit", value: 34.8 },
  ],
};

export const ssrRace: Race = {
  id: "ssr",
  title: "Server render, 1k line",
  unit: "ms",
  alt: "ChartKit server-renders a 1,000 point line in 0.95 ms mean. ECharts takes 9.04 ms. Nivo is 113 ms and is off this scale. uPlot, Chart.js, Recharts, and Plot did not produce a chart without a DOM.",
  caption:
    "Mean of the full run. Nivo is 113 ms and is left off the chart. A quiet rerun put ChartKit at 1.22 ms and ECharts at 8.42 ms. Phase 1 is a little slower than round 6 core and still about 6× ECharts.",
  rows: [
    { lib: "ChartKit", value: 0.95 },
    { lib: "ECharts", value: 9.04 },
  ],
};

export function raceSpec(race: Race) {
  return {
    version: "1" as const,
    id: race.id,
    type: "bar",
    title: race.title,
    data: race.rows.map((row) => ({ lib: row.lib, value: row.value })),
    encoding: { x: "lib", y: "value" },
    mark: { gap: 0.32 },
    legend: false,
    size: { width: 640, height: 280 },
    a11y: { alt: race.alt },
  };
}

export const browserRows = [
  {
    points: "1,000",
    ckI: "11.9 (13.7)",
    ckU: "32.8 (31.9)",
    bestI: "uPlot 15.0 (15.1)",
    bestU: "Chart.js 20.2 (Nivo 19.4)",
    call: "Win initial. Loss on update, last of 7.",
    tone: "mixed",
  },
  {
    points: "10,000",
    ckI: "13.0 (14.2)",
    ckU: "30.7 (26.4)",
    bestI: "uPlot 17.7 (17.1)",
    bestU: "Chart.js 18.5 (24.2)",
    call: "Win initial. Loss on update.",
    tone: "mixed",
  },
  {
    points: "100,000",
    ckI: "17.4 (18.3)",
    ckU: "22.9 (23.5)",
    bestI: "uPlot 20.2 (21.9)",
    bestU: "uPlot 17.5 (15.1)",
    call: "Win initial. Loss on update.",
    tone: "mixed",
  },
  {
    points: "1,000,000",
    ckI: "34.8 (36.3)",
    ckU: "33.4 (36.8)",
    bestI: "uPlot 32.0 (36.9)",
    bestU: "uPlot 29.2 (33.9)",
    call: "Loss. Quiet rerun ties the initial.",
    tone: "loss",
  },
] as const;

export const samplingRows = [
  { points: "100,000", initial: "88.7", update: "1,257.8" },
  { points: "1,000,000", initial: "782.5", update: "53,343.8" },
] as const;

export const bundleRows = [
  { lib: "ChartKit minimal", gzip: "12,171", note: "Line chart. Bar 10,289. Donut 5,681. scripts/size.mjs measures the line entry at 12,106." },
  { lib: "uPlot", gzip: "23,867", note: "Next smallest. JS plus the published stylesheet." },
  { lib: "Chart.js", gzip: "49,234", note: "Line chart." },
  { lib: "Observable Plot", gzip: "97,215", note: "No donut." },
  { lib: "Recharts", gzip: "95,807", note: "With React external." },
  { lib: "Nivo", gzip: "95,493", note: "With React external." },
  { lib: "ECharts", gzip: "162,391", note: "echarts/core plus one series." },
  { lib: "ChartKit /all", gzip: "22,864", note: "Every chart and theme, no validator." },
] as const;

export const ssrRows = [
  { lib: "ChartKit minimal", mean: "0.95", quiet: "1.22", status: "SVG, no DOM. Headline figure for the homepage." },
  { lib: "ECharts", mean: "9.04", quiet: "8.42", status: "SVG SSR." },
  { lib: "Nivo", mean: "113", quiet: "—", status: "SVG. Full run, loaded box. Round 6 was 52.91 ms." },
  { lib: "uPlot, Chart.js, Recharts, Observable Plot", mean: "—", quiet: "—", status: "No chart without a DOM. Recharts returned an empty wrapper." },
] as const;

export const agentRows = [
  { lib: "ChartKit", noFirst: "20 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "139.4 / 131.1" },
  { lib: "Recharts", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "223.3 / 236.6" },
  { lib: "ECharts", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "334.2 / 367.2" },
  { lib: "Chart.js", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "294.6 / 260.9" },
] as const;
