/**
 * Pages the sweep opens.
 * chartPageTypes is the same union docs-catalog exports: chart-types, chart docs,
 * the schema type enum, and DEFERRED_TYPES. Importing docs-catalog from Node
 * pulls JSON modules the site bundler accepts and Node does not.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const DESKTOP = { name: "desktop", width: 1440, height: 900 };
export const MOBILE = { name: "mobile", width: 390, height: 844 };
export const PLAYGROUND_TYPES = ["line", "bar", "donut", "progress-ring"];

export function repoRootFrom(here) {
  return join(here, "..", "..");
}

export function chartPageTypes(root) {
  const schema = JSON.parse(readFileSync(join(root, "packages/core/schema/chartkit.schema.json"), "utf8"));
  const schemaTypes = schema?.properties?.type?.enum;
  if (!Array.isArray(schemaTypes)) throw new Error("chartkit.schema.json has no type enum");

  const catalogSrc = readFileSync(join(root, "apps/web/src/data/docs-catalog.ts"), "utf8");
  const deferredBlock = catalogSrc.match(/const DEFERRED_TYPES = \[([\s\S]*?)\]/);
  if (!deferredBlock) throw new Error("docs-catalog.ts is missing DEFERRED_TYPES");
  const deferred = [...deferredBlock[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);

  const chartTypesSrc = readFileSync(join(root, "apps/web/src/data/chart-types.ts"), "utf8");
  const chartTypes = [...chartTypesSrc.matchAll(/type:\s*"([^"]+)"/g)].map((match) => match[1]);

  const charts = JSON.parse(readFileSync(join(root, "apps/web/src/data/mock-charts.json"), "utf8"));
  const chartDocs = charts.map((chart) => chart.type).filter((type) => typeof type === "string");

  return [...new Set([...chartTypes, ...chartDocs, ...schemaTypes, ...deferred])].sort((a, b) => a.localeCompare(b));
}

export function parseWidths(text) {
  return String(text)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((token) => {
      if (token === "default" || token === "380") return { px: 380, store: false };
      const px = Number(token);
      if (!Number.isInteger(px) || px < 200 || px > 2000) throw new Error(`Bad rail width ${token}`);
      return { px, store: px !== 380 };
    });
}

/**
 * Desktop docs pages vary the rail. Mobile stacks the rail, so it is one pass.
 * Homepage and compare are included unless --only names a chart type.
 */
export function planJobs({ types, only, widths, playgroundTypes = PLAYGROUND_TYPES }) {
  const wanted = only ? types.filter((type) => type === only) : types;
  if (only && !wanted.length) {
    throw new Error(`Unknown chart page "${only}". chartPageTypes does not include it.`);
  }
  const jobs = [];
  for (const type of wanted) {
    for (const rail of widths) {
      jobs.push({
        kind: "docs",
        type,
        path: `/docs/charts/${type}`,
        viewport: DESKTOP.name,
        width: DESKTOP.width,
        height: DESKTOP.height,
        rail,
      });
    }
    jobs.push({
      kind: "docs",
      type,
      path: `/docs/charts/${type}`,
      viewport: MOBILE.name,
      width: MOBILE.width,
      height: MOBILE.height,
      rail: null,
    });
  }
  if (!only) {
    for (const viewport of [DESKTOP, MOBILE]) {
      jobs.push({ kind: "home", type: null, path: "/", label: "home", viewport: viewport.name, width: viewport.width, height: viewport.height, rail: null });
      jobs.push({ kind: "compare", type: null, path: "/compare", label: "compare", viewport: viewport.name, width: viewport.width, height: viewport.height, rail: null });
    }
  }
  const playTypes = only ? playgroundTypes.filter((type) => type === only) : [null, ...playgroundTypes];
  for (const type of playTypes) {
    for (const viewport of [DESKTOP, MOBILE]) {
      jobs.push({
        kind: "play",
        type,
        path: "/playground",
        label: type ? `playground ${type}` : "playground",
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        rail: null,
      });
    }
  }
  return jobs;
}
