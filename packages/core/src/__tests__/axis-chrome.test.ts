import { describe, expect, it } from "vitest";
import { render } from "../extra";

const alt = "Axis chrome is visible on this chart.";

const histogram = {
  version: "1",
  type: "histogram",
  data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 4 }, { score: 8 }],
  encoding: { x: "score" },
  a11y: { alt },
};

describe("extra axis chrome", () => {
  it("rotates histogram labels, draws an x grid, and colors the axis line", () => {
    const plain = render(histogram) ?? "";
    const styled = render({
      ...histogram,
      axes: {
        x: { rotate: -40, grid: "dotted", line: { color: "#ff00aa", width: 2 }, tickMarks: "outside", tickLength: 8 },
        y: { position: "right", tickMarks: "inside" },
      },
    }) ?? "";
    expect(plain).not.toContain("rotate(");
    expect(plain).not.toContain('stroke="#ff00aa"');
    expect(styled).toContain("rotate(-40");
    expect(styled).toContain('stroke="#ff00aa"');
    expect(styled).toContain('stroke-dasharray="1 3"');
    expect(styled).toContain('stroke-width="2"');
  });

  it("hides the histogram axis line when axes.x.line is false", () => {
    const plain = render(histogram) ?? "";
    const hidden = render({ ...histogram, axes: { x: { line: false } } }) ?? "";
    const plainLines = plain.match(/<line /g)?.length ?? 0;
    const hiddenLines = hidden.match(/<line /g)?.length ?? 0;
    expect(hiddenLines).toBeLessThan(plainLines);
  });
});
