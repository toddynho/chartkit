/**
 * Per-type bundle and SSR matrices from bench/results/bundle.json and bench/results/ssr.json.
 * Cell text is the measured value or an explicit state word. Nothing here is filled in by hand.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chartTypes } from "../../apps/web/src/data/chart-types.ts";

export type SizeState = "ok" | "unsupported" | "error" | "timeout";

export type SizeCell = {
  library: string;
  state: SizeState;
  text: string;
  title: string;
};

export type BundleMatrixRow = {
  chart: string;
  label: string;
  cells: SizeCell[];
};

export type SsrMatrixRow = BundleMatrixRow & {
  points: number;
  pointsLabel: string;
};

export type SizeCounts = {
  ok: number;
  unsupported: number;
  error: number;
  timeout: number;
};

type BundleCell = {
  id: string;
  library: string;
  chart: string;
  status: string;
  note: string | null;
  gzipBytes: number | null;
  cssGzipBytes: number | null;
  label: string | null;
  packageId: string | null;
  reactExternalGzip: number | null;
  error: string | null;
};

type SsrCell = {
  id: string;
  library: string;
  chart: string;
  points: number;
  status: string;
  note: string | null;
  error: string | null;
  medianMs: number | null;
  meanMs: number | null;
};

type PackageRow = {
  id: string;
  library: string;
  treeShakeable: boolean;
  gzipBytes: number | null;
  cssGzipBytes: number | null;
};

type BundleFile = {
  measuredAt: string;
  commit: string;
  counts: Record<string, number>;
  packages: PackageRow[];
  cells: BundleCell[];
};

type SsrFile = {
  measuredAt: string;
  commit: string;
  samples: number;
  counts: Record<string, number>;
  cells: SsrCell[];
};

const SKIP_LIBRARY = new Set(["ChartKit canvas", "ChartKit sampling none"]);

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(join(repoRoot(), name), "utf8"));
}

function fmt(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function kbLabel(bytes: number): string {
  return `${(Math.round(bytes / 100) / 10).toFixed(1)} KB`;
}

function pointsLabel(points: number): string {
  return points.toLocaleString("en-US");
}

function formatMs(ms: number): string {
  const rounded = Math.round(ms * 100) / 100;
  return rounded.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function clip(text: string | null): string {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 180 ? `${flat.slice(0, 179)}…` : flat;
}

function day(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : iso;
}

function shortCommit(commit: string): string {
  return commit.slice(0, 7);
}

function isTimeout(status: string, error: string | null): boolean {
  if (status === "timeout") return true;
  return status === "error" && typeof error === "string" && /exceeded 90000ms|timed out|timeout/i.test(error);
}

function stateOf(status: string, error: string | null): SizeState {
  if (isTimeout(status, error)) return "timeout";
  if (status === "error" || status === "license-blocked") return "error";
  if (status === "ok") return "ok";
  return "unsupported";
}

function paintLibraries(): string[] {
  const file = readJson("bench/results/paint.json") as {
    paintSchema?: { librariesThisPhase?: unknown };
  };
  const names = Array.isArray(file.paintSchema?.librariesThisPhase)
    ? file.paintSchema.librariesThisPhase.filter((name): name is string => typeof name === "string" && !SKIP_LIBRARY.has(name))
    : [];
  if (!names.includes("ChartKit")) throw new Error("paint library list is missing ChartKit");
  return names;
}

function sourceLibrary(library: string): string {
  return library === "ChartKit" ? "ChartKit minimal" : library;
}

function readBundle(): BundleFile {
  const file = readJson("bench/results/bundle.json") as {
    measuredAt?: unknown;
    commit?: unknown;
    counts?: unknown;
    packages?: unknown;
    cells?: unknown;
  };
  if (!Array.isArray(file.cells) || typeof file.measuredAt !== "string" || typeof file.commit !== "string") {
    throw new Error("bench/results/bundle.json has no cells");
  }
  const packages: PackageRow[] = [];
  if (Array.isArray(file.packages)) {
    for (const item of file.packages) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      if (typeof row.id !== "string" || typeof row.library !== "string") continue;
      packages.push({
        id: row.id,
        library: row.library,
        treeShakeable: row.treeShakeable === true,
        gzipBytes: typeof row.gzipBytes === "number" ? row.gzipBytes : null,
        cssGzipBytes: typeof row.cssGzipBytes === "number" ? row.cssGzipBytes : null,
      });
    }
  }
  const cells: BundleCell[] = [];
  for (const item of file.cells) {
    if (!item || typeof item !== "object") continue;
    const cell = item as Record<string, unknown>;
    if (typeof cell.library !== "string" || typeof cell.chart !== "string" || typeof cell.status !== "string") continue;
    const external = cell.reactExternal;
    cells.push({
      id: typeof cell.id === "string" ? cell.id : "",
      library: cell.library,
      chart: cell.chart,
      status: cell.status,
      note: typeof cell.note === "string" ? cell.note : null,
      gzipBytes: typeof cell.gzipBytes === "number" ? cell.gzipBytes : null,
      cssGzipBytes: typeof cell.cssGzipBytes === "number" ? cell.cssGzipBytes : null,
      label: typeof cell.label === "string" ? cell.label : null,
      packageId: typeof cell.packageId === "string" ? cell.packageId : null,
      reactExternalGzip:
        external && typeof external === "object" && typeof (external as { gzipBytes?: unknown }).gzipBytes === "number"
          ? (external as { gzipBytes: number }).gzipBytes
          : null,
      error: typeof cell.error === "string" ? cell.error : null,
    });
  }
  const counts = file.counts && typeof file.counts === "object" ? (file.counts as Record<string, number>) : {};
  return { measuredAt: file.measuredAt, commit: file.commit, counts, packages, cells };
}

function readSsr(): SsrFile {
  const file = readJson("bench/results/ssr.json") as {
    measuredAt?: unknown;
    commit?: unknown;
    samples?: unknown;
    counts?: unknown;
    cells?: unknown;
  };
  if (!Array.isArray(file.cells) || typeof file.measuredAt !== "string" || typeof file.commit !== "string") {
    throw new Error("bench/results/ssr.json has no cells");
  }
  const cells: SsrCell[] = [];
  for (const item of file.cells) {
    if (!item || typeof item !== "object") continue;
    const cell = item as Record<string, unknown>;
    if (typeof cell.library !== "string" || typeof cell.chart !== "string" || typeof cell.status !== "string") continue;
    if (typeof cell.points !== "number") continue;
    cells.push({
      id: typeof cell.id === "string" ? cell.id : "",
      library: cell.library,
      chart: cell.chart,
      points: cell.points,
      status: cell.status,
      note: typeof cell.note === "string" ? cell.note : null,
      error: typeof cell.error === "string" ? cell.error : null,
      medianMs: typeof cell.medianMs === "number" ? cell.medianMs : null,
      meanMs: typeof cell.meanMs === "number" ? cell.meanMs : null,
    });
  }
  const counts = file.counts && typeof file.counts === "object" ? (file.counts as Record<string, number>) : {};
  return {
    measuredAt: file.measuredAt,
    commit: file.commit,
    samples: typeof file.samples === "number" ? file.samples : 5,
    counts,
    cells,
  };
}

function chartOrder(charts: string[]): string[] {
  const order = chartTypes.map((item) => item.type);
  for (const chart of charts) {
    if (chart !== "all" && !order.includes(chart)) order.push(chart);
  }
  return order.filter((chart) => chart !== "all" && charts.includes(chart));
}

function labelFor(chart: string): string {
  return chartTypes.find((item) => item.type === chart)?.title ?? chart;
}

function countCells(rows: { cells: SizeCell[] }[]): SizeCounts {
  const counts: SizeCounts = { ok: 0, unsupported: 0, error: 0, timeout: 0 };
  for (const row of rows) {
    for (const cell of row.cells) counts[cell.state] += 1;
  }
  return counts;
}

function countSentence(counts: SizeCounts): string {
  return `This table renders ${fmt(counts.ok)} ok, ${fmt(counts.unsupported)} unsupported, ${fmt(counts.error)} error, and ${fmt(counts.timeout)} timeout cells.`;
}

function bundleText(cell: BundleCell): { state: SizeState; text: string } {
  const state = stateOf(cell.status, cell.error);
  if (state === "timeout") return { state, text: "timeout" };
  if (state === "error") return { state, text: cell.status === "license-blocked" ? "license-blocked" : "error" };
  if (state === "unsupported") return { state, text: "unsupported" };
  if (cell.label === "not tree-shakeable" && cell.gzipBytes == null) return { state: "ok", text: "not tree-shakeable" };
  if (cell.gzipBytes == null) return { state: "error", text: "error" };
  return { state: "ok", text: fmt(cell.gzipBytes) };
}

function findBundle(cells: BundleCell[], chart: string, library: string): BundleCell {
  const found = cells.filter((cell) => cell.chart === chart && cell.library === sourceLibrary(library));
  if (found.length !== 1) throw new Error(`bundle matrix expected one ${library} ${chart} cell, found ${found.length}`);
  return found[0];
}

export type BundleMatrix = {
  measuredAt: string;
  measuredOn: string;
  commit: string;
  libraries: string[];
  rows: BundleMatrixRow[];
  counts: SizeCounts;
  fileCounts: Record<string, number>;
  caption: string;
  notes: string[];
};

export function bundleMatrix(): BundleMatrix {
  const file = readBundle();
  const libraries = paintLibraries();
  const titles = new Map(chartTypes.map((item) => [item.type, item.title]));
  const charts = chartOrder([...new Set(file.cells.map((cell) => cell.chart))]);
  const rows: BundleMatrixRow[] = charts.map((chart) => ({
    chart,
    label: titles.get(chart) ?? labelFor(chart),
    cells: libraries.map((library) => {
      const found = findBundle(file.cells, chart, library);
      const view = bundleText(found);
      const detail = [clip(found.note), clip(found.error)].filter(Boolean).join(" ");
      const external = found.reactExternalGzip != null ? ` Chart-only gzip with React external is ${fmt(found.reactExternalGzip)}.` : "";
      return {
        library,
        state: view.state,
        text: view.text,
        title: `${library}, ${titles.get(chart) ?? chart}, ${view.text}.${external}${detail ? ` ${detail}` : ""}`,
      };
    }),
  }));
  const counts = countCells(rows);
  const all = file.cells.find((cell) => cell.library === "ChartKit all" && cell.chart === "all" && cell.status === "ok");
  if (all?.gzipBytes == null) throw new Error("bundle matrix is missing the ChartKit /all gzip");
  const uplot = file.packages.find((item) => item.id === "uplot");
  if (uplot?.gzipBytes == null || uplot.cssGzipBytes == null) throw new Error("bundle matrix is missing the uPlot package gzip");
  const heat = file.cells.find((cell) => cell.id === "visx" && cell.chart === "heatmap" && cell.status === "ok");
  if (heat?.gzipBytes == null || heat.reactExternalGzip == null) throw new Error("bundle matrix is missing the visx heatmap gzip");
  const frozen = file.packages.filter((item) => item.treeShakeable === false && item.gzipBytes != null && item.id !== "uplot");
  const frozenNote = frozen
    .map((item) => {
      const css = item.cssGzipBytes != null ? ` plus ${fmt(item.cssGzipBytes)} CSS` : "";
      return `${item.library} (${item.id}) ${fmt(item.gzipBytes ?? 0)} gzip${css}`;
    })
    .join(". ");
  const caption = [
    `Gzip bytes. esbuild minify, gzip level 9. Measured ${day(file.measuredAt)}, commit ${shortCommit(file.commit)}.`,
    "ChartKit is createRenderer of that one chart.",
    `/all is ${fmt(all.gzipBytes)} gzip, one bundle for every core chart and every theme, without the validator. It is not a column.`,
    "A number is an ok cell. unsupported means that library has no native chart of that type, or is not an npm package. not tree-shakeable means the per-type cell does not repeat the full-package size. error and timeout are labeled when a cell failed.",
    "Commercial libraries were run without license keys.",
    "Google Charts isn't an npm package.",
    `uPlot is a single package that isn't tree-shakeable (${fmt(uplot.gzipBytes)} gzip + ${fmt(uplot.cssGzipBytes)} CSS).`,
    `visx heatmap shows the figure that includes React and ReactDOM, ${fmt(heat.gzipBytes)} gzip (chart-only is ${fmt(heat.reactExternalGzip)}).`,
  ].join(" ");
  return {
    measuredAt: file.measuredAt,
    measuredOn: day(file.measuredAt),
    commit: file.commit,
    libraries,
    rows,
    counts,
    fileCounts: file.counts,
    caption,
    notes: [
      countSentence(counts),
      `The result file counts ${file.counts.ok ?? 0} ok and ${file.counts.unsupported ?? 0} unsupported, including the /all bundle as one ok cell.`,
      frozenNote ? `Other full packages, not repeated on each cell: ${frozenNote}.` : "",
      "A package with one native type keeps its gzip on that cell. TradingView Lightweight Charts is that case.",
    ].filter(Boolean),
  };
}

function findSsr(cells: SsrCell[], chart: string, library: string, points: number): SsrCell {
  const found = cells.filter((cell) => cell.chart === chart && cell.library === sourceLibrary(library) && cell.points === points);
  if (found.length !== 1) throw new Error(`SSR matrix expected one ${library} ${chart} @ ${points} cell, found ${found.length}`);
  return found[0];
}

function ssrText(cell: SsrCell): { state: SizeState; text: string } {
  const state = stateOf(cell.status, cell.error);
  if (state === "timeout") return { state, text: "timeout" };
  if (state === "error") return { state, text: cell.status === "license-blocked" ? "license-blocked" : "error" };
  if (state === "unsupported") return { state, text: "unsupported" };
  if (cell.medianMs == null) return { state: "error", text: "error" };
  return { state: "ok", text: formatMs(cell.medianMs) };
}

export type SsrMatrix = {
  measuredAt: string;
  measuredOn: string;
  commit: string;
  samples: number;
  libraries: string[];
  rows: SsrMatrixRow[];
  counts: SizeCounts;
  fileCounts: Record<string, number>;
  caption: string;
  notes: string[];
};

export function ssrMatrix(): SsrMatrix {
  const file = readSsr();
  const libraries = paintLibraries();
  const titles = new Map(chartTypes.map((item) => [item.type, item.title]));
  const charts = chartOrder([...new Set(file.cells.map((cell) => cell.chart))]);
  const rows: SsrMatrixRow[] = [];
  for (const chart of charts) {
    const points = [...new Set(file.cells.filter((cell) => cell.chart === chart).map((cell) => cell.points))].sort((a, b) => b - a);
    for (const n of points) {
      const label = titles.get(chart) ?? labelFor(chart);
      rows.push({
        chart,
        label,
        points: n,
        pointsLabel: pointsLabel(n),
        cells: libraries.map((library) => {
          const found = findSsr(file.cells, chart, library, n);
          const view = ssrText(found);
          const detail = [clip(found.note), clip(found.error)].filter(Boolean).join(" ");
          return {
            library,
            state: view.state,
            text: view.text,
            title: `${library}, ${label}, ${pointsLabel(n)} points, ${view.text}.${detail ? ` ${detail}` : ""}`,
          };
        }),
      });
    }
  }
  const counts = countCells(rows);
  const named = rows.flatMap((row) =>
    row.cells
      .filter((cell) => cell.state === "error" || cell.state === "timeout")
      .map((cell) => `${cell.library} ${row.chart} at ${row.pointsLabel} points ${cell.state === "timeout" ? "timed out at 90s" : "threw"}`),
  );
  const caption = [
    `Median milliseconds. Node string or SVG, median of ${file.samples}. Measured ${day(file.measuredAt)}, commit ${shortCommit(file.commit)}.`,
    "Line is 100,000 points. Candlestick is listed at both measured sizes.",
    "A number is an ok cell. unsupported is always labeled and is not a win. error means the run threw. timeout means the sample exceeded 90s.",
    "Recharts 3 SSR returns no SVG (except sunburst), and Tremor is affected for the same reason.",
    "G2 has no Node SVG path.",
    "visx XYChart SSR renders an empty frame.",
    "Google Charts isn't an npm package.",
    "Commercial libraries were run without license keys.",
  ].join(" ");
  return {
    measuredAt: file.measuredAt,
    measuredOn: day(file.measuredAt),
    commit: file.commit,
    samples: file.samples,
    libraries,
    rows,
    counts,
    fileCounts: file.counts,
    caption,
    notes: [
      countSentence(counts),
      `The result file counts ${file.counts.ok ?? 0} ok, ${file.counts.unsupported ?? 0} unsupported, and ${file.counts.error ?? 0} error. Timeouts are stored as error in that file and labeled timeout here.`,
      named.length ? named.join(". ") + "." : "",
    ].filter(Boolean),
  };
}

function packageGzip(file: BundleFile, cell: BundleCell): { gzip: number | null; css: number; external: number | null } {
  if (cell.gzipBytes != null) {
    return { gzip: cell.gzipBytes, css: cell.cssGzipBytes ?? 0, external: cell.reactExternalGzip };
  }
  const pkg = file.packages.find((item) => item.id === cell.packageId);
  if (!pkg || pkg.gzipBytes == null) return { gzip: null, css: 0, external: null };
  return { gzip: pkg.gzipBytes, css: pkg.cssGzipBytes ?? 0, external: cell.reactExternalGzip };
}

function joinAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export type LineRaceRow = {
  id: string;
  lib: string;
  entry: string;
  bytes: number;
  reactExternal: boolean;
};

export type SsrLineRow = {
  lib: string;
  meanMs: number | null;
  medianMs: number | null;
  supported: boolean;
  points: number;
};

export type Phase4Headline = {
  lineGzipBytes: string;
  lineGzipLabel: string;
  lineBytes: number;
  barBytes: number;
  miniAreaBytes: number;
  allBytes: number;
  uplotJsBytes: string;
  uplotCssBytes: string;
  uplotSumBytes: string;
  sizeCommit: string;
  sizeMeasured: string;
  harnessLineBytes: string;
  bundleLoss: string;
  lineWins: string;
  donutWin: string;
  nextLib: string;
  nextGzipBytes: string;
  ssrLabel: string;
  ssrMedianMs: number;
  ssrMeanMs: number;
  ssrPoints: number;
  lineRace: LineRaceRow[];
  ssrLine: SsrLineRow[];
};

const LINE_RACE = [
  { id: "chartkit-line", cellId: "chartkit", lib: "ChartKit" },
  { id: "uplot", cellId: "uplot", lib: "uPlot" },
  { id: "chartjs", cellId: "chartjs", lib: "Chart.js" },
  { id: "plot", cellId: "plot", lib: "Observable Plot" },
  { id: "recharts", cellId: "recharts", lib: "Recharts" },
  { id: "nivo", cellId: "nivo", lib: "Nivo" },
  { id: "echarts", cellId: "echarts", lib: "ECharts" },
] as const;

const SSR_LINE = ["ChartKit minimal", "ECharts", "Nivo", "uPlot", "Chart.js", "Recharts", "Observable Plot"] as const;

export function phase4Headline(): Phase4Headline {
  const bundle = readBundle();
  const ssr = readSsr();
  const ours = (chart: string) => {
    const cell = bundle.cells.find((item) => item.library === "ChartKit minimal" && item.chart === chart && item.status === "ok");
    if (cell?.gzipBytes == null) throw new Error(`phase 4 bundle is missing ChartKit ${chart}`);
    return cell.gzipBytes;
  };
  const lineBytes = ours("line");
  const barBytes = ours("bar");
  const miniAreaBytes = ours("mini-area");
  const all = bundle.cells.find((cell) => cell.library === "ChartKit all" && cell.chart === "all" && cell.status === "ok");
  if (all?.gzipBytes == null) throw new Error("phase 4 bundle is missing /all");
  const uplot = bundle.packages.find((item) => item.id === "uplot");
  if (uplot?.gzipBytes == null || uplot.cssGzipBytes == null) throw new Error("phase 4 bundle is missing uPlot");
  const uplotSum = uplot.gzipBytes + uplot.cssGzipBytes;

  const lineRace: LineRaceRow[] = LINE_RACE.map((item) => {
    const cell = bundle.cells.find((row) => row.id === item.cellId && row.chart === "line");
    if (!cell) throw new Error(`phase 4 bundle is missing ${item.cellId} line`);
    const packed = packageGzip(bundle, cell);
    if (packed.gzip == null) throw new Error(`phase 4 bundle ${item.cellId} line has no gzip`);
    const reactExternal = packed.external != null;
    const bytes = item.cellId === "uplot" ? packed.gzip + packed.css : reactExternal ? packed.external! : packed.gzip + packed.css;
    const entry = item.cellId === "chartkit" ? "createRenderer line" : item.cellId === "uplot" ? "full package plus stylesheet" : reactExternal ? "line, React external" : "line";
    return { id: item.id, lib: item.lib, entry, bytes, reactExternal };
  });

  const compared = [
    { id: "chartjs", name: "Chart.js" },
    { id: "recharts", name: "Recharts" },
    { id: "nivo", name: "Nivo" },
    { id: "plot", name: "Observable Plot" },
    { id: "echarts", name: "ECharts" },
  ].map((item) => {
    const race = lineRace.find((row) => row.id === item.id);
    if (!race) throw new Error(`line race is missing ${item.id}`);
    return { name: item.name, bytes: race.bytes, external: race.reactExternal };
  });
  const named = (item: { name: string; bytes: number; external: boolean }) =>
    `${item.name} (${fmt(item.bytes)}${item.external ? ", React external" : ""})`;
  const smaller = compared.filter((item) => lineBytes < item.bytes);
  const larger = compared.filter((item) => lineBytes >= item.bytes);
  const lineWins = [
    smaller.length ? `It is smaller than ${joinAnd(smaller.map(named))}.` : "",
    larger.length ? `It is not smaller than ${joinAnd(larger.map(named))}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const bundleLoss = `That is a loss to uPlot at ${fmt(uplot.gzipBytes)} bytes of JS. The stylesheet is ${fmt(uplot.cssGzipBytes)} bytes more, a separate response, and the two sum to ${fmt(uplotSum)}, still smaller than ChartKit.`;

  const donutBytes = ours("donut");
  const donutCells = bundle.cells.filter((cell) => cell.chart === "donut" && cell.library !== "ChartKit minimal" && cell.library !== "ChartKit all");
  const donutWins: string[] = [];
  const donutLosses: string[] = [];
  const donutNone: string[] = [];
  for (const cell of donutCells) {
    const packed = packageGzip(bundle, cell);
    if (cell.status !== "ok" || packed.gzip == null) {
      donutNone.push(cell.library);
      continue;
    }
    const bytes = packed.external ?? packed.gzip + packed.css;
    const label = `${cell.library} (${fmt(bytes)}${packed.external != null ? ", React external" : ""})`;
    if (donutBytes < bytes) donutWins.push(label);
    else donutLosses.push(label);
  }
  let donutWin = `The donut is ${fmt(donutBytes)} bytes`;
  if (donutWins.length && donutLosses.length === 0) donutWin += ` and is smaller than ${joinAnd(donutWins)}.`;
  else if (donutWins.length) donutWin += `. Smaller than ${joinAnd(donutWins)}.`;
  else donutWin += ".";
  if (donutLosses.length) donutWin += ` Not smaller than ${joinAnd(donutLosses)}.`;
  if (donutNone.length) donutWin += ` ${joinAnd(donutNone)} ${donutNone.length === 1 ? "has" : "have"} no donut.`;

  const ssrLine: SsrLineRow[] = SSR_LINE.map((library) => {
    const cell = ssr.cells.find((item) => item.library === library && item.chart === "line");
    if (!cell) throw new Error(`phase 4 SSR is missing ${library} line`);
    const ok = cell.status === "ok" && cell.medianMs != null;
    return {
      lib: library === "ChartKit minimal" ? "ChartKit" : library,
      meanMs: ok ? cell.meanMs : null,
      medianMs: ok ? cell.medianMs : null,
      supported: ok,
      points: cell.points,
    };
  });
  const chartkitSsr = ssrLine[0];
  if (chartkitSsr?.medianMs == null || chartkitSsr.meanMs == null) throw new Error("phase 4 SSR is missing the ChartKit line median");

  return {
    lineGzipBytes: fmt(lineBytes),
    lineGzipLabel: kbLabel(lineBytes),
    lineBytes,
    barBytes,
    miniAreaBytes,
    allBytes: all.gzipBytes,
    uplotJsBytes: fmt(uplot.gzipBytes),
    uplotCssBytes: fmt(uplot.cssGzipBytes),
    uplotSumBytes: fmt(uplotSum),
    sizeCommit: shortCommit(bundle.commit),
    sizeMeasured: day(bundle.measuredAt),
    harnessLineBytes: fmt(lineBytes),
    bundleLoss,
    lineWins,
    donutWin,
    nextLib: "uPlot",
    nextGzipBytes: fmt(uplot.gzipBytes),
    ssrLabel: `${formatMs(chartkitSsr.medianMs)} ms`,
    ssrMedianMs: chartkitSsr.medianMs,
    ssrMeanMs: chartkitSsr.meanMs,
    ssrPoints: chartkitSsr.points,
    lineRace,
    ssrLine,
  };
}

export type LineSizeRow = {
  id: string;
  chart: string;
  status: string;
  gzipBytes: number | null;
  cssGzipBytes: number | null;
  reactExternalGzipBytes: number | null;
};

/** Line rows for compare-page copy. Bytes come from bench/results/bundle.json. */
export function lineSizeRows(): { commit: string; measuredAt: string; lineBytes: number; rows: LineSizeRow[] } {
  const bundle = readBundle();
  const line = bundle.cells.filter((cell) => cell.chart === "line");
  const rows: LineSizeRow[] = line.map((cell) => {
    const packed = packageGzip(bundle, cell);
    return {
      id: cell.id,
      chart: "line",
      status: cell.status,
      gzipBytes: packed.gzip,
      cssGzipBytes: packed.css || null,
      reactExternalGzipBytes: packed.external,
    };
  });
  const ours = rows.find((row) => row.id === "chartkit");
  if (ours?.gzipBytes == null) throw new Error("line size rows are missing ChartKit");
  return { commit: bundle.commit, measuredAt: bundle.measuredAt, lineBytes: ours.gzipBytes, rows };
}
