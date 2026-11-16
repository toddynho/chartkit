import type { Diagnostic, JsonPatchOperation } from "../diagnostics";
import type { DataTable } from "../data";
import { CANVAS_AT, CANVAS_TYPES, pointCount, readRender } from "../render-mode";
import { keyedDrillChildren } from "../walker";
import { fieldName, isRecord, knownFields, pointerToken } from "./util";

const SAMPLED = new Set(["line", "stacked-area", "sparkline", "mini-area", "spike", "combo"]);

/** Charts whose x axis is a window the overview can slide. */
const NAV = new Set(["line", "bar", "stacked-area", "scatter", "combo", "candlestick", "area-range", "sparkline", "mini-area", "spike"]);

/** Navigator, sync group, and drilldown. Warnings carry a JSON Patch. */
export function warnInteraction(spec: Record<string, unknown>, type: string, table: DataTable | undefined, diagnostics: Diagnostic[]): void {
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
export function warnLayout(spec: Record<string, unknown>, table: DataTable | undefined, diagnostics: Diagnostic[]): void {
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
export function warnCanvas(spec: Record<string, unknown>, type: string, count: number, diagnostics: Diagnostic[]): void {
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
