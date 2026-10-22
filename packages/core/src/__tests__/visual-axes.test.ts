/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { formatValue, parseSpecifier } from "../format";
import { attach } from "../interact";
import { render } from "../extra";
import { brokenScale } from "../svg";
import { repair, validate } from "../validate";

const alt = "The foundry load swings from a night surplus to the noon peak.";

function line(extra: Record<string, unknown> = {}) {
  return {
    version: "1",
    type: "line",
    data: [
      { bell: "Dawn", load: 12, spare: 4 },
      { bell: "Noon", load: 40, spare: 9 },
      { bell: "Dusk", load: 18, spare: 6 },
    ],
    encoding: { x: "bell", y: ["load", "spare"] },
    a11y: { alt },
    size: { width: 420, height: 240 },
    ...extra,
  };
}

function axisY(svg: string): number | null {
  const line = /<line data-ck-axis="line"[^>]*y1="([^"]+)"/.exec(svg);
  return line ? Number(line[1]) : null;
}

describe("visual axes", () => {
  it("formats d3-style specifiers", () => {
    expect(parseSpecifier(".2f")).toMatchObject({ style: "number", decimals: 2 });
    expect(formatValue(1234.5, { specifier: ".2f" }, "en-US")).toBe("1234.50");
    expect(formatValue(1234, { specifier: ",.0f" }, "en-US")).toBe("1,234");
    expect(formatValue(1234, { specifier: "$,.0f" }, "en-US")).toBe("$1,234");
    expect(formatValue(0.126, { specifier: ".1%" }, "en-US")).toBe("12.6%");
    expect(formatValue(1200, { specifier: ".2e" }, "en-US")).toBe("1.20e+3");
    expect(formatValue(1.2, { specifier: "+.1f" }, "en-US")).toBe("+1.2");
    expect(formatValue(1500, { specifier: "s" }, "en-US")).toMatch(/1\.5K|1\.5k/);
    const bad = validate(line({ encoding: { x: "bell", y: { field: "load", format: { specifier: "nope" } } } }));
    expect(bad.warnings.some((item) => item.code === "CK3058")).toBe(true);
    const guessed = validate(line({ encoding: { x: "bell", y: { field: "load", format: ",.0f" } } }));
    expect(guessed.errors.find((item) => item.path === "/encoding/y/format")?.fix?.[0]?.value).toEqual({ specifier: ",.0f" });
    expect(repair(line({ encoding: { x: "bell", y: { field: "load", format: ",.0f" } } })).ok).toBe(true);
  });

  it("templates multi-series rows, pins on tap, and widens the hit", () => {
    const spec = line({
      tooltip: {
        pin: true,
        hit: 28,
        template: "{name} {value} {unit}",
        fields: [
          { field: "load", title: "Load", format: { specifier: ",.0f" }, unit: "kW" },
          { field: "spare", title: "Spare", unit: "kW" },
        ],
      },
    });
    const host = document.createElement("div");
    document.body.append(host);
    host.innerHTML = render(spec);
    const ctl = attach(host, spec, { render });
    const svg = host.querySelector("svg")!;
    const plot = svg.querySelector("clipPath rect")!;
    const x = Number(plot.getAttribute("x")) + Number(plot.getAttribute("width")) * 0.5;
    const y = Number(plot.getAttribute("y")) + 8;
    svg.dispatchEvent(new PointerEvent("pointerdown", { clientX: x, clientY: y, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]") as HTMLElement;
    expect(tip.getAttribute("data-ck-pin")).toBe("1");
    expect(tip.textContent).toContain("kW");
    expect(tip.textContent).toContain("Load");
    expect(tip.textContent).toContain("Spare");
    expect(tip.querySelectorAll(".ck-row").length).toBe(2);
    svg.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
    expect(tip.hidden).toBe(false);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(tip.hidden).toBe(true);
    expect(tip.hasAttribute("data-ck-pin")).toBe(false);
    ctl.destroy();
    host.remove();

    const missing = validate(line({ tooltip: { template: "{nope}" } }));
    expect(missing.warnings.some((item) => item.code === "CK3059")).toBe(true);
  });

  it("draws the axis through zero, offset, minor ticks, and a break", () => {
    const spec = {
      version: "1",
      type: "line",
      data: [
        { hour: 0, load: -20 },
        { hour: 6, load: 10 },
        { hour: 12, load: 80 },
        { hour: 18, load: -5 },
      ],
      encoding: { x: { field: "hour", type: "quantitative" }, y: "load" },
      axes: {
        x: { crosses: 0, minorTicks: 1, line: true },
        y: { offset: 12, breaks: [{ from: 20, to: 60 }] },
      },
      a11y: { alt },
      size: { width: 420, height: 240 },
    };
    const svg = render(spec);
    const plain = render({ ...spec, axes: undefined });
    expect(svg).toContain('data-ck-minor="1"');
    expect(svg.split('data-ck-break="1"').length - 1).toBeGreaterThanOrEqual(2);
    const clipY = Number(/<clipPath[\s\S]*?<rect[^>]* y="([\d.]+)"/.exec(svg)?.[1]);
    const spineTop = [...svg.matchAll(/data-ck-axis="line"[^>]* y1="([\d.]+)" y2="([\d.]+)"/g)].map((mark) => Math.min(Number(mark[1]), Number(mark[2])));
    expect(Math.min(...spineTop)).toBeGreaterThan(clipY + 4);
    const cys = [...svg.matchAll(/\scy="([\d.]+)"/g)].map((mark) => Number(mark[1])).sort((a, b) => a - b);
    const full = (cys.at(-1) ?? 0) - (cys[0] ?? 0);
    const lower = (cys.at(-1) ?? 0) - (cys[1] ?? 0);
    expect(lower).toBeGreaterThan(full * 0.18);
    expect(axisY(svg)).not.toBe(axisY(plain));
    const yLabels = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((mark) => mark[0]);
    const plainLabels = [...plain.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((mark) => mark[0]);
    expect(yLabels.join("")).not.toBe(plainLabels.join(""));
    const overlap = validate({
      ...spec,
      axes: { y: { breaks: [{ from: 0, to: 30 }, { from: 20, to: 40 }] } },
    });
    expect(overlap.warnings.some((item) => item.code === "CK3069")).toBe(true);
    const flipped = validate({ ...spec, axes: { y: { breaks: [{ from: 40, to: 10 }] } } });
    expect(flipped.warnings.some((item) => item.code === "CK3061")).toBe(true);
    const lowerSpan = (share?: number) => {
      const scale = brokenScale(-40, 2800, 360, 40, [{ from: 200, to: 1800, ...(share == null ? {} : { share }) }], "linear");
      return Math.abs(scale.at(200) - scale.at(-40));
    };
    expect(lowerSpan() / 320).toBeGreaterThan(0.35);
    expect(lowerSpan() / 320).toBeLessThan(0.45);
    expect(lowerSpan(0.55)).toBeGreaterThan(lowerSpan(0.2) + 40);
  });

  it("spreads a symlog domain that crosses zero", () => {
    const rows = [
      { hour: 1, load: -40 },
      { hour: 2, load: 0 },
      { hour: 3, load: 40 },
      { hour: 4, load: 4000 },
    ];
    const spec = {
      version: "1",
      type: "line",
      data: rows,
      encoding: { x: { field: "hour", type: "quantitative" }, y: { field: "load", scale: { type: "symlog", constant: 10 } } },
      a11y: { alt },
      size: { width: 420, height: 240 },
    };
    const sym = render(spec);
    const lin = render({ ...spec, encoding: { x: spec.encoding.x, y: { field: "load" } } });
    const ys = (svg: string) => {
      const d = /<path d="([^"]+)"/.exec(svg)?.[1] ?? "";
      const out: number[] = [];
      for (const cmd of d.matchAll(/[MC]((?:\s+[-\d.]+)+)/g)) {
        const nums = cmd[1].trim().split(/\s+/).map(Number);
        const y = nums[nums.length - 1];
        if (y !== undefined) out.push(y);
      }
      return out;
    };
    const spread = (svg: string) => {
      const points = ys(svg);
      return (points[0] ?? 0) - (points[2] ?? 0);
    };
    expect(spread(sym)).toBeGreaterThan(spread(lin) * 4);
    const alias = validate({
      ...spec,
      encoding: { x: "hour", y: { field: "load", scale: { type: "asinh" } } },
    });
    expect(alias.errors.find((item) => item.code === "CK3070")?.fix?.[0]?.value).toBe("symlog");
    const constant = validate({
      ...spec,
      encoding: { x: "hour", y: { field: "load", scale: { constant: 2 } } },
    });
    expect(constant.warnings.some((item) => item.code === "CK3062")).toBe(true);
  });

  it("paints a higher z later and keeps an annotation z", () => {
    const spec = line({
      encoding: {
        x: "bell",
        y: [
          { field: "load", z: 2 },
          { field: "spare", z: 0 },
        ],
      },
      annotations: [{ type: "rule", axis: "y", value: 20, label: "Cap", z: 3 }],
    });
    const svg = render(spec);
    const strokes = [...svg.matchAll(/<path[^>]*stroke="([^"]+)"/g)].map((mark) => mark[1]);
    expect(strokes[0]).toContain("line-2");
    expect(strokes[1]).toContain("line-1");
    expect(svg).toContain('data-ck-z="3"');
    const moved = validate(line({ encoding: { x: "bell", y: [{ field: "load", zIndex: 2 }, "spare"] } }));
    expect(moved.errors.find((item) => item.code === "CK3064")?.fix?.[1]).toEqual({ op: "add", path: "/encoding/y/0/z", value: 2 });
  });

  it("eases for real and hints the other aliases", () => {
    const svg = render(line({ animation: { duration: 240, easing: "spring" } }));
    expect(svg).toContain("anim:spring");
    expect(validate(line({ animation: { easing: "spring" } })).warnings.some((item) => item.path === "/animation/easing")).toBe(false);
    const frames: FrameRequestCallback[] = [];
    const real = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => {
      frames.push(cb);
      return frames.length;
    };
    const host = document.createElement("div");
    document.body.append(host);
    const spec = line({ animation: { duration: 80, easing: "linear" } });
    host.innerHTML = render(spec);
    attach(host, spec, { render });
    const node = host.querySelector("svg") as SVGSVGElement;
    frames[0]?.(0);
    expect(node.style.transition).toContain("linear");
    expect(node.style.transition).toContain("80ms");
    const springHost = document.createElement("div");
    document.body.append(springHost);
    const spring = line({ animation: { duration: 80, easing: "spring" } });
    springHost.innerHTML = render(spring);
    attach(springHost, spring, { render });
    const springNode = springHost.querySelector("svg") as SVGSVGElement;
    frames.at(-1)?.(0);
    expect(springNode.style.transition).toContain("cubic-bezier(0.22, 1.35, 0.36, 1)");
    expect(springNode.style.transition).toContain("80ms");
    window.requestAnimationFrame = real;
    host.remove();
    springHost.remove();
  });

  it("points quantize and threshold at the colour scale, and still paints bins", () => {
    const wrong = validate(line({ encoding: { x: "bell", y: { field: "load", scale: { type: "quantize" } } } }));
    expect(wrong.errors.find((item) => item.code === "CK3063")?.hint).toContain("encoding.color.scale.type");
    const bins = render({
      version: "1",
      type: "heatmap",
      data: [
        { bell: "Dawn", room: "Kiln", load: 12 },
        { bell: "Noon", room: "Kiln", load: 40 },
        { bell: "Dusk", room: "Kiln", load: 18 },
        { bell: "Dawn", room: "Yard", load: 4 },
        { bell: "Noon", room: "Yard", load: 9 },
        { bell: "Dusk", room: "Yard", load: 6 },
      ],
      encoding: { x: "bell", y: "room", color: { field: "load", scale: { type: "threshold", thresholds: [10, 20] } } },
      a11y: { alt },
      size: { width: 420, height: 240 },
    });
    expect(bins).toContain('data-ck-scale="threshold"');
    const thresholdFills = [...bins.matchAll(/<rect[^>]*fill="(#[0-9a-f]{6})"[^>]*data-ck-scale="bin"/g)].map((mark) => mark[1]);
    expect(new Set(thresholdFills).size).toBe(3);
    const quant = render({
      version: "1",
      type: "heatmap",
      theme: "midnight",
      data: [
        { bell: "Dawn", room: "Kiln", load: -20 },
        { bell: "Noon", room: "Kiln", load: 80 },
        { bell: "Dusk", room: "Kiln", load: 400 },
        { bell: "Dawn", room: "Yard", load: 860 },
      ],
      encoding: { x: "bell", y: "room", color: { field: "load", scale: { type: "quantize", bins: 4 } } },
      a11y: { alt },
      size: { width: 480, height: 280 },
    });
    const group = /<g data-ck-scale="quantize">([\s\S]*?)<\/g>/.exec(quant)?.[1] ?? "";
    expect(group.match(/–/g)?.length).toBe(4);
    expect(group).toContain('font-size="11"');
    expect(group).toContain("-20");
    expect(group).toContain("860");
    const quantFills = [...group.matchAll(/<rect[^>]*fill="(#[0-9a-f]{6})"/g)].map((mark) => mark[1]);
    expect(new Set(quantFills).size).toBe(4);
    const zero = validate(line({ axes: { x: { position: "zero" } } }));
    expect(zero.errors.find((item) => item.code === "CK3068")?.fix).toEqual([
      { op: "remove", path: "/axes/x/position" },
      { op: "add", path: "/axes/x/crosses", value: 0 },
    ]);
    const minor = validate(line({ axes: { y: { minor: true } } }));
    expect(minor.errors.find((item) => item.code === "CK3065")?.fix?.[1]?.value).toBe(1);
    const band = render({
      version: "1",
      type: "line",
      theme: "soft",
      data: [
        { hour: 0, load: -8 },
        { hour: 2, load: 12 },
      ],
      encoding: { x: { field: "hour", type: "quantitative" }, y: "load" },
      annotations: [{ type: "band", axis: "y", from: -12, to: 0, label: "Banked" }],
      a11y: { alt },
    });
    expect(/data-ck-annotation="band"[^>]*fill="([^"]+)"/.exec(band)?.[1]).toContain("--ck-muted");
    const night = render({ ...band && {}, version: "1", type: "line", theme: "midnight", data: [{ hour: 0, load: -8 }, { hour: 2, load: 12 }], encoding: { x: { field: "hour", type: "quantitative" }, y: "load" }, annotations: [{ type: "band", axis: "y", from: -12, to: 0, label: "Banked" }], a11y: { alt } });
    expect(/data-ck-annotation="band"[^>]*fill="([^"]+)"/.exec(night)?.[1]).toContain("--ck-muted");
    const marked = render(line({
      data: [
        { bell: "a", load: 4, spare: 2 },
        { bell: "b", load: 40, spare: 6 },
        { bell: "c", load: 8, spare: 3 },
      ],
      encoding: { x: "bell", y: [{ field: "load" }, { field: "spare" }] },
      annotations: [{ type: "marker", x: "b", y: 40, label: "Peak", dx: -48, dy: 16 }],
    }));
    const box = /data-ck-annotation="marker-box" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/.exec(marked);
    const dot = /data-ck-annotation="marker" cx="([\d.]+)" cy="([\d.]+)"/.exec(marked);
    expect(box && dot).toBeTruthy();
    if (box && dot) {
      const x = Number(box[1]);
      const y = Number(box[2]);
      const w = Number(box[3]);
      const h = Number(box[4]);
      const cx = Number(dot[1]);
      const cy = Number(dot[2]);
      const covers = cx > x && cx < x + w && cy > y && cy < y + h;
      expect(covers).toBe(false);
    }
    const touch = validate(line({ tooltip: { pinTooltip: true, hitSize: 24 } }));
    expect(touch.errors.filter((item) => item.code === "CK3067")).toHaveLength(2);
  });
});
