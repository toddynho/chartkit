/**
 * Attribute one bench bundle by esbuild metafile and source map.
 *
 * Minified bytes are the generated ranges that map back to each source line.
 * Gzip is that group's share of the bundle's gzip (level 9). Shared gzip
 * dictionaries mean this is a contribution, not a separately compressed file.
 *
 *   node bench/bundle/attribute.mjs
 *   node bench/bundle/attribute.mjs line
 *   node bench/bundle/attribute.mjs visx-heatmap
 */

import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { compress } from "../lib/compress.mjs";

const benchRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(benchRoot, "..");

const LINE_ENTRY = `import { createRenderer } from "../../packages/core/src/render.ts";
import { line } from "../../packages/core/src/charts/line.ts";
const render = createRenderer([line]);
export function draw(spec) {
  return render(spec);
}
`;

const VISX_HEAT_PUBLISHED = `import { HeatmapRect } from "@visx/heatmap";
export function draw(props) {
  return [HeatmapRect].map((Component) => Component && props);
}
`;

const ENTRIES = {
  line: LINE_ENTRY,
  "visx-heatmap": VISX_HEAT_PUBLISHED,
};

const target = process.argv[2] ?? "line";
const source = ENTRIES[target];
if (!source) {
  console.error(`Unknown entry ${target}. Known: ${Object.keys(ENTRIES).join(", ")}`);
  process.exit(1);
}

const outdir = join(tmpdir(), `chartkit-attr-${process.pid}`);
const result = await build({
  stdin: {
    contents: source,
    resolveDir: join(benchRoot, "bundle"),
    sourcefile: "entry.mjs",
    loader: "js",
  },
  bundle: true,
  minify: true,
  format: "esm",
  platform: "browser",
  outfile: join(outdir, "entry.js"),
  metafile: true,
  sourcemap: true,
  sourcesContent: true,
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "silent",
});
const jsPath = join(outdir, "entry.js");
const code = readFileSync(jsPath, "utf8").replace(/\n\/\/# sourceMappingURL=.*$/, "");
const sizes = compress(Buffer.from(code));
const map = JSON.parse(readFileSync(join(outdir, "entry.js.map"), "utf8"));
rmSync(outdir, { recursive: true, force: true });
void result;
const generatedLines = code.split("\n");

const byFile = new Map();
const byFunction = new Map();
const fileText = new Map();

function add(mapObj, key, bytes) {
  mapObj.set(key, (mapObj.get(key) ?? 0) + bytes);
}

let generatedLine = 0;
let previousColumn = 0;
let sourceIndex = 0;
let sourceLine = 0;
let sourceColumn = 0;
for (const line of map.mappings.split(";")) {
  previousColumn = 0;
  const segments = line ? line.split(",") : [];
  const columns = [];
  for (const segment of segments) {
    const fields = decodeVlq(segment);
    let cursor = 0;
    if (cursor < fields.length) previousColumn += fields[cursor++];
    if (cursor < fields.length) sourceIndex += fields[cursor++];
    if (cursor < fields.length) sourceLine += fields[cursor++];
    if (cursor < fields.length) sourceColumn += fields[cursor++];
    columns.push({ column: previousColumn, sourceIndex, sourceLine });
  }
  const width = generatedLines[generatedLine]?.length ?? 0;
  for (let i = 0; i < columns.length; i++) {
    const next = i + 1 < columns.length ? columns[i + 1].column : width;
    const bytes = Math.max(0, next - columns[i].column);
    const file = map.sources[columns[i].sourceIndex] ?? "(generated)";
    add(byFile, file, bytes);
    const fn = functionAt(file, columns[i].sourceLine);
    add(byFunction, `${short(file)} ${fn}`, bytes);
  }
  generatedLine += 1;
}

const groups = new Map();
for (const [file, bytes] of byFile) {
  const name = groupOf(file);
  const bucket = groups.get(name) ?? { minBytes: 0, files: [] };
  bucket.minBytes += bytes;
  bucket.files.push([bytes, short(file)]);
  groups.set(name, bucket);
}

const accounted = [...byFile.values()].reduce((sum, value) => sum + value, 0);
console.log(`${target}: min ${sizes.minBytes}, gzip ${sizes.gzipBytes}, brotli ${sizes.brotliBytes}`);
console.log(`source-map accounted ${accounted} of ${sizes.minBytes} minified bytes`);
console.log("");
console.log("group\tmin\tgzip share");
const rows = [...groups.entries()].sort((a, b) => b[1].minBytes - a[1].minBytes);
for (const [name, bucket] of rows) {
  const gzip = Math.round(sizes.gzipBytes * (bucket.minBytes / sizes.minBytes));
  console.log(`${name}\t${bucket.minBytes}\t${gzip}`);
}
console.log("");
console.log("top functions");
const fns = [...byFunction.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
for (const [name, bytes] of fns) console.log(`${String(bytes).padStart(6)}  ${name}`);

function semanticOf(key) {
  const name = key.split(" ").pop();
  const file = key.slice(0, key.lastIndexOf(" "));
  if (file.includes("annotations.ts")) return "annotations";
  if (file.includes("sampling.ts")) return "sampling / LTTB";
  if (file.includes("theme.ts")) return "theming / tokens";
  if (file.includes("legend.ts") || AXES.has(name) || file.includes("axis-extra.ts")) return "axes, legend, layout";
  if (file.includes("timezone.ts") || file.includes("format.ts") || SCALES.has(name)) return "scales, ticks, date and number format";
  if (PATHS.has(name)) return "SVG path";
  if (BARS.has(name)) return "bar, stack, and label helpers";
  if (TIP.has(name)) return "tooltip / headline chrome";
  if (COLOR.has(name) || file.includes("color.ts")) return "color rules";
  if (file.includes("glyphs.ts")) return "point markers";
  if (file.includes("canvas/") || file.includes("render-mode.ts")) return "canvas decision (painter not bundled)";
  if (file.includes("render.ts") || file.endsWith("charts/line.ts") || file.endsWith("entry.mjs")) return "renderer shell";
  if (file.includes("svg.ts") || file.includes("frame.ts")) return "SVG primitives and scales";
  if (file.includes("data.ts") || file.includes("data-prep.ts") || file.includes("sort.ts") || file.includes("transform.ts")) return "data table";
  if (file.includes("cartesian.ts")) return "cartesian shell";
  if (file.includes("layout-hook") || file.includes("chrome.ts")) return "axes, legend, layout";
  return "other";
}

const PATHS = new Set(["appendLineSeries", "appendFullLine", "appendLinear", "paintStroke", "pushStroke", "paintAreas", "linePath", "areaPath", "monotone", "step", "stroked", "withBreaks", "segments", "pairSegments", "collapseArea", "flatY", "pointsFor", "bottomPoints", "gapTops", "strokeOf", "areaMid", "drawLines", "paintPoints", "markerShape", "explicitMark"]);
const AXES = new Set(["drawAxes", "padding", "axisTitles", "xBand", "timeBand", "numBand", "band", "along", "alongOne", "ruleLine", "tickInk", "formatTimeLabel", "timeTicks", "tickText", "tickLabel", "categoryTickText", "xPosition", "widest", "inkWidth", "lineCount", "linesOf", "wrapWords", "axText", "titleSpin", "titleAlong", "xAngle", "xStep", "crossAt", "minors", "place", "ySide", "xSide", "wantSpine", "spineEdge", "spineSegment", "outerEdge", "shifted", "zigzag", "zigPoints", "plotBreaks", "timeLabelsCollide", "legend", "legendIcon", "legendItems", "legendSeries", "legendColor", "legendName", "legendRows", "legendVisible", "legendAsked", "ruleItems", "appendRules", "withTitle", "bottomLegendFoot", "colorLegendFoot", "paintLegend", "readLegend"]);
const SCALES = new Set(["domain", "resolveTicks", "floatExtent", "linearExtent", "isIndexAxis", "pinDomain", "strokeGutter", "niceDomain", "ticks", "logTicks", "logScale", "symlogTicks", "brokenScale", "readAxis"]);
const TIP = new Set(["headlineSvg", "headlineInk", "readHeadline", "readTip", "tipAttrs"]);
const COLOR = new Set(["applyPointColors", "applyRuleLabels", "distinctPaint", "deltaE76", "labOf", "rgbOf", "ruleSwatches", "tooClose", "themeSlots", "occupiedPaints", "repaint", "hasUnmatched", "categorySwatches", "baseLabelOf", "diverges", "valueLabelWidth"]);
const BARS = new Set(["drawBars", "bars", "barMark", "planStacks", "stackLayers", "pivotBars", "queueBarLabel", "placeLineLabels", "wantLabels", "labelText", "labelIndex", "labelStep", "seriesLabelBoxes", "paintOrder", "renderBar", "renderStackedArea", "renderCombo", "renderSparkline", "renderMiniArea", "renderPlotted"]);

function groupOf(file) {
  const path = file.replaceAll("\\", "/");
  if (path.includes("node_modules/")) return "third-party";
  if (path.endsWith("entry.mjs")) return "bench entry";
  const src = path.includes("/src/") ? path.slice(path.indexOf("/src/") + 5) : path;
  if (src.includes("canvas/")) return "canvas hook (painter not in this entry)";
  if (src === "sampling.ts") return "sampling / LTTB";
  if (src === "timezone.ts" || src === "format.ts") return "scales, ticks, date and number format";
  if (src === "legend.ts" || src === "axis-extra.ts" || src === "layout-hook.ts" || src === "chrome.ts") return "axes, legend, layout";
  if (src === "theme.ts") return "theming / tokens";
  if (src === "annotations.ts") return "annotations";
  if (src === "glyphs.ts") return "point markers";
  if (src === "color.ts" || src === "color-scale.ts") return "color rules";
  if (src === "render-mode.ts") return "canvas decision";
  if (src === "render.ts" || src === "charts/line.ts") return "renderer shell";
  if (src === "svg.ts" || src === "frame.ts") return "SVG primitives and scales";
  if (src === "data.ts" || src === "data-prep.ts" || src === "sort.ts" || src === "transform.ts") return "data table";
  if (src === "renderers/cartesian.ts") return "cartesian renderer (line, axes, paths, leftover siblings)";
  return src;
}

function functionAt(file, line) {
  const text = textOf(file);
  if (!text) return `L${line + 1}`;
  const starts = startsOf(file, text);
  let name = "(module)";
  for (const item of starts) {
    if (item.line <= line) name = item.name;
    else break;
  }
  return name;
}

function startsOf(file, text) {
  startsOf.cache ??= new Map();
  if (startsOf.cache.has(file)) return startsOf.cache.get(file);
  const starts = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const match = /^(?:export )?(?:async )?function (\w+)|^(?:export )?const (\w+) =/.exec(lines[i]);
    if (match) starts.push({ line: i, name: match[1] || match[2] });
  }
  startsOf.cache.set(file, starts);
  return starts;
}

function textOf(file) {
  if (fileText.has(file)) return fileText.get(file);
  const index = map.sources.indexOf(file);
  const text = map.sourcesContent?.[index] ?? "";
  fileText.set(file, text);
  return text;
}

function short(file) {
  const cleaned = file.replaceAll("\\", "/");
  if (cleaned.includes("node_modules/")) return cleaned.slice(cleaned.indexOf("node_modules/") + "node_modules/".length);
  return relative(repoRoot, cleaned);
}

const semantic = new Map();
for (const [key, bytes] of byFunction) {
  const name = semanticOf(key);
  semantic.set(name, (semantic.get(name) ?? 0) + bytes);
}
console.log("");
console.log("semantic\tmin\tgzip share");
for (const [name, bytes] of [...semantic.entries()].sort((a, b) => b[1] - a[1])) {
  const gzip = Math.round(sizes.gzipBytes * (bytes / sizes.minBytes));
  console.log(`${name}\t${bytes}\t${gzip}`);
}

function decodeVlq(segment) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const fields = [];
  let value = 0;
  let shift = 0;
  for (const char of segment) {
    let digit = chars.indexOf(char);
    if (digit < 0) continue;
    const cont = digit & 32;
    digit &= 31;
    value |= digit << shift;
    if (cont) {
      shift += 5;
      continue;
    }
    const negative = value & 1;
    value >>= 1;
    fields.push(negative ? -value : value);
    value = 0;
    shift = 0;
  }
  return fields;
}
