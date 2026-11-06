import assert from "node:assert/strict";
import test from "node:test";
import { applyDonutAction, donutControlState, donutExamples } from "../donut-teach.ts";
import { donutTeach } from "./donut.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyLineAction, lineControlState, lineExamples, lineTeach, smallestLineSpec } from "./line.ts";
import { applyPieAction, pieControlState, pieExamples, pieTeach, smallestPieSpec } from "./pie.ts";
import { teachModule, teachModules } from "./registry.ts";
import { openTeachExample } from "./spec.ts";
import { applyTooltip } from "./tooltip.ts";

test("the kit is donut, pie, and line", () => {
  assert.deepEqual(Object.keys(teachModules).sort(), ["donut", "line", "pie"]);
  assert.equal(teachModule("area"), undefined);
  assert.equal(teachModule("bar"), undefined);
  assert.equal(donutTeach.controls.some((control) => control.id === "innerRadius"), true);
  assert.equal(pieTeach.controls.some((control) => control.id === "innerRadius"), false);
  assert.deepEqual(
    lineTeach.controls.map((control) => control.id),
    ["curve", "points", "area", "legend", "tooltip"],
  );
});

test("opening an example copies a custom tooltip and does not rewrite it", () => {
  const fleet = donutExamples[3]!.spec;
  const opened = openTeachExample(fleet);
  assert.deepEqual(opened.tooltip, fleet.tooltip);
  assert.notEqual(opened, fleet);
  assert.notEqual(opened.tooltip, fleet.tooltip);
  const before = structuredClone(opened);
  donutControlState(opened);
  assert.deepEqual(opened, before);
  assert.equal(donutControlState(opened).tooltip, "on");
});

test("donut tooltip restore is unchanged through the shared helper", () => {
  const fleet = structuredClone(donutExamples[3]!.spec);
  const original = structuredClone(fleet.tooltip);
  donutTeach.apply(fleet, { id: "tooltip", value: "off" });
  assert.equal(fleet.tooltip, false);
  assert.equal(donutControlState(fleet).tooltip, "off");
  donutTeach.apply(fleet, { id: "tooltip", value: "on", restore: original });
  assert.deepEqual(fleet.tooltip, original);

  const viaAction = structuredClone(donutExamples[0]!.spec);
  const viaHelper = structuredClone(donutExamples[0]!.spec);
  applyDonutAction(viaAction, { type: "tooltip", value: "off" });
  applyTooltip(viaHelper, "off");
  assert.equal(viaAction.tooltip, false);
  assert.equal(viaHelper.tooltip, false);
  applyDonutAction(viaAction, { type: "tooltip", value: "on", restore: undefined });
  applyTooltip(viaHelper, "on", undefined);
  assert.equal("tooltip" in viaAction, false);
  assert.equal("tooltip" in viaHelper, false);
});

test("pie tooltip off restores an omitted tooltip and a custom tooltip", () => {
  const shelves = structuredClone(pieExamples[1]!.spec);
  const original = structuredClone(shelves.tooltip);
  assert.equal(pieControlState(shelves).tooltip, "on");
  applyPieAction(shelves, { id: "tooltip", value: "off" });
  assert.equal(shelves.tooltip, false);
  assert.equal(pieControlState(shelves).tooltip, "off");
  applyPieAction(shelves, { id: "tooltip", value: "on", restore: original });
  assert.deepEqual(shelves.tooltip, original);

  const revenue = structuredClone(pieExamples[0]!.spec);
  assert.equal(revenue.tooltip, undefined);
  const before = structuredClone(revenue);
  pieControlState(revenue);
  assert.deepEqual(revenue, before);
  applyPieAction(revenue, { id: "tooltip", value: "off" });
  assert.equal(revenue.tooltip, false);
  applyPieAction(revenue, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in revenue, false);
});

test("pie actions edit the disk and ignore a hole", () => {
  assert.equal(smallestPieSpec.type, "pie");
  assert.equal(smallestPieSpec.mark, undefined);
  const bare = structuredClone(smallestPieSpec);
  applyPieAction(bare, { id: "innerRadius", value: 0.6 });
  assert.equal(bare.mark, undefined);

  const spec = structuredClone(pieExamples[0]!.spec);
  applyPieAction(spec, { id: "padAngle", value: 4 });
  assert.equal((spec.mark as { padAngle: number }).padAngle, 4);
  applyPieAction(spec, { id: "labels", value: "inside" });
  assert.equal((spec.mark as { labelPosition: string }).labelPosition, "inside");
  const hidden = structuredClone(spec);
  applyPieAction(hidden, { id: "legend", value: "off" });
  assert.equal(hidden.legend, false);
  applyPieAction(spec, { id: "legend", value: "right" });
  const legend = spec.legend;
  assert.ok(legend && typeof legend === "object" && !Array.isArray(legend));
  assert.equal(Reflect.get(legend, "position"), "right");
  applyPieAction(spec, { id: "sort", value: "desc" });
  assert.equal((spec.mark as { sort: string }).sort, "desc");
  applyPieAction(spec, { id: "startAngle", value: "-90" });
  assert.equal((spec.mark as { startAngle: number }).startAngle, -90);
  applyPieAction(spec, { id: "palette", value: "set" });
  assert.equal(pieControlState(spec).palette, "set");
  applyPieAction(spec, { id: "palette", value: "theme" });
  assert.equal((spec.mark as { palette?: unknown }).palette, undefined);

  assert.deepEqual(
    pieExamples.map((example) => example.title),
    ["Share of revenue", "Loans by shelf", "Plan mix", "Kiln hours"],
  );
  assert.deepEqual(
    pieExamples.map((example) => example.meta),
    ["5 slices", "6 slices", "4 slices", "3 slices"],
  );
  for (const example of pieExamples) assert.equal(example.spec.type, "pie");
});

test("line actions edit curve, points, area, legend, and tooltip", () => {
  assert.equal(smallestLineSpec.type, "line");
  assert.equal(smallestLineSpec.mark, undefined);

  const quarterly = structuredClone(lineExamples[0]!.spec);
  assert.equal(lineControlState(quarterly).curve, "monotone");
  assert.equal(lineControlState(quarterly).points, "always");
  assert.equal(lineControlState(quarterly).area, "off");
  assert.equal(lineControlState(quarterly).legend, "top");
  assert.equal(quarterly.tooltip, undefined);
  applyLineAction(quarterly, { id: "curve", value: "linear" });
  assert.equal((quarterly.mark as { curve: string }).curve, "linear");
  applyLineAction(quarterly, { id: "points", value: "hover" });
  assert.equal((quarterly.mark as { points: string }).points, "hover");
  applyLineAction(quarterly, { id: "area", value: "on" });
  assert.equal((quarterly.mark as { area: boolean }).area, true);
  applyLineAction(quarterly, { id: "tooltip", value: "off" });
  assert.equal(quarterly.tooltip, false);
  applyLineAction(quarterly, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in quarterly, false);

  const target = structuredClone(lineExamples[1]!.spec);
  assert.equal(lineControlState(target).area, "other");
  const untouched = structuredClone(target);
  lineControlState(target);
  assert.deepEqual(target, untouched);
  applyLineAction(target, { id: "area", value: "off" });
  assert.equal((target.mark as { area: boolean }).area, false);
  const channels = (target.encoding as { y: Record<string, unknown>[] }).y;
  assert.equal(channels[0]?.area, undefined);
  assert.equal(channels[1]?.dash, "dashed");
  assert.equal(lineControlState(target).area, "off");
  applyLineAction(target, { id: "area", value: "on" });
  assert.equal((target.mark as { area: boolean }).area, true);
  const filled = (target.encoding as { y: Record<string, unknown>[] }).y;
  assert.equal(filled[0]?.area, undefined);
  assert.equal(filled[1]?.dash, "dashed");

  const deploys = structuredClone(lineExamples[2]!.spec);
  assert.equal(lineControlState(deploys).curve, "step");
  assert.equal(lineControlState(deploys).legend, "off");
  applyLineAction(deploys, { id: "legend", value: "bottom" });
  assert.deepEqual(deploys.legend, { position: "bottom" });

  const cost = structuredClone(lineExamples[3]!.spec);
  const original = structuredClone(cost.tooltip);
  assert.equal(lineControlState(cost).tooltip, "on");
  applyLineAction(cost, { id: "tooltip", value: "off" });
  assert.equal(cost.tooltip, false);
  applyLineAction(cost, { id: "tooltip", value: "on", restore: original });
  assert.deepEqual(cost.tooltip, original);

  assert.deepEqual(
    lineExamples.map((example) => example.title),
    ["Quarterly units", "Revenue against target", "Deploys, step curve", "Revenue and cost"],
  );
  assert.deepEqual(
    lineExamples.map((example) => example.meta),
    ["4 points", "2 series", "5 points", "2 series"],
  );
  for (const example of lineExamples) assert.equal(example.spec.type, "line");
});

test("legend keeps the other keys and reads the omitted place", () => {
  const spec: Record<string, unknown> = { legend: { values: true, interactive: true } };
  assert.equal(legendChoice(spec, { omitted: "bottom", known: ["bottom", "right"] }), "bottom");
  assert.equal(legendChoice(spec, { omitted: "top", known: ["top", "bottom", "right"] }), "top");
  applyLegend(spec, "right");
  assert.deepEqual(spec.legend, { values: true, interactive: true, position: "right" });
  applyLegend(spec, "off");
  assert.equal(spec.legend, false);
});
