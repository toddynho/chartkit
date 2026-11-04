import { describe, expect, it } from "vitest";
import { render } from "../extra";

const alt = "Times follow the zone.";

const spike = {
  version: "1",
  type: "spike",
  data: [
    { hour: "2024-05-01T00:00:00Z", errors: 1 },
    { hour: "2024-05-01T12:00:00Z", errors: 4 },
    { hour: "2024-05-01T21:00:00Z", errors: 2 },
  ],
  encoding: { x: "hour", y: "errors" },
  a11y: { alt },
};

describe("datetime x", () => {
  it("formats spike, candle, and area-range times in the spec zone", () => {
    const utc = render(spike) ?? "";
    const ny = render({ ...spike, timezone: "America/New_York" }) ?? "";
    expect(utc).not.toBe(ny);
    expect(utc).toContain("12");
    expect(ny).not.toContain(">2024-05-01T00:00:00Z<");
    const candles = render({
      version: "1",
      type: "candlestick",
      data: [
        { day: "2024-06-03T00:00:00Z", open: 1, high: 2, low: 1, close: 2 },
        { day: "2024-06-07T00:00:00Z", open: 2, high: 3, low: 1, close: 2 },
      ],
      encoding: { x: "day", open: "open", high: "high", low: "low", close: "close" },
      timezone: "America/New_York",
      a11y: { alt },
    }) ?? "";
    expect(candles).toContain("Jun");
    expect(candles).not.toContain(">2024-06-03T00:00:00Z<");
    const band = render({
      version: "1",
      type: "area-range",
      data: [
        { month: "2024-01-01T00:00:00Z", revenue: 40, lo: 30, hi: 50 },
        { month: "2024-02-01T00:00:00Z", revenue: 55, lo: 46, hi: 66 },
      ],
      encoding: { x: "month", y: "revenue", low: "lo", high: "hi" },
      timezone: "America/New_York",
      a11y: { alt },
    }) ?? "";
    const utcBand = render({
      version: "1",
      type: "area-range",
      data: [
        { month: "2024-05-01T00:00:00Z", revenue: 40, lo: 30, hi: 50 },
        { month: "2024-05-01T18:00:00Z", revenue: 55, lo: 46, hi: 66 },
      ],
      encoding: { x: "month", y: "revenue", low: "lo", high: "hi" },
      a11y: { alt },
    }) ?? "";
    expect(utcBand).not.toBe(band);
  });

  it("keeps category labels when x is nominal", () => {
    const svg = render({ ...spike, encoding: { x: { field: "hour", type: "nominal" }, y: "errors" } }) ?? "";
    expect(svg).toContain(">2024-05-01T00:00:00Z<");
  });
});
