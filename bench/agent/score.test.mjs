import assert from "node:assert/strict";
import { test } from "node:test";
import { costPer100, outcomeForRow, scoreLibrary } from "./score.mjs";

test("until-pass tokens sum model calls and leave DNF out of the median", () => {
  const rows = [
    { id: "a", library: "plot", ok: true, status: "checked", usage: { input_tokens: 100, output_tokens: 10 } },
    {
      id: "b",
      library: "plot",
      ok: false,
      status: "fail",
      usage: { input_tokens: 40, output_tokens: 10 },
      second: { ok: true, status: "checked", usage: { input_tokens: 50, output_tokens: 30 } },
    },
    { id: "c", library: "plot", ok: false, status: "fail", usage: { output_tokens: 999, input_tokens: 999 } },
    { id: "d", library: "plot", ok: true, status: "unsupported", usage: { output_tokens: 5, input_tokens: 5 } },
  ];
  const score = scoreLibrary(rows, { price: { inputPerMillion: 2, outputPerMillion: 10 } });
  assert.equal(score.outputTokens.median, 25);
  assert.equal(score.outputTokens.mean, 25);
  assert.equal(score.outputTokens.n, 2);
  assert.equal(score.calls.median, 1.5);
  assert.equal(score.inputTokens.median, 95);
  assert.equal(score.workingCharts, 2);
  assert.equal(score.declined, 1);
  assert.deepEqual(score.dnf.ids, ["c"]);
  assert.equal(score.firstTry.passed, 2);
  assert.equal(score.withinTwo.passed, 3);
  assert.equal(score.costPer100, costPer100(95, 25, { inputPerMillion: 2, outputPerMillion: 10 }));
  assert.equal(score.costPer100, 0.044);
  assert.equal(Number.isFinite(score.outputTokens.median), true);
});

test("chartkit repair() keeps one model call and ignores a later retry's tokens", () => {
  const repaired = outcomeForRow({
    id: "g",
    library: "chartkit",
    ok: false,
    status: "fail",
    repaired: true,
    usage: { input_tokens: 80, output_tokens: 15 },
    second: null,
  });
  assert.equal(repaired.outcome, "pass");
  assert.equal(repaired.via, "repair");
  assert.equal(repaired.calls, 1);
  assert.equal(repaired.outputTokens, 15);
  const historical = outcomeForRow({
    id: "h",
    library: "chartkit",
    ok: false,
    usage: { output_tokens: 12, input_tokens: 1 },
    second: { ok: false, usage: { output_tokens: 400, input_tokens: 1 } },
  }, (attempt) => attempt.output === "fixable");
  const row = {
    id: "h",
    library: "chartkit",
    ok: false,
    output: "fixable",
    usage: { output_tokens: 12, input_tokens: 1 },
    second: { ok: false, output: "nope", usage: { output_tokens: 400, input_tokens: 1 } },
  };
  const scored = outcomeForRow(row, (attempt) => attempt.output === "fixable");
  assert.equal(historical.via, "dnf");
  assert.equal(scored.via, "repair");
  assert.equal(scored.calls, 1);
  assert.equal(scored.outputTokens, 12);
});
