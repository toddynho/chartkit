import { ruleMatchesAny, type ColorRule } from "./color";
import { loadTable } from "./data-prep";
import type { Diagnostic, JsonPatchOperation } from "./diagnostics";
import { readData, type DataTable } from "./data";
import { MARK_APPLIES } from "./marks";
import { sortIssue } from "./sort";
import { namedZone } from "./timezone";
import { transformIssues } from "./transform";
import { foreignHierarchy, readHierarchy } from "./hierarchy";
import { CANVAS_AT, CANVAS_TYPES, pointCount, readRender } from "./render-mode";
import { domainEnds } from "./svg";
import { keyedDrillChildren, nearMatches, suggestHint } from "./walker";

const CHART_TYPES = new Set([
  "line",
  "bar",
  "donut",
  "pie",
  "stacked-area",
  "scatter",
  "combo",
  "heatmap",
  "gauge",
  "kpi",
  "sparkline",
  "mini-area",
  "progress-ring",
  "spike",
  "candlestick",
  "histogram",
  "boxplot",
  "radar",
  "funnel",
  "treemap",
  "sankey",
  "bullet",
  "waterfall",
  "area-range",
  "bar-range",
  "errorbar",
  "sunburst",
]);

const SVG_BUDGET = 5000;
const DONUT_SLICE_BUDGET = 7;

interface Channel {
  field?: string;
  type?: string;
  scaleType?: string;
  axis?: "y" | "y2";
  /** JSON pointer of the channel value. */
  path: string;
  /** JSON pointer of the field itself (the string, or /field). */
  fieldPath: string;
}

export function semanticChecks(spec: unknown, diagnostics: Diagnostic[]): void {
  if (!isRecord(spec)) return;
  const type = typeof spec.type === "string" ? spec.type : undefined;
  const known = type !== undefined && CHART_TYPES.has(type);

  if (known && isRecord(spec.mark)) warnUnusedMarks(type, spec.mark, diagnostics);
  warnGridWeeks(spec, diagnostics);
  warnUnbuilt(spec, diagnostics);
  checkAnnotations(spec, diagnostics);
  if (isRecord(spec.encoding)) {
    warnSeriesShape(spec.encoding, diagnostics);
    checkDomains(spec.encoding, diagnostics);
    warnChannelExtras(spec.encoding, diagnostics);
  }

  checkTimezone(spec, diagnostics);
  for (const item of foreignHierarchy(spec)) diagnostics.push(item);
  const dataSource = spec.data;
  if (dataSource === undefined) {
    if (known) warnDesign(spec, type, undefined, diagnostics);
    return;
  }

  const read = readData(dataSource);
  if (!read.ok && read.reason === "empty") {
    diagnostics.push({
      code: "CK2004",
      severity: "error",
      message: "data is empty",
      path: "/data",
      hint: "provide at least 1 row (2 for line/area)",
    });
    return;
  }
  if (!read.ok && read.reason === "mismatch") {
    diagnostics.push({
      code: "CK2005",
      severity: "error",
      message: `columns have different lengths (${read.a}: ${read.an}, ${read.b}: ${read.bn})`,
      path: "/data/columns",
      hint: "All columns must be equal length",
    });
    return;
  }
  if (!read.ok) return;

  const table = read.table;
  checkSort(spec, table, diagnostics);
  checkTransform(spec, table, diagnostics);
  const prepared = loadTable(spec);
  if (!prepared.ok && prepared.reason === "empty") {
    diagnostics.push({
      code: "CK2004",
      severity: "error",
      message: "transform removed every row",
      path: "/transform",
      hint: "widen the filter or drop the step",
      fix: [{ op: "remove", path: "/transform" }],
    });
    diagnostics.push({
      code: "CK2004",
      severity: "warning",
      message: "transform removed every row and is not drawn",
      path: "/transform/0",
      hint: "widen the filter or drop the step",
    });
    return;
  }
  const view = prepared.ok ? prepared.table : table;
  if (known && type) {
    warnCanvas(spec, type, view.length, diagnostics);
    warnInteraction(spec, type, view, diagnostics);
    warnLayout(spec, view, diagnostics);
  }
  if (isRecord(spec.encoding)) checkEncoding(spec, spec.encoding, view, diagnostics);
  if (type === "candlestick") checkCandles(spec, view, diagnostics);
  if (type) checkUncertainty(spec, type, view, diagnostics);
  checkHierarchy(spec, diagnostics);
  if (known) warnDesign(spec, type, view, diagnostics);
}

function flagged(diagnostics: Diagnostic[], item: Diagnostic): void {
  diagnostics.push(item);
  diagnostics.push({ ...item, severity: "warning", fix: undefined });
}

function checkHierarchy(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (type !== "treemap" && type !== "sunburst") return;
  const read = readHierarchy(spec);
  if (!read) return;
  for (const item of read.issues) flagged(diagnostics, item);
}

function checkTimezone(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (spec.timezone === undefined) return;
  const zone = namedZone(spec.timezone);
  if (!zone) {
    flagged(diagnostics, {
      code: "CK3023",
      severity: "error",
      message: `timezone ${JSON.stringify(spec.timezone)} is not an IANA zone and is ignored`,
      path: "/timezone",
      hint: 'use a zone such as "UTC" or "America/New_York", or remove timezone (UTC)',
      fix: [{ op: "remove", path: "/timezone" }],
    });
    return;
  }
  const temporal = xLooksDated(spec) || (isRecord(spec.encoding) && isRecord(spec.encoding.x) && spec.encoding.x.type === "temporal");
  if (zone !== "UTC" && !temporal) {
    diagnostics.push({
      code: "CK3024",
      severity: "warning",
      message: "timezone has no effect unless x is temporal",
      path: "/timezone",
      hint: 'set encoding.x.type to "temporal", or remove timezone',
    });
  }
}

function checkSort(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  const message = sortIssue(spec, table);
  if (!message) return;
  const path = message.includes("sort field") ? "/sort/field" : "/sort";
  flagged(diagnostics, {
    code: "CK3025",
    severity: "error",
    message,
    path,
    hint: "sort by a data field or by value, ascending or descending",
    fix: [{ op: "remove", path: "/sort" }],
  });
}

function checkTransform(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  for (const issue of transformIssues(spec.transform, table)) {
    const path = issue.index < 0 ? "/transform" : `/transform/${issue.index}`;
    flagged(diagnostics, {
      code: "CK3026",
      severity: "error",
      message: issue.message,
      path,
      hint: "filter, window mean, or aggregate (sum, mean, count)",
      fix: [{ op: "remove", path }],
    });
  }
}

function checkEncoding(
  spec: Record<string, unknown>,
  encoding: Record<string, unknown>,
  table: DataTable,
  diagnostics: Diagnostic[],
): void {
  const channels: Channel[] = [];
  for (const key of ["x", "series", "color", "size", "open", "high", "low", "close", "volume", "source", "target", "error"] as const) {
    const channel = readChannel(encoding[key], `/encoding/${key}`);
    if (channel?.field) channels.push(channel);
  }
  const yChannels = readY(encoding.y);
  channels.push(...yChannels, ...boundChannels(encoding.y));
  const tip = spec.tooltip;
  if (isRecord(tip) && Array.isArray(tip.fields)) {
    for (let i = 0; i < tip.fields.length; i++) {
      const channel = readChannel(tip.fields[i], `/tooltip/fields/${i}`);
      if (channel?.field) channels.push(channel);
    }
  }

  for (const channel of channels) {
    if (!channel.field) continue;
    const resolved = resolveField(channel.field, table.fields);
    if (!resolved.match) {
      if ((spec.type === "treemap" || spec.type === "sunburst") && readHierarchy(spec)) continue;
      const suggestion = resolved.caseMatch ?? resolved.suggestions[0];
      const hintParts = [`available fields: ${table.fields.join(", ") || "(none)"}`];
      if (resolved.caseMatch) hintParts.push(`did you mean ${JSON.stringify(resolved.caseMatch)}? (case differs)`);
      else {
        const hinted = suggestHint(resolved.suggestions);
        if (hinted) hintParts.push(hinted);
      }
      let fix: JsonPatchOperation[] | undefined = suggestion
        ? [{ op: "replace", path: channel.fieldPath, value: suggestion }]
        : undefined;
      if ((spec.type === "sparkline" || spec.type === "mini-area") && table.kind === "numbers" && channel.field === "data") {
        hintParts.push('sparkline and mini-area take a plain number array and need no encoding. The number field is "value".');
        fix = [{ op: "replace", path: channel.fieldPath, value: "value" }];
      }
      if (spec.type === "stacked-area" && channel.path === "/encoding/color") {
        hintParts.push('stacked-area takes the layers as encoding.y: ["field", "field"] rather than a color field.');
      }
      diagnostics.push({
        code: "CK2001",
        severity: "error",
        message: `field ${JSON.stringify(channel.field)} not found in data`,
        path: channel.fieldPath,
        hint: hintParts.join("; "),
        fix,
      });
      continue;
    }
    const values = table.columns[resolved.match] ?? [];
    checkColumn(spec, channel, resolved.match, values, table, diagnostics);
  }

  const x = readChannel(encoding.x, "/encoding/x");
  if (x?.field) {
    const resolved = resolveField(x.field, table.fields);
    if (resolved.match) {
      const values = table.columns[resolved.match] ?? [];
      if (x.type && x.type !== "temporal" && columnLooksLikeDates(values)) {
        diagnostics.push({
          code: "CK2003",
          severity: "warning",
          message: `${JSON.stringify(resolved.match)} looks like dates but type is ${JSON.stringify(x.type)}`,
          path: "/encoding/x",
          hint: 'set "type": "temporal" for a time axis',
          fix: temporalFix(encoding.x),
        });
      }
      const xType = x.type ?? inferType(values);
      if (spec.type !== "scatter" && spec.type !== "histogram" && (xType === "temporal" || xType === "quantitative") && !isSorted(values, xType)) {
        const index = firstUnsorted(values, xType);
        diagnostics.push({
          code: "CK2008",
          severity: "warning",
          message: `x values are not sorted (first out of order at row ${index})`,
          path: table.kind === "columns" ? `/data/columns/${resolved.match}/${index}` : `/data/${index}`,
          hint: "They'll be sorted for rendering; sort upstream to save time on large data",
        });
      }
    }
  }

  checkY2(spec, yChannels, diagnostics);
}

function checkColumn(
  spec: Record<string, unknown>,
  channel: Channel,
  field: string,
  values: ArrayLike<unknown>,
  table: DataTable,
  diagnostics: Diagnostic[],
): void {
  const declared = channel.type;
  const quantitative = declared === "quantitative" || (declared === undefined && inferType(values) === "quantitative");
  if (declared === "quantitative" || (declared === undefined && hasMixedNumbers(values))) {
    const bad: { index: number; value: unknown }[] = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value === null || value === undefined) continue;
      if (typeof value !== "number" || !Number.isFinite(value)) bad.push({ index: i, value });
    }
    if (bad.length > 0 && (declared === "quantitative" || quantitative || hasMixedNumbers(values))) {
      const first = bad[0];
      diagnostics.push({
        code: "CK2002",
        severity: "error",
        message: `field ${JSON.stringify(field)} has non-numeric values (${bad.length} of ${values.length} rows, first at row ${first.index}: ${JSON.stringify(first.value)})`,
        path: channel.path,
        hint: 'quantitative channels need numbers; strip units like "$" or "%", or set type: "nominal"',
      });
    }
  }

  const missing: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i] === null || values[i] === undefined) missing.push(i);
  }
  if (missing.length > 0) {
    const first = missing[0];
    const pointer = table.kind === "numbers" ? `/data/${first}` : table.kind === "columns" ? `/data/columns/${field}/${first}` : `/data/${first}/${field}`;
    diagnostics.push({
      code: "CK2007",
      severity: "warning",
      message: `${missing.length} missing values in ${JSON.stringify(field)} (first at row ${first})`,
      path: pointer,
      hint: "Gaps are drawn; set mark.connectNulls: true to bridge them",
    });
  }

  if (channel.scaleType === "log") {
    const bad: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (typeof value === "number" && value <= 0) bad.push(i);
    }
    if (bad.length > 0) {
      diagnostics.push({
        code: "CK3001",
        severity: "error",
        message: `log scale requires positive values; ${bad.length} values ≤ 0 in ${JSON.stringify(field)} (first at row ${bad[0]})`,
        path: `${channel.path}/scale/type`,
        hint: 'Use "sqrt", filter non-positive rows, or offset the data',
      });
    }
  }
  void spec;
}

function checkDomains(encoding: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  for (const key of Object.keys(encoding)) {
    const value = encoding[key];
    const list = Array.isArray(value) ? value : value ? [value] : [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const domain = isRecord(item) && isRecord(item.scale) ? item.scale.domain : 0;
      if (!Array.isArray(domain) || domain.every((entry) => typeof entry === "string")) continue;
      const path = `/encoding/${key}` + (Array.isArray(value) ? `/${i}` : "") + "/scale/domain";
      const a = domain[0];
      const b = domain[1];
      const end = (entry: unknown) => entry === null || (typeof entry === "number" && Number.isFinite(entry));
      const swap = typeof a === "number" && typeof b === "number" && a > b;
      if (domain.length === 2 && end(a) && end(b) && !swap && !(typeof a === "number" && a === b)) continue;
      const next = swap ? [b, a] : [end(a) ? a : null, end(b) ? b : null];
      const good = next[0] === null || next[1] === null || (typeof next[0] === "number" && typeof next[1] === "number" && next[0] < next[1]);
      diagnostics.push({
        code: "CK3004",
        severity: "error",
        message: "min < max",
        path,
        hint: "two numbers or null",
        fix: domain.length === 2 && good ? [{ op: "replace", path, value: next }] : domain.length === 2 ? undefined : [{ op: "remove", path }],
      });
    }
  }
}

function checkY2(spec: Record<string, unknown>, yChannels: Channel[], diagnostics: Diagnostic[]): void {
  if (yChannels.length === 0) return;
  const usesY2 = yChannels.some((channel) => channel.axis === "y2");
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  const y2 = axes ? axes.y2 : undefined;
  const configured = y2 === true || isRecord(y2);
  if (configured && !usesY2) {
    diagnostics.push({
      code: "CK3002",
      severity: "error",
      message: 'y2 axis configured but no y series uses axis "y2"',
      path: "/axes/y2",
      hint: 'Add "axis": "y2" to a y item, or remove axes.y2',
    });
  } else if (usesY2 && y2 === undefined) {
    diagnostics.push({
      code: "CK3002",
      severity: "error",
      message: 'y series uses axis "y2" but no y2 axis is configured',
      path: "/encoding/y",
      hint: "Add axes.y2. repair() adds it when the axis is missing.",
      fix: isRecord(spec.axes)
        ? [{ op: "add", path: "/axes/y2", value: true }]
        : [{ op: "add", path: "/axes", value: { y2: true } }],
    });
  } else if (usesY2 && y2 === false) {
    diagnostics.push({
      code: "CK3002",
      severity: "error",
      message: 'y series uses axis "y2" but no y2 axis is configured',
      path: "/encoding/y",
      hint: 'Set axes.y2, or set the series "axis" to "y"',
    });
  }
}

function checkCandles(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return;
  const fields = {
    open: readChannel(encoding.open, "/encoding/open")?.field,
    high: readChannel(encoding.high, "/encoding/high")?.field,
    low: readChannel(encoding.low, "/encoding/low")?.field,
    close: readChannel(encoding.close, "/encoding/close")?.field,
  };
  if (!fields.open || !fields.high || !fields.low || !fields.close) return;
  const open = table.columns[fields.open];
  const high = table.columns[fields.high];
  const low = table.columns[fields.low];
  const close = table.columns[fields.close];
  if (!open || !high || !low || !close) return;
  for (let i = 0; i < table.length; i++) {
    const o = open[i];
    const h = high[i];
    const l = low[i];
    const c = close[i];
    if ([o, h, l, c].some((value) => typeof value !== "number")) continue;
    const bodyHigh = Math.max(o as number, c as number);
    const bodyLow = Math.min(o as number, c as number);
    if ((h as number) < bodyHigh) {
      diagnostics.push({
        code: "CK3003",
        severity: "error",
        message: `candlestick row ${i}: high < max(open, close)`,
        path: `/data/${i}`,
        hint: "Check field mapping: are high/low swapped?",
      });
    }
    if ((l as number) > bodyLow) {
      diagnostics.push({
        code: "CK3003",
        severity: "error",
        message: `candlestick row ${i}: low > min(open, close)`,
        path: `/data/${i}`,
        hint: "Check field mapping: are high/low swapped?",
      });
    }
  }
}

const SAMPLED = new Set(["line", "stacked-area", "sparkline", "mini-area", "spike", "combo"]);

/** Charts whose x axis is a window the overview can slide. */
const NAV = new Set(["line", "bar", "stacked-area", "scatter", "combo", "candlestick", "area-range", "sparkline", "mini-area", "spike"]);

function pointerToken(value: string): string {
  return value.replace(/~/g, "~0").replace(/\//g, "~1");
}

function knownFields(table: DataTable | undefined): Set<string> {
  if (!table) return new Set();
  if (table.fields.length) return new Set(table.fields);
  return new Set(Object.keys(table.columns));
}

/** Navigator, sync group, and drilldown. Warnings carry a JSON Patch. */
function warnInteraction(spec: Record<string, unknown>, type: string, table: DataTable | undefined, diagnostics: Diagnostic[]): void {
  const interaction = spec.interaction;
  if (!isRecord(interaction)) return;
  const nav = interaction.navigator;
  if (nav === true || isRecord(nav)) {
    if (!NAV.has(type)) {
      diagnostics.push({
        code: "CK3034",
        severity: "warning",
        message: `navigator does not apply to type ${type}`,
        path: "/interaction/navigator",
        hint: "the slider needs an x window",
        fix: [{ op: "remove", path: "/interaction/navigator" }],
      });
    }
    if (isRecord(nav) && typeof nav.height === "number" && (nav.height < 28 || nav.height > 96)) {
      diagnostics.push({
        code: "CK3035",
        severity: "warning",
        message: `navigator height ${nav.height} is outside 28 to 96`,
        path: "/interaction/navigator/height",
        hint: "the overview stays between 28 and 96 px",
        fix: [{ op: "replace", path: "/interaction/navigator/height", value: Math.max(28, Math.min(96, Math.round(nav.height))) }],
      });
    }
  }
  if (interaction.sync !== undefined && (typeof interaction.sync !== "string" || interaction.sync.trim() === "")) {
    diagnostics.push({
      code: "CK3036",
      severity: "warning",
      message: "sync group id must be a non-empty string",
      path: "/interaction/sync",
      hint: "charts with the same id share the crosshair, tooltip, and x window",
      fix: [{ op: "remove", path: "/interaction/sync" }],
    });
  }
  if (interaction.drilldown === undefined) return;
  const drill = interaction.drilldown;
  const children = isRecord(drill) ? drill.children : Array.isArray(drill) ? drill : undefined;
  const keyed = keyedDrillChildren(spec, children);
  if (keyed) {
    diagnostics.push({
      code: "CK1009",
      severity: "error",
      message: "drilldown children are keyed by the clicked x value",
      path: "/interaction/drilldown/children",
      hint: "children are keyed by the clicked x value, one chart spec per category.",
      fix: [{ op: children !== undefined ? "replace" : "add", path: "/interaction/drilldown/children", value: keyed }],
    });
    return;
  }
  if (!isRecord(children) || Object.keys(children).length === 0) {
    diagnostics.push({
      code: "CK3037",
      severity: "warning",
      message: "drilldown needs a children map",
      path: "/interaction/drilldown",
      hint: "children are keyed by the clicked x value",
      fix: [{ op: "remove", path: "/interaction/drilldown" }],
    });
    return;
  }
  for (const [key, child] of Object.entries(children)) {
    if (isRecord(child) && typeof child.type === "string" && child.type) continue;
    diagnostics.push({
      code: "CK3038",
      severity: "warning",
      message: `drilldown child ${key} has no type`,
      path: `/interaction/drilldown/children/${pointerToken(key)}`,
      hint: "each child is a chart spec",
      fix: [{ op: "remove", path: `/interaction/drilldown/children/${pointerToken(key)}` }],
    });
  }
  if (!isRecord(drill) || typeof drill.key !== "string" || drill.key === "") return;
  const fields = knownFields(table);
  if (fields.has(drill.key)) return;
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const fallback = fieldName(encoding.x);
  const fix: JsonPatchOperation[] = fallback
    ? [{ op: "replace", path: "/interaction/drilldown/key", value: fallback }]
    : [{ op: "remove", path: "/interaction/drilldown/key" }];
  diagnostics.push({
    code: "CK3039",
    severity: "warning",
    message: `drilldown key ${drill.key} is not a data field`,
    path: "/interaction/drilldown/key",
    hint: fallback ? `use ${fallback}` : "drop key and the category defaults to encoding.x",
    fix,
  });
}

/** Facet, concat, and breakpoint rules. Each warning carries one JSON Patch. */
function warnLayout(spec: Record<string, unknown>, table: DataTable | undefined, diagnostics: Diagnostic[]): void {
  const layout = spec.layout;
  if (!isRecord(layout)) return;
  const fields = knownFields(table);
  const facet = isRecord(layout.facet) ? layout.facet : undefined;
  const concat = isRecord(layout.concat) ? layout.concat : undefined;
  if (facet && concat) {
    diagnostics.push({
      code: "CK3048",
      severity: "warning",
      message: "facet and concat cannot both be set",
      path: "/layout/concat",
      hint: "keep the facet or the views, not both",
      fix: [{ op: "remove", path: "/layout/concat" }],
    });
  }
  if (facet) {
    const field = facet.field;
    if (typeof field !== "string" || field === "") {
      diagnostics.push({
        code: "CK3040",
        severity: "warning",
        message: "facet needs a field",
        path: "/layout/facet",
        hint: "name the column that splits the panels",
        fix: [{ op: "remove", path: "/layout/facet" }],
      });
    } else if (!fields.has(field)) {
      const fallback = table?.fields.find((name) => name !== field);
      diagnostics.push({
        code: "CK3041",
        severity: "warning",
        message: `facet field ${field} is not a data field`,
        path: "/layout/facet/field",
        hint: fallback ? `use ${fallback}` : "drop facet",
        fix: fallback
          ? [{ op: "replace", path: "/layout/facet/field", value: fallback }]
          : [{ op: "remove", path: "/layout/facet" }],
      });
    }
    if (typeof facet.columns === "number" && (facet.columns < 1 || facet.columns > 12)) {
      diagnostics.push({
        code: "CK3042",
        severity: "warning",
        message: `facet columns ${facet.columns} is outside 1 to 12`,
        path: "/layout/facet/columns",
        hint: "use 1 to 12 columns",
        fix: [{ op: "replace", path: "/layout/facet/columns", value: Math.max(1, Math.min(12, Math.round(facet.columns))) }],
      });
    }
    if (typeof facet.rows === "number" && (facet.rows < 1 || facet.rows > 12)) {
      diagnostics.push({
        code: "CK3043",
        severity: "warning",
        message: `facet rows ${facet.rows} is outside 1 to 12`,
        path: "/layout/facet/rows",
        hint: "use 1 to 12 rows",
        fix: [{ op: "replace", path: "/layout/facet/rows", value: Math.max(1, Math.min(12, Math.round(facet.rows))) }],
      });
    }
    if (facet.wrap === false && typeof field === "string" && fields.has(field) && table) {
      const seen = new Set<string>();
      const column = table.columns[field];
      if (column) for (let i = 0; i < table.length; i++) seen.add(column[i] == null ? "" : String(column[i]));
      const cols = typeof facet.columns === "number" && facet.columns >= 1 ? Math.min(12, Math.round(facet.columns)) : Math.min(4, Math.max(1, Math.ceil(Math.sqrt(seen.size))));
      const rows = typeof facet.rows === "number" && facet.rows >= 1 ? Math.min(12, Math.round(facet.rows)) : Math.ceil(seen.size / cols);
      if (seen.size > cols * rows) {
        diagnostics.push({
          code: "CK3049",
          severity: "warning",
          message: "facet has more categories than the grid",
          path: "/layout/facet/wrap",
          hint: "wrap flows the extra panels onto new rows",
          fix: [{ op: "replace", path: "/layout/facet/wrap", value: true }],
        });
      }
    }
  }
  if (concat) {
    const views = concat.views;
    if (!Array.isArray(views) || views.length === 0) {
      diagnostics.push({
        code: "CK3044",
        severity: "warning",
        message: "concat needs views",
        path: "/layout/concat",
        hint: "add one chart spec per view",
        fix: [{ op: "remove", path: "/layout/concat" }],
      });
    } else {
      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        if (isRecord(view) && typeof view.type === "string" && view.type) continue;
        diagnostics.push({
          code: "CK3045",
          severity: "warning",
          message: `concat view ${i} has no type`,
          path: `/layout/concat/views/${i}`,
          hint: "each view is a chart spec",
          fix: [{ op: "remove", path: `/layout/concat/views/${i}` }],
        });
      }
    }
  }
  const rules = layout.breakpoints;
  if (!Array.isArray(rules)) return;
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (!isRecord(rule)) continue;
    if (rule.maxWidth !== undefined && (typeof rule.maxWidth !== "number" || !(rule.maxWidth > 0))) {
      diagnostics.push({
        code: "CK3046",
        severity: "warning",
        message: "breakpoint maxWidth must be a positive number",
        path: `/layout/breakpoints/${i}/maxWidth`,
        hint: "width in px, such as 480",
        fix: [{ op: "remove", path: `/layout/breakpoints/${i}` }],
      });
    }
    if ((rule.columns !== undefined || rule.rows !== undefined) && !(facet && typeof facet.field === "string" && facet.field)) {
      diagnostics.push({
        code: "CK3047",
        severity: "warning",
        message: "breakpoint columns need a facet field",
        path: `/layout/breakpoints/${i}/${rule.columns !== undefined ? "columns" : "rows"}`,
        hint: "set layout.facet.field first",
        fix: [{ op: "remove", path: `/layout/breakpoints/${i}/${rule.columns !== undefined ? "columns" : "rows"}` }],
      });
    }
  }
}

function explicitNone(spec: Record<string, unknown>): string | null {
  const data = spec.data;
  if (data && typeof data === "object" && !Array.isArray(data) && (data as { sampling?: unknown }).sampling === "none") return "/data/sampling";
  if (isRecord(spec.mark) && spec.mark.sampling === "none") return "/mark/sampling";
  return null;
}

/** Large SVG series, sampling none, and canvas on a type that has no painter. */
function warnCanvas(spec: Record<string, unknown>, type: string, count: number, diagnostics: Diagnostic[]): void {
  const mode = readRender(spec.render);
  const rows = Math.max(count, pointCount(spec.data));
  if (mode === "canvas" && !CANVAS_TYPES.has(type)) {
    diagnostics.push({
      code: "CK3033",
      severity: "warning",
      message: `render canvas has no canvas painter for type ${type}`,
      path: "/render",
      hint: "this type stays SVG",
      fix: [{ op: "replace", path: "/render", value: "svg" }],
    });
  }
  if (rows < CANVAS_AT) return;
  if (mode === "svg" && CANVAS_TYPES.has(type)) {
    diagnostics.push({
      code: "CK3031",
      severity: "warning",
      message: `${rows} points on the svg renderer`,
      path: "/render",
      hint: "canvas paints the marks and leaves the axes in SVG",
      fix: [spec.render === "svg" ? { op: "replace", path: "/render", value: "canvas" } : { op: "add", path: "/render", value: "canvas" }],
    });
  }
  const sampling = explicitNone(spec);
  if (sampling && SAMPLED.has(type)) {
    diagnostics.push({
      code: "CK3032",
      severity: "warning",
      message: `sampling is none for ${rows} points`,
      path: sampling,
      hint: "lttb keeps the shape and drops points the plot cannot show",
      fix: [{ op: "replace", path: sampling, value: "lttb" }],
    });
  }
}

function flag(diagnostics: Diagnostic[], path: string, why: string): void {
  const name = path.slice(1).split("/").join(".");
  diagnostics.push({
    code: "CK3012",
    severity: "warning",
    message: `${name} is ${why}`,
    path,
    hint: "kept",
  });
}

/** kind: 0 defined, 3 light|dark, 4 string, 5 number. */
const UNBUILT: ReadonlyArray<readonly [string, 0 | 3 | 4 | 5, string]> = [
  ["animation/easing", 0, "ignored; duration only"],
  ["theme/mode", 3, "ignored; preset stays"],
  ["theme/tokens/fontFamily", 4, "ignored; built-in font"],
  ["theme/tokens/fontSize", 5, "ignored; built-in size"],
  ["axes/y2/grid", 0, "ignored; no y2 grid"],
];

function at(root: unknown, path: string): unknown {
  let cur = root;
  for (const key of path.split("/")) {
    if (!isRecord(cur)) return;
    cur = cur[key];
  }
  return cur;
}

function warnUnbuilt(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  for (let i = 0; i < UNBUILT.length; i++) {
    const path = UNBUILT[i][0];
    const kind = UNBUILT[i][1];
    const why = UNBUILT[i][2];
    const value = at(spec, path);
    const hit =
      kind === 0
        ? value !== undefined
        : kind === 3
          ? value === "light" || value === "dark"
          : kind === 4
            ? typeof value === "string"
            : typeof value === "number";
    if (hit) flag(diagnostics, "/" + path, why);
  }
}

function warnGridWeeks(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (spec.type !== "heatmap" || !isRecord(spec.mark) || spec.mark.weeks === undefined) return;
  const mark = spec.mark;
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const layout = mark.layout === "grid" || mark.layout === "calendar" ? mark.layout : encoding && encoding.y != null ? "grid" : "calendar";
  if (layout === "grid") flag(diagnostics, "/mark/weeks", "ignored; calendar layout only");
}

function warnUnusedMarks(type: string, mark: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  for (const key of Object.keys(mark)) {
    const applies = MARK_APPLIES[key];
    if (!applies || applies.includes(type)) continue;
    diagnostics.push({
      code: "CK3010",
      severity: "warning",
      message: `"mark.${key}" has no effect on type ${JSON.stringify(type)}`,
      path: `/mark/${key}`,
      hint: `applies to: ${applies.join(", ")}. Remove it or change the type`,
    });
  }
}

function warnChannelExtras(encoding: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  for (const key of Object.keys(encoding)) {
    const value = encoding[key];
    const list = Array.isArray(value) ? value : [value];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (!isRecord(item)) continue;
      const base = Array.isArray(value) ? `/encoding/${key}/${i}` : `/encoding/${key}`;
      if (isRecord(item.scale) && item.scale.clamp === true && !domainEnds(item.scale.domain)) {
        flag(diagnostics, `${base}/scale/clamp`, "ignored; set scale.domain");
      }
      if (key === "x") continue;
      if (typeof item.type === "string" && !(key === "y" && item.type === "quantitative") && !(key === "color" && item.type === "quantitative")) {
        flag(diagnostics, `${base}/type`, "ignored; ChartKit infers the scale type");
      }
      if (
        isRecord(item.scale) &&
        item.scale.padding !== undefined &&
        key !== "x" &&
        key !== "y" &&
        key !== "low" &&
        key !== "high" &&
        key !== "open" &&
        key !== "close" &&
        key !== "error"
      ) {
        flag(diagnostics, `${base}/scale/padding`, "ignored; quantitative position scales only");
      }
      if (key === "y") continue;
      if (typeof item.title === "string") flag(diagnostics, `${base}/title`, "ignored; use the axis");
      if (item.format !== undefined) flag(diagnostics, `${base}/format`, "ignored; use the axis");
      const scale = isRecord(item.scale) ? item.scale : undefined;
      if (!scale) continue;
      const colorKind = key === "color" && (scale.type === "sequential" || scale.type === "diverging" || scale.type === "quantize" || scale.type === "threshold");
      if (scale.type !== undefined && !colorKind) flag(diagnostics, `${base}/scale/type`, "ignored; ChartKit infers the scale type");
      if (scale.reverse === true) flag(diagnostics, `${base}/scale/reverse`, "ignored; not reversed");
      if (key === "high") continue;
      if (scale.domain !== undefined && !colorKind) flag(diagnostics, `${base}/scale/domain`, "ignored; automatic");
      if (typeof scale.zero === "boolean") flag(diagnostics, `${base}/scale/zero`, "ignored; automatic");
      if (scale.nice === false) flag(diagnostics, `${base}/scale/nice`, "ignored; stays nice");
    }
  }
}

function warnSeriesShape(encoding: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (encoding.series !== undefined && Array.isArray(encoding.y)) {
    diagnostics.push({
      code: "CK2006",
      severity: "error",
      message: '"encoding.series" and an array "encoding.y" cannot be combined',
      path: "/encoding/series",
      hint: "Use wide (y array) or long (series field) data, not both",
    });
  }
}

function warnDesign(
  spec: Record<string, unknown>,
  type: string,
  table: DataTable | undefined,
  diagnostics: Diagnostic[],
): void {
  if ((type === "donut" || type === "pie") && table && table.length > DONUT_SLICE_BUDGET) {
    diagnostics.push({
      code: "CK4001",
      severity: "warning",
      message: `${table.length} slices; pies and donuts are hard to read beyond ~7`,
      path: "/data",
      hint: 'Use "type": "bar" (same encoding) or set mark.other to group small slices',
    });
  }
  warnSliceNames(spec, type, table, diagnostics);
  warnColorDomain(spec, table, diagnostics);
  warnColorRules(spec, type, table, diagnostics);

  const seriesCount = countSeries(spec, table);
  const palette = paletteSize(spec);
  if (seriesCount > palette) {
    diagnostics.push({
      code: "CK4002",
      severity: "warning",
      message: `${seriesCount} series; colors repeat after ${palette}`,
      path: "/encoding/y",
      hint: "Use encoding.series with fewer groups, or set mark.palette or theme.tokens.series",
    });
  }

  if (table && table.length * Math.max(seriesCount, 1) > SVG_BUDGET) {
    const n = table.length * Math.max(seriesCount, 1);
    diagnostics.push({
      code: "CK4003",
      severity: "warning",
      message: `${n} points exceed SVG budget; switching to canvas`,
      path: "/data",
      hint: "Set size/renderer explicitly or pass columnar data for speed",
    });
  }

  const contrastIssue = textContrast(spec);
  if (contrastIssue) {
    diagnostics.push({
      code: "CK4004",
      severity: "warning",
      message: `text contrast ${contrastIssue.ratio}:1 below WCAG AA 4.5:1 for token ${JSON.stringify(contrastIssue.token)}`,
      path: `/theme/tokens/${contrastIssue.token}`,
      hint: `Suggest the nearest passing color ${contrastIssue.suggestion}`,
      fix: [{ op: "replace", path: `/theme/tokens/${contrastIssue.token}`, value: contrastIssue.suggestion }],
    });
  }
}

function countSeries(spec: Record<string, unknown>, table: DataTable | undefined): number {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return 1;
  if (Array.isArray(encoding.y)) return encoding.y.length;
  const series = readChannel(encoding.series, "/encoding/series");
  if (series?.field && table) {
    const values = table.columns[series.field];
    if (values) {
      const seen = new Set<string>();
      for (let i = 0; i < values.length; i++) seen.add(String(values[i]));
      return seen.size;
    }
  }
  return encoding.y !== undefined ? 1 : 1;
}

function paletteSize(spec: Record<string, unknown>): number {
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (mark && Array.isArray(mark.palette) && mark.palette.length > 0) return mark.palette.length;
  const theme = spec.theme;
  if (isRecord(theme) && isRecord(theme.tokens) && Array.isArray(theme.tokens.series) && theme.tokens.series.length > 0) {
    return theme.tokens.series.length;
  }
  return 8;
}

function textContrast(
  spec: Record<string, unknown>,
): { token: string; ratio: string; suggestion: string } | undefined {
  const theme = spec.theme;
  if (!isRecord(theme) || !isRecord(theme.tokens)) return undefined;
  const text = theme.tokens.text;
  const background = theme.tokens.background;
  if (typeof text !== "string" || typeof background !== "string") return undefined;
  const ratio = contrast(text, background);
  if (ratio === null || ratio >= 4.5) return undefined;
  return {
    token: "text",
    ratio: ratio.toFixed(2),
    suggestion: nearestPassing(text, background),
  };
}

function fieldName(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.field === "string") return value.field;
  return undefined;
}

function columnStrings(table: DataTable | undefined, field: string | undefined): Set<string> {
  const seen = new Set<string>();
  if (!table || !field) return seen;
  const column = table.columns[field];
  if (!column) return seen;
  for (let i = 0; i < column.length; i++) if (column[i] != null && String(column[i]) !== "") seen.add(String(column[i]));
  return seen;
}

function plottedNumbers(spec: Record<string, unknown>, table: DataTable | undefined): number[] {
  if (!table) return [];
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const fields: string[] = [];
  const y = encoding.y;
  if (Array.isArray(y)) {
    for (const item of y) {
      const name = fieldName(item);
      if (name) fields.push(name);
    }
  } else {
    const name = fieldName(y);
    if (name) fields.push(name);
  }
  const numbers: number[] = [];
  for (const field of fields) {
    const column = table.columns[field];
    if (!column) continue;
    for (let i = 0; i < column.length; i++) if (typeof column[i] === "number" && Number.isFinite(column[i])) numbers.push(column[i] as number);
  }
  return numbers;
}

function warnSliceNames(
  spec: Record<string, unknown>,
  type: string,
  table: DataTable | undefined,
  diagnostics: Diagnostic[],
): void {
  if (type !== "donut" && type !== "pie") return;
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (!mark || !Array.isArray(mark.explode)) return;
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const names = columnStrings(table, fieldName(encoding.x));
  mark.explode.forEach((item, index) => {
    if (typeof item === "string" && names.has(item)) return;
    diagnostics.push({
      code: "CK3012",
      severity: "warning",
      message: `mark.explode[${index}] does not match a slice`,
      path: `/mark/explode/${index}`,
      hint: "use a slice label from encoding.x",
    });
  });
}

function warnColorDomain(spec: Record<string, unknown>, table: DataTable | undefined, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const color = encoding && isRecord(encoding.color) ? encoding.color : undefined;
  if (!color || !Array.isArray(color.domain)) return;
  const field = typeof color.field === "string" ? color.field : fieldName(encoding?.x);
  const seen = columnStrings(table, field);
  color.domain.forEach((item, index) => {
    if (typeof item === "string" && seen.has(item)) return;
    diagnostics.push({
      code: "CK3012",
      severity: "warning",
      message: `encoding.color.domain[${index}] is not in ${field ?? "the colour field"}`,
      path: `/encoding/color/domain/${index}`,
      hint: "list values that appear in the colour field, in the same order as range",
    });
  });
}

function asRule(item: Record<string, unknown>): ColorRule | null {
  if (typeof item.color !== "string") return null;
  return {
    test: typeof item.test === "string" ? item.test : undefined,
    lt: typeof item.lt === "number" ? item.lt : undefined,
    lte: typeof item.lte === "number" ? item.lte : undefined,
    gt: typeof item.gt === "number" ? item.gt : undefined,
    gte: typeof item.gte === "number" ? item.gte : undefined,
    eq: typeof item.eq === "number" ? item.eq : undefined,
    color: item.color,
  };
}

function warnColorRules(
  spec: Record<string, unknown>,
  type: string,
  table: DataTable | undefined,
  diagnostics: Diagnostic[],
): void {
  const applies = MARK_APPLIES.colorRules;
  if (!applies?.includes(type)) return;
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (!mark || !Array.isArray(mark.colorRules)) return;
  const numbers = plottedNumbers(spec, table);
  mark.colorRules.forEach((item, index) => {
    if (!isRecord(item)) {
      diagnostics.push({
        code: "CK3012",
        severity: "warning",
        message: `mark.colorRules[${index}] is not a colour rule`,
        path: `/mark/colorRules/${index}`,
        hint: 'use { "color": "negative", "test": "negative" } or gt, lt, or eq',
      });
      return;
    }
    const rule = asRule(item);
    if (!rule) {
      diagnostics.push({
        code: "CK3012",
        severity: "warning",
        message: `mark.colorRules[${index}] needs a color`,
        path: `/mark/colorRules/${index}/color`,
        hint: "set color to a hex colour or a theme token such as negative or accent",
      });
      return;
    }
    if (numbers.length > 0 && !ruleMatchesAny(rule, numbers)) {
      diagnostics.push({
        code: "CK3012",
        severity: "warning",
        message: `mark.colorRules[${index}] matches no values`,
        path: `/mark/colorRules/${index}`,
        hint: "widen the test, or drop the rule",
      });
    }
  });
}

const RANGE_TYPES = new Set(["area-range", "bar-range", "errorbar"]);

function boundChannels(y: unknown): Channel[] {
  const items = Array.isArray(y) ? y : isRecord(y) ? [y] : [];
  const out: Channel[] = [];
  items.forEach((item, index) => {
    if (!isRecord(item)) return;
    const base = Array.isArray(y) ? `/encoding/y/${index}` : "/encoding/y";
    for (const key of ["lo", "hi", "error"] as const) {
      if (typeof item[key] !== "string") continue;
      out.push({ field: item[key], path: `${base}/${key}`, fieldPath: `${base}/${key}` });
    }
  });
  return out;
}

function pairSwapped(table: DataTable, loField: string, hiField: string): boolean {
  const lo = table.columns[loField];
  const hi = table.columns[hiField];
  if (!lo || !hi) return false;
  let seen = 0;
  for (let i = 0; i < table.length; i++) {
    const a = lo[i];
    const b = hi[i];
    if (typeof a !== "number" || typeof b !== "number" || a === b) continue;
    if (a < b) return false;
    seen += 1;
  }
  return seen > 0;
}

function checkUncertainty(spec: Record<string, unknown>, type: string, table: DataTable, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const y = encoding.y;
  const items = Array.isArray(y) ? y : isRecord(y) ? [y] : [];
  let yPair = false;
  let yDelta = false;
  items.forEach((item, index) => {
    if (!isRecord(item)) return;
    const base = Array.isArray(y) ? `/encoding/y/${index}` : "/encoding/y";
    const lo = typeof item.lo === "string";
    const hi = typeof item.hi === "string";
    if (typeof item.field !== "string" && !(lo && hi)) {
      diagnostics.push({
        code: "CK1003",
        severity: "error",
        message: 'a y series needs "field", or both "lo" and "hi"',
        path: base,
        hint: 'Set "field" for a line, bar, or area. A band sets "lo" and "hi".',
      });
    }
    if (lo && hi) yPair = true;
    if (typeof item.error === "string") yDelta = true;
    if (lo !== hi) {
      diagnostics.push({
        code: "CK3012",
        severity: "warning",
        message: "a band needs both lo and hi",
        path: `${base}/${lo ? "lo" : "hi"}`,
        hint: "Set both field names. low and high on a y series repair to lo and hi.",
      });
    }
    if (item.mark === "range" && !(lo && hi)) {
      diagnostics.push({
        code: "CK3020",
        severity: "error",
        message: "a range series needs lo and hi",
        path: `${base}/mark`,
        hint: 'Set "lo" and "hi" to field names.',
      });
    }
    const paintsBand =
      type === "area-range" ||
      type === "bar-range" ||
      (type === "combo" && item.mark !== "line" && item.mark !== "bar" && item.mark !== "area");
    if (lo && hi && !paintsBand) {
      diagnostics.push({
        code: "CK3012",
        severity: "warning",
        message: "a lo/hi band applies to area-range, bar-range, or a combo range series",
        path: `${base}/lo`,
        hint: 'On a combo, omit mark or set mark to "range".',
      });
    }
    if (typeof item.error === "string" && type !== "errorbar") {
      diagnostics.push({
        code: "CK3012",
        severity: "warning",
        message: "a ± field applies to error bars",
        path: `${base}/error`,
        hint: 'Use type "errorbar".',
      });
    }
    if (lo && hi && typeof item.lo === "string" && typeof item.hi === "string" && pairSwapped(table, item.lo, item.hi)) {
      diagnostics.push({
        code: "CK3021",
        severity: "error",
        message: "lo is above hi on every row",
        path: `${base}/lo`,
        hint: "lo and hi look swapped",
        fix: [
          { op: "replace", path: `${base}/lo`, value: item.hi },
          { op: "replace", path: `${base}/hi`, value: item.lo },
        ],
      });
    }
  });
  const low = fieldName(encoding.low);
  const high = fieldName(encoding.high);
  const error = fieldName(encoding.error);
  if (low && high && pairSwapped(table, low, high)) {
    diagnostics.push({
      code: "CK3021",
      severity: "error",
      message: "low is above high on every row",
      path: "/encoding/low",
      hint: "low and high look swapped",
      fix: [
        { op: "replace", path: "/encoding/low", value: typeof encoding.low === "string" ? high : { ...(isRecord(encoding.low) ? encoding.low : {}), field: high } },
        { op: "replace", path: "/encoding/high", value: typeof encoding.high === "string" ? low : { ...(isRecord(encoding.high) ? encoding.high : {}), field: low } },
      ],
    });
  }
  if (error && type !== "errorbar") {
    diagnostics.push({
      code: "CK3012",
      severity: "warning",
      message: "encoding.error is a ± field for error bars",
      path: "/encoding/error",
      hint: 'Use type "errorbar", or remove it.',
    });
  } else if (type === "errorbar" && error && low && high) {
    diagnostics.push({
      code: "CK3012",
      severity: "warning",
      message: "encoding.error is ignored when low and high are set",
      path: "/encoding/error",
      hint: "Remove encoding.error, or remove low and high to use ±.",
    });
  }
  if (!RANGE_TYPES.has(type)) return;
  const hasPair = Boolean(low && high) || yPair;
  const hasDelta = type === "errorbar" && (Boolean(error) || yDelta);
  if (!hasPair && !hasDelta) {
    diagnostics.push({
      code: "CK3020",
      severity: "error",
      message: type === "errorbar" ? "error bars need low and high, or a ± field" : `${type} needs a low and a high`,
      path: "/encoding/low",
      hint: 'Set encoding.low and encoding.high, or y.lo and y.hi. An error bar may use encoding.error as ± around y.',
    });
  }
}

function readY(y: unknown): Channel[] {
  if (Array.isArray(y)) {
    return y
      .map((item, index) => readChannel(item, `/encoding/y/${index}`))
      .filter((channel): channel is Channel => channel !== undefined && Boolean(channel.field));
  }
  const channel = readChannel(y, "/encoding/y");
  return channel?.field ? [channel] : [];
}

function readChannel(value: unknown, path: string): Channel | undefined {
  if (typeof value === "string") {
    return { field: value, path, fieldPath: path };
  }
  if (!isRecord(value)) return undefined;
  const field = typeof value.field === "string" ? value.field : undefined;
  const scale = isRecord(value.scale) && typeof value.scale.type === "string" ? value.scale.type : undefined;
  const axis = value.axis === "y" || value.axis === "y2" ? value.axis : undefined;
  return {
    field,
    type: typeof value.type === "string" ? value.type : undefined,
    scaleType: scale,
    axis,
    path,
    fieldPath: field ? `${path}/field` : path,
  };
}

function resolveField(name: string, fields: string[]): { match?: string; caseMatch?: string; suggestions: string[] } {
  if (fields.includes(name)) return { match: name, suggestions: [] };
  const lower = name.toLowerCase();
  const caseMatch = fields.find((field) => field.toLowerCase() === lower);
  const suggestions = caseMatch ? [] : nearMatches(name, fields, name.length <= 4 ? 1 : 3);
  return { caseMatch, suggestions };
}

function temporalFix(x: unknown): JsonPatchOperation[] {
  if (typeof x === "string") {
    return [{ op: "replace", path: "/encoding/x", value: { field: x, type: "temporal" } }];
  }
  if (isRecord(x)) {
    return [{ op: x.type === undefined ? "add" : "replace", path: "/encoding/x/type", value: "temporal" }];
  }
  return [{ op: "add", path: "/encoding/x/type", value: "temporal" }];
}

function inferType(values: ArrayLike<unknown>): "quantitative" | "temporal" | "nominal" {
  let present = 0;
  let numeric = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined) continue;
    present += 1;
    if (typeof value === "number" && Number.isFinite(value)) numeric += 1;
  }
  if (present === 0) return "nominal";
  if (numeric === present) return "quantitative";
  if (columnLooksLikeDates(values)) return "temporal";
  return "nominal";
}

function hasMixedNumbers(values: ArrayLike<unknown>): boolean {
  let numbers = 0;
  let others = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined) continue;
    if (typeof value === "number" && Number.isFinite(value)) numbers += 1;
    else others += 1;
  }
  return numbers > 0 && others > 0;
}

function columnLooksLikeDates(values: ArrayLike<unknown>): boolean {
  let present = 0;
  let hits = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined) continue;
    present += 1;
    if (looksLikeDate(value)) hits += 1;
  }
  return present > 0 && hits / present >= 0.8;
}

function looksLikeDate(value: unknown): boolean {
  if (typeof value === "number") return value > 1e11 && value < 1e14;
  if (typeof value !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}(?:[T ][\d:.]+(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(value);
}

function isSorted(values: ArrayLike<unknown>, type: string): boolean {
  return firstUnsorted(values, type) === -1;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function firstUnsorted(values: ArrayLike<unknown>, type: string): number {
  let prev: number | undefined;
  for (let i = 0; i < values.length; i++) {
    const current = type === "temporal" ? timeValue(values[i]) : asNumber(values[i]);
    if (current === undefined) continue;
    if (prev !== undefined && current < prev) return i;
    prev = current;
  }
  return -1;
}

function timeValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function contrast(a: string, b: string): number | null {
  const left = hexToRgb(a);
  const right = hexToRgb(b);
  if (!left || !right) return null;
  const l1 = luminance(left);
  const l2 = luminance(right);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function nearestPassing(text: string, background: string): string {
  const start = hexToRgb(text) ?? [0, 0, 0];
  const bg = hexToRgb(background) ?? [255, 255, 255];
  const toward: [number, number, number] = luminance(bg) > 0.4 ? [0, 0, 0] : [255, 255, 255];
  for (let step = 0; step <= 20; step++) {
    const t = step / 20;
    const mixed: [number, number, number] = [
      Math.round(start[0] + (toward[0] - start[0]) * t),
      Math.round(start[1] + (toward[1] - start[1]) * t),
      Math.round(start[2] + (toward[2] - start[2]) * t),
    ];
    const hex = rgbToHex(mixed);
    const ratio = contrast(hex, background);
    if (ratio !== null && ratio >= 4.5) return hex;
  }
  return rgbToHex(toward);
}

function hexToRgb(value: string): [number, number, number] | null {
  const match = /^#([\da-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const n = Number.parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function luminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const ANNOTATION_TYPES = new Set(["rule", "band", "text", "trendline", "regression", "marker"]);

const TYPE_ALIAS: Record<string, string> = {
  trend: "trendline",
  trends: "trendline",
  average: "trendline",
  avg: "trendline",
  callout: "marker",
  markpoint: "marker",
  line: "rule",
  hline: "rule",
  vline: "rule",
  refline: "rule",
  reference: "rule",
  region: "band",
  range: "band",
  fit: "regression",
  reg: "regression",
  ols: "regression",
};

const TREND_METHOD: Record<string, string> = {
  average: "mean",
  avg: "mean",
  meanline: "mean",
  med: "median",
  regression: "linear",
  ols: "linear",
  fit: "linear",
  lm: "linear",
};

const REG_METHOD: Record<string, string> = {
  lowess: "loess",
  ols: "linear",
  fit: "linear",
  regression: "linear",
  lm: "linear",
};

function checkAnnotations(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (Array.isArray(spec.annotations)) {
    for (let i = 0; i < spec.annotations.length; i++) checkNote(spec.annotations[i], `/annotations/${i}`, spec, diagnostics);
  }
  if (!isRecord(spec.axes)) return;
  for (const key of ["x", "y", "y2"] as const) {
    const axis = spec.axes[key];
    if (!isRecord(axis)) continue;
    checkAxisBands(axis.bands, `/axes/${key}/bands`, key, spec, diagnostics);
  }
}

function checkNote(value: unknown, path: string, spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (!isRecord(value)) return;
  const raw = typeof value.type === "string" ? value.type : "";
  const alias = TYPE_ALIAS[raw];
  if (alias) {
    diagnostics.push({
      code: "CK3013",
      severity: "error",
      message: `annotation type ${JSON.stringify(raw)} is ${JSON.stringify(alias)}`,
      path: `${path}/type`,
      hint: `use type ${JSON.stringify(alias)}`,
      fix: [{ op: "replace", path, value: cleanedNote(value, alias) }],
    });
    return;
  }
  if (!ANNOTATION_TYPES.has(raw)) return;
  if (raw === "trendline" || raw === "regression") checkMethod(value, path, raw, diagnostics);
  if (raw === "band") checkOrder(value.from, value.to, path, diagnostics);
  if (raw === "marker") checkMarker(value, path, diagnostics);
  if ((raw === "trendline" || raw === "regression") && typeof value.series === "string" && value.series) {
    const names = seriesNames(spec);
    if (names.length && !names.includes(value.series)) {
      diagnostics.push({
        code: "CK3019",
        severity: "warning",
        message: `series ${JSON.stringify(value.series)} is not on this chart`,
        path: `${path}/series`,
        hint: `using the first series. Names: ${names.join(", ")}`,
        fix: [{ op: "replace", path: `${path}/series`, value: names[0] }],
      });
    }
  }
}

function checkMethod(value: Record<string, unknown>, path: string, kind: "trendline" | "regression", diagnostics: Diagnostic[]): void {
  const table = kind === "regression" ? REG_METHOD : TREND_METHOD;
  const allowed = kind === "regression" ? new Set(["linear", "loess"]) : new Set(["mean", "median", "linear"]);
  const fallback = kind === "regression" ? "linear" : "mean";
  if (typeof value.method !== "string" || value.method.length === 0) {
    diagnostics.push({
      code: "CK3014",
      severity: "error",
      message: `${kind} needs a method`,
      path: `${path}/method`,
      hint: kind === "regression" ? 'method is "linear" or "loess"' : 'method is "mean", "median", or "linear"',
      fix: [{ op: "add", path: `${path}/method`, value: fallback }],
    });
    return;
  }
  if (allowed.has(value.method)) return;
  const mapped = table[value.method.toLowerCase()];
  if (!mapped) return;
  diagnostics.push({
    code: "CK3014",
    severity: "error",
    message: `method ${JSON.stringify(value.method)} is ${JSON.stringify(mapped)}`,
    path: `${path}/method`,
    hint: `use ${JSON.stringify(mapped)}`,
    fix: [{ op: "replace", path: `${path}/method`, value: mapped }],
  });
}

function checkMarker(value: Record<string, unknown>, path: string, diagnostics: Diagnostic[]): void {
  if (typeof value.label !== "string" || value.label.length === 0) {
    diagnostics.push({
      code: "CK3016",
      severity: "error",
      message: "marker needs a label",
      path: `${path}/label`,
      hint: 'a callout needs the text in label',
      fix: [{ op: "add", path: `${path}/label`, value: "Note" }],
    });
  }
  if (typeof value.x !== "number" && typeof value.x !== "string") {
    diagnostics.push({
      code: "CK3016",
      severity: "error",
      message: "marker needs x",
      path: `${path}/x`,
      hint: "x is the data value or category the callout points at",
    });
  }
}

function checkAxisBands(bands: unknown, path: string, key: "x" | "y" | "y2", spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (typeof bands === "string") {
    const word = bands.trim().toLowerCase();
    if (key !== "x") {
      diagnostics.push({
        code: "CK3017",
        severity: "error",
        message: "weekend bands belong on axes.x",
        path,
        hint: 'set axes.x.bands to "weekends"',
        fix: [{ op: "remove", path }],
      });
      return;
    }
    if (word !== "weekends") {
      diagnostics.push({
        code: "CK3017",
        severity: "error",
        message: `${JSON.stringify(bands)} is "weekends"`,
        path,
        hint: 'axes.x.bands is "weekends" or a list of ranges',
        fix: [{ op: "replace", path, value: "weekends" }],
      });
    } else if (!xLooksDated(spec)) {
      diagnostics.push({
        code: "CK3018",
        severity: "warning",
        message: "weekends need date values on x",
        path,
        hint: "x categories or timestamps need a year, such as 2026-10-05. The band is not drawn.",
      });
    }
    return;
  }
  if (!Array.isArray(bands)) return;
  for (let i = 0; i < bands.length; i++) {
    const item = bands[i];
    if (!isRecord(item)) continue;
    checkOrder(item.from, item.to, `${path}/${i}`, diagnostics);
  }
}

function checkOrder(from: unknown, to: unknown, path: string, diagnostics: Diagnostic[]): void {
  if (typeof from !== "number" || typeof to !== "number" || from <= to) return;
  diagnostics.push({
    code: "CK3015",
    severity: "error",
    message: `range from ${from} is after to ${to}`,
    path: `${path}/from`,
    hint: "swap from and to",
    fix: [
      { op: "replace", path: `${path}/from`, value: to },
      { op: "replace", path: `${path}/to`, value: from },
    ],
  });
}

function cleanedNote(value: Record<string, unknown>, type: string): Record<string, unknown> {
  if (type === "trendline" || type === "regression") {
    const method = type === "regression" ? regMethod(value.method) : trendMethod(value.method);
    const out: Record<string, unknown> = { type, method };
    if (value.axis === "y" || value.axis === "y2") out.axis = value.axis;
    if (typeof value.series === "string") out.series = value.series;
    if (typeof value.label === "string") out.label = value.label;
    if (typeof value.color === "string") out.color = value.color;
    if (value.dash === "solid" || value.dash === "dashed" || value.dash === "dotted") out.dash = value.dash;
    if (type === "regression") {
      if (typeof value.band === "boolean") out.band = value.band;
      if (typeof value.bandwidth === "number" && Number.isFinite(value.bandwidth)) out.bandwidth = Math.min(1, Math.max(0.2, value.bandwidth));
    }
    return out;
  }
  if (type === "marker") {
    const out: Record<string, unknown> = { type, label: typeof value.label === "string" && value.label ? value.label : "Note" };
    if (typeof value.x === "number" || typeof value.x === "string") out.x = value.x;
    if (typeof value.y === "number") out.y = value.y;
    if (typeof value.dx === "number") out.dx = value.dx;
    if (typeof value.dy === "number") out.dy = value.dy;
    if (typeof value.color === "string") out.color = value.color;
    return out;
  }
  if (type === "band") {
    const out: Record<string, unknown> = {
      type,
      axis: value.axis === "x" || value.axis === "y2" ? value.axis : "y",
      from: value.from,
      to: value.to,
    };
    if (typeof out.from === "number" && typeof out.to === "number" && out.from > out.to) {
      const swap = out.from;
      out.from = out.to;
      out.to = swap;
    }
    if (typeof value.label === "string") out.label = value.label;
    if (typeof value.color === "string") out.color = value.color;
    if (typeof value.opacity === "number") out.opacity = value.opacity;
    return out;
  }
  const out: Record<string, unknown> = {
    type: "rule",
    axis: value.axis === "x" || value.axis === "y2" ? value.axis : "y",
    value: typeof value.value === "number" || typeof value.value === "string" ? value.value : 0,
  };
  if (typeof value.label === "string") out.label = value.label;
  if (typeof value.color === "string") out.color = value.color;
  if (value.dash === "solid" || value.dash === "dashed" || value.dash === "dotted") out.dash = value.dash;
  if (value.labelPosition === "start" || value.labelPosition === "center" || value.labelPosition === "end") out.labelPosition = value.labelPosition;
  return out;
}

function trendMethod(value: unknown): string {
  if (value === "mean" || value === "median" || value === "linear") return value;
  if (typeof value === "string" && TREND_METHOD[value.toLowerCase()]) return TREND_METHOD[value.toLowerCase()]!;
  return "mean";
}

function regMethod(value: unknown): string {
  if (value === "linear" || value === "loess") return value;
  if (typeof value === "string" && REG_METHOD[value.toLowerCase()]) return REG_METHOD[value.toLowerCase()]!;
  return "linear";
}

function seriesNames(spec: Record<string, unknown>): string[] {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return [];
  const names: string[] = [];
  const add = (value: unknown) => {
    if (typeof value === "string") names.push(value);
    else if (isRecord(value)) names.push(typeof value.title === "string" ? value.title : typeof value.field === "string" ? value.field : "");
  };
  if (Array.isArray(encoding.y)) for (const item of encoding.y) add(item);
  else add(encoding.y);
  return names.filter((name) => name.length > 0);
}

function xLooksDated(spec: Record<string, unknown>): boolean {
  const read = readData(spec.data);
  if (!read.ok) return false;
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const x = encoding?.x;
  const field = typeof x === "string" ? x : isRecord(x) && typeof x.field === "string" ? x.field : "";
  const values = field ? read.table.columns[field] : undefined;
  if (!values || values.length === 0) return false;
  let seen = 0;
  let dated = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined || value === "") continue;
    seen += 1;
    if (typeof value === "number" && value > 1e11) dated += 1;
    else if (typeof value === "string" && /\d{4}/.test(value) && Number.isFinite(Date.parse(value))) dated += 1;
  }
  return seen > 0 && dated === seen;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
