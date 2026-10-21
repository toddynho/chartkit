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

export interface InsetFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Albers USA composite. Lower 48 uses the USGS parallels. Alaska is 0.35× that
 * scale and Hawaii uses the same scale, placed with the standard offsets so the
 * main islands stay legible beside Alaska. A thin frame sits on each inset.
 */
export function albersUsa(
  groups: { id: string; polygons: LonLat[][][] }[],
  box: Box,
): { region: (id: string) => (lon: number, lat: number) => XY; point: (lon: number, lat: number) => XY; frames: InsetFrame[] } {
  const lower = albers(29.5, 45.5, 37.5, -96);
  const alaskaRaw = albers(55, 65, 58.5, -156);
  const hawaiiRaw = albers(8, 18, 19.9, -160);
  const alaska = (lon: number, lat: number) => alaskaRaw(lon > 0 ? lon - 360 : lon, lat);
  const samples: XY[] = [];
  const take = (zone: Zone, project: (lon: number, lat: number) => XY, scale: number, dx: number, dy: number) => {
    for (const group of groups) {
      if (zoneFor(group.id) !== zone) continue;
      for (const [lon, lat] of samplesOf(group.polygons, zone === "ak")) {
        const [x, y] = project(lon, lat);
        samples.push([dx + scale * x, dy - scale * y]);
      }
    }
  };
  take("main", lower, 1, 0, 0);
  take("ak", alaska, 0.35, -0.307, 0.201);
  take("hi", hawaiiRaw, 1, -0.205, 0.212);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of samples) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  const pad = 4;
  const innerW = Math.max(1, box.w - pad * 2);
  const innerH = Math.max(1, box.h - pad * 2);
  const k = Math.min(innerW / Math.max(1e-6, maxX - minX), innerH / Math.max(1e-6, maxY - minY));
  const tx = box.x + pad + (innerW - (maxX - minX) * k) / 2 - minX * k;
  const ty = box.y + pad + (innerH - (maxY - minY) * k) / 2 - minY * k;
  const place = (project: (lon: number, lat: number) => XY, scale: number, dx: number, dy: number) => (lon: number, lat: number): XY => {
    const [x, y] = project(lon, lat);
    return [tx + k * (dx + scale * x), ty + k * (dy - scale * y)];
  };
  const fitted: Record<Zone, (lon: number, lat: number) => XY> = {
    main: place(lower, 1, 0, 0),
    ak: place(alaska, 0.35, -0.307, 0.201),
    hi: place(hawaiiRaw, 1, -0.205, 0.212),
  };
  const bounds = (zone: Zone): InsetFrame => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const project = fitted[zone];
    for (const group of groups) {
      if (zoneFor(group.id) !== zone) continue;
      for (const [lon, lat] of samplesOf(group.polygons, false)) {
        const [x, y] = project(lon, lat);
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    const pad = 4;
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  };
  return {
    region: (id) => fitted[zoneFor(id)],
    point: (lon, lat) => fitted[zoneFor("", lon, lat)](lon, lat),
    frames: [bounds("ak"), bounds("hi")],
  };
}
