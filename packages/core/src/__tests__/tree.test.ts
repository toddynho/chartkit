import { describe, expect, it } from "vitest";
import { renderTree } from "../renderers/extra/tree";
import { repair, validate } from "../validate";

const alt = "Root has two children. A has one child.";

function tidy() {
  return {
    version: "1",
    type: "tree",
    data: [
      { id: "Root", parent: "" },
      { id: "A", parent: "Root" },
      { id: "B", parent: "Root" },
      { id: "A1", parent: "A" },
    ],
    encoding: { id: "id", parent: "parent" },
    a11y: { alt },
  };
}

describe("tree", () => {
  it("draws dots and links for one root", () => {
    const svg = renderTree(tidy());
    expect(svg).toContain('data-ck-type="tree"');
    expect(svg?.match(/data-ck-mark="point"/g)?.length).toBe(4);
    expect(svg?.match(/data-ck-link=/g)?.length).toBe(3);
    expect(svg).toContain("aria-hidden");
    expect(svg).not.toContain("ck-chart-error");
  });

  it("lines cluster leaves up on one axis", () => {
    const spec = tidy();
    spec.mark = { tree: "cluster", orient: "TB" } as never;
    const svg = renderTree(spec) ?? "";
    const leaves = ["A1", "B"];
    const ys = leaves.map((name) => {
      const match = new RegExp(`data-ck-id="${name}"[^>]*cy="([\\d.]+)"`).exec(svg);
      return match?.[1];
    });
    expect(ys[0]).toBeTruthy();
    expect(ys[0]).toBe(ys[1]);
  });

  it("refuses a forest and does not invent a root", () => {
    const spec = tidy();
    spec.data = [
      { id: "A", parent: "" },
      { id: "B", parent: "" },
    ];
    const result = validate(spec);
    expect(result.errors.some((item) => item.code === "CK3115")).toBe(true);
    expect(repair(spec).spec).toEqual(spec);
    expect(renderTree(spec)).toBeNull();
  });

  it("repairs bar orientation onto mark.orient", () => {
    const spec = { ...tidy(), mark: { orientation: "vertical" } };
    const fixed = repair(spec);
    expect(fixed.spec).toMatchObject({ mark: { orient: "TB" } });
    expect((fixed.spec as { mark: { orientation?: string } }).mark.orientation).toBeUndefined();
  });

  it("hides children of a collapsed id", () => {
    const spec = { ...tidy(), mark: { collapsed: ["A"] } };
    const svg = renderTree(spec) ?? "";
    expect(svg).toContain('data-ck-id="A"');
    expect(svg).not.toContain('data-ck-id="A1"');
  });

  it("keeps tidy positions when node values change the radius", () => {
    const base = renderTree(tidy()) ?? "";
    const sized = renderTree({
      ...tidy(),
      data: [
        { id: "Root", parent: "" },
        { id: "A", parent: "Root" },
        { id: "B", parent: "Root", value: 3 },
        { id: "A1", parent: "A", value: 8 },
      ],
      encoding: { id: "id", parent: "parent", y: "value" },
    }) ?? "";
    const at = (svg: string, id: string) => {
      const match = new RegExp(`data-ck-id="${id}"[^>]*cx="([\\d.]+)" cy="([\\d.]+)"`).exec(svg);
      return match ? `${match[1]} ${match[2]}` : "";
    };
    expect(at(sized, "A1")).toBe(at(base, "A1"));
    expect(sized).not.toBe(base);
  });

  it("warns when radial leaves pass 30 and still draws", () => {
    const data = [{ id: "Root", parent: "" }];
    for (let i = 0; i < 31; i++) data.push({ id: `L${i}`, parent: "Root" });
    const spec = { ...tidy(), data, mark: { radial: true } };
    const result = validate(spec);
    expect(result.warnings.some((item) => item.code === "CK3117")).toBe(true);
    expect(renderTree(spec)).toContain('data-ck-type="tree"');
  });
});
