

export function esc(value: string): string {
  return value.replace(/[&<>"]/g, (ch) => (ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : "&quot;"));
}

export function applyTipChrome(host: Element, svg: SVGSVGElement): void {
  if (!(host instanceof HTMLElement)) return;
  const bg = svg.getAttribute("data-ck-chrome-bg");
  const radius = svg.getAttribute("data-ck-chrome-radius");
  const shadow = svg.getAttribute("data-ck-chrome-shadow");
  const hair = svg.getAttribute("data-ck-xhair");
  if (bg) host.style.setProperty("--ck-tip-bg", bg);
  if (radius) host.style.setProperty("--ck-tip-radius", `${radius}px`);
  if (shadow) host.style.setProperty("--ck-tip-shadow", shadow);
  if (hair) host.style.setProperty("--ck-xhair", hair);
}

export function ensureCss(): void {
  if (typeof document === "undefined" || document.getElementById("ck-interact-style")) return;
  const style = document.createElement("style");
  style.id = "ck-interact-style";
  style.textContent =
    ".ck-tip{position:absolute;z-index:5;pointer-events:none;padding:8px 10px;border-radius:var(--ck-tip-radius,10px);font:12px/1.35 sans-serif;font-family:var(--ck-font-family, inherit);background:var(--ck-tip-bg,var(--ck-surface, light-dark(#fff,#2c2c2e)));color:var(--ck-text, light-dark(#1d1d1f,#f5f5f7));box-shadow:var(--ck-tip-shadow,0 8px 24px #0003);font-variant-numeric:tabular-nums}.ck-row{display:flex;align-items:center;gap:6px}.ck-tip b{margin-left:auto;padding-left:12px}.ck-tip i{width:8px;height:8px;border-radius:2px;flex:none}.ck-xhair{stroke:var(--ck-xhair,light-dark(#0006,#fff8));stroke-dasharray:3 3}.ck-xlabel{font-size:11px;font-family:var(--ck-font-family, inherit);fill:light-dark(#1d1d1f,#f5f5f7);stroke:light-dark(#fff,#1c1c1e);stroke-width:3px;paint-order:stroke;pointer-events:none}.ck-pick{stroke:var(--ck-selected,light-dark(#1d1d1f,#f5f5f7));stroke-width:2}[data-ck-dim]{opacity:var(--ck-dim,.32)}.ck-clip{position:absolute;top:0;left:0;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.ck-crumb{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 8px;font:12px/1.3 sans-serif;font-family:var(--ck-font-family, inherit);color:light-dark(#1d1d1f,#f5f5f7)}.ck-crumb button{font:inherit;color:inherit;background:transparent;border:1px solid light-dark(#0002,#fff3);border-radius:8px;padding:4px 8px;cursor:pointer}.ck-crumb [aria-current]{font-weight:650}.ck-bar-on{filter:brightness(1.18)}[data-ck-bar-dim]{opacity:.42}[data-ck-tip]{transition:left 160ms ease-out,top 160ms ease-out}@media (prefers-reduced-motion:reduce){[data-ck-tip]{transition:none}}";
  document.head.append(style);
}

export interface Box {
  l: number;
  t: number;
  w: number;
  h: number;
}

/** The viewBox as numbers: min x, min y, width, height. */
export function viewBox(svg: SVGSVGElement): number[] {
  return (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
}

export function plotBox(svg: SVGSVGElement): Box {
  const rect = svg.querySelector("clipPath rect");
  if (rect) {
    const num = (name: string) => Number(rect.getAttribute(name)) || 0;
    return { l: num("x"), t: num("y"), w: num("width") || 1, h: num("height") || 1 };
  }
  const parts = viewBox(svg);
  return { l: 0, t: 0, w: parts[2] || 640, h: parts[3] || 240 };
}

interface TipBox {
  l: number;
  t: number;
  r: number;
  b: number;
}

/** Endpoints of a stroke. Monotone cubics stay inside each segment, so the ends are enough. */
function pathVertices(d: string): { x: number; y: number }[] {
  const tokens = d.match(/[MLHVCSQTAZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  if (!tokens) return [];
  const out: { x: number; y: number }[] = [];
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  const read = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const tok = tokens[i];
    if (!tok) break;
    if (tok >= "A" && tok <= "Z") {
      cmd = tok;
      i += 1;
      continue;
    }
    if (cmd === "M" || cmd === "L" || cmd === "T") {
      x = read();
      y = read();
      if (cmd === "M") cmd = "L";
    } else if (cmd === "C") {
      read(); read(); read(); read();
      x = read();
      y = read();
    } else if (cmd === "S" || cmd === "Q") {
      read(); read();
      x = read();
      y = read();
    } else if (cmd === "H") {
      x = read();
    } else if (cmd === "V") {
      y = read();
    } else if (cmd === "A") {
      read(); read(); read(); read(); read();
      x = read();
      y = read();
    } else {
      i += 1;
      continue;
    }
    if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y });
  }
  return out;
}

interface Pt {
  x: number;
  y: number;
}

/** A box in viewBox units. `p` pads it in host pixels. */
interface Span extends TipBox {
  p: number;
}

/** The drawn marks the tooltip must not cover, read once per drawn SVG. `px` is `spans` in host pixels at scale `at`. */
export interface Marks {
  groups: Map<string, Pt[]>;
  spans: Span[];
  /** Every node was read, the hover's own included. Set while a motion flight is rewriting the SVG. */
  all: boolean;
  px?: TipBox[];
  at?: string;
}

/** Nodes the hover adds without a redraw. They sit at the end of the svg, after the hidden-series keys. */
const LIVE = "[data-ck-dot],[data-ck-pick],[data-ck-brush]";
const TAIL = LIVE + ",[data-ck-crosshair],[data-ck-xlabel],[data-ck-hidden-key]";

/** Boxes around the points of one stroke or one circle colour, and the segments between neighbours. */
function link(list: Pt[], plot: Box, out: Span[]): void {
  list.sort((a, b) => a.x - b.x || a.y - b.y);
  let prev: Pt | null = null;
  for (let i = 0; i < list.length; i++) {
    const point = list[i];
    if (prev && Math.abs(prev.x - point.x) < 0.5 && Math.abs(prev.y - point.y) < 0.5) continue;
    const span = prev && point.x - prev.x <= plot.w * 0.2 ? prev : null;
    out.push({
      l: span ? Math.min(span.x, point.x) : point.x,
      t: span ? Math.min(span.y, point.y) : point.y,
      r: span ? Math.max(span.x, point.x) : point.x,
      b: span ? Math.max(span.y, point.y) : point.y,
      p: 8,
    });
    prev = point;
  }
}

/** Sort nodes into circle groups and boxes: line vertices, bars, and annotations. `live` keeps the hover's own nodes. */
function sift(nodes: ArrayLike<Element>, plot: Box, live: boolean, groups: Map<string, Pt[]>, out: Span[]): void {
  const inside = (x: number, y: number) => x >= plot.l - 2 && x <= plot.l + plot.w + 2 && y >= plot.t - 2 && y <= plot.t + plot.h + 2;
  const num = (node: Element, name: string) => Number(node.getAttribute(name));
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!live && node.matches(LIVE)) continue;
    const tag = node.localName;
    const fill = node.getAttribute("fill");
    const stroke = node.getAttribute("stroke");
    const x = num(node, "x");
    const y = num(node, "y");
    const w = num(node, "width");
    const h = num(node, "height");
    if (tag === "circle") {
      const cx = num(node, "cx");
      const cy = num(node, "cy");
      if (inside(cx, cy)) {
        const key = stroke || fill || "point";
        (groups.get(key) || groups.set(key, []).get(key)!).push({ x: cx, y: cy });
      }
    } else if (tag === "path") {
      if (!node.getAttribute("filter") && stroke && stroke !== "none" && !(fill && fill !== "none")) {
        link(pathVertices(node.getAttribute("d") || "").filter((point) => inside(point.x, point.y)), plot, out);
      }
    }
    const kind = node.getAttribute("data-ck-annotation");
    const note = kind != null && kind !== "band" && kind !== "axis-band" && kind !== "regression-band" && kind !== "marker-line";
    if (tag === "rect" && !(w > plot.w * 0.9)) {
      const box = { l: x, t: y, r: x + w, b: y + h, p: 4 };
      if (fill && fill !== "none" && !fill.startsWith("url(") && w > 8 && h > 8) out.push(box);
      if (note && [x, y, w, h].every(Number.isFinite)) out.push(box);
    } else if (note && tag === "text" && Number.isFinite(x) && Number.isFinite(y)) {
      const width = Math.max(24, (node.textContent?.length ?? 4) * 6.4);
      const anchor = node.getAttribute("text-anchor");
      const left = anchor === "end" ? x - width : anchor === "middle" ? x - width / 2 : x;
      out.push({ l: left, t: y - 12, r: left + width, b: y + 2, p: 4 });
    }
  }
}

/** Read the marks once. `all` also reads the hover's own nodes, for an SVG that is mid-flight. */
export function scanMarks(svg: SVGSVGElement, plot: Box, all: boolean): Marks {
  const groups = new Map<string, Pt[]>();
  const spans: Span[] = [];
  sift(svg.querySelectorAll("circle,path,rect,[data-ck-annotation]"), plot, all, groups, spans);
  for (const list of groups.values()) link(list, plot, spans);
  return { groups, spans, all };
}

/** Plot marks the tooltip must not cover: line vertices, the segments between them, and bars. */
export function tipObstacles(svg: SVGSVGElement, rect: DOMRect, bounds: DOMRect, sx: number, sy: number, plot: Box, seen: Marks): TipBox[] {
  const xOf = (x: number) => rect.left + x * sx - bounds.left;
  const yOf = (y: number) => rect.top + y * sy - bounds.top;
  const fit = (s: Span): TipBox => ({ l: xOf(s.l) - s.p, t: yOf(s.t) - s.p, r: xOf(s.r) + s.p, b: yOf(s.b) + s.p });
  const at = [rect.left, rect.top, bounds.left, bounds.top, sx, sy].join();
  if (seen.at !== at) {
    seen.at = at;
    seen.px = seen.spans.map(fit);
  }
  const px = seen.px!;
  const live: Element[] = [];
  if (!seen.all) {
    for (let node = svg.lastElementChild; node && node.matches(TAIL); node = node.previousElementSibling) if (node.matches(LIVE)) live.push(node);
  }
  if (!live.length) return px;
  const groups = new Map<string, Pt[]>();
  const extra: Span[] = [];
  sift(live, plot, true, groups, extra);
  for (const [key, list] of groups) {
    // A hover dot that shares a colour key with drawn circles joins their group, so everything is read again.
    if (seen.groups.has(key)) return tipObstacles(svg, rect, bounds, sx, sy, plot, scanMarks(svg, plot, true));
    link(list, plot, extra);
  }
  return px.concat(extra.map(fit));
}

export function tipOverlap(a: TipBox, b: TipBox): boolean {
  return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
}

/**
 * Prefer the requested side, then any side that misses the point and the annotations.
 * Returns null when every side is blocked, so the caller can fall back.
 */
export function parkTip(
  place: number,
  hostW: number,
  hostH: number,
  width: number,
  height: number,
  midX: number,
  midY: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  anchor: TipBox,
  obstacles: TipBox[],
): { left: number; top: number } | null {
  if (hostW < width + 8 || hostH < height + 8) return null;
  const gap = 14;
  const sides = [
    { left: midX - width / 2, top: minY - height - gap },
    { left: midX - width / 2, top: maxY + gap },
    { left: maxX + gap, top: midY - height / 2 },
    { left: minX - width - gap, top: midY - height / 2 },
  ];
  const order = place === 2 ? [1, 0, 2, 3] : place === 3 ? [3, 1, 0, 2] : place === 4 ? [2, 1, 0, 3] : [0, 1, 2, 3];
  for (let i = 0; i < order.length; i++) {
    const raw = sides[order[i] ?? 0];
    if (!raw) continue;
    const left = raw.left;
    const top = raw.top;
    if (left < 4 || top < 4 || left + width > hostW - 4 || top + height > hostH - 4) continue;
    const card = { l: left, t: top, r: left + width, b: top + height };
    if (tipOverlap(card, anchor)) continue;
    let hit = false;
    for (let k = 0; k < obstacles.length; k++) {
      const item = obstacles[k];
      if (item && tipOverlap(card, item)) {
        hit = true;
        break;
      }
    }
    if (!hit) return { left, top };
  }
  return null;
}

/**
 * Sit the card just above the marks in a column, on the side away from the
 * anchor when the anchor is near an edge. Returns null when every column is blocked.
 */
export function sitTip(
  obstacles: TipBox[],
  hostW: number,
  hostH: number,
  width: number,
  height: number,
  anchorX: number,
  anchorY: number,
  onRight: boolean,
  plotLeft: number,
  plotRight: number,
): { left: number; top: number } | null {
  if (hostW < width + 8 || hostH < height + 8) return null;
  const gap = 8;
  const columns = onRight
    ? [anchorX - width - 14, plotLeft + 4, 4]
    : [anchorX + 14, plotRight - width - 4, hostW - width - 4];
  for (let c = 0; c < columns.length; c++) {
    const left = Math.max(4, Math.min(columns[c], hostW - width - 4));
    let ceiling = hostH;
    let floor = 0;
    let hit = false;
    for (let i = 0; i < obstacles.length; i++) {
      const item = obstacles[i];
      if (left < item.r && left + width > item.l) {
        hit = true;
        if (item.t < ceiling) ceiling = item.t;
        if (item.b > floor) floor = item.b;
      }
    }
    if (!hit) {
      const near = anchorY - height - gap;
      if (near >= 4 && near + height <= hostH - 4) return { left, top: near };
      continue;
    }
    const above = ceiling - height - gap;
    if (above >= 4) return { left, top: above };
    const below = floor + gap;
    if (below + height <= hostH - 4) return { left, top: below };
  }
  return null;
}

export function viewPoint(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  const parts = viewBox(svg);
  const vw = parts[2] || rect.width || 1;
  const vh = parts[3] || rect.height || 1;
  const rw = rect.width || vw;
  const rh = rect.height || vh;
  return {
    x: ((clientX - rect.left) / rw) * vw,
    y: ((clientY - rect.top) / rh) * vh,
  };
}
