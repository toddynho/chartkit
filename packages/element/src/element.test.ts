import { describe, expect, it, vi } from "vitest";
import type { ChartSpec } from "@chartkitdev/core";
import { render as renderAll } from "@chartkitdev/core/all";
import { ChartKitElement } from "./index";
import { renderToString } from "./ssr";

const lineSpec = {
  version: "1",
  type: "line",
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
  ],
  encoding: { x: "quarter", y: "units" },
  a11y: { alt: "Units rose from Q1 to Q2." },
} as const satisfies ChartSpec;

const barSpec = {
  version: "1",
  type: "bar",
  data: [
    { lane: "A", stops: 12 },
    { lane: "C", stops: 15 },
  ],
  encoding: { x: "lane", y: "stops" },
  a11y: { alt: "Lane C has more stops." },
} as const satisfies ChartSpec;

const histogramSpec = {
  version: "1",
  type: "histogram",
  data: [{ score: 1 }, { score: 2 }, { score: 2 }, { score: 8 }],
  encoding: { x: "score" },
  mark: { bins: 2 },
  a11y: { alt: "Scores cluster low." },
} as const satisfies ChartSpec;

function mount(fill?: (el: ChartKitElement) => void): ChartKitElement {
  const el = document.createElement("chart-kit") as ChartKitElement;
  fill?.(el);
  document.body.append(el);
  return el;
}

describe("<chart-kit>", () => {
  it("registers the element", () => {
    expect(customElements.get("chart-kit")).toBe(ChartKitElement);
  });

  it("draws a spec assigned to the property", () => {
    const el = mount((node) => {
      node.spec = lineSpec;
    });
    expect(el.querySelector("svg")?.getAttribute("data-ck-type")).toBe("line");
    expect(el.querySelector("svg")?.getAttribute("aria-label")).toBe(lineSpec.a11y.alt);
    el.remove();
  });

  it("draws a JSON spec attribute", () => {
    const el = mount((node) => {
      node.setAttribute("spec", JSON.stringify(barSpec));
    });
    expect(el.querySelector("svg")?.getAttribute("data-ck-type")).toBe("bar");
    el.remove();
  });

  it("draws an inline JSON script and keeps that script when the chart updates", () => {
    const el = document.createElement("chart-kit") as ChartKitElement;
    el.innerHTML = `<script type="application/json">${JSON.stringify(lineSpec)}</script>`;
    document.body.append(el);
    const script = el.querySelector("script");
    expect(el.querySelector("svg")?.getAttribute("data-ck-type")).toBe("line");
    el.spec = barSpec;
    expect(el.querySelector("svg")?.getAttribute("data-ck-type")).toBe("bar");
    expect(el.querySelector("script")).toBe(script);
    el.remove();
  });

  it("prefers the spec property over the attribute", () => {
    const el = mount((node) => {
      node.setAttribute("spec", JSON.stringify(barSpec));
      node.spec = lineSpec;
    });
    expect(el.querySelector("svg")?.getAttribute("data-ck-type")).toBe("line");
    el.remove();
  });

  it("re-renders when the spec attribute changes", () => {
    const el = mount((node) => {
      node.setAttribute("spec", JSON.stringify(lineSpec));
    });
    const svg = el.querySelector("svg");
    el.setAttribute("spec", JSON.stringify(barSpec));
    expect(el.querySelector("svg")?.getAttribute("data-ck-type")).toBe("bar");
    expect(el.querySelector("svg")).toBe(svg);
    el.remove();
  });

  it("reflects theme as an attribute and repaints with that theme", () => {
    const el = mount((node) => {
      node.spec = lineSpec;
    });
    el.theme = "midnight";
    expect(el.getAttribute("theme")).toBe("midnight");
    expect(el.querySelector("svg")?.innerHTML).toContain("#0c0c0c");
    el.theme = null;
    expect(el.hasAttribute("theme")).toBe(false);
    el.remove();
  });

  it("reflects a theme carried on the spec", () => {
    const el = mount((node) => {
      node.spec = { ...lineSpec, theme: "midnight" };
    });
    expect(el.getAttribute("theme")).toBe("midnight");
    el.remove();
  });

  it("forwards pointclick and select as events on the element", () => {
    const points: unknown[] = [];
    const selected: unknown[] = [];
    const el = mount((node) => {
      node.spec = { ...lineSpec, interaction: { select: "point" } };
    });
    el.addEventListener("pointclick", (event) => points.push((event as CustomEvent).detail));
    el.addEventListener("select", (event) => selected.push((event as CustomEvent).detail));
    el.querySelector("path")?.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 80, clientY: 40 }));
    expect(points.length).toBe(1);
    expect(points[0]).toMatchObject({ series: "units" });
    expect(selected.length).toBe(1);
    expect(selected[0]).toMatchObject({ points: [{ series: "units", index: expect.any(Number) }] });
    el.remove();
  });

  it("drops listeners and the interact marker on disconnect", () => {
    const el = mount((node) => {
      node.spec = lineSpec;
    });
    expect(el.getAttribute("data-ck-interact")).toBe("1");
    el.remove();
    expect(el.getAttribute("data-ck-interact")).toBeNull();
    el.spec = barSpec;
    expect(el.querySelector("svg")?.getAttribute("data-ck-type")).toBe("line");
  });

  it("hydrates a server-rendered SVG instead of replacing the node", () => {
    const html = renderToString(lineSpec);
    const holder = document.createElement("div");
    holder.innerHTML = html;
    const el = holder.querySelector("chart-kit") as ChartKitElement;
    const svg = el.querySelector("svg");
    const script = el.querySelector("script");
    expect(svg?.getAttribute("data-ck-type")).toBe("line");
    document.body.append(el);
    expect(el.querySelector("svg")).toBe(svg);
    expect(el.querySelector("script")).toBe(script);
    expect(el.getAttribute("data-ck-interact")).toBe("1");
    expect(svg?.getAttribute("data-ck-id")).toBe(renderAll(lineSpec).match(/data-ck-id="([^"]+)"/)?.[1]);
    expect(svg?.querySelector("path")?.getAttribute("d")).toBe(renderAll(lineSpec).match(/<path d="([^"]+)"/)?.[1]);
    el.remove();
  });

  it("draws at the element width and redraws when that width changes", () => {
    let width = 720;
    const box: { notify: (() => void) | null } = { notify: null };
    class BoxObserver {
      constructor(callback: ResizeObserverCallback) {
        box.notify = () => callback([], this as unknown as ResizeObserver);
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {
        box.notify = null;
      }
    }
    vi.stubGlobal("ResizeObserver", BoxObserver);
    const el = document.createElement("chart-kit") as ChartKitElement;
    Object.defineProperty(el, "clientWidth", { configurable: true, get: () => width });
    try {
      el.spec = lineSpec;
      document.body.append(el);
      expect(el.querySelector("svg")?.getAttribute("viewBox")).toMatch(/^0 0 720 /);
      width = 540;
      box.notify?.();
      expect(el.querySelector("svg")?.getAttribute("viewBox")).toMatch(/^0 0 540 /);
      const fitted = el.querySelector("svg");
      el.remove();
      width = 320;
      box.notify?.();
      expect(el.querySelector("svg")).toBe(fitted);
      expect(fitted?.getAttribute("viewBox")).toMatch(/^0 0 540 /);
    } finally {
      el.remove();
      vi.unstubAllGlobals();
    }
  });

  it("draws a newly added row instead of keeping the previous window", () => {
    const el = mount((node) => {
      node.spec = lineSpec;
    });
    el.spec = {
      ...lineSpec,
      data: [...lineSpec.data, { quarter: "Q3", units: 70 }],
      a11y: { alt: "Units rose through Q3." },
    };
    expect(el.querySelector("svg")?.textContent).toContain("Q3");
    expect(el.querySelector("svg")?.getAttribute("aria-label")).toBe("Units rose through Q3.");
    el.remove();
  });

  it("keeps a numeric size.width from the spec", () => {
    const el = document.createElement("chart-kit") as ChartKitElement;
    Object.defineProperty(el, "clientWidth", { configurable: true, get: () => 880 });
    el.spec = { ...lineSpec, size: { width: 400, height: 200 } };
    document.body.append(el);
    expect(el.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 400 200");
    el.remove();
  });

  it("loads a histogram on demand and skips the paint after disconnect", async () => {
    const live = mount((node) => {
      node.spec = histogramSpec;
    });
    await vi.waitFor(() => expect(live.querySelector("svg")?.getAttribute("data-ck-type")).toBe("histogram"));
    live.remove();

    const gone = document.createElement("chart-kit") as ChartKitElement;
    gone.spec = histogramSpec;
    document.body.append(gone);
    gone.remove();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(gone.querySelector("svg")).toBeNull();
  });
});
