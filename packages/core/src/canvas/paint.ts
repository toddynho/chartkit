/**
 * Paint canvas marks from sampled scene geometry. Chrome stays SVG.
 * Loaded on demand. `createRenderer([line])` does not import this module.
 */
import { canvasWanted } from "../render-mode";
import { bindSampling } from "../sampling-run";
import { extendMinmax, notedDense, notedLinear, useSampler, type BucketMemo } from "../sampling";
import { renderCartesianScene } from "./capture";
import { renderCandlestick } from "../renderers/candlestick";
import { renderHeatmap } from "../renderers/heatmap";
import { renderScatter } from "../renderers/scatter";
import { beginScene, endScene } from "./sink";
import type { SceneFrame, SceneMark } from "./sink";
import { buildScatterGrid, dotsAt, nearestScatter } from "./hit";
import { onSceneRepaint, registerScenePainter, setDataHit, type DataHit, type HitSeries } from "./hit-state";

useSampler(bindSampling({ notedDense, notedLinear }));

export interface PaintProfile {
  ingest: number;
  scales: number;
  sample: number;
  svg: number;
  dom: number;
  paint: number;
  rows: number;
  kept: number;
  incremental: boolean;
}

interface Live {
  key: string;
  svg: SVGSVGElement;
  canvas: HTMLCanvasElement;
  frame: SceneFrame;
  memo: BucketMemo | null;
  ys: Float64Array | null;
  xs: Float64Array | null;
  count: number;
  buffer: ArrayBufferLike | null;
}

const lives = new WeakMap<Element, Live>();
let profile: PaintProfile | null = null;
const paintCache = new WeakMap<Element, Map<string, string>>();
const numberCache = new WeakMap<Element, Map<string, number>>();
const dashCache = new Map<string, number[]>();
const NO_DASH: number[] = [];
const paintedSize = new WeakMap<HTMLCanvasElement, { w: number; h: number }>();

export function lastPaintProfile(): PaintProfile | null {
  return profile;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function typedLine(spec: Record<string, unknown>): { xs: Float64Array | null; ys: Float64Array } | null {
  const data = spec.data;
  if (!isRecord(data) || !isRecord(data.columns)) return null;
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const yName = typeof encoding.y === "string" ? encoding.y : "";
  const xName = typeof encoding.x === "string" ? encoding.x : "";
  const ys = yName ? data.columns[yName] : undefined;
  if (!(ys instanceof Float64Array)) return null;
  const xs = xName ? data.columns[xName] : undefined;
  return { ys, xs: xs instanceof Float64Array ? xs : null };
}

function copyMemo(src: BucketMemo): BucketMemo {
  const lo = new Int32Array(src.buckets);
  const hi = new Int32Array(src.buckets);
  lo.set(src.lo.subarray(0, src.buckets));
  hi.set(src.hi.subarray(0, src.buckets));
  return { ...src, lo, hi };
}

function tailInside(live: Live, xs: Float64Array | null, ys: Float64Array, from: number): boolean {
  const frame = live.frame;
  for (let i = from; i < ys.length; i++) {
    const y = ys[i];
    const x = xs ? xs[i] : i;
    if (x < frame.xMin || x > frame.xMax || y < frame.yMin || y > frame.yMax) return false;
  }
  return true;
}

/** Draw marks for a canvas spec. Returns false when this spec should stay on the SVG path. */
export function paintSpec(host: Element, spec: unknown): boolean {
  if (!isRecord(spec) || !canvasWanted(spec)) return false;
  const type = spec.type;
  const cartesian = type === "line" || type === "stacked-area" || type === "bar" || type === "sparkline" || type === "mini-area" || type === "combo";
  const direct = type === "scatter" || type === "heatmap" || type === "candlestick";
  if (!cartesian && !direct) return false;
  if (typeof document === "undefined") return false;
  const live = lives.get(host);
  const cols = type === "line" ? typedLine(spec) : null;
  if (live && cols && live.memo && live.memo.buckets > 0 && live.ys && cols.ys.buffer === live.buffer && cols.ys.length > live.count && tailInside(live, cols.xs, cols.ys, live.count)) {
    const t0 = performance.now();
    const sampled = extendMinmax(live.memo, cols.xs, cols.ys, live.count, cols.ys.length);
    const mark = live.frame.marks[0];
    if (mark && mark.kind === "line") {
      writePixels(mark, sampled.index, sampled.length, cols.xs, cols.ys, live.frame);
      live.memo = sampled.memo ? copyMemo(sampled.memo) : null;
      live.count = cols.ys.length;
      live.ys = cols.ys;
      live.xs = cols.xs;
      const painted = performance.now();
      const size = paintedSize.get(live.canvas) ?? authoredSize(live.svg, live.frame);
      drawFrame(live.svg, live.canvas, live.frame, size.w, size.h);
      const hit = hitFor(live.frame);
      if (hit) setDataHit(live.svg, hit);
      profile = {
        ...live.frame.profile,
        sample: performance.now() - t0,
        dom: 0,
        paint: performance.now() - painted,
        rows: cols.ys.length,
        kept: sampled.length,
        incremental: true,
      };
      return true;
    }
  }
  const built = cartesian ? renderCartesianScene(spec, live?.key ?? "") : renderDirectScene(spec, live?.key ?? "");
  if (!built) return false;
  const { frame } = built;
  let svg = live?.svg ?? null;
  const tDom = performance.now();
  if (!frame.reused || !(svg instanceof SVGSVGElement) || !svg.isConnected) {
    svg = swapChrome(host, built.svg, svg);
    frame.profile.dom = performance.now() - tDom;
  } else {
    frame.profile.dom = 0;
  }
  if (!(svg instanceof SVGSVGElement)) return false;
  const size = authoredSize(svg, frame);
  const canvas = ensureCanvas(host, size.w, size.h);
  const tPaint = performance.now();
  drawFrame(svg, canvas, frame, size.w, size.h);
  frame.profile.paint = performance.now() - tPaint;
  const mark = frame.marks[0];
  const memo = mark && mark.memo && mark.memo.buckets > 0 ? copyMemo(mark.memo) : null;
  const stored: Live = {
    key: frame.key,
    svg,
    canvas,
    frame,
    memo,
    ys: cols?.ys ?? null,
    xs: cols?.xs ?? null,
    count: cols?.ys.length ?? frame.count,
    buffer: cols?.ys.buffer ?? null,
  };
  lives.set(host, stored);
  const hit = hitFor(frame);
  if (hit) setDataHit(svg, hit);
  onSceneRepaint(svg, () => {
    const current = lives.get(host);
    if (!current) return;
    const size = paintedSize.get(current.canvas) ?? authoredSize(current.svg, current.frame);
    drawFrame(current.svg, current.canvas, current.frame, size.w, size.h);
  });
  if (!watchers.has(svg) && typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver((entries) => {
      const current = lives.get(host);
      if (!current) return;
      const box = entries[0]?.contentRect;
      if (!box || box.width < 2 || box.height < 2) return;
      const prev = paintedSize.get(current.canvas);
      if (prev && Math.abs(prev.w - box.width) < 0.5 && Math.abs(prev.h - box.height) < 0.5) return;
      current.canvas.style.width = `${box.width}px`;
      current.canvas.style.height = `${box.height}px`;
      drawFrame(current.svg, current.canvas, current.frame, box.width, box.height);
    });
    observer.observe(svg);
    watchers.set(svg, observer);
  }
  profile = { ...frame.profile, incremental: false };
  return true;
}

registerScenePainter(paintSpec);

const watchers = new WeakMap<Element, ResizeObserver>();

function writePixels(mark: SceneMark, index: Int32Array, n: number, xs: Float64Array | null, ys: Float64Array, frame: SceneFrame): void {
  if (mark.x.length < n) mark.x = new Float64Array(Math.max(n, mark.x.length * 2));
  if (mark.y.length < n) mark.y = new Float64Array(Math.max(n, mark.y.length * 2));
  const plot = frame.plot;
  if (!plot) return;
  const width = plot.right - plot.left || 1;
  const span = frame.xMax - frame.xMin || 1;
  const linear = frame.linear && frame.stride !== 0;
  const bx = linear ? (frame.stride / span) * width : 0;
  const ax = linear ? plot.left + ((frame.x0 - frame.xMin) / span) * width : 0;
  const ySpan = frame.yMax - frame.yMin || 1;
  const by = (frame.py1 - frame.py0) / ySpan;
  for (let k = 0; k < n; k++) {
    const i = index[k];
    const x = xs ? xs[i] : frame.x0 + i * frame.stride;
    mark.x[k] = linear ? ax + i * bx : plot.left + ((x - frame.xMin) / span) * width;
    mark.y[k] = frame.py0 + (ys[i] - frame.yMin) * by;
  }
  mark.n = n;
  mark.ys = ys;
  mark.rows = ys.length;
  mark.xs = xs;
}

function swapChrome(host: Element, markup: string, previous: SVGSVGElement | null): SVGSVGElement | null {
  if (previous && previous.isConnected && typeof DOMParser !== "undefined") {
    const held: Element[] = [];
    previous.querySelectorAll("[data-ck-crosshair],[data-ck-brush]").forEach((node) => held.push(node));
    const next = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
    if (next.localName === "svg") {
      for (const attr of Array.from(previous.attributes)) previous.removeAttribute(attr.name);
      for (const attr of Array.from(next.attributes)) previous.setAttribute(attr.name, attr.value);
      previous.replaceChildren(...Array.from(next.childNodes));
      for (let i = 0; i < held.length; i++) previous.append(held[i]);
      return previous;
    }
  }
  host.innerHTML = markup;
  const found = host.querySelector("svg");
  return found instanceof SVGSVGElement ? found : null;
}

/** Width and height attributes, or the scene size. No layout read. */
function authoredSize(svg: SVGSVGElement, frame: SceneFrame): { w: number; h: number } {
  const w = Number(svg.getAttribute("width"));
  const h = Number(svg.getAttribute("height"));
  return {
    w: w > 0 ? w : frame.width || 640,
    h: h > 0 ? h : frame.height || 360,
  };
}

function ensureCanvas(host: Element, cssW: number, cssH: number): HTMLCanvasElement {
  const style = (host as HTMLElement).style;
  if (style && style.position === "") style.position = "relative";
  const found = host.querySelector("canvas[data-ck-painter='ck-canvas-paint']");
  const canvas = found instanceof HTMLCanvasElement ? found : document.createElement("canvas");
  if (canvas.parentElement !== host) {
    canvas.setAttribute("data-ck-painter", "ck-canvas-paint");
    canvas.setAttribute("data-ck-canvas", "");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.pointerEvents = "none";
    host.append(canvas);
  }
  const width = `${cssW}px`;
  const height = `${cssH}px`;
  if (canvas.style.width !== width) canvas.style.width = width;
  if (canvas.style.height !== height) canvas.style.height = height;
  return canvas;
}

function drawFrame(svg: SVGSVGElement, canvas: HTMLCanvasElement, frame: SceneFrame, cssW: number, cssH: number): void {
  const ctx = canvas.getContext("2d");
  if (!ctx || !frame.plot || !(cssW > 0) || !(cssH > 0) || !(frame.width > 0) || !(frame.height > 0)) return;
  const dpr = typeof window !== "undefined" && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
  const pixelsW = Math.max(1, Math.round(cssW * dpr));
  const pixelsH = Math.max(1, Math.round(cssH * dpr));
  if (canvas.width !== pixelsW) canvas.width = pixelsW;
  if (canvas.height !== pixelsH) canvas.height = pixelsH;
  const scaleX = pixelsW / frame.width;
  const scaleY = pixelsH / frame.height;
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
  ctx.clearRect(0, 0, frame.width, frame.height);
  const plot = frame.plot;
  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.left, plot.top, Math.max(0, plot.right - plot.left), Math.max(0, plot.bottom - plot.top));
  ctx.clip();
  for (let i = 0; i < frame.marks.length; i++) drawMark(svg, ctx, frame.marks[i], plot);
  ctx.restore();
  paintedSize.set(canvas, { w: cssW, h: cssH });
}

function drawMark(svg: SVGSVGElement, ctx: CanvasRenderingContext2D, mark: SceneMark, plot: SceneFrame["plot"]): void {
  if (!plot) return;
  if (mark.kind === "bar") {
    ctx.fillStyle = paintOf(svg, mark.color);
    ctx.globalAlpha = mark.fillOpacity;
    const rects = mark.rects;
    for (let i = 0; i < mark.rectN; i++) {
      const at = i * 4;
      if (mark.fills) ctx.fillStyle = paintOf(svg, mark.fills[i] || mark.color);
      ctx.fillRect(rects[at], rects[at + 1], rects[at + 2], rects[at + 3]);
    }
    ctx.globalAlpha = 1;
    return;
  }
  if (mark.kind === "scatter") {
    drawScatter(svg, ctx, mark, plot);
    return;
  }
  if (mark.n < 1) return;
  const stroke = paintOf(svg, mark.stroke || mark.color);
  const width = strokeWidthOf(svg, mark);
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.setLineDash(dashOf(mark.dash));
  if (mark.kind === "area") {
    ctx.beginPath();
    const edge = mark.n > 64 ? traceEnvelope(ctx, mark) : (trace(ctx, mark), null);
    if (mark.rectN > 0) {
      for (let i = mark.rectN - 1; i >= 0; i--) ctx.lineTo(mark.x[i], mark.rects[i]);
    } else if (mark.baseline !== null && edge) {
      ctx.lineTo(edge.x1, mark.baseline);
      ctx.lineTo(edge.x0, mark.baseline);
    } else if (mark.baseline !== null) {
      ctx.lineTo(mark.x[mark.n - 1], mark.baseline);
      ctx.lineTo(mark.x[0], mark.baseline);
    }
    ctx.closePath();
    if (mark.gradient) {
      const grad = ctx.createLinearGradient(0, plot.top, 0, plot.bottom);
      const color = paintOf(svg, mark.color);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = paintOf(svg, mark.color);
    }
    ctx.globalAlpha = fillAlpha(svg, mark);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.beginPath();
  if (mark.kind === "area" && mark.n > 64) traceEnvelope(ctx, mark);
  else trace(ctx, mark);
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

/** One y per pixel column, the sample farthest from the baseline. A min/max zigzag fill is a self-intersecting polygon and rasterizes very slowly. */
function traceEnvelope(ctx: CanvasRenderingContext2D, mark: SceneMark): { x0: number; x1: number } | null {
  const n = mark.n;
  const baseline = mark.baseline;
  let x0 = 0;
  let x1 = 0;
  let have = false;
  let last = NaN;
  let bestX = 0;
  let bestY = 0;
  let bestD = -1;
  const flush = () => {
    if (last !== last) return;
    if (!have) {
      ctx.moveTo(bestX, bestY);
      x0 = bestX;
      have = true;
    } else ctx.lineTo(bestX, bestY);
    x1 = bestX;
  };
  for (let i = 0; i < n; i++) {
    const x = mark.x[i];
    const y = mark.y[i];
    if (x !== x || y !== y) {
      flush();
      last = NaN;
      bestD = -1;
      continue;
    }
    const col = Math.round(x);
    if (col !== last) {
      flush();
      last = col;
      bestX = x;
      bestY = y;
      bestD = baseline === null ? 0 : Math.abs(y - baseline);
      continue;
    }
    const dist = baseline === null ? 0 : Math.abs(y - baseline);
    if (dist >= bestD) {
      bestD = dist;
      bestX = x;
      bestY = y;
    }
  }
  flush();
  return have ? { x0, x1 } : null;
}

function renderDirectScene(spec: Record<string, unknown>, reuseKey: string): { svg: string; frame: SceneFrame } | null {
  const scene = beginScene(reuseKey);
  try {
    const t = performance.now();
    const type = spec.type;
    const svg = type === "scatter" ? renderScatter(spec) : type === "heatmap" ? renderHeatmap(spec) : renderCandlestick(spec);
    scene.profile.svg = performance.now() - t;
    scene.profile.rows = scene.count;
    scene.profile.kept = scene.marks.reduce((sum, mark) => sum + (mark.kind === "scatter" ? mark.n : mark.rectN), 0);
    if (svg === null || !scene.plot) return null;
    if (reuseKey && reuseKey === scene.key) {
      scene.reused = true;
      return { svg: "", frame: scene };
    }
    return { svg, frame: scene };
  } finally {
    endScene();
  }
}

let dotLayer: HTMLCanvasElement | null = null;

function drawScatter(
  svg: SVGSVGElement,
  ctx: CanvasRenderingContext2D,
  mark: SceneMark,
  plot: NonNullable<SceneFrame["plot"]>,
): void {
  const shape = mark.shape || "circle";
  const n = mark.n;
  if (n < 1 || shape === "none") return;
  if (!mark.hollow && shape === "circle" && sameDot(mark)) {
    drawDotLayer(svg, ctx, mark, plot);
    return;
  }
  for (let i = 0; i < n; i++) {
    const r = mark.rects[i] || 0;
    if (r <= 0) continue;
    const color = paintOf(svg, mark.fills?.[i] || mark.color);
    const x = mark.x[i];
    const y = mark.y[i];
    ctx.beginPath();
    traceGlyph(ctx, shape, x, y, r);
    if (mark.hollow || shape === "cross") {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.globalAlpha = mark.fillOpacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

function sameDot(mark: SceneMark): boolean {
  const n = mark.n;
  const r = mark.rects[0] || 0;
  if (!(r > 0)) return false;
  const fills = mark.fills;
  const color = fills?.[0];
  for (let i = 1; i < n; i++) {
    if ((mark.rects[i] || 0) !== r) return false;
    if (fills && fills[i] !== color) return false;
  }
  return true;
}

/**
 * One offscreen layer, then a single blit. Each dot is its own fill so overlap
 * stacks; a single compound path would union them and hide the density.
 * Marks at or under 3 device pixels are rects. Larger marks stay circles.
 */
function drawDotLayer(
  svg: SVGSVGElement,
  ctx: CanvasRenderingContext2D,
  mark: SceneMark,
  plot: NonNullable<SceneFrame["plot"]>,
): void {
  const transform = ctx.getTransform();
  const scaleX = transform.a > 0 ? transform.a : 1;
  const scaleY = transform.d > 0 ? transform.d : 1;
  const plotW = Math.max(1, plot.right - plot.left);
  const plotH = Math.max(1, plot.bottom - plot.top);
  const width = Math.max(1, Math.round(plotW * scaleX));
  const height = Math.max(1, Math.round(plotH * scaleY));
  if (!dotLayer) dotLayer = document.createElement("canvas");
  if (dotLayer.width !== width) dotLayer.width = width;
  if (dotLayer.height !== height) dotLayer.height = height;
  const layer = dotLayer.getContext("2d");
  if (!layer) return;
  layer.setTransform(1, 0, 0, 1, 0, 0);
  layer.clearRect(0, 0, width, height);
  const color = paintOf(svg, mark.fills?.[0] || mark.color);
  const radius = (mark.rects[0] || 0) * scaleX;
  layer.fillStyle = color;
  layer.globalAlpha = mark.fillOpacity;
  const n = mark.n;
  const xs = mark.x;
  const ys = mark.y;
  if (radius <= 3) {
    const d = Math.max(1, radius * 2);
    for (let i = 0; i < n; i++) {
      layer.fillRect((xs[i] - plot.left) * scaleX - radius, (ys[i] - plot.top) * scaleY - radius, d, d);
    }
  } else {
    for (let i = 0; i < n; i++) {
      const x = (xs[i] - plot.left) * scaleX;
      const y = (ys[i] - plot.top) * scaleY;
      layer.beginPath();
      layer.arc(x, y, radius, 0, Math.PI * 2);
      layer.fill();
    }
  }
  layer.globalAlpha = 1;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(dotLayer, plot.left * scaleX, plot.top * scaleY);
  ctx.restore();
}

function traceGlyph(ctx: CanvasRenderingContext2D, shape: string, x: number, y: number, r: number): void {
  if (shape === "square") {
    ctx.rect(x - r, y - r, r * 2, r * 2);
    return;
  }
  if (shape === "diamond") {
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r, y);
    ctx.closePath();
    return;
  }
  if (shape === "triangle") {
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r, y + r * 0.8);
    ctx.lineTo(x - r, y + r * 0.8);
    ctx.closePath();
    return;
  }
  if (shape === "cross") {
    const arm = r * 0.75;
    ctx.moveTo(x - arm, y);
    ctx.lineTo(x + arm, y);
    ctx.moveTo(x, y - arm);
    ctx.lineTo(x, y + arm);
    return;
  }
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function trace(ctx: CanvasRenderingContext2D, mark: SceneMark): void {
  const n = mark.n;
  const x = mark.x;
  const y = mark.y;
  if (n < 1) return;
  if (mark.curve !== "step" && mark.curve !== "step-before" && mark.curve !== "step-after" && mark.curve !== "monotone") {
    let started = false;
    for (let i = 0; i < n; i++) {
      if (!Number.isFinite(x[i]) || !Number.isFinite(y[i])) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(x[i], y[i]);
        started = true;
      } else ctx.lineTo(x[i], y[i]);
    }
    return;
  }
  ctx.moveTo(x[0], y[0]);
  if (mark.curve === "step" || mark.curve === "step-before" || mark.curve === "step-after") {
    for (let i = 1; i < n; i++) {
      if (mark.curve === "step-before") {
        ctx.lineTo(x[i - 1], y[i]);
        ctx.lineTo(x[i], y[i]);
      } else if (mark.curve === "step-after") {
        ctx.lineTo(x[i], y[i - 1]);
        ctx.lineTo(x[i], y[i]);
      } else {
        const mid = (x[i - 1] + x[i]) / 2;
        ctx.lineTo(mid, y[i - 1]);
        ctx.lineTo(mid, y[i]);
        ctx.lineTo(x[i], y[i]);
      }
    }
    return;
  }
  if (mark.curve === "monotone" && n > 2) {
    monotone(ctx, x, y, n);
    return;
  }
  for (let i = 1; i < n; i++) ctx.lineTo(x[i], y[i]);
}

function monotone(ctx: CanvasRenderingContext2D, x: Float64Array, y: Float64Array, count: number): void {
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    const span = x[i + 1] - x[i];
    dx.push(span);
    slope.push(span === 0 ? 0 : (y[i + 1] - y[i]) / span);
  }
  const tangent = new Array<number>(count);
  tangent[0] = slope[0];
  tangent[count - 1] = slope[count - 2];
  for (let i = 1; i < count - 1; i++) {
    const left = slope[i - 1];
    const right = slope[i];
    tangent[i] = left * right <= 0 ? 0 : (left + right) / 2;
  }
  for (let i = 0; i < count - 1; i++) {
    const delta = slope[i];
    if (delta === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const alpha = tangent[i] / delta;
    const beta = tangent[i + 1] / delta;
    const sum = alpha * alpha + beta * beta;
    if (sum > 9) {
      const scale = 3 / Math.sqrt(sum);
      tangent[i] = scale * alpha * delta;
      tangent[i + 1] = scale * beta * delta;
    }
  }
  for (let i = 0; i < count - 1; i++) {
    const span = dx[i];
    ctx.bezierCurveTo(
      x[i] + span / 3,
      y[i] + (tangent[i] * span) / 3,
      x[i + 1] - span / 3,
      y[i + 1] - (tangent[i + 1] * span) / 3,
      x[i + 1],
      y[i + 1],
    );
  }
}

function dashOf(dash: string): number[] {
  if (!dash) return NO_DASH;
  const hit = dashCache.get(dash);
  if (hit) return hit;
  const parsed = dash.split(" ").map(Number);
  dashCache.set(dash, parsed);
  return parsed;
}

function paintOf(svg: SVGSVGElement, value: string): string {
  if (!value || value === "none") return "#2563eb";
  const hit = paintCache.get(svg)?.get(value);
  if (hit !== undefined) return hit;
  let resolved = value;
  if (value.includes("var(") || value.includes("light-dark")) {
    const stat = authorStyles() ? null : staticColor(value, svg);
    if (stat && !stat.includes("var(") && !stat.includes("light-dark")) resolved = stat;
    else resolved = probeColor(svg, value) || value;
  }
  return remember(paintCache, svg, value, resolved);
}

function strokeWidthOf(svg: SVGSVGElement, mark: SceneMark): number {
  const raw = Number(mark.strokePaint);
  if (mark.strokePaint !== "" && Number.isFinite(raw) && !mark.strokePaint.includes("var(")) return raw;
  const key = mark.strokePaint || String(mark.strokeWidth || 2);
  const hit = numberCache.get(svg)?.get(key);
  if (hit !== undefined) return hit;
  const stat = authorStyles() ? null : staticNumber(svg, key);
  const parsed = stat ?? probeLength(svg, "line", "stroke-width", "strokeWidth", key, mark.strokeWidth || 2);
  return remember(numberCache, svg, key, parsed);
}

function fillAlpha(svg: SVGSVGElement, mark: SceneMark): number {
  const raw = Number(mark.fillPaint);
  if (Number.isFinite(raw) && !mark.fillPaint.includes("var(")) return raw;
  const key = mark.fillPaint || String(mark.fillOpacity);
  const hit = numberCache.get(svg)?.get(`fill:${key}`);
  if (hit !== undefined) return hit;
  const stat = authorStyles() ? null : staticNumber(svg, key);
  const parsed = stat ?? probeLength(svg, "rect", "fill-opacity", "fillOpacity", key, mark.fillOpacity);
  return remember(numberCache, svg, `fill:${key}`, parsed);
}

function remember<T>(map: WeakMap<Element, Map<string, T>>, el: Element, key: string, value: T): T {
  let bucket = map.get(el);
  if (!bucket) {
    bucket = new Map();
    map.set(el, bucket);
  }
  bucket.set(key, value);
  return value;
}

/** Author stylesheets can override a custom property. An empty document cannot. */
function authorStyles(): boolean {
  if (typeof document === "undefined") return false;
  if (document.styleSheets.length > 0) return true;
  const adopted = (document as Document & { adoptedStyleSheets?: unknown[] }).adoptedStyleSheets;
  return Array.isArray(adopted) && adopted.length > 0;
}

function schemeDark(): boolean {
  if (typeof document === "undefined") return false;
  const inline = document.documentElement?.style?.colorScheme;
  if (inline === "dark") return true;
  if (inline === "light") return false;
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
}

function inlineCustom(el: Element, name: string): string {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (node instanceof HTMLElement || node instanceof SVGElement) {
      const value = node.style.getPropertyValue(name).trim();
      if (value) return value;
    }
  }
  return "";
}

function splitArgs(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (ch === "," && depth === 0) {
      out.push(body.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(body.slice(start).trim());
  return out;
}

/** Resolve var() and light-dark() from fallbacks. Null when a stylesheet may override them. */
function staticColor(value: string, el: Element): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("light-dark(") && trimmed.endsWith(")")) {
    const inner = splitArgs(trimmed.slice("light-dark(".length, -1));
    if (inner.length !== 2) return null;
    return staticColor(schemeDark() ? inner[1] : inner[0], el);
  }
  if (trimmed.startsWith("var(") && trimmed.endsWith(")")) {
    const inner = splitArgs(trimmed.slice(4, -1));
    if (inner.length === 0) return null;
    const name = inner[0];
    if (!name.startsWith("--")) return null;
    const set = inlineCustom(el, name);
    if (set) return staticColor(set, el);
    if (inner.length < 2) return null;
    return staticColor(inner.slice(1).join(", "), el);
  }
  if (trimmed.includes("var(") || trimmed.includes("light-dark(")) return null;
  return trimmed;
}

function staticNumber(el: Element, value: string): number | null {
  const color = staticColor(value, el);
  if (color === null) return null;
  const parsed = Number(color);
  return Number.isFinite(parsed) ? parsed : null;
}

function probeColor(svg: SVGSVGElement, value: string): string {
  if (typeof document === "undefined") return "";
  const parent = svg.parentElement ?? document.body;
  const probe = document.createElement("span");
  probe.style.color = value;
  parent.append(probe);
  const got = getComputedStyle(probe).color;
  probe.remove();
  if (got && !got.includes("var(") && !got.includes("light-dark")) return got;
  return "";
}

function probeLength(
  svg: SVGSVGElement,
  tag: "line" | "rect",
  attr: string,
  prop: "strokeWidth" | "fillOpacity",
  paint: string,
  fallback: number,
): number {
  if (typeof document === "undefined") return fallback;
  const probe = document.createElementNS("http://www.w3.org/2000/svg", tag);
  probe.setAttribute(attr, paint);
  svg.append(probe);
  const parsed = Number.parseFloat(getComputedStyle(probe)[prop]);
  probe.remove();
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hitFor(frame: SceneFrame): DataHit | null {
  const plot = frame.plot;
  if (!plot) return null;
  const scatter = frame.marks.find((mark) => mark.kind === "scatter");
  if (scatter) return scatterHit(frame, scatter, plot);
  const plotWidth = plot.right - plot.left || 1;
  const plotHeight = plot.bottom - plot.top || 1;
  const bars = frame.marks.length > 0 && frame.marks.every((mark) => mark.kind === "bar");
  const series: HitSeries[] = [];
  for (let i = 0; i < frame.marks.length; i++) {
    const mark = frame.marks[i];
    if (mark.kind === "bar") continue;
    const y0 = mark.axis === "y2" ? frame.y2Min : frame.yMin;
    const y1 = mark.axis === "y2" ? frame.y2Max : frame.yMax;
    const p0 = mark.axis === "y2" ? frame.py20 : frame.py0;
    const p1 = mark.axis === "y2" ? frame.py21 : frame.py1;
    const span = y1 - y0 || 1;
    series.push({
      name: mark.name,
      ys: mark.ys,
      color: mark.stroke || mark.color,
      py: (y: number) => p0 + ((y - y0) / span) * (p1 - p0),
    });
  }
  const count = frame.count;
  const indexAt = (px: number) => {
    if (bars) {
      const i = Math.floor(((px - plot.left) / plotWidth) * count);
      return i < 0 ? 0 : i >= count ? count - 1 : i;
    }
    const data = frame.xMin + ((px - plot.left) / plotWidth) * (frame.xMax - frame.xMin || 1);
    if (frame.linear && frame.stride !== 0) {
      const i = Math.round((data - frame.x0) / frame.stride);
      return i < 0 ? 0 : i >= count ? count - 1 : i;
    }
    if (frame.xs) {
      let lo = 0;
      let hi = Math.min(count, frame.xs.length) - 1;
      if (hi <= 0) return 0;
      if (data <= frame.xs[0]) return 0;
      if (data >= frame.xs[hi]) return hi;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (frame.xs[mid] <= data) lo = mid;
        else hi = mid;
      }
      return data - frame.xs[lo] <= frame.xs[hi] - data ? lo : hi;
    }
    const i = Math.round(((px - plot.left) / plotWidth) * (count - 1));
    return i < 0 ? 0 : i >= count ? count - 1 : i;
  };
  const pixelAt = (index: number) => {
    if (frame.linear && frame.stride !== 0) {
      const data = frame.x0 + index * frame.stride;
      return plot.left + ((data - frame.xMin) / (frame.xMax - frame.xMin || 1)) * plotWidth;
    }
    if (frame.xs && index >= 0 && index < frame.xs.length) {
      return plot.left + ((frame.xs[index] - frame.xMin) / (frame.xMax - frame.xMin || 1)) * plotWidth;
    }
    const slot = plotWidth / Math.max(1, count);
    return plot.left + slot * index + slot / 2;
  };
  const hit: DataHit = {
    kind: bars ? "bar" : frame.marks.some((mark) => mark.kind === "area") ? "area" : "line",
    count,
    plotLeft: plot.left,
    plotTop: plot.top,
    plotWidth,
    plotHeight,
    xMin: frame.xMin,
    xMax: frame.xMax,
    linear: frame.linear,
    x0: frame.x0,
    stride: frame.stride,
    xs: frame.xs,
    series,
    indexAt,
    pixelAt,
  };
  hit.dots = (index) => dotsAt(hit, index);
  return hit;
}

let identityDots: Int32Array | null = null;

function identityIndex(n: number): Int32Array {
  if (!identityDots || identityDots.length < n) {
    const next = new Int32Array(Math.max(n, (identityDots?.length ?? 256) * 2));
    for (let i = 0; i < next.length; i++) next[i] = i;
    identityDots = next;
  }
  return identityDots.subarray(0, n);
}

function scatterHit(frame: SceneFrame, mark: SceneMark, plot: NonNullable<SceneFrame["plot"]>): DataHit {
  const n = mark.n;
  const plotWidth = plot.right - plot.left || 1;
  const plotHeight = plot.bottom - plot.top || 1;
  let grid: ReturnType<typeof buildScatterGrid> | null = null;
  const ensure = () => {
    if (grid) return grid;
    const px = new Float32Array(n);
    const py = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      px[i] = mark.x[i];
      py[i] = mark.y[i];
    }
    const index = mark.indexes ?? identityIndex(n);
    grid = buildScatterGrid(px, py, n, mark.fills ?? [], mark.names ?? [], index, plot.left, plot.top, plotWidth, plotHeight);
    return grid;
  };
  const nearest = (x: number, y: number, radius?: number) => {
    const found = nearestScatter(ensure(), x, y, radius);
    if (!found) return null;
    if (!found.color) found.color = mark.color;
    if (!found.name) found.name = mark.name || "y";
    return found;
  };
  return {
    kind: "scatter",
    count: frame.count || n,
    plotLeft: plot.left,
    plotTop: plot.top,
    plotWidth,
    plotHeight,
    xMin: frame.xMin,
    xMax: frame.xMax,
    linear: false,
    x0: 0,
    stride: 0,
    xs: null,
    series: [],
    nearest: (x, y) => nearest(x, y),
    indexAt: (at) => {
      const found = nearest(at, plot.top + plotHeight / 2, Math.max(plotWidth, plotHeight));
      return found ? found.index : 0;
    },
    pixelAt: (at) => {
      const built = ensure();
      const index = built.index;
      for (let i = 0; i < n; i++) if (index[i] === at) return built.px[i];
      return plot.left;
    },
  };
}

export { dotsAt, buildScatterGrid };
