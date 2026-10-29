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
  browserRivalsOmitted,
  browserRows,
  firstHoverRows,
  headline,
  hoverMarkdown,
  hoverRows,
  published,
  samplingRows,
  updateMethod,
  uplotBrowserLead,
  uplotHeadline,
} from "../lib/benchmarks.ts";
import { paintMatrix } from "../lib/paint-matrix.ts";
import { bundleMatrix, phase4Headline, ssrMatrix } from "../lib/size-matrix.ts";

const phase4 = phase4Headline();

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
      bundle:
        "Phase 4 per-type gzip from bench/results/bundle.json. esbuild minify, gzip level 9. ChartKit is createRenderer of that chart. /all is one bundle. unsupported and not tree-shakeable are labeled. uPlot’s JS and stylesheet are separate responses.",
      ssr: "Phase 4 per-type Node render from bench/results/ssr.json. Median of 5 at the paint-matrix N. unsupported, error, and timeout are labeled. A blank cell is not used.",
      agents: `Round 6 is the scoreboard. ${published.model}, temperature ${published.temperature}, ${published.tasks} tasks, one run on ${AGENT_MEASURED}. Not re-run for round ${ROUND}. Official means the library docs were in the prompt. ChartKit docs are llms.txt. repair() is a no-model step on ChartKit's no-docs first try and is not a second model call. Nivo and uPlot were not in the agent eval.`,
    },
    headline: {
      lineGzipBytes: published.bundleGzip.find((row) => row.id === "chartkit-line")?.bytes,
      barGzipBytes: phase4.barBytes,
      miniAreaGzipBytes: phase4.miniAreaBytes,
      allGzipBytes: phase4.allBytes,
      lineGzipCommit: headline.sizeCommit,
      lineGzipMeasured: headline.sizeMeasured,
      otherFigures: "browser rows are round 13, measured 2026-10-18 on phase 2 d8dcc5a. Bundle and SSR are the phase 4 matrices.",
      bundleVsUplot: {
        chartkitBytes: published.sizeScriptLineBytes,
        uplotJsBytes: Number(headline.uplotJsBytes.replace(/,/g, "")),
        uplotCssBytes: Number(headline.uplotCssBytes.replace(/,/g, "")),
        uplotSumBytes: published.bundleGzip.find((row) => row.id === "uplot")?.bytes,
        result: published.sizeScriptLineBytes > Number(headline.uplotJsBytes.replace(/,/g, "")) ? "loss" : "not-a-loss",
      },
      ssrMeanMs: published.ssr[0].meanMs,
      ssrMedianMs: published.ssr[0].medianMs,
      ssrPoints: published.ssr[0].points,
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
    paint: paintMatrix(),
    bundleMatrix: bundleMatrix(),
    ssrMatrix: ssrMatrix(),
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
  required: ["round", "measured", "methodology", "bundleGzip", "browserMs", "samplingNoneMs", "ssrMs", "agents", "paint", "bundleMatrix", "ssrMatrix"],
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
    paint: {
      type: "object",
      required: ["measuredAt", "libraries", "rows", "caption"],
      properties: {
        measuredAt: { type: "string" },
        libraries: { type: "array", items: { type: "string" } },
        rows: { type: "array" },
        caption: { type: "string" },
      },
    },
    bundleMatrix: {
      type: "object",
      required: ["measuredAt", "libraries", "rows", "counts", "caption"],
      properties: {
        measuredAt: { type: "string" },
        libraries: { type: "array", items: { type: "string" } },
        rows: { type: "array" },
        counts: { type: "object" },
        caption: { type: "string" },
      },
    },
    ssrMatrix: {
      type: "object",
      required: ["measuredAt", "libraries", "rows", "counts", "caption"],
      properties: {
        measuredAt: { type: "string" },
        libraries: { type: "array", items: { type: "string" } },
        rows: { type: "array" },
        counts: { type: "object" },
        caption: { type: "string" },
      },
    },
  },
} as const;

export function benchmarksMarkdown(): string {
  const doc = benchmarksPayload();
  const bundleHead = ["Chart", ...doc.bundleMatrix.libraries].join(" | ");
  const bundleRule = ["---", ...doc.bundleMatrix.libraries.map(() => "---:")].join(" | ");
  const bundleBody = doc.bundleMatrix.rows
    .map((bundleRow) => `| ${bundleRow.label} | ${bundleRow.cells.map((cell) => cell.text).join(" | ")} |`)
    .join("\n");
  const bundleNotes = doc.bundleMatrix.notes.join(" ");
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
  const ssrHead = ["Chart", "Points", ...doc.ssrMatrix.libraries].join(" | ");
  const ssrRule = ["---", "---:", ...doc.ssrMatrix.libraries.map(() => "---:")].join(" | ");
  const ssrBody = doc.ssrMatrix.rows
    .map((ssrRow) => `| ${ssrRow.label} | ${ssrRow.pointsLabel} | ${ssrRow.cells.map((cell) => cell.text).join(" | ")} |`)
    .join("\n");
  const ssrNotes = doc.ssrMatrix.notes.join(" ");
  const agents = doc.agents
    .map((row) =>
      row.inEval
        ? `| ${row.lib} | ${row.noDocsFirst} / ${published.tasks} | ${row.noDocsWithinTwo} / ${published.tasks} | ${row.officialFirst} / ${published.tasks} | ${row.officialWithinTwo} / ${published.tasks} | ${row.tokensNoDocs} / ${row.tokensOfficial} |`
        : `| ${row.lib} | not in this eval |  |  |  |  |`,
    )
    .join("\n");
  const paintHead = ["Chart", "Points", ...doc.paint.libraries].join(" | ");
  const paintRule = ["---", "---:", ...doc.paint.libraries.map(() => "---:")].join(" | ");
  const paintBody = doc.paint.rows
    .map((paintRow) => `| ${paintRow.label} | ${paintRow.pointsLabel} | ${paintRow.cells.map((cell) => cell.text).join(" | ")} |`)
    .join("\n");
  const paintNotes = doc.paint.notes.map((line) => line).join(" ");

  return `# ChartKit benchmarks, round ${doc.round}

Measured ${doc.measured} on phase 2 \`${doc.core.commit}\`. The agent eval was not re-run; it stays ${AGENT_MEASURED}.

${doc.reproduce}

Machine-readable copy: ${doc.urls.json} (schema ${doc.urls.schema}). HTML page: ${doc.urls.html}.

## Methodology

- Browser: ${doc.methodology.browser}
- Updates: ${doc.methodology.updates}
- Sampling: ${doc.methodology.sampling}
- Bundle: ${doc.methodology.bundle} createRenderer line is ${phase4.lineBytes.toLocaleString("en-US")} bytes gzip. Bar is ${phase4.barBytes.toLocaleString("en-US")}. Mini-area is ${phase4.miniAreaBytes.toLocaleString("en-US")}. \`/all\` is ${phase4.allBytes.toLocaleString("en-US")}.
- Server render: ${doc.methodology.ssr}
- Agents: ${doc.methodology.agents}

## Headline

- Line chart: **${headline.lineGzipBytes} bytes** gzip, createRenderer of the line, measured ${headline.sizeMeasured} on \`${headline.sizeCommit}\`. Bar is ${phase4.barBytes.toLocaleString("en-US")}. Mini-area is ${phase4.miniAreaBytes.toLocaleString("en-US")}. \`/all\` is ${phase4.allBytes.toLocaleString("en-US")}. ${headline.bundleLoss} ${headline.lineWins} ${headline.donutWin}
- Initial render: ${uplotHeadline(browserRows).initial}
- Aligned update: ${uplotHeadline(browserRows).update}
- Server render, ${phase4.ssrPoints.toLocaleString("en-US")} point line: **${headline.ssrLabel}** median (mean ${published.ssr[0].meanMs} ms).
- \`repair()\`, no model call, no docs: **${headline.repair}**. That agent run is ${AGENT_MEASURED}, not round 13.

## Paint, two-rAF

${doc.paint.caption}

${paintNotes}

| ${paintHead} |
| ${paintRule} |
${paintBody}

## Bundle, gzip

${doc.bundleMatrix.caption}

${bundleNotes}

| ${bundleHead} |
| ${bundleRule} |
${bundleBody}

## Browser, milliseconds, ChartKit mount().update() vs uPlot setData

${uplotBrowserLead(browserRows)}

| X spacing | Points | ChartKit initial | uPlot initial | ChartKit update | uPlot update | Result |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${browser}

${browserRivalsOmitted}

## Hover

${hoverMarkdown(hoverRows, firstHoverRows).steady}

| Library | Tip ms | Painted median ms | Painted p95 ms |
| --- | ---: | ---: | ---: |
${hover}

${hoverMarkdown(hoverRows, firstHoverRows).fresh}

| After mount | ChartKit painted | ChartKit max | uPlot painted | uPlot max |
| ---: | ---: | ---: | ---: | ---: |
${firstHover}

## Sampling none, ChartKit only, fair timer

| Points | Initial ms | Update ms |
| ---: | ---: | ---: |
${sampling}

## Server render

${doc.ssrMatrix.caption}

${ssrNotes}

| ${ssrHead} |
| ${ssrRule} |
${ssrBody}

## Agent eval

Tasks: ${published.tasks}. Model: ${published.model}. Temperature: ${published.temperature}.

| Library | No docs, first | No docs, within two | Official, first | Official, within two | Mean first-try tokens, no docs / official |
| --- | --- | --- | --- | --- | --- |
${agents}

ChartKit's no-docs first try is ${published.agents[0].noDocsFirst}/${published.tasks}. \`repair()\`, with no model call, takes that output to ${headline.repairTo}. Official first try is ${published.agents[0].officialFirst}/${published.tasks}. The other libraries have no repair step. Nivo and uPlot were not in this eval, so this file does not invent scores for them.

The llms.txt this site serves is ${readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../public/llms.txt")).length.toLocaleString("en-US")} bytes.
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

/** Appendix for the canvas painter. Numbers come from catalog/data/canvas-bench.json. */
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
