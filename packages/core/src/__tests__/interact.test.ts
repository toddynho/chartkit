// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "../all";
import { attach, buildHoverIndex, lookupIndex, patchSvg, type InteractSpec } from "../interact";

const alt = "Sample series used to exercise client interaction.";

function lineSpec(extra: Record<string, unknown> = {}): InteractSpec {
  return {
    version: "1",
    type: "line",
    data: [
      { month: "Jan", revenue: 10, cost: 100 },
      { month: "Feb", revenue: 12, cost: 110 },
      { month: "Mar", revenue: 9, cost: 90 },
      { month: "Apr", revenue: 14, cost: 80 },
    ],
    encoding: { x: "month", y: ["revenue", "cost"] },
    a11y: { alt },
    ...extra,
  };
}

function hostOf(spec: InteractSpec = lineSpec()): HTMLDivElement {
  const host = document.createElement("div");
  document.body.append(host);
  patchSvg(host, render(spec));
  return host;
}

describe("patchSvg", () => {
  it("updates path d on the same svg element", () => {
    const spec = lineSpec();
    const host = hostOf(spec);
    const svg = host.querySelector("svg");
    const before = svg?.querySelector("path")?.getAttribute("d");
    const next = lineSpec();
    (next.data as { revenue: number }[])[3].revenue = 40;
    patchSvg(host, render(next));
    expect(host.querySelector("svg")).toBe(svg);
    expect(svg?.querySelector("path")?.getAttribute("d")).not.toBe(before);
  });

  it("falls back to innerHTML and skips an identical string", () => {
    let html = "";
    let writes = 0;
    const el = {
      get innerHTML() {
        return html;
      },
      set innerHTML(value: string) {
        writes += 1;
        html = value;
      },
    };
    patchSvg(el, "<svg></svg>");
    patchSvg(el, "<svg></svg>");
    expect(writes).toBe(1);
    patchSvg(el, "<svg id=\"b\"></svg>");
    expect(writes).toBe(2);
    expect(html).toContain("id=\"b\"");
  });
});

describe("hover index", () => {
  it("resolves a category axis in constant time and a numeric axis by binary search", () => {
    const uniform = buildHoverIndex(100_000, 40, 560, null);
    expect(lookupIndex(uniform, 40 + (560 / 100_000) * (50_000 + 0.5))).toBe(50_000);
    const started = performance.now();
    for (let i = 0; i < 1000; i++) lookupIndex(uniform, 40 + (i % 560));
    expect(performance.now() - started).toBeLessThan(16);

    const values = new Float64Array(100_000);
    for (let i = 0; i < values.length; i++) values[i] = i;
    const numeric = buildHoverIndex(100_000, 0, 1000, values);
    const pixel = (50_000 / 99_999) * 1000;
    expect(lookupIndex(numeric, pixel)).toBe(50_000);
    const numericStarted = performance.now();
    for (let i = 0; i < 1000; i++) lookupIndex(numeric, (i / 1000) * 1000);
    expect(performance.now() - numericStarted).toBeLessThan(16);

    const messy = buildHoverIndex(3, 0, 30, [30, 10, 20]);
    expect(lookupIndex(messy, 0)).toBe(1);
    expect(lookupIndex(messy, 15)).toBe(2);
    expect(lookupIndex(messy, 30)).toBe(0);
  });
});

describe("attach", () => {
  it("keeps the static SVG free of tooltip markup", () => {
    const svg = render(lineSpec({ tooltip: true }));
    expect(svg).not.toContain("data-ck-tip");
    expect(svg).not.toContain("data-ck-interact");
  });

  it("shows every series at the nearest x, with the format preset", () => {
    const spec = lineSpec({
      encoding: {
        x: "month",
        y: [
          { field: "revenue", format: "currency" },
          "cost",
        ],
      },
    });
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const plot = svg.querySelector("clipPath rect")!;
    const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.875;
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    expect(tip.hidden).toBe(false);
    expect(tip.textContent).toContain("Apr");
    expect(tip.textContent).toContain("$14");
    expect(tip.textContent).toContain("80");
    expect(svg.querySelector("[data-ck-crosshair]")).toBeTruthy();
    ctl.destroy();
    expect(host.querySelector("[data-ck-tip]")).toBeNull();
    expect(host.hasAttribute("data-ck-interact")).toBe(false);
  });

  it("paints each series with its legend colour, right-aligns the value, and drops a hidden series", () => {
    const spec = lineSpec({ legend: { interactive: true } });
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const swatches = Array.from(svg.querySelectorAll("rect")).filter((node) => node.getAttribute("width") === "10");
    const plot = svg.querySelector("clipPath rect")!;
    const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.875;
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    expect(tip.innerHTML).toContain("ck-row");
    expect(tip.innerHTML).toContain(swatches[0].getAttribute("fill"));
    expect(tip.innerHTML).toContain(swatches[1].getAttribute("fill"));
    expect(tip.innerHTML).not.toContain("var(--ck-series-1, light-dark(#007aff,#0a84ff))");
    const dots = svg.querySelectorAll("[data-ck-dot]");
    expect(dots.length).toBe(2);
    expect(dots[0].getAttribute("fill")).toBe(swatches[0].getAttribute("fill"));
    expect(dots[1].getAttribute("fill")).toBe(swatches[1].getAttribute("fill"));
    expect(dots[0].getAttribute("cy")).not.toBe(dots[1].getAttribute("cy"));
    const cost = Array.from(svg.querySelectorAll("text")).find((node) => node.textContent === "cost");
    cost?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const costAgain = Array.from(svg.querySelectorAll("text")).find((node) => node.textContent === "cost");
    expect(costAgain?.getAttribute("opacity")).toBe("0.35");
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
    const next = host.querySelector("[data-ck-tip]") as HTMLElement;
    expect(next.textContent).toContain("revenue");
    expect(next.textContent).not.toContain("cost");
    expect(svg.querySelectorAll("[data-ck-dot]").length).toBe(1);
    svg.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
    expect(svg.querySelector("[data-ck-dot]")).toBeNull();
    ctl.destroy();
  });

  it("puts the y2 hover dot on the line, not the baseline", () => {
    const spec: InteractSpec = {
      version: "1",
      type: "combo",
      data: [
        { week: "W1", orders: 42, rate: 0.31 },
        { week: "W2", orders: 48, rate: 0.36 },
        { week: "W3", orders: 45, rate: 0.33 },
        { week: "W4", orders: 53, rate: 0.41 },
      ],
      encoding: {
        x: "week",
        y: [
          { field: "orders", mark: "bar" },
          { field: "rate", mark: "line", axis: "y2" },
        ],
      },
      axes: { y2: true },
      a11y: { alt: "Orders and the conversion rate for four weeks." },
    };
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const marks = Array.from(svg.querySelectorAll("circle")).sort(
      (a, b) => Number(a.getAttribute("cx")) - Number(b.getAttribute("cx")),
    );
    expect(marks).toHaveLength(4);
    const mark = marks[1];
    const x = Number(mark.getAttribute("cx"));
    const y = Number(mark.getAttribute("cy"));
    const plot = svg.querySelector("clipPath rect")!;
    const baseline = Number(plot.getAttribute("y")) + Number(plot.getAttribute("height"));
    expect(baseline - y).toBeGreaterThan(24);
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 40, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    expect(tip.hidden).toBe(false);
    expect(tip.textContent).toContain("0.36");
    const dots = Array.from(svg.querySelectorAll("[data-ck-dot]"));
    const lineDot = dots.find((dot) => Math.abs(Number(dot.getAttribute("cy")) - y) < 1.25);
    expect(lineDot).toBeTruthy();
    expect(Math.abs(Number(lineDot?.getAttribute("cx")) - x)).toBeLessThan(1.25);
    expect(baseline - Number(lineDot?.getAttribute("cy"))).toBeGreaterThan(24);
    ctl.destroy();
  });

  it("stays quiet when tooltip is off", () => {
    const spec = lineSpec({ tooltip: false });
    const host = hostOf(spec);
    attach(host, spec, { render });
    host.querySelector("svg")!.dispatchEvent(new PointerEvent("pointermove", { clientX: 200, clientY: 80, bubbles: true }));
    expect(host.querySelector("[data-ck-tip]")).toBeNull();
  });

  it("toggles a legend series and rescales", () => {
    const spec = lineSpec({ legend: { interactive: true } });
    const host = hostOf(spec);
    attach(host, spec, { render });
    let detail: { name?: string; hidden?: boolean } | null = null;
    host.addEventListener("legendtoggle", ((event: CustomEvent) => {
      detail = event.detail;
    }) as EventListener);
    const svg = host.querySelector("svg")!;
    const before = svg.querySelector("path")?.getAttribute("d");
    const cost = () => Array.from(svg.querySelectorAll("text")).find((node) => node.textContent === "cost");
    cost()?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(detail).toMatchObject({ name: "cost", hidden: true });
    expect(cost()?.getAttribute("opacity")).toBe("0.35");
    expect(svg.querySelector("path")?.getAttribute("d")).not.toBe(before);
    cost()?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(cost()?.getAttribute("opacity")).toBe("1");
  });

  it("zooms on the wheel, brushes a range, and resets on double-click", async () => {
    const spec = lineSpec({ interaction: { zoom: "x", brush: "x", pan: true } });
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    await ctl.ready;
    const ranges: { start: number; end: number }[] = [];
    host.addEventListener("rangechange", ((event: CustomEvent) => {
      ranges.push(event.detail);
    }) as EventListener);
    const svg = host.querySelector("svg")!;
    const before = svg.querySelector("path")?.getAttribute("d");
    svg.dispatchEvent(new WheelEvent("wheel", { clientX: 320, clientY: 100, deltaY: -400, bubbles: true, cancelable: true }));
    const zoomed = svg.querySelector("path")?.getAttribute("d");
    expect(zoomed).not.toBe(before);
    expect(ranges.at(-1)?.end).toBeLessThan(3);

    svg.dispatchEvent(new PointerEvent("pointerdown", { clientX: 120, clientY: 100, bubbles: true, button: 0, shiftKey: true }));
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: 420, clientY: 100, bubbles: true, shiftKey: true }));
    expect(svg.querySelector("[data-ck-brush]")).toBeTruthy();
    svg.dispatchEvent(new PointerEvent("pointerup", { clientX: 420, clientY: 100, bubbles: true, button: 0 }));
    expect(ranges.length).toBeGreaterThan(1);

    svg.dispatchEvent(new MouseEvent("dblclick", { clientX: 200, clientY: 100, bubbles: true }));
    expect(svg.querySelector("path")?.getAttribute("d")).toBe(before);
  });

  it("pans a zoomed line and zooms a candlestick when zoom is omitted", async () => {
    const spec = lineSpec({ interaction: { zoom: "x", pan: true } });
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    await ctl.ready;
    const svg = host.querySelector("svg")!;
    svg.dispatchEvent(new WheelEvent("wheel", { clientX: 200, clientY: 100, deltaY: -400, bubbles: true, cancelable: true }));
    const zoomed = svg.querySelector("path")?.getAttribute("d");
    svg.dispatchEvent(new PointerEvent("pointerdown", { clientX: 500, clientY: 100, bubbles: true, button: 0 }));
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: 80, clientY: 100, bubbles: true }));
    svg.dispatchEvent(new PointerEvent("pointerup", { clientX: 80, clientY: 100, bubbles: true }));
    expect(svg.querySelector("path")?.getAttribute("d")).not.toBe(zoomed);

    const candle: InteractSpec = {
      version: "1",
      type: "candlestick",
      data: [
        { day: "D1", open: 5, high: 8, low: 4, close: 7 },
        { day: "D2", open: 7, high: 9, low: 6, close: 6 },
        { day: "D3", open: 6, high: 7, low: 3, close: 4 },
        { day: "D4", open: 4, high: 6, low: 3, close: 5 },
        { day: "D5", open: 5, high: 8, low: 5, close: 8 },
        { day: "D6", open: 8, high: 9, low: 6, close: 7 },
      ],
      encoding: { x: "day", open: "open", high: "high", low: "low", close: "close" },
      a11y: { alt: "The third session closed below its open." },
    };
    const candleHost = hostOf(candle);
    const candleCtl = attach(candleHost, candle, { render });
    await candleCtl.ready;
    const candleSvg = candleHost.querySelector("svg")!;
    const mark = candleSvg.querySelector("[data-ck-mark]")?.getAttribute("d") || candleSvg.innerHTML.length;
    candleSvg.dispatchEvent(new WheelEvent("wheel", { clientX: 320, clientY: 120, deltaY: -500, bubbles: true, cancelable: true }));
    const after = candleSvg.querySelector("[data-ck-mark]")?.getAttribute("d") || candleSvg.innerHTML.length;
    expect(after).not.toBe(mark);
  });

  it("fades in when animation is on, and skips motion for reduced motion and large data", () => {
    const frames: FrameRequestCallback[] = [];
    const real = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => {
      frames.push(cb);
      return frames.length;
    };
    const spec = lineSpec({ animation: true });
    const host = hostOf(spec);
    attach(host, spec, { render });
    const svg = host.querySelector("svg") as SVGSVGElement;
    expect(svg.style.opacity).toBe("0");
    frames[0]?.(performance.now());
    expect(svg.style.transition).toContain("opacity");

    window.matchMedia = ((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
      onchange: null,
    })) as typeof window.matchMedia;
    const quiet = hostOf(lineSpec({ animation: { duration: 400 } }));
    attach(quiet, lineSpec({ animation: { duration: 400 } }), { render });
    expect((quiet.querySelector("svg") as SVGSVGElement).style.opacity).toBe("");

    const rows = Array.from({ length: 2001 }, (_, i) => ({ month: `m${i}`, revenue: i % 50 }));
    const large = {
      version: "1",
      type: "line",
      data: rows,
      encoding: { x: "month", y: "revenue" },
      animation: true,
      a11y: { alt: "A long series used to check that motion stays off." },
    };
    const largeHost = hostOf(large);
    attach(largeHost, large, { render });
    expect((largeHost.querySelector("svg") as SVGSVGElement).style.opacity).toBe("");
    window.requestAnimationFrame = real;
  });

  it("moves keyboard focus and toggles the data table", async () => {
    const spec = lineSpec({
      tooltip: true,
      a11y: { alt, keyboard: true, dataTable: true },
    });
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    await ctl.ready;
    const svg = host.querySelector("svg")!;
    expect(svg.getAttribute("tabindex")).toBe("0");
    svg.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    const live = host.querySelector("[data-ck-live]");
    expect(live?.textContent).toContain("Feb");
    expect(live?.textContent).toContain("revenue");
    const table = host.querySelector("[data-ck-table]") as HTMLElement;
    expect(table.classList.contains("ck-clip")).toBe(true);
    expect(table.textContent).toContain("110");
    (host.querySelector("[data-ck-table-btn]") as HTMLButtonElement).click();
    expect(table.classList.contains("ck-clip")).toBe(false);
  });

  it("reads a donut slice from the path under the pointer", () => {
    const spec: InteractSpec = {
      version: "1",
      type: "donut",
      data: [
        { wood: "Oak", boards: 8 },
        { wood: "Pine", boards: 5 },
        { wood: "Maple", boards: 3 },
      ],
      encoding: { x: "wood", y: "boards" },
      legend: { interactive: true },
      a11y: { alt: "Oak is the largest share of boards." },
    };
    const host = hostOf(spec);
    attach(host, spec, { render });
    const path = host.querySelector("path")!;
    path.dispatchEvent(new PointerEvent("pointermove", { clientX: 40, clientY: 40, bubbles: true }));
    expect(host.querySelector("[data-ck-tip]")?.textContent).toContain("Oak");
    const oak = Array.from(host.querySelectorAll("text")).find((node) => node.textContent === "Oak");
    oak?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const dimmed = Array.from(host.querySelectorAll("text")).find((node) => node.textContent === "Oak");
    expect(dimmed?.getAttribute("opacity")).toBe("0.35");
    expect(host.querySelectorAll("path").length).toBe(2);
  });

  it("tweens an updated path when animation is on", () => {
    const frames: FrameRequestCallback[] = [];
    window.requestAnimationFrame = (cb) => {
      frames.push(cb);
      return frames.length;
    };
    const spec = lineSpec({ animation: { duration: 80 } });
    const host = hostOf(spec);
    const svg = host.querySelector("svg")!;
    const before = svg.querySelector("path")!.getAttribute("d");
    const next = lineSpec({ animation: { duration: 80 } });
    (next.data as { revenue: number }[])[0].revenue = 30;
    const markup = render(next);
    patchSvg(host, markup, 80);
    const now = performance.now();
    frames.at(-1)?.(now);
    frames.at(-1)?.(now + 1000);
    expect(svg.querySelector("path")!.getAttribute("d")).not.toBe(before);
    expect(host.querySelector("svg")).toBe(svg);
  });
});
