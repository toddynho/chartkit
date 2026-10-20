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

function pointFills(svg: string): string[] {
  return [...svg.matchAll(/<circle\b([^>]*)>/g)]
    .map((match) => match[1] ?? "")
    .filter((attrs) => attrs.includes("data-ck-i="))
    .map((attrs) => /fill="([^"]+)"/.exec(attrs)?.[1] ?? "");
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
  it("uses the bar fill once when a rule paints bars and points", () => {
    const svg = render(lampSpec()) ?? "";
    const bright = swatch(svg, "Bright");
    const dim = swatch(svg, "Dim");
    expect(bright).toEqual({ kind: "rect", fill: expect.stringContaining("--ck-positive") });
    expect(dim).toEqual({ kind: "rect", fill: expect.stringContaining("--ck-negative") });
    expect(svg.match(/>Bright<\/text>/g)?.length).toBe(1);
    expect(svg.match(/>Dim<\/text>/g)?.length).toBe(1);
    const fills = barFills(svg);
    expect(fills.some((fill) => fill === bright?.fill)).toBe(true);
    expect(fills.some((fill) => fill === dim?.fill)).toBe(true);
    for (const fill of pointFills(svg)) {
      expect(fill).not.toContain("--ck-positive");
      expect(fill).not.toContain("--ck-negative");
    }
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
    expect(swatch(svg, "Bright")?.fill).toContain("--ck-positive");
    expect(swatch(svg, "Dim")?.fill).toContain("--ck-negative");
    expect(swatch(svg, "Bright")?.kind).toBe("rect");
    expect(pointFills(svg).every((fill) => !fill.includes("--ck-positive") && !fill.includes("--ck-negative"))).toBe(true);
  });

  it("names the unmatched bar colour with mark.baseLabel", () => {
    const svg = render(lampSpec({ mark: { ...((lampSpec().mark as object) ?? {}), baseLabel: "Normal" } })) ?? "";
    const normal = swatch(svg, "Normal");
    expect(normal?.kind).toBe("rect");
    expect(normal?.fill).not.toContain("--ck-positive");
    expect(normal?.fill).not.toContain("--ck-negative");
    const unmatched = barFills(svg).filter((fill) => !fill.includes("--ck-positive") && !fill.includes("--ck-negative"));
    expect(unmatched.some((fill) => fill === normal?.fill)).toBe(true);
    expect(svg).toContain(">Reading<");
  });

  it("keeps a point-only rule on a circle in the shifted colour", () => {
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
    expect(bright?.kind).toBe("circle");
    expect(pointFills(svg).some((fill) => fill === bright?.fill)).toBe(true);
  });

  it("omits rule swatches when the legend is off", () => {
    const svg = render(lampSpec({ legend: false })) ?? "";
    expect(svg).not.toContain(">Bright</text>");
    expect(barFills(svg).some((fill) => fill.includes("--ck-positive"))).toBe(true);
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
