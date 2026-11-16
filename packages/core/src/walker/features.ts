import type { JsonPatchOperation } from "../diagnostics";
import { emit, fieldName, isPlainObject, type Ctx } from "./util";
import { aliasFor, CHART_TYPES } from "./chart-type";

const FEATURE_CLICKS = ["click", "onClick", "onPointClick", "onSeriesClick", "onLegendClick", "interactions"];

/**
 * Plausible keys agents invent for features that already have a home.
 * One CK1009 and a JSON Patch per feature, so a retry moves the value instead of deleting it.
 */
export function noteMisplaced(spec: Record<string, unknown>, ctx: Ctx): void {
  const moves: FeatureMove[] = [];
  const layoutBag: Record<string, unknown> | null = isPlainObject(spec.layout) ? null : {};
  const interactionBag: Record<string, unknown> | null = isPlainObject(spec.interaction) ? null : {};

  const layoutOps = new Map<string, JsonPatchOperation>();
  const placedInteraction = new Set<string>();
  const putLayout = (key: string, value: unknown, fix: JsonPatchOperation[]) => {
    if (value === undefined) return;
    if (layoutBag) {
      layoutBag[key] = mergeLayoutValue(layoutBag[key], value);
      return;
    }
    const layout = spec.layout as Record<string, unknown>;
    const existing = layoutOps.get(key);
    const base = existing ? existing.value : layout[key];
    const merged = mergeLayoutValue(base, value);
    if (existing) {
      existing.value = merged;
      return;
    }
    if (JSON.stringify(layout[key]) === JSON.stringify(merged)) return;
    const op: JsonPatchOperation = {
      op: layout[key] === undefined ? "add" : "replace",
      path: `/layout/${key}`,
      value: merged,
    };
    layoutOps.set(key, op);
    fix.push(op);
  };
  const putInteraction = (key: string, value: unknown, fix: JsonPatchOperation[]) => {
    if (placedInteraction.has(key)) return;
    placedInteraction.add(key);
    if (interactionBag) {
      interactionBag[key] = value;
      return;
    }
    const interaction = spec.interaction as Record<string, unknown>;
    if (interaction[key] === undefined) fix.push({ op: "add", path: `/interaction/${key}`, value });
  };

  const facetMove = facetFeature(spec, ctx, putLayout);
  if (facetMove) moves.push(facetMove);
  const concatMove = concatFeature(spec, ctx, putLayout);
  if (concatMove) moves.push(concatMove);
  const breakMove = breakpointFeature(spec, ctx, putLayout);
  if (breakMove) moves.push(breakMove);
  const syncMove = syncFeature(spec, ctx, putInteraction);
  if (syncMove) moves.push(syncMove);
  const navMove = navigatorFeature(spec, ctx, putInteraction);
  if (navMove) moves.push(navMove);
  const drillMove = drillFeature(spec, ctx, putInteraction);
  if (drillMove) moves.push(drillMove);
  const samplingMove = samplingFeature(spec, ctx);
  if (samplingMove) moves.push(samplingMove);
  for (const move of looseFeatures(spec, ctx, putLayout, putInteraction)) moves.push(move);
  const facetType = facetTypeFeature(spec, ctx);
  if (facetType) moves.push(facetType);
  const optionsMove = optionsFeature(spec, ctx, putLayout, putInteraction);
  if (optionsMove) moves.push(optionsMove);

  if (layoutBag && Object.keys(layoutBag).length > 0) {
    moves.find((move) => move.layout)?.fix.unshift({ op: "add", path: "/layout", value: layoutBag });
  }
  if (interactionBag && Object.keys(interactionBag).length > 0) {
    moves.find((move) => move.interaction)?.fix.unshift({ op: "add", path: "/interaction", value: interactionBag });
  }
  for (const move of moves) {
    emit(ctx, {
      code: "CK1009",
      severity: "error",
      message: move.message,
      path: move.path,
      hint: move.hint,
      fix: move.fix.length > 0 ? move.fix : undefined,
    });
  }
}

interface FeatureMove {
  path: string;
  message: string;
  hint: string;
  fix: JsonPatchOperation[];
  layout?: boolean;
  interaction?: boolean;
}

function facetFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const encoding = isPlainObject(spec.encoding) ? spec.encoding : undefined;
  const small = spec.type === "small-multiples";
  if (spec.facet === undefined && encoding?.facet === undefined && !small) return undefined;
  const payload = spec.facet !== undefined ? facetPayload(spec.facet) : encoding?.facet !== undefined ? facetPayload(encoding.facet) : undefined;
  const fix: JsonPatchOperation[] = [];
  if (payload !== undefined) putLayout("facet", payload, fix);
  if (spec.facet !== undefined) {
    ctx.skipUnknown.add("/facet");
    fix.push({ op: "remove", path: "/facet" });
  }
  if (encoding?.facet !== undefined) {
    ctx.skipUnknown.add("/encoding/facet");
    fix.push({ op: "remove", path: "/encoding/facet" });
  }
  return {
    path: spec.facet !== undefined ? "/facet" : encoding?.facet !== undefined ? "/encoding/facet" : "/type",
    message: "small multiples are layout.facet",
    hint: 'A faceted chart keeps its chart type and sets layout.facet: { field }. A top-level facet, encoding.facet, and type "small-multiples" are not the facet.',
    fix,
    layout: true,
  };
}

function facetPayload(value: unknown): unknown {
  if (typeof value === "string" && value) return { field: value };
  if (!isPlainObject(value) || value.scales !== undefined) return value;
  const scales = facetScaleWord(value);
  if (!scales) return value;
  const next: Record<string, unknown> = { ...value, scales };
  for (const key of Object.keys(next)) {
    if (FACET_SCALE_KEYS.has(key.toLowerCase())) delete next[key];
  }
  return next;
}

function concatFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const layout = isPlainObject(spec.layout) ? spec.layout : undefined;
  const options = isPlainObject(spec.options) ? spec.options : undefined;
  const optionLayout = options && isPlainObject(options.layout) ? options.layout : undefined;
  const pairs: [string, unknown][] = [
    ["/charts", spec.charts],
    ["/views", spec.views],
    ["/concat", spec.concat],
    ["/layout/charts", layout?.charts],
    ["/options/charts", options?.charts],
    ["/options/views", options?.views],
    ["/options/concat", options?.concat],
    ["/options/layout/charts", optionLayout?.charts],
    ["/options/layout/concat", optionLayout?.concat],
  ];
  const sources: string[] = [];
  const views: unknown[] = [];
  let foundViews = false;
  for (const [source, raw] of pairs) {
    if (raw === undefined) continue;
    sources.push(source);
    const list = concatViewsOf(raw);
    if (!list) continue;
    foundViews = true;
    for (const view of list) views.push(withViewType(view));
  }
  const dashboard = spec.type === "concat" || spec.type === "dashboard";
  const topFlow = flowOf(spec);
  const direction = topFlow ?? flowOf(spec.concat) ?? flowOf(options?.concat) ?? flowOf(optionLayout?.concat) ?? flowOf(layout);
  if (sources.length === 0 && !direction && !dashboard) return undefined;
  const fix: JsonPatchOperation[] = [];
  const concat: Record<string, unknown> = {};
  if (views.length > 0) concat.views = views;
  if (direction) concat.direction = direction;
  const gap = gapOf(spec.concat) ?? gapOf(options?.concat) ?? gapOf(optionLayout?.concat);
  if (gap !== undefined) concat.gap = gap;
  if (Object.keys(concat).length > 0) putLayout("concat", concat, fix);
  for (const source of sources) {
    ctx.skipUnknown.add(source);
    if (foundViews || source === "/concat" || source.endsWith("/concat")) fix.push({ op: "remove", path: source });
  }
  if (topFlow) {
    ctx.skipUnknown.add("/direction");
    fix.push({ op: "remove", path: "/direction" });
  }
  if (direction && !topFlow && (layout?.direction === "vertical" || layout?.direction === "horizontal")) {
    ctx.explained.add("/layout/direction");
    fix.push({ op: "remove", path: "/layout/direction" });
  }
  if (dashboard) {
    const existing = isPlainObject(layout?.concat) && Array.isArray(layout.concat.views) ? layout.concat.views : [];
    const host = [...existing, ...views]
      .map((view) => (isPlainObject(view) && typeof view.type === "string" ? view.type : ""))
      .find((type) => type && type !== "concat" && type !== "dashboard") ?? "line";
    fix.push({ op: "replace", path: "/type", value: host });
    ctx.skipMissing.add("|type");
    ctx.skipUnknown.add("/type");
  }
  return {
    path: dashboard ? "/type" : sources[0] ?? (topFlow ? "/direction" : "/layout/direction"),
    message: dashboard ? "a dashboard is layout.concat" : "several charts are layout.concat.views",
    hint: 'layout.concat.views is a list of chart specs, each with a type. layout.concat is { views, direction }. direction "vertical" or "horizontal" is layout.concat.direction. type "concat" and type "dashboard" are not chart types. When views is set, the outer spec may omit type. layout.direction is "ltr" or "rtl".',
    fix,
    layout: true,
  };
}

function withViewType(view: unknown): unknown {
  if (!isPlainObject(view)) return view;
  if (typeof view.type === "string" && view.type && view.type !== "concat" && view.type !== "dashboard") return view;
  const mark = typeof view.mark === "string" ? view.mark : undefined;
  const named = mark ? aliasFor(mark, view)?.type ?? ((CHART_TYPES as readonly string[]).includes(mark) ? mark : undefined) : undefined;
  return { ...view, type: named ?? "line" };
}

function viewsPayload(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value;
  if (!isPlainObject(value)) return undefined;
  const views = Object.values(value).filter((item) => isPlainObject(item));
  return views.length > 0 ? views : undefined;
}

function concatViewsOf(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value;
  if (!isPlainObject(value)) return undefined;
  if (Array.isArray(value.views)) return value.views;
  return viewsPayload(value);
}

function flowOf(value: unknown): "vertical" | "horizontal" | undefined {
  if (!isPlainObject(value)) return undefined;
  return value.direction === "vertical" || value.direction === "horizontal" ? value.direction : undefined;
}

function gapOf(value: unknown): number | undefined {
  return isPlainObject(value) && typeof value.gap === "number" ? value.gap : undefined;
}

function concatRest(value: unknown): unknown {
  if (Array.isArray(value)) return undefined;
  if (!isPlainObject(value) || !Object.prototype.hasOwnProperty.call(value, "views")) return value;
  const rest = { ...value };
  delete rest.views;
  return Object.keys(rest).length > 0 ? rest : undefined;
}

function mergeLayoutValue(current: unknown, extra: unknown): unknown {
  if (current === undefined) return extra;
  if (isPlainObject(current) && isPlainObject(extra)) {
    const out: Record<string, unknown> = { ...current };
    for (const [key, item] of Object.entries(extra)) {
      out[key] = key === "views" ? mergeViewLists(out.views, item) : item;
    }
    return out;
  }
  return extra;
}

function mergeViewLists(current: unknown, extra: unknown): unknown[] {
  const first = Array.isArray(current) ? current : [];
  const second = Array.isArray(extra) ? extra : [];
  const seen = new Set(first.map((item) => JSON.stringify(item)));
  const out = [...first];
  for (const item of second) {
    const key = JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export const FACET_SCALE_KEYS = new Set(["sharedscale", "sharedscales", "samescale", "sharescale", "yscale", "scale"]);

export function scaleWord(value: unknown): "shared" | "independent" | undefined {
  if (value === true) return "shared";
  if (value === false) return "independent";
  if (typeof value === "string") {
    const word = value.trim().toLowerCase();
    if (word === "true" || word === "shared" || word === "same" || word === "sync" || word === "locked" || word === "common" || word === "together") return "shared";
    if (word === "false" || word === "independent" || word === "separate") return "independent";
    return undefined;
  }
  if (isPlainObject(value)) {
    if (value.shared === true || value.y === "shared") return "shared";
    if (value.shared === false || value.y === "independent") return "independent";
  }
  return undefined;
}

function facetScaleWord(value: Record<string, unknown>): "shared" | "independent" | undefined {
  for (const [key, item] of Object.entries(value)) {
    if (!FACET_SCALE_KEYS.has(key.toLowerCase())) continue;
    const word = scaleWord(item);
    if (word) return word;
  }
  return undefined;
}

export function isFacetScales(path: string, node: { enum?: unknown[] }): boolean {
  return path.endsWith("/scales") && node.enum?.includes("shared") === true && node.enum.includes("independent") === true;
}

function breakpointFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const legend = spec.legend;
  const rule: Record<string, unknown> = { legend: false };
  const removes: string[] = [];
  if (typeof legend === "string" && isMediaQuery(legend)) {
    const width = mediaWidth(legend);
    if (width !== undefined) rule.maxWidth = width;
    removes.push("/legend");
    ctx.explained.add("/legend");
  } else if (isPlainObject(legend)) {
    for (const [key, value] of Object.entries(legend)) {
      if (key !== "responsive" && !isMediaQuery(value)) continue;
      if (rule.maxWidth === undefined) {
        if (typeof value === "string") {
          const width = mediaWidth(value);
          if (width !== undefined) rule.maxWidth = width;
        } else if (isPlainObject(value) && typeof value.maxWidth === "number" && value.maxWidth > 0) {
          rule.maxWidth = value.maxWidth;
        }
      }
      removes.push(`/legend/${key}`);
      if (key === "responsive") ctx.skipUnknown.add(`/legend/${key}`);
      else ctx.explained.add(`/legend/${key}`);
    }
  }
  if (removes.length === 0) return undefined;
  const fix: JsonPatchOperation[] = [];
  const layout = isPlainObject(spec.layout) ? spec.layout : undefined;
  if (Array.isArray(layout?.breakpoints)) fix.push({ op: "add", path: "/layout/breakpoints/-", value: rule });
  else putLayout("breakpoints", [rule], fix);
  for (const path of removes) fix.push({ op: "remove", path });
  return {
    path: removes[0] ?? "/legend",
    message: "a responsive legend is layout.breakpoints",
    hint: "Hide the legend on a narrow chart with layout.breakpoints: [{ maxWidth, legend: false }]. legend.responsive and media queries are not legend fields.",
    fix,
    layout: true,
  };
}

function isMediaQuery(value: unknown): value is string {
  return typeof value === "string" && /@media|max-width|min-width|maxWidth/i.test(value);
}

function mediaWidth(value: string): number | undefined {
  const match = /max-?width\s*[:=]\s*(\d+(?:\.\d+)?)\s*px/i.exec(value);
  if (!match) return undefined;
  const width = Number(match[1]);
  return Number.isFinite(width) && width > 0 ? width : undefined;
}

function syncFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  if (spec.sync === undefined) return undefined;
  const fix: JsonPatchOperation[] = [];
  const id = syncId(spec.sync);
  if (id) putInteraction("sync", id, fix);
  ctx.skipUnknown.add("/sync");
  fix.push({ op: "remove", path: "/sync" });
  return {
    path: "/sync",
    message: "sync belongs in interaction.sync",
    hint: "interaction.sync is a string group id. Charts with the same id share the crosshair and the x window.",
    fix,
    interaction: true,
  };
}

function syncId(value: unknown): string | undefined {
  if (typeof value === "string" && value) return value;
  if (!isPlainObject(value)) return undefined;
  for (const key of ["group", "id", "key", "name"]) {
    const id = value[key];
    if (typeof id === "string" && id) return id;
  }
  return undefined;
}

function navigatorFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const removes: string[] = [];
  let value: unknown;
  if (asksForOverview(spec.brush)) {
    value = navigatorValue(spec.brush);
    removes.push("/brush");
    ctx.skipUnknown.add("/brush");
  }
  const interaction = isPlainObject(spec.interaction) ? spec.interaction : undefined;
  if (interaction && asksForOverview(interaction.brush)) {
    value ??= navigatorValue(interaction.brush);
    removes.push("/interaction/brush");
    ctx.explained.add("/interaction/brush");
  }
  if (removes.length === 0 || value === undefined) return undefined;
  const fix: JsonPatchOperation[] = [];
  putInteraction("navigator", value, fix);
  for (const path of removes) fix.push({ op: "remove", path });
  return {
    path: removes[0] ?? "/brush",
    message: "an overview brush is interaction.navigator",
    hint: 'interaction.navigator is true or { height }. interaction.brush is "none" or "x" for a range select, not the overview.',
    fix,
    interaction: true,
  };
}

function asksForOverview(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "string") return /overview|navigator|minimap/i.test(value);
  if (!isPlainObject(value)) return false;
  if (value.x === true && value.height === undefined && value.overview === undefined && value.navigator === undefined && value.type === undefined) return false;
  return true;
}

function navigatorValue(value: unknown): unknown {
  if (isPlainObject(value) && typeof value.height === "number") return { height: value.height };
  return true;
}

function drillFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  const found: { path: string; value: unknown; children: Record<string, unknown> }[] = [];
  const consider = (path: string, value: unknown) => {
    const children = childMap(value);
    if (!children) return;
    found.push({ path, value, children });
  };
  for (const key of FEATURE_CLICKS) {
    if (spec[key] !== undefined) consider(`/${key}`, spec[key]);
  }
  const interaction = isPlainObject(spec.interaction) ? spec.interaction : undefined;
  if (interaction) {
    for (const key of FEATURE_CLICKS) {
      if (interaction[key] !== undefined) consider(`/interaction/${key}`, interaction[key]);
    }
  }
  if (found.length === 0) return undefined;
  const children: Record<string, unknown> = {};
  let key: string | undefined;
  for (const item of found) {
    Object.assign(children, item.children);
    if (!key && isPlainObject(item.value) && typeof item.value.key === "string" && item.value.key) key = item.value.key;
  }
  const keyed = keyedDrillChildren(spec, children);
  const drill: Record<string, unknown> = { children: keyed ?? children };
  if (key) drill.key = key;
  const fix: JsonPatchOperation[] = [];
  putInteraction("drilldown", drill, fix);
  for (const item of found) {
    ctx.skipUnknown.add(item.path);
    fix.push({ op: "remove", path: item.path });
  }
  return {
    path: found[0]?.path ?? "/click",
    message: "a child chart is interaction.drilldown",
    hint: "Clicking a category swaps in interaction.drilldown.children, keyed by the clicked x value. click, onClick, and interactions are not spec keys.",
    fix,
    interaction: true,
  };
}

function childMap(value: unknown): Record<string, unknown> | undefined {
  if (!isPlainObject(value)) return undefined;
  if (isPlainObject(value.children)) {
    const children: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value.children)) {
      if (isPlainObject(child)) children[key] = child;
    }
    if (Object.keys(children).length > 0) return children;
  }
  if (typeof value.type === "string" && value.type) {
    const id = typeof value.id === "string" && value.id ? value.id : "detail";
    return { [id]: value };
  }
  const children: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "key") continue;
    if (isPlainObject(child) && typeof child.type === "string") children[key] = child;
  }
  if (Object.keys(children).length > 0) return children;
  if (value.click !== undefined) return childMap(value.click);
  if (value.onClick !== undefined) return childMap(value.onClick);
  return undefined;
}

const DRILL_PLACEHOLDER = new Set(["chart", "child", "spec", "default", "detail", "view", "series", "plot", "item", "graph", "drill", "drilldown"]);

/** Children keyed by the clicked x value, when those values can be read from the data. */
export function keyedDrillChildren(spec: unknown, children: unknown): Record<string, unknown> | undefined {
  if (!isPlainObject(spec)) return undefined;
  const encoding = isPlainObject(spec.encoding) ? spec.encoding : undefined;
  const field = fieldName(encoding?.x);
  if (!field) return undefined;
  const rows = rowsForField(spec.data, field);
  if (!rows) return undefined;
  const seen: string[] = [];
  for (const row of rows) {
    const cell = row[field];
    if (cell == null || cell === "") continue;
    const label = String(cell);
    if (!seen.includes(label)) seen.push(label);
  }
  if (seen.length === 0) return undefined;
  if (!shouldRekeyChildren(children, seen)) return undefined;
  const specs = drillSpecs(children);
  if (!specs) return undefined;
  if (specs.length !== 1 && specs.length !== seen.length) return undefined;
  const keyed: Record<string, unknown> = {};
  for (let i = 0; i < seen.length; i++) keyed[seen[i]] = specs.length === 1 ? specs[0] : specs[i];
  return keyed;
}

function shouldRekeyChildren(children: unknown, categories: string[]): boolean {
  if (Array.isArray(children)) return children.some((item) => isPlainObject(item));
  if (!isPlainObject(children)) return false;
  const keys = Object.keys(children);
  if (keys.length === 0 || keys.every((key) => categories.includes(key))) return false;
  return keys.every((key) => DRILL_PLACEHOLDER.has(key.trim().toLowerCase()));
}

function drillSpecs(children: unknown): Record<string, unknown>[] | undefined {
  const list = Array.isArray(children) ? children : isPlainObject(children) ? Object.values(children) : [];
  const specs = list.filter((item): item is Record<string, unknown> => isPlainObject(item));
  return specs.length > 0 ? specs : undefined;
}

function rowsForField(data: unknown, field: string): Record<string, unknown>[] | undefined {
  if (Array.isArray(data)) {
    const rows = data.filter((item): item is Record<string, unknown> => isPlainObject(item) && field in item);
    return rows.length > 0 ? rows : undefined;
  }
  if (!isPlainObject(data)) return undefined;
  if (isPlainObject(data.columns) && Array.isArray((data.columns as Record<string, unknown>)[field])) {
    const columns = data.columns as Record<string, unknown[]>;
    const list = columns[field];
    return list.map((_, index) => {
      const row: Record<string, unknown> = {};
      for (const [key, column] of Object.entries(columns)) row[key] = Array.isArray(column) ? column[index] : undefined;
      return row;
    });
  }
  for (const value of Object.values(data)) {
    if (!Array.isArray(value)) continue;
    const rows = value.filter((item): item is Record<string, unknown> => isPlainObject(item) && field in item);
    if (rows.length > 0) return rows;
  }
  return undefined;
}

function samplingFeature(spec: Record<string, unknown>, ctx: Ctx): FeatureMove | undefined {
  const top = spec.sampling;
  const data = isPlainObject(spec.data) ? spec.data : undefined;
  const nested = data && data.columns === undefined ? data.sampling : undefined;
  if (top === undefined && nested === undefined) return undefined;
  const value = top !== undefined ? top : nested;
  const fix: JsonPatchOperation[] = [];
  const mark = isPlainObject(spec.mark) ? spec.mark : undefined;
  if (!mark) fix.push({ op: "add", path: "/mark", value: { sampling: value } });
  else if (mark.sampling === undefined) fix.push({ op: "add", path: "/mark/sampling", value });
  if (top !== undefined) {
    ctx.skipUnknown.add("/sampling");
    fix.push({ op: "remove", path: "/sampling" });
  }
  if (nested !== undefined && data) {
    fix.push({ op: "remove", path: "/data/sampling" });
  }
  return {
    path: top !== undefined ? "/sampling" : "/data/sampling",
    message: "sampling belongs in mark.sampling",
    hint: 'mark.sampling is "lttb", "minmax", "auto", or "none". A top-level sampling and data.sampling on a row object move there. A columnar table may still set data.sampling.',
    fix,
  };
}

function looseFeatures(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove[] {
  const moves: FeatureMove[] = [];
  if (spec.navigator !== undefined) {
    const fix: JsonPatchOperation[] = [];
    const value = typeof spec.navigator === "boolean" ? spec.navigator : navigatorValue(spec.navigator);
    putInteraction("navigator", value, fix);
    ctx.skipUnknown.add("/navigator");
    fix.push({ op: "remove", path: "/navigator" });
    moves.push({
      path: "/navigator",
      message: "navigator belongs in interaction.navigator",
      hint: 'interaction.navigator is true or { height }. It is not a top-level key.',
      fix,
      interaction: true,
    });
  }
  if (spec.drilldown !== undefined) {
    const fix: JsonPatchOperation[] = [];
    putInteraction("drilldown", drillPayload(spec, spec.drilldown), fix);
    ctx.skipUnknown.add("/drilldown");
    fix.push({ op: "remove", path: "/drilldown" });
    moves.push({
      path: "/drilldown",
      message: "drilldown belongs in interaction.drilldown",
      hint: "interaction.drilldown.children is keyed by the clicked x value. drilldown is not a top-level key.",
      fix,
      interaction: true,
    });
  }
  if (spec.breakpoints !== undefined) {
    const fix: JsonPatchOperation[] = [];
    putLayout("breakpoints", spec.breakpoints, fix);
    ctx.skipUnknown.add("/breakpoints");
    fix.push({ op: "remove", path: "/breakpoints" });
    moves.push({
      path: "/breakpoints",
      message: "breakpoints belong in layout.breakpoints",
      hint: "Hide the legend on a narrow chart with layout.breakpoints: [{ maxWidth, legend: false }].",
      fix,
      layout: true,
    });
  }
  if (spec.rtl !== undefined) {
    const fix: JsonPatchOperation[] = [];
    putLayout("direction", spec.rtl === false || spec.rtl === "ltr" ? "ltr" : "rtl", fix);
    ctx.skipUnknown.add("/rtl");
    fix.push({ op: "remove", path: "/rtl" });
    moves.push({
      path: "/rtl",
      message: "rtl belongs in layout.direction",
      hint: 'Right to left is layout.direction: "rtl". rtl: true is not a spec key.',
      fix,
      layout: true,
    });
  }
  if (typeof spec.direction === "string" && (spec.direction === "rtl" || spec.direction === "ltr")) {
    const fix: JsonPatchOperation[] = [];
    putLayout("direction", spec.direction, fix);
    ctx.skipUnknown.add("/direction");
    fix.push({ op: "remove", path: "/direction" });
    moves.push({
      path: "/direction",
      message: "direction belongs in layout.direction",
      hint: 'layout.direction is "ltr" or "rtl". "vertical" and "horizontal" are layout.concat.direction.',
      fix,
      layout: true,
    });
  }
  return moves;
}

function drillPayload(spec: Record<string, unknown>, value: unknown): unknown {
  if (Array.isArray(value)) {
    const keyed = keyedDrillChildren(spec, value);
    return { children: keyed ?? {} };
  }
  if (!isPlainObject(value)) return { children: {} };
  if (value.children !== undefined || typeof value.key === "string") {
    const keyed = keyedDrillChildren(spec, value.children);
    return keyed ? { ...value, children: keyed } : value;
  }
  if (typeof value.type === "string") {
    const keyed = keyedDrillChildren(spec, [value]);
    return { children: keyed ?? { detail: value } };
  }
  const keyed = keyedDrillChildren(spec, value);
  return { children: keyed ?? value };
}

function facetTypeFeature(spec: Record<string, unknown>, ctx: Ctx): FeatureMove | undefined {
  const layout = isPlainObject(spec.layout) ? spec.layout : undefined;
  const facet = layout && isPlainObject(layout.facet) ? layout.facet : undefined;
  if (!facet || typeof facet.type !== "string" || facet.type === "") return undefined;
  const named = aliasFor(facet.type, spec)?.type ?? facet.type;
  const fix: JsonPatchOperation[] = [];
  if (spec.type !== named) fix.push({ op: typeof spec.type === "string" ? "replace" : "add", path: "/type", value: named });
  ctx.skipUnknown.add("/layout/facet/type");
  fix.push({ op: "remove", path: "/layout/facet/type" });
  ctx.skipMissing.add("|type");
  return {
    path: "/layout/facet/type",
    message: "the chart type belongs on the spec",
    hint: "layout.facet sets field and columns. Move layout.facet.type to the spec's top-level type.",
    fix,
  };
}

function optionsFeature(
  spec: Record<string, unknown>,
  ctx: Ctx,
  putLayout: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
  putInteraction: (key: string, value: unknown, fix: JsonPatchOperation[]) => void,
): FeatureMove | undefined {
  if (!isPlainObject(spec.options)) return undefined;
  const options = spec.options;
  const fix: JsonPatchOperation[] = [];
  const take = (key: string): unknown => {
    if (options[key] === undefined) return undefined;
    ctx.skipUnknown.add(`/options/${key}`);
    return options[key];
  };
  const interaction = isPlainObject(options.interaction) ? options.interaction : undefined;
  if (interaction) {
    ctx.skipUnknown.add("/options/interaction");
    if (interaction.navigator !== undefined) putInteraction("navigator", typeof interaction.navigator === "boolean" ? interaction.navigator : navigatorValue(interaction.navigator), fix);
    if (interaction.drilldown !== undefined) putInteraction("drilldown", drillPayload(spec, interaction.drilldown), fix);
    const id = interaction.sync !== undefined ? syncId(interaction.sync) : undefined;
    if (id) putInteraction("sync", id, fix);
  }
  const layout = isPlainObject(options.layout) ? options.layout : undefined;
  if (layout) {
    ctx.skipUnknown.add("/options/layout");
    if (layout.facet !== undefined) putLayout("facet", facetPayload(layout.facet), fix);
    if (layout.concat !== undefined) putLayout("concat", concatRest(layout.concat), fix);
    if (layout.breakpoints !== undefined) putLayout("breakpoints", layout.breakpoints, fix);
    if (layout.direction === "ltr" || layout.direction === "rtl") putLayout("direction", layout.direction, fix);
  }
  const navigator = take("navigator");
  if (navigator !== undefined) putInteraction("navigator", typeof navigator === "boolean" ? navigator : navigatorValue(navigator), fix);
  const drilldown = take("drilldown");
  if (drilldown !== undefined) putInteraction("drilldown", drillPayload(spec, drilldown), fix);
  const sync = take("sync");
  if (sync !== undefined) {
    const id = syncId(sync);
    if (id) putInteraction("sync", id, fix);
  }
  const breakpoints = take("breakpoints");
  if (breakpoints !== undefined) putLayout("breakpoints", breakpoints, fix);
  const facet = take("facet");
  if (facet !== undefined) putLayout("facet", facetPayload(facet), fix);
  let concat = take("concat");
  const direction = take("direction");
  if (direction === "ltr" || direction === "rtl") putLayout("direction", direction, fix);
  else if (direction === "horizontal" || direction === "vertical") {
    concat = isPlainObject(concat) ? { ...concat, direction } : concat !== undefined ? { views: concat, direction } : { direction };
  }
  if (concat !== undefined) putLayout("concat", concatRest(concat), fix);
  const rtl = take("rtl");
  if (rtl !== undefined) putLayout("direction", rtl === false || rtl === "ltr" ? "ltr" : "rtl", fix);
  const sampling = take("sampling");
  const dataSampling = isPlainObject(spec.data) && spec.data.columns === undefined && spec.data.sampling !== undefined;
  if (sampling !== undefined && spec.sampling === undefined && !dataSampling) {
    const mark = isPlainObject(spec.mark) ? spec.mark : undefined;
    if (!mark) fix.push({ op: "add", path: "/mark", value: { sampling } });
    else if (mark.sampling === undefined) fix.push({ op: "add", path: "/mark/sampling", value: sampling });
  }
  const renderMode = take("render");
  if ((renderMode === "svg" || renderMode === "canvas" || renderMode === "auto") && spec.render === undefined) {
    fix.push({ op: "add", path: "/render", value: renderMode });
  }
  ctx.skipUnknown.add("/options");
  fix.push({ op: "remove", path: "/options" });
  return {
    path: "/options",
    message: "options unwraps onto interaction, layout, and mark",
    hint: "There is no options object. interaction holds navigator, sync, and drilldown. layout holds facet, concat, breakpoints, and direction. mark.sampling and render sit on the spec.",
    fix,
    layout: true,
    interaction: true,
  };
}
