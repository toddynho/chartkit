/**
 * Prose for compare and when-to-use pages.
 * Numbers come from the paint script. catalog/lib keeps the longer writeups.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface WhenToUseFacts {
  lineGzipBytes: string;
  ssrLabel: string;
  sizeCommit: string;
  sizeMeasured: string;
  bundleLoss: string;
  harnessLineBytes: string;
  noDocsFirst: number;
  tokensOfficial: number;
}

export function whenToUseFaqs(facts: WhenToUseFacts): FaqItem[] {
  return [
    {
      question: "When should I use ChartKit?",
      answer: `When one JSON spec should render in React, Vue, Svelte, vanilla, or on the server, and an agent should validate() and repair() it. The line chart is ${facts.lineGzipBytes} bytes gzip. A 1,000-point line server-renders in ${facts.ssrLabel} mean. With the docs in the prompt, the agent eval was 42/42 on the first try. Round 6, 2026-10-16. Not re-run for round 13.`,
    },
    {
      question: "When should I pick another chart library?",
      answer:
        "The static SVG does not paint tooltip, zoom, pan, brush, or animation. Those run in the client runtime. Keyboard, the data table, and legend clicks stay off unless set. Pick Recharts, Chart.js, ECharts, or Nivo for maps. Pick uPlot when the 1,000-point aligned update is the constraint: ChartKit loses even (1.5 vs 1.2), jittered (1.6 vs 1.4), and gapped (1.6 vs 1.4). Pick uPlot when first hover has to be a few milliseconds: ChartKit 20.8, 15.9, and 16.5 ms, uPlot 4, 4.6, and 4.9 ms.",
    },
    {
      question: "How large is a ChartKit line chart?",
      answer: `${facts.lineGzipBytes} bytes gzip, from scripts/size.mjs on ${facts.sizeCommit}, measured ${facts.sizeMeasured}. ${facts.bundleLoss} The harness minimal line is ${facts.harnessLineBytes} bytes. Other libraries, and the donut, are on /benchmarks.`,
    },
    {
      question: "Can ChartKit render without a DOM?",
      answer: `Yes. Round 13 server-rendered a 1,000-point line in ${facts.ssrLabel} mean and 0.85 ms median. ECharts did it in 6.65 ms mean (median 6.38). Nivo did it in 92.29 ms mean (median 90.89). uPlot, Chart.js, Recharts, and Observable Plot produced no chart without a DOM.`,
    },
    {
      question: "How well do coding agents do on the first try?",
      answer: `Not re-run for round 13. Round 6, 2026-10-16, claude-sonnet-4-5, temperature 0, 42 tasks. ChartKit with no docs: ${facts.noDocsFirst}/42 first, 42/42 within two tries, and 42/42 after repair() with no model call. With llms.txt in the prompt: 42/42 first try, mean ${facts.tokensOfficial} output tokens. Recharts, ECharts, and Chart.js were 42/42 with no docs. Nivo and uPlot were not in that eval.`,
    },
    {
      question: "Where does ChartKit lose?",
      answer:
        "Round 13 initial render wins all 12 cells against uPlot. The aligned update wins 6 and loses 6: even 1,000 (1.5 vs 1.2), even 10,000 (1.9 vs 1.7), jittered 1,000 (1.6 vs 1.4), gapped 1,000 (1.6 vs 1.4), gapped 10,000 (1.9 vs 1.6), and gapped 100,000 (3.5 vs 3.4). Steady hover at 100k is 16.5 vs uPlot 16.2. First hover painted medians are 20.8, 15.9, and 16.5 ms against uPlot 4, 4.6, and 4.9. With sampling off, 1,000,000 points is 471.8 ms to draw and 462.4 ms to update.",
    },
    {
      question: "How do I reproduce the numbers?",
      answer:
        "Round 13, measured 2026-10-18, phase 2 d8dcc5a. Median of 5, Playwright Chromium, a 640×360 line. The aligned update starts at the top of a requestAnimationFrame, awaits the library's completion, then reads a MessageChannel after paint. The files are /benchmarks.json and /benchmarks.md.",
    },
  ];
}

interface GzipRow {
  id: string;
  chart: string;
  status: string;
  gzipBytes: number | null;
  cssGzipBytes: number | null;
  reactExternalGzipBytes: number | null;
}

export interface SizeFacts {
  commit: string;
  coreCommit: string;
  coreMatchesMain: boolean;
  command: string;
  measuredAt: string;
  lineBytes: number;
  benchCommand: string;
  benchMeasuredAt: string;
  rows: GzipRow[];
}

export interface SizeLibrary {
  id: string;
  name: string;
  bundleGzip?: {
    minimalLine?: number | null;
    fullEntry?: number | null;
    source?: string;
    measured?: string;
  } | null;
}

function bytes(value: number): string {
  return value.toLocaleString("en-US");
}

function day(iso: string): string {
  return iso.slice(0, 10);
}

export function sizeBrief(measured: SizeFacts, library: SizeLibrary): string {
  const core = measured.coreMatchesMain ? `core ${measured.coreCommit}, same as origin/main` : `core ${measured.coreCommit}`;
  const parts = [
    `ChartKit line gzip is ${bytes(measured.lineBytes)} bytes (${measured.command}, ${measured.commit}, ${core}, ${day(measured.measuredAt)}).`,
  ];
  const row = measured.rows.find((item) => item.id === library.id && item.chart === "line" && item.status === "ok");
  if (row?.gzipBytes != null) {
    if (row.reactExternalGzipBytes != null) {
      parts.push(
        `${library.name} line gzip is ${bytes(row.reactExternalGzipBytes)} bytes with React external, ${bytes(row.gzipBytes)} with React included (${measured.benchCommand}, ${measured.benchMeasuredAt}).`,
      );
    } else {
      parts.push(
        `${library.name} line gzip is ${bytes(row.gzipBytes)} bytes (${measured.benchCommand}, ${measured.benchMeasuredAt}).`,
      );
    }
    if (row.cssGzipBytes != null) {
      parts.push(
        `Stylesheet ${bytes(row.cssGzipBytes)} bytes gzip, a separate response. JS plus stylesheet sums to ${bytes(row.gzipBytes + row.cssGzipBytes)}.`,
      );
    }
    const harness = measured.rows.find((item) => item.id === "chartkit-minimal" && item.chart === "line" && item.status === "ok");
    if (harness?.gzipBytes != null) {
      parts.push(`ChartKit's harness line on that run is ${bytes(harness.gzipBytes)} bytes.`);
    }
  } else if (library.bundleGzip && typeof library.bundleGzip.minimalLine === "number") {
    parts.push(
      `${library.name} line gzip is ${bytes(library.bundleGzip.minimalLine)} bytes from ${library.bundleGzip.source ?? "the matrix extract"}, measured ${library.bundleGzip.measured ?? "the matrix date"}. Not remeasured with the ChartKit line above.`,
    );
    if (typeof library.bundleGzip.fullEntry === "number") {
      parts.push(`Full entry on that extract is ${bytes(library.bundleGzip.fullEntry)} bytes.`);
    }
  } else {
    parts.push(`${library.name} has no measured bundle in the bench run or the matrix extract. This page does not invent one.`);
  }
  return parts.join(" ");
}

interface BrowserCell {
  shape: string;
  points: number;
  chartkit: { initial: number; update: number };
  uplot: { initial: number; update: number };
}

interface HoverCell {
  lib: string;
  paintedMs: number;
}

interface SsrCell {
  lib: string;
  meanMs: number | null;
  medianMs: number | null;
  supported: boolean;
}

interface FirstHover {
  afterMountMs: number;
  chartkit: number;
  uplot: number;
}

export interface PerfFacts {
  round: number;
  measured: string;
  coreCommit: string;
  sizeCommit: string;
  hoverSteady100k: HoverCell[];
  ssrMs: SsrCell[];
  browserMs: BrowserCell[];
  firstHoverPainted: FirstHover[];
}

const BENCH_NAME: Record<string, string> = {
  uplot: "uPlot",
  chartjs: "Chart.js",
  plot: "Observable Plot",
  recharts: "Recharts",
  echarts: "ECharts",
  nivo: "Nivo",
};

function shapeLabel(shape: string): string {
  if (shape === "jitter") return "jittered";
  if (shape === "tsgaps") return "gapped";
  return shape;
}

export function perfBrief(libraryId: string, libraryName: string, bench: PerfFacts): string {
  const lead = `Round ${bench.round} (${bench.measured}, ${bench.coreCommit}). Not re-run on ${bench.sizeCommit}.`;
  const name = BENCH_NAME[libraryId];
  if (!name) return `${lead} benchmarks.json has no timing row for ${libraryName}.`;
  const parts = [lead];
  const hoverChartkit = bench.hoverSteady100k.find((row) => row.lib === "ChartKit");
  const hover = bench.hoverSteady100k.find((row) => row.lib === name);
  if (hover && hoverChartkit) {
    parts.push(`Steady hover at 100k, painted median: ChartKit ${hoverChartkit.paintedMs} ms, ${name} ${hover.paintedMs} ms.`);
  }
  const ssrChartkit = bench.ssrMs.find((row) => row.lib === "ChartKit");
  const ssr = bench.ssrMs.find((row) => row.lib === name);
  if (ssr && ssrChartkit?.supported) {
    if (!ssr.supported) {
      parts.push(`${name} produced no chart without a DOM.`);
    } else if (ssr.meanMs != null) {
      parts.push(
        `Server render, 1,000-point line: ChartKit ${ssrChartkit.meanMs} ms mean, ${name} ${ssr.meanMs} ms mean (median ${ssr.medianMs}).`,
      );
    }
  }
  if (libraryId === "uplot") {
    const rows = bench.browserMs;
    const initialWins = rows.filter((row) => row.chartkit.initial < row.uplot.initial).length;
    const updateSlower = rows.filter((row) => row.chartkit.update > row.uplot.update);
    parts.push(
      `Browser cells are ChartKit vs uPlot only (${rows.length}). Initial render is faster in ${initialWins} of ${rows.length}. Aligned update is slower in ${updateSlower.length}: ${updateSlower.map((row) => `${shapeLabel(row.shape)} ${row.points.toLocaleString("en-US")} ${row.chartkit.update} vs ${row.uplot.update}`).join(", ")}.`,
    );
    const first = bench.firstHoverPainted;
    parts.push(
      `First hover painted: ChartKit ${first.map((row) => row.chartkit).join(", ")} ms, uPlot ${first.map((row) => row.uplot).join(", ")} ms, at ${first.map((row) => row.afterMountMs).join(", ")} ms after mount.`,
    );
  } else {
    parts.push("Browser millisecond rows are ChartKit vs uPlot only.");
  }
  return parts.join(" ");
}
