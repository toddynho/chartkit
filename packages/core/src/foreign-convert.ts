import { toResult, type Diagnostic, type JsonPatchOperation, type ValidationResult } from "./diagnostics";
import { RECHARTS_SERIES, WRAPPERS, first, foreignKind, isRec, type Rec } from "./foreign";
import { applyPatch, parseLoose } from "./repair";
import { repair, validate, type RepairResult } from "./validate";

export { parseLoose };

const PHASE4 = ["gantt", "timeline", "quadrant", "venn", "journey"];
const MAX_ROUNDS = 8;

/**
 * `repair()` plus the fixes that stay out of the validate bundle:
 * - Chart.js, ECharts, Plotly, Vega-Lite, and Recharts configs, and a `{ spec }` wrapper, are converted;
 * - misplaced keys are fixed: a top-level alt or description, a title object, top-level x and y,
 *   column arrays, `dataKey`, encoding the rows imply, type names such as `doughnut` or `column`,
 *   and scalars such as `"640"` where a number belongs;
 * - a fenced or JSON5-style string is parsed;
 * - warnings whose patch writes the value render already falls back to are applied;
 * - gantt, timeline, quadrant, venn, and journey use the `validate/phase4` rules.
 * Load it on demand: `const { repairAsync } = await import("@chartkitdev/core/validate/convert")`.
 */
export async function repairAsync(spec: unknown, data?: unknown): Promise<RepairResult> {
  if (typeof spec === "string") {
    const parsed = parseLoose(spec);
    if (parsed === undefined) return repair(spec, data);
    spec = parsed;
  }
  const phase4 = (value: unknown) => isRec(value) && typeof value.type === "string" && PHASE4.includes(value.type);
  if (!phase4(spec) && validate(spec, data).ok) return withFallbacks(repair(spec, data), data);
  let current = spec;
  const converted: JsonPatchOperation[] = [];
  const kind = foreignKind(spec);
  if (kind) {
    const conversion = convertForeign(spec);
    if (!conversion?.fix) {
      // No mechanical match: say why, and apply nothing rather than half-convert it.
      const note: Diagnostic = { code: "CK1009", severity: "error", message: `this is a ${kind} config, not a ChartKit spec`, path: "", hint: conversion?.hint ?? FOREIGN_HINT };
      return { spec, ...toResult([note, ...validate(spec, data).diagnostics]), applied: [] };
    }
    current = structuredClone(spec);
    for (const op of conversion.fix) if (applyPatch(current, op)) converted.push(op);
  }
  let rest: RepairResult;
  if (phase4(current)) rest = await import("./validate-phase4").then((mod) => mod.repairPhase4(current, data));
  else {
    // The notes are fixes on top of the schema errors. Then repair() finishes with plain validate().
    current = structuredClone(current);
    const applied: JsonPatchOperation[] = [];
    let before = "";
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const ops = withNotes(current, validate(current, data)).flatMap((item) => (item.severity === "error" ? item.fix ?? [] : []));
      const key = JSON.stringify(current);
      if (!ops.length || key === before) break;
      before = key;
      let moved = false;
      for (const op of ops) if (applyPatch(current, op)) {
        applied.push(op);
        moved = true;
      }
      if (!moved) break;
    }
    rest = withFallbacks(repair(current, data), data);
    rest = { ...rest, applied: [...applied, ...rest.applied] };
  }
  return { ...rest, applied: [...converted, ...rest.applied] };
}

/** Warnings whose patch writes what render already does: drop an option with no effect, clamp to render's range, or name its fallback. */
const FALLBACK = ["CK3019", "CK3034", "CK3035", "CK3036", "CK3042", "CK3043", "CK3072", "CK3125", "CK3126", "CK3127", "CK3128", "CK3129", "CK3131"];

function withFallbacks(result: RepairResult, data: unknown): RepairResult {
  if (!result.ok) return result;
  const spec = structuredClone(result.spec);
  const applied = [...result.applied];
  for (const op of result.warnings.filter((item) => FALLBACK.includes(item.code)).flatMap((item) => item.fix ?? [])) if (applyPatch(spec, op)) applied.push(op);
  return applied.length === result.applied.length ? result : { spec, ...validate(spec, data), applied };
}

/** The schema's diagnostics with each local note in place of the errors it explains. A note never adds an error. */
function withNotes(spec: unknown, result: ValidationResult): Diagnostic[] {
  const diagnostics = [...result.diagnostics];
  const kept = localNotes(spec, diagnostics).filter((note) => diagnostics.some((item) => item.severity === "error" && note.covers?.(item)));
  const rest = diagnostics.filter((item) => !kept.some((note) => note.covers?.(item)));
  return deferAltFix([...kept.map((note) => note.diagnostic), ...rest]);
}

const FOREIGN_HINT = 'Rewrite it as { version: "1", type, data: [rows], encoding: { x, y }, a11y: { alt } }.';

/**
 * `@chartkitdev/core/validate/convert`, loaded on demand by `repairAsync()`.
 *
 * - `convertForeign()` rewrites a Chart.js, ECharts, Plotly, Vega-Lite, or Recharts config
 *   (or a wrapped spec) into a ChartKit spec.
 * - `localNotes()` adds JSON Patch fixes for misplaced ChartKit keys: a top-level alt or
 *   description, a title object, top-level channels, column arrays, `dataKey`, and encoding
 *   when the rows allow one reading. A note only explains an error the schema already raised.
 * - `parseLoose()` reads a fenced or JSON5-style answer.
 *
 * A conversion moves what the input already says: rows, field names, the chart type, and the title.
 * It never invents values. The spec stays strict: `validate()` does not accept any of these shapes.
 */
export interface ForeignNote {
  diagnostic: Diagnostic;
  /** A whole-spec conversion. Other fixes in the same pass would fight it, so they wait a round. */
  whole?: boolean;
  /** Walker diagnostics this note explains. They are dropped so the agent sees one error. */
  covers?: (diagnostic: Diagnostic) => boolean;
}

interface Conversion {
  from: string;
  next?: Rec;
  hint?: string;
}

export interface ForeignConversion {
  from: string;
  /** JSON Patch that rewrites the config into a ChartKit spec. Absent when the shape has no mechanical match. */
  fix?: JsonPatchOperation[];
  hint?: string;
}

/** Fixes for misplaced ChartKit keys. Pass to validate's note hook; each note is kept only when it covers a schema error. */
export function localNotes(spec: unknown, diagnostics: Diagnostic[] = []): ForeignNote[] {
  if (!isRec(spec)) return [];
  return [aliasNote(spec, diagnostics), titleNote(spec), altNote(spec), channelNote(spec), dataNote(spec), ...dataKeyNotes(spec), ...channelExtraNotes(spec), ...coerceNotes(spec, diagnostics)].filter(
    (note): note is ForeignNote => note !== undefined,
  );
}

/* ------------------------------------------------------------------ fixes the schema errors leave open */

const TYPES = ["line", "bar", "donut", "pie", "stacked-area", "scatter", "combo", "heatmap", "gauge", "kpi", "sparkline", "mini-area", "progress-ring", "spike", "candlestick", "histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall", "area-range", "bar-range", "errorbar", "sunburst", "tree", "bar-list", "radial-bar", "rose", "strip", "streamgraph", "density"];

/** Names other libraries use for a ChartKit type. Keys are lower case with separators removed. */
const SIMPLE_ALIAS: Rec = {
  doughnut: "donut",
  column: "bar",
  columns: "bar",
  horizontalbar: "bar",
  verticalbar: "bar",
  hbar: "bar",
  barh: "bar",
  bubble: "scatter",
  scatterplot: "scatter",
  ohlc: "candlestick",
  candle: "candlestick",
  stock: "candlestick",
  number: "kpi",
  stat: "kpi",
  bignumber: "kpi",
  singlevalue: "kpi",
  scorecard: "kpi",
  progress: "progress-ring",
  progresscircle: "progress-ring",
  radialprogress: "progress-ring",
};

/** `doughnut`, `column`, `horizontalBar`, `bar chart`, `scatter plot`: an unknown type the schema could not rename. */
function aliasNote(spec: Rec, diagnostics: Diagnostic[]): ForeignNote | undefined {
  if (typeof spec.type !== "string" || !diagnostics.some((item) => item.code === "CK1005" && item.path === "/type" && !item.fix)) return undefined;
  const folded = spec.type.trim().replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const stem = folded.replace(/ (chart|plot|graph|diagram)$/, "");
  const type = (SIMPLE_ALIAS[folded.replace(/ /g, "")] ?? SIMPLE_ALIAS[stem.replace(/ /g, "")] ?? (TYPES.includes(stem.replace(/ /g, "-")) ? stem.replace(/ /g, "-") : undefined)) as string | undefined;
  if (!type) return undefined;
  return {
    diagnostic: { code: "CK1005", severity: "error", message: `unknown chart type ${JSON.stringify(spec.type)}`, path: "/type", hint: `did you mean ${JSON.stringify(type)}?`, fix: [{ op: "replace", path: "/type", value: type }] },
    covers: (item) => item.code === "CK1005" && item.path === "/type" && !item.fix,
  };
}

/** A scalar of the wrong JSON type that converts without guessing: "12" to 12, "true" to true, 12 to "12". */
function coerceNotes(spec: Rec, diagnostics: Diagnostic[]): ForeignNote[] {
  const notes: ForeignNote[] = [];
  for (const item of diagnostics) {
    const want = item.code === "CK1006" && !item.fix && item.path ? / must be ([a-z]+(?: or [a-z]+)*), got /.exec(item.message)?.[1]?.split(" or ") : undefined;
    if (!want) continue;
    const value = readPointer(spec, item.path);
    let next: unknown;
    if (typeof value === "string") {
      const text = value.trim();
      if ((want.includes("number") || (want.includes("integer") && /^-?\d+$/.test(text))) && /^-?\d+(?:\.\d+)?$/.test(text)) next = Number(text);
      else if (want.includes("boolean") && (text === "true" || text === "false")) next = text === "true";
    } else if (typeof value === "number" && Number.isFinite(value) && want.length === 1 && want[0] === "string") next = String(value);
    if (next === undefined) continue;
    const path = item.path;
    notes.push({ diagnostic: { ...item, fix: [{ op: "replace", path, value: next }] }, covers: (other) => other === item || (other.code === "CK1006" && other.path === path && !other.fix) });
  }
  return notes;
}

function readPointer(root: unknown, path: string): unknown {
  let node: unknown = root;
  for (const part of path.slice(1).split("/")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Rec)[part.replace(/~1/g, "/").replace(/~0/g, "~")];
  }
  return node;
}

const SHAPE_PATH = /^\/(?:type|encoding|data|metric)(?:\/|$)/;

/**
 * The suggested alt names the chart type and fields. While another fix still changes those,
 * the alt fix waits a round so it is not written from the old shape ("column chart of ...").
 */
function deferAltFix(diagnostics: Diagnostic[]): Diagnostic[] {
  const reshaping = diagnostics.some((item) => item.severity === "error" && item.fix?.some((op) => SHAPE_PATH.test(op.path) || op.path === ""));
  if (!reshaping) return diagnostics;
  return diagnostics.map((item) => ((item.code === "CK1004" && item.path === "/a11y") || (item.code === "CK1006" && item.path === "/a11y/alt") ? { ...item, fix: undefined } : item));
}

type YItem = string | Rec;

export function convertForeign(spec: unknown): ForeignConversion | undefined {
  if (!isRec(spec) || !foreignKind(spec)) return undefined;
  const converted = unwrap(spec) ?? fromChartJs(spec) ?? fromECharts(spec) ?? fromPlotly(spec) ?? fromVegaLite(spec) ?? fromRecharts(spec);
  if (!converted) return undefined;
  const fix = converted.next ? rewrite(spec, converted.next) : undefined;
  return { from: converted.from, fix: fix?.length ? fix : undefined, hint: converted.hint };
}

const CHARTJS_TYPE: Rec = { bar: "bar", horizontalBar: "bar", line: "line", pie: "pie", doughnut: "donut", radar: "radar", polarArea: "rose", scatter: "scatter", bubble: "scatter" };

/** Chart.js `{ type, data: { labels, datasets: [{ label, data }] }, options }`. */
function fromChartJs(spec: Rec): Conversion | undefined {
  const data = spec.data;
  if (!isRec(data) || !Array.isArray(data.datasets)) return undefined;
  if (spec.type !== undefined && !(typeof spec.type === "string" && spec.type in CHARTJS_TYPE)) return undefined;
  const sets = data.datasets.filter(isRec);
  const kind = typeof spec.type === "string" ? spec.type : "bar";
  const options = isRec(spec.options) ? spec.options : {};
  const base: Conversion = { from: "Chart.js" };
  if (!sets.length) return base;
  const labels = Array.isArray(data.labels) ? data.labels : undefined;
  const names = fieldNames(sets.map((set) => set.label), ["label", "series", "x", "y"]);
  const points = !labels && sets.every((set) => Array.isArray(set.data) && set.data.every((point) => point === null || isRec(point)));
  const next = carry(spec);
  const plugins = isRec(options.plugins) ? options.plugins : {};
  const title = textOf(isRec(plugins.title) ? plugins.title.text : isRec(options.title) ? options.title.text : undefined);
  if (title && next.title === undefined) next.title = title;

  if (points) {
    const rows: Rec[] = [];
    sets.forEach((set, k) => {
      for (const point of set.data as unknown[]) {
        if (!isRec(point)) continue;
        const row: Rec = sets.length > 1 ? { series: names[k] } : {};
        row.x = point.x;
        row.y = point.y;
        if (point.r !== undefined) row.size = point.r;
        rows.push(row);
      }
    });
    next.type = CHARTJS_TYPE[kind] === "line" ? "line" : "scatter";
    next.data = rows;
    next.encoding = { x: "x", y: "y", ...(sets.length > 1 ? { color: "series" } : {}), ...(rows.some((row) => row.size !== undefined) ? { size: "size" } : {}) };
    return { ...base, next };
  }

  const length = Math.max(labels?.length ?? 0, ...sets.map((set) => (Array.isArray(set.data) ? set.data.length : 0)));
  const rows: Rec[] = [];
  for (let i = 0; i < length; i++) {
    const row: Rec = { label: labels?.[i] ?? String(i + 1) };
    sets.forEach((set, k) => {
      const value = Array.isArray(set.data) ? set.data[i] : undefined;
      row[names[k]] = isRec(value) ? (value.y ?? value.value ?? null) : value ?? null;
    });
    rows.push(row);
  }
  const kinds = sets.map((set) => String(set.type ?? kind));
  const type = CHARTJS_TYPE[kind] as string | undefined;
  const scales = isRec(options.scales) ? options.scales : {};
  const stacked = [scales.x, scales.y, scales.xAxes, scales.yAxes].some((axis) => isRec(axis) && axis.stacked === true);
  const mixed = new Set(kinds.map((item) => (item === "line" ? "line" : "bar"))).size > 1;
  next.data = rows;
  if (mixed) {
    const firstAxis = sets[0]?.yAxisID;
    next.type = "combo";
    next.encoding = {
      x: "label",
      y: sets.map((set, k) => ({ field: names[k], mark: kinds[k] === "line" ? "line" : "bar", ...(set.yAxisID !== undefined && set.yAxisID !== firstAxis ? { axis: "y2" } : {}) })),
    };
    if (sets.some((set) => set.yAxisID !== undefined && set.yAxisID !== firstAxis)) next.axes = { y2: true };
    return { ...base, next };
  }
  if (!type) return { ...base, hint: `Chart.js type ${JSON.stringify(kind)} has no direct ChartKit match. Pick a ChartKit type and move the datasets into rows.` };
  next.type = type === "line" && stacked && sets.length > 1 ? "stacked-area" : type;
  next.encoding = { x: "label", y: yList(names, type === "bar" && stacked ? "total" : undefined) };
  if (type === "line" && sets.every((set) => set.fill !== undefined && set.fill !== false) && next.type === "line") next.mark = { area: true };
  return { ...base, next };
}

/** ECharts `{ xAxis: { data }, yAxis, series: [{ type, name, data }] }`. */
function fromECharts(spec: Rec): Conversion | undefined {
  const series = Array.isArray(spec.series) ? spec.series.filter(isRec) : isRec(spec.series) ? [spec.series] : undefined;
  if (!series || !series.length || series.some((item) => "dataKey" in item) || !series.some((item) => typeof item.type === "string" || Array.isArray(item.data))) return undefined;
  if (Array.isArray(spec.data) && isRec(spec.encoding)) return undefined;
  const base: Conversion = { from: "ECharts" };
  const next = carry(spec);
  const titleRec = first(spec.title);
  if (titleRec) {
    const text = textOf(titleRec.text);
    const sub = textOf(titleRec.subtext);
    if (text) next.title = text;
    if (sub) next.subtitle = sub;
  }
  const kinds = series.map((item) => String(item.type ?? "line"));
  const head = series[0];
  const headData = Array.isArray(head.data) ? head.data : [];

  if (kinds[0] === "gauge") {
    const item = headData[0];
    const value = isRec(item) ? item.value : item;
    if (typeof value !== "number") return base;
    const label = isRec(item) ? textOf(item.name) : undefined;
    next.type = "gauge";
    next.metric = { ...(label ? { label } : {}), value, min: typeof head.min === "number" ? head.min : 0, max: typeof head.max === "number" ? head.max : 100 };
    return { ...base, next };
  }

  if (kinds[0] === "pie" || kinds[0] === "funnel") {
    const rows = nameValueRows(headData);
    if (!rows) return base;
    const radius = head.radius;
    const inner = Array.isArray(radius) ? radius[0] : 0;
    const hole = typeof inner === "number" ? inner > 0 : typeof inner === "string" && parseFloat(inner) > 0;
    next.type = kinds[0] === "funnel" ? "funnel" : head.roseType ? "rose" : hole ? "donut" : "pie";
    next.data = rows;
    next.encoding = { x: "label", y: "value" };
    return { ...base, next };
  }

  if (kinds[0] === "radar") {
    const radar = first(spec.radar);
    const indicators = radar && Array.isArray(radar.indicator) ? radar.indicator.filter(isRec) : [];
    const items = headData.filter(isRec).filter((item) => Array.isArray(item.value));
    if (!indicators.length || !items.length) return base;
    const names = fieldNames(items.map((item) => item.name), ["label"]);
    next.type = "radar";
    next.data = indicators.map((indicator, i) => {
      const row: Rec = { label: indicator.name ?? indicator.text ?? String(i + 1) };
      items.forEach((item, k) => (row[names[k]] = (item.value as unknown[])[i] ?? null));
      return row;
    });
    next.encoding = { x: "label", y: yList(names) };
    return { ...base, next };
  }

  const xAxis = first(spec.xAxis);
  const yAxis = first(spec.yAxis);
  const categories = Array.isArray(xAxis?.data) ? xAxis.data : Array.isArray(yAxis?.data) ? yAxis.data : undefined;

  if (kinds[0] === "heatmap") {
    const ys = Array.isArray(yAxis?.data) ? yAxis.data : undefined;
    const rows = headData.map((item) => (isRec(item) ? item.value : item)).filter(Array.isArray).map((cell) => ({
      x: typeof cell[0] === "number" && Array.isArray(xAxis?.data) ? xAxis.data[cell[0]] : cell[0],
      y: typeof cell[1] === "number" && ys ? ys[cell[1]] : cell[1],
      value: cell[2],
    }));
    if (!rows.length) return base;
    next.type = "heatmap";
    next.data = rows;
    next.encoding = { x: "x", y: "y", color: "value" };
    return { ...base, next };
  }

  if (kinds[0] === "candlestick" && categories) {
    // ECharts orders a candle as [open, close, low, high].
    const rows = headData.map((item, i) => {
      const cell = isRec(item) ? item.value : item;
      return Array.isArray(cell) ? { x: categories[i], open: cell[0], close: cell[1], low: cell[2], high: cell[3] } : undefined;
    }).filter(isRec);
    if (!rows.length) return base;
    next.type = "candlestick";
    next.data = rows;
    next.encoding = { x: "x", open: "open", high: "high", low: "low", close: "close" };
    return { ...base, next };
  }

  if (kinds.every((kind) => kind === "scatter" || kind === "effectScatter")) {
    const names = fieldNames(series.map((item) => item.name), ["x", "y"]);
    const rows: Rec[] = [];
    series.forEach((item, k) => {
      for (const point of Array.isArray(item.data) ? item.data : []) {
        const cell = isRec(point) ? point.value : point;
        if (Array.isArray(cell)) rows.push({ ...(series.length > 1 ? { series: names[k] } : {}), x: cell[0], y: cell[1] });
      }
    });
    if (!rows.length) return base;
    next.type = "scatter";
    next.data = rows;
    next.encoding = { x: "x", y: "y", ...(series.length > 1 ? { color: "series" } : {}) };
    return { ...base, next };
  }

  if (!kinds.every((kind) => kind === "line" || kind === "bar")) {
    return { ...base, hint: `ECharts series type ${JSON.stringify(kinds.find((kind) => kind !== "line" && kind !== "bar"))} is not converted. Rewrite it as rows and a ChartKit type.` };
  }

  const dataset = first(spec.dataset);
  const fromSource = dataset ? sourceRows(dataset.source) : undefined;
  let rows: Rec[];
  let x: string;
  let fields: string[];
  if (fromSource) {
    rows = fromSource.rows;
    const encodes = series.map((item) => (isRec(item.encode) ? item.encode : {}));
    x = typeof encodes[0]?.x === "string" ? (encodes[0].x as string) : fromSource.keys[0];
    fields = encodes.every((encode) => typeof encode.y === "string") ? encodes.map((encode) => encode.y as string) : fromSource.keys.filter((key) => key !== x).slice(0, series.length);
  } else if (categories) {
    fields = fieldNames(series.map((item) => item.name), ["label"]);
    x = "label";
    rows = categories.map((label, i) => {
      const row: Rec = { label };
      series.forEach((item, k) => {
        const cell = Array.isArray(item.data) ? item.data[i] : undefined;
        const value = isRec(cell) ? cell.value : cell;
        row[fields[k]] = Array.isArray(value) ? value[value.length - 1] : value ?? null;
      });
      return row;
    });
  } else {
    fields = fieldNames(series.map((item) => item.name), ["x"]);
    x = "x";
    const byX = new Map<unknown, Rec>();
    series.forEach((item, k) => {
      for (const point of Array.isArray(item.data) ? item.data : []) {
        const cell = isRec(point) ? point.value : point;
        if (!Array.isArray(cell)) continue;
        const row: Rec = byX.get(cell[0]) ?? { x: cell[0] };
        row[fields[k]] = cell[1];
        byX.set(cell[0], row);
      }
    });
    rows = [...byX.values()];
    if (!rows.length) return { ...base, hint: "ECharts series data needs xAxis.data categories or [x, y] pairs to convert." };
  }
  const stacked = series.some((item) => item.stack !== undefined);
  const area = series.every((item) => item.areaStyle !== undefined);
  next.data = rows;
  if (kinds.includes("line") && kinds.includes("bar")) {
    next.type = "combo";
    next.encoding = { x, y: series.map((item, k) => ({ field: fields[k], mark: kinds[k], ...(item.yAxisIndex === 1 ? { axis: "y2" } : {}) })) };
    if (series.some((item) => item.yAxisIndex === 1)) next.axes = { y2: true };
  } else if (kinds[0] === "bar") {
    next.type = "bar";
    next.encoding = { x, y: stacked ? series.map((item, k) => ({ field: fields[k], stack: String(item.stack ?? "total") })) : yList(fields) };
  } else {
    next.type = area && stacked && fields.length > 1 ? "stacked-area" : "line";
    next.encoding = { x, y: yList(fields) };
    if (area && next.type === "line") next.mark = { area: true };
  }
  return { ...base, next };
}

/** Plotly `{ data: [{ type, x, y, name }], layout }`. */
function fromPlotly(spec: Rec): Conversion | undefined {
  if (typeof spec.type === "string" || !Array.isArray(spec.data) || !spec.data.length) return undefined;
  const traces = spec.data;
  if (!traces.every((trace) => isRec(trace) && (Array.isArray(trace.y) || Array.isArray(trace.values)))) return undefined;
  const list = traces as Rec[];
  const base: Conversion = { from: "Plotly" };
  const next = carry(spec);
  const layout = isRec(spec.layout) ? spec.layout : {};
  const title = textOf(isRec(layout.title) ? layout.title.text : layout.title);
  if (title && next.title === undefined) next.title = title;
  const head = list[0];
  if (head.type === "pie") {
    const labels = Array.isArray(head.labels) ? head.labels : [];
    const values = Array.isArray(head.values) ? head.values : [];
    next.type = typeof head.hole === "number" && head.hole > 0 ? "donut" : "pie";
    next.data = values.map((value, i) => ({ label: labels[i] ?? String(i + 1), value }));
    next.encoding = { x: "label", y: "value" };
    return { ...base, next };
  }
  const kind = (trace: Rec) => (trace.type === "bar" ? "bar" : typeof trace.mode === "string" && !trace.mode.includes("lines") ? "scatter" : "line");
  const kinds = list.map(kind);
  if (kinds.every((item) => item === "scatter")) {
    const names = fieldNames(list.map((trace) => trace.name), ["x", "y"]);
    const rows: Rec[] = [];
    list.forEach((trace, k) => (trace.y as unknown[]).forEach((y, i) => rows.push({ ...(list.length > 1 ? { series: names[k] } : {}), x: Array.isArray(trace.x) ? trace.x[i] : i + 1, y })));
    next.type = "scatter";
    next.data = rows;
    next.encoding = { x: "x", y: "y", ...(list.length > 1 ? { color: "series" } : {}) };
    return { ...base, next };
  }
  const fields = fieldNames(list.map((trace) => trace.name), ["x"]);
  const byX = new Map<unknown, Rec>();
  list.forEach((trace, k) => {
    (trace.y as unknown[]).forEach((y, i) => {
      const x = Array.isArray(trace.x) ? trace.x[i] : i + 1;
      const row: Rec = byX.get(x) ?? { x };
      row[fields[k]] = y;
      byX.set(x, row);
    });
  });
  next.data = [...byX.values()];
  const mixed = new Set(kinds).size > 1;
  next.type = mixed ? "combo" : kinds[0] === "bar" ? "bar" : "line";
  next.encoding = mixed
    ? { x: "x", y: list.map((trace, k) => ({ field: fields[k], mark: kinds[k] === "bar" ? "bar" : "line", ...(trace.yaxis === "y2" ? { axis: "y2" } : {}) })) }
    : { x: "x", y: yList(fields, kinds[0] === "bar" && layout.barmode === "stack" ? "total" : undefined) };
  if (mixed && list.some((trace) => trace.yaxis === "y2")) next.axes = { y2: true };
  return { ...base, next };
}

const VL_TYPE: Rec = { bar: "bar", line: "line", area: "line", point: "scatter", circle: "scatter", square: "scatter", rect: "heatmap", tick: "strip", boxplot: "boxplot", rule: "spike", trail: "line" };
const VL_FIELD_TYPES = ["quantitative", "temporal", "ordinal", "nominal"];

/** Vega-Lite `{ mark: { type }, data: { values }, encoding: { x: { field, type } } }`. */
function fromVegaLite(spec: Rec): Conversion | undefined {
  const markRec = isRec(spec.mark) && typeof spec.mark.type === "string" ? spec.mark : undefined;
  const vega = typeof spec.$schema === "string" && /vega/i.test(spec.$schema);
  if (!markRec && !vega) return undefined;
  const base: Conversion = { from: "Vega-Lite" };
  const markType = markRec ? String(markRec.type) : typeof spec.mark === "string" ? spec.mark : "";
  const encoding = isRec(spec.encoding) ? spec.encoding : {};
  if (spec.layer !== undefined) return undefined;
  const blocked = ["hconcat", "vconcat", "concat", "facet", "repeat", "transform", "params", "selection"].find((key) => spec[key] !== undefined);
  if (blocked) return { ...base, hint: `Vega-Lite ${blocked} has no mechanical ChartKit match. Rewrite it as rows, a ChartKit type, and encoding.` };
  const derived = Object.entries(encoding).find(([key, channel]) => key === "row" || key === "column" || (isRec(channel) && ["aggregate", "bin", "timeUnit"].some((prop) => channel[prop] !== undefined)));
  if (derived) return { ...base, hint: `encoding.${derived[0]} asks Vega-Lite to aggregate, bin, or facet. Precompute the rows, then use a ChartKit type.` };
  const rows = isRec(spec.data) && Array.isArray(spec.data.values) ? spec.data.values : Array.isArray(spec.data) ? spec.data : undefined;
  const type = markType === "arc" ? (markRec && Number(markRec.innerRadius) > 0 ? "donut" : "pie") : (VL_TYPE[markType] as string | undefined);
  if (!rows || !type) return { ...base, hint: rows ? `mark ${JSON.stringify(markType)} has no ChartKit type. Pick one from the type list.` : "data.url is not loaded. Put the rows in data." };
  const next = carry(spec);
  next.type = type;
  next.data = rows;
  const out: Rec = {};
  for (const [key, channel] of Object.entries(encoding)) {
    const plain = vlChannel(channel);
    if (plain === undefined) continue;
    if (markType === "arc") {
      if (key === "theta") out.y = plain;
      else if (key === "color") out.x = plain;
    } else if (["x", "y", "color", "size"].includes(key)) out[key] = plain;
  }
  next.encoding = out;
  if (markType === "area" || (markRec && markRec.filled === true && type === "line")) next.mark = { area: true };
  const width = spec.width;
  const height = spec.height;
  if (typeof width === "number" || typeof height === "number") next.size = { ...(typeof width === "number" ? { width } : {}), ...(typeof height === "number" ? { height } : {}) };
  return { ...base, next };
}

function vlChannel(channel: unknown): unknown {
  if (typeof channel === "string") return channel;
  if (!isRec(channel) || typeof channel.field !== "string") return undefined;
  const out: Rec = { field: channel.field };
  if (typeof channel.type === "string" && VL_FIELD_TYPES.includes(channel.type)) out.type = channel.type;
  if (typeof channel.title === "string") out.title = channel.title;
  return Object.keys(out).length === 1 ? channel.field : out;
}

const RECHARTS_TYPE: Rec = { BarChart: "bar", LineChart: "line", AreaChart: "stacked-area", PieChart: "pie", ScatterChart: "scatter", ComposedChart: "combo", RadarChart: "radar", FunnelChart: "funnel", Treemap: "treemap" };

/** Recharts props written as JSON: `xAxis: { dataKey }`, `bars: [{ dataKey }]`, `dataKey`, `nameKey`. */
function fromRecharts(spec: Rec): Conversion | undefined {
  if (!Array.isArray(spec.data) || spec.encoding !== undefined) return undefined;
  const xRec = first(spec.xAxis) ?? first(spec.XAxis);
  const series: { field: string; mark: string }[] = [];
  for (const key of RECHARTS_SERIES) {
    const raw = spec[key];
    const items = Array.isArray(raw) ? raw : raw !== undefined ? [raw] : [];
    for (const item of items) {
      const field = isRec(item) ? item.dataKey : typeof item === "string" && key === "dataKeys" ? item : undefined;
      if (typeof field === "string") series.push({ field, mark: /bar/i.test(key) ? "bar" : /area/i.test(key) ? "area" : "line" });
    }
  }
  if (typeof spec.dataKey === "string") series.push({ field: spec.dataKey, mark: "bar" });
  const x = typeof xRec?.dataKey === "string" ? xRec.dataKey : typeof spec.nameKey === "string" ? spec.nameKey : undefined;
  if (!series.length || (!x && !xRec && spec.dataKey === undefined)) return undefined;
  const rows = spec.data.filter(isRec);
  const xField = x ?? (rows[0] && "name" in rows[0] ? "name" : undefined);
  if (!xField) return { from: "Recharts", hint: "Set encoding.x to the category field and encoding.y to the dataKey fields." };
  const next: Rec = { ...spec };
  for (const key of [...RECHARTS_SERIES, "xAxis", "XAxis", "yAxis", "YAxis", "dataKey", "nameKey", "cartesianGrid", "CartesianGrid"]) delete next[key];
  const named = typeof spec.type === "string" ? ((RECHARTS_TYPE[spec.type] as string | undefined) ?? spec.type) : undefined;
  const marks = new Set(series.map((item) => (item.mark === "bar" ? "bar" : "line")));
  const fields = series.map((item) => item.field);
  if (marks.size > 1 || named === "combo") {
    next.type = "combo";
    next.encoding = { x: xField, y: series.map((item) => ({ field: item.field, mark: item.mark === "area" ? "line" : item.mark })) };
  } else {
    next.type = named ?? (series[0].mark === "area" ? (fields.length > 1 ? "stacked-area" : "line") : series[0].mark);
    next.encoding = { x: xField, y: yList(fields) };
  }
  next.version = typeof spec.version === "string" ? spec.version : "1";
  return { from: "Recharts", next, hint: "dataKey is a Recharts prop. ChartKit names fields in encoding: x is the category, y the measure." };
}

/** `{ spec: {...} }`, `{ chart: {...} }`. */
function unwrap(spec: Rec): Conversion | undefined {
  const keys = Object.keys(spec).filter((key) => key !== "version" && key !== "$schema");
  if (keys.length !== 1 || !WRAPPERS.includes(keys[0])) return undefined;
  const inner = spec[keys[0]];
  if (!isRec(inner) || !("type" in inner || "data" in inner || "encoding" in inner || "metric" in inner)) return undefined;
  return { from: `wrapped (${keys[0]})`, next: { ...inner }, hint: `The spec is the top-level object. Move ${keys[0]}'s keys up one level.` };
}

/* ------------------------------------------------------------------ local fixes */

/** `title: { text, subtext }` is the ECharts and Chart.js form. */
function titleNote(spec: Rec): ForeignNote | undefined {
  const title = spec.title;
  if (!isRec(title) && !Array.isArray(title)) return undefined;
  const rec = first(title) ?? {};
  const text = textOf(rec.text ?? rec.title ?? (Array.isArray(title) ? title : undefined));
  const sub = textOf(rec.subtext ?? rec.subtitle);
  const fix: JsonPatchOperation[] = text ? [{ op: "replace", path: "/title", value: text }] : [{ op: "remove", path: "/title" }];
  if (sub && spec.subtitle === undefined) fix.push({ op: "add", path: "/subtitle", value: sub });
  return {
    diagnostic: { code: "CK1009", severity: "error", message: "title is a string", path: "/title", hint: "title and subtitle are plain strings.", fix },
    covers: (item) => item.path === "/title" || item.path.startsWith("/title/"),
  };
}

const ALT_KEYS = ["alt", "altText", "alt_text", "ariaLabel", "aria-label", "description", "caption", "summary"];

/** `alt` or `description` at the top level is a11y.alt. */
function altNote(spec: Rec): ForeignNote | undefined {
  const key = ALT_KEYS.find((name) => typeof spec[name] === "string" && (spec[name] as string).trim());
  if (!key) return undefined;
  const text = (spec[key] as string).trim();
  const a11y = isRec(spec.a11y) ? spec.a11y : undefined;
  const hasAlt = typeof a11y?.alt === "string" && a11y.alt.trim().length >= 10;
  const fix: JsonPatchOperation[] = [{ op: "remove", path: `/${pointer(key)}` }];
  if (!hasAlt) fix.push(a11y ? { op: "add", path: "/a11y/alt", value: text } : { op: "add", path: "/a11y", value: { alt: text } });
  else if (key === "description" && a11y?.description === undefined) fix.push({ op: "add", path: "/a11y/description", value: text });
  return {
    diagnostic: {
      code: "CK1009",
      severity: "error",
      message: `${key} belongs in a11y.${hasAlt && key === "description" ? "description" : "alt"}`,
      path: `/${pointer(key)}`,
      hint: "Screen-reader text is a11y.alt: one sentence with the takeaway.",
      fix,
    },
    covers: (item) => item.path === `/${pointer(key)}` || (!hasAlt && (item.path === "/a11y" || item.path === "/a11y/alt")),
  };
}

const CHANNELS = ["x", "y", "color", "size", "series", "label", "open", "high", "low", "close", "source", "target"];

/** `x`, `y`, `color` at the top level belong in encoding. */
function channelNote(spec: Rec): ForeignNote | undefined {
  const encoding = isRec(spec.encoding) ? spec.encoding : undefined;
  if (spec.encoding !== undefined && !encoding) return undefined;
  const row = Array.isArray(spec.data) && isRec(spec.data[0]) ? spec.data[0] : isRec(spec.data) && isRec(spec.data.columns) ? spec.data.columns : undefined;
  if (!row) return undefined;
  const known = (name: unknown) => typeof name === "string" && name in row;
  const moved = CHANNELS.filter((key) => {
    const value = spec[key];
    const named = known(value) || (Array.isArray(value) && value.length > 0 && value.every(known)) || (isRec(value) && (known(value.field) || known(value.dataKey)));
    return named && encoding?.[key] === undefined;
  });
  if (!moved.length) return undefined;
  const next: Rec = { ...(encoding ?? {}) };
  for (const key of moved) {
    const value = spec[key];
    next[key] = isRec(value) && typeof value.dataKey === "string" && value.field === undefined ? value.dataKey : value;
  }
  const fix: JsonPatchOperation[] = moved.map((key) => ({ op: "remove", path: `/${key}` }));
  fix.push({ op: "add", path: "/encoding", value: next });
  return {
    diagnostic: { code: "CK1009", severity: "error", message: `${moved.join(", ")} belong in encoding`, path: "/encoding", hint: "Field names go in encoding: { x, y }.", fix },
    covers: (item) => moved.some((key) => item.path === `/${key}` || item.path.startsWith(`/${key}/`)) || (item.code === "CK1003" && item.path === "" && /"encoding"/.test(item.message)),
  };
}

const PART_TYPES = new Set(["donut", "pie", "funnel", "bar", "bar-list", "treemap", "rose", "radial-bar"]);
const METRIC_KEYS = new Set(["value", "min", "max", "label", "delta", "target"]);
const ENCODED_TYPES = new Set(["line", "bar", "donut", "pie", "stacked-area", "scatter", "spike", "funnel", "radar", "waterfall", "streamgraph", "bar-list", "radial-bar", "rose", "treemap"]);

/** Columns (`data: { a: [...], b: [...] }`), a key/value map, or rows with no encoding when only one reading fits. */
function dataNote(spec: Rec): ForeignNote | undefined {
  const data = spec.data;
  const type = typeof spec.type === "string" ? spec.type : "";
  if (isRec(data) && data.columns === undefined && data.values === undefined && data.datasets === undefined) {
    const entries = Object.entries(data);
    if (!entries.length) return undefined;
    if (entries.every(([, value]) => Array.isArray(value))) {
      const lengths = new Set(entries.map(([, value]) => (value as unknown[]).length));
      if (lengths.size !== 1) return undefined;
      return {
        diagnostic: { code: "CK1009", severity: "error", message: "column arrays go in data.columns", path: "/data", hint: "data is rows, or { columns: { field: [values] } }.", fix: [{ op: "replace", path: "/data", value: { columns: data } }] },
        covers: (item) => item.path === "/data" || item.path.startsWith("/data/"),
      };
    }
    const metricLike = entries.every(([key]) => METRIC_KEYS.has(key));
    if (entries.length >= 2 && !metricLike && entries.every(([, value]) => typeof value === "number") && PART_TYPES.has(type)) {
      const fix: JsonPatchOperation[] = [{ op: "replace", path: "/data", value: entries.map(([label, value]) => ({ label, value })) }];
      if (spec.encoding === undefined) fix.push({ op: "add", path: "/encoding", value: { x: "label", y: "value" } });
      return {
        diagnostic: { code: "CK1009", severity: "error", message: "data is a list of rows, not a key/value map", path: "/data", hint: 'Each key becomes a row: { "label": key, "value": number }.', fix },
        covers: (item) => item.path === "/data" || item.path.startsWith("/data/") || (item.code === "CK1003" && item.path === "" && /"encoding"/.test(item.message)),
      };
    }
    return undefined;
  }
  if (spec.encoding !== undefined || !ENCODED_TYPES.has(type) || !Array.isArray(data) || !data.length || !data.every(isRec)) return undefined;
  if (CHANNELS.some((key) => spec[key] !== undefined)) return undefined;
  const keys = Object.keys(data[0] as Rec);
  const numeric = keys.filter((key) => (data as Rec[]).every((row) => typeof row[key] === "number"));
  const other = keys.filter((key) => !numeric.includes(key));
  let encoding: Rec | undefined;
  if (other.length === 1 && numeric.length >= 1 && type !== "scatter") encoding = { x: other[0], y: numeric.length === 1 || type === "donut" || type === "pie" || type === "funnel" ? numeric[0] : numeric };
  else if (other.length === 0 && numeric.length === 2 && type === "scatter") encoding = { x: numeric[0], y: numeric[1] };
  if (!encoding || ((type === "donut" || type === "pie" || type === "funnel") && numeric.length !== 1)) return undefined;
  return {
    diagnostic: {
      code: "CK1003",
      severity: "error",
      message: 'missing required property "encoding"',
      path: "",
      hint: `The rows have one label field and ${numeric.length} number field${numeric.length === 1 ? "" : "s"}, so encoding is ${JSON.stringify(encoding)}.`,
      fix: [{ op: "add", path: "/encoding", value: encoding }],
    },
    covers: (item) => item.code === "CK1003" && item.path === "" && /"encoding"/.test(item.message),
  };
}

/** Recharts `dataKey` (and `key`) in an encoding channel is `field`. */
function dataKeyNotes(spec: Rec): ForeignNote[] {
  const encoding = isRec(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return [];
  const notes: ForeignNote[] = [];
  for (const [key, channel] of Object.entries(encoding)) {
    const path = `/encoding/${pointer(key)}`;
    const fixed = Array.isArray(channel) ? channel.map(dataKeyChannel) : dataKeyChannel(channel);
    if (JSON.stringify(fixed) === JSON.stringify(channel)) continue;
    notes.push({
      diagnostic: { code: "CK1009", severity: "error", message: "dataKey is field", path, hint: "A channel is a field name, or { field } with options.", fix: [{ op: "replace", path, value: fixed }] },
      covers: (item) => item.path === path || item.path.startsWith(`${path}/`),
    });
  }
  return notes;
}

function dataKeyChannel(channel: unknown): unknown {
  if (!isRec(channel) || channel.field !== undefined) return channel;
  const name = typeof channel.dataKey === "string" ? channel.dataKey : typeof channel.key === "string" ? channel.key : typeof channel.column === "string" ? channel.column : undefined;
  if (name === undefined) return channel;
  const rest: Rec = { ...channel };
  delete rest.dataKey;
  delete rest.key;
  delete rest.column;
  return Object.keys(rest).length ? { field: name, ...rest } : name;
}

const VL_EXTRAS = ["legend", "sort", "condition"];

/** Vega-Lite channel options that ChartKit does not take. Only the ones that leave the data as drawn are removed. */
function channelExtraNotes(spec: Rec): ForeignNote[] {
  const encoding = isRec(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return [];
  const notes: ForeignNote[] = [];
  for (const [key, channel] of Object.entries(encoding)) {
    if (!isRec(channel) || typeof channel.field !== "string" || key === "x") continue;
    const extras = VL_EXTRAS.filter((name) => channel[name] !== undefined);
    if (!extras.length) continue;
    const path = `/encoding/${pointer(key)}`;
    const fix: JsonPatchOperation[] = extras.map((name) => ({ op: "remove", path: `${path}/${name}` }));
    notes.push({
      diagnostic: { code: "CK1009", severity: "error", message: `${extras.join(", ")} on encoding.${key} is Vega-Lite`, path, hint: "Axis and legend options live in axes and legend. Order comes from the rows.", fix },
      covers: (item) => extras.some((name) => item.path === `${path}/${name}` || item.path.startsWith(`${path}/${name}/`)),
    });
  }
  return notes;
}

/* ------------------------------------------------------------------ helpers */



/** Keys the converted spec keeps from the input: version, a11y, title, subtitle, and an alt-like description. */
function carry(spec: Rec): Rec {
  const next: Rec = { version: "1" };
  if (isRec(spec.a11y)) next.a11y = spec.a11y;
  const title = typeof spec.title === "string" ? spec.title : textOf(first(spec.title)?.text);
  if (title) next.title = title;
  if (typeof spec.subtitle === "string") next.subtitle = spec.subtitle;
  const alt = ALT_KEYS.map((key) => spec[key]).find((value): value is string => typeof value === "string" && value.trim().length > 0);
  if (alt && !(isRec(next.a11y) && typeof next.a11y.alt === "string")) next.a11y = { ...(isRec(next.a11y) ? next.a11y : {}), alt: alt.trim() };
  return next;
}

function nameValueRows(items: unknown[]): Rec[] | undefined {
  const rows = items.filter(isRec).map((item, i) => ({ label: item.name ?? String(i + 1), value: item.value }));
  return rows.length && rows.every((row) => typeof row.value === "number") ? rows : undefined;
}

function sourceRows(source: unknown): { rows: Rec[]; keys: string[] } | undefined {
  if (!Array.isArray(source) || !source.length) return undefined;
  if (source.every(isRec)) return { rows: source as Rec[], keys: Object.keys(source[0] as Rec) };
  const [header, ...body] = source;
  if (!Array.isArray(header) || !header.every((cell) => typeof cell === "string") || !body.every(Array.isArray)) return undefined;
  const keys = header as string[];
  return { rows: (body as unknown[][]).map((cells) => Object.fromEntries(keys.map((key, i) => [key, cells[i] ?? null]))), keys };
}

/** Field names from series labels. A missing label is "value", or "series 2" and on when there are several. */
function fieldNames(labels: unknown[], reserved: string[]): string[] {
  const used = new Set(reserved);
  return labels.map((label, i) => {
    let name = typeof label === "string" && label.trim() ? label.trim() : typeof label === "number" ? String(label) : labels.length === 1 ? "value" : `series ${i + 1}`;
    if (used.has(name)) name = `${name} ${i + 1}`;
    used.add(name);
    return name;
  });
}

function yList(fields: string[], stack?: string): YItem | YItem[] {
  if (stack) return fields.map((field) => ({ field, stack }));
  return fields.length === 1 ? fields[0] : fields;
}


function rewrite(spec: Rec, next: Rec): JsonPatchOperation[] {
  const ops: JsonPatchOperation[] = [];
  for (const key of Object.keys(spec)) if (!(key in next)) ops.push({ op: "remove", path: `/${pointer(key)}` });
  for (const [key, value] of Object.entries(next)) {
    if (JSON.stringify(spec[key]) !== JSON.stringify(value)) ops.push({ op: "add", path: `/${pointer(key)}`, value });
  }
  return ops;
}

function textOf(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value.join(" ").trim() || undefined;
  return undefined;
}

function pointer(key: string): string {
  return key.replace(/~/g, "~0").replace(/\//g, "~1");
}
