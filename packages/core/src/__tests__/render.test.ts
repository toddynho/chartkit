import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../all";
import { validate } from "../validate";

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
    expect(svg).toContain("CK1010");
    expect(svg).toContain("@chartkitdev/core/all");
    expect(target.innerHTML).toBe(svg);
    expect(() => render(null)).not.toThrow();
  });

  it("still renders when the only diagnostic is a warning", () => {
    const svg = render({ ...area, mark: { area: true, curve: "monotone", innerRadius: 0.2 } });
    expect(svg).toContain("<path");
    expect(svg).not.toContain("ck-chart-error");
  });
});

const typed = [
  ["04-donut.json", "donut", "<path"],
  ["06-scatter.json", "scatter", "<circle"],
  ["08-heatmap.json", "heatmap", "<rect"],
  ["09-gauge.json", "gauge", "<path"],
  ["10-kpi.json", "kpi", "125K"],
  ["11-candlestick.json", "candlestick", 'data-ck-mark="candle"'],
  ["14-spike.json", "spike", "<line"],
  ["15-progress-ring.json", "progress-ring", "<path"],
] as const;

describe("remaining chart renderers", () => {
  for (const [file, type, mark] of typed) {
    it(`draws ${type}`, () => {
      const svg = render(spec(file));
      expect(svg).toContain(`data-ck-type="${type}"`);
      expect(svg).toContain(`data-ck-renderer="${type}"`);
      expect(svg).not.toContain('data-ck-renderer="pending"');
      expect(svg).toContain('role="img"');
      expect(svg).toContain("<title>");
      expect(svg).toContain("<desc>");
      expect(svg).toContain("var(--ck-");
      expect(svg).toContain(mark);
      expect(svg).toMatchSnapshot();
    });
  }

  it("infers a grid heatmap when encoding.y is set and layout is omitted", () => {
    const svg = render({
      version: "1",
      type: "heatmap",
      data: [
        { bin: "A", band: "North", level: 2 },
        { bin: "B", band: "North", level: 7 },
        { bin: "A", band: "South", level: 4 },
      ],
      encoding: { x: "bin", y: "band", color: "level" },
      a11y: { alt: "The north band is higher in bin B." },
    });
    expect(svg).toContain('data-ck-type="heatmap"');
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).toContain("North");
    expect(svg).toContain("South");
    expect(validate({
      version: "1",
      type: "heatmap",
      data: [
        { bin: "A", band: "North", level: 2 },
        { bin: "B", band: "North", level: 7 },
        { bin: "A", band: "South", level: 4 },
      ],
      encoding: { x: "bin", y: "band", color: "level" },
      a11y: { alt: "The north band is higher in bin B." },
    }).ok).toBe(true);
  });

  it("draws a grid heatmap", () => {
    const svg = render({
      version: "1",
      type: "heatmap",
      title: "Load",
      data: [
        { hour: "9", row: "Mon", load: 1 },
        { hour: "10", row: "Mon", load: 5 },
        { hour: "9", row: "Tue", load: 3 },
        { hour: "10", row: "Tue", load: 2 },
      ],
      encoding: { x: "hour", y: "row", color: { field: "load", type: "quantitative" } },
      mark: { layout: "grid", cornerRadius: 4 },
      locale: "en-US",
      a11y: { alt: "Monday at 10 is the busiest hour." },
    });
    expect(svg).toContain('data-ck-renderer="heatmap"');
    expect(svg).toContain("Mon");
    expect(svg).toContain("Tue");
    expect(svg).toContain('aria-label="10, Mon: 5"');
    expect(svg).toMatchSnapshot();
  });

  it("colors a falling candle with the negative token", () => {
    const svg = render({
      version: "1",
      type: "candlestick",
      data: [{ date: "2026-01-03", open: 12, high: 12, low: 8, close: 9 }],
      encoding: { x: "date", open: "open", high: "high", low: "low", close: "close" },
      locale: "en-US",
      a11y: { alt: "The session closed below the open." },
    });
    expect(svg).toContain("var(--ck-negative,");
    expect(svg).not.toContain('data-ck-renderer="pending"');
  });

  it("keeps each renderer module free of its siblings", () => {
    const dir = join(dirname(fileURLToPath(import.meta.url)), "../renderers");
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".ts")) continue;
      const text = readFileSync(join(dir, name), "utf8");
      expect(text, name).not.toMatch(/from "\.\/(?!\.)/);
    }
  });
});
