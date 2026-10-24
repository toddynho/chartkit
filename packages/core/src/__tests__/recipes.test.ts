import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderBarList } from "../charts/bar-list";
import { render } from "../extra";
import { validate } from "../validate";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

interface Recipe {
  id: string;
  prompt: string;
  onMain: boolean;
  keys: string[];
  spec: Record<string, unknown>;
  adapted?: string[];
}

interface Prompt {
  id: string;
  prompt: string;
  onMain: boolean;
  markdown: string;
  pr?: number;
}

interface Feed {
  shell: string;
  closed: { key: string }[];
  prompts: Prompt[];
  recipes: Recipe[];
}

const feed = JSON.parse(readFileSync(join(repoRoot, "docs/public/recipes.json"), "utf8")) as Feed;
const llms = readFileSync(join(repoRoot, "docs/public/llms.txt"), "utf8");

function at(spec: Record<string, unknown>, key: string): boolean {
  if (key.includes("[]")) return at(spec, key.replace("[]", ""));
  const parts = key.split(".");
  let cur: unknown = spec;
  for (const part of parts) {
    if (Array.isArray(cur)) cur = cur[0];
    if (!cur || typeof cur !== "object") return false;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur !== undefined;
}

describe("dashboard cookbook", () => {
  it("keeps the shell rule and the recipes pointer inside llms.txt", () => {
    expect(Buffer.byteLength(llms)).toBeLessThanOrEqual(6400);
    expect(llms).toContain("page CSS owns grid, cards, tabs. Spec owns colour, grid, axes, marks, legends.");
    expect(llms).toContain("https://chartkit.dev/recipes.json");
    expect(llms).toContain("/dashboards/{ledger,meter,wayline,keel,signal,folio,cycle,edge,pulse,retain}.md");
    expect(llms).not.toContain("PR 53");
    expect(llms).toContain("ChartKit accepts Mermaid xychart, pie, sankey, radar and treemap syntax via fromMermaid/toSpec.");
  });

  it("lists the closed keys and ten page prompts", () => {
    const keys = feed.closed.map((row) => row.key);
    for (const key of [
      "mark.track",
      "axes.x.title",
      "headline.label",
      "mark.partial",
      "mark.partialOpacity",
      "theme.tokens.surface",
      "axes.y.format",
      "encoding.color.range",
      "mark.nodata",
      "mark.land",
      "encoding.y[].fillOpacity",
      "theme.tokens.fontFamily",
      "theme.tokens.fontSize",
      "theme.mode",
      "tooltip.background",
      "axes.x.ticks",
      "legend.position",
      "mark.stackGap",
      "mark.radiusEnds",
    ]) {
      expect(keys).toContain(key);
    }
    expect(feed.shell).toMatch(/page grid, cards, and tabs/);
    expect(feed.prompts).toHaveLength(10);
    expect(feed.prompts.filter((row) => row.onMain).map((row) => row.id)).toEqual([
      "ledger",
      "meter",
      "wayline",
      "keel",
      "signal",
      "folio",
      "cycle",
      "edge",
      "pulse",
      "retain",
    ]);
    for (const row of feed.prompts) {
      expect(row.prompt).not.toContain("Not on main");
      expect(row.prompt).toContain(`https://chartkit.dev${row.markdown}`);
    }
    const edge = feed.recipes.find((row) => row.id === "vercel-area-partial");
    expect(edge?.onMain).toBe(true);
    expect(edge?.markdown).toBe("/dashboards/edge.md");
  });

  it("draws each recipe with the key it names", async () => {
    expect(feed.recipes.map((row) => row.id)).toEqual([
      "stripe-gross-volume",
      "vercel-area-partial",
      "bar-list-track-row",
      "transparent-scorecard",
      "ga-choropleth-range",
      "sentry-stacked-gap",
      "plausible-duration-hm",
    ]);
    for (const recipe of feed.recipes) {
      expect(recipe.prompt.split("\n")).toHaveLength(1);
      for (const key of recipe.keys) expect(at(recipe.spec, key), `${recipe.id} ${key}`).toBe(true);
    }

    const gross = feed.recipes[0].spec;
    const grossSvg = render(gross);
    expect(validate(gross).ok).toBe(true);
    expect(grossSvg).toContain("Gross volume");
    expect(grossSvg).toContain('data-ck-headline="1"');

    const vercel = feed.recipes[1].spec;
    expect(validate(vercel).ok).toBe(true);
    expect(render(vercel)).toContain('data-ck-partial-opacity="0.05"');

    const list = feed.recipes[2].spec;
    expect(validate(list).ok).toBe(true);
    expect(renderBarList(list)).toContain('data-ck-track="row"');

    const score = feed.recipes[3].spec;
    expect(validate(score).ok).toBe(true);
    const scoreSvg = render(score);
    expect(scoreSvg).toContain("var(--ck-surface, transparent)");
    expect(scoreSvg).toContain("var(--ck-grid, transparent)");

    const map = feed.recipes[4].spec;
    const geo = await import("../../../geo/src/render.ts");
    const geoValidate = await import("../../../geo/src/validate.ts");
    expect(geoValidate.validate(map).ok).toBe(true);
    const mapSvg = await geo.render(map);
    expect(mapSvg).toContain("#aecbfa");
    expect(mapSvg).toContain("#1a73e8");
    expect(mapSvg).not.toContain("ck-geo-hatch");

    const stacked = feed.recipes[5].spec;
    expect(validate(stacked).ok).toBe(true);
    expect(render(stacked)).toContain('data-ck-stack-gap="2"');

    const duration = feed.recipes[6].spec;
    expect(duration.adapted).toBeUndefined();
    expect(feed.recipes[6].adapted).toEqual(["axes.y.format"]);
    expect(validate(duration).ok).toBe(true);
    expect(render(duration)).toMatch(/\d+m /);
  });
});
