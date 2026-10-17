import { column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { font, n } from "../../svg";
import { fill, fit, fmt, num, openMark, str, viewOf } from "./plot";

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

/** Squarified tiles. Labels truncate to the tile. Groups share a series color. */
export function renderTreemap(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "treemap", 640, 420);
  if (!view) return null;
  const { frame, parts, table } = view;
  const xField = fieldOf(frame.encoding.x);
  const yField = fieldOf(frame.encoding.y);
  if (!yField) return null;
  const colorField = fieldOf(frame.encoding.color);
  const xs = column(table, xField);
  const groups = column(table, colorField);
  const colors = new Map<string, string>();
  const leaves: Leaf[] = [];
  num(table, yField).forEach((value, index) => {
    if (value === null || value <= 0) return;
    const group = colorField ? str(groups[index]) || "Group" : "All";
    if (!colors.has(group)) colors.set(group, fill(frame, colors.size));
    leaves.push({
      label: xField ? str(xs[index]) : group,
      value,
      group,
      fill: colors.get(group) ?? fill(frame, 0),
    });
  });
  if (!leaves.length) return null;
  const top = frame.title ? 40 : 12;
  const legend = frame.legend !== false && colors.size > 1;
  const grouped = [...groupLeaves(leaves)].map(([name, kids]) => ({
    label: name,
    value: kids.reduce((sum, leaf) => sum + leaf.value, 0),
    group: name,
    fill: kids[0].fill,
    kids,
  }));
  const outer = squarify(grouped, 10, top, frame.width - 20, frame.height - top - (legend ? 28 : 12));
  for (const block of outer) {
    const inner = block.kids.length > 1
      ? squarify(block.kids, block.x + 3, block.y + 3, Math.max(1, block.w - 6), Math.max(1, block.h - 6))
      : [{ ...block.kids[0], x: block.x, y: block.y, w: block.w, h: block.h }];
    for (const tile of inner) {
      const pad = 2;
      const x = tile.x + pad;
      const y = tile.y + pad;
      const w = Math.max(1, tile.w - pad * 2);
      const h = Math.max(1, tile.h - pad * 2);
      const label = `${tile.label}: ${fmt(tile.value, frame.locale)}${tile.group && tile.group !== tile.label ? ` · ${tile.group}` : ""}`;
      parts.push(openMark("rect", "tile", label, `x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="6" fill="${tile.fill}"`));
      parts.push("</rect>");
      const name = fit(tile.label, w - 12, 13);
      if (name && w > 36 && h > 22) {
        parts.push(`<text x="${n(x + 8)}" y="${n(y + 18)}" fill="#fff" stroke="rgb(0 0 0 / 0.35)" stroke-width="2" paint-order="stroke" font-size="13" font-weight="650" font-family="${font()}">${name}</text>`);
        const value = fit(fmt(tile.value, frame.locale), w - 12, 11);
        if (value && h > 40) parts.push(`<text x="${n(x + 8)}" y="${n(y + 34)}" fill="#fff" fill-opacity="0.9" stroke="rgb(0 0 0 / 0.35)" stroke-width="2" paint-order="stroke" font-size="11" font-family="${font()}">${value}</text>`);
      }
    }
  }
  if (frame.legend !== false && colors.size > 1) {
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
