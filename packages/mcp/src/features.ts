import { readData } from "./paths.js";

/** One cell from the published matrix. Status strings are the file's, not ours. */
interface MatrixCell {
  status?: string;
  tier?: string | null;
  apiPaths?: string[];
  verified?: string;
  strength?: string;
  note?: string;
  assessed?: string;
}

interface MatrixFeature {
  id: string;
  category: string;
  label: string;
  desc: string;
  spec: Record<string, unknown> | null;
  cells: Record<string, MatrixCell>;
}

interface MatrixLibrary {
  id: string;
  name: string;
}

interface MatrixFile {
  generated?: string;
  dateChecked?: string;
  chartkitRechecked?: string;
  methodology?: string;
  libraries: MatrixLibrary[];
  features: MatrixFeature[];
  synonyms: Record<string, string[]>;
}

export interface LibraryHit {
  id: string;
  name: string;
  status: string;
  apiPaths: string[];
  note?: string;
  verified?: string;
  assessed?: string;
}

export interface FeatureHit {
  id: string;
  label: string;
  category: string;
  desc: string;
  matched: "id" | "synonym" | "label" | "text";
  chartkit: LibraryHit;
  spec: Record<string, unknown> | null;
  docsUrl: string;
  libraries: LibraryHit[];
}

export interface LookupResult {
  source: "features.json";
  generated?: string;
  dateChecked?: string;
  chartkitRechecked?: string;
  methodology?: string;
  query: string;
  matches: FeatureHit[];
}

const STOP = new Set(["a", "an", "the", "of", "to", "and", "or", "for", "on", "in", "with", "per"]);

const STATUS_ORDER = ["native", "partial", "plugin", "manual", "none", "unknown"];

let cached: MatrixFile | null = null;
let synonymsLower: Map<string, string[]> | null = null;

function matrix(): MatrixFile {
  if (!cached) cached = JSON.parse(readData("features.json")) as MatrixFile;
  return cached;
}

function synonymsByLower(): Map<string, string[]> {
  if (synonymsLower) return synonymsLower;
  const map = new Map<string, string[]>();
  for (const [key, ids] of Object.entries(matrix().synonyms)) {
    const lower = key.toLowerCase();
    map.set(lower, uniqueIds([...(map.get(lower) ?? []), ...ids]));
  }
  synonymsLower = map;
  return map;
}

function canonToken(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower === "axes" || lower === "axis" || lower === "axe") return "axis";
  if (lower === "colour" || lower === "colours" || lower === "color" || lower === "colors") return "color";
  if (lower === "labelling" || lower === "labeling") return "label";
  if (lower.length > 4 && lower.endsWith("s") && !lower.endsWith("ss")) return lower.slice(0, -1);
  return lower;
}

function tokens(value: string): string[] {
  const out: string[] = [];
  for (const part of value.toLowerCase().split(/[^a-z0-9]+/)) {
    if (!part) continue;
    const token = canonToken(part);
    if (token.length < 2 || STOP.has(token)) continue;
    out.push(token);
  }
  return out;
}

function similar(a: string, b: string): boolean {
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return shorter.length >= 4 && longer.startsWith(shorter);
}

function covers(needles: string[], haystack: string[]): boolean {
  return needles.every((needle) => haystack.some((token) => similar(needle, token)));
}

function defined<T extends Record<string, unknown>>(value: T): T {
  const out = {} as Record<string, unknown>;
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) out[key] = item;
  }
  return out as T;
}

function libraryName(id: string, names: Map<string, string>): string {
  return names.get(id) ?? id;
}

function toHit(id: string, name: string, cell: MatrixCell | undefined): LibraryHit {
  return defined({
    id,
    name,
    status: cell?.status ?? "unknown",
    apiPaths: cell?.apiPaths ?? [],
    note: cell?.note,
    verified: cell?.verified,
    assessed: cell?.assessed,
  });
}

function toFeature(feature: MatrixFeature, matched: FeatureHit["matched"], names: Map<string, string>): FeatureHit {
  const libraries = Object.keys(feature.cells)
    .filter((id) => id !== "chartkit")
    .map((id) => toHit(id, libraryName(id, names), feature.cells[id]))
    .sort((a, b) => statusRank(a.status) - statusRank(b.status) || a.name.localeCompare(b.name));
  return {
    id: feature.id,
    label: feature.label,
    category: feature.category,
    desc: feature.desc,
    matched,
    chartkit: toHit("chartkit", libraryName("chartkit", names), feature.cells.chartkit),
    spec: feature.spec ?? null,
    docsUrl: `https://chartkit.dev/features/${feature.id}`,
    libraries,
  };
}

function meta(query: string, matches: FeatureHit[]): LookupResult {
  const file = matrix();
  return defined({
    source: "features.json" as const,
    generated: file.generated,
    dateChecked: file.dateChecked,
    chartkitRechecked: file.chartkitRechecked,
    methodology: file.methodology,
    query,
    matches,
  });
}

/**
 * Search the bundled features.json. Statuses, snippets, and notes are copied
 * from that file. partial is not reported as native.
 */
export function lookupFeature(query: string): LookupResult {
  const file = matrix();
  const names = new Map(file.libraries.map((library) => [library.id, library.name]));
  const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return meta(query, []);

  const byId = new Map(file.features.map((feature) => [feature.id, feature]));
  const exact = byId.get(normalized) ?? byId.get(query.trim());
  if (exact) return meta(query, [toFeature(exact, "id", names)]);

  const synonymIds = synonymsByLower().get(normalized);
  if (synonymIds?.length) {
    const features = uniqueIds(synonymIds)
      .map((id) => byId.get(id))
      .filter((feature): feature is MatrixFeature => Boolean(feature))
      .sort((a, b) => synonymRank(a, normalized) - synonymRank(b, normalized) || a.id.localeCompare(b.id))
      .slice(0, 8);
    if (features.length) return meta(query, features.map((feature) => toFeature(feature, "synonym", names)));
  }

  const labelHits = file.features.filter((feature) => feature.label.toLowerCase() === normalized);
  if (labelHits.length) return meta(query, labelHits.map((feature) => toFeature(feature, "label", names)));

  const queryTokens = tokens(normalized);
  if (queryTokens.length === 0) return meta(query, []);

  const synonymScore = new Map<string, number>();
  for (const [key, ids] of Object.entries(file.synonyms)) {
    const keyTokens = tokens(key);
    if (!covers(queryTokens, keyTokens)) continue;
    const score = key.toLowerCase() === normalized ? 800 : 450;
    for (const id of ids) synonymScore.set(id, Math.max(synonymScore.get(id) ?? 0, score));
  }

  const ranked = file.features
    .map((feature) => {
      const featureTokens = tokens(`${feature.label} ${feature.id.replaceAll(".", " ")} ${feature.desc}`);
      const labelTokens = tokens(feature.label);
      let score = synonymScore.get(feature.id) ?? 0;
      if (covers(queryTokens, labelTokens)) score += 500 + queryTokens.length * 10;
      else if (covers(queryTokens, featureTokens)) score += 220;
      else {
        const overlap = queryTokens.filter((token) => featureTokens.some((item) => similar(token, item))).length;
        score += overlap * 40;
      }
      return { feature, score };
    })
    .filter((item) => item.score >= 200)
    .sort((a, b) => b.score - a.score || a.feature.id.localeCompare(b.feature.id));

  const top = ranked[0]?.score ?? 0;
  const kept = ranked.filter((item) => item.score >= Math.max(200, top * 0.72)).slice(0, 5);
  return meta(query, kept.map((item) => toFeature(item.feature, "text", names)));
}

function statusRank(status: string): number {
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? STATUS_ORDER.length : index;
}

function uniqueIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function synonymRank(feature: MatrixFeature, query: string): number {
  if (feature.id === query || feature.id === `type.${query}`) return 0;
  if (feature.label.toLowerCase() === query) return 1;
  if (feature.id.endsWith(`.${query}`)) return 2;
  return 3;
}
