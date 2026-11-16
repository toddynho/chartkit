import { n } from "../svg";
import type { Curve, Pt } from "./types";

export function zigPoints(x1: number, y1: number, x2: number, y2: number, amp: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * amp;
  const py = (dx / len) * amp;
  const a = 0.25;
  const b = 0.5;
  const c = 0.75;
  return `L ${n(x1 + dx * a + px)} ${n(y1 + dy * a + py)} L ${n(x1 + dx * b - px)} ${n(y1 + dy * b - py)} L ${n(x1 + dx * c + px)} ${n(y1 + dy * c + py)} L ${n(x2)} ${n(y2)}`;
}

function crossesSpan(y0: number, y1: number, span: [number, number]): boolean {
  const lo = Math.min(span[0], span[1]);
  const hi = Math.max(span[0], span[1]);
  return Math.min(y0, y1) < lo + 0.4 && Math.max(y0, y1) > hi - 0.4;
}

/** Continue a stroke through a break with the same zigzag the axis uses. */
function withBreaks(points: Pt[], curve: Curve, spans: Array<[number, number]>): string {
  let d = "";
  let run: Pt[] = [points[0]];
  const write = (bridge: string) => {
    const part = linePath(run, curve);
    if (!part) return;
    d += d ? ` ${bridge}${part.replace(/^M\s+/, "L ")}` : part;
  };
  for (let i = 1; i < points.length; i++) {
    const next = points[i];
    const prev = run[run.length - 1];
    if (!next || !prev) continue;
    const span = spans.find((item) => crossesSpan(prev.y, next.y, item));
    if (!span) {
      run.push(next);
      continue;
    }
    const lo = Math.min(span[0], span[1]);
    const hi = Math.max(span[0], span[1]);
    const first = prev.y < next.y ? lo : hi;
    const second = prev.y < next.y ? hi : lo;
    const xAt = (y: number) => prev.x + (next.x - prev.x) * ((y - prev.y) / (next.y - prev.y || 1));
    run.push({ x: xAt(first), y: first });
    const amp = Math.max(3, (hi - lo) * 0.35);
    write("");
    d += ` ${zigPoints(xAt(first), first, xAt(second), second, amp)}`;
    run = [{ x: xAt(second), y: second }, next];
  }
  write("");
  return d;
}

export function stroked(points: Pt[], curve: Curve, spans?: Array<[number, number]>): string {
  if (!spans || spans.length === 0 || points.length < 2) return linePath(points, curve);
  return withBreaks(points, curve, spans);
}

function linePath(points: Pt[], curve: Curve): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${n(points[0].x)} ${n(points[0].y)}`;
  if (curve === "monotone") return monotone(points);
  if (curve === "step" || curve === "step-before" || curve === "step-after") return step(points, curve);
  const parts = new Array<string>(points.length);
  for (let i = 0; i < points.length; i++) parts[i] = (i === 0 ? "M " : "L ") + n(points[i].x) + " " + n(points[i].y);
  return parts.join(" ");
}

export function areaPath(top: Pt[], bottom: Pt[], curve: Curve): string {
  if (top.length === 0) return "";
  const forward = linePath(top, curve);
  if (flatY(bottom) && top.length > 1) {
    const y = bottom[0].y;
    return `${forward} L ${n(top[top.length - 1].x)} ${n(y)} L ${n(top[0].x)} ${n(y)} Z`;
  }
  const back = [...bottom].reverse();
  const backward = linePath(back, curve).replace(/^M/, "L");
  return `${forward} ${backward} Z`;
}

export function flatY(points: Pt[]): boolean {
  if (points.length < 2) return false;
  const y = points[0].y;
  for (let i = 1; i < points.length; i++) if (points[i].y !== y) return false;
  return true;
}

/** One vertex per pixel column, the one farthest from the baseline. */
export function collapseArea(top: Pt[], bottom: Pt[]): void {
  if (top.length < 2 || bottom.length !== top.length) return;
  const base = bottom[0].y;
  const edge: Pt[] = [];
  let last = NaN;
  let best = top[0];
  let bestD = -1;
  const flush = () => {
    if (last !== last) return;
    edge.push(best);
  };
  for (let i = 0; i < top.length; i++) {
    const point = top[i];
    const col = Math.round(point.x);
    if (col !== last) {
      flush();
      last = col;
      best = point;
      bestD = Math.abs(point.y - base);
      continue;
    }
    const dist = Math.abs(point.y - base);
    if (dist >= bestD) {
      bestD = dist;
      best = point;
    }
  }
  flush();
  if (edge.length < 2) return;
  top.length = 0;
  bottom.length = 0;
  for (let i = 0; i < edge.length; i++) {
    top.push(edge[i]);
    bottom.push({ x: edge[i].x, y: base });
  }
}

/**
 * Fritsch–Carlson monotone cubic. Control points stay between the segment
 * ends, so a spike does not pass the peak or cross the low point.
 */
function monotone(points: Pt[]): string {
  const count = points.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    const span = points[i + 1].x - points[i].x;
    dx.push(span);
    slope.push(span === 0 ? 0 : (points[i + 1].y - points[i].y) / span);
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
  const parts = new Array<string>(count);
  parts[0] = "M " + n(points[0].x) + " " + n(points[0].y);
  for (let i = 0; i < count - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const span = dx[i];
    parts[i + 1] =
      "C " +
      n(from.x + span / 3) +
      " " +
      n(from.y + (tangent[i] * span) / 3) +
      ", " +
      n(to.x - span / 3) +
      " " +
      n(to.y - (tangent[i + 1] * span) / 3) +
      ", " +
      n(to.x) +
      " " +
      n(to.y);
  }
  return parts.join(" ");
}

function step(points: Pt[], curve: Curve): string {
  let path = `M ${n(points[0].x)} ${n(points[0].y)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (curve === "step-before") path += ` L ${n(prev.x)} ${n(curr.y)} L ${n(curr.x)} ${n(curr.y)}`;
    else if (curve === "step-after") path += ` L ${n(curr.x)} ${n(prev.y)} L ${n(curr.x)} ${n(curr.y)}`;
    else {
      const mid = (prev.x + curr.x) / 2;
      path += ` L ${n(mid)} ${n(prev.y)} L ${n(mid)} ${n(curr.y)} L ${n(curr.x)} ${n(curr.y)}`;
    }
  }
  return path;
}

export function segments(points: (Pt | null)[], connect: boolean): Pt[][] {
  if (connect) {
    const kept = points.filter((point): point is Pt => point !== null);
    return kept.length ? [kept] : [];
  }
  const out: Pt[][] = [];
  let current: Pt[] = [];
  for (const point of points) {
    if (!point) {
      if (current.length) out.push(current);
      current = [];
    } else current.push(point);
  }
  if (current.length) out.push(current);
  return out;
}

export function pairSegments(top: (Pt | null)[], bottom: (Pt | null)[], connect: boolean): [Pt[], Pt[]][] {
  const pairs: [Pt[], Pt[]][] = [];
  let a: Pt[] = [];
  let b: Pt[] = [];
  for (let i = 0; i < top.length; i++) {
    if (!top[i] || !bottom[i]) {
      if (!connect && a.length) {
        pairs.push([a, b]);
        a = [];
        b = [];
      }
      continue;
    }
    a.push(top[i] as Pt);
    b.push(bottom[i] as Pt);
  }
  if (a.length) pairs.push([a, b]);
  return pairs;
}
