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

function attrs(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const match of source.matchAll(/([\w:-]+)="([^"]*)"/g)) out[match[1]] = match[2];
  return out;
}

function clipRect(svg: string): { x: number; y: number; width: number; height: number } {
  const match = svg.match(/<clipPath[^>]*>\s*<rect\b([^>]*)\/?>/);
  if (!match) throw new Error("missing clip rect");
  const box = attrs(match[1]);
  return { x: Number(box.x), y: Number(box.y), width: Number(box.width), height: Number(box.height) };
}

function dataRects(svg: string): { x: number; y: number; width: number; height: number }[] {
  const body = svg.replace(/<defs>[\s\S]*?<\/defs>/, "");
  const rects: { x: number; y: number; width: number; height: number }[] = [];
  for (const match of body.matchAll(/<rect\b([^>]*)\/?>/g)) {
    const box = attrs(match[1]);
    if (box.width === "100%" || box.height === "100%") continue;
    if (box.width === "10" && box.height === "10") continue;
    rects.push({ x: Number(box.x), y: Number(box.y), width: Number(box.width), height: Number(box.height) });
  }
  return rects;
}

function labeledY(svg: string, label: string): number | null {
  for (const match of svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)) {
    if (match[2] !== label) continue;
    const y = / y="([^"]+)"/.exec(match[1]);
    if (y) return Number(y[1]);
  }
  return null;
}

function circles(svg: string): { cx: number; cy: number; r: number }[] {
  return [...svg.matchAll(/<circle\b([^>]*)\/?>/g)].map((match) => ({
    cx: Number(/cx="([^"]+)"/.exec(match[1])?.[1]),
    cy: Number(/cy="([^"]+)"/.exec(match[1])?.[1]),
    r: Number(/ r="([^"]+)"/.exec(match[1])?.[1]),
  }));
}

function tickTexts(svg: string, anchor: "start" | "end"): string[] {
  const re = new RegExp(`<text\\b[^>]*text-anchor="${anchor}"[^>]*>([^<]*)</text>`, "g");
  return [...svg.matchAll(re)].map((match) => match[1]);
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

  it("keeps combo bars inside the plot and distinguishes y2 ticks", () => {
    const svg = render({
      version: "1",
      type: "combo",
      data: [
        { week: "W1", orders: 80, rate: 0.03 },
        { week: "W2", orders: 110, rate: 0.04 },
      ],
      encoding: {
        x: "week",
        y: [
          { field: "orders", mark: "bar" },
          { field: "rate", mark: "line", axis: "y2" },
        ],
      },
      axes: { y2: true },
      size: { width: 640, height: 240 },
      a11y: { alt: "Orders and the rate both rose." },
    });
    const clip = clipRect(svg);
    const bars = dataRects(svg);
    expect(bars.length).toBe(2);
    for (const bar of bars) {
      expect(bar.y).toBeGreaterThanOrEqual(clip.y - 0.5);
      expect(bar.y + bar.height).toBeLessThanOrEqual(clip.y + clip.height + 0.5);
      expect(bar.x).toBeGreaterThanOrEqual(clip.x - 0.5);
      expect(bar.x + bar.width).toBeLessThanOrEqual(clip.x + clip.width + 0.5);
    }
    const left = tickTexts(svg, "end");
    const right = tickTexts(svg, "start");
    expect(left).toContain("0");
    expect(new Set(right).size).toBe(right.length);
    expect(right).toContain("0.03");
    expect(right).toContain("0.04");
    expect(right.filter((label) => label === "0.03").length).toBe(1);
  });

  it("does not force zero on a combo made only of lines", () => {
    const svg = render({
      version: "1",
      type: "combo",
      data: [
        { week: "W1", orders: 80, rate: 90 },
        { week: "W2", orders: 110, rate: 100 },
      ],
      encoding: {
        x: "week",
        y: [
          { field: "orders", mark: "line" },
          { field: "rate", mark: "line", axis: "y2" },
        ],
      },
      axes: { y2: true },
      size: { width: 640, height: 240 },
      a11y: { alt: "Orders and the rate both rose." },
    });
    expect(tickTexts(svg, "end")).not.toContain("0");
    expect(tickTexts(svg, "start")).not.toContain("0");
    expect(dataRects(svg)).toHaveLength(0);
  });

  it("draws the published combo with a zero baseline", () => {
    const svg = render(spec("07-combo.json"));
    expect(svg).toContain('data-ck-type="combo"');
    const clip = clipRect(svg);
    const bars = dataRects(svg);
    expect(bars.length).toBe(3);
    for (const bar of bars) {
      expect(bar.y + bar.height).toBeLessThanOrEqual(clip.y + clip.height + 0.5);
    }
    expect(tickTexts(svg, "end")).toContain("0");
    const right = tickTexts(svg, "start");
    expect(new Set(right).size).toBe(right.length);
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

  it("draws the rich line, the stacked bar, and a log scatter", () => {
    const rich = render(spec("02-line-rich.json"));
    expect(rich.match(/<path\b[^>]*stroke="/g)?.length).toBeGreaterThanOrEqual(2);
    expect(rich).toContain("var(--chart-1,");
    expect(rich).toContain("var(--chart-2,");
    expect(rich).not.toContain("2026-10-16T05:00:00Z");
    expect(rich).toMatch(/\d{2}:\d{2}/);

    const stacked = render(spec("03-bar-stacked.json"));
    expect(stacked).toContain("var(--ck-series-1,");
    expect(stacked).toContain("var(--ck-series-2,");
    expect(stacked.match(/>NA</g)).toHaveLength(1);
    expect(stacked.match(/>EU</g)).toHaveLength(1);
    expect(stacked.match(/>APAC</g)).toHaveLength(1);
    const regions = dataRects(stacked);
    expect(regions.length).toBe(6);

    const bubble = render(spec("06-scatter-bubble.json"));
    const y10 = labeledY(bubble, "10");
    const y100 = labeledY(bubble, "100");
    const y1000 = labeledY(bubble, "1,000");
    expect(y10).not.toBeNull();
    expect(y100).not.toBeNull();
    expect(y1000).not.toBeNull();
    expect(Math.abs(Math.abs(y10! - y100!) - Math.abs(y100! - y1000!))).toBeLessThan(4);
    const marks = circles(bubble);
    expect(marks.length).toBe(4);
    for (const circle of marks) {
      expect(circle.r).toBeGreaterThan(0);
      expect(circle.cx - circle.r).toBeGreaterThanOrEqual(-0.5);
      expect(circle.cx + circle.r).toBeLessThanOrEqual(640.5);
      expect(circle.cy - circle.r).toBeGreaterThanOrEqual(-0.5);
      expect(circle.cy + circle.r).toBeLessThanOrEqual(320.5);
    }
  });

  it("draws grouped bars from a series field and from a color field", () => {
    const rows = [
      { month: "Jan", plan: "Free", signups: 4 },
      { month: "Jan", plan: "Pro", signups: 2 },
      { month: "Feb", plan: "Free", signups: 5 },
      { month: "Feb", plan: "Pro", signups: 3 },
    ];
    const grouped = render({
      version: "1",
      type: "bar",
      data: rows,
      encoding: { x: "month", y: "signups", series: "plan" },
      size: { width: 640, height: 240 },
      a11y: { alt: "Free and Pro are both higher in February." },
    });
    expect(dataRects(grouped)).toHaveLength(4);
    expect(grouped).toContain("var(--ck-series-1,");
    expect(grouped).toContain("var(--ck-series-2,");
    expect(grouped.match(/>Jan</g)).toHaveLength(1);
    const byColor = render({
      version: "1",
      type: "bar",
      data: rows,
      encoding: { x: "month", y: "signups", color: "plan" },
      mark: { stack: "stack" },
      size: { width: 640, height: 240 },
      a11y: { alt: "Free and Pro are stacked by month." },
    });
    expect(dataRects(byColor)).toHaveLength(4);
    expect(byColor).toContain("var(--ck-series-2,");
  });

  it("uses a log scale and a currency format on the axis", () => {
    const svg = render({
      version: "1",
      type: "line",
      data: [
        { step: "A", value: 1 },
        { step: "B", value: 10 },
        { step: "C", value: 100 },
      ],
      encoding: { x: "step", y: { field: "value", scale: { type: "log" }, format: "currency" } },
      size: { width: 640, height: 240 },
      a11y: { alt: "The value grows by ten each step." },
    });
    const y1 = labeledY(svg, "$1.00");
    const y10 = labeledY(svg, "$10.00");
    const y100 = labeledY(svg, "$100.00");
    expect(y1).not.toBeNull();
    expect(y10).not.toBeNull();
    expect(y100).not.toBeNull();
    expect(Math.abs(Math.abs(y1! - y10!) - Math.abs(y10! - y100!))).toBeLessThan(2);
  });

  it("draws rule, band, and text annotations with their labels", () => {
    const svg = render({
      version: "1",
      type: "line",
      data: [
        { month: "Jan", revenue: 20 },
        { month: "Feb", revenue: 40 },
        { month: "Mar", revenue: 30 },
      ],
      encoding: { x: "month", y: "revenue" },
      annotations: [
        { type: "rule", axis: "y", value: 35, label: "Target", dash: "dotted" },
        { type: "band", axis: "x", from: "Jan", to: "Feb", label: "Launch" },
        { type: "text", x: "Mar", y: 30, label: "Dip" },
      ],
      size: { width: 640, height: 240 },
      a11y: { alt: "Revenue rose in February and dipped in March." },
    });
    expect(svg).toContain('data-ck-annotation="rule"');
    expect(svg).toContain('data-ck-annotation="band"');
    expect(svg).toContain(">Target<");
    expect(svg).toContain(">Launch<");
    expect(svg).toContain(">Dip<");
    expect(render(spec("02-rich-line.json"))).toContain(">Target<");
  });

  it("keeps donut legend values inside the view box", () => {
    const svg = render(spec("04-donut.json"));
    expect(svg).toContain('text-anchor="end"');
    expect(svg).toContain('font-size="20" font-weight="700"');
    for (const match of svg.matchAll(/<text\b([^>]*)text-anchor="end"[^>]*>([^<]*)<\/text>/g)) {
      const x = Number(/ x="([^"]+)"/.exec(match[1])?.[1]);
      expect(x).toBeLessThanOrEqual(420);
      expect(match[2].length).toBeGreaterThan(0);
    }
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
