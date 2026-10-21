/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { attach } from "../attach";
import { render } from "../render";

describe("attach", () => {
  it("shows a tooltip and selects a region from click and Enter", async () => {
    const svgText = await render({
      type: "choropleth",
      data: [{ id: "A", value: 3 }],
      encoding: { region: "id", color: "value" },
      mark: {
        geojson: {
          type: "FeatureCollection",
          features: [{ type: "Feature", id: "A", properties: { name: "Alpha" }, geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } }],
        },
      },
      a11y: { alt: "Alpha is 3." },
    });
    document.body.innerHTML = svgText;
    const svg = document.querySelector("svg");
    expect(svg).toBeTruthy();
    const selected: string[] = [];
    const detach = attach(svg as SVGSVGElement, { onSelect: (item) => selected.push(item.name) });
    const path = document.querySelector("[data-ck-name='Alpha']");
    expect(path?.getAttribute("tabindex")).toBe("0");
    path?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    path?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    path?.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 12, clientY: 14 }));
    const tip = document.querySelector("[data-ck-geo-tip]");
    expect(tip?.textContent).toContain("Alpha");
    expect(selected).toEqual(["Alpha", "Alpha"]);
    detach();
    expect(document.querySelector("[data-ck-geo-tip]")).toBeNull();
  });
});
