import { ch, polar } from "../../svg";
import { fmt, text } from "./plot";

/**
 * Rose names sit just outside the ring and values sit further out on the same ray.
 * The ring shrinks until every label is under the heading and inside the frame.
 * The strings are drawn in full.
 */
export interface RosePlaceInput {
  categories: string[];
  series: { values: number[] }[];
  mode: string;
  scaleMax: number;
  start: number;
  pad: number;
  gap: number;
  outer: number;
  innerFrac: number;
  cx: number;
  cy: number;
  width: number;
  top: number;
  bottom: number;
  labelsOn: boolean;
  locale: string;
  format: unknown;
  ink: string;
  muted: string;
}

export type RosePlace = (input: RosePlaceInput) => { outer: number; marks: string } | null;

interface Spot {
  angle: number;
  text: string;
  size: number;
  weight: string;
  fill: string;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  mark?: string;
}

interface Pair {
  name: Spot;
  values: Spot[];
}

export const placeRose: RosePlace = (input) => {
  const { categories, series, mode, scaleMax, start, pad, gap, outer, innerFrac, cx, cy, width, top, bottom, labelsOn, locale, format, ink, muted } = input;
  const ring = outer;
  const band = Math.max(1, ring - Math.min(ring * innerFrac, ring - 8));
  const slot = 360 / categories.length;
  const gutter = Math.min(pad, slot * 0.46);
  const usable = Math.max(0.8, slot - gutter);
  const grouped = mode === "none" && series.length > 1;
  const innerGap = grouped ? usable * gap : 0;
  const span = grouped ? (usable - innerGap) / series.length : usable;
  const step = grouped ? span + innerGap / series.length : span;
  const pairs: Pair[] = [];
  categories.forEach((category, index) => {
    const origin = start + index * slot + gutter / 2;
    const pair: Pair = { name: { angle: origin + usable / 2, text: category, size: 12, weight: "560", fill: muted }, values: [] };
    if (labelsOn) {
      let total = 0;
      for (const item of series) total += Math.max(0, item.values[index] ?? 0);
      series.forEach((item, seriesIndex) => {
        const raw = item.values[index] ?? 0;
        const positive = raw > 0 ? raw : 0;
        const share = mode === "percent" ? positive / (total || 1) : positive / scaleMax;
        if (band * share <= 16) return;
        const angle = (grouped ? origin + seriesIndex * step : origin) + span / 2;
        pair.values.push({ angle, text: fmt(raw, locale, format), size: 11, weight: "650", fill: ink });
      });
    }
    pairs.push(pair);
  });
  for (let next = Math.max(28, outer); next >= 28; next -= 3) {
    const drawn = layout(next, pairs, cx, cy, width, top, bottom);
    if (drawn) return { outer: next, marks: drawn };
  }
  return null;
};

function layout(outer: number, pairs: Pair[], cx: number, cy: number, width: number, minY: number, maxY: number): string | null {
  const boxes: Box[] = [];
  const base = outer + Math.max(28, outer * 0.2);
  for (const pair of pairs) {
    const nameAt = seek(pair.name, base, cx, cy, width, minY, maxY, boxes);
    if (!nameAt) return null;
    let radius = nameAt.radius + 14;
    for (const value of pair.values) {
      const placed = seek(value, radius, cx, cy, width, minY, maxY, boxes);
      if (!placed) return null;
      radius = placed.radius + 14;
    }
  }
  return boxes.map((box) => box.mark).join("");
}

function seek(spot: Spot, radius: number, cx: number, cy: number, width: number, minY: number, maxY: number, boxes: Box[]): { radius: number } | null {
  const anchor = roseAnchor(spot.angle);
  const shifts = anchor === "middle" ? [0] : [0, 22, -22];
  for (const extra of shifts) {
    for (let step = 0; step < 16; step++) {
      const at = polar(cx, cy, radius + step * 4, spot.angle);
      const y = at.y + extra;
      const box = roseBox(at.x, y, spot.text, spot.size, anchor);
      if (box.x < 2 || box.y < minY || box.x + box.w > width - 2 || box.y + box.h > maxY - 2) continue;
      if (boxes.some((item) => roseHits(box, item))) continue;
      boxes.push({ ...box, mark: text(at.x, y, spot.text, spot.fill, spot.size, spot.weight, anchor) });
      return { radius: radius + step * 4 };
    }
  }
  return null;
}

function roseAnchor(angle: number): "start" | "middle" | "end" {
  const dx = Math.sin((angle * Math.PI) / 180);
  if (dx < -0.35) return "end";
  if (dx > 0.35) return "start";
  return "middle";
}

function roseBox(x: number, y: number, label: string, size: number, anchor: string): Box {
  const w = ch(label.length, size * 0.66) + 4;
  const h = size + 5;
  const top = y - size;
  const left = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
  return { x: left, y: top, w, h };
}

function roseHits(a: Box, b: Box): boolean {
  return a.x < b.x + b.w + 4 && b.x < a.x + a.w + 4 && a.y < b.y + b.h + 4 && b.y < a.y + a.h + 4;
}
