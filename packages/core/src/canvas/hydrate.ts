/**
 * Paint an already-rendered SVG's marks onto a canvas inside the marks group.
 * Axes, legend, title, annotations, the aria description, and the data table stay SVG,
 * so type stays sharp and pointer hit-testing keeps using the same nodes.
 * Loaded on demand from `interact.ts`. `createRenderer([line])` does not import this module.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const watchers = new WeakMap<Element, ResizeObserver>();

/** Draw `data-ck-layer="marks"` onto a canvas. No-op without a canvas context (SSR, jsdom). */
export function hydrate(host: Element): void {
  const svg = host.querySelector?.("svg");
  if (!(svg instanceof SVGSVGElement) || svg.getAttribute("data-ck-render") !== "canvas") return;
  const layer = svg.querySelector("[data-ck-layer='marks']");
  if (!(layer instanceof SVGGElement)) return;
  if (typeof document === "undefined" || typeof HTMLCanvasElement === "undefined") return;

  let foreign = layer.querySelector(":scope > foreignObject[data-ck-canvas]");
  let canvas = foreign?.querySelector("canvas") ?? null;
  if (!(foreign instanceof SVGForeignObjectElement) || !(canvas instanceof HTMLCanvasElement)) {
    foreign = document.createElementNS(SVG_NS, "foreignObject");
    foreign.setAttribute("data-ck-canvas", "");
    foreign.setAttribute("pointer-events", "none");
    canvas = document.createElement("canvas");
    canvas.setAttribute("data-ck-canvas", "");
    canvas.setAttribute("data-ck-painter", "ck-canvas-paint");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    foreign.append(canvas);
    layer.insertBefore(foreign, layer.firstChild);
  }
  const box = place(layer, foreign);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  paint(svg, canvas, ctx, layer, box);
  for (let i = 0; i < layer.children.length; i++) {
    const child = layer.children[i];
    if (child === foreign) continue;
    (child as SVGElement).style.opacity = "0";
  }
  if (!watchers.has(svg) && typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(() => hydrate(host));
    observer.observe(svg);
    watchers.set(svg, observer);
  }
}

/** Drop the canvas and show the SVG marks again. */
export function release(host: Element): void {
  const svg = host.querySelector?.("svg");
  watchers.get(svg ?? host)?.disconnect();
  if (svg) watchers.delete(svg);
  host.querySelectorAll("[data-ck-canvas]").forEach((node) => node.remove());
  host.querySelectorAll("[data-ck-layer='marks']").forEach((layer) => {
    for (let i = 0; i < layer.children.length; i++) (layer.children[i] as SVGElement).style.opacity = "";
  });
}

interface Box { x: number; y: number; width: number; height: number }

/** The marks' bounds, ignoring the canvas itself so the box does not grow on repaint. */
function layerBox(layer: SVGGElement): Box {
  const pad = 6;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < layer.children.length; i++) {
    const child = layer.children[i];
    if (child.hasAttribute("data-ck-canvas") || !(child instanceof SVGGraphicsElement)) continue;
    let box: DOMRect;
    try {
      box = child.getBBox();
    } catch {
      continue;
    }
    if (box.width === 0 && box.height === 0) continue;
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, width: 640, height: 360 };
  return { x: minX - pad, y: minY - pad, width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 };
}

function place(layer: SVGGElement, foreign: SVGForeignObjectElement): Box {
  const box = layerBox(layer);
  foreign.setAttribute("x", String(box.x));
  foreign.setAttribute("y", String(box.y));
  foreign.setAttribute("width", String(box.width));
  foreign.setAttribute("height", String(box.height));
  return box;
}

function paint(svg: SVGSVGElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, layer: SVGGElement, box: Box): void {
  const rect = canvas.getBoundingClientRect();
  const cssW = rect.width > 0 ? rect.width : box.width;
  const cssH = rect.height > 0 ? rect.height : box.height;
  const dpr = typeof window !== "undefined" && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
  const pixelsW = Math.max(1, Math.round(cssW * dpr));
  const pixelsH = Math.max(1, Math.round(cssH * dpr));
  if (canvas.width !== pixelsW) canvas.width = pixelsW;
  if (canvas.height !== pixelsH) canvas.height = pixelsH;
  const scaleX = pixelsW / box.width;
  const scaleY = pixelsH / box.height;
  ctx.setTransform(scaleX, 0, 0, scaleY, -box.x * scaleX, -box.y * scaleY);
  ctx.clearRect(box.x, box.y, box.width, box.height);
  const cache = new Map<string, string>();
  drawChildren(svg, ctx, layer, cache, 1);
}

function drawChildren(
  svg: SVGSVGElement,
  ctx: CanvasRenderingContext2D,
  parent: Element,
  cache: Map<string, string>,
  alpha: number,
): void {
  for (let i = 0; i < parent.children.length; i++) {
    const node = parent.children[i];
    if (node.hasAttribute("data-ck-canvas") || node.localName === "foreignObject" || node.localName === "title" || node.localName === "desc") continue;
    if (typeof getComputedStyle === "function" && getComputedStyle(node).display === "none") continue;
    const next = node.hasAttribute("data-ck-dim") ? alpha * 0.32 : alpha;
    if (node.localName === "g") {
      drawChildren(svg, ctx, node, cache, next);
      continue;
    }
    trace(svg, ctx, node, cache, next);
  }
}

function trace(svg: SVGSVGElement, ctx: CanvasRenderingContext2D, node: Element, cache: Map<string, string>, alpha: number): void {
  const name = node.localName;
  ctx.save();
  ctx.globalAlpha = alpha * opacityOf(node);
  const fill = styleFor(svg, ctx, node, node.getAttribute("fill"), cache);
  const stroke = paintOf(svg, node.getAttribute("stroke"), cache);
  ctx.lineWidth = cssNumber(node, "stroke-width", "strokeWidth", 1);
  const dash = node.getAttribute("stroke-dasharray");
  if (dash && dash !== "none") {
    const parts = dash.split(/[\s,]+/).map(Number).filter((value) => Number.isFinite(value));
    if (parts.length) ctx.setLineDash(parts);
  }
  if (name === "path") {
    const d = node.getAttribute("d");
    if (d && typeof Path2D !== "undefined") {
      const path = new Path2D(d);
      fillShape(ctx, path, fill, node);
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.stroke(path);
      }
    }
  } else if (name === "rect") {
    const x = numberAttr(node, "x", 0);
    const y = numberAttr(node, "y", 0);
    const w = numberAttr(node, "width", 0);
    const h = numberAttr(node, "height", 0);
    const rx = numberAttr(node, "rx", 0);
    if (rx > 0 && typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, rx);
      fillShape(ctx, undefined, fill, node);
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.stroke();
      }
    } else {
      if (fill) {
        ctx.fillStyle = fill;
        ctx.globalAlpha = alpha * opacityOf(node) * cssNumber(node, "fill-opacity", "fillOpacity", 1);
        ctx.fillRect(x, y, w, h);
      }
      if (stroke) {
        ctx.globalAlpha = alpha * opacityOf(node);
        ctx.strokeStyle = stroke;
        ctx.strokeRect(x, y, w, h);
      }
    }
  } else if (name === "circle") {
    const cx = numberAttr(node, "cx", 0);
    const cy = numberAttr(node, "cy", 0);
    const r = numberAttr(node, "r", 0);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    fillShape(ctx, undefined, fill, node);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  } else if (name === "line") {
    if (stroke) {
      ctx.beginPath();
      ctx.moveTo(numberAttr(node, "x1", 0), numberAttr(node, "y1", 0));
      ctx.lineTo(numberAttr(node, "x2", 0), numberAttr(node, "y2", 0));
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  } else if (name === "polygon" || name === "polyline") {
    const points = (node.getAttribute("points") ?? "").trim().split(/\s+/);
    if (points.length) {
      ctx.beginPath();
      points.forEach((pair, index) => {
        const [x, y] = pair.split(",").map(Number);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      if (name === "polygon") ctx.closePath();
      fillShape(ctx, undefined, fill, node);
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function fillShape(ctx: CanvasRenderingContext2D, path: Path2D | undefined, fill: string | CanvasGradient, node: Element): void {
  if (!fill) return;
  ctx.save();
  ctx.fillStyle = fill;
  const fade = cssNumber(node, "fill-opacity", "fillOpacity", 1);
  if (fade !== 1) ctx.globalAlpha *= fade;
  if (path) ctx.fill(path);
  else ctx.fill();
  ctx.restore();
}

function styleFor(
  svg: SVGSVGElement,
  ctx: CanvasRenderingContext2D,
  node: Element,
  value: string | null,
  cache: Map<string, string>,
): string | CanvasGradient {
  if (!value || value === "none") return "";
  if (value.startsWith("url(")) return gradientOf(svg, ctx, node, value, cache);
  return paintOf(svg, value, cache);
}

function opacityOf(node: Element): number {
  const raw = node.getAttribute("opacity");
  if (raw == null || raw === "") return 1;
  const value = Number(raw);
  return Number.isFinite(value) ? value : 1;
}

function numberAttr(node: Element, name: string, fallback: number): number {
  const value = Number(node.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
}

/** Presentation attributes may be var(--ck-*), which the SVG resolves and a raw Number() does not. */
function cssNumber(node: Element, attr: string, prop: "strokeWidth" | "fillOpacity", fallback: number): number {
  const raw = node.getAttribute(attr);
  if (raw != null && raw !== "" && Number.isFinite(Number(raw))) return Number(raw);
  if (typeof getComputedStyle !== "function") return fallback;
  const parsed = Number.parseFloat(getComputedStyle(node)[prop]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function paintOf(svg: SVGSVGElement, value: string | null, cache: Map<string, string>): string {
  if (!value || value === "none" || value.startsWith("url(")) return "";
  const hit = cache.get(value);
  if (hit !== undefined) return hit;
  let resolved = value;
  if (typeof document !== "undefined") {
    const parent = svg.parentElement ?? document.body;
    const probe = document.createElement("span");
    probe.style.color = value;
    parent.append(probe);
    const got = getComputedStyle(probe).color;
    probe.remove();
    if (got && !got.includes("var(") && !got.includes("light-dark")) resolved = got;
  }
  cache.set(value, resolved);
  return resolved;
}

/** Object-bounding-box linear gradients become a vertical canvas gradient across the mark. */
function gradientOf(
  svg: SVGSVGElement,
  ctx: CanvasRenderingContext2D,
  node: Element,
  value: string,
  cache: Map<string, string>,
): string | CanvasGradient {
  const id = /url\(#([^)]+)\)/.exec(value)?.[1];
  if (!id) return "";
  const grad = svg.querySelector(`#${CSS.escape(id)}`);
  const stops = grad ? [...grad.querySelectorAll("stop")] : [];
  if (!stops.length) return "";
  let box = { x: 0, y: 0, width: 0, height: 0 };
  if (node instanceof SVGGraphicsElement) {
    try {
      box = node.getBBox();
    } catch {
      box = { x: 0, y: 0, width: 0, height: 0 };
    }
  }
  const fade = ctx.createLinearGradient(box.x, box.y, box.x, box.y + (box.height || 1));
  let added = 0;
  for (const stop of stops) {
    const raw = stop.getAttribute("offset") ?? "0";
    const offset = raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw);
    const color = paintOf(svg, stop.getAttribute("stop-color"), cache);
    if (!color || color.includes("var(") || color.includes("light-dark")) continue;
    const opacity = stopOpacity(stop);
    fade.addColorStop(Math.min(1, Math.max(0, Number.isFinite(offset) ? offset : 0)), opacity < 1 ? withAlpha(color, opacity) : color);
    added += 1;
  }
  return added ? fade : "";
}

function stopOpacity(stop: Element): number {
  const raw = stop.getAttribute("stop-opacity");
  if (raw != null && raw !== "" && Number.isFinite(Number(raw))) return Number(raw);
  if (typeof getComputedStyle !== "function") return 1;
  const parsed = Number.parseFloat((getComputedStyle(stop) as CSSStyleDeclaration & { stopOpacity?: string }).stopOpacity ?? "");
  return Number.isFinite(parsed) ? parsed : 1;
}

function withAlpha(color: string, alpha: number): string {
  if (!Number.isFinite(alpha)) return color;
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(color);
  if (!rgb) return color;
  const parts = rgb[1].split(",").map((part) => part.trim());
  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
}
