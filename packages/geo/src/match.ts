import directory from "./data/directory.json";
import type { AtlasName } from "./types";

export interface DirectoryEntry {
  id: string;
  name: string;
  aliases: string[];
}

const books = directory as Record<string, DirectoryEntry[]>;

export function atlasDirectory(atlas: string): DirectoryEntry[] {
  return books[atlas] ?? [];
}

export function normKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function squeeze(value: string): string {
  return normKey(value).replace(/ /g, "");
}

interface Index {
  byKey: Map<string, string>;
  entries: DirectoryEntry[];
}

const indexes = new Map<string, Index>();

function indexOf(entries: DirectoryEntry[]): Index {
  const byKey = new Map<string, string>();
  for (const entry of entries) {
    for (const alias of [entry.id, entry.name, ...entry.aliases]) {
      if (!alias) continue;
      const spaced = normKey(alias);
      const tight = squeeze(alias);
      if (spaced && !byKey.has(spaced)) byKey.set(spaced, entry.id);
      if (tight && !byKey.has(tight)) byKey.set(tight, entry.id);
    }
  }
  return { byKey, entries };
}

export function directoryIndex(atlas: AtlasName | string, extra?: DirectoryEntry[]): Index {
  if (extra) return indexOf(extra);
  const cached = indexes.get(atlas);
  if (cached) return cached;
  const built = indexOf(atlasDirectory(atlas));
  indexes.set(atlas, built);
  return built;
}

export function matchRegion(index: Index, raw: string): string | null {
  const spaced = normKey(raw);
  const tight = squeeze(raw);
  return index.byKey.get(spaced) ?? index.byKey.get(tight) ?? null;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > 12) return 99;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      next[j] = Math.min((prev[j] ?? 99) + 1, (next[j - 1] ?? 99) + 1, (prev[j - 1] ?? 99) + cost);
    }
    prev = next;
  }
  return prev[b.length] ?? 99;
}

export function suggestRegion(index: Index, raw: string): { id: string; name: string; distance: number } | null {
  const needle = squeeze(raw);
  if (!needle) return null;
  let best: { id: string; name: string; distance: number } | null = null;
  for (const entry of index.entries) {
    for (const alias of [entry.id, entry.name, ...entry.aliases]) {
      if (!alias) continue;
      const distance = levenshtein(needle, squeeze(alias));
      if (!best || distance < best.distance) best = { id: entry.id, name: entry.name, distance };
    }
  }
  return best;
}

const ATLAS_WORDS = ["world", "us", "canada", "eu"];

export function suggestAtlas(raw: string): { name: string; distance: number } {
  const needle = squeeze(raw || "world");
  let best = { name: "world", distance: 99 };
  for (const name of ATLAS_WORDS) {
    const distance = levenshtein(needle, name);
    if (distance < best.distance) best = { name, distance };
  }
  return best;
}
