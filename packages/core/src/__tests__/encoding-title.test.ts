import { describe, expect, it } from "vitest";
import { renderHistogram } from "../renderers/extra/histogram";
import { render } from "../all";

const alt = "Two groups of values.";

describe("encoding channel titles on shared axes", () => {
  it("draws an encoding.x title on a histogram", () => {
    const svg = renderHistogram({
      version: "1",
      type: "histogram",
      data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
      encoding: { x: { field: "score", title: "Score" } },
      mark: { bins: 2 },
      a11y: { alt },
    });
    expect(svg).toContain(">Score<");
  });

  it("draws an encoding.y title on a scatter plot", () => {
    const svg = render({
      version: "1",
      type: "scatter",
      data: [
        { temp: 14, yield: 2 },
        { temp: 18, yield: 5 },
      ],
      encoding: { x: "temp", y: { field: "yield", title: "Yield" } },
      a11y: { alt: "Yield against temperature." },
    });
    expect(svg).toContain(">Yield<");
  });

  it("keeps an explicit axis title ahead of the encoding title", () => {
    const svg = renderHistogram({
      version: "1",
      type: "histogram",
      data: [{ score: 1 }, { score: 4 }, { score: 9 }],
      encoding: { x: { field: "score", title: "Score" } },
      axes: { x: { title: "Bins" } },
      a11y: { alt },
    });
    expect(svg).toContain(">Bins<");
    expect(svg).not.toContain(">Score<");
  });
});
