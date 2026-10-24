import { describe, expect, it } from "vitest";
import { render } from "../all";
import { planStacks, type Series } from "../renderers/cartesian";
import { repair, validate } from "../validate";

const alt = "Two series are drawn for the week.";

function rects(svg: string): { x: number; y: number; height: number }[] {
  const body = svg.replace(/<defs>[\s\S]*?<\/defs>/, "");
  const out: { x: number; y: number; height: number }[] = [];
  for (const match of body.matchAll(/<rect\b([^>]*)\/?>/g)) {
    const attr = (name: string) => new RegExp(`${name}="([^"]*)"`).exec(match[1])?.[1];
    const width = attr("width");
    const height = attr("height");
    if (width === "100%" || height === "100%" || (width === "10" && height === "10")) continue;
    out.push({ x: Number(attr("x")), y: Number(attr("y")), height: Number(height) });
  }
  return out.filter((item) => item.height > 2);
}

function bar(field: string, stack?: string): Series {
  return {
    name: field,
    values: field === "a" ? [10, 20] : field === "b" ? [30, 10] : [5, 5],
    color: "#000",
    axis: "y",
    mark: field === "g" ? "line" : "bar",
    dash: "solid",
    area: false,
    stackId: stack,
  };
}

describe("stack groups", () => {
  it("stacks series that share a name and leaves a one-member name beside them", () => {
    const shared = planStacks([bar("a", "seats"), bar("b", "seats"), bar("g")], "none");
    expect(shared.layers?.on).toEqual([true, true, false]);
    expect(shared.layers?.top[0][0]).toBe(10);
    expect(shared.layers?.top[1][0]).toBe(40);
    expect(shared.barSlot).toEqual([0, 0, 0]);
    expect(shared.barSlots).toBe(1);

    const grouped = planStacks([bar("a", "tickets"), bar("b")], "stack");
    expect(grouped.layers).toBeNull();
    expect(grouped.barSlots).toBe(2);
    expect(grouped.barSlot[0]).not.toBe(grouped.barSlot[1]);

    const legacy = planStacks([bar("a"), bar("b")], "stack");
    expect(legacy.layers?.top[1][0]).toBe(40);
    expect(legacy.barSlots).toBe(1);

    const percent = planStacks([bar("a", "p"), bar("b", "p")], "percent");
    expect(percent.layers?.top[1][0]).toBeCloseTo(100);
  });

  it("draws a shared stack in one column and a singleton stack id in its own column", () => {
    const base = {
      version: "1" as const,
      type: "bar" as const,
      data: [
        { x: "Mon", a: 10, b: 30 },
        { x: "Tue", a: 20, b: 10 },
      ],
      size: { width: 640, height: 240 },
      a11y: { alt },
    };
    const stacked = rects(render({ ...base, encoding: { x: "x", y: [{ field: "a", stack: "seats" }, { field: "b", stack: "seats" }] } }));
    expect(stacked).toHaveLength(4);
    expect(stacked[0].x).toBeCloseTo(stacked[2].x, 0);
    expect(stacked[2].y).toBeLessThan(stacked[0].y);

    const beside = rects(
      render({
        ...base,
        encoding: { x: "x", y: [{ field: "a" }, { field: "b", stack: "tickets" }] },
        mark: { stack: "stack" },
      }),
    );
    expect(beside[0].x).not.toBeCloseTo(beside[2].x, 0);

    const legacy = rects(render({ ...base, encoding: { x: "x", y: ["a", "b"] }, mark: { stack: "stack" } }));
    expect(legacy[0].x).toBeCloseTo(legacy[2].x, 0);
  });

  it("keeps an unstacked combo line on its own values", () => {
    const svg = render({
      version: "1",
      type: "combo",
      data: [
        { x: "Jan", a: 10, b: 20, g: 5 },
        { x: "Feb", a: 12, b: 8, g: 6 },
      ],
      encoding: {
        x: "x",
        y: [
          { field: "a", mark: "bar", stack: "seats" },
          { field: "b", mark: "bar", stack: "seats" },
          { field: "g", mark: "line" },
        ],
      },
      size: { width: 640, height: 240 },
      a11y: { alt },
    });
    const bars = rects(svg);
    expect(bars).toHaveLength(4);
    expect(bars[0].x).toBeCloseTo(bars[2].x, 0);
    expect(svg).toMatch(/<path[^>]*fill="none"/);
    const line = svg.match(/<path[^>]*fill="none"[^>]*d="([^"]+)"/);
    expect(line?.[1] ?? "").not.toMatch(/NaN/);
  });

  it("repairs a stack group that is not a name, and warns when the chart cannot stack", () => {
    const number = validate({
      version: "1",
      type: "bar",
      data: [{ x: "Mon", a: 1 }],
      encoding: { x: "x", y: { field: "a", stack: 2 } },
      a11y: { alt },
    });
    expect(number.errors.some((item) => item.code === "CK3072" && item.hint?.includes("seats"))).toBe(true);
    expect(repair(number.errors[0] ? { version: "1", type: "bar", data: [{ x: "Mon", a: 1 }], encoding: { x: "x", y: { field: "a", stack: 2 } }, a11y: { alt } } : {}).spec).toMatchObject({
      encoding: { y: { stack: "2" } },
    });

    const flag = repair({
      version: "1",
      type: "bar",
      data: [{ x: "Mon", a: 1 }],
      encoding: { x: "x", y: { field: "a", stack: true } },
      a11y: { alt },
    });
    expect(flag.spec).toMatchObject({ encoding: { y: { stack: "stack" } } });

    const gone = repair({
      version: "1",
      type: "bar",
      data: [{ x: "Mon", a: 1 }],
      encoding: { x: "x", y: { field: "a", stack: {} } },
      a11y: { alt },
    });
    expect(JSON.stringify(gone.spec)).not.toContain("stack");

    const named = validate({
      version: "1",
      type: "bar",
      data: [{ x: "Mon", a: 1 }],
      encoding: { x: "x", y: { field: "a", stack: "seats" } },
      a11y: { alt },
    });
    expect(named.diagnostics.some((item) => item.code === "CK3072")).toBe(false);

    const donut = validate({
      version: "1",
      type: "donut",
      data: [{ x: "Oak", a: 4 }],
      encoding: { x: "x", y: { field: "a", stack: "seats" } },
      a11y: { alt },
    });
    expect(donut.warnings.some((item) => item.code === "CK3072")).toBe(true);
  });
});
