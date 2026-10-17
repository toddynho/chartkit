import { cleanup, render } from "@testing-library/svelte";
import { afterEach, describe, expect, it } from "vitest";
import Chart from "../Chart.svelte";
import { comboSpec, coreSvg, heatmapSpec, lineSpec } from "./specs";

afterEach(() => cleanup());

describe("Svelte Chart", () => {
  it("mounts the core SVG", () => {
    const { container } = render(Chart, { spec: lineSpec });
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("data-ck-type")).toBe("line");
    expect(svg?.getAttribute("aria-label")).toBe(lineSpec.a11y.alt);
    expect(container.textContent).toContain("Q1");
  });

  it("updates in place when the spec changes", async () => {
    let calls = 0;
    const draw = (spec: typeof lineSpec) => {
      calls += 1;
      return coreSvg(spec);
    };
    const { container, rerender } = render(Chart, { spec: lineSpec, render: draw });
    const node = container.querySelector("div");
    expect(calls).toBe(1);
    await rerender({ spec: lineSpec, render: draw });
    const afterSame = calls;
    await rerender({ spec: comboSpec, render: draw });
    expect(container.querySelector("div")).toBe(node);
    expect(container.querySelector("svg")?.getAttribute("data-ck-type")).toBe("combo");
    expect(container.textContent).toContain("Jan");
    expect(calls).toBe(afterSame + 1);
  });

  it("removes the SVG on unmount", () => {
    const { container, unmount } = render(Chart, { spec: heatmapSpec });
    expect(container.querySelector("svg")).toBeTruthy();
    unmount();
    expect(container.querySelector("svg")).toBeNull();
    expect(container.innerHTML).toBe("");
  });
});
