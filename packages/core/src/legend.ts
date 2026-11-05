import { marker } from "./glyphs";
import { cssVar } from "./theme";
import type { PresetTokens } from "./theme";
import { ch, esc, font, isRecord, n } from "./svg";

export type LegendPos = "top" | "right" | "bottom" | "left" | "inside";

export interface LegendItem {
  name: string;
  color: string;
  symbol?: string;
  value?: string;
}

export interface LegendBox {
  position: LegendPos;
  anchor: string;
  align: "start" | "center" | "end";
  orient: "horizontal" | "vertical";
  maxRows?: number;
  title: string;
  hide: string[];
  symbol: string;
  symbols: Record<string, string>;
}

const POS = new Set(["top", "right", "bottom", "left", "inside"]);

/** An edge anchor hangs the legend outside that edge so the plot can reserve the band. Center stays inside. */
function edgeOf(anchor: string): LegendPos | undefined {
  if (!anchor || anchor === "center") return anchor === "center" ? "inside" : undefined;
  if (anchor === "top" || anchor.startsWith("top")) return "top";
  if (anchor === "bottom" || anchor.startsWith("bottom")) return "bottom";
  if (anchor === "left") return "left";
  if (anchor === "right") return "right";
  return undefined;
}
const ANCHORS = new Set(["top-left", "top", "top-right", "left", "center", "right", "bottom-left", "bottom", "bottom-right"]);
const SYMBOLS = new Set(["circle", "square", "diamond", "triangle", "line", "cross"]);

/**
 * Rich legend options. Null keeps the historical top wrap (cartesian) or the
 * donut value list, so default markup does not move.
 * An anchor with no position is inside.
 */
export function readLegend(spec: Record<string, unknown>): LegendBox | null {
  if (!isRecord(spec.legend) || spec.legend.show === false) return null;
  const source = spec.legend;
  const position = typeof source.position === "string" && POS.has(source.position) ? (source.position as LegendPos) : undefined;
  const anchor = typeof source.anchor === "string" && ANCHORS.has(source.anchor) ? source.anchor : "";
  const align = source.align === "center" || source.align === "end" || source.align === "start" ? source.align : "";
  const orient = source.orient === "horizontal" || source.orient === "vertical" ? source.orient : "";
  const maxRows = typeof source.maxRows === "number" && source.maxRows >= 1 ? Math.round(source.maxRows) : undefined;
  const title = typeof source.title === "string" ? source.title : "";
  const hide = Array.isArray(source.hide) ? source.hide.filter((item): item is string => typeof item === "string") : [];
  const symbol = typeof source.symbol === "string" && SYMBOLS.has(source.symbol) ? source.symbol : "";
  const symbols: Record<string, string> = {};
  if (Array.isArray(source.symbols)) {
    for (const item of source.symbols) {
      if (!isRecord(item) || typeof item.series !== "string" || typeof item.symbol !== "string" || !SYMBOLS.has(item.symbol)) continue;
      symbols[item.series] = item.symbol;
    }
  }
  const rich = Boolean(anchor || align || orient || maxRows || title || hide.length || symbol || Object.keys(symbols).length || (position && position !== "top"));
  if (!rich) return null;
  const place: LegendPos = position ?? edgeOf(anchor) ?? "top";
  return {
    position: place,
    anchor: anchor || (place === "inside" ? "top-right" : "top-left"),
    align: align || "start",
    orient: orient || (place === "left" || place === "right" ? "vertical" : "horizontal"),
    maxRows,
    title,
    hide,
    symbol,
    symbols,
  };
}

export interface LegendSpace {
  band: number;
  side: number;
}

const ROW = 18;

function shown(box: LegendBox, items: LegendItem[]): LegendItem[] {
  return items.filter((item) => !box.hide.includes(item.name));
}

function itemWidth(item: LegendItem): number {
  return 26 + ch(item.name.length, 6.6) + (item.value ? 8 + ch(item.value.length, 6.6) : 0);
}

/** Rows of items. Vertical legends are one item per row. */
function rowsOf(box: LegendBox, items: LegendItem[], width: number): LegendItem[][] {
  const list = shown(box, items);
  if (box.orient === "vertical" || width < 40) return list.map((item) => [item]);
  const rows: LegendItem[][] = [];
  let row: LegendItem[] = [];
  let used = 0;
  for (const item of list) {
    const span = itemWidth(item);
    if (row.length && used + span > width) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push(item);
    used += span;
  }
  if (row.length) rows.push(row);
  return rows;
}

export function legendSpace(box: LegendBox, items: LegendItem[], innerWidth: number): LegendSpace {
  const rows = rowsOf(box, items, Math.max(80, innerWidth));
  const visible = box.maxRows ? Math.min(rows.length, box.maxRows) : rows.length;
  const title = box.title ? 16 : 0;
  const pager = box.maxRows && rows.length > box.maxRows ? 16 : 0;
  const band = 8 + title + Math.max(1, visible) * ROW + pager;
  let side = 108;
  for (const item of shown(box, items)) side = Math.max(side, itemWidth(item) + 16);
  return { band, side: Math.min(180, side) };
}

function icon(symbol: string, x: number, y: number, color: string): string {
  if (!symbol || symbol === "square") return `<rect x="${n(x)}" y="${n(y)}" width="10" height="10" rx="2" fill="${color}" />`;
  if (symbol === "line") return `<line x1="${n(x)}" y1="${n(y + 5)}" x2="${n(x + 10)}" y2="${n(y + 5)}" stroke="${color}" stroke-width="2" />`;
  return marker(x + 5, y + 5, 4.5, symbol, color, false);
}

export interface LegendFrame {
  plot: { left: number; top: number; right: number; bottom: number };
  width: number;
  height: number;
  preset: PresetTokens;
}

/** Formatted suffix when `legend.values` is on. Undefined leaves the name alone. */
export function legendShownValue(spec: Record<string, unknown>, value: number | undefined): string | undefined {
  if (!isRecord(spec.legend) || spec.legend.values !== true) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

/** Name plus the optional value suffix. */
export function legendLabel(name: string, value?: string): string {
  return value ? `${name} ${value}` : name;
}

/**
 * Rich legend when the spec sets one, otherwise the chart's existing markup.
 * Default charts pass a fallback so an omitted legend does not move.
 */
export function legendMarkup(spec: Record<string, unknown>, items: LegendItem[], host: LegendFrame, fallback: string): string {
  const box = readLegend(spec);
  if (!box || !items.length) return fallback;
  return paintLegend(box, items, host);
}

/** Draw a positioned legend. Later pages stay in the SVG with display:none so a click can page them. */
export function paintLegend(box: LegendBox, items: LegendItem[], frame: LegendFrame): string {
  const plot = frame.plot;
  const vertical = box.orient === "vertical" || box.position === "left" || box.position === "right";
  const orient = vertical && box.orient !== "horizontal" ? "vertical" : box.orient;
  const laid = { ...box, orient } as LegendBox;
  let x = plot.left;
  let y = 8;
  let width = Math.max(80, plot.right - plot.left);
  if (box.position === "bottom") y = frame.height - legendSpace(laid, items, width).band;
  else if (box.position === "top") y = Math.max(4, plot.top - legendSpace(laid, items, width).band);
  else if (box.position === "left") {
    const space = legendSpace(laid, items, 120);
    x = 8;
    y = plot.top;
    width = Math.max(72, space.side - 8);
  } else if (box.position === "right") {
    const space = legendSpace(laid, items, 120);
    width = Math.max(72, Math.min(space.side, frame.width - 8));
    x = Math.max(plot.right + 10, frame.width - width - 4);
    y = plot.top;
  } else {
    const space = legendSpace({ ...laid, orient: "vertical" }, items, 140);
    const blockW = Math.min(space.side, Math.max(72, (plot.right - plot.left) * 0.46));
    const blockH = space.band;
    const ax = box.anchor;
    const col = ax.endsWith("left") ? plot.left + 14 : ax === "left" ? plot.left + 14 : ax.endsWith("right") || ax === "right" ? plot.right - blockW - 14 : (plot.left + plot.right - blockW) / 2;
    const row = ax.startsWith("top") || ax === "top" ? plot.top + 14 : ax.startsWith("bottom") || ax === "bottom" ? plot.bottom - blockH - 14 : (plot.top + plot.bottom - blockH) / 2;
    x = col;
    y = row;
    width = blockW;
  }
  const rows = rowsOf(laid, items, width);
  const per = box.maxRows && box.maxRows < rows.length ? box.maxRows : rows.length;
  const pages = Math.max(1, Math.ceil(rows.length / Math.max(1, per)));
  const fill = cssVar("text", frame.preset.text);
  const muted = cssVar("muted", frame.preset.muted);
  const parts: string[] = [];
  const body = y + (box.title ? 16 : 0);
  if (box.position === "inside") {
    const blockH = (box.title ? 16 : 0) + Math.max(1, per) * ROW + 6;
    parts.push(`<rect data-ck-legend-plate="1" x="${n(x - 8)}" y="${n(y - 6)}" width="${n(width + 16)}" height="${n(blockH)}" rx="6" fill="${cssVar("background", frame.preset.background)}" />`);
  }
  if (box.title) {
    parts.push(`<text x="${n(x)}" y="${n(y + 11)}" fill="${fill}" font-size="11" font-weight="650">${esc(box.title)}</text>`);
  }
  rows.forEach((row, index) => {
    const page = Math.floor(index / Math.max(1, per));
    const slot = index % Math.max(1, per);
    const rowY = body + slot * ROW;
    const span = row.reduce((sum, item) => sum + itemWidth(item), 0);
    let cx = x;
    if (box.align === "center") cx = x + Math.max(0, width - span) / 2;
    if (box.align === "end") cx = x + Math.max(0, width - span);
    const bits = row.map((item) => {
      const symbol = box.symbols[item.name] || item.symbol || box.symbol;
      const mark = icon(symbol, cx, rowY, item.color);
      const value = item.value ? ` ${item.value}` : "";
      const text = `<text x="${n(cx + 16)}" y="${n(rowY + 9)}" fill="${fill}" font-size="12">${esc(item.name + value)}</text>`;
      const out = `${mark}${text}`;
      cx += itemWidth(item);
      return out;
    });
    const hidden = page > 0 ? ' style="display:none"' : "";
    parts.push(`<g data-ck-legend-row="${index}"${hidden}>${bits.join("")}</g>`);
  });
  if (pages > 1) {
    const py = body + per * ROW;
    parts.push(
      `<g data-ck-legend-pager="1">` +
        `<g data-ck-legend-page="prev" role="button" tabindex="0"><path d="M${n(x + 8)} ${n(py + 3)}l-5 5 5 5" fill="none" stroke="${muted}" stroke-width="1.4" /></g>` +
        `<text data-ck-legend-count="1" x="${n(x + 16)}" y="${n(py + 11)}" fill="${muted}" font-size="11">1/${pages}</text>` +
        `<g data-ck-legend-page="next" role="button" tabindex="0"><path d="M${n(x + 48)} ${n(py + 3)}l5 5-5 5" fill="none" stroke="${muted}" stroke-width="1.4" /></g>` +
        `</g>`,
    );
  }
  const attrs = [
    `data-ck-legend="${box.position}"`,
    `data-ck-legend-align="${box.align}"`,
    `data-ck-legend-orient="${laid.orient}"`,
    box.anchor ? `data-ck-legend-anchor="${box.anchor}"` : "",
    box.maxRows ? `data-ck-legend-max="${box.maxRows}"` : "",
    box.title ? `data-ck-legend-title="${esc(box.title)}"` : "",
    box.hide.length ? `data-ck-legend-hide="${esc(box.hide.join(","))}"` : "",
    box.symbol ? `data-ck-legend-symbol="${box.symbol}"` : "",
    `data-ck-legend-at="0"`,
  ]
    .filter(Boolean)
    .join(" ");
  return `<g ${attrs}>${parts.join("")}</g>`;
}
