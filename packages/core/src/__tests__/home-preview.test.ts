import { describe, expect, it } from "vitest";
import { homePaintCharts, homeTokenCharts } from "../../../../apps/web/src/data/home-charts.ts";
import { render } from "../extra";
import { validate } from "../validate";

describe("homepage strips", () => {
  it("validates and keeps the published numbers", () => {
    for (const chart of [...homePaintCharts(), ...homeTokenCharts()]) {
      const checked = validate(chart.spec);
      expect(checked.errors, JSON.stringify(checked.errors)).toEqual([]);
      const svg = render(chart.spec) ?? "";
      expect(svg).toContain('data-ck-type="strip"');
      expect(svg).not.toContain("ck-chart-error");
      if (String(chart.spec.id).startsWith("paint")) {
        expect(svg).toContain("100k points");
        expect(svg).toContain("18.7 s");
        expect(svg).toContain(">14.2<");
        expect(svg).toContain("10ms");
        expect(svg).toContain("5s+");
        expect(svg).toContain('data-ck-mark="ring"');
        expect(svg.match(/stroke-dasharray="2 4"/g) ?? []).toEqual([]);
      } else {
        expect(svg).toContain(">94<");
        expect(svg).toContain("78.5");
        expect(svg).toContain("3.5× fewer than Plot");
      }
    }
  });
});
