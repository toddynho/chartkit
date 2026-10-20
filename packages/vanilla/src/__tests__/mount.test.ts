import { describe, expect, it, vi } from "vitest";
import type { ChartSpec } from "../../../core/src/index";
import { line } from "../../../core/src/charts/line";
import { createRenderer } from "../../../core/src/render";
import { mount, renderToString } from "../index";
import { renderToString as renderSsr } from "../ssr";
import { comboSpec, coreSvg, heatmapSpec, histogramSpec, lineSpec, specs } from "./specs";

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

  it("calls onSeriesClick with the clicked row", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const onSeriesClick = vi.fn();
    const chart = mount(host, lineSpec, { onSeriesClick });
    host.querySelector("path")?.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 80, clientY: 40 }));
    expect(onSeriesClick).toHaveBeenCalledTimes(1);
    expect(onSeriesClick.mock.calls[0][0]).toMatchObject({ series: "units", row: { quarter: "Q1" } });
    chart.destroy();
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

  it("applies in-place mark and encoding edits on render and mount().update", () => {
    const render = createRenderer([line]);
    const spec = {
      version: "1" as const,
      type: "line" as const,
      data: [
        { m: "Jan", a: 1, b: 4 },
        { m: "Feb", a: 3, b: 2 },
        { m: "Mar", a: 2, b: 5 },
      ],
      encoding: { x: "m", y: [{ field: "a", title: "Alpha" }, { field: "b", title: "Beta" }] },
      mark: { curve: "linear" as "linear" | "step" },
      size: { width: 400, height: 240 },
      locale: "en-US",
      a11y: { alt: "Two series" },
    };
    render(spec);
    spec.mark.curve = "step";
    spec.encoding.y[1].title = "Beta (renamed)";
    const actual = render(spec);
    const expected = render(structuredClone(spec));
    const linearFresh = render({ ...structuredClone(spec), mark: { curve: "linear" } });
    expect(actual).toBe(expected);
    expect(actual).toContain("Beta (renamed)");
    expect(actual).not.toBe(linearFresh);

    const host = document.createElement("div");
    document.body.append(host);
    const live = {
      version: "1" as const,
      type: "line" as const,
      data: [
        { m: "Jan", a: 1, b: 4 },
        { m: "Feb", a: 3, b: 2 },
        { m: "Mar", a: 2, b: 5 },
      ],
      encoding: { x: "m", y: [{ field: "a", title: "Alpha" }, { field: "b", title: "Beta" }] },
      mark: { curve: "linear" as "linear" | "step" },
      size: { width: 400, height: 240 },
      locale: "en-US",
      a11y: { alt: "Two series" },
    };
    const chart = mount(host, live as unknown as ChartSpec, { render });
    expect(host.textContent).toContain("Beta");
    expect(host.textContent).not.toContain("Beta (renamed)");
    live.mark.curve = "step";
    live.encoding.y[1].title = "Beta (renamed)";
    live.data[0].a = 8;
    chart.update(live as unknown as ChartSpec);
    expect(host.textContent).toContain("Beta (renamed)");
    const painted = host.querySelector("path")?.getAttribute("d");
    const fresh = render(structuredClone(live));
    expect(painted).toBe(fresh.match(/<path d="([^"]+)"/)?.[1]);
    expect(painted).not.toBe(linearFresh.match(/<path d="([^"]+)"/)?.[1]);
    chart.destroy();
    host.remove();
  });

  it("emits waterfall pointclick after the lazy draw and after a theme replaces the SVG", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const onPointClick = vi.fn();
    const spec = {
      version: "1" as const,
      type: "waterfall" as const,
      data: [
        { step: "Open", amount: 10, total: true },
        { step: "Add", amount: 4 },
        { step: "End", amount: 14, total: true },
      ],
      encoding: { x: "step", y: "amount" },
      mark: { total: "total" },
      a11y: { alt: "The total ends at 14 after one gain." },
    };
    const chart = mount(host, spec, { onPointClick });
    await vi.waitFor(() => expect(host.querySelector('[data-ck-name="Add"]')).toBeTruthy());
    const first = host.querySelector("svg");
    host.querySelector('[data-ck-name="Add"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onPointClick).toHaveBeenCalledTimes(1);
    expect(onPointClick.mock.calls[0][0]).toMatchObject({ series: "Add" });
    chart.update({ ...spec, theme: "midnight" });
    await vi.waitFor(() => expect(host.querySelector("svg")).not.toBe(first));
    host.querySelector('[data-ck-name="Add"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onPointClick).toHaveBeenCalledTimes(2);
    chart.destroy();
    host.remove();
  });

  it("loads a histogram into the element", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    mount(host, histogramSpec);
    await vi.waitFor(() => expect(host.querySelector("svg")?.getAttribute("data-ck-type")).toBe("histogram"));
    expect(host.querySelector("svg")?.getAttribute("aria-label")).toBe(histogramSpec.a11y.alt);
    host.remove();
  });

  it("appends rows in place and keeps a sliding window", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const chart = mount(host, lineSpec, { render: createRenderer([line]) });
    const svg = host.querySelector("svg");
    expect(svg?.getAttribute("data-ck-type")).toBe("line");
    const ticks = () => [...host.querySelectorAll("text")].map((node) => node.textContent);
    chart.append([{ quarter: "Q3", units: 70 }]);
    expect(host.querySelector("svg")).toBe(svg);
    expect(ticks()).toContain("Q3");
    chart.append(
      [
        { quarter: "Q4", units: 30 },
        { quarter: "Q5", units: 80 },
      ],
      { window: 2 },
    );
    expect(host.querySelector("svg")).toBe(svg);
    expect(ticks()).toEqual(expect.arrayContaining(["Q4", "Q5"]));
    expect(ticks()).not.toContain("Q1");
    expect(ticks()).not.toContain("Q3");
    chart.destroy();
    host.remove();
  });

  it("renderToString matches core for line, combo, and heatmap", () => {
    for (const spec of [lineSpec, comboSpec, heatmapSpec]) {
      expect(renderToString(spec)).toBe(coreSvg(spec));
    }
  });

  it("SSR entry includes a histogram", () => {
    for (const spec of specs) expect(renderSsr(spec)).toBe(coreSvg(spec));
  });
});
