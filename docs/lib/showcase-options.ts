import { readFileSync } from "node:fs";
import { join } from "node:path";

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
  const cwd = process.cwd();
  return cwd.endsWith(`${join("docs")}`) || cwd.endsWith("/docs") ? cwd : join(cwd, "docs");
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
}

function walkScale(ids: Set<string>, scale: unknown) {
  if (!isRecord(scale)) return;
  if (scale.type === "log") add(ids, "scale.log");
  if (scale.type === "linear") add(ids, "scale.linear");
  if (scale.nice === false) add(ids, "scale.nice");
  if (scale.reverse === true) add(ids, "scale.reverse");
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
  if (type === "bar" && (encoding.series || encoding.color || Array.isArray(encoding.y))) add(ids, "type.bar.grouped");
  if (type === "stacked-area") add(ids, mark.stack === "percent" ? "type.area.percent" : "type.area.stacked");
  if (type === "combo") add(ids, "type.combo");
  if (type === "scatter") add(ids, "type.scatter");
  if (type === "kpi") add(ids, "type.kpi");
  if (type === "sparkline") add(ids, "type.sparkline");
  if (type === "bullet") add(ids, "type.bullet");
  if (type === "waterfall") add(ids, "type.bar.waterfall");
  if (type === "pie") add(ids, "type.pie");
  if (type === "donut") add(ids, "type.donut");
  if (type === "sankey") add(ids, "type.sankey");
  if (type === "histogram") add(ids, "type.histogram");
  if (type === "funnel") add(ids, "type.funnel");
  if (type === "gauge") add(ids, "type.gauge");
  if (type === "progress-ring") add(ids, "type.progress.ring");
  if (type === "treemap") add(ids, "type.treemap");
  if (type === "venn") add(ids, "type.venn");
  if (type === "radar") add(ids, "type.radar");
  if (type === "heatmap") add(ids, mark.layout === "calendar" ? "type.heatmap.calendar" : "type.heatmap");
  if (type === "gantt") add(ids, "type.gantt");
  if (type === "timeline") add(ids, "type.timeline");
  if (type === "journey") add(ids, "type.journey");
  if (type === "quadrant") add(ids, "type.quadrant");
  if (mark.glow === true) add(ids, "mark.glow");
  if (mark.sampling === "lttb" || mark.sampling === "minmax" || mark.sampling === "auto") add(ids, "data.decimation");
  if (Array.isArray(mark.palette)) add(ids, "theme.palette");
  if (typeof mark.labelPosition === "string") {
    add(ids, "label.position");
    if (type === "pie" || type === "donut") add(ids, "label.pie");
  }
  if (typeof spec.theme === "string") add(ids, "theme.presets");
  if (typeof spec.locale === "string") add(ids, "format.locale");
  if (mark.labels === true) add(ids, "label.show");
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
  if (isRecord(spec.tooltip)) {
    if (spec.tooltip.fields) add(ids, "tooltip.fields");
    if (typeof spec.tooltip.position === "string") add(ids, "tooltip.position");
    if (spec.tooltip.crosshair === true || spec.tooltip.crosshairLabel === true) add(ids, "tooltip.crosshair");
    if (spec.tooltip.mode === "index") add(ids, "tooltip.shared");
    const fields = Array.isArray(spec.tooltip.fields) ? spec.tooltip.fields : [];
    for (const field of fields) if (isRecord(field)) noteFormat(ids, field.format);
  }
  if (isRecord(spec.axes)) {
    for (const [key, axis] of Object.entries(spec.axes)) {
      if (!isRecord(axis)) continue;
      if (typeof axis.title === "string") add(ids, "axis.title");
      if (typeof axis.rotate === "number") add(ids, "axis.ticks.rotate");
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
      noteFormat(ids, item.format);
      walkScale(ids, item.scale);
    }
  }
  if (isRecord(spec.metric)) noteFormat(ids, spec.metric.format);
  if (Array.isArray(spec.annotations)) {
    for (const mark of spec.annotations) {
      if (!isRecord(mark)) continue;
      if (mark.type === "band") add(ids, "annotation.band");
      if (mark.type === "rule" && mark.axis === "y") add(ids, "annotation.line.y");
      if (mark.type === "rule" && mark.axis === "x") add(ids, "annotation.line.x");
      if (mark.type === "text") add(ids, "annotation.text");
      if (typeof mark.labelPosition === "string") add(ids, "annotation.label.position");
      if (typeof mark.dash === "string") add(ids, "annotation.style");
    }
  }
  if (isRecord(spec.a11y) && typeof spec.a11y.alt === "string") add(ids, "a11y.alt");
  const labels = features().labels;
  return Array.from(ids).sort().map((id) => ({ id, label: labels.get(id) ?? id }));
}
