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

interface SpeedDot {
  library: string;
  /** Milliseconds. Measured rows use published medians. Other rows are layout slots. */
  ms: number;
  row: number;
  type: string;
  measured: boolean;
}

const SPEED_LIBS = [
  { name: "ChartKit", color: "#0071e3" },
  { name: "uPlot", color: "#2c2c2e" },
  { name: "Chart.js", color: "#6e6e73" },
  { name: "Observable Plot", color: "#8e8e93" },
  { name: "Recharts", color: "#a8a8ad" },
  { name: "ECharts", color: "#c5c5c9" },
] as const;

/**
 * Libraries that do not have a native chart of that type.
 * catalog/public/features/type.scatter.md — uPlot is partial, not a scatter type.
 * catalog/public/features/type.donut.md — uPlot is none, Observable Plot is manual.
 * catalog/data/measured-sizes.json — those two donut rows are unsupported.
 * catalog/public/features/type.heatmap.md — uPlot manual, Chart.js plugin, Recharts manual.
 * Area and bar are native for every library in this legend.
 */
const SPEED_OMIT: Record<string, readonly string[]> = {
  scatter: ["uPlot"],
  donut: ["uPlot", "Observable Plot"],
  heatmap: ["uPlot", "Chart.js", "Recharts"],
};

/**
 * Layout-only x positions, in milliseconds. Not timings.
 * They are spaced so a pending row reads as a strip, and none of them
 * equals a published line median.
 */
const SPEED_PLACEHOLDER_MS: Record<string, Record<string, number>> = {
  area: { ChartKit: 14, uPlot: 23, "Chart.js": 34, "Observable Plot": 39, Recharts: 58, ECharts: 2400 },
  bar: { ChartKit: 11, uPlot: 19, "Chart.js": 31, "Observable Plot": 42, Recharts: 66, ECharts: 1800 },
  scatter: { ChartKit: 15, "Chart.js": 26, "Observable Plot": 44, Recharts: 72, ECharts: 3200 },
  donut: { ChartKit: 8, "Chart.js": 21, Recharts: 33, ECharts: 700 },
  heatmap: { ChartKit: 18, "Observable Plot": 47, ECharts: 1500 },
};

const SPEED_ROWS = [
  { type: "line", y: 6, pending: false },
  { type: "area", y: 5, pending: true },
  { type: "bar", y: 4, pending: true },
  { type: "scatter", y: 3, pending: true },
  { type: "donut", y: 2, pending: true },
  { type: "heatmap", y: 1, pending: true },
] as const;

function speedDots(hover: readonly { lib: string; paintedMs: number }[]): SpeedDot[] {
  const painted = new Map(hover.map((row) => [row.lib, row.paintedMs]));
  const dots: SpeedDot[] = [];
  for (const lib of SPEED_LIBS) {
    const ms = painted.get(lib.name);
    if (typeof ms !== "number") throw new Error(`published line hover is missing ${lib.name}`);
    dots.push({ library: lib.name, ms, row: 6, type: "line", measured: true });
  }
  for (const row of SPEED_ROWS) {
    if (row.type === "line") continue;
    const slots = SPEED_PLACEHOLDER_MS[row.type];
    if (!slots) throw new Error(`speed plot has no layout slots for ${row.type}`);
    const omit = new Set(SPEED_OMIT[row.type] ?? []);
    for (const lib of SPEED_LIBS) {
      if (omit.has(lib.name)) continue;
      const ms = slots[lib.name];
      if (typeof ms !== "number") throw new Error(`speed plot layout is missing ${row.type} ${lib.name}`);
      if ([...painted.values()].includes(ms)) {
        throw new Error(`speed plot placeholder ${row.type} ${lib.name} collides with a published median`);
      }
      dots.push({ library: lib.name, ms, row: row.y, type: row.type, measured: false });
    }
  }
  return dots;
}

function speedSpec(dots: SpeedDot[], alt: string): Record<string, unknown> {
  return {
    version: "1",
    id: "home-speed-by-type",
    type: "scatter",
    theme: "soft",
    data: dots.map((dot) => ({
      library: dot.library,
      ms: dot.ms,
      row: dot.row,
      ...(dot.measured ? { measured: true } : { placeholder: true }),
    })),
    encoding: {
      x: { field: "ms", scale: { type: "log", domain: [3, 8000] }, format: "duration-ms" },
      y: { field: "row", scale: { domain: [0.42, 6.58], nice: false, zero: false } },
      color: {
        field: "library",
        domain: SPEED_LIBS.map((lib) => lib.name),
        range: SPEED_LIBS.map((lib) => lib.color),
      },
    },
    mark: { pointFill: "hollow", pointSize: 6, opacity: 1 },
    axes: {
      x: { ticks: [5, 10, 50, 100, 500, 1000, 5000] },
      y: { ticks: [6, 5, 4, 3, 2, 1], grid: "dashed" },
    },
    tooltip: false,
    size: { width: 980, height: 460, padding: { left: 112, right: 28, top: 4, bottom: 4 } },
    a11y: { alt },
  };
}

function xmlText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function roundPx(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

/** Hollow markers become filled circles. Measured points keep a white ring so near-ties stay readable. */
function solidifyCircle(tag: string, ring = false): string {
  const stroke = /stroke="([^"]+)"/.exec(tag)?.[1];
  if (!stroke) return tag;
  let next = tag.replace(/fill="none"/, `fill="${stroke}"`).replace(/fill-opacity="[^"]+"/, 'fill-opacity="1"');
  if (ring) {
    next = next.replace(/ stroke="[^"]+"/, ' stroke="#ffffff"').replace(/ stroke-width="1\.5"/, ' stroke-width="1.25"');
  } else {
    next = next.replace(/ stroke="[^"]+"/, "").replace(/ stroke-width="1\.5"/, "");
  }
  return next;
}

/**
 * Scatter has one pointFill for the whole chart, and y is quantitative.
 * The painted SVG is what the homepage shows: measured points filled,
 * pending points left hollow, row names (and "pending") in the margin,
 * legend centered.
 */
function finishSpeedSvg(svg: string, dots: SpeedDot[]): string {
  let next = svg.replace(/<circle\b[^>]*data-ck-i="(\d+)"[^>]*>[\s\S]*?<\/circle>/g, (full, index) => {
    const dot = dots[Number(index)];
    if (!dot) return full;
    const label = dot.measured
      ? `${dot.library}, line, ${dot.ms} ms`
      : `${dot.library}, ${dot.type}, placeholder, not measured`;
    let tag = full
      .replace(/aria-label="[^"]*"/, `aria-label="${xmlText(label)}"`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${xmlText(label)}</title>`);
    if (dot.measured) tag = solidifyCircle(tag, true);
    return tag;
  });
  next = next.replace(/<circle\b(?![^>]*data-ck-i=)[^>]*\/>/g, (tag) => solidifyCircle(tag));
  next = layoutSpeedLegend(next, 980);
  next = liftMeasuredChartKit(next);
  next = labelSpeedRows(next);
  assertSpeedSvg(next, dots);
  return next;
}

function layoutSpeedLegend(svg: string, width: number): string {
  const itemRe =
    /<circle cx="([0-9.]+)" cy="([0-9.]+)" r="4\.5"([^>/]*)\/>\s*<text x="([0-9.]+)" y="([0-9.]+)"([^>]*)>([^<]*)<\/text>/g;
  const items = [...svg.matchAll(itemRe)];
  if (items.length < 2 || items[0].index === undefined) return svg;
  const textWidth = (label: string) => label.length * 6.6;
  const gap = 22;
  const spans = items.map((item) => 11 + textWidth(item[7] ?? ""));
  const total = 4.5 + spans.reduce((sum, span) => sum + span, 0) + gap * (items.length - 1);
  let center = (width - total) / 2 + 4.5;
  const cy = items[0][2] ?? "0";
  const textY = items[0][5] ?? "0";
  const pieces: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const label = item?.[7] ?? "";
    const textX = center + 11;
    pieces.push(
      `<circle cx="${roundPx(center)}" cy="${cy}" r="4.5"${item?.[3] ?? ""}/><text x="${roundPx(textX)}" y="${textY}"${item?.[6] ?? ""}>${label}</text>`,
    );
    center += (spans[i] ?? 0) + gap;
  }
  const last = items[items.length - 1];
  const start = items[0].index;
  const end = (last?.index ?? start) + (last?.[0].length ?? 0);
  return svg.slice(0, start) + pieces.join("") + svg.slice(end);
}

/** ChartKit's line point is a fraction of a pixel from uPlot. Paint it last so the blue stays visible. */
function liftMeasuredChartKit(svg: string): string {
  const re = /<circle\b(?=[^>]*data-ck-name="ChartKit")(?=[^>]*data-ck-i="0")[^>]*>[\s\S]*?<\/circle>/;
  const match = re.exec(svg);
  if (!match || match.index === undefined) return svg;
  const circle = match[0];
  const without = svg.slice(0, match.index) + svg.slice(match.index + circle.length);
  const close = without.indexOf("</g>");
  if (close < 0) return svg;
  return without.slice(0, close) + circle + without.slice(close);
}

function labelSpeedRows(svg: string): string {
  const rows = new Map(SPEED_ROWS.map((row) => [String(row.y), row]));
  return svg.replace(/<text\b([^>]*text-anchor="end"[^>]*)>([1-6])<\/text>/g, (full, attrs: string, digit: string) => {
    const row = rows.get(digit);
    if (!row) return full;
    const name = `<text${attrs}>${row.type}</text>`;
    if (!row.pending) return name;
    const y = / y="([0-9.]+)"/.exec(attrs);
    if (!y) return name;
    const pendingAttrs = attrs
      .replace(/ y="[0-9.]+"/, ` y="${roundPx(Number(y[1]) + 13)}"`)
      .replace(/font-size="11"/, 'font-size="10"')
      .replace(/fill="[^"]*"/, 'fill="#a1a1a6"');
    return `${name}<text${pendingAttrs}>pending</text>`;
  });
}

function assertSpeedSvg(svg: string, dots: SpeedDot[]): void {
  if (!svg.includes(">line</text>")) throw new Error("speed plot is missing the line row label");
  const pending = svg.match(/>pending<\/text>/g)?.length ?? 0;
  if (pending !== 5) throw new Error(`speed plot expected 5 pending labels, found ${pending}`);
  for (const row of SPEED_ROWS) {
    if (!svg.includes(`>${row.type}</text>`)) throw new Error(`speed plot is missing the ${row.type} label`);
  }
  for (const dot of dots) {
    if (dot.measured) {
      if (!svg.includes(`${dot.library}, line, ${dot.ms} ms`)) {
        throw new Error(`speed plot dropped the published ${dot.library} line median`);
      }
    } else if (svg.includes(`${dot.ms}ms`) || svg.includes(`${dot.ms} ms`)) {
      throw new Error(`placeholder ${dot.ms} leaked into the speed plot as a time`);
    }
  }
  const chartkitLine = /<circle\b(?=[^>]*data-ck-name="ChartKit")(?=[^>]*data-ck-i="0")[^>]*>/.exec(svg)?.[0] ?? "";
  if (!chartkitLine.includes('fill="#0071e3"')) throw new Error("ChartKit line point is not filled");
  if (!svg.includes('fill="none"')) throw new Error("speed plot has no hollow placeholder");
  for (const tick of ["5ms", "10ms", "50ms", "100ms", "500ms", "1s", "5s"]) {
    if (!svg.includes(`>${tick}</text>`)) throw new Error(`speed plot is missing the ${tick} tick`);
  }
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

  const speedDotsRows = speedDots(benchmarks.published.hoverSteady100k);
  const speedBits = speedDotsRows
    .filter((dot) => dot.measured)
    .map((dot) => `${dot.library} ${msLabel(dot.ms)} ms`);
  const speedAlt = `Hover-to-paint at 100,000 points by chart type. Line chart, painted median: ${speedBits.join(", ")}. Area, bar, scatter, donut, and heatmap marks are placeholders, not measurements. Libraries without a native type are omitted from those rows.`;
  const speedCaption =
    "Milliseconds, log scale; left is faster. Solid dots are measured. Hollow dots are placeholders until the harness runs that type. Libraries without a native type are omitted from that row.";
  const speedChartSpec = speedSpec(speedDotsRows, speedAlt);

  write(join(out, "home", "story.json"), {
    source: "catalog/lib/benchmarks.ts",
    round: benchmarks.ROUND,
    measured: benchmarks.MEASURED,
    coreCommit: benchmarks.CORE_COMMIT,
    lede: `Hover-to-paint time at 100,000 points, by chart type. Round ${benchmarks.ROUND}, ${benchmarks.MEASURED} measured the line chart; the remaining types run in round ${benchmarks.ROUND + 1}.`,
    lineGzipBytes: benchmarks.headline.lineGzipBytes,
    uplotJsBytes: benchmarks.headline.uplotJsBytes,
    uplotCssBytes: benchmarks.headline.uplotCssBytes,
    uplotSumBytes: benchmarks.headline.uplotSumBytes,
    sizeMeasured: benchmarks.headline.sizeMeasured,
    charts: [
      {
        id: "speed",
        title: "",
        caption: speedCaption,
        alt: speedAlt,
        spec: speedChartSpec,
        svg: finishSpeedSvg(renderChart(speedChartSpec), speedDotsRows),
      },
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
