import { describe, expect, it } from "vitest";
import { render as renderAll } from "../all";
import { render as renderExtra } from "../extra";

const alt = "Color scale is visible on this chart.";

describe("quantitative color", () => {
  it("draws a titled color bar on a treemap when color is quantitative", () => {
    const spec = {
      version: "1",
      type: "treemap",
      data: [
        { name: "Oak", size: 8, group: "Wood" },
        { name: "Steel", size: 6, group: "Metal" },
      ],
      encoding: { x: "name", y: "size", color: "group" },
      a11y: { alt },
    };
    const plain = renderExtra(spec) ?? "";
    const scaled = renderExtra({
      ...spec,
      encoding: {
        x: "name",
        y: "size",
        color: { field: "group", type: "quantitative", title: "Size", format: { prefix: "~" }, scale: { type: "diverging", midpoint: 7 } },
      },
    }) ?? "";
    expect(plain).not.toContain("data-ck-scale=");
    expect(scaled).toContain('data-ck-scale="diverging"');
    expect(scaled).toContain('data-ck-scale-title="Size"');
    expect(scaled).toContain(">~");
  });

  it("paints scatter points from a numeric color field", () => {
    const spec = {
      version: "1",
      type: "scatter",
      data: [
        { x: 1, y: 2, z: 1 },
        { x: 3, y: 4, z: 9 },
      ],
      encoding: { x: "x", y: "y", color: { field: "z", type: "quantitative", scale: { scheme: "teal" } } },
      a11y: { alt },
    };
    const svg = renderAll(spec) ?? "";
    expect(svg).toContain('data-ck-scale="sequential"');
    expect(svg).toContain("#134e4a");
  });
});
