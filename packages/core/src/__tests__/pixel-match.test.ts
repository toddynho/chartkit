// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { validate } from "../validate";

const alt = "Revenue rose from January to March.";

function line(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    version: "1",
    type: "line",
    data: [
      { month: "Jan", revenue: 10 },
      { month: "Feb", revenue: 14 },
      { month: "Mar", revenue: 9 },
    ],
    encoding: { x: "month", y: "revenue" },
    a11y: { alt },
    ...extra,
  };
}

describe("pixel-match spec options", () => {
  it("paints the font family and size, and a dark mode switches the colour base", () => {
    const family = render(line({ theme: { tokens: { fontFamily: "Inter, sans-serif", fontSize: 13 } } }));
    expect(family).toContain("--ck-font-family:Inter, sans-serif");
    expect(family).toContain('font-size="13"');
    expect(validate(line({ theme: { tokens: { fontFamily: "Georgia" }, mode: "dark" } })).warnings.some((warning) => warning.code === "CK3012")).toBe(false);
    const dark = render(line({ theme: { mode: "dark" } }));
    expect(dark).toContain("#0c0c0c");
    expect(render(line())).not.toContain("#0c0c0c");
  });

  it("labels only the ends, dashes the last segment, and keeps the area whole", () => {
    const svg = render(
      line({
        mark: { partial: "dotted", area: true, curve: "linear", gradient: false },
        axes: { x: { ticks: "ends" }, y: { ticks: "ends" } },
      }),
    );
    expect(svg).toContain(">Jan<");
    expect(svg).toContain(">Mar<");
    expect(svg).not.toContain(">Feb<");
    expect(svg).toContain('stroke-dasharray="1.5 3"');
    const fills = svg.match(/fill-opacity="[^"]+"[^>]*\/>/g) ?? [];
    expect(fills.length).toBeGreaterThan(0);
    expect(svg).not.toMatch(/stroke-dasharray="1\.5 3"[^>]*fill-opacity|fill-opacity="[^"]+"[^>]*stroke-dasharray="1\.5 3"/);
  });

  it("draws a headline, a delta pill, and tooltip chrome", () => {
    const svg = render(
      line({
        headline: { label: "Gross volume", value: "$261K", compare: "$228K", delta: "+14%", tone: "positive" },
        tooltip: { background: "#ffffff", radius: 8, shadow: "0 2px 4px #0002", crosshairColor: "#635bff" },
      }),
    );
    expect(svg).toContain('data-ck-headline="1"');
    expect(svg).toContain(">$261K<");
    expect(svg).toContain(">$228K<");
    expect(svg).toContain('data-ck-delta="1"');
    expect(svg).toContain(">+14%<");
    expect(svg).toContain('data-ck-chrome-bg="#ffffff"');
    expect(svg).toContain('data-ck-chrome-radius="8"');
    expect(svg).toContain('data-ck-chrome-shadow="0 2px 4px #0002"');
    expect(svg).toContain('data-ck-xhair="#635bff"');
  });

  it("opens a gap in a stack and rounds every corner", () => {
    const spec = {
      version: "1",
      type: "bar",
      data: [
        { month: "Jan", a: 10, b: 6 },
        { month: "Feb", a: 8, b: 4 },
      ],
      encoding: { x: "month", y: ["a", "b"] },
      mark: { stack: "stack", stackGap: 4, cornerRadius: 3, radiusEnds: "all" },
      a11y: { alt: "Two stacked months." },
    };
    const gapped = render(spec);
    const flush = render({ ...spec, mark: { stack: "stack", cornerRadius: 3 } });
    expect(gapped).toContain('data-ck-stack-gap="4"');
    expect(gapped).toContain("inset(0 round min(3px");
    const bars = (svg: string) => [...svg.matchAll(/<rect [^>]*height="([0-9.]+)" fill="var\(--ck-series/g)].map((mark) => Number(mark[1]));
    const gapH = bars(gapped);
    const flushH = bars(flush);
    expect(gapH.length).toBe(flushH.length);
    expect(gapH.reduce((sum, height) => sum + height, 0)).toBeLessThan(flushH.reduce((sum, height) => sum + height, 0));
  });
});
