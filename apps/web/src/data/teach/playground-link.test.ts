/**
 * Docs example sweep for Open in playground.
 * Every teach type and every example builds the link the card uses, the
 * playground hash reader loads it, and the title (and the subtitle, when the
 * card has one) arrive unchanged and paint in the SVG.
 * SWEEP_ALLOWLIST stays empty. A new example is covered with the rest, and a
 * link that drops its title fails here.
 */
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { withPreviewSize } from "../preview-size.ts";
import { cardHeading, examplePlayHref, readPlaygroundHash, withPlayHeading } from "./spec.ts";
import { teachModules } from "./registry.ts";
import { ensurePlayHeading } from "../../scripts/play-heading.ts";
import { stageSpec } from "../../scripts/stage-spec.ts";

/** A type or example named here is skipped. Keep this list empty. */
const SWEEP_ALLOWLIST: { type?: string; id?: string; reason: string }[] = [];

type Runtime = {
  render: (spec: Record<string, unknown>) => string | null;
  renderAll: (spec: Record<string, unknown>) => string;
  renderGeo: (spec: Record<string, unknown>) => Promise<string>;
  renderBarList: (spec: Record<string, unknown>) => string | null;
  isExtra: (type: string) => boolean;
};

const root = fileURLToPath(new URL("../../../../../", import.meta.url));

function decode(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

function textNodes(svg: string): string[] {
  return [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((match) => decode(match[1] ?? ""));
}

function hashOf(href: string): string {
  const at = href.indexOf("#");
  assert.ok(at >= 0, href);
  return href.slice(at);
}

function allow(type: string, id: string): boolean {
  return SWEEP_ALLOWLIST.some((item) => (item.type == null || item.type === type) && (item.id == null || item.id === id));
}

async function bundle(): Promise<Runtime> {
  const { build } = await import("esbuild");
  const dir = mkdtempSync(join(tmpdir(), "ck-play-"));
  const outfile = join(dir, "runtime.mjs");
  const entry = join(dir, "entry.ts");
  writeFileSync(
    entry,
    [
      `export { render } from ${JSON.stringify(join(root, "packages/core/src/extra.ts"))};`,
      `export { isExtra, render as renderAll } from ${JSON.stringify(join(root, "packages/core/src/all.ts"))};`,
      `export { render as renderGeo } from ${JSON.stringify(join(root, "packages/geo/src/index.ts"))};`,
      `export { renderBarList } from ${JSON.stringify(join(root, "packages/core/src/charts/bar-list.ts"))};`,
    ].join("\n"),
  );
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  return import(pathToFileURL(outfile).href) as Promise<Runtime>;
}

async function paint(runtime: Runtime, spec: Record<string, unknown>): Promise<string> {
  const view = withPreviewSize(stageSpec(spec));
  const type = typeof view.type === "string" ? view.type : "";
  let svg = "";
  if (type === "choropleth" || type === "map-points") svg = await runtime.renderGeo(view);
  else if (type === "bar-list") svg = runtime.renderBarList(view) ?? "";
  else svg = runtime.isExtra(type) ? runtime.render(view) ?? "" : runtime.renderAll(view);
  if (!svg) throw new Error("renderer returned nothing");
  return ensurePlayHeading(svg, view);
}

test("playground links carry every docs example title and subtitle", { timeout: 180_000 }, async (t) => {
  assert.deepEqual(SWEEP_ALLOWLIST, []);
  const runtime = await bundle();
  const failures: string[] = [];
  let covered = 0;
  for (const module of Object.values(teachModules)) {
    for (const example of module.examples) {
      covered += 1;
      const where = `${module.type} ${example.id}`;
      if (allow(module.type, example.id)) continue;
      const heading = cardHeading(example);
      const href = examplePlayHref(example, example.spec);
      const loaded = readPlaygroundHash(hashOf(href));
      if (!loaded) {
        failures.push(`${where}: playground did not load the link`);
        continue;
      }
      const stamped = JSON.parse(JSON.stringify(withPlayHeading(example.spec, heading))) as Record<string, unknown>;
      try {
        assert.deepEqual(loaded.spec, stamped);
      } catch (error) {
        failures.push(`${where}: loaded spec differs (${error instanceof Error ? error.message : error})`);
        continue;
      }
      if (loaded.spec.title !== example.title) failures.push(`${where}: title ${JSON.stringify(loaded.spec.title)}`);
      if (heading.subtitle !== undefined && loaded.spec.subtitle !== example.blurb) {
        failures.push(`${where}: subtitle ${JSON.stringify(loaded.spec.subtitle)}`);
      }
      const changed = structuredClone(example.spec);
      changed.tooltip = changed.tooltip === false ? { position: "top" } : false;
      const changedLoaded = readPlaygroundHash(hashOf(examplePlayHref(example, changed)));
      const changedStamped = JSON.parse(JSON.stringify(withPlayHeading(changed, heading))) as Record<string, unknown>;
      try {
        assert.deepEqual(changedLoaded?.spec, changedStamped);
      } catch (error) {
        failures.push(`${where}: control state did not pass through (${error instanceof Error ? error.message : error})`);
      }
      let svg = "";
      try {
        svg = await paint(runtime, loaded.spec);
      } catch (error) {
        failures.push(`${where}: did not render (${error instanceof Error ? error.message : error})`);
        continue;
      }
      if (!svg.includes(`data-ck-type="${module.type}"`) || svg.includes("ck-chart-error")) {
        failures.push(`${where}: painted no ${module.type} chart`);
        continue;
      }
      const nodes = textNodes(svg);
      if (!nodes.includes(example.title)) failures.push(`${where}: title is not in the SVG`);
      if (heading.subtitle !== undefined && !nodes.includes(example.blurb)) failures.push(`${where}: subtitle is not in the SVG`);
    }
  }
  t.diagnostic(`${covered} examples`);
  assert.equal(covered, Object.values(teachModules).reduce((sum, module) => sum + module.examples.length, 0));
  assert.deepEqual(failures, [], failures.join("\n"));
});
