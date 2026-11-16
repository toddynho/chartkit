import test from "node:test";
import assert from "node:assert/strict";
import { capFor, evaluate } from "./size-gate.mjs";

const keys = ["line", "qwik"];
test("capFor gives 1% or 256 B headroom", () => {
  assert.equal(capFor(100), 356);
  assert.equal(capFor(34775), 34775 + 348);
});
test("a raise without an exception fails; with one passes", () => {
  const base = { budget: { line: 1000, qwik: 300 } };
  const args = { keys, measured: { line: 1100, qwik: 100 }, budget: { line: 1200, qwik: 300 }, base };
  assert.match(evaluate({ ...args, exceptions: [] }).failures[0], /line cap raised 1000 -> 1200/);
  const ok = evaluate({ ...args, exceptions: [{ key: "line", cap: 1200, reason: "x", pr: "#1" }] });
  assert.deepEqual(ok.failures, []);
});
test("an exception for a different cap does not count", () => {
  const r = evaluate({ keys: ["line"], measured: { line: 1 }, budget: { line: 1200 }, base: { budget: { line: 1000 } }, exceptions: [{ key: "line", cap: 1100, reason: "x", pr: "#1" }] });
  assert.equal(r.failures.length, 1);
});
test("over cap and lowering", () => {
  const r = evaluate({ keys: ["line"], measured: { line: 900 }, budget: { line: 800 }, base: { budget: { line: 1000 } } });
  assert.match(r.failures[0], /900 > budget 800/);
  const l = evaluate({ keys: ["line"], measured: { line: 700 }, budget: { line: 800 }, base: { budget: { line: 1000 } } });
  assert.equal(l.rows[0].status, "lowered");
});
