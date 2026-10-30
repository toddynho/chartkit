/**
 * Render every homepage chart type and refuse an empty or error SVG.
 * Geo topology loads here, the same way the hero loads it after a map is picked.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { heroCharts } from "../src/data/home-hero.ts";
import { HERO_TYPE_COUNT, heroExtra, heroTypes } from "../src/data/hero-catalog.ts";
import { paintSpec } from "../src/lib/chartkit.ts";
import { repoRoot } from "../src/lib/repo-root.ts";

const GEO = new Set(["choropleth", "map-points"]);

function drawn(spec: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...spec };
  delete copy.title;
  delete copy.subtitle;
  return copy;
}

function assertSvg(type: string, svg: string): void {
  if (!svg.includes("<svg") || svg.includes("ck-chart-error") || svg.includes("Unknown atlas")) {
    throw new Error(`${type} did not render a chart`);
  }
  if (!/<path\b|<rect\b|<circle\b|<polygon\b|<polyline\b/.test(svg)) {
    throw new Error(`${type} SVG has no drawn marks`);
  }
  if (svg.length < 200) throw new Error(`${type} SVG is too small (${svg.length} bytes)`);
}

const schema = JSON.parse(readFileSync(join(repoRoot(), "packages/core/schema/chartkit.schema.json"), "utf8")) as {
  properties: { type: { enum: string[] } };
};
const deferred = ["gantt", "timeline", "quadrant", "venn", "journey", "choropleth", "map-points"];
const expected = [...schema.properties.type.enum, ...deferred].sort();
const actual = heroTypes.map((type) => type.type).sort();
if (expected.join() !== actual.join()) {
  const missing = expected.filter((type) => !actual.includes(type));
  const extra = actual.filter((type) => !expected.includes(type));
  throw new Error(`hero types drifted from schema + geo. missing ${missing.join(", ") || "none"}; extra ${extra.join(", ") || "none"}`);
}
if (actual.length !== HERO_TYPE_COUNT) throw new Error(`expected ${HERO_TYPE_COUNT} types, found ${actual.length}`);

const seen = new Set<string>();
for (const chart of heroCharts) {
  assertSvg(chart.id, chart.svg);
  seen.add(String(chart.spec.type));
}

for (const type of heroTypes) {
  if (type.slide) {
    if (!heroCharts.some((chart) => chart.id === type.slide)) throw new Error(`${type.type} points at a missing slide ${type.slide}`);
    continue;
  }
  const extra = heroExtra[type.type];
  if (!extra) throw new Error(`missing spec for ${type.type}`);
  if (GEO.has(type.type)) continue;
  const result = paintSpec(drawn(extra.spec));
  if (!result.ok) {
    throw new Error(`${type.type} failed validate: ${result.footer} ${result.issues.map((issue) => issue.message).join("; ")}`);
  }
  assertSvg(type.type, result.svg);
  seen.add(type.type);
}

const { render } = await import("@chartkitdev/geo");
for (const type of ["choropleth", "map-points"]) {
  const extra = heroExtra[type];
  if (!extra) throw new Error(`missing geo spec ${type}`);
  const svg = await render(drawn(extra.spec));
  assertSvg(type, svg);
  seen.add(type);
}

const uncovered = actual.filter((type) => !seen.has(type));
if (uncovered.length) throw new Error(`types not rendered: ${uncovered.join(", ")}`);

console.log(`hero types ok: ${actual.length} (schema ${schema.properties.type.enum.length} + deferred ${deferred.length})`);
