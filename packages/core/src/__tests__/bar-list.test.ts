import { describe, expect, it } from "vitest";
import { renderBarList } from "../charts/bar-list";
import { render } from "../all";
import { validate } from "../validate";

const spec = {
  version: "1",
  type: "bar-list",
  data: [
    { page: "/pricing", visits: 1840 },
    { page: "/docs", visits: 1420 },
    { page: "/about", visits: 640 },
  ],
  encoding: { x: "page", y: { field: "visits", format: "compact" } },
  size: { width: 360, height: 96 },
  a11y: { alt: "Pricing leads the page list." },
};

describe("bar list", () => {
  it("accepts the type and draws tracks without axes", () => {
    expect(validate(spec).errors).toEqual([]);
    const svg = renderBarList(spec);
    expect(svg).toContain('data-ck-type="bar-list"');
    expect(svg).toContain('data-ck-track="1"');
    expect(svg).toContain(">/pricing<");
    expect(svg).toContain(">1.8K<");
    expect(svg).not.toContain('data-ck-axis=');
    expect(render(spec)).toContain("ck-chart-error");
  });

  it("draws a full-row wash when mark.track is row", () => {
    const row = { ...spec, mark: { track: "row" } };
    expect(validate(row).errors).toEqual([]);
    const svg = renderBarList(row);
    expect(svg).toContain('data-ck-track="row"');
    expect(svg).toContain('height="24"');
    expect(svg).not.toContain('data-ck-bar="1"');
    expect(svg).toContain(">1.8K<");
  });
});
