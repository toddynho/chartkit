import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";
import { novelFindings, readAllowlist } from "./allowlist.mjs";
import { checkSvg, textBoxes } from "./geometry.mjs";
import { buildCases } from "./generate.mjs";
import { loadExamples } from "./examples.mjs";
import { loadRuntime } from "./load.mjs";
import { examplesDir } from "./paths.mjs";
import { judgeSubtitle, readClaimAllowlist, runClaims } from "./claims.mjs";
import { treemapShadeProblems } from "./treemap-shade.mjs";
import { isStressValue, sweep } from "./run.mjs";

const overlapSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="200" viewBox="0 0 760 200"><rect width="100%" height="100%" fill="#ffffff"/><rect x="510" y="16" width="8" height="8" fill="#15803d"/><text x="522" y="24" text-anchor="start" fill="#6e6e73" font-size="11">Done</text><text x="522.18" y="22" text-anchor="middle" fill="#6e6e73" font-size="11">Mar 29</text></svg>`;

test("map label boxes use the stylesheet size", () => {
  const label = (size) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"><style>.ck-geo-label{font-size:${size}px}.ck-geo-title{font-weight:600}</style><text class="ck-geo-label" x="10" y="40">AAAA</text><text class="ck-geo-label" x="46" y="40">BBBB</text><text class="ck-geo-title" x="10" y="20" font-size="16">Title</text></svg>`;
  const small = textBoxes(label(11));
  const large = textBoxes(label(22));
  const smallLabel = small.find((item) => item.snippet === "AAAA");
  const largeLabel = large.find((item) => item.snippet === "AAAA");
  const title = small.find((item) => item.snippet === "Title");
  assert.equal(smallLabel.fontSize, 11);
  assert.equal(largeLabel.fontSize, 22);
  assert.equal(title.fontSize, 16);
  assert.equal(title.weight, 400);
  assert.ok(largeLabel.bbox.w > smallLabel.bbox.w * 1.5);
  assert.equal(checkSvg(label(11), { type: "choropleth" }).some((item) => item.check === "text-overlap"), false);
  assert.equal(checkSvg(label(22), { type: "choropleth" }).some((item) => item.check === "text-overlap"), true);
});

test("legend text overlapping a date label is a layout finding", () => {
  const findings = checkSvg(overlapSvg, { type: "gantt" });
  const overlap = findings.find((item) => item.check === "text-overlap" && item.roles.includes("legend") && item.roles.includes("tick"));
  assert.ok(overlap, "expected legend × tick text overlap");
  assert.match(overlap.detail, /does not rewrite or shorten labels/);
  const legend = findings.find((item) => item.check === "legend-overlap");
  assert.equal(legend?.signature, "legend×tick");
});

test("gantt with no title keeps the legend off the date labels", async () => {
  const runtime = await loadRuntime();
  const spec = JSON.parse(readFileSync(join(examplesDir, "24-gantt.json"), "utf8"));
  delete spec.title;
  const findings = checkSvg(runtime.render(spec), spec);
  const overlap = findings.filter((item) => item.check === "text-overlap" && item.roles.includes("legend") && item.roles.includes("tick"));
  assert.equal(overlap.length, 0);
  assert.equal(findings.some((item) => item.check === "legend-overlap"), false);
});

test("a very long string or an extreme number is stress, a typical size is not", () => {
  assert.equal(isStressValue("Northstar launch window label ".repeat(4).trim()), true);
  assert.equal(isStressValue(1_000_000), true);
  assert.equal(isStressValue("10000"), true);
  assert.equal(isStressValue("0"), true);
  assert.equal(isStressValue(""), false);
  assert.equal(isStressValue("Chart title"), false);
  assert.equal(isStressValue("240"), false);
  assert.equal(isStressValue({ "size.width": "240", "legend.position": "right" }), false);
  assert.equal(isStressValue({ title: "Northstar launch window label ".repeat(4).trim() }), true);
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

test("a heading that omits the subtitle string fails the paint claim", () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"><title>Testing</title><text x="16" y="22">Testing</text><clipPath id="c"><rect x="10" y="48" width="180" height="60"/></clipPath></svg>`;
  const verdict = judgeSubtitle(svg, { title: "Testing", subtitle: "testing where is this?" }, "testing where is this?");
  assert.equal(verdict.ok, false);
  const painted = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"><text x="16" y="22">Testing</text><text x="16" y="40">testing where is this?</text><clipPath id="c"><rect x="10" y="56" width="180" height="60"/></clipPath></svg>`;
  const ok = judgeSubtitle(painted, { title: "Testing", subtitle: "testing where is this?" }, "testing where is this?");
  assert.equal(ok.ok, true);
});

test("flat nested treemap fills fail the shade claim, and the allowlist does not waive it", () => {
  const green = "var(--ck-series-2, var(--chart-2, light-dark(#2aa148, #30d158)))";
  const flat = `<svg xmlns="http://www.w3.org/2000/svg" data-ck-type="treemap" viewBox="0 0 220 200"><rect x="10" y="10" width="180" height="180" fill="${green}" stroke="var(--ck-background, transparent)" stroke-width="2" data-ck-mark="group" aria-label="Metal: 80"></rect><rect x="16" y="28" width="160" height="150" fill="${green}" stroke="var(--ck-background, transparent)" stroke-width="2" data-ck-mark="group" aria-label="Metal / Nonferrous: 44"></rect><rect x="22" y="34" width="70" height="60" fill="${green}" stroke="var(--ck-background, transparent)" stroke-width="2" data-ck-mark="tile" aria-label="Metal / Nonferrous / Aluminum: 22"></rect><rect x="22" y="100" width="70" height="60" fill="${green}" stroke="var(--ck-background, transparent)" stroke-width="2" data-ck-mark="tile" aria-label="Metal / Nonferrous / Copper: 14"></rect></svg>`;
  const problems = treemapShadeProblems(flat);
  assert.ok(problems.some((line) => /one fill/.test(line)), problems.join("\n"));
  assert.ok(problems.some((line) => /not separated/.test(line)), problems.join("\n"));
  const mix = (pct) => `color-mix(in srgb, ${green} ${pct}%, #000)`;
  const stroke = "var(--ck-surface, light-dark(#ffffff, #2c2c2e))";
  const shaded = `<svg xmlns="http://www.w3.org/2000/svg" data-ck-type="treemap" viewBox="0 0 220 200"><rect x="10" y="10" width="180" height="180" fill="${green}" stroke="${stroke}" stroke-width="2" data-ck-mark="group" aria-label="Metal: 80"></rect><rect x="16" y="28" width="160" height="150" fill="${mix(74)}" stroke="${stroke}" stroke-width="2" data-ck-mark="group" aria-label="Metal / Nonferrous: 44"></rect><rect x="22" y="34" width="70" height="60" fill="${mix(58)}" stroke="${stroke}" stroke-width="2" data-ck-mark="tile" aria-label="Metal / Nonferrous / Aluminum: 22"></rect><rect x="98" y="34" width="70" height="60" fill="${mix(46)}" stroke="${stroke}" stroke-width="2" data-ck-mark="tile" aria-label="Metal / Nonferrous / Copper: 14"></rect></svg>`;
  assert.deepEqual(treemapShadeProblems(shaded), []);
  assert.deepEqual(treemapShadeProblems(`<svg data-ck-type="treemap"><rect x="0" y="0" width="40" height="40" fill="${green}" data-ck-mark="tile" aria-label="Wood: 12"></rect></svg>`), []);
  for (const key of readAllowlist()) assert.equal(String(key).includes("treemap-shade"), false, key);
  for (const key of readClaimAllowlist()) assert.equal(String(key).includes("treemap-shade"), false, key);
});

test("paint claims pass or are allowlisted, and subtitle is not allowlisted", async () => {
  const result = await runClaims();
  assert.equal(result.byPath.subtitle?.status, "pass", result.byPath.subtitle?.detail);
  assert.equal(result.byPath.title?.status, "pass", result.byPath.title?.detail);
  assert.equal(result.allowlist.has("subtitle"), false);
  assert.equal(readClaimAllowlist().has("subtitle"), false);
  assert.equal(result.novel.length, 0, result.novel.slice(0, 12).map((row) => `${row.path} ${row.detail}`).join("\n"));
});

test("fast sweep has no new findings and no changed renders", async () => {
  const result = await sweep({ mode: "fast", update: false, writeReport: true });
  const allowed = readAllowlist();
  const novel = novelFindings(result.findings, allowed);
  assert.equal(novel.length, 0, novel.slice(0, 8).map((item) => `${item.type} ${item.option} ${item.check} ${item.detail}`).join("\n"));
  assert.equal(result.snapshot.changed.length, 0);
  assert.equal(result.snapshot.missing.length, 0);
  const gantt = result.findings.filter((item) => item.type === "gantt" && item.example === "launch-gantt" && (item.check === "legend-overlap" || (item.check === "text-overlap" && item.roles?.includes("legend") && item.roles?.includes("tick"))));
  assert.equal(gantt.length, 0);
});
