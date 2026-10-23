import { parseLiteral } from "./literal";
import {
  altText,
  colorOf,
  finish,
  isDropped,
  isRecord,
  num,
  text,
  uniqueSlug,
  Used,
  warn,
  type ConvertResult,
  type ConvertWarning,
} from "./model";

const TYPES = new Set(["line", "bar", "pie", "doughnut", "scatter", "bubble"]);

export function fromChartJs(input: unknown): ConvertResult {
  const warnings: ConvertWarning[] = [];
  const mapped: string[] = [];
  let value = input;
  if (typeof input === "string") {
    const parsed = parseLiteral(input);
    warnings.push(...parsed.warnings);
    value = parsed.value;
  }
  if (!isRecord(value)) {
    warnings.push(warn("CK8103", "Chart.js input is not an object.", ""));
    return finish(null, warnings, "chartjs", mapped);
  }
  const root = isRecord(value.config) ? value.config : value;
  const used = new Used();
  used.mark("");
  if (isRecord(value.config)) used.mark("/config");
  const base = isRecord(value.config) ? "/config" : "";
  const type = text(root.type);
  used.mark(`${base}/type`);
  const data = isRecord(root.data) ? root.data : {};
  used.mark(`${base}/data`);
  const options = isRecord(root.options) ? root.options : {};
  used.mark(`${base}/options`);
  const datasets = Array.isArray(data.datasets) ? data.datasets.filter(isRecord) : [];
  used.mark(`${base}/data/datasets`);
  const labels = Array.isArray(data.labels) ? data.labels.map((item) => String(item)) : [];
  used.mark(`${base}/data/labels`);

  const kinds = datasets.map((item, index) => text(item.type) || type || "line");
  const unsupported = kinds.find((item) => !TYPES.has(item));
  if (!type && datasets.length === 0) {
    warnings.push(warn("CK8101", "No Chart.js type or datasets.", `${base}/type`));
    used.unread(value, "", warnings);
    return finish(null, warnings, "chartjs", mapped);
  }
  if (unsupported) {
    warnings.push(warn("CK8101", `Chart.js type “${unsupported}” is not converted.`, `${base}/type`));
    used.unread(value, "", warnings);
    return finish(null, warnings, "chartjs", mapped);
  }

  const title = readTitle(options, used, `${base}/options`, warnings);
  const legend = readLegend(options, used, `${base}/options`);
  const tooltip = readTooltip(options, used, `${base}/options`, warnings);
  const scales = readScales(options, used, `${base}/options`, warnings);
  const horizontal = options.indexAxis === "y";
  if ("indexAxis" in options) used.mark(`${base}/options/indexAxis`);
  if (horizontal) mapped.push("horizontal bar");

  const mixed = new Set(kinds).size > 1;
  const stacked = scales.stacked || datasets.some((item) => item.stack != null);
  const filled = datasets.some((item) => item.fill === true || item.fill === "origin");
  const scatterLike = kinds.every((item) => item === "scatter" || item === "bubble");
  const pieLike = kinds.every((item) => item === "pie" || item === "doughnut");

  let spec: Record<string, unknown>;
  if (pieLike) {
    spec = pieSpec(datasets[0], labels, kinds[0] === "doughnut" ? "donut" : "pie", title, used, `${base}/data/datasets/0`, warnings);
    mapped.push(kinds[0] === "doughnut" ? "doughnut" : "pie");
    if (datasets.length > 1) warnings.push(warn("CK8104", "Only the first pie dataset is kept.", `${base}/data/datasets`));
  } else if (scatterLike) {
    spec = scatterSpec(datasets, kinds, title, used, `${base}/data/datasets`, warnings);
    mapped.push(kinds.includes("bubble") ? "bubble" : "scatter");
  } else if (mixed) {
    spec = wideSpec(labels, datasets, kinds, title, "combo", used, `${base}/data/datasets`, warnings);
    mapped.push("combo");
  } else if (kinds[0] === "bar") {
    spec = wideSpec(labels, datasets, kinds, title, "bar", used, `${base}/data/datasets`, warnings);
    if (stacked) {
      (spec.mark as Record<string, unknown>).stack = "stack";
      mapped.push("bar stacked");
    } else mapped.push(datasets.length > 1 ? "bar grouped" : "bar");
    if (horizontal) (spec.mark as Record<string, unknown>).orientation = "horizontal";
  } else if (stacked && filled) {
    spec = wideSpec(labels, datasets, kinds, title, "stacked-area", used, `${base}/data/datasets`, warnings);
    mapped.push("stacked area");
  } else {
    spec = wideSpec(labels, datasets, kinds, title, "line", used, `${base}/data/datasets`, warnings);
    mapped.push(filled ? "area" : "line");
  }

  if (legend) spec.legend = legend;
  if (tooltip) spec.tooltip = tooltip;
  const axes = axesOf(scales);
  if (axes) spec.axes = axes;
  if (scales.zero != null || scales.yMin != null || scales.yMax != null) applyYScale(spec, scales);
  if (title) mapped.push("title");
  if (legend) mapped.push("legend");
  if (tooltip) mapped.push("tooltip");
  if (axes || scales.yMin != null || scales.zero != null) mapped.push("axes");

  used.unread(value, "", warnings);
  return finish(spec, warnings, "chartjs", mapped);
}

function pieSpec(
  dataset: Record<string, unknown> | undefined,
  labels: string[],
  type: "pie" | "donut",
  title: string | undefined,
  used: Used,
  path: string,
  warnings: ConvertWarning[],
): Record<string, unknown> {
  const values = Array.isArray(dataset?.data) ? dataset.data : [];
  const rows = labels.map((label, index) => ({ label, value: num(values[index]) ?? 0 }));
  const colors = Array.isArray(dataset?.backgroundColor) ? dataset.backgroundColor.filter((item) => typeof item === "string") : [];
  if (dataset) {
    used.mark(`${path}/data`);
    used.mark(`${path}/label`);
    used.mark(`${path}/backgroundColor`);
    used.mark(`${path}/borderColor`);
  }
  const encoding: Record<string, unknown> = { x: "label", y: "value" };
  if (colors.length >= 2) encoding.color = { field: "label", domain: rows.map((row) => row.label), range: colors };
  else if (colors.length === 1) encoding.color = { value: colors[0] };
  const spec: Record<string, unknown> = {
    version: "1",
    type,
    data: rows,
    encoding,
    a11y: { alt: altText(title, `${rows[0]?.label ?? "The first slice"} leads the ${type}.`) },
  };
  if (title) spec.title = title;
  if (dataset && "cutout" in dataset) {
    used.mark(`${path}/cutout`);
    const cut = dataset.cutout;
    if (typeof cut === "string" && cut.endsWith("%")) spec.mark = { innerRadius: Number.parseFloat(cut) / 100 };
    else warnings.push(warn("CK8104", "A pixel cutout is not a fraction. The donut keeps its default hole.", `${path}/cutout`));
  }
  return spec;
}

function scatterSpec(
  datasets: Record<string, unknown>[],
  kinds: string[],
  title: string | undefined,
  used: Used,
  path: string,
  warnings: ConvertWarning[],
): Record<string, unknown> {
  const taken = new Set<string>();
  const rows: Record<string, unknown>[] = [];
  let sized = false;
  datasets.forEach((dataset, index) => {
    const name = text(dataset.label) || `Series ${index + 1}`;
    const field = uniqueSlug(name, index, taken);
    used.mark(`${path}/${index}/label`);
    used.mark(`${path}/${index}/data`);
    used.mark(`${path}/${index}/type`);
    const color = colorOf(dataset.backgroundColor ?? dataset.borderColor, warnings, `${path}/${index}/backgroundColor`);
    if (dataset.backgroundColor != null) used.mark(`${path}/${index}/backgroundColor`);
    if (dataset.borderColor != null) used.mark(`${path}/${index}/borderColor`);
    const points = Array.isArray(dataset.data) ? dataset.data : [];
    for (const point of points) {
      if (!isRecord(point)) continue;
      const row: Record<string, unknown> = { x: num(point.x) ?? point.x, y: num(point.y) ?? point.y, series: name };
      const radius = num(point.r);
      if (kinds[index] === "bubble" && radius != null) {
        if (sized && rows.some((item) => item.series !== name && item.size != null)) {
          warnings.push(warn("CK8104", "Bubble radius is one size field. Later series share it.", `${path}/${index}/data`));
        }
        row.size = radius;
        sized = true;
      }
      if (color) row.color = color;
      rows.push(row);
    }
  });
  const encoding: Record<string, unknown> = { x: "x", y: "y", series: "series" };
  if (sized) encoding.size = "size";
  return {
    version: "1",
    type: "scatter",
    ...(title ? { title } : {}),
    data: rows,
    encoding,
    a11y: { alt: altText(title, "Points are plotted on x and y.") },
  };
}

function wideSpec(
  labels: string[],
  datasets: Record<string, unknown>[],
  kinds: string[],
  title: string | undefined,
  type: string,
  used: Used,
  path: string,
  warnings: ConvertWarning[],
): Record<string, unknown> {
  const taken = new Set<string>(["cat"]);
  const channels: Record<string, unknown>[] = [];
  const rows = labels.map((label) => ({ cat: label }) as Record<string, unknown>);
    const axisIds: string[] = ["y"];
  datasets.forEach((dataset, index) => {
    const name = text(dataset.label) || `Series ${index + 1}`;
    const field = uniqueSlug(name, index, taken);
    used.mark(`${path}/${index}/label`);
    used.mark(`${path}/${index}/data`);
    used.mark(`${path}/${index}/type`);
    if (dataset.stack != null) used.mark(`${path}/${index}/stack`);
    const values = Array.isArray(dataset.data) ? dataset.data : [];
    values.forEach((item, row) => {
      if (!rows[row]) rows[row] = { cat: labels[row] ?? String(row + 1) };
      rows[row][field] = num(item);
    });
    const channel: Record<string, unknown> = { field, title: name };
    const kind = kinds[index] || "line";
    if (type === "combo") channel.mark = kind === "bar" ? "bar" : "line";
    if (kind === "line" && (dataset.fill === true || dataset.fill === "origin")) channel.area = true;
    if (dataset.fill != null) used.mark(`${path}/${index}/fill`);
    const color = colorOf(dataset.borderColor ?? dataset.backgroundColor, warnings, `${path}/${index}/borderColor`);
    if (dataset.borderColor != null) used.mark(`${path}/${index}/borderColor`);
    if (dataset.backgroundColor != null) used.mark(`${path}/${index}/backgroundColor`);
    if (color) channel.color = color;
    if (Array.isArray(dataset.borderDash)) {
      used.mark(`${path}/${index}/borderDash`);
      channel.dash = "dashed";
    }
    if (typeof dataset.tension === "number") {
      used.mark(`${path}/${index}/tension`);
    }
    const axis = text(dataset.yAxisID);
    if (axis) used.mark(`${path}/${index}/yAxisID`);
    if (axis && axis !== "y") {
      if (!axisIds.includes(axis)) axisIds.push(axis);
      if (axisIds.indexOf(axis) === 1) channel.axis = "y2";
      else if (axisIds.indexOf(axis) > 1) warnings.push(warn("CK8104", "Only two y axes are kept.", `${path}/${index}/yAxisID`));
    }
    if (dataset.pointRadius === 0) {
      used.mark(`${path}/${index}/pointRadius`);
      channel.pointShape = "none";
    }
    noteDropped(dataset, used, `${path}/${index}`, warnings);
    channels.push(channel);
  });
  const curve = datasets.some((item) => typeof item.tension === "number" && item.tension > 0) ? "monotone" : undefined;
  const straight = datasets.some((item) => item.tension === 0);
  const mark: Record<string, unknown> = {};
  if (curve) mark.curve = "monotone";
  else if (straight) mark.curve = "linear";
  const spec: Record<string, unknown> = {
    version: "1",
    type,
    ...(title ? { title } : {}),
    data: rows,
    encoding: { x: { field: "cat", title: "Category" }, y: channels.length === 1 ? channels[0] : channels },
    a11y: { alt: altText(title, `${channels[0] && text((channels[0] as { title?: string }).title) || "The series"} is plotted across ${labels[0] ?? "the categories"}.`) },
  };
  if (Object.keys(mark).length) spec.mark = mark;
  else spec.mark = {};
  return spec;
}

function noteDropped(dataset: Record<string, unknown>, used: Used, path: string, warnings: ConvertWarning[]): void {
  for (const key of Object.keys(dataset)) {
    if (isDropped(dataset[key])) {
      used.mark(`${path}/${key}`);
      warnings.push(warn("CK8102", `Dropped a ${dataset[key].reason} at ${key}.`, `${path}/${key}`));
    }
  }
}

function readTitle(options: Record<string, unknown>, used: Used, path: string, warnings: ConvertWarning[]): string | undefined {
  const plugins = isRecord(options.plugins) ? options.plugins : null;
  if (plugins) used.mark(`${path}/plugins`);
  const pluginTitle = plugins && isRecord(plugins.title) ? plugins.title : null;
  if (pluginTitle) {
    used.mark(`${path}/plugins/title`);
    used.mark(`${path}/plugins/title/text`);
    used.mark(`${path}/plugins/title/display`);
    if (pluginTitle.display === false) return undefined;
    return text(pluginTitle.text);
  }
  const v2 = isRecord(options.title) ? options.title : null;
  if (v2) {
    used.mark(`${path}/title`);
    used.mark(`${path}/title/text`);
    used.mark(`${path}/title/display`);
    warnings.push(warn("CK8104", "Read the Chart.js v2 title. The v3 key is options.plugins.title.", `${path}/title`));
    if (v2.display === false) return undefined;
    return text(v2.text);
  }
  return undefined;
}

function readLegend(options: Record<string, unknown>, used: Used, path: string): Record<string, unknown> | false | undefined {
  const plugins = isRecord(options.plugins) ? options.plugins : null;
  const pluginLegend = plugins && isRecord(plugins.legend) ? plugins.legend : null;
  const source = pluginLegend || (isRecord(options.legend) ? options.legend : null);
  if (!source) return undefined;
  const prefix = pluginLegend ? `${path}/plugins/legend` : `${path}/legend`;
  used.mark(prefix);
  used.mark(`${prefix}/display`);
  used.mark(`${prefix}/position`);
  if (source.display === false) return false;
  const position = text(source.position);
  if (position === "top" || position === "bottom" || position === "left" || position === "right") return { position };
  return { show: true };
}

function readTooltip(
  options: Record<string, unknown>,
  used: Used,
  path: string,
  warnings: ConvertWarning[],
): Record<string, unknown> | false | undefined {
  const plugins = isRecord(options.plugins) ? options.plugins : null;
  const tip = plugins && isRecord(plugins.tooltip) ? plugins.tooltip : null;
  if (!tip) return undefined;
  used.mark(`${path}/plugins/tooltip`);
  used.mark(`${path}/plugins/tooltip/enabled`);
  used.mark(`${path}/plugins/tooltip/mode`);
  if (tip.enabled === false) return false;
  const mode = text(tip.mode);
  if (mode === "index") return { mode: "index" };
  if (mode === "nearest" || mode === "point") {
    if (mode === "point") warnings.push(warn("CK8104", "Tooltip mode point is mapped to nearest.", `${path}/plugins/tooltip/mode`));
    return { mode: "nearest" };
  }
  return { show: true };
}

interface ScaleRead {
  stacked: boolean;
  zero: boolean | null;
  yMin: number | null;
  yMax: number | null;
  xTitle?: string;
  yTitle?: string;
  xGrid?: boolean;
  yGrid?: boolean;
}

function readScales(options: Record<string, unknown>, used: Used, path: string, warnings: ConvertWarning[]): ScaleRead {
  const out: ScaleRead = { stacked: false, zero: null, yMin: null, yMax: null };
  const scales = isRecord(options.scales) ? options.scales : null;
  if (!scales) return out;
  used.mark(`${path}/scales`);
  const x = axisBlock(scales.x) || axisBlock(Array.isArray(scales.xAxes) ? scales.xAxes[0] : undefined);
  const y = axisBlock(scales.y) || axisBlock(Array.isArray(scales.yAxes) ? scales.yAxes[0] : undefined);
  if (scales.x != null) used.mark(`${path}/scales/x`);
  if (scales.y != null) used.mark(`${path}/scales/y`);
  if (scales.xAxes != null) {
    used.mark(`${path}/scales/xAxes`);
    warnings.push(warn("CK8104", "Read Chart.js v2 xAxes. The v3 key is scales.x.", `${path}/scales/xAxes`));
  }
  if (scales.yAxes != null) {
    used.mark(`${path}/scales/yAxes`);
    warnings.push(warn("CK8104", "Read Chart.js v2 yAxes. The v3 key is scales.y.", `${path}/scales/yAxes`));
  }
  if (x) {
    out.stacked = out.stacked || x.stacked === true;
    out.xTitle = x.title;
    out.xGrid = x.grid;
    markAxis(used, `${path}/scales/x`);
  }
  if (y) {
    out.stacked = out.stacked || y.stacked === true;
    out.yTitle = y.title;
    out.yGrid = y.grid;
    if (typeof y.min === "number") out.yMin = y.min;
    if (typeof y.max === "number") out.yMax = y.max;
    if (typeof y.beginAtZero === "boolean") out.zero = y.beginAtZero;
    markAxis(used, `${path}/scales/y`);
  }
  return out;
}

function markAxis(used: Used, path: string): void {
  for (const key of ["stacked", "min", "max", "beginAtZero", "title", "grid", "scaleLabel"]) used.mark(`${path}/${key}`);
  used.mark(`${path}/title/text`);
  used.mark(`${path}/title/display`);
  used.mark(`${path}/grid/display`);
  used.mark(`${path}/scaleLabel/labelString`);
}

function axisBlock(value: unknown): { stacked?: boolean; min?: number; max?: number; beginAtZero?: boolean; title?: string; grid?: boolean } | null {
  if (!isRecord(value)) return null;
  const title = isRecord(value.title) ? text(value.title.text) : undefined;
  const v2 = isRecord(value.scaleLabel) ? text(value.scaleLabel.labelString) : undefined;
  const grid = isRecord(value.grid) && value.grid.display === false ? false : undefined;
  return {
    stacked: value.stacked === true,
    min: num(value.min) ?? undefined,
    max: num(value.max) ?? undefined,
    beginAtZero: typeof value.beginAtZero === "boolean" ? value.beginAtZero : undefined,
    title: title || v2,
    grid,
  };
}

function axesOf(scales: ScaleRead): Record<string, unknown> | undefined {
  const axes: Record<string, unknown> = {};
  if (scales.xTitle || scales.xGrid === false) axes.x = { ...(scales.xTitle ? { title: scales.xTitle } : {}), ...(scales.xGrid === false ? { grid: false } : {}) };
  if (scales.yTitle || scales.yGrid === false) axes.y = { ...(scales.yTitle ? { title: scales.yTitle } : {}), ...(scales.yGrid === false ? { grid: false } : {}) };
  return Object.keys(axes).length ? axes : undefined;
}

function applyYScale(spec: Record<string, unknown>, scales: ScaleRead): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : null;
  if (!encoding) return;
  const domain = scales.yMin != null || scales.yMax != null ? [scales.yMin, scales.yMax] : undefined;
  const scale: Record<string, unknown> = {};
  if (domain) scale.domain = domain;
  if (scales.zero != null) scale.zero = scales.zero;
  const apply = (channel: unknown) => {
    if (!isRecord(channel)) return;
    channel.scale = { ...(isRecord(channel.scale) ? channel.scale : {}), ...scale };
  };
  if (Array.isArray(encoding.y)) encoding.y.forEach(apply);
  else apply(encoding.y);
}
