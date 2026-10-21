import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENT_MEASURED,
  CORE_COMMIT,
  MEASURED,
  ROUND,
  agentRows,
  assertPublishedMatchesDisplay,
  browserRows,
  firstHoverRows,
  headline,
  hoverRows,
  published,
  samplingRows,
  updateMethod,
} from "../lib/benchmarks.ts";

export const BENCHMARKS_SCHEMA_URL = "https://chartkit.dev/benchmarks.schema.json";

export function benchmarksPayload() {
  assertPublishedMatchesDisplay();
  return {
    $schema: BENCHMARKS_SCHEMA_URL,
    name: "ChartKit benchmarks",
    round: ROUND,
    measured: MEASURED,
    core: { pullRequest: 10, commit: CORE_COMMIT, note: "Phase 2 head the timings were taken on. This docs branch does not contain that commit." },
    reproduce: "Median of 5, Playwright Chromium, a 640×360 line, three x spacings. This file does not re-time the libraries.",
    methodology: {
      browser: "Playwright Chromium, a 640×360 line, median of 5. Shapes are even x, jittered x, and gapped timestamps. ChartKit initial is mount(); the aligned update is mount().update().",
      updates: updateMethod,
      sampling:
        "mark.sampling defaults to auto and minmax-downsamples a line longer than twice the plot width. 1,000 points stay complete. The samplingNone rows draw every point and use the same aligned update timer.",
      bundle: "gzip -9. ChartKit’s headline line is scripts/size.mjs. Competitor rows and the harness chartkit-minimal line are the bench harness. uPlot adds its stylesheet, gzipped separately.",
      ssr: "Mean and median of 8 calls after 2 warmups, a 1,000 point line. supported false means no chart without a DOM. Recharts returned an empty wrapper.",
      agents: `${published.model}, temperature ${published.temperature}, ${published.tasks} tasks, one run on ${AGENT_MEASURED}. Not re-run for round 13. Official means the library docs were in the prompt. ChartKit docs are llms.txt. repair() is a no-model step on ChartKit's no-docs first try and is not a second model call. Nivo and uPlot were not in the agent eval.`,
    },
    headline: {
      lineGzipBytes: published.bundleGzip.find((row) => row.id === "chartkit-line")?.bytes,
      lineGzipBuild: "phase-2-d8dcc5a",
      lineGzipMeasured: MEASURED,
      otherFigures: "round 13, measured 2026-10-18 on phase 2 d8dcc5a, except the agent eval",
      nextSmallest: { lib: "uPlot", bytes: published.bundleGzip.find((row) => row.id === "uplot")?.bytes },
      ssrMeanMs: published.ssr[0].meanMs,
      repairNoDocs: { first: published.agents[0].noDocsFirst, afterRepair: published.agents[0].noDocsWithinTwo },
    },
    bundleGzip: published.bundleGzip,
    sizeScriptLineBytes: published.sizeScriptLineBytes,
    browserMs: published.browser,
    samplingNoneMs: published.samplingNone,
    hoverSteady100k: published.hoverSteady100k,
    firstHoverPainted: published.firstHoverPainted,
    ssrMs: published.ssr,
    agents: published.agents,
    losses: [
      "Aligned update, even x, 1,000 points: ChartKit 1.5 ms, uPlot 1.2 ms.",
      "Aligned update, even x, 10,000 points: ChartKit 1.9 ms, uPlot 1.7 ms.",
      "Aligned update, jittered x, 1,000 points: ChartKit 1.6 ms, uPlot 1.4 ms.",
      "Aligned update, gapped timestamps, 1,000 points: ChartKit 1.6 ms, uPlot 1.4 ms.",
      "Aligned update, gapped timestamps, 10,000 points: ChartKit 1.9 ms, uPlot 1.6 ms.",
      "Aligned update, gapped timestamps, 100,000 points: ChartKit 3.5 ms, uPlot 3.4 ms.",
      "Steady hover at 100k, painted median: ChartKit 16.5 ms, uPlot 16.2 ms.",
      "First hover, painted median: ChartKit 20.8 / 15.9 / 16.5 ms at about 50 / 200 / 500 ms after mount. uPlot 4 / 4.6 / 4.9 ms.",
      "No-docs agent first try is 20/42. That eval was not re-run for round 13. repair() reaches 42/42. The other libraries in the eval were already 42/42 with no docs.",
    ],
    urls: {
      html: "https://chartkit.dev/benchmarks",
      markdown: "https://chartkit.dev/benchmarks.md",
      json: "https://chartkit.dev/benchmarks.json",
      schema: BENCHMARKS_SCHEMA_URL,
      whenToUse: "https://chartkit.dev/when-to-use",
    },
    display: {
      headline,
      browserRows,
      samplingRows,
      hoverRows,
      firstHoverRows,
      agentRows,
    },
  };
}

export const benchmarksSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: BENCHMARKS_SCHEMA_URL,
  title: "ChartKit benchmarks",
  type: "object",
  required: ["round", "measured", "methodology", "bundleGzip", "browserMs", "samplingNoneMs", "ssrMs", "agents", "losses"],
  additionalProperties: true,
  properties: {
    round: { type: "integer" },
    measured: { type: "string" },
    methodology: { type: "object" },
    bundleGzip: {
      type: "array",
      items: {
        type: "object",
        required: ["lib", "bytes"],
        properties: {
          lib: { type: "string" },
          bytes: { type: "integer" },
          reactExternal: { type: "boolean" },
        },
      },
    },
    browserMs: { type: "array" },
    samplingNoneMs: { type: "array" },
    ssrMs: { type: "array" },
    agents: { type: "array" },
    losses: { type: "array", items: { type: "string" } },
  },
} as const;

export function benchmarksMarkdown(): string {
  const doc = benchmarksPayload();
  const bundle = doc.bundleGzip
    .map((row) => `| ${row.lib} | ${row.entry} | ${row.bytes.toLocaleString("en-US")} | ${row.reactExternal ? "React external" : ""} |`)
    .join("\n");
  const ms = (value: number) => value.toFixed(1);
  const browser = doc.browserMs
    .map(
      (row) =>
        `| ${row.shape} | ${row.points.toLocaleString("en-US")} | ${ms(row.chartkit.initial)} | ${ms(row.uplot.initial)} | ${ms(row.chartkit.update)} | ${ms(row.uplot.update)} | ${row.result} |`,
    )
    .join("\n");
  const hover = doc.hoverSteady100k
    .map((row) => `| ${row.lib} | ${row.tipMs} | ${row.paintedMs} | ${row.p95Ms} |`)
    .join("\n");
  const firstHover = doc.firstHoverPainted
    .map((row) => `| ${row.afterMountMs} | ${row.chartkit} | ${row.chartkitMax} | ${row.uplot} | ${row.uplotMax} |`)
    .join("\n");
  const sampling = doc.samplingNoneMs
    .map((row) => `| ${row.points.toLocaleString("en-US")} | ${row.initialMs} | ${row.updateMs} |`)
    .join("\n");
  const ssr = doc.ssrMs
    .map((row) => `| ${row.lib} | ${row.supported ? row.meanMs : "—"} | ${row.supported ? row.medianMs : "—"} | ${row.supported ? "yes" : "no chart without a DOM"} |`)
    .join("\n");
  const agents = doc.agents
    .map((row) =>
      row.inEval
        ? `| ${row.lib} | ${row.noDocsFirst} / ${published.tasks} | ${row.noDocsWithinTwo} / ${published.tasks} | ${row.officialFirst} / ${published.tasks} | ${row.officialWithinTwo} / ${published.tasks} | ${row.tokensNoDocs} / ${row.tokensOfficial} |`
        : `| ${row.lib} | not in this eval |  |  |  |  |`,
    )
    .join("\n");
  const losses = doc.losses.map((line) => `- ${line}`).join("\n");

  return `# ChartKit benchmarks, round ${doc.round}

Measured ${doc.measured} on phase 2 \`${doc.core.commit}\`. The agent eval was not re-run; it stays ${AGENT_MEASURED}.

${doc.reproduce}

Machine-readable copy: ${doc.urls.json} (schema ${doc.urls.schema}). HTML page: ${doc.urls.html}.

## Methodology

- Browser: ${doc.methodology.browser}
- Updates: ${doc.methodology.updates}
- Sampling: ${doc.methodology.sampling}
- Bundle: ${doc.methodology.bundle} \`scripts/size.mjs\` line is ${doc.sizeScriptLineBytes.toLocaleString("en-US")} bytes. \`/all\` on that script is ${published.sizeScriptAllBytes.toLocaleString("en-US")} bytes.
- Server render: ${doc.methodology.ssr}
- Agents: ${doc.methodology.agents}

## Headline

- Smallest line chart: **${headline.lineGzipBytes} bytes** gzip, \`scripts/size.mjs\` on phase 2 \`${doc.core.commit}\`. Next is ${headline.nextLib} at ${headline.nextGzipBytes} bytes. The harness minimal line is 14,987 bytes.
- Initial render: ChartKit is faster than uPlot in all 12 cells. Even 1,000,000 points is 23.6 ms vs 26.5 ms.
- Aligned update: ChartKit wins 6 of 12 cells against uPlot and loses the 6 listed below. It is not a sweep.
- Server render: **${headline.ssrLabel}** mean (median ${published.ssr[0].medianMs} ms).
- \`repair()\`, no model call, no docs: **${headline.repair}**. That agent run is ${AGENT_MEASURED}, not round 13.

## Losses

${losses}

## Bundle, gzip -9

| Library | Entry | Bytes | Note |
| --- | --- | ---: | --- |
${bundle}

## Browser, milliseconds, ChartKit mount().update() vs uPlot setData

ChartKit wins every initial cell. The update column is the fair timer. Six of those twelve cells are losses, and they are marked in the result column.

| X spacing | Points | ChartKit initial | uPlot initial | ChartKit update | uPlot update | Result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${browser}

In these same 12 cells ChartKit’s initial and aligned update are both faster than Chart.js and Observable Plot. Even 1,000,000 points: Chart.js updates in 189.8 ms and Plot in 1,295.8 ms. ECharts, Recharts, and Nivo are not in the round 13 browser rows, so this file does not give them a browser millisecond.

## Hover

Steady hover at 100,000 points. Painted median is the number to cite. ChartKit 16.5 ms, uPlot 16.2 ms.

| Library | Tip ms | Painted median ms | Painted p95 ms |
| --- | ---: | ---: | ---: |
${hover}

First hover on a fresh 100,000 point chart, painted median. uPlot is about 4–5 ms. ChartKit is 15.9–20.8 ms. That gap is a loss.

| After mount | ChartKit painted | ChartKit max | uPlot painted | uPlot max |
| ---: | ---: | ---: | ---: | ---: |
${firstHover}

## Sampling none, ChartKit only, fair timer

| Points | Initial ms | Update ms |
| ---: | ---: | ---: |
${sampling}

## Server render, 1,000 point line

| Library | Mean ms | Median ms | SVG without a DOM |
| --- | ---: | ---: | --- |
${ssr}

## Agent eval

Tasks: ${published.tasks}. Model: ${published.model}. Temperature: ${published.temperature}.

| Library | No docs, first | No docs, within two | Official, first | Official, within two | Mean first-try tokens, no docs / official |
| --- | --- | --- | --- | --- | --- |
${agents}

ChartKit's no-docs first try plus \`repair()\` is ${published.agents[0].noDocsWithinTwo}/${published.tasks}. Official first try is already ${published.agents[0].officialFirst}/${published.tasks}. The other libraries have no repair step. Nivo and uPlot were not in this eval, so this file does not invent scores for them.

A ChartKit-only rerun with llms.txt cut to 6,329 bytes scored 41/42 on the first try. The miss was combo axis CK3002, which repair() does not patch. The headline uses the full docs file.
${canvasMarkdown()}`;
}

interface CanvasBenchRow {
  id: string;
  library: string;
  points: number;
  status: string;
  renderMs?: number | null;
  initialMs?: number | null;
  updateMs?: number | null;
}

function canvasFile(): { measured: string; samples: number; rows: CanvasBenchRow[] } | null {
  const file = join(dirname(fileURLToPath(import.meta.url)), "../data/canvas-bench.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as { measured: string; samples: number; rows: CanvasBenchRow[] };
}

function canvasAt(rows: CanvasBenchRow[], id: string, points: number): CanvasBenchRow | undefined {
  return rows.find((row) => row.id === id && row.points === points && row.status === "ok");
}

function ms(value: number | null | undefined): string {
  return typeof value === "number" ? value.toFixed(1) : "—";
}

/** One paragraph instead of a semicolon for every comparison. */
function canvasLossSentence(rows: CanvasBenchRow[]): string {
  const sizes = [10_000, 100_000, 1_000_000];
  const paints = sizes.map((points) => {
    const label = points.toLocaleString("en-US");
    const svg = canvasAt(rows, "chartkit", points);
    const canvas = canvasAt(rows, "chartkit-canvas", points);
    const uplot = canvasAt(rows, "uplot", points);
    return `${label} is ${ms(canvas?.initialMs)} ms against SVG ${ms(svg?.initialMs)} and uPlot ${ms(uplot?.initialMs)}`;
  });
  const renders = sizes.map((points) => {
    const label = points.toLocaleString("en-US");
    const svg = canvasAt(rows, "chartkit", points);
    const canvas = canvasAt(rows, "chartkit-canvas", points);
    return `${label} ${ms(canvas?.renderMs)} vs ${ms(svg?.renderMs)}`;
  });
  const updates = sizes.map((points) => {
    const label = points.toLocaleString("en-US");
    const svg = canvasAt(rows, "chartkit", points);
    const canvas = canvasAt(rows, "chartkit-canvas", points);
    const uplot = canvasAt(rows, "uplot", points);
    const slower = typeof canvas?.updateMs === "number" && typeof svg?.updateMs === "number" && canvas.updateMs > svg.updateMs;
    return `${slower ? "loses" : "wins"} ${label} (${ms(canvas?.updateMs)} vs SVG ${ms(svg?.updateMs)} and uPlot ${ms(uplot?.updateMs)})`;
  });
  return `Canvas loses first paint at every size: ${paints.join("; ")}. Render is slower at every size: ${renders.join("; ")}. Updates: ${updates.join("; ")}.`;
}

/** Appendix for the canvas painter. Numbers come from docs/data/canvas-bench.json. */
export function canvasMarkdown(): string {
  const bench = canvasFile();
  if (!bench) return "";
  const sizes = [10_000, 100_000, 1_000_000];
  const lines = sizes.map((points) => {
    const svg = canvasAt(bench.rows, "chartkit", points);
    const canvas = canvasAt(bench.rows, "chartkit-canvas", points);
    const uplot = canvasAt(bench.rows, "uplot", points);
    const label = points.toLocaleString("en-US");
    return `| ${label} | ${ms(svg?.renderMs)} | ${ms(canvas?.renderMs)} | ${ms(svg?.initialMs)} | ${ms(canvas?.initialMs)} | ${ms(uplot?.initialMs)} | ${ms(svg?.updateMs)} | ${ms(canvas?.updateMs)} | ${ms(uplot?.updateMs)} |`;
  });
  return `
## Canvas line, ${bench.measured}

Median of ${bench.samples}, Playwright Chromium, a 640×360 line, sampling auto (minmax above twice the plot width). This is not a re-time of round ${ROUND}. Canvas paints sampled points and builds SVG for the axes only. \`render\` includes that paint. First paint waits for the same two frames. uPlot has no separate render number. Sampling none was not re-timed in this run.

| Points | SVG render | Canvas render | SVG first paint | Canvas first paint | uPlot first paint | SVG update | Canvas update | uPlot update |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${lines.join("\n")}

${canvasLossSentence(bench.rows)}
`;
}
