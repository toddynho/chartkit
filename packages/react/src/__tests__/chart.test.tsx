import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Chart } from "../Chart";

const spec = {
  version: "1" as const,
  type: "bar" as const,
  data: [
    { month: "Jan", value: 10 },
    { month: "Feb", value: 20 },
  ],
  encoding: { x: "month", y: "value" },
  a11y: { alt: "February was higher than January in this sample." },
};

describe("Chart", () => {
  it("renders the core SVG for a spec", () => {
    const { container } = render(<Chart spec={spec} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("data-ck-type")).toBe("bar");
    expect(container.textContent).toContain("Jan");
  });

  it("renders a histogram spec", async () => {
    const histogram = {
      version: "1" as const,
      type: "histogram" as const,
      data: [
        { score: 1 },
        { score: 2 },
        { score: 8 },
      ],
      encoding: { x: "score" },
      mark: { bins: 2 },
      a11y: { alt: "Scores cluster at the low end." },
    };
    const { container } = render(<Chart spec={histogram} />);
    await waitFor(() => expect(container.querySelector("svg")?.getAttribute("data-ck-type")).toBe("histogram"));
    expect(container.querySelector("svg")?.getAttribute("aria-label")).toBe(histogram.a11y.alt);
  });

  it("sends a bar click through onPointClick", () => {
    const onPointClick = vi.fn();
    const { container } = render(<Chart spec={spec} onPointClick={onPointClick} />);
    const bar = [...container.querySelectorAll("rect")].find((node) => {
      const width = node.getAttribute("width");
      return width !== "100%" && width !== "10" && !node.closest("defs");
    });
    bar?.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: Number(bar.getAttribute("x")) + 4, clientY: Number(bar.getAttribute("y")) + 4 }));
    expect(onPointClick).toHaveBeenCalledTimes(1);
    expect(onPointClick.mock.calls[0][0]).toMatchObject({ series: "value", index: expect.any(Number), row: { month: expect.any(String) } });
  });

  it("uses a custom renderer when one is passed", () => {
    const { container } = render(
      <Chart spec={spec} render={() => '<svg data-ck-type="custom"></svg>'} />,
    );
    expect(container.querySelector("svg")?.getAttribute("data-ck-type")).toBe("custom");
    expect(container.textContent).not.toContain("Jan");
  });
});
