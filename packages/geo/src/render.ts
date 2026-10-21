import { paintScale, POINT_PALETTE, type PaintScale } from "./color";
import { directoryIndex, matchRegion, type DirectoryEntry } from "./match";
import { albersUsa, equalEarth, equirectangular, fitProject, mercator, type Box } from "./project";
import { esc, fieldName, isRecord, num, round, rowsOf, sizeOf } from "./spec";
import { chromeFor, type Chrome } from "./theme";
import { regionsFromGeoJSON, regionsFromTopology, type GeoRegion, type LonLat } from "./topo";
import type { AtlasName, ColorScaleName } from "./types";

type Projector = (id: string, lon: number, lat: number) => [number, number];

interface Loaded {
  regions: GeoRegion[];
  atlas: string;
  entries: DirectoryEntry[] | null;
}

async function moduleTopology(mod: unknown): Promise<GeoRegion[]> {
  const record = mod && typeof mod === "object" && "default" in mod ? (mod as { default: unknown }).default : mod;
  return regionsFromTopology(record as Parameters<typeof regionsFromTopology>[0]);
}

async function load(mark: Record<string, unknown>): Promise<Loaded> {
  if (isRecord(mark.geojson)) {
    const regions = regionsFromGeoJSON(mark.geojson);
    return { regions, atlas: "inline", entries: regions.map((region) => ({ id: region.id, name: region.name, aliases: [region.id, region.name] })) };
  }
  if (isRecord(mark.topojson)) {
    const regions = regionsFromTopology(mark.topojson);
    return { regions, atlas: "inline", entries: regions.map((region) => ({ id: region.id, name: region.name, aliases: [region.id, region.name] })) };
  }
  const atlas = typeof mark.atlas === "string" ? mark.atlas : "world";
  if (atlas === "us") return { regions: await moduleTopology(await import("./data/us.json")), atlas, entries: null };
  if (atlas === "canada") return { regions: await moduleTopology(await import("./data/canada.json")), atlas, entries: null };
  if (atlas === "eu") return { regions: await moduleTopology(await import("./data/eu.json")), atlas, entries: null };
  if (atlas === "world") return { regions: await moduleTopology(await import("./data/world.json")), atlas, entries: null };
  return { regions: [], atlas, entries: null };
}

function defaultProjection(atlas: string): string {
  return atlas === "us" ? "albersUsa" : "equalEarth";
}

function splitRing(ring: LonLat[]): LonLat[][] {
  const parts: LonLat[][] = [];
  let current: LonLat[] = [];
  for (const point of ring) {
    const prev = current[current.length - 1];
    if (prev && Math.abs(point[0] - prev[0]) > 180) {
      if (current.length > 1) parts.push(current);
      current = [point];
    } else current.push(point);
  }
  if (current.length > 1) parts.push(current);
  return parts;
}

function pathFor(region: GeoRegion, project: Projector): string {
  let d = "";
  for (const poly of region.polygons) {
    for (const ring of poly) {
      for (const part of splitRing(ring)) {
        part.forEach((point, index) => {
          const [x, y] = project(region.id, point[0], point[1]);
          d += `${index ? "L" : "M"}${round(x)} ${round(y)}`;
        });
        d += "Z";
      }
    }
  }
  return d;
}

function centroid(region: GeoRegion, project: Projector): [number, number] | null {
  const ring = region.polygons[0]?.[0];
  if (!ring?.length) return null;
  let x = 0;
  let y = 0;
  for (const point of ring) {
    const next = project(region.id, point[0], point[1]);
    x += next[0];
    y += next[1];
  }
  return [x / ring.length, y / ring.length];
}

function hash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function graticule(project: (lon: number, lat: number) => [number, number]): string {
  const paths: string[] = [];
  for (let lon = -180; lon <= 180; lon += 30) {
    let d = "";
    for (let lat = -75; lat <= 75; lat += 4) {
      const [x, y] = project(lon, lat);
      d += `${d ? "L" : "M"}${round(x)} ${round(y)}`;
    }
    paths.push(`<path class="ck-geo-graticule" d="${d}"/>`);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    let d = "";
    let open = false;
    let prev = -180;
    for (let lon = -180; lon <= 180; lon += 4) {
      if (lon - prev > 180) open = false;
      const [x, y] = project(lon, lat);
      d += `${open ? "L" : "M"}${round(x)} ${round(y)}`;
      open = true;
      prev = lon;
    }
    paths.push(`<path class="ck-geo-graticule" d="${d}"/>`);
  }
  return paths.join("");
}

function legendMarkup(scale: PaintScale, chrome: Chrome, x: number, y: number, height: number, id: string): string {
  if (scale.swatches?.length) {
    const row = Math.min(22, Math.max(14, (height - 8) / scale.swatches.length));
    return scale.swatches
      .map((swatch, index) => {
        const top = y + index * row;
        return `<rect x="${round(x)}" y="${round(top)}" width="12" height="${round(Math.max(8, row - 4))}" fill="${swatch.color}" rx="2"/><text class="ck-geo-label" x="${round(x + 18)}" y="${round(top + 10)}">${esc(swatch.label)}</text>`;
      })
      .join("");
  }
  const bar = Math.max(48, height - 24);
  const stops = scale.stops
    .map((stop) => `<stop offset="${Math.round(stop.offset * 100)}%" stop-color="${stop.color}"/>`)
    .join("");
  const labels = scale.stops
    .map((stop) => `<text class="ck-geo-label" x="${round(x + 18)}" y="${round(y + 16 + (1 - stop.offset) * bar)}">${esc(stop.label)}</text>`)
    .join("");
  return `<defs><linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0">${stops}</linearGradient></defs><rect x="${round(x)}" y="${round(y + 8)}" width="12" height="${round(bar)}" fill="url(#${id})" rx="2"/>${labels}`;
}

function styleBlock(chrome: Chrome): string {
  return `<style>.ck-geo-water{fill:${chrome.water}}.ck-geo-nodata{fill:${chrome.nodata}}.ck-geo-region,.ck-geo-point{stroke:${chrome.border};stroke-width:.6px}.ck-geo-region:hover,.ck-geo-region:focus,.ck-geo-point:hover,.ck-geo-point:focus{stroke:${chrome.text};stroke-width:1.6px;outline:none}.ck-geo-graticule{fill:none;stroke:${chrome.border};stroke-width:.4;opacity:.45}.ck-geo-label,.ck-geo-title{fill:${chrome.text};font-family:ui-sans-serif,system-ui,sans-serif}.ck-geo-label{font-size:11px}.ck-geo-title{font-size:16px;font-weight:600}.ck-geo-muted{fill:${chrome.muted};font-size:11px;font-family:ui-sans-serif,system-ui,sans-serif}</style>`;
}

function shell(spec: Record<string, unknown>, chrome: Chrome, body: string): string {
  const { width, height } = sizeOf(spec);
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : typeof spec.title === "string" ? spec.title : "Map";
  const theme = typeof spec.theme === "string" ? spec.theme : "soft";
  const scheme = chrome.scheme ? ` style="color-scheme:${chrome.scheme}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${esc(alt)}" data-ck-type="${esc(String(spec.type))}" data-ck-theme="${esc(theme)}"${scheme}>${styleBlock(chrome)}<title>${esc(alt)}</title><rect class="ck-geo-water" width="100%" height="100%"/>${body}</svg>`;
}

function projectorFor(name: string, regions: GeoRegion[], box: Box): { project: Projector; point: (lon: number, lat: number) => [number, number]; grid: boolean } {
  if (name === "albersUsa") {
    const usa = albersUsa(regions, box);
    return { project: (id, lon, lat) => usa.region(id)(lon, lat), point: usa.point, grid: false };
  }
  const raw = name === "mercator" ? mercator : name === "equirectangular" || name === "fit" ? equirectangular : equalEarth;
  const samples: LonLat[] = [];
  for (const region of regions) {
    if (region.id === "ATA" || region.id === "AQ") continue;
    for (const poly of region.polygons) for (const ring of poly) for (const point of ring) samples.push(point);
  }
  if (!samples.length) {
    for (const region of regions) for (const poly of region.polygons) for (const ring of poly) for (const point of ring) samples.push(point);
  }
  const fitted = fitProject(raw, samples, box, 8);
  return { project: (_id, lon, lat) => fitted(lon, lat), point: fitted, grid: name !== "fit" };
}

interface Hit {
  value: number;
  index: number;
}

function regionHits(rows: Record<string, unknown>[], regionField: string | null, valueField: string | null, atlas: string, entries: DirectoryEntry[] | null): Map<string, Hit> {
  const index = directoryIndex(entries ? "" : atlas, entries ?? undefined);
  const hits = new Map<string, Hit>();
  if (!regionField || !valueField) return hits;
  rows.forEach((row, rowIndex) => {
    const raw = row[regionField];
    if (raw == null || raw === "") return;
    const id = matchRegion(index, String(raw));
    const value = num(row[valueField]);
    if (!id || value == null) return;
    hits.set(id, { value, index: rowIndex });
  });
  return hits;
}

function regionMarkup(regions: GeoRegion[], project: Projector, hits: Map<string, Hit>, scale: PaintScale | null): string {
  return regions
    .map((region) => {
      const d = pathFor(region, project);
      if (!d) return "";
      const hit = hits.get(region.id);
      const fill = hit && scale ? scale.fill(hit.value) : "";
      const label = hit ? `${region.name}, ${hit.value}` : `${region.name}, no data`;
      const cls = hit ? "ck-geo-region" : "ck-geo-region ck-geo-nodata";
      const painted = fill ? ` fill="${fill}"` : "";
      const value = hit ? ` data-ck-value="${hit.value}" data-ck-i="${hit.index}"` : ` data-ck-i="-1"`;
      return `<path class="${cls}" d="${d}"${painted}${value} data-ck-id="${esc(region.id)}" data-ck-name="${esc(region.name)}" tabindex="0" aria-label="${esc(label)}" fill-rule="evenodd"><title>${esc(label)}</title></path>`;
    })
    .join("");
}

interface Dot {
  index: number;
  lon: number;
  lat: number;
  size: number;
  color: string;
  label: string;
  value: number | null;
}

function dotsOf(rows: Record<string, unknown>[], encoding: Record<string, unknown>, chrome: Chrome): { dots: Dot[]; scale: PaintScale | null } {
  const latField = fieldName(encoding.latitude);
  const lonField = fieldName(encoding.longitude);
  const sizeField = fieldName(encoding.size);
  const colorField = fieldName(encoding.color);
  const labelField = fieldName(encoding.label);
  const draft: { index: number; lon: number; lat: number; size: number; colorRaw: unknown; label: string }[] = [];
  if (!latField || !lonField) return { dots: [], scale: null };
  rows.forEach((row, index) => {
    const lat = num(row[latField]);
    const lon = num(row[lonField]);
    if (lat == null || lon == null || Math.abs(lat) > 90 || Math.abs(lon) > 180) return;
    draft.push({
      index,
      lon,
      lat,
      size: sizeField ? num(row[sizeField]) ?? 1 : 1,
      colorRaw: colorField ? row[colorField] : null,
      label: labelField ? String(row[labelField] ?? "") : "",
    });
  });
  const numeric = draft.every((dot) => dot.colorRaw == null || num(dot.colorRaw) != null);
  const colorValues = draft.map((dot) => num(dot.colorRaw)).filter((value): value is number => value != null);
  const scale = colorField && numeric && colorValues.length ? paintScale("sequential", colorValues, undefined) : null;
  const categories = new Map<string, string>();
  const dots = draft.map((dot) => {
    let color = chrome.accent;
    let value: number | null = null;
    if (scale) {
      value = num(dot.colorRaw);
      if (value != null) color = scale.fill(value);
    } else if (dot.colorRaw != null && dot.colorRaw !== "") {
      const key = String(dot.colorRaw);
      if (!categories.has(key)) categories.set(key, POINT_PALETTE[categories.size % POINT_PALETTE.length] ?? chrome.accent);
      color = categories.get(key) ?? chrome.accent;
      value = num(dot.colorRaw);
    }
    return { index: dot.index, lon: dot.lon, lat: dot.lat, size: dot.size, color, label: dot.label, value };
  });
  if (!scale && categories.size) {
    return {
      dots,
      scale: {
        kind: "threshold",
        fill: () => chrome.accent,
        stops: [],
        swatches: [...categories.entries()].map(([label, color]) => ({ label, color })),
      },
    };
  }
  return { dots, scale };
}

function pointMarkup(dots: Dot[], point: (lon: number, lat: number) => [number, number], labelCount: number, top: number): string {
  if (!dots.length) return "";
  const sizes = dots.map((dot) => dot.size);
  const lo = Math.min(...sizes);
  const hi = Math.max(...sizes);
  const span = Math.max(hi - lo, 1e-9);
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  const ranked = dots
    .map((dot, order) => ({ dot, order }))
    .sort((a, b) => b.dot.size - a.dot.size)
    .slice(0, labelCount);
  const labelFor = new Set(ranked.map((item) => item.order));
  const painted = [...dots].sort((a, b) => b.size - a.size);
  let marks = "";
  const labels: string[] = [];
  for (const dot of painted) {
    const [x, y] = point(dot.lon, dot.lat);
    const t = (dot.size - lo) / span;
    const radius = 3.5 + Math.sqrt(Math.max(0, t)) * 16;
    const name = dot.label || `${dot.lat}, ${dot.lon}`;
    const text = dot.value == null ? name : `${name}, ${dot.value}`;
    marks += `<circle class="ck-geo-point" cx="${round(x)}" cy="${round(y)}" r="${round(radius)}" fill="${dot.color}" data-ck-i="${dot.index}" data-ck-id="${dot.index}" data-ck-name="${esc(name)}"${dot.value == null ? "" : ` data-ck-value="${dot.value}"`} tabindex="0" aria-label="${esc(text)}"><title>${esc(text)}</title></circle>`;
    if (!dot.label || !labelFor.has(dots.indexOf(dot))) continue;
    const width = dot.label.length * 6.4 + 4;
    const box = { x: x - width / 2, y: y - radius - 16, w: width, h: 13 };
    const hit = placed.some((item) => !(box.x + box.w < item.x || item.x + item.w < box.x || box.y + box.h < item.y || item.y + item.h < box.y));
    if (hit || box.y < top) continue;
    placed.push(box);
    labels.push(`<text class="ck-geo-label" x="${round(x)}" y="${round(y - radius - 4)}" text-anchor="middle">${esc(dot.label)}</text>`);
  }
  return marks + labels.join("");
}

export async function render(spec: unknown): Promise<string> {
  if (!isRecord(spec) || (spec.type !== "choropleth" && spec.type !== "map-points")) {
    const chrome = chromeFor(isRecord(spec) ? spec.theme : "soft");
    return shell(isRecord(spec) ? spec : { type: "choropleth", a11y: { alt: "Map" } }, chrome, `<text class="ck-geo-title" x="16" y="32">Expected type choropleth or map-points.</text>`);
  }
  const chrome = chromeFor(spec.theme);
  const { width, height } = sizeOf(spec);
  const mark = isRecord(spec.mark) ? spec.mark : {};
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const loaded = await load(mark);
  const title = typeof spec.title === "string" ? spec.title : "";
  const titleH = title ? 34 : 12;
  const rows = rowsOf(spec);
  const regionField = fieldName(encoding.region) ?? fieldName(encoding.x);
  const valueField = fieldName(encoding.color) ?? fieldName(encoding.y);
  const hits = spec.type === "choropleth" ? regionHits(rows, regionField, valueField, loaded.atlas, loaded.entries) : new Map<string, Hit>();
  const kind: ColorScaleName = mark.scale === "diverging" || mark.scale === "threshold" ? mark.scale : "sequential";
  const thresholds = Array.isArray(mark.thresholds) ? mark.thresholds.filter((item): item is number => typeof item === "number") : undefined;
  const choroplethScale = spec.type === "choropleth" && hits.size ? paintScale(kind, [...hits.values()].map((hit) => hit.value), thresholds) : null;
  const points = spec.type === "map-points" ? dotsOf(rows, encoding, chrome) : { dots: [], scale: null };
  const scale = choroplethScale ?? points.scale;
  const showLegend = mark.legend !== false && !!scale && (scale.stops.length > 0 || !!scale.swatches?.length);
  const legendW = showLegend ? 92 : 12;
  const box: Box = { x: 8, y: titleH, w: width - 16 - legendW, h: height - titleH - 10 };
  const explicit = typeof mark.projection === "string" ? mark.projection : "";
  const known = ["equirectangular", "mercator", "equalEarth", "albersUsa", "fit"];
  const projection = known.includes(explicit) ? explicit : defaultProjection(loaded.atlas);
  const drawn = loaded.regions.length ? projectorFor(projection, loaded.regions, box) : null;
  const id = `ckg${hash(`${title}:${String(spec.type)}:${loaded.atlas}`)}`;
  let body = "";
  if (title) body += `<text class="ck-geo-title" x="12" y="22">${esc(title)}</text>`;
  if (!loaded.regions.length) {
    body += `<text class="ck-geo-title" x="16" y="${titleH + 28}">Unknown atlas.</text>`;
    return shell(spec, chrome, body);
  }
  body += `<defs><clipPath id="${id}c"><rect x="${round(box.x)}" y="${round(box.y)}" width="${round(box.w)}" height="${round(box.h)}"/></clipPath></defs>`;
  body += `<g clip-path="url(#${id}c)">`;
  if (drawn?.grid) body += graticule(drawn.point);
  if (drawn) body += regionMarkup(loaded.regions, drawn.project, hits, choroplethScale);
  if (drawn && points.dots.length) body += pointMarkup(points.dots, drawn.point, num(mark.labelCount) ?? 5, box.y);
  body += `</g>`;
  if (showLegend && scale) body += legendMarkup(scale, chrome, box.x + box.w + 14, box.y, box.h, id);
  return shell(spec, chrome, body);
}
