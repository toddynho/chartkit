import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { histogram } from "../charts/histogram";
import { line } from "../charts/line";
import { render as renderAll } from "../all";
import { render } from "../extra";
import { createRenderer } from "../render";
import { repair, validate } from "../validate";

const examples = join(dirname(fileURLToPath(import.meta.url)), "../../examples");
const phase3 = ["16-histogram.json", "17-boxplot.json", "18-radar.json", "19-funnel.json", "20-treemap.json", "21-sankey.json", "22-bullet.json", "23-waterfall.json"];

function load(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(examples, name), "utf8")) as Record<string, unknown>;
}

describe("phase 3 charts", () => {
  for (const name of phase3) {
    it(`${name} validates, repeats, and draws a Soft SVG`, () => {
      const spec = load(name);
      const result = validate(spec);
      expect(result.errors, JSON.stringify(result.errors)).toEqual([]);
      const svg = render(spec);
      const again = render(spec);
      expect(again).toBe(svg);
      expect(svg).not.toContain("ck-chart-error");
      expect(svg).not.toContain("NaN");
      expect(svg).toContain(`data-ck-type="${spec.type}"`);
      expect(svg).toContain(`aria-label="${(spec.a11y as { alt: string }).alt}"`);
      expect(svg).toContain("var(--ck-");
      expect(svg).toContain("light-dark(");
      expect(svg).not.toMatch(/\b(window|document|Math\.random|Date\.now)\b/);
    });
  }

  it("requires alt text", () => {
    const spec = load("19-funnel.json");
    delete (spec.a11y as { alt?: string }).alt;
    const result = validate(spec);
    expect(result.errors.some((error) => error.code === "CK1004")).toBe(true);
  });

  it("repairs aliases and misplaced channels", () => {
    const box = repair({
      version: "1",
      type: "box-plot",
      data: [
        { group: "A", value: 1 },
        { group: "A", value: 4 },
        { group: "A", value: 6 },
      ],
      encoding: { x: "group", y: "value" },
      a11y: { alt: "Group A is a small sample." },
    });
    expect(box.ok, JSON.stringify(box.errors)).toBe(true);
    expect((box.spec as { type: string }).type).toBe("boxplot");

    const flow = repair({
      version: "1",
      type: "sankey",
      data: [{ from: "A", to: "B", n: 3 }],
      encoding: { from: "from", to: "to", value: "n" },
      a11y: { alt: "A flows to B." },
    });
    expect(flow.ok, JSON.stringify(flow.errors)).toBe(true);
    expect((flow.spec as { encoding: { source: string; target: string; y: string } }).encoding).toMatchObject({
      source: "from",
      target: "to",
      y: "n",
    });

    const hist = repair({
      version: "1",
      type: "hist",
      data: [{ value: 1 }, { value: 4 }],
      encoding: { value: "value" },
      a11y: { alt: "Two raw observations." },
    });
    expect(hist.ok, JSON.stringify(hist.errors)).toBe(true);
    expect((hist.spec as { type: string; encoding: { x: string } }).type).toBe("histogram");
    expect((hist.spec as { encoding: { x: string } }).encoding.x).toBe("value");
  });

  it("bins raw histogram values and keeps them out of line and all", () => {
    const svg = render(load("16-histogram.json"));
    const bins = svg.match(/data-ck-mark="bar"/g)?.length ?? 0;
    expect(bins).toBeGreaterThanOrEqual(12);
    expect(bins).toBeLessThanOrEqual(20);
    expect(svg).not.toMatch(/>\d+\.\d+</);
    const small = render({
      version: "1",
      type: "histogram",
      data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
      encoding: { x: "score" },
      mark: { bins: 2 },
      a11y: { alt: "Scores cluster at the low end." },
    });
    expect(small).toContain('data-ck-count="3"');
    expect(small).toContain('data-ck-count="1"');
    expect(small).not.toContain(">4.5<");
    expect(small).toContain(">2<");
    const onlyLine = createRenderer([line]);
    expect(onlyLine(load("16-histogram.json"))).toContain("CK1010");
    expect(renderAll(load("16-histogram.json"))).toContain("CK1010");
    expect(createRenderer([line, histogram])(load("16-histogram.json"))).toContain('data-ck-type="histogram"');
  });

  it("draws the marks for each new geometry", () => {
    const box = render(load("17-boxplot.json"));
    expect(box.match(/data-ck-mark="box"/g)).toHaveLength(5);
    expect(box).toContain('data-ck-mark="whisker"');
    expect(box).toContain('data-ck-mark="median"');
    expect(box).toContain('data-ck-mark="outlier"');
    const radar = render(load("18-radar.json"));
    expect(radar.match(/data-ck-mark="polygon"/g)).toHaveLength(2);
    expect(radar.match(/data-ck-mark="spoke"/g)).toHaveLength(6);
    expect(radar).toContain("Speed");
    const funnel = render(load("19-funnel.json"));
    expect(funnel.match(/data-ck-mark="stage"/g)).toHaveLength(5);
    expect(funnel).toContain('rx="');
    expect(funnel).toContain("%");
    const trapezoid = render({
      version: "1",
      type: "funnel",
      data: [
        { stage: "Visit", count: 80 },
        { stage: "Start", count: 40 },
        { stage: "Pay", count: 12 },
      ],
      encoding: { x: "stage", y: "count" },
      mark: { shape: "trapezoid" },
      a11y: { alt: "12 of 80 visits pay." },
    });
    expect(trapezoid).toContain('d="M');
    expect(trapezoid).toContain("Visit: 80 (start)");
    expect(trapezoid).not.toContain("100% of previous");
    expect(trapezoid).toContain("of previous");
    const tiles = render(load("20-treemap.json"));
    expect(tiles.match(/data-ck-mark="tile"/g)).toHaveLength(12);
    expect(tiles).toContain("color-mix(");
    expect(tiles).toContain("Oak");
    const sankey = render(load("21-sankey.json"));
    expect(sankey.match(/data-ck-mark="link"/g)?.length).toBe(10);
    expect(sankey.match(/data-ck-mark="node"/g)?.length).toBe(7);
    expect(sankey).toContain("linearGradient");
    expect(sankey).toContain('fill-opacity="0.35"');
    expect(sankey).toContain('text-anchor="end"');
    expect(sankey).toContain('text-anchor="start"');
    expect(sankey).toContain("Landing");
    expect(render(load("22-bullet.json"))).toContain('data-ck-mark="target"');
    const waterfall = render(load("23-waterfall.json"));
    expect(waterfall).toContain('data-ck-mark="total"');
    expect(waterfall).toContain('data-ck-mark="delta"');
    expect(waterfall).toContain("var(--ck-positive, light-dark(#15803d, #30d158))");
    expect(waterfall).toContain("var(--ck-negative, light-dark(#be123c, #ff453a))");
  });
});
