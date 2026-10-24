/**
 * Round 13 browser and SSR figures, measured 2026-10-18 on phase 2
 * `d8dcc5a` (PR #10). Medians are the middle of five samples in the jsonl rows.
 * The agent table is Round 6, the current scoreboard in BENCHMARKS.md.
 * That run is 2026-10-16 and was not re-run for round 13.
 * Bundle bytes are read from docs/data/measured-sizes.json, not from that commit.
 */
import { measuredBundle } from "./bundle-measured.ts";

export const ROUND = 13;
export const MEASURED = "2026-10-18";
export const CORE_COMMIT = "d8dcc5a";
export const AGENT_MEASURED = "2026-10-16";

export const updateMethod =
  "The aligned update starts at the top of a requestAnimationFrame. The harness awaits the library's own completion, then reads the clock from a MessageChannel task after that frame's style, layout, and paint. GPU and raster time is not in the number. ChartKit is measured through mount(element, spec).update(spec), the same shape as uPlot's setData. The figure is the median of five samples.";

export const headline = {
  lineGzipLabel: measuredBundle.headline.lineGzipLabel,
  lineGzipBytes: measuredBundle.headline.lineGzipBytes,
  nextLib: measuredBundle.headline.nextLib,
  nextGzipBytes: measuredBundle.headline.nextGzipBytes,
  uplotJsBytes: measuredBundle.headline.uplotJsBytes,
  uplotCssBytes: measuredBundle.headline.uplotCssBytes,
  uplotSumBytes: measuredBundle.headline.uplotSumBytes,
  sizeCommit: measuredBundle.headline.sizeCommit,
  sizeMeasured: measuredBundle.headline.sizeMeasured,
  harnessLineBytes: measuredBundle.headline.harnessLineBytes,
  bundleLoss: measuredBundle.headline.bundleLoss,
  lineWins: measuredBundle.headline.lineWins,
  donutWin: measuredBundle.headline.donutWin,
  ssrLabel: "0.85 ms",
  repairFrom: "21/42",
  repairTo: "42/42",
  repair: "21/42 → 42/42",
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
  alt: measuredBundle.alt,
  caption: measuredBundle.caption,
  rows: measuredBundle.raceRows,
};

export const initial1k: Race = {
  id: "initial-1k",
  title: "1k points, initial, even x",
  unit: "ms",
  alt: "At 1,000 even points ChartKit’s initial render is 11.3 ms and uPlot’s is 12.0 ms. The aligned update is a loss, 1.5 ms against 1.2 ms.",
  caption:
    "Even x. ChartKit wins the initial (11.3 vs 12.0). The aligned update is a loss: 1.5 vs 1.2. Jittered initial is 10.1 vs 14.2, and that update is also a loss (1.6 vs 1.4). Gapped timestamps: initial 11.8 vs 12.3, update loss 1.6 vs 1.4.",
  rows: [
    { lib: "ChartKit", value: 11.3 },
    { lib: "uPlot", value: 12.0 },
  ],
};

export const initial100k: Race = {
  id: "initial-100k",
  title: "100k points, initial, even x",
  unit: "ms",
  alt: "At 100,000 even points ChartKit’s initial render is 14.1 ms and uPlot’s is 16.3 ms. The aligned update is a win, 2.3 ms against 2.9 ms. Gapped timestamps at 100k lose the update, 3.5 against 3.4.",
  caption:
    "Even x, sampling auto. Initial 14.1 vs 16.3. Aligned update 2.3 vs 2.9, a win. The gapped-timestamp update at this size is a loss: 3.5 vs 3.4.",
  rows: [
    { lib: "ChartKit", value: 14.1 },
    { lib: "uPlot", value: 16.3 },
  ],
};

export const initial1m: Race = {
  id: "initial-1m",
  title: "1M points, initial, even x",
  unit: "ms",
  alt: "At one million even points ChartKit’s initial render is 23.6 ms and uPlot’s is 26.5 ms. The aligned update is 10.7 ms against 11.2 ms.",
  caption:
    "Even x. Initial 23.6 vs 26.5. Aligned update 10.7 vs 11.2. Jittered 1M is 24.4 vs 32.1 initial and 11.7 vs 13.0 update. Gapped 1M is 27.3 vs 29.1 initial and 11.5 vs 11.8 update.",
  rows: [
    { lib: "ChartKit", value: 23.6 },
    { lib: "uPlot", value: 26.5 },
  ],
};

export const ssrRace: Race = {
  id: "ssr",
  title: "Server render, 1k line",
  unit: "ms",
  alt: "ChartKit server-renders a 1,000 point line in 0.85 ms mean. ECharts takes 6.65 ms. Nivo is 92.29 ms and is off this scale. uPlot, Chart.js, Recharts, and Plot did not produce a chart without a DOM.",
  caption:
    "Mean of 8 calls after 2 warmups, measured 2026-10-18. ChartKit median is also 0.85 ms. ECharts mean is 6.65 (median 6.38). Nivo mean is 92.29 and is left off the chart.",
  rows: [
    { lib: "ChartKit", value: 0.85 },
    { lib: "ECharts", value: 6.65 },
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
  { shape: "Even", points: "1,000", ckI: "11.3", upI: "12.0", ckU: "1.5", upU: "1.2", call: "Win initial. Update loss.", tone: "loss" },
  { shape: "Even", points: "10,000", ckI: "13.2", upI: "14.8", ckU: "1.9", upU: "1.7", call: "Win initial. Update loss.", tone: "loss" },
  { shape: "Even", points: "100,000", ckI: "14.1", upI: "16.3", ckU: "2.3", upU: "2.9", call: "Win initial. Win update.", tone: "win" },
  { shape: "Even", points: "1,000,000", ckI: "23.6", upI: "26.5", ckU: "10.7", upU: "11.2", call: "Win initial. Win update.", tone: "win" },
  { shape: "Jittered", points: "1,000", ckI: "10.1", upI: "14.2", ckU: "1.6", upU: "1.4", call: "Win initial. Update loss.", tone: "loss" },
  { shape: "Jittered", points: "10,000", ckI: "12.6", upI: "15.2", ckU: "1.9", upU: "2.2", call: "Win initial. Win update.", tone: "win" },
  { shape: "Jittered", points: "100,000", ckI: "15.0", upI: "19.4", ckU: "2.7", upU: "3.4", call: "Win initial. Win update.", tone: "win" },
  { shape: "Jittered", points: "1,000,000", ckI: "24.4", upI: "32.1", ckU: "11.7", upU: "13.0", call: "Win initial. Win update.", tone: "win" },
  { shape: "Gapped timestamps", points: "1,000", ckI: "11.8", upI: "12.3", ckU: "1.6", upU: "1.4", call: "Win initial. Update loss.", tone: "loss" },
  { shape: "Gapped timestamps", points: "10,000", ckI: "12.5", upI: "14.5", ckU: "1.9", upU: "1.6", call: "Win initial. Update loss.", tone: "loss" },
  { shape: "Gapped timestamps", points: "100,000", ckI: "15.0", upI: "17.8", ckU: "3.5", upU: "3.4", call: "Win initial. Update loss, 3.5 vs 3.4.", tone: "loss" },
  { shape: "Gapped timestamps", points: "1,000,000", ckI: "27.3", upI: "29.1", ckU: "11.5", upU: "11.8", call: "Win initial. Win update.", tone: "win" },
] as const;

export const hoverRows = [
  { lib: "ChartKit", tip: "16", painted: "16.5", p95: "17.1" },
  { lib: "uPlot", tip: "15.4", painted: "16.2", p95: "17" },
  { lib: "Chart.js", tip: "17", painted: "20.3", p95: "22.2" },
  { lib: "Observable Plot", tip: "22.7", painted: "28.3", p95: "34.6" },
  { lib: "Recharts", tip: "28.2", painted: "28.9", p95: "35.1" },
  { lib: "ECharts", tip: "20.4", painted: "2881.4", p95: "3113.2" },
] as const;

export const firstHoverRows = [
  { delay: "~50 ms after mount", ck: "20.8", ckMax: "27", uplot: "4", uplotMax: "16.6" },
  { delay: "~200 ms after mount", ck: "15.9", ckMax: "35.9", uplot: "4.6", uplotMax: "8.4" },
  { delay: "~500 ms after mount", ck: "16.5", ckMax: "29.2", uplot: "4.9", uplotMax: "5" },
] as const;

export const samplingRows = [
  { points: "100,000", initial: "54.8", update: "39.2" },
  { points: "1,000,000", initial: "471.8", update: "462.4" },
] as const;

export const bundleRows = measuredBundle.bundleRows;

export const ssrRows = [
  { lib: "ChartKit minimal", mean: "0.85", median: "0.85", status: "SVG, no DOM. Mean of 8 calls after 2 warmups. Min 0.73, max 1.01." },
  { lib: "ECharts", mean: "6.65", median: "6.38", status: "SVG SSR. Min 5.21, max 9.07." },
  { lib: "Nivo", mean: "92.29", median: "90.89", status: "SVG. Min 82.62, max 106.27." },
  { lib: "uPlot, Chart.js, Recharts, Observable Plot", mean: "—", median: "—", status: "No chart without a DOM. Recharts returned an empty wrapper." },
] as const;

export const agentRows = [
  { lib: "ChartKit", noFirst: "21 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "139.3 / 132.4" },
  { lib: "Recharts", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "221.9 / 236.5" },
  { lib: "ECharts", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "331.7 / 362.6" },
  { lib: "Chart.js", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "295.0 / 258.4" },
] as const;

/** Machine-readable round 13 timings, plus the current bundle measurement. Display strings above must match these values. */
export const published = {
  bundleGzip: measuredBundle.bundleGzip,
  sizeScriptLineBytes: measuredBundle.lineBytes,
  sizeScriptAllBytes: measuredBundle.allBytes,
  browser: [
    { shape: "even", points: 1000, chartkit: { initial: 11.3, update: 1.5 }, uplot: { initial: 12.0, update: 1.2 }, result: "win-initial-loss-update" },
    { shape: "even", points: 10000, chartkit: { initial: 13.2, update: 1.9 }, uplot: { initial: 14.8, update: 1.7 }, result: "win-initial-loss-update" },
    { shape: "even", points: 100000, chartkit: { initial: 14.1, update: 2.3 }, uplot: { initial: 16.3, update: 2.9 }, result: "win-initial-win-update" },
    { shape: "even", points: 1000000, chartkit: { initial: 23.6, update: 10.7 }, uplot: { initial: 26.5, update: 11.2 }, result: "win-initial-win-update" },
    { shape: "jitter", points: 1000, chartkit: { initial: 10.1, update: 1.6 }, uplot: { initial: 14.2, update: 1.4 }, result: "win-initial-loss-update" },
    { shape: "jitter", points: 10000, chartkit: { initial: 12.6, update: 1.9 }, uplot: { initial: 15.2, update: 2.2 }, result: "win-initial-win-update" },
    { shape: "jitter", points: 100000, chartkit: { initial: 15.0, update: 2.7 }, uplot: { initial: 19.4, update: 3.4 }, result: "win-initial-win-update" },
    { shape: "jitter", points: 1000000, chartkit: { initial: 24.4, update: 11.7 }, uplot: { initial: 32.1, update: 13.0 }, result: "win-initial-win-update" },
    { shape: "tsgaps", points: 1000, chartkit: { initial: 11.8, update: 1.6 }, uplot: { initial: 12.3, update: 1.4 }, result: "win-initial-loss-update" },
    { shape: "tsgaps", points: 10000, chartkit: { initial: 12.5, update: 1.9 }, uplot: { initial: 14.5, update: 1.6 }, result: "win-initial-loss-update" },
    { shape: "tsgaps", points: 100000, chartkit: { initial: 15.0, update: 3.5 }, uplot: { initial: 17.8, update: 3.4 }, result: "win-initial-loss-update" },
    { shape: "tsgaps", points: 1000000, chartkit: { initial: 27.3, update: 11.5 }, uplot: { initial: 29.1, update: 11.8 }, result: "win-initial-win-update" },
  ],
  samplingNone: [
    { points: 100000, initialMs: 54.8, updateMs: 39.2 },
    { points: 1000000, initialMs: 471.8, updateMs: 462.4 },
  ],
  hoverSteady100k: [
    { lib: "ChartKit", tipMs: 16, paintedMs: 16.5, p95Ms: 17.1 },
    { lib: "uPlot", tipMs: 15.4, paintedMs: 16.2, p95Ms: 17 },
    { lib: "Chart.js", tipMs: 17, paintedMs: 20.3, p95Ms: 22.2 },
    { lib: "Observable Plot", tipMs: 22.7, paintedMs: 28.3, p95Ms: 34.6 },
    { lib: "Recharts", tipMs: 28.2, paintedMs: 28.9, p95Ms: 35.1 },
    { lib: "ECharts", tipMs: 20.4, paintedMs: 2881.4, p95Ms: 3113.2 },
  ],
  firstHoverPainted: [
    { afterMountMs: 50, chartkit: 20.8, chartkitMax: 27, uplot: 4, uplotMax: 16.6 },
    { afterMountMs: 200, chartkit: 15.9, chartkitMax: 35.9, uplot: 4.6, uplotMax: 8.4 },
    { afterMountMs: 500, chartkit: 16.5, chartkitMax: 29.2, uplot: 4.9, uplotMax: 5 },
  ],
  ssr: [
    { lib: "ChartKit", meanMs: 0.85, medianMs: 0.85, supported: true },
    { lib: "ECharts", meanMs: 6.65, medianMs: 6.38, supported: true },
    { lib: "Nivo", meanMs: 92.29, medianMs: 90.89, supported: true },
    { lib: "uPlot", meanMs: null, medianMs: null, supported: false },
    { lib: "Chart.js", meanMs: null, medianMs: null, supported: false },
    { lib: "Recharts", meanMs: null, medianMs: null, supported: false },
    { lib: "Observable Plot", meanMs: null, medianMs: null, supported: false },
  ],
  agents: [
    { lib: "ChartKit", noDocsFirst: 21, noDocsWithinTwo: 42, officialFirst: 42, officialWithinTwo: 42, tokensNoDocs: 139.3, tokensOfficial: 132.4, inEval: true },
    { lib: "Recharts", noDocsFirst: 42, noDocsWithinTwo: 42, officialFirst: 42, officialWithinTwo: 42, tokensNoDocs: 221.9, tokensOfficial: 236.5, inEval: true },
    { lib: "ECharts", noDocsFirst: 42, noDocsWithinTwo: 42, officialFirst: 42, officialWithinTwo: 42, tokensNoDocs: 331.7, tokensOfficial: 362.6, inEval: true },
    { lib: "Chart.js", noDocsFirst: 42, noDocsWithinTwo: 42, officialFirst: 42, officialWithinTwo: 42, tokensNoDocs: 295, tokensOfficial: 258.4, inEval: true },
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
  if (!uplot || headline.uplotSumBytes.replace(/,/g, "") !== String(uplot.bytes)) {
    throw new Error("headline uPlot sum does not match published.bundleGzip");
  }
  if (headline.nextGzipBytes.replace(/,/g, "") !== headline.uplotJsBytes.replace(/,/g, "")) {
    throw new Error("headline uPlot JS gzip drifted");
  }
  if (headline.ssrLabel !== `${published.ssr[0].meanMs} ms`) {
    throw new Error("headline SSR does not match published.ssr");
  }
  published.browser.forEach((row, index) => {
    const display = browserRows[index];
    if (Number(display.ckI) !== row.chartkit.initial || Number(display.ckU) !== row.chartkit.update) {
      throw new Error(`browser display drifted at ${row.shape} ${row.points}`);
    }
    if (Number(display.upI) !== row.uplot.initial || Number(display.upU) !== row.uplot.update) {
      throw new Error(`uPlot display drifted at ${row.shape} ${row.points}`);
    }
  });
  if (!agentRows[0].noFirst.startsWith(String(published.agents[0].noDocsFirst))) {
    throw new Error("agent display drifted");
  }
}
