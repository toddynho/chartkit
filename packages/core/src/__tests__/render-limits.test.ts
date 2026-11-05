import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { formatValue } from "../format";
import { validate } from "../validate";

const alt = "Revenue rose from January to March.";

function line(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    version: "1",
    type: "line",
    data: [
      { month: "Jan", revenue: 10 },
      { month: "Feb", revenue: 14 },
      { month: "Mar", revenue: 9 },
    ],
    encoding: { x: "month", y: "revenue" },
    a11y: { alt },
    ...extra,
  };
}

describe("render limits", () => {
  it("clamps fraction digits and still draws", () => {
    const spec = line({ encoding: { x: "month", y: { field: "revenue", format: { decimals: 1_000_000 } } } });
    expect(formatValue(12.5, { decimals: 1_000_000 }, "en-US")).toBe("12.50000000000000000000");
    const svg = render(spec);
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).toContain("data-ck-type=\"line\"");
    expect(validate(spec).warnings.some((item) => item.code === "CK3125")).toBe(true);
  });

  it("rejects a currency that is not an ISO code and paints USD", () => {
    const spec = line({ encoding: { x: "month", y: { field: "revenue", format: { style: "currency", currency: "Northstar" } } } });
    expect(formatValue(12, { style: "currency", currency: "Northstar" }, "en-US")).toContain("12");
    expect(render(spec)).not.toContain("ck-chart-error");
    expect(validate(spec).warnings.some((item) => item.code === "CK3126")).toBe(true);
  });

  it("falls back when the locale tag is not real", () => {
    const spec = line({ locale: "Northstar launch window" });
    expect(render(spec)).not.toContain("ck-chart-error");
    expect(validate(spec).warnings.some((item) => item.code === "CK3127" && item.fix?.[0]?.op === "remove")).toBe(true);
  });

  it("keeps the default frame when size is zero", () => {
    const spec = line({ size: { width: 0, height: 0 } });
    const svg = render(spec);
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).not.toMatch(/viewBox="0 0 0 /);
    const warned = validate(spec).warnings.filter((item) => item.code === "CK3128");
    expect(warned.map((item) => item.path).sort()).toEqual(["/size/height", "/size/width"]);
  });

  it("shrinks padding that would erase the plot", () => {
    const spec = line({ size: { width: 640, height: 240, padding: 1_000_000 } });
    const svg = render(spec);
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).not.toContain('x="1000000"');
    const warned = validate(spec).warnings.find((item) => item.code === "CK3130");
    expect(warned?.path).toBe("/size/padding");
    expect(warned?.fix?.[0]?.op).toBe("remove");
  });

  it("draws a marker when pointSize is zero", () => {
    const spec = line({ type: "scatter", encoding: { x: "revenue", y: "revenue" }, mark: { pointSize: 0 } });
    const svg = render(spec);
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).toContain('data-ck-mark="point"');
    expect(validate(spec).warnings.some((item) => item.code === "CK3131" && item.path === "/mark/pointSize")).toBe(true);
  });

  it("warns when a theme color is under 4.5:1 and still draws it", () => {
    const spec = line({ theme: { tokens: { background: "#111111" } } });
    const svg = render(spec);
    expect(svg).toContain("#111111");
    const warned = validate(spec).warnings.find((item) => item.code === "CK4005");
    expect(warned?.path).toBe("/theme/tokens/background");
    expect(warned?.fix).toBeUndefined();
  });

  it("draws a line when the y field name is not a column", () => {
    const spec = line({ encoding: { x: "month", y: "not-a-column" } });
    const svg = render(spec);
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).toContain("data-ck-key=\"l:");
    expect(validate(spec).errors.some((item) => item.code === "CK2001")).toBe(true);
  });
});
