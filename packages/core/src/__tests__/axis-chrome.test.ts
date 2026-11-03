import { describe, expect, it } from "vitest";
import { render } from "../extra";

const alt = "Axis chrome is visible on this chart.";

function titleY(svg: string, word: string): number | null {
  const match = new RegExp(`y="([\\d.]+)"[^>]*>${word}<`).exec(svg);
  return match ? Number(match[1]) : null;
}

describe("shared axis chrome", () => {
  it("moves an extra-chart y title when titlePosition or titleRotate is set", () => {
    const spec = {
      version: "1",
      type: "histogram",
      data: [{ score: 1 }, { score: 2 }, { score: 4 }, { score: 8 }],
      encoding: { x: "score" },
      a11y: { alt },
    };
    const center = render({ ...spec, axes: { y: { title: "Count" } } }) ?? "";
    const start = render({ ...spec, axes: { y: { title: "Count", titlePosition: "start" } } }) ?? "";
    const spun = render({ ...spec, axes: { y: { title: "Count", titleRotate: 20 } } }) ?? "";
    expect(center).toContain(">Count<");
    expect(titleY(start, "Count")).not.toBe(titleY(center, "Count"));
    expect(spun).toContain("rotate(20");
    expect(center).not.toContain("rotate(20");
  });

  it("thins numeric ticks and draws minor marks on the shared axis", () => {
    const spec = {
      version: "1",
      type: "histogram",
      data: [1, 1, 1, 1, 1, 1, 8].map((score) => ({ score })),
      encoding: { x: "score" },
      a11y: { alt },
      axes: { y: { ticks: [0, 1, 2, 3, 4, 5, 6] } },
    };
    const all = render(spec) ?? "";
    const skipped = render({ ...spec, axes: { y: { ticks: [0, 1, 2, 3, 4, 5, 6], autoSkip: true } } }) ?? "";
    const minors = render({ ...spec, axes: { y: { ticks: [0, 1, 2, 3, 4, 5, 6], minorTicks: 1 } } }) ?? "";
    for (const tick of ["0", "1", "2", "3", "4", "5", "6"]) expect(all).toContain(`>${tick}<`);
    expect(skipped).not.toContain(">1<");
    expect(skipped).toContain(">0<");
    expect(minors).toContain('data-ck-minor="1"');
    expect(all).not.toContain("data-ck-minor");
  });

  it("honors an axis format and title position on scatter", () => {
    const body = {
      version: "1",
      type: "scatter",
      data: [
        { temp: 1, yield: 2 },
        { temp: 3, yield: 8 },
        { temp: 5, yield: 4 },
      ],
      encoding: { x: "temp", y: "yield" },
      a11y: { alt },
    };
    const plain = render({ ...body, axes: { y: { title: "Yield" } } }) ?? "";
    const moved = render({ ...body, axes: { y: { title: "Yield", titlePosition: "end" } } }) ?? "";
    const money = render({ ...body, axes: { y: { format: "currency" } } }) ?? "";
    expect(titleY(moved, "Yield")).not.toBe(titleY(plain, "Yield"));
    expect(money).toMatch(/\$|USD|US\$/);
    expect(plain).not.toMatch(/\$|USD|US\$/);
  });
});
