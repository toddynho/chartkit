import assert from "node:assert/strict";
import test from "node:test";
import { DONUT_PALETTE, donutExamples, playgroundHref, smallestDonutSpec } from "./donut-teach.ts";

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
  assert.deepEqual(labels(donutExamples[0].spec, "source"), ["Search", "Direct", "Social", "Email"]);
  assert.deepEqual(labels(donutExamples[1].spec, "label"), ["Search", "Direct", "Social", "Email", "Referral", "Affiliates", "Partners", "Other"]);
  assert.deepEqual(labels(donutExamples[2].spec, "kind"), ["Fern", "Ivy", "Sage", "Rue"]);
  assert.deepEqual(labels(donutExamples[3].spec, "kind"), ["Classic", "E-bike"]);
  assert.deepEqual((donutExamples[2].spec.mark as { palette: string[] }).palette, [...DONUT_PALETTE]);
});

test("the smallest donut spec is type donut with the core example labels", () => {
  assert.equal(smallestDonutSpec.type, "donut");
  assert.equal(smallestDonutSpec.mark, undefined);
  assert.deepEqual(labels(smallestDonutSpec, "label"), ["Search", "Direct", "Social", "Email"]);
  assert.equal(playgroundHref(smallestDonutSpec).startsWith("/playground#"), true);
});
