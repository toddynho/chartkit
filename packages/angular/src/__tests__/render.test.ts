import { describe, expect, it } from "vitest";
import { ChartKitSpecError, renderToString } from "../ssr.js";

const line = {
  version: "1" as const,
  type: "line" as const,
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
  ],
  encoding: { x: "quarter", y: "units" },
  a11y: { alt: "Units rose from Q1 to Q2." },
};

describe("renderToString", () => {
  it("validates and returns a line SVG", () => {
    const svg = renderToString(line);
    expect(svg).toContain("<svg");
    expect(svg).toContain('data-ck-type="line"');
    expect(svg).toContain("Units rose from Q1 to Q2.");
  });

  it("draws an extra chart and bar-list", () => {
    expect(
      renderToString({
        version: "1",
        type: "histogram",
        data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
        encoding: { x: "score" },
        mark: { bins: 2 },
        a11y: { alt: "Scores cluster at the low end." },
      }),
    ).toContain('data-ck-type="histogram"');
    expect(
      renderToString({
        version: "1",
        type: "bar-list",
        data: [
          { page: "/pricing", visits: 1840 },
          { page: "/docs", visits: 1420 },
        ],
        encoding: { x: "page", y: { field: "visits", format: "compact" } },
        a11y: { alt: "Pricing leads the page list." },
      }),
    ).toContain('data-ck-type="bar-list"');
  });

  it("throws the CK codes when the spec is invalid", () => {
    expect(() => renderToString({ ...line, a11y: { alt: "" } })).toThrow(ChartKitSpecError);
  });
});
