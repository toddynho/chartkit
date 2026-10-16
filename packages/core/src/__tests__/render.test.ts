import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../index";

const examples = join(dirname(fileURLToPath(import.meta.url)), "../../examples");

function spec(name: string): unknown {
  return JSON.parse(readFileSync(join(examples, name), "utf8")) as unknown;
}

const area = {
  version: "1",
  type: "line",
  title: "Revenue",
  data: [
    { month: "Jan", revenue: 30 },
    { month: "Feb", revenue: 50 },
    { month: "Mar", revenue: 40 },
    { month: "Apr", revenue: 70 },
  ],
  encoding: { x: "month", y: "revenue" },
  mark: { area: true, curve: "monotone" },
  theme: "midnight",
  size: { width: 640, height: 240 },
  locale: "en-US",
  a11y: { alt: "Revenue dipped in March after February, then reached 70 in April." },
};

describe("render SVG", () => {
  it("draws a line chart with theme tokens", () => {
    const svg = render(spec("01-minimal-line.json"));
    expect(svg).toContain('data-ck-type="line"');
    expect(svg).toContain("var(--ck-series-1,");
    expect(svg).toContain('role="img"');
    expect(svg).toContain("<path");
    expect(svg).toMatchSnapshot();
  });

  it("draws a bar chart", () => {
    const svg = render(spec("03-bar.json"));
    expect(svg).toContain('data-ck-type="bar"');
    expect(svg).toContain("<rect");
    expect(svg).toContain("Jan");
    expect(svg).toContain("var(--ck-background,");
    expect(svg).toMatchSnapshot();
  });

  it("draws an area chart", () => {
    const svg = render(area);
    expect(svg).toContain('data-ck-type="line"');
    expect(svg).toContain("var(--ck-series-1,");
    expect(svg.match(/<path /g)?.length).toBeGreaterThanOrEqual(2);
    expect(svg).toMatchSnapshot();
  });

  it("draws a stacked area", () => {
    const svg = render(spec("05-stacked-area.json"));
    expect(svg).toContain('data-ck-type="stacked-area"');
    expect(svg).toContain("var(--ck-series-1,");
    expect(svg).toContain("var(--ck-series-2,");
    expect(svg).toContain("Free");
    expect(svg).toMatchSnapshot();
  });

  it("writes the svg into a target and does not throw on errors", () => {
    const target = { innerHTML: "" };
    const svg = render({ version: "1", type: "not-a-chart" }, target);
    expect(svg).toContain("CK1005");
    expect(target.innerHTML).toBe(svg);
    expect(() => render(null)).not.toThrow();
  });

  it("still renders when the only diagnostic is a warning", () => {
    const svg = render({ ...area, mark: { area: true, curve: "monotone", innerRadius: 0.2 } });
    expect(svg).toContain("<path");
    expect(svg).not.toContain("ck-chart-error");
  });
});
