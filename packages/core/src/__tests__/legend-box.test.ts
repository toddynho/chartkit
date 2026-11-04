import { describe, expect, it } from "vitest";
import { render } from "../extra";

const alt = "Legend placement is visible on this chart.";

const radar = {
  version: "1",
  type: "radar",
  data: [
    { spoke: "Speed", car: 4, bike: 2 },
    { spoke: "Cost", car: 2, bike: 5 },
    { spoke: "Fun", car: 3, bike: 4 },
  ],
  encoding: { x: "spoke", y: ["car", "bike"] },
  a11y: { alt },
};

describe("shared legend box", () => {
  it("places a radar legend on the right when asked", () => {
    const plain = render(radar) ?? "";
    const moved = render({ ...radar, legend: { position: "right", symbol: "circle", title: "Modes" } }) ?? "";
    expect(plain).not.toContain('data-ck-legend="right"');
    expect(moved).toContain('data-ck-legend="right"');
    expect(moved).toContain('data-ck-legend-symbol="circle"');
    expect(moved).toContain(">Modes<");
  });

  it("prints the last series value when legend.values is on", () => {
    const plain = render(radar) ?? "";
    const valued = render({ ...radar, legend: { values: true } }) ?? "";
    expect(plain).not.toContain(">car 3<");
    expect(valued).toContain(">car 3<");
    expect(valued).toContain(">bike 4<");
  });

  it("places a radial-bar legend with an end align", () => {
    const spec = {
      version: "1",
      type: "radial-bar",
      data: [
        { desk: "A", now: 3, then: 1 },
        { desk: "B", now: 2, then: 4 },
        { desk: "C", now: 5, then: 2 },
      ],
      encoding: { x: "desk", y: ["now", "then"] },
      legend: { position: "bottom", align: "end" },
      a11y: { alt },
    };
    const svg = render(spec) ?? "";
    expect(svg).toContain('data-ck-legend="bottom"');
    expect(svg).toContain('data-ck-legend-align="end"');
  });
});
