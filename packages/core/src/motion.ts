/**
 * BETA. Update motion. The API may change.
 *
 * Imported only from `interact.ts`, so `createRenderer([line])` does not ship it.
 * `render()` and export never call this module. The first paint is always a still.
 * Omitted motion and `"none"` stay off. `"auto"` is 320ms ease-out.
 * `prefers-reduced-motion: reduce` snaps. Morphs stop above {@link MOTION_ROWS} rows.
 */
export const MOTION_ROWS = 2000;
const AUTO_MS = 320;
const MAX_MS = 800;

const GEOM = ["x", "y", "width", "height", "cx", "cy", "r", "x1", "y1", "x2", "y2"] as const;

export interface MotionFlight {
  /** `snap` commits the target SVG. Otherwise the tween stops where it is. */
  cancel(snap: boolean): void;
}

interface Scale {
  min: number;
  max: number;
  p0: number;
  p1: number;
}

interface TickSpan {
  from: number;
  to: number;
}

interface PathTween {
  tokens: string[];
  from: number[];
  to: number[];
}

interface Tween {
  node: Element;
  key: string;
  from: Map<string, number>;
  to: Map<string, number>;
  path: PathTween | null;
  enter: boolean;
  leave: boolean;
  fade: boolean;
  line: boolean;
  lane: number;
  laneAxis: "x" | "y";
  verts: { x: number; y: number }[] | null;
  xIds: string[];
}

interface Delta {
  el: HTMLElement;
  name: string;
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Milliseconds for this update. `0` means snap, which is the default. */
export function motionMs(spec: { motion?: unknown; render?: unknown }, count: number): number {
  if (count > MOTION_ROWS || spec.render === "canvas" || reduced()) return 0;
  const motion = spec.motion;
  if (motion == null || motion === "none") return 0;
  if (motion === "auto") return AUTO_MS;
  if (typeof motion !== "object") return 0;
  const duration = (motion as { duration?: unknown }).duration;
  if (duration == null) return AUTO_MS;
  if (typeof duration !== "number" || !Number.isFinite(duration)) return 0;
  return Math.max(0, Math.min(MAX_MS, duration));
}

/**
 * Move keyed marks from the live SVG toward `markup`, then commit the exact render.
 * A second call should cancel the flight first. Pointer input should cancel and snap.
 */
export function playMotion(host: HTMLElement, markup: string, ms: number, commit: () => void): MotionFlight {
  const live = host.querySelector?.("svg");
  if (!(live instanceof SVGSVGElement) || ms <= 0 || reduced()) {
    commit();
    return { cancel() {} };
  }
  const parsed = parseSvg(markup);
  if (!parsed) {
    commit();
    return { cancel() {} };
  }
  const prev = keyed(live);
  const next = keyed(parsed);
  if (!prev.size && !next.size) {
    commit();
    return { cancel() {} };
  }
  ensureStyle();
  if (getComputedStyle(host).position === "static") host.style.position = "relative";
  const fromScale = readScale(live);
  const toScale = readScale(parsed);
  const tweens: Tween[] = [];
  const ticks = new Map<string, TickSpan>();
  const seen = new Set<string>();

  for (const [key, fromNodes] of prev) {
    const toNodes = next.get(key) ?? [];
    const count = Math.max(fromNodes.length, toNodes.length);
    for (let i = 0; i < count; i++) {
      const from = fromNodes[i];
      const to = toNodes[i];
      if (from && to) tweens.push(shared(key, from, to, ticks));
      else if (from) tweens.push(leaving(key, from));
    }
    seen.add(key);
  }
  for (const [key, toNodes] of next) {
    if (seen.has(key)) {
      const fromNodes = prev.get(key) ?? [];
      for (let i = fromNodes.length; i < toNodes.length; i++) {
        const to = toNodes[i];
        if (to) tweens.push(entering(live, key, to, fromScale, toScale));
      }
      continue;
    }
    for (let i = 0; i < toNodes.length; i++) {
      const to = toNodes[i];
      if (to) tweens.push(entering(live, key, to, fromScale, toScale));
    }
  }

  const deltas = buildDeltas(host, prev, next, tweens);
  const summary = deltas.map((delta) => `${delta.name} ${delta.text}`).join(", ");
  const polite = summary ? liveRegion(host, summary) : null;
  if (tweens.every(still) && !deltas.length) {
    polite?.remove();
    for (const delta of deltas) delta.el.remove();
    commit();
    return { cancel() {} };
  }

  let done = false;
  let frame = 0;
  let started = false;
  let origin = 0;
  const finish = (snap: boolean) => {
    if (done) return;
    done = true;
    if (frame) cancelAnimationFrame(frame);
    for (const tween of tweens) clearStyle(tween.node);
    for (const delta of deltas) delta.el.remove();
    polite?.remove();
    if (snap) commit();
  };
  const step = (now: number) => {
    if (done) return;
    if (!started) {
      started = true;
      origin = now;
    }
    const t = ms <= 0 ? 1 : Math.min(1, Math.max(0, (now - origin) / ms));
    draw(tweens, deltas, live, host, ease(t), fromScale, toScale, ticks);
    if (t >= 1) finish(true);
    else frame = requestAnimationFrame(step);
  };
  if (typeof requestAnimationFrame !== "function") {
    finish(true);
    return { cancel() {} };
  }
  draw(tweens, deltas, live, host, 0, fromScale, toScale, ticks);
  frame = requestAnimationFrame(step);
  return {
    cancel(snap: boolean) {
      finish(snap);
    },
  };
}

function reduced(): boolean {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** CSS ease-out, cubic-bezier(0, 0, 0.58, 1). */
function ease(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let t = x;
  for (let i = 0; i < 5; i++) {
    const u = 1 - t;
    const est = 3 * u * u * t * 0.58 + 3 * u * t * t + t * t * t;
    const next = t + 0.001;
    const un = 1 - next;
    const slope = (3 * un * un * next * 0.58 + 3 * un * next * next + next * next * next - est) / 0.001;
    if (Math.abs(slope) < 1e-6) break;
    t = Math.min(1, Math.max(0, t - (est - x) / slope));
  }
  const u = 1 - t;
  return 3 * u * t * t + t * t * t;
}

function parseSvg(markup: string): SVGSVGElement | null {
  if (typeof DOMParser === "undefined") return null;
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  const svg = doc.documentElement;
  return svg.localName === "svg" ? (svg as unknown as SVGSVGElement) : null;
}

function keyed(root: ParentNode): Map<string, Element[]> {
  const map = new Map<string, Element[]>();
  const nodes = root.querySelectorAll("[data-ck-key]");
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const key = node?.getAttribute("data-ck-key");
    if (!node || !key) continue;
    const list = map.get(key);
    if (list) list.push(node);
    else map.set(key, [node]);
  }
  return map;
}

function readScale(svg: Element | null): Scale | null {
  const raw = svg?.getAttribute("data-ck-yscale");
  if (!raw) return null;
  const parts = raw.split(",").map(Number);
  if (parts.length < 4 || parts.some((value) => !Number.isFinite(value))) return null;
  return { min: parts[0] ?? 0, max: parts[1] ?? 0, p0: parts[2] ?? 0, p1: parts[3] ?? 0 };
}

function geom(node: Element): Map<string, number> {
  const out = new Map<string, number>();
  for (let i = 0; i < GEOM.length; i++) {
    const name = GEOM[i];
    if (!node.hasAttribute(name)) continue;
    const value = Number(node.getAttribute(name));
    if (Number.isFinite(value)) out.set(name, value);
  }
  return out;
}

function shared(key: string, from: Element, to: Element, ticks: Map<string, TickSpan>): Tween {
  const fromGeom = geom(from);
  const toGeom = geom(to);
  const tween = blank(key, from, fromGeom, toGeom, false, false);
  const fromD = from.getAttribute("d") || "";
  const toD = to.getAttribute("d") || "";
  const path = fromD && toD ? pathTween(fromD, toD) : null;
  tween.path = path;
  if (fromD && toD && !path) from.setAttribute("d", toD);
  if (key.startsWith("x:") && from.localName === "text") {
    const dx = (toGeom.get("x") ?? 0) - (fromGeom.get("x") ?? 0);
    const dy = (toGeom.get("y") ?? 0) - (fromGeom.get("y") ?? 0);
    if (Math.abs(dx) > 6 && Math.abs(dx) >= Math.abs(dy)) {
      tween.lane = dx > 0 ? -1 : 1;
      tween.laneAxis = "y";
    } else if (Math.abs(dy) > 6) {
      tween.lane = dy > 0 ? 1 : -1;
      tween.laneAxis = "x";
    }
    const x0 = fromGeom.get("x");
    const x1 = toGeom.get("x");
    if (x0 != null && x1 != null) ticks.set(key, { from: x0, to: x1 });
  }
  if (!path && (from.getAttribute("d") || to.getAttribute("d"))) tween.fade = false;
  return tween;
}

function leaving(key: string, node: Element): Tween {
  const fromGeom = geom(node);
  const toGeom = new Map(fromGeom);
  if (key.startsWith("b:") && node.localName === "rect") collapse(node, toGeom);
  const tween = blank(key, node, fromGeom, toGeom, false, true);
  tween.fade = true;
  return tween;
}

function entering(live: SVGSVGElement, key: string, source: Element, fromScale: Scale | null, toScale: Scale | null): Tween {
  const clone = source.cloneNode(true) as Element;
  const clip = live.querySelector("g[clip-path]");
  const clipped = source.parentElement?.hasAttribute("clip-path") || source.closest("g[clip-path]");
  if (clipped && clip) clip.append(clone);
  else live.append(clone);
  const toGeom = geom(clone);
  const fromGeom = new Map(toGeom);
  const line = key.startsWith("l:") && clone.localName === "path" && Boolean(fromScale && toScale);
  if (key.startsWith("b:") && clone.localName === "rect") collapse(clone, fromGeom);
  const tween = blank(key, clone, fromGeom, toGeom, true, false);
  tween.fade = !line;
  tween.line = line;
  if (line) {
    tween.verts = vertices(clone.getAttribute("d") || "");
    tween.xIds = (clone.getAttribute("data-ck-xk") || "").split("\t");
    clone.setAttribute("d", "");
  } else if (tween.fade) (clone as SVGElement).style.opacity = "0";
  return tween;
}

function blank(key: string, node: Element, from: Map<string, number>, to: Map<string, number>, enter: boolean, leave: boolean): Tween {
  return {
    node,
    key,
    from,
    to,
    path: null,
    enter,
    leave,
    fade: false,
    line: false,
    lane: 0,
    laneAxis: "y",
    verts: null,
    xIds: [],
  };
}

function collapse(node: Element, geomMap: Map<string, number>): void {
  const base = Number(node.getAttribute("data-ck-base"));
  if (!Number.isFinite(base)) return;
  if (node.getAttribute("data-ck-orient") === "h") {
    geomMap.set("x", base);
    geomMap.set("width", 0);
    return;
  }
  geomMap.set("y", base);
  geomMap.set("height", 0);
}

function pathTween(from: string, to: string): PathTween | null {
  if (!from || !to) return null;
  const fromTokens = tokensOf(from);
  const toTokens = tokensOf(to);
  if (signature(fromTokens) !== signature(toTokens)) return null;
  const fromNums = numbers(fromTokens);
  const toNums = numbers(toTokens);
  if (fromNums.length !== toNums.length || !fromNums.length) return null;
  return { tokens: toTokens, from: fromNums, to: toNums };
}

function still(tween: Tween): boolean {
  if (tween.enter || tween.leave || tween.line) return false;
  for (const [name, to] of tween.to) {
    if (Math.abs(to - (tween.from.get(name) ?? to)) > 0.05) return false;
  }
  const path = tween.path;
  if (!path) return true;
  for (let i = 0; i < path.to.length; i++) {
    if (Math.abs((path.to[i] ?? 0) - (path.from[i] ?? 0)) > 0.05) return false;
  }
  return true;
}

function draw(
  tweens: Tween[],
  deltas: Delta[],
  svg: SVGSVGElement,
  host: HTMLElement,
  t: number,
  fromScale: Scale | null,
  toScale: Scale | null,
  ticks: Map<string, TickSpan>,
): void {
  for (let i = 0; i < tweens.length; i++) {
    const tween = tweens[i];
    if (!tween) continue;
    if (tween.line && tween.verts && fromScale && toScale) {
      const drawn = projectLine(tween, fromScale, toScale, t, ticks);
      tween.node.setAttribute("d", drawn.d);
      const len = drawn.length;
      const node = tween.node as SVGElement;
      if (len > 1) {
        node.style.strokeDasharray = String(len);
        node.style.strokeDashoffset = String(len * (1 - t));
      }
      continue;
    }
    for (const [name, to] of tween.to) {
      const from = tween.from.get(name);
      if (from == null) continue;
      let value = from + (to - from) * t;
      if (tween.lane && name === tween.laneAxis) value += Math.sin(Math.PI * t) * 12 * tween.lane;
      tween.node.setAttribute(name, px(value));
    }
    if (tween.path) {
      const nums = new Array<number>(tween.path.to.length);
      for (let n = 0; n < nums.length; n++) nums[n] = (tween.path.from[n] ?? 0) + ((tween.path.to[n] ?? 0) - (tween.path.from[n] ?? 0)) * t;
      tween.node.setAttribute("d", rebuild(tween.path.tokens, nums));
    }
    if (tween.fade) {
      const opacity = tween.leave ? 1 - t : t;
      (tween.node as SVGElement).style.opacity = String(opacity);
    }
  }
  for (let i = 0; i < deltas.length; i++) {
    const delta = deltas[i];
    if (!delta) continue;
    const point = toHost(svg, host, delta.x0 + (delta.x1 - delta.x0) * t, delta.y0 + (delta.y1 - delta.y0) * t);
    delta.el.style.left = `${point.left}px`;
    delta.el.style.top = `${point.top}px`;
    delta.el.style.opacity = t < 0.72 ? "1" : String(Math.max(0, 1 - (t - 0.72) / 0.28));
  }
}

function projectLine(tween: Tween, from: Scale, to: Scale, t: number, ticks: Map<string, TickSpan>): { d: string; length: number } {
  const verts = tween.verts ?? [];
  let d = "";
  let length = 0;
  let open = false;
  let prevX = 0;
  let prevY = 0;
  for (let i = 0; i < verts.length; i++) {
    const vert = verts[i];
    if (!vert) continue;
    const data = invertY(vert.y, to);
    const y = projectY(data, from, to, t);
    if (y == null) {
      open = false;
      continue;
    }
    const id = tween.xIds[i];
    const tick = id ? ticks.get(`x:${id}`) : undefined;
    const x = tick ? tick.from + (tick.to - tick.from) * t : vert.x;
    d += open ? `L${px(x)} ${px(y)}` : `M${px(x)} ${px(y)}`;
    if (open) length += Math.hypot(x - prevX, y - prevY);
    prevX = x;
    prevY = y;
    open = true;
  }
  return { d, length };
}

function projectY(data: number, from: Scale, to: Scale, t: number): number | null {
  const min = from.min + (to.min - from.min) * t;
  const max = from.max + (to.max - from.max) * t;
  const p0 = from.p0 + (to.p0 - from.p0) * t;
  const p1 = from.p1 + (to.p1 - from.p1) * t;
  const eps = Math.abs(max - min) * 0.002 + 1e-9;
  if (data < Math.min(min, max) - eps || data > Math.max(min, max) + eps) return null;
  const span = max - min || 1;
  const y = p0 + ((data - min) / span) * (p1 - p0);
  const top = Math.min(p0, p1);
  const bot = Math.max(p0, p1);
  return Math.min(bot, Math.max(top, y));
}

function invertY(pixel: number, scale: Scale): number {
  const span = scale.p1 - scale.p0 || 1;
  return scale.min + ((pixel - scale.p0) / span) * (scale.max - scale.min);
}

function buildDeltas(host: HTMLElement, prev: Map<string, Element[]>, next: Map<string, Element[]>, tweens: Tween[]): Delta[] {
  const found: { score: number; delta: Delta }[] = [];
  const byNode = new Map<Element, Tween>();
  for (let i = 0; i < tweens.length; i++) {
    const tween = tweens[i];
    if (tween) byNode.set(tween.node, tween);
  }
  for (const [key, fromNodes] of prev) {
    const toNodes = next.get(key);
    const from = fromNodes[0];
    const to = toNodes?.[0];
    if (!from || !to) continue;
    if (key.startsWith("b:") || key.startsWith("s:")) {
      const text = percent(Number(from.getAttribute("data-ck-value")), Number(to.getAttribute("data-ck-value")));
      if (!text) continue;
      const tween = byNode.get(from);
      if (!tween) continue;
      found.push({ score: Math.abs(parsePercent(text)), delta: barDelta(host, nameOf(key), text, tween) });
      continue;
    }
    if (!key.startsWith("l:")) continue;
    const move = lineMove(from, to);
    if (!move) continue;
    found.push({ score: Math.abs(move.percent), delta: pointDelta(host, nameOf(key), move.text, move.from, move.to) });
  }
  found.sort((a, b) => b.score - a.score);
  const kept = found.slice(0, 12).map((item) => item.delta);
  for (let i = 0; i < kept.length; i++) host.append(kept[i].el);
  return kept;
}

function barDelta(host: HTMLElement, name: string, text: string, tween: Tween): Delta {
  const box = (geomMap: Map<string, number>) => ({
    x: (geomMap.get("x") ?? 0) + (geomMap.get("width") ?? 0) / 2,
    y: geomMap.get("y") ?? 0,
  });
  const from = box(tween.from);
  const to = box(tween.to);
  return pointDelta(host, name, text, from, to);
}

function pointDelta(host: HTMLElement, name: string, text: string, from: { x: number; y: number }, to: { x: number; y: number }): Delta {
  const el = document.createElement("div");
  el.className = "ck-delta";
  el.setAttribute("data-ck-delta", "");
  if (text.startsWith("-")) el.setAttribute("data-down", "");
  el.textContent = text;
  void host;
  return { el, name, text, x0: from.x, y0: from.y, x1: to.x, y1: to.y };
}

function lineMove(from: Element, to: Element): { text: string; percent: number; from: { x: number; y: number }; to: { x: number; y: number } } | null {
  const fromIds = (from.getAttribute("data-ck-xk") || "").split("\t");
  const toIds = (to.getAttribute("data-ck-xk") || "").split("\t");
  const fromVals = (from.getAttribute("data-ck-samples") || "").split(" ").map(Number);
  const toVals = (to.getAttribute("data-ck-samples") || "").split(" ").map(Number);
  if (!fromIds.length || fromIds.length !== fromVals.length || toIds.length !== toVals.length) return null;
  const next = new Map<string, number>();
  for (let i = 0; i < toIds.length; i++) {
    const id = toIds[i];
    const value = toVals[i];
    if (id && Number.isFinite(value)) next.set(id, value);
  }
  const fromVerts = vertices(from.getAttribute("d") || "");
  const toVerts = vertices(to.getAttribute("d") || "");
  let best = 0;
  let bestText = "";
  let bestFrom: { x: number; y: number } | null = null;
  let bestTo: { x: number; y: number } | null = null;
  for (let i = 0; i < fromIds.length; i++) {
    const id = fromIds[i];
    if (!id || !next.has(id)) continue;
    const text = percent(fromVals[i] ?? NaN, next.get(id) ?? NaN);
    if (!text) continue;
    const score = Math.abs(parsePercent(text));
    if (score <= best) continue;
    const fromVert = fromVerts[i];
    const toIndex = toIds.indexOf(id);
    const toVert = toVerts[toIndex];
    if (!fromVert || !toVert) continue;
    best = score;
    bestText = text;
    bestFrom = fromVert;
    bestTo = toVert;
  }
  if (!bestText || !bestFrom || !bestTo) return null;
  return { text: bestText, percent: best, from: bestFrom, to: bestTo };
}

function percent(prev: number, next: number): string | null {
  if (!Number.isFinite(prev) || !Number.isFinite(next) || prev === 0) return null;
  const value = Math.round(((next - prev) / Math.abs(prev)) * 100);
  if (!value) return null;
  return `${value > 0 ? "+" : ""}${value}%`;
}

function parsePercent(text: string): number {
  const value = Number(text.replace("%", ""));
  return Number.isFinite(value) ? value : 0;
}

function nameOf(key: string): string {
  if (key.startsWith("b:")) {
    const cut = key.indexOf(":", 2);
    return cut >= 0 ? key.slice(cut + 1) : key.slice(2);
  }
  const cut = key.indexOf(":");
  return cut >= 0 ? key.slice(cut + 1) : key;
}

function liveRegion(host: HTMLElement, text: string): HTMLElement {
  const live = document.createElement("div");
  live.className = "ck-clip";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("data-ck-motion-live", "");
  live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)";
  live.textContent = text;
  host.append(live);
  return live;
}

function toHost(svg: SVGSVGElement, host: HTMLElement, x: number, y: number): { left: number; top: number } {
  const rect = svg.getBoundingClientRect();
  const bounds = host.getBoundingClientRect();
  const box = svg.viewBox?.baseVal;
  const vw = box?.width || Number(svg.getAttribute("viewBox")?.split(/[\s,]+/)[2]) || rect.width || 1;
  const vh = box?.height || Number(svg.getAttribute("viewBox")?.split(/[\s,]+/)[3]) || rect.height || 1;
  const sx = (rect.width || vw) / vw;
  const sy = (rect.height || vh) / vh;
  return { left: rect.left + x * sx - bounds.left, top: rect.top + y * sy - bounds.top };
}

function clearStyle(node: Element): void {
  const style = (node as SVGElement).style;
  if (!style) return;
  style.opacity = "";
  style.strokeDasharray = "";
  style.strokeDashoffset = "";
}

function ensureStyle(): void {
  if (typeof document === "undefined" || document.getElementById("ck-motion-style")) return;
  const style = document.createElement("style");
  style.id = "ck-motion-style";
  style.textContent =
    ".ck-delta{position:absolute;z-index:6;pointer-events:none;transform:translate(-50%,-120%);font:650 12px/1 ui-sans-serif,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#15803d;white-space:nowrap}.ck-delta[data-down]{color:#be123c}@media (prefers-reduced-motion:reduce){.ck-delta{display:none}}";
  document.head.append(style);
}

function tokensOf(d: string): string[] {
  return d.match(/[MLHVCSQTAZmlhvcsqtaz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
}

function signature(tokens: string[]): string {
  let out = "";
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] ?? "";
    if (/^[A-Za-z]$/.test(token)) out += token.toUpperCase();
  }
  return out;
}

function numbers(tokens: string[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] ?? "";
    if (/^[A-Za-z]$/.test(token)) continue;
    const value = Number(token);
    if (Number.isFinite(value)) out.push(value);
  }
  return out;
}

function rebuild(tokens: string[], nums: number[]): string {
  let k = 0;
  let out = "";
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] ?? "";
    out += /^[A-Za-z]$/.test(token) ? token : px(nums[k++] ?? 0);
    out += " ";
  }
  return out.trim();
}

function vertices(d: string): { x: number; y: number }[] {
  const tokens = tokensOf(d);
  const out: { x: number; y: number }[] = [];
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  const read = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const token = tokens[i];
    if (!token) break;
    if (/^[A-Za-z]$/.test(token)) {
      cmd = token.toUpperCase();
      i += 1;
      if (cmd === "Z") cmd = "";
      continue;
    }
    if (cmd === "M" || cmd === "L" || cmd === "T") {
      x = read();
      y = read();
      if (cmd === "M") cmd = "L";
    } else if (cmd === "C") {
      read();
      read();
      read();
      read();
      x = read();
      y = read();
    } else if (cmd === "S" || cmd === "Q") {
      read();
      read();
      x = read();
      y = read();
    } else if (cmd === "H") x = read();
    else if (cmd === "V") y = read();
    else if (cmd === "A") {
      read();
      read();
      read();
      read();
      read();
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

function px(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}
