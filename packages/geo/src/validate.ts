import { suggestAtlas, suggestRegion, directoryIndex, matchRegion, type DirectoryEntry } from "./match";
import { regionsFromGeoJSON, regionsFromTopology } from "./topo";
import { ATLAS_NAMES, type AtlasName, type Diagnostic, type ValidationResult } from "./types";
import { fieldName, isRecord, mapKind, num, pointer, resolveEncoding, resolveMark, rowsOf } from "./spec";

function result(diagnostics: Diagnostic[]): ValidationResult {
  const errors = diagnostics.filter((item) => item.severity === "error");
  const warnings = diagnostics.filter((item) => item.severity === "warning");
  return { ok: errors.length === 0, diagnostics, errors, warnings };
}

function inlineEntries(mark: Record<string, unknown>): DirectoryEntry[] | null {
  if (isRecord(mark.geojson)) {
    return regionsFromGeoJSON(mark.geojson).map((region) => ({ id: region.id, name: region.name, aliases: [region.id, region.name] }));
  }
  if (isRecord(mark.topojson)) {
    return regionsFromTopology(mark.topojson).map((region) => ({ id: region.id, name: region.name, aliases: [region.id, region.name] }));
  }
  return null;
}

function stringFields(rows: Record<string, unknown>[]): string[] {
  const keys: string[] = [];
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "string" && value && !keys.includes(key)) keys.push(key);
    }
  }
  return keys;
}

function numericFields(rows: Record<string, unknown>[]): string[] {
  const keys: string[] = [];
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (num(value) != null && !keys.includes(key)) keys.push(key);
    }
  }
  return keys;
}

/**
 * A missing or distant atlas name follows the points or the region keys.
 * All-US cities suggest us. A close typo such as usa still wins on spelling.
 */
function suggestAtlasFor(
  atlas: string,
  type: unknown,
  rows: Record<string, unknown>[],
  encoding: Record<string, unknown>,
): { name: string; distance: number } {
  const textual = suggestAtlas(atlas || "world");
  const fromData = atlasFromData(type, rows, encoding);
  if (fromData && (!atlas || textual.distance > 2)) return { name: fromData, distance: 0 };
  return textual;
}

function atlasFromData(type: unknown, rows: Record<string, unknown>[], encoding: Record<string, unknown>): string | null {
  if (type === "map-points") return atlasFromPoints(rows, encoding);
  if (type === "choropleth") return atlasFromRegions(rows, fieldName(encoding.region) ?? fieldName(encoding.x));
  return null;
}

function atlasFromPoints(rows: Record<string, unknown>[], encoding: Record<string, unknown>): string | null {
  const latField = fieldName(encoding.latitude);
  const lonField = fieldName(encoding.longitude);
  if (!latField || !lonField) return null;
  const points: Array<[number, number]> = [];
  for (const row of rows) {
    const lat = num(row[latField]);
    const lon = num(row[lonField]);
    if (lat == null || lon == null) continue;
    points.push(Math.abs(lat) > 90 && Math.abs(lon) <= 90 ? [lon, lat] : [lat, lon]);
  }
  if (!points.length) return null;
  if (points.every(([lat, lon]) => inUs(lat, lon))) return "us";
  if (points.every(([lat, lon]) => inCanada(lat, lon))) return "canada";
  if (points.every(([lat, lon]) => inEu(lat, lon))) return "eu";
  return null;
}

function inUs(lat: number, lon: number): boolean {
  const continental = lat >= 24.5 && lat <= 49.4 && lon >= -125 && lon <= -66.5;
  const alaska = lat >= 51 && lat <= 71.5 && lon >= -170 && lon <= -129;
  const hawaii = lat >= 18.5 && lat <= 22.5 && lon >= -160.5 && lon <= -154.5;
  return continental || alaska || hawaii;
}

function inCanada(lat: number, lon: number): boolean {
  return lat >= 41.6 && lat <= 83 && lon >= -141 && lon <= -52 && !inUs(lat, lon);
}

function inEu(lat: number, lon: number): boolean {
  return lat >= 34 && lat <= 71.5 && lon >= -11 && lon <= 40 && !inUs(lat, lon);
}

function atlasFromRegions(rows: Record<string, unknown>[], field: string | null): string | null {
  if (!field) return null;
  const keys: string[] = [];
  for (const row of rows) {
    const raw = row[field];
    if (raw == null || raw === "") continue;
    const key = String(raw);
    if (!keys.includes(key)) keys.push(key);
  }
  if (!keys.length) return null;
  for (const name of ["us", "canada", "eu", "world"]) {
    const index = directoryIndex(name);
    if (keys.every((key) => matchRegion(index, key))) return name;
  }
  return null;
}

function column(rows: Record<string, unknown>[], field: string): number[] {
  const out: number[] = [];
  for (const row of rows) {
    const value = num(row[field]);
    if (value != null) out.push(value);
  }
  return out;
}

/**
 * Geo checks. These are warnings: the SVG still draws, and `fix` is a JSON Patch.
 * CK3050 unknown atlas. CK3051 unknown region. CK3052 lat/lon out of range.
 * CK3053 swapped lat/lon. CK3054 missing value field. CK3055 missing lat/lon fields.
 * CK3056 missing region field.
 */
export function validate(spec: unknown): ValidationResult {
  if (!isRecord(spec)) return result([]);
  const kind = mapKind(spec.type);
  if (!kind) return result([]);
  if (spec.type !== kind) return validate({ ...spec, type: kind });
  const type = kind;
  const diagnostics: Diagnostic[] = [];
  const mark = resolveMark(spec);
  const encoding = resolveEncoding(spec);
  const rows = rowsOf(spec);
  const atlas = typeof mark.atlas === "string" ? mark.atlas : "";
  const inline = inlineEntries(mark);
  const knownAtlas = (ATLAS_NAMES as readonly string[]).includes(atlas);

  if (!inline && !knownAtlas) {
    const suggestion = suggestAtlasFor(atlas, type, rows, encoding);
    const name = atlas || "missing";
    diagnostics.push({
      code: "CK3050",
      severity: "warning",
      message: `Unknown atlas "${name}". Did you mean ${suggestion.name}?`,
      path: "/mark/atlas",
      hint: "Built-in atlases are world, us, canada, and eu. Or pass mark.geojson / mark.topojson.",
      fix: [
        isRecord(spec.mark)
          ? { op: atlas ? "replace" : "add", path: "/mark/atlas", value: suggestion.name }
          : { op: "add", path: "/mark", value: { atlas: suggestion.name } },
      ],
    });
  }

  if (type === "choropleth") {
    const regionField = fieldName(encoding.region) ?? fieldName(encoding.x);
    const valueField = fieldName(encoding.color) ?? fieldName(encoding.y);
    if (!regionField) {
      const guess = stringFields(rows)[0];
      diagnostics.push({
        code: "CK3056",
        severity: "warning",
        message: "Choropleth is missing a region field.",
        path: "/encoding/region",
        hint: guess ? `The column "${guess}" looks like a region key.` : "Set encoding.region to the column of names or codes.",
        fix: guess
          ? [
              isRecord(spec.encoding)
                ? { op: "add", path: "/encoding/region", value: guess }
                : { op: "add", path: "/encoding", value: { region: guess } },
            ]
          : undefined,
      });
    }
    if (!valueField) {
      const guess = numericFields(rows).find((field) => field !== regionField);
      diagnostics.push({
        code: "CK3054",
        severity: "warning",
        message: "Choropleth is missing a value field.",
        path: "/encoding/color",
        hint: guess ? `The column "${guess}" is numeric.` : "Set encoding.color to the numeric column.",
        fix: guess
          ? [
              isRecord(spec.encoding)
                ? { op: "add", path: "/encoding/color", value: guess }
                : { op: "add", path: "/encoding", value: { color: guess, ...(regionField ? { region: regionField } : {}) } },
            ]
          : undefined,
      });
    }
    if (regionField && (knownAtlas || inline)) {
      const index = directoryIndex(knownAtlas ? (atlas as AtlasName) : "", inline ?? undefined);
      const groups = new Map<string, number[]>();
      rows.forEach((row, rowIndex) => {
        const raw = row[regionField];
        const key = raw == null ? "" : String(raw);
        if (!key || matchRegion(index, key)) return;
        const list = groups.get(key) ?? [];
        list.push(rowIndex);
        groups.set(key, list);
      });
      for (const [key, rowIndexes] of groups) {
        const suggestion = suggestRegion(index, key);
        const name = suggestion?.name ?? "a listed region";
        const fix =
          suggestion && suggestion.distance <= 2
            ? rowIndexes.map((rowIndex) => ({ op: "replace" as const, path: pointer(["data", rowIndex, regionField]), value: suggestion.id }))
            : undefined;
        diagnostics.push({
          code: "CK3051",
          severity: "warning",
          message: `Unknown region "${key}". Did you mean ${name}?`,
          path: pointer(["data", rowIndexes[0] ?? 0, regionField]),
          hint: suggestion ? `Nearest ${suggestion.id} (${suggestion.name}), ${rowIndexes.length} row${rowIndexes.length === 1 ? "" : "s"}.` : "The key is not in this atlas.",
          fix,
        });
      }
    }
  }

  if (type === "map-points") {
    const rawEncoding = isRecord(spec.encoding) ? spec.encoding : {};
    const latField = fieldName(encoding.latitude);
    const lonField = fieldName(encoding.longitude);
    const latPath = fieldName(rawEncoding.latitude) || !fieldName(rawEncoding.lat) ? "/encoding/latitude" : "/encoding/lat";
    const lonPath = fieldName(rawEncoding.longitude) || !fieldName(rawEncoding.lon) ? "/encoding/longitude" : "/encoding/lon";
    if (!latField || !lonField) {
      const numeric = numericFields(rows);
      const latitude = numeric.find((field) => /lat/i.test(field)) ?? numeric[0];
      const longitude = numeric.find((field) => /lon/i.test(field)) ?? numeric.find((field) => field !== latitude);
      diagnostics.push({
        code: "CK3055",
        severity: "warning",
        message: "Latitude and longitude fields are missing.",
        path: "/encoding/latitude",
        hint: "Set encoding.latitude to lat and encoding.longitude to lon.",
        fix:
          latitude && longitude
            ? [
                isRecord(spec.encoding)
                  ? { op: latField ? "replace" : "add", path: "/encoding/latitude", value: latitude }
                  : { op: "add", path: "/encoding", value: { latitude, longitude } },
                ...(isRecord(spec.encoding)
                  ? [{ op: (lonField ? "replace" : "add") as "replace" | "add", path: "/encoding/longitude", value: longitude }]
                  : []),
              ]
            : undefined,
      });
    } else if (rows.length) {
      const lats = column(rows, latField);
      const lons = column(rows, lonField);
      const latAsLon = lats.filter((value) => Math.abs(value) > 90 && Math.abs(value) <= 180).length / Math.max(1, lats.length);
      const lonAsLat = lons.filter((value) => Math.abs(value) <= 90).length / Math.max(1, lons.length);
      const swapped = lats.length >= 3 && lons.length >= 3 && latAsLon >= 0.6 && lonAsLat >= 0.6;
      if (swapped) {
        diagnostics.push({
          code: "CK3053",
          severity: "warning",
          message: "Latitude and longitude look swapped.",
          path: "/encoding/latitude",
          hint: `${latField} holds longitudes and ${lonField} holds latitudes.`,
          fix: [
            { op: "replace", path: latPath, value: lonField },
            { op: "replace", path: lonPath, value: latField },
          ],
        });
      } else {
        const bad: string[] = [];
        const fix: Diagnostic["fix"] = [];
        rows.forEach((row, rowIndex) => {
          const lat = num(row[latField]);
          const lon = num(row[lonField]);
          if (lat != null && Math.abs(lat) > 90) {
            bad.push(`latitude ${lat} on row ${rowIndex}`);
            fix.push({ op: "replace", path: pointer(["data", rowIndex, latField]), value: Math.max(-90, Math.min(90, lat)) });
          }
          if (lon != null && Math.abs(lon) > 180) {
            bad.push(`longitude ${lon} on row ${rowIndex}`);
            fix.push({ op: "replace", path: pointer(["data", rowIndex, lonField]), value: Math.max(-180, Math.min(180, lon)) });
          }
        });
        if (bad.length) {
          diagnostics.push({
            code: "CK3052",
            severity: "warning",
            message: `Latitude or longitude is out of range (${bad.length} values, first is ${bad[0]}).`,
            path: "/data",
            hint: "Latitude is −90 to 90 and longitude is −180 to 180.",
            fix,
          });
        }
      }
    }
  }

  return result(diagnostics);
}
