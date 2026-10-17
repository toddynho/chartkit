import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { histogram } from "../charts/histogram";
import { line } from "../charts/line";
import { render } from "../all";
import { createRenderer } from "../render";
import { repair, validate } from "../validate";

const examples = join(dirname(fileURLToPath(import.meta.url)), "../../examples");
const phase3 = ["16-histogram.json", "17-boxplot.json", "18-radar.json", "19-funnel.json", "20-treemap.json", "21-sankey.json"];

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

  it("bins raw histogram values and keeps the line entry free of them", () => {
    const svg = render(load("16-histogram.json"));
    expect(svg).toContain('data-ck-count="3"');
    expect(svg).toContain('data-ck-count="1"');
    const onlyLine = createRenderer([line]);
    expect(onlyLine(load("16-histogram.json"))).toContain("CK1010");
    expect(createRenderer([line, histogram])(load("16-histogram.json"))).toContain('data-ck-type="histogram"');
  });

  it("draws the marks for each new geometry", () => {
    expect(render(load("17-boxplot.json"))).toContain('data-ck-mark="box"');
    expect(render(load("17-boxplot.json"))).toContain('data-ck-mark="outlier"');
    expect(render(load("18-radar.json")).match(/data-ck-mark="polygon"/g)).toHaveLength(2);
    expect(render(load("19-funnel.json")).match(/data-ck-mark="stage"/g)).toHaveLength(3);
    expect(render(load("20-treemap.json")).match(/data-ck-mark="tile"/g)).toHaveLength(4);
    expect(render(load("21-sankey.json")).match(/data-ck-mark="link"/g)).toHaveLength(3);
  });
});
