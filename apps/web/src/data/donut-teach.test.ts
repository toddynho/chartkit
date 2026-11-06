import assert from "node:assert/strict";
import test from "node:test";
import { DONUT_PALETTE, applyDonutAction, donutControlState, donutExamples, playgroundHref, smallestDonutSpec } from "./donut-teach.ts";

function rows(spec: Record<string, unknown>): Record<string, unknown>[] {
  assert.ok(Array.isArray(spec.data));
  return spec.data as Record<string, unknown>[];
}

function labels(spec: Record<string, unknown>, field: string): string[] {
  return rows(spec).map((row) => {
    assert.equal(typeof row[field], "string");
    return row[field] as string;
  });
}

test("curated donut examples keep a hole and the original category names", () => {
  assert.deepEqual(
    donutExamples.map((example) => example.id),
    ["sessions", "sources", "yard", "fleet"],
  );
  for (const example of donutExamples) {
    assert.equal(example.spec.type, "donut");
    assert.equal(example.id === "budget-pie", false);
    assert.equal(example.blurb.toLowerCase().includes("hole closed"), false);
    const mark = example.spec.mark;
    if (mark && typeof mark === "object" && !Array.isArray(mark) && "innerRadius" in mark) {
      assert.equal(typeof mark.innerRadius, "number");
      assert.ok((mark.innerRadius as number) > 0);
    }
  }
  assert.deepEqual(
    donutExamples.map((example) => example.title),
    ["Sessions by source", "Eight session sources", "What left the yard", "Fleet"],
  );
  assert.deepEqual(
    donutExamples.map((example) => example.meta),
    ["4 slices", "8 slices", "4 slices", "2 slices"],
  );
  assert.deepEqual(labels(donutExamples[0].spec, "source"), ["Search", "Direct", "Social", "Email"]);
  assert.deepEqual(labels(donutExamples[1].spec, "label"), ["Search", "Direct", "Social", "Email", "Referral", "Affiliates", "Partners", "Other"]);
  assert.deepEqual(labels(donutExamples[2].spec, "kind"), ["Fern", "Ivy", "Sage", "Rue"]);
  assert.deepEqual(labels(donutExamples[3].spec, "kind"), ["Classic", "E-bike"]);
  assert.deepEqual((donutExamples[2].spec.mark as { palette: string[] }).palette, [...DONUT_PALETTE]);
});

test("tooltip off writes false and on puts a custom tooltip back", () => {
  const fleet = structuredClone(donutExamples[3].spec);
  const original = structuredClone(fleet.tooltip);
  assert.equal(donutControlState(fleet).tooltip, "on");
  applyDonutAction(fleet, { type: "tooltip", value: "off" });
  assert.equal(fleet.tooltip, false);
  assert.equal(donutControlState(fleet).tooltip, "off");
  applyDonutAction(fleet, { type: "tooltip", value: "on", restore: original });
  assert.deepEqual(fleet.tooltip, original);

  const sessions = structuredClone(donutExamples[0].spec);
  assert.equal(sessions.tooltip, undefined);
  assert.equal(donutControlState(sessions).tooltip, "on");
  applyDonutAction(sessions, { type: "tooltip", value: "off" });
  assert.equal(sessions.tooltip, false);
  applyDonutAction(sessions, { type: "tooltip", value: "on", restore: undefined });
  assert.equal(sessions.tooltip, undefined);
});

test("the smallest donut spec is type donut with the core example labels", () => {
  assert.equal(smallestDonutSpec.type, "donut");
  assert.equal(smallestDonutSpec.mark, undefined);
  assert.deepEqual(labels(smallestDonutSpec, "label"), ["Search", "Direct", "Social", "Email"]);
  assert.equal(playgroundHref(smallestDonutSpec).startsWith("/playground#"), true);
});
