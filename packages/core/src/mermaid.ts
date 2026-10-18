/**
 * Mermaid 11/12 chart syntax → ChartKit v1.
 * Opt-in entry: `@chartkitdev/core/mermaid`. The line bundle does not import this module.
 * Grammar cases in the tests follow the public Mermaid docs syntax.
 */
import { validate } from "./validate";

export const DEFAULT_MAX_SOURCE = 100_000;
export const DEFAULT_MAX_POINTS = 2_000;

export interface ImportWarning {
  code: string;
  severity: "warning";
  message: string;
  path: string;
}

export interface ImportResult {
  spec: Record<string, unknown> | null;
  warnings: ImportWarning[];
}

export interface ImportOptions {
  /** Maximum source length in characters. Default 100000. */
  maxSource?: number;
  /** Maximum numeric points kept in the spec. Default 2000. */
  maxPoints?: number;
}

type Kind = "xychart" | "pie" | "sankey" | "radar" | "treemap" | "quadrant" | "gantt" | "timeline" | "journey" | "venn";

interface Meta {
  title?: string;
  accTitle?: string;
  accDescr?: string;
}

const DIAGRAMS: { name: string; kind: Kind }[] = [
  { name: "xychart-beta", kind: "xychart" },
  { name: "xychart", kind: "xychart" },
  { name: "sankey-beta", kind: "sankey" },
  { name: "sankey", kind: "sankey" },
  { name: "radar-beta", kind: "radar" },
  { name: "radar", kind: "radar" },
  { name: "treemap-beta", kind: "treemap" },
  { name: "treemap", kind: "treemap" },
  { name: "quadrantchart", kind: "quadrant" },
  { name: "gantt", kind: "gantt" },
  { name: "timeline", kind: "timeline" },
  { name: "journey", kind: "journey" },
  { name: "venn-beta", kind: "venn" },
  { name: "venn", kind: "venn" },
  { name: "pie", kind: "pie" },
];

/** Convert Mermaid chart text into a ChartKit spec. Unsupported diagrams return spec null and a warning. */
export function fromMermaid(text: string, options?: ImportOptions): ImportResult {
  const limits = limitsOf(options);
  if (text.length > limits.maxSource) return tooBig(text.length, limits.maxSource);
  const warnings: ImportWarning[] = [];
  const prepared = prepare(text, warnings);
  if (!prepared.kind) {
    warnings.push(warn(prepared.unsupported ? "CK8003" : "CK8005", prepared.unsupported ?? "No supported Mermaid chart type found.", ""));
    return { spec: null, warnings };
  }
  const spec = build(prepared.kind, prepared.headerRest, prepared.body, prepared.meta, limits.maxPoints, warnings);
  return finish(spec, warnings);
}

/** ChartKit JSON when the text starts with `{`, otherwise Mermaid. A JSON parse error does not fall through. */
export function toSpec(text: string, options?: ImportOptions): ImportResult {
  const limits = limitsOf(options);
  if (text.length > limits.maxSource) return tooBig(text.length, limits.maxSource);
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (trimmed.startsWith("{")) return fromJson(trimmed);
  return fromMermaid(text, options);
}

function fromJson(text: string): ImportResult {
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { spec: null, warnings: [warn("CK8005", `ChartKit JSON did not parse: ${message}`, "")] };
  }
  if (!isRecord(value) || (typeof value.type !== "string" && typeof value.version !== "string")) {
    return { spec: null, warnings: [warn("CK8005", "JSON is not a ChartKit spec.", "")] };
  }
  return finish(value, []);
}

function finish(spec: Record<string, unknown> | null, warnings: ImportWarning[]): ImportResult {
  if (!spec) return { spec: null, warnings };
  const result = validate(spec);
  for (const item of result.diagnostics) {
    if (item.severity === "error") {
      warnings.push(warn("CK8006", `${item.code}: ${item.message}`, item.path || ""));
    }
  }
  return { spec, warnings };
}

function limitsOf(options?: ImportOptions): { maxSource: number; maxPoints: number } {
  const maxSource = options?.maxSource;
  const maxPoints = options?.maxPoints;
  return {
    maxSource: typeof maxSource === "number" && maxSource >= 0 ? maxSource : DEFAULT_MAX_SOURCE,
    maxPoints: typeof maxPoints === "number" && maxPoints >= 0 ? maxPoints : DEFAULT_MAX_POINTS,
  };
}

function tooBig(length: number, max: number): ImportResult {
  return {
    spec: null,
    warnings: [warn("CK8001", `Source is ${length} characters; the limit is ${max}.`, "")],
  };
}

function warn(code: string, message: string, path: string): ImportWarning {
  return { code, severity: "warning", message, path };
}

function prepare(text: string, warnings: ImportWarning[]): {
  meta: Meta;
  kind: Kind | null;
  headerRest: string;
  body: string[];
  unsupported?: string;
} {
  const meta: Meta = {};
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const { body: afterFront, meta: front } = frontmatter(source, meta, warnings);
  Object.assign(meta, front);
  const raw = afterFront.split("\n");
  const lines: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const trimmed = raw[i].trim();
    if (/^accDescr\s*\{/i.test(trimmed)) {
      const parts: string[] = [];
      const inline = trimmed.replace(/^accDescr\s*\{/i, "").trim();
      if (inline && inline !== "}") parts.push(inline.replace(/}\s*$/, ""));
      if (!trimmed.endsWith("}")) {
        i += 1;
        while (i < raw.length && !raw[i].trim().startsWith("}")) {
          parts.push(raw[i].trim());
          i += 1;
        }
      }
      meta.accDescr = parts.join(" ").trim();
      continue;
    }
    if (!trimmed || trimmed.startsWith("%%")) {
      if (trimmed.includes("%%{") || /%%\{/.test(trimmed)) {
        warnings.push(warn("CK8004", "Mermaid init directives are ignored.", ""));
      }
      continue;
    }
    const accTitle = trimmed.match(/^accTitle\s*:\s*(.*)$/i);
    if (accTitle) {
      meta.accTitle = unquote(accTitle[1].trim());
      continue;
    }
    const accDescr = trimmed.match(/^accDescr\s*:\s*(.*)$/i);
    if (accDescr) {
      meta.accDescr = unquote(accDescr[1].trim());
      continue;
    }
    lines.push(raw[i]);
  }
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const token = (trimmed.match(/^[A-Za-z][\w-]*/)?.[0] ?? "").toLowerCase();
    const found = DIAGRAMS.find((item) => item.name === token);
    if (found) {
      return {
        meta,
        kind: found.kind,
        headerRest: trimmed.slice(token.length).trim(),
        body: lines.slice(i + 1),
      };
    }
    const title = parseTitle(trimmed);
    if (title) {
      meta.title = meta.title ?? title;
      continue;
    }
    return {
      meta,
      kind: null,
      headerRest: "",
      body: [],
      unsupported: `Unsupported Mermaid diagram "${token || trimmed.slice(0, 40)}".`,
    };
  }
  return { meta, kind: null, headerRest: "", body: [] };
}

function frontmatter(text: string, meta: Meta, warnings: ImportWarning[]): { body: string; meta: Meta } {
  const trimmed = text.trimStart();
  if (!trimmed.startsWith("---")) return { body: text, meta };
  const end = trimmed.indexOf("\n---", 3);
  if (end < 0) return { body: text, meta };
  const block = trimmed.slice(3, end).split("\n");
  for (const line of block) {
    const match = line.match(/^\s*([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (!match) {
      if (line.trim()) warnings.push(warn("CK8004", `Unsupported frontmatter "${line.trim()}".`, ""));
      continue;
    }
    const key = match[1].toLowerCase();
    const value = unquote(match[2].trim());
    if (key === "title") meta.title = value;
    else if (key === "acctitle") meta.accTitle = value;
    else if (key === "accdescr") meta.accDescr = value;
    else warnings.push(warn("CK8004", `Unsupported frontmatter key "${match[1]}".`, ""));
  }
  return { body: trimmed.slice(end + 4), meta };
}

function build(kind: Kind, headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (kind === "xychart") return buildXy(headerRest, body, meta, maxPoints, warnings);
  if (kind === "pie") return buildPie(headerRest, body, meta, maxPoints, warnings);
  if (kind === "sankey") return buildSankey(headerRest, body, meta, maxPoints, warnings);
  if (kind === "radar") return buildRadar(headerRest, body, meta, maxPoints, warnings);
  if (kind === "treemap") return buildTreemap(headerRest, body, meta, maxPoints, warnings);
  if (kind === "gantt") return buildGantt(headerRest, body, meta, maxPoints, warnings);
  if (kind === "timeline") return buildTimeline(headerRest, body, meta, maxPoints, warnings);
  if (kind === "journey") return buildJourney(headerRest, body, meta, maxPoints, warnings);
  if (kind === "venn") return buildVenn(headerRest, body, meta, maxPoints, warnings);
  return buildQuadrant(headerRest, body, meta, maxPoints, warnings);
}

interface Series {
  mark: "bar" | "line";
  name?: string;
  values: number[];
  field: string;
}

function buildXy(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  let horizontal = false;
  let diagramTitle = meta.title;
  const rest = headerRest.replace(/\bhorizontal\b/i, () => {
    horizontal = true;
    return " ";
  }).trim();
  const inlineTitle = parseTitle(rest);
  if (inlineTitle) diagramTitle = inlineTitle;
  else if (rest) warnings.push(warn("CK8004", `Unsupported xychart header "${rest}".`, ""));

  const series: Series[] = [];
  let categories: string[] | null = null;
  let numeric: { min: number; max: number } | null = null;
  let xTitle: string | undefined;
  let yTitle: string | undefined;
  let yRange: { min: number; max: number } | null = null;

  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    const axis = trimmed.match(/^(x-axis|y-axis)\b\s*(.*)$/i);
    if (axis) {
      const parsed = parseAxis(axis[2] ?? "");
      if (!parsed) {
        warnings.push(warn("CK8004", `Could not read ${axis[1]}.`, "/encoding"));
        continue;
      }
      if (/^x-axis/i.test(axis[1])) {
        xTitle = parsed.title;
        categories = parsed.categories;
        numeric = parsed.range;
      } else {
        yTitle = parsed.title;
        yRange = parsed.range;
        if (parsed.categories) warnings.push(warn("CK8004", "A categorical y-axis is not drawn.", "/axes/y"));
      }
      continue;
    }
    const seriesLine = trimmed.match(/^(bar|line)\b\s*(.*)$/i);
    if (seriesLine) {
      const mark = seriesLine[1].toLowerCase() === "bar" ? "bar" : "line";
      const parsed = parseSeries(seriesLine[2] ?? "");
      if (!parsed) {
        warnings.push(warn("CK8004", `Could not read ${mark} values.`, "/encoding/y"));
        continue;
      }
      series.push({ mark, name: parsed.name, values: parsed.values, field: "" });
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    warnings.push(warn("CK8004", `Unsupported xychart line "${clipText(trimmed)}".`, ""));
  }

  if (!series.length) {
    warnings.push(warn("CK8005", "xychart has no bar or line series.", "/encoding/y"));
    return null;
  }
  const width = Math.max(...series.map((item) => item.values.length));
  let labels = categories && categories.length ? categories.slice() : null;
  if (!labels) {
    if (!numeric) warnings.push(warn("CK8004", "xychart has no x-axis; indexes are used.", "/encoding/x"));
    const span = numeric ? numeric.max - numeric.min : width - 1;
    labels = Array.from({ length: width }, (_, index) => {
      if (!numeric || width === 1) return numeric ? String(numeric.min) : String(index + 1);
      const value = numeric.min + (span * index) / (width - 1);
      return String(round(value));
    });
  }
  if (labels.length !== width) {
    warnings.push(warn("CK8004", "Series length does not match the x-axis; extra values were dropped.", "/data"));
  }
  const count = Math.min(labels.length, width);
  const kept = capCount(count, series.length, maxPoints, warnings, "xychart");
  if (kept <= 0) return null;
  labels = labels.slice(0, kept);
  for (const item of series) item.values = item.values.slice(0, kept);

  const hasBar = series.some((item) => item.mark === "bar");
  const hasLine = series.some((item) => item.mark === "line");
  const type = hasBar && hasLine ? "combo" : hasBar ? "bar" : "line";
  if (horizontal && type !== "bar") {
    horizontal = false;
    warnings.push(warn("CK8004", "Horizontal orientation is only drawn for bar charts.", "/mark/orientation"));
  }
  nameUnnamed(series, yTitle);
  const xKey = claimKey(slugKey(xTitle), "x", new Set());
  const used = new Set<string>([xKey]);
  for (const item of series) {
    const label = series.length === 1 ? yTitle || item.name : item.name || yTitle;
    item.field = claimKey(slugKey(label), "value", used);
  }
  const split = secondAxis(series, type, warnings);

  const rows = labels.map((label, index) => {
    const row: Record<string, string | number> = { [xKey]: numeric && type === "line" ? Number(label) : label };
    for (const item of series) row[item.field] = item.values[index] ?? 0;
    return row;
  });
  const channels = series.map((item, index) => {
    const channel: Record<string, unknown> = { field: item.field };
    if (item.name) channel.title = item.name;
    if (type === "combo") channel.mark = item.mark;
    if (split.has(index)) channel.axis = "y2";
    if (yRange && index === 0) channel.scale = { domain: [yRange.min, yRange.max] };
    return channel;
  });
  const axes: Record<string, unknown> = {};
  if (xTitle) axes.x = { title: xTitle };
  if (yTitle) axes.y = { title: yTitle };
  if (split.size) {
    const titled = series.find((item, index) => split.has(index) && item.name);
    axes.y2 = titled?.name ? { title: titled.name } : true;
  }
  const spec: Record<string, unknown> = {
    version: "1",
    type,
    data: rows,
    encoding: {
      x: numeric && type === "line" ? { field: xKey, type: "quantitative", ...(xTitle ? { title: xTitle } : {}) } : xKey,
      y: channels.length === 1 ? channels[0] : channels,
    },
    a11y: { alt: chooseAlt(meta, diagramTitle, xyAlt(diagramTitle, series, labels)) },
  };
  if (diagramTitle) spec.title = diagramTitle;
  if (Object.keys(axes).length) spec.axes = axes;
  if (horizontal) spec.mark = { orientation: "horizontal" };
  return spec;
}

function nameUnnamed(series: Series[], yTitle: string | undefined): void {
  if (!yTitle) return;
  const unnamed = series.filter((item) => !item.name);
  unnamed.forEach((item, index) => {
    item.name = index === 0 ? yTitle : `${yTitle} ${index + 1}`;
  });
}

/** A field key: a letter, then letters, digits, or underscores. */
function slugKey(label: string | undefined): string {
  if (!label) return "";
  const slug = label
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!slug) return "";
  return slug.charCodeAt(0) >= 97 ? slug : `f_${slug}`;
}

function claimKey(slug: string, fallback: string, used: Set<string>): string {
  const base = slug || fallback;
  let key = base;
  let n = 2;
  while (used.has(key)) {
    key = `${base}${n}`;
    n += 1;
  }
  used.add(key);
  return key;
}

interface Extent {
  span: number;
  mag: number;
}

function extentOf(values: number[]): Extent {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!Number.isFinite(min)) return { span: 0, mag: 0 };
  return { span: max - min, mag: Math.max(Math.abs(min), Math.abs(max)) };
}

/** Line range under about 1/10 of the bars, or the two magnitudes an order apart. */
function scalesDiffer(line: Extent, bar: Extent): boolean {
  if (bar.span > 0 && line.span > 0) {
    const ratio = line.span / bar.span;
    if (ratio < 0.1 || ratio > 10) return true;
  }
  if (bar.mag > 0 && line.mag > 0) {
    const ratio = line.mag / bar.mag;
    if (ratio < 0.1 || ratio > 10) return true;
  }
  return false;
}

function secondAxis(series: Series[], type: string, warnings: ImportWarning[]): Set<number> {
  const split = new Set<number>();
  if (type !== "combo") return split;
  const bars = extentOf(series.filter((item) => item.mark === "bar").flatMap((item) => item.values));
  series.forEach((item, index) => {
    if (item.mark === "line" && scalesDiffer(extentOf(item.values), bars)) split.add(index);
  });
  if (split.size) {
    warnings.push(warn("CK8004", "The line scale differs from the bars, so the line is drawn on a second y-axis.", "/encoding/y"));
  }
  return split;
}

function xyAlt(title: string | undefined, series: Series[], labels: string[]): string {
  let best = series[0]?.values[0] ?? 0;
  let name = series[0]?.name ?? "Series";
  let at = labels[0] ?? "1";
  for (const item of series) {
    item.values.forEach((value, index) => {
      if (value >= best) {
        best = value;
        name = item.name ?? "Series";
        at = labels[index] ?? at;
      }
    });
  }
  const subject = title ? `${title}: ` : "";
  return `${subject}${name} peaks at ${best} on ${at}.`;
}

function buildPie(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  let showData = /\bshowData\b/i.test(headerRest);
  let diagramTitle = meta.title;
  const rest = headerRest.replace(/\bshowData\b/gi, " ").replace(/^title\b\s*/i, "title ").trim();
  const inline = parseTitle(rest.replace(/\s+/g, " ").trim()) || (/^title\b/i.test(headerRest) ? parseTitle(headerRest.trim()) : null);
  if (inline) diagramTitle = inline;
  else if (rest && !/^title\b/i.test(rest)) {
    const leftover = rest.replace(/^title\b/i, "").trim();
    if (leftover && !parseTitle(`title ${leftover}`)) warnings.push(warn("CK8004", `Unsupported pie header "${clipText(rest)}".`, ""));
  }
  const slices: { name: string; value: number }[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^showData$/i.test(trimmed)) {
      showData = true;
      continue;
    }
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    const row = trimmed.match(/^(?:"([^"]*)"|'([^']*)'|(.+?))\s*:\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*$/);
    if (row) {
      slices.push({ name: (row[1] ?? row[2] ?? row[3] ?? "").trim(), value: Number(row[4]) });
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    warnings.push(warn("CK8004", `Unsupported pie line "${clipText(trimmed)}".`, "/data"));
  }
  const kept = capList(slices, maxPoints, warnings, "pie");
  if (!kept.length) {
    warnings.push(warn("CK8005", "Pie chart has no slices.", "/data"));
    return null;
  }
  const top = kept.reduce((best, slice) => (slice.value > best.value ? slice : best), kept[0]);
  const spec: Record<string, unknown> = {
    version: "1",
    type: "donut",
    data: kept.map((slice) => ({ label: slice.name, value: slice.value })),
    encoding: { x: "label", y: "value" },
    mark: { innerRadius: 0 },
    a11y: { alt: chooseAlt(meta, diagramTitle, `${top.name} is the largest slice at ${top.value}.`) },
  };
  if (diagramTitle) spec.title = diagramTitle;
  if (showData) spec.legend = { values: true };
  return spec;
}

function buildSankey(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported sankey header "${clipText(headerRest)}".`, ""));
  const links: { from: string; to: string; flow: number }[] = [];
  let headerSkipped = false;
  let extraColumns = false;
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title && !trimmed.includes(",")) {
      meta.title = meta.title ?? title;
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    const cells = parseCsv(trimmed);
    if (cells.length < 3) {
      warnings.push(warn("CK8004", `Sankey row "${clipText(trimmed)}" needs source, target, and value.`, "/data"));
      continue;
    }
    const flow = Number(cells[2].replace(/_/g, ""));
    if (!headerSkipped && !Number.isFinite(flow)) {
      headerSkipped = true;
      continue;
    }
    if (!Number.isFinite(flow) || flow <= 0 || cells[0] === cells[1]) {
      warnings.push(warn("CK8004", `Sankey row "${clipText(trimmed)}" was skipped.`, "/data"));
      continue;
    }
    if (cells.length > 3 && !extraColumns) {
      extraColumns = true;
      warnings.push(warn("CK8004", "Extra sankey columns were ignored.", "/data"));
    }
    links.push({ from: cells[0], to: cells[1], flow });
  }
  const kept = capList(links, maxPoints, warnings, "sankey");
  if (!kept.length) {
    warnings.push(warn("CK8005", "Sankey has no flows.", "/data"));
    return null;
  }
  const top = kept.reduce((best, link) => (link.flow > best.flow ? link : best), kept[0]);
  const diagramTitle = meta.title;
  const spec: Record<string, unknown> = {
    version: "1",
    type: "sankey",
    data: kept.map((link) => ({ from: link.from, to: link.to, flow: link.flow })),
    encoding: { source: "from", target: "to", y: "flow" },
    a11y: { alt: chooseAlt(meta, diagramTitle, `The largest flow is ${top.from} to ${top.to} at ${top.flow}.`) },
  };
  if (diagramTitle) spec.title = diagramTitle;
  return spec;
}

function buildRadar(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported radar header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  const axes: { id: string; label: string }[] = [];
  const curves: { name: string; values: number[] }[] = [];
  let declaredMax: number | null = null;
  let showLegend = true;
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    const axis = trimmed.match(/^axis\b\s*(.*)$/i);
    if (axis) {
      axes.push(...parseNamed(axis[1] ?? ""));
      continue;
    }
    const curve = trimmed.match(/^curve\b\s+([A-Za-z_][\w-]*)\s*(?:\[\s*(?:"([^"]*)"|'([^']*)')\s*\])?\s*\{([^}]*)\}/i);
    if (curve) {
      const values = curve[4].split(",").map((item) => Number(item.trim())).filter((value) => Number.isFinite(value));
      curves.push({ name: curve[2] || curve[3] || curve[1], values });
      continue;
    }
    const max = trimmed.match(/^max\b\s*([+-]?(?:\d+\.?\d*|\.\d+))/i);
    if (max) {
      declaredMax = Number(max[1]);
      continue;
    }
    const min = trimmed.match(/^min\b\s*([+-]?(?:\d+\.?\d*|\.\d+))/i);
    if (min) {
      if (Number(min[1]) !== 0) warnings.push(warn("CK8004", "Radar starts at zero, so the declared min is not drawn.", "/encoding/y"));
      continue;
    }
    if (/^ticks\b/i.test(trimmed)) {
      warnings.push(warn("CK8004", "Radar ring count is fixed, so ticks are not drawn.", ""));
      continue;
    }
    if (/^graticule\b/i.test(trimmed)) {
      if (/circle/i.test(trimmed)) warnings.push(warn("CK8004", "Radar graticule is a polygon; circle was not drawn.", ""));
      continue;
    }
    const legend = trimmed.match(/^showLegend\b\s*:?\s*(true|false|yes|no)/i);
    if (legend) {
      showLegend = /true|yes/i.test(legend[1]);
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    warnings.push(warn("CK8004", `Unsupported radar line "${clipText(trimmed)}".`, ""));
  }
  if (!curves.length) {
    warnings.push(warn("CK8005", "Radar has no curves.", "/encoding/y"));
    return null;
  }
  const width = Math.max(...curves.map((curve) => curve.values.length));
  if (!axes.length) {
    if (width < 3) {
      warnings.push(warn("CK8005", "Radar needs at least three spokes.", "/encoding/x"));
      return null;
    }
    warnings.push(warn("CK8004", "Radar axis labels were missing; spokes are numbered.", "/encoding/x"));
    for (let i = 0; i < width; i++) axes.push({ id: `a${i + 1}`, label: String(i + 1) });
  }
  if (axes.length < 3) {
    warnings.push(warn("CK8005", "Radar needs at least three spokes.", "/encoding/x"));
    return null;
  }
  const spokeCount = Math.min(axes.length, width);
  if (axes.length !== width) warnings.push(warn("CK8004", "Radar curves do not match the spoke count; extra values were dropped.", "/data"));
  const points = spokeCount * curves.length;
  const keptSpokes = points <= maxPoints ? spokeCount : Math.max(0, Math.floor(maxPoints / curves.length));
  if (keptSpokes < 3) {
    warnings.push(warn("CK8002", `Radar has ${points} points; the limit is ${maxPoints}.`, "/data"));
    return null;
  }
  if (keptSpokes < spokeCount) {
    warnings.push(warn("CK8002", `Radar has ${points} points; kept the first ${keptSpokes} spokes.`, "/data"));
  }
  const spokes = axes.slice(0, keptSpokes);
  const radarMax = declaredMax !== null && declaredMax > 0 ? declaredMax : null;
  if (declaredMax !== null && radarMax === null) {
    warnings.push(warn("CK8004", "Radar scales to the largest value, so the declared max is not drawn.", "/encoding/y"));
  }
  const rows: Record<string, string | number>[] = [];
  let best = { name: curves[0].name, value: -Infinity, spoke: spokes[0].label };
  curves.forEach((curve) => {
    spokes.forEach((spoke, index) => {
      const value = curve.values[index] ?? 0;
      rows.push({ spoke: spoke.label, series: curve.name, value });
      if (value > best.value) best = { name: curve.name, value, spoke: spoke.label };
    });
  });
  const spec: Record<string, unknown> = {
    version: "1",
    type: "radar",
    data: rows,
    encoding: {
      x: "spoke",
      y: radarMax === null ? "value" : { field: "value", scale: { domain: [0, radarMax] } },
      series: "series",
    },
    a11y: { alt: chooseAlt(meta, diagramTitle, `${best.name} is highest on ${best.spoke}.`) },
  };
  if (diagramTitle) spec.title = diagramTitle;
  if (!showLegend) spec.legend = false;
  return spec;
}

interface TreeItem {
  indent: number;
  name: string;
  value?: number;
}

function buildTreemap(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported treemap header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  const items: TreeItem[] = [];
  for (const line of body) {
    if (!line.trim()) continue;
    const title = parseTitle(line.trim());
    if (title && !line.includes(":")) {
      diagramTitle = title;
      continue;
    }
    if (dropDirective(line.trim(), warnings)) continue;
    const indent = line.match(/^[ \t]*/)?.[0].replace(/\t/g, "  ").length ?? 0;
    const trimmed = line.trim();
    const parsed = trimmed.match(/^(?:"([^"]*)"|'([^']*)'|([^:]+?))(?:\s*:\s*([+-]?(?:\d+\.?\d*|\.\d+)))?\s*$/);
    if (!parsed) {
      warnings.push(warn("CK8004", `Unsupported treemap line "${clipText(trimmed)}".`, "/data"));
      continue;
    }
    const name = (parsed[1] ?? parsed[2] ?? parsed[3] ?? "").trim();
    const value = parsed[4] === undefined ? undefined : Number(parsed[4]);
    items.push({ indent, name, value });
  }
  const leaves: { name: string; value: number; group?: string }[] = [];
  const stack: { indent: number; name: string }[] = [];
  let deep = false;
  let parentValue = false;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    while (stack.length && stack[stack.length - 1].indent >= item.indent) stack.pop();
    const next = items[i + 1];
    const hasChild = next !== undefined && next.indent > item.indent;
    if (hasChild) {
      if (item.value !== undefined) parentValue = true;
      if (stack.length >= 1) deep = true;
      stack.push({ indent: item.indent, name: item.name });
      continue;
    }
    if (item.value === undefined || item.value <= 0) {
      warnings.push(warn("CK8004", `Treemap leaf "${item.name}" has no positive value.`, "/data"));
      continue;
    }
    const group = stack[0]?.name;
    leaves.push({ name: item.name, value: item.value, group });
  }
  if (deep) warnings.push(warn("CK8004", "Treemap keeps one group level; deeper sections were flattened.", "/encoding/color"));
  if (parentValue) warnings.push(warn("CK8004", "A treemap section value is ignored; the tile uses its leaves.", "/data"));
  const kept = capList(leaves, maxPoints, warnings, "treemap");
  if (!kept.length) {
    warnings.push(warn("CK8005", "Treemap has no leaves.", "/data"));
    return null;
  }
  const grouped = kept.some((leaf) => leaf.group);
  const top = kept.reduce((best, leaf) => (leaf.value > best.value ? leaf : best), kept[0]);
  const spec: Record<string, unknown> = {
    version: "1",
    type: "treemap",
    data: kept.map((leaf) => (grouped ? { name: leaf.name, size: leaf.value, group: leaf.group ?? "Group" } : { name: leaf.name, size: leaf.value })),
    encoding: grouped ? { x: "name", y: "size", color: "group" } : { x: "name", y: "size" },
    a11y: { alt: chooseAlt(meta, diagramTitle, `${top.name} is the largest block at ${top.value}.`) },
  };
  if (diagramTitle) spec.title = diagramTitle;
  return spec;
}

function buildQuadrant(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported quadrant header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  let xTitle: string | undefined;
  let yTitle: string | undefined;
  const quadrant = ["", "", "", ""];
  const points: { name: string; x: number; y: number }[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    const axis = trimmed.match(/^(x-axis|y-axis)\b\s*(.*)$/i);
    if (axis) {
      const label = axisLabel(axis[2] ?? "");
      if (/^x-axis/i.test(axis[1])) xTitle = label;
      else yTitle = label;
      continue;
    }
    const quad = trimmed.match(/^quadrant-([1-4])\b\s*:?\s*(.*)$/i);
    if (quad) {
      quadrant[Number(quad[1]) - 1] = unquote(quad[2].trim());
      continue;
    }
    const point = trimmed.match(/^(.+?)\s*:\s*\[\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*,\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*\]\s*(.*)$/);
    if (point) {
      if (point[4] && /radius/i.test(point[4])) warnings.push(warn("CK8004", "Quadrant point radius is not drawn.", "/mark"));
      else if (point[4].trim()) warnings.push(warn("CK8004", `Unsupported quadrant point suffix "${clipText(point[4])}".`, "/data"));
      points.push({ name: unquote(point[1].trim()), x: Number(point[2]), y: Number(point[3]) });
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    warnings.push(warn("CK8004", `Unsupported quadrant line "${clipText(trimmed)}".`, ""));
  }
  const kept = capList(points, maxPoints, warnings, "quadrant");
  if (!kept.length) {
    warnings.push(warn("CK8005", "Quadrant chart has no points.", "/data"));
    return null;
  }
  const xDomain: [number, number] = [Math.min(0, ...kept.map((point) => point.x)), Math.max(1, ...kept.map((point) => point.x))];
  const yDomain: [number, number] = [Math.min(0, ...kept.map((point) => point.y)), Math.max(1, ...kept.map((point) => point.y))];
  const names = [quadrant[1], quadrant[0], quadrant[2], quadrant[3]];
  const lead = kept[0];
  const spec: Record<string, unknown> = {
    version: "1",
    type: "quadrant",
    data: kept.map((point) => ({ name: point.name, x: point.x, y: point.y })),
    encoding: {
      x: axisChannel("x", xTitle, xDomain),
      y: axisChannel("y", yTitle, yDomain),
    },
    a11y: { alt: chooseAlt(meta, diagramTitle, `${lead.name} is plotted at ${lead.x}, ${lead.y}.`) },
  };
  if (names.some(Boolean)) spec.quadrants = names;
  if (diagramTitle) spec.title = diagramTitle;
  return spec;
}

function axisChannel(field: string, title: string | undefined, domain: [number, number]): string | Record<string, unknown> {
  const wide = domain[0] !== 0 || domain[1] !== 1;
  if (!title && !wide) return field;
  const channel: Record<string, unknown> = { field };
  if (title) channel.title = title;
  if (wide) channel.scale = { domain };
  return channel;
}

function axisLabel(rest: string): string {
  const parts = rest.split(/\s*-->\s*/);
  if (parts.length === 2) return `${unquote(parts[0].trim())}|${unquote(parts[1].trim())}`;
  return unquote(rest.trim());
}

function buildGantt(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported gantt header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  let section = "";
  let cursor = "";
  const ends = new Map<string, string>();
  const rows: Record<string, unknown>[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    const named = trimmed.match(/^(section|dateFormat|axisFormat|excludes|inclusiveEndDates|weekday|tickInterval|todayMarker)\b\s*(.*)$/i);
    if (named) {
      const key = named[1].toLowerCase();
      if (key === "section") section = unquote(named[2].trim());
      else if (key === "dateformat" && named[2].trim() !== "YYYY-MM-DD") warnings.push(warn("CK8004", "dateFormat other than YYYY-MM-DD is not applied.", ""));
      else if (key !== "dateformat") warnings.push(warn("CK8004", `Unsupported gantt line "${clipText(trimmed)}".`, ""));
      continue;
    }
    const colon = trimmed.indexOf(":");
    if (colon < 0) {
      warnings.push(warn("CK8004", `Unsupported gantt line "${clipText(trimmed)}".`, ""));
      continue;
    }
    const read = ganttRow(unquote(trimmed.slice(0, colon).trim()), trimmed.slice(colon + 1), section, cursor, ends, warnings);
    if (!read) continue;
    rows.push(read.row);
    cursor = read.cursor || cursor;
  }
  return scheduleSpec("gantt", rows, meta, diagramTitle, maxPoints, warnings, "Gantt has no tasks.");
}

function ganttRow(
  task: string,
  rest: string,
  section: string,
  cursor: string,
  ends: Map<string, string>,
  warnings: ImportWarning[],
): { row: Record<string, unknown>; cursor: string } | null {
  if (!task || /^vert\b/i.test(task)) {
    if (task) warnings.push(warn("CK8004", "Gantt vert markers are not drawn.", ""));
    return null;
  }
  let rank = 0;
  let status = "";
  let milestone = false;
  let id = "";
  const depends: string[] = [];
  const dates: string[] = [];
  let duration = "";
  for (const token of rest.split(",").map((part) => part.trim()).filter(Boolean)) {
    const tag = token.toLowerCase();
    const weight = tag === "crit" ? 3 : tag === "active" ? 2 : tag === "done" ? 1 : 0;
    if (weight) {
      if (weight > rank) {
        rank = weight;
        status = tag;
      }
      continue;
    }
    if (tag === "milestone") {
      milestone = true;
      continue;
    }
    const after = token.match(/^after\s+(\S+)$/i);
    if (after) {
      depends.push(after[1]);
      continue;
    }
    const date = token.match(/^(\d{4}-\d{2}-\d{2})/);
    if (date) {
      dates.push(date[1]);
      if (token.length !== date[1].length) warnings.push(warn("CK8004", "A gantt time of day is not drawn.", ""));
      continue;
    }
    const span = token.match(/^(\d+(?:\.\d+)?)([dw])$/i);
    if (span) {
      duration = `${span[1]}${span[2].toLowerCase()}`;
      if (span[2].toLowerCase() === "d" && Number(span[1]) === 0) milestone = true;
      continue;
    }
    if (!id && /^[A-Za-z_][\w-]*$/.test(token)) {
      id = token;
      continue;
    }
    warnings.push(warn("CK8004", `Unsupported gantt value "${clipText(token)}".`, "/data"));
  }
  let start = dates[0] ?? "";
  if (!start) start = depends.map((item) => ends.get(item)).find(Boolean) || cursor;
  if (!start) warnings.push(warn("CK8004", `Gantt task "${clipText(task)}" has no start.`, "/data"));
  const end = dates[1] || (start && duration && !milestone ? shiftISO(start, durationDays(duration)) : milestone && start ? start : "");
  const row: Record<string, unknown> = { task };
  if (section) row.section = section;
  if (id) row.id = id;
  if (start) row.start = start;
  if (dates[1]) row.end = dates[1];
  else if (duration && !milestone) row.duration = duration;
  if (milestone) row.milestone = true;
  if (status) row.status = status;
  if (depends.length) row.depends = depends.join(", ");
  if (id && end) ends.set(id, end);
  return { row, cursor: end || cursor };
}

function buildTimeline(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported timeline header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  let current = "";
  const rows: Record<string, unknown>[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    if (/^section\b/i.test(trimmed)) {
      warnings.push(warn("CK8004", "Timeline sections are not date spans.", ""));
      continue;
    }
    const continued = trimmed.startsWith(":");
    const colon = continued ? 0 : trimmed.indexOf(":");
    const time = colon <= 0 ? current : trimmed.slice(0, colon).trim();
    if (colon > 0) current = time;
    const when = timeSpan(time);
    if (!when) {
      if (time) warnings.push(warn("CK8004", `Timeline period "${clipText(time)}" is not a date.`, ""));
      continue;
    }
    const labels = trimmed.slice(colon + 1).split(":").map((part) => unquote(part.trim())).filter(Boolean);
    for (const label of labels) rows.push(when.end ? { label, start: when.start, end: when.end } : { label, date: when.start });
  }
  return scheduleSpec("timeline", rows, meta, diagramTitle, maxPoints, warnings, "Timeline has no events.");
}

function buildJourney(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported journey header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  let section = "";
  const rows: Record<string, unknown>[] = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    const named = trimmed.match(/^section\b\s*(.*)$/i);
    if (named) {
      section = unquote(named[1].trim());
      continue;
    }
    const task = trimmed.match(/^(.*?):\s*([1-5])\s*(?::\s*(.*))?$/);
    if (!task) {
      warnings.push(warn("CK8004", `Unsupported journey line "${clipText(trimmed)}".`, ""));
      continue;
    }
    if (!section) warnings.push(warn("CK8004", "Journey task has no section.", "/data"));
    const actors = (task[3] ?? "").split(",").map((part) => unquote(part.trim())).filter(Boolean).join(", ");
    const row: Record<string, unknown> = { step: unquote(task[1].trim()), score: Number(task[2]) };
    if (section) row.section = section;
    if (actors) row.actors = actors;
    rows.push(row);
  }
  return scheduleSpec("journey", rows, meta, diagramTitle, maxPoints, warnings, "Journey has no tasks.");
}

function buildVenn(headerRest: string, body: string[], meta: Meta, maxPoints: number, warnings: ImportWarning[]): Record<string, unknown> | null {
  if (headerRest) warnings.push(warn("CK8004", `Unsupported venn header "${clipText(headerRest)}".`, ""));
  let diagramTitle = meta.title;
  const labels = new Map<string, string>();
  const rows: Record<string, unknown>[] = [];
  let sets = 0;
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const title = parseTitle(trimmed);
    if (title) {
      diagramTitle = title;
      continue;
    }
    if (dropDirective(trimmed, warnings)) continue;
    if (/^text\b/i.test(trimmed)) {
      warnings.push(warn("CK8004", "Venn text is not drawn.", ""));
      continue;
    }
    const set = trimmed.match(/^set\b\s*(.*)$/i);
    const union = trimmed.match(/^union\b\s*(.*)$/i);
    if (!set && !union) {
      warnings.push(warn("CK8004", `Unsupported venn line "${clipText(trimmed)}".`, ""));
      continue;
    }
    const item = vennItem((set ?? union)?.[1] ?? "");
    if (!item) {
      warnings.push(warn("CK8004", `Unsupported venn line "${clipText(trimmed)}".`, ""));
      continue;
    }
    if (set) {
      labels.set(item.id, item.label);
      sets += 1;
      rows.push({ set: item.label, size: item.size ?? 1 });
      continue;
    }
    if (item.size == null) {
      warnings.push(warn("CK8004", "Venn overlap has no size.", "/data"));
      continue;
    }
    const names = item.ids.map((id) => labels.get(id) ?? id);
    rows.push({ set: names.join("+"), size: item.size });
  }
  if (sets > 3) warnings.push(warn("CK8004", "Venn draws 2 or 3 sets.", "/data"));
  const lead = rows[0];
  const factual = typeof lead?.set === "string" ? `${lead.set} is a set in the diagram.` : "Sets overlap.";
  return scheduleSpec("venn", rows, meta, diagramTitle, maxPoints, warnings, "Venn has no sets.", factual);
}

function scheduleSpec(
  type: string,
  rows: Record<string, unknown>[],
  meta: Meta,
  diagramTitle: string | undefined,
  maxPoints: number,
  warnings: ImportWarning[],
  empty: string,
  factual?: string,
): Record<string, unknown> | null {
  const kept = capList(rows, maxPoints, warnings, type);
  if (!kept.length) {
    warnings.push(warn("CK8005", empty, "/data"));
    return null;
  }
  const spec: Record<string, unknown> = {
    version: "1",
    type,
    data: kept,
    a11y: { alt: chooseAlt(meta, diagramTitle, factual ?? `${type} has ${kept.length} rows.`) },
  };
  if (diagramTitle) spec.title = diagramTitle;
  return spec;
}

function timeSpan(text: string): { start: string; end?: string } | null {
  const range = text.trim().match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?\s*[-/]\s*(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (range) return { start: ymd(range[1], range[2], range[3]), end: ymd(range[4], range[5], range[6]) };
  const one = text.trim().match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  return one ? { start: ymd(one[1], one[2], one[3]) } : null;
}

function ymd(year: string, month?: string, day?: string): string {
  return `${year}-${(month ?? "01").padStart(2, "0")}-${(day ?? "01").padStart(2, "0")}`;
}

function durationDays(token: string): number {
  const match = /^(\d+(?:\.\d+)?)([dw])$/i.exec(token);
  const count = Number(match?.[1] ?? 0);
  return match?.[2]?.toLowerCase() === "w" ? count * 7 : count;
}

function shiftISO(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) + days * 86400000).toISOString().slice(0, 10);
}

function vennItem(rest: string): { id: string; ids: string[]; label: string; size: number | null } | null {
  let body = rest.trim();
  let size: number | null = null;
  const sized = body.match(/:\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*$/);
  if (sized?.[1] && sized.index != null) {
    size = Number(sized[1]);
    body = body.slice(0, sized.index).trim();
  }
  const bracket = body.match(/^(.*?)\s*\[\s*(?:"([^"]*)"|'([^']*)'|([^\]]+?))\s*\]\s*$/);
  const label = bracket ? (bracket[2] ?? bracket[3] ?? bracket[4] ?? "").trim() : "";
  if (bracket) body = bracket[1].trim().replace(/,\s*$/, "");
  const ids = body.split(",").map((part) => unquote(part.trim())).filter(Boolean);
  if (!ids.length) return null;
  return { id: ids[0], ids, label: label || ids[0], size };
}

function parseAxis(rest: string): { title?: string; categories: string[] | null; range: { min: number; max: number } | null } | null {
  let body = rest.trim();
  let title: string | undefined;
  if (body.startsWith('"') || body.startsWith("'")) {
    const quoted = readQuoted(body);
    if (quoted) {
      title = quoted.value;
      body = quoted.rest.trim();
    }
  }
  if (body.startsWith("[")) {
    const list = readBracketList(body);
    if (!list.ok) return null;
    return { title, categories: list.items, range: null };
  }
  const range = body.match(/^([+-]?(?:\d+\.?\d*|\.\d+))\s*-->\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*$/);
  if (range) return { title, categories: null, range: { min: Number(range[1]), max: Number(range[2]) } };
  const bracket = body.indexOf("[");
  if (bracket > 0) {
    title = title ?? body.slice(0, bracket).trim();
    const list = readBracketList(body.slice(bracket));
    if (!list.ok) return null;
    return { title, categories: list.items, range: null };
  }
  const arrow = body.match(/^(.*?)\s+([+-]?(?:\d+\.?\d*|\.\d+))\s*-->\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*$/);
  if (arrow) {
    return { title: title ?? arrow[1].trim(), categories: null, range: { min: Number(arrow[2]), max: Number(arrow[3]) } };
  }
  if (body.includes(",")) return { title, categories: splitList(body), range: null };
  return body ? null : { title, categories: null, range: null };
}

function parseSeries(rest: string): { name?: string; values: number[] } | null {
  let body = rest.trim();
  let name: string | undefined;
  if (body.startsWith('"') || body.startsWith("'")) {
    const quoted = readQuoted(body);
    if (quoted) {
      name = quoted.value;
      body = quoted.rest.trim();
    }
  }
  const list = readBracketList(body);
  if (!list.ok) return null;
  const values: number[] = [];
  for (const item of list.items) {
    const value = Number(item);
    if (!Number.isFinite(value)) return null;
    values.push(value);
  }
  return { name, values };
}

function parseNamed(source: string): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  const re = /([A-Za-z_][\w-]*)\s*(?:\[\s*(?:"([^"]*)"|'([^']*)')\s*\])?/g;
  for (const match of source.matchAll(re)) out.push({ id: match[1], label: match[2] || match[3] || match[1] });
  return out;
}

function parseCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) {
        if (line[i + 1] === quote) {
          cur += quote;
          i += 1;
        } else quote = null;
      } else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ",") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out.filter((cell, index) => cell.length > 0 || index < 3);
}

function readBracketList(input: string): { items: string[]; ok: boolean } {
  const start = input.indexOf("[");
  const end = input.lastIndexOf("]");
  if (start < 0 || end <= start) return { items: [], ok: false };
  return { items: splitList(input.slice(start + 1, end)), ok: true };
}

function splitList(inner: string): string[] {
  const items: string[] = [];
  let cur = "";
  let quote: string | null = null;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ",") {
      if (cur.trim()) items.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) items.push(cur.trim());
  return items;
}

function readQuoted(input: string): { value: string; rest: string } | null {
  const quote = input[0];
  if (quote !== '"' && quote !== "'") return null;
  let value = "";
  for (let i = 1; i < input.length; i++) {
    if (input[i] === quote) return { value, rest: input.slice(i + 1) };
    value += input[i];
  }
  return { value, rest: "" };
}

function parseTitle(line: string): string | null {
  const match = line.match(/^title\b\s*(.*)$/i);
  if (!match) return null;
  return unquote(match[1].trim());
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
  return value;
}

function dropDirective(line: string, warnings: ImportWarning[]): boolean {
  if (/^(click|style|classDef|class)\b/i.test(line) || /\bhref\b/i.test(line)) {
    warnings.push(warn("CK8004", `Dropped "${clipText(line)}". Links and styles are not copied into the chart.`, ""));
    return true;
  }
  return false;
}

function chooseAlt(meta: Meta, title: string | undefined, factual: string): string {
  const provided = (meta.accDescr || title || meta.accTitle || "").trim();
  if (provided.length >= 10) return provided;
  if (provided) return `${provided}. ${factual}`;
  return factual.length >= 10 ? factual : `${factual} Values are plotted.`;
}

function capCount(count: number, series: number, max: number, warnings: ImportWarning[], what: string): number {
  const total = count * series;
  if (total <= max) return count;
  const kept = Math.max(0, Math.floor(max / Math.max(1, series)));
  warnings.push(warn("CK8002", `${what} has ${total} points; kept the first ${kept * series}.`, "/data"));
  return kept;
}

function capList<T>(items: T[], max: number, warnings: ImportWarning[], what: string): T[] {
  if (items.length <= max) return items;
  warnings.push(warn("CK8002", `${what} has ${items.length} points; kept the first ${max}.`, "/data"));
  return items.slice(0, max);
}

function clipText(value: string): string {
  return value.length > 80 ? `${value.slice(0, 77)}...` : value;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
