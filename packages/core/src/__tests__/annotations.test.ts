import { describe, expect, it } from "vitest";
import { line } from "../charts/line";
import { scatter } from "../charts/scatter";
import { repair, validate } from "../validate";
import { createRenderer } from "../render";
import { render } from "../extra";

const alt = "Revenue rose, peaked, and then eased.";

function lineSpec(extra: Record<string, unknown> = {}) {
  return {
    version: "1",
    type: "line",
    data: [
      { month: "Jan", revenue: 10 },
      { month: "Feb", revenue: 40 },
      { month: "Mar", revenue: 20 },
    ],
    encoding: { x: "month", y: "revenue" },
    size: { width: 420, height: 240 },
    a11y: { alt },
    ...extra,
  };
}

function yOf(svg: string, kind: string): number | null {
  const tag = new RegExp(`<line data-ck-annotation="${kind}"[^>]* y1="([^"]+)"`).exec(svg) ?? new RegExp(`<line [^>]*data-ck-annotation="${kind}"[^>]* y1="([^"]+)"`).exec(svg);
  return tag ? Number(tag[1]) : null;
}

function boxes(svg: string): Array<{ x: number; y: number; w: number; h: number }> {
  return [...svg.matchAll(/<rect data-ck-annotation="marker-box" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g)].map((mark) => ({
    x: Number(mark[1]),
    y: Number(mark[2]),
    w: Number(mark[3]),
    h: Number(mark[4]),
  }));
}

function plotOf(svg: string): { x: number; y: number; w: number; h: number } {
  const mark = /<clipPath id="[^"]+"><rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/.exec(svg);
  if (!mark) throw new Error("missing plot");
  return { x: Number(mark[1]), y: Number(mark[2]), w: Number(mark[3]), h: Number(mark[4]) };
}

describe("annotations", () => {
  it("draws mean, median, and linear trendlines with labels", () => {
    const mean = render(lineSpec({ annotations: [{ type: "trendline", method: "mean", label: "Mean" }] }));
    const rule = render(lineSpec({ annotations: [{ type: "rule", axis: "y", value: (10 + 40 + 20) / 3, label: "Mean" }] }));
    expect(mean).toContain('data-ck-annotation="trendline"');
    expect(mean).toContain(">Mean<");
    expect(yOf(mean, "trendline")).toBeCloseTo(yOf(rule, "rule") ?? NaN, 1);

    const median = render(lineSpec({ annotations: [{ type: "trendline", method: "median" }] }));
    const medianRule = render(lineSpec({ annotations: [{ type: "rule", axis: "y", value: 20, label: "Median" }] }));
    expect(median).toContain(">Median<");
    expect(yOf(median, "trendline")).toBeCloseTo(yOf(medianRule, "rule") ?? NaN, 1);

    const linear = render(lineSpec({ annotations: [{ type: "trendline", method: "linear", label: "Trend" }] }));
    expect(linear).toContain('data-ck-method="linear"');
    expect(linear).toContain(">Trend<");
    expect(linear).not.toBe(mean);
  });

  it("draws a regression line and a confidence band, including loess", () => {
    const spec = {
      version: "1",
      type: "scatter",
      data: [
        { x: 1, y: 2 },
        { x: 2, y: 2.4 },
        { x: 3, y: 4.2 },
        { x: 4, y: 4.1 },
        { x: 5, y: 6.4 },
        { x: 6, y: 6.1 },
      ],
      encoding: { x: "x", y: "y" },
      annotations: [{ type: "regression", method: "linear", band: true, label: "Fit" }],
      size: { width: 420, height: 260 },
      a11y: { alt: "Y rises with x, around a straight fit." },
    };
    const svg = render(spec);
    expect(svg).toContain('data-ck-annotation="regression"');
    expect(svg).toContain('data-ck-annotation="regression-band"');
    expect(svg).toContain(">Fit<");
    const bare = render({ ...spec, annotations: [{ type: "regression", method: "linear", band: false, label: "Fit" }] });
    expect(bare).not.toContain("regression-band");
    const loess = render({ ...spec, annotations: [{ type: "regression", method: "loess", band: true, bandwidth: 0.6 }] });
    expect(loess).toContain('data-ck-method="loess"');
    expect(loess).toContain("regression-band");
    expect(loess).not.toBe(svg);
    expect(createRenderer([scatter])(spec)).toContain("regression-band");
  });

  it("keeps callouts inside the plot and clear of each other", () => {
    const svg = render(
      lineSpec({
        size: { width: 360, height: 220 },
        annotations: [
          { type: "marker", x: "Jan", label: "Slow open" },
          { type: "marker", x: "Feb", label: "Peak week" },
        ],
      }),
    );
    const plot = plotOf(svg);
    const marks = boxes(svg);
    expect(marks).toHaveLength(2);
    for (const box of marks) {
      expect(box.x).toBeGreaterThanOrEqual(plot.x - 0.5);
      expect(box.y).toBeGreaterThanOrEqual(plot.y - 0.5);
      expect(box.x + box.w).toBeLessThanOrEqual(plot.x + plot.w + 0.5);
      expect(box.y + box.h).toBeLessThanOrEqual(plot.y + plot.h + 0.5);
    }
    const [a, b] = marks;
    const overlap = a!.x < b!.x + b!.w && a!.x + a!.w > b!.x && a!.y < b!.y + b!.h && a!.y + a!.h > b!.y;
    expect(overlap).toBe(false);
    expect(svg).toContain('data-ck-annotation="marker"');
    expect(svg).toContain("marker-line");
    const omitted = render(lineSpec({ annotations: [{ type: "marker", x: "Feb", label: "Peak" }] }));
    const stated = render(lineSpec({ annotations: [{ type: "marker", x: "Feb", y: 40, label: "Peak" }] }));
    expect(omitted.match(/<circle data-ck-annotation="marker" cx="[^"]+" cy="([^"]+)"/)?.[1]).toBe(
      stated.match(/<circle data-ck-annotation="marker" cx="[^"]+" cy="([^"]+)"/)?.[1],
    );
  });

  it("shades axis ranges and weekend days, and stacks them with rules", () => {
    const target = render(
      lineSpec({
        axes: { y: { bands: [{ from: 15, to: 35, label: "Target", color: "#c4554a" }] } },
        annotations: [
          { type: "rule", axis: "y", value: 25, label: "Goal" },
          { type: "trendline", method: "median", label: "Median" },
          { type: "band", axis: "x", from: "Jan", to: "Feb", label: "Launch" },
        ],
      }),
    );
    expect(target).toContain('data-ck-annotation="axis-band"');
    expect(target).toContain('data-ck-annotation="rule"');
    expect(target).toContain('data-ck-annotation="trendline"');
    expect(target).toContain('data-ck-annotation="band"');
    expect(target).toContain(">Target<");
    expect(target).toContain(">Goal<");
    expect(target).toContain(">Median<");
    expect(target).toContain(">Launch<");

    const days = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 9, 5 + index));
      const iso = date.toISOString().slice(0, 10);
      return { day: iso, orders: 20 + ((index * 3) % 7) };
    });
    const weekly = render({
      version: "1",
      type: "line",
      data: days,
      encoding: { x: { field: "day", type: "temporal" }, y: "orders" },
      axes: { x: { bands: "weekends" } },
      annotations: [{ type: "trendline", method: "median", label: "Median" }],
      size: { width: 520, height: 240 },
      a11y: { alt: "Orders across two weeks, with weekends shaded." },
    });
    expect(weekly.match(/<rect data-ck-annotation="axis-band"/g)?.length).toBe(2);
    expect(weekly).toContain(">Weekend<");
    expect(weekly).toContain(">Median<");
    expect(createRenderer([line])(lineSpec({ annotations: [{ type: "trendline", method: "mean", label: "Mean" }] }))).toContain(">Mean<");
  });
});

describe("annotation repairs", () => {
  const base = lineSpec();

  it("patches type aliases, methods, reversed ranges, callouts, and weekend typos", () => {
    const trendSpec = { ...base, annotations: [{ type: "trend", method: "average" }] };
    expect(validate(trendSpec).errors.find((error) => error.code === "CK3013")?.fix?.[0]).toMatchObject({ op: "replace" });
    const trend = repair(trendSpec);
    expect(trend.ok).toBe(true);
    expect((trend.spec as { annotations: unknown[] }).annotations[0]).toMatchObject({ type: "trendline", method: "mean" });

    const method = repair({ ...base, annotations: [{ type: "regression", method: "lowess", band: true }] });
    expect(method.ok).toBe(true);
    expect((method.spec as { annotations: Array<{ method: string }> }).annotations[0]?.method).toBe("loess");

    const missing = repair({ ...base, annotations: [{ type: "trendline" }] });
    expect(missing.ok).toBe(true);
    expect((missing.spec as { annotations: Array<{ method: string }> }).annotations[0]?.method).toBe("mean");

    const swapped = repair({ ...base, annotations: [{ type: "band", axis: "y", from: 40, to: 10, label: "Zone" }] });
    expect(swapped.errors.some((error) => error.code === "CK3015") || swapped.applied.some((op) => op.path.endsWith("/from"))).toBe(true);
    expect(swapped.ok).toBe(true);
    expect((swapped.spec as { annotations: Array<{ from: number; to: number }> }).annotations[0]).toMatchObject({ from: 10, to: 40 });

    const axis = repair({ ...base, axes: { y: { bands: [{ from: 30, to: 5, label: "High" }] } } });
    expect(axis.ok).toBe(true);
    expect((axis.spec as { axes: { y: { bands: Array<{ from: number; to: number }> } } }).axes.y.bands[0]).toMatchObject({ from: 5, to: 30 });

    const callout = repair({ ...base, annotations: [{ type: "callout", x: "Feb" }] });
    expect(callout.ok).toBe(true);
    expect((callout.spec as { annotations: unknown[] }).annotations[0]).toMatchObject({ type: "marker", x: "Feb", label: "Note" });

    const noX = validate({ ...base, annotations: [{ type: "marker", label: "Note" }] });
    expect(noX.errors.some((error) => error.code === "CK3016" && error.path === "/annotations/0/x" && !error.fix)).toBe(true);

    const weekend = repair({ ...base, axes: { x: { bands: "weekend" } } });
    expect(weekend.ok).toBe(true);
    expect((weekend.spec as { axes: { x: { bands: string } } }).axes.x.bands).toBe("weekends");
    expect(weekend.warnings.some((warning) => warning.code === "CK3018")).toBe(true);

    const region = repair({ ...base, annotations: [{ type: "region", axis: "y", from: 12, to: 4, label: "Zone" }] });
    expect(region.ok).toBe(true);
    expect((region.spec as { annotations: unknown[] }).annotations[0]).toMatchObject({ type: "band", from: 4, to: 12 });

    const line = repair({ ...base, annotations: [{ type: "line", axis: "y", value: 25, label: "Goal" }] });
    expect(line.ok).toBe(true);
    expect((line.spec as { annotations: unknown[] }).annotations[0]).toMatchObject({ type: "rule", axis: "y", value: 25, label: "Goal" });
  });
});
