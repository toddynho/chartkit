import { describe, expect, it } from "vitest";
import { formatValue } from "../format";
import { render } from "../extra";

const gbp = { style: "currency", currency: "GBP" };
const money = (value: number) => formatValue(value, gbp, "en-US");

function nodeHeight(svg: string, name: string): number {
  const height = svg.match(new RegExp(`height="([^"]+)"[^>]*data-ck-name="${name}"`))?.[1];
  return Number(height);
}

function ribbon(svg: string, name: string): { sh: number; th: number } {
  const d = svg.match(new RegExp(`<path d="([^"]+)"[^>]*data-ck-name="${name}"`))?.[1] ?? "";
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return { sh: nums[nums.length - 1] - nums[1], th: nums[9] - nums[7] };
}

describe("sankey ribbon thickness", () => {
  it("keeps a small return proportional to the node max-flow", () => {
    const svg = render({
      version: "1",
      type: "sankey",
      data: [
        { source: "A", target: "B", value: 10 },
        { source: "B", target: "C", value: 9 },
        { source: "C", target: "A", value: 1 },
      ],
      encoding: { source: "source", target: "target", y: "value" },
      a11y: { alt: "A small return from C does not fill the node." },
      size: { width: 720, height: 420 },
    })!;
    const c = nodeHeight(svg, "C");
    const back = ribbon(svg, "C → A");
    const forward = ribbon(svg, "B → C");
    expect(c).toBeGreaterThan(16);
    expect(back.sh / c).toBeCloseTo(1 / 9, 2);
    expect(forward.th / c).toBeCloseTo(1, 2);
    expect(back.sh).toBeLessThan(c * 0.2);
  });
});

describe("mark labels use the encoding format", () => {
  it("formats waterfall labels, the axis, and the tooltip text as currency", () => {
    const svg = render({
      version: "1",
      type: "waterfall",
      data: [
        { step: "Open", amount: 2100, total: true },
        { step: "Gain", amount: 9100 },
        { step: "End", amount: 11200, total: true },
      ],
      encoding: { x: "step", y: { field: "amount", format: gbp } },
      mark: { total: "total" },
      a11y: { alt: "The year closes at eleven thousand two hundred pounds." },
      size: { width: 640, height: 380 },
    })!;
    expect(svg).toContain(money(2100));
    expect(svg).toContain(money(11200));
    expect(svg).toContain(`Open: total ${money(2100)}`);
    expect(svg).not.toContain("11.2k");
    expect(svg).toContain(money(0));
  });

  it("formats funnel, bullet, treemap, histogram, candlestick, and bar labels", () => {
    const funnel = render({
      version: "1",
      type: "funnel",
      data: [{ stage: "Visit", n: 2100 }],
      encoding: { x: "stage", y: { field: "n", format: gbp } },
      a11y: { alt: "One stage is two thousand one hundred pounds." },
    })!;
    expect(funnel).toContain(money(2100));

    const bullet = render({
      version: "1",
      type: "bullet",
      data: [{ name: "Sales", value: 2100, target: 3000 }],
      encoding: { x: "name", y: { field: "value", format: gbp }, target: "target" },
      a11y: { alt: "Sales are two thousand one hundred pounds." },
    })!;
    expect(bullet).toContain(money(2100));

    const tiles = render({
      version: "1",
      type: "treemap",
      data: [{ name: "Core", value: 11200 }],
      encoding: { x: "name", y: { field: "value", format: gbp } },
      a11y: { alt: "Core is eleven thousand two hundred pounds." },
    })!;
    expect(tiles).toContain(money(11200));
    expect(tiles).not.toContain("11.2k");

    const bins = render({
      version: "1",
      type: "histogram",
      data: [{ cost: 1000 }, { cost: 8000 }],
      encoding: { x: { field: "cost", format: gbp } },
      mark: { bins: 2 },
      a11y: { alt: "Costs fall into two bins." },
    })!;
    expect(bins).toContain("£");
    expect(bins).not.toMatch(/\d–\d/);

    const candles = render({
      version: "1",
      type: "candlestick",
      data: [{ day: "Mon", open: 10, high: 12, low: 9, close: 11 }],
      encoding: { x: "day", open: "open", high: "high", low: "low", close: { field: "close", format: gbp } },
      a11y: { alt: "Monday closed higher." },
    })!;
    expect(candles).toContain("£");

    const bars = render({
      version: "1",
      type: "bar",
      data: [{ name: "Core", amount: 2100 }],
      encoding: { x: "name", y: { field: "amount", format: gbp } },
      mark: { labels: true },
      a11y: { alt: "Core is two thousand one hundred pounds." },
    })!;
    expect(bars).toContain(money(2100));
  });
});
