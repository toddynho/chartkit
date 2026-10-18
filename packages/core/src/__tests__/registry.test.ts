import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { bar } from "../charts/bar";
import { line } from "../charts/line";
import { createRenderer } from "../render";

const examples = join(dirname(fileURLToPath(import.meta.url)), "../../examples");
const lineSpec = JSON.parse(readFileSync(join(examples, "01-minimal-line.json"), "utf8")) as unknown;

describe("opt-in renderers", () => {
  const renderLine = createRenderer([line]);

  it("draws a registered line chart", () => {
    const svg = renderLine(lineSpec);
    expect(svg).toContain('data-ck-type="line"');
    expect(svg).toContain("<path");
    expect(svg).not.toContain("ck-chart-error");
  });

  it("names the import to add when the type is not registered", () => {
    const svg = renderLine({ version: "1", type: "donut", a11y: { alt: "Parts of a whole." } });
    expect(svg).toContain("CK1010");
    expect(svg).toContain("no renderer registered for type");
    expect(svg).toContain("donut");
    expect(svg).toContain("@chartkitdev/core/charts/donut");
    expect(svg).toContain("register(donut)");
    expect(svg).toContain("@chartkitdev/core/all");
  });

  it("points gantt at extra or its chart module", () => {
    const svg = renderLine({ version: "1", type: "gantt", a11y: { alt: "A launch plan." } });
    expect(svg).toContain("CK1010");
    expect(svg).toContain("@chartkitdev/core/charts/gantt");
    expect(svg).toContain("@chartkitdev/core/extra");
    expect(svg).not.toContain("@chartkitdev/core/all");
  });

  it("draws bar only after that renderer is included", () => {
    const spec = { version: "1", type: "bar", data: [{ month: "Jan", value: 1 }], encoding: { x: "month", y: "value" }, a11y: { alt: "January." } };
    expect(renderLine(spec)).toContain("CK1010");
    const svg = createRenderer([line, bar])(spec);
    expect(svg).toContain('data-ck-type="bar"');
    expect(svg).toContain("<rect");
  });

  it("keeps the line entry from importing sibling charts or the validator", () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const chart = readFileSync(join(dir, "../charts/line.ts"), "utf8");
    expect(chart).not.toMatch(/from "\.\.\/charts\//);
    expect(chart).not.toContain("validate");
    const registry = readFileSync(join(dir, "../render.ts"), "utf8");
    expect(registry).not.toMatch(/from "\.\/validate"/);
    expect(registry).not.toMatch(/from "\.\/renderers\//);
    expect(registry).not.toMatch(/from ["'][^"']*schema/);
    const cartesian = readFileSync(join(dir, "../renderers/cartesian.ts"), "utf8");
    const drawLines = cartesian.slice(cartesian.indexOf("function drawLines"), cartesian.indexOf("function drawBars"));
    expect(drawLines).not.toContain("bars(");
  });
});
