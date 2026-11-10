import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { line } from "../charts/line";
import { render } from "../extra";
import { headerFill, inkContrast, labelContrast, labelInk, sharedInk } from "../ink";
import { createRenderer } from "../render";
import { repair, validate } from "../validate";

const examples = join(dirname(fileURLToPath(import.meta.url)), "../../examples");

function load(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(examples, name), "utf8")) as Record<string, unknown>;
}

const alt = "Search is most of Ads.";

const nested = {
  version: "1",
  type: "treemap",
  data: [
    {
      name: "Ads",
      children: [
        { name: "Search", value: 25 },
        { name: "Social", value: 15 },
      ],
    },
    {
      name: "Direct",
      children: [{ name: "Homepage", value: 10 }],
    },
  ],
  encoding: { x: "name", y: "value" },
  a11y: { alt },
  size: { width: 480, height: 320 },
};

describe("hierarchy", () => {
  it("keeps a one-level treemap free of group frames", () => {
    const svg = render(load("20-treemap.json"));
    expect(svg.match(/data-ck-mark="tile"/g)?.length).toBe(12);
    expect(svg).toContain("Oak");
    expect(svg).not.toContain('data-ck-mark="group"');
  });

  it("draws nested treemap levels, shades, and a full path tooltip", () => {
    const svg = render(nested);
    expect(svg).toContain('data-ck-mark="group"');
    expect(svg).toContain('data-ck-mark="tile"');
    expect(svg).toContain("Ads / Search");
    expect(svg).toContain("of parent");
    expect(svg).toContain("of total");
    expect(svg).toContain("color-mix");
    expect(validate(nested).ok).toBe(true);
  });

  it("builds a treemap from encoding.path and sums omitted parents", () => {
    const spec = {
      version: "1",
      type: "treemap",
      data: [
        { region: "West", country: "US", city: "Austin", revenue: 10 },
        { region: "West", country: "US", city: "Denver", revenue: 6 },
        { region: "East", country: "UK", city: "York", revenue: 4 },
      ],
      encoding: { x: "city", y: "revenue", path: ["region", "country", "city"] },
      a11y: { alt },
    };
    const result = validate(spec);
    expect(result.ok, JSON.stringify(result.errors)).toBe(true);
    const svg = render(spec);
    expect(svg).toContain("West / US / Austin");
    expect(svg).toContain("East");
  });

  it("builds a sunburst from id and parent and reports a sum mismatch", () => {
    const spec = {
      version: "1",
      type: "sunburst",
      data: [
        { id: "ads", name: "Ads", parent: "", value: 10 },
        { id: "search", name: "Search", parent: "ads", value: 25 },
        { id: "social", name: "Social", parent: "ads", value: 15 },
      ],
      encoding: { x: "name", y: "value", id: "id", parent: "parent" },
      a11y: { alt },
    };
    const result = validate(spec);
    const mismatch = result.errors.find((error) => error.code === "CK3030");
    expect(mismatch?.message).toContain("Ads");
    expect(mismatch?.fix?.[0]).toMatchObject({ op: "replace", value: 40 });
    const fixed = repair(spec).spec as { data: { value: number }[] };
    expect(fixed.data[0].value).toBe(40);
    const svg = render(fixed);
    expect(svg).toContain('data-ck-type="sunburst"');
    expect(svg).toContain('data-ck-mark="arc"');
    expect(svg).toContain("Ads / Search");
    expect(svg).toContain(">Ads<");
  });

  it("flags cycles, a missing parent, and a negative size", () => {
    const cycle = validate({
      version: "1",
      type: "sunburst",
      data: [
        { id: "a", name: "A", parent: "b", value: 2 },
        { id: "b", name: "B", parent: "a", value: 3 },
      ],
      encoding: { id: "id", parent: "parent", y: "value" },
      a11y: { alt },
    });
    expect(cycle.errors.some((error) => error.code === "CK3027")).toBe(true);
    const missing = validate({
      version: "1",
      type: "treemap",
      data: [{ id: "leaf", name: "Leaf", parent: "gone", value: 4 }],
      encoding: { x: "name", y: "value", id: "id", parent: "parent" },
      a11y: { alt },
    });
    expect(missing.errors.some((error) => error.code === "CK3028" && error.message.includes("gone"))).toBe(true);
    const negative = validate({
      version: "1",
      type: "sunburst",
      data: [{ name: "Ads", children: [{ name: "Search", value: -2 }] }],
      a11y: { alt },
    });
    expect(negative.errors.some((error) => error.code === "CK3029")).toBe(true);
  });

  it("repairs sunburst aliases and ignores a path on a line", () => {
    const base = { ...nested, type: "sunburst" };
    for (const alias of ["sun-burst", "sunburstchart", "sunburst-chart", "partition"]) {
      const result = validate({ ...base, type: alias });
      expect(result.errors.some((error) => error.code === "CK1005"), alias).toBe(true);
      expect(repair({ ...base, type: alias }).spec.type).toBe("sunburst");
    }
    const foreign = validate({
      version: "1",
      type: "line",
      data: [{ x: "Q1", y: 1 }],
      encoding: { x: "x", y: "y", path: ["x"] },
      a11y: { alt: "Units rose in Q1." },
    });
    expect(foreign.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/encoding/path")).toBe(true);
  });

  it("draws a donut hole, a centre total, fewer rings when depth is capped, and a branch legend", () => {
    const spec = load("33-sunburst.json");
    const open = render(spec);
    const wide = render({ ...spec, mark: { innerRadius: 0.62 } });
    expect(wide).toContain("Organic");
    expect(wide).toContain("9,500");
    expect(open).not.toBe(wide);
    const capped = render({ ...spec, mark: { depth: 1 } });
    const arcs = (svg: string) => svg.match(/data-ck-mark="arc"/g)?.length ?? 0;
    expect(arcs(capped)).toBeLessThan(arcs(open));
    expect(open).toContain(">Organic<");
    expect(open).toContain(">Paid<");
  });

  it("leaves sunburst out of the line renderer", () => {
    const svg = createRenderer([line])(load("33-sunburst.json"));
    expect(svg).toContain("ck-chart-error");
    expect(svg).not.toContain('data-ck-mark="arc"');
  });

  it("paints a combo line swatch with the same colour as the line", () => {
    const spec = {
      version: "1",
      type: "combo",
      data: [
        { month: "Jan", sold: 10, returned: 4 },
        { month: "Feb", sold: 12, returned: 3 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "sold", mark: "bar", title: "Sold" },
          { field: "returned", mark: "line", title: "Returned" },
        ],
      },
      a11y: { alt: "Sold bars with a returned line." },
      size: { width: 480, height: 280 },
    };
    for (const theme of ["soft", "midnight"]) {
      const svg = render({ ...spec, theme });
      const swatch = svg.match(/<rect[^>]*fill="([^"]+)"[^>]*\/>\s*<text[^>]*>Returned<\/text>/)?.[1];
      const strokes = [...svg.matchAll(/<path [^>]*stroke="([^"]+)"/g)].map((match) => match[1]);
      expect(swatch, theme).toBeTruthy();
      expect(strokes, theme).toContain(swatch);
      expect(swatch, theme).toContain("--ck-line-");
    }
  });

  it("picks label ink that clears 4.5:1 and separates sibling leaves", () => {
    const wide = { ...nested, size: { width: 640, height: 420 }, encoding: { x: "name", y: { field: "value", format: { style: "currency", decimals: 0 } } } };
    for (const theme of ["soft", "midnight"]) {
      const tree = render({ ...wide, theme }) ?? "";
      const sun = render({ ...load("33-sunburst.json"), theme }) ?? "";
      for (const svg of [tree, sun]) {
        for (const mark of ["tile", "group", "arc"]) {
          for (const [fill, ink] of labeled(svg, mark)) {
            if (mark === "arc") {
              expect(ink, `${theme} ${fill}`).toMatch(/#1d1d1f|#f5f5f7|#000000|#ffffff|light-dark/);
            } else {
              expect(ink, `${theme} ${mark}`).toBe(labelInk(fill));
              expect(inkContrast(ink, fill), `${theme} ${mark} ${ink} on ${fill}`).toBeGreaterThanOrEqual(4.5);
            }
            expect(labelContrast(fill), `${theme} ${mark} ${fill}`).toBeGreaterThanOrEqual(4.5);
          }
        if (mark === "arc") {
          const byDepth = new Map<string, Set<string>>();
          for (const match of svg.matchAll(/<text[^>]*fill="([^"]+)"[^>]*data-ck-depth="(\d+)"/g)) {
            const set = byDepth.get(match[2] ?? "") ?? new Set<string>();
            set.add(match[1] ?? "");
            byDepth.set(match[2] ?? "", set);
          }
          for (const [depth, inks] of byDepth) expect(inks.size, `${theme} ring ${depth}`).toBe(1);
        }
        }
        expect(svg, theme).not.toContain('fill="#fff"');
      }
      const mixes = [...tree.matchAll(/color-mix\(in srgb,[\s\S]*? (\d+)%/g)].map((match) => match[1]);
      expect(new Set(mixes).size, theme).toBeGreaterThan(1);
      expect(tree, theme).toContain(">$25<");
    }
    const tight = render({ ...wide, size: { width: 120, height: 80 } }) ?? "";
    expect(tight).not.toContain(">$25<");
    expect(labelInk("#ff9500")).toBe("#1d1d1f");
    expect(labelContrast("color-mix(in srgb, #34c759 70%, #ffffff)")).toBeGreaterThanOrEqual(4.5);
    expect(labelContrast(headerFill("#3b82f6"))).toBeGreaterThanOrEqual(4.5);
    expect(labelInk(headerFill("#3b82f6"))).toBe("light-dark(#1d1d1f, #f5f5f7)");
    const leaf = render({ ...wide, theme: "midnight" }) ?? "";
    expect(leaf).toContain("light-dark(#ffffff, #f5f5f7)");
    expect(leaf).not.toContain("#1c1c1e");
    expect(sharedInk(["#22c55e", "#3b82f6", "#a855f7"])).toBe("#000000");
    expect(sharedInk(["#111111", "#f5f5f7"])).toBeNull();
  });

  it("keeps each treemap legend outside the tiles and paints a different cut at each depth", () => {
    const tree = {
      version: "1",
      type: "treemap",
      title: "Inventory by material",
      data: [
        {
          name: "Wood",
          children: [
            { name: "Hardwood", children: [{ name: "Oak", size: 42 }, { name: "Walnut", size: 12 }] },
            { name: "Softwood", children: [{ name: "Pine", size: 28 }, { name: "Maple", size: 18 }] },
          ],
        },
        {
          name: "Metal",
          children: [
            { name: "Ferrous", children: [{ name: "Steel", size: 36 }] },
            { name: "Nonferrous", children: [{ name: "Aluminum", size: 22 }, { name: "Copper", size: 14 }, { name: "Tin", size: 8 }] },
          ],
        },
        {
          name: "Glass",
          children: [
            { name: "Sheet", children: [{ name: "Clear", size: 24 }, { name: "Tinted", size: 16 }] },
            { name: "Worked", children: [{ name: "Laminated", size: 11 }, { name: "Mirror", size: 7 }] },
          ],
        },
      ],
      encoding: { x: "name", y: "size" },
      a11y: { alt },
      size: { width: 640, height: 420 },
    };
    const flat = render(load("20-treemap.json")) ?? "";
    expect(flat).not.toContain("…");
    expect(flat).toContain('data-ck-legend="top"');
    expect(flat).toContain(">Wood<");
    expect(flat).toContain(">Metal<");
    expect(flat).toContain(">Glass<");
    assertLegend(flat, "top", 640, 420);
    for (const position of ["top", "bottom", "right", "left"] as const) {
      const svg = render({ ...tree, legend: { position } }) ?? "";
      expect(svg, position).toContain(`data-ck-legend="${position}"`);
      expect(svg, position).toContain(">Hardwood<");
      expect(svg, position).not.toContain("…");
      assertLegend(svg, position, 640, 420);
    }
    const depth = (cap: number) => render({ ...tree, mark: { depth: cap } }) ?? "";
    const one = depth(1);
    const two = depth(2);
    const three = depth(3);
    expect(nesting(one)).toBe(1);
    expect(nesting(two)).toBe(2);
    expect(nesting(three)).toBe(3);
    expect(one.match(/data-ck-mark=/g)?.length).toBeLessThan(two.match(/data-ck-mark=/g)?.length ?? 0);
    expect(two.match(/data-ck-mark=/g)?.length).toBeLessThan(three.match(/data-ck-mark=/g)?.length ?? 0);
    expect(one).toContain(">Wood<");
    expect(one).not.toContain("Hardwood");
    expect(two).toContain("Hardwood");
    expect(two).not.toContain(">Oak<");
    expect(three).toContain(">Oak<");
  });

  it("still repairs a legacy treemap parent onto color when there is no id", () => {
    const spec = {
      version: "1",
      type: "treemap",
      data: [{ name: "Oak", size: 8, parent: "Wood" }],
      encoding: { name: "name", size: "size", parent: "parent" },
      a11y: { alt: "Oak is the larger tile." },
    };
    const fixed = repair(spec).spec as { encoding: { x?: string; y?: string; color?: string; parent?: string; id?: string } };
    expect(fixed.encoding.x).toBe("name");
    expect(fixed.encoding.y).toBe("size");
    expect(fixed.encoding.color).toBe("parent");
    expect(fixed.encoding.parent).toBeUndefined();
  });
});

function tagBox(tag: string): { x: number; y: number; w: number; h: number } {
  const num = (name: string) => Number(new RegExp(`\\b${name}="([^"]+)"`).exec(tag)?.[1]);
  return { x: num("x"), y: num("y"), w: num("width"), h: num("height") };
}

function legendPlate(svg: string): { x: number; y: number; w: number; h: number } {
  const tag = svg.match(/<rect\b[^>]*data-ck-legend-plate="1"[^>]*>/)?.[0] ?? "";
  return tagBox(tag);
}

function tileUnion(svg: string): { x: number; y: number; w: number; h: number } {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const match of svg.matchAll(/<rect\b[^>]*data-ck-mark="(?:tile|group)"[^>]*>/g)) {
    const box = tagBox(match[0]);
    x0 = Math.min(x0, box.x);
    y0 = Math.min(y0, box.y);
    x1 = Math.max(x1, box.x + box.w);
    y1 = Math.max(y1, box.y + box.h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return ix > 0.5 && iy > 0.5;
}

function assertLegend(svg: string, position: "top" | "bottom" | "right" | "left", width: number, height: number): void {
  const legend = legendPlate(svg);
  const tiles = tileUnion(svg);
  expect(Number.isFinite(legend.w) && legend.w > 2, position).toBe(true);
  expect(legend.x, position).toBeGreaterThanOrEqual(-1);
  expect(legend.y, position).toBeGreaterThanOrEqual(-1);
  expect(legend.x + legend.w, position).toBeLessThanOrEqual(width + 1);
  expect(legend.y + legend.h, position).toBeLessThanOrEqual(height + 1);
  expect(overlaps(legend, tiles), position).toBe(false);
  if (position === "top") expect(legend.y + legend.h, position).toBeLessThanOrEqual(tiles.y + 0.5);
  if (position === "bottom") expect(legend.y, position).toBeGreaterThanOrEqual(tiles.y + tiles.h - 0.5);
  if (position === "right") expect(legend.x, position).toBeGreaterThanOrEqual(tiles.x + tiles.w - 0.5);
  if (position === "left") expect(legend.x + legend.w, position).toBeLessThanOrEqual(tiles.x + 0.5);
}

function nesting(svg: string): number {
  let max = 1;
  for (const match of svg.matchAll(/aria-label="([^"]*)"/g)) {
    const head = (match[1] ?? "").split(":")[0] ?? "";
    const segs = head.split(" / ").filter(Boolean).length;
    if (segs > max) max = segs;
  }
  return max;
}

function labeled(svg: string, mark: string): Array<[string, string]> {
  const chunks = svg.split(`data-ck-mark="${mark}"`);
  const out: Array<[string, string]> = [];
  for (let i = 1; i < chunks.length; i++) {
    const tag = chunks[i - 1].slice(chunks[i - 1].lastIndexOf("<"));
    const fill = tag.match(/fill="([^"]+)"/)?.[1];
    const ink = chunks[i].split(/<rect|<path/)[0].match(/<text[^>]*fill="([^"]+)"/)?.[1];
    if (fill && ink) out.push([fill, ink]);
  }
  return out;
}
