import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { validate } from "../validate";

const alt = "A chart used to check colour-rule legends and the histogram bin label.";

function swatch(svg: string, name: string): { kind: "rect" | "circle"; fill: string } | null {
  const match = new RegExp(`<(rect|circle)\\b([^>]*)/><text\\b[^>]*>${name}</text>`).exec(svg);
  if (!match) return null;
  const fill = /fill="([^"]+)"/.exec(match[2] ?? "")?.[1] ?? "";
  return { kind: match[1] === "rect" ? "rect" : "circle", fill };
}

function barFills(svg: string, name = "Reading"): string[] {
  return [...svg.matchAll(new RegExp(`<rect\\b[^>]*fill="([^"]+)"[^>]*data-ck-name="${name}"`, "g"))].map((match) => match[1] ?? "");
}

function pointAttrs(svg: string): string[] {
  return [...svg.matchAll(/<circle\b([^>]*)>/g)]
    .map((match) => match[1] ?? "")
    .filter((attrs) => attrs.includes("data-ck-i="));
}

function pointFills(svg: string): string[] {
  return pointAttrs(svg).map((attrs) => /fill="([^"]+)"/.exec(attrs)?.[1] ?? "");
}

function attr(attrs: string, name: string): string {
  return new RegExp(`${name}="([^"]+)"`).exec(attrs)?.[1] ?? "";
}

/** Light and dark fallbacks. A single hex is one theme. */
function themeSlots(color: string): string[] {
  const paired = /light-dark\(\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)/.exec(color);
  if (paired) return [paired[1]!.toLowerCase(), paired[2]!.toLowerCase()];
  const hex = /#([0-9a-fA-F]{6})/.exec(color);
  return hex ? [`#${hex[1]!.toLowerCase()}`] : [];
}

function deltaE76(a: string, b: string): number {
  const lab = (hex: string): [number, number, number] => {
    const channel = (value: number) => {
      const c = value / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const r = channel(parseInt(hex.slice(1, 3), 16));
    const g = channel(parseInt(hex.slice(3, 5), 16));
    const b = channel(parseInt(hex.slice(5, 7), 16));
    let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    let y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
    let z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;
    x /= 0.95047;
    z /= 1.08883;
    const pivot = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const fx = pivot(x);
    const fy = pivot(y);
    const fz = pivot(z);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  };
  const left = lab(a);
  const right = lab(b);
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
}

/** Same theme slot only. Light is not compared with dark. */
function apart(rule: string, occupied: string[], threshold = 25): boolean {
  const left = themeSlots(rule);
  if (!left.length) return false;
  return occupied.every((other) => {
    const right = themeSlots(other);
    if (!right.length) return true;
    if (left.length === right.length) return left.every((hex, index) => deltaE76(hex, right[index] ?? hex) >= threshold);
    return left.every((hex) => right.every((slot) => deltaE76(hex, slot) >= threshold));
  });
}

const hours = ["20:00", "21:00", "22:00", "23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"];
const lamp = [62, 66, 70, 74, 71, 68, 44, 28, 39, 58, 69, 73];

function lampSpec(extra: Record<string, unknown> = {}) {
  return {
    version: "1",
    type: "combo",
    data: hours.map((hour, index) => ({ hour, milliamp: lamp[index] })),
    transform: [{ type: "window", field: "milliamp", size: 3, op: "mean", as: "mean" }],
    encoding: {
      x: "hour",
      y: [
        { field: "milliamp", mark: "bar", title: "Reading" },
        { field: "mean", mark: "line", title: "Three-hour mean" },
      ],
    },
    mark: {
      curve: "monotone",
      points: "always",
      colorRules: [
        { color: "positive", gte: 70, label: "Bright" },
        { color: "negative", lt: 40, label: "Dim" },
      ],
    },
    legend: { position: "top" },
    a11y: { alt },
    size: { width: 640, height: 320 },
    ...extra,
  };
}

describe("colour rules in the legend", () => {
  it("uses one square per bar colour, and outlines the points in that colour", () => {
    const svg = render(lampSpec()) ?? "";
    const bright = swatch(svg, "Bright");
    const dim = swatch(svg, "Dim");
    const reading = swatch(svg, "Reading");
    expect(reading?.kind).toBe("rect");
    expect(bright?.kind).toBe("rect");
    expect(dim?.kind).toBe("rect");
    expect(svg.match(/>Bright<\/text>/g)?.length).toBe(1);
    expect(svg.match(/>Dim<\/text>/g)?.length).toBe(1);
    const fills = barFills(svg);
    expect(fills.some((fill) => fill === bright?.fill)).toBe(true);
    expect(fills.some((fill) => fill === dim?.fill)).toBe(true);
    const ruled = pointAttrs(svg).filter((attrs) => attrs.includes("data-ck-rule="));
    expect(ruled.length).toBeGreaterThan(0);
    for (const attrs of ruled) {
      const stroke = attr(attrs, "stroke");
      expect(stroke === bright?.fill || stroke === dim?.fill).toBe(true);
      expect(attr(attrs, "fill")).toContain("--ck-surface");
      expect(attr(attrs, "fill")).not.toBe(stroke);
    }
    const legendFills = [reading?.fill, swatch(svg, "Three-hour mean")?.fill, bright?.fill, dim?.fill];
    expect(new Set(legendFills).size).toBe(legendFills.length);
  });

  it("still lists a rule that matches only the bars", () => {
    const svg =
      render({
        version: "1",
        type: "combo",
        data: [
          { hour: "a", reading: 80, mean: 55 },
          { hour: "b", reading: 50, mean: 55 },
          { hour: "c", reading: 20, mean: 55 },
        ],
        encoding: {
          x: "hour",
          y: [
            { field: "reading", mark: "bar", title: "Reading" },
            { field: "mean", mark: "line", title: "Mean" },
          ],
        },
        mark: {
          points: "always",
          colorRules: [
            { color: "positive", gte: 70, label: "Bright" },
            { color: "negative", lt: 40, label: "Dim" },
          ],
        },
        a11y: { alt },
        size: { width: 480, height: 280 },
      }) ?? "";
    const bright = swatch(svg, "Bright");
    const dim = swatch(svg, "Dim");
    expect(bright?.kind).toBe("rect");
    expect(dim?.kind).toBe("rect");
    expect(barFills(svg).some((fill) => fill === bright?.fill)).toBe(true);
    expect(barFills(svg).some((fill) => fill === dim?.fill)).toBe(true);
    expect(pointAttrs(svg).some((attrs) => attrs.includes("data-ck-rule="))).toBe(false);
  });

  it("folds mark.baseLabel into one square series entry", () => {
    const svg = render(lampSpec({ mark: { ...((lampSpec().mark as object) ?? {}), baseLabel: "Normal" } })) ?? "";
    const named = swatch(svg, "Reading: Normal");
    expect(named?.kind).toBe("rect");
    expect(svg.match(/>Reading: Normal<\/text>/g)?.length).toBe(1);
    expect(swatch(svg, "Normal")).toBeNull();
    expect(swatch(svg, "Reading")).toBeNull();
    expect(swatch(svg, "Bright")?.kind).toBe("rect");
    expect(swatch(svg, "Dim")?.kind).toBe("rect");
    const fills = [named?.fill, swatch(svg, "Three-hour mean")?.fill, swatch(svg, "Bright")?.fill, swatch(svg, "Dim")?.fill];
    expect(fills.every(Boolean)).toBe(true);
    expect(new Set(fills).size).toBe(fills.length);
    expect(barFills(svg).some((fill) => fill === named?.fill)).toBe(true);
  });

  it.each(["soft", "midnight"])("shifts a rule colour off every series colour in %s", (theme) => {
    const svg = render(lampSpec({ theme, mark: { ...((lampSpec().mark as object) ?? {}), baseLabel: "Normal" } })) ?? "";
    const occupied = [swatch(svg, "Reading: Normal")?.fill ?? "", swatch(svg, "Three-hour mean")?.fill ?? ""];
    const line = /<path\b[^>]*stroke="([^"]+)"/.exec(svg)?.[1] ?? "";
    expect(line.length).toBeGreaterThan(0);
    for (const name of ["Bright", "Dim"]) {
      const fill = swatch(svg, name)?.fill ?? "";
      expect(apart(fill, [...occupied, line])).toBe(true);
    }
    const bright = swatch(svg, "Bright")?.fill ?? "";
    const mean = swatch(svg, "Three-hour mean")?.fill ?? "";
    expect(themeSlots(bright).some((hex, index) => hex === themeSlots(mean)[index])).toBe(false);
  });

  it("keeps a point-only rule on a circle in the same colour as its swatch", () => {
    const svg =
      render({
        version: "1",
        type: "line",
        data: [
          { x: "a", y: 80 },
          { x: "b", y: 20 },
        ],
        encoding: { x: "x", y: "y" },
        mark: { points: "always", colorRules: [{ color: "positive", gte: 70, label: "Bright" }] },
        a11y: { alt },
      }) ?? "";
    const bright = swatch(svg, "Bright");
    const series = swatch(svg, "y");
    expect(bright?.kind).toBe("circle");
    expect(series?.kind).toBe("circle");
    expect(swatch(svg, "a")).toBeNull();
    expect(pointFills(svg).some((fill) => fill === bright?.fill)).toBe(true);
    expect(pointAttrs(svg).some((attrs) => attr(attrs, "fill") === "none")).toBe(false);
    expect(new Set([series?.fill, bright?.fill]).size).toBe(2);
  });

  it("shifts a point-only rule off the line series in midnight", () => {
    const svg =
      render({
        version: "1",
        type: "line",
        theme: "midnight",
        data: [
          { x: "a", y: 80 },
          { x: "b", y: 20 },
        ],
        encoding: { x: "x", y: "y" },
        mark: { points: "always", colorRules: [{ color: "positive", gte: 70, label: "Bright" }] },
        a11y: { alt },
      }) ?? "";
    const bright = swatch(svg, "Bright");
    const series = swatch(svg, "y");
    expect(bright?.kind).toBe("circle");
    expect(series?.kind).toBe("circle");
    expect(swatch(svg, "a")).toBeNull();
    expect(pointFills(svg).some((fill) => fill === bright?.fill)).toBe(true);
    expect(apart(bright?.fill ?? "", [series?.fill ?? ""])).toBe(true);
    expect(themeSlots(bright?.fill ?? "")).not.toContain("#4ade80");
  });

  it("omits rule swatches when the legend is off", () => {
    const svg = render(lampSpec({ legend: false })) ?? "";
    expect(svg).not.toContain(">Bright</text>");
    expect(svg).toContain('data-ck-rule="Bright"');
    expect(barFills(svg).some((fill) => fill === swatch(render(lampSpec()) ?? "", "Bright")?.fill)).toBe(true);
  });
});

function textBox(svg: string, needle: string): { x: number; y: number; anchor: string } | null {
  const match = new RegExp(`<text\\b([^>]*)>${needle}</text>`).exec(svg);
  if (!match) return null;
  const attrs = match[1] ?? "";
  return {
    x: Number(/x="([^"]+)"/.exec(attrs)?.[1]),
    y: Number(/y="([^"]+)"/.exec(attrs)?.[1]),
    anchor: /text-anchor="([^"]+)"/.exec(attrs)?.[1] ?? "",
  };
}

describe("histogram bin count", () => {
  const scores = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

  function histogram(extra: Record<string, unknown> = {}) {
    return render({
      version: "1",
      type: "histogram",
      data: scores.map((score) => ({ score })),
      encoding: { x: "score" },
      a11y: { alt },
      size: { width: 480, height: 280 },
      ...extra,
    });
  }

  it("leaves the corner empty unless mark.binLabel is set", () => {
    const plain = histogram() ?? "";
    expect(plain).not.toContain("data-ck-bin-count");
    expect(plain).not.toContain(" bins<");
    const labeled = histogram({ mark: { binLabel: true } }) ?? "";
    const note = textBox(labeled, "8 bins");
    const ticks = [...labeled.matchAll(/<text\b([^>]*)text-anchor="end"[^>]*>([^<]+)<\/text>/g)].map((match) => ({
      x: Number(/x="([^"]+)"/.exec(match[1] ?? "")?.[1]),
      y: Number(/y="([^"]+)"/.exec(match[1] ?? "")?.[1]),
      text: match[2],
    }));
    const top = ticks.filter((tick) => tick.text !== "8 bins").sort((a, b) => a.y - b.y)[0];
    expect(note?.anchor).toBe("end");
    expect(note && top && note.x > top.x + 80).toBe(true);
    expect(note && top && note.y < top.y).toBe(true);
  });

  it("prints the count that was asked for, and skips a pre-binned chart", () => {
    const nine = histogram({ mark: { bins: 9, binLabel: true } }) ?? "";
    expect(nine).toContain('data-ck-bin-count="9"');
    expect(nine).toContain(">9 bins<");
    const ready = render({
      version: "1",
      type: "histogram",
      data: [
        { edge: "0–10", count: 2 },
        { edge: "10–20", count: 5 },
      ],
      encoding: { x: "edge", y: "count" },
      mark: { binLabel: true },
      a11y: { alt },
    });
    expect(ready).not.toContain("data-ck-bin-count");
  });

  it("warns when the option is on the wrong chart", () => {
    const line = validate({
      version: "1",
      type: "line",
      data: [{ x: "a", y: 1 }],
      encoding: { x: "x", y: "y" },
      mark: { binLabel: true },
      a11y: { alt },
    });
    expect(line.warnings.some((warning) => warning.code === "CK3010" && warning.path === "/mark/binLabel")).toBe(true);
    const bins = validate({
      version: "1",
      type: "histogram",
      data: [{ score: 1 }],
      encoding: { x: "score" },
      mark: { baseLabel: "Normal" },
      a11y: { alt },
    });
    expect(bins.warnings.some((warning) => warning.code === "CK3010" && warning.path === "/mark/baseLabel")).toBe(true);
  });
});
