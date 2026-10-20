import { limitDepth, readHierarchy, type HNode } from "../../hierarchy";
import { cssVar } from "../../theme";
import { esc, font, n } from "../../svg";
import { fill, fit, fmt, valueFormat, viewOf } from "./plot";

function shade(base: string, depth: number): string {
  if (depth <= 0) return base;
  const mix = Math.max(38, 76 - (depth - 1) * 14);
  return `color-mix(in srgb, ${base} ${mix}%, light-dark(#ffffff, #1c1c1e))`;
}

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
  const defs: string[] = [];
  let ordinal = 0;
  const paint = (node: HNode, color: string, branch: string, depth: number, a0: number, a1: number, parent: number) => {
    const r0 = inner + depth * thick;
    const r1 = r0 + thick;
    const label = tip(node, parent, total, frame.locale, shown);
    const index = ordinal;
    ordinal += 1;
    const span = a1 - a0;
    parts.push(
      `<path d="${arc(cx, cy, r0, r1, a0, a1)}" fill="${shade(color, depth)}" data-ck-mark="arc" data-ck-name="${esc(branch)}" data-ck-i="${index}" aria-label="${esc(label)}"><title>${esc(label)}</title></path>`,
    );
    const mid = (a0 + a1) / 2;
    const name = node.name;
    const radius = (r0 + r1) / 2;
    const arcLen = span * radius;
    const width = name.length * 11 * 0.56;
    if (name && arcLen > width + 10 && thick > 14 && span > 0.08) {
      const lower = Math.sin(mid) > 0;
      const start = lower ? a1 : a0;
      const end = lower ? a0 : a1;
      const [sx, sy] = polar(cx, cy, radius, start);
      const [ex, ey] = polar(cx, cy, radius, end);
      const id = `${frame.id}-a${index}`;
      const large = Math.abs(end - start) > Math.PI ? 1 : 0;
      const sweep = lower ? 0 : 1;
      defs.push(`<path id="${id}" d="M ${n(sx)} ${n(sy)} A ${n(radius)} ${n(radius)} 0 ${large} ${sweep} ${n(ex)} ${n(ey)}" fill="none" />`);
      const text = fit(name, arcLen - 8, 11);
      if (text) {
        parts.push(
          `<text fill="#fff" stroke="rgb(0 0 0 / 0.4)" stroke-width="2" paint-order="stroke" font-size="11" font-weight="650" font-family="${font()}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(text)}</textPath></text>`,
        );
      }
    }
    if (!node.children.length) return;
    let cursor = a0;
    for (const child of node.children) {
      const next = cursor + span * (child.value / (node.value || 1));
      paint(child, color, branch, depth + 1, cursor, next, node.value);
      cursor = next;
    }
  };
  let cursor = -Math.PI / 2;
  branches.forEach((node, index) => {
    const next = cursor + (Math.PI * 2 * node.value) / total;
    paint(node, colors[index] ?? fill(frame, index), node.name, 0, cursor, next, total);
    cursor = next;
  });
  if (defs.length) parts.splice(1, 0, `<defs>${defs.join("")}</defs>`);
  const centre = root.name || fmt(total, frame.locale, shown);
  const holePx = inner;
  if (holePx > 22) {
    const ink = cssVar("text", frame.preset.text);
    const sub = root.name ? fmt(total, frame.locale, shown) : "";
    parts.push(`<text x="${n(cx)}" y="${n(cy + (sub ? -2 : 4))}" text-anchor="middle" fill="${ink}" font-size="13" font-weight="650" font-family="${font()}">${esc(fit(centre, holePx * 1.6, 13) || centre)}</text>`);
    if (sub) parts.push(`<text x="${n(cx)}" y="${n(cy + 14)}" text-anchor="middle" fill="${cssVar("muted", frame.preset.muted)}" font-size="11" font-family="${font()}">${esc(sub)}</text>`);
  }
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
