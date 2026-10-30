import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ChartKitSpecError, renderToString } from "../render.js";

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
    expect(svg).not.toContain("ck-chart-error");
  });

  it("draws an extra chart without a client loader", () => {
    const svg = renderToString({
      version: "1",
      type: "histogram",
      data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
      encoding: { x: "score" },
      mark: { bins: 2 },
      a11y: { alt: "Scores cluster at the low end." },
    });
    expect(svg).toContain('data-ck-type="histogram"');
  });

  it("draws bar-list, which is outside all and extra", () => {
    const svg = renderToString({
      version: "1",
      type: "bar-list",
      data: [
        { page: "/pricing", visits: 1840 },
        { page: "/docs", visits: 1420 },
      ],
      encoding: { x: "page", y: { field: "visits", format: "compact" } },
      a11y: { alt: "Pricing leads the page list." },
    });
    expect(svg).toContain('data-ck-type="bar-list"');
  });

  it("validates a planning chart with the phase-4 rules", () => {
    const svg = renderToString({
      version: "1",
      type: "gantt",
      data: [
        { id: "a", task: "A", start: "2026-03-02", end: "2026-03-13" },
        { id: "b", task: "B", start: "2026-04-06", milestone: true, depends: "a" },
      ],
      a11y: { alt: "B follows A." },
    });
    expect(svg).toContain('data-ck-type="gantt"');
  });

  it("throws the CK codes when the spec is invalid", () => {
    expect(() => renderToString({ ...line, a11y: { alt: "" } })).toThrow(ChartKitSpecError);
    try {
      renderToString({ ...line, a11y: { alt: "" } });
    } catch (error) {
      expect(error).toBeInstanceOf(ChartKitSpecError);
      const codes = (error as ChartKitSpecError).errors.map((item) => item.code);
      expect(codes.length).toBeGreaterThan(0);
      expect(String(error)).toMatch(/CK\d{4}/);
    }
  });

  it("uses a custom renderer after validation", () => {
    const svg = renderToString(line, () => '<svg xmlns="http://www.w3.org/2000/svg" data-ck-type="line"></svg>');
    expect(svg).toContain('data-ck-type="line"');
  });
});

describe("static component source", () => {
  it("puts the vanilla mount script in a component that renders only when client is set", () => {
    const chart = readFileSync(new URL("../Chart.astro", import.meta.url), "utf8");
    const client = readFileSync(new URL("../Client.astro", import.meta.url), "utf8");
    expect(chart).toContain("{client ? <Client /> : null}");
    expect(chart).not.toContain('from "./client.js"');
    expect(client).toContain('from "./client.js"');
    expect(client).toContain("hydrate()");
  });
});
