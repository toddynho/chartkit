import { formatNumber, hexRange, paintScale, parseFormat, POINT_PALETTE, sizeStops, SOFT_DIVERGING, type PaintScale, type ScaleFormat } from "./color";
import { directoryIndex, matchRegion, type DirectoryEntry } from "./match";
import { albersUsa, equalEarth, equirectangular, fitProject, mercator, type Box, type InsetFrame } from "./project";
import { esc, fieldName, isRecord, mapKind, num, resolveEncoding, resolveMark, round, rowsOf, sizeOf, tooltipColumns, tooltipExtra } from "./spec";
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

function measureText(text: string, size: number): number {
  let width = 0;
  for (const ch of text) {
    if (ch === " ") width += size * 0.33;
    else if ("MW@#%&".includes(ch)) width += size * 0.86;
    else if (ch === "m" || ch === "w") width += size * 0.78;
    else if ("iljtfrI.,'".includes(ch)) width += size * 0.3;
    else width += size * 0.56;
  }
  return width;
}

function titleLayout(text: string, width: number): { size: number; y: number; band: number } {
  let size = 16;
  while (size > 11 && measureText(text, size) > width - 24) size -= 0.5;
  const y = Math.round((8 + size * 0.8) * 10) / 10;
  const band = Math.ceil(y + size * 0.32 + 8);
  return { size, y, band };
}

function legendSide(spec: Record<string, unknown>): "bottom" | "right" {
  return isRecord(spec.legend) && spec.legend.position === "bottom" ? "bottom" : "right";
}

function horizontalLegend(scale: PaintScale, x: number, y: number, width: number, id: string): string {
  const title = scale.title ? `<text class="ck-geo-label ck-geo-legend-title" x="${round(x)}" y="${round(y + 11)}">${esc(scale.title)}</text>` : "";
  const barY = y + (scale.title ? 18 : 2);
  if (scale.swatches?.length) {
    const marks = scale.swatches
      .map((swatch, index) => {
        const at = x + index * 88;
        return `<rect x="${round(at)}" y="${round(barY)}" width="12" height="8" fill="${swatch.color}" rx="2"/><text class="ck-geo-label" x="${round(at + 16)}" y="${round(barY + 8)}">${esc(swatch.label)}</text>`;
      })
      .join("");
    return `${title}${marks}`;
  }
  const stops = scale.stops.map((stop) => `<stop offset="${Math.round(stop.offset * 100)}%" stop-color="${stop.color}"/>`).join("");
  const lo = scale.stops[0];
  const hi = scale.stops[scale.stops.length - 1];
  const barW = Math.max(48, width - 4);
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">${stops}</linearGradient></defs>${title}<rect x="${round(x)}" y="${round(barY)}" width="${round(barW)}" height="8" fill="url(#${id})" rx="2"/><text class="ck-geo-label" x="${round(x)}" y="${round(barY + 20)}">${esc(lo?.label ?? "")}</text><text class="ck-geo-label" text-anchor="end" x="${round(x + barW)}" y="${round(barY + 20)}">${esc(hi?.label ?? "")}</text>`;
}

function legendWidth(scale: PaintScale): number {
  const labels = [scale.title, ...(scale.stops.map((stop) => stop.label)), ...(scale.swatches ?? []).map((swatch) => swatch.label), ...(scale.sizes ?? []).map((stop) => stop.label), "No data"];
  let widest = 0;
  for (const label of labels) widest = Math.max(widest, measureText(label, 11));
  return Math.min(168, Math.max(86, Math.ceil(widest + 28)));
}

function noDataSwatch(x: number, y: number, id: string): string {
  return `<rect x="${round(x)}" y="${round(y)}" width="12" height="12" fill="url(#${id}nd)" stroke="currentColor" stroke-opacity="0.35" rx="2"/><text class="ck-geo-label" x="${round(x + 18)}" y="${round(y + 10)}">No data</text>`;
}

function legendMarkup(scale: PaintScale, x: number, y: number, height: number, id: string, nodata: boolean): string {
  const title = scale.title ? `<text class="ck-geo-label ck-geo-legend-title" x="${round(x)}" y="${round(y + 12)}">${esc(scale.title)}</text>` : "";
  const top = y + (scale.title ? 20 : 4);
  const foot = nodata ? 28 : 8;
  if (scale.sizes?.length) {
    const room = Math.max(36, height - (top - y) - foot);
    const row = Math.min(36, room / scale.sizes.length);
    const sizeLo = scale.sizes[0]?.value ?? 0;
    const sizeHi = scale.sizes[scale.sizes.length - 1]?.value ?? sizeLo + 1;
    const marks = scale.sizes
      .map((stop, index) => {
        const t = sizeHi === sizeLo ? 1 : (stop.value - sizeLo) / (sizeHi - sizeLo);
        const radius = 4.5 + Math.sqrt(Math.max(0, t)) * 8;
        const cy = top + row * index + row * 0.55;
        return `<circle cx="${round(x + 12)}" cy="${round(cy)}" r="${round(radius)}" fill="${scale.fill(stop.value)}" stroke="${scale.fill(stop.value)}" stroke-width="1"/><text class="ck-geo-label" x="${round(x + 28)}" y="${round(cy + 4)}">${esc(stop.label)}</text>`;
      })
      .join("");
    return `${title}${marks}${nodata ? noDataSwatch(x, y + height - 18, id) : ""}`;
  }
  if (scale.swatches?.length) {
    const room = Math.max(20, height - (top - y) - foot);
    const row = Math.min(22, Math.max(14, room / scale.swatches.length));
    const marks = scale.swatches
      .map((swatch, index) => {
        const at = top + index * row;
        return `<rect x="${round(x)}" y="${round(at)}" width="12" height="${round(Math.max(8, row - 4))}" fill="${swatch.color}" rx="2"/><text class="ck-geo-label" x="${round(x + 18)}" y="${round(at + 10)}">${esc(swatch.label)}</text>`;
      })
      .join("");
    return `${title}${marks}${nodata ? noDataSwatch(x, y + height - 18, id) : ""}`;
  }
  const bar = Math.max(48, height - (top - y) - foot - 8);
  const stops = scale.stops.map((stop) => `<stop offset="${Math.round(stop.offset * 100)}%" stop-color="${stop.color}"/>`).join("");
  const labels = scale.stops
    .map((stop) => `<text class="ck-geo-label" x="${round(x + 18)}" y="${round(top + 4 + (1 - stop.offset) * bar)}">${esc(stop.label)}</text>`)
    .join("");
  return `<defs><linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0">${stops}</linearGradient></defs>${title}<rect x="${round(x)}" y="${round(top)}" width="12" height="${round(bar)}" fill="url(#${id})" rx="2"/>${labels}${nodata ? noDataSwatch(x, y + height - 18, id) : ""}`;
}

function styleBlock(chrome: Chrome, id: string, nodata: "hatch" | "fill" | "off"): string {
  const rim = chrome.scheme === "dark" ? "#141414" : "#ffffff";
  const nodataCss = nodata === "hatch" ? `.ck-geo-nodata{fill:url(#${id}nd)}` : nodata === "fill" ? `.ck-geo-nodata{fill:${chrome.land}}` : "";
  // A stylesheet fill beats the fill attribute. Land belongs on a points map, or on missing choropleth countries when nodata is fill.
  const regionFill = nodata === "off" ? `fill:${chrome.land};` : "";
  return `<style>.ck-geo-water{fill:${chrome.water}}${nodataCss}.ck-geo-region{${regionFill}stroke:${chrome.border};stroke-width:.6px}.ck-geo-point{stroke:${rim};stroke-width:1.25px;fill-opacity:.82}.ck-geo-region:hover,.ck-geo-region:focus,.ck-geo-point:hover,.ck-geo-point:focus{stroke:${chrome.text};stroke-width:1.6px;outline:none}.ck-geo-graticule{fill:none;stroke:${chrome.border};stroke-width:.4;opacity:.45}.ck-geo-inset{fill:none;stroke:${chrome.border};stroke-width:.75}.ck-geo-leader{fill:none;stroke:${chrome.muted};stroke-width:.8}.ck-geo-label,.ck-geo-title{fill:${chrome.text};font-family:ui-sans-serif,system-ui,sans-serif}.ck-geo-label{font-size:11px}.ck-geo-legend-title{font-weight:650}.ck-geo-title{font-weight:600}.ck-geo-tag{fill:${chrome.text};font-size:11px;font-family:ui-sans-serif,system-ui,sans-serif;paint-order:stroke;stroke:${chrome.water};stroke-width:3px;stroke-linejoin:round}.ck-geo-muted{fill:${chrome.muted};font-size:11px;font-family:ui-sans-serif,system-ui,sans-serif}</style>`;
}

function patternDef(chrome: Chrome, id: string): string {
  const ink = chrome.scheme === "dark" ? chrome.border : "#8d877c";
  return `<pattern id="${id}nd" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${chrome.nodata}"/><path d="M0 6 L6 0 M-1 1 L1 -1 M5 7 L7 5" stroke="${ink}" stroke-width="0.8"/></pattern>`;
}

function shell(spec: Record<string, unknown>, chrome: Chrome, body: string, patternId = "ckg", nodata: "hatch" | "fill" | "off" = "off"): string {
  const { width, height } = sizeOf(spec);
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : typeof spec.title === "string" ? spec.title : "Map";
  const theme = typeof spec.theme === "string" ? spec.theme : "soft";
  const scheme = chrome.scheme ? ` style="color-scheme:${chrome.scheme}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${esc(alt)}" data-ck-type="${esc(String(spec.type))}" data-ck-theme="${esc(theme)}"${scheme}>${styleBlock(chrome, patternId, nodata)}<title>${esc(alt)}</title><rect class="ck-geo-water" width="100%" height="100%"/>${body}</svg>`;
}

function projectorFor(name: string, regions: GeoRegion[], box: Box): { project: Projector; point: (lon: number, lat: number) => [number, number]; grid: boolean; frames: InsetFrame[] } {
  if (name === "albersUsa") {
    const usa = albersUsa(regions, box);
    return { project: (id, lon, lat) => usa.region(id)(lon, lat), point: usa.point, grid: false, frames: usa.frames };
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
  return { project: (_id, lon, lat) => fitted(lon, lat), point: fitted, grid: name !== "fit", frames: [] };
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

function regionMarkup(
  regions: GeoRegion[],
  project: Projector,
  hits: Map<string, Hit>,
  scale: PaintScale | null,
  format: ScaleFormat,
  choropleth: boolean,
  rows: Record<string, unknown>[],
  tips: string[],
  skip: Set<string>,
): string {
  return regions
    .map((region) => {
      const hit = hits.get(region.id);
      const fill = hit && scale ? scale.fill(hit.value) : "";
      const shown = hit ? formatNumber(hit.value, format) : choropleth ? "no data" : region.name;
      const base = choropleth ? `${region.name}, ${shown}` : region.name;
      const extra = hit ? tooltipExtra(rows[hit.index] ?? {}, tips, skip) : "";
      const label = extra ? `${base}, ${extra}` : base;
      const cls = choropleth && !hit ? "ck-geo-region ck-geo-nodata" : "ck-geo-region";
      const painted = fill ? ` fill="${fill}"` : "";
      const value = hit ? ` data-ck-value="${hit.value}" data-ck-i="${hit.index}"` : ` data-ck-i="-1"`;
      const tail = `${painted}${value} data-ck-id="${esc(region.id)}" data-ck-name="${esc(region.name)}" tabindex="0" aria-label="${esc(label)}"><title>${esc(label)}</title>`;
      if (region.point && !region.polygons.length) {
        if (!hit) return "";
        const [x, y] = project(region.id, region.point[0], region.point[1]);
        return `<circle class="${cls}" cx="${round(x)}" cy="${round(y)}" r="3"${tail}</circle>`;
      }
      const d = pathFor(region, project);
      if (!d) return "";
      return `<path class="${cls}" d="${d}" fill-rule="evenodd"${tail}</path>`;
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
  detail: string;
}

interface Channel {
  field: string | null;
  format: ScaleFormat;
  title: string;
  range?: readonly string[];
}

function channelOf(value: unknown): Channel {
  if (typeof value === "string" && value) return { field: value, format: {}, title: "" };
  if (isRecord(value)) {
    return {
      field: typeof value.field === "string" && value.field ? value.field : null,
      format: parseFormat(value.format),
      title: typeof value.title === "string" ? value.title : "",
      range: hexRange(value.range),
    };
  }
  return { field: null, format: {}, title: "" };
}

function dotsOf(rows: Record<string, unknown>[], encoding: Record<string, unknown>, chrome: Chrome, tips: string[]): { dots: Dot[]; scale: PaintScale | null } {
  const latField = fieldName(encoding.latitude);
  const lonField = fieldName(encoding.longitude);
  const sizeChannel = channelOf(encoding.size);
  const colorChannel = channelOf(encoding.color);
  const sizeField = sizeChannel.field;
  const colorField = colorChannel.field;
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
  const sameField = !!(sizeField && colorField && sizeField === colorField && numeric);
  const scale = !sameField && colorField && numeric && colorValues.length ? paintScale("sequential", colorValues, undefined, colorChannel.format, colorChannel.title, colorChannel.range) : null;
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
    const skip = new Set([latField, lonField, sizeField, colorField, labelField].filter((field): field is string => !!field));
    return { index: dot.index, lon: dot.lon, lat: dot.lat, size: dot.size, color, label: dot.label, value, detail: tooltipExtra(rows[dot.index] ?? {}, tips, skip) };
  });
  if (sameField) {
    const sizes = sizeStops(draft.map((dot) => dot.size), sizeChannel.format.suffix || sizeChannel.format.percent ? sizeChannel.format : colorChannel.format);
    return {
      dots: dots.map((dot) => ({ ...dot, color: chrome.accent })),
      scale: sizes.length
        ? { kind: "sequential", fill: () => chrome.accent, stops: [], swatches: null, title: sizeChannel.title || colorChannel.title, domain: [sizes[0]?.value ?? 0, sizes[sizes.length - 1]?.value ?? 1], sizes }
        : null,
    };
  }
  if (!scale && categories.size) {
    return {
      dots,
      scale: {
        kind: "threshold",
        fill: () => chrome.accent,
        stops: [],
        swatches: [...categories.entries()].map(([label, color]) => ({ label, color })),
        title: colorChannel.title,
        domain: [0, 1],
        sizes: null,
      },
    };
  }
  return { dots, scale };
}

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

interface TagSpot {
  tx: number;
  ty: number;
  anchor: "start" | "middle" | "end";
  box: { x: number; y: number; w: number; h: number };
  leader: string;
}

function pointMarkup(dots: Dot[], point: (lon: number, lat: number) => [number, number], labelCount: number, frame: Box): string {
  if (!dots.length) return "";
  const sizes = dots.map((dot) => dot.size);
  const lo = Math.min(...sizes);
  const hi = Math.max(...sizes);
  const span = Math.max(hi - lo, 1e-9);
  const painted = [...dots].sort((a, b) => b.size - a.size);
  const circles: { x: number; y: number; r: number; dot: Dot }[] = [];
  let marks = "";
  for (const dot of painted) {
    const [x, y] = point(dot.lon, dot.lat);
    const t = (dot.size - lo) / span;
    const radius = 3.5 + Math.sqrt(Math.max(0, t)) * 16;
    const name = dot.label || `${dot.lat}, ${dot.lon}`;
    const text = [dot.value == null ? name : `${name}, ${dot.value}`, dot.detail].filter(Boolean).join(", ");
    circles.push({ x, y, r: radius, dot });
    marks += `<circle class="ck-geo-point" cx="${round(x)}" cy="${round(y)}" r="${round(radius)}" fill="${dot.color}" data-ck-i="${dot.index}" data-ck-id="${dot.index}" data-ck-name="${esc(name)}"${dot.value == null ? "" : ` data-ck-value="${dot.value}"`} tabindex="0" aria-label="${esc(text)}"><title>${esc(text)}</title></circle>`;
  }
  const ranked = [...circles].sort((a, b) => b.r - a.r).slice(0, labelCount);
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  const bubbleBoxes = circles.map((circle) => ({ x: circle.x - circle.r, y: circle.y - circle.r, w: circle.r * 2, h: circle.r * 2 }));
  const labels: string[] = [];
  const leaders: string[] = [];
  for (const circle of ranked) {
    if (!circle.dot.label) continue;
    const width = measureText(circle.dot.label, 11) + 4;
    const spot = placeTag(circle, width, frame, bubbleBoxes, circles, placed);
    if (!spot) continue;
    placed.push(spot.box);
    if (spot.leader) leaders.push(spot.leader);
    labels.push(`<text class="ck-geo-tag" x="${round(spot.tx)}" y="${round(spot.ty)}" text-anchor="${spot.anchor}">${esc(circle.dot.label)}</text>`);
  }
  return marks + leaders.join("") + labels.join("");
}

function placeTag(
  circle: { x: number; y: number; r: number },
  width: number,
  frame: Box,
  bubbles: { x: number; y: number; w: number; h: number }[],
  circles: { x: number; y: number; r: number }[],
  placed: { x: number; y: number; w: number; h: number }[],
): TagSpot | null {
  const height = 13;
  const dirs = [
    { dx: 0, dy: -1, anchor: "middle" as const },
    { dx: 1, dy: -0.35, anchor: "start" as const },
    { dx: -1, dy: -0.35, anchor: "end" as const },
    { dx: 1, dy: 0.55, anchor: "start" as const },
    { dx: -1, dy: 0.55, anchor: "end" as const },
    { dx: 0, dy: 1, anchor: "middle" as const },
    { dx: 0.7, dy: -1, anchor: "start" as const },
    { dx: -0.7, dy: -1, anchor: "end" as const },
  ];
  for (const dist of [circle.r + 8, circle.r + 24, circle.r + 42, circle.r + 64]) {
    for (const dir of dirs) {
      const cx = circle.x + dir.dx * dist;
      const cy = circle.y + dir.dy * dist;
      const x = dir.anchor === "middle" ? cx - width / 2 : dir.anchor === "end" ? cx - width : cx;
      const y = cy - height / 2;
      const box = { x, y, w: width, h: height };
      if (box.x < frame.x + 2 || box.y < frame.y + 2 || box.x + box.w > frame.x + frame.w - 2 || box.y + box.h > frame.y + frame.h - 2) continue;
      const hitBubble = bubbles.some((item, index) => circles[index] !== circle && overlaps(box, item));
      if (hitBubble || overlaps(box, { x: circle.x - circle.r, y: circle.y - circle.r, w: circle.r * 2, h: circle.r * 2 }) || placed.some((item) => overlaps(box, item))) continue;
      const leader = dist > circle.r + 14 ? leaderOf(circle, box) : "";
      return { tx: cx, ty: y + 11, anchor: dir.anchor, box, leader };
    }
  }
  return null;
}

function leaderOf(circle: { x: number; y: number; r: number }, box: { x: number; y: number; w: number; h: number }): string {
  const tx = box.x + box.w / 2;
  const ty = box.y + box.h / 2;
  const dx = tx - circle.x;
  const dy = ty - circle.y;
  const len = Math.hypot(dx, dy) || 1;
  const x1 = circle.x + (dx / len) * (circle.r + 1);
  const y1 = circle.y + (dy / len) * (circle.r + 1);
  const x2 = tx - (dx / len) * (box.w / 2 + 2);
  const y2 = ty - (dy / len) * (box.h / 2 + 2);
  return `<line class="ck-geo-leader" x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}"/>`;
}

export async function render(spec: unknown): Promise<string> {
  if (!isRecord(spec)) {
    const chrome = chromeFor("soft");
    return shell({ type: "choropleth", a11y: { alt: "Map" } }, chrome, `<defs>${patternDef(chrome, "ckg")}</defs><text class="ck-geo-title" x="16" y="32" font-size="16">Expected type choropleth or map-points.</text>`);
  }
  const chartKind = mapKind(spec.type);
  if (!chartKind) {
    const chrome = chromeFor(spec.theme);
    return shell(spec, chrome, `<defs>${patternDef(chrome, "ckg")}</defs><text class="ck-geo-title" x="16" y="32" font-size="16">Expected type choropleth or map-points.</text>`);
  }
  if (spec.type !== chartKind) return render({ ...spec, type: chartKind });
  const mark = resolveMark(spec);
  const chrome = paintChrome(chromeFor(spec.theme), mark);
  const { width, height } = sizeOf(spec);
  const encoding = resolveEncoding(spec);
  const loaded = await load(mark);
  const title = typeof spec.title === "string" ? spec.title : "";
  const laid = title ? titleLayout(title, width) : null;
  const titleH = laid ? laid.band : 12;
  const rows = rowsOf(spec);
  const regionChannel = channelOf(encoding.region);
  const colorChannel = channelOf(encoding.color);
  const regionField = regionChannel.field ?? fieldName(encoding.x);
  const valueField = colorChannel.field ?? fieldName(encoding.y);
  const legendTitle = colorChannel.title || (isRecord(mark.legend) && typeof mark.legend.title === "string" ? mark.legend.title : "");
  const hits = spec.type === "choropleth" ? regionHits(rows, regionField, valueField, loaded.atlas, loaded.entries) : new Map<string, Hit>();
  const kind: ColorScaleName = mark.scale === "diverging" || mark.scale === "threshold" ? mark.scale : "sequential";
  const thresholds = Array.isArray(mark.thresholds) ? mark.thresholds.filter((item): item is number => typeof item === "number") : undefined;
  const choroplethScale = spec.type === "choropleth" && hits.size ? paintScale(kind, [...hits.values()].map((hit) => hit.value), thresholds, colorChannel.format, legendTitle, kind === "sequential" ? colorChannel.range : undefined, kind === "diverging" && chrome.scheme === "" ? SOFT_DIVERGING : undefined) : null;
  const tips = tooltipColumns(spec);
  const points = dotsOf(rows, encoding, chrome, tips);
  const scale = choroplethScale ?? points.scale;
  const showLegend = mark.legend !== false && !!scale && (scale.stops.length > 0 || !!scale.swatches?.length || !!scale.sizes?.length);
  const bottomLegend = showLegend && scale ? legendSide(spec) === "bottom" : false;
  const legendW = showLegend && scale && !bottomLegend ? legendWidth(scale) : 12;
  const legendH = bottomLegend ? 40 : 0;
  const box: Box = { x: 8, y: titleH, w: width - 16 - legendW, h: height - titleH - 10 - legendH };
  const explicit = typeof mark.projection === "string" ? mark.projection : "";
  const known = ["equirectangular", "mercator", "equalEarth", "albersUsa", "fit"];
  const projection = known.includes(explicit) ? explicit : defaultProjection(loaded.atlas);
  const drawn = loaded.regions.length ? projectorFor(projection, loaded.regions, box) : null;
  const id = `ckg${hash(`${title}:${String(spec.type)}:${loaded.atlas}`)}`;
  const titleText = title && laid ? `<text class="ck-geo-title" x="12" y="${laid.y}" font-size="${laid.size}">${esc(title)}</text>` : "";
  if (!loaded.regions.length) {
    const body = `<defs>${patternDef(chrome, id)}</defs>${titleText}<text class="ck-geo-title" x="16" y="${titleH + 28}" font-size="16">Unknown atlas.</text>`;
    return shell(spec, chrome, body, id);
  }
  const nodataMode: "hatch" | "fill" | "off" = spec.type !== "choropleth" ? "off" : mark.nodata === "fill" ? "fill" : "hatch";
  let body = `<defs>${nodataMode === "hatch" ? patternDef(chrome, id) : ""}<clipPath id="${id}c"><rect x="${round(box.x)}" y="${round(box.y)}" width="${round(box.w)}" height="${round(box.h)}"/></clipPath></defs>${titleText}`;
  body += `<g clip-path="url(#${id}c)">`;
  if (drawn?.grid) body += graticule(drawn.point);
  if (drawn) {
    for (const frame of drawn.frames) body += `<rect class="ck-geo-inset" x="${round(frame.x)}" y="${round(frame.y)}" width="${round(frame.w)}" height="${round(frame.h)}"/>`;
    const skip = new Set([regionField, valueField].filter((field): field is string => !!field));
    body += regionMarkup(loaded.regions, drawn.project, hits, choroplethScale, colorChannel.format, spec.type === "choropleth", rows, tips, skip);
  }
  if (drawn && points.dots.length) body += pointMarkup(points.dots, drawn.point, num(mark.labelCount) ?? 12, box);
  body += `</g>`;
  if (showLegend && scale) {
    body += bottomLegend
      ? horizontalLegend(scale, box.x, box.y + box.h + 6, box.w, id)
      : legendMarkup(scale, box.x + box.w + 8, box.y, box.h, id, nodataMode === "hatch");
  }
  return shell(spec, chrome, body, id, nodataMode);
}

function paintChrome(chrome: Chrome, mark: Record<string, unknown>): Chrome {
  const hex = (value: unknown) => (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "");
  const land = hex(mark.land);
  const water = hex(mark.water);
  if (!land && !water) return chrome;
  return { ...chrome, ...(land ? { land } : {}), ...(water ? { water } : {}) };
}
