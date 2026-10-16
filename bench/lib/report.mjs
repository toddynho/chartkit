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
  lines.push("ChartKit is SVG-only. `mark.sampling` defaults to `auto` and uses minmax once a line is longer than twice the plot width. ECharts `sampling` was left off so the other libraries draw every point.");
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
  lines.push("### Canvas");
  lines.push("");
  lines.push("Not measured. This run downsamples ChartKit with `mark.sampling: \"auto\"` (minmax above twice the 572px plot width, so 1,000 points stay complete and 10k, 100k, and 1M do not). A Canvas renderer would draw the sampled points without an SVG path node. ECharts `sampling` stayed off.");
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
  lines.push("## Reproduce");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run bench");
  lines.push("```");
  lines.push("");
  lines.push("Non-LLM only: `npm run bench -- --skip-agent`. The agent section runs when `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. `BENCH_LLM_PROVIDER` is `openai` or `anthropic`. `BENCH_LLM_MODEL` overrides the default model.");
  lines.push("");
  return lines.join("\n");
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

function ssrVerdict(rows) {
  const ok = rows.filter((row) => row.status === "ok").sort((a, b) => a.meanMs - b.meanMs);
  const no = rows.filter((row) => row.status !== "ok").map((row) => row.library);
  if (ok.length === 0) return "No library produced a chart in Node without a DOM.";
  return `Server render succeeded for ${ok.map((row) => `${row.library} (${row.meanMs.toFixed(2)} ms mean)`).join(", ")}. No server render without a DOM: ${no.join(", ") || "none"}.`;
}

function agentSection(agent) {
  if (!agent || agent.status !== "ok") {
    return [
      `Status: **${agent?.status ?? "not yet run"}**.`,
      "",
      agent?.reason ?? "No model was called.",
      "",
      `The fixed set has ${agent?.taskCount ?? "—"} tasks covering all 14 chart types. The runner asks for a ChartKit JSON spec and for Recharts, ECharts, and Chart.js modules, then checks validation or compilation, render, chart type, and fields. Chart.js and Recharts have no candlestick, gauge, heatmap, or KPI card; a correct reply for those is \`meta.unsupported\`. Nothing in this section is a model score.`,
    ].join("\n");
  }
  const byLib = new Map();
  for (const row of agent.results) {
    const bucket = byLib.get(row.library) ?? { pass: 0, fail: 0, unsupported: 0 };
    if (row.ok && row.status === "unsupported") bucket.unsupported += 1;
    else if (row.ok) bucket.pass += 1;
    else bucket.fail += 1;
    byLib.set(row.library, bucket);
  }
  const lines = [`Provider **${agent.provider}**, model **${agent.model}**. ${agent.passed} / ${agent.attempts} checks passed.`, ""];
  for (const [library, bucket] of byLib) {
    lines.push(`- ${library}: ${bucket.pass} passed, ${bucket.fail} failed, ${bucket.unsupported} honest unsupported`);
  }
  return lines.join("\n");
}
