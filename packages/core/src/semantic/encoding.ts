import type { Diagnostic, JsonPatchOperation } from "../diagnostics";
import type { DataTable } from "../data";
import { sortIssue } from "../sort";
import { namedZone } from "../timezone";
import { transformIssues } from "../transform";
import { readHierarchy } from "../hierarchy";
import { suggestHint } from "../walker";
import { boundChannels, cellPointer, columnLooksLikeDates, fieldName, firstUnsorted, flagged, hasMixedNumbers, inferType, isRecord, isSorted, quotedNumber, readChannel, readY, resolveField, temporalFix, xLooksDated, type Channel } from "./util";

export function checkHierarchy(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (type !== "treemap" && type !== "sunburst" && type !== "tree") return;
  const read = readHierarchy(spec, type === "tree" ? { keepZero: true } : undefined);
  if (!read) {
    const encoding = isRecord(spec.encoding) ? spec.encoding : {};
    const flatTreemap = type === "treemap" && !!fieldName(encoding.x) && !!fieldName(encoding.y);
    if (flatTreemap) return;
    if (Array.isArray(spec.data) && spec.data.length > 0) {
      diagnostics.push({
        code: "CK3140",
        severity: "error",
        message: `${type} needs a hierarchy or a list of names and values`,
        path: "/data",
        hint: "Use nested children, encoding.path, or encoding.id and encoding.parent. A sunburst or treemap also accepts rows with name and value.",
      });
    }
    return;
  }
  const sized = type === "tree" && isRecord(spec.encoding) && spec.encoding.y !== undefined;
  for (const item of read.issues) {
    if (item.code === "CK3030" && type === "tree" && !sized) continue;
    flagged(diagnostics, item);
  }
}

export function checkTimezone(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
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

export function checkSort(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
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

export function checkTransform(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
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

export function checkEncoding(
  spec: Record<string, unknown>,
  encoding: Record<string, unknown>,
  table: DataTable,
  diagnostics: Diagnostic[],
): void {
  const channels: Channel[] = [];
  for (const key of ["x", "series", "color", "size", "label", "open", "high", "low", "close", "volume", "source", "target", "error"] as const) {
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
      if ((spec.type === "treemap" || spec.type === "sunburst" || spec.type === "tree") && readHierarchy(spec, spec.type === "tree" ? { keepZero: true } : undefined)) continue;
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
      if (spec.type !== "scatter" && spec.type !== "histogram" && spec.type !== "strip" && (xType === "temporal" || xType === "quantitative") && !isSorted(values, xType)) {
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
  const measure = declared === "quantitative" || /^\/encoding\/(?:y(?:\/|$)|size(?:\/|$)|low(?:\/|$)|high(?:\/|$)|open(?:\/|$)|close(?:\/|$)|volume(?:\/|$)|error(?:\/|$))/.test(channel.path);
  const bad: { index: number; value: unknown }[] = [];
  let present = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined) continue;
    present += 1;
    if (typeof value !== "number" || !Number.isFinite(value)) bad.push({ index: i, value });
  }
  const quoted = bad.length > 0 && bad.every((item) => quotedNumber(item.value) !== undefined);
  const checkNumbers = declared === "quantitative" || (declared === undefined && hasMixedNumbers(values)) || (measure && quoted && bad.length === present);
  if (checkNumbers && bad.length > 0 && (declared === "quantitative" || quantitative || hasMixedNumbers(values) || quoted)) {
    const first = bad[0];
    diagnostics.push({
      code: "CK2002",
      severity: "error",
      message: `field ${JSON.stringify(field)} has non-numeric values (${bad.length} of ${values.length} rows, first at row ${first.index}: ${JSON.stringify(first.value)})`,
      path: channel.path,
      hint: quoted
        ? "These are numeric strings. repair() writes them as numbers."
        : 'quantitative channels need numbers; strip units like "$" or "%", or set type: "nominal"',
      fix: quoted
        ? bad.map((item) => ({
            op: "replace" as const,
            path: cellPointer(table, field, item.index),
            value: quotedNumber(item.value),
          }))
        : undefined,
    });
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

export function checkDomains(encoding: Record<string, unknown>, diagnostics: Diagnostic[]): void {
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

export function checkCandles(spec: Record<string, unknown>, table: DataTable, diagnostics: Diagnostic[]): void {
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

const RANGE_TYPES = new Set(["area-range", "bar-range", "errorbar"]);

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

export function checkUncertainty(spec: Record<string, unknown>, type: string, table: DataTable, diagnostics: Diagnostic[]): void {
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
