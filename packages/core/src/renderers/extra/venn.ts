import type { Frame } from "../../frame";
import { cssVar } from "../../theme";
import { esc, font, n } from "../../svg";
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
    const mid = (c0 + c1) / 2;
    parts.push(openMark("text", "overlap", `${names.join(" + ")}: ${formatSize(shared)}`, `x="${n(mid)}" y="${n(cy + 4)}" text-anchor="middle" fill="${cssVar("text", preset.text)}" font-size="13" font-weight="650" font-family="${font()}"`));
    parts.push(`${esc(formatSize(shared))}</text>`);
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
  const scale = Math.min((box.right - box.left) / (maxX - minX || 1), (box.bottom - box.top - 16) / (maxY - minY || 1));
  const ox = box.left + ((box.right - box.left) - (maxX - minX) * scale) / 2 - minX * scale;
  const oy = box.top + ((box.bottom - box.top) - (maxY - minY) * scale) / 2 - minY * scale;
  const placed = raw.map((circle) => ({ x: ox + circle.x * scale, y: oy + circle.y * scale, r: circle.r * scale }));
  const centroid = {
    x: (placed[0].x + placed[1].x + placed[2].x) / 3,
    y: (placed[0].y + placed[1].y + placed[2].y) / 3,
  };
  names.forEach((name, index) => {
    const circle = placed[index];
    const color = fill(frame, index);
    const label = `${name}: ${formatSize(setSize.get(name) ?? 0)}`;
    parts.push(openMark("circle", "set", label, `cx="${n(circle.x)}" cy="${n(circle.y)}" r="${n(circle.r)}" fill="${color}" fill-opacity="0.38" stroke="${color}" stroke-width="1.5"`));
    parts.push("</circle>");
    const dx = circle.x - centroid.x;
    const dy = circle.y - centroid.y;
    const len = Math.hypot(dx, dy) || 1;
    const lx = Math.min(box.right, Math.max(box.left, circle.x + (dx / len) * (circle.r + 16)));
    const ly = Math.min(box.bottom - 4, Math.max(box.top + 14, circle.y + (dy / len) * (circle.r + 16)));
    parts.push(text(lx, ly, name, cssVar("text", preset.text), 13, "650", "middle"));
  });
  for (let a = 0; a < 3; a++) {
    for (let b = a + 1; b < 3; b++) {
      const shared = overlap.get(keyOf([names[a], names[b]]));
      if (shared == null) continue;
      const x = (placed[a].x + placed[b].x) / 2;
      const y = (placed[a].y + placed[b].y) / 2;
      const label = `${names[a]} + ${names[b]}: ${formatSize(shared)}`;
      parts.push(openMark("text", "overlap", label, `x="${n(x)}" y="${n(y)}" text-anchor="middle" fill="${cssVar("text", preset.text)}" font-size="12" font-weight="650" font-family="${font()}"`));
      parts.push(`${esc(formatSize(shared))}</text>`);
    }
  }
  const triple = overlap.get(keyOf(names));
  if (triple != null) {
    const label = `${names.join(" + ")}: ${formatSize(triple)}`;
    parts.push(openMark("text", "overlap", label, `x="${n(centroid.x)}" y="${n(centroid.y + 4)}" text-anchor="middle" fill="${cssVar("text", preset.text)}" font-size="12" font-weight="650" font-family="${font()}"`));
    parts.push(`${esc(formatSize(triple))}</text>`);
  }
}

function tooMany(spec: Record<string, unknown>, names: string[]): string {
  const extra = names.slice(3).join(", ");
  const message = `Venn draws 2 or 3 sets. "${extra}" is past that. Remove it, or split it into its own chart.`;
  const alt = isAlt(spec) || message;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="120" viewBox="0 0 680 120" role="img" aria-label="${esc(alt)}" class="ck-chart ck-chart-error" data-ck-type="venn"><text x="16" y="36" fill="${cssVar("text", "#111827")}" font-size="14" font-family="${font()}">${esc(message)}</text></svg>`;
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
