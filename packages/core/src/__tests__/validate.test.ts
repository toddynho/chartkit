import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import schema from "../../schema/chartkit.schema.json";
import { suggestAlt, validate } from "../validate";

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
];

describe("example specs", () => {
  const names = files(examplesDir);
  it("includes an example for every chart type", () => {
    const types = names.map((name) => (load(examplesDir, name) as { type: string }).type);
    expect([...new Set(types)].sort()).toEqual([...CHART_TYPES].sort());
  });

  for (const name of names) {
    it(`${name} passes Ajv and validate()`, () => {
      const spec = load(examplesDir, name);
      const ajvOk = ajvValidate(spec);
      expect(ajvValidate.errors ?? [], JSON.stringify(ajvValidate.errors)).toEqual([]);
      expect(ajvOk).toBe(true);
      const result = validate(spec);
      expect(result.errors, JSON.stringify(result.errors, null, 2)).toEqual([]);
      expect(result.warnings, JSON.stringify(result.warnings, null, 2)).toEqual([]);
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

  it("CK1005 maps pie to donut and offers a patch", () => {
    const result = validate(load(invalidDir, "02-unknown-type.json"));
    const error = result.errors[0];
    expect(error.code).toBe("CK1005");
    expect(error.path).toBe("/type");
    expect(error.hint).toContain("donut");
    expect(error.fix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ op: "replace", path: "/type", value: "donut" }),
      ]),
    );
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

  it("CK1005 maps area onto line plus mark.area", () => {
    const result = validate({ ...base, type: "area" });
    const error = result.errors.find((item) => item.code === "CK1005");
    expect(error?.hint).toContain("line");
    expect(error?.fix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "/type", value: "line" }),
        expect.objectContaining({ path: "/mark", value: { area: true } }),
      ]),
    );
  });

  it("CK2004 rejects empty data", () => {
    const result = validate({ ...base, data: [] });
    expect(result.errors.some((error) => error.code === "CK2004" && error.path === "/data")).toBe(true);
  });

  it("CK2005 rejects uneven columns", () => {
    const result = validate({
      ...base,
      data: { columns: { month: ["Jan", "Feb"], revenue: [1] } },
    });
    expect(result.errors.some((error) => error.code === "CK2005")).toBe(true);
  });
});
