/**
 * Facets, concatenated views, and breakpoint overrides.
 * `render()` calls `arrange` before the chart renderer. A spec with none of
 * these returns null and the chart draws unchanged.
 */
import { readTable } from "./frame";
import type { DataTable } from "./data";
import { esc, font, isRecord } from "./svg";

export type Draw = (spec: Record<string, unknown>) => string | null;

interface Rule {
  maxWidth?: number;
  minWidth?: number;
  legend?: boolean;
  direction?: string;
  columns?: number;
  rows?: number;
  wrap?: boolean;
  scales?: string;
  facetLegend?: string;
  concatDirection?: string;
}

/** rtl when layout.direction says so. ltr and anything else stay left to right. */
export function directionOf(spec: Record<string, unknown>): "ltr" | "rtl" {
  const layout = isRecord(spec.layout) ? spec.layout : undefined;
  return layout?.direction === "rtl" ? "rtl" : "ltr";
}

export function arrange(spec: Record<string, unknown>, draw: Draw): string | null {
  const layout = isRecord(spec.layout) ? spec.layout : undefined;
  if (!layout) return null;
  const rules = ruleList(layout.breakpoints);
  const width = widthOf(spec);
  const patched = rules.length && width != null ? applyRule(spec, matchRule(rules, width)) : null;
  const next = patched ?? spec;
  const box = isRecord(next.layout) ? next.layout : undefined;
  let svg: string | null = null;
  const facet = box && isRecord(box.facet) ? box.facet : undefined;
  const concat = box && isRecord(box.concat) ? box.concat : undefined;
  if (facet && typeof facet.field === "string" && facet.field) svg = facetSvg(next, draw);
  else if (concat && Array.isArray(concat.views) && concat.views.length) svg = concatSvg(next, draw);
  else if (patched) svg = draw(patched);
  if (!svg && rules.length) svg = draw(spec);
  if (!svg) return null;
  if (rules.length) svg = stampBreak(svg, rules);
  return svg;
}

function widthOf(spec: Record<string, unknown>): number | null {
  const size = isRecord(spec.size) ? spec.size : undefined;
  return size && typeof size.width === "number" && size.width > 0 ? size.width : null;
}

function ruleList(value: unknown): Rule[] {
  if (!Array.isArray(value)) return [];
  const out: Rule[] = [];
  for (const item of value) if (isRecord(item)) out.push(item as Rule);
  return out;
}

function matchRule(rules: Rule[], width: number): Rule | null {
  for (const rule of rules) {
    if (typeof rule.maxWidth === "number" && !(width <= rule.maxWidth)) continue;
    if (typeof rule.minWidth === "number" && !(width >= rule.minWidth)) continue;
    return rule;
  }
  return null;
}

function applyRule(spec: Record<string, unknown>, rule: Rule | null): Record<string, unknown> | null {
  if (!rule) return null;
  const next: Record<string, unknown> = { ...spec };
  const layout = isRecord(spec.layout) ? { ...spec.layout } : {};
  let changed = false;
  if (typeof rule.legend === "boolean") {
    next.legend = rule.legend;
    changed = true;
  }
  if (rule.direction === "rtl" || rule.direction === "ltr") {
    layout.direction = rule.direction;
    changed = true;
  }
  if (rule.columns != null || rule.rows != null || typeof rule.wrap === "boolean" || rule.scales || rule.facetLegend) {
    const facet = isRecord(layout.facet) ? { ...layout.facet } : {};
    if (typeof rule.columns === "number") facet.columns = rule.columns;
    if (typeof rule.rows === "number") facet.rows = rule.rows;
    if (typeof rule.wrap === "boolean") facet.wrap = rule.wrap;
    if (rule.scales === "shared" || rule.scales === "independent") facet.scales = rule.scales;
    if (rule.facetLegend === "shared" || rule.facetLegend === "each") facet.legend = rule.facetLegend;
    layout.facet = facet;
    changed = true;
  }
  if ((rule.concatDirection === "horizontal" || rule.concatDirection === "vertical") && isRecord(layout.concat)) {
    layout.concat = { ...layout.concat, direction: rule.concatDirection };
    changed = true;
  }
  delete layout.breakpoints;
  next.layout = layout;
  return changed ? next : null;
}

function stampBreak(svg: string, rules: Rule[]): string {
  if (!svg.startsWith("<svg") || svg.includes("data-ck-bp=")) return svg;
  const label = rules
    .map((rule) => (typeof rule.maxWidth === "number" ? String(Math.round(rule.maxWidth)) : "*"))
    .join(",");
  return `<svg data-ck-bp="${esc(label)}"${svg.slice(4)}`;
}

function facetSvg(spec: Record<string, unknown>, draw: Draw): string | null {
  const layout = isRecord(spec.layout) ? spec.layout : {};
  const facet = isRecord(layout.facet) ? layout.facet : {};
  const field = typeof facet.field === "string" ? facet.field : "";
  const table = readTable(spec);
  if (!table || !field || !table.fields.includes(field)) return null;
  const rows = rowsOf(table);
  const groups = group(rows, field);
  if (groups.length < 1) return null;
  const wrap = facet.wrap !== false;
  const columns = intOr(facet.columns);
  const rowCount = intOr(facet.rows);
  const grid = gridOf(groups.length, columns, rowCount, wrap);
  const shown = groups.slice(0, grid.show);
  const shared = facet.scales !== "independent";
  const oneLegend = facet.legend !== "each";
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const xField = channelField(encoding.x);
  const cats = xField ? categories(rows, xField) : [];
  const yNames = yFields(encoding);
  const domain = shared ? extent(rows, yNames, spec.type) : null;
  const legends = legendNames(spec, rows);
  const { w, h } = sizeOf(spec, 720, 480);
  const gap = 12;
  const head = (spec.title ? 28 : 6) + (spec.subtitle ? 16 : 0);
  const legendH = oneLegend && legends.length > 1 ? 32 : 0;
  const panelW = Math.max(96, Math.floor((w - gap * (grid.cols - 1)) / grid.cols));
  const room = Math.max(120, h - head - legendH - 8);
  const panelH = Math.max(110, Math.floor((room - gap * (grid.rows - 1)) / grid.rows));
  const height = head + grid.rows * panelH + gap * Math.max(0, grid.rows - 1) + legendH + 8;
  const panels: string[] = [];
  let inks: string[] = [];
  for (let i = 0; i < shown.length; i++) {
    const groupRow = shown[i];
    if (!groupRow) continue;
    const col = i % grid.cols;
    const row = Math.floor(i / grid.cols);
    const child = panelSpec(spec, groupRow, i, panelW, panelH, {
      xField,
      cats,
      domain,
      sharedLegend: oneLegend,
      keepX: row === grid.rows - 1,
      keepY: col === 0,
    });
    const drawn = draw(child);
    if (!drawn) continue;
    const body = scope(drawn, `p${i}`);
    if (!inks.length) inks = paints(body);
    const x = col * (panelW + gap);
    const y = head + row * (panelH + gap);
    panels.push(`<g data-ck-panel="${esc(groupRow.key)}" transform="translate(${x} ${y})">${inner(body)}</g>`);
  }
  if (!panels.length) return null;
  const legend =
    oneLegend && legends.length > 1
      ? sharedLegend(legends, inks, 8, height - legendH + 4, w - 16)
      : "";
  const rtl = directionOf(spec) === "rtl";
  const titleX = rtl ? w - 8 : 8;
  const anchor = rtl ? ' text-anchor="end"' : "";
  const title = spec.title ? `<text x="${titleX}" y="20"${anchor} fill="var(--ck-text, light-dark(#1d1d1f,#f5f5f7))" font-size="15" font-weight="650" font-family="${font()}">${esc(String(spec.title))}</text>` : "";
  const subtitle = spec.subtitle
    ? `<text x="${titleX}" y="${spec.title ? 38 : 18}"${anchor} fill="var(--ck-muted, light-dark(#6e6e73,#a1a1a6))" font-size="12" font-family="${font()}">${esc(String(spec.subtitle))}</text>`
    : "";
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : String(spec.title ?? "Small multiples");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${height}" viewBox="0 0 ${w} ${height}" role="img" aria-label="${esc(alt)}" class="ck-chart" data-ck-type="${esc(String(spec.type ?? "chart"))}" data-ck-facet="${shown.length}" data-ck-cols="${grid.cols}" data-ck-rows="${grid.rows}" data-ck-scales="${shared ? "shared" : "independent"}" data-ck-legend="${oneLegend ? "shared" : "each"}"${rtl ? ' dir="rtl"' : ""}>` +
    `<title>${esc(String(spec.title ?? alt))}</title><desc>${esc(alt)}</desc>` +
    title +
    subtitle +
    panels.join("") +
    legend +
    `</svg>`
  );
}

function panelSpec(
  spec: Record<string, unknown>,
  groupRow: { key: string; rows: Record<string, unknown>[] },
  index: number,
  width: number,
  height: number,
  opts: {
    xField: string;
    cats: string[];
    domain: [number, number] | null;
    sharedLegend: boolean;
    keepX: boolean;
    keepY: boolean;
  },
): Record<string, unknown> {
  const encoding = isRecord(spec.encoding) ? { ...spec.encoding } : {};
  if (opts.domain) encoding.y = lockY(encoding.y, opts.domain);
  const data = opts.xField && opts.cats.length ? padCats(groupRow.rows, opts.xField, opts.cats, yFields(encoding)) : groupRow.rows;
  const axes = axesOf(spec.axes, opts.keepX, opts.keepY);
  const layout = directionOf(spec) === "rtl" ? { direction: "rtl" } : undefined;
  const child: Record<string, unknown> = {
    ...spec,
    id: `facet${index}`,
    title: groupRow.key,
    subtitle: undefined,
    data,
    encoding,
    size: { width, height },
    a11y: { alt: `${groupRow.key}. ${isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : ""}`.trim() },
  };
  if (opts.sharedLegend) child.legend = false;
  if (axes) child.axes = axes;
  else delete child.axes;
  if (layout) child.layout = layout;
  else delete child.layout;
  delete child.interaction;
  return child;
}

function axesOf(value: unknown, keepX: boolean, keepY: boolean): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined;
  const axes: Record<string, unknown> = {};
  for (const key of ["x", "y", "y2"]) {
    const box = value[key];
    if (!isRecord(box)) {
      if (box !== undefined) axes[key] = box;
      continue;
    }
    const next = { ...box };
    if ((key === "x" && !keepX) || (key !== "x" && !keepY)) delete next.title;
    axes[key] = next;
  }
  return axes;
}

function concatSvg(spec: Record<string, unknown>, draw: Draw): string | null {
  const layout = isRecord(spec.layout) ? spec.layout : {};
  const concat = isRecord(layout.concat) ? layout.concat : {};
  const views = Array.isArray(concat.views) ? concat.views.filter(isRecord) : [];
  if (!views.length) return null;
  const horizontal = concat.direction === "horizontal";
  const gap = typeof concat.gap === "number" && concat.gap >= 0 ? Math.min(64, concat.gap) : 16;
  const { w, h } = sizeOf(spec, 720, 280 * views.length);
  const head = spec.title ? 28 : 0;
  const count = views.length;
  const panelW = horizontal ? Math.max(80, Math.floor((w - gap * (count - 1)) / count)) : w;
  const panelH = horizontal ? Math.max(80, h - head) : Math.max(80, Math.floor((h - head - gap * (count - 1)) / count));
  const height = horizontal ? head + panelH : head + count * panelH + gap * (count - 1);
  const width = horizontal ? count * panelW + gap * (count - 1) : w;
  const parts: string[] = [];
  for (let i = 0; i < views.length; i++) {
    const view = views[i];
    if (!view || typeof view.type !== "string") continue;
    const child: Record<string, unknown> = {
      ...view,
      theme: view.theme ?? spec.theme,
      locale: view.locale ?? spec.locale,
      size: { width: panelW, height: panelH },
    };
    if (!child.a11y) child.a11y = { alt: typeof view.title === "string" ? view.title : `View ${i + 1}` };
    delete child.layout;
    const drawn = draw(child);
    const x = horizontal ? i * (panelW + gap) : 0;
    const y = head + (horizontal ? 0 : i * (panelH + gap));
    const body = drawn ? inner(scope(drawn, `v${i}`)) : missingView(view, panelW, panelH);
    parts.push(`<g data-ck-view="${i}" transform="translate(${x} ${y})">${body}</g>`);
  }
  if (!parts.length) return null;
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : "Composed charts";
  const rtl = directionOf(spec) === "rtl";
  const title = spec.title
    ? `<text x="${rtl ? width - 8 : 8}" y="20"${rtl ? ' text-anchor="end"' : ""} fill="var(--ck-text, light-dark(#1d1d1f,#f5f5f7))" font-size="15" font-weight="650" font-family="${font()}">${esc(String(spec.title))}</text>`
    : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(alt)}" class="ck-chart" data-ck-type="concat" data-ck-views="${parts.length}" data-ck-flow="${horizontal ? "horizontal" : "vertical"}"${rtl ? ' dir="rtl"' : ""}>` +
    `<title>${esc(String(spec.title ?? alt))}</title><desc>${esc(alt)}</desc>${title}${parts.join("")}</svg>`
  );
}

function missingView(view: Record<string, unknown>, width: number, height: number): string {
  const title = typeof view.title === "string" && view.title ? view.title : String(view.type ?? "Chart");
  return (
    `<rect width="${width}" height="${height}" rx="8" fill="var(--ck-background, transparent)" stroke="var(--ck-grid, light-dark(#d2d2d7,#3a3a3c))"/>` +
    `<text x="12" y="24" fill="var(--ck-text, light-dark(#1d1d1f,#f5f5f7))" font-size="13" font-family="${font()}">${esc(title)}</text>`
  );
}

function sharedLegend(names: string[], inks: string[], x: number, y: number, width: number): string {
  let cx = x;
  const bits: string[] = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i] ?? "";
    const ink = inks[i] || `var(--ck-series-${i + 1}, #007aff)`;
    const need = 22 + name.length * 6.6;
    if (cx > x && cx + need > x + width) {
      cx = x;
    }
    bits.push(
      `<rect x="${cx}" y="${y}" width="10" height="10" rx="2" fill="${ink}" data-ck-legend-swatch="${esc(name)}"/>` +
        `<text x="${cx + 16}" y="${y + 9}" fill="var(--ck-text, light-dark(#1d1d1f,#f5f5f7))" font-size="12" font-family="${font()}">${esc(name)}</text>`,
    );
    cx += need + 12;
  }
  return `<g data-ck-legend-row="shared">${bits.join("")}</g>`;
}

function paints(svg: string): string[] {
  const out: string[] = [];
  const re = /\b(?:fill|stroke)="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(svg))) {
    const ink = match[1] ?? "";
    if (!ink || ink === "none" || ink.startsWith("url(")) continue;
    if (ink.includes("--ck-background") || ink.includes("--ck-axis") || ink.includes("--ck-grid") || ink.includes("--ck-muted") || ink.includes("--ck-text")) continue;
    if (!ink.includes("--ck-series") && !ink.includes("--ck-line") && !ink.startsWith("#") && !ink.startsWith("var(--ck-")) continue;
    if (!out.includes(ink)) out.push(ink);
  }
  return out;
}

function legendNames(spec: Record<string, unknown>, rows: Record<string, unknown>[]): string[] {
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const y = encoding.y;
  const list = Array.isArray(y) ? y : y != null ? [y] : [];
  if (list.length > 1) return list.map((item, index) => channelTitle(item, index));
  const color = encoding.color;
  const field = typeof color === "string" ? color : isRecord(color) && typeof color.field === "string" ? color.field : "";
  if (field) {
    const seen: string[] = [];
    for (const row of rows) {
      const name = row[field] == null ? "" : String(row[field]);
      if (name && !seen.includes(name)) seen.push(name);
    }
    if (seen.length > 1) return seen;
  }
  return [];
}

function channelTitle(channel: unknown, index: number): string {
  if (typeof channel === "string") return channel;
  if (isRecord(channel)) {
    if (typeof channel.title === "string" && channel.title) return channel.title;
    if (typeof channel.field === "string" && channel.field) return channel.field;
  }
  return `series ${index + 1}`;
}

function channelField(channel: unknown): string {
  if (typeof channel === "string") return channel;
  if (isRecord(channel) && typeof channel.field === "string") return channel.field;
  return "";
}

function yFields(encoding: Record<string, unknown>): string[] {
  const y = encoding.y;
  const list = Array.isArray(y) ? y : y != null ? [y] : [];
  const out: string[] = [];
  for (const item of list) {
    const field = channelField(item);
    if (field) out.push(field);
  }
  return out;
}

function lockY(channel: unknown, domain: [number, number]): unknown {
  const lock = (item: unknown) => {
    if (typeof item === "string") return { field: item, scale: { domain } };
    if (!isRecord(item)) return item;
    const scale = isRecord(item.scale) ? { ...item.scale, domain } : { domain };
    return { ...item, scale };
  };
  return Array.isArray(channel) ? channel.map(lock) : lock(channel);
}

function extent(rows: Record<string, unknown>[], fields: string[], type: unknown): [number, number] | null {
  let min = Infinity;
  let max = -Infinity;
  for (const row of rows) {
    for (const field of fields) {
      const value = num(row[field]);
      if (value == null) continue;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (type === "bar" || type === "stacked-area" || type === "bar-range") {
    if (min > 0) min = 0;
    if (max < 0) max = 0;
  }
  if (min === max) {
    min -= 1;
    max += 1;
  }
  return [min, max];
}

function categories(rows: Record<string, unknown>[], field: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    const key = row[field] == null ? "" : String(row[field]);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function padCats(rows: Record<string, unknown>[], field: string, cats: string[], measures: string[]): Record<string, unknown>[] {
  const by = new Map<string, Record<string, unknown>>();
  for (const row of rows) by.set(row[field] == null ? "" : String(row[field]), row);
  return cats.map((cat) => {
    const found = by.get(cat);
    if (found) return found;
    const blank: Record<string, unknown> = { [field]: cat };
    for (const measure of measures) blank[measure] = null;
    return blank;
  });
}

function group(rows: Record<string, unknown>[], field: string): { key: string; rows: Record<string, unknown>[] }[] {
  const order: string[] = [];
  const map = new Map<string, Record<string, unknown>[]>();
  for (const row of rows) {
    const key = row[field] == null ? "" : String(row[field]);
    const list = map.get(key);
    if (list) list.push(row);
    else {
      order.push(key);
      map.set(key, [row]);
    }
  }
  return order.map((key) => ({ key, rows: map.get(key) ?? [] }));
}

function gridOf(count: number, columns: number | null, rows: number | null, wrap: boolean): { cols: number; rows: number; show: number } {
  let cols = columns && columns >= 1 ? Math.min(12, Math.round(columns)) : 0;
  let rowN = rows && rows >= 1 ? Math.min(12, Math.round(rows)) : 0;
  if (!cols && !rowN) cols = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(count))));
  if (!cols) cols = Math.max(1, Math.ceil(count / Math.max(1, rowN)));
  if (!rowN) rowN = Math.max(1, Math.ceil(count / cols));
  if (wrap && cols * rowN < count) rowN = Math.ceil(count / cols);
  const show = wrap ? count : Math.min(count, cols * rowN);
  return { cols, rows: Math.max(1, Math.ceil(show / cols)), show };
}

function rowsOf(table: DataTable): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < table.length; i++) {
    const row: Record<string, unknown> = {};
    for (const field of table.fields) row[field] = table.columns[field]?.[i];
    out.push(row);
  }
  return out;
}

function sizeOf(spec: Record<string, unknown>, fallbackW: number, fallbackH: number): { w: number; h: number } {
  const size = isRecord(spec.size) ? spec.size : {};
  const w = typeof size.width === "number" && size.width > 0 ? size.width : fallbackW;
  const h = typeof size.height === "number" && size.height > 0 ? size.height : fallbackH;
  return { w: Math.round(w), h: Math.round(h) };
}

function intOr(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function inner(svg: string): string {
  return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
}

function scope(svg: string, prefix: string): string {
  return svg
    .replace(/\bid="([^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${prefix}$1"`)
    .replace(/\baria-describedby="([^"]+)"/g, `aria-describedby="${prefix}$1"`);
}
