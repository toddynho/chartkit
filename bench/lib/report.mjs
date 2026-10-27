import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docsManifest } from "../agent/docs.mjs";
import { GALLERY_TYPES } from "../browser/chart-types.mjs";
import { chartkitAfterRepair, currentCheck, currentRepair, efficiencyFromRows, formatMean, loadRecordedRows } from "./efficiency.mjs";
import { recordedAgentSection } from "./recorded-agent.mjs";

function bytes(value) {
  return value == null ? "—" : String(value);
}

function ms(value) {
  return value == null ? "—" : Number(value).toFixed(2);
}

function gzipTotal(row) {
  if (row.status !== "ok") return null;
  return row.gzipBytes + (row.cssGzipBytes ?? 0);
}

export function renderReport(result) {
  const lines = [];
  lines.push("# ChartKit benchmarks");
  lines.push("");
  lines.push("Honest, reproducible numbers from `npm run bench`. This file is generated. Do not edit it by hand.");
  lines.push("");
  lines.push(`Measured **${result.machine.measuredAt}**, Node **${result.machine.node}**, **${result.machine.platform}**, CPU **${result.machine.cpu}**, **${result.machine.cpuCount}** CPUs.`);
  lines.push("");
  lines.push("Pinned libraries: " + Object.entries(result.versions).map(([name, version]) => `${name} ${version}`).join(", ") + ".");
  lines.push("");
  lines.push("## What this does and does not claim");
  lines.push("");
  lines.push("ChartKit's minimal entry is the registry, one chart, and the midnight theme. The `/all` entry is every chart and every theme, without the validator. React libraries are measured twice: React included, and React external for an app that already ships it. ECharts is the modular import (`echarts/core` plus one series), not the full bundle. uPlot's CSS is a second response. Observable Plot and uPlot have no donut, so those cells are unsupported rather than a fake chart.");
  lines.push("");
  lines.push("The round 13 ChartKit row is SVG. It uses `mark.sampling: \"auto\"` (minmax once a line is longer than twice the plot width). ChartKit sampling none is the same line with `mark.sampling: \"none\"`, measured only at 100,000 and 1,000,000 points. ECharts `sampling` stays off. Every update timer waits for that library's own completion and then the same two animation frames. ECharts completion is the `finished` event, and those two frames come after it. The canvas painter is a later measurement, in the canvas section, and it loses first paint at 10k, 100k, and 1M.");
  lines.push("");
  lines.push("## Bundle size");
  lines.push("");
  lines.push(result.bundle.method);
  lines.push("");
  lines.push("| Library | Chart | Renderer | Status | min | gzip | brotli | gzip, React external |");
  lines.push("|---|---|---|---|---:|---:|---:|---:|");
  for (const row of result.bundle.rows) {
    const gzip = row.status === "ok" ? row.gzipBytes + (row.cssGzipBytes ?? 0) : null;
    const brotli = row.status === "ok" ? row.brotliBytes + (row.cssBrotliBytes ?? 0) : null;
    const min = row.status === "ok" ? row.minBytes + (row.cssMinBytes ?? 0) : null;
    lines.push(`| ${row.library} | ${row.chart} | ${row.renderer} | ${row.status} | ${bytes(min)} | ${bytes(gzip)} | ${bytes(brotli)} | ${bytes(row.reactExternal?.gzipBytes)} |`);
  }
  lines.push("");
  lines.push("uPlot gzip and brotli include the published stylesheet added to the JS bytes as two responses. React external is blank when the bundle does not import React.");
  lines.push("");
  lines.push(bundleVerdict(result.bundle.rows));
  lines.push("");
  lines.push("## Browser render");
  lines.push("");
  lines.push(result.browser.method);
  lines.push("");
  lines.push("| Library | Renderer | Points | Status | Initial ms | Update ms | Heap after render | Heap delta |");
  lines.push("|---|---|---:|---|---:|---:|---:|---:|");
  for (const row of result.browser.rows) {
    const heap = row.heapAfterRender ?? null;
    const delta = row.heapAfterRender != null && row.heapBefore != null ? row.heapAfterRender - row.heapBefore : null;
    lines.push(`| ${row.library ?? row.id} | ${row.renderer ?? "—"} | ${row.points} | ${row.status} | ${ms(row.initialMs)} | ${ms(row.updateMs)} | ${bytes(heap)} | ${bytes(delta)} |`);
  }
  lines.push("");
  lines.push(browserVerdict(result.browser.rows));
  lines.push("");
  lines.push(...chartPaintLines(result.browser));
  lines.push("");
  const frameNote = updateFrameNote(result.browser.rows);
  if (frameNote) {
    lines.push(frameNote);
    lines.push("");
  }
  lines.push("### ChartKit before and after sampling");
  lines.push("");
  lines.push("Before is the single sample from 2026-10-16T15:19:52.560Z, when ChartKit drew every point (`sampling` did not exist). After is this run's median. The before 1,000,000-point row was an error SVG: `Math.min(...values)` threw `Maximum call stack size exceeded`, `render` caught it, and the harness treated the error SVG as a successful paint. A Node replay of that spec returned a 396-byte `ck-chart-error` in 257.5 ms. Those two timings are not a drawn million-point line.");
  lines.push("");
  lines.push("| Points | Before initial / update | After initial / update | Before note |");
  lines.push("|---:|---:|---:|---|");
  const before = [
    [1000, 18.7, 25.1, "full path"],
    [10000, 23.6, 45.5, "full path"],
    [100000, 123.8, 1202.3, "full path; update was one sample and slower than the error-SVG 1M row"],
    [1000000, 260.8, 239.7, "error SVG, not a chart"],
  ];
  for (const [points, initial, update, note] of before) {
    const after = result.browser.rows.find((row) => (row.library === "ChartKit" || row.id === "chartkit") && row.points === points);
    const afterCell = after && after.status === "ok" ? `${ms(after.initialMs)} / ${ms(after.updateMs)}` : after ? after.status : "—";
    lines.push(`| ${points} | ${initial.toFixed(2)} / ${update.toFixed(2)} | ${afterCell} | ${note} |`);
  }
  lines.push("");
  lines.push("### ChartKit before and after the typed-column path");
  lines.push("");
  lines.push("Before is the median of 5 from 2026-10-16T15:40:22.418Z, after sampling was added and before typed columns stayed in place. After is this run. The machines can differ; the library table above is the same-machine comparison.");
  lines.push("");
  lines.push("| Points | Before initial / update | After initial / update |");
  lines.push("|---:|---:|---:|");
  const columnBefore = [
    [1000, 21.8, 31.8],
    [10000, 17.0, 28.8],
    [100000, 35.1, 21.1],
    [1000000, 213.9, 171.3],
  ];
  for (const [points, initial, update] of columnBefore) {
    const after = result.browser.rows.find((row) => (row.library === "ChartKit" || row.id === "chartkit") && row.points === points);
    const afterCell = after && after.status === "ok" ? `${ms(after.initialMs)} / ${ms(after.updateMs)}` : after ? after.status : "—";
    lines.push(`| ${points} | ${initial.toFixed(2)} / ${update.toFixed(2)} | ${afterCell} |`);
  }
  lines.push("");
  lines.push("On a cold page, constructing `Intl.NumberFormat` for the tick labels was about 10 ms, and `Array.from` on a 100k Float64 column was about 6 ms. This run keeps those columns in place and formats `en-US` ticks without `Intl`. Replacing `innerHTML` with the sampled SVG measured 0.2 ms, and the next animation frames matched a mutation that did nothing. Writing the path `d` attribute in place matched `innerHTML`. The earlier 10k update gap was partly the timer: ChartKit waited for two animation frames and ECharts waited only for `finished`. This run gives every library the same two frames after its own completion.");
  lines.push("");
  lines.push(...canvasReportLines());
  lines.push("");
  lines.push("The round 13 ChartKit row still downsamples with `mark.sampling: \"auto\"` (minmax above twice the 572px plot width, so 1,000 points stay complete and 10k, 100k, and 1M do not). The ChartKit sampling none row draws every point at 100k and 1M. ECharts `sampling` stayed off. Canvas first-paint losses are in the section above.");
  lines.push("");
  lines.push("## Server render");
  lines.push("");
  lines.push(result.ssr.method);
  lines.push("");
  lines.push("| Library | Renderer | Status | Mean ms | Median ms | Min ms | Error |");
  lines.push("|---|---|---|---:|---:|---:|---|");
  for (const row of result.ssr.rows) {
    lines.push(`| ${row.library} | ${row.renderer} | ${row.status} | ${ms(row.meanMs)} | ${ms(row.medianMs)} | ${ms(row.minMs)} | ${row.error ? row.error.replaceAll("|", "/") : "—"} |`);
  }
  lines.push("");
  lines.push(ssrVerdict(result.ssr.rows));
  lines.push("");
  lines.push("## Agent first-try eval");
  lines.push("");
  lines.push(agentSection(result.agent));
  lines.push("");
  const recorded = recordedAgentSection();
  if (recorded) {
    lines.push(recorded);
    lines.push("");
  }
  lines.push(fairConditionsSection(result.agent));
  lines.push("");
  lines.push("## Reproduce");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run bench");
  lines.push("```");
  lines.push("");
  lines.push("Non-LLM only: `npm run bench -- --skip-agent`. The agent section runs when `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. `BENCH_LLM_PROVIDER` is `openai` or `anthropic`. `BENCH_LLM_MODEL` overrides the default model. `BENCH_AGENT_LOG` checkpoints rows for resume. `BENCH_LIBRARIES` limits a run. `BENCH_DOCS=none` (the default) is the no-docs condition: one paragraph per library. `BENCH_DOCS=official` prepends that library's own doc. A finished run is also written to `bench/results/agent/conditions/`, which is gitignored local scratch and is not the published scoreboard. A failed validate, render, compile, or library-use check is sent back once.");
  lines.push("");
  return lines.join("\n");
}

function chartPaintLines(browser) {
  const charts = browser?.charts;
  if (!charts) return [];
  const lines = ["### Chart type paint", ""];
  if (browser.chartMethod) {
    lines.push(browser.chartMethod);
    lines.push("");
  }
  lines.push("Homepage row `area` is native `stacked-area`. `gzipBytes` and `ssrMs` are null until a later phase. A full run writes the same cells to `bench/results/latest.json` under `browser.charts` and to `bench/results/paint.json`. One-sample runs write `bench/results/paint-smoke.json` and are not published medians. Unsupported cells are an honest omit: no native chart of that shape, and no invented time.");
  lines.push("");
  lines.push("| Chart | Homepage | Library | Variant | Renderer | N | Status | Initial ms | Update ms | gzip | SSR ms | N means |");
  lines.push("|---|---|---|---|---|---:|---|---:|---:|---:|---:|---|");
  const chartOrder = new Map(GALLERY_TYPES.map((id, index) => [id, index]));
  const shown = charts.slice().sort((a, b) => {
    const byChart = (chartOrder.get(a.chart) ?? 99) - (chartOrder.get(b.chart) ?? 99);
    if (byChart) return byChart;
    if (a.points !== b.points) return a.points - b.points;
    return String(a.library).localeCompare(String(b.library));
  });
  for (const row of shown) {
    const gzip = row.gzipBytes == null ? "—" : String(row.gzipBytes);
    const ssr = row.ssrMs == null ? "—" : ms(row.ssrMs);
    const detail = row.status === "ok"
      ? (row.nMeaning ?? "")
      : [row.nMeaning, row.method, row.error].filter(Boolean).join(" — ");
    const note = detail.replaceAll("|", "/").replace(/\s+/g, " ").trim();
    lines.push(`| ${row.chart ?? row.id} | ${row.homepageRow ?? "—"} | ${row.library ?? row.id} | ${row.variant ?? "—"} | ${row.renderer ?? "—"} | ${row.points} | ${row.status} | ${ms(row.initialMs)} | ${ms(row.updateMs)} | ${gzip} | ${ssr} | ${note} |`);
  }
  lines.push("");
  if (charts.length === 0) {
    lines.push("No chart-type cells in this run.");
    return lines;
  }
  const failed = charts.filter((row) => row.status !== "ok" && row.status !== "unsupported");
  const unsupported = charts.filter((row) => row.status === "unsupported");
  lines.push(failed.length
    ? `Chart-type cells that failed: ${failed.map((row) => `${row.library} ${row.chart} n=${row.points} ${row.status}`).join(", ")}.`
    : "Every timed chart-type cell in this run is ok.");
  if (unsupported.length) lines.push(`${unsupported.length} cells are unsupported: the library has no native chart of that shape, and the time is null.`);
  return lines;
}

function bundleVerdict(rows) {
  const minimal = rows.filter((row) => row.library === "ChartKit minimal" && row.status === "ok");
  const sentences = [];
  for (const chart of ["line", "bar", "donut"]) {
    const ours = minimal.find((row) => row.chart === chart);
    if (!ours) continue;
    const oursGzip = gzipTotal(ours);
    const others = rows.filter((row) => row.chart === chart && row.library !== "ChartKit minimal" && row.library !== "ChartKit all");
    const smaller = [];
    const larger = [];
    const missing = [];
    for (const row of others) {
      if (row.status !== "ok") {
        missing.push(`${row.library} (${row.status})`);
        continue;
      }
      const gzip = gzipTotal(row);
      const external = row.reactExternal?.gzipBytes;
      const compare = external ?? gzip;
      const label = external != null ? `${row.library} React-external ${external} gzip (React included ${gzip})` : `${row.library} ${gzip} gzip`;
      if (oursGzip < compare) smaller.push(label);
      else larger.push(label);
    }
    sentences.push(`Minimal ${chart} is ${oursGzip} gzip. Smaller than: ${smaller.join("; ") || "none"}. Not smaller than: ${larger.join("; ") || "none"}. No number: ${missing.join("; ") || "none"}.`);
  }
  const allLine = rows.find((row) => row.library === "ChartKit all" && row.chart === "line" && row.status === "ok");
  if (allLine) sentences.push(`ChartKit /all line bundle is ${gzipTotal(allLine)} gzip.`);
  return sentences.join("\n\n");
}

function browserVerdict(rows) {
  const sizes = [...new Set(rows.map((row) => row.points))];
  const sentences = [];
  for (const points of sizes) {
    const group = rows.filter((row) => row.points === points);
    const ok = group.filter((row) => row.status === "ok" && row.initialMs != null).sort((a, b) => a.initialMs - b.initialMs);
    if (ok.length === 0) {
      sentences.push(`At ${points} points every library failed or was skipped.`);
      continue;
    }
    const fastest = ok[0];
    const ours = ok.find((row) => row.library === "ChartKit" || row.id === "chartkit");
    const failed = group.filter((row) => row.status !== "ok").map((row) => {
      const name = `${row.library ?? row.id} ${row.status}`;
      return row.error ? `${name} (${row.error})` : name;
    });
    const rank = ours ? ok.indexOf(ours) + 1 : null;
    sentences.push(
      `At ${points} points the fastest initial render is ${fastest.library} (${fastest.renderer}) at ${fastest.initialMs.toFixed(2)} ms.` +
        (rank ? ` ChartKit initial render is ${ours.initialMs.toFixed(2)} ms, rank ${rank} of ${ok.length}.` : " ChartKit has no successful timing at this size.") +
        (failed.length ? ` Failed or skipped: ${failed.join(", ")}.` : ""),
    );
  }
  return sentences.join("\n\n");
}

function updateFrameNote(rows) {
  const group = rows.filter((row) => row.points === 10000 && row.status === "ok" && row.updateMs != null);
  const ours = group.find((row) => row.library === "ChartKit");
  if (!ours) return "";
  const fastest = [...group].sort((a, b) => a.updateMs - b.updateMs)[0];
  const samples = Array.isArray(ours.updateSamples) ? ours.updateSamples.map((value) => Number(value).toFixed(2)).join(", ") : "";
  const full = rows.find((row) => row.library === "ChartKit sampling none" && row.points === 100000 && row.status === "ok");
  const million = rows.find((row) => row.library === "ChartKit sampling none" && row.points === 1000000);
  const fullCell = full
    ? ` ChartKit sampling none at 100,000 points is ${full.initialMs.toFixed(2)} ms initial and ${full.updateMs.toFixed(2)} ms update.`
    : "";
  const millionCell = million
    ? ` At 1,000,000 points with sampling none the status is ${million.status}${million.status === "ok" ? ` (${million.initialMs.toFixed(2)} ms initial, ${million.updateMs.toFixed(2)} ms update)` : million.error ? ` (${million.error})` : ""}.`
    : "";
  const echarts = rows.find((row) => row.library === "ECharts" && row.points === 100000 && row.status === "ok");
  const echartsCell = echarts && echarts.updateMs > 500
    ? ` ECharts at 100,000 points updates in ${echarts.updateMs.toFixed(2)} ms; the shared frames now wait for that canvas to paint, which the old finished-only timer did not.`
    : "";
  return `At 10,000 points the fastest update is ${fastest.library} at ${fastest.updateMs.toFixed(2)} ms. ChartKit update is ${ours.updateMs.toFixed(2)} ms${samples ? ` (samples ${samples})` : ""}. Those samples sit on the two-frame wait. The sampled SVG replacement is not a separate hotspot in that cell.${fullCell}${millionCell}${echartsCell}`;
}

function ssrVerdict(rows) {
  const ok = rows.filter((row) => row.status === "ok").sort((a, b) => a.meanMs - b.meanMs);
  const no = rows.filter((row) => row.status !== "ok").map((row) => row.library);
  if (ok.length === 0) return "No library produced a chart in Node without a DOM.";
  return `Server render succeeded for ${ok.map((row) => `${row.library} (${row.meanMs.toFixed(2)} ms mean)`).join(", ")}. No server render without a DOM: ${no.join(", ") || "none"}.`;
}

function agentSection(agent) {
  const protocol = "A code-library pass must import that library and return a drawn chart, or set `meta.unsupported` when the library cannot draw the chart. Recharts and Chart.js run in Playwright. A Recharts pass needs an SVG with data marks. A Chart.js pass needs painted canvas pixels. ECharts code that touches `document` runs in Playwright; `echarts.init(null, …, { ssr: true })` stays in Node and the SVG must contain marks. The chart type is read from that rendered chart (Chart.js `config.type`, ECharts series type, Recharts `chartName`). `meta.type` is not evidence. Data values come from the rendered chart, not from `meta`. ChartKit values are compared as numbers. Validator errors, render errors, compile errors, and library-use failures are fed back once. The first-try column ignores that repair.";
  if (!agent || agent.status !== "ok") {
    return [
      `Fair-scoring protocol on this branch: ${protocol}`,
      "",
      `Status of a fair-scoring run: **${agent?.status ?? "not yet run"}**.`,
      "",
      agent?.reason ?? "No model was called.",
      "",
      `The fixed set has ${agent?.taskCount ?? "—"} tasks covering all 14 chart types.`,
    ].join("\n");
  }
  const lines = [
    `Fair-scoring protocol: ${protocol}`,
    "",
    `Provider **${agent.provider}**, model **${agent.model}**. First try ${agent.passed} / ${agent.attempts}.`,
  ];
  if (agent.repair) {
    lines.push(`Repair: ${agent.repair.retried} retried, ${agent.repair.recovered} recovered, ${agent.repair.passedWithinTwo} / ${agent.attempts} passed within two tries.`);
  }
  lines.push("");
  lines.push("| Library | First try | Second try recovered | Honest unsupported |");
  lines.push("|---|---:|---:|---:|");
  const byLib = new Map();
  for (const row of agent.results) {
    const bucket = byLib.get(row.library) ?? { pass: 0, fail: 0, unsupported: 0, recovered: 0, n: 0 };
    bucket.n += 1;
    if (row.ok && row.status === "unsupported") bucket.unsupported += 1;
    else if (row.ok) bucket.pass += 1;
    else bucket.fail += 1;
    if (!row.ok && row.second?.ok) bucket.recovered += 1;
    byLib.set(row.library, bucket);
  }
  for (const [library, bucket] of byLib) {
    lines.push(`| ${library} | ${bucket.pass + bucket.unsupported} / ${bucket.n} | ${bucket.recovered} | ${bucket.unsupported} |`);
  }
  if (agent.docs) lines.push("", `This run's doc condition: **${agent.docs}**.`);
  return lines.join("\n");
}

const round5Dir = join(dirname(fileURLToPath(import.meta.url)), "../results/agent/round-5");
const round6Dir = join(dirname(fileURLToPath(import.meta.url)), "../results/agent/round-6");

function loadRound(dir, name) {
  const path = join(dir, name);
  if (!existsSync(path)) return null;
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  return parsed.agent?.status === "ok" ? parsed.agent : parsed.status === "ok" ? parsed : null;
}

function meanOutput(rows) {
  const tokens = rows
    .map((row) => row.usage?.output_tokens)
    .filter((value) => typeof value === "number" && Number.isFinite(value));
  if (tokens.length === 0) return "—";
  const rounded = Math.round((tokens.reduce((sum, value) => sum + value, 0) / tokens.length) * 10) / 10;
  return `${rounded.toFixed(1)} (n=${tokens.length})`;
}

function scoreCounts(rows, library) {
  const list = (rows ?? []).filter((row) => row.library === library);
  const first = list.filter((row) => row.ok).length;
  const within = first + list.filter((row) => !row.ok && row.second?.ok).length;
  const supported = list.filter((row) => row.status !== "unsupported");
  return {
    n: list.length,
    first,
    within,
    allMean: meanOutput(list),
    supportedMean: meanOutput(supported),
  };
}

function round5Section() {
  const none = loadRound(round5Dir, "no-docs.json");
  const official = loadRound(round5Dir, "official.json");
  const lines = [];
  lines.push("Round 5 was run outside this repo at bench `bc7ee8e`, plus a full-pixel Chart.js ink scan. A 32 by 32 sample had missed a thin line. One model, claude-sonnet-4-5, temperature 0, one run, 2026-10-16. Code-library passes include a correct unsupported answer. The raw rows are `bench/results/agent/round-5/`. These scores are that protocol. They are not the drawn-shape column.");
  lines.push("");
  if (!none?.results || !official?.results) {
    lines.push("Round 5 rows were not found under `bench/results/agent/round-5/`.");
    return lines.join("\n");
  }
  lines.push("| Library | Round 5 no docs first | Round 5 no docs within two | Round 5 official first | Round 5 official within two | Round 5 no docs mean first-try output tokens, all / supported | Round 5 official mean first-try output tokens, all / supported |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");
  for (const library of ["chartkit", "recharts", "echarts", "chartjs"]) {
    const left = scoreCounts(none.results, library);
    const right = scoreCounts(official.results, library);
    lines.push(`| ${library} | ${left.first} / ${left.n} | ${left.within} / ${left.n} | ${right.first} / ${right.n} | ${right.within} / ${right.n} | ${left.allMean} / ${left.supportedMean} | ${right.allMean} / ${right.supportedMean} |`);
  }
  lines.push("");
  lines.push("Mean first-try output tokens are `usage.output_tokens` on the first answer. The second try is not included. Supported drops a correct unsupported answer. Recharts, ECharts, and Chart.js have no `repair()` step.");
  const check = currentCheck();
  const noDocsRepair = chartkitAfterRepair(none.results, check.tasks, check.repair, check.checkChartKit);
  const officialRepair = chartkitAfterRepair(official.results, check.tasks, check.repair, check.checkChartKit);
  lines.push(`ChartKit \`repair()\`, measured at \`bc7ee8e\` with \`checkChartKit\` before the y-field list and combo mark patches: no docs 40 / 42, official 42 / 42. The two no-docs specs that \`repair()\` did not fix were stack-queue (\`encoding.y.field\` was an array) and combo-weather (\`type: "bar"\` on a y item). Recomputed on these same first-try outputs with the current \`repair()\` and the drawn-shape check: no docs ${noDocsRepair.passed} / ${noDocsRepair.checked}${noDocsRepair.misses.length ? ` (still ${noDocsRepair.misses.join(", ")})` : ""}, official ${officialRepair.passed} / ${officialRepair.checked}${officialRepair.misses.length ? ` (still ${officialRepair.misses.join(", ")})` : ""}. The recomputed rate is not the round-5 score.`);
  return lines.join("\n");
}

function round6Section() {
  const none = loadRound(round6Dir, "no-docs.json");
  const official = loadRound(round6Dir, "official.json");
  const lines = [];
  lines.push("Round 6 is the current scoreboard. It was run outside this repo at bench `5a026be`. One model, claude-sonnet-4-5, temperature 0, one run, 2026-10-16. The checker required drawn ChartKit shapes, including bars inside the plot. Raw rows are `bench/results/agent/round-6/`. A later change counts one rect per row per bar series. Every bar task in this run is a single series, so these scores stay the same. `bench/results/agent/conditions/` is gitignored local scratch and is not this scoreboard.");
  lines.push("");
  if (!none?.results || !official?.results) {
    lines.push("Round 6 rows were not found under `bench/results/agent/round-6/`.");
    return lines.join("\n");
  }
  lines.push("| Library | Round 6 no docs first | Round 6 no docs within two | Round 6 official first | Round 6 official within two | Round 6 no docs mean first-try output tokens, all / supported | Round 6 official mean first-try output tokens, all / supported |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");
  for (const library of ["chartkit", "recharts", "echarts", "chartjs"]) {
    const left = scoreCounts(none.results, library);
    const right = scoreCounts(official.results, library);
    lines.push(`| ${library} | ${left.first} / ${left.n} | ${left.within} / ${left.n} | ${right.first} / ${right.n} | ${right.within} / ${right.n} | ${left.allMean} / ${left.supportedMean} | ${right.allMean} / ${right.supportedMean} |`);
  }
  lines.push("");
  lines.push("Mean first-try output tokens are `usage.output_tokens` on the first answer. The second try is not included. Supported drops a correct unsupported answer. Recharts, ECharts, and Chart.js have no `repair()` step.");
  const check = currentCheck();
  const noDocsRepair = chartkitAfterRepair(none.results, check.tasks, check.repair, check.checkChartKit);
  const officialRepair = chartkitAfterRepair(official.results, check.tasks, check.repair, check.checkChartKit);
  lines.push(`ChartKit \`repair()\`, scored with \`checkChartKit\` on the first try and no model call: no docs ${noDocsRepair.passed} / ${noDocsRepair.checked}${noDocsRepair.misses.length ? ` (still ${noDocsRepair.misses.join(", ")})` : ""}, official ${officialRepair.passed} / ${officialRepair.checked}${officialRepair.misses.length ? ` (still ${officialRepair.misses.join(", ")})` : ""}.`);
  return lines.join("\n");
}

function fairConditionsSection(agent) {
  void agent;
  const lines = [];
  lines.push("### Doc conditions");
  lines.push("");
  lines.push("Round 2 was run outside this repo at bench `055196d`, model claude-sonnet-4-5, temperature 0. That protocol gave ChartKit the two-line rule and no how-to-render hint. Recharts, ECharts, and Chart.js got an API hint and no official docs. Those scores are the old-protocol row. A ChartKit-only follow-up prepended `llms.txt` and scored 41 / 42 on the first try and 41 / 42 within two; the miss was `heat-sales`, and the checker now accepts either axis orientation for that task. That follow-up did not give the other libraries their docs, so it is not the with-docs row.");
  lines.push("");
  lines.push("Round 3 was run outside this repo at bench `ee0b474`, same model and temperature. No-docs hints were one line each, and ChartKit's line also named the spec shape. Recharts passed on an empty `recharts-wrapper` because the checker matched `/recharts-/` and trusted `meta.values`. Re-executing those answers found 0 / 24 supported charts with an SVG. The corrected row counts only the 18 tasks that library correctly declined. ECharts Node SSR answers in the official run returned SVG with marks. Chart.js passed when a canvas element existed, without a pixel check. Those scores are the round-3 protocol. They are not the equal-hint, drawn-output column below.");
  lines.push("");
  lines.push("| Library | Round 3 no docs first | Round 3 no docs within two | Round 3 official first | Round 3 official within two |");
  lines.push("|---|---:|---:|---:|---:|");
  lines.push("| chartkit | 31 / 42 | 41 / 42 | 42 / 42 | 42 / 42 |");
  lines.push("| recharts as scored | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 |");
  lines.push("| recharts corrected | 18 / 42 | 18 / 42 | 18 / 42 | 18 / 42 |");
  lines.push("| echarts | 42 / 42 | 42 / 42 | 40 / 42 | 41 / 42 |");
  lines.push("| chartjs | 39 / 42 | 42 / 42 | 42 / 42 | 42 / 42 |");
  lines.push("");
  lines.push("Round 4 was run outside this repo at bench `38282f2`, plus the detached-container search, the 2.5 s Recharts pie wait, and Chart.js scatter x+y capture. Model claude-sonnet-4-5, temperature 0. Recharts, ECharts, and Chart.js were verified drawn. Code-library passes include a correct unsupported answer. The supported / unsupported split was Recharts 24 / 18, ECharts 36 / 6, Chart.js 24 / 18. These scores are that protocol. Round 5 and round 6 follow. Round 6 is the current scoreboard.");
  lines.push("");
  lines.push("| Library | Round 4 no docs first | Round 4 no docs within two | Round 4 official first | Round 4 official within two | Round 4 no docs mean first-try output tokens | Round 4 official mean first-try output tokens |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");
  lines.push("| chartkit | 21 / 42 | 33 / 42 | 42 / 42 | 42 / 42 | 139 | 132 |");
  lines.push("| recharts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 221 | 236 |");
  lines.push("| echarts | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 329 | 364 |");
  lines.push("| chartjs | 42 / 42 | 42 / 42 | 42 / 42 | 42 / 42 | 293 | 259 |");
  lines.push("");
  lines.push("Those token means are the averages reported with the round-4 run. The first-try specs were not saved in this repo, so the pass rate after `repair()` was not recomputed here. Recharts, ECharts, and Chart.js have no `repair()` step. All 9 ChartKit no-docs misses were gauge, kpi, and progress-ring.");
  lines.push("");
  lines.push(round5Section());
  lines.push("");
  lines.push(round6Section());
  lines.push("");
  lines.push("`no docs` gives every library one paragraph of similar length: how to produce a drawn chart, and where the fields go. The paragraphs are the whole hint. They are not official docs, and ChartKit's paragraph does not add channel shapes the others do not get. `with docs` prepends that library's own official text, cut so it is no longer than ChartKit `llms.txt`. A pass requires drawn output. Recharts needs an SVG with data marks (Playwright, `createRoot` and `flushSync`; a detached container counts). Chart.js needs every canvas pixel scanned; a 32 by 32 sample is not enough. The chart type is read from the rendered chart. `meta.type` and `meta.values` are not evidence. ChartKit values are compared as numbers, and ChartKit bars have to sit inside the plot, one rect per row per bar series.");
  lines.push("");
  lines.push("| Library | no docs hint | with docs | Bytes | Source |");
  lines.push("|---|---|---|---:|---|");
  for (const doc of docsManifest()) {
    const also = doc.also?.length ? ` Also ${doc.also.join(", ")}.` : "";
    const index = doc.library === "chartkit"
      ? " This file is the llms.txt."
      : doc.llmsTxt
        ? ` Official llms.txt index: ${doc.llmsTxt}.`
        : " No official llms.txt.";
    lines.push(`| ${doc.library} | ${doc.noDocsHint.replaceAll("|", "/")} | ${doc.title} | ${doc.bytes} | ${doc.url}.${also}${index} ${doc.note} |`);
  }
  lines.push("");
  lines.push("Run `BENCH_DOCS=none` and `BENCH_DOCS=official` separately. A local run writes `bench/results/agent/conditions/`, which is gitignored and is not the published scoreboard.");
  lines.push("");
  lines.push(efficiencySection());
  return lines.join("\n");
}

function efficiencySection() {
  const lines = [];
  lines.push("### Efficiency");
  lines.push("");
  lines.push("Mean first-try output tokens are the average of `usage.output_tokens` on the first answer. The second try is not included. `repair()` is ChartKit only: parse the first-try JSON and apply `repair()` from `@chartkitdev/core/validate`, with no model call. The other libraries have no `repair()` step.");
  lines.push("");
  const recorded = efficiencyFromRows(loadRecordedRows(), currentRepair());
  if (recorded.length === 0) {
    lines.push("No raw rows were found under `bench/results/agent/sonnet-4-5/`.");
  } else {
    lines.push("Computed from `bench/results/agent/sonnet-4-5/` (claude-sonnet-4-5, one attempt, no repair loop). That checker did not require a library import, so these rates are not round 4 and not round 5. The ChartKit column is how many of those first-try specs `repair()` accepts now.");
    lines.push("");
    lines.push(efficiencyTable(recorded));
  }
  lines.push("");
  lines.push("Round 6 token means and the `checkChartKit` repair rate are in the current scoreboard above. `repair().ok` on the same first-try outputs, with no drawn-shape check:");
  lines.push("");
  const none = loadRound(round6Dir, "no-docs.json");
  const official = loadRound(round6Dir, "official.json");
  for (const [label, run] of [["Round 6 no docs", none], ["Round 6 official", official]]) {
    const rows = run?.results;
    if (!rows) {
      lines.push(`${label}: rows not found.`);
      continue;
    }
    lines.push(`${label}, one model, one run, computed from \`bench/results/agent/round-6/\`:`);
    lines.push("");
    lines.push(efficiencyTable(efficiencyFromRows(rows, currentRepair())));
    lines.push("");
  }
  return lines.join("\n");
}

function one(value) {
  return typeof value === "number" ? value.toFixed(1) : "—";
}

function canvasLossLine(rows) {
  const at = (id, points) => rows.find((row) => row.id === id && row.points === points);
  const sizes = [10000, 100000, 1000000];
  const paints = sizes.map((points) => {
    const label = points.toLocaleString("en-US");
    const svg = at("chartkit", points);
    const canvas = at("chartkit-canvas", points);
    const uplot = at("uplot", points);
    return `${label} is ${one(canvas?.initialMs)} ms against SVG ${one(svg?.initialMs)} and uPlot ${one(uplot?.initialMs)}`;
  });
  const renders = sizes.map((points) => {
    const label = points.toLocaleString("en-US");
    const svg = at("chartkit", points);
    const canvas = at("chartkit-canvas", points);
    return `${label} ${one(canvas?.renderMs)} vs ${one(svg?.renderMs)}`;
  });
  const updates = sizes.map((points) => {
    const label = points.toLocaleString("en-US");
    const svg = at("chartkit", points);
    const canvas = at("chartkit-canvas", points);
    const uplot = at("uplot", points);
    const slower = typeof canvas?.updateMs === "number" && typeof svg?.updateMs === "number" && canvas.updateMs > svg.updateMs;
    return `${slower ? "loses" : "wins"} ${label} (${one(canvas?.updateMs)} vs SVG ${one(svg?.updateMs)} and uPlot ${one(uplot?.updateMs)})`;
  });
  return `Canvas loses first paint at every size: ${paints.join("; ")}. Render is slower at every size: ${renders.join("; ")}. Updates: ${updates.join("; ")}.`;
}

/** Canvas line measured separately from round 13. Numbers come from catalog/data/canvas-bench.json. */
function canvasReportLines() {
  const file = join(dirname(fileURLToPath(import.meta.url)), "../../catalog/data/canvas-bench.json");
  if (!existsSync(file)) return ["Canvas comparison: `catalog/data/canvas-bench.json` is missing."];
  const bench = JSON.parse(readFileSync(file, "utf8"));
  const rows = Array.isArray(bench.rows) ? bench.rows : [];
  const at = (id, points) => rows.find((row) => row.id === id && row.points === points);
  const lines = [];
  lines.push(`## Canvas line, ${bench.measured ?? "measured separately"}`);
  lines.push("");
  lines.push("This is not a re-time of the round above. Median of 5, Playwright Chromium, a 640×360 sampled line. Canvas paints the marks and builds SVG for the axes only. First paint waits for the same two frames. Sampling none was not re-timed. Canvas loses first paint at 10k, 100k, and 1M.");
  lines.push("");
  lines.push("| Points | SVG render | Canvas render | SVG first paint | Canvas first paint | uPlot first paint | SVG update | Canvas update | uPlot update |");
  lines.push("| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const points of [10000, 100000, 1000000]) {
    const label = points >= 1000000 ? "1M" : `${points / 1000}k`;
    const svg = at("chartkit", points);
    const canvas = at("chartkit-canvas", points);
    const uplot = at("uplot", points);
    lines.push(`| ${label} | ${one(svg?.renderMs)} | ${one(canvas?.renderMs)} | ${one(svg?.initialMs)} | ${one(canvas?.initialMs)} | ${one(uplot?.initialMs)} | ${one(svg?.updateMs)} | ${one(canvas?.updateMs)} | ${one(uplot?.updateMs)} |`);
  }
  lines.push("");
  lines.push(canvasLossLine(rows));
  lines.push("");
  return lines;
}

function efficiencyTable(stats) {
  const lines = ["| Library | Mean first-try output tokens | After repair(), no model |", "|---|---:|---|"];
  for (const stat of stats) lines.push(`| ${stat.library} | ${formatMean(stat)} | ${stat.repairLabel} |`);
  return lines.join("\n");
}
