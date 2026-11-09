import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { PLAYGROUND_TYPES, chartPageTypes, parseWidths, planJobs, repoRootFrom } from "./targets.mjs";

const root = repoRootFrom(dirname(fileURLToPath(import.meta.url)));

test("chart pages match the docs-catalog union", () => {
  const types = chartPageTypes(root);
  assert.equal(new Set(types).size, types.length);
  assert.ok(types.includes("progress-ring"));
  assert.ok(types.includes("area"));
  assert.ok(types.includes("line"));
  assert.ok(types.includes("choropleth"));
  assert.ok(types.length >= 40);
  assert.equal(join(root, "apps/web/package.json").endsWith("apps/web/package.json"), true);
});

test("jobs cover every demo width on desktop and one mobile pass", () => {
  const widths = parseWidths("280,default,720");
  assert.deepEqual(widths, [
    { px: 280, store: true },
    { px: 380, store: false },
    { px: 720, store: true },
  ]);
  const types = chartPageTypes(root);
  const jobs = planJobs({ types, only: "", widths });
  const ring = jobs.filter((job) => job.kind === "docs" && job.type === "progress-ring");
  assert.equal(ring.length, 4);
  assert.deepEqual(
    ring.map((job) => job.rail?.px ?? null),
    [280, 380, 720, null],
  );
  assert.equal(jobs.some((job) => job.kind === "home"), true);
  assert.equal(jobs.some((job) => job.kind === "compare"), true);
  const play = jobs.filter((job) => job.kind === "play");
  assert.equal(play.length, (1 + PLAYGROUND_TYPES.length) * 2);

  const only = planJobs({ types, only: "progress-ring", widths });
  assert.equal(only.some((job) => job.kind === "home"), false);
  assert.equal(only.filter((job) => job.kind === "play").length, 2);
  assert.throws(() => planJobs({ types, only: "not-a-chart", widths }), /Unknown chart page "not-a-chart"/);
  assert.throws(() => planJobs({ types, only: "not-a-chart,still-missing", widths }), (err) => {
    assert.match(err.message, /"not-a-chart"/);
    assert.match(err.message, /"still-missing"/);
    return true;
  });
  const pair = planJobs({ types, only: "line,progress-ring", widths });
  assert.equal(pair.filter((job) => job.kind === "docs" && job.type === "line").length, 4);
  assert.equal(pair.filter((job) => job.kind === "docs" && job.type === "progress-ring").length, 4);
  assert.equal(pair.some((job) => job.kind === "home"), false);
  assert.equal(pair.some((job) => job.kind === "docs" && job.type === "bar"), false);
});
