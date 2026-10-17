import { column, fieldOf } from "../../frame";
import { cssVar } from "../../theme";
import { font, n } from "../../svg";
import { asNumber } from "../../frame";
import { fill, fit, fmt, openMark, str, viewOf } from "./plot";

/** Curved flow ribbons and labeled nodes sized by the flow through them. */
export function renderSankey(spec: Record<string, unknown>): string | null {
  const view = viewOf(spec, "sankey", 720, 420);
  if (!view) return null;
  const { frame, parts, table } = view;
  const sourceField = fieldOf(frame.encoding.source) ?? fieldOf(frame.encoding.x);
  const targetField = fieldOf(frame.encoding.target) ?? fieldOf(frame.encoding.color);
  const yField = fieldOf(frame.encoding.y);
  if (!sourceField || !targetField || !yField) return null;
  const sources = column(table, sourceField);
  const targets = column(table, targetField);
  const values = column(table, yField);
  const ids: string[] = [];
  const idOf = (name: string) => {
    const found = ids.indexOf(name);
    if (found >= 0) return found;
    ids.push(name);
    return ids.length - 1;
  };
  const links: { source: number; target: number; value: number }[] = [];
  for (let i = 0; i < table.length; i++) {
    const value = asNumber(values[i]);
    const source = str(sources[i]);
    const target = str(targets[i]);
    if (value && value > 0 && source && target && source !== target) links.push({ source: idOf(source), target: idOf(target), value });
  }
  if (!links.length) return null;
  const layer = ids.map(() => 0);
  for (let pass = 0; pass < ids.length; pass++) {
    for (const link of links) if (layer[link.target] <= layer[link.source]) layer[link.target] = Math.min(ids.length - 1, layer[link.source] + 1);
  }
  const depth = Math.max(1, ...layer);
  const incoming = ids.map(() => 0);
  const outgoing = ids.map(() => 0);
  for (const link of links) {
    outgoing[link.source] += link.value;
    incoming[link.target] += link.value;
  }
  const nodeValue = ids.map((_, index) => Math.max(incoming[index], outgoing[index], 1));

  const top = frame.title ? 40 : 20;
  const bottom = frame.height - 16;
  const nodeW = 12;
  const gutter = 108;
  const span = Math.max(nodeW, frame.width - gutter * 2 - nodeW);
  const columns = Array.from({ length: depth + 1 }, () => [] as number[]);
  ids.forEach((_, index) => columns[layer[index]].push(index));
  const pos = ids.map(() => ({ x: 0, y: 0, h: 8 }));
  columns.forEach((col, colIndex) => {
    const total = col.reduce((sum, index) => sum + nodeValue[index], 0) || 1;
    const gap = 18;
    const usable = Math.max(col.length * 16, bottom - top - gap * Math.max(0, col.length - 1));
    let y = top;
    for (const index of col) {
      const h = Math.max(16, (nodeValue[index] / total) * usable);
      pos[index] = { x: gutter + (colIndex / depth) * span, y, h };
      y += h + gap;
    }
  });
  relax(columns, links, pos, top, bottom);

  const outAt = ids.map(() => 0);
  const inAt = ids.map(() => 0);
  const ordered = [...links].sort((a, b) => a.source - b.source || a.target - b.target);
  const ribbons: string[] = [];
  const grads: string[] = [];
  ordered.forEach((link, index) => {
    const source = pos[link.source];
    const target = pos[link.target];
    const sh = (link.value / Math.max(outgoing[link.source], link.value)) * source.h;
    const th = (link.value / Math.max(incoming[link.target], link.value)) * target.h;
    const y0 = source.y + outAt[link.source];
    const y1 = target.y + inAt[link.target];
    outAt[link.source] += sh;
    inAt[link.target] += th;
    const x0 = source.x + nodeW;
    const x1 = target.x;
    const c = (x0 + x1) / 2;
    const d = `M${n(x0)} ${n(y0)} C${n(c)} ${n(y0)} ${n(c)} ${n(y1)} ${n(x1)} ${n(y1)} L${n(x1)} ${n(y1 + th)} C${n(c)} ${n(y1 + th)} ${n(c)} ${n(y0 + sh)} ${n(x0)} ${n(y0 + sh)} Z`;
    const id = `${frame.id}-f${index}`;
    grads.push(`<linearGradient id="${id}"><stop offset="0" stop-color="${fill(frame, link.source)}"/><stop offset="1" stop-color="${fill(frame, link.target)}"/></linearGradient>`);
    const label = `${ids[link.source]} → ${ids[link.target]}: ${fmt(link.value, frame.locale)}`;
    ribbons.push(openMark("path", "link", label, `d="${d}" fill="url(#${id})" fill-opacity="0.35"`) + "</path>");
  });
  if (grads.length) parts.push(`<defs>${grads.join("")}</defs>`);
  parts.push(ribbons.join(""));
  ids.forEach((name, index) => {
    const node = pos[index];
    const label = `${name}: ${fmt(nodeValue[index], frame.locale)}`;
    parts.push(openMark("rect", "node", label, `x="${n(node.x)}" y="${n(node.y)}" width="${nodeW}" height="${n(node.h)}" rx="4" fill="${fill(frame, index)}"`));
    parts.push("</rect>");
    const first = layer[index] === 0;
    const anchor = first ? "end" : "start";
    const x = first ? node.x - 10 : node.x + nodeW + 10;
    parts.push(`<text x="${n(x)}" y="${n(node.y + node.h / 2 + 4)}" text-anchor="${anchor}" fill="${cssVar("text", frame.preset.text)}" stroke="${cssVar("surface", frame.preset.surface)}" stroke-width="4" paint-order="stroke" font-size="12" font-weight="600" font-family="${font()}">${fit(name, 96, 12)}</text>`);
  });
  return view.done();
}

function relax(
  columns: number[][],
  links: { source: number; target: number; value: number }[],
  pos: { x: number; y: number; h: number }[],
  top: number,
  bottom: number,
): void {
  for (let pass = 0; pass < 4; pass++) {
    for (let c = 1; c < columns.length; c++) {
      for (const index of columns[c]) {
        let weight = 0;
        let sum = 0;
        for (const link of links) {
          if (link.target !== index) continue;
          weight += link.value;
          sum += link.value * (pos[link.source].y + pos[link.source].h / 2);
        }
        if (weight > 0) pos[index].y = sum / weight - pos[index].h / 2;
      }
      pack(columns[c], pos, top, bottom);
    }
  }
}

function pack(col: number[], pos: { y: number; h: number }[], top: number, bottom: number): void {
  const gap = 14;
  col.sort((a, b) => pos[a].y - pos[b].y);
  let y = top;
  for (const index of col) {
    if (pos[index].y < y) pos[index].y = y;
    y = pos[index].y + pos[index].h + gap;
  }
  if (y > bottom + gap) {
    const overflow = y - (bottom + gap);
    for (const index of col) pos[index].y -= overflow;
  }
  y = top;
  for (const index of col) {
    if (pos[index].y < y) pos[index].y = y;
    y = pos[index].y + pos[index].h + gap;
  }
}
