import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { nearMatches } from "../walker";
import { ticks } from "../svg";

const alt = "A short series used to check ticks, padding, and the fit label.";

function yTicks(svg: string): number[] {
  return [...svg.matchAll(/<text [^>]*text-anchor="end"[^>]*>([^<]+)<\/text>/g)]
    .map((match) => Number(String(match[1]).replace(/,/g, "")))
    .filter((value) => Number.isFinite(value));
}

function line(data: { x: string; y: number }[], extra: Record<string, unknown> = {}) {
  return render({
    version: "1",
    type: "line",
    data,
    encoding: { x: "x", y: "y" },
    a11y: { alt },
    size: { width: 420, height: 220 },
    ...extra,
  });
}

describe("small-series ticks", () => {
  it("keeps a short whole-number span on whole steps", () => {
    expect(ticks(1, 2, 5)).toEqual([1, 2]);
    expect(ticks(8, 9, 5).every((value) => Number.isInteger(value))).toBe(true);
    expect(ticks(8, 9, 5)).not.toContain(8.5);
    expect(ticks(0, 100, 5).length).toBeGreaterThanOrEqual(4);
    expect(ticks(0, 100, 5)[0]).toBe(0);
  });

  it("does not jump a 2–5 point series onto half steps", () => {
    const pair = yTicks(line([
      { x: "a", y: 8 },
      { x: "b", y: 9 },
    ]));
    expect(pair.every((value) => Number.isInteger(value))).toBe(true);
    const step = yTicks(line([
      { x: "a", y: 100 },
      { x: "b", y: 102 },
      { x: "c", y: 104 },
      { x: "d", y: 106 },
    ]));
    expect(Math.max(...step)).toBeLessThan(112);
    expect(step).toContain(100);
    expect(step).toContain(106);
  });
});

describe("scale padding and clamp", () => {
  const data = [
    { x: "a", y: 10 },
    { x: "b", y: 20 },
    { x: "c", y: 30 },
  ];

  it("adds room past the data", () => {
    const base = Math.max(...yTicks(line(data)));
    const padded = Math.max(...yTicks(line(data, { encoding: { x: "x", y: { field: "y", scale: { padding: 0.5 } } } })));
    expect(padded).toBeGreaterThan(base);
  });

  it("draws an out-of-range point on the domain edge", () => {
    const spec = {
      version: "1",
      type: "line",
      data: [
        { x: "a", y: 10 },
        { x: "b", y: 40 },
      ],
      encoding: { x: "x", y: { field: "y", scale: { domain: [0, 20], clamp: true } } },
      a11y: { alt },
      size: { width: 420, height: 220 },
    };
    const clamped = render(spec) ?? "";
    const open = render({
      ...spec,
      encoding: { x: "x", y: { field: "y", scale: { domain: [0, 20] } } },
    }) ?? "";
    const end = (svg: string) => svg.match(/<path[^>]*d="([^"]+)"/)?.[1]?.trim().split(/[ML]\s*/).filter(Boolean).at(-1) ?? "";
    expect(end(clamped)).not.toBe(end(open));
    expect(yTicks(clamped)).toContain(20);
  });
});

describe("trendline label", () => {
  it("steps Linear fit off a series label", () => {
    const svg = render({
      version: "1",
      type: "line",
      data: [
        { x: "a", y: 10 },
        { x: "b", y: 18 },
        { x: "c", y: 14 },
        { x: "d", y: 22 },
      ],
      encoding: { x: "x", y: "y" },
      mark: { labels: true },
      annotations: [{ type: "regression", method: "linear" }],
      a11y: { alt },
      size: { width: 420, height: 240 },
    }) ?? "";
    const texts = [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map((match) => {
      const attrs = match[1] ?? "";
      return [
        match[0],
        /x="([^"]+)"/.exec(attrs)?.[1] ?? "",
        /y="([^"]+)"/.exec(attrs)?.[1] ?? "",
        /text-anchor="([^"]+)"/.exec(attrs)?.[1] ?? "start",
        match[2] ?? "",
      ] as unknown as RegExpMatchArray;
    });
    const fit = texts.find((match) => match[4] === "Linear fit");
    expect(fit).toBeTruthy();
    const box = (match: RegExpMatchArray) => {
      const x = Number(match[1]);
      const y = Number(match[2]);
      const anchor = match[3];
      const w = Math.max(8, (match[4] ?? "").length * 6);
      const left = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
      return { left, right: left + w, top: y - 11, bottom: y };
    };
    const fitBox = box(fit!);
    const labels = texts.filter((match) => match[4] !== "Linear fit" && /^\d/.test(match[4] ?? ""));
    for (const label of labels) {
      const other = box(label);
      const hit = fitBox.left < other.right && fitBox.right > other.left && fitBox.top < other.bottom && fitBox.bottom > other.top;
      expect(hit).toBe(false);
    }
  });
});

describe("did you mean", () => {
  it("returns only close names, and at most three", () => {
    expect(nearMatches("zzzzzz", ["revenue", "cost", "month"], 3)).toEqual([]);
    expect(nearMatches("revenu", ["revenue", "cost", "month"], 3)).toEqual(["revenue"]);
    expect(nearMatches("type", ["title", "theme"], 3)).toEqual([]);
    const many = nearMatches("cot", ["cost", "coat", "coast", "coty", "month"], 3);
    expect(many.length).toBeLessThanOrEqual(3);
    expect(many).not.toContain("coast");
  });
});
