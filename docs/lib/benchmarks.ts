/**
 * Timed figures are round 7, from the Phase 1 bench (PR #6 core dccdbe6, harness PR #4 afd7edb).
 * The line gzip is newer: the Soft default, 13,966 bytes, measured 2026-10-17.
 * Bar, donut, /all, browser, SSR, and the agent eval are still the round 7 core.
 * The full run was on a loaded box. Quiet-box reruns are the parenthetical numbers.
 */

export const ROUND = 7;
export const MEASURED = "2026-10-16";
export const CORE_COMMIT = "dccdbe6";
export const HARNESS_COMMIT = "afd7edb";

export const headline = {
  lineGzipLabel: "14.0 KB",
  lineGzipBytes: "13,966",
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
  alt: "ChartKit’s minimal line chart is 14.0 KB gzip. uPlot is 23.9, Chart.js is 49.2, Nivo is 95.5, Recharts is 95.8, and Plot is 97.2. ECharts is 162 KB and is off this scale.",
  caption:
    "The ChartKit bar is the Soft line, 13,966 bytes gzip. The other libraries are the round 7 harness. ECharts modular line is 162.4 KB and is left off the chart so the rest stay readable.",
  rows: [
    { lib: "ChartKit", value: 14.0 },
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
  { lib: "ChartKit minimal", gzip: "13,966", note: "Soft line, 2026-10-17. Still the smallest. Bar 10,289 and donut 5,681 are the round 7 core." },
  { lib: "uPlot", gzip: "23,867", note: "Next smallest. JS plus the published stylesheet." },
  { lib: "Chart.js", gzip: "49,234", note: "Line chart." },
  { lib: "Observable Plot", gzip: "97,215", note: "No donut." },
  { lib: "Recharts", gzip: "95,807", note: "With React external." },
  { lib: "Nivo", gzip: "95,493", note: "With React external." },
  { lib: "ECharts", gzip: "162,391", note: "echarts/core plus one series." },
  { lib: "ChartKit /all", gzip: "22,864", note: "Round 7 core. Every chart and theme, no validator. Not remeasured for Soft." },
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

/** Machine-readable round 7 numbers. Display strings above must start with these values. */
export const published = {
  bundleGzip: [
    { id: "chartkit-line", lib: "ChartKit", entry: "minimal line, Soft default", bytes: 13966, reactExternal: false },
    { id: "chartkit-bar", lib: "ChartKit", entry: "minimal bar", bytes: 10289, reactExternal: false },
    { id: "chartkit-donut", lib: "ChartKit", entry: "minimal donut", bytes: 5681, reactExternal: false },
    { id: "chartkit-all", lib: "ChartKit", entry: "/all", bytes: 22864, reactExternal: false },
    { id: "uplot", lib: "uPlot", entry: "line plus stylesheet", bytes: 23867, reactExternal: false },
    { id: "chartjs", lib: "Chart.js", entry: "line", bytes: 49234, reactExternal: false },
    { id: "plot", lib: "Observable Plot", entry: "line", bytes: 97215, reactExternal: false },
    { id: "recharts", lib: "Recharts", entry: "line", bytes: 95807, reactExternal: true },
    { id: "nivo", lib: "Nivo", entry: "line", bytes: 95493, reactExternal: true },
    { id: "echarts", lib: "ECharts", entry: "echarts/core plus one series", bytes: 162391, reactExternal: false },
  ],
  sizeScriptLineBytes: 12106,
  browser: [
    {
      points: 1000,
      chartkit: { initial: { full: 11.9, quiet: 13.7 }, update: { full: 32.8, quiet: 31.9 } },
      fastestInitial: { lib: "uPlot", full: 15.0, quiet: 15.1 },
      fastestUpdate: { lib: "Chart.js", full: 20.2, quietLib: "Nivo", quiet: 19.4 },
      result: "win-initial-loss-update",
    },
    {
      points: 10000,
      chartkit: { initial: { full: 13.0, quiet: 14.2 }, update: { full: 30.7, quiet: 26.4 } },
      fastestInitial: { lib: "uPlot", full: 17.7, quiet: 17.1 },
      fastestUpdate: { lib: "Chart.js", full: 18.5, quietLib: "Chart.js", quiet: 24.2 },
      result: "win-initial-loss-update",
    },
    {
      points: 100000,
      chartkit: { initial: { full: 17.4, quiet: 18.3 }, update: { full: 22.9, quiet: 23.5 } },
      fastestInitial: { lib: "uPlot", full: 20.2, quiet: 21.9 },
      fastestUpdate: { lib: "uPlot", full: 17.5, quietLib: "uPlot", quiet: 15.1 },
      result: "win-initial-loss-update",
    },
    {
      points: 1000000,
      chartkit: { initial: { full: 34.8, quiet: 36.3 }, update: { full: 33.4, quiet: 36.8 } },
      fastestInitial: { lib: "uPlot", full: 32.0, quiet: 36.9 },
      fastestUpdate: { lib: "uPlot", full: 29.2, quietLib: "uPlot", quiet: 33.9 },
      result: "loss-full-run-quiet-initial-tie",
    },
  ],
  samplingNone: [
    { points: 100000, initialMs: 88.7, updateMs: 1257.8 },
    { points: 1000000, initialMs: 782.5, updateMs: 53343.8 },
  ],
  ssr: [
    { lib: "ChartKit", meanMs: 0.95, quietMs: 1.22, supported: true },
    { lib: "ECharts", meanMs: 9.04, quietMs: 8.42, supported: true },
    { lib: "Nivo", meanMs: 113, quietMs: null, supported: true },
    { lib: "uPlot", meanMs: null, quietMs: null, supported: false },
    { lib: "Chart.js", meanMs: null, quietMs: null, supported: false },
    { lib: "Recharts", meanMs: null, quietMs: null, supported: false },
    { lib: "Observable Plot", meanMs: null, quietMs: null, supported: false },
  ],
  agents: [
    { lib: "ChartKit", noDocsFirst: 20, noDocsWithinTwo: 42, officialFirst: 42, officialWithinTwo: 42, tokensNoDocs: 139.4, tokensOfficial: 131.1, inEval: true },
    { lib: "Recharts", noDocsFirst: 42, noDocsWithinTwo: 42, officialFirst: 42, officialWithinTwo: 42, tokensNoDocs: 223.3, tokensOfficial: 236.6, inEval: true },
    { lib: "ECharts", noDocsFirst: 42, noDocsWithinTwo: 42, officialFirst: 42, officialWithinTwo: 42, tokensNoDocs: 334.2, tokensOfficial: 367.2, inEval: true },
    { lib: "Chart.js", noDocsFirst: 42, noDocsWithinTwo: 42, officialFirst: 42, officialWithinTwo: 42, tokensNoDocs: 294.6, tokensOfficial: 260.9, inEval: true },
    { lib: "Nivo", noDocsFirst: null, noDocsWithinTwo: null, officialFirst: null, officialWithinTwo: null, tokensNoDocs: null, tokensOfficial: null, inEval: false },
    { lib: "uPlot", noDocsFirst: null, noDocsWithinTwo: null, officialFirst: null, officialWithinTwo: null, tokensNoDocs: null, tokensOfficial: null, inEval: false },
  ],
  tasks: 42,
  model: "claude-sonnet-4-5",
  temperature: 0,
} as const;

export function assertPublishedMatchesDisplay(): void {
  const bundleLine = published.bundleGzip.find((row) => row.id === "chartkit-line");
  const uplot = published.bundleGzip.find((row) => row.id === "uplot");
  if (!bundleLine || headline.lineGzipBytes.replace(/,/g, "") !== String(bundleLine.bytes)) {
    throw new Error("headline line gzip does not match published.bundleGzip");
  }
  if (!uplot || headline.nextGzipBytes.replace(/,/g, "") !== String(uplot.bytes)) {
    throw new Error("headline uPlot gzip does not match published.bundleGzip");
  }
  if (headline.ssrLabel !== `${published.ssr[0].meanMs} ms`) {
    throw new Error("headline SSR does not match published.ssr");
  }
  published.browser.forEach((row, index) => {
    const display = browserRows[index];
    if (!display.ckI.startsWith(String(row.chartkit.initial.full))) {
      throw new Error(`browser initial display drifted at ${row.points}`);
    }
    if (!display.ckU.startsWith(String(row.chartkit.update.full))) {
      throw new Error(`browser update display drifted at ${row.points}`);
    }
  });
  if (!agentRows[0].noFirst.startsWith(String(published.agents[0].noDocsFirst))) {
    throw new Error("agent display drifted");
  }
}
