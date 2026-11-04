import { describe, expect, it } from "vitest";
import { render } from "../all";

const alt = "A gauge used to check the long description.";

describe("a11y.description on the shared frame", () => {
  it("exposes the description on a gauge", () => {
    const spec = {
      version: "1" as const,
      type: "gauge" as const,
      metric: { value: 40, min: 0, max: 100, label: "Load" },
      a11y: { alt },
    };
    const base = render(spec);
    const described = render({ ...spec, a11y: { alt, description: "Capacity is a share of the plant." } });
    expect(base).not.toContain("aria-describedby");
    expect(described).toContain("aria-describedby=");
    expect(described).toContain("Capacity is a share of the plant.");
  });

  it("exposes the description on a fast-path donut", () => {
    const spec = {
      version: "1" as const,
      type: "donut" as const,
      data: [
        { name: "A", value: 1 },
        { name: "B", value: 2 },
        { name: "C", value: 3 },
        { name: "D", value: 4 },
        { name: "E", value: 5 },
      ],
      encoding: { x: "name", y: "value" },
      size: { width: 640, height: 360 },
      a11y: { alt: "Five slices.", description: "The largest slice is E." },
    };
    const svg = render(spec);
    expect(svg).toContain("The largest slice is E.");
    expect(svg).toContain("aria-describedby=");
  });
});
