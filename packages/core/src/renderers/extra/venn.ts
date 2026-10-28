import type { Frame } from "../../frame";
import { cssVar } from "../../theme";
import { clamp, esc, font, n } from "../../svg";
import { cells, channel, rowAt, tableOf, textAt } from "./fields";
import { fill, openMark, text, viewOf } from "./plot";

export interface VennRegion {
  index: number;
  sets: string[];
  size: number | null;
  field: string;
}

export interface VennModel {
  regions: VennRegion[];
  names: string[];
}

export function readVenn(spec: Record<string, unknown>): VennModel | null {
  const read = tableOf(spec);
  if (!read) return null;
  const { table, encoding } = read;
  const labelField = channel(encoding, "x", "set", table.fields);
  const sizeField = channel(encoding, "y", "size", table.fields);
  if (!labelField) return null;
  const labels = cells(table, labelField);
  const sizes = cells(table, sizeField);
  const regions: VennRegion[] = [];
  const names: string[] = [];
  for (let index = 0; index < table.length; index++) {
    const sets = textAt(labels[index])
      .split("+")
      .map((part) => part.trim())
      .filter(Boolean);
    for (const name of sets) if (!names.includes(name)) names.push(name);
    const size = typeof sizes[index] === "number" && Number.isFinite(sizes[index]) ? (sizes[index] as number) : null;
    regions.push({ index, sets, size, field: sizeField ?? "size" });
  }
  return regions.length ? { regions, names } : null;
}

/** Two sets are area-proportional. Three sets are a best-effort overlap. Four or more is an error. */
export function renderVenn(spec: Record<string, unknown>): string | null {
  const model = readVenn(spec);
  if (!model) return null;
  if (model.names.length > 3) return tooMany(spec, model.names);
  if (model.names.length < 2) return null;
  const view = viewOf(spec, "venn", 680, model.names.length === 3 ? 460 : 420);
  if (!view) return null;
  const { frame, parts } = view;
  const setSize = new Map<string, number>();
  const overlap = new Map<string, number>();
  for (const region of model.regions) {
    if (region.size == null || region.size < 0) continue;
    if (region.sets.length === 1) setSize.set(region.sets[0], region.size);
    else if (region.sets.length > 1) overlap.set(keyOf(region.sets), region.size);
  }
  for (const name of model.names) if (!setSize.has(name)) setSize.set(name, 1);
  const top = frame.title ? 48 : 24;
  const box = { left: 48, top, right: frame.width - 48, bottom: frame.height - (model.names.length === 3 ? 42 : 28) };
  if (model.names.length === 2) drawPair(parts, frame, model.names, setSize, overlap, box);
  else drawTrio(parts, frame, model.names, setSize, overlap, box);
  if (model.names.length === 3) {
    parts.push(text(frame.width / 2, frame.height - 16, "3-set areas are approximate", cssVar("muted", frame.preset.muted), 12, "500", "middle"));
  }
  return view.done();
}

function drawPair(
  parts: string[],
  frame: Frame,
  names: string[],
  setSize: Map<string, number>,
  overlap: Map<string, number>,
  box: { left: number; top: number; right: number; bottom: number },
): void {
  const preset = frame.preset;
  const r0 = Math.sqrt(Math.max(setSize.get(names[0]) ?? 1, 0) / Math.PI);
  const r1 = Math.sqrt(Math.max(setSize.get(names[1]) ?? 1, 0) / Math.PI);
  const shared = overlap.get(keyOf(names)) ?? 0;
  const distance = distanceFor(r0, r1, shared);
  const rawW = r0 + distance + r1;
  const rawH = 2 * Math.max(r0, r1);
  const scale = Math.min((box.right - box.left) / rawW, (box.bottom - box.top - 28) / rawH);
  const left = box.left + ((box.right - box.left) - rawW * scale) / 2;
  const cy = (box.top + 18 + box.bottom) / 2;
  const c0 = left + r0 * scale;
  const c1 = c0 + distance * scale;
  const radii = [r0 * scale, r1 * scale];
  const centers = [c0, c1];
  names.forEach((name, index) => {
    const color = fill(frame, index);
    const label = `${name}: ${formatSize(setSize.get(name) ?? 0)}`;
    parts.push(openMark("circle", "set", label, `cx="${n(centers[index])}" cy="${n(cy)}" r="${n(radii[index])}" fill="${color}" fill-opacity="0.38" stroke="${color}" stroke-width="1.5"`));
    parts.push("</circle>");
    parts.push(text(centers[index], cy - radii[index] - 10, name, cssVar("text", preset.text), 13, "650", "middle"));
  });
  if (shared > 0) {
    const at = lensCenter({ x: c0, y: cy, r: radii[0] }, { x: c1, y: cy, r: radii[1] });
    parts.push(countText(at.x, at.y, formatSize(shared), `${names.join(" + ")}: ${formatSize(shared)}`, preset, 13));
  }
}

function drawTrio(
  parts: string[],
  frame: Frame,
  names: string[],
  setSize: Map<string, number>,
  overlap: Map<string, number>,
  box: { left: number; top: number; right: number; bottom: number },
): void {
  const preset = frame.preset;
  const radii = names.map((name) => Math.sqrt(Math.max(setSize.get(name) ?? 1, 0) / Math.PI));
  const dist = (a: number, b: number) => {
    const shared = overlap.get(keyOf([names[a], names[b]]));
    if (shared == null) return radii[a] + radii[b] - Math.min(radii[a], radii[b]) * 0.55;
    return distanceFor(radii[a], radii[b], shared);
  };
  const d01 = dist(0, 1);
  const d02 = dist(0, 2);
  const d12 = dist(1, 2);
  const cos = clampUnit((d02 * d02 + d01 * d01 - d12 * d12) / (2 * d02 * d01 || 1));
  const sin = Math.sqrt(Math.max(0, 1 - cos * cos));
  const raw = [
    { x: 0, y: 0, r: radii[0] },
    { x: d01, y: 0, r: radii[1] },
    { x: d02 * cos, y: d02 * sin, r: radii[2] },
  ];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const circle of raw) {
    minX = Math.min(minX, circle.x - circle.r);
    minY = Math.min(minY, circle.y - circle.r);
    maxX = Math.max(maxX, circle.x + circle.r);
    maxY = Math.max(maxY, circle.y + circle.r);
  }
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  // Bottom band stays clear so the lowest set name sits under its circle, above the footnote.
  const padTop = 2;
  const padBottom = 32;
  const scale = Math.min((box.right - box.left) / spanX, (box.bottom - box.top - padTop - padBottom) / spanY);
  const ox = box.left + ((box.right - box.left) - spanX * scale) / 2 - minX * scale;
  const oy = box.top + padTop + ((box.bottom - box.top - padTop - padBottom) - spanY * scale) / 2 - minY * scale;
  const placed = raw.map((circle) => ({ x: ox + circle.x * scale, y: oy + circle.y * scale, r: circle.r * scale }));
  const centroid = {
    x: (placed[0].x + placed[1].x + placed[2].x) / 3,
    y: (placed[0].y + placed[1].y + placed[2].y) / 3,
  };
  const nameSize = 13;
  const namesAt: LabelBox[] = [];
  names.forEach((name, index) => {
    const circle = placed[index];
    const color = fill(frame, index);
    const label = `${name}: ${formatSize(setSize.get(name) ?? 0)}`;
    parts.push(openMark("circle", "set", label, `cx="${n(circle.x)}" cy="${n(circle.y)}" r="${n(circle.r)}" fill="${color}" fill-opacity="0.38" stroke="${color}" stroke-width="1.5"`));
    parts.push("</circle>");
    const at = placeSetName(circle, centroid, name, nameSize, frame, box);
    namesAt.push(textBox(at, name, nameSize, 2));
    parts.push(setName(at.x, at.y, name, preset, nameSize));
  });
  const counts: CountSpot[] = [];
  for (let a = 0; a < 3; a++) {
    for (let b = a + 1; b < 3; b++) {
      const shared = overlap.get(keyOf([names[a], names[b]]));
      if (shared == null) continue;
      counts.push(countSpot(formatSize(shared), `${names[a]} + ${names[b]}: ${formatSize(shared)}`, [placed[a], placed[b]], [placed[3 - a - b]]));
    }
  }
  const triple = overlap.get(keyOf(names));
  if (triple != null) counts.push(countSpot(formatSize(triple), `${names.join(" + ")}: ${formatSize(triple)}`, placed, [], "triple"));
  spreadCounts(counts, namesAt, COUNT_SIZE);
  for (const count of counts) parts.push(countText(count.at.x, count.at.y, count.value, count.label, preset, COUNT_SIZE));
}

const COUNT_SIZE = 13;

interface Disk {
  x: number;
  y: number;
  r: number;
}

interface Pt {
  x: number;
  y: number;
}

interface LabelBox {
  x: number;
  y: number;
  hw: number;
  hh: number;
}

interface CountSpot {
  value: string;
  label: string;
  interior: Disk[];
  exterior: Disk[];
  role: "pair" | "triple";
  at: Pt;
  homeMargin: number;
}

/** Distance to the nearest boundary. Positive means the point is inside the region. */
export function regionMargin(point: Pt, interior: Disk[], exterior: Disk[]): number {
  let margin = Infinity;
  for (const circle of interior) margin = Math.min(margin, circle.r - Math.hypot(point.x - circle.x, point.y - circle.y));
  for (const circle of exterior) margin = Math.min(margin, Math.hypot(point.x - circle.x, point.y - circle.y) - circle.r);
  return margin;
}

/**
 * Widest point of a two-circle lens. Equal circles meet at the midpoint.
 * Unequal circles meet closer to the smaller one, where the overlap is tallest.
 */
export function lensCenter(a: Disk, b: Disk): Pt {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1e-6) return { x: a.x, y: a.y };
  const t = clamp((distance + a.r - b.r) / (2 * distance), 0, 1);
  return { x: a.x + dx * t, y: a.y + dy * t };
}

/**
 * Visual center of a circle region: the point farthest from every boundary
 * that defines it. `interior` circles contain the region. `exterior` circles
 * are cut out of it, so a pairwise count sits in the lens outside the third set.
 */
export function regionCenter(interior: Disk[], exterior: Disk[] = []): Pt {
  const pool = regionSeeds(interior, exterior);
  let best = pool[0] ?? { x: 0, y: 0 };
  let bestMargin = -Infinity;
  const seen = new Set<string>();
  const ranked = pool.map((point, index) => ({ point, index, margin: regionMargin(point, interior, exterior) }));
  ranked.sort((a, b) => b.margin - a.margin);
  const climbAt = new Set<number>();
  for (let index = 0; index < Math.min(pool.length, 10); index++) climbAt.add(index);
  for (let index = 0; index < Math.min(ranked.length, 8); index++) climbAt.add(ranked[index].index);
  for (const index of climbAt) {
    const climbed = climb(pool[index], interior, exterior);
    const key = `${Math.round(climbed.x * 4)}:${Math.round(climbed.y * 4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const margin = regionMargin(climbed, interior, exterior);
    if (margin > bestMargin) {
      bestMargin = margin;
      best = climbed;
    }
  }
  return best;
}

function regionSeeds(interior: Disk[], exterior: Disk[]): Pt[] {
  const seeds: Pt[] = [];
  const add = (point: Pt) => {
    if (Number.isFinite(point.x) && Number.isFinite(point.y)) seeds.push(point);
  };
  if (interior.length === 0) return seeds;
  add({
    x: interior.reduce((sum, circle) => sum + circle.x, 0) / interior.length,
    y: interior.reduce((sum, circle) => sum + circle.y, 0) / interior.length,
  });
  for (let i = 0; i < interior.length; i++) {
    for (let j = i + 1; j < interior.length; j++) {
      const mid = lensCenter(interior[i], interior[j]);
      add(mid);
      for (const hit of circleHits(interior[i], interior[j])) {
        for (let step = 1; step <= 8; step++) add(mix(hit, mid, step / 8));
      }
    }
  }
  for (const circle of exterior) {
    const anchors = interior.map((item) => ({ x: item.x, y: item.y }));
    if (interior.length >= 2) anchors.push(lensCenter(interior[0], interior[1]));
    for (const anchor of anchors) {
      const dx = anchor.x - circle.x;
      const dy = anchor.y - circle.y;
      const distance = Math.hypot(dx, dy) || 1;
      add({ x: circle.x + (dx / distance) * (circle.r + 2), y: circle.y + (dy / distance) * (circle.r + 2) });
    }
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const circle of interior) {
    minX = Math.min(minX, circle.x - circle.r);
    minY = Math.min(minY, circle.y - circle.r);
    maxX = Math.max(maxX, circle.x + circle.r);
    maxY = Math.max(maxY, circle.y + circle.r);
  }
  const steps = 12;
  for (let ix = 0; ix <= steps; ix++) {
    for (let iy = 0; iy <= steps; iy++) {
      add({ x: minX + ((maxX - minX) * ix) / steps, y: minY + ((maxY - minY) * iy) / steps });
    }
  }
  return seeds;
}

function climb(start: Pt, interior: Disk[], exterior: Disk[]): Pt {
  let point = start;
  let best = regionMargin(point, interior, exterior);
  let step = 8;
  for (const circle of interior) step = Math.max(step, circle.r * 0.28);
  for (let guard = 0; guard < 64 && step >= 0.2; guard++) {
    let next: Pt | null = null;
    let nextMargin = best;
    for (let k = 0; k < 16; k++) {
      const angle = (k / 16) * Math.PI * 2;
      const candidate = { x: point.x + Math.cos(angle) * step, y: point.y + Math.sin(angle) * step };
      const margin = regionMargin(candidate, interior, exterior);
      if (margin > nextMargin + 1e-4) {
        nextMargin = margin;
        next = candidate;
      }
    }
    if (next) {
      point = next;
      best = nextMargin;
    } else step *= 0.5;
  }
  return point;
}

function circleHits(a: Disk, b: Disk): Pt[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1e-6 || distance > a.r + b.r + 1e-4 || distance < Math.abs(a.r - b.r) - 1e-4) return [];
  const along = (a.r * a.r - b.r * b.r + distance * distance) / (2 * distance);
  const height = Math.sqrt(Math.max(0, a.r * a.r - along * along));
  const mx = a.x + (along * dx) / distance;
  const my = a.y + (along * dy) / distance;
  if (height < 1e-4) return [{ x: mx, y: my }];
  const ox = (-dy * height) / distance;
  const oy = (dx * height) / distance;
  return [
    { x: mx + ox, y: my + oy },
    { x: mx - ox, y: my - oy },
  ];
}

function mix(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function countSpot(value: string, label: string, interior: Disk[], exterior: Disk[], role: "pair" | "triple" = "pair"): CountSpot {
  let at = regionCenter(interior, exterior);
  let usedExterior = exterior;
  // A sliver thinner than the digits cannot hold them. Fall back to the full lens.
  if (exterior.length && regionMargin(at, interior, exterior) < COUNT_SIZE * 0.34) {
    at = regionCenter(interior, []);
    usedExterior = [];
  }
  return { value, label, interior, exterior: usedExterior, role, at, homeMargin: regionMargin(at, interior, usedExterior) };
}

function spreadCounts(spots: CountSpot[], obstacles: LabelBox[], size: number): void {
  for (let iter = 0; iter < 28; iter++) {
    let moved = false;
    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) {
        if (separate(spots[i], spots[j], size)) moved = true;
      }
      for (const obstacle of obstacles) {
        if (separateFromBox(spots[i], obstacle, size)) moved = true;
      }
    }
    if (!moved) return;
  }
}

function separate(a: CountSpot, b: CountSpot, size: number): boolean {
  const aBox = textBox(a.at, a.value, size, 5);
  const bBox = textBox(b.at, b.value, size, 5);
  if (!boxesHit(aBox, bBox)) return false;
  let dx = b.at.x - a.at.x;
  let dy = b.at.y - a.at.y;
  let distance = Math.hypot(dx, dy);
  if (distance < 0.5) {
    dx = a.role === "triple" ? -1 : 1;
    dy = 0.35;
    distance = Math.hypot(dx, dy);
  }
  const ux = dx / distance;
  const uy = dy / distance;
  const aStep = a.role === "triple" ? 1.1 : 2.6;
  const bStep = b.role === "triple" ? 1.1 : 2.6;
  let moved = false;
  const aNext = { x: a.at.x - ux * aStep, y: a.at.y - uy * aStep };
  const bNext = { x: b.at.x + ux * bStep, y: b.at.y + uy * bStep };
  if (canSit(a, aNext, size)) {
    a.at = aNext;
    moved = true;
  }
  if (canSit(b, bNext, size)) {
    b.at = bNext;
    moved = true;
  }
  return moved;
}

function separateFromBox(spot: CountSpot, obstacle: LabelBox, size: number): boolean {
  const box = textBox(spot.at, spot.value, size, 4);
  if (!boxesHit(box, obstacle)) return false;
  let dx = spot.at.x - obstacle.x;
  let dy = spot.at.y - obstacle.y;
  const distance = Math.hypot(dx, dy) || 1;
  dx /= distance;
  dy /= distance;
  const next = { x: spot.at.x + dx * 2.4, y: spot.at.y + dy * 2.4 };
  if (!canSit(spot, next, size)) return false;
  spot.at = next;
  return true;
}

function canSit(spot: CountSpot, point: Pt, size: number): boolean {
  const margin = regionMargin(point, spot.interior, spot.exterior);
  const keep = Math.max(size * 0.36, Math.min(spot.homeMargin * 0.62, spot.homeMargin));
  return margin + 0.05 >= Math.min(keep, spot.homeMargin);
}

function textBox(at: Pt, value: string, size: number, pad: number): LabelBox {
  return {
    x: at.x,
    y: at.y,
    hw: Math.max(1, value.length) * size * 0.32 + pad,
    hh: size * 0.42 + pad,
  };
}

function boxesHit(a: LabelBox, b: LabelBox): boolean {
  return Math.abs(a.x - b.x) < a.hw + b.hw && Math.abs(a.y - b.y) < a.hh + b.hh;
}

function placeSetName(
  circle: Disk,
  awayFrom: Pt,
  name: string,
  size: number,
  frame: Frame,
  box: { left: number; top: number; right: number; bottom: number },
): Pt {
  const dx = circle.x - awayFrom.x;
  const dy = circle.y - awayFrom.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const halfW = name.length * size * 0.32;
  const halfH = size * 0.48;
  const reach = circle.r + halfW * Math.abs(ux) + halfH * Math.abs(uy) + 8;
  const x = clamp(circle.x + ux * reach, halfW + 4, frame.width - halfW - 4);
  const titleClear = box.top > 40 ? 34 : 8;
  const y = clamp(circle.y + uy * reach, titleClear + halfH, frame.height - 30 - halfH);
  return { x, y };
}

function setName(x: number, y: number, value: string, preset: Frame["preset"], size: number): string {
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="middle" dominant-baseline="middle" fill="${cssVar("text", preset.text)}" font-size="${size}" font-weight="650">${esc(value)}</text>`;
}

function countText(x: number, y: number, value: string, label: string, preset: Frame["preset"], size: number): string {
  return (
    openMark(
      "text",
      "overlap",
      label,
      `x="${n(x)}" y="${n(y)}" text-anchor="middle" dominant-baseline="middle" fill="${cssVar("text", preset.text)}" stroke="${cssVar("surface", preset.surface)}" stroke-width="3.5" paint-order="stroke" font-size="${size}" font-weight="650"`,
    ) + `${esc(value)}</text>`
  );
}

function tooMany(spec: Record<string, unknown>, names: string[]): string {
  const extra = names.slice(3).join(", ");
  const message = `Venn draws 2 or 3 sets. "${extra}" is past that. Remove it, or split it into its own chart.`;
  const alt = isAlt(spec) || message;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="120" viewBox="0 0 680 120" role="img" aria-label="${esc(alt)}" class="ck-chart ck-chart-error" data-ck-type="venn"><text x="16" y="36" fill="${cssVar("text", "#111827")}" font-size="14">${esc(message)}</text></svg>`;
}

function isAlt(spec: Record<string, unknown>): string {
  const a11y = spec.a11y;
  return a11y && typeof a11y === "object" && "alt" in a11y && typeof (a11y as { alt?: unknown }).alt === "string" ? (a11y as { alt: string }).alt : "";
}

function keyOf(names: string[]): string {
  return [...names].sort().join("+");
}

function formatSize(value: number): string {
  if (Math.abs(value) >= 1000) return `${Math.round(value).toLocaleString("en-US")}`;
  const rounded = Math.round(value * 10) / 10;
  return String(rounded);
}

/** Circle intersection area. Radii and distance share one unit. */
export function intersectionArea(r: number, other: number, distance: number): number {
  if (distance >= r + other) return 0;
  if (distance <= Math.abs(other - r)) return Math.PI * Math.min(r, other) ** 2;
  const rr = r * r;
  const oo = other * other;
  const dd = distance * distance;
  const a = Math.acos(clampUnit((dd + rr - oo) / (2 * distance * r)));
  const b = Math.acos(clampUnit((dd + oo - rr) / (2 * distance * other)));
  const root = Math.sqrt(Math.max(0, (-distance + r + other) * (distance + r - other) * (distance - r + other) * (distance + r + other)));
  return rr * a + oo * b - 0.5 * root;
}

export function distanceFor(r: number, other: number, area: number): number {
  const cap = Math.PI * Math.min(r, other) ** 2;
  const target = Math.min(Math.max(area, 0), cap);
  if (!(r > 0) || !(other > 0)) return 0;
  if (target <= 0) return r + other;
  let lo = Math.abs(other - r);
  let hi = r + other;
  for (let step = 0; step < 28; step++) {
    const mid = (lo + hi) / 2;
    if (intersectionArea(r, other, mid) > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(-1, value));
}

export function vennRow(spec: Record<string, unknown>, index: number): Record<string, unknown> | undefined {
  return rowAt(spec, index);
}
