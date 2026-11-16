import { describe, expect, it } from "vitest";
import { charts as coreCharts } from "../all";
import { charts as extraCharts } from "../extra";
import { createRenderer } from "../render";
import { repair, validate } from "../validate";
import { repairPhase4 } from "../validate-phase4";

const draw = createRenderer([...coreCharts, ...extraCharts]);

/** The spec stays strict, repair() converts it, and the result draws the input numbers. */
function converts(input: unknown, type: string, numbers: number[] = []): Record<string, unknown> {
  expect(validate(input).ok).toBe(false);
  const fixed = repair(input);
  expect(fixed.errors).toEqual([]);
  expect(fixed.ok).toBe(true);
  const spec = fixed.spec as Record<string, unknown>;
  expect(spec.type).toBe(type);
  expect(spec.version).toBe("1");
  const svg = draw(spec as never);
  expect(svg).toContain(`data-ck-type="${type}"`);
  expect(svg).not.toContain("ck-chart-error");
  const text = JSON.stringify(spec);
  for (const value of numbers) expect(text).toContain(String(value));
  return spec;
}

const rows = [
  { month: "Jan", revenue: 120 },
  { month: "Feb", revenue: 150 },
  { month: "Mar", revenue: 132 },
];
const alt = { alt: "Revenue rose in February, then eased." };

describe("repair() mechanical fixes", () => {
  it("adds a missing version", () => {
    const input = { type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, a11y: alt };
    const error = validate(input).errors.find((item) => item.code === "CK1003");
    expect(error?.fix).toEqual([{ op: "add", path: "/version", value: "1" }]);
    expect(repair(input).applied).toEqual([{ op: "add", path: "/version", value: "1" }]);
    converts(input, "bar", [120, 150, 132]);
  });

  it("renames other libraries' type names", () => {
    for (const [name, type] of [["doughnut", "donut"], ["column", "bar"], ["horizontalBar", "bar"], ["bar-chart", "bar"], ["line chart", "line"]] as const) {
      converts({ version: "1", type: name, data: rows, encoding: { x: "month", y: "revenue" }, a11y: alt }, type);
    }
    const points = [{ h: 160, w: 58 }, { h: 172, w: 70 }];
    for (const name of ["scatter plot", "bubble", "scatterplot"]) {
      converts({ version: "1", type: name, data: points, encoding: { x: "h", y: "w" }, a11y: alt }, "scatter");
    }
  });

  it("writes the suggested alt after the type is fixed, not before", () => {
    const spec = converts({ version: "1", type: "column", data: rows, encoding: { x: "month", y: "revenue" }, a11y: { alt: "Up." } }, "bar");
    expect((spec.a11y as { alt: string }).alt).toMatch(/^Bar chart/);
  });

  it("coerces a scalar that converts without guessing", () => {
    const input = { version: "1", type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, size: { width: "640", height: 360 }, a11y: alt };
    expect(validate(input).errors[0]?.fix).toEqual([{ op: "replace", path: "/size/width", value: 640 }]);
    converts(input, "bar");
  });

  it("parses a fenced answer with comments, trailing commas, single quotes, and bare keys", () => {
    const text = "Here you go:\n```json\n{\n  // revenue\n  version: '1',\n  type: 'line',\n  data: [{ month: 'Jan', revenue: 120 }, { month: 'Feb', revenue: 150 },],\n  encoding: { x: 'month', y: 'revenue' },\n  a11y: { alt: \"Revenue rose in February.\" },\n}\n```";
    expect(validate(text).errors[0]?.code).toBe("CK1001");
    const fixed = repair(text);
    expect(fixed.ok).toBe(true);
    expect((fixed.spec as { data: unknown[] }).data).toHaveLength(2);
    expect(repairPhase4(text).ok).toBe(true);
  });

  it("infers encoding when the rows allow one reading", () => {
    const spec = converts({ version: "1", type: "bar", data: rows, a11y: alt }, "bar", [120, 150, 132]);
    expect(spec.encoding).toEqual({ x: "month", y: "revenue" });
    const wide = converts({ version: "1", type: "line", data: [{ m: "J", a: 1, b: 2 }, { m: "F", a: 3, b: 4 }], a11y: alt }, "line");
    expect(wide.encoding).toEqual({ x: "m", y: ["a", "b"] });
    const scatter = converts({ version: "1", type: "scatter", data: [{ h: 160, w: 58 }, { h: 172, w: 70 }], a11y: alt }, "scatter");
    expect(scatter.encoding).toEqual({ x: "h", y: "w" });
  });

  it("leaves encoding alone when the rows allow more than one reading", () => {
    const input = { version: "1", type: "bar", data: [{ a: "x", b: "y", v: 1 }], a11y: alt };
    expect(repair(input).ok).toBe(false);
  });
});

describe("repair() misplaced ChartKit keys", () => {
  it("moves a top-level alt or description into a11y", () => {
    const fromAlt = converts({ version: "1", type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, alt: "February was the best month." }, "bar");
    expect(fromAlt.a11y).toEqual({ alt: "February was the best month." });
    const fromDescription = converts({ version: "1", type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, description: "February was the best month." }, "bar");
    expect(fromDescription.a11y).toEqual({ alt: "February was the best month." });
    const keeps = converts({ version: "1", type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, a11y: alt, description: "Monthly revenue table." }, "bar");
    expect(keeps.a11y).toEqual({ ...alt, description: "Monthly revenue table." });
  });

  it("flattens a title object", () => {
    const spec = converts({ version: "1", type: "bar", title: { text: "Revenue", subtext: "2026" }, data: rows, encoding: { x: "month", y: "revenue" }, a11y: alt }, "bar");
    expect(spec.title).toBe("Revenue");
    expect(spec.subtitle).toBe("2026");
  });

  it("moves top-level x and y into encoding only when they name fields", () => {
    const spec = converts({ version: "1", type: "bar", data: rows, x: "month", y: "revenue", a11y: alt }, "bar");
    expect(spec.encoding).toEqual({ x: "month", y: "revenue" });
    const gauge = converts({ version: "1", type: "gauge", value: 64, min: 0, max: 100, label: "Load", a11y: alt }, "gauge", [64]);
    expect(gauge.encoding).toBeUndefined();
  });

  it("wraps column arrays in data.columns", () => {
    const spec = converts({ version: "1", type: "bar", data: { month: ["Jan", "Feb"], revenue: [120, 150] }, encoding: { x: "month", y: "revenue" }, a11y: alt }, "bar", [120, 150]);
    expect(spec.data).toEqual({ columns: { month: ["Jan", "Feb"], revenue: [120, 150] } });
  });

  it("turns a key/value map into rows for a part-of-whole chart", () => {
    const spec = converts({ version: "1", type: "donut", data: { Search: 42, Direct: 28, Social: 18 }, a11y: alt }, "donut", [42, 28, 18]);
    expect(spec.encoding).toEqual({ x: "label", y: "value" });
  });

  it("unwraps { spec: {...} }", () => {
    converts({ spec: { version: "1", type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, a11y: alt } }, "bar", [120]);
  });
});

describe("repair() Recharts shapes", () => {
  it("renames dataKey in an encoding channel", () => {
    const spec = converts({ version: "1", type: "bar", data: rows, encoding: { x: { dataKey: "month" }, y: [{ dataKey: "revenue", mark: "bar" }] }, a11y: alt }, "bar");
    expect(spec.encoding).toEqual({ x: "month", y: [{ field: "revenue", mark: "bar" }] });
  });

  it("converts xAxis.dataKey and bars/lines into encoding", () => {
    const data = [
      { month: "Jan", revenue: 100, margin: 0.2 },
      { month: "Feb", revenue: 140, margin: 0.24 },
    ];
    const bar = converts({ type: "BarChart", data, xAxis: { dataKey: "month" }, bars: [{ dataKey: "revenue" }], a11y: alt }, "bar", [100, 140]);
    expect(bar.encoding).toEqual({ x: "month", y: "revenue" });
    const combo = converts({ version: "1", type: "combo", data, xAxis: { dataKey: "month" }, bars: [{ dataKey: "revenue" }], lines: [{ dataKey: "margin", type: "monotone" }], a11y: alt }, "combo");
    expect(combo.encoding).toEqual({ x: "month", y: [{ field: "revenue", mark: "bar" }, { field: "margin", mark: "line" }] });
  });

  it("converts a pie's dataKey and nameKey", () => {
    const spec = converts({ version: "1", type: "pie", data: [{ name: "A", value: 3 }, { name: "B", value: 5 }], dataKey: "value", nameKey: "name", a11y: alt }, "pie", [3, 5]);
    expect(spec.encoding).toEqual({ x: "name", y: "value" });
  });
});

describe("repair() Vega-Lite shapes", () => {
  const values = [{ month: "Jan", revenue: 120 }, { month: "Feb", revenue: 150 }];
  it("converts mark, data.values, and { field, type } channels", () => {
    const spec = converts(
      {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "Revenue rose in February.",
        mark: { type: "bar", tooltip: true },
        data: { values },
        encoding: { x: { field: "month", type: "nominal", axis: { labelAngle: 0 } }, y: { field: "revenue", type: "quantitative" }, tooltip: [{ field: "revenue" }] },
        width: 400,
      },
      "bar",
      [120, 150],
    );
    expect(spec.a11y).toEqual({ alt: "Revenue rose in February." });
    expect(spec.size).toEqual({ width: 400 });
    expect(spec.$schema).toBeUndefined();
  });

  it("maps arc to donut or pie and theta/color to y/x", () => {
    const donut = converts({ mark: { type: "arc", innerRadius: 50 }, data: { values: [{ c: "A", v: 1 }, { c: "B", v: 2 }] }, encoding: { theta: { field: "v", type: "quantitative" }, color: { field: "c", type: "nominal" } } }, "donut");
    expect(donut.encoding).toEqual({ y: { field: "v", type: "quantitative" }, x: { field: "c", type: "nominal" } });
    converts({ mark: "arc", $schema: "https://vega.github.io/schema/vega-lite/v5.json", data: { values: [{ c: "A", v: 1 }, { c: "B", v: 2 }] }, encoding: { theta: { field: "v" }, color: { field: "c" } } }, "pie");
  });

  it("drops legend and sort on a channel", () => {
    converts({ version: "1", type: "line", data: [{ m: "J", s: "A", v: 1 }, { m: "F", s: "A", v: 2 }], encoding: { x: "m", y: "v", color: { field: "s", legend: { orient: "top" }, sort: "ascending" } }, a11y: alt }, "line");
  });

  it("does not guess at an aggregate or a transform", () => {
    const aggregate = validate({ mark: { type: "bar" }, data: { values }, encoding: { x: { field: "month" }, y: { field: "revenue", aggregate: "sum" } } });
    const note = aggregate.errors.find((item) => item.code === "CK1009" && item.path === "");
    expect(note?.message).toContain("Vega-Lite");
    expect(note?.fix).toBeUndefined();
    expect(aggregate.errors.every((item) => item.fix === undefined)).toBe(true);
    expect(repair({ $schema: "https://vega.github.io/schema/vega-lite/v5.json", mark: "bar", data: { values }, transform: [{ filter: "datum.revenue > 0" }], encoding: { x: { field: "month" }, y: { field: "revenue" } } }).ok).toBe(false);
  });
});

describe("repair() Chart.js shapes", () => {
  it("converts labels and one dataset", () => {
    const spec = converts(
      { type: "bar", data: { labels: ["Jan", "Feb", "Mar"], datasets: [{ label: "Revenue", data: [120, 150, 132] }] }, options: { plugins: { title: { display: true, text: "Revenue" } } } },
      "bar",
      [120, 150, 132],
    );
    expect(spec.data).toEqual([{ label: "Jan", Revenue: 120 }, { label: "Feb", Revenue: 150 }, { label: "Mar", Revenue: 132 }]);
    expect(spec.encoding).toEqual({ x: "label", y: "Revenue" });
    expect(spec.title).toBe("Revenue");
  });

  it("converts several datasets, stacking, and doughnut", () => {
    const multi = converts({ type: "line", data: { labels: ["Jan", "Feb"], datasets: [{ label: "A", data: [1, 2] }, { label: "B", data: [3, 4] }] } }, "line");
    expect(multi.encoding).toEqual({ x: "label", y: ["A", "B"] });
    const stacked = converts({ type: "bar", data: { labels: ["Jan", "Feb"], datasets: [{ label: "A", data: [1, 2] }, { label: "B", data: [3, 4] }] }, options: { scales: { x: { stacked: true }, y: { stacked: true } } } }, "bar");
    expect(stacked.encoding).toEqual({ x: "label", y: [{ field: "A", stack: "total" }, { field: "B", stack: "total" }] });
    converts({ type: "doughnut", data: { labels: ["A", "B"], datasets: [{ data: [1, 2] }] } }, "donut");
  });

  it("converts a bar and line mix to combo with a second axis", () => {
    const spec = converts(
      { type: "bar", data: { labels: ["Jan", "Feb"], datasets: [{ label: "Revenue", data: [100, 140], yAxisID: "y" }, { type: "line", label: "Margin", data: [0.2, 0.24], yAxisID: "y1" }] } },
      "combo",
      [100, 140, 0.2, 0.24],
    );
    expect(spec.encoding).toEqual({ x: "label", y: [{ field: "Revenue", mark: "bar" }, { field: "Margin", mark: "line", axis: "y2" }] });
    expect(spec.axes).toEqual({ y2: true });
  });

  it("converts scatter points", () => {
    converts({ type: "scatter", data: { datasets: [{ label: "Fleet", data: [{ x: 160, y: 58 }, { x: 172, y: 70 }] }] } }, "scatter", [160, 58, 172, 70]);
  });
});

describe("repair() ECharts shapes", () => {
  it("converts xAxis.data and a line series", () => {
    const spec = converts({ title: { text: "Revenue" }, xAxis: { type: "category", data: ["Jan", "Feb", "Mar"] }, yAxis: { type: "value" }, series: [{ name: "Revenue", type: "line", data: [120, 150, 132] }] }, "line", [120, 150, 132]);
    expect(spec.title).toBe("Revenue");
    expect(spec.encoding).toEqual({ x: "label", y: "Revenue" });
  });

  it("converts a stacked area, a combo with yAxisIndex, and dataset.source", () => {
    converts({ xAxis: { data: ["a", "b"] }, series: [{ name: "A", type: "line", stack: "s", areaStyle: {}, data: [1, 2] }, { name: "B", type: "line", stack: "s", areaStyle: {}, data: [3, 4] }] }, "stacked-area");
    const combo = converts({ xAxis: { data: ["a", "b"] }, yAxis: [{}, {}], series: [{ name: "Rain", type: "bar", data: [2, 8] }, { name: "Temp", type: "line", yAxisIndex: 1, data: [18, 16] }] }, "combo");
    expect(combo.axes).toEqual({ y2: true });
    const source = converts({ dataset: { source: [["month", "revenue"], ["Jan", 120], ["Feb", 150]] }, xAxis: { type: "category" }, series: [{ type: "bar" }] }, "bar", [120, 150]);
    expect(source.encoding).toEqual({ x: "month", y: "revenue" });
  });

  it("converts pie, donut, funnel, and gauge", () => {
    const data = [{ name: "Search", value: 42 }, { name: "Direct", value: 28 }];
    converts({ series: [{ type: "pie", data }] }, "pie", [42, 28]);
    converts({ series: [{ type: "pie", radius: ["40%", "70%"], data }] }, "donut", [42, 28]);
    converts({ series: [{ type: "funnel", data }] }, "funnel", [42, 28]);
    const gauge = converts({ series: [{ type: "gauge", data: [{ value: 64, name: "CPU" }] }] }, "gauge", [64]);
    expect(gauge.metric).toEqual({ label: "CPU", value: 64, min: 0, max: 100 });
  });

  it("converts scatter pairs, heatmap cells, and radar indicators", () => {
    converts({ xAxis: {}, yAxis: {}, series: [{ type: "scatter", data: [[160, 58], [172, 70]] }] }, "scatter", [160, 58]);
    const heat = converts({ xAxis: { data: ["9", "10"] }, yAxis: { data: ["Mon", "Tue"] }, series: [{ type: "heatmap", data: [[0, 0, 1], [1, 0, 5], [0, 1, 3]] }] }, "heatmap", [1, 5, 3]);
    expect(heat.encoding).toEqual({ x: "x", y: "y", color: "value" });
    converts({ radar: { indicator: [{ name: "Speed" }, { name: "Cost" }, { name: "Ease" }] }, series: [{ type: "radar", data: [{ name: "A", value: [4, 2, 3] }, { name: "B", value: [2, 5, 4] }] }] }, "radar");
  });

  it("reports a series type it does not convert", () => {
    const result = repair({ series: [{ type: "sunburst", data: [{ name: "A", value: 1 }] }] });
    expect(result.ok).toBe(false);
    expect(result.errors.find((item) => item.path === "")?.message).toContain("ECharts");
  });
});

describe("repair() Plotly shapes", () => {
  it("converts traces with x and y", () => {
    const spec = converts({ data: [{ type: "bar", x: ["Jan", "Feb"], y: [120, 150], name: "Revenue" }], layout: { title: { text: "Revenue" } } }, "bar", [120, 150]);
    expect(spec.encoding).toEqual({ x: "x", y: "Revenue" });
    expect(spec.title).toBe("Revenue");
    converts({ data: [{ type: "bar", x: ["a", "b"], y: [2, 8], name: "Rain" }, { type: "scatter", mode: "lines", x: ["a", "b"], y: [18, 16], name: "Temp", yaxis: "y2" }] }, "combo");
  });

  it("converts a pie with a hole to donut", () => {
    converts({ data: [{ type: "pie", labels: ["A", "B"], values: [3, 5], hole: 0.4 }] }, "donut", [3, 5]);
  });
});

describe("local notes never fail a valid spec", () => {
  it("leaves specs that the schema accepts alone", () => {
    for (const spec of [
      { version: "1", type: "pie", data: [{ x: "A", y: 1 }, { x: "B", y: 2 }], a11y: alt },
      { version: "1", type: "spike", data: [{ x: "t1", y: 0 }, { x: "t2", y: 6 }], a11y: alt },
      { version: "1", type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, a11y: alt },
    ]) {
      expect(validate(spec).errors).toEqual([]);
    }
  });
});

describe("repair() render-fallback warnings", () => {
  it("writes the value render already uses and keeps the chart the same", () => {
    const input = { version: "1", type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, locale: "not a locale!", a11y: alt };
    const before = validate(input);
    expect(before.ok).toBe(true);
    expect(before.warnings.map((item) => item.code)).toContain("CK3127");
    const fixed = repair(input);
    expect(fixed.applied).toEqual([{ op: "remove", path: "/locale" }]);
    expect(fixed.warnings.some((item) => item.code === "CK3127")).toBe(false);
    expect(draw(fixed.spec as never)).toBe(draw(input as never));
  });
});
