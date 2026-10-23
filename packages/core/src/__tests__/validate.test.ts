import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import schema from "../../schema/chartkit.schema.json";
import { repair, suggestAlt, validate } from "../validate";
import { validatePhase4 } from "../validate-phase4";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const examplesDir = join(root, "examples");
const invalidDir = join(root, "invalid");

function load(dir: string, name: string): unknown {
  return JSON.parse(readFileSync(join(dir, name), "utf8")) as unknown;
}

function files(dir: string): string[] {
  return readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
}

const ajv = new Ajv2020({
  strict: true,
  strictRequired: false,
  allowUnionTypes: true,
  allErrors: true,
});
addFormats(ajv);
const ajvValidate = ajv.compile(schema);

const CHART_TYPES = [
  "line",
  "bar",
  "donut",
  "pie",
  "stacked-area",
  "scatter",
  "combo",
  "heatmap",
  "gauge",
  "kpi",
  "sparkline",
  "mini-area",
  "progress-ring",
  "spike",
  "candlestick",
  "histogram",
  "boxplot",
  "radar",
  "funnel",
  "treemap",
  "sankey",
  "bullet",
  "waterfall",
  "area-range",
  "bar-range",
  "errorbar",
  "sunburst",
];

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

describe("example specs", () => {
  const names = files(examplesDir);
  it("includes an example for every chart type", () => {
    const types = names.map((name) => (load(examplesDir, name) as { type: string }).type);
    const schemaTypes = types.filter((type) => !PHASE4.has(type));
    expect([...new Set(schemaTypes)].sort()).toEqual([...CHART_TYPES].sort());
    expect([...new Set(types.filter((type) => PHASE4.has(type)))].sort()).toEqual([...PHASE4].sort());
  });

  for (const name of names) {
    const spec = load(examplesDir, name);
    const type = (spec as { type?: string }).type ?? "";
    if (PHASE4.has(type)) {
      it(`${name} is outside the schema enum and passes validatePhase4()`, () => {
        expect(ajvValidate(spec)).toBe(false);
        const result = validatePhase4(spec);
        expect(result.errors, JSON.stringify(result.errors, null, 2)).toEqual([]);
        expect(result.warnings.some((warning) => warning.code === "CK3011"), JSON.stringify(result.warnings, null, 2)).toBe(false);
        expect(result.ok).toBe(true);
      });
      continue;
    }
    it(`${name} passes Ajv and validate()`, () => {
      const ajvOk = ajvValidate(spec);
      expect(ajvValidate.errors ?? [], JSON.stringify(ajvValidate.errors)).toEqual([]);
      expect(ajvOk).toBe(true);
      const result = validate(spec);
      expect(result.errors, JSON.stringify(result.errors, null, 2)).toEqual([]);
      expect(result.warnings.some((warning) => warning.code === "CK3011"), JSON.stringify(result.warnings, null, 2)).toBe(false);
      expect(result.ok).toBe(true);
    });
  }
});

describe("invalid specs", () => {
  const expected: Record<string, string[]> = {
    "01-typo-colour.json": ["CK1002"],
    "02-unknown-type.json": ["CK1005"],
    "03-missing-alt.json": ["CK1004"],
    "04-missing-ohlc.json": ["CK1003"],
    "05-gauge-without-metric.json": ["CK1003"],
  };

  for (const [name, codes] of Object.entries(expected)) {
    it(`${name} is rejected with ${codes.join(", ")}`, () => {
      const spec = load(invalidDir, name);
      expect(ajvValidate(spec)).toBe(false);
      const result = validate(spec);
      expect(result.ok).toBe(false);
      const actual = [...new Set(result.errors.map((error) => error.code))].sort();
      expect(actual).toEqual([...codes].sort());
      for (const error of result.errors) {
        expect(error.severity).toBe("error");
        expect(typeof error.message).toBe("string");
        expect(typeof error.path).toBe("string");
      }
    });
  }

  it("CK1002 names the typo and suggests a color location", () => {
    const result = validate(load(invalidDir, "01-typo-colour.json"));
    const error = result.errors.find((item) => item.code === "CK1002");
    expect(error?.path).toBe("/colour");
    expect(error?.message).toContain("colour");
    expect(error?.hint).toContain("encoding.color");
  });

  it("CK1005 rejects an unknown type", () => {
    const result = validate(load(invalidDir, "02-unknown-type.json"));
    const error = result.errors[0];
    expect(error.code).toBe("CK1005");
    expect(error.path).toBe("/type");
    expect(error.message).toContain("waffle");
    expect(error.hint).toContain("pie");
  });

  it("CK1004 suggests an alt and the patch makes the spec valid", () => {
    const spec = load(invalidDir, "03-missing-alt.json") as Record<string, unknown>;
    const result = validate(spec);
    const error = result.errors[0];
    expect(error.path).toBe("/a11y");
    expect(error.hint).toContain("suggested:");
    expect(error.hint).toContain(suggestAlt(spec));
    expect(error.fix?.[0]).toMatchObject({ op: "add", path: "/a11y/alt" });
    const alt = error.fix?.[0]?.value;
    expect(typeof alt).toBe("string");
    expect((alt as string).length).toBeGreaterThanOrEqual(10);
    const fixed = { ...spec, a11y: { alt } };
    expect(validate(fixed).ok).toBe(true);
  });

  it("CK1003 lists the missing OHLC channels", () => {
    const messages = validate(load(invalidDir, "04-missing-ohlc.json")).errors.map((error) => error.message);
    expect(messages.join(" ")).toContain("open");
    expect(messages.join(" ")).toContain("high");
    expect(messages.join(" ")).toContain("low");
  });
});

describe("diagnostic codes", () => {
  const base = {
    version: "1",
    type: "line",
    data: [
      { month: "Jan", revenue: 10 },
      { month: "Feb", revenue: 12 },
    ],
    encoding: { x: "month", y: "revenue" },
    a11y: { alt: "Revenue rose from January to February." },
  };

  it("CK1001 reports invalid JSON", () => {
    const result = validate("{not json");
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe("CK1001");
    expect(result.errors[0].path).toBe("");
    expect(result.errors[0].hint).toContain("trailing comma");
  });

  it("CK1008 rejects an unsupported version", () => {
    const result = validate({ ...base, version: "2" });
    const error = result.errors.find((item) => item.code === "CK1008");
    expect(error?.path).toBe("/version");
    expect(error?.fix).toEqual([{ op: "replace", path: "/version", value: "1" }]);
  });

  it("CK1006 rewrites a px height", () => {
    const result = validate({ ...base, size: { height: "300px" } });
    const error = result.errors.find((item) => item.code === "CK1006");
    expect(error?.path).toBe("/size/height");
    expect(error?.hint).toBe("use a number of px: 300");
    expect(error?.fix).toEqual([{ op: "replace", path: "/size/height", value: 300 }]);
  });

  it("CK2001 suggests the case-correct field", () => {
    const result = validate({
      ...base,
      encoding: { x: "month", y: { field: "Revenue" } },
    });
    const error = result.errors.find((item) => item.code === "CK2001");
    expect(error?.path).toBe("/encoding/y/field");
    expect(error?.hint).toContain("revenue");
    expect(error?.fix).toEqual([{ op: "replace", path: "/encoding/y/field", value: "revenue" }]);
  });

  it("CK2006 rejects wide and long encodings together", () => {
    const result = validate({
      ...base,
      data: [
        { month: "Jan", revenue: 1, region: "NA" },
        { month: "Feb", revenue: 2, region: "EU" },
      ],
      encoding: { x: "month", y: ["revenue"], series: "region" },
    });
    expect(result.errors.some((error) => error.code === "CK2006" && error.path === "/encoding/series")).toBe(true);
  });

  it("repairs tooltip fields and position synonyms", () => {
    const listed = validate({ ...base, tooltip: { fields: "revenue, cost" } });
    expect(listed.errors.find((item) => item.path === "/tooltip/fields")?.hint).toContain("did you mean");
    expect(listed.errors.find((item) => item.path === "/tooltip/fields")?.fix).toEqual([
      { op: "replace", path: "/tooltip/fields", value: ["revenue", "cost"] },
    ]);
    expect(repair({ ...base, tooltip: { fields: "revenue" } }).ok).toBe(true);

    const missing = validate({ ...base, tooltip: { fields: ["revnue"] } });
    const miss = missing.errors.find((item) => item.code === "CK2001" && item.path === "/tooltip/fields/0");
    expect(miss?.hint).toContain("revenue");
    expect(miss?.fix).toEqual([{ op: "replace", path: "/tooltip/fields/0", value: "revenue" }]);
    expect(repair({ ...base, tooltip: { fields: ["revnue"] } }).ok).toBe(true);

    for (const [from, to] of [
      ["above", "top"],
      ["below", "bottom"],
      ["over", "top"],
      ["under", "bottom"],
    ] as const) {
      const placed = validate({ ...base, tooltip: { position: from } });
      expect(placed.errors.find((item) => item.path === "/tooltip/position")?.hint).toContain(to);
      expect(placed.errors.find((item) => item.path === "/tooltip/position")?.fix).toEqual([
        { op: "replace", path: "/tooltip/position", value: to },
      ]);
    }

    const ok = validate({
      ...base,
      tooltip: {
        fields: [{ field: "revenue", title: "Sales", format: "currency" }],
        position: "top",
        crosshairLabel: true,
      },
    });
    expect(ok.ok).toBe(true);
    expect(ok.warnings.some((warning) => warning.path === "/tooltip/fields")).toBe(false);
  });

  it("repairs select true and removes click keys", () => {
    const selected = validate({ ...base, interaction: { select: true } });
    expect(selected.errors.find((item) => item.path === "/interaction/select")?.hint).toContain("point");
    expect(selected.errors.find((item) => item.path === "/interaction/select")?.fix).toEqual([
      { op: "replace", path: "/interaction/select", value: "point" },
    ]);
    expect(repair({ ...base, interaction: { select: true } }).spec).toMatchObject({ interaction: { select: "point" } });
    const clicked = validate({ ...base, onClick: "handler", interaction: { click: true } });
    expect(clicked.errors.find((item) => item.path === "/onClick")?.hint).toContain("pointclick");
    expect(clicked.errors.find((item) => item.path === "/onClick")?.fix).toEqual([{ op: "remove", path: "/onClick" }]);
    expect(clicked.errors.find((item) => item.path === "/interaction/click")?.fix).toEqual([{ op: "remove", path: "/interaction/click" }]);
    const fixed = repair({ ...base, onClick: "handler", interaction: { click: true, select: "series" } });
    expect(fixed.ok).toBe(true);
    expect(fixed.spec).not.toHaveProperty("onClick");
    expect(fixed.spec.interaction).toEqual({ select: "series" });
  });

  it("repairs marker names, label words, and stack totals", () => {
    const fixed = repair({ ...base, mark: { symbol: "rect", hollow: true, labels: "above", stackLabels: true } });
    expect(fixed.ok).toBe(true);
    expect(fixed.spec.mark).toMatchObject({
      pointShape: "square",
      pointFill: "hollow",
      labels: true,
      labelPosition: "top",
      stackTotal: true,
    });
    expect(fixed.spec.mark).not.toHaveProperty("symbol");
    expect(fixed.spec.mark).not.toHaveProperty("hollow");
    expect(fixed.spec.mark).not.toHaveProperty("stackLabels");
    const shape = validate({ ...base, mark: { pointShape: "rect" } });
    expect(shape.errors.find((item) => item.path === "/mark/pointShape")?.fix).toEqual([
      { op: "replace", path: "/mark/pointShape", value: "square" },
    ]);
  });

  it("does not warn CK3011 for tooltip, zoom, legend toggle, animation, or a11y", () => {
    const result = validate({
      ...base,
      tooltip: true,
      interaction: { zoom: "x", pan: true, brush: "x" },
      animation: { duration: 400 },
      legend: { interactive: true },
      a11y: { alt: "Revenue rose from January to February.", keyboard: true, dataTable: true },
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.filter((warning) => warning.code === "CK3011")).toEqual([]);
  });

  it("stays quiet when those features are off", () => {
    const result = validate({
      ...base,
      tooltip: false,
      interaction: { zoom: "none", pan: false, brush: "none", hover: true },
      animation: { duration: 0 },
      legend: { interactive: false },
      a11y: { alt: "Revenue rose from January to February.", keyboard: false, dataTable: false },
    });
    expect(result.warnings.some((warning) => warning.code === "CK3011")).toBe(false);
    expect(result.ok).toBe(true);
  });

  it("does not warn CK2008 when a scatter x is unsorted", () => {
    const result = validate({
      version: "1",
      type: "scatter",
      data: [
        { x: 3, y: 1 },
        { x: 1, y: 2 },
      ],
      encoding: { x: { field: "x", type: "quantitative" }, y: "y" },
      a11y: { alt: "The points are not in x order." },
    });
    expect(result.warnings.some((warning) => warning.code === "CK2008")).toBe(false);
  });

  it("CK3010 warns, and the chart still validates, when a mark does not apply", () => {
    const result = validate({ ...base, mark: { innerRadius: 0.5 } });
    expect(result.ok).toBe(true);
    expect(result.warnings.map((warning) => warning.code)).toEqual(["CK3010"]);
    expect(result.warnings[0].path).toBe("/mark/innerRadius");
    expect(result.warnings[0].hint).toContain("donut");
  });

  it("CK3001 rejects a log scale with non-positive values", () => {
    const result = validate({
      ...base,
      data: [
        { month: "Jan", revenue: 0 },
        { month: "Feb", revenue: 4 },
      ],
      encoding: { x: "month", y: { field: "revenue", scale: { type: "log" } } },
    });
    const error = result.errors.find((item) => item.code === "CK3001");
    expect(error?.message).toContain("≤ 0");
  });

  it("CK3003 checks candlestick high and low", () => {
    const result = validate({
      version: "1",
      type: "candlestick",
      data: [{ date: "2026-01-01", open: 10, high: 8, low: 11, close: 9 }],
      encoding: {
        x: "date",
        open: "open",
        high: "high",
        low: "low",
        close: "close",
      },
      a11y: { alt: "This candle has a high below the body and a low above it." },
    });
    const codes = result.errors.map((error) => error.code);
    expect(codes).toContain("CK3003");
  });

  it("CK1005 maps Mermaid type names onto ChartKit types", () => {
    const line = validate({ ...base, type: "xychart" });
    expect(line.errors.find((item) => item.code === "CK1005")?.fix).toEqual([
      { op: "replace", path: "/type", value: "line" },
    ]);
    expect(repair({ ...base, type: "xychart-beta" }).spec).toMatchObject({ type: "line" });

    const bar = validate({
      ...base,
      type: "xychart-beta",
      encoding: { x: "month", y: { field: "revenue", mark: "bar" } },
    });
    expect(bar.errors.find((item) => item.code === "CK1005")?.fix).toEqual([
      { op: "replace", path: "/type", value: "bar" },
    ]);

    const combo = {
      ...base,
      type: "xychart",
      data: [
        { month: "Jan", revenue: 10, rate: 0.2 },
        { month: "Feb", revenue: 12, rate: 0.4 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "revenue", mark: "bar" },
          { field: "rate", mark: "line" },
        ],
      },
    };
    expect(validate(combo).errors.find((item) => item.code === "CK1005")?.fix).toEqual([
      { op: "replace", path: "/type", value: "combo" },
    ]);
    expect(repair(combo).ok).toBe(true);

    const datasets = validate({
      ...base,
      type: "xychart-beta",
      data: {
        datasets: [
          { type: "bar", label: "Orders", data: [10, 12] },
          { type: "line", label: "Rate", data: [1, 2] },
        ],
      },
    });
    expect(datasets.errors.find((item) => item.code === "CK1005")?.fix).toEqual([
      { op: "replace", path: "/type", value: "combo" },
    ]);
    const labeled = validate({
      ...base,
      type: "xychart-beta",
      data: { datasets: [{ type: "line", label: "bar", data: [1, 2] }] },
    });
    expect(labeled.errors.find((item) => item.code === "CK1005")?.fix).toEqual([
      { op: "replace", path: "/type", value: "line" },
    ]);

    for (const [raw, type] of [
      ["sankey-beta", "sankey"],
      ["radar-beta", "radar"],
      ["treemap-beta", "treemap"],
    ] as const) {
      const result = validate({ ...base, type: raw });
      expect(result.errors.find((item) => item.code === "CK1005")?.fix).toEqual([
        { op: "replace", path: "/type", value: type },
      ]);
    }

    const stacked = validate({ ...base, type: "area", mark: { stack: "stack" } });
    expect(stacked.errors.find((item) => item.code === "CK1005")?.fix).toEqual([
      { op: "replace", path: "/type", value: "stacked-area" },
    ]);
    expect(repair({ ...base, type: "area", mark: { stack: "percent" } }).spec).toMatchObject({ type: "stacked-area" });
    expect(validate({ ...base, type: "area", stacked: true }).errors.find((item) => item.code === "CK1005")?.fix?.[0]).toMatchObject({
      value: "stacked-area",
    });
  });

  it("CK1005 maps area onto mini-area and names the full-size alternative", () => {
    const result = validate({ ...base, type: "area" });
    const error = result.errors.find((item) => item.code === "CK1005");
    expect(error?.hint).toContain("mini-area");
    expect(error?.hint).toContain("stacked-area");
    expect(error?.fix).toEqual([{ op: "replace", path: "/type", value: "mini-area" }]);
  });

  it("CK1005 maps grid-heat onto heatmap", () => {
    const result = validate({ ...base, type: "grid-heat" });
    const error = result.errors.find((item) => item.code === "CK1005");
    expect(error?.hint).toContain("heatmap");
    expect(error?.fix).toEqual([{ op: "replace", path: "/type", value: "heatmap" }]);
  });

  it("CK1007 maps categorical onto nominal", () => {
    const result = validate({
      ...base,
      encoding: { x: "month", y: { field: "revenue", type: "categorical" } },
    });
    const error = result.errors.find((item) => item.code === "CK1007");
    expect(error?.path).toBe("/encoding/y/type");
    expect(error?.hint).toContain("nominal");
    expect(error?.fix).toEqual([{ op: "replace", path: "/encoding/y/type", value: "nominal" }]);
  });

  it("CK1009 unwraps Vega-Lite data.values and the patch validates", () => {
    const spec = {
      ...base,
      data: { values: base.data },
    };
    const result = validate(spec);
    const error = result.errors.find((item) => item.code === "CK1009");
    expect(error?.path).toBe("/data");
    expect(error?.hint).toContain("data: [...]");
    expect(result.errors.some((item) => item.message.includes("columns"))).toBe(false);
    expect(error?.fix).toEqual([{ op: "move", from: "/data/values", path: "/data" }]);
    expect(validate({ ...spec, data: base.data }).ok).toBe(true);
  });

  it("CK1009 moves a string mark into type", () => {
    const { type: _type, ...rest } = base;
    const spec = { ...rest, mark: "line" };
    const result = validate(spec);
    const error = result.errors.find((item) => item.code === "CK1009");
    expect(error?.path).toBe("/mark");
    expect(error?.hint).toContain("type");
    expect(result.errors.some((item) => item.code === "CK1003" && item.message.includes("type"))).toBe(false);
    expect(error?.fix).toEqual([
      { op: "add", path: "/type", value: "line" },
      { op: "remove", path: "/mark" },
    ]);
  });

  it("CK1009 explains an axis object and offers y or y2", () => {
    const result = validate({
      ...base,
      encoding: { x: "month", y: { field: "revenue", axis: { title: "Units" } } },
    });
    const error = result.errors.find((item) => item.code === "CK1009");
    expect(error?.path).toBe("/encoding/y/axis");
    expect(error?.hint).toContain('"y"');
    expect(error?.hint).toContain("y2");
    expect(error?.fix?.[0]).toEqual({ op: "replace", path: "/encoding/y/axis", value: "y" });
    expect(error?.fix).toEqual(
      expect.arrayContaining([expect.objectContaining({ op: "add", path: "/axes", value: { y: { title: "Units" } } })]),
    );
  });

  it("CK1009 moves gauge value, min, and max into metric", () => {
    const spec = {
      version: "1",
      type: "gauge",
      value: 64,
      min: 0,
      max: 100,
      label: "Capacity",
      a11y: { alt: "Capacity is 64 out of 100." },
    };
    const result = validate(spec);
    const error = result.errors.find((item) => item.code === "CK1009");
    expect(error?.path).toBe("/metric");
    expect(error?.hint).toContain("metric");
    expect(result.errors.some((item) => item.code === "CK1002")).toBe(false);
    expect(result.errors.some((item) => item.code === "CK1003" && item.message.includes("metric"))).toBe(false);
    expect(validate({
      version: "1",
      type: "gauge",
      metric: { value: 64, min: 0, max: 100, label: "Capacity" },
      a11y: spec.a11y,
    }).ok).toBe(true);
  });

  it("CK1009 maps donut theta and label onto y and x", () => {
    const spec = {
      version: "1",
      type: "donut",
      data: [
        { name: "Oak", count: 8 },
        { name: "Pine", count: 5 },
      ],
      encoding: { label: "name", theta: "count" },
      a11y: { alt: "Oak is the larger share." },
    };
    const result = validate(spec);
    const error = result.errors.find((item) => item.code === "CK1009");
    expect(error?.hint).toContain("encoding.x");
    expect(error?.hint).toContain("encoding.y");
    expect(error?.fix).toEqual([
      { op: "move", from: "/encoding/label", path: "/encoding/x" },
      { op: "move", from: "/encoding/theta", path: "/encoding/y" },
    ]);
    expect(validate({ ...spec, encoding: { x: "name", y: "count" } }).ok).toBe(true);
  });

  it("a missing type reports the repair and not every chart's required fields", () => {
    const { type: _type, ...rest } = base;
    const spec = { ...rest, mark: "bar" };
    const result = validate(spec);
    expect(result.errors[0]?.code).toBe("CK1009");
    const blob = JSON.stringify(result.errors);
    expect(blob).not.toContain("metric");
    expect(blob).not.toContain("open");
    expect(blob).not.toContain("high");
    expect(blob).not.toContain("close");
    const repaired = repair(spec);
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { type: string }).type).toBe("bar");
    expect(spec.mark).toBe("bar");
  });

  it("CK1005 maps point, rect, multi-series area, and metric", () => {
    const point = validate({ ...base, type: "point" });
    expect(point.errors[0]?.hint).toContain("scatter");
    expect(point.errors[0]?.fix).toEqual([{ op: "replace", path: "/type", value: "scatter" }]);

    const rect = validate({ ...base, type: "rect" });
    expect(rect.errors.find((item) => item.code === "CK1005")?.fix).toEqual([{ op: "replace", path: "/type", value: "heatmap" }]);

    const stacked = {
      ...base,
      type: "area",
      data: [
        { month: "Jan", revenue: 10, cost: 4 },
        { month: "Feb", revenue: 12, cost: 5 },
      ],
      encoding: { x: "month", y: ["revenue", "cost"] },
    };
    expect(validate(stacked).errors.find((item) => item.code === "CK1005")?.fix).toEqual([
      { op: "replace", path: "/type", value: "stacked-area" },
    ]);
    expect(repair(stacked).ok).toBe(true);

    const metric = validate({ ...base, type: "metric" });
    const metricError = metric.errors.find((item) => item.code === "CK1005");
    expect(metricError?.hint).toContain("gauge");
    expect(metricError?.hint).toContain("kpi");
    expect(metricError?.hint).toContain("metric: { value, min, max, label?, delta? }");
    expect(metricError?.fix).toEqual([{ op: "replace", path: "/type", value: "kpi" }]);

    const gauge = validate({
      version: "1",
      type: "metric",
      min: 0,
      max: 100,
      value: 64,
      a11y: { alt: "Capacity is 64 out of 100." },
    });
    expect(gauge.errors.find((item) => item.code === "CK1005")?.fix?.[0]).toMatchObject({ path: "/type", value: "gauge" });
    expect(repair({
      version: "1",
      type: "metric",
      min: 0,
      max: 100,
      value: 64,
      a11y: { alt: "Capacity is 64 out of 100." },
    }).ok).toBe(true);
  });

  it("CK1003 for a gauge shows the metric shape", () => {
    const result = validate({ version: "1", type: "gauge", a11y: { alt: "This gauge is missing its metric value." } });
    expect(result.errors.find((item) => item.code === "CK1003")?.hint).toContain("metric: { value, min, max, label?, delta? }");
  });

  it("CK1009 builds metric from a one-row encoding and does not call a gauge a donut", () => {
    const spec = {
      version: "1",
      type: "gauge",
      data: [{ value: 64, min: 0, max: 100 }],
      encoding: { value: "value", min: "min", max: "max", theta: "value" },
      a11y: { alt: "Capacity is 64 out of 100." },
    };
    const result = validate(spec);
    expect(result.errors.some((item) => /donut/i.test(`${item.message} ${item.hint ?? ""}`))).toBe(false);
    expect(result.errors.find((item) => item.code === "CK1009")?.hint).toContain("metric: { value, min, max, label?, delta? }");
    expect(result.errors.find((item) => item.code === "CK1009")?.hint).toContain("metric: { value, min, max, label?, delta? }");
    const { encoding: _encoding, ...rest } = spec;
    const repaired = repair({ ...rest, encoding: { value: "value", min: "min", max: "max" } });
    expect((repaired.spec as { metric: unknown }).metric).toEqual({ value: 64, min: 0, max: 100 });
    expect((repaired.spec as { data?: unknown }).data).toBeUndefined();
    expect(repaired.ok).toBe(true);
  });

  it("CK1009 moves a metric data object into metric and drops data", () => {
    const spec = {
      version: "1",
      type: "gauge",
      data: { value: 40, min: 0, max: 80, label: "Load", note: "ignore" },
      a11y: { alt: "Load is 40 out of 80." },
    };
    const result = validate(spec);
    const error = result.errors.find((item) => item.code === "CK1009");
    expect(result.errors.filter((item) => item.code === "CK1009")).toHaveLength(1);
    expect(error?.path).toBe("/metric");
    expect(error?.hint).toContain("metric: { value, min, max, label?, delta? }");
    expect(error?.hint).toContain("remove data");
    expect(error?.fix).toEqual([
      { op: "add", path: "/metric", value: { value: 40, label: "Load", min: 0, max: 80 } },
      { op: "remove", path: "/data" },
    ]);
    expect(result.errors.some((item) => item.code === "CK1002")).toBe(false);
    expect(result.errors.some((item) => item.code === "CK1006")).toBe(false);
    expect(result.errors.some((item) => item.message.includes("columns"))).toBe(false);
    const repaired = repair(spec);
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { metric: unknown }).metric).toEqual({ value: 40, label: "Load", min: 0, max: 80 });
    expect((repaired.spec as { data?: unknown }).data).toBeUndefined();
    expect(spec.data).toEqual({ value: 40, min: 0, max: 80, label: "Load", note: "ignore" });
  });

  it("CK1009 removes a bad columns payload on gauge, kpi, and progress-ring", () => {
    for (const type of ["gauge", "kpi", "progress-ring"] as const) {
      const spec = {
        version: "1",
        type,
        metric: type === "kpi" ? { value: 40, delta: 0.2, label: "Load" } : { value: 40, min: 0, max: 80 },
        data: { columns: [] },
        a11y: { alt: "Load is 40." },
      };
      const result = validate(spec);
      expect(result.errors.map((item) => item.code)).toEqual(["CK1009"]);
      expect(result.errors[0]?.fix).toEqual([{ op: "remove", path: "/data" }]);
      expect(result.errors[0]?.hint).toContain("metric: { value, min, max, label?, delta? }");
      expect(JSON.stringify(result.errors)).not.toContain("columns");
      const repaired = repair(spec);
      expect(repaired.ok).toBe(true);
      expect((repaired.spec as { data?: unknown }).data).toBeUndefined();
      expect((repaired.spec as { metric: { value: number } }).metric.value).toBe(40);
    }
  });

  it("a kpi sparkline table stays beside metric", () => {
    const spec = {
      version: "1",
      type: "kpi",
      metric: { value: 40, label: "Load" },
      data: [4, 6, 5, 9],
      a11y: { alt: "Load is 40 and rising." },
    };
    expect(validate(spec).ok).toBe(true);

    const columnar = validate({
      ...spec,
      data: { columns: { month: ["Jan", "Feb"], amount: [4, 6] } },
    });
    expect(columnar.ok).toBe(true);
  });

  it("a line chart still rejects a metric-shaped data object", () => {
    const result = validate({
      ...base,
      data: { value: 40, min: 0, max: 80 },
    });
    expect(result.errors.some((item) => item.code === "CK1009" && item.path === "/metric")).toBe(false);
    expect(result.errors.some((item) => item.message.includes("columns") || item.code === "CK1002")).toBe(true);
  });

  it("CK1009 moves an x axis title and drops a null y axis", () => {
    const titled = validate({
      ...base,
      encoding: { x: { field: "month", axis: { title: "Month" } }, y: "revenue" },
    });
    const axis = titled.errors.find((item) => item.code === "CK1009");
    expect(axis?.path).toBe("/encoding/x/axis");
    expect(axis?.hint).toContain("axes.x.title");
    expect(repair({
      ...base,
      encoding: { x: { field: "month", axis: { title: "Month" } }, y: "revenue" },
    }).ok).toBe(true);

    const nulled = validate({
      ...base,
      encoding: { x: "month", y: { field: "revenue", axis: null } },
    });
    expect(nulled.errors.find((item) => item.code === "CK1009")?.fix).toEqual([
      { op: "remove", path: "/encoding/y/axis" },
    ]);
  });

  it("CK1009 rewrites a Vega-Lite layer into combo series", () => {
    const spec = {
      version: "1",
      data: [
        { month: "Jan", revenue: 10, cost: 4 },
        { month: "Feb", revenue: 12, cost: 5 },
      ],
      layer: [
        { mark: "bar", encoding: { x: "month", y: "revenue" } },
        { mark: "line", encoding: { x: "month", y: "cost" } },
      ],
      a11y: { alt: "Revenue stayed above cost." },
    };
    const result = validate(spec);
    expect(result.errors[0]?.code).toBe("CK1009");
    expect(result.errors[0]?.hint).toContain('axis: "y2"');
    expect(result.errors.some((item) => item.message.includes("layer") && item.code === "CK1002")).toBe(false);
    const repaired = repair(spec);
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { type: string }).type).toBe("combo");
  });

  it("CK1007 maps mark.points true to always and .2f to a number format", () => {
    const points = validate({ ...base, mark: { points: true } });
    expect(points.errors.find((item) => item.path === "/mark/points")?.fix).toEqual([
      { op: "replace", path: "/mark/points", value: "always" },
    ]);
    expect(repair({ ...base, mark: { points: true } }).ok).toBe(true);

    const formatted = validate({
      ...base,
      encoding: { x: "month", y: { field: "revenue", format: ".2f" } },
    });
    expect(formatted.errors.find((item) => item.path === "/encoding/y/format")?.fix?.[0]?.value).toEqual({
      style: "number",
      decimals: 2,
    });
  });

  it("CK2001 tells a sparkline not to encode the number array", () => {
    const spec = {
      version: "1",
      type: "sparkline",
      data: [4, 6, 5],
      encoding: { y: { field: "data" } },
      a11y: { alt: "The line ends near where it starts." },
    };
    const result = validate(spec);
    expect(result.errors.some((item) => item.hint?.includes("need no encoding"))).toBe(true);
    expect(repair(spec).ok).toBe(true);
  });

  it("CK1009 maps donut label and value onto x and y", () => {
    const spec = {
      version: "1",
      type: "donut",
      data: [
        { wood: "Oak", boards: 8 },
        { wood: "Pine", boards: 5 },
      ],
      encoding: { label: "wood", value: "boards" },
      a11y: { alt: "Oak is the larger share." },
    };
    const repaired = repair(spec);
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { encoding: unknown }).encoding).toEqual({ x: "wood", y: "boards" });
  });

  it("CK1005 maps grid-heatmap and calendar-heatmap and keeps the measure in color", () => {
    const grid = {
      version: "1",
      type: "grid-heatmap",
      data: [
        { bin: "a", row: "r", level: 1 },
        { bin: "b", row: "r", level: 4 },
      ],
      encoding: { x: "bin", y: "row", color: "level" },
      a11y: { alt: "The second bin is higher." },
    };
    const gridRepaired = repair(grid);
    expect(gridRepaired.ok).toBe(true);
    expect((gridRepaired.spec as { type: string; mark: unknown }).type).toBe("heatmap");
    expect((gridRepaired.spec as { mark: { layout: string } }).mark.layout).toBe("grid");

    const calendar = {
      version: "1",
      type: "calendar-heatmap",
      data: [
        { day: "2024-01-01", count: 3 },
        { day: "2024-01-02", count: 5 },
      ],
      encoding: { date: "day", value: "count" },
      a11y: { alt: "The second day is higher." },
    };
    const hinted = validate(calendar);
    expect(JSON.stringify(hinted.errors)).not.toContain("volume");
    const calendarRepaired = repair(calendar);
    expect(calendarRepaired.ok).toBe(true);
    expect(calendarRepaired.spec).toMatchObject({
      type: "heatmap",
      mark: { layout: "calendar" },
      encoding: { x: "day", color: "count" },
    });
  });

  it("CK1009 moves a calendar numeric y to color and leaves a grid category y", () => {
    const calendar = repair({
      version: "1",
      type: "heatmap",
      mark: { layout: "calendar" },
      data: [
        { day: "2024-01-01", count: 3 },
        { day: "2024-01-02", count: 5 },
      ],
      encoding: { x: "day", y: "count" },
      a11y: { alt: "The second day is higher." },
    });
    expect(calendar.ok).toBe(true);
    expect((calendar.spec as { encoding: unknown }).encoding).toEqual({ x: "day", color: "count" });

    const grid = repair({
      version: "1",
      type: "heatmap",
      mark: { layout: "grid" },
      data: [
        { bin: "a", hour: 1, level: 2 },
        { bin: "b", hour: 2, level: 4 },
      ],
      encoding: { x: "bin", y: "hour" },
      a11y: { alt: "Levels differ by bin." },
    });
    expect(grid.ok).toBe(false);
    expect((grid.spec as { encoding: { y: string } }).encoding.y).toBe("hour");
    expect(grid.errors.some((item) => item.message.includes("color"))).toBe(true);
  });

  it("CK1009 builds combo series from encoding.bar, encoding.line, marks, and layers", () => {
    const channels = repair({
      version: "1",
      type: "combo",
      data: [
        { month: "Jan", revenue: 10, cost: 4 },
        { month: "Feb", revenue: 12, cost: 5 },
      ],
      encoding: { x: "month", bar: "revenue", line: "cost" },
      a11y: { alt: "Revenue stayed above cost." },
    });
    expect(channels.ok).toBe(true);
    expect((channels.spec as { encoding: { y: unknown }; axes: unknown }).encoding.y).toEqual([
      { field: "revenue", mark: "bar" },
      { field: "cost", mark: "line", axis: "y2" },
    ]);
    expect((channels.spec as { axes: { y2: boolean } }).axes.y2).toBe(true);

    const marks = repair({
      version: "1",
      type: "combo",
      data: [
        { month: "Jan", revenue: 10, cost: 4 },
        { month: "Feb", revenue: 12, cost: 5 },
      ],
      encoding: { x: "month" },
      marks: { bar: "revenue", line: "cost" },
      a11y: { alt: "Revenue stayed above cost." },
    });
    expect(marks.ok).toBe(true);
    expect((marks.spec as { marks?: unknown }).marks).toBeUndefined();

    const layers = repair({
      version: "1",
      data: [
        { month: "Jan", revenue: 10, cost: 4 },
        { month: "Feb", revenue: 12, cost: 5 },
      ],
      layers: [
        { mark: "bar", encoding: { x: "month", y: "revenue" } },
        { mark: "line", encoding: { x: "month", y: "cost" } },
      ],
      a11y: { alt: "Revenue stayed above cost." },
    });
    expect(layers.ok).toBe(true);
    expect((layers.spec as { type: string }).type).toBe("combo");
  });

  it("CK1009 moves a y field array onto y", () => {
    const input = {
      version: "1",
      type: "stacked-area",
      data: [
        { month: "Jan", units: 2, returns: 3 },
        { month: "Feb", units: 4, returns: 1 },
      ],
      encoding: { x: "month", y: { field: ["units", "returns"] } },
      a11y: { alt: "Units and returns both changed." },
    };
    const result = validate(input);
    const error = result.errors.find((item) => item.code === "CK1009" && item.path === "/encoding/y");
    expect(error?.hint).toContain("encoding.y");
    expect(error?.hint).not.toContain("columns");
    expect(error?.fix).toEqual([{ op: "replace", path: "/encoding/y", value: ["units", "returns"] }]);
    expect(result.errors.some((item) => item.code === "CK1006")).toBe(false);
    const repaired = repair(input);
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { encoding: { y: unknown } }).encoding.y).toEqual(["units", "returns"]);
    expect(input.encoding.y).toEqual({ field: ["units", "returns"] });
  });

  it("CK1009 keeps sibling keys when a y field array is expanded", () => {
    const repaired = repair({
      version: "1",
      type: "line",
      data: [
        { month: "Jan", units: 2, returns: 3 },
        { month: "Feb", units: 4, returns: 1 },
      ],
      encoding: { x: "month", y: { field: ["units", "returns"], type: "quantitative" } },
      a11y: { alt: "Units and returns both changed." },
    });
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { encoding: { y: unknown } }).encoding.y).toEqual([
      { field: "units", type: "quantitative" },
      { field: "returns", type: "quantitative" },
    ]);
  });

  it("CK1009 turns type area plus a y field array into stacked-area", () => {
    const repaired = repair({
      version: "1",
      type: "area",
      data: [
        { month: "Jan", units: 2, returns: 3 },
        { month: "Feb", units: 4, returns: 1 },
      ],
      encoding: { x: "month", y: { field: ["units", "returns"] } },
      a11y: { alt: "Units and returns both changed." },
    });
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { type: string }).type).toBe("stacked-area");
    expect((repaired.spec as { encoding: { y: unknown } }).encoding.y).toEqual(["units", "returns"]);
  });

  it("CK1009 maps combo y type bar and line onto mark", () => {
    const input = {
      version: "1",
      type: "combo",
      data: [
        { month: "Jan", revenue: 10, cost: 4 },
        { month: "Feb", revenue: 12, cost: 5 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "revenue", type: "bar" },
          { field: "cost", type: "line", axis: "y2" },
        ],
      },
      axes: { y2: true },
      a11y: { alt: "Revenue stayed above cost." },
    };
    const result = validate(input);
    const marks = result.errors.filter((item) => item.code === "CK1009" && item.message.includes("series mark"));
    expect(marks).toHaveLength(2);
    expect(marks.every((item) => item.fix?.some((op) => op.op === "remove"))).toBe(true);
    expect(result.errors.some((item) => item.code === "CK1007")).toBe(false);
    const repaired = repair(input);
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { encoding: { y: unknown } }).encoding.y).toEqual([
      { field: "revenue", mark: "bar" },
      { field: "cost", mark: "line", axis: "y2" },
    ]);
    expect(input.encoding.y[0]).toEqual({ field: "revenue", type: "bar" });
  });

  it("does not turn a line chart y type into a bar mark", () => {
    const repaired = repair({
      ...base,
      encoding: { x: "month", y: { field: "revenue", type: "bar" } },
    });
    expect(repaired.ok).toBe(false);
    expect((repaired.spec as { encoding: { y: { mark?: string; type?: string } } }).encoding.y.mark).toBeUndefined();
    expect((repaired.spec as { encoding: { y: { type?: string } } }).encoding.y.type).toBe("bar");
  });

  it("CK1005 repairs a single-series area to mini-area", () => {
    const repaired = repair({ ...base, type: "area" });
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { type: string }).type).toBe("mini-area");
  });

  it("repair applies data.values and leaves the input alone", () => {
    const spec = { ...base, data: { values: base.data } };
    const repaired = repair(spec);
    expect(repaired.ok).toBe(true);
    expect(spec.data).toEqual({ values: base.data });
  });

  it("CK2004 rejects empty data", () => {
    const result = validate({ ...base, data: [] });
    expect(result.errors.some((error) => error.code === "CK2004" && error.path === "/data")).toBe(true);
  });

  it("CK3004 checks encoding.y.scale.domain and patches a reversed range", () => {
    const ok = validate({
      ...base,
      encoding: { x: "month", y: { field: "revenue", scale: { domain: [0, null] } } },
    });
    expect(ok.errors.some((item) => item.code === "CK3004")).toBe(false);

    const reversed = {
      ...base,
      encoding: { x: "month", y: { field: "revenue", scale: { domain: [20, 0] } } },
    };
    expect(validate(reversed).errors.find((item) => item.code === "CK3004")?.fix).toEqual([
      { op: "replace", path: "/encoding/y/scale/domain", value: [0, 20] },
    ]);
    expect(repair(reversed).spec).toMatchObject({ encoding: { y: { scale: { domain: [0, 20] } } } });

    const equal = validate({
      ...base,
      encoding: { x: "month", y: { field: "revenue", scale: { domain: [5, 5] } } },
    });
    expect(equal.errors.find((item) => item.code === "CK3004")?.fix).toBeUndefined();

    const text = {
      ...base,
      encoding: {
        x: "month",
        y: [
          { field: "revenue", scale: { domain: ["low", 10] } },
          { field: "revenue", axis: "y2", scale: { domain: [0, 1] } },
        ],
      },
      axes: { y2: true },
    };
    expect(validate(text).errors.find((item) => item.code === "CK3004")).toMatchObject({
      path: "/encoding/y/0/scale/domain",
      fix: [{ op: "replace", path: "/encoding/y/0/scale/domain", value: [null, 10] }],
    });
    expect(validate(text).ok).toBe(false);
    expect(repair(text).ok).toBe(true);
  });

  it("CK3004 checks every scale domain, including x, and skips category lists", () => {
    const reversed = validate({
      ...base,
      encoding: { x: { field: "month", scale: { domain: [20, 0] } }, y: "revenue" },
    });
    expect(reversed.errors.find((item) => item.code === "CK3004")).toMatchObject({
      path: "/encoding/x/scale/domain",
      fix: [{ op: "replace", path: "/encoding/x/scale/domain", value: [0, 20] }],
    });
    const length = validate({
      ...base,
      encoding: { x: "month", y: { field: "revenue", scale: { domain: [0, 10, 20] } } },
    });
    expect(length.errors.find((item) => item.code === "CK3004")?.fix).toEqual([
      { op: "remove", path: "/encoding/y/scale/domain" },
    ]);
    const words = validate({
      ...base,
      encoding: { x: { field: "month", scale: { domain: ["Jan", "Mar"] } }, y: "revenue" },
    });
    expect(words.errors.some((item) => item.code === "CK3004")).toBe(false);
  });

  it("suggests at most three close names and skips a distant one", () => {
    const far = validate({
      ...base,
      encoding: { x: "month", y: "zzzzzz" },
    });
    expect(far.errors.find((item) => item.code === "CK2001")?.hint ?? "").not.toContain("did you mean");
    const near = validate({
      ...base,
      data: [
        { month: "Jan", cost: 1, coat: 2, coast: 3 },
        { month: "Feb", cost: 2, coat: 3, coast: 4 },
      ],
      encoding: { x: "month", y: "cot" },
    });
    const hint = near.errors.find((item) => item.code === "CK2001")?.hint ?? "";
    const quoted = [...hint.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    expect(quoted.length).toBeGreaterThan(0);
    expect(quoted.length).toBeLessThanOrEqual(3);
    expect(quoted).not.toContain("coast");
  });

  it("CK3002 repair adds a missing y2 axis and leaves an explicit false", () => {
    const spec = {
      version: "1",
      type: "combo",
      data: [
        { week: "W1", orders: 30, rate: 0.4 },
        { week: "W2", orders: 36, rate: 0.55 },
      ],
      encoding: {
        x: "week",
        y: [
          { field: "orders", mark: "bar" },
          { field: "rate", mark: "line", axis: "y2" },
        ],
      },
      a11y: { alt: "Orders and the rate both rose." },
    };
    const missing = validate(spec);
    expect(missing.errors.find((item) => item.code === "CK3002")?.fix).toEqual([
      { op: "add", path: "/axes", value: { y2: true } },
    ]);
    const repaired = repair(spec);
    expect(repaired.ok).toBe(true);
    expect((repaired.spec as { axes: { y2: boolean } }).axes.y2).toBe(true);
    expect((spec as { axes?: unknown }).axes).toBeUndefined();

    const titled = { ...spec, axes: { y: { title: "Orders" } } };
    expect(validate(titled).errors.find((item) => item.code === "CK3002")?.fix).toEqual([
      { op: "add", path: "/axes/y2", value: true },
    ]);
    const kept = repair(titled);
    expect(kept.ok).toBe(true);
    expect((kept.spec as { axes: { y: { title: string }; y2: boolean } }).axes).toEqual({
      y: { title: "Orders" },
      y2: true,
    });

    const off = { ...spec, axes: { y2: false } };
    expect(validate(off).errors.find((item) => item.code === "CK3002")?.fix).toBeUndefined();
    const refused = repair(off);
    expect(refused.ok).toBe(false);
    expect((refused.spec as { axes: { y2: boolean } }).axes.y2).toBe(false);
  });

  it("CK2005 rejects uneven columns", () => {
    const result = validate({
      ...base,
      data: { columns: { month: ["Jan", "Feb"], revenue: [1] } },
    });
    expect(result.errors.some((error) => error.code === "CK2005")).toBe(true);
  });

  it("CK1009 moves facet, encoding.facet, and small-multiples onto layout.facet", () => {
    const top = validate({ ...base, facet: "month" });
    const facet = top.errors.find((item) => item.code === "CK1009" && item.path === "/facet");
    expect(facet?.hint).toContain("layout.facet");
    expect(facet?.fix).toEqual([
      { op: "add", path: "/layout", value: { facet: { field: "month" } } },
      { op: "remove", path: "/facet" },
    ]);
    expect(top.errors.some((item) => item.code === "CK1002" && item.path === "/facet")).toBe(false);
    const fixed = repair({ ...base, facet: "month" });
    expect(fixed.ok).toBe(true);
    expect((fixed.spec as { layout: unknown }).layout).toEqual({ facet: { field: "month" } });

    const encoded = validate({ ...base, encoding: { ...base.encoding, facet: { field: "month" } } });
    expect(encoded.errors.find((item) => item.path === "/encoding/facet")?.fix).toEqual([
      { op: "add", path: "/layout", value: { facet: { field: "month" } } },
      { op: "remove", path: "/encoding/facet" },
    ]);
    expect(encoded.errors.some((item) => item.code === "CK1002")).toBe(false);

    const small = validate({ ...base, type: "small-multiples", facet: { field: "month", columns: 2 } });
    expect(small.errors[0]?.code).toBe("CK1009");
    expect(small.errors[0]?.hint).toContain("small-multiples");
    const moved = repair({ ...base, type: "small-multiples", facet: { field: "month", columns: 2 } });
    expect((moved.spec as { layout: { facet: { field: string } } }).layout.facet).toEqual({ field: "month", columns: 2 });
  });

  it("CK1009 moves sync onto interaction.sync", () => {
    const result = validate({ ...base, sync: "cpu" });
    expect(result.errors.find((item) => item.path === "/sync")?.fix).toEqual([
      { op: "add", path: "/interaction", value: { sync: "cpu" } },
      { op: "remove", path: "/sync" },
    ]);
    expect(result.errors.some((item) => item.code === "CK1002" && item.path === "/sync")).toBe(false);
    const fixed = repair({ ...base, sync: { group: "cpu" }, interaction: { hover: true } });
    expect(fixed.ok).toBe(true);
    expect((fixed.spec as { interaction: unknown }).interaction).toEqual({ hover: true, sync: "cpu" });
  });

  it("CK1009 moves an overview brush onto interaction.navigator and leaves a range brush", () => {
    const top = validate({ ...base, brush: true });
    expect(top.errors.find((item) => item.path === "/brush")?.hint).toContain("interaction.navigator");
    expect(top.errors.find((item) => item.path === "/brush")?.fix).toEqual([
      { op: "add", path: "/interaction", value: { navigator: true } },
      { op: "remove", path: "/brush" },
    ]);
    const overview = repair({ ...base, interaction: { brush: { height: 48, overview: true } } });
    expect(overview.ok).toBe(true);
    expect((overview.spec as { interaction: unknown }).interaction).toEqual({ navigator: { height: 48 } });
    expect(validate({ ...base, interaction: { brush: "x" } }).ok).toBe(true);
    expect(validate({ ...base, brush: "overview" }).errors[0]?.fix).toEqual([
      { op: "add", path: "/interaction", value: { navigator: true } },
      { op: "remove", path: "/brush" },
    ]);
  });

  it("CK1009 moves a child chart onto interaction.drilldown", () => {
    const child = {
      type: "bar",
      data: base.data,
      encoding: { x: "month", y: "revenue" },
      a11y: { alt: "February is higher." },
    };
    const clicked = validate({ ...base, click: { North: child } });
    const drill = clicked.errors.find((item) => item.path === "/click");
    expect(drill?.hint).not.toContain("pointclick");
    expect(drill?.hint).toContain("interaction.drilldown");
    expect(drill?.fix).toEqual([
      { op: "add", path: "/interaction", value: { drilldown: { children: { North: child } } } },
      { op: "remove", path: "/click" },
    ]);
    const fixed = repair({ ...base, onClick: { children: { North: child }, key: "month" } });
    expect(fixed.ok).toBe(true);
    expect((fixed.spec as { interaction: { drilldown: unknown } }).interaction.drilldown).toEqual({
      children: { North: child },
      key: "month",
    });
    expect(fixed.spec).not.toHaveProperty("onClick");

    const interactions = validate({ ...base, interactions: { click: { West: child } } });
    expect(interactions.errors.find((item) => item.path === "/interactions")?.fix?.[0]).toMatchObject({
      op: "add",
      value: { drilldown: { children: { West: child } } },
    });
  });

  it("CK1009 moves charts and a vertical direction onto layout.concat", () => {
    const view = { type: "bar", data: base.data, encoding: base.encoding, a11y: base.a11y };
    const charts = validate({ ...base, charts: [view] });
    expect(charts.errors.find((item) => item.path === "/charts")?.hint).toContain("layout.concat.views");
    expect(charts.errors.some((item) => item.code === "CK1002" && item.path === "/charts")).toBe(false);
    const stacked = repair({ ...base, views: [view], layout: { direction: "horizontal" } });
    expect(stacked.ok).toBe(true);
    expect((stacked.spec as { layout: unknown }).layout).toEqual({
      concat: { views: [view], direction: "horizontal" },
    });
    const side = repair({ ...base, layout: { charts: [view], direction: "vertical" } });
    expect((side.spec as { layout: { concat: { direction: string } } }).layout.concat.direction).toBe("vertical");
    expect((side.spec as { layout: { charts?: unknown } }).layout).not.toHaveProperty("charts");
  });

  it("CK1009 moves a responsive legend onto layout.breakpoints", () => {
    const responsive = repair({
      ...base,
      legend: { position: "bottom", responsive: "@media (max-width: 480px)" },
    });
    expect(responsive.ok).toBe(true);
    expect((responsive.spec as { legend: unknown }).legend).toEqual({ position: "bottom" });
    expect((responsive.spec as { layout: { breakpoints: unknown } }).layout.breakpoints).toEqual([{ maxWidth: 480, legend: false }]);

    const media = validate({ ...base, legend: { position: "@media (max-width: 600px)" } });
    const hint = media.errors.find((item) => item.code === "CK1009");
    expect(hint?.hint).toContain("layout.breakpoints");
    expect(hint?.fix).toEqual([
      { op: "add", path: "/layout", value: { breakpoints: [{ maxWidth: 600, legend: false }] } },
      { op: "remove", path: "/legend/position" },
    ]);
    expect(media.errors.some((item) => item.code === "CK1007")).toBe(false);
  });

  it("CK1005 lists phase-4 and map types, and validate leaves map fields to geo", () => {
    const unknown = validate({ ...base, type: "waffle" });
    const hint = unknown.errors.find((item) => item.code === "CK1005")?.hint ?? "";
    for (const type of ["gantt", "timeline", "quadrant", "venn", "journey", "choropleth", "map-points"]) {
      expect(hint).toContain(type);
    }

    const choropleth = validate({
      version: "1",
      type: "choropleth",
      atlas: "us",
      data: [{ state: "CA", share: 1 }],
      encoding: { region: "state", latitude: "lat" },
      mark: { atlas: "us" },
      a11y: { alt: "California is marked." },
    });
    expect(choropleth.errors.filter((item) => item.code === "CK1005" || item.code === "CK1002")).toEqual([]);
    expect(choropleth.warnings.some((item) => item.code === "CK3057")).toBe(true);
    expect(choropleth.ok).toBe(true);

    const points = validate({
      version: "1",
      type: "map-points",
      data: [{ name: "Paris", lat: 48.9, lon: 2.3 }],
      encoding: { latitude: "lat", longitude: "lon", label: "name" },
      a11y: { alt: "Paris is marked." },
    });
    expect(points.errors.filter((item) => item.code === "CK1005" || item.code === "CK1002")).toEqual([]);
    expect(points.ok).toBe(true);
  });

  it("CK1005 maps bubble and choropleth aliases onto the map types", () => {
    for (const alias of ["bubble-map", "bubble map", "map"]) {
      const result = validate({ ...base, type: alias });
      expect(result.errors.find((item) => item.code === "CK1005")?.fix, alias).toEqual([{ op: "replace", path: "/type", value: "map-points" }]);
      expect(result.errors.find((item) => item.code === "CK1005")?.hint).toContain("map-points");
    }
    for (const alias of ["choropleth-map", "heat map of countries"]) {
      const result = validate({ ...base, type: alias });
      expect(result.errors.find((item) => item.code === "CK1005")?.fix, alias).toEqual([{ op: "replace", path: "/type", value: "choropleth" }]);
      expect(result.errors.find((item) => item.code === "CK1005")?.hint).toContain("choropleth");
    }
  });

  it("CK1009 moves loose feature keys onto interaction, layout, and mark", () => {
    const navigator = repair({ ...base, navigator: { height: 40 } });
    expect(navigator.ok).toBe(true);
    expect(navigator.spec).not.toHaveProperty("navigator");
    expect((navigator.spec as { interaction: unknown }).interaction).toEqual({ navigator: { height: 40 } });

    const drillChild = { type: "bar", data: base.data, encoding: base.encoding, a11y: base.a11y };
    const drilled = repair({ ...base, drilldown: { children: { Jan: drillChild } } });
    expect(drilled.ok).toBe(true);
    expect((drilled.spec as { interaction: { drilldown: { children: unknown } } }).interaction.drilldown.children).toEqual({ Jan: drillChild });

    const breakpoints = repair({ ...base, breakpoints: [{ maxWidth: 480, legend: false }] });
    expect(breakpoints.ok).toBe(true);
    expect((breakpoints.spec as { layout: unknown }).layout).toEqual({ breakpoints: [{ maxWidth: 480, legend: false }] });

    const rtl = repair({ ...base, rtl: true });
    expect(rtl.ok).toBe(true);
    expect((rtl.spec as { layout: unknown }).layout).toEqual({ direction: "rtl" });

    const direction = repair({ ...base, direction: "rtl" });
    expect((direction.spec as { layout: { direction: string } }).layout.direction).toBe("rtl");

    const sampled = repair({ ...base, sampling: "lttb" });
    expect(sampled.ok).toBe(true);
    expect((sampled.spec as { mark: unknown }).mark).toEqual({ sampling: "lttb" });

    const columnar = validate({
      ...base,
      data: { columns: { month: ["Jan", "Feb"], revenue: [10, 12] }, sampling: "lttb" },
    });
    expect(columnar.errors.some((item) => item.path === "/data/sampling")).toBe(false);
    expect(columnar.ok).toBe(true);
  });

  it("CK1009 unwraps an options object onto the parents", () => {
    const fixed = repair({
      ...base,
      options: {
        navigator: true,
        sync: "host-a",
        rtl: true,
        sampling: "minmax",
        render: "auto",
      },
    });
    expect(fixed.ok).toBe(true);
    expect(fixed.spec).not.toHaveProperty("options");
    expect((fixed.spec as { interaction: unknown }).interaction).toEqual({ navigator: true, sync: "host-a" });
    expect((fixed.spec as { layout: unknown }).layout).toEqual({ direction: "rtl" });
    expect((fixed.spec as { mark: unknown; render: unknown }).mark).toEqual({ sampling: "minmax" });
    expect((fixed.spec as { render: unknown }).render).toBe("auto");
  });

  it("CK1009 moves layout.facet.type onto the spec type", () => {
    const fixed = repair({ ...base, type: "line", layout: { facet: { field: "month", type: "bar", columns: 2 } } });
    expect(fixed.ok).toBe(true);
    expect((fixed.spec as { type: string }).type).toBe("bar");
    expect((fixed.spec as { layout: { facet: unknown } }).layout.facet).toEqual({ field: "month", columns: 2 });
  });

  it("CK1009 turns type concat and dashboard into layout.concat", () => {
    const bar = { type: "bar", data: base.data, encoding: base.encoding, a11y: base.a11y };
    const donut = { data: [{ x: "A", y: 1 }], encoding: { x: "x", y: "y" }, a11y: base.a11y, mark: "donut" };
    const fixed = repair({ ...base, type: "dashboard", views: [bar, donut], direction: "vertical" });
    expect(fixed.ok).toBe(true);
    expect(fixed.spec).not.toHaveProperty("views");
    const layout = (fixed.spec as { layout: { concat: { views: { type: string }[]; direction: string } } }).layout;
    expect(layout.concat.direction).toBe("vertical");
    expect(layout.concat.views.map((view) => view.type)).toEqual(["bar", "donut"]);
  });

  it("CK1009 keys drilldown children by the clicked x value", () => {
    const child = { type: "bar", data: [{ store: "N1", sales: 50 }], encoding: { x: "store", y: "sales" }, a11y: base.a11y };
    const regions = {
      ...base,
      data: [
        { region: "North", sales: 90 },
        { region: "South", sales: 60 },
      ],
      encoding: { x: "region", y: "sales" },
    };
    const placeholder = validate({ ...regions, interaction: { drilldown: { children: { chart: child } } } });
    const hint = placeholder.errors.find((item) => item.path === "/interaction/drilldown/children");
    expect(hint?.hint).toContain("clicked x value");
    expect(hint?.fix).toEqual([{ op: "replace", path: "/interaction/drilldown/children", value: { North: child, South: child } }]);
    const keyed = repair({ ...regions, interaction: { drilldown: { children: { chart: child } } } });
    expect((keyed.spec as { interaction: { drilldown: { children: Record<string, { type: string }> } } }).interaction.drilldown.children.North.type).toBe("bar");

    const listed = repair({ ...regions, interaction: { drilldown: { children: [child, { ...child, type: "line" }] } } });
    const children = (listed.spec as { interaction: { drilldown: { children: Record<string, { type: string }> } } }).interaction.drilldown.children;
    expect(children.North.type).toBe("bar");
    expect(children.South.type).toBe("line");
  });

  it("omits the outer type when layout.concat.views is set", () => {
    const view = { type: "bar", data: base.data, encoding: base.encoding, a11y: base.a11y };
    const spec = { version: "1", layout: { concat: { views: [view], direction: "vertical" } }, a11y: base.a11y };
    const result = validate(spec);
    expect(result.errors.find((item) => item.code === "CK1003" && item.message.includes("type"))).toBeUndefined();
    expect(result.ok).toBe(true);
  });

  it("validates a concat donut view and a drilldown child as their own specs", () => {
    const donut = {
      type: "donut",
      data: [
        { plan: "Free", share: 70 },
        { plan: "Pro", share: 30 },
      ],
      encoding: { label: "plan", value: "share" },
      a11y: base.a11y,
    };
    const hosted = validate({
      version: "1",
      type: "bar",
      data: base.data,
      encoding: base.encoding,
      a11y: base.a11y,
      layout: { concat: { views: [donut] } },
    });
    const moved = hosted.errors.find((item) => item.code === "CK1009" && item.path === "/layout/concat/views/0/encoding");
    expect(moved?.hint).toContain("encoding.x");
    expect(moved?.fix).toEqual([
      { op: "move", from: "/layout/concat/views/0/encoding/label", path: "/layout/concat/views/0/encoding/x" },
      { op: "move", from: "/layout/concat/views/0/encoding/value", path: "/layout/concat/views/0/encoding/y" },
    ]);
    const repaired = repair({
      version: "1",
      type: "bar",
      data: base.data,
      encoding: base.encoding,
      a11y: base.a11y,
      layout: { concat: { views: [donut] } },
    });
    expect(repaired.ok).toBe(true);
    const view = (repaired.spec as { layout: { concat: { views: { encoding: Record<string, string> }[] } } }).layout.concat.views[0];
    expect(view?.encoding).toEqual({ x: "plan", y: "share" });

    const child = validate({
      ...base,
      interaction: { drilldown: { children: { Feb: donut } } },
    });
    expect(child.errors.find((item) => item.path === "/interaction/drilldown/children/Feb/encoding")?.code).toBe("CK1009");
  });

  it("CK1002 moves axes min and max onto the encoding scale domain", () => {
    const both = validate({ ...base, axes: { y: { min: 0, max: 20 }, x: { min: 1 } } });
    const y = both.errors.find((item) => item.path === "/axes/y/min");
    expect(y?.code).toBe("CK1002");
    expect(y?.hint).toContain("encoding.y.scale.domain");
    expect(y?.fix).toEqual([
      { op: "remove", path: "/axes/y/min" },
      { op: "remove", path: "/axes/y/max" },
      { op: "replace", path: "/encoding/y", value: { field: "revenue", scale: { domain: [0, 20] } } },
    ]);
    const x = both.errors.find((item) => item.path === "/axes/x/min");
    expect(x?.hint).toContain("encoding.x.scale.domain");
    const fixed = repair({ ...base, axes: { y: { min: 0, max: 20, title: "Revenue" } } });
    expect(fixed.ok).toBe(true);
    expect((fixed.spec as { encoding: { y: { scale: { domain: number[] } } } }).encoding.y.scale.domain).toEqual([0, 20]);
    expect((fixed.spec as { axes: { y: { title?: string; min?: number } } }).axes.y).toEqual({ title: "Revenue" });
  });

  it("allows encoding.tooltip on map types", () => {
    const points = validate({
      version: "1",
      type: "map-points",
      data: [{ city: "Chicago", lat: 41.88, lon: -87.63, pop: 2700000 }],
      encoding: { latitude: "lat", longitude: "lon", tooltip: "pop" },
      a11y: { alt: "Chicago is marked." },
    });
    expect(points.errors.filter((item) => item.code === "CK1002")).toEqual([]);
    expect(points.ok).toBe(true);
  });
});
