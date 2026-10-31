// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import { render } from "../all";
import { lastPaintProfile, paintSpec } from "../canvas/paint";
import { attach, patchSvg, type InteractSpec } from "../interact";
import { motionMs, MOTION_ROWS } from "../motion";
import { validate } from "../validate";

const alt = "Output by region, used to exercise update motion.";

function media(reduce: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("reduce"),
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
}

function bars(rows: { region: string; output: number }[], extra: Record<string, unknown> = {}): InteractSpec {
  return {
    version: "1",
    type: "bar",
    title: "Output",
    data: rows,
    encoding: { x: "region", y: "output" },
    motion: "auto",
    a11y: { alt },
    ...extra,
  };
}

const regions = [
  { region: "North", output: 42 },
  { region: "South", output: 35 },
  { region: "East", output: 48 },
  { region: "West", output: 51 },
  { region: "Central", output: 28 },
  { region: "Harbor", output: 50 },
];

function hostOf(spec: InteractSpec): HTMLDivElement {
  const host = document.createElement("div");
  document.body.append(host);
  patchSvg(host, render(spec));
  return host;
}

function framesOf(): { at(time: number): void } {
  const queued: FrameRequestCallback[] = [];
  window.requestAnimationFrame = (cb) => {
    queued.push(cb);
    return queued.length;
  };
  window.cancelAnimationFrame = () => {};
  return {
    at(time: number) {
      const cb = queued[queued.length - 1];
      queued.push(cb);
      cb?.(time);
    },
  };
}

function keyY(svg: ParentNode, key: string): number {
  return Number(svg.querySelector(`[data-ck-key="${key}"]`)?.getAttribute("y"));
}

function settled(markup: string): SVGSVGElement {
  return new DOMParser().parseFromString(markup, "image/svg+xml").documentElement as unknown as SVGSVGElement;
}

describe("motion", () => {
  beforeEach(() => {
    media(false);
    document.body.innerHTML = "";
  });

  it("stays off unless the spec opts in, and render ignores it", () => {
    expect(motionMs({}, 6)).toBe(0);
    expect(motionMs({ motion: "none" }, 6)).toBe(0);
    expect(motionMs({ motion: "auto" }, 6)).toBe(320);
    expect(motionMs({ motion: { duration: 280 } }, 6)).toBe(280);
    expect(motionMs({ motion: { duration: 900 } }, 6)).toBe(800);
    expect(motionMs({ motion: { duration: 0 } }, 6)).toBe(0);
    expect(motionMs({ motion: "auto" }, MOTION_ROWS + 1)).toBe(0);
    expect(motionMs({ motion: "auto", render: "canvas" }, 6)).toBe(0);
    const spec = bars(regions);
    const still = render(spec);
    const plain = render({ ...spec, motion: undefined });
    expect(still).toBe(plain);
    expect(still).toContain('data-ck-key="b:output:Harbor"');
    expect(still).toContain('data-ck-key="x:Harbor"');
    expect(still).toContain("data-ck-yscale=");
    expect(still).not.toContain("<animate");
    expect(still).not.toContain("ck-delta");
    const checked = validate(spec);
    expect(checked.ok).toBe(true);
  });

  it("grows a changed bar and labels the percent, then commits the still render", () => {
    const clock = framesOf();
    const spec = bars(regions);
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg") as SVGSVGElement;
    const before = keyY(svg, "b:output:Harbor");
    const next = bars(regions.map((row) => (row.region === "Harbor" ? { ...row, output: 56 } : row)));
    ctl.update(next);
    expect(host.querySelector("[data-ck-delta]")?.textContent).toBe("+12%");
    expect(host.querySelector("[data-ck-motion-live]")?.textContent).toContain("Harbor");
    expect(host.querySelector("svg [data-ck-delta]")).toBeNull();
    clock.at(1000);
    clock.at(1000 + 160);
    const mid = keyY(svg, "b:output:Harbor");
    expect(mid).not.toBe(before);
    expect(mid).toBeGreaterThan(0);
    clock.at(1000 + 400);
    expect(host.querySelector("[data-ck-delta]")).toBeNull();
    const done = settled(render(next));
    expect(keyY(svg, "b:output:Harbor")).toBe(keyY(done, "b:output:Harbor"));
    expect(svg.querySelector('[data-ck-key="b:output:Harbor"]')?.getAttribute("height")).toBe(
      done.querySelector('[data-ck-key="b:output:Harbor"]')?.getAttribute("height"),
    );
    expect(svg.querySelector('[data-ck-key="b:output:Harbor"]')?.getAttribute("data-ck-value")).toBe("56");
    expect(host.querySelector("svg")).toBe(svg);
    ctl.destroy();
  });

  it("lanes category labels that would otherwise pass through each other", () => {
    const clock = framesOf();
    const spec = bars(regions);
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg") as SVGSVGElement;
    const sorted = [...regions].sort((a, b) => b.output - a.output);
    ctl.update(bars(sorted));
    const labelY = () => Array.from(svg.querySelectorAll('text[data-ck-key^="x:"]'), (node) => Number(node.getAttribute("y")));
    const start = labelY();
    clock.at(0);
    clock.at(160);
    const mid = labelY();
    expect(Math.max(...mid) - Math.min(...mid)).toBeGreaterThan(10);
    expect(Math.max(...start) - Math.min(...start)).toBeLessThan(2);
    clock.at(400);
    const end = labelY();
    expect(Math.max(...end) - Math.min(...end)).toBeLessThan(2);
    const done = settled(render(bars(sorted)));
    expect(svg.querySelector('[data-ck-key="b:output:Harbor"]')?.getAttribute("x")).toBe(
      done.querySelector('[data-ck-key="b:output:Harbor"]')?.getAttribute("x"),
    );
    expect(svg.querySelector('[data-ck-key="x:Harbor"]')?.getAttribute("x")).toBe(
      done.querySelector('[data-ck-key="x:Harbor"]')?.getAttribute("x"),
    );
    ctl.destroy();
  });

  it("keeps a new series inside the plot instead of pinning it to the top edge", () => {
    const clock = framesOf();
    const rows = [
      { month: "Jan", orders: 20, returns: 8 },
      { month: "Feb", orders: 32, returns: 9 },
      { month: "Mar", orders: 28, returns: 8 },
      { month: "Apr", orders: 24, returns: 11 },
      { month: "May", orders: 30, returns: 9 },
      { month: "Jun", orders: 22, returns: 12 },
    ];
    const spec: InteractSpec = {
      version: "1",
      type: "line",
      title: "Orders",
      data: rows.map(({ month, orders }) => ({ month, orders })),
      encoding: { x: "month", y: "orders" },
      motion: "auto",
      a11y: { alt: "Orders by month, before a rush series is added." },
    };
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg") as SVGSVGElement;
    const clip = svg.querySelector("clipPath rect")!;
    const top = Number(clip.getAttribute("y"));
    const bottom = top + Number(clip.getAttribute("height"));
    const next: InteractSpec = {
      ...spec,
      data: rows.map((row) => ({ ...row, rush: row.month === "Apr" ? 56 : row.orders - 4 })),
      encoding: { x: "month", y: ["orders", "rush"] },
      a11y: { alt: "Orders and a rush series that extends the scale." },
    };
    ctl.update(next);
    const rush = svg.querySelector('[data-ck-key="l:rush"]');
    expect(rush).toBeTruthy();
    const ys = (rush?.getAttribute("d") || "").match(/-?\d+(\.\d+)?/g)?.map(Number).filter((_, index) => index % 2 === 1) ?? [];
    expect(ys.length).toBeGreaterThan(0);
    for (const y of ys) {
      expect(y).toBeGreaterThan(top + 1);
      expect(y).toBeLessThan(bottom - 1);
    }
    clock.at(0);
    clock.at(320);
    const done = settled(render(next));
    expect(svg.querySelector('[data-ck-key="l:rush"]')?.getAttribute("d")).toBe(done.querySelector('[data-ck-key="l:rush"]')?.getAttribute("d"));
    ctl.destroy();
  });

  it("snaps for reduced motion, a zero duration, and more than 2000 rows", () => {
    media(true);
    const spec = bars(regions);
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const next = bars(regions.map((row) => (row.region === "Harbor" ? { ...row, output: 56 } : row)));
    ctl.update(next);
    expect(host.querySelector("[data-ck-delta]")).toBeNull();
    const reducedDone = settled(render(next));
    expect(keyY(host, "b:output:Harbor")).toBe(keyY(reducedDone, "b:output:Harbor"));
    ctl.destroy();

    media(false);
    const quiet = bars(regions, { motion: { duration: 0 } });
    const quietHost = hostOf(quiet);
    const quietCtl = attach(quietHost, quiet, { render });
    const quietNext = bars(regions.map((row) => ({ ...row, output: row.output + 3 })), { motion: { duration: 0 } });
    quietCtl.update(quietNext);
    expect(keyY(quietHost, "b:output:Harbor")).toBe(keyY(settled(render(quietNext)), "b:output:Harbor"));
    quietCtl.destroy();

    const rows = Array.from({ length: 2001 }, (_, i) => ({ month: `m${i}`, revenue: i % 40 }));
    const large: InteractSpec = {
      version: "1",
      type: "line",
      data: rows,
      encoding: { x: "month", y: "revenue" },
      motion: "auto",
      a11y: { alt: "A long series used to check that motion stays off." },
    };
    const largeHost = hostOf(large);
    const largeCtl = attach(largeHost, large, { render });
    const largeNext: InteractSpec = { ...large, data: rows.map((row, i) => (i === 0 ? { ...row, revenue: 80 } : row)) };
    largeCtl.update(largeNext);
    expect(largeHost.querySelector("[data-ck-delta]")).toBeNull();
    expect(largeHost.querySelector("svg")?.querySelector("path")?.getAttribute("d")).toBe(
      settled(render(largeNext)).querySelector("path")?.getAttribute("d"),
    );
    largeCtl.destroy();
  });

  it("numbers a repeated category so two bars do not share a key", () => {
    const spec = bars([
      { region: "Oak", output: 8 },
      { region: "Pine", output: 5 },
      { region: "Oak", output: 3 },
    ]);
    const svg = render(spec);
    expect(svg).toContain('data-ck-key="b:output:Oak"');
    expect(svg).toContain('data-ck-key="b:output:Oak#2"');
    expect(svg).toContain('data-ck-key="x:Oak#2"');
  });

  it("snaps when a pointer goes down during the ease", () => {
    framesOf();
    const spec = bars(regions);
    const host = hostOf(spec);
    const ctl = attach(host, spec, { render });
    const next = bars(regions.map((row) => ({ ...row, output: row.output + 4 })));
    ctl.update(next);
    expect(host.querySelector("[data-ck-delta]")).toBeTruthy();
    host.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(host.querySelector("[data-ck-delta]")).toBeNull();
    expect(keyY(host, "b:output:Harbor")).toBe(keyY(settled(render(next)), "b:output:Harbor"));
    ctl.destroy();
  });

  it("strokes a same-length canvas window without rebuilding the chrome", () => {
    const n = 300;
    const xs = new Float64Array(n);
    const ys = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      xs[i] = i;
      ys[i] = Math.sin(i / 18) * 0.8;
    }
    const spec = {
      version: "1",
      type: "line",
      title: "Live intake",
      data: { columns: { x: xs, y: ys } },
      encoding: {
        x: { field: "x", scale: { domain: [0, n - 1] } },
        y: { field: "y", scale: { domain: [-1.2, 1.2] } },
      },
      mark: { curve: "linear", points: "none" },
      legend: false,
      render: "canvas",
      size: { width: 640, height: 280 },
      a11y: { alt: "A sliding window of samples drawn on the canvas painter." },
    };
    const host = document.createElement("div");
    document.body.append(host);
    expect(paintSpec(host, spec)).toBe(true);
    const svg = host.querySelector("svg");
    const chrome = svg?.innerHTML ?? "";
    expect(chrome.length).toBeGreaterThan(100);
    const shifted = new Float64Array(n);
    for (let i = 0; i < n; i++) shifted[i] = Math.sin((i + 18) / 18) * 0.8;
    const next = { ...spec, data: { columns: { x: xs, y: shifted } } };
    expect(paintSpec(host, next)).toBe(true);
    expect(host.querySelector("svg")?.innerHTML).toBe(chrome);
    const profile = lastPaintProfile();
    expect(profile?.window).toBe(true);
    expect(profile?.dom).toBe(0);
    expect(profile?.rows).toBe(n);
  });
});
