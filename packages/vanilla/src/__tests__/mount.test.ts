import { describe, expect, it, vi } from "vitest";
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
      mark: { curve: "linear" as const },
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
      mark: { curve: "linear" as const },
      size: { width: 400, height: 240 },
      locale: "en-US",
      a11y: { alt: "Two series" },
    };
    const chart = mount(host, live, { render });
    expect(host.textContent).toContain("Beta");
    expect(host.textContent).not.toContain("Beta (renamed)");
    live.mark.curve = "step";
    live.encoding.y[1].title = "Beta (renamed)";
    live.data[0].a = 8;
    chart.update(live);
    expect(host.textContent).toContain("Beta (renamed)");
    const painted = host.querySelector("path")?.getAttribute("d");
    const fresh = render(structuredClone(live));
    expect(painted).toBe(fresh.match(/<path d="([^"]+)"/)?.[1]);
    expect(painted).not.toBe(linearFresh.match(/<path d="([^"]+)"/)?.[1]);
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

  it("renderToString matches core for line, combo, and heatmap", () => {
    for (const spec of [lineSpec, comboSpec, heatmapSpec]) {
      expect(renderToString(spec)).toBe(coreSvg(spec));
    }
  });

  it("SSR entry includes a histogram", () => {
    for (const spec of specs) expect(renderSsr(spec)).toBe(coreSvg(spec));
  });
});
