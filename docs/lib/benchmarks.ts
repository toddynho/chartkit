/** Published medians from BENCHMARKS.md at afd7edb (PR #4), measured 2026-10-16. */

export const MEASURED = "2026-10-16T21:44:20.619Z";
export const BENCH_COMMIT = "afd7edb";

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
  alt: "ChartKit’s minimal line chart is 8.7 KB gzip. uPlot is 24.0, Chart.js is 49.4, Plot is 97.7, Recharts is 99.7, and Nivo is 100.6. ECharts is 163 KB and is off this scale.",
  caption:
    "Minimal line entry, gzip. ECharts modular line is 163.0 KB and is left off the chart so the rest stay readable. The table has every library.",
  rows: [
    { lib: "ChartKit", value: 8.7 },
    { lib: "uPlot", value: 24.0 },
    { lib: "Chart.js", value: 49.4 },
    { lib: "Plot", value: 97.7 },
    { lib: "Recharts", value: 99.7 },
    { lib: "Nivo", value: 100.6 },
  ],
};

export const initial100k: Race = {
  id: "initial-100k",
  title: "100k points, initial",
  unit: "ms",
  alt: "At 100,000 points ChartKit’s initial render is 11.6 ms, ahead of uPlot at 16.5, Chart.js at 56.3, and Observable Plot at 93.6. Sampling is auto.",
  caption: "Sampling auto. Recharts is 1,770.7 ms, ECharts 2,642.0 ms, Nivo 343.3 ms. Those are in the table.",
  rows: [
    { lib: "ChartKit", value: 11.6 },
    { lib: "uPlot", value: 16.5 },
    { lib: "Chart.js", value: 56.3 },
    { lib: "Plot", value: 93.6 },
  ],
};

export const initial1m: Race = {
  id: "initial-1m",
  title: "1M points, initial",
  unit: "ms",
  alt: "At one million points uPlot’s initial render is 22.5 ms and ChartKit’s is 24.9 ms. ChartKit loses this one.",
  caption:
    "ChartKit loses to uPlot here (24.9 ms vs 22.5 ms), and again on the update (31.9 ms vs 25.7 ms). Both use sampling on the ChartKit side. Chart.js is 321.7 ms, Plot 737.1 ms, Recharts 19.8 s, ECharts 34.1 s. Nivo errored.",
  rows: [
    { lib: "uPlot", value: 22.5 },
    { lib: "ChartKit", value: 24.9 },
  ],
};

export const ssrRace: Race = {
  id: "ssr",
  title: "Server render, 1k line",
  unit: "ms",
  alt: "ChartKit server-renders a 1,000 point line in 0.62 ms mean. ECharts takes 5.32 ms and Nivo 52.91 ms. uPlot, Chart.js, Recharts, and Plot did not produce a chart without a DOM.",
  caption: "Mean of 8 calls after 2 warmups. Blank cells in the table mean no chart without a DOM.",
  rows: [
    { lib: "ChartKit", value: 0.62 },
    { lib: "ECharts", value: 5.32 },
    { lib: "Nivo", value: 52.91 },
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
  { points: "1,000", ckI: "22.30", ckU: "33.10", bestI: "Plot 18.00", bestU: "Recharts 15.30", call: "Loss on both" },
  { points: "10,000", ckI: "11.70", ckU: "33.20", bestI: "ChartKit 11.70", bestU: "Chart.js 32.10", call: "Win initial. Update is a frame-quantized tie." },
  { points: "100,000", ckI: "11.60", ckU: "27.30", bestI: "ChartKit 11.60", bestU: "ChartKit 27.30", call: "Win" },
  { points: "1,000,000", ckI: "24.90", ckU: "31.90", bestI: "uPlot 22.50", bestU: "uPlot 25.70", call: "Loss to uPlot" },
] as const;

export const samplingRows = [
  { points: "100,000", initial: "66.80", update: "1,170.90" },
  { points: "1,000,000", initial: "505.20", update: "21,472.50" },
] as const;

export const bundleRows = [
  { lib: "ChartKit minimal", gzip: "8,712", note: "Line chart. Bar 6,794. Donut 5,188." },
  { lib: "uPlot", gzip: "24,038", note: "JS plus the published stylesheet." },
  { lib: "Chart.js", gzip: "49,374", note: "Line chart." },
  { lib: "Observable Plot", gzip: "97,723", note: "No donut." },
  { lib: "Recharts", gzip: "99,718", note: "96,213 with React external." },
  { lib: "Nivo", gzip: "100,594", note: "96,583 with React external." },
  { lib: "ECharts", gzip: "162,991", note: "echarts/core plus one series." },
  { lib: "ChartKit /all", gzip: "19,855", note: "Every chart and theme, no validator." },
] as const;

export const agentRows = [
  { lib: "ChartKit", noFirst: "21 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "139 / 132" },
  { lib: "Recharts", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "222 / 237" },
  { lib: "ECharts", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "332 / 363" },
  { lib: "Chart.js", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "295 / 258" },
] as const;
