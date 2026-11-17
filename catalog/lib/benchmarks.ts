/**
 * Round 13 browser and SSR figures, measured 2026-10-18 on phase 2
 * `d8dcc5a` (PR #10). Medians are the middle of five samples in the jsonl rows.
 * The agent table is Round 6, the current scoreboard in BENCHMARKS.md.
 * That run is 2026-10-16 and was not re-run for round 13.
 * Bundle and server-render figures are the phase 4 matrices in bench/results/bundle.json
 * and bench/results/ssr.json. Browser rows stay round 13.
 * Hover is not round 13. It is read from bench/results/hover.json and hover-50ms.json,
 * the output of bench/browser/hover.mjs, through ./hover-bench.ts.
 */
import { hoverBench } from "./hover-bench.ts";
import { phase4Headline } from "./size-matrix.ts";

const phase4 = phase4Headline();
const hoverRun = hoverBench();
const ms1 = (value: number) => value.toFixed(1);

/** Where the hover figures come from, and what each side of the run draws. */
export const hoverMeta = {
  measured: hoverRun.measured,
  commit: hoverRun.commit,
  runs: hoverRun.runs,
  moves: hoverRun.moves,
  script: hoverRun.script,
  source: hoverRun.source,
  machine: hoverRun.machine,
  uplotVersion: hoverRun.uplotVersion,
  uplotSetup: hoverRun.uplotSetup,
  protocol: hoverRun.protocol,
  /** Steady moves from the second file, hover-50ms.json. The tables show hover.json. */
  steadySecondRun: hoverRun.steadyOther,
};

export const hoverMethod = `Measured ${hoverRun.measured} on \`${hoverRun.commit}\` with \`${hoverRun.script}\`: Playwright Chromium, a 640×360 line of 100,000 points, frame-rate limit off, ${hoverRun.runs} fresh pages per library, Playwright's real mouse. Handler is from the first pointer event of a move to the end of the bubbling mousemove. Painted is to a task after the next animation frame. Raster and GPU time are in neither. Each fresh page gives one first hover and ${hoverRun.moves} steady moves 16 ms apart, and the two libraries alternate page by page. Cells are the median, with the p95 beside it. There are two runs: one waits 200 ms after mount before the first move (\`${hoverRun.source[0]}\`), the other 50 ms (\`${hoverRun.source[1]}\`). uPlot is ${hoverRun.uplotVersion} with default options: cursor lines, a hover point and its live legend, checked in the page. uPlot has no tooltip, so it places none. ChartKit fills and places a tooltip on every move. One machine. The numbers move with the machine and from run to run, so compare the two columns, not a column against another page.`;

export const ROUND = 13;
export const MEASURED = "2026-10-18";
export const CORE_COMMIT = "d8dcc5a";
export const AGENT_MEASURED = "2026-10-16";

export const updateMethod =
  "The aligned update starts at the top of a requestAnimationFrame. The harness awaits the library's own completion, then reads the clock from a MessageChannel task after that frame's style, layout, and paint. GPU and raster time is not in the number. ChartKit is measured through mount(element, spec).update(spec), the same shape as uPlot's setData. The figure is the median of five samples.";

export const headline = {
  lineGzipLabel: phase4.lineGzipLabel,
  lineGzipBytes: phase4.lineGzipBytes,
  nextLib: phase4.nextLib,
  nextGzipBytes: phase4.nextGzipBytes,
  uplotJsBytes: phase4.uplotJsBytes,
  uplotCssBytes: phase4.uplotCssBytes,
  uplotSumBytes: phase4.uplotSumBytes,
  sizeCommit: phase4.sizeCommit,
  sizeMeasured: phase4.sizeMeasured,
  harnessLineBytes: phase4.harnessLineBytes,
  bundleLoss: phase4.bundleLoss,
  lineWins: phase4.lineWins,
  donutWin: phase4.donutWin,
  ssrLabel: phase4.ssrLabel,
  ssrPoints: phase4.ssrPoints,
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
  alt: `ChartKit’s createRenderer line is ${phase4.lineGzipLabel} gzip. ${phase4.bundleLoss}`,
  caption: `createRenderer line, measured ${phase4.sizeMeasured} on ${phase4.sizeCommit}. ${phase4.lineGzipBytes} bytes gzip. ${phase4.bundleLoss}`,
  rows: phase4.lineRace.map((row) => ({ lib: row.lib, value: Math.round(row.bytes / 100) / 10 })).sort((a, b) => a.value - b.value),
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
    "Even x, sampling auto, so not a million drawn points. Initial 23.6 vs 26.5. Aligned update 10.7 vs 11.2. Jittered 1M is 24.4 vs 32.1 initial and 11.7 vs 13.0 update. Gapped 1M is 27.3 vs 29.1 initial and 11.5 vs 11.8 update.",
  rows: [
    { lib: "ChartKit", value: 23.6 },
    { lib: "uPlot", value: 26.5 },
  ],
};

export const ssrRace: Race = {
  id: "ssr",
  title: "Server render, line",
  unit: "ms",
  alt: `ChartKit server-renders a ${phase4.ssrPoints.toLocaleString("en-US")} point line in ${phase4.ssrLabel} median. The per-type matrix names every unsupported cell.`,
  caption: `Median of 5 at ${phase4.ssrPoints.toLocaleString("en-US")} points. ${phase4.ssrLabel} for ChartKit. Unsupported cells stay in the matrix and are not drawn as zero.`,
  rows: phase4.ssrLine
    .filter((row): row is typeof row & { medianMs: number } => row.medianMs != null)
    .map((row) => ({ lib: row.lib, value: row.medianMs })),
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

export const hoverRows = hoverRun.steady.map((row) => ({
  lib: row.lib,
  handler: ms1(row.handlerMs),
  painted: ms1(row.paintedMs),
  p95: ms1(row.p95Ms),
}));

export const firstHoverRows = hoverRun.first.map((row) => ({
  delay: `${row.afterMountMs} ms after mount`,
  ck: ms1(row.chartkit),
  ckP95: ms1(row.chartkitP95),
  ckHandler: ms1(row.chartkitHandler),
  uplot: ms1(row.uplot),
  uplotP95: ms1(row.uplotP95),
  uplotHandler: ms1(row.uplotHandler),
}));

export const samplingRows = [
  { points: "100,000", initial: "54.8", update: "39.2" },
  { points: "1,000,000", initial: "471.8", update: "462.4" },
] as const;

export const bundleRows = [
  ...phase4.lineRace.map((row) => ({ lib: row.lib, gzip: row.bytes.toLocaleString("en-US"), note: row.entry })),
  { lib: "ChartKit bar", gzip: phase4.barBytes.toLocaleString("en-US"), note: "createRenderer bar" },
  { lib: "ChartKit mini-area", gzip: phase4.miniAreaBytes.toLocaleString("en-US"), note: "createRenderer mini-area" },
  { lib: "ChartKit /all", gzip: phase4.allBytes.toLocaleString("en-US"), note: "one bundle for every core chart and every theme, without the validator" },
];

export const ssrRows = phase4.ssrLine.map((row) => ({
  lib: row.lib,
  mean: row.meanMs == null ? "—" : String(row.meanMs),
  median: row.medianMs == null ? "—" : String(row.medianMs),
  status: row.supported ? `${row.points.toLocaleString("en-US")} points, median of 5` : "unsupported",
}));

export const agentRows = [
  { lib: "ChartKit", noFirst: "21 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "139.3 / 132.4" },
  { lib: "Recharts", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "221.9 / 236.5" },
  { lib: "ECharts", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "331.7 / 362.6" },
  { lib: "Chart.js", noFirst: "42 / 42", noTwo: "42 / 42", offFirst: "42 / 42", offTwo: "42 / 42", tokens: "295.0 / 258.4" },
] as const;

/** Machine-readable round 13 timings, plus the phase 4 bundle and SSR line cells and the hover run. Display strings above must match these values. */
export const published = {
  bundleGzip: phase4.lineRace.map((row) => ({
    id: row.id,
    lib: row.lib,
    entry: row.entry,
    bytes: row.bytes,
    reactExternal: row.reactExternal,
  })),
  sizeScriptLineBytes: phase4.lineBytes,
  sizeScriptAllBytes: phase4.allBytes,
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
  hoverSteady100k: hoverRun.steady,
  firstHoverPainted: hoverRun.first,
  ssr: phase4.ssrLine,
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
  if (published.ssr[0].medianMs == null || headline.ssrLabel !== `${published.ssr[0].medianMs} ms`) {
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

type BrowserDisplay = {
  shape: string;
  points: string;
  ckI: string;
  upI: string;
  ckU: string;
  upU: string;
};

function pointsShort(points: string): string {
  if (points === "1,000") return "1k";
  if (points === "10,000") return "10k";
  if (points === "100,000") return "100k";
  if (points === "1,000,000") return "1,000,000";
  return points;
}

function shapeShort(shape: string): string {
  if (shape === "Even") return "even";
  if (shape === "Jittered") return "jittered";
  if (shape === "Gapped timestamps") return "gapped";
  return shape.toLowerCase();
}

function cellName(row: BrowserDisplay): string {
  return `${shapeShort(row.shape)} ${pointsShort(row.points)}`;
}

/** Said wherever the initial-render cells are counted: the large cells do not draw every point. */
export const sampledNote =
  "Lines above 1,000 points are sampled to the plot width, so the 1,000,000-point cells are not a million drawn points.";

/** ChartKit vs uPlot, from the published 12-cell table. */
export function uplotBrowserParagraph(rows: readonly BrowserDisplay[]): string {
  const n = rows.length;
  const initialFaster = rows.filter((row) => Number(row.ckI) < Number(row.upI));
  const initialSlower = rows.filter((row) => Number(row.ckI) > Number(row.upI));
  const updateFaster = rows.filter((row) => Number(row.ckU) < Number(row.upU));
  const updateSlower = rows.filter((row) => Number(row.ckU) > Number(row.upU));
  const million = rows.find((row) => row.shape === "Even" && row.points === "1,000,000");
  const initial =
    initialSlower.length === 0 && initialFaster.length === n
      ? `ChartKit’s initial render is faster than uPlot in all ${n} cells.`
      : `ChartKit’s initial render is faster than uPlot in ${initialFaster.length} of ${n} cells.`;
  const initialLoss =
    initialSlower.length === 0
      ? ""
      : ` Slower initial cells: ${initialSlower.map((row) => `${cellName(row)} (${row.ckI} vs ${row.upI})`).join(", ")}.`;
  const millionText = million ? ` Even 1,000,000 points is ${million.ckI} ms vs ${million.upI} ms.` : "";
  const slowerList = updateSlower.map((row) => `${cellName(row)} (${row.ckU} vs ${row.upU})`).join(", ");
  return `${initial}${initialLoss}${millionText} ${sampledNote} The aligned update is faster in ${updateFaster.length} of ${n} and slower in ${updateSlower.length}. The slower cells are ${slowerList}.`;
}

export function uplotHeadline(rows: readonly BrowserDisplay[]): { initial: string; update: string } {
  const n = rows.length;
  const initialFaster = rows.filter((row) => Number(row.ckI) < Number(row.upI)).length;
  const updateFaster = rows.filter((row) => Number(row.ckU) < Number(row.upU)).length;
  const updateSlower = rows.filter((row) => Number(row.ckU) > Number(row.upU)).length;
  const million = rows.find((row) => row.shape === "Even" && row.points === "1,000,000");
  const initial =
    initialFaster === n
      ? `ChartKit is faster than uPlot in all ${n} cells.${million ? ` Even 1,000,000 points is ${million.ckI} ms vs ${million.upI} ms.` : ""} ${sampledNote}`
      : `ChartKit is faster than uPlot on the initial render in ${initialFaster} of ${n} cells. ${sampledNote}`;
  return {
    initial,
    update: `ChartKit wins ${updateFaster} of ${n} aligned-update cells against uPlot and loses ${updateSlower}. Those losses are marked in the browser table.`,
  };
}

export function uplotBrowserLead(rows: readonly BrowserDisplay[]): string {
  const n = rows.length;
  const initialFaster = rows.filter((row) => Number(row.ckI) < Number(row.upI)).length;
  const updateFaster = rows.filter((row) => Number(row.ckU) < Number(row.upU)).length;
  const updateSlower = rows.filter((row) => Number(row.ckU) > Number(row.upU)).length;
  const initial =
    initialFaster === n
      ? `ChartKit wins every initial cell of the ${n}.`
      : `ChartKit wins ${initialFaster} of ${n} initial cells.`;
  return `${initial} ${sampledNote} The update column is the fair timer. ${updateSlower} of those ${n} cells are losses (${updateFaster} wins), and they are marked in the result column.`;
}

type HoverDisplay = { lib: string; handler: string; painted: string; p95: string };
type FirstHoverDisplay = { ck: string; uplot: string; ckHandler: string; uplotHandler: string };

function rangeEnds(values: readonly string[]): { low: string; high: string } {
  const ranked = [...values].sort((a, b) => Number(a) - Number(b));
  const low = ranked[0];
  const high = ranked[ranked.length - 1];
  if (low == null || high == null) throw new Error("hover range is empty");
  return { low, high };
}

function span(ends: { low: string; high: string }): string {
  return ends.low === ends.high ? ends.low : `${ends.low} to ${ends.high}`;
}

/** The two hover sentences. Each one is built from the rows under it and throws when the rows stop supporting it. */
function hoverCalls(rows: readonly HoverDisplay[], first: readonly FirstHoverDisplay[]): { fresh: string; steady: string } {
  const chartkit = rows.find((row) => row.lib === "ChartKit");
  const uplot = rows.find((row) => row.lib === "uPlot");
  if (!chartkit || !uplot) throw new Error("hover rows are missing ChartKit or uPlot");
  const ck = rangeEnds(first.map((row) => row.ck));
  const up = rangeEnds(first.map((row) => row.uplot));
  const ckHandler = rangeEnds(first.map((row) => row.ckHandler));
  const upHandler = rangeEnds(first.map((row) => row.uplotHandler));
  if (first.some((row) => Number(row.ck) <= Number(row.uplot))) throw new Error("first hover is no longer a loss in every row: rewrite the hover claim");
  const times = first.map((row) => Number(row.ck) / Number(row.uplot));
  const ratio = `${Math.min(...times).toFixed(1)} to ${Math.max(...times).toFixed(1)}`;
  const fresh = `First hover on a fresh 100,000 point line is a loss to uPlot. ChartKit paints it in ${span(ck)} ms and uPlot in ${span(up)} ms, painted median, so uPlot is ${ratio} times faster. The handler alone is ${span(ckHandler)} ms against ${span(upHandler)} ms.`;
  const other = hoverRun.steadyOther;
  const ckOther = other.find((row) => row.lib === "ChartKit");
  const upOther = other.find((row) => row.lib === "uPlot");
  if (!ckOther || !upOther) throw new Error("the second hover run is missing ChartKit or uPlot");
  const gap = Math.max(Math.abs(Number(chartkit.painted) - Number(uplot.painted)), Math.abs(ckOther.paintedMs - upOther.paintedMs));
  const slowest = Math.max(Number(chartkit.painted), Number(uplot.painted), ckOther.paintedMs, upOther.paintedMs);
  if (gap > 1 || slowest > 1.5 || Number(chartkit.p95) > 4 || Number(uplot.p95) > 4) throw new Error("steady hover is no longer level at about a millisecond: rewrite the hover claim");
  if (Number(chartkit.handler) <= Number(uplot.handler)) throw new Error("uPlot's steady handler is no longer shorter: rewrite the hover claim");
  const steady = `Steady hover is level: both libraries paint a steady move in about a millisecond or less. ChartKit’s painted median is ${chartkit.painted} ms and uPlot’s is ${uplot.painted} ms in the run below, and ${ms1(ckOther.paintedMs)} ms and ${ms1(upOther.paintedMs)} ms in the other run. uPlot’s handler is shorter, ${uplot.handler} ms against ${chartkit.handler} ms.`;
  return { fresh, steady };
}

const hoverScope = "uPlot draws a cursor, a hover point and its legend, and has no tooltip. ChartKit also fills and places a tooltip.";

/** Short hover sentences for the FAQ and the compare pages, built from the same rows as the tables. */
export function hoverFaq(rows: readonly HoverDisplay[] = hoverRows, first: readonly (FirstHoverDisplay & { delay: string })[] = firstHoverRows): { pick: string; loss: string } {
  hoverCalls(rows, first);
  const chartkit = rows.find((row) => row.lib === "ChartKit");
  const uplot = rows.find((row) => row.lib === "uPlot");
  if (!chartkit || !uplot) throw new Error("hover rows are missing ChartKit or uPlot");
  const ck = first.map((row) => row.ck).join(" and ");
  const up = first.map((row) => row.uplot).join(" and ");
  const delays = first.map((row) => row.delay.replace(" ms after mount", "")).join(" and ");
  return {
    pick: `Pick uPlot when the first hover has to be as fast as it can be: on a 100,000 point line uPlot paints it in ${up} ms and ChartKit in ${ck} ms (painted median, ${delays} ms after mount).`,
    loss: `First hover on a 100,000 point line is a loss: ${ck} ms against uPlot ${up} ms, painted median at ${delays} ms after mount. Steady hover is level, ${chartkit.painted} ms against uPlot ${uplot.painted} ms, and uPlot places no tooltip.`,
  };
}

export function hoverParagraph(rows: readonly HoverDisplay[], first: readonly FirstHoverDisplay[]): string {
  const calls = hoverCalls(rows, first);
  return `${calls.fresh} ${calls.steady} ${hoverScope}`;
}

export function hoverMarkdown(rows: readonly HoverDisplay[], first: readonly FirstHoverDisplay[]): { steady: string; fresh: string } {
  const calls = hoverCalls(rows, first);
  return { steady: `${calls.steady} ${hoverScope}`, fresh: calls.fresh };
}

export function samplingParagraph(rows: readonly { points: string; initial: string; update: string }[]): string {
  const million = rows.find((row) => row.points === "1,000,000");
  if (!million) throw new Error("sampling rows are missing 1,000,000 points");
  return `These sampling-none times use the same fair update timer. At ${million.points} points that is ${million.initial} ms to draw and ${million.update} ms to update, on that same timer.`;
}

/** The 12-cell browser table does not time these libraries. */
export const browserRivalsOmitted =
  "These 12 cells publish ChartKit and uPlot only. Chart.js, Observable Plot, ECharts, Recharts, and Nivo do not have a millisecond in this table.";
