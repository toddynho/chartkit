import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { bar } from "../charts/bar";
import { scatter } from "../charts/scatter";
import { stackedArea } from "../charts/stacked-area";
import { sparkline } from "../charts/sparkline";
import { boxplot } from "../charts/boxplot";
import { donut } from "../charts/donut";
import { pie } from "../charts/pie";
import { areaRange } from "../charts/area-range";
import { errorbar } from "../charts/errorbar";
import { line } from "../charts/line";
import { combo } from "../charts/combo";
import { radar } from "../charts/radar";
import { sankey } from "../charts/sankey";
import { streamgraph } from "../charts/streamgraph";
import { treemap } from "../charts/treemap";
import { renderBarList } from "../charts/bar-list";
import { renderSunburst } from "../renderers/extra/sunburst";
import { renderTimeline } from "../renderers/extra/timeline";
import { renderTree } from "../renderers/extra/tree";
import { renderTreemap } from "../renderers/extra/treemap";
import { ratio } from "../ink";
import { repair, validate } from "../validate";

const alt = "The chart is readable.";

describe("quoted numbers", () => {
  const spec = {
    version: "1",
    type: "bar",
    data: [
      { k: "A", v: "10" },
      { k: "B", v: "20" },
    ],
    encoding: { x: "k", y: "v" },
    a11y: { alt },
  };

  it("fails validate with a repair that writes the numbers, and then draws", () => {
    const before = validate(spec);
    expect(before.ok).toBe(false);
    const error = before.errors.find((item) => item.code === "CK2002");
    expect(error?.hint).toContain("numeric strings");
    expect(error?.fix?.map((op) => op.value)).toEqual([10, 20]);
    const fixed = repair(spec);
    expect(fixed.ok).toBe(true);
    expect(fixed.spec).toMatchObject({ data: [{ v: 10 }, { v: 20 }] });
    const svg = bar.render(fixed.spec as Record<string, unknown>) ?? "";
    expect(svg).toContain('data-ck-value="10"');
    expect(svg).toContain('data-ck-value="20"');
    expect(svg).not.toContain("run validate");
    const lineSvg = line.render({ ...spec, type: "line" }) ?? "";
    expect(lineSvg).toContain('data-ck-samples="10 20"');
    expect(lineSvg).toContain('data-ck-value="10"');
    expect(lineSvg).not.toContain("run validate");
    for (const chart of [combo, errorbar, areaRange, donut, boxplot]) {
      const drawn = chart.render({ ...spec, type: chart.types[0] }) ?? "";
      expect(drawn, chart.types[0]).not.toContain("run validate");
      expect(() => chart.render({ ...spec, type: chart.types[0] })).not.toThrow();
    }
  });
});

describe("undrawable specs", () => {
  it("rejects an all-zero donut, pie, treemap, and sankey", () => {
    const rows = [
      { name: "A", value: 0 },
      { name: "B", value: 0 },
    ];
    for (const type of ["donut", "pie", "treemap"] as const) {
      const result = validate({
        version: "1",
        type,
        data: rows,
        encoding: { x: "name", y: "value" },
        a11y: { alt },
      });
      expect(result.ok, type).toBe(false);
      expect(result.errors.some((item) => item.code === "CK3138" && item.message.startsWith(type))).toBe(true);
    }
    const flow = validate({
      version: "1",
      type: "sankey",
      data: [
        { source: "A", target: "B", value: 0 },
        { source: "B", target: "C", value: 0 },
      ],
      encoding: { source: "source", target: "target", y: "value" },
      a11y: { alt },
    });
    expect(flow.ok).toBe(false);
    expect(flow.errors.some((item) => item.code === "CK3138")).toBe(true);
    expect(() => donut.render({
      version: "1",
      type: "donut",
      data: rows,
      encoding: { x: "name", y: "value" },
      a11y: { alt },
    })).not.toThrow();
    expect(() => pie.render({
      version: "1",
      type: "pie",
      data: rows,
      encoding: { x: "name", y: "value" },
      a11y: { alt },
    })).not.toThrow();
    expect(() => treemap.render({
      version: "1",
      type: "treemap",
      data: rows,
      encoding: { x: "name", y: "value" },
      a11y: { alt },
    })).not.toThrow();
    expect(() => sankey.render({
      version: "1",
      type: "sankey",
      data: [
        { source: "A", target: "B", value: 0 },
        { source: "B", target: "C", value: 0 },
      ],
      encoding: { source: "source", target: "target", y: "value" },
      a11y: { alt },
    })).not.toThrow();
  });

  it("rejects a one-spoke radar and a one-position streamgraph", () => {
    const radarSpec = {
      version: "1",
      type: "radar",
      data: [{ axis: "Speed", score: 4 }],
      encoding: { x: "axis", y: "score" },
      a11y: { alt },
    };
    const radarResult = validate(radarSpec);
    expect(radarResult.ok).toBe(false);
    expect(radarResult.errors.some((item) => item.code === "CK3137")).toBe(true);
    expect(() => radar.render(radarSpec)).not.toThrow();

    const streamSpec = {
      version: "1",
      type: "streamgraph",
      data: [{ year: "2020", fiction: 20, history: 12 }],
      encoding: { x: "year", y: ["fiction", "history"] },
      a11y: { alt },
    };
    const streamResult = validate(streamSpec);
    expect(streamResult.ok).toBe(false);
    expect(streamResult.errors.some((item) => item.code === "CK3136")).toBe(true);
    expect(() => streamgraph.render(streamSpec)).not.toThrow();
  });

  it("draws a tree in a 140 by 90 frame", () => {
    const spec = {
      version: "1",
      type: "tree",
      data: [
        { id: "Root", parent: "" },
        { id: "A", parent: "Root" },
        { id: "B", parent: "Root" },
      ],
      encoding: { id: "id", parent: "parent" },
      size: { width: 140, height: 90 },
      a11y: { alt },
    };
    expect(validate(spec).ok).toBe(true);
    const svg = renderTree(spec) ?? "";
    expect(svg).toContain('data-ck-mark="point"');
    expect(svg).not.toContain("run validate");
  });
});

describe("stacked bar rects", () => {
  it("skips empty stacked segments", () => {
    const count = 40;
    const data = Array.from({ length: count }, (_, index) => ({
      cat: `c${index}`,
      series: `s${index}`,
      value: index + 1,
    }));
    const spec = {
      version: "1",
      type: "bar",
      data,
      encoding: { x: "cat", y: "value", series: "series" },
      mark: { stack: "stack" },
      a11y: { alt: "Each category is its own series." },
    };
    const svg = bar.render(spec) ?? "";
    const rects = svg.match(/data-ck-key="b:/g)?.length ?? 0;
    expect(rects).toBe(count);
  });
});

describe("bar-list contrast", () => {
  it("picks label ink against the translucent bar on a dark theme", () => {
    const svg = renderBarList({
      version: "1",
      type: "bar-list",
      theme: "midnight",
      data: [
        { page: "Cards", visits: 900 },
        { page: "Bank", visits: 120 },
      ],
      encoding: { x: "page", y: "visits" },
      a11y: { alt: "Cards leads bank." },
    }) ?? "";
    expect(svg).toContain('fill="#f5f5f7"');
    expect(svg).toContain(">Cards</text>");
    const series: [number, number, number] = [0x22, 0xc5, 0x5e];
    const page: [number, number, number] = [0x0c, 0x0c, 0x0c];
    const mix = (color: [number, number, number], alpha: number, under: [number, number, number]) =>
      color.map((channel, index) => channel * alpha + under[index] * (1 - alpha)) as [number, number, number];
    const track = mix(series, 0.14, page);
    const painted = mix(series, 0.42, track);
    expect(ratio([245, 245, 247], painted)).toBeGreaterThanOrEqual(4.5);
  });

  it("picks label ink against the payments row wash on a dark theme", () => {
    const svg = renderBarList({
      version: "1",
      id: "soft-bar-list",
      type: "bar-list",
      theme: "midnight",
      title: "Payments by method",
      data: [
        { method: "Card", amount: 168400 },
        { method: "Bank", amount: 64200 },
        { method: "Wallet", amount: 28400 },
        { method: "Other", amount: 400 },
      ],
      encoding: { x: "method", y: { field: "amount", format: { style: "compact", prefix: "$" } } },
      mark: { track: "row" },
      size: { width: 640, height: 140 },
      a11y: { alt: "Card is the largest method." },
    }) ?? "";
    const fill = svg.match(/fill="(#[0-9a-f]{6})"[^>]*>Card</)?.[1];
    expect(fill).toBeTruthy();
    const rgb = [1, 3, 5].map((index) => parseInt(fill!.slice(index, index + 2), 16)) as [number, number, number];
    const series: [number, number, number] = [0x22, 0xc5, 0x5e];
    const page: [number, number, number] = [0x0c, 0x0c, 0x0c];
    const painted = series.map((channel, index) => channel * 0.72 + page[index] * 0.28) as [number, number, number];
    expect(ratio(rgb, painted)).toBeGreaterThanOrEqual(4.5);
  });

  it("picks light ink for the default theme once the page turns dark", () => {
    const svg = renderBarList({
      version: "1",
      id: "payments-bar-list",
      type: "bar-list",
      title: "Payments by method",
      data: [
        { method: "Card", amount: 168400 },
        { method: "Bank", amount: 64200 },
        { method: "Cash", amount: 9400 },
      ],
      encoding: { x: "method", y: "amount" },
      size: { width: 1200, height: 140 },
      a11y: { alt: "Card is the largest payment method." },
    }) ?? "";
    expect(svg).toContain('fill="light-dark(#1d1d1f, #f5f5f7)" font-size="12" font-weight="560">Cash</text>');
    const series: [number, number, number] = [0x0a, 0x84, 0xff];
    const page: [number, number, number] = [0x0c, 0x0c, 0x0c];
    const mix = (color: [number, number, number], alpha: number, under: [number, number, number]) =>
      color.map((channel, index) => channel * alpha + under[index] * (1 - alpha)) as [number, number, number];
    const painted = mix(series, 0.42, mix(series, 0.14, page));
    expect(ratio([245, 245, 247], painted)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("scatter with no finite point", () => {
  const spec = {
    version: "1",
    type: "scatter",
    data: [{ x: null, y: 2 }, { x: 3, y: null }, { x: null, y: null }, {}],
    encoding: { x: { field: "x", type: "quantitative" }, y: { field: "y", type: "quantitative" } },
    a11y: { alt: "All points are null." },
  };

  it("fails validate instead of rendering a generic error", () => {
    const result = validate(spec);
    expect(result.ok).toBe(false);
    expect(result.errors.some((item) => item.code === "CK3139")).toBe(true);
    expect(result.errors.some((item) => item.code === "CK1006")).toBe(false);
    expect(() => scatter.render(spec)).not.toThrow();
  });

  it("still draws a line, bar, area, and combo when every value is null", () => {
    const rows = [{ x: null, y: null }, { x: null, y: null }];
    for (const chart of [line, bar, stackedArea, combo, sparkline]) {
      const drawn = chart.render({
        version: "1",
        type: chart.types[0],
        data: rows,
        encoding: { x: "x", y: "y" },
        a11y: { alt },
      }) ?? "";
      expect(drawn, chart.types[0]).not.toContain("could not draw");
      expect(drawn, chart.types[0]).not.toContain("run validate");
    }
  });
});

describe("flat hierarchy rows", () => {
  const rows = [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
    { name: "C", value: 30 },
  ];

  it("draws a sunburst ring from name and value", () => {
    const spec = { version: "1", type: "sunburst", data: rows, a11y: { alt: "three slices" } };
    const result = validate(spec);
    expect(result.ok, JSON.stringify(result.errors)).toBe(true);
    const svg = renderSunburst(spec) ?? "";
    expect(svg).toContain('data-ck-mark="arc"');
    expect(svg).toContain(">A<");
    expect(svg).not.toContain("could not draw");
  });

  it("draws a treemap from name and value without turning it into an error svg", () => {
    const spec = { version: "1", type: "treemap", data: rows, a11y: { alt: "three slices" } };
    const svg = renderTreemap(spec) ?? "";
    expect(svg).toContain('data-ck-mark="tile"');
    expect(svg).toContain(">A<");
    expect(svg).not.toContain("could not draw");
    const encoded = renderTreemap({ ...spec, encoding: { x: "name", y: "value" } }) ?? "";
    expect(encoded).toContain('data-ck-mark="tile"');
    expect(validate({ ...spec, encoding: { x: "name", y: "value" } }).ok).toBe(true);
  });

  it("tells a tree that a flat list is not one root", () => {
    const spec = { version: "1", type: "tree", data: rows, a11y: { alt: "three slices" } };
    const result = validate(spec);
    expect(result.ok).toBe(false);
    expect(result.errors.some((item) => item.code === "CK3115")).toBe(true);
    expect(renderTree(spec)).toBeNull();
  });
});

describe("timeline inside an explicit size", () => {
  const example = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../examples/25-timeline.json"), "utf8")) as Record<string, unknown>;

  function textYs(svg: string): number[] {
    return [...svg.matchAll(/<text\b[^>]*\by="([0-9.]+)"/g)].map((match) => Number(match[1]));
  }

  it("keeps the shipped timeline inside 140 by 90 and 280 by 180", () => {
    for (const [width, height] of [[140, 90], [280, 180]] as const) {
      const svg = renderTimeline({ ...example, size: { width, height } }) ?? "";
      const ys = textYs(svg);
      expect(ys.length, `${width}x${height}`).toBeGreaterThan(0);
      expect(Math.max(...ys), `${width}x${height}`).toBeLessThanOrEqual(height);
      expect(svg).toContain('data-ck-mark="event"');
      expect(svg).not.toContain("could not draw");
    }
  });

  it("keeps forty events inside 280 by 180", () => {
    const data = Array.from({ length: 40 }, (_, index) => ({
      label: `Event ${index + 1}`,
      date: `2020-01-${String((index % 28) + 1).padStart(2, "0")}`,
      kind: "event",
    }));
    const svg = renderTimeline({
      version: "1",
      type: "timeline",
      title: "Forty events",
      data,
      encoding: { x: "label" },
      size: { width: 280, height: 180 },
      a11y: { alt: "Forty events in one year." },
    }) ?? "";
    const ys = [...svg.matchAll(/\b[cy]="([0-9.]+)"/g)].map((match) => Number(match[1]));
    expect(Math.max(...ys)).toBeLessThanOrEqual(180);
    expect(svg.match(/data-ck-mark="event"/g)?.length).toBe(40);
  });
});

describe("treemap legend leaves room for tiles", () => {
  it("gives 32 groups a plot inside 280 by 180", () => {
    const svg = renderTreemap({
      version: "1",
      type: "treemap",
      title: "Thirty-two groups",
      theme: "neon",
      data: Array.from({ length: 32 }, (_, index) => ({ name: `Tile ${index + 1}`, size: 32 - index, group: `Group ${index + 1}` })),
      encoding: { x: "name", y: "size", color: "group" },
      size: { width: 280, height: 180 },
      a11y: { alt: "Thirty-two groups share one small treemap." },
    }) ?? "";
    const tiles = [...svg.matchAll(/<rect\b[^>]*data-ck-mark="tile"[^>]*>/g)].map((match) => {
      const y = Number(/ y="([0-9.]+)"/.exec(match[0])?.[1]);
      const h = Number(/ height="([0-9.]+)"/.exec(match[0])?.[1]);
      return { y, h, bottom: y + h };
    });
    expect(tiles.length).toBe(32);
    expect(Math.max(...tiles.map((tile) => tile.bottom))).toBeLessThanOrEqual(180);
    expect(Math.max(...tiles.map((tile) => tile.h))).toBeGreaterThan(12);
    const plot = /<rect x="10" y="([0-9.]+)" width="260" height="([0-9.]+)" fill="var\(--ck-surface/.exec(svg);
    expect(plot).toBeTruthy();
    expect(Number(plot?.[2])).toBeGreaterThanOrEqual(48);
  });
});
