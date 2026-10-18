import { mount } from "@vue/test-utils";
import type { ChartSpec } from "@chartkitdev/core";
import { describe, expect, it } from "vitest";
import { Chart } from "../Chart";
import { renderToString } from "../ssr";
import { comboSpec, coreSvg, heatmapSpec, lineSpec, specs, svgOf } from "./specs";

describe("Vue Chart", () => {
  it("mounts the core SVG", () => {
    const wrapper = mount(Chart, { props: { spec: lineSpec } });
    const svg = wrapper.find("svg");
    expect(svg.exists()).toBe(true);
    expect(svg.attributes("data-ck-type")).toBe("line");
    expect(svg.attributes("aria-label")).toBe(lineSpec.a11y.alt);
    expect(wrapper.text()).toContain("Q1");
  });

  it("updates in place when the spec changes", async () => {
    let calls = 0;
    const render = (spec: ChartSpec) => {
      calls += 1;
      return coreSvg(spec);
    };
    const wrapper = mount(Chart, { props: { spec: lineSpec, render } });
    const node = wrapper.element;
    expect(calls).toBe(1);
    await wrapper.setProps({ spec: lineSpec, render });
    expect(calls).toBe(1);
    await wrapper.setProps({ spec: comboSpec, render });
    expect(calls).toBe(2);
    expect(wrapper.element).toBe(node);
    expect(wrapper.find("svg").attributes("data-ck-type")).toBe("combo");
    expect(wrapper.text()).toContain("Jan");
  });

  it("removes the SVG on unmount", () => {
    const wrapper = mount(Chart, { props: { spec: heatmapSpec }, attachTo: document.body });
    expect(document.body.querySelector("svg")).toBeTruthy();
    wrapper.unmount();
    expect(document.body.querySelector("svg")).toBeNull();
  });

  it("SSR HTML matches core for line, combo, and heatmap", async () => {
    for (const spec of specs) {
      const html = await renderToString(spec);
      expect(svgOf(html)).toBe(coreSvg(spec));
    }
  });
});
