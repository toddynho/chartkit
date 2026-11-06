import assert from "node:assert/strict";
import test from "node:test";
import { groupOptions, type GroupableOption } from "./option-groups.ts";

const groups = ["Data / Encoding", "Marks & style", "Axes"];

function field(partial: Partial<GroupableOption> & Pick<GroupableOption, "path" | "group">): GroupableOption {
  return {
    label: partial.label ?? partial.path,
    description: partial.description ?? "",
    essential: partial.essential,
    ...partial,
  };
}

const fields: GroupableOption[] = [
  field({ path: "encoding.y", group: "Data / Encoding", label: "Y field", essential: true }),
  field({ path: "encoding.y.format", group: "Data / Encoding", label: "Y format" }),
  field({ path: "encoding.color.scale", group: "Data / Encoding", label: "Color scale" }),
  field({ path: "mark.curve", group: "Marks & style", label: "Curve", essential: true }),
  field({ path: "mark.opacity", group: "Marks & style", label: "Opacity" }),
  field({ path: "axes.y.grid", group: "Axes", label: "Y grid" }),
];

const unsupported = new Set(["encoding.color.scale", "axes.y.grid"]);
const set = new Set(["encoding.y"]);

function run(query = "", setOnly = false) {
  return groupOptions(fields, groups, {
    query,
    setOnly,
    isSet: (item) => set.has(item.path),
    isUnsupported: (item) => unsupported.has(item.path),
  });
}

test("common options come first and the rest sit behind More options", () => {
  const data = run().find((section) => section.id === "Data / Encoding");
  assert.deepEqual(
    data?.lead.map((item) => item.label),
    ["Y field", "Color scale"],
  );
  assert.deepEqual(
    data?.more.map((item) => item.label),
    ["Y format"],
  );
  assert.equal(data?.lead[0]?.label, "Y field");
});

test("parity options that are not painted yet stay in the open list", () => {
  const axes = run().find((section) => section.id === "Axes");
  assert.deepEqual(
    axes?.lead.map((item) => item.path),
    ["axes.y.grid"],
  );
  assert.equal(axes?.more.length, 0);
  const filtered = run("", true).flatMap((section) => [...section.lead, ...section.more].map((item) => item.path));
  assert.ok(filtered.includes("encoding.color.scale"));
  assert.ok(filtered.includes("axes.y.grid"));
  assert.ok(!filtered.includes("mark.opacity"));
});

test("a group with no common options shows every option, labels unchanged", () => {
  const only = groupOptions(
    [field({ path: "axes.x.rotate", group: "Axes", label: "Rotate X labels" })],
    groups,
    { query: "", setOnly: false, isSet: () => false, isUnsupported: () => false },
  );
  assert.equal(only[0]?.lead[0]?.label, "Rotate X labels");
  assert.equal(only[0]?.more.length, 0);
});
