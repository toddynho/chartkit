import { describe, expect, it } from "vitest";
import { render } from "../all";
import { line } from "../charts/line";
import { optionCatalog } from "../option-catalog";
import { createRenderer } from "../render";

const alt = "Scope check.";

function applies(path: string): string[] | undefined {
  return optionCatalog.find((field) => field.path === path)?.appliesTo;
}

describe("headline, timezone, and coordinate scope", () => {
  it("draws a headline on a gauge, above the plot", () => {
    const spec = {
      version: "1" as const,
      type: "gauge" as const,
      metric: { value: 40, min: 0, max: 100, label: "Load" },
      a11y: { alt },
    };
    const base = render(spec);
    const labeled = render({ ...spec, headline: { label: "Probe" } });
    expect(base).not.toContain("Probe");
    expect(labeled).toContain("Probe");
    expect(labeled).toContain('data-ck-headline="1"');
    const baseBox = Number(/viewBox="0 0 [\d.]+ ([\d.]+)"/.exec(base)?.[1]);
    const nextBox = Number(/viewBox="0 0 [\d.]+ ([\d.]+)"/.exec(labeled)?.[1]);
    expect(nextBox).toBeGreaterThan(baseBox);
  });

  it("draws each headline field", () => {
    const spec = {
      version: "1" as const,
      type: "kpi" as const,
      metric: { value: 12, label: "Open" },
      a11y: { alt },
    };
    expect(render({ ...spec, headline: { value: "12k" } })).toContain("12k");
    expect(render({ ...spec, headline: { compare: "10k" } })).toContain("10k");
    expect(render({ ...spec, headline: { delta: "+4%" } })).toContain("+4%");
    expect(render({ ...spec, headline: { tone: "negative" } })).toContain('data-ck-headline="1"');
  });

  it("limits layout.coordinate to the repair types", () => {
    expect(applies("layout.coordinate")?.slice().sort()).toEqual(["bar", "donut", "pie", "radial-bar", "rose"]);
    expect(applies("layout.coordinate")).not.toContain("line");
    expect(applies("layout.coordinate")).not.toContain("gauge");
  });

  it("limits timezone to instant axes, not calendar-day or metric charts", () => {
    const types = applies("timezone") ?? [];
    expect(types).toEqual(expect.arrayContaining(["line", "scatter", "candlestick", "area-range"]));
    for (const type of ["gauge", "donut", "heatmap", "gantt", "timeline", "kpi", "sankey"]) {
      expect(types, type).not.toContain(type);
    }
  });

  it("shifts a temporal line into the spec zone", () => {
    const renderLine = createRenderer([line]);
    const spec = {
      version: "1" as const,
      type: "line" as const,
      data: {
        columns: {
          x: [Date.UTC(2024, 0, 15, 4, 30), Date.UTC(2024, 0, 15, 16, 30)],
          y: [1, 2],
        },
      },
      encoding: { x: { field: "x", type: "temporal" as const }, y: "y" },
      mark: { curve: "linear" as const, points: "none" as const },
      size: { width: 480, height: 200 },
      a11y: { alt },
    };
    const utc = renderLine(spec);
    const east = renderLine({ ...spec, timezone: "America/New_York" });
    expect(east).not.toBe(utc);
    expect(east).toContain("12:00 AM");
    expect(utc).not.toContain("12:00 AM");
  });
});
