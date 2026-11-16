import type { Diagnostic } from "../diagnostics";
import { isRecord, xLooksDated } from "./util";

const ANNOTATION_TYPES = new Set(["rule", "band", "text", "trendline", "regression", "marker", "compare"]);

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

export function checkAnnotations(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
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
  if (raw === "compare" && spec.type !== "strip") {
    const notes = Array.isArray(spec.annotations) ? spec.annotations : [];
    diagnostics.push({
      code: "CK3093",
      severity: "warning",
      message: "a compare annotation is drawn on a strip",
      path,
      hint: 'remove it, or set type to "strip"',
      fix: [{ op: "remove", path: notes.length === 1 ? "/annotations" : path }],
    });
  }
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
