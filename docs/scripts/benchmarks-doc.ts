import {
  CORE_COMMIT,
  HARNESS_COMMIT,
  MEASURED,
  ROUND,
  agentRows,
  assertPublishedMatchesDisplay,
  browserRows,
  headline,
  published,
  samplingRows,
} from "../lib/benchmarks.ts";

export const BENCHMARKS_SCHEMA_URL = "https://chartkit.dev/benchmarks.schema.json";

export function benchmarksPayload() {
  assertPublishedMatchesDisplay();
  return {
    $schema: BENCHMARKS_SCHEMA_URL,
    name: "ChartKit benchmarks",
    round: ROUND,
    measured: MEASURED,
    core: { pullRequest: 6, commit: CORE_COMMIT },
    harness: { pullRequest: 4, commit: HARNESS_COMMIT },
    reproduce: "npm run bench on the harness commit with this core. Median of 5. This file does not re-time the libraries.",
    methodology: {
      browser:
        "Playwright Chromium, a 640×360 line, equal two-frame timers, median of 5. The full run shared the machine (about 11.6 GB of 16 GB in use). quietMs is a later same-session rerun.",
      updates:
        "Update tests sit on a shared two-frame wait. A few milliseconds is frame-timing noise. ChartKit updates land between about 19 and 33 ms on both round 6 core and this core.",
      sampling:
        "mark.sampling defaults to auto and minmax-downsamples a line longer than twice the plot width. 1,000 points stay complete. The samplingNone rows draw every point.",
      bundle: "gzip -9, bench harness. scripts/size.mjs measures the ChartKit line entry separately and is recorded as sizeScriptLineBytes.",
      ssr: "Mean of a 1,000 point line. supported false means no chart without a DOM. Recharts returned an empty wrapper.",
      agents: `${published.model}, temperature ${published.temperature}, ${published.tasks} tasks, one run on ${MEASURED}. Official means the library docs were in the prompt. ChartKit docs are llms.txt. repair() is a no-model step on ChartKit's no-docs first try and is not a second model call. Nivo and uPlot were not in the agent eval.`,
    },
    headline: {
      lineGzipBytes: published.bundleGzip.find((row) => row.id === "chartkit-line")?.bytes,
      nextSmallest: { lib: "uPlot", bytes: published.bundleGzip.find((row) => row.id === "uplot")?.bytes },
      ssrMeanMs: published.ssr[0].meanMs,
      repairNoDocs: { first: published.agents[0].noDocsFirst, afterRepair: published.agents[0].noDocsWithinTwo },
    },
    bundleGzip: published.bundleGzip,
    sizeScriptLineBytes: published.sizeScriptLineBytes,
    browserMs: published.browser,
    samplingNoneMs: published.samplingNone,
    ssrMs: published.ssr,
    agents: published.agents,
    losses: [
      "1,000-point update: ChartKit is last of 7.",
      "10,000-point update: loss. The samples sit inside frame-timing noise.",
      "100,000-point update: loss to uPlot. The round 6 win on this cell was frame noise.",
      "1,000,000-point full run: loss to uPlot on initial and update. The quiet-box initial is a tie (36.3 vs 36.9).",
      "Sampling none at 1,000,000 points: 782.5 ms initial and 53,343.8 ms update, on the loaded box.",
      "No-docs agent first try is 20/42. repair() reaches 42/42. The other libraries in the eval were already 42/42 with no docs.",
      "Tooltip, zoom, pan, brush, animation, and keyboard access validate and are not drawn (CK3011).",
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
  const browser = doc.browserMs
    .map((row) => {
      const updateQuiet = row.fastestUpdate.quietLib
        ? `${row.fastestUpdate.quietLib} ${row.fastestUpdate.quiet}`
        : String(row.fastestUpdate.quiet);
      return `| ${row.points.toLocaleString("en-US")} | ${row.chartkit.initial.full} (${row.chartkit.initial.quiet}) | ${row.chartkit.update.full} (${row.chartkit.update.quiet}) | ${row.fastestInitial.lib} ${row.fastestInitial.full} (${row.fastestInitial.quiet}) | ${row.fastestUpdate.lib} ${row.fastestUpdate.full} (${updateQuiet}) | ${row.result} |`;
    })
    .join("\n");
  const sampling = doc.samplingNoneMs
    .map((row) => `| ${row.points.toLocaleString("en-US")} | ${row.initialMs} | ${row.updateMs} |`)
    .join("\n");
  const ssr = doc.ssrMs
    .map((row) => `| ${row.lib} | ${row.supported ? row.meanMs : "—"} | ${row.quietMs ?? "—"} | ${row.supported ? "yes" : "no chart without a DOM"} |`)
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

Measured ${doc.measured}. Core is pull request #6 at \`${doc.core.commit}\`. The harness is pull request #4 at \`${doc.harness.commit}\`.

${doc.reproduce}

Machine-readable copy: ${doc.urls.json} (schema ${doc.urls.schema}). HTML page: ${doc.urls.html}.

## Methodology

- Browser: ${doc.methodology.browser}
- Updates: ${doc.methodology.updates}
- Sampling: ${doc.methodology.sampling}
- Bundle: ${doc.methodology.bundle} That separate measurement is ${doc.sizeScriptLineBytes.toLocaleString("en-US")} bytes.
- Server render: ${doc.methodology.ssr}
- Agents: ${doc.methodology.agents}

## Headline

- Smallest line chart in the harness: **${headline.lineGzipBytes} bytes** gzip. Next is ${headline.nextLib} at ${headline.nextGzipBytes} bytes.
- Server render: **${headline.ssrLabel}** mean (quiet box ${published.ssr[0].quietMs} ms).
- \`repair()\`, no model call, no docs: **${headline.repair}**.

## Losses

${losses}

## Bundle, gzip -9

| Library | Entry | Bytes | Note |
| --- | --- | ---: | --- |
${bundle}

## Browser, milliseconds

Parentheses are the quiet-box rerun.

| Points | ChartKit initial | ChartKit update | Fastest initial | Fastest update | Result |
| ---: | --- | --- | --- | --- | --- |
${browser}

## Sampling none, ChartKit only

| Points | Initial ms | Update ms |
| ---: | ---: | ---: |
${sampling}

## Server render, 1,000 point line

| Library | Full run mean ms | Quiet ms | SVG without a DOM |
| --- | ---: | ---: | --- |
${ssr}

## Agent eval

Tasks: ${published.tasks}. Model: ${published.model}. Temperature: ${published.temperature}.

| Library | No docs, first | No docs, within two | Official, first | Official, within two | Mean first-try tokens, no docs / official |
| --- | --- | --- | --- | --- | --- |
${agents}

ChartKit's no-docs first try plus \`repair()\` is ${published.agents[0].noDocsWithinTwo}/${published.tasks}. Official first try is already ${published.agents[0].officialFirst}/${published.tasks}. The other libraries have no repair step. Nivo and uPlot were not in this eval, so this file does not invent scores for them.

A ChartKit-only rerun with llms.txt cut to 6,329 bytes scored 41/42 on the first try. The miss was combo axis CK3002, which repair() does not patch. The headline uses the full docs file.
`;
}
