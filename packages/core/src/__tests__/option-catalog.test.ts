import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MARK_APPLIES } from "../marks";
import {
  OPTION_GROUPS,
  buildOptionCatalog,
  getPath,
  optionCatalog,
  optionsForType,
  readOption,
  resetOption,
  writeOption,
  type OptionField,
} from "../option-catalog";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const schema = JSON.parse(readFileSync(join(root, "schema/chartkit.schema.json"), "utf8"));

function field(path: string): OptionField {
  const found = optionCatalog.find((item) => item.path === path);
  if (!found) throw new Error(`missing option ${path}`);
  return found;
}

const line = {
  version: "1",
  type: "line",
  data: [
    { month: "Jan", revenue: 1 },
    { month: "Feb", revenue: 2 },
  ],
  encoding: { x: "month", y: "revenue" },
  a11y: { alt: "Revenue rose from January to February." },
};

describe("option catalog", () => {
  it("matches a fresh walk of the schema", () => {
    expect(buildOptionCatalog(schema)).toEqual(optionCatalog);
  });

  it("keeps the builder out of the chart and validator entries", () => {
    for (const file of ["src/index.ts", "src/all.ts", "src/validate.ts", "src/charts/line.ts", "src/extra.ts"]) {
      const text = readFileSync(join(root, file), "utf8");
      expect(text.includes("option-catalog"), file).toBe(false);
    }
  });

  it("describes mark.curve from the schema and limits it to line-like charts", () => {
    const curve = field("mark.curve");
    expect(curve.control).toBe("enum");
    expect(curve.enumValues).toContain("linear");
    expect(curve.defaultValue).toBe("monotone");
    expect(curve.description.length).toBeGreaterThan(20);
    expect(curve.appliesTo).toContain("line");
    expect(curve.appliesTo).not.toContain("bar");
    expect(curve.docs).toBe("/docs/options#mark.curve");
    expect(optionsForType("line").some((item) => item.path === "mark.bins")).toBe(false);
    expect(optionsForType("bar").some((item) => item.path === "mark.orientation")).toBe(true);
    expect(optionsForType("line").some((item) => item.path === "mark.orientation")).toBe(false);
  });

  it("covers every mark key the validator knows", () => {
    const paths = new Set(optionCatalog.map((item) => item.path));
    for (const key of Object.keys(MARK_APPLIES)) expect(paths.has(`mark.${key}`), key).toBe(true);
  });

  it("does not write a default until the value differs", () => {
    const curve = field("mark.curve");
    const shown = readOption(line, curve);
    expect(shown.set).toBe(false);
    expect(shown.value).toBe("monotone");
    expect(writeOption(line, curve, "monotone")).toEqual(line);
    const linear = writeOption(line, curve, "linear");
    expect(getPath(linear, "mark.curve")).toBe("linear");
    expect(readOption(linear, curve).set).toBe(true);
    expect(resetOption(linear, curve).mark).toBeUndefined();
  });

  it("toggles legend without copying unrelated defaults", () => {
    const legend = field("legend");
    expect(readOption(line, legend)).toMatchObject({ value: true, set: false });
    const hidden = writeOption(line, legend, false);
    expect(hidden.legend).toBe(false);
    expect(writeOption(hidden, legend, true).legend).toBeUndefined();
    const titled = writeOption(line, field("axes.x.title"), "Month");
    expect(titled.axes).toEqual({ x: { title: "Month" } });
    expect(titled.mark).toBeUndefined();
  });

  it("promotes a string channel when a nested field is set", () => {
    const typed = writeOption(line, field("encoding.x.type"), "temporal");
    expect(typed.encoding).toMatchObject({ x: { field: "month", type: "temporal" }, y: "revenue" });
    const renamed = writeOption(typed, field("encoding.x"), "day");
    expect(getPath(renamed, "encoding.x")).toEqual({ field: "day", type: "temporal" });
  });

  it("keeps a theme object when the preset changes", () => {
    const themed = writeOption({ ...line, theme: "midnight" }, field("theme.tokens.accent"), "#336699");
    expect(themed.theme).toEqual({ preset: "midnight", tokens: { accent: "#336699" } });
  });

  it("keeps position scales, theme roles, and canvas render on the charts that paint them", () => {
    expect(field("encoding.x.type").appliesTo).toContain("scatter");
    expect(field("encoding.x.type").appliesTo).toContain("candlestick");
    expect(field("encoding.x.type").appliesTo).not.toContain("bar");
    expect(field("encoding.x.title").appliesTo).toContain("histogram");
    expect(optionsForType("donut").some((item) => item.path === "encoding.x.title")).toBe(false);
    expect(optionsForType("donut").some((item) => item.path === "encoding.y.format")).toBe(true);
    expect(optionsForType("donut").some((item) => item.path === "encoding.y.scale.type")).toBe(false);
    expect(optionsForType("funnel").some((item) => item.path === "mark.labels")).toBe(true);
    expect(optionsForType("bar").some((item) => item.path === "encoding.y.format")).toBe(true);
    expect(field("encoding.color.scale.type").appliesTo).toEqual(["scatter", "heatmap", "treemap", "choropleth", "map-points"]);
    expect(optionsForType("scatter").some((item) => item.path === "encoding.color.title")).toBe(true);
    expect(optionsForType("scatter").some((item) => item.path === "theme.tokens.axis")).toBe(true);
    expect(optionCatalog.some((item) => item.path === "encoding.series.type" || item.path.startsWith("encoding.series.format") || item.path.startsWith("encoding.series.scale"))).toBe(false);
    expect(field("render").appliesTo).toEqual(["line", "stacked-area", "scatter", "bar", "heatmap", "candlestick"]);
    expect(optionsForType("treemap").some((item) => item.path === "render")).toBe(false);
    expect(field("theme.tokens.fontSize").appliesTo).toBeUndefined();
    expect(optionsForType("kpi").some((item) => item.path === "theme.tokens.background")).toBe(false);
    expect(optionsForType("kpi").some((item) => item.path === "theme.tokens.surface")).toBe(true);
    expect(optionsForType("line").some((item) => item.path === "theme.tokens.text")).toBe(true);
    expect(optionsForType("sparkline").some((item) => item.path === "theme.tokens.grid")).toBe(false);
    expect(optionsForType("candlestick").some((item) => item.path === "theme.tokens.series")).toBe(false);
    expect(optionsForType("candlestick").some((item) => item.path === "theme.tokens.positive")).toBe(true);
    for (const item of optionCatalog) {
      if (!item.path.startsWith("mark.")) continue;
      const key = item.path.split(".")[1] ?? "";
      expect(MARK_APPLIES[key], item.path).toBeTruthy();
      expect(item.appliesTo, item.path).toEqual([...(MARK_APPLIES[key] ?? [])]);
    }
  });

  it("covers strip and keeps an essential tier in each section", () => {
    const strip = optionsForType("strip");
    expect(strip.some((item) => item.path === "mark.summary")).toBe(true);
    expect(strip.some((item) => item.path === "mark.band")).toBe(true);
    expect(strip.some((item) => item.path === "encoding.label")).toBe(true);
    expect(strip.some((item) => item.path === "axes.x.title")).toBe(true);
    expect(strip.some((item) => item.path === "mark.curve")).toBe(false);
    for (const group of OPTION_GROUPS) {
      const essentials = optionCatalog.filter((item) => item.group === group && item.essential);
      if (group === "Annotations") {
        expect(essentials.map((item) => item.path)).toEqual(["annotations"]);
        continue;
      }
      expect(essentials.length, group).toBeGreaterThanOrEqual(3);
      expect(essentials.length, group).toBeLessThanOrEqual(8);
    }
  });

  it("treats an array channel as JSON", () => {
    const spec = { ...line, encoding: { x: "month", y: ["revenue", "cost"] } };
    expect(readOption(spec, field("encoding.y")).complex).toBe(true);
  });
});
