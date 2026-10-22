/**
 * Bundle rows for the benchmarks page. Byte counts come from
 * docs/data/measured-sizes.json. Do not type them in here.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface MeasuredRow {
  id: string;
  library: string;
  chart: string;
  status: string;
  gzipBytes: number | null;
  cssGzipBytes: number | null;
  reactExternalGzipBytes: number | null;
  note: string | null;
}

interface MeasuredFile {
  commit: string;
  sizeScript: { measuredAt: string; measured: { line: number; all: number } };
  bench: { rows: MeasuredRow[] };
}

export interface BundleGzipRow {
  id: string;
  lib: string;
  entry: string;
  bytes: number;
  reactExternal: boolean;
}

function docsRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..");
}

function loadMeasured(): MeasuredFile {
  return JSON.parse(readFileSync(join(docsRoot(), "data/measured-sizes.json"), "utf8")) as MeasuredFile;
}

function fmt(value: number): string {
  return value.toLocaleString("en-US");
}

function joinAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function kb(bytes: number): number {
  return Math.round(bytes / 100) / 10;
}

function row(rows: MeasuredRow[], id: string, chart: string): MeasuredRow {
  const found = rows.find((item) => item.id === id && item.chart === chart);
  if (!found) throw new Error(`measured-sizes.json has no ${id} ${chart} row`);
  return found;
}

function gzipOrThrow(item: MeasuredRow): number {
  if (item.status !== "ok" || item.gzipBytes == null) {
    throw new Error(`measured-sizes.json ${item.id} ${item.chart} has no gzip`);
  }
  return item.gzipBytes;
}

/** React-external when that column exists, otherwise JS plus a separate stylesheet. */
function compareBytes(item: MeasuredRow): number | null {
  if (item.status !== "ok" || item.gzipBytes == null) return null;
  return item.reactExternalGzipBytes ?? item.gzipBytes + (item.cssGzipBytes ?? 0);
}

const LINE_WINS = [
  { id: "chartjs", name: "Chart.js" },
  { id: "recharts", name: "Recharts" },
  { id: "nivo", name: "Nivo" },
  { id: "plot", name: "Observable Plot" },
  { id: "echarts", name: "ECharts" },
] as const;

function build() {
  const measured = loadMeasured();
  const rows = measured.bench.rows;
  const lineBytes = measured.sizeScript.measured.line;
  const allBytes = measured.sizeScript.measured.all;
  const short = measured.commit.slice(0, 7);
  const day = measured.sizeScript.measuredAt.slice(0, 10);
  const harnessLine = gzipOrThrow(row(rows, "chartkit-minimal", "line"));
  const harnessBar = gzipOrThrow(row(rows, "chartkit-minimal", "bar"));
  const harnessDonut = gzipOrThrow(row(rows, "chartkit-minimal", "donut"));
  const harnessAll = gzipOrThrow(row(rows, "chartkit-all", "line"));
  const uplot = row(rows, "uplot", "line");
  const uplotJs = gzipOrThrow(uplot);
  const uplotCss = uplot.cssGzipBytes ?? 0;
  const uplotSum = uplotJs + uplotCss;

  const lineCompared = LINE_WINS.map((item) => {
    const measuredRow = row(rows, item.id, "line");
    const bytes = compareBytes(measuredRow);
    if (bytes == null) throw new Error(`measured-sizes.json ${item.id} line has no gzip`);
    return { name: item.name, bytes, external: measuredRow.reactExternalGzipBytes != null };
  });
  const lineWinList = lineCompared.filter((item) => lineBytes < item.bytes);
  const lineLossList = lineCompared.filter((item) => lineBytes >= item.bytes);
  const named = (item: { name: string; bytes: number; external: boolean }) =>
    `${item.name} (${fmt(item.bytes)}${item.external ? ", React external" : ""})`;
  const lineWins = [
    lineWinList.length ? `It is still smaller than ${joinAnd(lineWinList.map(named))}.` : "",
    lineLossList.length ? `It is not smaller than ${joinAnd(lineLossList.map(named))}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  let bundleLoss = `That is a loss to uPlot at ${fmt(uplotJs)} bytes.`;
  if (lineBytes <= uplotJs) {
    bundleLoss = `uPlot’s line is ${fmt(uplotJs)} bytes, so the size-script line is not larger than that JS bundle.`;
  } else if (uplotCss > 0) {
    const sumClause = lineBytes > uplotSum ? `the two sum to ${fmt(uplotSum)}, still smaller than ChartKit` : `the two sum to ${fmt(uplotSum)}`;
    bundleLoss += ` The stylesheet is ${fmt(uplotCss)} bytes more, a separate response, and ${sumClause}.`;
  }

  const donutOthers = rows.filter((item) => item.chart === "donut" && item.id !== "chartkit-minimal" && item.id !== "chartkit-all");
  const donutWins: { name: string; bytes: number; external: boolean }[] = [];
  const donutLosses: { name: string; bytes: number; external: boolean }[] = [];
  const donutNone: string[] = [];
  for (const item of donutOthers) {
    const bytes = compareBytes(item);
    if (bytes == null) donutNone.push(item.library);
    else if (harnessDonut < bytes) donutWins.push({ name: item.library, bytes, external: item.reactExternalGzipBytes != null });
    else donutLosses.push({ name: item.library, bytes, external: item.reactExternalGzipBytes != null });
  }
  donutWins.sort((a, b) => a.bytes - b.bytes);
  let donutWin = `The harness donut is ${fmt(harnessDonut)} bytes`;
  if (donutWins.length && donutLosses.length === 0) donutWin += ` and is smaller than ${joinAnd(donutWins.map(named))}.`;
  else if (donutWins.length) donutWin += `. Smaller than ${joinAnd(donutWins.map(named))}.`;
  else donutWin += ".";
  if (donutLosses.length) donutWin += ` Not smaller than ${joinAnd(donutLosses.map(named))}.`;
  if (donutNone.length) {
    const verb = donutNone.length === 1 ? "has" : "have";
    donutWin += ` ${donutNone.join(" and ")} ${verb} no donut.`;
  }

  const chartjs = row(rows, "chartjs", "line");
  const plot = row(rows, "plot", "line");
  const recharts = row(rows, "recharts", "line");
  const nivo = row(rows, "nivo", "line");
  const echarts = row(rows, "echarts", "line");
  const chartjsBytes = gzipOrThrow(chartjs);
  const plotBytes = gzipOrThrow(plot);
  const rechartsExternal = recharts.reactExternalGzipBytes;
  const nivoExternal = nivo.reactExternalGzipBytes;
  const echartsBytes = gzipOrThrow(echarts);
  if (rechartsExternal == null || nivoExternal == null) {
    throw new Error("measured-sizes.json is missing a React-external line gzip");
  }

  const bundleGzip: BundleGzipRow[] = [
    { id: "chartkit-line", lib: "ChartKit", entry: `size script line, ${short}`, bytes: lineBytes, reactExternal: false },
    { id: "chartkit-line-harness", lib: "ChartKit", entry: "harness minimal line", bytes: harnessLine, reactExternal: false },
    { id: "chartkit-bar", lib: "ChartKit", entry: "harness minimal bar", bytes: harnessBar, reactExternal: false },
    { id: "chartkit-donut", lib: "ChartKit", entry: "harness minimal donut", bytes: harnessDonut, reactExternal: false },
    { id: "chartkit-all", lib: "ChartKit", entry: "harness /all", bytes: harnessAll, reactExternal: false },
    { id: "uplot", lib: "uPlot", entry: "line plus stylesheet", bytes: uplotSum, reactExternal: false },
    { id: "chartjs", lib: "Chart.js", entry: "line", bytes: chartjsBytes, reactExternal: false },
    { id: "plot", lib: "Observable Plot", entry: "line", bytes: plotBytes, reactExternal: false },
    { id: "recharts", lib: "Recharts", entry: "line, React external", bytes: rechartsExternal, reactExternal: true },
    { id: "nivo", lib: "Nivo", entry: "line, React external", bytes: nivoExternal, reactExternal: true },
    { id: "echarts", lib: "ECharts", entry: "echarts/core plus one series", bytes: echartsBytes, reactExternal: false },
  ];

  const bundleRows = [
    { lib: "ChartKit line", gzip: fmt(lineBytes), note: `scripts/size.mjs on ${short}, measured ${day}. The harness chartkit-minimal line is ${fmt(harnessLine)}.` },
    { lib: "uPlot", gzip: fmt(uplotSum), note: `Harness line. JS ${fmt(uplotJs)} plus the published stylesheet ${fmt(uplotCss)}, gzipped separately and summed.` },
    { lib: "Chart.js", gzip: fmt(chartjsBytes), note: "Harness line." },
    { lib: "Observable Plot", gzip: fmt(plotBytes), note: "Harness line. No donut." },
    { lib: "Recharts", gzip: fmt(rechartsExternal), note: `Harness line, React external. With React included: ${fmt(gzipOrThrow(recharts))}.` },
    { lib: "Nivo", gzip: fmt(nivoExternal), note: `Harness line, React external. With React included: ${fmt(gzipOrThrow(nivo))}.` },
    { lib: "ECharts", gzip: fmt(echartsBytes), note: echarts.note ?? "Harness modular line: echarts/core plus one series." },
    { lib: "ChartKit bar", gzip: fmt(harnessBar), note: "Harness chartkit-minimal bar." },
    { lib: "ChartKit donut", gzip: fmt(harnessDonut), note: "Harness chartkit-minimal donut." },
    { lib: "ChartKit /all", gzip: fmt(harnessAll), note: `Harness /all. scripts/size.mjs measured all at ${fmt(allBytes)} on the same run.` },
  ];

  const raceSource = [
    { lib: "ChartKit", bytes: lineBytes },
    { lib: "uPlot", bytes: uplotSum },
    { lib: "Chart.js", bytes: chartjsBytes },
    { lib: "Nivo", bytes: nivoExternal },
    { lib: "Recharts", bytes: rechartsExternal },
    { lib: "Plot", bytes: plotBytes },
  ].sort((a, b) => a.bytes - b.bytes);
  const offScale = echartsBytes >= 150_000 ? [{ lib: "ECharts", bytes: echartsBytes }] : [];
  const raceRows = raceSource.map((item) => ({ lib: item.lib, value: kb(item.bytes) }));
  const listed = raceSource
    .filter((item) => item.lib !== "uPlot" && item.lib !== "ChartKit")
    .map((item) => `${item.lib} is ${kb(item.bytes).toFixed(1)}`)
    .join(", ");
  const offScaleText = offScale.length
    ? ` ${offScale.map((item) => `${item.lib} is ${fmt(item.bytes)} bytes`).join(", ")} and is left off the chart.`
    : "";
  const offScaleAlt = offScale.map((item) => `${item.lib} is ${kb(item.bytes).toFixed(1)} KB and is off this scale.`).join(" ");
  const alt = `uPlot’s line plus stylesheet is ${kb(uplotSum).toFixed(1)} KB gzip, from ${fmt(uplotJs)} bytes of JS plus ${fmt(uplotCss)} of CSS. ChartKit’s line entry is ${kb(lineBytes).toFixed(1)} KB, a loss. ${listed}. ${offScaleAlt}`.replace(/\s+/g, " ").trim();
  const caption = `The ChartKit bar is scripts/size.mjs on ${short}, measured ${day}: ${fmt(lineBytes)} bytes gzip. That is a loss to uPlot. uPlot’s JS is ${fmt(uplotJs)} bytes and the stylesheet is ${fmt(uplotCss)} bytes, summed ${fmt(uplotSum)}.${offScaleText}`;

  return {
    lineBytes,
    allBytes,
    bundleGzip,
    bundleRows,
    raceRows,
    alt,
    caption,
    headline: {
      lineGzipLabel: `${kb(lineBytes).toFixed(1)} KB`,
      lineGzipBytes: fmt(lineBytes),
      nextLib: "uPlot",
      nextGzipBytes: fmt(uplotJs),
      uplotJsBytes: fmt(uplotJs),
      uplotCssBytes: fmt(uplotCss),
      uplotSumBytes: fmt(uplotSum),
      sizeCommit: short,
      sizeMeasured: day,
      harnessLineBytes: fmt(harnessLine),
      bundleLoss,
      lineWins,
      donutWin,
    },
    uplotJs,
    uplotCss,
    uplotSum,
  };
}

export const measuredBundle = build();
