import { describe, expect, it } from "vitest";
import { mount, renderToString } from "../index";
import { comboSpec, coreSvg, heatmapSpec, lineSpec, specs } from "./specs";

describe("vanilla mount", () => {
  it("writes the core SVG and skips a second write when the picture matches", () => {
    let writes = 0;
    let html = "";
    const el = {
      get innerHTML() {
        return html;
      },
      set innerHTML(value: string) {
        writes += 1;
        html = value;
      },
    };
    const chart = mount(el, lineSpec);
    expect(writes).toBe(1);
    expect(html).toBe(coreSvg(lineSpec));
    chart.update(lineSpec);
    expect(writes).toBe(1);
    expect(html).toBe(coreSvg(lineSpec));
    chart.update(comboSpec);
    expect(writes).toBe(2);
    expect(html).toBe(coreSvg(comboSpec));
  });

  it("clears the element on destroy and ignores later updates", () => {
    const el = { innerHTML: "" };
    const chart = mount(el, heatmapSpec);
    expect(el.innerHTML).toContain('data-ck-type="heatmap"');
    chart.destroy();
    expect(el.innerHTML).toBe("");
    chart.update(lineSpec);
    expect(el.innerHTML).toBe("");
    chart.destroy();
    expect(el.innerHTML).toBe("");
  });

  it("mounts into an element, updates, and unmounts", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const chart = mount(host, lineSpec);
    expect(host.querySelector("svg")?.getAttribute("data-ck-type")).toBe("line");
    const node = host;
    chart.update(comboSpec);
    expect(host).toBe(node);
    expect(host.querySelector("svg")?.getAttribute("data-ck-type")).toBe("combo");
    chart.destroy();
    expect(host.innerHTML).toBe("");
  });

  it("renderToString matches core for line, combo, and heatmap", () => {
    for (const spec of specs) {
      expect(renderToString(spec)).toBe(coreSvg(spec));
    }
  });
});
