import { colorLegendHeight, readColorScale, scaleLabel } from "../../color-scale";
import { legendAt, legendShownValue, legendSpace, paintLegend, type LegendBox, type LegendItem } from "../../legend";
import { asNumber, column, fieldOf } from "../../frame";
import { limitDepth, readHierarchy, type HNode } from "../../hierarchy";
import { resolve, ratio } from "../../ink";
import { cssVar } from "../../theme";
import { esc, isRecord, n, ch } from "../../svg";
import { fill, fmt, num, openMark, str, valueFormat, viewOf } from "./plot";

interface Leaf {
  label: string;
  value: number;
  group: string;
  fill: string;
}

interface Tile extends Leaf {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PlotBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Same heading-to-plot gap as the shared cartesian plot. */
function plotTop(frame: { title?: string; subtitle?: string }): number {
  return (frame.title ? 40 : 12) + (frame.subtitle ? 18 : 0);
}

/**
 * Shrink the tile rectangle so a legend sits outside it.
 * An omitted position is top, above the tiles. The gap keeps the tile stroke off the legend.
 */
function reserveLegend(
  spec: Record<string, unknown>,
  frame: { title?: string; subtitle?: string; width: number; height: number },
  items: LegendItem[],
  on: boolean,
): { box: LegendBox | null; plot: PlotBox } {
  const plot: PlotBox = { left: 10, top: plotTop(frame), right: frame.width - 10, bottom: frame.height - 12 };
  if (!on) return { box: null, plot };
  const box = legendAt(spec, "top");
  if (!box || box.position === "inside") return { box, plot };
  const room = legendSpace(box, items, Math.max(80, frame.width - 24));
  const gap = 8;
  if (box.position === "top") plot.top += room.band + gap;
  else if (box.position === "bottom") plot.bottom -= room.band + gap;
  else if (box.position === "right") plot.right -= room.side + gap;
  else if (box.position === "left") plot.left += room.side + gap;
  return { box, plot };
}

/** Squarified tiles. A label is the whole name or it is omitted. Leaves in a group stay in that group's hue, stepped by value. */
export function renderTreemap(spec: Record<string, unknown>): string | null {
  const hierarchical = renderLevels(spec);
  if (hierarchical !== undefined) return hierarchical;
  const view = viewOf(spec, "treemap", 640, 420);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  if (!yField) return null;
  const colorField = fieldOf(frame.encoding.color);
  const xs = column(table, xField);
  const groups = column(table, colorField);
  const constant = isRecord(frame.encoding.color) && typeof frame.encoding.color.value === "string" ? frame.encoding.color.value : "";
  const tones = groups.map((item) => asNumber(item)).filter((item): item is number => item !== null);
  const yValues = num(table, yField).filter((item): item is number => item !== null && item > 0);
  const ramp = readColorScale(frame.encoding.color, frame.preset, tones.length ? tones : yValues, false);
  const colors = new Map<string, string>();
  const leaves: Leaf[] = [];
  num(table, yField).forEach((value, index) => {
    if (value === null || value <= 0) return;
    const group = colorField ? str(groups[index]) || "Group" : "All";
    const tone = asNumber(groups[index]);
    const scaled = ramp && tone !== null ? ramp.paint(tone) : "";
    if (!scaled && !colors.has(group)) colors.set(group, fill(frame, colors.size));
    leaves.push({
      label: xField ? str(xs[index]) : group,
      value,
      group,
      fill: constant || scaled || colors.get(group) || fill(frame, 0),
    });
  });
  if (!leaves.length) return null;
  const grouped = [...groupLeaves(leaves)].map(([name, kids]) => ({
    label: name,
    value: kids.reduce((sum, leaf) => sum + leaf.value, 0),
    group: name,
    fill: kids[0].fill,
    kids,
  }));
  const shown = valueFormat(frame, spec, frame.encoding.y);
  const legendItems = grouped.map((node) => ({ name: node.label, color: node.fill, value: legendShownValue(spec, node.value) }));
  const categorical = frame.legend !== false && !ramp && colors.size > 1;
  const placed = reserveLegend(spec, frame, legendItems, categorical);
  if (ramp && frame.legend !== false) placed.plot.bottom -= colorLegendHeight;
  parts.push(mat(frame, placed.plot));
  const outer = squarify(grouped, placed.plot.left, placed.plot.top, Math.max(1, placed.plot.right - placed.plot.left), Math.max(1, placed.plot.bottom - placed.plot.top));
  for (const block of outer) {
    const inner = block.kids.length > 1
      ? squarify(block.kids, block.x + 1, block.y + 1, Math.max(1, block.w - 2), Math.max(1, block.h - 2))
      : [{ ...block.kids[0], x: block.x, y: block.y, w: block.w, h: block.h }];
    const ranked = ranksOf(inner);
    inner.forEach((tile) => {
      const pad = 1;
      const x = tile.x + pad;
      const y = tile.y + pad;
      const w = Math.max(1, tile.w - pad * 2);
      const h = Math.max(1, tile.h - pad * 2);
      const label = `${tile.label}: ${fmt(tile.value, frame.locale, shown)}${tile.group && tile.group !== tile.label ? ` · ${tile.group}` : ""}`;
      const paint = shade(tile.fill, ranked.get(tile) ?? 0, inner.length);
      parts.push(openMark("rect", "tile", label, `x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="2" fill="${paint}"`, tile.label, ranked.get(tile) ?? 0));
      parts.push("</rect>");
      if (w > 36 && h > 22) {
        const name = fullName(tile.label, w - 12, 13);
        if (name) parts.push(inkText(x + 8, y + 18, name, paint, 13));
        const value = fmt(tile.value, frame.locale, shown);
        if (h > 40 && fits(value, w - 12, 11)) parts.push(inkText(x + 8, y + 34, value, paint, 11, "500"));
      }
    });
  }
  if (ramp && frame.legend !== false) {
    parts.push(ramp.legend(12, frame.height - colorLegendHeight, scaleLabel(frame.preset)));
  } else if (placed.box && legendItems.length) {
    parts.push(paintLegend(placed.box, legendItems, { plot: placed.plot, width: frame.width, height: frame.height, preset: frame.preset }));
  }
  return view.done();
}

/**
 * Largest sibling keeps the branch hue. Smaller ones walk evenly to 64% of that
 * hue: toward black in light mode, toward white in dark mode. 64% stays in the
 * family. A header passes a count of 1 and keeps the hue. A lone tile stays the hue.
 */
function shade(base: string, rank: number, count: number): string {
  if (count <= 1) return base;
  const pct = Math.round(100 - (rank / (count - 1)) * 36);
  if (pct >= 100) return base;
  return `color-mix(in srgb, ${base} ${pct}%, light-dark(#000000, #ffffff))`;
}

function ranksOf<T extends { value: number }>(items: T[]): Map<T, number> {
  return new Map([...items].sort((a, b) => b.value - a.value).map((item, index) => [item, index]));
}

function mat(frame: { preset: { surface: string } }, box: PlotBox): string {
  return `<rect x="${n(box.left)}" y="${n(box.top)}" width="${n(Math.max(1, box.right - box.left))}" height="${n(Math.max(1, box.bottom - box.top))}" fill="${cssVar("surface", frame.preset.surface)}" />`;
}

function groupLeaves(leaves: Leaf[]): Map<string, Leaf[]> {
  const groups = new Map<string, Leaf[]>();
  for (const leaf of leaves) {
    const list = groups.get(leaf.group);
    if (list) list.push(leaf);
    else groups.set(leaf.group, [leaf]);
  }
  return groups;
}

function squarify<T extends { value: number }>(items: T[], x: number, y: number, w: number, h: number): (T & { x: number; y: number; w: number; h: number })[] {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const out: (T & { x: number; y: number; w: number; h: number })[] = [];
  const place = (list: T[], px: number, py: number, pw: number, ph: number) => {
    if (!list.length || pw <= 0 || ph <= 0) return;
    const total = list.reduce((sum, item) => sum + item.value, 0) || 1;
    if (list.length === 1) {
      out.push({ ...list[0], x: px, y: py, w: pw, h: ph });
      return;
    }
    const horizontal = pw >= ph;
    const span = horizontal ? ph : pw;
    let best = Infinity;
    let count = 1;
    for (let i = 1; i <= list.length; i++) {
      const row = list.slice(0, i);
      const sum = row.reduce((acc, item) => acc + item.value, 0);
      const thick = (sum / total) * (horizontal ? pw : ph);
      let worst = 0;
      for (const item of row) {
        const side = (item.value / sum) * span;
        const ratio = Math.max(thick / (side || 1), (side || 1) / (thick || 1));
        if (ratio > worst) worst = ratio;
      }
      if (worst <= best) {
        best = worst;
        count = i;
      } else break;
    }
    const row = list.slice(0, count);
    const sum = row.reduce((acc, item) => acc + item.value, 0);
    const thick = (sum / total) * (horizontal ? pw : ph);
    let cursor = 0;
    for (const item of row) {
      const side = (item.value / sum) * span;
      if (horizontal) out.push({ ...item, x: px, y: py + cursor, w: thick, h: side });
      else out.push({ ...item, x: px + cursor, y: py, w: side, h: thick });
      cursor += side;
    }
    if (horizontal) place(list.slice(count), px + thick, py, pw - thick, ph);
    else place(list.slice(count), px, py + thick, pw, ph - thick);
  };
  place(sorted, x, y, w, h);
  return out;
}

function fits(value: string, width: number, size: number): boolean {
  return ch(value.length, size * 0.52) <= width;
}

/** The whole name, or nothing. A tile never shortens a label. */
function fullName(value: string, width: number, size: number): string {
  const max = Math.floor(width / (size * 0.52));
  if (max < 1 || value.length > max) return "";
  return value;
}

/** Black or white, whichever contrasts more, chosen per scheme. */
export function monoInk(fill: string): string {
  const pair = resolve(fill);
  if (!pair) return "#000000";
  const side = (rgb: readonly [number, number, number]) => (ratio([0, 0, 0], rgb) >= ratio([255, 255, 255], rgb) ? "#000000" : "#ffffff");
  const light = side(pair.light);
  const dark = side(pair.dark);
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function inkText(x: number, y: number, value: string, fill: string, size: number, weight = "650"): string {
  return `<text x="${n(x)}" y="${n(y)}" fill="${monoInk(fill)}" font-size="${size}" font-weight="${weight}">${esc(value)}</text>`;
}

function share(part: number, whole: number): string {
  if (!whole) return "0%";
  const pct = Math.round((part / whole) * 1000) / 10;
  return `${pct}%`;
}

function tip(node: HNode, parent: number, total: number, locale: string, format: unknown): string {
  const where = node.path.filter(Boolean).join(" / ") || node.name;
  return `${where}: ${fmt(node.value, locale, format)} · ${share(node.value, parent)} of parent · ${share(node.value, total)} of total`;
}

/** Multi-level tiles. Undefined means the spec is still the flat one-level treemap. */
function renderLevels(spec: Record<string, unknown>): string | null | undefined {
  const read = readHierarchy(spec);
  if (!read) return undefined;
  const view = viewOf(spec, "treemap", 640, 420);
  if (!view) return null;
  const { frame, parts } = view;
  const max = typeof frame.mark.depth === "number" ? frame.mark.depth : 8;
  const root = limitDepth(read.root, max);
  const branches = root.children.length ? root.children : root.value > 0 ? [root] : [];
  if (!branches.length) return null;
  const total = branches.reduce((sum, node) => sum + node.value, 0);
  const legend = frame.legend !== false && branches.length > 1;
  const shown = valueFormat(frame, spec, frame.encoding.y);
  const colors = branches.map((_, index) => fill(frame, index));
  let ordinal = 0;
  const paintNode = (node: HNode, color: string, branch: string, depth: number, x0: number, y0: number, w0: number, h0: number, parent: number, rank: number, siblings: number) => {
    const gap = 1;
    const x = x0 + gap;
    const y = y0 + gap;
    const w = Math.max(1, w0 - gap * 2);
    const h = Math.max(1, h0 - gap * 2);
    const band = node.children.length > 0 && w >= 36 && h >= 36 ? 16 : 0;
    const paint = shade(color, rank, band ? 1 : siblings);
    const label = tip(node, parent, total, frame.locale, shown);
    const index = ordinal;
    ordinal += 1;
    if (!band) {
      parts.push(openMark("rect", "tile", label, `x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="2" fill="${paint}"`, branch, index));
      parts.push("</rect>");
      if (w > 36 && h > 20) {
        const name = fullName(node.name, w - 12, 12);
        if (name) parts.push(inkText(x + 6, y + 16, name, paint, 12));
        const value = fmt(node.value, frame.locale, shown);
        if (h > 40 && fits(value, w - 12, 11)) parts.push(inkText(x + 6, y + 32, value, paint, 11, "500"));
      }
      return;
    }
    parts.push(openMark("rect", "group", label, `x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${band}" rx="2" fill="${paint}"`, branch, index));
    parts.push("</rect>");
    const name = fullName(node.name, w - 12, 12);
    if (name) parts.push(inkText(x + 6, y + 12, name, paint, 12));
    const inner = squarify(node.children, x, y + band, w, Math.max(1, h - band));
    const ranks = ranksOf(inner);
    inner.forEach((child) => paintNode(child, color, branch, depth + 1, child.x, child.y, child.w, child.h, node.value, ranks.get(child) ?? 0, inner.length));
  };
  const levelItems = branches.map((node, index) => ({ name: node.name, color: colors[index] ?? fill(frame, index), value: legendShownValue(spec, node.value) }));
  const placed = reserveLegend(spec, frame, levelItems, legend);
  parts.push(mat(frame, placed.plot));
  const outer = squarify(branches, placed.plot.left, placed.plot.top, Math.max(1, placed.plot.right - placed.plot.left), Math.max(1, placed.plot.bottom - placed.plot.top));
  outer.forEach((tile, index) => {
    paintNode(tile, colors[index] ?? fill(frame, index), tile.name, 0, tile.x, tile.y, tile.w, tile.h, total, 0, 1);
  });
  if (placed.box && levelItems.length) {
    parts.push(paintLegend(placed.box, levelItems, { plot: placed.plot, width: frame.width, height: frame.height, preset: frame.preset }));
  }
  return view.done();
}
