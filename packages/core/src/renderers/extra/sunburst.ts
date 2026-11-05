import { limitDepth, readHierarchy, type HNode } from "../../hierarchy";
import { labelInk, siblingFill } from "../../ink";
import { cssVar } from "../../theme";
import { esc, n, ch } from "../../svg";
import { fill, fit, fmt, valueFormat, viewOf } from "./plot";

function share(part: number, whole: number): string {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 1000) / 10}%`;
}

function tip(node: HNode, parent: number, total: number, locale: string, format: unknown): string {
  const where = node.path.filter(Boolean).join(" / ") || node.name;
  return `${where}: ${fmt(node.value, locale, format)} · ${share(node.value, parent)} of parent · ${share(node.value, total)} of total`;
}

function polar(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function arc(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  if (r0 < 1) return `M ${n(cx)} ${n(cy)} L ${n(x0)} ${n(y0)} A ${n(r1)} ${n(r1)} 0 ${large} 1 ${n(x1)} ${n(y1)} Z`;
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  return `M ${n(x0)} ${n(y0)} A ${n(r1)} ${n(r1)} 0 ${large} 1 ${n(x1)} ${n(y1)} L ${n(x2)} ${n(y2)} A ${n(r0)} ${n(r0)} 0 ${large} 0 ${n(x3)} ${n(y3)} Z`;
}

function depthOf(node: HNode): number {
  if (!node.children.length) return 0;
  let next = 0;
  for (const child of node.children) next = Math.max(next, depthOf(child));
  return next + 1;
}

export function renderSunburst(spec: Record<string, unknown>): string | null {
  const read = readHierarchy(spec);
  if (!read) return null;
  const view = viewOf(spec, "sunburst", 640, 420);
  if (!view) return null;
  const { frame, parts } = view;
  const max = typeof frame.mark.depth === "number" ? frame.mark.depth : 8;
  const root = limitDepth(read.root, max);
  const branches = root.children.length ? root.children : root.value > 0 ? [root] : [];
  if (!branches.length) return null;
  const total = branches.reduce((sum, node) => sum + node.value, 0) || root.value || 1;
  const legend = frame.legend !== false && branches.length > 1;
  const top = frame.title ? 36 : 8;
  const legendH = legend ? 28 : 8;
  const shown = valueFormat(frame, spec, frame.encoding.y);
  const hole = typeof frame.mark.innerRadius === "number" ? Math.min(0.9, Math.max(0, frame.mark.innerRadius)) : 0.28;
  const outer = Math.max(24, Math.min(frame.width - 24, frame.height - top - legendH) / 2);
  const cx = frame.width / 2;
  const cy = top + (frame.height - top - legendH) / 2;
  const rings = Math.max(1, depthOf({ ...root, children: branches }));
  const inner = outer * hole;
  const thick = (outer - inner) / rings;
  const colors = branches.map((_, index) => fill(frame, index));
  const pending: SliceLabel[] = [];
  const paint = (node: HNode, color: string, branch: string, depth: number, a0: number, a1: number, parent: number, sibling: number, siblings: number, indexBox: { n: number }) => {
    const r0 = inner + depth * thick;
    const r1 = r0 + thick;
    const label = tip(node, parent, total, frame.locale, shown);
    const index = indexBox.n;
    indexBox.n += 1;
    const span = a1 - a0;
    const gap = Math.min(0.012, span * 0.12);
    const radial = Math.min(1.5, Math.max(0, (r1 - r0) * 0.08));
    const drawn = arc(cx, cy, r0 < 1 ? r0 : r0 + radial, r1 - radial, a0 + gap, Math.max(a0 + gap + 0.004, a1 - gap));
    const paintFill = siblingFill(color, depth, sibling, siblings);
    const mid = (a0 + a1) / 2;
    const name = node.name;
    parts.push(
      `<path d="${drawn}" fill="${paintFill}" stroke="${cssVar("background", frame.preset.background)}" stroke-width="1.25" data-ck-mark="arc" data-ck-name="${esc(branch)}" data-ck-i="${index}" data-ck-depth="${depth}" aria-label="${esc(label)}"><title>${esc(label)}</title></path>`,
    );
    if (name) pending.push({ name, fill: paintFill, mid, r0, r1, span });
    if (!node.children.length) return;
    let cursor = a0;
    node.children.forEach((child, childIndex) => {
      const next = cursor + span * (child.value / (node.value || 1));
      paint(child, color, branch, depth + 1, cursor, next, node.value, childIndex, node.children.length, indexBox);
      cursor = next;
    });
  };
  const indexBox = { n: 0 };
  let cursor = -Math.PI / 2;
  branches.forEach((node, index) => {
    const next = cursor + (Math.PI * 2 * node.value) / total;
    paint(node, colors[index] ?? fill(frame, index), node.name, 0, cursor, next, total, index, branches.length, indexBox);
    cursor = next;
  });
  placeLabels(parts, pending, {
    cx,
    cy,
    outer,
    top,
    width: frame.width,
    height: frame.height,
    legendH,
  });
  const centre = root.name || fmt(total, frame.locale, shown);
  const holePx = inner;
  const sub = root.name ? fmt(total, frame.locale, shown) : "";
  const centreFits = holePx > 28 && ch(centre.length, 7.2) <= holePx * 1.4 && (!sub || ch(sub.length, 6.4) <= holePx * 1.4);
  if (holePx > 8) {
    parts.push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(Math.max(1, holePx - 1))}" fill="${cssVar("surface", frame.preset.surface)}" />`);
  }
  if (centreFits) {
    const ink = cssVar("text", frame.preset.text);
    parts.push(`<text x="${n(cx)}" y="${n(cy + (sub ? -2 : 4))}" text-anchor="middle" fill="${ink}" font-size="13" font-weight="650">${esc(centre)}</text>`);
    if (sub) parts.push(`<text x="${n(cx)}" y="${n(cy + 14)}" text-anchor="middle" fill="${cssVar("muted", frame.preset.muted)}" font-size="11">${esc(sub)}</text>`);
  }
  if (legend) {
    let x = 12;
    const y = frame.height - 8;
    branches.forEach((node, index) => {
      const color = colors[index] ?? fill(frame, index);
      const name = fit(node.name, 88, 12) || node.name;
      parts.push(`<rect x="${n(x)}" y="${n(y - 10)}" width="10" height="10" rx="2" fill="${color}" /><text x="${n(x + 14)}" y="${n(y)}" fill="${cssVar("text", frame.preset.text)}" font-size="12">${esc(name)}</text>`);
      x += 14 + Math.min(name.length, 12) * 7 + 14;
    });
  }
  return view.done();
}

interface SliceLabel {
  name: string;
  fill: string;
  mid: number;
  r0: number;
  r1: number;
  span: number;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Full names only. A slice that cannot hold its name, and has no free spot outside, keeps the name in the tooltip. */
function placeLabels(
  parts: string[],
  slices: SliceLabel[],
  frame: { cx: number; cy: number; outer: number; top: number; width: number; height: number; legendH: number },
): void {
  const placed: Box[] = [];
  const glyph = 7;
  const widthOf = (name: string) => Math.max(glyph, name.length * glyph);
  const hits = (box: Box) => placed.some((item) => box.x < item.x + item.w + 3 && box.x + box.w + 3 > item.x && box.y < item.y + item.h + 3 && box.y + box.h + 3 > item.y);
  const inside = (box: Box) => box.x >= 4 && box.y >= frame.top - 2 && box.x + box.w <= frame.width - 4 && box.y + box.h <= frame.height - frame.legendH - 2;
  const order = slices.slice().sort((a, b) => b.span - a.span);
  for (const slice of order) {
    if (alongArc(parts, slice, frame, widthOf, hits, inside, placed)) continue;
    outside(parts, slice, frame, widthOf, hits, inside, placed);
  }
}

function alongArc(
  parts: string[],
  slice: SliceLabel,
  frame: { cx: number; cy: number },
  widthOf: (name: string) => number,
  hits: (box: Box) => boolean,
  inside: (box: Box) => boolean,
  placed: Box[],
): boolean {
  const radius = (slice.r0 + slice.r1) / 2;
  const room = slice.span * radius;
  const wide = widthOf(slice.name);
  if (room < wide + 14 || slice.r1 - slice.r0 < 16) return false;
  const spot = tangent(frame.cx, frame.cy, radius, slice.mid, wide);
  if (!inside(spot.box) || hits(spot.box)) return false;
  placed.push(spot.box);
  const h = 11;
  const top = -h * 0.82;
  const spin = `transform="rotate(${n(spot.rot)} ${n(spot.x)} ${n(spot.y)})"`;
  parts.push(`<rect x="${n(spot.x - wide / 2)}" y="${n(spot.y + top)}" width="${n(wide)}" height="${n(h)}" fill="${slice.fill}" ${spin} />`);
  parts.push(
    `<text x="${n(spot.x)}" y="${n(spot.y)}" text-anchor="middle" fill="${labelInk(slice.fill)}" font-size="11" font-weight="650" ${spin}>${esc(slice.name)}</text>`,
  );
  return true;
}

function outside(
  parts: string[],
  slice: SliceLabel,
  frame: { cx: number; cy: number; outer: number },
  widthOf: (name: string) => number,
  hits: (box: Box) => boolean,
  inside: (box: Box) => boolean,
  placed: Box[],
): void {
  const wide = widthOf(slice.name);
  const nudges = [0, 0.16, -0.16, 0.32, -0.32, 0.48, -0.48];
  for (const nudge of nudges) {
    const angle = slice.mid + nudge;
    const reach = frame.outer + 16;
    const [x, y] = polar(frame.cx, frame.cy, reach, angle);
    const anchor = Math.cos(angle) > 0.3 ? "start" : Math.cos(angle) < -0.3 ? "end" : "middle";
    const left = anchor === "start" ? x : anchor === "end" ? x - wide : x - wide / 2;
    const box = { x: left, y: y - 11, w: wide, h: 14 };
    if (!inside(box) || hits(box)) continue;
    placed.push(box);
    const [sx, sy] = polar(frame.cx, frame.cy, frame.outer, slice.mid);
    const [ex, ey] = polar(frame.cx, frame.cy, frame.outer + 8, angle);
    parts.push(`<line data-ck-leader="1" x1="${n(sx)}" y1="${n(sy)}" x2="${n(ex)}" y2="${n(ey)}" stroke="${cssVar("muted", "#6e6e73")}" stroke-width="1" />`);
    parts.push(`<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${cssVar("text", "#1d1d1f")}" font-size="11" font-weight="650">${esc(slice.name)}</text>`);
    return;
  }
}

function tangent(cx: number, cy: number, radius: number, angle: number, wide: number): { x: number; y: number; rot: number; box: Box } {
  const [x, y] = polar(cx, cy, radius, angle);
  let rot = (angle * 180) / Math.PI + 90;
  const turned = ((rot % 360) + 360) % 360;
  if (turned > 90 && turned < 270) rot += 180;
  const h = 11;
  const rad = (rot * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners: Array<[number, number]> = [
    [-wide / 2, -h * 0.82],
    [wide / 2, -h * 0.82],
    [wide / 2, h * 0.18],
    [-wide / 2, h * 0.18],
  ];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [lx, ly] of corners) {
    const rx = x + lx * cos - ly * sin;
    const ry = y + lx * sin + ly * cos;
    minX = Math.min(minX, rx);
    minY = Math.min(minY, ry);
    maxX = Math.max(maxX, rx);
    maxY = Math.max(maxY, ry);
  }
  return { x, y, rot, box: { x: minX, y: minY, w: maxX - minX, h: maxY - minY } };
}
