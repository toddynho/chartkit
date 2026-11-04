import { describe, expect, it } from "vitest";
import { render } from "../all";
import { renderHistogram } from "../renderers/extra/histogram";
import { chartSize } from "../frame";

const alt = "A small chart used to check size.";

function viewBox(svg: string): string {
  return /viewBox="([^"]+)"/.exec(svg)?.[1] ?? "";
}

describe("shared chart size", () => {
  it("derives height from aspectRatio only when height is auto, and never shrinks for minHeight", () => {
    const auto = chartSize({ size: { width: 640, height: "auto", aspectRatio: 2 } }, { width: 100, height: 50 });
    expect(auto).toMatchObject({ width: 640, height: 320 });
    const fixed = chartSize({ size: { width: 640, height: 260, aspectRatio: 2 } }, { width: 100, height: 50 });
    expect(fixed.height).toBe(260);
    const floor = chartSize({ size: { width: 420, height: 220, minHeight: 400 } }, { width: 100, height: 50 });
    expect(floor.height).toBe(400);
    const shorter = chartSize({ size: { width: 420, height: 220, minHeight: 80 } }, { width: 100, height: 50 });
    expect(shorter.height).toBe(220);
  });

  it("grows a fast-path donut when minHeight exceeds the fixed height", () => {
    const spec = {
      version: "1",
      type: "donut",
      data: [
        { name: "A", value: 1 },
        { name: "B", value: 2 },
        { name: "C", value: 3 },
        { name: "D", value: 4 },
        { name: "E", value: 5 },
      ],
      encoding: { x: "name", y: "value" },
      size: { width: 640, height: 360 },
      a11y: { alt },
    };
    const base = render(spec);
    const tall = render({ ...spec, size: { width: 640, height: 360, minHeight: 500 } });
    expect(viewBox(base)).toBe("0 0 640 360");
    expect(viewBox(tall)).toBe("0 0 640 500");
  });

  it("insets padding on charts that share openChart, including one side", () => {
    const gauge = {
      version: "1",
      type: "gauge",
      metric: { value: 72, min: 0, max: 100, label: "Capacity" },
      a11y: { alt },
    };
    const base = render(gauge);
    const padded = render({ ...gauge, size: { padding: 48 } });
    const left = render({ ...gauge, size: { padding: { left: 80 } } });
    expect(base).not.toContain("data-ck-pad");
    expect(padded).toContain('data-ck-pad="1"');
    expect(padded).not.toBe(base);
    expect(left).toContain('x="80"');
    expect(left).not.toContain('y="80"');
  });

  it("insets a histogram and a sparkline, which do not share the cartesian plot padding", () => {
    const histogram = {
      version: "1",
      type: "histogram",
      data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
      encoding: { x: "score" },
      mark: { bins: 2 },
      a11y: { alt },
    };
    const plain = renderHistogram(histogram);
    const padded = renderHistogram({ ...histogram, size: { width: 560, height: 280, padding: { top: 36, right: 20 } } });
    expect(plain && padded).toBeTruthy();
    expect(plain).not.toContain("data-ck-pad");
    expect(padded).toContain('y="36"');

    const spark = {
      version: "1",
      type: "sparkline",
      data: [10, 25, 15, 30, 22, 28],
      size: { width: 200, height: 32 },
      a11y: { alt },
    };
    const line = render(spark);
    const inset = render({ ...spark, size: { width: 200, height: 32, padding: { left: 40 } } });
    expect(inset).not.toBe(line);
    expect(inset).not.toContain("data-ck-pad");
  });

  it("keeps an explicit aspect ratio on a responsive sparkline", () => {
    const svg = render({
      version: "1",
      type: "sparkline",
      data: [4, 8, 6, 9],
      size: { width: 320, height: "auto", aspectRatio: 4 },
      a11y: { alt },
    });
    expect(viewBox(svg)).toBe("0 0 320 80");
  });
});
