import type { LonLat } from "./topo";

export type XY = [number, number];

const D2R = Math.PI / 180;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function equirectangular(lon: number, lat: number): XY {
  return [lon * D2R, lat * D2R];
}

export function mercator(lon: number, lat: number): XY {
  const phi = Math.max(-85, Math.min(85, lat)) * D2R;
  return [lon * D2R, Math.log(Math.tan(Math.PI / 4 + phi / 2))];
}

const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;

export function equalEarth(lon: number, lat: number): XY {
  const lambda = lon * D2R;
  const theta = Math.asin((Math.sqrt(3) / 2) * Math.sin(Math.max(-89.9, Math.min(89.9, lat)) * D2R));
  const t2 = theta * theta;
  const t6 = t2 * t2 * t2;
  const t8 = t6 * t2;
  const y = theta * (A4 * t8 + A3 * t6 + A2 * t2 + A1);
  const x = (2 * Math.sqrt(3) * lambda * Math.cos(theta)) / (3 * (9 * A4 * t8 + 7 * A3 * t6 + 3 * A2 * t2 + A1));
  return [x, y];
}

export function albers(phi1: number, phi2: number, phi0: number, lambda0: number): (lon: number, lat: number) => XY {
  const p1 = phi1 * D2R;
  const p2 = phi2 * D2R;
  const p0 = phi0 * D2R;
  const l0 = lambda0 * D2R;
  const n = (Math.sin(p1) + Math.sin(p2)) / 2;
  const c = Math.cos(p1) ** 2 + 2 * n * Math.sin(p1);
  const rho0 = Math.sqrt(Math.max(0, c - 2 * n * Math.sin(p0))) / n;
  return (lon, lat) => {
    const phi = Math.max(-89, Math.min(89, lat)) * D2R;
    const rho = Math.sqrt(Math.max(0, c - 2 * n * Math.sin(phi))) / n;
    const theta = n * (lon * D2R - l0);
    return [rho * Math.sin(theta), rho0 - rho * Math.cos(theta)];
  };
}

export function fitProject(
  project: (lon: number, lat: number) => XY,
  samples: LonLat[],
  box: Box,
  pad = 6,
): (lon: number, lat: number) => XY {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [lon, lat] of samples) {
    const [x, y] = project(lon, lat);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX) || maxX === minX || maxY === minY) {
    return () => [box.x + box.w / 2, box.y + box.h / 2];
  }
  const innerW = Math.max(1, box.w - pad * 2);
  const innerH = Math.max(1, box.h - pad * 2);
  const scale = Math.min(innerW / (maxX - minX), innerH / (maxY - minY));
  const ox = box.x + pad + (innerW - (maxX - minX) * scale) / 2;
  const oy = box.y + pad + (innerH - (maxY - minY) * scale) / 2;
  return (lon, lat) => {
    const [x, y] = project(lon, lat);
    return [ox + (x - minX) * scale, oy + (maxY - y) * scale];
  };
}

export type Zone = "main" | "ak" | "hi";

export function zoneFor(id: string, lon?: number, lat?: number): Zone {
  if (id === "AK" || id === "02") return "ak";
  if (id === "HI" || id === "15") return "hi";
  if (lat != null && lon != null) {
    if (lat < 25 && lon < -140) return "hi";
    if (lat > 50 && (lon < -125 || lon > 0)) return "ak";
  }
  return "main";
}

function samplesOf(polygons: LonLat[][][], unwrap: boolean): LonLat[] {
  const out: LonLat[] = [];
  for (const poly of polygons) {
    for (const ring of poly) {
      for (const [lon, lat] of ring) out.push(unwrap && lon > 0 ? [lon - 360, lat] : [lon, lat]);
    }
  }
  return out;
}

export function albersUsa(
  groups: { id: string; polygons: LonLat[][][] }[],
  box: Box,
): { region: (id: string) => (lon: number, lat: number) => XY; point: (lon: number, lat: number) => XY } {
  const lowerH = box.h * 0.74;
  const insetY = box.y + lowerH;
  const insetH = Math.max(1, box.h - lowerH);
  const boxes: Record<Zone, Box> = {
    main: { x: box.x, y: box.y, w: box.w, h: lowerH },
    ak: { x: box.x, y: insetY, w: box.w * 0.3, h: insetH },
    hi: { x: box.x + box.w * 0.32, y: insetY + insetH * 0.18, w: box.w * 0.22, h: insetH * 0.7 },
  };
  const buckets: Record<Zone, LonLat[]> = { main: [], ak: [], hi: [] };
  for (const group of groups) {
    const zone = zoneFor(group.id);
    buckets[zone].push(...samplesOf(group.polygons, zone === "ak"));
  }
  const lower = albers(29.5, 45.5, 37.5, -96);
  const alaska = albers(55, 65, 58.5, -154);
  const hawaii = albers(8, 18, 19.9, -157);
  const fitted: Record<Zone, (lon: number, lat: number) => XY> = {
    main: fitProject(lower, buckets.main, boxes.main, 4),
    ak: fitProject((lon, lat) => alaska(lon > 0 ? lon - 360 : lon, lat), buckets.ak, boxes.ak, 3),
    hi: fitProject(hawaii, buckets.hi, boxes.hi, 3),
  };
  return {
    region: (id) => fitted[zoneFor(id)],
    point: (lon, lat) => fitted[zoneFor("", lon, lat)](lon, lat),
  };
}
