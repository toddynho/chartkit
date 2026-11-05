import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";
import { novelFindings, readAllowlist } from "./allowlist.mjs";
import { checkSvg } from "./geometry.mjs";
import { buildCases } from "./generate.mjs";
import { loadExamples } from "./examples.mjs";
import { loadRuntime } from "./load.mjs";
import { examplesDir } from "./paths.mjs";
import { sweep } from "./run.mjs";

const overlapSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="200" viewBox="0 0 760 200"><rect width="100%" height="100%" fill="#ffffff"/><rect x="510" y="16" width="8" height="8" fill="#15803d"/><text x="522" y="24" text-anchor="start" fill="#6e6e73" font-size="11">Done</text><text x="522.18" y="22" text-anchor="middle" fill="#6e6e73" font-size="11">Mar 29</text></svg>`;

test("legend text overlapping a date label is a layout finding", () => {
  const findings = checkSvg(overlapSvg, { type: "gantt" });
  const overlap = findings.find((item) => item.check === "text-overlap" && item.roles.includes("legend") && item.roles.includes("tick"));
  assert.ok(overlap, "expected legend × tick text overlap");
  assert.match(overlap.detail, /does not rewrite or shorten labels/);
  const legend = findings.find((item) => item.check === "legend-overlap");
  assert.equal(legend?.signature, "legend×tick");
});

test("gantt with no title reports the legend on the date labels", async () => {
  const runtime = await loadRuntime();
  const spec = JSON.parse(readFileSync(join(examplesDir, "24-gantt.json"), "utf8"));
  delete spec.title;
  const findings = checkSvg(runtime.render(spec), spec);
  const overlap = findings.filter((item) => item.check === "text-overlap" && item.roles.includes("legend") && item.roles.includes("tick"));
  assert.ok(overlap.length >= 1);
  assert.ok(findings.some((item) => item.check === "legend-overlap" && item.signature === "legend×tick"));
});

test("not-yet options are recorded and not rendered", async () => {
  const runtime = await loadRuntime();
  const examples = loadExamples(runtime);
  const { cases } = buildCases(runtime, examples, { mode: "fast" });
  const notes = cases.filter((row) => row.type === "gantt" && row.option === "encoding.color.title");
  assert.equal(notes.length, 1);
  assert.equal(notes[0].status, "not-yet");
  assert.equal(notes[0].spec, null);
});

test("the case list does not change between builds", async () => {
  const runtime = await loadRuntime();
  const examples = loadExamples(runtime);
  const first = buildCases(runtime, examples, { mode: "fast" }).cases.map((row) => row.id);
  const second = buildCases(runtime, examples, { mode: "fast" }).cases.map((row) => row.id);
  assert.deepEqual(first, second);
  assert.equal(new Set(first).size, first.length);
});

test("fast sweep has no new findings and no changed renders", async () => {
  const result = await sweep({ mode: "fast", update: false, writeReport: true });
  const allowed = readAllowlist();
  const novel = novelFindings(result.findings, allowed);
  assert.equal(novel.length, 0, novel.slice(0, 8).map((item) => `${item.type} ${item.option} ${item.check} ${item.detail}`).join("\n"));
  assert.equal(result.snapshot.changed.length, 0);
  assert.equal(result.snapshot.missing.length, 0);
  const gantt = result.findings.filter((item) => item.type === "gantt" && item.example === "launch-gantt" && item.check === "text-overlap" && item.roles.includes("legend"));
  assert.ok(gantt.length >= 1, "fast sweep should include the untitled gantt legend overlap");
});
