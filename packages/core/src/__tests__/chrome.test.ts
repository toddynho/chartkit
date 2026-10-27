import { describe, expect, it } from "vitest";
import { createRenderer } from "../render";
import { line } from "../charts/line";
import { CHROME_TOP } from "../chrome";
import { render } from "../extra";

const alt = "Chrome is visible on this chart.";

function xy(type: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    version: "1",
    type,
    data: [
      { month: "Mar", low: 10, high: 16, value: 12, lo: 9, hi: 18 },
      { month: "Apr", low: 14, high: 22, value: 18, lo: 12, hi: 24 },
      { month: "May", low: 18, high: 28, value: 24, lo: 16, hi: 30 },
    ],
    a11y: { alt },
    size: { width: 480, height: 280 },
    ...extra,
  };
}

const chrome = {
  title: "ChromeTitle",
  subtitle: "ChromeSubtitle",
  axes: { x: { title: "XTitle" }, y: { title: "YTitle", ticks: [42] } },
  annotations: [
    { type: "rule", axis: "y", value: 42, label: "RuleLabel" },
    { type: "trendline", method: "linear", label: "FitLabel" },
  ],
};

function withDomain(encoding: Record<string, unknown>): Record<string, unknown> {
  const y = encoding.y;
  return {
    ...chrome,
    encoding: {
      ...encoding,
      y: typeof y === "string" ? { field: y, scale: { domain: [0, 80] } } : y,
    },
  };
}

function horizontalGrids(svg: string): string[] {
  return [...svg.matchAll(/<line ([^>]*?)\/>/g)]
    .map((match) => match[1] ?? "")
    .filter((attrs) => {
      if (attrs.includes("data-ck-") || !attrs.includes("--ck-grid")) return false;
      const y1 = attrs.match(/y1="([^"]+)"/)?.[1];
      const y2 = attrs.match(/y2="([^"]+)"/)?.[1];
      return Boolean(y1 && y1 === y2);
    });
}

describe("shared cartesian chrome", () => {
  const cases: Array<[string, Record<string, unknown>]> = [
    ["line", xy("line", withDomain({ x: "month", y: "value" }))],
    ["bar", xy("bar", withDomain({ x: "month", y: "value" }))],
    ["stacked-area", xy("stacked-area", withDomain({ x: "month", y: "value" }))],
    ["combo", xy("combo", { encoding: { x: "month", y: [{ field: "value", mark: "bar" }, { field: "high", mark: "line", scale: { domain: [0, 80] } }] }, ...chrome })],
    ["scatter", xy("scatter", { encoding: { x: { field: "low", scale: { domain: [0, 80] } }, y: { field: "value", scale: { domain: [0, 80] } } }, ...chrome })],
    ["candlestick", xy("candlestick", { encoding: { x: "month", open: "low", high: { field: "high", scale: { domain: [0, 80] } }, low: "lo", close: "value" }, ...chrome })],
    ["spike", xy("spike", withDomain({ x: "month", y: "value" }))],
    ["histogram", xy("histogram", withDomain({ x: "month", y: "value" }))],
    ["boxplot", xy("boxplot", withDomain({ x: "month", y: "value" }))],
    ["waterfall", xy("waterfall", withDomain({ x: "month", y: "value" }))],
    ["area-range", xy("area-range", { encoding: { x: "month", y: [{ lo: "lo", hi: "hi" }, { field: "value", scale: { domain: [0, 80] } }] }, ...chrome })],
    ["bar-range", xy("bar-range", { encoding: { x: "month", low: "low", high: { field: "high", scale: { domain: [0, 80] } } }, ...chrome })],
    ["errorbar", xy("errorbar", { encoding: { x: "month", y: { field: "value", scale: { domain: [0, 80] } }, low: "lo", high: "hi" }, ...chrome })],
  ];

  it.each(cases)("%s paints title, subtitle, axis titles, an explicit tick, a rule, and a trendline", (_type, spec) => {
    const svg = render(spec);
    expect(svg).toBeTruthy();
    expect(svg).not.toContain("ck-chart-error");
    for (const text of ["ChromeTitle", "ChromeSubtitle", "XTitle", "YTitle", "RuleLabel", "FitLabel"]) {
      expect(svg).toContain(text);
    }
    expect(svg).toMatch(/>42</);
  });

  it("draws a gridline and a label for every explicit tick, including 42", () => {
    const spec = xy("bar-range", {
      encoding: { x: "month", low: "low", high: { field: "high", scale: { domain: [0, 80] } } },
      title: "Span",
      subtitle: "Scale",
      axes: { x: { title: "Bed" }, y: { title: "Centimetres", ticks: [0, 20, 42, 60, 80] } },
    });
    const svg = render(spec) ?? "";
    for (const tick of ["0", "20", "42", "60", "80"]) expect(svg).toContain(`>${tick}<`);
    expect(horizontalGrids(svg).length).toBe(5);
  });

  it("places untitled combo, heatmap, and range legends on the title band", () => {
    const combo = render({
      version: "1",
      type: "combo",
      data: [
        { month: "Jan", revenue: 100, margin: 0.2 },
        { month: "Feb", revenue: 140, margin: 0.24 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "revenue", title: "Revenue", mark: "bar" },
          { field: "margin", title: "Margin", mark: "line", axis: "y2" },
        ],
      },
      a11y: { alt: "Revenue and margin." },
    });
    const swatch = combo.match(/<rect x="[^"]+" y="([^"]+)" width="10" height="10"/);
    expect(Number(swatch?.[1])).toBe(CHROME_TOP);

    const heat = render({
      version: "1",
      type: "heatmap",
      data: [
        { date: "2026-01-01", value: 1 },
        { date: "2026-01-02", value: 4 },
      ],
      encoding: { x: { field: "date", type: "temporal" }, color: "value" },
      mark: { layout: "calendar", weeks: 8 },
      a11y: { alt: "Two days in January." },
    });
    const months = [...heat.matchAll(/<text x="[^"]+" y="([^"]+)"[^>]*>(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)<\/text>/g)];
    expect(months.length).toBeGreaterThan(0);
    for (const month of months) expect(Number(month[1])).toBeGreaterThanOrEqual(CHROME_TOP);

    const range = render(
      xy("area-range", {
        encoding: { x: "month", y: [{ lo: "lo", hi: "hi" }, { field: "value" }] },
      }),
    );
    const rangeSwatch = range.match(/<rect x="[^"]+" y="([^"]+)" width="10" height="10"/);
    expect(Number(rangeSwatch?.[1])).toBe(CHROME_TOP);
  });

  it("emits mark.glow on a combo line", () => {
    const spec = {
      version: "1",
      type: "combo",
      data: [{ h: "a", v: 1, m: 1 }, { h: "b", v: 3, m: 2 }],
      encoding: { x: "h", y: [{ field: "v", mark: "bar", title: "V" }, { field: "m", mark: "line", title: "M" }] },
      mark: { glow: true },
      a11y: { alt: "Combo glow." },
    };
    const svg = render(spec);
    expect(svg).toContain("feGaussianBlur");
    expect(svg).toContain('filter="url(#');
    const plain = render({ ...spec, mark: {} });
    expect(plain).not.toContain("feGaussianBlur");
  });

  it("paints a subtitle on funnel and a title plus subtitle on a calendar", () => {
    const funnel = render({
      version: "1",
      type: "funnel",
      title: "DoorTitle",
      subtitle: "DoorSubtitle",
      data: [{ stage: "Visit", n: 40 }, { stage: "Stay", n: 12 }],
      encoding: { x: "stage", y: "n" },
      a11y: { alt: "Visits outnumber stays." },
    });
    expect(funnel).toContain("DoorSubtitle");
    const calendar = render({
      version: "1",
      type: "heatmap",
      title: "Door scans",
      subtitle: "Twelve weeks",
      data: [{ day: "2026-05-02", scans: 12 }],
      encoding: { x: { field: "day", type: "temporal" }, color: "scans" },
      mark: { layout: "calendar", weeks: 12 },
      a11y: { alt: "One day." },
      size: { width: 640, height: 220 },
    });
    expect(calendar).toContain("Door scans");
    expect(calendar).toContain("Twelve weeks");
    const may = render({
      version: "1",
      type: "heatmap",
      title: "Door scans",
      subtitle: "Four weeks in May",
      data: Array.from({ length: 28 }, (_, i) => ({ day: `2026-05-${String(i + 1).padStart(2, "0")}`, scans: i })),
      encoding: { x: { field: "day", type: "temporal" }, color: "scans" },
      mark: { layout: "calendar", weeks: 5 },
      a11y: { alt: "Scans across May." },
      size: { width: 480, height: 220 },
    }) ?? "";
    const texts = [...may.matchAll(/<text x="([^"]+)" y="([^"]+)"[^>]*>([^<]*)<\/text>/g)];
    const months = texts.filter((match) => /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/.test(match[3] ?? ""));
    expect(new Set(months.map((match) => match[1])).size).toBe(months.length);
    const subtitle = texts.find((match) => match[3] === "Four weeks in May");
    expect(subtitle).toBeTruthy();
    for (const month of months) expect(Number(month[2])).toBeGreaterThan(Number(subtitle?.[2]) + 8);
  });

  it("keeps a trendline label clear of the series end", () => {
    const spec = xy("area-range", {
      title: "Pell forecast",
      subtitle: "Band and a fitted line",
      encoding: { x: "month", y: [{ lo: "lo", hi: "hi" }, { field: "value" }] },
      axes: { x: { title: "Month" }, y: { title: "Visitors" } },
      annotations: [{ type: "trendline", method: "linear", label: "Fit" }],
    });
    const svg = render(spec) ?? "";
    const points = svg.match(/data-ck-annotation="trendline"[^>]*points="([^"]+)"/)?.[1] ?? "";
    const last = points.trim().split(/\s+/).at(-1)?.split(",") ?? [];
    const label = svg.match(/data-ck-annotation="trendline" x="([^"]+)" y="([^"]+)" text-anchor="([^"]+)"/);
    expect(last.length).toBe(2);
    expect(label).toBeTruthy();
    const x = Number(last[0]);
    const y = Number(last[1]);
    const lx = Number(label?.[1]);
    const ly = Number(label?.[2]);
    const anchor = label?.[3];
    const width = "Fit".length * 6.3;
    const left = anchor === "end" ? lx - width : lx;
    const right = left + width;
    const overlaps = right > x - 4 && left < x + 4 && ly > y - 8 && ly < y + 8;
    expect(overlaps).toBe(false);
  });

  it("shifts a threshold point off the line colour and lists the token", () => {
    const spec = {
      version: "1",
      type: "line",
      theme: "midnight",
      title: "Carrick",
      data: [
        { hour: "01:00", milliamp: 72, mean: 70 },
        { hour: "03:00", milliamp: 28, mean: 40 },
        { hour: "07:00", milliamp: 74, mean: 58 },
      ],
      encoding: {
        x: "hour",
        y: [
          { field: "milliamp", title: "Reading" },
          { field: "mean", title: "Mean" },
        ],
      },
      mark: {
        points: "always",
        colorRules: [
          { color: "positive", gte: 70 },
          { color: "negative", lt: 40 },
        ],
      },
      legend: { position: "bottom" },
      a11y: { alt: "The lamp dips, then recovers." },
      size: { width: 520, height: 280 },
    };
    const svg = render(spec) ?? "";
    expect(svg).toContain(">positive<");
    expect(svg).toContain(">negative<");
    expect(svg).toContain("#ffd60a");
    expect(svg).not.toContain('fill="var(--ck-positive');
    const soft = render({ ...spec, theme: "soft" }) ?? "";
    expect(soft).toContain("#ffd60a");
    expect(soft).toContain(">positive<");
    const draw = createRenderer([line]);
    expect(draw(spec)).toContain("#ffd60a");
  });

  it.each(cases)("%s keeps a bottom legend below the x-axis title", (type, spec) => {
    const encoding = spec.encoding as Record<string, unknown>;
    const next: Record<string, unknown> = {
      ...spec,
      legend: { position: "bottom" },
      axes: {
        ...(spec.axes as Record<string, unknown>),
        x: { title: "Hour" },
      },
    };
    if (type === "line" || type === "bar" || type === "stacked-area") {
      next.encoding = { x: "month", y: [{ field: "value", title: "One" }, { field: "high", title: "Two" }] };
    }
    if (type === "scatter") {
      next.encoding = { ...encoding, color: "month" };
    }
    const svg = render(next) ?? "";
    expect(svg).not.toContain("ck-chart-error");
    const legendSvg = legendGroup(svg);
    const legend = textNodes(legendSvg).filter((node) => node.text.trim());
    const title = textNodes(svg).find((node) => node.text === "Hour");
    expect(title).toBeTruthy();
    expect(legend.length).toBeGreaterThan(0);
    const titleTop = (title?.y ?? 0) - (title?.size ?? 11);
    const titleBottom = title?.y ?? 0;
    for (const item of legend) {
      const top = item.y - item.size;
      const bottom = item.y;
      expect(titleBottom > top && titleTop < bottom).toBe(false);
      expect(item.y).toBeGreaterThan(title?.y ?? 0);
    }
    const ticks = textNodes(svg).filter((node) => node.text === "Mar" || node.text === "Apr");
    for (const tick of ticks) {
      if (legend.some((item) => item.text === tick.text && item.y === tick.y)) continue;
      expect(tick.y).toBeLessThan(titleTop);
    }
  });
});

function legendGroup(svg: string): string {
  const start = svg.indexOf('<g data-ck-legend="bottom"');
  if (start < 0) return "";
  let depth = 0;
  for (let i = start; i < svg.length; i++) {
    if (svg.startsWith("<g", i)) depth += 1;
    else if (svg.startsWith("</g>", i)) {
      depth -= 1;
      if (depth === 0) return svg.slice(start, i + 4);
    }
  }
  return "";
}

function textNodes(svg: string): Array<{ text: string; x: number; y: number; size: number }> {
  return [...svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)].map((match) => {
    const attrs = match[1] ?? "";
    return {
      text: match[2] ?? "",
      x: Number(/x="([^"]+)"/.exec(attrs)?.[1]),
      y: Number(/y="([^"]+)"/.exec(attrs)?.[1]),
      size: Number(/font-size="([^"]+)"/.exec(attrs)?.[1] ?? 12),
    };
  });
}
