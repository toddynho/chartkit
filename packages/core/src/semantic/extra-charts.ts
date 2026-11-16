import type { Diagnostic } from "../diagnostics";
import type { DataTable } from "../data";
import { readHierarchy } from "../hierarchy";
import { fieldName, inferType, isRecord, quotedNumber } from "./util";

export function streamForeign(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (!mark) return;
  if (mark.streamOffset !== undefined) {
    diagnostics.push({
      code: "CK3099",
      severity: "warning",
      message: "mark.streamOffset applies to a streamgraph",
      path: "/mark/streamOffset",
      hint: 'remove it, or set type to "streamgraph"',
      fix: [{ op: "remove", path: "/mark/streamOffset" }],
    });
  }
  if (mark.order !== undefined) {
    diagnostics.push({
      code: "CK3100",
      severity: "warning",
      message: "mark.order applies to a streamgraph",
      path: "/mark/order",
      hint: 'remove it, or set type to "streamgraph"',
      fix: [{ op: "remove", path: "/mark/order" }],
    });
  }
}

export function densityForeign(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (!mark) return;
  if (mark.bandwidth !== undefined) {
    diagnostics.push({
      code: "CK3111",
      severity: "warning",
      message: "mark.bandwidth applies to a density",
      path: "/mark/bandwidth",
      hint: 'remove it, or set type to "density"',
      fix: [{ op: "remove", path: "/mark/bandwidth" }],
    });
  }
  if (mark.steps !== undefined) {
    diagnostics.push({
      code: "CK3112",
      severity: "warning",
      message: "mark.steps applies to a density",
      path: "/mark/steps",
      hint: 'remove it, or set type to "density"',
      fix: [{ op: "remove", path: "/mark/steps" }],
    });
  }
}

function categorical(value: unknown): boolean {
  if (value == null || value === "") return false;
  return pointNumber(value) === undefined;
}

function pointNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return quotedNumber(value);
}

export function scatterPoints(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return;
  const xField = fieldName(encoding.x);
  const yField = fieldName(encoding.y);
  if (!xField || !yField) return;
  const xs = table.columns[xField];
  const ys = table.columns[yField];
  if (!xs || !ys) return;
  const count = Math.max(xs.length, ys.length);
  if (!count) return;
  for (let i = 0; i < count; i++) {
    const x = pointNumber(xs[i]);
    const y = pointNumber(ys[i]);
    if (x !== undefined && y !== undefined) return;
    if (categorical(xs[i]) || categorical(ys[i])) return;
  }
  diagnostics.push({
    code: "CK3139",
    severity: "error",
    message: "scatter has no point to draw",
    path: "/data",
    hint: "Every row is missing x or y. Add a row with both numbers.",
  });
}

export function radarSpokes(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return;
  const xField = typeof encoding.x === "string" ? encoding.x : isRecord(encoding.x) && typeof encoding.x.field === "string" ? encoding.x.field : "";
  const column = xField ? table.columns[xField] : undefined;
  if (!column) return;
  const spokes = new Set<string>();
  for (const value of column) if (value != null && value !== "") spokes.add(String(value));
  if (spokes.size > 0 && spokes.size < 3) {
    diagnostics.push({
      code: "CK3137",
      severity: "error",
      message: "radar needs at least 3 spokes",
      path: "/encoding/x",
      hint: "A radar polygon needs three or more categories.",
    });
  }
}

export function positiveMeasure(type: string, spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return;
  const y = encoding.y;
  const field = typeof y === "string" ? y : isRecord(y) && typeof y.field === "string" ? y.field : "";
  const column = field ? table.columns[field] : undefined;
  if (!column) return;
  let seen = 0;
  let positive = 0;
  for (const value of column) {
    const number = typeof value === "number" && Number.isFinite(value) ? value : quotedNumber(value);
    if (number === undefined) continue;
    seen += 1;
    if (number > 0) positive += 1;
  }
  if (seen > 0 && positive === 0) {
    diagnostics.push({
      code: "CK3138",
      severity: "error",
      message: `${type} has no positive value to draw`,
      path: "/encoding/y",
      hint: "Every value is zero or negative. Use a positive number.",
    });
  }
}

export function streamChecks(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return;
  const y = encoding.y;
  const fields = Array.isArray(y) ? y.flatMap((item) => (typeof item === "string" ? [item] : isRecord(item) && typeof item.field === "string" ? [item.field] : [])) : typeof y === "string" ? [y] : isRecord(y) && typeof y.field === "string" ? [y.field] : [];
  if (!fields.length) return;
  let bad = false;
  let numeric = 0;
  for (const field of fields) {
    const column = table.columns[field];
    if (!column) {
      bad = true;
      continue;
    }
    for (const value of column) {
      if (value == null || value === "") continue;
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) bad = true;
      else numeric += 1;
    }
  }
  if (bad || numeric < 1) {
    diagnostics.push({
      code: "CK3095",
      severity: "error",
      message: "streamgraph values must be numbers that are zero or greater",
      path: "/encoding/y",
      hint: "a negative or a non-numeric value is not drawn. Use stacked area for signed values",
    });
  }
  const seriesField = fields.length === 1 ? (typeof encoding.series === "string" ? encoding.series : isRecord(encoding.series) && typeof encoding.series.field === "string" ? encoding.series.field : typeof encoding.color === "string" ? encoding.color : isRecord(encoding.color) && typeof encoding.color.field === "string" ? encoding.color.field : "") : "";
  let seriesCount = fields.length;
  if (seriesField && table.columns[seriesField]) {
    const names = new Set<string>();
    for (const value of table.columns[seriesField]) if (value != null && value !== "") names.add(String(value));
    if (names.size) seriesCount = names.size;
  }
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  const baseline = mark && typeof mark.streamOffset === "string" ? mark.streamOffset : "";
  if (seriesCount < 2 && baseline !== "zero") {
    const next = { ...(mark ?? {}), streamOffset: "zero" };
    diagnostics.push({
      code: "CK3096",
      severity: "warning",
      message: "a streamgraph with one series is an area on a baseline",
      path: "/mark/streamOffset",
      hint: 'set mark.streamOffset to "zero". The baseline is not zero unless you ask for it',
      fix: [{ op: mark ? "replace" : "add", path: "/mark", value: next }],
    });
  }
  const xField = typeof encoding.x === "string" ? encoding.x : isRecord(encoding.x) && typeof encoding.x.field === "string" ? encoding.x.field : "";
  if (xField && table.columns[xField]) {
    const positions = new Set<string>();
    for (const value of table.columns[xField]) if (value != null && value !== "") positions.add(String(value));
    if (positions.size > 0 && positions.size < 2) {
      diagnostics.push({
        code: "CK3136",
        severity: "error",
        message: "streamgraph needs at least 2 positions",
        path: "/encoding/x",
        hint: "One x value has nothing to connect. Add another row.",
      });
    }
  }
  if (seriesCount > 12) {
    diagnostics.push({
      code: "CK3097",
      severity: "warning",
      message: `streamgraph has ${seriesCount} series`,
      path: "/encoding/y",
      hint: "more than 12 series gets hard to read. Filter the layers or move a name into the legend",
    });
  }
  if (mark && mark.stack !== undefined) {
    diagnostics.push({
      code: "CK3098",
      severity: "warning",
      message: "mark.stack is not a streamgraph control",
      path: "/mark/stack",
      hint: "mark.streamOffset is the stack. wiggle, center, zero, or expand",
      fix: [{ op: "remove", path: "/mark/stack" }],
    });
  }
  if (mark && mark.offset !== undefined) {
    diagnostics.push({
      code: "CK3101",
      severity: "warning",
      message: "mark.offset pulls a pie slice out",
      path: "/mark/offset",
      hint: 'a streamgraph baseline is mark.streamOffset. silhouette is the same as "center"',
      fix: [{ op: "remove", path: "/mark/offset" }],
    });
  }
}

export function densityChecks(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (mark && (mark.dims === 2 || mark.dims === "2")) {
    diagnostics.push({
      code: "CK3109",
      severity: "error",
      message: "a 2D density is not in this version",
      path: "/mark/dims",
      hint: "leave mark.dims unset. The curve is one-dimensional",
    });
  }
  if (mark && typeof mark.bandwidth === "number" && !(mark.bandwidth > 0)) {
    diagnostics.push({
      code: "CK3106",
      severity: "error",
      message: "mark.bandwidth must be greater than 0",
      path: "/mark/bandwidth",
      hint: 'use "auto" or a positive number. auto is Scott\'s rule',
    });
  }
  if (mark && mark.bins !== undefined) {
    diagnostics.push({
      code: "CK3107",
      severity: "warning",
      message: "mark.bins bins a histogram",
      path: "/mark/bins",
      hint: "histogram bins counts. Density smooths the sample",
      fix: [{ op: "remove", path: "/mark/bins" }],
    });
  }
  if (!encoding) return;
  const x = typeof encoding.x === "string" ? encoding.x : isRecord(encoding.x) && typeof encoding.x.field === "string" ? encoding.x.field : "";
  const column = x ? table.columns[x] : undefined;
  let finite = 0;
  if (column) {
    for (const value of column) if (typeof value === "number" && Number.isFinite(value)) finite += 1;
  }
  if (finite < 2) {
    diagnostics.push({
      code: "CK3105",
      severity: "error",
      message: "a density needs at least 2 numbers",
      path: "/encoding/x",
      hint: "encoding.x is the raw sample",
    });
  }
  const y = encoding.y;
  const yField = typeof y === "string" ? y : isRecord(y) && typeof y.field === "string" ? y.field : "";
  const yCol = yField ? table.columns[yField] : undefined;
  const yNumeric = yCol ? [...yCol].some((value) => typeof value === "number" && Number.isFinite(value)) : false;
  if (yNumeric && mark?.dims === undefined) {
    diagnostics.push({
      code: "CK3108",
      severity: "warning",
      message: "encoding.y is ignored on a 1D density",
      path: "/encoding/y",
      hint: "2D density is not in this version. The curve uses encoding.x",
    });
  }
  const seriesField = typeof encoding.series === "string" ? encoding.series : isRecord(encoding.series) && typeof encoding.series.field === "string" ? encoding.series.field : typeof encoding.color === "string" ? encoding.color : isRecord(encoding.color) && typeof encoding.color.field === "string" ? encoding.color.field : "";
  if (seriesField && table.columns[seriesField]) {
    const names = new Set<string>();
    for (const value of table.columns[seriesField]) if (value != null && value !== "") names.add(String(value));
    if (names.size > 12) {
      diagnostics.push({
        code: "CK3110",
        severity: "warning",
        message: `density has ${names.size} groups`,
        path: "/encoding/color",
        hint: "more than 12 curves overlay into a band. Filter the groups",
      });
    }
  }
}
export function treeForeign(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (!mark) return;
  if (mark.tree !== undefined) {
    diagnostics.push({
      code: "CK3119",
      severity: "warning",
      message: "mark.tree applies to a tree",
      path: "/mark/tree",
      hint: 'remove it, or set type to "tree"',
      fix: [{ op: "remove", path: "/mark/tree" }],
    });
  }
  if (mark.orient !== undefined) {
    diagnostics.push({
      code: "CK3120",
      severity: "warning",
      message: "mark.orient applies to a tree",
      path: "/mark/orient",
      hint: 'remove it, or set type to "tree"',
      fix: [{ op: "remove", path: "/mark/orient" }],
    });
  }
  if (mark.link !== undefined) {
    diagnostics.push({
      code: "CK3121",
      severity: "warning",
      message: "mark.link applies to a tree",
      path: "/mark/link",
      hint: 'remove it, or set type to "tree"',
      fix: [{ op: "remove", path: "/mark/link" }],
    });
  }
  if (mark.radial !== undefined) {
    diagnostics.push({
      code: "CK3122",
      severity: "warning",
      message: "mark.radial applies to a tree",
      path: "/mark/radial",
      hint: 'remove it, or set type to "tree"',
      fix: [{ op: "remove", path: "/mark/radial" }],
    });
  }
  if (mark.colorBy !== undefined) {
    diagnostics.push({
      code: "CK3123",
      severity: "warning",
      message: "mark.colorBy applies to a tree",
      path: "/mark/colorBy",
      hint: 'remove it, or set type to "tree"',
      fix: [{ op: "remove", path: "/mark/colorBy" }],
    });
  }
  if (mark.collapsed !== undefined) {
    diagnostics.push({
      code: "CK3124",
      severity: "warning",
      message: "mark.collapsed applies to a tree",
      path: "/mark/collapsed",
      hint: 'remove it, or set type to "tree"',
      fix: [{ op: "remove", path: "/mark/collapsed" }],
    });
  }
}

export function treeChecks(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const read = readHierarchy(spec, { keepZero: true });
  const root = read?.root;
  if (root && root.name === "" && root.children.length > 1) {
    diagnostics.push({
      code: "CK3115",
      severity: "error",
      message: "a tree has one root",
      path: "/data",
      hint: "Add a parent row that the roots point at. Repair does not invent that row.",
    });
  }
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (mark && mark.orientation !== undefined) {
    const orient = mark.orientation === "vertical" ? "TB" : "LR";
    const next = { ...mark, orient };
    delete next.orientation;
    diagnostics.push({
      code: "CK3116",
      severity: "warning",
      message: "mark.orientation is the bar direction",
      path: "/mark/orientation",
      hint: 'A tree uses mark.orient: LR, RL, TB, or BT. horizontal becomes LR and vertical becomes TB.',
      fix: [{ op: "replace", path: "/mark", value: next }],
    });
  }
  if (mark?.radial === true && root) {
    let leaves = 0;
    const count = (node: { children: { children: unknown[] }[] }): void => {
      if (!node.children.length) leaves += 1;
      for (const child of node.children) count(child as { children: { children: unknown[] }[] });
    };
    count(root);
    if (leaves > 30) {
      diagnostics.push({
        code: "CK3117",
        severity: "warning",
        message: `radial tree has ${leaves} leaves`,
        path: "/mark/radial",
        hint: "Labels collide past about 30 leaves. The chart still draws.",
      });
    }
  }
  if (root) {
    const names: string[] = [];
    const walk = (node: { name: string; children: { name: string; children: unknown[] }[] }): void => {
      if (node.name) names.push(node.name);
      for (const child of node.children) walk(child as { name: string; children: { name: string; children: unknown[] }[] });
    };
    walk(root);
    const mean = names.length ? names.reduce((sum, name) => sum + name.length, 0) / names.length : 0;
    if (mean > 24) {
      diagnostics.push({
        code: "CK3118",
        severity: "warning",
        message: "tree labels are long",
        path: "/data",
        hint: "This chart draws dots and short labels, not boxes. Give size.height more room.",
      });
    }
  }
}

export function stripChecks(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return;
  const vertical = isRecord(spec.mark) && spec.mark.orientation === "vertical";
  const groupChannel = vertical ? encoding.x : encoding.y;
  const valueChannel = vertical ? encoding.y : encoding.x;
  const groupField = typeof groupChannel === "string" ? groupChannel : isRecord(groupChannel) && typeof groupChannel.field === "string" ? groupChannel.field : "";
  const valueField = typeof valueChannel === "string" ? valueChannel : isRecord(valueChannel) && typeof valueChannel.field === "string" ? valueChannel.field : "";
  const groupPath = vertical ? "/encoding/x" : "/encoding/y";
  const valuePath = vertical ? "/encoding/y" : "/encoding/x";
  if (!groupField || !valueField) return;
  const groups = table.columns[groupField];
  const values = table.columns[valueField];
  if (!groups || !values) return;
  if (inferType(values) !== "quantitative") {
    diagnostics.push({
      code: "CK3088",
      severity: "error",
      message: "strip value field has no numbers",
      path: valuePath,
      hint: "the value channel has to be quantitative",
    });
  }
  if (inferType(groups) === "quantitative") {
    diagnostics.push({
      code: "CK3087",
      severity: "warning",
      message: "strip group field is quantitative and is drawn as categories",
      path: groupPath,
      hint: "each distinct number becomes a row. A numeric axis belongs on the value channel",
    });
  }
  const counts = new Map<string, number>();
  for (let i = 0; i < groups.length; i++) {
    const name = groups[i];
    if (name === null || name === undefined || name === "") continue;
    const key = String(name);
    counts.set(key, (counts.get(key) ?? 0) + (typeof values[i] === "number" ? 1 : 0));
  }
  if (counts.size > 12) {
    diagnostics.push({
      code: "CK3089",
      severity: "warning",
      message: `strip has ${counts.size} groups`,
      path: groupPath,
      hint: "more than 12 groups gets hard to read. boxplot is the chart for many groups",
    });
  }
  const sizes = [...counts.values()];
  const markNow = isRecord(spec.mark) ? spec.mark : {};
  const summaryHidden = markNow.summary === "none";
  const bandHidden = markNow.band === "none" || markNow.band === undefined;
  if (sizes.length > 0 && sizes.every((count) => count === 1) && !(summaryHidden && bandHidden)) {
    const mark = { ...markNow, summary: "none", band: "none" };
    diagnostics.push({
      code: "CK3091",
      severity: "warning",
      message: "every strip group has one point, so the summary and band are hidden",
      path: "/mark",
      hint: "this is a dot plot. summary and band need more than one observation",
      fix: [{ op: isRecord(spec.mark) ? "replace" : "add", path: "/mark", value: mark }],
    });
  }
  const band = isRecord(spec.mark) ? spec.mark.band : undefined;
  if ((band === "range" || band === "iqr") && sizes.some((count) => count < 3)) {
    const allShort = sizes.every((count) => count < 3);
    const mark = isRecord(spec.mark) ? { ...spec.mark, band: "none" } : { band: "none" };
    diagnostics.push({
      code: "CK3090",
      severity: "warning",
      message: "a strip band needs 3 observations in the group",
      path: "/mark/band",
      hint: allShort ? "no group has 3 points, so the band is dropped" : "groups with fewer than 3 points are drawn without a band",
      ...(allShort ? { fix: [{ op: "replace" as const, path: "/mark", value: mark }] } : {}),
    });
  }
  const highlight = isRecord(spec.mark) && typeof spec.mark.highlight === "string" ? spec.mark.highlight : "";
  const colorField = colorFieldOf(encoding, vertical);
  const series = new Set<string>();
  if (colorField && table.columns[colorField]) {
    for (const value of table.columns[colorField]) {
      if (value !== null && value !== undefined && value !== "") series.add(String(value));
    }
  }
  if (highlight && !counts.has(highlight) && !series.has(highlight)) {
    diagnostics.push({
      code: "CK3092",
      severity: "warning",
      message: `highlight ${JSON.stringify(highlight)} is not a group`,
      path: "/mark/highlight",
      hint: `groups: ${[...counts.keys()].join(", ") || "(none)"}`,
      fix: [{ op: "remove", path: "/mark/highlight" }],
    });
  }
  const emphasis = isRecord(spec.mark) ? spec.mark.emphasis : undefined;
  if ((emphasis === "ring" || emphasis === "color" || emphasis === "muted") && !highlight) {
    diagnostics.push({
      code: "CK3134",
      severity: "warning",
      message: "mark.emphasis needs mark.highlight",
      path: "/mark/emphasis",
      hint: "emphasis draws the highlighted group or series. Remove emphasis or set highlight",
      fix: [{ op: "remove", path: "/mark/emphasis" }],
    });
  }
  const note = isRecord(spec.mark) ? spec.mark.note : undefined;
  if (note === "field" && encoding.note === undefined) {
    diagnostics.push({
      code: "CK3133",
      severity: "warning",
      message: "a field note needs encoding.note",
      path: "/mark/note",
      hint: "encoding.note is the column drawn under the category. range draws the min and max instead",
      fix: [{ op: "replace", path: "/mark/note", value: "none" }],
    });
  }
  if (isRecord(spec.mark) && spec.mark.pin === true && !explicitDomain(vertical ? encoding.y : encoding.x)) {
    diagnostics.push({
      code: "CK3132",
      severity: "warning",
      message: "a pin needs an explicit scale domain",
      path: "/mark/pin",
      hint: "set the value scale domain. Values outside it become edge markers",
      fix: [{ op: "replace", path: "/mark/pin", value: false }],
    });
  }
}

function colorFieldOf(encoding: Record<string, unknown>, vertical: boolean): string {
  void vertical;
  const color = encoding.color;
  if (typeof color === "string") return color;
  if (isRecord(color) && typeof color.field === "string") return color.field;
  return "";
}

function explicitDomain(channel: unknown): boolean {
  if (!isRecord(channel) || !isRecord(channel.scale) || !Array.isArray(channel.scale.domain)) return false;
  const domain = channel.scale.domain;
  return typeof domain[0] === "number" && typeof domain[1] === "number" && domain[1] > domain[0];
}
