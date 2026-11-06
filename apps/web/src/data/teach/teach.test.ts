import assert from "node:assert/strict";
import test from "node:test";
import { applyDonutAction, donutControlState, donutExamples } from "../donut-teach.ts";
import { applyBarAction, barControlState, barExamples, barTeach, smallestBarSpec } from "./bar.ts";
import { applyComboAction, comboControlState, comboExamples, comboTeach, smallestComboSpec } from "./combo.ts";
import { donutTeach } from "./donut.ts";
import { applyFunnelAction, funnelControlState, funnelExamples, funnelTeach, smallestFunnelSpec } from "./funnel.ts";
import { applyGanttAction, ganttControlState, ganttExamples, ganttTeach, smallestGanttSpec } from "./gantt.ts";
import { applyJourneyAction, journeyControlState, journeyExamples, journeyTeach, smallestJourneySpec } from "./journey.ts";
import { applyLegend, legendChoice } from "./legend.ts";
import { applyLineAction, lineControlState, lineExamples, lineTeach, smallestLineSpec } from "./line.ts";
import { applyPieAction, pieControlState, pieExamples, pieTeach, smallestPieSpec } from "./pie.ts";
import { applyQuadrantAction, quadrantControlState, quadrantExamples, quadrantTeach, smallestQuadrantSpec } from "./quadrant.ts";
import { applyRadialBarAction, radialBarControlState, radialBarExamples, radialBarTeach, smallestRadialBarSpec } from "./radial-bar.ts";
import { teachModule, teachModules } from "./registry.ts";
import { applyRoseAction, roseControlState, roseExamples, roseTeach, smallestRoseSpec } from "./rose.ts";
import { applySankeyAction, sankeyControlState, sankeyExamples, sankeyTeach, smallestSankeySpec } from "./sankey.ts";
import { applyScatterAction, scatterControlState, scatterExamples, scatterTeach, smallestScatterSpec } from "./scatter.ts";
import {
  applyStreamgraphAction,
  smallestStreamgraphSpec,
  streamgraphControlState,
  streamgraphExamples,
  streamgraphTeach,
} from "./streamgraph.ts";
import { openTeachExample } from "./spec.ts";
import {
  applyStackedAreaAction,
  smallestStackedAreaSpec,
  stackedAreaControlState,
  stackedAreaExamples,
  stackedAreaTeach,
} from "./stacked-area.ts";
import { applySunburstAction, smallestSunburstSpec, sunburstControlState, sunburstExamples, sunburstTeach } from "./sunburst.ts";
import { applyTooltip } from "./tooltip.ts";
import { applyTimelineAction, smallestTimelineSpec, timelineControlState, timelineExamples, timelineTeach } from "./timeline.ts";
import { applyTreeAction, smallestTreeSpec, treeControlState, treeExamples, treeTeach } from "./tree.ts";
import { applyTreemapAction, smallestTreemapSpec, treemapControlState, treemapExamples, treemapTeach } from "./treemap.ts";
import { applyVennAction, smallestVennSpec, vennControlState, vennExamples, vennTeach } from "./venn.ts";
import { applyWaterfallAction, smallestWaterfallSpec, waterfallControlState, waterfallExamples, waterfallTeach } from "./waterfall.ts";

test("the kit is donut, pie, line, the cartesian batch, part-to-whole, and flow", () => {
  assert.deepEqual(Object.keys(teachModules).sort(), [
    "bar",
    "combo",
    "donut",
    "funnel",
    "gantt",
    "journey",
    "line",
    "pie",
    "quadrant",
    "radial-bar",
    "rose",
    "sankey",
    "scatter",
    "stacked-area",
    "streamgraph",
    "sunburst",
    "timeline",
    "tree",
    "treemap",
    "venn",
    "waterfall",
  ]);
  assert.equal(teachModule("area"), undefined);
  assert.equal(teachModule("histogram"), undefined);
  assert.equal(donutTeach.controls.some((control) => control.id === "innerRadius"), true);
  assert.equal(pieTeach.controls.some((control) => control.id === "innerRadius"), false);
  assert.deepEqual(
    lineTeach.controls.map((control) => control.id),
    ["curve", "points", "area", "legend", "tooltip"],
  );
  assert.deepEqual(
    barTeach.controls.map((control) => control.id),
    ["orientation", "stack", "labels", "legend", "tooltip"],
  );
  assert.deepEqual(
    scatterTeach.controls.map((control) => control.id),
    ["size", "shape", "legend", "tooltip"],
  );
  assert.deepEqual(
    comboTeach.controls.map((control) => control.id),
    ["seriesMark", "lineAxis", "points", "legend", "tooltip"],
  );
  assert.deepEqual(
    stackedAreaTeach.controls.map((control) => control.id),
    ["curve", "stack", "legend", "tooltip"],
  );
  assert.deepEqual(
    funnelTeach.controls.map((control) => control.id),
    ["shape", "labels", "legend", "tooltip"],
  );
  assert.equal(funnelTeach.controls.some((control) => control.id === "sort" || control.id === "orientation"), false);
  assert.deepEqual(
    treemapTeach.controls.map((control) => control.id),
    ["depth", "legend", "tooltip"],
  );
  assert.deepEqual(
    sunburstTeach.controls.map((control) => control.id),
    ["innerRadius", "depth", "legend", "tooltip"],
  );
  assert.deepEqual(
    roseTeach.controls.map((control) => control.id),
    ["startAngle", "labels", "legend", "tooltip"],
  );
  assert.equal(roseTeach.controls.some((control) => control.id === "sort" || control.id === "innerRadius"), false);
  assert.deepEqual(
    radialBarTeach.controls.map((control) => control.id),
    ["innerRadius", "startAngle", "stack", "labels", "legend", "tooltip"],
  );
  assert.equal(radialBarTeach.controls.some((control) => control.id === "sort"), false);
  assert.deepEqual(
    sankeyTeach.controls.map((control) => control.id),
    ["tooltip"],
  );
  assert.deepEqual(
    waterfallTeach.controls.map((control) => control.id),
    ["labels", "tooltip"],
  );
  assert.equal(waterfallTeach.controls.some((control) => control.id === "legend" || control.id === "orientation"), false);
  assert.deepEqual(
    treeTeach.controls.map((control) => control.id),
    ["layout", "orient", "link", "tooltip"],
  );
  assert.equal(treeTeach.controls.some((control) => control.id === "radial" || control.id === "legend"), false);
  assert.deepEqual(
    streamgraphTeach.controls.map((control) => control.id),
    ["offset", "order", "curve", "legend", "tooltip"],
  );
  assert.equal(streamgraphTeach.controls.some((control) => control.id === "stack"), false);
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

test("bar actions edit orientation, stack, labels, legend, and tooltip", () => {
  assert.equal(smallestBarSpec.type, "bar");
  assert.equal(smallestBarSpec.mark, undefined);

  const signups = structuredClone(barExamples[0]!.spec);
  assert.equal(barControlState(signups).orientation, "vertical");
  assert.equal(barControlState(signups).stack, "none");
  assert.equal(barControlState(signups).labels, "off");
  assert.equal(barControlState(signups).legend, "off");
  assert.equal(signups.tooltip, undefined);
  const untouched = structuredClone(signups);
  barControlState(signups);
  assert.deepEqual(signups, untouched);
  applyBarAction(signups, { id: "orientation", value: "horizontal" });
  assert.equal((signups.mark as { orientation: string }).orientation, "horizontal");
  applyBarAction(signups, { id: "stack", value: "stack" });
  assert.equal((signups.mark as { stack: string }).stack, "stack");
  applyBarAction(signups, { id: "labels", value: "on" });
  assert.equal((signups.mark as { labels: boolean }).labels, true);
  applyBarAction(signups, { id: "tooltip", value: "off" });
  assert.equal(signups.tooltip, false);
  applyBarAction(signups, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in signups, false);

  const regions = structuredClone(barExamples[1]!.spec);
  assert.equal(barControlState(regions).orientation, "horizontal");
  const labeled = structuredClone(regions);
  (labeled.mark as { labelPosition: string }).labelPosition = "right";
  (labeled.mark as { labels: boolean }).labels = true;
  const labeledOriginal = structuredClone(labeled);
  applyBarAction(labeled, { id: "labels", value: "off" });
  assert.equal((labeled.mark as { labels: boolean }).labels, false);
  assert.equal((labeled.mark as { labelPosition?: string }).labelPosition, undefined);
  applyBarAction(labeled, { id: "labels", value: "on", restore: labeledOriginal });
  assert.equal((labeled.mark as { labels: boolean }).labels, true);
  assert.equal((labeled.mark as { labelPosition: string }).labelPosition, "right");

  const channels = structuredClone(barExamples[2]!.spec);
  assert.equal(barControlState(channels).stack, "stack");
  assert.equal(barControlState(channels).legend, "top");
  applyBarAction(channels, { id: "stack", value: "percent" });
  assert.equal((channels.mark as { stack: string }).stack, "percent");
  applyBarAction(channels, { id: "stack", value: "none" });
  assert.equal((channels.mark as { stack: string }).stack, "none");
  applyBarAction(channels, { id: "legend", value: "bottom" });
  assert.deepEqual(channels.legend, { position: "bottom" });

  const effort = structuredClone(barExamples[3]!.spec);
  const original = structuredClone(effort.tooltip);
  assert.equal(barControlState(effort).tooltip, "on");
  assert.equal(barControlState(effort).legend, "bottom");
  assert.equal((effort.encoding as { series: string }).series, "band");
  const before = structuredClone(effort);
  barControlState(effort);
  assert.deepEqual(effort, before);
  const opened = openTeachExample(barExamples[3]!.spec);
  assert.deepEqual(opened.tooltip, barExamples[3]!.spec.tooltip);
  assert.notEqual(opened.tooltip, barExamples[3]!.spec.tooltip);
  applyBarAction(effort, { id: "tooltip", value: "off" });
  assert.equal(effort.tooltip, false);
  applyBarAction(effort, { id: "tooltip", value: "on", restore: original });
  assert.deepEqual(effort.tooltip, original);
  applyBarAction(effort, { id: "legend", value: "right" });
  assert.deepEqual(effort.legend, { position: "right", interactive: true });

  assert.deepEqual(
    barExamples.map((example) => example.title),
    ["Signups by month", "Revenue by region", "Traffic by channel", "Easy, steady, and hard"],
  );
  assert.deepEqual(
    barExamples.map((example) => example.meta),
    ["5 months", "4 regions", "3 series", "3 series"],
  );
  for (const example of barExamples) assert.equal(example.spec.type, "bar");
});

test("scatter actions edit size, shape, legend, and tooltip", () => {
  assert.equal(smallestScatterSpec.type, "scatter");
  assert.equal((smallestScatterSpec.encoding as { size?: unknown }).size, undefined);

  const seats = structuredClone(scatterExamples[0]!.spec);
  assert.equal(scatterControlState(seats).size, "off");
  assert.equal(scatterControlState(seats).shape, "circle");
  assert.equal(scatterControlState(seats).legend, "off");
  assert.equal(seats.tooltip, undefined);
  applyScatterAction(seats, { id: "size", value: "on", restore: scatterExamples[0]!.spec });
  assert.equal((seats.encoding as { size?: unknown }).size, undefined);
  assert.equal(scatterControlState(seats).size, "off");
  applyScatterAction(seats, { id: "shape", value: "diamond" });
  assert.equal((seats.mark as { pointShape: string; pointSize: number }).pointShape, "diamond");
  assert.equal((seats.mark as { pointSize: number }).pointSize, 5);
  applyScatterAction(seats, { id: "tooltip", value: "off" });
  assert.equal(seats.tooltip, false);
  applyScatterAction(seats, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in seats, false);

  const yieldSpec = structuredClone(scatterExamples[1]!.spec);
  assert.equal(scatterControlState(yieldSpec).size, "on");
  assert.deepEqual((yieldSpec.encoding as { size: { field: string; range: number[] } }).size, {
    field: "plot",
    range: [5, 16],
  });
  const yieldBefore = structuredClone(yieldSpec);
  scatterControlState(yieldSpec);
  assert.deepEqual(yieldSpec, yieldBefore);
  applyScatterAction(yieldSpec, { id: "size", value: "off" });
  assert.equal((yieldSpec.encoding as { size?: unknown }).size, undefined);
  assert.equal(scatterControlState(yieldSpec).size, "off");
  applyScatterAction(yieldSpec, { id: "size", value: "on", restore: scatterExamples[1]!.spec });
  assert.deepEqual((yieldSpec.encoding as { size: unknown }).size, {
    field: "plot",
    range: [5, 16],
  });
  assert.equal((yieldSpec.encoding as { x: { title: string } }).x.title, "Temperature");

  const spend = structuredClone(scatterExamples[2]!.spec);
  applyScatterAction(spend, { id: "size", value: "off" });
  const spendEncoding = spend.encoding as { x: { scale: { type: string } }; color: string; size?: unknown };
  assert.equal(spendEncoding.size, undefined);
  assert.equal(spendEncoding.x.scale.type, "log");
  assert.equal(spendEncoding.color, "segment");

  const sun = structuredClone(scatterExamples[3]!.spec);
  const original = structuredClone(sun.tooltip);
  assert.equal(scatterControlState(sun).shape, "diamond");
  assert.equal(scatterControlState(sun).legend, "bottom");
  assert.equal(scatterControlState(sun).tooltip, "on");
  const opened = openTeachExample(scatterExamples[3]!.spec);
  assert.deepEqual(opened.tooltip, scatterExamples[3]!.spec.tooltip);
  assert.notEqual(opened.tooltip, scatterExamples[3]!.spec.tooltip);
  applyScatterAction(sun, { id: "tooltip", value: "off" });
  assert.equal(sun.tooltip, false);
  applyScatterAction(sun, { id: "tooltip", value: "on", restore: original });
  assert.deepEqual(sun.tooltip, original);
  applyScatterAction(sun, { id: "shape", value: "square" });
  assert.equal((sun.mark as { pointShape: string }).pointShape, "square");
  assert.equal((sun.encoding as { size: { field: string } }).size.field, "grams");
  applyScatterAction(sun, { id: "legend", value: "right" });
  assert.deepEqual(sun.legend, { position: "right", interactive: true });

  assert.deepEqual(
    scatterExamples.map((example) => example.title),
    ["Seats vs. renewal rate", "Yield by temperature", "Spend vs usage", "Sun hours and sugar"],
  );
  assert.deepEqual(
    scatterExamples.map((example) => example.meta),
    ["16 points", "7 points", "4 points", "15 points"],
  );
  for (const example of scatterExamples) assert.equal(example.spec.type, "scatter");
});

test("combo actions edit the non-bar series, its axis, points, legend, and tooltip", () => {
  assert.equal(smallestComboSpec.type, "combo");
  assert.ok(smallestComboSpec.axes && typeof smallestComboSpec.axes === "object");
  const smallestY = (smallestComboSpec.encoding as { y: { mark: string }[] }).y;
  assert.deepEqual(
    smallestY.map((channel) => channel.mark),
    ["bar", "line"],
  );

  const orders = structuredClone(comboExamples[0]!.spec);
  assert.equal(comboControlState(orders).seriesMark, "line");
  assert.equal(comboControlState(orders).lineAxis, "y2");
  assert.equal(comboControlState(orders).points, "hover");
  assert.equal(comboControlState(orders).legend, "top");
  assert.equal(orders.tooltip, undefined);
  applyComboAction(orders, { id: "seriesMark", value: "area" });
  const areaChannels = (orders.encoding as { y: { mark: string; axis?: string; field: string }[] }).y;
  assert.equal(areaChannels[0]?.mark, "bar");
  assert.equal(areaChannels[0]?.field, "orders");
  assert.equal(areaChannels[1]?.mark, "area");
  assert.equal(areaChannels[1]?.axis, "y2");
  applyComboAction(orders, { id: "seriesMark", value: "line" });
  applyComboAction(orders, { id: "lineAxis", value: "y" });
  const leftChannels = (orders.encoding as { y: { mark: string; axis?: string }[] }).y;
  assert.equal(leftChannels[1]?.mark, "line");
  assert.equal(leftChannels[1]?.axis, undefined);
  assert.equal(leftChannels[0]?.mark, "bar");
  applyComboAction(orders, { id: "lineAxis", value: "y2" });
  assert.equal((orders.encoding as { y: { axis?: string }[] }).y[1]?.axis, "y2");
  applyComboAction(orders, { id: "points", value: "always" });
  assert.equal((orders.mark as { points: string }).points, "always");
  applyComboAction(orders, { id: "tooltip", value: "off" });
  assert.equal(orders.tooltip, false);
  applyComboAction(orders, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in orders, false);

  const margin = structuredClone(comboExamples[1]!.spec);
  applyComboAction(margin, { id: "lineAxis", value: "y" });
  const marginLine = (margin.encoding as { y: { format?: string; axis?: string; mark: string }[] }).y[1];
  assert.equal(marginLine?.axis, undefined);
  assert.equal(marginLine?.format, "percent");
  assert.equal(marginLine?.mark, "line");

  const jars = structuredClone(comboExamples[2]!.spec);
  const jarsTip = structuredClone(jars.tooltip);
  assert.equal(comboControlState(jars).lineAxis, "y");
  assert.equal(comboControlState(jars).legend, "bottom");
  assert.equal(comboControlState(jars).tooltip, "on");
  const jarsBefore = structuredClone(jars);
  comboControlState(jars);
  assert.deepEqual(jars, jarsBefore);
  const opened = openTeachExample(comboExamples[2]!.spec);
  assert.deepEqual(opened.tooltip, comboExamples[2]!.spec.tooltip);
  assert.notEqual(opened.tooltip, comboExamples[2]!.spec.tooltip);
  applyComboAction(jars, { id: "tooltip", value: "off" });
  assert.equal(jars.tooltip, false);
  applyComboAction(jars, { id: "tooltip", value: "on", restore: jarsTip });
  assert.deepEqual(jars.tooltip, jarsTip);

  const pace = structuredClone(comboExamples[3]!.spec);
  const paceTip = structuredClone(pace.tooltip);
  assert.equal(comboControlState(pace).points, "always");
  assert.equal(comboControlState(pace).lineAxis, "y2");
  applyComboAction(pace, { id: "seriesMark", value: "area" });
  const paceLine = (pace.encoding as { y: { mark: string; axis?: string; pointShape?: string; scale?: { reverse?: boolean } }[] }).y[1];
  assert.equal(paceLine?.mark, "area");
  assert.equal(paceLine?.axis, "y2");
  assert.equal(paceLine?.pointShape, "diamond");
  assert.equal(paceLine?.scale?.reverse, true);
  assert.equal((pace.encoding as { y: { mark: string }[] }).y[0]?.mark, "bar");
  applyComboAction(pace, { id: "points", value: "none" });
  assert.equal((pace.mark as { points: string; labelEnds: string }).points, "none");
  assert.equal((pace.mark as { labelEnds: string }).labelEnds, "ends");
  applyComboAction(pace, { id: "tooltip", value: "off" });
  assert.equal(pace.tooltip, false);
  applyComboAction(pace, { id: "tooltip", value: "on", restore: paceTip });
  assert.deepEqual(pace.tooltip, paceTip);
  applyComboAction(pace, { id: "legend", value: "top" });
  assert.equal((pace.legend as { position: string; interactive: boolean }).position, "top");
  assert.equal((pace.legend as { interactive: boolean }).interactive, true);

  assert.deepEqual(
    comboExamples.map((example) => example.title),
    ["Orders and fill rate", "Revenue and margin", "Jars this month", "Kilometres and pace"],
  );
  assert.deepEqual(
    comboExamples.map((example) => example.meta),
    ["5 weeks", "6 months", "10 weeks", "16 weeks"],
  );
  for (const example of comboExamples) assert.equal(example.spec.type, "combo");
});

test("stacked area actions edit curve, stack, legend, and tooltip", () => {
  assert.equal(smallestStackedAreaSpec.type, "stacked-area");
  assert.equal(smallestStackedAreaSpec.mark, undefined);
  assert.equal(stackedAreaControlState(smallestStackedAreaSpec).stack, "stack");
  assert.equal(stackedAreaControlState(smallestStackedAreaSpec).curve, "monotone");

  const spend = structuredClone(stackedAreaExamples[0]!.spec);
  assert.equal(stackedAreaControlState(spend).stack, "stack");
  assert.equal(stackedAreaControlState(spend).legend, "top");
  assert.equal(spend.tooltip, undefined);
  applyStackedAreaAction(spend, { id: "curve", value: "linear" });
  assert.equal((spend.mark as { curve: string }).curve, "linear");
  applyStackedAreaAction(spend, { id: "stack", value: "percent" });
  assert.equal((spend.mark as { stack: string }).stack, "percent");
  applyStackedAreaAction(spend, { id: "curve", value: "step" });
  assert.equal((spend.mark as { curve: string; stack: string }).stack, "percent");
  applyStackedAreaAction(spend, { id: "tooltip", value: "off" });
  assert.equal(spend.tooltip, false);
  applyStackedAreaAction(spend, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in spend, false);

  const mix = structuredClone(stackedAreaExamples[1]!.spec);
  assert.equal(stackedAreaControlState(mix).stack, "percent");
  applyStackedAreaAction(mix, { id: "stack", value: "stack" });
  assert.equal((mix.mark as { stack: string }).stack, "stack");

  const plans = structuredClone(stackedAreaExamples[2]!.spec);
  assert.equal(stackedAreaControlState(plans).legend, "off");
  assert.equal(stackedAreaControlState(plans).stack, "stack");
  applyStackedAreaAction(plans, { id: "legend", value: "right" });
  assert.deepEqual(plans.legend, { position: "right" });

  const bikes = structuredClone(stackedAreaExamples[3]!.spec);
  const original = structuredClone(bikes.tooltip);
  assert.equal(stackedAreaControlState(bikes).stack, "percent");
  assert.equal(stackedAreaControlState(bikes).legend, "bottom");
  assert.equal(stackedAreaControlState(bikes).tooltip, "on");
  const before = structuredClone(bikes);
  stackedAreaControlState(bikes);
  assert.deepEqual(bikes, before);
  const opened = openTeachExample(stackedAreaExamples[3]!.spec);
  assert.deepEqual(opened.tooltip, stackedAreaExamples[3]!.spec.tooltip);
  assert.notEqual(opened.tooltip, stackedAreaExamples[3]!.spec.tooltip);
  applyStackedAreaAction(bikes, { id: "tooltip", value: "off" });
  assert.equal(bikes.tooltip, false);
  applyStackedAreaAction(bikes, { id: "tooltip", value: "on", restore: original });
  assert.deepEqual(bikes.tooltip, original);
  applyStackedAreaAction(bikes, { id: "legend", value: "top" });
  assert.equal((bikes.legend as { position: string; interactive: boolean }).position, "top");
  assert.equal((bikes.legend as { interactive: boolean }).interactive, true);

  assert.deepEqual(
    stackedAreaExamples.map((example) => example.title),
    ["Spend by team", "Channel mix", "Plan mix over time", "Classic and e-bike share"],
  );
  assert.deepEqual(
    stackedAreaExamples.map((example) => example.meta),
    ["3 series", "3 series", "3 series", "2 series"],
  );
  for (const example of stackedAreaExamples) assert.equal(example.spec.type, "stacked-area");
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

const customTip = { position: "top", fields: [{ field: "value", title: "Value" }] };

test("funnel actions edit shape, labels, legend, and tooltip", () => {
  assert.equal(smallestFunnelSpec.type, "funnel");
  assert.equal(smallestFunnelSpec.mark, undefined);

  const signup = structuredClone(funnelExamples[0]!.spec);
  assert.equal(funnelControlState(signup).shape, "trapezoid");
  assert.equal(funnelControlState(signup).labels, "on");
  assert.equal(funnelControlState(signup).legend, "off");
  assert.equal(signup.tooltip, undefined);
  const untouched = structuredClone(signup);
  funnelControlState(signup);
  assert.deepEqual(signup, untouched);
  applyFunnelAction(signup, { id: "shape", value: "bar" });
  assert.equal((signup.mark as { shape: string }).shape, "bar");
  applyFunnelAction(signup, { id: "shape", value: "trapezoid" });
  assert.equal((signup.mark as { shape: string }).shape, "trapezoid");
  applyFunnelAction(signup, { id: "labels", value: "off" });
  assert.equal((signup.mark as { labels: boolean }).labels, false);
  assert.equal((signup.mark as { shape: string }).shape, "trapezoid");
  applyFunnelAction(signup, { id: "labels", value: "on", restore: funnelExamples[0]!.spec });
  assert.equal((signup.mark as { labels?: boolean }).labels, undefined);
  assert.equal((signup.mark as { shape: string }).shape, "trapezoid");
  applyFunnelAction(signup, { id: "legend", value: "top" });
  assert.deepEqual(signup.legend, { position: "top" });
  applyFunnelAction(signup, { id: "tooltip", value: "off" });
  assert.equal(signup.tooltip, false);
  applyFunnelAction(signup, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in signup, false);

  const formatted = structuredClone(funnelExamples[2]!.spec);
  (formatted.mark as { labelFormat: unknown }).labelFormat = { style: "currency", currency: "USD", decimals: 0 };
  const formattedOriginal = structuredClone(formatted);
  applyFunnelAction(formatted, { id: "labels", value: "off" });
  assert.equal((formatted.mark as { labels: boolean }).labels, false);
  assert.equal((formatted.mark as { labelFormat?: unknown }).labelFormat, undefined);
  assert.equal((formatted.mark as { shape: string }).shape, "trapezoid");
  applyFunnelAction(formatted, { id: "labels", value: "on", restore: formattedOriginal });
  assert.equal((formatted.mark as { labels?: boolean }).labels, undefined);
  assert.deepEqual((formatted.mark as { labelFormat: unknown }).labelFormat, { style: "currency", currency: "USD", decimals: 0 });
  assert.equal((formatted.mark as { shape: string }).shape, "trapezoid");

  const pitch = structuredClone(funnelExamples[1]!.spec);
  assert.equal(funnelControlState(pitch).legend, "top");
  const pitchTip = structuredClone(customTip);
  pitch.tooltip = structuredClone(pitchTip);
  const opened = openTeachExample(pitch);
  assert.deepEqual(opened.tooltip, pitch.tooltip);
  assert.notEqual(opened.tooltip, pitch.tooltip);
  applyFunnelAction(pitch, { id: "tooltip", value: "off" });
  assert.equal(pitch.tooltip, false);
  applyFunnelAction(pitch, { id: "tooltip", value: "on", restore: pitchTip });
  assert.deepEqual(pitch.tooltip, pitchTip);
  applyFunnelAction(pitch, { id: "legend", value: "bottom" });
  assert.deepEqual(pitch.legend, { position: "bottom" });

  assert.deepEqual(
    funnelExamples.map((example) => example.title),
    ["Signup funnel", "From pitch to liftoff", "From enquiry to a seat"],
  );
  assert.deepEqual(
    funnelExamples.map((example) => example.meta),
    ["5 stages", "5 stages", "4 stages"],
  );
  for (const example of funnelExamples) assert.equal(example.spec.type, "funnel");
});

test("treemap actions edit levels, legend, and tooltip", () => {
  assert.equal(smallestTreemapSpec.type, "treemap");
  assert.equal(smallestTreemapSpec.mark, undefined);
  assert.equal((smallestTreemapSpec.encoding as { color: string }).color, "group");

  const inventory = structuredClone(treemapExamples[0]!.spec);
  assert.equal(treemapControlState(inventory).depth, "all");
  assert.equal(treemapControlState(inventory).legend, "top");
  assert.equal(inventory.tooltip, undefined);
  const untouched = structuredClone(inventory);
  treemapControlState(inventory);
  assert.deepEqual(inventory, untouched);
  applyTreemapAction(inventory, { id: "depth", value: "1" });
  assert.equal((inventory.mark as { depth: number }).depth, 1);
  assert.equal((inventory.encoding as { color: string }).color, "group");
  applyTreemapAction(inventory, { id: "depth", value: "all" });
  assert.equal(inventory.mark, undefined);
  applyTreemapAction(inventory, { id: "legend", value: "off" });
  assert.equal(inventory.legend, false);
  applyTreemapAction(inventory, { id: "tooltip", value: "off" });
  assert.equal(inventory.tooltip, false);
  applyTreemapAction(inventory, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in inventory, false);

  const cellar = structuredClone(treemapExamples[1]!.spec);
  assert.equal(treemapControlState(cellar).depth, "all");
  assert.equal(treemapControlState(cellar).legend, "bottom");
  applyTreemapAction(cellar, { id: "depth", value: "2" });
  assert.equal((cellar.mark as { depth: number }).depth, 2);
  assert.equal((cellar.legend as { position: string }).position, "bottom");
  applyTreemapAction(cellar, { id: "legend", value: "right" });
  assert.deepEqual(cellar.legend, { position: "right" });
  const cellarTip = structuredClone(customTip);
  cellar.tooltip = structuredClone(cellarTip);
  const opened = openTeachExample(cellar);
  assert.deepEqual(opened.tooltip, cellar.tooltip);
  assert.notEqual(opened.tooltip, cellar.tooltip);
  applyTreemapAction(cellar, { id: "tooltip", value: "off" });
  assert.equal(cellar.tooltip, false);
  applyTreemapAction(cellar, { id: "tooltip", value: "on", restore: cellarTip });
  assert.deepEqual(cellar.tooltip, cellarTip);
  assert.equal((cellar.size as { width: number }).width, 560);

  assert.deepEqual(
    treemapExamples.map((example) => example.title),
    ["Inventory by material", "Litres by cask", "Where the crates sat"],
  );
  assert.deepEqual(
    treemapExamples.map((example) => example.meta),
    ["12 tiles", "3 levels", "3 levels"],
  );
  for (const example of treemapExamples) assert.equal(example.spec.type, "treemap");
});

test("sunburst actions edit the hole, levels, legend, and tooltip", () => {
  assert.equal(smallestSunburstSpec.type, "sunburst");
  assert.equal(smallestSunburstSpec.mark, undefined);
  assert.equal(sunburstControlState(smallestSunburstSpec).innerRadius, 0.28);

  const traffic = structuredClone(sunburstExamples[0]!.spec);
  assert.equal(sunburstControlState(traffic).innerRadius, 0.28);
  assert.equal(sunburstControlState(traffic).depth, "all");
  assert.equal(sunburstControlState(traffic).legend, "top");
  assert.equal(traffic.tooltip, undefined);
  const untouched = structuredClone(traffic);
  sunburstControlState(traffic);
  assert.deepEqual(traffic, untouched);
  applySunburstAction(traffic, { id: "innerRadius", value: 0 });
  assert.equal((traffic.mark as { innerRadius: number }).innerRadius, 0);
  assert.equal(traffic.type, "sunburst");
  applySunburstAction(traffic, { id: "depth", value: "1" });
  assert.equal((traffic.mark as { depth: number; innerRadius: number }).depth, 1);
  assert.equal((traffic.mark as { innerRadius: number }).innerRadius, 0);
  applySunburstAction(traffic, { id: "tooltip", value: "off" });
  assert.equal(traffic.tooltip, false);
  applySunburstAction(traffic, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in traffic, false);

  const cellar = structuredClone(sunburstExamples[1]!.spec);
  assert.equal(sunburstControlState(cellar).innerRadius, 0.42);
  assert.equal(sunburstControlState(cellar).legend, "bottom");
  applySunburstAction(cellar, { id: "innerRadius", value: 0.5 });
  assert.equal((cellar.mark as { innerRadius: number }).innerRadius, 0.5);
  applySunburstAction(cellar, { id: "depth", value: "2" });
  assert.equal((cellar.mark as { depth: number; innerRadius: number }).depth, 2);
  assert.equal((cellar.mark as { innerRadius: number }).innerRadius, 0.5);
  applySunburstAction(cellar, { id: "depth", value: "all" });
  assert.equal((cellar.mark as { depth?: number }).depth, undefined);
  assert.equal((cellar.mark as { innerRadius: number }).innerRadius, 0.5);
  applySunburstAction(cellar, { id: "legend", value: "off" });
  assert.equal(cellar.legend, false);
  const cellarTip = structuredClone(customTip);
  cellar.tooltip = structuredClone(cellarTip);
  const opened = openTeachExample(cellar);
  assert.deepEqual(opened.tooltip, cellar.tooltip);
  assert.notEqual(opened.tooltip, cellar.tooltip);
  applySunburstAction(cellar, { id: "tooltip", value: "off" });
  assert.equal(cellar.tooltip, false);
  applySunburstAction(cellar, { id: "tooltip", value: "on", restore: cellarTip });
  assert.deepEqual(cellar.tooltip, cellarTip);
  assert.equal(cellar.type, "sunburst");

  assert.deepEqual(
    sunburstExamples.map((example) => example.title),
    ["Traffic by source", "The same cellar, in rings", "Shed, boat, job"],
  );
  assert.deepEqual(
    sunburstExamples.map((example) => example.meta),
    ["2 rings", "3 rings", "3 rings"],
  );
  for (const example of sunburstExamples) assert.equal(example.spec.type, "sunburst");
});

test("rose actions edit start angle, labels, legend, and tooltip", () => {
  assert.equal(smallestRoseSpec.type, "rose");
  assert.equal(smallestRoseSpec.mark, undefined);
  assert.equal(roseExamples.length, 1);

  const audience = structuredClone(roseExamples[0]!.spec);
  assert.equal(roseControlState(audience).startAngle, 0);
  assert.equal(roseControlState(audience).labels, "on");
  assert.equal(roseControlState(audience).legend, "top");
  assert.equal(audience.tooltip, undefined);
  const untouched = structuredClone(audience);
  roseControlState(audience);
  assert.deepEqual(audience, untouched);
  applyRoseAction(audience, { id: "startAngle", value: "-90" });
  assert.equal((audience.mark as { startAngle: number }).startAngle, -90);
  assert.equal((audience.mark as { padAngle: number }).padAngle, 1.2);
  applyRoseAction(audience, { id: "labels", value: "off" });
  assert.equal((audience.mark as { labels: boolean }).labels, false);
  assert.equal((audience.mark as { padAngle: number }).padAngle, 1.2);
  applyRoseAction(audience, { id: "labels", value: "on", restore: roseExamples[0]!.spec });
  assert.equal((audience.mark as { labels: boolean }).labels, true);
  assert.equal((audience.mark as { padAngle: number }).padAngle, 1.2);
  applyRoseAction(audience, { id: "legend", value: "bottom" });
  assert.deepEqual(audience.legend, { position: "bottom" });
  applyRoseAction(audience, { id: "tooltip", value: "off" });
  assert.equal(audience.tooltip, false);
  applyRoseAction(audience, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in audience, false);

  const custom = structuredClone(roseExamples[0]!.spec);
  const tip = structuredClone(customTip);
  custom.tooltip = structuredClone(tip);
  const opened = openTeachExample(custom);
  assert.deepEqual(opened.tooltip, custom.tooltip);
  assert.notEqual(opened.tooltip, custom.tooltip);
  applyRoseAction(custom, { id: "tooltip", value: "off" });
  assert.equal(custom.tooltip, false);
  applyRoseAction(custom, { id: "tooltip", value: "on", restore: tip });
  assert.deepEqual(custom.tooltip, tip);
  assert.equal((custom.size as { width: number }).width, 520);

  assert.deepEqual(
    roseExamples.map((example) => example.title),
    ["Saturday audience"],
  );
  assert.deepEqual(
    roseExamples.map((example) => example.meta),
    ["6 categories"],
  );
  for (const example of roseExamples) assert.equal(example.spec.type, "rose");
});

test("radial bar actions edit the hole, start, stack, labels, legend, and tooltip", () => {
  assert.equal(smallestRadialBarSpec.type, "radial-bar");
  assert.equal(smallestRadialBarSpec.mark, undefined);
  assert.equal(radialBarControlState(smallestRadialBarSpec).innerRadius, 0.34);
  assert.equal(radialBarControlState(smallestRadialBarSpec).stack, "none");

  const lumen = structuredClone(radialBarExamples[0]!.spec);
  assert.equal(radialBarControlState(lumen).innerRadius, 0.34);
  assert.equal(radialBarControlState(lumen).startAngle, 0);
  assert.equal(radialBarControlState(lumen).stack, "none");
  assert.equal(radialBarControlState(lumen).labels, "off");
  assert.equal(radialBarControlState(lumen).legend, "top");
  assert.equal(lumen.tooltip, undefined);
  const untouched = structuredClone(lumen);
  radialBarControlState(lumen);
  assert.deepEqual(lumen, untouched);
  applyRadialBarAction(lumen, { id: "innerRadius", value: 0.5 });
  assert.equal((lumen.mark as { innerRadius: number }).innerRadius, 0.5);
  assert.equal((lumen.mark as { padAngle: number }).padAngle, 2);
  assert.equal((lumen.mark as { cornerRadius: number }).cornerRadius, 4);
  applyRadialBarAction(lumen, { id: "startAngle", value: "90" });
  assert.equal((lumen.mark as { startAngle: number }).startAngle, 90);
  applyRadialBarAction(lumen, { id: "stack", value: "stack" });
  assert.equal((lumen.mark as { stack: string }).stack, "stack");
  applyRadialBarAction(lumen, { id: "stack", value: "percent" });
  assert.equal((lumen.mark as { stack: string }).stack, "percent");
  const series = (lumen.encoding as { y: { field: string }[] }).y;
  assert.deepEqual(
    series.map((channel) => channel.field),
    ["weeknight", "saturday"],
  );
  applyRadialBarAction(lumen, { id: "labels", value: "on", restore: radialBarExamples[0]!.spec });
  assert.equal((lumen.mark as { labels: boolean }).labels, true);
  applyRadialBarAction(lumen, { id: "labels", value: "off" });
  assert.equal((lumen.mark as { labels: boolean }).labels, false);
  applyRadialBarAction(lumen, { id: "tooltip", value: "off" });
  assert.equal(lumen.tooltip, false);
  applyRadialBarAction(lumen, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in lumen, false);

  const minutes = structuredClone(radialBarExamples[1]!.spec);
  assert.equal(radialBarControlState(minutes).legend, "off");
  assert.equal(radialBarControlState(minutes).labels, "off");
  assert.equal((minutes.size as { height: number }).height, 300);
  applyRadialBarAction(minutes, { id: "legend", value: "bottom" });
  assert.deepEqual(minutes.legend, { position: "bottom" });
  assert.equal((minutes.size as { width: number }).width, 520);
  const tip = structuredClone(customTip);
  minutes.tooltip = structuredClone(tip);
  const opened = openTeachExample(minutes);
  assert.deepEqual(opened.tooltip, minutes.tooltip);
  assert.notEqual(opened.tooltip, minutes.tooltip);
  applyRadialBarAction(minutes, { id: "tooltip", value: "off" });
  assert.equal(minutes.tooltip, false);
  applyRadialBarAction(minutes, { id: "tooltip", value: "on", restore: tip });
  assert.deepEqual(minutes.tooltip, tip);
  assert.equal(minutes.type, "radial-bar");

  assert.deepEqual(
    radialBarExamples.map((example) => example.title),
    ["Lumen, minutes by desk", "Minutes by desk"],
  );
  assert.deepEqual(
    radialBarExamples.map((example) => example.meta),
    ["6 categories", "5 categories"],
  );
  for (const example of radialBarExamples) assert.equal(example.spec.type, "radial-bar");
});

test("sankey tooltip off restores an omitted tooltip and a custom tooltip", () => {
  assert.equal(smallestSankeySpec.type, "sankey");
  assert.equal(smallestSankeySpec.mark, undefined);

  const acquisition = structuredClone(sankeyExamples[0]!.spec);
  assert.equal(sankeyControlState(acquisition).tooltip, "on");
  assert.equal(acquisition.tooltip, undefined);
  const untouched = structuredClone(acquisition);
  sankeyControlState(acquisition);
  assert.deepEqual(acquisition, untouched);
  applySankeyAction(acquisition, { id: "tooltip", value: "off" });
  assert.equal(acquisition.tooltip, false);
  assert.equal(sankeyControlState(acquisition).tooltip, "off");
  applySankeyAction(acquisition, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in acquisition, false);
  assert.equal(acquisition.type, "sankey");

  const ferry = structuredClone(sankeyExamples[2]!.spec);
  const tip = structuredClone(customTip);
  ferry.tooltip = structuredClone(tip);
  const opened = openTeachExample(ferry);
  assert.deepEqual(opened.tooltip, ferry.tooltip);
  assert.notEqual(opened.tooltip, ferry.tooltip);
  applySankeyAction(ferry, { id: "tooltip", value: "off" });
  assert.equal(ferry.tooltip, false);
  applySankeyAction(ferry, { id: "tooltip", value: "on", restore: tip });
  assert.deepEqual(ferry.tooltip, tip);
  assert.equal((ferry.size as { width: number }).width, 980);

  assert.deepEqual(
    sankeyExamples.map((example) => example.title),
    ["Acquisition flow", "Neighbourhood flows", "Where the boats go, and come back"],
  );
  assert.deepEqual(
    sankeyExamples.map((example) => example.meta),
    ["10 links", "6 links", "8 links"],
  );
  for (const example of sankeyExamples) assert.equal(example.spec.type, "sankey");
});

test("waterfall actions edit labels and tooltip", () => {
  assert.equal(smallestWaterfallSpec.type, "waterfall");
  assert.equal(smallestWaterfallSpec.mark, undefined);
  assert.equal(waterfallControlState(smallestWaterfallSpec).labels, "on");

  const year = structuredClone(waterfallExamples[0]!.spec);
  assert.equal(waterfallControlState(year).labels, "on");
  assert.equal(waterfallControlState(year).tooltip, "on");
  assert.equal(year.tooltip, undefined);
  const untouched = structuredClone(year);
  waterfallControlState(year);
  assert.deepEqual(year, untouched);
  applyWaterfallAction(year, { id: "labels", value: "off" });
  assert.equal((year.mark as { labels: boolean; total: string }).labels, false);
  assert.equal((year.mark as { total: string }).total, "total");
  applyWaterfallAction(year, { id: "labels", value: "on", restore: waterfallExamples[0]!.spec });
  assert.equal((year.mark as { labels?: boolean }).labels, undefined);
  assert.equal((year.mark as { total: string }).total, "total");
  applyWaterfallAction(year, { id: "tooltip", value: "off" });
  assert.equal(year.tooltip, false);
  applyWaterfallAction(year, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in year, false);

  const voyage = structuredClone(waterfallExamples[2]!.spec);
  const original = structuredClone(voyage.tooltip);
  assert.equal(waterfallControlState(voyage).tooltip, "on");
  assert.equal(waterfallControlState(voyage).labels, "on");
  const opened = openTeachExample(voyage);
  assert.deepEqual(opened.tooltip, voyage.tooltip);
  assert.notEqual(opened.tooltip, voyage.tooltip);
  applyWaterfallAction(voyage, { id: "tooltip", value: "off" });
  assert.equal(voyage.tooltip, false);
  applyWaterfallAction(voyage, { id: "tooltip", value: "on", restore: original });
  assert.deepEqual(voyage.tooltip, original);
  assert.equal((voyage.size as { height: number }).height, 380);
  applyWaterfallAction(voyage, { id: "labels", value: "off" });
  assert.equal((voyage.mark as { labels: boolean }).labels, false);
  assert.equal(voyage.type, "waterfall");

  assert.deepEqual(
    waterfallExamples.map((example) => example.title),
    ["Year to date", "ARR bridge", "One voyage, step by step"],
  );
  assert.deepEqual(
    waterfallExamples.map((example) => example.meta),
    ["5 steps", "7 steps", "5 steps"],
  );
  for (const example of waterfallExamples) assert.equal(example.spec.type, "waterfall");
});

test("tree actions edit layout, direction, links, and tooltip", () => {
  assert.equal(smallestTreeSpec.type, "tree");
  assert.equal(smallestTreeSpec.mark, undefined);
  assert.equal(treeControlState(smallestTreeSpec).layout, "tidy");
  assert.equal(treeControlState(smallestTreeSpec).orient, "LR");
  assert.equal(treeControlState(smallestTreeSpec).link, "curve");

  const support = structuredClone(treeExamples[0]!.spec);
  assert.equal(treeControlState(support).layout, "tidy");
  assert.equal(treeControlState(support).orient, "LR");
  assert.equal(treeControlState(support).link, "curve");
  assert.equal(support.tooltip, undefined);
  const untouched = structuredClone(support);
  treeControlState(support);
  assert.deepEqual(support, untouched);
  applyTreeAction(support, { id: "layout", value: "cluster" });
  assert.equal((support.mark as { tree: string }).tree, "cluster");
  applyTreeAction(support, { id: "orient", value: "TB" });
  assert.equal((support.mark as { orient: string; tree: string }).orient, "TB");
  assert.equal((support.mark as { tree: string }).tree, "cluster");
  applyTreeAction(support, { id: "link", value: "step" });
  assert.equal((support.mark as { link: string }).link, "step");
  applyTreeAction(support, { id: "tooltip", value: "off" });
  assert.equal(support.tooltip, false);
  applyTreeAction(support, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in support, false);
  assert.equal(support.type, "tree");

  const produce = structuredClone(treeExamples[1]!.spec);
  assert.equal(treeControlState(produce).layout, "cluster");
  assert.equal(treeControlState(produce).orient, "TB");
  assert.equal(treeControlState(produce).link, "curve");
  applyTreeAction(produce, { id: "layout", value: "tidy" });
  assert.equal((produce.mark as { tree: string; orient: string }).tree, "tidy");
  assert.equal((produce.mark as { orient: string }).orient, "TB");
  applyTreeAction(produce, { id: "orient", value: "LR" });
  assert.equal((produce.mark as { orient: string }).orient, "LR");
  const tip = structuredClone(customTip);
  produce.tooltip = structuredClone(tip);
  const opened = openTeachExample(produce);
  assert.deepEqual(opened.tooltip, produce.tooltip);
  assert.notEqual(opened.tooltip, produce.tooltip);
  applyTreeAction(produce, { id: "tooltip", value: "off" });
  assert.equal(produce.tooltip, false);
  applyTreeAction(produce, { id: "tooltip", value: "on", restore: tip });
  assert.deepEqual(produce.tooltip, tip);

  assert.deepEqual(
    treeExamples.map((example) => example.title),
    ["Support org", "Produce"],
  );
  assert.deepEqual(
    treeExamples.map((example) => example.meta),
    ["9 nodes", "cluster"],
  );
  for (const example of treeExamples) assert.equal(example.spec.type, "tree");
});

test("streamgraph actions edit offset, order, curve, legend, and tooltip", () => {
  assert.equal(smallestStreamgraphSpec.type, "streamgraph");
  assert.equal(smallestStreamgraphSpec.mark, undefined);
  assert.equal(streamgraphControlState(smallestStreamgraphSpec).offset, "wiggle");
  assert.equal(streamgraphControlState(smallestStreamgraphSpec).order, "inside-out");
  assert.equal(streamgraphControlState(smallestStreamgraphSpec).curve, "monotone");
  assert.equal(streamgraphControlState(smallestStreamgraphSpec).legend, "top");

  const copies = structuredClone(streamgraphExamples[0]!.spec);
  assert.equal(streamgraphControlState(copies).offset, "wiggle");
  assert.equal(streamgraphControlState(copies).order, "inside-out");
  assert.equal(streamgraphControlState(copies).curve, "monotone");
  assert.equal(streamgraphControlState(copies).legend, "top");
  assert.equal(copies.tooltip, undefined);
  const untouched = structuredClone(copies);
  streamgraphControlState(copies);
  assert.deepEqual(copies, untouched);
  applyStreamgraphAction(copies, { id: "offset", value: "zero" });
  assert.equal((copies.mark as { streamOffset: string; labels: boolean }).streamOffset, "zero");
  assert.equal((copies.mark as { labels: boolean }).labels, true);
  assert.equal(streamgraphControlState(copies).order, "none");
  applyStreamgraphAction(copies, { id: "order", value: "none" });
  assert.equal((copies.mark as { order: string }).order, "none");
  applyStreamgraphAction(copies, { id: "curve", value: "step" });
  assert.equal((copies.mark as { curve: string }).curve, "step");
  applyStreamgraphAction(copies, { id: "legend", value: "bottom" });
  assert.deepEqual(copies.legend, { position: "bottom" });
  applyStreamgraphAction(copies, { id: "tooltip", value: "off" });
  assert.equal(copies.tooltip, false);
  applyStreamgraphAction(copies, { id: "tooltip", value: "on", restore: undefined });
  assert.equal("tooltip" in copies, false);

  const centered = structuredClone(streamgraphExamples[1]!.spec);
  assert.equal(streamgraphControlState(centered).offset, "center");
  assert.equal(streamgraphControlState(centered).order, "none");
  assert.equal(streamgraphControlState(centered).legend, "right");
  applyStreamgraphAction(centered, { id: "offset", value: "wiggle" });
  assert.equal((centered.mark as { streamOffset: string; order: string }).streamOffset, "wiggle");
  assert.equal((centered.mark as { order: string }).order, "none");
  applyStreamgraphAction(centered, { id: "legend", value: "off" });
  assert.equal(centered.legend, false);
  const tip = structuredClone(customTip);
  centered.tooltip = structuredClone(tip);
  const opened = openTeachExample(centered);
  assert.deepEqual(opened.tooltip, centered.tooltip);
  assert.notEqual(opened.tooltip, centered.tooltip);
  applyStreamgraphAction(centered, { id: "tooltip", value: "off" });
  assert.equal(centered.tooltip, false);
  applyStreamgraphAction(centered, { id: "tooltip", value: "on", restore: tip });
  assert.deepEqual(centered.tooltip, tip);
  assert.equal(centered.type, "streamgraph");

  const weekly = structuredClone(streamgraphExamples[2]!.spec);
  assert.equal(streamgraphControlState(weekly).offset, "expand");
  assert.equal(streamgraphControlState(weekly).order, "none");
  assert.equal((weekly.mark as { labels: boolean }).labels, true);
  applyStreamgraphAction(weekly, { id: "offset", value: "center" });
  assert.equal((weekly.mark as { streamOffset: string }).streamOffset, "center");
  assert.equal(streamgraphControlState(weekly).order, "none");

  const silhouette = structuredClone(smallestStreamgraphSpec);
  silhouette.mark = { streamOffset: "silhouette" };
  assert.equal(streamgraphControlState(silhouette).offset, "center");
  assert.equal(streamgraphControlState(silhouette).order, "none");

  assert.deepEqual(
    streamgraphExamples.map((example) => example.title),
    ["Copies by genre", "Centered genres", "Weekly streams"],
  );
  assert.deepEqual(
    streamgraphExamples.map((example) => example.meta),
    ["4 series", "2 series", "expand"],
  );
  for (const example of streamgraphExamples) assert.equal(example.spec.type, "streamgraph");
});

test("planning charts toggle tooltip and do not pretend legend, size, or color is a control", () => {
  const modules = [
    {
      type: "gantt",
      teach: ganttTeach,
      apply: applyGanttAction,
      state: ganttControlState,
      examples: ganttExamples,
      smallest: smallestGanttSpec,
      titles: ["Northstar launch", "Paper Kite", "Prep lanes for Cinder"],
      meta: ["8 tasks", "4 tasks", "5 tasks"],
    },
    {
      type: "timeline",
      teach: timelineTeach,
      apply: applyTimelineAction,
      state: timelineControlState,
      examples: timelineExamples,
      smallest: smallestTimelineSpec,
      titles: ["Northstar, 2014 to 2026", "Lumen and Co", "Northline, year by year"],
      meta: ["6 events", "3 events", "4 events"],
    },
    {
      type: "quadrant",
      teach: quadrantTeach,
      apply: applyQuadrantAction,
      state: quadrantControlState,
      examples: quadrantExamples,
      smallest: smallestQuadrantSpec,
      titles: ["Where the quarter goes", "Paper Kite bets", "Where the next build sits"],
      meta: ["7 points", "4 points", "5 points"],
    },
    {
      type: "venn",
      teach: vennTeach,
      apply: applyVennAction,
      state: vennControlState,
      examples: vennExamples,
      smallest: smallestVennSpec,
      titles: ["What customers use together", "Wheel, glaze, kiln", "What notebooks combine"],
      meta: ["3 sets", "3 sets", "3 sets"],
    },
    {
      type: "journey",
      teach: journeyTeach,
      apply: applyJourneyAction,
      state: journeyControlState,
      examples: journeyExamples,
      smallest: smallestJourneySpec,
      titles: ["Checkout", "Paper Kite playtest", "First note"],
      meta: ["9 steps", "5 steps", "6 steps"],
    },
  ] as const;

  for (const item of modules) {
    assert.equal(teachModule(item.type), item.teach);
    assert.equal(item.smallest.type, item.type);
    assert.deepEqual(
      item.teach.controls.map((control) => control.id),
      ["tooltip"],
    );
    assert.equal(item.teach.controls.some((control) => control.id === "legend" || control.id === "size" || control.id === "color"), false);
    assert.deepEqual(
      item.examples.map((example) => example.title),
      [...item.titles],
    );
    assert.deepEqual(
      item.examples.map((example) => example.meta),
      [...item.meta],
    );

    const omitted = structuredClone(item.examples[0]!.spec);
    assert.equal(omitted.tooltip, undefined);
    const before = structuredClone(omitted);
    item.state(omitted);
    assert.deepEqual(omitted, before);
    assert.equal(item.state(omitted).tooltip, "on");
    item.apply(omitted, { id: "tooltip", value: "off" });
    assert.equal(omitted.tooltip, false);
    assert.equal(item.state(omitted).tooltip, "off");
    item.apply(omitted, { id: "tooltip", value: "on", restore: undefined });
    assert.equal("tooltip" in omitted, false);
    assert.equal(omitted.type, item.type);

    const custom = structuredClone(item.examples[0]!.spec);
    const tip = structuredClone(customTip);
    custom.tooltip = structuredClone(tip);
    const opened = openTeachExample(custom);
    assert.deepEqual(opened.tooltip, custom.tooltip);
    assert.notEqual(opened.tooltip, custom.tooltip);
    item.apply(custom, { id: "tooltip", value: "off" });
    assert.equal(custom.tooltip, false);
    item.apply(custom, { id: "tooltip", value: "on", restore: tip });
    assert.deepEqual(custom.tooltip, tip);
    assert.equal(custom.type, item.type);

    for (const example of item.examples) assert.equal(example.spec.type, item.type);
  }

  const quarter = quadrantExamples[0]!.spec.encoding as { size: string; color: string };
  assert.equal(quarter.size, "size");
  assert.equal(quarter.color, "color");
  assert.equal((quadrantExamples[1]!.spec.encoding as { size?: unknown }).size, undefined);
  const northstar = ganttExamples[0]!.spec;
  assert.equal((northstar.size as { width?: number } | undefined)?.width, undefined);
  assert.equal((ganttExamples[1]!.spec.size as { width: number }).width, 880);
  assert.equal(timelineExamples[0]!.title, "Northstar, 2014 to 2026");
});
