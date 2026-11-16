import { loadTable } from "./data-prep";
import type { Diagnostic } from "./diagnostics";
import { readData } from "./data";
import { foreignHierarchy } from "./hierarchy";
import { fontFamilyCheck } from "./font";
import { gapChecks } from "./gaps-checks";
import { polarChecks } from "./polar-checks";
import { isRecord } from "./semantic/util";
import { checkBrand, warnDesign } from "./semantic/design";
import { checkAnnotations } from "./semantic/annotations";
import { warnChannelExtras, warnGridWeeks, warnRenderLimits, warnSeriesShape, warnStackGroups, warnUnbuilt, warnUnusedMarks, warnVisual } from "./semantic/render";
import { checkCandles, checkDomains, checkEncoding, checkHierarchy, checkSort, checkTimezone, checkTransform, checkUncertainty } from "./semantic/encoding";
import { densityChecks, densityForeign, positiveMeasure, radarSpokes, scatterPoints, streamChecks, streamForeign, stripChecks, treeChecks, treeForeign } from "./semantic/extra-charts";
import { warnCanvas, warnInteraction, warnLayout } from "./semantic/features";

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
  "radial-bar",
  "rose",
  "strip",
]);

export function semanticChecks(spec: unknown, diagnostics: Diagnostic[]): void {
  if (!isRecord(spec)) return;
  const type = typeof spec.type === "string" ? spec.type : undefined;
  const known = type !== undefined && CHART_TYPES.has(type);

  if (known && isRecord(spec.mark)) warnUnusedMarks(type, spec.mark, diagnostics);
  checkBrand(spec, diagnostics);
  fontFamilyCheck(spec, diagnostics);
  gapChecks(spec, diagnostics);
  polarChecks(spec, diagnostics);
  warnGridWeeks(spec, diagnostics);
  warnRenderLimits(spec, diagnostics);
  warnUnbuilt(spec, diagnostics);
  warnVisual(spec, diagnostics);
  checkAnnotations(spec, diagnostics);
  if (isRecord(spec.encoding)) {
    warnSeriesShape(spec.encoding, diagnostics);
    checkDomains(spec.encoding, diagnostics);
    warnChannelExtras(spec.encoding, diagnostics);
    if (known && type) warnStackGroups(type, spec.encoding, diagnostics);
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
  if (type === "strip") stripChecks(spec, view, diagnostics);
  if (type === "scatter") scatterPoints(spec, view, diagnostics);
  if (type === "radar") radarSpokes(spec, view, diagnostics);
  if (type === "pie" || type === "donut" || type === "treemap" || type === "sankey") positiveMeasure(type, spec, view, diagnostics);
  if (type === "streamgraph") streamChecks(spec, view, diagnostics);
  else streamForeign(spec, diagnostics);
  if (type === "density") densityChecks(spec, view, diagnostics);
  else densityForeign(spec, diagnostics);
  if (type === "tree") treeChecks(spec, diagnostics);
  else treeForeign(spec, diagnostics);
  if (type !== "strip" && isRecord(spec.encoding) && spec.encoding.label !== undefined) {
    diagnostics.push({
      code: "CK3094",
      severity: "warning",
      message: '"encoding.label" has no effect on this chart',
      path: "/encoding/label",
      hint: 'encoding.label names a strip point. Remove it or set type to "strip"',
      fix: [{ op: "remove", path: "/encoding/label" }],
    });
  }
  if (type !== "strip" && isRecord(spec.encoding) && spec.encoding.note !== undefined) {
    diagnostics.push({
      code: "CK3135",
      severity: "warning",
      message: '"encoding.note" has no effect on this chart',
      path: "/encoding/note",
      hint: 'encoding.note is the second line under a strip category. Remove it or set type to "strip"',
      fix: [{ op: "remove", path: "/encoding/note" }],
    });
  }
  if (type) checkUncertainty(spec, type, view, diagnostics);
  checkHierarchy(spec, diagnostics);
  if (known) warnDesign(spec, type, view, diagnostics);
}
