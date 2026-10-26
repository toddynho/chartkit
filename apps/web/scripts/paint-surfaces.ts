/**
 * Paint showcase, examples, feature specs, benchmark races, and the playground
 * hero with @chartkitdev/core. Specs stay in catalog/lib and catalog/public. Output
 * is apps/web/.generated and is not committed.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderChart } from "../src/lib/paint-chart.ts";
import type { Diagnostic } from "../src/lib/surface-types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const out = join(root, "apps/web/.generated");
const scriptDir = dirname(fileURLToPath(import.meta.url));

register(pathToFileURL(join(scriptDir, "json-import-hook.mjs")).href, {
  parentURL: import.meta.url,
});

process.chdir(join(root, "catalog"));

const { showcaseBoards } = await import("../../../catalog/lib/showcase.ts");
const { examples, exampleGroups, heroSpec, THEMES } = await import("../../../catalog/lib/specs.ts");
const { FRAMEWORKS, snippetsFor } = await import("../../../catalog/lib/snippets.ts");
const benchmarks = await import("../../../catalog/lib/benchmarks.ts");

function altOf(spec: unknown, fallback: string): string {
  if (typeof spec !== "object" || spec === null) return fallback;
  const a11y = (spec as { a11y?: { alt?: unknown } }).a11y;
  return a11y && typeof a11y.alt === "string" && a11y.alt ? a11y.alt : fallback;
}

function write(file: string, value: unknown): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value));
}

function names(dir: string, ext: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(ext))
    .map((name) => name.slice(0, -ext.length))
    .sort();
}

function sameSet(label: string, left: string[], right: string[]): void {
  const a = [...left].sort();
  const b = [...right].sort();
  if (a.join("\n") !== b.join("\n")) {
    const missing = a.filter((item) => !b.includes(item));
    const extra = b.filter((item) => !a.includes(item));
    throw new Error(`${label} mismatch. missing files ${missing.join(", ") || "—"}; extra files ${extra.join(", ") || "—"}`);
  }
}

function diagnostic(item: { code: string; path: string; message: string; hint?: string }): Diagnostic {
  return { code: item.code, path: item.path, message: item.message, ...(item.hint ? { hint: item.hint } : {}) };
}

function paintShowcase(): number {
  const boards = showcaseBoards();
  const cards = boards.map((board) => {
    const cover = board.charts[0] ?? board.mermaid?.[0]?.chart;
    const repair = board.repairs?.[0];
    const file = {
      slug: board.slug,
      number: board.number,
      title: board.title,
      lede: board.lede,
      charts: board.charts.map((chart) => ({
        id: chart.id,
        title: chart.title,
        caption: chart.caption,
        span: chart.span,
        spec: chart.spec,
        svg: chart.svg,
        alt: altOf(chart.spec, chart.title),
      })),
      options: board.options,
      stacks: board.stacks,
      mermaid: board.mermaid?.map((card) => ({
        id: card.id,
        title: card.title,
        caption: card.caption,
        source: card.source,
        warnings: card.warnings,
        chart: {
          id: card.chart.id,
          title: card.chart.title,
          caption: card.chart.caption,
          span: card.chart.span,
          spec: card.chart.spec,
          svg: card.chart.svg,
          alt: altOf(card.chart.spec, card.chart.title),
        },
      })),
      repairs: board.repairs?.map((item) => ({
        id: item.id,
        title: item.title,
        caption: item.caption,
        broken: item.broken,
        errors: item.errors.map(diagnostic),
        warnings: item.warnings.map(diagnostic),
        applied: item.applied,
        repaired: item.repaired,
        svg: item.svg,
        alt: item.repaired ? altOf(item.repaired, item.title) : item.title,
      })),
      losses: board.losses,
      sources: board.sources,
    };
    const themes = ["soft", "refined", "editorial", "midnight"];
    const check = (spec: Record<string, unknown>) => {
      for (const theme of themes) renderChart({ ...spec, theme });
    };
    for (const chart of file.charts) check(chart.spec);
    for (const card of file.mermaid ?? []) check(card.chart.spec);
    for (const item of file.repairs ?? []) if (item.repaired) check(item.repaired);
    write(join(out, "showcase", `${board.slug}.json`), file);
    return {
      slug: board.slug,
      number: board.number,
      title: board.title,
      lede: board.lede,
      coverSvg: cover?.svg ?? null,
      coverAlt: cover ? altOf(cover.spec, cover.title) : board.title,
      repairSvg: repair?.svg ?? null,
      repairAlt: repair?.repaired ? altOf(repair.repaired, repair.title) : repair?.title ?? "",
    };
  });
  sameSet(
    "showcase markdown",
    boards.map((board) => board.slug),
    names(join(root, "catalog/public/showcase"), ".md"),
  );
  write(join(out, "showcase", "index.json"), { source: "catalog/lib/showcase.ts", boards: cards });
  return boards.length;
}

function paintExamples(): number {
  const groups = exampleGroups.map((label) => ({ id: label.toLowerCase().replace(/\s+/g, "-"), label }));
  const cards = examples.map((example) => {
    const spec = example.spec as unknown as Record<string, unknown>;
    const svg = renderChart(spec);
    const snippets = snippetsFor(example.spec);
    const file = {
      slug: example.slug,
      title: example.title,
      group: example.group,
      groupId: example.group.toLowerCase().replace(/\s+/g, "-"),
      type: example.type,
      blurb: example.blurb,
      svg,
      alt: altOf(spec, example.title),
      spec,
      snippets: FRAMEWORKS.map((item) => ({ id: item.id, label: item.label, code: snippets[item.id] })),
    };
    write(join(out, "examples", `${example.slug}.json`), file);
    return {
      slug: file.slug,
      title: file.title,
      group: file.group,
      groupId: file.groupId,
      type: file.type,
      blurb: file.blurb,
      svg,
      alt: file.alt,
    };
  });
  write(join(out, "examples", "index.json"), { source: "catalog/lib/specs.ts", groups, examples: cards });
  return examples.length;
}

function paintFeatures(): number {
  const data = JSON.parse(readFileSync(join(root, "catalog/public/features.json"), "utf8")) as {
    schemaVersion: string;
    generated: string;
    chartkitCommit: string;
    chartkitRechecked: string;
    dateChecked: string;
    synonymsNote: string;
    coverage: FeatureShape["coverage"];
    taxonomy: { id: string; label: string; desc: string }[];
    notScored: { id: string; name: string; reason: string }[];
    libraries: { id: string; name: string; version: string; bundleGzip?: Record<string, unknown> | null }[];
    features: FeatureShape[];
  };
  type FeatureShape = {
    id: string;
    category: string;
    label: string;
    desc: string;
    badge: string;
    spec: Record<string, unknown> | null;
    cells: Record<string, unknown>;
    coverage?: never;
  };
  const chartkit = data.libraries.find((library) => library.id === "chartkit");
  let drawn = 0;
  for (const feature of data.features) {
    let svg: string | null = null;
    if (feature.spec) {
      svg = renderChart(feature.spec);
      drawn += 1;
    }
    write(join(out, "features", `${feature.id}.json`), {
      id: feature.id,
      category: feature.category,
      label: feature.label,
      desc: feature.desc,
      badge: feature.badge,
      spec: feature.spec,
      svg,
      cells: feature.cells,
    });
  }
  sameSet(
    "feature markdown",
    data.features.map((feature) => feature.id),
    names(join(root, "catalog/public/features"), ".md"),
  );
  write(join(out, "features", "index.json"), {
    source: "catalog/public/features.json",
    schemaVersion: data.schemaVersion,
    generated: data.generated,
    chartkitCommit: data.chartkitCommit,
    chartkitRechecked: data.chartkitRechecked,
    dateChecked: data.dateChecked,
    synonymsNote: data.synonymsNote,
    coverage: data.coverage,
    taxonomy: data.taxonomy,
    notScored: data.notScored,
    chartkit: { version: chartkit?.version ?? "", bundleGzip: chartkit?.bundleGzip ?? null },
    libraries: data.libraries.map((library) => ({ id: library.id, name: library.name })),
    features: data.features.map((feature) => ({
      id: feature.id,
      category: feature.category,
      label: feature.label,
      badge: feature.badge,
    })),
  });
  return drawn;
}

function race(race: { alt: string; caption: string; rows: { lib: string; value: number }[]; id: string; title: string; unit: string }) {
  const spec = benchmarks.raceSpec(race);
  return { svg: renderChart(spec), alt: race.alt, caption: race.caption };
}

function paintBenchmarks(): void {
  benchmarks.assertPublishedMatchesDisplay();
  const bench = JSON.parse(readFileSync(join(root, "catalog/data/canvas-bench.json"), "utf8")) as {
    measured?: string;
    rows: { id: string; points: number; renderMs?: number | null; initialMs?: number | null; updateMs?: number | null }[];
  };
  const at = (id: string, points: number) => bench.rows.find((row) => row.id === id && row.points === points);
  const text = (value: number | null | undefined) => (typeof value === "number" ? value.toFixed(1) : "—");
  const rows: { points: string; cells: string[] }[] = [];
  const losses: string[] = [];
  for (const points of [10_000, 100_000, 1_000_000]) {
    const label = points >= 1_000_000 ? "1,000,000" : points.toLocaleString("en-US");
    const svg = at("chartkit", points);
    const canvas = at("chartkit-canvas", points);
    const uplot = at("uplot", points);
    rows.push({
      points: label,
      cells: [
        text(svg?.renderMs),
        text(canvas?.renderMs),
        text(svg?.initialMs),
        text(canvas?.initialMs),
        text(uplot?.initialMs),
        text(svg?.updateMs),
        text(canvas?.updateMs),
        text(uplot?.updateMs),
      ],
    });
    if (typeof canvas?.initialMs === "number") {
      losses.push(`${label} is ${text(canvas.initialMs)} ms against SVG ${text(svg?.initialMs)} and uPlot ${text(uplot?.initialMs)}`);
    }
  }
  const headline = benchmarks.headline;
  write(join(out, "benchmarks", "page.json"), {
    source: "catalog/lib/benchmarks.ts",
    round: benchmarks.ROUND,
    measured: benchmarks.MEASURED,
    coreCommit: benchmarks.CORE_COMMIT,
    agentMeasured: benchmarks.AGENT_MEASURED,
    updateMethod: benchmarks.updateMethod,
    headline,
    bundle: race(benchmarks.bundleRace),
    initial1k: race(benchmarks.initial1k),
    initial100k: race(benchmarks.initial100k),
    initial1m: race(benchmarks.initial1m),
    ssr: race(benchmarks.ssrRace),
    bundleRows: benchmarks.bundleRows,
    browserRows: benchmarks.browserRows,
    hoverRows: benchmarks.hoverRows,
    firstHoverRows: benchmarks.firstHoverRows,
    samplingRows: benchmarks.samplingRows,
    ssrRows: benchmarks.ssrRows,
    agentRows: benchmarks.agentRows,
    published: {
      model: benchmarks.published.model,
      temperature: benchmarks.published.temperature,
      tasks: benchmarks.published.tasks,
      tokensOfficial: benchmarks.published.agents.slice(0, 4).map((row) => row.tokensOfficial),
    },
    canvas: {
      measured: bench.measured ?? "separately",
      heads: ["SVG render", "Canvas render", "SVG first", "Canvas first", "uPlot first", "SVG update", "Canvas update", "uPlot update"],
      rows,
      losses: losses.join("; "),
    },
  });
}

function paintPlayground(): void {
  const spec = heroSpec as unknown as Record<string, unknown>;
  write(join(out, "playground", "hero.json"), {
    spec,
    svg: renderChart(spec),
    themes: [...THEMES],
  });
}

function bytesLabel(value: number): string {
  return value.toLocaleString("en-US");
}

function msLabel(value: number): string {
  return String(value);
}

/** One horizontal log bar per library. Values are already measured; this only draws them. */
function comparisonSpec(
  id: string,
  rows: { lib: string; value: number }[],
  yTitle: string,
  alt: string,
  width: number,
  height: number,
): Record<string, unknown> {
  return {
    version: "1",
    id,
    type: "bar",
    theme: "soft",
    data: rows.map((row) => ({ lib: row.lib, value: row.value })),
    encoding: {
      x: "lib",
      y: { field: "value", title: yTitle, scale: { type: "log" } },
    },
    mark: { orientation: "horizontal", gap: 0.28 },
    legend: false,
    axes: { y: { title: yTitle } },
    tooltip: { position: "top", fields: [{ field: "value", title: yTitle }] },
    size: { width, height },
    a11y: { alt },
  };
}

/** Homepage story charts. Same published rows as the benchmarks page. */
function paintHomeStory(): void {
  const sizeIds = ["chartkit-line", "uplot", "chartjs", "plot", "recharts", "nivo", "echarts"] as const;
  const sizeRows = sizeIds
    .map((id) => {
      const row = benchmarks.published.bundleGzip.find((item) => item.id === id);
      if (!row) throw new Error(`published bundle is missing ${id}`);
      return row;
    })
    .sort((a, b) => a.bytes - b.bytes);
  const sizeBits = sizeRows.map((row) => {
    const note = row.reactExternal ? ", React external" : row.id === "uplot" ? ", JS plus stylesheet" : "";
    return `${row.lib} ${bytesLabel(row.bytes)}${note}`;
  });
  const sizeCaption = `Gzip bytes, log scale, smaller toward the top. ${sizeBits.join(". ")}. ChartKit is scripts/size.mjs on ${benchmarks.headline.sizeCommit}, measured ${benchmarks.headline.sizeMeasured}. uPlot is smaller. Every other library here is larger.`;
  const sizeAlt = `Line chart gzip. ${sizeBits.join(". ")}. uPlot is the smallest. ChartKit is next.`;

  const hoverRows = [...benchmarks.published.hoverSteady100k].sort((a, b) => a.paintedMs - b.paintedMs);
  const hoverBits = hoverRows.map((row) => `${row.lib} ${msLabel(row.paintedMs)} ms`);
  const hoverChartkit = hoverRows.find((row) => row.lib === "ChartKit");
  const hoverUplot = hoverRows.find((row) => row.lib === "uPlot");
  const hoverGap =
    hoverChartkit && hoverUplot ? Math.round((hoverChartkit.paintedMs - hoverUplot.paintedMs) * 10) / 10 : 0;
  const hoverAhead =
    hoverGap > 0
      ? `uPlot is ${msLabel(hoverGap)} ms ahead of ChartKit.`
      : hoverGap < 0
        ? `ChartKit is ${msLabel(Math.abs(hoverGap))} ms ahead of uPlot.`
        : "ChartKit and uPlot match.";
  const hoverCaption = `Painted median at 100,000 points, log scale. ${hoverBits.join(". ")}. ${hoverAhead} Nivo is not in these hover rows.`;
  const hoverAlt = `Steady hover at 100,000 points. ${hoverBits.join(". ")}.`;

  const ssrRows = benchmarks.published.ssr.filter(
    (row): row is (typeof benchmarks.published.ssr)[number] & { meanMs: number } => typeof row.meanMs === "number",
  );
  const ssrSorted = [...ssrRows].sort((a, b) => a.meanMs - b.meanMs);
  const ssrBits = ssrSorted.map((row) => `${row.lib} ${msLabel(row.meanMs)} ms`);
  const ssrMissing = benchmarks.published.ssr.filter((row) => row.supported === false).map((row) => row.lib);
  const ssrCaption = `Mean of 8 calls after 2 warmups, a 1,000 point line, log scale. ${ssrBits.join(". ")}. ${ssrMissing.join(", ")} did not produce a chart without a DOM.`;
  const ssrAlt = `Server render of a 1,000 point line. ${ssrBits.join(". ")}. ${ssrMissing.join(", ")} produced no chart without a DOM.`;

  const painted = (id: string, title: string, caption: string, spec: Record<string, unknown>) => ({
    id,
    title,
    caption,
    alt: altOf(spec, title),
    spec,
    svg: renderChart(spec),
  });

  write(join(out, "home", "story.json"), {
    source: "catalog/lib/benchmarks.ts",
    round: benchmarks.ROUND,
    measured: benchmarks.MEASURED,
    coreCommit: benchmarks.CORE_COMMIT,
    lede: `ChartKit versus other charting libraries. Round ${benchmarks.ROUND}, measured ${benchmarks.MEASURED}.`,
    lineGzipBytes: benchmarks.headline.lineGzipBytes,
    uplotJsBytes: benchmarks.headline.uplotJsBytes,
    uplotCssBytes: benchmarks.headline.uplotCssBytes,
    uplotSumBytes: benchmarks.headline.uplotSumBytes,
    sizeMeasured: benchmarks.headline.sizeMeasured,
    charts: [
      painted(
        "size",
        "Line chart, gzip",
        sizeCaption,
        comparisonSpec("home-line-gzip", sizeRows.map((row) => ({ lib: row.lib, value: row.bytes })), "Gzip bytes", sizeAlt, 980, 420),
      ),
      painted(
        "hover",
        "Hover at 100,000 points",
        hoverCaption,
        comparisonSpec("home-hover-100k", hoverRows.map((row) => ({ lib: row.lib, value: row.paintedMs })), "Milliseconds", hoverAlt, 640, 340),
      ),
      painted(
        "ssr",
        "Server render, 1,000 points",
        ssrCaption,
        comparisonSpec("home-ssr-1k", ssrSorted.map((row) => ({ lib: row.lib, value: row.meanMs })), "Milliseconds", ssrAlt, 640, 280),
      ),
    ],
  });
}

const showcaseCount = paintShowcase();
const exampleCount = paintExamples();
const featureCharts = paintFeatures();
paintBenchmarks();
paintPlayground();
paintHomeStory();
console.log(`painted showcase ${showcaseCount}, examples ${exampleCount}, feature charts ${featureCharts}, benchmarks, playground, home story`);
