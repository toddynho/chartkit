import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createRenderer } from "../render";
import { line } from "../charts/line";
import { render } from "../extra";
import { toCSV, toSVG } from "../export";

const alt = "Revenue and cost for three months.";
const rows = [
  { month: "Jan", revenue: 10, cost: 4, region: "NA" },
  { month: "Feb", revenue: 30, cost: 12, region: "EU" },
  { month: "Mar", revenue: 18, cost: 9, region: "NA" },
];

const lineSpec = {
  version: "1",
  type: "line",
  data: rows,
  encoding: { x: "month", y: ["revenue", "cost"] },
  a11y: { alt },
  size: { width: 420, height: 240 },
};

describe("export", () => {
  it("writes csv for rows, number arrays, and columns", () => {
    expect(toCSV({ data: rows })).toBe("month,revenue,cost,region\nJan,10,4,NA\nFeb,30,12,EU\nMar,18,9,NA");
    expect(toCSV({ data: [4, 6, 5] })).toBe("value\n4\n6\n5");
    expect(toCSV({ data: { columns: { month: ["Jan", "Feb"], revenue: [1, 2] } } })).toBe("month,revenue\nJan,1\nFeb,2");
    expect(toCSV({ data: [{ note: 'say "hi"', n: 1 }] })).toBe('note,n\n"say ""hi""",1');
  });

  it("adds an xmlns when the svg string omitted it", () => {
    expect(toSVG("<svg></svg>")).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("records export formats on the svg and keeps them out of the line renderer source", () => {
    const svg = render({ ...lineSpec, interaction: { export: ["png", "svg", "csv"] } });
    expect(svg).toContain('data-ck-export="png,svg,csv"');
    const small = createRenderer([line]);
    expect(small({ ...lineSpec, interaction: { export: ["png"] } })).toContain('data-ck-export="png"');
    const source = readFileSync(new URL("../charts/line.ts", import.meta.url), "utf8");
    expect(source).not.toContain("toPNG");
    expect(readFileSync(new URL("../renderers/cartesian.ts", import.meta.url), "utf8")).not.toContain("toDataURL");
  });
});

describe("legends", () => {
  const base = render(lineSpec);

  it("places, aligns, pages, titles, hides, and symbols", () => {
    const right = render({ ...lineSpec, legend: { position: "right" } });
    expect(right).toContain('data-ck-legend="right"');
    expect(right).not.toBe(base);
    const inside = render({ ...lineSpec, legend: { position: "inside", anchor: "bottom-left", align: "end", orient: "vertical" } });
    expect(inside).toContain('data-ck-legend="inside"');
    expect(inside).toContain('data-ck-legend-anchor="bottom-left"');
    expect(inside).toContain('data-ck-legend-align="end"');
    const titled = render({ ...lineSpec, legend: { title: "Series" } });
    expect(titled).toContain("Series");
    const hidden = render({ ...lineSpec, legend: { hide: ["cost"] } });
    expect(hidden).toContain("revenue");
    expect(hidden).not.toContain(">cost<");
    const symbol = render({ ...lineSpec, legend: { symbol: "circle", symbols: [{ series: "revenue", symbol: "triangle" }] } });
    expect(symbol).toContain("<circle");
    expect(symbol).toContain("<path");
    const paged = render({
      ...lineSpec,
      data: [
        { month: "Jan", a: 1, b: 2, c: 3, d: 4 },
        { month: "Feb", a: 2, b: 3, c: 4, d: 5 },
      ],
      encoding: { x: "month", y: ["a", "b", "c", "d"] },
      legend: { maxRows: 1, orient: "vertical" },
    });
    expect(paged).toContain("data-ck-legend-pager");
    expect(paged).toContain('data-ck-legend-page="next"');
    expect(paged).toContain("display:none");
  });

  it("keeps the default cartesian legend markup", () => {
    expect(base).not.toContain("data-ck-legend=");
    expect(base).toContain('width="10" height="10" rx="2"');
  });
});

describe("colour scales", () => {
  const heat = {
    version: "1",
    type: "heatmap",
    data: rows,
    encoding: { x: "month", y: "region", color: "revenue" },
    a11y: { alt },
    size: { width: 420, height: 240 },
  };

  it("paints a sequential ramp on a numeric heatmap and a constant stays on opacity", () => {
    const svg = render(heat);
    expect(svg).toContain('data-ck-scale="sequential"');
    expect(svg).toContain("#007aff");
    const constant = render({ ...heat, encoding: { x: "month", y: "region", color: { field: "revenue", value: "#c45c26" } } });
    expect(constant).not.toContain('data-ck-scale="sequential"');
    expect(constant).toContain("fill-opacity");
  });

  it("uses one scheme name with a brighter midnight ramp", () => {
    const soft = render({ ...heat, encoding: { ...heat.encoding, color: { field: "revenue", scale: { type: "sequential", scheme: "blue" } } } });
    const night = render({ ...heat, theme: "midnight", encoding: { ...heat.encoding, color: { field: "revenue", scale: { type: "sequential", scheme: "blue" } } } });
    expect(soft).toContain("#007aff");
    expect(night).toContain("#38bdf8");
    expect(night).not.toContain("#007aff");
  });

  it("diverges around a midpoint and bins a quantize scale", () => {
    const diverging = render({
      ...heat,
      encoding: { x: "month", y: "region", color: { field: "revenue", scale: { type: "diverging", midpoint: 18 } } },
    });
    expect(diverging).toContain('data-ck-scale="diverging"');
    expect(diverging).toContain("#ff9500");
    const bins = render({
      ...heat,
      encoding: { x: "month", y: "region", color: { field: "revenue", scale: { type: "quantize", bins: 4 } } },
    });
    expect(bins.match(/data-ck-scale="bin"/g)?.length).toBe(4);
    const cuts = render({
      ...heat,
      encoding: { x: "month", y: "region", color: { field: "revenue", scale: { type: "threshold", thresholds: [12, 20] } } },
    });
    expect(cuts.match(/data-ck-scale="bin"/g)?.length).toBe(3);
  });

  it("colours bars, scatter, and treemap from a quantitative field", () => {
    const bars = render({
      ...lineSpec,
      type: "bar",
      encoding: { x: "month", y: "revenue", color: { field: "cost", type: "quantitative", scale: { type: "sequential", scheme: "orange" } } },
    });
    expect(bars).toContain("#ff9500");
    expect(bars).toContain('data-ck-scale="sequential"');
    const dots = render({
      version: "1",
      type: "scatter",
      data: rows,
      encoding: { x: "revenue", y: "cost", color: { field: "revenue", scale: { type: "sequential" } } },
      a11y: { alt },
      size: { width: 420, height: 240 },
    });
    expect(dots).toContain('data-ck-scale="gradient"');
    const tree = render({
      version: "1",
      type: "treemap",
      data: [
        { name: "Oak", size: 8, score: 1 },
        { name: "Steel", size: 6, score: 9 },
      ],
      encoding: { x: "name", y: "size", color: { field: "score", scale: { type: "sequential", scheme: "teal" } } },
      a11y: { alt },
      size: { width: 420, height: 280 },
    });
    expect(tree).toContain('data-ck-scale="sequential"');
    expect(tree).toContain("#0d9488");
  });

  it("keeps a custom range ahead of the named scheme", () => {
    const svg = render({
      ...heat,
      encoding: { x: "month", y: "region", color: { field: "revenue", range: ["#111111", "#eeeeee"], scale: { type: "sequential", scheme: "orange" } } },
    });
    expect(svg).toContain("#111111");
    expect(svg).toContain("#eeeeee");
    expect(svg).not.toContain("#ff9500");
  });
});
