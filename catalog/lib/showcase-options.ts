import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface OptionLink {
  id: string;
  label: string;
}

interface FeatureIndex {
  ids: Set<string>;
  labels: Map<string, string>;
}

let index: FeatureIndex | null = null;

function docsRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..");
}

function features(): FeatureIndex {
  if (index) return index;
  const file = JSON.parse(readFileSync(join(docsRoot(), "public/features.json"), "utf8")) as {
    features: { id: string; label: string }[];
  };
  index = {
    ids: new Set(file.features.map((feature) => feature.id)),
    labels: new Map(file.features.map((feature) => [feature.id, feature.label])),
  };
  return index;
}

function add(ids: Set<string>, id: string) {
  if (features().ids.has(id)) ids.add(id);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatStyle(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (isRecord(value) && typeof value.style === "string") return value.style;
  return null;
}

function noteFormat(ids: Set<string>, value: unknown) {
  const style = formatStyle(value);
  if (style === "compact") add(ids, "format.compact");
  if (style === "percent" || style === "percent-raw" || style === "currency" || style === "number") add(ids, "format.number");
  if (style === "date" || style === "time" || style === "datetime") add(ids, "format.date");
  if (isRecord(value) && typeof value.specifier === "string") add(ids, "tooltip.format");
}

function walkScale(ids: Set<string>, scale: unknown) {
  if (!isRecord(scale)) return;
  if (scale.type === "log") add(ids, "scale.log");
  if (scale.type === "symlog") add(ids, "scale.symlog");
  if (scale.type === "linear") add(ids, "scale.linear");
  if (scale.nice === false) add(ids, "scale.nice");
  if (scale.reverse === true) add(ids, "scale.reverse");
  if (Array.isArray(scale.domain)) add(ids, "scale.domain");
  if (typeof scale.padding === "number" || isRecord(scale.padding) || scale.clamp === true) add(ids, "scale.padding");
  if (scale.type === "sequential" || scale.type === "diverging") add(ids, "scale.color.sequential");
  if (scale.type === "quantize" || scale.type === "threshold") add(ids, "scale.quantize");
  if (scale.type === "sequential" || scale.type === "diverging" || scale.type === "quantize" || scale.type === "threshold") {
    add(ids, "legend.continuous");
  }
}

export function optionById(id: string): OptionLink | null {
  const label = features().labels.get(id);
  return label ? { id, label } : null;
}

/** Feature ids a spec actually sets, limited to rows that exist in features.json. */
export function optionsIn(spec: unknown): OptionLink[] {
  const ids = new Set<string>();
  if (!isRecord(spec)) return [];
  const type = spec.type;
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  if (type === "line") add(ids, "type.line");
  if (type === "bar") add(ids, mark.orientation === "horizontal" ? "type.bar.horizontal" : "type.bar.vertical");
  if (type === "bar" && mark.stack === "stack") add(ids, "type.bar.stacked");
  else if (type === "bar" && (encoding.series || Array.isArray(encoding.y))) add(ids, "type.bar.grouped");
  if (type === "stacked-area") add(ids, mark.stack === "percent" ? "type.area.percent" : "type.area.stacked");
  if (type === "combo") add(ids, "type.combo");
  if (type === "scatter") add(ids, "type.scatter");
  if (type === "kpi") add(ids, "type.kpi");
  if (type === "sparkline") add(ids, "type.sparkline");
  if (type === "bullet") add(ids, "type.bullet");
  if (type === "waterfall") add(ids, "type.bar.waterfall");
  if (type === "pie") add(ids, "type.pie");
  if (type === "area-range") add(ids, "type.area.range");
  if (type === "bar-range") add(ids, "type.bar.range");
  if (type === "errorbar") add(ids, "type.errorbar");
  if (type === "donut") add(ids, "type.donut");
  if (type === "sankey") add(ids, "type.sankey");
  if (type === "histogram") add(ids, "type.histogram");
  if (type === "funnel") add(ids, "type.funnel");
  if (type === "gauge") add(ids, "type.gauge");
  if (type === "progress-ring") add(ids, "type.progress.ring");
  if (type === "treemap") add(ids, "type.treemap");
  if (type === "sunburst") add(ids, "type.sunburst");
  if (type === "venn") add(ids, "type.venn");
  if (type === "radar") add(ids, "type.radar");
  if (type === "radial-bar") add(ids, "type.polar.radialbar");
  if (type === "rose") add(ids, "type.polar.area");
  if (type === "boxplot") add(ids, "type.boxplot");
  if (type === "candlestick") add(ids, "type.candlestick");
  if (type === "mini-area") add(ids, "type.area");
  if (type === "heatmap") add(ids, mark.layout === "calendar" ? "type.heatmap.calendar" : "type.heatmap");
  if (type === "gantt") add(ids, "type.gantt");
  if (type === "timeline") add(ids, "type.timeline");
  if (type === "journey") add(ids, "type.journey");
  if (type === "quadrant") add(ids, "type.quadrant");
  if (mark.glow === true) add(ids, "mark.glow");
  if (mark.sampling === "lttb" || mark.sampling === "minmax" || mark.sampling === "auto") add(ids, "data.decimation");
  if (Array.isArray(mark.palette)) add(ids, "theme.palette");
  if (Array.isArray(mark.colorRules)) add(ids, "mark.color.conditional");
  if (typeof mark.pointShape === "string") add(ids, "mark.point.shape");
  if (typeof mark.pointSize === "number") add(ids, "mark.point.size");
  if (mark.points === "always" || mark.points === "hover" || mark.points === "none") add(ids, "mark.point.visibility");
  if (mark.curve === "monotone") add(ids, "type.line.smooth");
  if (mark.curve === "step" || mark.curve === "step-before" || mark.curve === "step-after") add(ids, "type.line.step");
  if (mark.labels === true || typeof mark.labelEnds === "string" || typeof mark.labelPosition === "string") add(ids, "label.show");
  if ((type === "pie" || type === "donut") && mark.labelPosition === "outside") add(ids, "label.pie");
  else if (typeof mark.labelPosition === "string") add(ids, "label.position");
  if (typeof spec.theme === "string") add(ids, "theme.presets");
  if (typeof spec.locale === "string") add(ids, "format.locale");
  if (typeof spec.timezone === "string") add(ids, "data.timezone");
  if (isRecord(spec.sort)) add(ids, "data.sort");
  if (Array.isArray(spec.transform)) add(ids, "data.transform");
  if (mark.stack === "percent") add(ids, "type.area.percent");
  if (isRecord(spec.legend)) {
    if (spec.legend.values === true) add(ids, "legend.values");
    if (typeof spec.legend.position === "string") add(ids, "legend.position");
    if (spec.legend.interactive === true) add(ids, "legend.interactive");
    if (typeof spec.legend.maxRows === "number") add(ids, "legend.scroll");
    if (typeof spec.legend.symbol === "string" || typeof spec.legend.title === "string") add(ids, "legend.style");
  }
  if (isRecord(spec.interaction)) {
    if (spec.interaction.select === "point" || spec.interaction.select === "series") {
      add(ids, "interaction.select");
      add(ids, "interaction.click");
    }
    if (typeof spec.interaction.zoom === "string" && spec.interaction.zoom !== "none") add(ids, "interaction.zoom");
    if (spec.interaction.pan === true) add(ids, "interaction.pan");
    if (spec.interaction.brush === "x" || spec.interaction.brush === "y" || spec.interaction.brush === true) add(ids, "interaction.brush");
    if (Array.isArray(spec.interaction.export)) {
      add(ids, "export.menu");
      for (const format of spec.interaction.export) {
        if (format === "png" || format === "svg" || format === "csv" || format === "pdf") add(ids, `export.${format}`);
      }
    }
  }
  if (isRecord(spec.size) && isRecord(spec.size.padding)) add(ids, "layout.margin");
  if (isRecord(spec.layout) && spec.layout.coordinate === "polar") add(ids, "layout.polar.coords");
  if (isRecord(spec.animation)) {
    if (typeof spec.animation.duration === "number" || typeof spec.animation.easing === "string") add(ids, "animation.duration");
  }
  if (isRecord(spec.tooltip)) {
    if (spec.tooltip.fields) add(ids, "tooltip.fields");
    if (typeof spec.tooltip.position === "string") add(ids, "tooltip.position");
    if (spec.tooltip.crosshair === true || spec.tooltip.crosshairLabel === true) add(ids, "tooltip.crosshair");
    if (spec.tooltip.mode === "index") add(ids, "tooltip.shared");
    if (typeof spec.tooltip.template === "string") add(ids, "tooltip.format");
    if (spec.tooltip.pin === true || typeof spec.tooltip.hit === "number") add(ids, "tooltip.touch");
    const fields = Array.isArray(spec.tooltip.fields) ? spec.tooltip.fields : [];
    for (const field of fields) if (isRecord(field)) noteFormat(ids, field.format);
  }
  if (isRecord(spec.axes)) {
    for (const [key, axis] of Object.entries(spec.axes)) {
      if (!isRecord(axis)) continue;
      if (typeof axis.title === "string") add(ids, "axis.title");
      if (typeof axis.minorTicks === "number") add(ids, "axis.ticks.minor");
      if (Array.isArray(axis.breaks)) add(ids, "axis.breaks");
      if (typeof axis.offset === "number" || typeof axis.crosses === "number") add(ids, "axis.offset");
      if (typeof axis.rotate === "number") add(ids, "axis.ticks.rotate");
      if (Array.isArray(axis.ticks)) add(ids, "axis.ticks.values");
      if (typeof axis.position === "string") add(ids, "axis.position");
      if (typeof axis.titlePosition === "string") add(ids, "axis.title.position");
      if (typeof axis.labelWidth === "number" || typeof axis.labelLines === "number") add(ids, "axis.ticks.wrap");
      noteFormat(ids, axis.format);
      if (key === "y2") add(ids, "scale.multi");
    }
  }
  const channels = Object.values(encoding);
  for (const channel of channels) {
    const list = Array.isArray(channel) ? channel : [channel];
    for (const item of list) {
      if (!isRecord(item)) continue;
      if (item.axis === "y2") add(ids, "scale.multi");
      if (typeof item.z === "number") add(ids, "mark.zindex");
      if (typeof item.pointShape === "string") add(ids, "mark.point.shape");
      if (typeof item.dash === "string") add(ids, "mark.stroke.dash");
      noteFormat(ids, item.format);
      walkScale(ids, item.scale);
    }
  }
  if (isRecord(spec.metric)) noteFormat(ids, spec.metric.format);
  if (isRecord(spec.axes)) {
    for (const key of ["x", "y", "y2"]) {
      const axis = spec.axes[key];
      if (isRecord(axis) && axis.bands !== undefined) add(ids, "axis.bands");
    }
  }
  if (Array.isArray(spec.annotations)) {
    for (const mark of spec.annotations) {
      if (!isRecord(mark)) continue;
      if (mark.type === "band") add(ids, "annotation.band");
      if (mark.type === "rule" && mark.axis === "y") add(ids, "annotation.line.y");
      if (mark.type === "rule" && mark.axis === "x") add(ids, "annotation.line.x");
      if (mark.type === "text") add(ids, "annotation.text");
      if (mark.type === "trendline") add(ids, "annotation.trendline");
      if (mark.type === "marker") add(ids, "annotation.marker");
      if (mark.type === "regression") add(ids, "type.regression");
      if (typeof mark.labelPosition === "string") add(ids, "annotation.label.position");
      if (typeof mark.dash === "string") add(ids, "annotation.style");
      if (typeof mark.z === "number") add(ids, "mark.zindex");
    }
  }
  if (encoding.color && (type === "bar" || type === "scatter" || type === "pie" || type === "donut")) add(ids, "mark.color.point");
  if (isRecord(encoding.size) || typeof encoding.size === "string") add(ids, "type.bubble");
  if (encoding.volume) add(ids, "type.finance.volume");
  const nested = Array.isArray(spec.data) && spec.data.some((row) => isRecord(row) && Array.isArray(row.children));
  const hierarchyPath = Array.isArray(encoding.path) && encoding.path.length > 0;
  const hierarchyIds = typeof encoding.id === "string" && typeof encoding.parent === "string";
  if ((type === "treemap" || type === "sunburst") && (nested || hierarchyPath || hierarchyIds)) add(ids, "data.hierarchy");
  if (isRecord(spec.a11y) && typeof spec.a11y.alt === "string") add(ids, "a11y.alt");
  if (isRecord(spec.a11y) && typeof spec.a11y.description === "string") add(ids, "a11y.description.long");
  if (isRecord(spec.a11y) && spec.a11y.keyboard === true) add(ids, "a11y.keyboard");
  if (isRecord(spec.a11y) && spec.a11y.dataTable === true) add(ids, "a11y.datatable");
  const labels = features().labels;
  return Array.from(ids).sort().map((id) => ({ id, label: labels.get(id) ?? id }));
}
