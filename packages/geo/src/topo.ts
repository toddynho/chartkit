export type LonLat = [number, number];

export interface GeoRegion {
  id: string;
  name: string;
  polygons: LonLat[][][];
  /** Small state drawn as a dot when the atlas has no polygon. */
  point?: LonLat;
}

interface Topology {
  type?: string;
  transform?: { scale?: number[]; translate?: number[] };
  arcs?: number[][][];
  objects?: Record<string, { type?: string; geometries?: TopologyGeom[] }>;
}

interface TopologyGeom {
  type?: string;
  id?: string | number;
  arcs?: unknown;
  coordinates?: number[];
  properties?: { name?: string };
}

interface GeoJsonGeometry {
  type?: string;
  coordinates?: unknown;
}

interface GeoJsonFeature {
  id?: string | number;
  properties?: Record<string, unknown>;
  geometry?: GeoJsonGeometry | null;
}

function decodeArc(topo: Topology, index: number): LonLat[] {
  const arc = topo.arcs?.[index] ?? [];
  const scale = topo.transform?.scale ?? [1, 1];
  const translate = topo.transform?.translate ?? [0, 0];
  let x = 0;
  let y = 0;
  const out: LonLat[] = [];
  for (const pair of arc) {
    x += pair[0] ?? 0;
    y += pair[1] ?? 0;
    out.push([x * (scale[0] ?? 1) + (translate[0] ?? 0), y * (scale[1] ?? 1) + (translate[1] ?? 0)]);
  }
  return out;
}

function ringOf(topo: Topology, indexes: number[]): LonLat[] {
  const pts: LonLat[] = [];
  for (const raw of indexes) {
    const reverse = raw < 0;
    let arc = decodeArc(topo, reverse ? ~raw : raw);
    if (reverse) arc = arc.slice().reverse();
    if (pts.length && arc.length) arc = arc.slice(1);
    for (const point of arc) pts.push(point);
  }
  return pts;
}

function polygonsOf(topo: Topology, arcs: unknown, type: string | undefined): LonLat[][][] {
  if (type === "Polygon" && Array.isArray(arcs)) {
    return [(arcs as number[][]).map((ring) => ringOf(topo, ring))];
  }
  if (type === "MultiPolygon" && Array.isArray(arcs)) {
    return (arcs as number[][][]).map((poly) => poly.map((ring) => ringOf(topo, ring)));
  }
  return [];
}

function pointOf(topo: Topology, coordinates: number[] | undefined): LonLat | null {
  if (!coordinates || coordinates.length < 2) return null;
  const scale = topo.transform?.scale ?? [1, 1];
  const translate = topo.transform?.translate ?? [0, 0];
  const lon = (coordinates[0] ?? 0) * (scale[0] ?? 1) + (translate[0] ?? 0);
  const lat = (coordinates[1] ?? 0) * (scale[1] ?? 1) + (translate[1] ?? 0);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return [lon, lat];
}

export function regionsFromTopology(topo: Topology): GeoRegion[] {
  const collection = topo.objects?.regions ?? Object.values(topo.objects ?? {})[0];
  const geoms = collection?.geometries ?? [];
  const regions: GeoRegion[] = [];
  for (const geom of geoms) {
    const id = geom.id == null ? "" : String(geom.id);
    if (!id) continue;
    const name = geom.properties?.name || id;
    if (geom.type === "Point") {
      const point = pointOf(topo, geom.coordinates);
      if (!point) continue;
      regions.push({ id, name, polygons: [], point });
      continue;
    }
    const polygons = polygonsOf(topo, geom.arcs, geom.type);
    if (!polygons.length) continue;
    regions.push({ id, name, polygons });
  }
  return regions;
}

function coordinates(geometry: GeoJsonGeometry | null | undefined): LonLat[][][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon" && Array.isArray(geometry.coordinates)) {
    return [[...(geometry.coordinates as number[][][]).map((ring) => ring.map((p) => [p[0] ?? 0, p[1] ?? 0] as LonLat))]];
  }
  if (geometry.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    return (geometry.coordinates as number[][][][]).map((poly) => poly.map((ring) => ring.map((p) => [p[0] ?? 0, p[1] ?? 0] as LonLat)));
  }
  return [];
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function regionsFromGeoJSON(geo: unknown): GeoRegion[] {
  const record = geo && typeof geo === "object" ? (geo as { type?: string; features?: GeoJsonFeature[]; geometry?: GeoJsonGeometry }) : null;
  if (!record) return [];
  const features: GeoJsonFeature[] =
    record.type === "FeatureCollection" && Array.isArray(record.features)
      ? record.features
      : record.type === "Feature"
        ? [record as GeoJsonFeature]
        : [];
  const regions: GeoRegion[] = [];
  features.forEach((feature, index) => {
    const props = feature.properties ?? {};
    const id = text(feature.id) || text(props.id) || text(props.iso_a3) || text(props.postal) || text(props.name) || String(index);
    const polygons = coordinates(feature.geometry);
    if (!polygons.length) return;
    regions.push({ id, name: text(props.name) || id, polygons });
  });
  return regions;
}
