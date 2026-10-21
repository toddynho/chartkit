/**
 * Facets, concatenated views, and breakpoint overrides.
 * `render()` calls `arrange` before the chart renderer. A spec with none of
 * these returns null and the chart draws unchanged.
 */
import { readTable } from "./frame";
import type { DataTable } from "./data";
import { installLayout, installPaint, directionOf, type Draw } from "./layout-hook";
import { esc, font, isRecord, niceDomain, niceNum } from "./svg";

export { directionOf };
export type { Draw };

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

export function mountLayout(): void {
  installLayout(arrange);
  installPaint({ cats: catScale, order: catOrder, titleX, titleAttr, bidi });
}

/**
 * Category labels left to right. The first and last stay, so June is not
 * dropped when the left column is narrower than the others.
 */
function catOrder(
  count: number,
  step: number,
  center: (index: number) => number,
  reversed: boolean,
  labelWidth?: (index: number) => number,
): number[] | null {
  if (step <= 0) return null;
  const seq: number[] = [];
  for (let i = 0; i < count; i += step) seq.push(i);
  if (reversed) seq.sort((a, b) => center(a) - center(b));
  if (!labelWidth) return reversed ? seq : null;
  if (seq.length < 2) return seq;
  const end = seq[seq.length - 1] ?? 0;
  const endLeft = center(end) - labelWidth(end) / 2;
  const kept: number[] = [];
  let last = -Infinity;
  for (const index of seq) {
    const x = center(index);
    const width = labelWidth(index);
    const protect = index === seq[0] || index === end;
    if (!protect && (x - width / 2 < last || x + width / 2 + 8 > endLeft)) continue;
    kept.push(index);
    if (x - width / 2 >= last) last = x + width / 2 + 8;
  }
  return kept;
}

function catScale(spanStart: number, spanEnd: number, count: number, edge: boolean, bar: boolean) {
  const reversed = spanEnd < spanStart;
  const lo = Math.min(spanStart, spanEnd);
  const hi = Math.max(spanStart, spanEnd);
  const span = hi - lo;
  const n = Math.max(count, 1);
  const inset = edge && !bar ? 0 : 0.5;
  const step = n > 1 ? span / (n - 1 + inset * 2) : span;
  const origin = n > 1 ? lo + step * inset : (lo + hi) / 2;
  const slot = (index: number) => (reversed ? n - 1 - index : index);
  const bandSize = span / n;
  return {
    center: (index: number) => (n <= 1 ? (lo + hi) / 2 : origin + step * slot(index)),
    band: (index: number) => ({ start: lo + bandSize * slot(index), size: bandSize }),
    at: (value: number) => (n <= 1 ? (lo + hi) / 2 : origin + step * slot(value)),
    min: 0,
    max: Math.max(0, count - 1),
    live: false,
  };
}

function titleX(rtl: boolean, width: number, fallback: number): number {
  return rtl ? width - 16 : fallback;
}

function titleAttr(rtl: boolean): string {
  return rtl ? ' text-anchor="end" direction="ltr" unicode-bidi="isolate"' : "";
}

function bidi(rtl: boolean): string {
  return rtl ? ' direction="ltr" unicode-bidi="isolate"' : "";
}

export function arrange(spec: Record<string, unknown>, draw: Draw): string | null {
  const layout = isRecord(spec.layout) ? spec.layout : undefined;
  if (!layout) return null;
  const rules = ruleList(layout.breakpoints);
  const width = widthOf(spec);
  const patched = rules.length && width != null ? applyRule(spec, matchRule(rules, width)) : null;
  const next = aimRtl(patched ?? spec);
  const box = isRecord(next.layout) ? next.layout : undefined;
  let svg: string | null = null;
  const facet = box && isRecord(box.facet) ? box.facet : undefined;
  const concat = box && isRecord(box.concat) ? box.concat : undefined;
  if (facet && typeof facet.field === "string" && facet.field) svg = facetSvg(next, draw);
  else if (concat && Array.isArray(concat.views) && concat.views.length) svg = concatSvg(next, draw);
  else if (patched) svg = draw(patched);
  else if (directionOf(next) === "rtl") svg = draw(next);
  if (!svg && rules.length) svg = draw(spec);
  if (!svg) return null;
  if (rules.length) svg = stampBreak(svg, rules);
  return stampRtl(svg, next);
}

function stampRtl(svg: string, spec: Record<string, unknown>): string {
  if (directionOf(spec) !== "rtl" || svg.includes(" dir=")) return svg;
  return svg.startsWith("<svg") ? `<svg dir="rtl"${svg.slice(4)}` : svg;
}

/** Mirror the category axis and park y on the right. The line bundle already honours scale.reverse and axis position. */
function aimRtl(spec: Record<string, unknown>): Record<string, unknown> {
  if (directionOf(spec) !== "rtl") return spec;
  const encoding = isRecord(spec.encoding) ? { ...spec.encoding } : {};
  const rawX = encoding.x;
  if (typeof rawX === "string" || isRecord(rawX)) {
    const x: Record<string, unknown> = typeof rawX === "string" ? { field: rawX } : { ...rawX };
    const scale = isRecord(x.scale) ? { ...x.scale } : {};
    if (scale.reverse !== false) {
      scale.reverse = true;
      x.scale = scale;
      encoding.x = x;
    }
  }
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  const horizontal = spec.type === "bar" && mark?.orientation === "horizontal";
  const axes = isRecord(spec.axes) ? { ...spec.axes } : {};
  if (axes.y !== false) {
    const y = isRecord(axes.y) ? { ...axes.y } : {};
    if (y.position === undefined) {
      y.position = horizontal ? "top" : "right";
      axes.y = y;
    }
  }
  return { ...spec, encoding, axes };
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
  const fitted = Math.floor((room - gap * (grid.rows - 1)) / grid.rows);
  const panelH = Math.max(136, fitted);
  const height = head + grid.rows * panelH + gap * Math.max(0, grid.rows - 1) + legendH + 8;
  const panels: string[] = [];
  let inks: string[] = [];
  const rtl = directionOf(spec) === "rtl";
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
      shared,
      keepX: !shared || row === grid.rows - 1,
      keepY: !shared || (rtl ? col === grid.cols - 1 : col === 0),
      edgeX: spec.type !== "bar" && spec.type !== "combo",
      yTitle: shared ? axisTitle(spec, "y") : "",
      xTitle: shared ? axisTitle(spec, "x") : "",
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
  const titleX = rtl ? w - 8 : 8;
  const anchor = rtl ? ' text-anchor="end" direction="ltr" unicode-bidi="isolate"' : "";
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
    shared: boolean;
    keepX: boolean;
    keepY: boolean;
    edgeX: boolean;
    yTitle: string;
    xTitle: string;
  },
): Record<string, unknown> {
  const encoding = isRecord(spec.encoding) ? { ...spec.encoding } : {};
  if (opts.domain) encoding.y = lockY(encoding.y, opts.domain);
  if (opts.shared) encoding.y = stripTitles(encoding.y);
  if (opts.edgeX) encoding.x = edgeChannel(encoding.x);
  if (opts.shared && !opts.keepX && isRecord(encoding.x)) {
    const x = { ...encoding.x };
    delete x.title;
    encoding.x = x;
  }
  const data = opts.xField && opts.cats.length ? padCats(groupRow.rows, opts.xField, opts.cats, yFields(encoding)) : groupRow.rows;
  const axes = axesOf(spec.axes, opts);
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

function axesOf(
  value: unknown,
  opts: { shared: boolean; keepX: boolean; keepY: boolean; yTitle: string; xTitle: string },
): Record<string, unknown> | undefined {
  const source = isRecord(value) ? value : {};
  if (!opts.shared) {
    if (!isRecord(value)) return undefined;
    const axes: Record<string, unknown> = {};
    for (const key of ["x", "y", "y2"]) {
      const box = value[key];
      if (!isRecord(box)) {
        if (box !== undefined) axes[key] = box;
        continue;
      }
      const next = { ...box };
      if ((key === "x" && !opts.keepX) || (key !== "x" && !opts.keepY)) delete next.title;
      axes[key] = next;
    }
    return axes;
  }
  const axes: Record<string, unknown> = {};
  for (const key of ["x", "y", "y2"]) {
    if (key === "y2" && source[key] === undefined) continue;
    const box = isRecord(source[key]) ? { ...source[key] } : {};
    const keep = key === "x" ? opts.keepX : opts.keepY;
    if (!keep) {
      box.labels = false;
      delete box.title;
    } else if (key === "y" && opts.yTitle) box.title = opts.yTitle;
    else if (key === "x" && opts.xTitle) box.title = opts.xTitle;
    axes[key] = box;
  }
  return Object.keys(axes).length ? axes : undefined;
}

function axisTitle(spec: Record<string, unknown>, key: "x" | "y"): string {
  const axes = isRecord(spec.axes) && isRecord(spec.axes[key]) ? spec.axes[key] : undefined;
  if (axes && typeof axes.title === "string" && axes.title) return axes.title;
  if (key !== "y") return "";
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const y = encoding.y;
  const first = Array.isArray(y) ? y[0] : y;
  const title = channelTitle(first, 0);
  return title === "series 1" ? "" : title;
}

function stripTitles(channel: unknown): unknown {
  const strip = (item: unknown) => {
    if (!isRecord(item) || typeof item.title !== "string") return item;
    const next = { ...item };
    delete next.title;
    return next;
  };
  return Array.isArray(channel) ? channel.map(strip) : strip(channel);
}

function edgeChannel(channel: unknown): unknown {
  if (typeof channel === "string") return { field: channel, scale: { padding: 0 } };
  if (!isRecord(channel)) return channel;
  const scale = isRecord(channel.scale) ? { ...channel.scale, padding: 0 } : { padding: 0 };
  return { ...channel, scale };
}

function concatSvg(spec: Record<string, unknown>, draw: Draw): string | null {
  const layout = isRecord(spec.layout) ? spec.layout : {};
  const concat = isRecord(layout.concat) ? layout.concat : {};
  const views = Array.isArray(concat.views) ? concat.views.filter(isRecord) : [];
  if (!views.length) return null;
  const gap = typeof concat.gap === "number" && concat.gap >= 0 ? Math.min(64, concat.gap) : 16;
  const columns = intOr(concat.columns);
  if (columns && columns >= 2) return concatGrid(spec, views, Math.min(4, Math.round(columns)), gap, draw);
  const horizontal = concat.direction === "horizontal";
  const { w, h } = sizeOf(spec, 720, 280 * views.length);
  const head = spec.title ? 28 : 0;
  const count = views.length;
  const panelW = horizontal ? Math.max(80, Math.floor((w - gap * (count - 1)) / count)) : w;
  const panelH = horizontal ? Math.max(80, h - head) : Math.max(80, Math.floor((h - head - gap * (count - 1)) / count));
  const height = horizontal ? head + panelH : head + count * panelH + gap * (count - 1);
  const width = horizontal ? count * panelW + gap * (count - 1) : w;
  const placed = views.map((view, i) => ({
    view,
    x: horizontal ? i * (panelW + gap) : 0,
    y: head + (horizontal ? 0 : i * (panelH + gap)),
    w: panelW,
    h: panelH,
  }));
  return concatFrame(spec, placed, width, height, draw, horizontal ? "horizontal" : "vertical", horizontal ? count : 1, horizontal ? 1 : count);
}

function concatGrid(spec: Record<string, unknown>, views: Record<string, unknown>[], cols: number, gap: number, draw: Draw): string | null {
  const { w, h } = sizeOf(spec, 760, 320 * Math.ceil(views.length / cols));
  const head = spec.title ? 28 : 0;
  const rows: { view: Record<string, unknown>; span: number; col: number }[][] = [];
  let row: { view: Record<string, unknown>; span: number; col: number }[] = [];
  let used = 0;
  for (const view of views) {
    let span = typeof view.span === "number" && view.span > 0 ? Math.round(view.span) : 1;
    span = Math.min(cols, Math.max(1, span));
    if (used > 0 && used + span > cols) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push({ view, span, col: used });
    used += span;
    if (used >= cols) {
      rows.push(row);
      row = [];
      used = 0;
    }
  }
  if (row.length) rows.push(row);
  const room = Math.max(120, h - head);
  const rowH = Math.max(160, Math.floor((room - gap * (rows.length - 1)) / rows.length));
  const height = head + rows.length * rowH + gap * Math.max(0, rows.length - 1);
  const colW = (w - gap * (cols - 1)) / cols;
  const placed = rows.flatMap((line) =>
    line.map((cell) => ({
      view: cell.view,
      x: cell.col * (colW + gap),
      y: head + rows.indexOf(line) * (rowH + gap),
      w: cell.span * colW + (cell.span - 1) * gap,
      h: rowH,
    })),
  );
  return concatFrame(spec, placed, w, height, draw, "grid", cols, rows.length);
}

function concatFrame(
  spec: Record<string, unknown>,
  placed: { view: Record<string, unknown>; x: number; y: number; w: number; h: number }[],
  width: number,
  height: number,
  draw: Draw,
  flow: string,
  cols: number,
  rows: number,
): string | null {
  const parts: string[] = [];
  for (let i = 0; i < placed.length; i++) {
    const cell = placed[i];
    if (!cell || typeof cell.view.type !== "string") continue;
    const child: Record<string, unknown> = {
      ...cell.view,
      theme: cell.view.theme ?? spec.theme,
      locale: cell.view.locale ?? spec.locale,
      size: { width: Math.round(cell.w), height: Math.round(cell.h) },
    };
    if (!child.a11y) child.a11y = { alt: typeof cell.view.title === "string" ? cell.view.title : `View ${i + 1}` };
    delete child.layout;
    delete child.span;
    const drawn = draw(child);
    const body = drawn ? inner(scope(drawn, `v${i}`)) : missingView(cell.view, Math.round(cell.w), Math.round(cell.h));
    parts.push(`<g data-ck-view="${i}" transform="translate(${Math.round(cell.x)} ${Math.round(cell.y)})">${body}</g>`);
  }
  if (!parts.length) return null;
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : "Composed charts";
  const rtl = directionOf(spec) === "rtl";
  const bidi = rtl ? ' direction="ltr" unicode-bidi="isolate"' : "";
  const title = spec.title
    ? `<text x="${rtl ? width - 8 : 8}" y="20"${rtl ? ` text-anchor="end"${bidi}` : ""} fill="var(--ck-text, light-dark(#1d1d1f,#f5f5f7))" font-size="15" font-weight="650" font-family="${font()}">${esc(String(spec.title))}</text>`
    : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(alt)}" class="ck-chart" data-ck-type="concat" data-ck-views="${parts.length}" data-ck-flow="${flow}" data-ck-cols="${cols}" data-ck-rows="${rows}"${rtl ? ' dir="rtl"' : ""}>` +
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
  const [lo, hi] = niceDomain(min, max);
  let top = hi;
  if (!(max < hi)) {
    const step = niceNum(Math.max(hi - lo, 1) / 4, true) || 1;
    top = Math.round((hi + step) * 1000) / 1000;
  }
  return [lo, top];
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
