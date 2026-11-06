import assert from "node:assert/strict";
import test from "node:test";
import { paintsHeading, stageSpec } from "./stage-spec.ts";

test("the playground chart keeps the title and subtitle the heading paints", () => {
  const view = stageSpec({
    type: "line",
    title: "Testing",
    subtitle: "testing where is this?",
    encoding: { x: "quarter", y: "units" },
  });
  assert.equal(view.title, "Testing");
  assert.equal(view.subtitle, "testing where is this?");
  assert.equal(paintsHeading(view), true);
});

test("an empty heading is the only case the card labels Untitled", () => {
  assert.equal(paintsHeading({}), false);
  assert.equal(paintsHeading({ title: "  ", subtitle: "" }), false);
  assert.equal(paintsHeading({ subtitle: "testing where is this?" }), true);
});
