

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

export function plotBox(svg: SVGSVGElement): Box {
  const rect = svg.querySelector("clipPath rect");
  if (rect) {
    const num = (name: string) => Number(rect.getAttribute(name)) || 0;
    return { l: num("x"), t: num("y"), w: num("width") || 1, h: num("height") || 1 };
  }
  const parts = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
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

/** Plot marks the tooltip must not cover: line vertices, the segments between them, and bars. */
export function tipObstacles(svg: SVGSVGElement, rect: DOMRect, bounds: DOMRect, sx: number, sy: number, plot: Box): TipBox[] {
  const xOf = (x: number) => rect.left + x * sx - bounds.left;
  const yOf = (y: number) => rect.top + y * sy - bounds.top;
  const out: TipBox[] = [];
  const pad = 8;
  const groups = new Map<string, { x: number; y: number }[]>();
  const circles = svg.querySelectorAll("circle");
  for (let i = 0; i < circles.length; i++) {
    const node = circles[i];
    const cx = Number(node.getAttribute("cx"));
    const cy = Number(node.getAttribute("cy"));
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) continue;
    if (cx < plot.l - 2 || cx > plot.l + plot.w + 2 || cy < plot.t - 2 || cy > plot.t + plot.h + 2) continue;
    const key = node.getAttribute("stroke") || node.getAttribute("fill") || "point";
    const list = groups.get(key);
    if (list) list.push({ x: cx, y: cy });
    else groups.set(key, [{ x: cx, y: cy }]);
  }
  const paths = svg.querySelectorAll("path");
  for (let p = 0; p < paths.length; p++) {
    const path = paths[p];
    if (!path || path.getAttribute("filter")) continue;
    const fill = path.getAttribute("fill");
    const stroke = path.getAttribute("stroke");
    if (!stroke || stroke === "none" || (fill && fill !== "none")) continue;
    const points = pathVertices(path.getAttribute("d") || "").filter(
      (point) => point.x >= plot.l - 2 && point.x <= plot.l + plot.w + 2 && point.y >= plot.t - 2 && point.y <= plot.t + plot.h + 2,
    );
    if (points.length) groups.set(`path-${p}`, points);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.x - b.x || a.y - b.y);
    let prev: { x: number; y: number } | null = null;
    for (let i = 0; i < list.length; i++) {
      const point = list[i];
      if (!point) continue;
      if (prev && Math.abs(prev.x - point.x) < 0.5 && Math.abs(prev.y - point.y) < 0.5) continue;
      const span = prev && point.x - prev.x <= plot.w * 0.2 ? prev : null;
      const l = span ? Math.min(span.x, point.x) : point.x;
      const t = span ? Math.min(span.y, point.y) : point.y;
      const r = span ? Math.max(span.x, point.x) : point.x;
      const b = span ? Math.max(span.y, point.y) : point.y;
      out.push({ l: xOf(l) - pad, t: yOf(t) - pad, r: xOf(r) + pad, b: yOf(b) + pad });
      prev = point;
    }
  }
  const rects = svg.querySelectorAll("rect");
  for (let i = 0; i < rects.length; i++) {
    const node = rects[i];
    const fill = node.getAttribute("fill");
    if (!fill || fill === "none" || fill.startsWith("url(")) continue;
    const w = Number(node.getAttribute("width"));
    const h = Number(node.getAttribute("height"));
    if (!(w > 8) || !(h > 8) || w > plot.w * 0.9) continue;
    const x = Number(node.getAttribute("x"));
    const y = Number(node.getAttribute("y"));
    out.push({ l: xOf(x) - 4, t: yOf(y) - 4, r: xOf(x + w) + 4, b: yOf(y + h) + 4 });
  }
  const notes = svg.querySelectorAll("[data-ck-annotation]");
  for (let i = 0; i < notes.length; i++) {
    const node = notes[i];
    if (!node) continue;
    const kind = node.getAttribute("data-ck-annotation");
    if (kind === "band" || kind === "axis-band" || kind === "regression-band" || kind === "marker-line") continue;
    if (node.localName === "text") {
      const x = Number(node.getAttribute("x"));
      const y = Number(node.getAttribute("y"));
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const w = Math.max(24, (node.textContent?.length ?? 4) * 6.4);
      const anchor = node.getAttribute("text-anchor");
      const left = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
      out.push({ l: xOf(left) - 4, t: yOf(y - 12) - 4, r: xOf(left + w) + 4, b: yOf(y + 2) + 4 });
    } else if (node.localName === "rect") {
      const x = Number(node.getAttribute("x"));
      const y = Number(node.getAttribute("y"));
      const w = Number(node.getAttribute("width"));
      const h = Number(node.getAttribute("height"));
      if (![x, y, w, h].every(Number.isFinite) || w > plot.w * 0.9) continue;
      out.push({ l: xOf(x) - 4, t: yOf(y) - 4, r: xOf(x + w) + 4, b: yOf(y + h) + 4 });
    }
  }
  return out;
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
  const parts = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
  const vw = parts[2] || rect.width || 1;
  const vh = parts[3] || rect.height || 1;
  const rw = rect.width || vw;
  const rh = rect.height || vh;
  return {
    x: ((clientX - rect.left) / rw) * vw,
    y: ((clientY - rect.top) / rh) * vh,
  };
}
