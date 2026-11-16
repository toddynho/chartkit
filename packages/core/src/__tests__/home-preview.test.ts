import { describe, expect, it } from "vitest";
import { homeServerCharts, homeTokenCharts } from "../../../../apps/web/src/data/home-charts.ts";
import { render } from "../extra";
import { validate } from "../validate";

describe("homepage strips", () => {
  it("validates and keeps the published numbers", () => {
    for (const chart of [...homeServerCharts(), ...homeTokenCharts()]) {
      const checked = validate(chart.spec);
      expect(checked.errors, JSON.stringify(checked.errors)).toEqual([]);
      const svg = render(chart.spec) ?? "";
      expect(svg).toContain('data-ck-type="strip"');
      expect(svg).not.toContain("ck-chart-error");
      if (String(chart.spec.id).startsWith("server")) {
        expect(svg).toContain("48 bars");
        expect(svg).toContain(">0.26<");
        expect(svg).toContain(">0.03<");
        expect(svg).toContain('data-ck-mark="ring"');
      } else {
        expect(svg).toContain(">94<");
        expect(svg).toContain("78.5");
        expect(svg).toContain("3.5× fewer than Plot");
      }
    }
  });
});
