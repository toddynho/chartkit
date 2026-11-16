/**
 * Detects a config written for another library (Chart.js, ECharts, Plotly, Vega-Lite, Recharts)
 * or a ChartKit spec wrapped in `{ spec: {...} }`. Only this detector ships in the validate entry.
 * The converters, the misplaced-key fixes, and the lenient parser load on demand from
 * `@chartkitdev/core/validate/convert` when `repairAsync()` needs them.
 */
export type Rec = Record<string, unknown>;

export const WRAPPERS = ["spec", "chart", "chartSpec", "chartkit", "config"];
export const CHARTJS_TYPES = ["bar", "horizontalBar", "line", "pie", "doughnut", "radar", "polarArea", "scatter", "bubble"];
export const RECHARTS_SERIES = ["bars", "lines", "areas", "Bar", "Line", "Area", "series", "dataKeys"];

/**
 * Which other library's config this is, if any. Each test is the guard of its converter in
 * validate/convert, so a detected spec always gets a conversion or a reason it has none.
 */
export function foreignKind(spec: unknown): string | undefined {
  if (!isRec(spec)) return undefined;
  const keys = Object.keys(spec).filter((key) => key !== "version" && key !== "$schema");
  if (keys.length === 1 && WRAPPERS.includes(keys[0]) && isRec(spec[keys[0]])) return `wrapped (${keys[0]})`;
  const data = spec.data;
  if (isRec(data) && Array.isArray(data.datasets) && (spec.type === undefined || (typeof spec.type === "string" && CHARTJS_TYPES.includes(spec.type)))) return "Chart.js";
  const series = Array.isArray(spec.series) ? spec.series.filter(isRec) : isRec(spec.series) ? [spec.series] : undefined;
  if (series?.length && !series.some((item) => "dataKey" in item) && series.some((item) => typeof item.type === "string" || Array.isArray(item.data)) && !(Array.isArray(data) && isRec(spec.encoding))) return "ECharts";
  if (typeof spec.type !== "string" && Array.isArray(data) && data.length && data.every((trace) => isRec(trace) && (Array.isArray(trace.y) || Array.isArray(trace.values)))) return "Plotly";
  if (spec.layer === undefined && ((isRec(spec.mark) && typeof spec.mark.type === "string") || (typeof spec.$schema === "string" && /vega/i.test(spec.$schema)))) return "Vega-Lite";
  if (Array.isArray(data) && spec.encoding === undefined) {
    const named = RECHARTS_SERIES.some((key) => {
      const raw = spec[key];
      const items = Array.isArray(raw) ? raw : raw !== undefined ? [raw] : [];
      return items.some((item) => (isRec(item) && typeof item.dataKey === "string") || (key === "dataKeys" && typeof item === "string"));
    });
    const xRec = first(spec.xAxis) ?? first(spec.XAxis);
    const dataKey = typeof spec.dataKey === "string";
    if ((named || dataKey) && (xRec || dataKey || typeof spec.nameKey === "string")) return "Recharts";
  }
  return undefined;
}

export function first(value: unknown): Rec | undefined {
  if (Array.isArray(value)) return isRec(value[0]) ? value[0] : undefined;
  return isRec(value) ? value : undefined;
}

export function isRec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
