/**
 * Deterministic option sweep.
 *
 * Every gallery and docs example is a base. The full sweep varies one option
 * at a time on every example. The fast subset varies key options, and the
 * curated pairs, on the primary example only, and renders every other example
 * at its spec. Enums take every value, booleans both, numbers
 * min/default/max/0/a very large edge, strings empty and long.
 * The list is sorted, never shuffled.
 * SEED is recorded so a later sampler can draw a subset of the same ids.
 */
import { readFileSync } from "node:fs";
import { SEED, statusPath } from "./paths.mjs";
import { FAST_VALUES, LONG, PAIRS } from "./pairs.mjs";
import { primarySlug } from "./examples.mjs";

export { SEED };

const VERY_LARGE = 1_000_000;

const SKIP_PATHS = new Set(["type"]);

export function loadStatus() {
  return JSON.parse(readFileSync(statusPath, "utf8"));
}

export function buildCases(runtime, examples, { mode = "full" } = {}) {
  const status = loadStatus();
  const primary = primarySlug(examples);
  const fields = runtime.optionCatalog;
  const byPath = new Map(fields.map((field) => [field.path, field]));
  const cases = [];
  for (const example of examples) {
    const isPrimary = primary.get(example.type) === example.slug;
    cases.push(baseCase(example, "default", "", null, example.spec, "render"));
    if (mode === "fast" && !isPrimary) continue;
    if (!isPrimary && mode === "full") {
      // Other examples still get the one-at-a-time sweep. Fast mode keeps
      // them at the spec they ship, which is the picture the docs show.
    }
    const applicable = fields.filter((field) => applies(field, example.type) && !runtime.optionBlocked(example.spec, field.path));
    for (const field of applicable) {
      const effect = status[example.type]?.[field.path]?.status ?? "works";
      if (effect === "not-yet") {
        cases.push(noteCase(example, field.path, null, "not-yet", "Not yet supported"));
        continue;
      }
      if (effect === "needs-data") {
        cases.push(noteCase(example, field.path, null, "needs-data", "Example data does not exercise this option"));
        continue;
      }
      if (SKIP_PATHS.has(field.path)) {
        cases.push(noteCase(example, field.path, null, "unsampled", "type selects the chart and is not varied inside one type"));
        continue;
      }
      if (field.control === "json") {
        cases.push(noteCase(example, field.path, null, "unsampled", "JSON control has no discrete values"));
        continue;
      }
      if (runtime.optionBlocked(example.spec, field.path)) {
        cases.push(noteCase(example, field.path, null, "blocked", "An ancestor is an array, so the nested control does not apply"));
        continue;
      }
      const values = mode === "fast" ? fastValues(field) : valuesFor(field);
      if (!values) continue;
      if (mode === "fast" && !Object.hasOwn(FAST_VALUES, field.path)) continue;
      for (const value of values) {
        const spec = runtime.writeOption(example.spec, field, value);
        if (same(spec, example.spec)) continue;
        cases.push(baseCase(example, "option", field.path, value, spec, "render"));
      }
    }
    if (!isPrimary) continue;
    for (const pair of PAIRS) {
      const built = pairCases(runtime, example, pair, byPath, status);
      cases.push(...built);
    }
  }
  cases.sort(compareCases);
  return { seed: SEED, mode, primary: Object.fromEntries(primary), cases };
}

function fastValues(field) {
  if (!Object.hasOwn(FAST_VALUES, field.path)) return null;
  return FAST_VALUES[field.path];
}

export function valuesFor(field) {
  if (field.control === "boolean" || field.storage === "union-boolean") return [true, false];
  if (field.control === "enum" && field.enumValues?.length) return [...field.enumValues];
  if (field.control === "number") return numberValues(field);
  if (field.control === "color") return ["", "#111111", "#f5f5f7"];
  if (field.control === "text") return textValues(field);
  return null;
}

function textValues(field) {
  if (field.path === "size.width" || field.path === "size.height") return ["", LONG, "0", "240", "1200", "10000"];
  return ["", LONG];
}

function numberValues(field) {
  const min = typeof field.minimum === "number" ? field.minimum : 0;
  const max = typeof field.maximum === "number" ? field.maximum : VERY_LARGE;
  const values = [min, max, 0, VERY_LARGE];
  if (typeof field.defaultValue === "number") values.push(field.defaultValue);
  if (typeof field.maximum === "number" && field.maximum < VERY_LARGE) values.push(VERY_LARGE);
  const unique = [];
  for (const value of values) {
    const next = field.coerce === "integer" ? Math.round(value) : value;
    if (!unique.includes(next)) unique.push(next);
  }
  return unique;
}

function pairCases(runtime, example, pair, byPath, status) {
  const out = [];
  const [left, right] = pair.axes;
  const leftField = byPath.get(left.path);
  const rightField = byPath.get(right.path);
  if (!leftField || !rightField) return out;
  if (!applies(leftField, example.type) || !applies(rightField, example.type)) return out;
  const leftEffect = status[example.type]?.[left.path]?.status ?? "works";
  const rightEffect = status[example.type]?.[right.path]?.status ?? "works";
  if (leftEffect === "not-yet" || rightEffect === "not-yet") {
    out.push(noteCase(example, `${left.path}×${right.path}`, null, "not-yet", `${pair.id}: Not yet supported`));
    return out;
  }
  if (leftEffect === "needs-data" || rightEffect === "needs-data") {
    out.push(noteCase(example, `${left.path}×${right.path}`, null, "needs-data", `${pair.id}: example data does not exercise the pair`));
    return out;
  }
  for (const a of left.values) {
    for (const b of right.values) {
      let spec = runtime.writeOption(example.spec, leftField, a);
      const extra = left.with?.[a] ?? left.with?.[String(a)];
      if (extra) {
        const extraField = byPath.get(extra.path);
        if (extraField) spec = runtime.writeOption(spec, extraField, extra.value);
      }
      spec = runtime.writeOption(spec, rightField, b);
      if (same(spec, example.spec)) continue;
      const option = `${left.path}×${right.path}`;
      const value = { [left.path]: a, [right.path]: b };
      if (extra) value[extra.path] = extra.value;
      const row = baseCase(example, "pair", option, value, spec, "render");
      row.pair = pair.id;
      out.push(row);
    }
  }
  return out;
}

function applies(field, type) {
  return !field.appliesTo || field.appliesTo.includes(type);
}

function baseCase(example, kind, option, value, spec, status) {
  return {
    id: caseId(example.type, example.slug, option, value),
    type: example.type,
    example: example.slug,
    source: example.source,
    kind,
    option,
    value,
    spec,
    status,
    detail: "",
  };
}

function noteCase(example, option, value, status, detail) {
  const row = baseCase(example, "note", option, value, null, status);
  row.detail = detail;
  return row;
}

export function caseId(type, example, option, value) {
  const raw = `${type}|${example}|${option}|${stable(value)}`;
  if (raw.length <= 180) return raw;
  return `${raw.slice(0, 140)}|${fnv(raw)}`;
}

export function stable(value) {
  if (value === undefined) return "null";
  return JSON.stringify(value);
}

export function fnv(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function compareCases(a, b) {
  return (
    a.type.localeCompare(b.type) ||
    a.example.localeCompare(b.example) ||
    kindRank(a.kind) - kindRank(b.kind) ||
    a.option.localeCompare(b.option) ||
    stable(a.value).localeCompare(stable(b.value))
  );
}

function kindRank(kind) {
  if (kind === "default") return 0;
  if (kind === "option") return 1;
  if (kind === "pair") return 2;
  return 3;
}
