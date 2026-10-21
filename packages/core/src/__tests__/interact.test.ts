// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "../all";
import { render as renderExtra } from "../extra";
import { attach, buildHoverIndex, lookupIndex, patchSvg, writeTooltip, type ClickDetail, type InteractSpec, type Selection } from "../interact";
import { validate } from "../validate";

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

  it("matches a fresh render for data, alt, bars, and a structure change", () => {
    const column = (n: number, shape: "jitter" | "gaps", seed: number) => {
      const xs = new Float64Array(n);
      const ys = new Float64Array(n);
      let t = 1.7e12;
      let u = seed >>> 0;
      for (let i = 0; i < n; i++) {
        u = (Math.imul(u, 1664525) + 1013904223) >>> 0;
        const unit = u / 4294967296;
        xs[i] = shape === "jitter" ? i + unit * 0.9 : t;
        ys[i] = unit * 100 + Math.sin(i / 50) * 20;
        t += i % 50 === 0 ? 8000 : 1000;
      }
      return {
        version: "1",
        type: "line",
        data: { columns: { x: xs, y: ys } },
        encoding: { x: "x", y: "y" },
        mark: { curve: "linear", points: "none" },
        size: { width: 640, height: 360 },
        locale: "en-US",
        a11y: { alt },
      };
    };
    const bar = {
      version: "1",
      type: "bar",
      data: [
        { month: "Jan", revenue: 10 },
        { month: "Feb", revenue: 12 },
        { month: "Mar", revenue: 9 },
      ],
      encoding: { x: "month", y: "revenue" },
      a11y: { alt },
    };
    const pairs: { before: InteractSpec; after: InteractSpec; samePath: boolean; dChanges?: boolean }[] = [
      {
        before: lineSpec(),
        after: lineSpec({ data: [{ month: "Jan", revenue: 11, cost: 100 }, { month: "Feb", revenue: 8, cost: 90 }, { month: "Mar", revenue: 15, cost: 70 }, { month: "Apr", revenue: 40, cost: 60 }] }),
        samePath: false,
      },
      { before: lineSpec(), after: lineSpec({ a11y: { alt: "Revenue and cost, revised." } }), samePath: false },
      { before: column(3000, "jitter", 1), after: column(3000, "jitter", 3), samePath: true, dChanges: true },
      { before: column(3000, "gaps", 1), after: column(3000, "gaps", 3), samePath: true, dChanges: true },
      {
        before: bar,
        after: { ...bar, data: [{ month: "Jan", revenue: 4 }, { month: "Feb", revenue: 18 }, { month: "Mar", revenue: 7 }] },
        samePath: false,
      },
      {
        before: lineSpec(),
        after: { ...bar, type: "combo", encoding: { x: "month", y: [{ field: "revenue", type: "bar" }] } },
        samePath: false,
      },
    ];

    for (const { before, after, samePath, dChanges } of pairs) {
      const host = document.createElement("div");
      patchSvg(host, render(before));
      const svg = host.querySelector("svg");
      const path = host.querySelector("path");
      const beforeD = path?.getAttribute("d");
      patchSvg(host, render(after));
      const fresh = document.createElement("div");
      fresh.innerHTML = render(after);
      expect(host.querySelector("svg")).toBe(svg);
      expect(host.innerHTML).toBe(fresh.innerHTML);
      if (samePath) expect(host.querySelector("path")).toBe(path);
      if (dChanges) expect(path?.getAttribute("d")).not.toBe(beforeD);
    }
  });

  it("fills an empty label and clears one that becomes empty", () => {
    const host = document.createElement("div");
    const before = `<svg xmlns="http://www.w3.org/2000/svg"><text x="1"></text><text x="2">old</text></svg>`;
    const after = `<svg xmlns="http://www.w3.org/2000/svg"><text x="1">Jan</text><text x="2"></text></svg>`;
    patchSvg(host, before);
    const text = host.querySelector("text");
    patchSvg(host, after);
    const fresh = document.createElement("div");
    fresh.innerHTML = after;
    expect(host.querySelector("text")).toBe(text);
    expect(text?.textContent).toBe("Jan");
    expect(host.innerHTML).toBe(fresh.innerHTML);
  });

  it("replaces the svg once when the tick count changes", () => {
    const host = document.createElement("div");
    let writes = 0;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    host.append(svg);
    const real = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
    Object.defineProperty(svg, "innerHTML", {
      set(value: string) {
        writes += 1;
        real?.set?.call(svg, value);
      },
      get() {
        return real?.get?.call(svg);
      },
    });
    const open = `<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 1 1"/>`;
    patchSvg(host, `${open}<text x="1">a</text></svg>`);
    writes = 0;
    const after = `${open}<text x="1">a</text><text x="2">b</text></svg>`;
    patchSvg(host, after);
    const fresh = document.createElement("div");
    fresh.innerHTML = after;
    expect(writes).toBe(1);
    expect(svg.innerHTML).toBe(fresh.querySelector("svg")!.innerHTML);
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

  it("builds the hover index in idle time and finishes it if the pointer arrives first", () => {
    const queued: IdleRequestCallback[] = [];
    const previous = globalThis.requestIdleCallback;
    const originalTimeout = globalThis.setTimeout;
    globalThis.requestIdleCallback = ((callback: IdleRequestCallback) => {
      queued.push(callback);
      return queued.length;
    }) as typeof requestIdleCallback;
    try {
      const spec = lineSpec();
      const host = hostOf(spec);
      const ctl = attach(host, spec, { render });
      expect(queued.length).toBe(1);
      const svg = host.querySelector("svg")!;
      const plot = svg.querySelector("clipPath rect")!;
      const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.875;
      svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
      expect(host.querySelector("[data-ck-tip]")?.textContent).toContain("Apr");
      ctl.destroy();

      const warmed = hostOf(spec);
      const warmCtl = attach(warmed, spec, { render });
      const pending = queued.splice(0);
      expect(pending.length).toBeGreaterThan(0);
      for (const callback of pending) callback({ didTimeout: false, timeRemaining: () => 50 });
      const warmSvg = warmed.querySelector("svg")!;
      const warmPlot = warmSvg.querySelector("clipPath rect")!;
      const warmX = Number(warmPlot.getAttribute("x")) + Number(warmPlot.getAttribute("width")) * 0.875;
      warmSvg.dispatchEvent(new PointerEvent("pointermove", { clientX: warmX, clientY: 80, bubbles: true }));
      expect(warmed.querySelector("[data-ck-tip]")?.textContent).toContain("Apr");
      warmCtl.destroy();

      const later: Array<() => void> = [];
      globalThis.setTimeout = ((fn: TimerHandler) => {
        later.push(fn as () => void);
        return 0;
      }) as typeof setTimeout;
      globalThis.requestIdleCallback = undefined as unknown as typeof requestIdleCallback;
      const fallback = hostOf(spec);
      const fallbackCtl = attach(fallback, spec, { render });
      expect(later.length).toBe(1);
      later[0]();
      const fallbackSvg = fallback.querySelector("svg")!;
      const fallbackPlot = fallbackSvg.querySelector("clipPath rect")!;
      const fallbackX = Number(fallbackPlot.getAttribute("x")) + Number(fallbackPlot.getAttribute("width")) * 0.875;
      fallbackSvg.dispatchEvent(new PointerEvent("pointermove", { clientX: fallbackX, clientY: 80, bubbles: true }));
      expect(fallback.querySelector("[data-ck-tip]")?.textContent).toContain("Apr");
      fallbackCtl.destroy();
    } finally {
      globalThis.requestIdleCallback = previous;
      globalThis.setTimeout = originalTimeout;
    }
  });

  it("stays on the chart when the phase-3 tooltip sheet sets .ck-tip to fixed", async () => {
    const { attach: attachExtra } = await import("../extra-tip");
    const extraHost = document.createElement("div");
    extraHost.innerHTML = `<svg data-ck-type="funnel" viewBox="0 0 100 40"><rect data-ck-mark="stage" aria-label="Visit: 80 (start)" x="0" y="0" width="40" height="20"/></svg>`;
    document.body.append(extraHost);
    attachExtra(extraHost);
    const host = hostOf(lineSpec());
    host.style.position = "relative";
    const ctl = attach(host, lineSpec(), { render });
    const svg = host.querySelector("svg")!;
    const plot = svg.querySelector("clipPath rect")!;
    const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.5;
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    const extra = document.querySelector("[data-ck-extra-tip]") as HTMLElement;
    expect(getComputedStyle(tip).position).toBe("absolute");
    expect(getComputedStyle(extra).position).toBe("fixed");
    ctl.destroy();
    extraHost.remove();
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

  it("paints a renamed field with that series colour in every theme, and skips a swatch for other fields", () => {
    const themes = ["soft", "midnight", "refined", "editorial"] as const;
    for (const theme of themes) {
      const spec = lineSpec({
        theme,
        data: [
          { month: "Jan", revenue: 10, cost: 100, region: "NA" },
          { month: "Feb", revenue: 12, cost: 110, region: "EU" },
          { month: "Mar", revenue: 9, cost: 90, region: "NA" },
          { month: "Apr", revenue: 14, cost: 80, region: "EU" },
        ],
        tooltip: { fields: ["cost", { field: "revenue", title: "Sales", format: "currency" }, "region"] },
      });
      const host = hostOf(spec);
      const ctl = attach(host, spec, { render });
      const svg = host.querySelector("svg")!;
      const fillOf = (name: string) => {
        const text = Array.from(svg.querySelectorAll("text")).find((node) => node.textContent === name);
        const rect = text?.previousElementSibling;
        return rect?.getAttribute("fill") ?? "";
      };
      const revenue = fillOf("revenue");
      const cost = fillOf("cost");
      expect(revenue).not.toBe("");
      expect(cost).not.toBe(revenue);
      const plot = svg.querySelector("clipPath rect")!;
      const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.5;
      svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
      const rows = Array.from(host.querySelectorAll(".ck-row"));
      const row = (label: string) => rows.find((node) => node.textContent?.includes(label));
      expect(row("Sales")?.querySelector("i")?.getAttribute("style")).toBe(`background:${revenue}`);
      expect(row("cost")?.querySelector("i")?.getAttribute("style")).toBe(`background:${cost}`);
      expect(row("Sales")?.textContent).toContain("$");
      expect(row("region")?.querySelector("i")?.getAttribute("style")).toBe("background:transparent");
      expect(revenue).not.toContain("transparent");
      expect(row("region")?.textContent).toMatch(/NA|EU/);
      if (theme === "midnight") expect(revenue).toContain("#22c55e");
      if (theme === "soft") expect(revenue).toContain("#007aff");
      if (theme === "refined") expect(revenue).toContain("#3b82f6");
      if (theme === "editorial") expect(revenue).toContain("#4f46e5");
      ctl.destroy();
      host.remove();
    }
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

  it("names one series after the chart and copies the mark colour", () => {
    const spec = {
      version: "1" as const,
      type: "line" as const,
      title: "Revenue",
      theme: "midnight" as const,
      legend: false,
      data: [
        { month: "Jan", value: 120000 },
        { month: "Jun", value: 149000 },
      ],
      encoding: { x: "month", y: { field: "value", format: { style: "compact", prefix: "$", decimals: 0 } } },
      a11y: { alt },
    };
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const stroke = svg.querySelector("path[fill='none']:not([filter])")?.getAttribute("stroke");
    const plot = svg.querySelector("clipPath rect")!;
    const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.8;
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 40, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    expect(tip.textContent).toContain("Revenue");
    expect(tip.textContent).not.toMatch(/\bvalue\b/);
    expect(tip.textContent).toContain("$149K");
    expect(stroke).toBeTruthy();
    expect(tip.innerHTML).toContain(String(stroke));
    expect(String(stroke)).toContain("#22c55e");
    ctl.destroy();
  });

  it("flips the tooltip left of a crosshair on the right half of the plot", () => {
    const spec = lineSpec({ legend: false });
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const laid = { x: 0, y: 0, left: 0, top: 0, width: 720, height: 280, right: 720, bottom: 280, toJSON() { return {}; } } as DOMRect;
    host.getBoundingClientRect = () => laid;
    svg.getBoundingClientRect = () => laid;
    const plot = svg.querySelector("clipPath rect")!;
    const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.72;
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    expect(parseFloat(tip.style.left)).toBeLessThan(x);
    ctl.destroy();
  });

  it("places a right-edge tooltip clear of the hovered bar and its neighbour", () => {
    const spec: InteractSpec = {
      version: "1",
      type: "bar",
      theme: "midnight",
      title: "Orders",
      data: [
        { month: "Jan", value: 80 },
        { month: "Feb", value: 92 },
        { month: "Mar", value: 88 },
        { month: "Apr", value: 110 },
        { month: "May", value: 104 },
        { month: "Jun", value: 121 },
      ],
      encoding: { x: "month", y: { field: "value", title: "Orders", format: { style: "integer" }, color: "series-3" } },
      legend: false,
      size: { width: 720, height: 200 },
      a11y: { alt },
    };
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const laid = { x: 0, y: 0, left: 0, top: 0, width: 720, height: 200, right: 720, bottom: 200, toJSON() { return {}; } } as DOMRect;
    host.getBoundingClientRect = () => laid;
    svg.getBoundingClientRect = () => laid;
    const plot = svg.querySelector("clipPath rect")!;
    const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.72;
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    const left = parseFloat(tip.style.left);
    const top = parseFloat(tip.style.top);
    const width = tip.offsetWidth || 160;
    const height = tip.offsetHeight || 48;
    expect(tip.textContent).toContain("Orders");
    expect(tip.textContent).toContain("104");
    expect(left + width).toBeLessThan(x + 40);
    const bars = [...svg.querySelectorAll("rect")].filter((node) => (node.getAttribute("fill") || "").includes("series"));
    for (const bar of bars) {
      const bx = Number(bar.getAttribute("x"));
      const by = Number(bar.getAttribute("y"));
      const bw = Number(bar.getAttribute("width"));
      const bh = Number(bar.getAttribute("height"));
      const overlaps = left < bx + bw && left + width > bx && top < by + bh && top + height > by;
      expect(overlaps).toBe(false);
    }
    ctl.destroy();
  });

  it("starts a line after a leading gap instead of at zero", () => {
    const n = 3000;
    const x = new Float64Array(n);
    const y = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      x[i] = i;
      y[i] = i < 600 ? Number.NaN : Math.sin(i / 12) + 2;
    }
    const svg = render({
      version: "1",
      type: "line",
      data: { columns: { x, y }, sampling: "lttb" },
      encoding: { x: "x", y: "y" },
      mark: { curve: "linear", points: "none" },
      legend: false,
      size: { width: 720, height: 280 },
      a11y: { alt },
    });
    const d = svg.match(/<path d="([^"]+)" fill="none"/)?.[1] ?? "";
    const first = Number(/^M ([\d.]+)/.exec(d)?.[1] ?? 0);
    const left = Number(/<clipPath[^>]*>\s*<rect x="([\d.]+)"/.exec(svg)?.[1] ?? 0);
    expect(first).toBeGreaterThan(left + 40);
    expect(d).not.toContain("NaN");
  });

  it("puts the hover dot on the tooltip value, not the downsampled segment", () => {
    const n = 4000;
    const xs = new Float64Array(n);
    const ys = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      xs[i] = i;
      ys[i] = (i % 2 === 0 ? 2 : 8) + (i % 17) * 0.01;
    }
    const at = 2000;
    ys[at] = 5.5;
    const spec: InteractSpec = {
      version: "1",
      type: "line",
      data: { columns: { x: xs, y: ys } },
      encoding: { x: "x", y: "y" },
      mark: { points: "none", sampling: "auto" },
      size: { width: 640, height: 360 },
      locale: "en-US",
      a11y: { alt: "A long line with one point at 5.5." },
    };
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const kept = new Set((svg.querySelector("path[data-ck-i]")?.getAttribute("data-ck-i") ?? "").split(" ").map(Number));
    expect(kept.size).toBeGreaterThan(10);
    expect(kept.has(at)).toBe(false);
    const clip = svg.querySelector("clipPath rect")!;
    const left = Number(clip.getAttribute("x"));
    const width = Number(clip.getAttribute("width"));
    const x = left + (at / (n - 1)) * width;
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 40, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    expect(tip.hidden).toBe(false);
    expect(tip.textContent).toContain("5.5");
    const dot = svg.querySelector("[data-ck-dot]");
    expect(dot).toBeTruthy();
    const ticks = Array.from(svg.querySelectorAll("text"))
      .filter((node) => node.getAttribute("text-anchor") === "end")
      .map((node) => ({ y: Number(node.getAttribute("y")) - 4, label: node.textContent ?? "" }))
      .filter((tick) => /^-?\d/.test(tick.label));
    expect(ticks.length).toBeGreaterThan(1);
    const parse = (label: string) => Number(label.replace(/,/g, ""));
    const a = ticks[0];
    const b = ticks[ticks.length - 1];
    const value = parse(a.label) + ((Number(dot?.getAttribute("cy")) - a.y) / (b.y - a.y)) * (parse(b.label) - parse(a.label));
    expect(Math.abs(value - 5.5)).toBeLessThan(0.75);
    ctl.destroy();
  });

  it("keeps the hover dot on the line when a bar series is drawn first", () => {
    const n = 2000;
    const xs = new Float64Array(n);
    const bars = new Float64Array(n);
    const ys = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      xs[i] = i;
      bars[i] = 100;
      ys[i] = i % 2 === 0 ? 2 : 8;
    }
    ys[1000] = 5.5;
    const spec: InteractSpec = {
      version: "1",
      type: "combo",
      data: { columns: { x: xs, orders: bars, rate: ys } },
      encoding: {
        x: "x",
        y: [
          { field: "orders", mark: "bar" },
          { field: "rate", mark: "line" },
        ],
      },
      mark: { points: "none", sampling: "auto" },
      size: { width: 640, height: 360 },
      locale: "en-US",
      a11y: { alt: "Bars and a downsampled line." },
    };
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const path = svg.querySelector("path[stroke]:not([stroke='none'])")!;
    expect(path.getAttribute("data-ck-ys")?.endsWith(",1")).toBe(true);
    expect(path.getAttribute("data-ck-i")?.split(" ").includes("1000")).toBe(false);
    const clip = svg.querySelector("clipPath rect")!;
    const x = Number(clip.getAttribute("x")) + (1000 / (n - 1)) * Number(clip.getAttribute("width"));
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 40, bubbles: true }));
    const dot = svg.querySelector("[data-ck-dot]");
    const ticks = Array.from(svg.querySelectorAll("text"))
      .filter((node) => node.getAttribute("text-anchor") === "end")
      .map((node) => ({ y: Number(node.getAttribute("y")) - 4, label: node.textContent ?? "" }))
      .filter((tick) => /^-?\d/.test(tick.label));
    const parse = (label: string) => Number(label.replace(/,/g, ""));
    const a = ticks[0];
    const b = ticks[ticks.length - 1];
    const value = parse(a.label) + ((Number(dot?.getAttribute("cy")) - a.y) / (b.y - a.y)) * (parse(b.label) - parse(a.label));
    expect(Math.abs(value - 5.5)).toBeLessThan(0.75);
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

  it("emits point and series clicks, selects with a modifier, and clears", () => {
    const spec = lineSpec({ interaction: { select: "point" }, a11y: { alt, keyboard: true } });
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const clicks: ClickDetail[] = [];
    const changes: Selection[] = [];
    host.addEventListener("pointclick", ((event: CustomEvent) => clicks.push(event.detail)) as EventListener);
    host.addEventListener("selectionchange", ((event: CustomEvent) => changes.push(event.detail)) as EventListener);
    const svg = host.querySelector("svg")!;
    const plot = svg.querySelector("clipPath rect")!;
    const left = Number(plot.getAttribute("x"));
    const width = Number(plot.getAttribute("width"));
    const at = (fraction: number) => left + width * fraction;
    svg.querySelector("path")!.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: at(0.1), clientY: 40 }));
    expect(clicks[0]).toMatchObject({ series: expect.any(String), index: 0 });
    expect(clicks[0].row).toMatchObject({ month: "Jan" });
    expect(clicks[0].value).toBe(clicks[0].y);
    expect(svg.querySelector("[data-ck-pick],.ck-pick")).toBeTruthy();
    expect(svg.querySelector("[data-ck-dim]")).toBeTruthy();
    svg.querySelectorAll("path")[1]!.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: at(0.9), clientY: 40, shiftKey: true }));
    expect(changes.at(-1)?.points.length).toBe(2);
    svg.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 2, clientY: 2 }));
    expect(changes.at(-1)?.points).toEqual([]);
    expect(svg.querySelector("[data-ck-dim]")).toBeNull();
    svg.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(clicks.at(-1)?.index).toBe(0);
    expect(svg.querySelector("[data-ck-pick],.ck-pick")).toBeTruthy();
    svg.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    svg.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(svg.querySelector("[data-ck-pick],[data-ck-dim]")).toBeNull();

    const seriesSpec = lineSpec({ interaction: { select: "series" } });
    const seriesHost = hostOf(seriesSpec);
    attach(seriesHost, seriesSpec, { render });
    const seriesClicks: ClickDetail[] = [];
    seriesHost.addEventListener("seriesclick", ((event: CustomEvent) => seriesClicks.push(event.detail)) as EventListener);
    const seriesSvg = seriesHost.querySelector("svg")!;
    seriesSvg.querySelector("path")!.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: at(0.5), clientY: 30 }));
    expect(seriesClicks[0].series).toBeTruthy();
    expect(seriesClicks[0].row).toBeTruthy();
    expect(seriesSvg.querySelector("[data-ck-dim]")).toBeTruthy();
    const other = [...seriesSvg.querySelectorAll("text")].find((node) => node.textContent && node.textContent !== seriesClicks[0].series);
    other?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    expect(other?.hasAttribute("data-ck-dim")).toBe(false);
    expect(seriesSvg.querySelector("[data-ck-dim]")).toBeTruthy();
    const legendClicks: ClickDetail[] = [];
    seriesHost.addEventListener("legendclick", ((event: CustomEvent) => legendClicks.push(event.detail)) as EventListener);
    other?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(legendClicks[0]).toMatchObject({ series: other?.textContent, datum: null, row: null });

    const locked = hostOf(lineSpec({ interaction: { select: "point" } }));
    const ctlLocked = attach(locked, lineSpec({ interaction: { select: "point" } }), {
      render,
      selection: { points: [{ series: "revenue", index: 1 }], series: [] },
    });
    expect(locked.querySelector("svg")?.querySelector("[data-ck-pick],.ck-pick")).toBeTruthy();
    let proposed: Selection | null = null;
    locked.addEventListener("selectionchange", ((event: CustomEvent) => {
      proposed = event.detail;
    }) as EventListener);
    locked.querySelector("path")!.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: at(0.9), clientY: 40 }));
    expect(proposed?.points[0]?.index).not.toBe(1);
    expect(locked.querySelector("[data-ck-pick]")?.getAttribute("cx")).toBeTruthy();
    ctlLocked.setSelection(proposed);
    ctl.destroy();
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
      tooltip: { crosshairLabel: true },
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
    expect(svg.querySelector("[data-ck-xlabel]")?.textContent).toBe("Feb");
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

  it("lets an adapter replace the tooltip card", () => {
    const host = hostOf(lineSpec());
    writeTooltip(host, () => "<b>Custom tip</b>");
    const ctl = attach(host, lineSpec(), { render });
    const svg = host.querySelector("svg")!;
    const plot = svg.querySelector("clipPath rect")!;
    const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.5;
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
    expect(host.querySelector("[data-ck-tip]")?.innerHTML).toBe("<b>Custom tip</b>");
    ctl.destroy();
  });

  it("names a threshold row with the colour-rule label and the line colour", () => {
    const spec: InteractSpec = {
      version: "1",
      type: "combo",
      theme: "midnight",
      data: [
        { hour: "01:00", milliamp: 74, mean: 72 },
        { hour: "03:00", milliamp: 28, mean: 36 },
      ],
      encoding: {
        x: "hour",
        y: [
          { field: "milliamp", mark: "bar", title: "Reading" },
          { field: "mean", mark: "line", title: "Three-hour mean" },
        ],
      },
      mark: {
        points: "always",
        colorRules: [
          { color: "positive", gte: 70, label: "Bright" },
          { color: "negative", lt: 40, label: "Dim" },
        ],
      },
      a11y: { alt: "A bright reading and a dim one." },
      size: { width: 420, height: 220 },
    };
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const bright = svg.querySelector('[data-ck-rule="Bright"]')!;
    expect(bright.querySelector("title")?.textContent).toBe("Bright");
    const x = Number(bright.getAttribute("cx") || bright.getAttribute("x"));
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 40, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    expect(tip.textContent).toContain("Bright");
    expect(tip.textContent).toContain("Reading");
    const line = [...svg.querySelectorAll("path")].find((node) => (node.getAttribute("stroke") ?? "").includes("--ck-line-"));
    const swatch = [...svg.querySelectorAll("text")].find((node) => node.textContent === "Three-hour mean")?.previousElementSibling;
    expect(line?.getAttribute("stroke")).toBe(swatch?.getAttribute("fill"));
    ctl.destroy();
  });
});

function salesBar(): InteractSpec {
  return {
    version: "1",
    type: "bar",
    title: "Sales",
    data: [
      { region: "North", revenue: 10 },
      { region: "South", revenue: 7 },
      { region: "East", revenue: 4 },
    ],
    encoding: { x: "region", y: "revenue" },
    a11y: { alt: "Sales by region." },
    interaction: {
      drilldown: {
        key: "region",
        children: {
          North: {
            version: "1",
            type: "bar",
            title: "North",
            data: [
              { month: "Jan", revenue: 4 },
              { month: "Feb", revenue: 6 },
            ],
            encoding: { x: "month", y: "revenue" },
            a11y: { alt: "North by month." },
          },
        },
      },
    },
  };
}

describe("interaction plus", () => {
  it("keeps the server SVG free of controls and stamps the spec", () => {
    const drill = (salesBar().interaction as { drilldown: unknown }).drilldown;
    const svg = render(lineSpec({ interaction: { navigator: { height: 48 }, sync: "sales", drilldown: drill } }));
    expect(svg).toContain('data-ck-nav="1"');
    expect(svg).toContain('data-ck-nav-h="48"');
    expect(svg).toContain('data-ck-sync="sales"');
    expect(svg).toContain('data-ck-drill="North"');
    expect(svg).not.toContain("<button");
    expect(svg).not.toContain("<nav");
    expect(svg).not.toContain("<script");
    expect(svg).not.toContain("foreignObject");
  });

  it("warns CK3034 through CK3039 and patches the spec", () => {
    const nav = validate({
      version: "1",
      type: "donut",
      data: [
        { name: "A", value: 2 },
        { name: "B", value: 3 },
      ],
      encoding: { x: "name", y: "value" },
      a11y: { alt },
      interaction: { navigator: true },
    });
    expect(nav.ok).toBe(true);
    expect(nav.warnings.find((item) => item.code === "CK3034")?.fix).toEqual([{ op: "remove", path: "/interaction/navigator" }]);

    const height = validate(lineSpec({ interaction: { navigator: { height: 10 } } }));
    expect(height.warnings.find((item) => item.code === "CK3035")?.fix?.[0]).toMatchObject({ op: "replace", value: 28 });

    const sync = validate(lineSpec({ interaction: { sync: "  " } }));
    expect(sync.warnings.find((item) => item.code === "CK3036")?.fix).toEqual([{ op: "remove", path: "/interaction/sync" }]);

    const empty = validate(lineSpec({ interaction: { drilldown: { children: {} } } }));
    expect(empty.warnings.find((item) => item.code === "CK3037")?.fix).toEqual([{ op: "remove", path: "/interaction/drilldown" }]);

    const child = validate(lineSpec({ interaction: { drilldown: { children: { North: { title: "North" } } } } }));
    expect(child.warnings.find((item) => item.code === "CK3038")?.fix?.[0]?.op).toBe("remove");

    const key = validate(lineSpec({ interaction: { drilldown: { key: "missing", children: { Jan: { type: "bar", data: [], encoding: { x: "month", y: "revenue" }, a11y: { alt } } } } } }));
    const keyWarning = key.warnings.find((item) => item.code === "CK3039");
    expect(keyWarning?.fix).toEqual([{ op: "replace", path: "/interaction/drilldown/key", value: "month" }]);
  });

  it("moves the navigator window from the keyboard", async () => {
    const spec = lineSpec({ interaction: { navigator: true, initialRange: ["Feb", "Mar"] } });
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    await ctl.ready;
    const slider = host.querySelector("[role=slider]");
    expect(slider?.getAttribute("aria-valuenow")).toBe("1");
    expect(slider?.getAttribute("aria-valuetext")).toContain("Feb");
    const overview = host.querySelector("[data-ck-overview]");
    expect(overview?.getAttribute("preserveAspectRatio")).toBe("none");
    expect(overview?.innerHTML).toContain("vector-effect");
    expect(host.querySelectorAll(".ck-nav-handle")).toHaveLength(2);
    expect(host.querySelectorAll(".ck-nav-shade")).toHaveLength(2);
    expect((slider as HTMLElement).style.left).toBe("25%");
    expect((slider as HTMLElement).style.width).toBe("75%");
    slider?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(slider?.getAttribute("aria-valuenow")).toBe("0");
    expect(host.querySelector("[data-ck-navigator] [role=slider]")).toBe(slider);
    ctl.destroy();
    expect(host.querySelector("[data-ck-navigator]")).toBeNull();
  });

  it("shares the crosshair and the x window across a sync group", async () => {
    const spec = lineSpec({ interaction: { sync: "board", zoom: "x" } });
    const left = hostOf(spec);
    const right = hostOf(spec);
    const a = attach(left, spec, { render });
    const b = attach(right, spec, { render });
    await Promise.all([a.ready, b.ready]);
    const svg = left.querySelector("svg")!;
    const plot = svg.querySelector("clipPath rect")!;
    const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.875;
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
    expect(right.querySelector("[data-ck-crosshair]")).toBeTruthy();
    expect(right.querySelector("[data-ck-tip]")?.textContent).toContain("Apr");
    const before = right.querySelector("svg path")?.getAttribute("d");
    svg.dispatchEvent(new WheelEvent("wheel", { clientX: x, clientY: 80, deltaY: -120, bubbles: true, cancelable: true }));
    expect(right.querySelector("svg path")?.getAttribute("d")).not.toBe(before);
    a.destroy();
    b.destroy();
  });

  it("drills into a child spec and comes back", () => {
    const spec = salesBar();
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const bar = [...host.querySelectorAll("rect")]
      .filter((node) => {
        const width = Number(node.getAttribute("width"));
        return width > 12 && width < 200;
      })
      .sort((a, b) => Number(a.getAttribute("x")) - Number(b.getAttribute("x")))[0]!;
    const x = Number(bar.getAttribute("x")) + Number(bar.getAttribute("width")) / 2;
    const y = Number(bar.getAttribute("y")) + 4;
    bar.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: x, clientY: y }));
    expect(host.querySelector("[data-ck-back]")?.textContent).toBe("Back");
    expect(host.querySelector("svg")?.getAttribute("aria-label")).toContain("North");
    expect(host.querySelector("[aria-current]")?.textContent).toBe("North");
    (host.querySelector("[data-ck-back]") as HTMLButtonElement).click();
    expect(host.querySelector("[data-ck-back]")).toBeNull();
    expect(host.querySelector("svg")?.textContent).toContain("Sales");
    host.querySelector("svg")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(host.querySelector("[aria-current]")?.textContent).toBe("North");
    host.querySelector("svg")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(host.querySelector("[data-ck-back]")).toBeNull();
    ctl.destroy();
  });

  it("drills a donut slice and a treemap node", () => {
    const north = {
      version: "1",
      type: "bar",
      title: "North",
      data: [{ month: "Jan", revenue: 4 }],
      encoding: { x: "month", y: "revenue" },
      a11y: { alt: "North in January." },
    };
    const donut: InteractSpec = {
      version: "1",
      type: "donut",
      data: [
        { name: "North", value: 4 },
        { name: "South", value: 2 },
      ],
      encoding: { x: "name", y: "value" },
      a11y: { alt: "North and South." },
      interaction: { drilldown: { children: { North: north } } },
    };
    const host = hostOf(donut);
    const ctl = attach(host, donut, { render });
    host.querySelector('path[data-ck-name="North"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(host.querySelector("[aria-current]")?.textContent).toBe("North");
    ctl.destroy();

    const tree: InteractSpec = {
      version: "1",
      type: "treemap",
      data: [
        { name: "North", value: 8 },
        { name: "South", value: 3 },
      ],
      encoding: { x: "name", y: "value" },
      a11y: { alt: "North is the larger region." },
      interaction: { drilldown: { children: { North: north } } },
    };
    const tiles = document.createElement("div");
    document.body.append(tiles);
    patchSvg(tiles, renderExtra(tree));
    const treeCtl = attach(tiles, tree, { render: (spec) => renderExtra(spec) });
    tiles.querySelector('rect[data-ck-name="North"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(tiles.querySelector("[aria-current]")?.textContent).toBe("North");
    treeCtl.destroy();
  });
});
