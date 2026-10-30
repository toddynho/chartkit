/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { renderToString } from "../../dist/ssr.js";

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

describe("Solid SSR", () => {
  it("prints the SVG and a hydration key", () => {
    const html = renderToString(line);
    expect(html).toContain('data-ck-type="line"');
    expect(html).toContain("Units rose from Q1 to Q2.");
    expect(html).toContain("data-hk=");
    expect(html.match(/<svg/g)).toHaveLength(1);
  });

  it("includes an extra chart in the string", () => {
    const html = renderToString({
      version: "1",
      type: "histogram",
      data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
      encoding: { x: "score" },
      mark: { bins: 2 },
      a11y: { alt: "Scores cluster at the low end." },
    });
    expect(html).toContain('data-ck-type="histogram"');
  });

  it("throws when the spec is invalid", () => {
    expect(() => renderToString({ ...line, a11y: { alt: "" } })).toThrow(/CK\d{4}/);
  });

});
