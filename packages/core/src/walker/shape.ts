import type { JsonPatchOperation } from "../diagnostics";
import { asList, emit, fieldName, firstRow, isPlainObject, isTypedArray, pointer, quote, type Ctx } from "./util";
import { chartTypeName, yFieldReplacement } from "./chart-type";

export const FIELD_TYPE_ALIAS: Record<string, string> = {
  categorical: "nominal",
  category: "nominal",
  qualitative: "nominal",
};

export const PLACE_ALIAS: Record<string, string> = { above: "top", below: "bottom", over: "top", under: "bottom" };

const METRIC_FIELDS = ["label", "value", "min", "max", "delta", "target"] as const;
const DONUT_CHANNELS = ["label", "theta", "angle", "value"] as const;

/** Shapes agents copy from Vega-Lite. One CK1009, with a patch, instead of a pile of missing-property errors. */
export function repairShape(value: unknown, path: string, ctx: Ctx): boolean {
  if (path === "/tooltip/fields" && typeof value === "string") {
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: "tooltip.fields is a list",
      path,
      hint: "did you mean a list?",
      fix: [{ op: "replace", path, value: value.split(",").map((part) => part.trim()).filter(Boolean) }],
    });
    return true;
  }
  if (path === "/data" && isPlainObject(value) && Array.isArray(value.values) && value.columns === undefined) {
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: "data must be a plain array of rows, not { values }",
      path: "/data",
      hint: "ChartKit takes the rows directly: data: [...]. Move data.values up to data.",
      fix: [{ op: "move", from: "/data/values", path: "/data" }],
    });
    return true;
  }
  if (path === "/mark" && Array.isArray(value) && ctx.skipUnknown.has("/mark")) return true;
  if (path === "/mark" && typeof value === "string") {
    const mapped = chartTypeName(value, ctx.rootValue);
    const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
    const fix: JsonPatchOperation[] = [];
    if (typeof root.type !== "string" && mapped) fix.push({ op: "add", path: "/type", value: mapped });
    fix.push({ op: "remove", path: "/mark" });
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: "mark is an options object; the chart type goes in type",
      path: "/mark",
      hint: mapped
        ? `use type: ${JSON.stringify(mapped)}. mark is options such as curve and sampling, not a type name.`
        : 'mark is an options object. Put the chart type in type, for example "line".',
      fix,
    });
    if (mapped && typeof root.type !== "string") ctx.skipMissing.add("|type");
    return true;
  }
  if (repairYFieldList(value, path, ctx)) return true;
  return false;
}

/** `encoding.y: { field: ["a", "b"] }` is the list form `encoding.y: ["a", "b"]`. */
function repairYFieldList(value: unknown, path: string, ctx: Ctx): boolean {
  if (path !== "/encoding/y") return false;
  const replacement = yFieldReplacement(value);
  if (replacement === undefined) return false;
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "a list of fields belongs on encoding.y, not on field",
    path: "/encoding/y",
    hint: "encoding.y is a field name or a list of field names. The array belongs on y, not on field.",
    fix: [{ op: "replace", path: "/encoding/y", value: replacement }],
  });
  return true;
}

/** On a combo, `type: "bar"|"line"|"area"` inside a y item is the series mark. */
export function comboSeriesMark(path: string, value: unknown, ctx: Ctx): boolean {
  if (value !== "bar" && value !== "line" && value !== "area") return false;
  const match = /^\/encoding\/y(?:\/(\d+))?\/type$/.exec(path);
  if (!match) return false;
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : undefined;
  if (!root || root.type !== "combo") return false;
  const parent = match[1] === undefined ? "/encoding/y" : `/encoding/y/${match[1]}`;
  const node = pointer(root, parent);
  const hasMark = isPlainObject(node) && Object.prototype.hasOwnProperty.call(node, "mark");
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: `${quote(value)} is a combo series mark, not a field type`,
    path,
    hint: 'On a combo, "bar", "line", and "area" go in mark. type on a y channel is quantitative, temporal, ordinal, or nominal.',
    fix: [
      { op: hasMark ? "replace" : "add", path: `${parent}/mark`, value },
      { op: "remove", path },
    ],
  });
  return true;
}

const METRIC_SHAPE = "metric: { value, min, max, label?, delta? }";

export function noteMetricHoist(value: Record<string, unknown>, ctx: Ctx): void {
  const type = value.type;
  if (type !== "gauge" && type !== "kpi" && type !== "progress-ring") return;
  if (ctx.metricNoted) return;
  ctx.metricNoted = true;
  const dataKind = classifyMetricData(value.data);
  const dropData = dataKind === "metric" || dataKind === "drop";
  if (dropData) ctx.dropPaths.add("/data");

  const metricReady = isPlainObject(value.metric) && typeof value.metric.value === "number";
  if ((metricReady || ctx.skipMissing.has("|metric")) && !dropData) return;

  const fix: JsonPatchOperation[] = [];
  if (!metricReady && !ctx.skipMissing.has("|metric")) {
    const gathered = gatherMetric(value);
    if (typeof gathered.metric.value === "number") {
      fix.push({ op: isPlainObject(value.metric) ? "replace" : "add", path: "/metric", value: gathered.metric });
      ctx.skipMissing.add("|metric");
      for (const key of gathered.topLevel) {
        fix.push({ op: "remove", path: `/${key}` });
        ctx.skipUnknown.add(`/${key}`);
      }
      for (const key of gathered.encoding) {
        fix.push({ op: "remove", path: `/encoding/${key}` });
        ctx.skipUnknown.add(`/encoding/${key}`);
      }
    }
  }
  if (dropData) fix.push({ op: "remove", path: "/data" });
  if (fix.length === 0) return;

  const moved = fix.some((op) => op.path === "/metric");
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "gauge, kpi, and progress-ring keep the number in metric",
    path: moved ? "/metric" : "/data",
    hint: dropData
      ? `${METRIC_SHAPE}. Move a data object of those fields into metric and remove data. They are not data keys.`
      : `${METRIC_SHAPE}. Move value, min, max, delta, and label into that object. They are not top-level keys or encoding channels.`,
    fix,
  });
}

/** A kpi may keep a real table for its sparkline. Anything else in data is the metric, misplaced. */
function classifyMetricData(data: unknown): "absent" | "table" | "metric" | "drop" {
  if (data === undefined) return "absent";
  if (isMetricChartTable(data)) return "table";
  if (metricFromData(data)) return "metric";
  return "drop";
}

function isMetricChartTable(data: unknown): boolean {
  if (Array.isArray(data) || isTypedArray(data)) {
    const list = asList(data);
    if (list.length === 0) return false;
    if (list.every((item) => item === null || typeof item === "number")) return true;
    if (!list.every((item) => isPlainObject(item))) return false;
    if (list.length === 1 && isOnlyMetricFields(list[0] as Record<string, unknown>)) return false;
    return true;
  }
  if (!isPlainObject(data)) return false;
  // { values: [...] } is unwrapped by the Vega-Lite repair; don't treat it as the metric object.
  if (Array.isArray(data.values) && data.columns === undefined) return true;
  if (!isPlainObject(data.columns)) return false;
  const columns = data.columns;
  const keys = Object.keys(columns);
  if (keys.length === 0) return false;
  return keys.every((key) => Array.isArray(columns[key]) || isTypedArray(columns[key]));
}

function isOnlyMetricFields(row: Record<string, unknown>): boolean {
  const keys = Object.keys(row);
  return keys.length > 0 && keys.every((key) => (METRIC_FIELDS as readonly string[]).includes(key));
}

function gatherMetric(spec: Record<string, unknown>): { metric: Record<string, unknown>; topLevel: string[]; encoding: string[] } {
  const metric: Record<string, unknown> = {};
  const topLevel: string[] = [];
  const encoding: string[] = [];
  if (isPlainObject(spec.metric)) {
    for (const key of METRIC_FIELDS) {
      const raw = spec.metric[key];
      if (key === "label" ? typeof raw === "string" : typeof raw === "number") metric[key] = raw;
    }
  }
  for (const key of METRIC_FIELDS) {
    if (metric[key] !== undefined || spec[key] === undefined) continue;
    const lifted = liftMetric(spec, spec[key], key);
    if (lifted === undefined) continue;
    metric[key] = lifted;
    topLevel.push(key);
  }
  const enc = isPlainObject(spec.encoding) ? spec.encoding : undefined;
  if (enc) {
    for (const key of METRIC_FIELDS) {
      if (metric[key] !== undefined || enc[key] === undefined) continue;
      const lifted = liftMetric(spec, enc[key], key);
      if (lifted === undefined) continue;
      metric[key] = lifted;
      encoding.push(key);
    }
  }
  if (typeof metric.value !== "number") {
    const fromData = metricFromData(spec.data);
    if (fromData) {
      for (const key of METRIC_FIELDS) {
        if (metric[key] === undefined && fromData[key] !== undefined) metric[key] = fromData[key];
      }
    }
  }
  return { metric, topLevel, encoding };
}

function liftMetric(spec: Record<string, unknown>, raw: unknown, key: string): unknown {
  if (typeof raw === "number") return raw;
  if (key === "label" && typeof raw === "string" && !fieldOnFirstRow(spec, raw)) return raw;
  const field = typeof raw === "string" ? raw : isPlainObject(raw) && typeof raw.field === "string" ? raw.field : undefined;
  if (!field) return undefined;
  const row = firstRow(spec.data);
  if (!row || row[field] === undefined) return undefined;
  const cell = row[field];
  if (typeof cell === "number") return cell;
  if (key === "label" && typeof cell === "string") return cell;
  return undefined;
}

function fieldOnFirstRow(spec: Record<string, unknown>, name: string): boolean {
  const row = firstRow(spec.data);
  return row !== undefined && row[name] !== undefined;
}

function metricFromData(data: unknown): Record<string, unknown> | undefined {
  if (typeof data === "number") return { value: data };
  const row = firstRow(data);
  if (!row) return undefined;
  const metric: Record<string, unknown> = {};
  for (const key of METRIC_FIELDS) {
    if (typeof row[key] === "number" || (key === "label" && typeof row[key] === "string")) metric[key] = row[key];
  }
  return typeof metric.value === "number" ? metric : undefined;
}

export function noteDonutChannels(encoding: Record<string, unknown>, ctx: Ctx): void {
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const mark = root.mark;
  const arc = mark === "arc" || (isPlainObject(mark) && mark.type === "arc");
  if (root.type !== "donut" && !arc) return;
  const present = DONUT_CHANNELS.filter((key) => encoding[key] !== undefined);
  if (present.length === 0 || present.every((key) => ctx.skipUnknown.has(`/encoding/${key}`))) return;
  const fix: JsonPatchOperation[] = [];
  if (encoding.x === undefined && encoding.label !== undefined) {
    fix.push({ op: "move", from: "/encoding/label", path: "/encoding/x" });
  }
  if (encoding.y === undefined) {
    const source = encoding.value !== undefined ? "value" : encoding.theta !== undefined ? "theta" : encoding.angle !== undefined ? "angle" : undefined;
    if (source) fix.push({ op: "move", from: `/encoding/${source}`, path: "/encoding/y" });
  }
  for (const key of present) {
    if (!fix.some((op) => op.from === `/encoding/${key}`)) fix.push({ op: "remove", path: `/encoding/${key}` });
    ctx.skipUnknown.add(`/encoding/${key}`);
  }
  if (fix.some((op) => op.path === "/encoding/x")) ctx.skipMissing.add("/encoding|x");
  if (fix.some((op) => op.path === "/encoding/y")) ctx.skipMissing.add("/encoding|y");
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "donut uses encoding.x for the slice label and encoding.y for the value",
    path: "/encoding",
    hint: 'Donut does not use theta, angle, label, or value channels. encoding.x is the slice name and encoding.y is the number.',
    fix,
  });
}

export function emitAxisObject(value: Record<string, unknown>, path: string, ctx: Ctx): void {
  const side = value.orient === "right" || value.position === "right" ? "y2" : "y";
  const fix: JsonPatchOperation[] = [{ op: "replace", path, value: side }];
  pushAxisTitle(fix, ctx, side, value.title);
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: 'axis is "y" or "y2", not an object',
    path,
    hint: 'axis is the string "y" or "y2". Put a title in axes.y.title or axes.y2.title.',
    fix,
  });
}

export function emitAxisNull(path: string, ctx: Ctx): void {
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: 'axis is "y" or "y2", not null',
    path,
    hint: 'Omit axis, or set "y" or "y2". Titles go in axes.y.title or axes.y2.title.',
    fix: [{ op: "remove", path }],
  });
}

export function emitXAxis(raw: unknown, path: string, ctx: Ctx): void {
  const fix: JsonPatchOperation[] = [{ op: "remove", path }];
  if (isPlainObject(raw)) pushAxisTitle(fix, ctx, "x", raw.title);
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "encoding.x has no axis field",
    path,
    hint: 'Remove encoding.x.axis. A title goes in axes.x.title. On a y series, axis is the string "y" or "y2".',
    fix,
  });
}

function pushAxisTitle(fix: JsonPatchOperation[], ctx: Ctx, side: string, title: unknown): void {
  if (typeof title !== "string") return;
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const axes = isPlainObject(root.axes) ? root.axes : undefined;
  if (!axes) fix.push({ op: "add", path: "/axes", value: { [side]: { title } } });
  else if (!isPlainObject(axes[side])) fix.push({ op: "add", path: `/axes/${side}`, value: { title } });
  else if ((axes[side] as Record<string, unknown>).title === undefined) {
    fix.push({ op: "add", path: `/axes/${side}/title`, value: title });
  }
}

export function isXChannel(path: string): boolean {
  return path === "/encoding/x" || path.endsWith("/x");
}

export function noteFlowChannels(encoding: Record<string, unknown>, ctx: Ctx): void {
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const type = typeof root.type === "string" ? root.type : "";
  const fix: JsonPatchOperation[] = [];
  const move = (from: string, to: string) => {
    if (encoding[from] === undefined) return;
    ctx.skipUnknown.add(`/encoding/${from}`);
    if (encoding[to] === undefined) {
      fix.push({ op: "move", from: `/encoding/${from}`, path: `/encoding/${to}` });
      ctx.skipMissing.add(`/encoding|${to}`);
    } else fix.push({ op: "remove", path: `/encoding/${from}` });
  };
  if (type === "sankey" || type === "sankey-diagram") {
    move("from", "source");
    move("to", "target");
    move("value", "y");
  } else if (type === "treemap" || type === "tree-map") {
    move("name", "x");
    move("size", "y");
    move("value", "y");
    if (encoding.id === undefined) move("parent", "color");
  } else if (type === "histogram" || type === "hist") {
    if (encoding.x === undefined) move("value", "x");
  }
  if (fix.length === 0) return;
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "chart channels were moved onto the v1 encoding",
    path: "/encoding",
    hint: "Sankey: source, target, y. Treemap: x, y, color. Histogram bins x.",
    fix,
  });
}

export function noteHeatmapChannels(encoding: Record<string, unknown>, ctx: Ctx): void {
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const intent = heatmapIntent(root);
  if (!intent) return;
  const fix: JsonPatchOperation[] = [];
  if (encoding.value !== undefined) {
    ctx.skipUnknown.add("/encoding/value");
    if (encoding.color === undefined) {
      fix.push({ op: "move", from: "/encoding/value", path: "/encoding/color" });
      ctx.skipMissing.add("/encoding|color");
    } else {
      fix.push({ op: "remove", path: "/encoding/value" });
    }
  }
  if (encoding.date !== undefined && encoding.x === undefined) {
    ctx.skipUnknown.add("/encoding/date");
    fix.push({ op: "move", from: "/encoding/date", path: "/encoding/x" });
    ctx.skipMissing.add("/encoding|x");
  } else if (encoding.date !== undefined) {
    ctx.skipUnknown.add("/encoding/date");
    fix.push({ op: "remove", path: "/encoding/date" });
  }
  if (
    intent === "calendar" &&
    encoding.color === undefined &&
    encoding.value === undefined &&
    encoding.y !== undefined &&
    channelValuesAreNumbers(root, encoding.y)
  ) {
    fix.push({ op: "move", from: "/encoding/y", path: "/encoding/color" });
    ctx.skipMissing.add("/encoding|color");
  }
  if (fix.length === 0) return;
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "heatmap encodes the number with encoding.color",
    path: "/encoding",
    hint: 'encoding.color is the measure. encoding.value is not a channel. A calendar uses encoding.x for the date. A grid uses encoding.y for the row category.',
    fix,
  });
}

function heatmapIntent(root: Record<string, unknown>): "grid" | "calendar" | "heatmap" | undefined {
  if (root.type === "calendar-heatmap") return "calendar";
  if (root.type === "grid-heatmap") return "grid";
  if (root.type !== "heatmap") return undefined;
  const mark = isPlainObject(root.mark) ? root.mark : undefined;
  if (mark?.layout === "calendar") return "calendar";
  if (mark?.layout === "grid") return "grid";
  return "heatmap";
}

function channelValuesAreNumbers(root: Record<string, unknown>, channel: unknown): boolean {
  const field = fieldName(channel);
  if (!field || !Array.isArray(root.data)) return false;
  let saw = false;
  for (const row of root.data) {
    if (!isPlainObject(row)) continue;
    const cell = row[field];
    if (cell === undefined || cell === null) continue;
    if (typeof cell !== "number") return false;
    saw = true;
  }
  return saw;
}

export function noteCombo(spec: Record<string, unknown>, ctx: Ctx): void {
  if (ctx.skipUnknown.has("/$combo")) return;
  const enc = isPlainObject(spec.encoding) ? spec.encoding : undefined;
  const marksArray = Array.isArray(spec.marks) ? spec.marks : undefined;
  const marksObject = marksArray ? undefined : isPlainObject(spec.marks) ? spec.marks : undefined;
  const layer = Array.isArray(spec.layer)
    ? spec.layer
    : marksArray ?? (Array.isArray(spec.layers) ? spec.layers : undefined);
  const markList = Array.isArray(spec.mark) ? spec.mark : undefined;
  const hasY2 = enc?.y2 !== undefined;
  const channelSeries = seriesFromMarkChannels(enc);
  if (!layer && !markList && !hasY2 && channelSeries.length === 0 && !marksObject) return;
  ctx.skipUnknown.add("/$combo");
  const built = channelSeries.length > 0
    ? { series: channelSeries, x: fieldName(enc?.x) }
    : marksObject
      ? { series: seriesFromMarksObject(marksObject), x: fieldName(enc?.x) }
      : comboSeries(spec, layer, markList, enc);
  const fix: JsonPatchOperation[] = [];
  if (spec.type !== "combo") {
    fix.push({ op: typeof spec.type === "string" ? "replace" : "add", path: "/type", value: "combo" });
    ctx.skipMissing.add("|type");
  }
  if (built.series.length > 0) {
    if (!enc) {
      const encoding: Record<string, unknown> = { y: built.series };
      if (built.x) encoding.x = built.x;
      fix.push({ op: "add", path: "/encoding", value: encoding });
      ctx.skipMissing.add("|encoding");
    } else {
      if (built.x && enc.x === undefined) fix.push({ op: "add", path: "/encoding/x", value: built.x });
      fix.push({ op: enc.y === undefined ? "add" : "replace", path: "/encoding/y", value: built.series });
    }
  }
  if (hasY2) {
    fix.push({ op: "remove", path: "/encoding/y2" });
    ctx.skipUnknown.add("/encoding/y2");
  }
  if (Array.isArray(spec.layer)) {
    fix.push({ op: "remove", path: "/layer" });
    ctx.skipUnknown.add("/layer");
  }
  if (spec.marks !== undefined && (marksArray || marksObject)) {
    fix.push({ op: "remove", path: "/marks" });
    ctx.skipUnknown.add("/marks");
  }
  if (Array.isArray(spec.layers)) {
    fix.push({ op: "remove", path: "/layers" });
    ctx.skipUnknown.add("/layers");
  }
  if (markList) {
    fix.push({ op: "remove", path: "/mark" });
    ctx.skipUnknown.add("/mark");
  }
  if (enc) {
    for (const name of ["bar", "line", "area"] as const) {
      if (enc[name] === undefined) continue;
      fix.push({ op: "remove", path: `/encoding/${name}` });
      ctx.skipUnknown.add(`/encoding/${name}`);
    }
  }
  if (built.series.some((series) => series.axis === "y2")) {
    const axes = isPlainObject(spec.axes) ? spec.axes : undefined;
    if (!axes) fix.push({ op: "add", path: "/axes", value: { y2: true } });
    else if (axes.y2 === undefined) fix.push({ op: "add", path: "/axes/y2", value: true });
  }
  emit(ctx, {
    code: "CK1009",
    severity: "error",
    message: "combo is one spec; each series is an item of encoding.y",
    path: "/type",
    hint: 'A second measure is encoding.y: [{ field, mark: "bar" }, { field, mark: "line", axis: "y2" }]. layer, layers, marks, encoding.bar, encoding.line, and encoding.y2 are not spec keys.',
    fix,
  });
}

function comboSeries(
  spec: Record<string, unknown>,
  layer: unknown[] | undefined,
  markList: unknown[] | undefined,
  enc: Record<string, unknown> | undefined,
): { series: Record<string, unknown>[]; x?: string } {
  if (layer) {
    const series: Record<string, unknown>[] = [];
    let x: string | undefined;
    for (let i = 0; i < layer.length; i++) {
      const item = layer[i];
      if (!isPlainObject(item)) continue;
      const itemEnc = isPlainObject(item.encoding) ? item.encoding : {};
      const field = fieldName(itemEnc.y);
      if (!field) continue;
      x ??= fieldName(itemEnc.x);
      const entry: Record<string, unknown> = { field, mark: comboMark(item.mark) };
      if (series.length > 0) entry.axis = "y2";
      series.push(entry);
    }
    return { series, x };
  }
  const yField = fieldName(enc?.y);
  const y2Field = fieldName(enc?.y2);
  if (yField && y2Field) {
    const first = comboMark(markList?.[0] ?? "bar");
    const second = comboMark(markList?.[1] ?? "line");
    return {
      series: [
        { field: yField, mark: first },
        { field: y2Field, mark: second, axis: "y2" },
      ],
      x: fieldName(enc?.x),
    };
  }
  if (Array.isArray(enc?.y) && markList && markList.length === enc.y.length) {
    const series = enc.y.map((item, index) => {
      const field = fieldName(item);
      return field ? { field, mark: comboMark(markList[index]) } : undefined;
    }).filter((item): item is { field: string; mark: "line" | "bar" | "area" } => item !== undefined);
    return { series, x: fieldName(enc?.x) };
  }
  return { series: [], x: fieldName(enc?.x) ?? fieldName(isPlainObject(spec.encoding) ? spec.encoding.x : undefined) };
}

function seriesFromMarkChannels(enc: Record<string, unknown> | undefined): Record<string, unknown>[] {
  if (!enc) return [];
  const series: Record<string, unknown>[] = [];
  for (const mark of ["bar", "line", "area"] as const) {
    if (enc[mark] === undefined) continue;
    pushSeries(series, mark, enc[mark]);
  }
  return series;
}

function seriesFromMarksObject(marks: Record<string, unknown>): Record<string, unknown>[] {
  const series: Record<string, unknown>[] = [];
  const keys = Object.keys(marks);
  if (keys.some((key) => key === "bar" || key === "line" || key === "area")) {
    for (const mark of ["bar", "line", "area"] as const) {
      if (marks[mark] !== undefined) pushSeries(series, mark, marks[mark]);
    }
    return series;
  }
  for (const [field, raw] of Object.entries(marks)) {
    const name = typeof raw === "string" ? raw : isPlainObject(raw) && typeof raw.type === "string" ? raw.type : undefined;
    if (name !== "bar" && name !== "line" && name !== "area") continue;
    pushSeries(series, name, field);
  }
  return series;
}

function pushSeries(series: Record<string, unknown>[], mark: "line" | "bar" | "area", raw: unknown): void {
  const items = Array.isArray(raw) ? raw : [raw];
  for (const item of items) {
    const field = fieldName(item);
    if (!field) continue;
    const entry: Record<string, unknown> = { field, mark };
    if (series.length > 0) entry.axis = "y2";
    series.push(entry);
  }
}

function comboMark(raw: unknown): "line" | "bar" | "area" {
  const name = typeof raw === "string" ? raw : isPlainObject(raw) && typeof raw.type === "string" ? raw.type : "line";
  if (name === "bar" || name === "area") return name;
  return "line";
}
