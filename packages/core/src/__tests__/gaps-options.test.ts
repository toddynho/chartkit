import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { repair, validate } from "../validate";

const alt = "The chart states the value in one sentence.";

function rings(extra: Record<string, unknown> = {}) {
  return {
    version: "1",
    type: "progress-ring",
    metric: { label: "Today", value: 530, min: 0, max: 600 },
    mark: {
      rings: [
        { value: 530, max: 600, color: "#ff375f", label: "Move" },
        { value: 32, max: 45, color: "#30d158", label: "Exercise" },
        { value: 10, max: 12, color: "#0a84ff", label: "Stand" },
      ],
    },
    a11y: { alt },
    size: { width: 280, height: 280 },
    ...extra,
  };
}

describe("mark.rings", () => {
  it("draws concentric rings, outer first", () => {
    const result = validate(rings());
    expect(result.ok, JSON.stringify(result.errors)).toBe(true);
    const svg = render(rings());
    const marks = [...svg.matchAll(/data-ck-mark="ring" data-ck-ring="(\d+)" data-ck-radius="([^"]+)"/g)];
    expect(marks.map((mark) => mark[1])).toEqual(["0", "1", "2"]);
    const radii = marks.map((mark) => Number(mark[2]));
    expect(radii[0]).toBeGreaterThan(radii[1]);
    expect(radii[1]).toBeGreaterThan(radii[2]);
    expect(svg).toContain("#ff375f");
    expect(svg).toContain("#30d158");
    expect(svg).toContain("#0a84ff");
    expect(svg).toContain("Move 530");
    expect(svg).not.toContain("ck-chart-error");
  });

  it("CK3010 warns when rings are set on a bar", () => {
    const spec = {
      version: "1",
      type: "bar",
      data: [
        { lane: "A", n: 2 },
        { lane: "B", n: 5 },
      ],
      encoding: { x: "lane", y: "n" },
      mark: { rings: [{ value: 1, max: 2, color: "#ff375f" }] },
      a11y: { alt },
    };
    const result = validate(spec);
    expect(result.ok).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "CK3010" && warning.path === "/mark/rings")).toBe(true);
  });

  it("CK3081 warns on a bad ring list and still draws the single metric ring", () => {
    const spec = rings({ mark: { rings: [{ value: -1, max: 8, color: "#ff375f" }] } });
    const result = validate(spec);
    expect(result.ok).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "CK3081" && warning.path === "/mark/rings")).toBe(true);
    const svg = render(spec);
    expect(svg).not.toContain('data-ck-mark="ring"');
    expect(svg).toContain("<path");
  });
});

describe("encoding.volume", () => {
  const candles = [
    { day: "D1", open: 10, high: 12, low: 9, close: 11, volume: 40 },
    { day: "D2", open: 11, high: 13, low: 8, close: 9, volume: 80 },
  ];

  it("draws volume bars under the candles", () => {
    const spec = {
      version: "1",
      type: "candlestick",
      data: candles,
      encoding: { x: "day", open: "open", high: "high", low: "low", close: "close", volume: "volume" },
      a11y: { alt },
      size: { width: 420, height: 280 },
    };
    const result = validate(spec);
    expect(result.ok, JSON.stringify(result.errors)).toBe(true);
    const svg = render(spec);
    const yOf = (mark: string) =>
      [...svg.matchAll(new RegExp(`data-ck-mark="${mark}"[^>]* y="([^"]+)"`, "g"))].map((item) => Number(item[1]));
    const candleY = yOf("candle");
    const volumeY = yOf("volume");
    expect(candleY.length).toBe(2);
    expect(volumeY.length).toBe(2);
    expect(Math.min(...volumeY)).toBeGreaterThan(Math.max(...candleY));
  });

  it("CK3084 warns when volume is set on a line", () => {
    const spec = {
      version: "1",
      type: "line",
      data: candles,
      encoding: { x: "day", y: "close", volume: "volume" },
      a11y: { alt },
    };
    const result = validate(spec);
    expect(result.ok).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "CK3084" && warning.path === "/encoding/volume")).toBe(true);
    expect(repair(spec).spec).toMatchObject({ encoding: { volume: "volume" } });
  });
});

describe("metric.thresholds", () => {
  function kpi(value: number) {
    return {
      version: "1",
      type: "kpi",
      metric: {
        label: "Churn",
        value,
        delta: -0.08,
        thresholds: [
          { value: 0, color: "#1f8a70" },
          { value: 3, color: "#f4b183" },
          { value: 5, color: "#d92d20" },
        ],
      },
      a11y: { alt },
      size: { width: 300, height: 96 },
    };
  }

  it("colours the surface from the last step at or below the value", () => {
    const low = render(kpi(2.4));
    const high = render(kpi(6));
    expect(low).toContain('data-ck-threshold="#1f8a70"');
    expect(low).toContain('fill="#1f8a70"');
    expect(high).toContain('data-ck-threshold="#d92d20"');
    expect(validate(kpi(2.4)).ok).toBe(true);
  });

  it("uses the first step when the value is below every cut", () => {
    const spec = kpi(-1);
    expect(render(spec)).toContain('data-ck-threshold="#1f8a70"');
  });

  it("CK3082 warns on a bad step list and leaves the surface alone", () => {
    const spec = kpi(2.4);
    spec.metric.thresholds = [
      { value: 0, color: "#1f8a70" },
      { value: 0, color: "#d92d20" },
    ];
    const result = validate(spec);
    expect(result.ok).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "CK3082")).toBe(true);
    expect(render(spec)).not.toContain("data-ck-threshold");
  });

  it("CK3083 warns when thresholds are set on a gauge", () => {
    const spec = {
      version: "1",
      type: "gauge",
      metric: { label: "Load", value: 64, min: 0, max: 100, thresholds: [{ value: 0, color: "#1f8a70" }] },
      a11y: { alt },
    };
    const result = validate(spec);
    expect(result.ok).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "CK3083" && warning.path === "/metric/thresholds")).toBe(true);
  });
});
