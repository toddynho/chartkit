import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
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
});
