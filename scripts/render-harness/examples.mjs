/**
 * Base specs: docs examples in packages/core/examples, gallery examples in
 * catalog/lib/specs.ts, and the geo samples the gallery draws.
 * Identical specs collapse to one case list. Docs win the slug when both exist.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { examplesDir } from "./paths.mjs";

export function loadExamples(runtime) {
  const rows = [];
  for (const name of readdirSync(examplesDir).sort()) {
    if (!name.endsWith(".json")) continue;
    const spec = JSON.parse(readFileSync(join(examplesDir, name), "utf8"));
    if (!spec || typeof spec.type !== "string") continue;
    rows.push({
      slug: typeof spec.id === "string" && spec.id ? spec.id : name.replace(/\.json$/, ""),
      type: spec.type,
      spec,
      source: "docs",
      file: `packages/core/examples/${name}`,
    });
  }
  for (const example of runtime.galleryExamples ?? []) {
    const spec = example?.spec;
    if (!spec || typeof spec.type !== "string") continue;
    rows.push({
      slug: example.slug || spec.id || spec.type,
      type: spec.type,
      spec,
      source: "gallery",
      file: "catalog/lib/specs.ts",
    });
  }
  const geo = [
    ["world-renewable", runtime.worldSpec],
    ["us-population", runtime.usSpec],
    ["city-points", runtime.citySpec],
  ];
  for (const [slug, spec] of geo) {
    if (!spec || typeof spec.type !== "string") continue;
    rows.push({
      slug: spec.id || slug,
      type: spec.type,
      spec,
      source: "gallery",
      file: "catalog/lib/geo-samples.ts",
    });
  }
  return dedupe(rows);
}

function dedupe(rows) {
  const byPrint = new Map();
  for (const row of rows) {
    const print = fingerprint(row.spec);
    const prev = byPrint.get(print);
    if (!prev) {
      byPrint.set(print, { ...row, also: [] });
      continue;
    }
    prev.also.push(`${row.source}:${row.slug}`);
    if (prev.source !== "docs" && row.source === "docs") {
      prev.slug = row.slug;
      prev.source = row.source;
      prev.file = row.file;
    }
  }
  return [...byPrint.values()].sort((a, b) => (a.type === b.type ? a.slug.localeCompare(b.slug) : a.type.localeCompare(b.type)));
}

function fingerprint(spec) {
  const clone = structuredClone(spec);
  delete clone.id;
  return JSON.stringify(clone);
}

/** Docs example when the type has one, otherwise the first gallery spec. */
export function primarySlug(examples) {
  const byType = new Map();
  for (const example of examples) {
    const list = byType.get(example.type) ?? [];
    list.push(example);
    byType.set(example.type, list);
  }
  const out = new Map();
  for (const [type, list] of byType) {
    const docs = list.filter((item) => item.source === "docs");
    const pool = docs.length ? docs : list;
    const titled = pool.find((item) => typeof item.spec.title === "string" && item.spec.title);
    out.set(type, (titled ?? pool[0]).slug);
  }
  return out;
}
