import type { Diagnostic } from "../diagnostics";
import { MARK_APPLIES } from "../marks";
import { currencyCodeOk, localeTagOk, parseSpecifier } from "../format";
import { domainEnds, paddingOverflow } from "../svg";
import { at, flag, isRecord } from "./util";

/** kind: 0 defined, 3 light|dark, 4 string, 5 number. */
const UNBUILT: ReadonlyArray<readonly [string, 0 | 3 | 4 | 5, string]> = [
  ["axes/y2/grid", 0, "ignored; no y2 grid"],
];

export function warnVisual(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  walkSpecifiers(spec, "", diagnostics);
  const tip = isRecord(spec.tooltip) ? spec.tooltip : undefined;
  if (tip && typeof tip.template === "string") {
    const fields = fieldNames(spec);
    const known = new Set(["x", "name", "value", "unit"]);
    for (const match of tip.template.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)) {
      const token = match[1] ?? "";
      if (known.has(token) || fields.has(token)) continue;
      diagnostics.push({
        code: "CK3059",
        severity: "warning",
        message: "tooltip template names a missing field",
        path: "/tooltip/template",
        hint: "tokens are {x}, {name}, {value}, {unit}, and data field names",
      });
      break;
    }
  }
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (encoding) {
    for (const key of Object.keys(encoding)) {
      const list = Array.isArray(encoding[key]) ? encoding[key] : [encoding[key]];
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (!isRecord(item) || !isRecord(item.scale)) continue;
        const base = Array.isArray(encoding[key]) ? `/encoding/${key}/${i}/scale` : `/encoding/${key}/scale`;
        if (item.scale.constant !== undefined && item.scale.type !== "symlog") {
          diagnostics.push({
            code: "CK3062",
            severity: "warning",
            message: "symlog constant must be positive on a symlog scale",
            path: `${base}/constant`,
            hint: 'set scale.type to "symlog". constant is the linear half-width around zero. Default 1.',
          });
        }
      }
    }
  }
  const axes = isRecord(spec.axes) ? spec.axes : undefined;
  if (!axes) return;
  const xQuant = xIsQuantitative(spec);
  for (const key of ["x", "y", "y2"] as const) {
    const axis = axes[key];
    if (!isRecord(axis)) continue;
    if ((key === "y" || key === "y2") && typeof axis.crosses === "number" && !xQuant) {
      diagnostics.push({
        code: "CK3060",
        severity: "warning",
        message: "axis crosses needs a finite value on a quantitative scale",
        path: `/axes/${key}/crosses`,
        hint: "axes.y.crosses needs a numeric x. axes.x.crosses: 0 draws the x axis through y = 0.",
      });
    }
    if (!Array.isArray(axis.breaks)) continue;
    let prev = -Infinity;
    for (let i = 0; i < axis.breaks.length; i++) {
      const gap = axis.breaks[i];
      if (!isRecord(gap) || typeof gap.from !== "number" || typeof gap.to !== "number") continue;
      if (!(gap.to > gap.from)) {
        diagnostics.push({
          code: "CK3061",
          severity: "warning",
          message: "axis break from must be below to",
          path: `/axes/${key}/breaks/${i}/from`,
          hint: 'swap the ends, for example { "from": 10, "to": 40 }',
        });
      }
      const lo = Math.min(gap.from, gap.to);
      if (lo < prev) {
        diagnostics.push({
          code: "CK3069",
          severity: "warning",
          message: "axis breaks overlap",
          path: `/axes/${key}/breaks/${i}`,
          hint: "ranges must not share values",
        });
      }
      prev = Math.max(prev, gap.from, gap.to);
    }
  }
}

function walkSpecifiers(node: unknown, path: string, diagnostics: Diagnostic[]): void {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) walkSpecifiers(node[i], `${path}/${i}`, diagnostics);
    return;
  }
  if (!isRecord(node)) return;
  if (typeof node.specifier === "string" && !parseSpecifier(node.specifier)) {
    diagnostics.push({
      code: "CK3058",
      severity: "warning",
      message: "format specifier is not a d3-style pattern",
      path: path ? `${path}/specifier` : "/specifier",
      hint: "use .2f, ,.0f, $,.0f, .1%, .2e, +.1f, or s",
    });
  }
  for (const key of Object.keys(node)) {
    if (key === "data") continue;
    walkSpecifiers(node[key], path ? `${path}/${key}` : `/${key}`, diagnostics);
  }
}

function fieldNames(spec: Record<string, unknown>): Set<string> {
  const names = new Set<string>();
  const data = spec.data;
  if (Array.isArray(data)) {
    for (const row of data) if (isRecord(row)) for (const key of Object.keys(row)) names.add(key);
  } else if (isRecord(data) && isRecord(data.columns)) {
    for (const key of Object.keys(data.columns)) names.add(key);
  }
  return names;
}

function xIsQuantitative(spec: Record<string, unknown>): boolean {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const x = encoding?.x;
  if (isRecord(x) && (x.type === "quantitative" || x.type === "temporal")) return true;
  if (isRecord(x) && isRecord(x.scale) && (x.scale.type === "linear" || x.scale.type === "log" || x.scale.type === "symlog" || x.scale.type === "time")) return true;
  const data = spec.data;
  const field = typeof x === "string" ? x : isRecord(x) && typeof x.field === "string" ? x.field : "";
  if (!field) return false;
  const column = Array.isArray(data)
    ? data.map((row) => (isRecord(row) ? row[field] : undefined))
    : isRecord(data) && isRecord(data.columns) && Array.isArray(data.columns[field])
      ? (data.columns[field] as unknown[])
      : [];
  return column.length > 0 && column.every((value) => typeof value === "number" && Number.isFinite(value));
}

export function warnUnbuilt(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
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

/**
 * Values render will not honour. The chart falls back; the diagnostic says so.
 * Decimals are CK3125. Currency is CK3126. Locale is CK3127.
 * A non-positive size is CK3128. Calendar weeks are CK3129.
 * Padding that erases the plot is CK3130. A marker radius below 1 is CK3131.
 */
export function warnRenderLimits(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (typeof spec.locale === "string" && !localeTagOk(spec.locale)) {
    diagnostics.push({
      code: "CK3127",
      severity: "warning",
      message: "locale is not a valid language tag",
      path: "/locale",
      hint: "render uses en-US",
      fix: [{ op: "remove", path: "/locale" }],
    });
  }
  const size = isRecord(spec.size) ? spec.size : undefined;
  if (size) {
    for (const key of ["width", "height"] as const) {
      const value = size[key];
      if (typeof value === "number" && (!Number.isFinite(value) || value < 1)) {
        diagnostics.push({
          code: "CK3128",
          severity: "warning",
          message: `size.${key} must be at least 1`,
          path: `/size/${key}`,
          hint: "render keeps the chart's default size",
          fix: [{ op: "remove", path: `/size/${key}` }],
        });
      }
    }
  }
  if (isRecord(spec.mark) && typeof spec.mark.weeks === "number" && (!Number.isFinite(spec.mark.weeks) || spec.mark.weeks < 1 || spec.mark.weeks > 104)) {
    const weeks = Number.isFinite(spec.mark.weeks) ? Math.min(104, Math.max(1, Math.round(spec.mark.weeks))) : 52;
    diagnostics.push({
      code: "CK3129",
      severity: "warning",
      message: "mark.weeks must be from 1 to 104",
      path: "/mark/weeks",
      hint: "render uses a week count in that range",
      fix: [{ op: "replace", path: "/mark/weeks", value: weeks }],
    });
  }
  const padding = paddingOverflow(spec);
  if (padding) {
    diagnostics.push({
      code: "CK3130",
      severity: "warning",
      message: "size.padding leaves no room for the plot",
      path: padding.path,
      hint: "render keeps a plot of at least 48px",
      fix: Object.keys(padding.value).length
        ? [{ op: "replace", path: padding.path, value: padding.value }]
        : [{ op: "remove", path: padding.path }],
    });
  }
  if (isRecord(spec.mark)) warnPointSize(spec.mark, "/mark", diagnostics);
  if (isRecord(spec.encoding)) warnPointSize(spec.encoding, "/encoding", diagnostics);
  for (const root of ["encoding", "axes", "mark", "metric", "tooltip"] as const) {
    if (isRecord(spec[root])) walkFormat(spec[root], `/${root}`, diagnostics);
  }
}

function warnPointSize(node: Record<string, unknown>, path: string, diagnostics: Diagnostic[]): void {
  if (typeof node.pointSize === "number" && (!Number.isFinite(node.pointSize) || node.pointSize < 1)) {
    diagnostics.push({
      code: "CK3131",
      severity: "warning",
      message: "pointSize must be at least 1",
      path: `${path}/pointSize`,
      hint: "render uses the chart's default marker size",
      fix: [{ op: "remove", path: `${path}/pointSize` }],
    });
  }
  for (const [key, value] of Object.entries(node)) {
    if (isRecord(value)) warnPointSize(value, `${path}/${key}`, diagnostics);
    else if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index++) {
        if (isRecord(value[index])) warnPointSize(value[index] as Record<string, unknown>, `${path}/${key}/${index}`, diagnostics);
      }
    }
  }
}

function walkFormat(node: Record<string, unknown>, path: string, diagnostics: Diagnostic[]): void {
  if (typeof node.decimals === "number" && (!Number.isFinite(node.decimals) || node.decimals < 0 || node.decimals > 20)) {
    const digits = Number.isFinite(node.decimals) ? Math.max(0, Math.min(20, Math.round(node.decimals))) : 0;
    diagnostics.push({
      code: "CK3125",
      severity: "warning",
      message: "format decimals must be from 0 to 20",
      path: `${path}/decimals`,
      hint: "render uses a value in that range",
      fix: [{ op: "replace", path: `${path}/decimals`, value: digits }],
    });
  }
  if (typeof node.currency === "string" && !currencyCodeOk(node.currency)) {
    diagnostics.push({
      code: "CK3126",
      severity: "warning",
      message: "currency must be a 3-letter ISO code",
      path: `${path}/currency`,
      hint: "render uses USD",
      fix: [{ op: "replace", path: `${path}/currency`, value: "USD" }],
    });
  }
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (isRecord(child)) walkFormat(child, `${path}/${key}`, diagnostics);
    else if (Array.isArray(child)) {
      for (let index = 0; index < child.length; index++) {
        const item = child[index];
        if (isRecord(item)) walkFormat(item, `${path}/${key}/${index}`, diagnostics);
      }
    }
  }
}

export function warnGridWeeks(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (spec.type !== "heatmap" || !isRecord(spec.mark) || spec.mark.weeks === undefined) return;
  const mark = spec.mark;
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const layout = mark.layout === "grid" || mark.layout === "calendar" ? mark.layout : encoding && encoding.y != null ? "grid" : "calendar";
  if (layout === "grid") flag(diagnostics, "/mark/weeks", "ignored; calendar layout only");
}

export function warnUnusedMarks(type: string, mark: Record<string, unknown>, diagnostics: Diagnostic[]): void {
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

const STACK_TYPES = new Set(["bar", "stacked-area", "combo", "line"]);

export function warnStackGroups(type: string, encoding: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (STACK_TYPES.has(type)) return;
  const y = encoding.y;
  const list = Array.isArray(y) ? y : y === undefined ? [] : [y];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!isRecord(item) || typeof item.stack !== "string" || item.stack.length === 0) continue;
    const path = Array.isArray(y) ? `/encoding/y/${i}/stack` : `/encoding/y/stack`;
    diagnostics.push({
      code: "CK3072",
      severity: "warning",
      message: `"encoding.y[].stack" has no effect on type ${JSON.stringify(type)}`,
      path,
      hint: "stack groups apply to bar, stacked-area, combo, and line. Remove it or change the type",
      fix: [{ op: "remove", path }],
    });
  }
}

export function warnChannelExtras(encoding: Record<string, unknown>, diagnostics: Diagnostic[]): void {
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

export function warnSeriesShape(encoding: Record<string, unknown>, diagnostics: Diagnostic[]): void {
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
