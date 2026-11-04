import { describe, expect, it } from "vitest";
import { render } from "../all";

const alt = "Theme check.";

const gauge = {
  version: "1" as const,
  type: "gauge" as const,
  metric: { value: 40, min: 0, max: 100, label: "Load" },
  a11y: { alt },
};

describe("theme.brand and theme.tokens.fontSize", () => {
  it("paints a gauge from theme.brand", () => {
    const base = render(gauge);
    const branded = render({ ...gauge, theme: { brand: "#ff00aa" } });
    expect(branded).not.toBe(base);
    expect(branded).toContain("#d4609d");
    expect(base).not.toContain("#d4609d");
  });

  it("scales gauge text from fontSize and still inherits the page font", () => {
    const base = render(gauge);
    const big = render({ ...gauge, theme: { tokens: { fontSize: 32 } } });
    expect(big).not.toBe(base);
    const sizes = [...big.matchAll(/font-size="(\d+(?:\.\d+)?)"/g)].map((match) => Number(match[1]));
    expect(sizes.some((size) => size >= 32)).toBe(true);
    expect(big).toContain("font-family:var(--ck-font-family, inherit)");
    expect(big).not.toContain("--ck-font-family:");
  });

  it("sets the base size on a sparkline that draws no tick labels", () => {
    const svg = render({
      version: "1",
      type: "sparkline",
      data: [4, 8, 6, 9],
      theme: { tokens: { fontSize: 32 } },
      a11y: { alt },
    });
    expect(svg).toContain("font-size:32px");
    expect(svg).toContain("font-family:var(--ck-font-family, inherit)");
  });

  it("keeps a line tick at the requested size without naming a font", () => {
    const svg = render({
      version: "1",
      type: "line",
      data: [
        { month: "Jan", revenue: 1 },
        { month: "Feb", revenue: 2 },
      ],
      encoding: { x: "month", y: "revenue" },
      theme: { tokens: { fontSize: 13 } },
      a11y: { alt },
    });
    expect(svg).toContain('font-size="13"');
    expect(svg).toContain("font-family:var(--ck-font-family, inherit)");
  });
});
