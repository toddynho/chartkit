import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { line } from "../charts/line";
import { render } from "../extra";
import { createRenderer } from "../render";
import { repair, validate } from "../validate";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function load(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, "examples", name), "utf8")) as Record<string, unknown>;
}

const alt = "Three desks, with music the longest.";
const rows = [
  { desk: "Music", minutes: 40 },
  { desk: "Talk", minutes: 22 },
  { desk: "News", minutes: 12 },
];

function spec(type: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    version: "1",
    type,
    data: rows,
    encoding: { x: "desk", y: "minutes" },
    a11y: { alt },
    ...extra,
  };
}

describe("polar charts", () => {
  it("draws a radial bar and a rose from the examples", () => {
    for (const name of ["34-radial-bar.json", "35-rose.json"]) {
      const chart = load(name);
      const svg = render(chart);
      expect(svg).toContain(`data-ck-type="${chart.type}"`);
      expect(svg).toContain('data-ck-coordinate="polar"');
      expect(svg).not.toContain("ck-chart-error");
      expect(svg).toContain("<path");
    }
  });

  it("groups two series and stacks them on a different path", () => {
    const data = rows.map((row) => ({ ...row, saturday: row.minutes / 2 }));
    const grouped = render({
      version: "1",
      type: "radial-bar",
      data,
      encoding: { x: "desk", y: ["minutes", "saturday"] },
      a11y: { alt },
    });
    const stacked = render({
      version: "1",
      type: "radial-bar",
      data,
      encoding: { x: "desk", y: ["minutes", "saturday"] },
      mark: { stack: "stack" },
      a11y: { alt },
    });
    expect(grouped.match(/data-ck-mark="radial-bar"/g)?.length).toBe(6);
    expect(stacked.match(/data-ck-mark="radial-bar"/g)?.length).toBe(6);
    expect(stacked).not.toBe(grouped);
  });

  it("keeps the line renderer from drawing polar charts", () => {
    const svg = createRenderer([line])(load("34-radial-bar.json"));
    expect(svg).toContain("CK1010");
    expect(svg).toContain("@chartkitdev/core/charts/radial-bar");
    expect(svg).toContain("@chartkitdev/core/extra");
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../charts/line.ts"), "utf8");
    expect(source).not.toContain("polar");
  });

  it("repairs polar aliases", () => {
    for (const alias of ["radialBar", "polar-bar", "polar"]) {
      expect(repair(spec(alias)).spec).toMatchObject({ type: "radial-bar" });
    }
    for (const alias of ["polarArea", "polar-area", "nightingale", "rose-chart"]) {
      expect(repair(spec(alias)).spec).toMatchObject({ type: "rose" });
    }
  });

  it("repairs a negative radius, a wide hole, a wide gap, and a radius domain", () => {
    const negative = repair(spec("rose", { data: [...rows.slice(0, 2), { desk: "News", minutes: -4 }] }));
    expect(negative.applied).toContainEqual({ op: "replace", path: "/data/2/minutes", value: 0 });
    expect(negative.errors.some((item) => item.code === "CK3073")).toBe(false);

    const hole = repair(spec("radial-bar", { mark: { innerRadius: 0.92 } }));
    expect(hole.spec).toMatchObject({ mark: { innerRadius: 0.85 } });
    expect(hole.errors.some((item) => item.code === "CK3075")).toBe(false);

    const gap = repair(spec("rose", { mark: { padAngle: 9 } }));
    expect(gap.spec).toMatchObject({ mark: { padAngle: 8 } });
    expect(gap.errors.some((item) => item.code === "CK3076")).toBe(false);

    const domain = repair(spec("radial-bar", { encoding: { x: "desk", y: { field: "minutes", scale: { domain: [4, 40] } } } }));
    expect(domain.applied).toContainEqual({ op: "replace", path: "/encoding/y/scale/domain/0", value: 0 });
    expect(validate(domain.spec).errors.some((item) => item.code === "CK3080")).toBe(false);
  });

  it("repairs layout.coordinate onto the polar types", () => {
    const bar = repair({ ...spec("bar"), layout: { coordinate: "polar" } });
    expect(bar.spec).toMatchObject({ type: "radial-bar" });
    const pie = repair({
      version: "1",
      type: "pie",
      data: rows,
      encoding: { x: "desk", y: "minutes" },
      a11y: { alt },
      layout: { coordinate: "polar" },
    });
    expect(pie.spec).toMatchObject({ type: "rose" });
    const lineSpec = repair({
      version: "1",
      type: "line",
      data: rows,
      encoding: { x: "desk", y: "minutes" },
      a11y: { alt },
      layout: { coordinate: "polar" },
    });
    expect((lineSpec.spec as { layout?: { coordinate?: string } }).layout?.coordinate).toBeUndefined();
    expect(lineSpec.spec).toMatchObject({ type: "line" });

    const cartesian = repair(spec("rose", { layout: { coordinate: "cartesian" } }));
    expect(cartesian.spec).toMatchObject({ layout: { coordinate: "polar" } });
    expect(cartesian.errors.some((item) => item.code === "CK3078")).toBe(false);
  });

  it("warns when a polar chart has too few or too many categories", () => {
    const few = validate(spec("rose", { data: rows.slice(0, 2) }));
    expect(few.ok).toBe(true);
    expect(few.warnings.some((item) => item.code === "CK3074")).toBe(true);
    const many = validate(
      spec("radial-bar", {
        data: Array.from({ length: 18 }, (_, index) => ({ desk: `Desk ${index + 1}`, minutes: index + 1 })),
      }),
    );
    expect(many.warnings.some((item) => item.code === "CK3079")).toBe(true);
  });
});
