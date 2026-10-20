import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { line } from "../charts/line";
import { render as renderAll } from "../all";
import { render } from "../extra";
import { createRenderer } from "../render";
import { repair, validate } from "../validate";

const examples = join(dirname(fileURLToPath(import.meta.url)), "../../examples");

function load(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(examples, name), "utf8")) as Record<string, unknown>;
}

const alt = "Revenue is forecast after today.";
const months = ["Jan", "Feb", "Mar", "Apr"];
const forecast = {
  version: "1",
  type: "area-range",
  data: months.map((month, index) => ({
    month,
    revenue: 100 + index * 10,
    lo: index < 2 ? null : 80 + index * 5,
    hi: index < 2 ? null : 130 + index * 15,
  })),
  encoding: {
    x: "month",
    y: [
      { lo: "lo", hi: "hi", title: "95%" },
      { field: "revenue", title: "Forecast" },
    ],
  },
  annotations: [{ type: "rule", axis: "x", value: "Mar", label: "today" }],
  a11y: { alt },
  size: { width: 480, height: 260 },
};

describe("uncertainty charts", () => {
  it("repairs aliases and swapped or renamed bounds", () => {
    const base = { ...forecast, data: forecast.data, encoding: { x: "month", y: "revenue", low: "lo", high: "hi" }, a11y: { alt } };
    for (const [alias, type] of [
      ["arearange", "area-range"],
      ["columnrange", "bar-range"],
      ["errorbars", "errorbar"],
    ] as const) {
      const result = validate({ ...base, type: alias });
      expect(result.errors.some((error) => error.code === "CK1005")).toBe(true);
      expect(repair({ ...base, type: alias }).spec.type).toBe(type);
    }
    const swapped = validate({
      ...base,
      data: months.map((month) => ({ month, revenue: 10, lo: 8, hi: 2 })),
    });
    expect(swapped.errors.find((error) => error.code === "CK3021")?.fix).toEqual([
      { op: "replace", path: "/encoding/low", value: "hi" },
      { op: "replace", path: "/encoding/high", value: "lo" },
    ]);
    const ySeries = {
      version: "1",
      type: "area-range",
      data: [{ month: "Jan", revenue: 10, lo: 8, hi: 12 }],
      encoding: { x: "month", y: { field: "revenue", low: "lo", high: "hi" } },
      a11y: { alt },
    };
    const renamed = validate(ySeries).errors.filter((error) => error.code === "CK3022").map((error) => error.path);
    expect(renamed.sort()).toEqual(["/encoding/y/high", "/encoding/y/low"]);
    const fixed = repair(ySeries).spec as { encoding: { y: { low?: string; high?: string; lo: string; hi: string } } };
    expect(fixed.encoding.y).toMatchObject({ lo: "lo", hi: "hi" });
    expect(fixed.encoding.y.low).toBeUndefined();
    expect(fixed.encoding.y.high).toBeUndefined();
    const missing = validate({
      version: "1",
      type: "bar-range",
      data: [{ month: "Jan", revenue: 10 }],
      encoding: { x: "month" },
      a11y: { alt },
    });
    expect(missing.errors.find((error) => error.code === "CK3020")?.path).toBe("/encoding/low");
    const half = validate({
      version: "1",
      type: "line",
      data: [{ month: "Jan", revenue: 10, lo: 8 }],
      encoding: { x: "month", y: { field: "revenue", lo: "lo" } },
      a11y: { alt },
    });
    expect(half.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/encoding/y/lo")).toBe(true);
  });

  it("draws a forecast band after today, and drops the centre line when asked", () => {
    const svg = render(forecast);
    expect(svg).toContain('data-ck-type="area-range"');
    expect(svg).toContain('data-ck-mark="band"');
    expect(svg).toContain('data-ck-mark="line"');
    expect(svg).toContain("today");
    expect(svg).toContain("95%");
    expect(svg).toContain("Forecast");
    const quiet = render({ ...forecast, mark: { line: false } });
    expect(quiet).toContain('data-ck-mark="band"');
    expect(quiet).not.toContain('data-ck-mark="line"');
    expect(renderAll(forecast)).toContain("CK1010");
    expect(createRenderer([line])(forecast)).toContain("@chartkitdev/core/charts/area-range");
  });

  it("paints a combo band under a later line and includes the band in the domain", () => {
    const spec = {
      version: "1",
      type: "combo",
      data: [
        { month: "Jan", mid: 50, lo: null, hi: null },
        { month: "Feb", mid: 50, lo: 10, hi: 90 },
        { month: "Mar", mid: 50, lo: 20, hi: 80 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "mid", mark: "line", title: "Centre" },
          { lo: "lo", hi: "hi", mark: "range", title: "Band" },
        ],
      },
      a11y: { alt },
      size: { width: 420, height: 240 },
    };
    const svg = render(spec);
    const band = svg.indexOf('data-ck-mark="band"');
    const curve = svg.indexOf(" C ");
    expect(band).toBeGreaterThan(0);
    expect(curve).toBeGreaterThan(band);
    const ticks = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)]
      .map((mark) => Number(mark[1].replace(/,/g, "")))
      .filter((value) => Number.isFinite(value));
    expect(Math.max(...ticks)).toBeGreaterThanOrEqual(90);
    expect(Math.min(...ticks)).toBeLessThanOrEqual(10);
    expect(svg).toContain("Band");
  });

  it("draws floating bars from min to max", () => {
    const svg = render(load("31-bar-range.json"));
    const bars = svg.match(/data-ck-mark="range"/g) ?? [];
    expect(bars).toHaveLength(4);
    expect(svg).toContain("Jan");
    expect(svg).toContain("-2");
    expect(svg).not.toContain('data-ck-mark="bar"');
    const tops = [...svg.matchAll(/<rect\b([^>]*)>/g)]
      .filter((mark) => mark[1].includes('data-ck-mark="range"'))
      .map((mark) => Number(/y="([^"]+)"/.exec(mark[1])?.[1]));
    expect(new Set(tops).size).toBeGreaterThan(1);
  });

  it("draws whiskers on points, on bars, and from a ± field", () => {
    const points = render(load("32-errorbar.json"));
    expect(points.match(/data-ck-mark="point"/g)).toHaveLength(3);
    expect(points.match(/data-ck-mark="whisker"/g)).toHaveLength(3);
    expect(points).toContain("20.6");
    expect(points).toContain("22.2");
    const bars = render({
      version: "1",
      type: "errorbar",
      data: [
        { assay: "Glucose", mean: 5.2, delta: 0.3 },
        { assay: "Sodium", mean: 140, delta: 2 },
      ],
      encoding: { x: "assay", y: "mean", error: "delta" },
      mark: { error: "bar" },
      a11y: { alt: "Sodium is 140 plus or minus 2." },
      size: { width: 420, height: 240 },
    });
    expect(bars.match(/data-ck-mark="bar"/g)).toHaveLength(2);
    expect(bars.match(/data-ck-mark="whisker"/g)).toHaveLength(2);
    expect(bars).not.toContain('data-ck-mark="point"');
    expect(bars).toContain("138");
    expect(bars).toContain("142");
  });
});
