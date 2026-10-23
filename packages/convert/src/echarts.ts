import { parseLiteral } from "./literal";
import {
  altText,
  colorOf,
  finish,
  isDropped,
  isRecord,
  num,
  text,
  stackName,
  uniqueSlug,
  Used,
  warn,
  type ConvertResult,
  type ConvertWarning,
} from "./model";

const TYPES = new Set(["line", "bar", "pie", "scatter"]);

export function fromECharts(input: unknown): ConvertResult {
  const warnings: ConvertWarning[] = [];
  const mapped: string[] = [];
  let value = input;
  if (typeof input === "string") {
    const parsed = parseLiteral(input);
    warnings.push(...parsed.warnings);
    value = parsed.value;
  }
  if (!isRecord(value)) {
    warnings.push(warn("CK8103", "ECharts input is not an object.", ""));
    return finish(null, warnings, "echarts", mapped);
  }
  const used = new Used();
  used.mark("");
  const series = Array.isArray(value.series) ? value.series.filter(isRecord) : [];
  used.mark("/series");
  if (!series.length) {
    warnings.push(warn("CK8101", "ECharts option has no series.", "/series"));
    used.unread(value, "", warnings);
    return finish(null, warnings, "echarts", mapped);
  }
  const kinds = series.map((item) => text(item.type) || "line");
  const bad = kinds.find((item) => !TYPES.has(item));
  if (bad) {
    warnings.push(warn("CK8101", `ECharts series type “${bad}” is not converted.`, "/series"));
    used.unread(value, "", warnings);
    return finish(null, warnings, "echarts", mapped);
  }

  const title = isRecord(value.title) ? text(value.title.text) : undefined;
  if (value.title != null) {
    used.mark("/title");
    if (isRecord(value.title)) used.mark("/title/text");
  }
  const legend = readLegend(value.legend, used);
  const tooltip = readTooltip(value.tooltip, used);
  const xAxis = isRecord(value.xAxis) ? value.xAxis : Array.isArray(value.xAxis) && isRecord(value.xAxis[0]) ? value.xAxis[0] : {};
  const yAxis = isRecord(value.yAxis) ? value.yAxis : Array.isArray(value.yAxis) && isRecord(value.yAxis[0]) ? value.yAxis[0] : {};
  if (value.xAxis != null) used.mark("/xAxis");
  if (value.yAxis != null) used.mark("/yAxis");
  const labels = Array.isArray(xAxis.data) ? xAxis.data.map((item) => String(item)) : [];
  if (xAxis.data != null) used.mark("/xAxis/data");
  if (text(xAxis.name)) used.mark("/xAxis/name");
  if (text(yAxis.name)) used.mark("/yAxis/name");
  noteAxisType(xAxis, "/xAxis", used, warnings);
  noteAxisType(yAxis, "/yAxis", used, warnings);
  if (yAxis.min != null) used.mark("/yAxis/min");
  if (yAxis.max != null) used.mark("/yAxis/max");

  const pie = kinds.every((item) => item === "pie");
  const scatter = kinds.every((item) => item === "scatter");
  let spec: Record<string, unknown>;
  if (pie) {
    spec = pieSpec(series[0], title, used, warnings);
    const donut = Array.isArray(series[0]?.radius) && series[0].radius.length >= 2;
    if (series[0] && "radius" in series[0]) used.mark("/series/0/radius");
    mapped.push(donut ? "donut" : "pie");
    if (series.length > 1) warnings.push(warn("CK8104", "Only the first pie series is kept.", "/series"));
  } else if (scatter) {
    spec = scatterSpec(series, title, used, warnings);
    mapped.push(series.some((item) => item.symbolSize != null) ? "bubble" : "scatter");
  } else {
    const mixed = new Set(kinds).size > 1;
    const stacked = series.some((item) => item.stack != null);
    const allStacked = series.every((item) => item.stack != null);
    const area = series.some((item) => item.areaStyle != null);
    const type = mixed ? "combo" : kinds[0] === "bar" ? "bar" : allStacked && area ? "stacked-area" : stacked ? "combo" : "line";
    spec = cartesianSpec(labels, series, kinds, title, type, used, warnings);
    if (type === "bar" && stacked) {
      const ids = new Set(series.map((item) => stackName(item.stack)).filter(Boolean));
      if (allStacked && ids.size <= 1) spec.mark = { ...(isRecord(spec.mark) ? spec.mark : {}), stack: "stack" };
      mapped.push(!allStacked || ids.size > 1 ? "grouped stacks" : "bar stacked");
    } else if (type === "bar") mapped.push(series.length > 1 ? "bar grouped" : "bar");
    else if (type === "stacked-area") mapped.push("stacked area");
    else if (type === "combo") mapped.push("combo");
    else mapped.push(area ? "area" : "line");
  }

  if (title) {
    spec.title = title;
    mapped.push("title");
  }
  if (legend) {
    spec.legend = legend;
    mapped.push("legend");
  }
  if (tooltip) {
    spec.tooltip = tooltip;
    mapped.push("tooltip");
  }
  const axes: Record<string, unknown> = {};
  if (text(xAxis.name)) axes.x = { title: text(xAxis.name) };
  if (text(yAxis.name)) axes.y = { title: text(yAxis.name) };
  if (Object.keys(axes).length) {
    spec.axes = axes;
    mapped.push("axes");
  }
  const yMin = num(yAxis.min);
  const yMax = num(yAxis.max);
  if (yMin != null || yMax != null) applyDomain(spec, yMin, yMax);

  used.unread(value, "", warnings);
  return finish(spec, warnings, "echarts", mapped);
}

function pieSpec(series: Record<string, unknown> | undefined, title: string | undefined, used: Used, warnings: ConvertWarning[]): Record<string, unknown> {
  const data = Array.isArray(series?.data) ? series.data : [];
  used.mark("/series/0/type");
  used.mark("/series/0/data");
  used.mark("/series/0/name");
  const rows = data.map((item) => {
    if (isRecord(item)) return { label: String(item.name ?? ""), value: num(item.value) ?? 0 };
    return { label: "", value: num(item) ?? 0 };
  });
  const colors = data.map((item) => (isRecord(item) && isRecord(item.itemStyle) ? colorOf(item.itemStyle.color, warnings, "/series/0/data") : undefined));
  const encoding: Record<string, unknown> = { x: "label", y: "value" };
  const paint = colors.filter((item): item is string => Boolean(item));
  if (paint.length >= 2) encoding.color = { field: "label", domain: rows.map((row) => row.label), range: paint };
  const donut = Array.isArray(series?.radius) && series.radius.length >= 2;
  return {
    version: "1",
    type: donut ? "donut" : "pie",
    ...(title ? { title } : {}),
    data: rows,
    encoding,
    a11y: { alt: altText(title, `${rows[0]?.label || "The first slice"} leads.`) },
  };
}

function scatterSpec(series: Record<string, unknown>[], title: string | undefined, used: Used, warnings: ConvertWarning[]): Record<string, unknown> {
  const rows: Record<string, unknown>[] = [];
  let sized = false;
  series.forEach((item, index) => {
    used.mark(`/series/${index}/type`);
    used.mark(`/series/${index}/data`);
    used.mark(`/series/${index}/name`);
    const name = text(item.name) || `Series ${index + 1}`;
    const color = isRecord(item.itemStyle) ? colorOf(item.itemStyle.color, warnings, `/series/${index}/itemStyle/color`) : undefined;
    if (item.itemStyle != null) used.mark(`/series/${index}/itemStyle`);
    const points = Array.isArray(item.data) ? item.data : [];
    const symbol = item.symbolSize;
    if (symbol != null) used.mark(`/series/${index}/symbolSize`);
    points.forEach((point) => {
      const pair = Array.isArray(point) ? point : isRecord(point) && Array.isArray(point.value) ? point.value : null;
      if (!pair) return;
      const row: Record<string, unknown> = { x: num(pair[0]) ?? pair[0], y: num(pair[1]) ?? pair[1], series: name };
      const radius = Array.isArray(symbol) ? num(symbol[0]) : num(pair[2] ?? symbol);
      if (radius != null) {
        row.size = radius;
        sized = true;
      }
      if (color) row.color = color;
      rows.push(row);
    });
    if (typeof symbol === "function" || isDropped(symbol)) {
      warnings.push(warn("CK8102", "Dropped a symbolSize function.", `/series/${index}/symbolSize`));
    }
  });
  if (sized && series.length > 1) warnings.push(warn("CK8104", "Bubble size is one field shared by every series.", "/series"));
  return {
    version: "1",
    type: "scatter",
    ...(title ? { title } : {}),
    data: rows,
    encoding: { x: "x", y: "y", series: "series", ...(sized ? { size: "size" } : {}) },
    a11y: { alt: altText(title, "Points are plotted on x and y.") },
  };
}

function cartesianSpec(
  labels: string[],
  series: Record<string, unknown>[],
  kinds: string[],
  title: string | undefined,
  type: string,
  used: Used,
  warnings: ConvertWarning[],
): Record<string, unknown> {
  const taken = new Set<string>(["cat"]);
  const rows = labels.map((label) => ({ cat: label }) as Record<string, unknown>);
  const channels: Record<string, unknown>[] = [];
  const annotations: Record<string, unknown>[] = [];
  series.forEach((item, index) => {
    const name = text(item.name) || `Series ${index + 1}`;
    const field = uniqueSlug(name, index, taken);
    used.mark(`/series/${index}/name`);
    used.mark(`/series/${index}/type`);
    used.mark(`/series/${index}/data`);
    if (item.stack != null) used.mark(`/series/${index}/stack`);
    if (item.areaStyle != null) used.mark(`/series/${index}/areaStyle`);
    if (item.smooth != null) used.mark(`/series/${index}/smooth`);
    if (item.yAxisIndex != null) used.mark(`/series/${index}/yAxisIndex`);
    const values = Array.isArray(item.data) ? item.data : [];
    if (!labels.length) {
      values.forEach((_, row) => {
        if (!rows[row]) rows[row] = { cat: String(row + 1) };
      });
    }
    values.forEach((cell, row) => {
      if (!rows[row]) rows[row] = { cat: labels[row] ?? String(row + 1) };
      const raw = isRecord(cell) ? cell.value : cell;
      rows[row][field] = num(raw);
    });
    const channel: Record<string, unknown> = { field, title: name };
    const stack = stackName(item.stack);
    if (stack) channel.stack = stack;
    if (type === "combo") channel.mark = kinds[index] === "bar" ? "bar" : "line";
    if (kinds[index] === "line" && item.areaStyle != null) channel.area = true;
    const color = seriesColor(item, index, used, warnings);
    if (color) channel.color = color;
    if (num(item.yAxisIndex) === 1) channel.axis = "y2";
    channels.push(channel);
    readMark(item.markLine, annotations, used, `/series/${index}/markLine`, "rule");
    readMark(item.markArea, annotations, used, `/series/${index}/markArea`, "band");
  });
  const smooth = series.some((item) => item.smooth === true);
  const spec: Record<string, unknown> = {
    version: "1",
    type,
    ...(title ? { title } : {}),
    data: rows,
    encoding: { x: "cat", y: channels.length === 1 ? channels[0] : channels },
    a11y: { alt: altText(title, `${text(channels[0]?.title) || "The series"} is plotted.`) },
  };
  if (smooth) spec.mark = { curve: "monotone" };
  if (annotations.length) spec.annotations = annotations;
  return spec;
}

function readMark(value: unknown, annotations: Record<string, unknown>[], used: Used, path: string, kind: "rule" | "band"): void {
  if (!isRecord(value) || !Array.isArray(value.data)) return;
  used.mark(path);
  used.mark(`${path}/data`);
  for (const item of value.data) {
    if (!isRecord(item)) continue;
    if (kind === "rule") {
      const y = num(item.yAxis);
      const x = item.xAxis != null ? item.xAxis : null;
      if (y == null && x == null) continue;
      annotations.push({
        type: "rule",
        axis: y != null ? "y" : "x",
        value: y != null ? y : x,
        ...(text(item.name) ? { label: text(item.name) } : {}),
      });
    } else if (Array.isArray(item) && item.length >= 2 && isRecord(item[0]) && isRecord(item[1])) {
      const from = num(item[0].yAxis);
      const to = num(item[1].yAxis);
      if (from == null || to == null) continue;
      annotations.push({ type: "band", axis: "y", from, to });
    }
  }
}

function readLegend(value: unknown, used: Used): Record<string, unknown> | false | undefined {
  if (value == null) return undefined;
  used.mark("/legend");
  if (value === false) return false;
  if (!isRecord(value)) return { show: true };
  used.mark("/legend/show");
  used.mark("/legend/orient");
  if (value.show === false) return false;
  const orient = text(value.orient);
  return orient === "vertical" || orient === "horizontal" ? { orient } : { show: true };
}

function readTooltip(value: unknown, used: Used): Record<string, unknown> | false | undefined {
  if (value == null) return undefined;
  used.mark("/tooltip");
  if (value === false) return false;
  if (!isRecord(value)) return { show: true };
  used.mark("/tooltip/show");
  used.mark("/tooltip/trigger");
  if (value.show === false) return false;
  const trigger = text(value.trigger);
  if (trigger === "axis") return { mode: "index" };
  if (trigger === "item") return { mode: "nearest" };
  return { show: true };
}

function noteAxisType(node: Record<string, unknown>, path: string, used: Used, warnings: ConvertWarning[]): void {
  if (node.type == null) return;
  used.mark(`${path}/type`);
  const kind = text(node.type);
  if (kind === "category" || kind === "value") return;
  warnings.push(warn("CK8104", `${path} type ${kind ?? "value"} is not a ChartKit scale.`, `${path}/type`));
}

function seriesColor(item: Record<string, unknown>, index: number, used: Used, warnings: ConvertWarning[]): string | undefined {
  const itemStyle = isRecord(item.itemStyle) ? item.itemStyle : null;
  const lineStyle = isRecord(item.lineStyle) ? item.lineStyle : null;
  const areaStyle = isRecord(item.areaStyle) ? item.areaStyle : null;
  if (itemStyle?.color != null) {
    used.mark(`/series/${index}/itemStyle/color`);
    return colorOf(itemStyle.color, warnings, `/series/${index}/itemStyle/color`);
  }
  if (lineStyle?.color != null) {
    used.mark(`/series/${index}/lineStyle/color`);
    return colorOf(lineStyle.color, warnings, `/series/${index}/lineStyle/color`);
  }
  if (areaStyle?.color != null) {
    used.mark(`/series/${index}/areaStyle/color`);
    return colorOf(areaStyle.color, warnings, `/series/${index}/areaStyle/color`);
  }
  return undefined;
}

function applyDomain(spec: Record<string, unknown>, min: number | null, max: number | null): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : null;
  if (!encoding) return;
  const scale = { domain: [min, max] };
  const apply = (channel: unknown) => {
    if (isRecord(channel)) channel.scale = scale;
  };
  if (Array.isArray(encoding.y)) encoding.y.forEach(apply);
  else apply(encoding.y);
}
