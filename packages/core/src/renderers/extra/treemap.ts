import { colorLegendHeight, readColorScale, scaleLabel } from "../../color-scale";
import { asNumber, column, fieldOf } from "../../frame";
import { limitDepth, readHierarchy, type HNode } from "../../hierarchy";
import { labelInk, siblingFill } from "../../ink";
import { cssVar } from "../../theme";
import { esc, font, n } from "../../svg";
import { fill, fit, fmt, num, openMark, str, valueFormat, viewOf } from "./plot";

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

/** Squarified tiles. Labels truncate to the tile. Leaves in a group share a series color, in lighter and darker tints. */
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
  const tones = groups.map((item) => asNumber(item)).filter((item): item is number => item !== null);
  const ramp = tones.length ? readColorScale(frame.encoding.color, frame.preset, tones, false) : null;
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
      fill: scaled || colors.get(group) || fill(frame, 0),
    });
  });
  if (!leaves.length) return null;
  const top = frame.title ? 40 : 12;
  const legend = frame.legend !== false && (Boolean(ramp) || colors.size > 1);
  const legendH = ramp && frame.legend !== false ? colorLegendHeight : legend ? 28 : 12;
  const grouped = [...groupLeaves(leaves)].map(([name, kids]) => ({
    label: name,
    value: kids.reduce((sum, leaf) => sum + leaf.value, 0),
    group: name,
    fill: kids[0].fill,
    kids,
  }));
  const shown = valueFormat(frame, spec, frame.encoding.y);
  const outer = squarify(grouped, 10, top, frame.width - 20, frame.height - top - legendH);
  for (const block of outer) {
    const inner = block.kids.length > 1
      ? squarify(block.kids, block.x + 3, block.y + 3, Math.max(1, block.w - 6), Math.max(1, block.h - 6))
      : [{ ...block.kids[0], x: block.x, y: block.y, w: block.w, h: block.h }];
    inner.forEach((tile, index) => {
      const pad = 2;
      const x = tile.x + pad;
      const y = tile.y + pad;
      const w = Math.max(1, tile.w - pad * 2);
      const h = Math.max(1, tile.h - pad * 2);
      const label = `${tile.label}: ${fmt(tile.value, frame.locale, shown)}${tile.group && tile.group !== tile.label ? ` · ${tile.group}` : ""}`;
      const paint = tint(tile.fill, index, inner.length);
      parts.push(openMark("rect", "tile", label, `x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="6" fill="${paint}"${edge(frame)}`));
      parts.push("</rect>");
      const name = fit(tile.label, w - 12, 13);
      if (name && w > 36 && h > 22) {
        parts.push(inkText(x + 8, y + 18, name, paint, 13));
        const value = fmt(tile.value, frame.locale, shown);
        if (h > 40 && fits(value, w - 12, 11)) parts.push(inkText(x + 8, y + 34, value, paint, 11, "500"));
      }
    });
  }
  if (ramp && frame.legend !== false) {
    parts.push(ramp.legend(12, frame.height - colorLegendHeight, scaleLabel(frame.preset)));
  } else if (frame.legend !== false && colors.size > 1) {
    let x = 12;
    const y = frame.height - 8;
    for (const [name, color] of colors) {
      parts.push(`<rect x="${n(x)}" y="${n(y - 10)}" width="10" height="10" rx="2" fill="${color}" />`);
      parts.push(`<text x="${n(x + 14)}" y="${n(y)}" fill="${cssVar("text", frame.preset.text)}" font-size="12" font-family="${font()}">${fit(name, 80, 12)}</text>`);
      x += 14 + Math.min(name.length, 12) * 7 + 14;
    }
  }
  return view.done();
}

/** Same series color, mixed toward the page so leaves in one group are not one flat block. */
function tint(base: string, index: number, count: number): string {
  if (count <= 1) return base;
  const amount = 62 + Math.round((index / (count - 1)) * 30);
  return `color-mix(in srgb, ${base} ${amount}%, light-dark(#ffffff, #1c1c1e))`;
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

function edge(frame: { preset: { background: string } }): string {
  return ` stroke="${cssVar("background", frame.preset.background)}" stroke-width="2"`;
}

function fits(value: string, width: number, size: number): boolean {
  return value.length * size * 0.52 <= width;
}

function inkText(x: number, y: number, value: string, fill: string, size: number, weight = "650"): string {
  return `<text x="${n(x)}" y="${n(y)}" fill="${labelInk(fill)}" font-size="${size}" font-weight="${weight}" font-family="${font()}">${esc(value)}</text>`;
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
  const top = frame.title ? 40 : 12;
  const legendH = legend ? 28 : 12;
  const shown = valueFormat(frame, spec, frame.encoding.y);
  const colors = branches.map((_, index) => fill(frame, index));
  let ordinal = 0;
  const paintNode = (node: HNode, color: string, branch: string, depth: number, x0: number, y0: number, w0: number, h0: number, parent: number, sibling: number, siblings: number) => {
    const gap = 1.5;
    const x = x0 + gap;
    const y = y0 + gap;
    const w = Math.max(1, w0 - gap * 2);
    const h = Math.max(1, h0 - gap * 2);
    const paint = siblingFill(color, depth, sibling, siblings);
    const label = tip(node, parent, total, frame.locale, shown);
    const index = ordinal;
    ordinal += 1;
    if (!node.children.length || w < 28 || h < 22) {
      parts.push(openMark("rect", "tile", label, `x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="4" fill="${paint}"${edge(frame)}`, branch, index));
      parts.push("</rect>");
      const name = fit(node.name, w - 12, 12);
      if (name && w > 36 && h > 20) {
        parts.push(inkText(x + 6, y + 16, name, paint, 12));
        const value = fmt(node.value, frame.locale, shown);
        if (h > 40 && fits(value, w - 12, 11)) parts.push(inkText(x + 6, y + 32, value, paint, 11, "500"));
      }
      return;
    }
    parts.push(openMark("rect", "group", label, `x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="6" fill="${paint}"${edge(frame)}`, branch, index));
    parts.push("</rect>");
    const header = h > 40 && w > 48 ? 16 : 0;
    if (header) {
      const name = fit(node.name, w - 16, 12);
      if (name) parts.push(inkText(x + 8, y + 13, name, paint, 12));
    }
    const pad = 3;
    const inner = squarify(node.children, x + pad, y + header + pad, Math.max(1, w - pad * 2), Math.max(1, h - header - pad * 2));
    inner.forEach((child, childIndex) => paintNode(child, color, branch, depth + 1, child.x, child.y, child.w, child.h, node.value, childIndex, inner.length));
  };
  const outer = squarify(branches, 10, top, frame.width - 20, frame.height - top - legendH);
  outer.forEach((tile, index) => {
    paintNode(tile, colors[index] ?? fill(frame, index), tile.name, 0, tile.x, tile.y, tile.w, tile.h, total, index, outer.length);
  });
  if (legend) {
    let x = 12;
    const y = frame.height - 8;
    branches.forEach((node, index) => {
      const color = colors[index] ?? fill(frame, index);
      const name = fit(node.name, 88, 12) || node.name;
      parts.push(`<rect x="${n(x)}" y="${n(y - 10)}" width="10" height="10" rx="2" fill="${color}" /><text x="${n(x + 14)}" y="${n(y)}" fill="${cssVar("text", frame.preset.text)}" font-size="12" font-family="${font()}">${esc(name)}</text>`);
      x += 14 + Math.min(name.length, 12) * 7 + 14;
    });
  }
  return view.done();
}
