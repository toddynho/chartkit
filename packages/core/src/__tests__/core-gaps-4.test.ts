import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { repair, validate } from "../validate";
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

const hours = ["20:00", "21:00", "22:00", "23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"];
const lamp = [62, 66, 70, 74, 71, 68, 44, 28, 39, 58, 69, 73];

function lampSpec(extra: Record<string, unknown> = {}) {
  return {
    version: "1",
    type: "combo",
    title: "Carrick Light",
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
        { color: "positive", gte: 70 },
        { color: "negative", lt: 40 },
      ],
    },
    legend: { position: "top" },
    a11y: { alt: "Carrick lamp current dips, then recovers." },
    size: { width: 640, height: 320 },
    ...extra,
  };
}

function ruledPointFills(svg: string): string[] {
  return [...svg.matchAll(/<circle\b([^>]*)>/g)]
    .map((match) => match[1] ?? "")
    .filter((attrs) => attrs.includes("data-ck-i="))
    .map((attrs) => /fill="([^"]+)"/.exec(attrs)?.[1] ?? "")
    .filter((fill) => fill && !fill.includes("--ck-line-") && !fill.includes("--ck-series-"));
}

describe("colour rule labels", () => {
  it("names the threshold legend and the mark tooltip", () => {
    const spec = lampSpec({
      mark: {
        curve: "monotone",
        points: "always",
        colorRules: [
          { color: "positive", gte: 70, label: "Bright" },
          { color: "negative", lt: 40, label: "Dim" },
        ],
      },
    });
    expect(validate(spec).ok).toBe(true);
    const svg = render(spec) ?? "";
    expect(svg).toContain(">Bright<");
    expect(svg).toContain(">Dim<");
    expect(svg).not.toContain(">positive<");
    expect(svg).not.toContain(">negative<");
    expect(svg).toContain("<title>Bright</title>");
    expect(svg).toContain("<title>Dim</title>");
    expect(svg).toContain('data-ck-rule="Bright"');
    expect(svg).toContain('data-ck-rule="Dim"');
  });

  it("repairs name and title aliases onto label", () => {
    const base = lampSpec();
    const named = lampSpec({
      mark: { colorRules: [{ color: "positive", gte: 70, name: "Bright" }, { color: "negative", lt: 40 }] },
    });
    const nameError = validate(named).errors.find((error) => error.path === "/mark/colorRules/0/name");
    expect(nameError?.code).toBe("CK1002");
    expect(nameError?.hint).toContain("label");
    const fixed = repair(named);
    expect(fixed.ok).toBe(true);
    expect((fixed.spec as { mark: { colorRules: { label?: string; name?: string }[] } }).mark.colorRules[0]).toMatchObject({
      color: "positive",
      label: "Bright",
    });
    expect((fixed.spec as { mark: { colorRules: { name?: string }[] } }).mark.colorRules[0].name).toBeUndefined();

    const titled = lampSpec({
      mark: { colorRules: [{ color: "negative", lt: 40, title: "Dim" }] },
    });
    expect(validate(titled).errors.find((error) => error.path === "/mark/colorRules/0/title")?.hint).toContain("label");
    expect((repair(titled).spec as { mark: { colorRules: { label?: string }[] } }).mark.colorRules[0].label).toBe("Dim");

    const kept = lampSpec({
      mark: { colorRules: [{ color: "positive", gte: 70, label: "Bright", name: "Other" }] },
    });
    const keptRule = (repair(kept).spec as { mark: { colorRules: { label?: string; name?: string }[] } }).mark.colorRules[0];
    expect(keptRule.label).toBe("Bright");
    expect(keptRule.name).toBeUndefined();
    expect(validate(base).errors.some((error) => error.path.includes("colorRules") && error.code === "CK1002")).toBe(false);
  });
});

describe("threshold points beside bars", () => {
  it.each(["soft", "midnight"])("keeps mean-line points off the bar colours in %s", (theme) => {
    const svg = render(lampSpec({ theme })) ?? "";
    const fills = ruledPointFills(svg);
    expect(fills.length).toBeGreaterThan(0);
    for (const fill of fills) {
      expect(fill).not.toContain("--ck-positive");
      expect(fill).not.toContain("--ck-negative");
    }
    expect(new Set(fills).size).toBeGreaterThanOrEqual(2);
    const rects = [...svg.matchAll(/<rect\b[^>]*fill="([^"]+)"/g)].map((match) => match[1] ?? "");
    expect(rects.some((fill) => fill.includes("--ck-positive"))).toBe(true);
    expect(rects.some((fill) => fill.includes("--ck-negative"))).toBe(true);
  });
});

describe("line swatch and points", () => {
  it("uses the drawn line token for the swatch and the points", () => {
    const spec = {
      version: "1",
      type: "line",
      theme: "soft",
      data: [
        { x: "a", a: 1, b: 3, c: 2 },
        { x: "b", a: 2, b: 2, c: 4 },
        { x: "c", a: 3, b: 4, c: 3 },
      ],
      encoding: {
        x: "x",
        y: [
          { field: "a", title: "One" },
          { field: "b", title: "Two" },
          { field: "c", title: "Three" },
        ],
      },
      mark: { curve: "monotone", points: "always" },
      legend: { position: "top" },
      a11y: { alt: "Three lines." },
      size: { width: 640, height: 320 },
    };
    const svg = render(spec) ?? "";
    const strokes = [...svg.matchAll(/<path\b[^>]*stroke="([^"]+)"/g)].map((match) => match[1] ?? "").filter((stroke) => stroke.includes("--ck-line-"));
    const third = strokes[2] ?? "";
    const swatch = svg.match(/<circle\b[^>]*fill="([^"]+)"[^>]*\/>\s*<text[^>]*>Three<\/text>/)?.[1] ?? "";
    const circles = [...svg.matchAll(/<circle\b[^>]*fill="([^"]+)"/g)].map((match) => match[1] ?? "");
    expect(third).toContain("--ck-line-3");
    expect(third).toContain("#c93400");
    expect(swatch).toBe(third);
    expect(circles.filter((fill) => fill === third).length).toBeGreaterThanOrEqual(4);
    const visible = svg.replace(/<defs>[\s\S]*?<\/defs>/, "");
    expect(visible).not.toContain("--ck-series-3");
    expect(visible).not.toContain("#ff9500");
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
