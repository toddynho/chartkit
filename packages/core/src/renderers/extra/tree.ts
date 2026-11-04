import { limitDepth, readHierarchy, type HNode } from "../../hierarchy";
import { fieldOf } from "../../frame";
import { legendSpace, paintLegend, readLegend, type LegendItem } from "../../legend";
import { cssVar } from "../../theme";
import { clientIntent, isRecord, n } from "../../svg";
import { fill, fit, openMark, text, viewOf } from "./plot";

interface LNode {
  name: string;
  id: string;
  depth: number;
  /** Breadth after the tidy walk. */
  x: number;
  /** Depth used for the long axis. Cluster pushes leaves out to the last depth. */
  y: number;
  value: number;
  branch: string;
  colorKey: string;
  parent: LNode | null;
  children: LNode[];
}

type Orient = "LR" | "RL" | "TB" | "BT";

/** Tidy tree or dendrogram. Dots and links, not boxes. */
export function renderTree(spec: Record<string, unknown>): string | null {
  const read = readHierarchy(spec, { keepZero: true });
  if (!read) return null;
  if (read.issues.some((item) => item.severity === "error")) return null;
  const root = unwrap(read.root);
  if (!root || root.name === "") return null;
  const view = viewOf(spec, "tree", 640, 420);
  if (!view) return null;
  const { frame, parts } = view;
  const mark = frame.mark;
  const maxDepth = typeof mark.depth === "number" ? mark.depth : 8;
  const limited = limitDepth(root, maxDepth);
  const collapsed = new Set(Array.isArray(mark.collapsed) ? mark.collapsed.map((item) => String(item)) : []);
  const colorField = fieldOf(frame.encoding.color);
  const colors = colorLookup(spec, colorField);
  const orient = orientOf(mark.orient);
  const cluster = mark.tree === "cluster";
  const radial = mark.radial === true;
  const step = mark.link === "step";
  const colorBy = mark.colorBy === "depth" ? "depth" : "branch";
  const node = build(limited, 0, limited.name, null, collapsed, colors, colorField);
  if (!node) return null;
  tidy(node);
  const depths = flatten(node);
  const maxD = depths.reduce((max, item) => Math.max(max, item.depth), 0);
  if (cluster) for (const item of depths) if (!item.children.length) item.y = maxD;
  const span = depths.reduce((max, item) => Math.max(max, item.x), 0);

  const legendOn = frame.legend !== false && (colorField !== undefined || colorBy === "depth");
  const items = legendItems(frame, depths, colorBy, colorField);
  const legend = legendOn && items.length > 1 ? readLegend({ ...spec, legend: frame.legend === false ? "bottom" : frame.legend }) : null;
  const top = (frame.title ? 40 : 16) + (frame.subtitle ? 18 : 0);
  const legendBlock = legend ? legendSpace(legend, items, frame.width - 32) : null;
  const legendH = legendBlock?.block ?? 0;
  const box = {
    left: orient === "LR" || radial ? 28 : 16,
    right: frame.width - (orient === "RL" ? 28 : 96),
    top: top + (legend?.position === "top" ? legendH : 0),
    bottom: frame.height - 20 - (legend && legend.position !== "top" ? legendH : 0),
  };
  if (box.right - box.left < 40 || box.bottom - box.top < 40) return null;

  const placed = new Map<LNode, { x: number; y: number; r: number }>();
  const radius = radiusScale(depths);
  for (const item of depths) {
    const at = project(item, span, maxD, box, orient, radial);
    placed.set(item, { ...at, r: radius(item) });
  }

  const muted = cssVar("muted", frame.preset.muted);
  const ink = cssVar("text", frame.preset.text);
  const surface = cssVar("surface", frame.preset.surface);
  parts.push(`<g aria-hidden="true">`);
  for (const item of depths) {
    if (!item.parent) continue;
    const from = placed.get(item.parent);
    const to = placed.get(item);
    if (!from || !to) continue;
    const d = linkPath(from, to, orient, radial, step);
    parts.push(`<path data-ck-link="${escapeAttr(item.id)}" d="${d}" fill="none" stroke="${muted}" stroke-opacity="0.7" stroke-width="1.25" />`);
  }
  parts.push(`</g>`);

  const branchIndex = new Map<string, number>();
  for (const item of depths) {
    if (!branchIndex.has(item.branch)) branchIndex.set(item.branch, branchIndex.size);
  }
  const colorOf = (item: LNode) => {
    if (colorField && item.colorKey) return fill(frame, colorIndex(item.colorKey, depths));
    if (colorBy === "depth") return fill(frame, item.depth);
    return fill(frame, branchIndex.get(item.branch) ?? 0);
  };
  const showValue = fieldOf(frame.encoding.y) !== undefined;
  for (const item of depths) {
    const at = placed.get(item);
    if (!at) continue;
    const parent = item.parent?.name ?? "none";
    const label = showValue && item.value > 0 ? `${item.name}, child of ${parent}, depth ${item.depth}, ${item.value}` : `${item.name}, child of ${parent}, depth ${item.depth}`;
    const color = colorOf(item);
    parts.push(
      openMark(
        "circle",
        "point",
        label,
        `data-ck-id="${escapeAttr(item.id)}" data-ck-parent="${escapeAttr(item.parent?.id ?? "")}" data-ck-path="${escapeAttr(itemPath(item))}" cx="${n(at.x)}" cy="${n(at.y)}" r="${n(at.r)}" fill="${color}" stroke="${surface}" stroke-width="1" tabindex="0"`,
        item.name,
      ),
    );
    parts.push("</circle>");
    const caption = fit(item.name, radial ? 56 : labelRoom(orient, box, at), 12);
    if (caption) {
      const spot = labelAt(at, orient, radial, at.r);
      parts.push(text(spot.x, spot.y, caption, ink, 12, "400", spot.anchor));
    }
  }
  if (legend && items.length > 1) {
    parts.push(paintLegend(legend, items, { plot: { left: box.left, right: box.right, top: box.top, bottom: box.bottom }, width: frame.width, height: frame.height, preset: frame.preset }));
  }
  const intent = clientIntent(spec);
  if (intent && parts[0]?.startsWith("<svg ")) parts[0] = parts[0].replace("<svg ", `<svg data-ck-intent="${intent}" `);
  return view.done();
}

function unwrap(root: HNode): HNode | null {
  if (root.name === "" && root.children.length === 1) return root.children[0];
  if (root.name === "" && root.children.length !== 1) return root.name === "" && root.children.length > 1 ? null : root;
  return root;
}

function build(node: HNode, depth: number, branch: string, parent: LNode | null, collapsed: Set<string>, colors: Map<string, string>, colorField: string | undefined): LNode | null {
  const id = node.name;
  const nextBranch = depth === 1 ? node.name : branch;
  const current: LNode = {
    name: node.name,
    id,
    depth,
    x: 0,
    y: depth,
    value: node.value,
    branch: depth === 0 ? node.name : nextBranch,
    colorKey: colors.get(id) ?? "",
    parent,
    children: [],
  };
  if (!collapsed.has(id)) {
    for (const child of node.children) {
      const built = build(child, depth + 1, depth === 0 ? child.name : nextBranch, current, collapsed, colors, colorField);
      if (built) current.children.push(built);
    }
  }
  return current;
}

/** Reingold–Tilford: each subtree is packed, then shifted until same-depth nodes keep a gap. */
function tidy(root: LNode): void {
  place(root);
  let min = Infinity;
  each(root, (node) => {
    min = Math.min(min, node.x);
  });
  if (!Number.isFinite(min)) return;
  each(root, (node) => {
    node.x -= min;
  });
}

function place(node: LNode): void {
  for (const child of node.children) place(child);
  if (!node.children.length) {
    node.x = 0;
    return;
  }
  for (let i = 1; i < node.children.length; i++) {
    const shift = contourGap(node.children.slice(0, i), node.children[i]);
    if (shift > 0) move(node.children[i], shift);
  }
  const first = node.children[0];
  const last = node.children[node.children.length - 1];
  node.x = (first.x + last.x) / 2;
}

function move(node: LNode, shift: number): void {
  node.x += shift;
  for (const child of node.children) move(child, shift);
}

function contourGap(left: LNode[], right: LNode): number {
  const rightEdge = new Map<number, number>();
  for (const node of left) contour(node, rightEdge, 1);
  const leftEdge = new Map<number, number>();
  contour(right, leftEdge, -1);
  let need = 0;
  for (const [depth, edge] of leftEdge) {
    const other = rightEdge.get(depth);
    if (other === undefined) continue;
    need = Math.max(need, other + 1 - edge);
  }
  return need;
}

function contour(node: LNode, edges: Map<number, number>, sign: 1 | -1): void {
  const previous = edges.get(node.depth);
  edges.set(node.depth, previous === undefined ? node.x : sign > 0 ? Math.max(previous, node.x) : Math.min(previous, node.x));
  for (const child of node.children) contour(child, edges, sign);
}

function each(node: LNode, visit: (node: LNode) => void): void {
  visit(node);
  for (const child of node.children) each(child, visit);
}

function flatten(node: LNode): LNode[] {
  const out: LNode[] = [];
  each(node, (item) => out.push(item));
  return out;
}

function project(node: LNode, span: number, maxDepth: number, box: { left: number; right: number; top: number; bottom: number }, orient: Orient, radial: boolean): { x: number; y: number } {
  const breadth = span <= 0 ? 0.5 : node.x / span;
  const along = maxDepth <= 0 ? 0.5 : node.y / maxDepth;
  if (radial) {
    const cx = (box.left + box.right) / 2;
    const cy = (box.top + box.bottom) / 2;
    const radius = Math.max(12, Math.min(box.right - box.left, box.bottom - box.top) / 2 - 28);
    const angle = (span <= 0 ? 0 : (node.x / (span + 1)) * Math.PI * 2) - Math.PI / 2;
    const r = along * radius;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  }
  const x0 = box.left;
  const x1 = box.right;
  const y0 = box.top;
  const y1 = box.bottom;
  if (orient === "LR") return { x: x0 + along * (x1 - x0), y: y0 + breadth * (y1 - y0) };
  if (orient === "RL") return { x: x1 - along * (x1 - x0), y: y0 + breadth * (y1 - y0) };
  if (orient === "BT") return { x: x0 + breadth * (x1 - x0), y: y1 - along * (y1 - y0) };
  return { x: x0 + breadth * (x1 - x0), y: y0 + along * (y1 - y0) };
}

function linkPath(from: { x: number; y: number }, to: { x: number; y: number }, orient: Orient, radial: boolean, step: boolean): string {
  if (radial) {
    if (step) {
      const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
      return `M${n(from.x)} ${n(from.y)}L${n(mid.x)} ${n(mid.y)}L${n(to.x)} ${n(to.y)}`;
    }
    const c1 = { x: from.x * 0.35 + to.x * 0.65, y: from.y };
    const c2 = { x: to.x, y: from.y * 0.35 + to.y * 0.65 };
    return `M${n(from.x)} ${n(from.y)}C${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(to.x)} ${n(to.y)}`;
  }
  const horizontal = orient === "LR" || orient === "RL";
  if (step) {
    if (horizontal) {
      const mid = (from.x + to.x) / 2;
      return `M${n(from.x)} ${n(from.y)}H${n(mid)}V${n(to.y)}H${n(to.x)}`;
    }
    const mid = (from.y + to.y) / 2;
    return `M${n(from.x)} ${n(from.y)}V${n(mid)}H${n(to.x)}V${n(to.y)}`;
  }
  if (horizontal) {
    const mid = (from.x + to.x) / 2;
    return `M${n(from.x)} ${n(from.y)}C${n(mid)} ${n(from.y)} ${n(mid)} ${n(to.y)} ${n(to.x)} ${n(to.y)}`;
  }
  const mid = (from.y + to.y) / 2;
  return `M${n(from.x)} ${n(from.y)}C${n(from.x)} ${n(mid)} ${n(to.x)} ${n(mid)} ${n(to.x)} ${n(to.y)}`;
}

function radiusScale(nodes: LNode[]): (node: LNode) => number {
  const valued = nodes.filter((node) => node.value > 0);
  if (valued.length < 2) return () => 5;
  let min = Infinity;
  let max = -Infinity;
  for (const node of valued) {
    min = Math.min(min, node.value);
    max = Math.max(max, node.value);
  }
  if (!(max > min)) return () => 5;
  return (node) => {
    if (!(node.value > 0)) return 5;
    return 4 + ((node.value - min) / (max - min)) * 6;
  };
}

function labelRoom(orient: Orient, box: { left: number; right: number }, at: { x: number }): number {
  if (orient === "RL") return Math.max(12, at.x - box.left - 8);
  if (orient === "TB" || orient === "BT") return 72;
  return Math.max(12, box.right - at.x + 64);
}

function labelAt(at: { x: number; y: number }, orient: Orient, radial: boolean, radius: number): { x: number; y: number; anchor: string } {
  if (radial) return { x: at.x + radius + 4, y: at.y + 4, anchor: "start" };
  if (orient === "RL") return { x: at.x - radius - 4, y: at.y + 4, anchor: "end" };
  if (orient === "TB") return { x: at.x, y: at.y + radius + 12, anchor: "middle" };
  if (orient === "BT") return { x: at.x, y: at.y - radius - 4, anchor: "middle" };
  return { x: at.x + radius + 4, y: at.y + 4, anchor: "start" };
}

function legendItems(frame: { preset: import("../../theme").ThemePreset }, nodes: LNode[], colorBy: "branch" | "depth", colorField: string | undefined): LegendItem[] {
  if (colorField) {
    const names: string[] = [];
    for (const node of nodes) if (node.colorKey && !names.includes(node.colorKey)) names.push(node.colorKey);
    return names.map((name, index) => ({ name, color: fill({ preset: frame.preset } as import("../../frame").Frame, index) }));
  }
  if (colorBy === "depth") {
    const depths = [...new Set(nodes.map((node) => node.depth))].sort((a, b) => a - b);
    return depths.map((depth) => ({ name: `Depth ${depth}`, color: fill({ preset: frame.preset } as import("../../frame").Frame, depth) }));
  }
  return [];
}

function colorIndex(key: string, nodes: LNode[]): number {
  const names: string[] = [];
  for (const node of nodes) if (node.colorKey && !names.includes(node.colorKey)) names.push(node.colorKey);
  const index = names.indexOf(key);
  return index < 0 ? 0 : index;
}

function colorLookup(spec: Record<string, unknown>, field: string | undefined): Map<string, string> {
  const out = new Map<string, string>();
  if (!field || !Array.isArray(spec.data)) return out;
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const idField = typeof encoding.id === "string" ? encoding.id : "";
  const visit = (row: unknown) => {
    if (!isRecord(row)) return;
    const name = idField && row[idField] != null ? String(row[idField]) : typeof row.name === "string" ? row.name : typeof row.id === "string" ? String(row.id) : "";
    if (name && row[field] != null && row[field] !== "") out.set(name, String(row[field]));
    if (Array.isArray(row.children)) for (const child of row.children) visit(child);
  };
  for (const row of spec.data) visit(row);
  return out;
}

function orientOf(value: unknown): Orient {
  if (value === "RL" || value === "TB" || value === "BT" || value === "LR") return value;
  return "LR";
}

function itemPath(node: LNode): string {
  const names: string[] = [];
  let cursor: LNode | null = node;
  while (cursor) {
    names.push(cursor.name);
    cursor = cursor.parent;
  }
  return names.reverse().join("/");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
