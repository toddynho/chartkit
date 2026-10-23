import { parseJsx, parseLiteral, type JsxNode } from "./literal";
import {
  altText,
  colorOf,
  finish,
  isRecord,
  num,
  text,
  uniqueSlug,
  Used,
  warn,
  type ConvertResult,
  type ConvertWarning,
} from "./model";

const CHARTS = new Set(["LineChart", "AreaChart", "BarChart", "PieChart", "ScatterChart", "ComposedChart"]);

export function fromRecharts(input: unknown): ConvertResult {
  const warnings: ConvertWarning[] = [];
  const mapped: string[] = [];
  let node: JsxNode | null = null;
  if (typeof input === "string") {
    const parsed = parseJsx(input);
    warnings.push(...parsed.warnings);
    node = parsed.root;
  } else if (isRecord(input) && typeof input.chart === "string") {
    node = propsToNode(input);
  } else if (typeof input === "string") {
    const parsed = parseLiteral(input);
    warnings.push(...parsed.warnings);
  }
  if (!node || !CHARTS.has(node.name)) {
    warnings.push(warn("CK8101", "No supported Recharts chart tag.", ""));
    return finish(null, warnings, "recharts", mapped);
  }
  const used = new Used();
  const data = Array.isArray(node.props.data) ? node.props.data.filter(isRecord) : [];
  const xKey = node.children.find((child) => child.name === "XAxis")?.props.dataKey;
  const xField = text(xKey) || "x";
  const series = node.children.filter((child) => ["Line", "Area", "Bar", "Scatter"].includes(child.name));
  const pies = node.children.filter((child) => child.name === "Pie");
  const title = text(node.props.title);

  if (node.name === "PieChart" || pies.length) {
    const spec = pieSpec(pies[0], data, title, warnings);
    mapped.push(num(pies[0]?.props.innerRadius) ? "donut" : "pie");
    if (pies.length > 1) warnings.push(warn("CK8104", "Only the first Pie is kept.", "Pie"));
    applyChrome(spec, node, mapped);
    return finish(spec, warnings, "recharts", mapped);
  }
  if (!series.length) {
    warnings.push(warn("CK8101", `${node.name} has no Line, Area, Bar, or Scatter.`, node.name));
    return finish(null, warnings, "recharts", mapped);
  }
  if (node.name === "ScatterChart" || series.every((child) => child.name === "Scatter")) {
    const spec = scatterSpec(series, data, node, title, warnings);
    mapped.push(node.children.some((child) => child.name === "ZAxis") ? "bubble" : "scatter");
    applyChrome(spec, node, mapped);
    return finish(spec, warnings, "recharts", mapped);
  }

  const names = new Set(series.map((child) => child.name));
  const stacked = series.some((child) => child.props.stackId != null);
  const mixed = names.size > 1;
  let type = "line";
  if (mixed || node.name === "ComposedChart") type = "combo";
  else if (node.name === "BarChart" || names.has("Bar")) type = "bar";
  else if ((node.name === "AreaChart" || names.has("Area")) && stacked) type = "stacked-area";
  else type = "line";

  const spec = wideSpec(data, series, xField, type, title, node, warnings);
  if (type === "bar" && stacked) mapped.push("bar stacked");
  else if (type === "bar") mapped.push(series.length > 1 ? "bar grouped" : "bar");
  else if (type === "stacked-area") mapped.push("stacked area");
  else if (type === "combo") mapped.push("combo");
  else mapped.push(names.has("Area") || node.name === "AreaChart" ? "area" : "line");
  if (node.props.layout === "vertical") {
    spec.mark = { ...(isRecord(spec.mark) ? spec.mark : {}), orientation: "horizontal" };
    mapped.push("horizontal bar");
  }
  applyChrome(spec, node, mapped);
  void used;
  return finish(spec, warnings, "recharts", mapped);
}

function propsToNode(input: Record<string, unknown>): JsxNode {
  const children = Array.isArray(input.children) ? input.children.filter(isRecord).map(propsToNode) : [];
  const props = { ...input };
  delete props.chart;
  delete props.children;
  return { name: String(input.chart), props, children };
}

function pieSpec(pie: JsxNode | undefined, data: Record<string, unknown>[], title: string | undefined, warnings: ConvertWarning[]): Record<string, unknown> {
  const labelKey = text(pie?.props.nameKey) || text(pie?.props.dataKey) || "name";
  const valueKey = text(pie?.props.dataKey) || "value";
  const rows = (Array.isArray(pie?.props.data) ? pie.props.data.filter(isRecord) : data).map((row) => ({
    label: String(row[labelKey] ?? ""),
    value: num(row[valueKey]) ?? 0,
  }));
  const color = colorOf(pie?.props.fill, warnings, "Pie/fill");
  const inner = num(pie?.props.innerRadius);
  return {
    version: "1",
    type: inner ? "donut" : "pie",
    ...(title ? { title } : {}),
    ...(inner ? { mark: { innerRadius: inner > 1 ? Math.min(0.9, inner / 100) : inner } } : {}),
    data: rows,
    encoding: { x: "label", y: "value", ...(color ? { color: { value: color } } : {}) },
    a11y: { alt: altText(title, `${rows[0]?.label || "The first slice"} leads.`) },
  };
}

function scatterSpec(
  series: JsxNode[],
  data: Record<string, unknown>[],
  node: JsxNode,
  title: string | undefined,
  warnings: ConvertWarning[],
): Record<string, unknown> {
  const z = node.children.find((child) => child.name === "ZAxis");
  const zKey = text(z?.props.dataKey);
  const rows: Record<string, unknown>[] = [];
  for (const child of series) {
    const name = text(child.props.name) || text(child.props.dataKey) || "Points";
    const xKey = text(child.props.x) || text(node.children.find((item) => item.name === "XAxis")?.props.dataKey) || "x";
    const yKey = text(child.props.y) || text(node.children.find((item) => item.name === "YAxis")?.props.dataKey) || "y";
    const source = Array.isArray(child.props.data) ? child.props.data.filter(isRecord) : data;
    for (const row of source) {
      const next: Record<string, unknown> = { x: row[xKey], y: row[yKey], series: name };
      if (zKey && row[zKey] != null) next.size = num(row[zKey]) ?? row[zKey];
      rows.push(next);
    }
    colorOf(child.props.fill, warnings, "Scatter/fill");
  }
  return {
    version: "1",
    type: "scatter",
    ...(title ? { title } : {}),
    data: rows,
    encoding: { x: "x", y: "y", series: "series", ...(zKey ? { size: "size" } : {}) },
    a11y: { alt: altText(title, "Points are plotted on x and y.") },
  };
}

function wideSpec(
  data: Record<string, unknown>[],
  series: JsxNode[],
  xField: string,
  type: string,
  title: string | undefined,
  node: JsxNode,
  warnings: ConvertWarning[],
): Record<string, unknown> {
  const taken = new Set<string>(["cat"]);
  const rows = data.map((row) => ({ cat: row[xField] ?? "" }) as Record<string, unknown>);
  const channels: Record<string, unknown>[] = [];
  const annotations: Record<string, unknown>[] = [];
  series.forEach((child, index) => {
    const key = text(child.props.dataKey) || `series_${index + 1}`;
    const name = text(child.props.name) || key;
    const field = uniqueSlug(name, index, taken);
    rows.forEach((row, rowIndex) => {
      row[field] = num(data[rowIndex]?.[key]);
    });
    const channel: Record<string, unknown> = { field, title: name };
    if (type === "combo") channel.mark = child.name === "Bar" ? "bar" : "line";
    if (child.name === "Area" || node.name === "AreaChart") channel.area = true;
    const color = colorOf(child.props.stroke ?? child.props.fill, warnings, `${child.name}/stroke`);
    if (color) channel.color = color;
    if (child.props.strokeDasharray) channel.dash = "dashed";
    const curve = text(child.props.type);
    if (curve === "step") channel.pointShape = channel.pointShape;
    channels.push(channel);
    if (curve && curve !== "monotone" && curve !== "linear" && curve !== "step") {
      warnings.push(warn("CK8104", `Curve “${curve}” is mapped to monotone.`, `${child.name}/type`));
    }
  });
  for (const child of node.children) {
    if (child.name === "ReferenceLine") {
      const y = num(child.props.y);
      const x = child.props.x;
      if (y == null && x == null) {
        warnings.push(warn("CK8104", "ReferenceLine without x or y was not mapped.", "ReferenceLine"));
        continue;
      }
      annotations.push({
        type: "rule",
        axis: y != null ? "y" : "x",
        value: y != null ? y : x,
        ...(child.props.strokeDasharray ? { dash: "dashed" } : {}),
        ...(text(child.props.label) ? { label: text(child.props.label) } : {}),
      });
    } else if (child.name === "ReferenceArea") {
      const from = num(child.props.y1);
      const to = num(child.props.y2);
      if (from == null || to == null) warnings.push(warn("CK8104", "ReferenceArea needs y1 and y2.", "ReferenceArea"));
      else annotations.push({ type: "band", axis: "y", from, to });
    } else if (!["XAxis", "YAxis", "ZAxis", "Tooltip", "Legend", "CartesianGrid", "Line", "Area", "Bar", "Scatter", "Pie"].includes(child.name)) {
      warnings.push(warn("CK8100", `Not mapped: ${child.name}.`, child.name));
    }
  }
  const curve = series.some((child) => text(child.props.type) === "linear") ? "linear" : series.some((child) => child.props.type != null) ? "monotone" : undefined;
  const spec: Record<string, unknown> = {
    version: "1",
    type,
    ...(title ? { title } : {}),
    data: rows,
    encoding: { x: { field: "cat", title: xField }, y: channels.length === 1 ? channels[0] : channels },
    a11y: { alt: altText(title, `${text(channels[0]?.title) || "The series"} is plotted by ${xField}.`) },
  };
  const stackedBars = series.filter((child) => child.name === "Bar" && child.props.stackId != null);
  const bars = series.filter((child) => child.name === "Bar");
  const besideBars = series.some((child) => child.name === "Line" || child.name === "Area" || child.name === "Scatter");
  if (stackedBars.length && stackedBars.length === bars.length && type === "combo" && !besideBars) {
    spec.mark = { ...(isRecord(spec.mark) ? spec.mark : {}), stack: "stack" };
  } else if (series.some((child) => child.props.stackId != null) && type === "combo") {
    warnings.push(
      warn(
        "CK8104",
        besideBars
          ? "A combo stack includes every series, so the line would move. stackId was not applied."
          : "stackId is not applied when series disagree on the stack.",
        "stackId",
      ),
    );
  }
  if (curve) spec.mark = { ...(isRecord(spec.mark) ? spec.mark : {}), curve };
  if (annotations.length) spec.annotations = annotations;
  return spec;
}

function applyChrome(spec: Record<string, unknown>, node: JsxNode, mapped: string[]): void {
  const legend = node.children.find((child) => child.name === "Legend");
  const tooltip = node.children.find((child) => child.name === "Tooltip");
  const grid = node.children.find((child) => child.name === "CartesianGrid");
  const xAxis = node.children.find((child) => child.name === "XAxis");
  const yAxis = node.children.find((child) => child.name === "YAxis");
  if (!legend) spec.legend = false;
  else {
    const position = text(legend.props.verticalAlign) === "top" ? "top" : text(legend.props.align) === "right" ? "right" : "bottom";
    spec.legend = { position };
    mapped.push("legend");
  }
  if (!tooltip) spec.tooltip = false;
  else {
    spec.tooltip = { show: true };
    mapped.push("tooltip");
  }
  const axes: Record<string, unknown> = {};
  if (xAxis && text(xAxis.props.label)) axes.x = { title: text(xAxis.props.label) };
  if (yAxis && text(yAxis.props.label)) axes.y = { title: text(yAxis.props.label) };
  if (grid) {
    const dashed = grid.props.strokeDasharray ? "dashed" : true;
    axes.x = { ...(isRecord(axes.x) ? axes.x : {}), grid: dashed };
    axes.y = { ...(isRecord(axes.y) ? axes.y : {}), grid: dashed };
    mapped.push("grid");
  }
  if (Object.keys(axes).length) {
    spec.axes = axes;
    mapped.push("axes");
  }
  if (spec.title) mapped.push("title");
}
