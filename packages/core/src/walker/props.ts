import type { JsonPatchOperation } from "../diagnostics";
import { parseSpecifier } from "../format";
import { LEGACY_PROPS, TYPE_REQUIREMENTS } from "../marks";
import { suggestAlt } from "../suggest";
import { emit, isPlainObject, join, nearMatches, quote, showPath, suggestHint, type Ctx, type JsonSchema } from "./util";
import { validTypeList } from "./chart-type";
import { FACET_SCALE_KEYS, scaleWord } from "./features";

export function formatPresetFix(value: string): { hint: string; value: unknown } | undefined {
  const decimals = /^\.(\d+)f$/.exec(value);
  if (decimals) {
    const n = Number(decimals[1]);
    return {
      hint: `did you mean "number"? ${n} decimal places is { "style": "number", "decimals": ${n} }.`,
      value: { style: "number", decimals: n },
    };
  }
  if (!parseSpecifier(value)) return undefined;
  return {
    hint: `${quote(value)} is a d3-style specifier. Use { "specifier": ${quote(value)} }.`,
    value: { specifier: value },
  };
}

const CLICK_KEYS = ["onClick", "click", "onPointClick", "onSeriesClick", "onLegendClick"];

export const CURVE_ALIAS: Record<string, string> = {
  smooth: "monotone",
  spline: "monotone",
  basis: "monotone",
  natural: "monotone",
  cardinal: "monotone",
  "monotone-x": "monotone",
  "monotonex": "monotone",
};

export const SHAPE_ALIAS: Record<string, string> = {
  rect: "square",
  rectangle: "square",
  box: "square",
  dot: "circle",
  circle: "circle",
  diamond: "diamond",
  rhombus: "diamond",
  triangle: "triangle",
  "triangle-up": "triangle",
  cross: "cross",
  plus: "cross",
  x: "cross",
  none: "none",
  hidden: "none",
};

export const TITLE_AT: Record<string, string> = { middle: "center", left: "start", right: "end", top: "end", bottom: "start" };
export const TICK_AT: Record<string, string> = { in: "inside", out: "outside", hidden: "none" };
const AXIS_RENAME: Record<string, string> = {
  titleAnchor: "titlePosition",
  titleAlign: "titlePosition",
  nameLocation: "titlePosition",
  nameRotate: "titleRotate",
  tickSize: "tickLength",
  labelWrap: "labelWidth",
};

export const POS_ALIAS: Record<string, string> = {
  above: "top",
  below: "bottom",
  middle: "center",
  in: "inside",
  out: "outside",
  start: "left",
  end: "right",
};

export const ENDS_ALIAS: Record<string, string> = {
  end: "last",
  both: "ends",
  firstLast: "ends",
  "first-last": "ends",
};

const MARK_SHAPE_KEYS = ["symbol", "marker", "pointStyle", "markerShape", "markerSymbol"];
const MARK_LABEL_KEYS = ["dataLabels", "showLabels", "showValues", "dataLabel"];
const MARK_TOTAL_KEYS = ["stackLabels", "showTotal", "totals", "totalLabel", "stackLabel"];

export function labelWord(value: string, ctx: Ctx): boolean {
  const position = POS_ALIAS[value] ?? (["top", "bottom", "left", "right", "center", "inside", "outside"].includes(value) ? value : "");
  const ends = ENDS_ALIAS[value] ?? (value === "all" || value === "ends" || value === "last" ? value : "");
  if (!position && !ends) return false;
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const mark = isPlainObject(root.mark) ? root.mark : {};
  const fix: JsonPatchOperation[] = [{ op: "replace", path: "/mark/labels", value: true }];
  if (position && mark.labelPosition === undefined) fix.push({ op: "add", path: "/mark/labelPosition", value: position });
  if (ends && mark.labelEnds === undefined) fix.push({ op: "add", path: "/mark/labelEnds", value: ends });
  emit(ctx, {
    code: "CK1006",
    severity: "error",
    message: `${showPath("/mark/labels")} must be boolean, got ${quote(value)}`,
    path: "/mark/labels",
    hint: position
      ? `labels is true or false. ${quote(value)} means labels on, at ${quote(position)}.`
      : `labels is true or false. ${quote(value)} means labels on, labelEnds ${quote(ends)}.`,
    fix,
  });
  return true;
}

/** axes.y.min is not an axis key. The limit lives on encoding.y.scale.domain, and the same for x. */
function axisLimit(name: string, path: string, pointer: string, value: unknown, ctx: Ctx): boolean {
  const match = /^\/axes\/(x|y|y2)$/.exec(path);
  if (!match || (name !== "min" && name !== "max")) return false;
  const axis = match[1] ?? "y";
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const axes = isPlainObject(root.axes) ? root.axes : {};
  const box = isPlainObject(axes[axis]) ? axes[axis] : {};
  const other = name === "min" ? "max" : "min";
  ctx.skipUnknown.add(join(path, other));
  const min = typeof box.min === "number" ? box.min : name === "min" && typeof value === "number" ? value : null;
  const max = typeof box.max === "number" ? box.max : name === "max" && typeof value === "number" ? value : null;
  const channel = axis === "x" ? "x" : "y";
  const where = axis === "y2" ? "encoding.y.scale.domain on the series with axis y2" : `encoding.${channel}.scale.domain`;
  const fix: JsonPatchOperation[] = [{ op: "remove", path: pointer }];
  if (typeof box[other] === "number") fix.push({ op: "remove", path: join(path, other) });
  if (axis !== "y2") {
    const moved = domainPatch(root, channel, [min, max]);
    if (moved) fix.push(...moved);
  }
  emit(ctx, {
    code: "CK1002",
    severity: "error",
    message: `unknown property ${quote(name)}`,
    path: pointer,
    hint: `Axis ${name} is not a limit. Move it to ${where}.`,
    fix,
  });
  return true;
}

function domainPatch(root: Record<string, unknown>, channel: "x" | "y", domain: [number | null, number | null]): JsonPatchOperation[] | null {
  if (domain[0] === null && domain[1] === null) return null;
  const encoding = isPlainObject(root.encoding) ? root.encoding : undefined;
  if (!encoding) return [{ op: "add", path: "/encoding", value: { [channel]: { scale: { domain } } } }];
  const current = encoding[channel];
  if (typeof current === "string") {
    return [{ op: "replace", path: `/encoding/${channel}`, value: { field: current, scale: { domain } } }];
  }
  if (Array.isArray(current) || !isPlainObject(current)) return null;
  if (!isPlainObject(current.scale)) return [{ op: "add", path: `/encoding/${channel}/scale`, value: { domain } }];
  const existing = Array.isArray(current.scale.domain) ? current.scale.domain : [null, null];
  const next = [domain[0] ?? existing[0] ?? null, domain[1] ?? existing[1] ?? null];
  return [{ op: Array.isArray(current.scale.domain) ? "replace" : "add", path: `/encoding/${channel}/scale/domain`, value: next }];
}

function markHome(path: string): string | null {
  if (path === "/mark" || path === "/encoding/y" || /^\/encoding\/y\/\d+$/.test(path)) return path;
  return null;
}

function markMistake(name: string, path: string, pointer: string, value: unknown, ctx: Ctx): boolean {
  const home = markHome(path);
  if (!home) return false;
  const shape = MARK_SHAPE_KEYS.includes(name) ? (typeof value === "string" ? SHAPE_ALIAS[value] ?? (NAMES_SHAPE.has(value) ? value : "") : "") : "";
  if (MARK_SHAPE_KEYS.includes(name) && shape) {
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: `markers are ${home === "/mark" ? "mark.pointShape" : "pointShape"}: circle, square, diamond, triangle, cross, or none. ${quote(value)} means ${quote(shape)}.`,
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: `${home}/pointShape`, value: shape },
      ],
    });
    return true;
  }
  if (MARK_LABEL_KEYS.includes(name)) {
    const position = typeof value === "string" ? POS_ALIAS[value] ?? (POS_NAMES.has(value) ? value : "") : "";
    const fix: JsonPatchOperation[] = [
      { op: "remove", path: pointer },
      { op: "add", path: home === "/mark" ? "/mark/labels" : `${home}/pointShape`, value: home === "/mark" ? true : "circle" },
    ];
    if (home === "/mark") {
      fix[1] = { op: "add", path: "/mark/labels", value: true };
      if (position) fix.push({ op: "add", path: "/mark/labelPosition", value: position });
    }
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: position ? `labels are mark.labels. ${quote(value)} means on, at ${quote(position)}.` : "labels are mark.labels: true, not a separate key",
      fix: home === "/mark" ? fix : [{ op: "remove", path: pointer }],
    });
    return true;
  }
  if (home === "/mark" && MARK_TOTAL_KEYS.includes(name)) {
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: 'stack totals are mark.stackTotal: true on a stacked bar or stacked area',
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: "/mark/stackTotal", value: true },
      ],
    });
    return true;
  }
  if (home === "/mark" && name === "hollow") {
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: 'hollow markers are mark.pointFill: "hollow"',
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: "/mark/pointFill", value: value === false ? "filled" : "hollow" },
      ],
    });
    return true;
  }
  return false;
}

const NAMES_SHAPE = new Set(["circle", "square", "diamond", "triangle", "cross", "none"]);
const POS_NAMES = new Set(["top", "bottom", "left", "right", "center", "inside", "outside"]);

export function emitUnknownProp(name: string, path: string, props: Record<string, JsonSchema>, ctx: Ctx, value?: unknown): void {
  const pointer = join(path, name);
  if (ctx.skipUnknown.has(pointer)) return;
  if (path === "/layout/facet" && FACET_SCALE_KEYS.has(name.toLowerCase())) {
    const word = scaleWord(value);
    if (word) {
      const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
      const layout = isPlainObject(root.layout) ? root.layout : undefined;
      const facet = layout && isPlainObject(layout.facet) ? layout.facet : undefined;
      const fix: JsonPatchOperation[] = [{ op: "remove", path: pointer }];
      const scales = facet?.scales;
      if (scales === undefined) fix.push({ op: "add", path: "/layout/facet/scales", value: word });
      else if (scales !== "shared" && scales !== "independent") fix.push({ op: "replace", path: "/layout/facet/scales", value: word });
      emit(ctx, {
        code: "CK1009",
        severity: "error",
        message: "shared scales are layout.facet.scales",
        path: pointer,
        hint: 'layout.facet.scales is "shared" or "independent". sharedScale true means "shared" (one y domain).',
        fix,
      });
      return;
    }
  }
  if (axisLimit(name, path, pointer, value, ctx)) return;
  if (markMistake(name, path, pointer, value, ctx)) return;
  if (/^\/mark\/colorRules\/\d+$/.test(path) && (name === "name" || name === "title")) {
    let rule: unknown = ctx.rootValue;
    for (const part of path.slice(1).split("/")) {
      if (rule === null || typeof rule !== "object") {
        rule = undefined;
        break;
      }
      rule = (rule as Record<string, unknown>)[part];
    }
    const hasLabel = isPlainObject(rule) && typeof rule.label === "string" && rule.label.trim() !== "";
    const text = typeof value === "string" && value.trim() ? value : undefined;
    const fix: JsonPatchOperation[] = [{ op: "remove", path: pointer }];
    if (text !== undefined && !hasLabel) fix.push({ op: "add", path: join(path, "label"), value: text });
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: "the legend and tooltip name on a colour rule is label",
      fix,
    });
    return;
  }
  if ((path === "/encoding/y" || /^\/encoding\/y\/\d+$/.test(path)) && (name === "low" || name === "high") && typeof value === "string") {
    const dest = name === "low" ? "lo" : "hi";
    emit(ctx, {
      code: "CK3022",
      severity: "error",
      message: `${quote(name)} on a y series is ${quote(dest)}`,
      path: pointer,
      hint: `Use ${quote(dest)} for the ${name === "low" ? "lower" : "upper"} field of a band.`,
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, dest), value },
      ],
    });
    return;
  }
  if (/^\/axes\/(x|y|y2)$/.test(path) && AXIS_RENAME[name]) {
    const dest = AXIS_RENAME[name];
    let next = value;
    if (dest === "titlePosition" && typeof value === "string" && TITLE_AT[value]) next = TITLE_AT[value];
    if (dest === "titlePosition" && (next === "start" || next === "middle" || next === "left" || next === "right" || next === "top" || next === "bottom")) {
      next = TITLE_AT[String(next)] ?? next;
    }
    if ((dest === "tickLength" || dest === "labelWidth" || dest === "titleRotate") && typeof next !== "number") next = dest === "labelWidth" ? 72 : dest === "titleRotate" ? 0 : 4;
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: `${quote(name)} is ${quote(dest)} on an axis`,
      path: pointer,
      hint: `Use ${quote(dest)} instead of ${quote(name)}.`,
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, dest), value: next },
      ],
    });
    return;
  }
  if ((name === "zIndex" || name === "zindex") && (path === "/encoding/y" || /^\/encoding\/y\/\d+$/.test(path) || /^\/annotations\/\d+$/.test(path))) {
    const next = typeof value === "number" && Number.isFinite(value) ? value : 1;
    emit(ctx, {
      code: "CK3064",
      severity: "error",
      message: "zIndex is z on a series or annotation",
      path: pointer,
      hint: "higher z paints later. Negative z paints an annotation under the marks. Stacked series keep data order.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, "z"), value: next },
      ],
    });
    return;
  }
  if (/^\/axes\/(x|y|y2)$/.test(path) && (name === "minor" || name === "minorTick" || name === "minorGrid")) {
    const next = value === false || value === 0 ? 0 : typeof value === "number" ? Math.max(0, Math.min(8, Math.round(value))) : 1;
    emit(ctx, {
      code: "CK3065",
      severity: "error",
      message: "minor is minorTicks on an axis",
      path: pointer,
      hint: "minorTicks is how many marks sit between major ticks, from 0 to 8.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, "minorTicks"), value: next },
      ],
    });
    return;
  }
  if (/^\/axes\/(x|y|y2)$/.test(path) && (name === "zero" || name === "origin" || name === "axisAtZero")) {
    const next = typeof value === "number" && Number.isFinite(value) ? value : 0;
    emit(ctx, {
      code: "CK3068",
      severity: "error",
      message: "axis zero is crosses",
      path: pointer,
      hint: "axes.x.crosses: 0 draws the x axis through y = 0. axes.y.crosses needs a numeric x.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, "crosses"), value: next },
      ],
    });
    return;
  }
  if (/^\/axes\/(x|y|y2)$/.test(path) && (name === "axisOffset" || name === "offsetPx")) {
    const next = typeof value === "number" && Number.isFinite(value) ? Math.max(-80, Math.min(80, value)) : 8;
    emit(ctx, {
      code: "CK3071",
      severity: "error",
      message: "axisOffset is offset",
      path: pointer,
      hint: "offset shifts the baseline outward in pixels, from -80 to 80.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, "offset"), value: next },
      ],
    });
    return;
  }
  if (path === "/tooltip" && (name === "pinTooltip" || name === "hitSize" || name === "hitRadius")) {
    const dest = name === "pinTooltip" ? "pin" : "hit";
    const next = dest === "pin" ? value !== false : typeof value === "number" ? Math.max(8, Math.min(48, value)) : 18;
    emit(ctx, {
      code: "CK3067",
      severity: "error",
      message: "touch tooltip keys are pin and hit",
      path: pointer,
      hint: "tooltip.pin is tap-to-pin. tooltip.hit is the pixel radius, from 8 to 48.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: join(path, dest), value: next },
      ],
    });
    return;
  }
  if (path === "/animation" && name === "ease") {
    const mapped = value === "linear" ? "linear" : value === "easeInOut" || value === "ease-in-out" ? "ease-in-out" : value === "bounce" || value === "spring" ? "spring" : "ease-out";
    emit(ctx, {
      code: "CK3066",
      severity: "error",
      message: "easing name is not a chartkit curve",
      path: pointer,
      hint: "easing is linear, ease-out, ease-in-out, or spring.",
      fix: [
        { op: "remove", path: pointer },
        { op: "add", path: "/animation/easing", value: mapped },
      ],
    });
    return;
  }
  if (CLICK_KEYS.includes(name)) {
    emit(ctx, {
      code: "CK1002",
      severity: "error",
      message: `unknown property ${quote(name)}`,
      path: pointer,
      hint: "clicks are pointclick, seriesclick, and legendclick events, not spec keys",
      fix: [{ op: "remove", path: pointer }],
    });
    return;
  }
  let hint: string | undefined;
  if (name === "colour") {
    hint = 'did you mean "theme.tokens" or "encoding.color"?';
  } else if (LEGACY_PROPS[name]) {
    hint = `did you mean ${quote(LEGACY_PROPS[name])}?`;
  } else {
    const matches = nearMatches(name, Object.keys(props), name.length <= 4 ? 1 : 3);
    const hinted = suggestHint(matches);
    if (hinted) hint = hinted;
  }
  emit(ctx, {
    code: "CK1002",
    severity: "error",
    message: `unknown property ${quote(name)}`,
    path: pointer,
    hint,
  });
}

/** A composed dashboard carries its data on each view, so the outer spec may omit type, data, encoding, and metric. */
function concatViews(value: unknown): boolean {
  if (!isPlainObject(value) || !isPlainObject(value.layout) || !isPlainObject(value.layout.concat)) return false;
  const views = value.layout.concat.views;
  return Array.isArray(views) && views.length > 0;
}

export function emitMissing(name: string, path: string, parent: Record<string, unknown>, ctx: Ctx): void {
  if (ctx.skipMissing.has(`${path}|${name}`)) return;
  const pointer = name === "a11y" && path === "" ? "/a11y" : path;
  if ((path === "" && name === "a11y") || (path === "/a11y" && name === "alt")) {
    emitAltRequired(ctx);
    return;
  }
  if (path === "" && concatViews(ctx.rootValue) && (name === "type" || name === "data" || name === "encoding" || name === "metric")) return;
  if (path === "" && name === "type") {
    emit(ctx, {
      code: "CK1003",
      severity: "error",
      message: `missing required property ${quote(name)}`,
      path: "",
      hint: `set type to one of: ${validTypeList()}. The chart type goes in type, not mark.`,
    });
    return;
  }
  const type = isPlainObject(ctx.rootValue) && typeof ctx.rootValue.type === "string" ? ctx.rootValue.type : undefined;
  const typeHint = type && (path === "" || path === "/encoding") ? TYPE_REQUIREMENTS[type] : undefined;
  emit(ctx, {
    code: "CK1003",
    severity: "error",
    message: `missing required property ${quote(name)}`,
    path: pointer,
    hint: typeHint ?? (name === "alt" ? "describe the key takeaway in one sentence" : undefined),
    fix: path === "" && name === "version" ? [{ op: "add", path: "/version", value: "1" }] : undefined,
  });
  void parent;
}

export function emitAltRequired(ctx: Ctx): void {
  const summary = suggestAlt(ctx.rootValue);
  const root = isPlainObject(ctx.rootValue) ? ctx.rootValue : {};
  const a11y = root.a11y;
  const fix: JsonPatchOperation[] = isPlainObject(a11y)
    ? [{ op: "add", path: "/a11y/alt", value: summary }]
    : [{ op: "add", path: "/a11y", value: { alt: summary } }];
  emit(ctx, {
    code: "CK1004",
    severity: "error",
    message: "a11y.alt is required",
    path: "/a11y",
    hint: `describe the key takeaway in one sentence; suggested: "${summary}"`,
    fix,
  });
}
