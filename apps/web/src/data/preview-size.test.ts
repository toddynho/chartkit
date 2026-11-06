import assert from "node:assert/strict";
import test from "node:test";
import { previewSize, readExplicitSize, stripPreviewSize, withPreviewSize } from "./preview-size.ts";

test("quadrant is larger and squarer than the old 380×180 card", () => {
  const box = previewSize("quadrant", "card", {});
  assert.equal(box.width, 720);
  assert.ok((box.height ?? 0) >= 560);
  assert.ok((box.width ?? 0) / (box.height ?? 1) < 1.4);
});

test("sparkline and gauge stay compact", () => {
  const spark = previewSize("sparkline", "card", {});
  const gauge = previewSize("gauge", "card", {});
  assert.ok(spark.width <= 320 && (spark.height ?? 0) <= 80);
  assert.ok(gauge.width <= 320 && (gauge.height ?? 0) <= 220);
});

test("donut preview keeps a spec size and otherwise uses the type default", () => {
  assert.deepEqual(withPreviewSize({ type: "donut", size: { width: 420, height: 340 } }).size, { width: 420, height: 340 });
  assert.deepEqual(withPreviewSize({ type: "donut" }).size, { width: 480, height: 420 });
  assert.deepEqual(withPreviewSize({ type: "donut", theme: "soft" }).theme, "soft");
});

test("an explicit width, height, or aspect ratio wins over the type default", () => {
  assert.deepEqual(previewSize("quadrant", "full", { size: { width: 500, height: 400 } }), { width: 500, height: 400 });
  const ratio = previewSize("scatter", "card", { size: { width: 600, height: "auto", aspectRatio: 2 } });
  assert.equal(ratio.width, 600);
  assert.equal(ratio.height, 300);
});

test("dashboard and full scale only the dimensions the spec did not set", () => {
  const full = previewSize("line", "full", {});
  const card = previewSize("line", "card", {});
  assert.ok(full.width > card.width);
  assert.ok((full.height ?? 0) > (card.height ?? 0));
  const locked = previewSize("line", "full", { size: { width: 400 } });
  assert.equal(locked.width, 400);
  assert.ok((locked.height ?? 0) > (card.height ?? 0));
});

test("streamgraph, density, and tree have stage-sized defaults", () => {
  assert.deepEqual(previewSize("streamgraph", "card", {}), { width: 720, height: 380 });
  assert.deepEqual(previewSize("density", "card", {}), { width: 680, height: 380 });
  assert.deepEqual(previewSize("tree", "card", {}), { width: 720, height: 480 });
  assert.deepEqual(previewSize("streamgraph", "card", { size: { width: 500, height: 240 } }), { width: 500, height: 240 });
});

test("gantt leaves height to the renderer and keeps a min height", () => {
  const box = previewSize("gantt", "card", {});
  assert.equal(box.width, 720);
  assert.equal(box.height, undefined);
  assert.equal(box.minHeight, 280);
});

test("type change can drop inherited size without dropping other size keys", () => {
  const spec: Record<string, unknown> = { size: { width: 380, height: 180, padding: 12 } };
  stripPreviewSize(spec);
  assert.deepEqual(spec.size, { padding: 12 });
  const empty: Record<string, unknown> = { size: { width: 100 } };
  stripPreviewSize(empty);
  assert.equal(empty.size, undefined);
  assert.deepEqual(readExplicitSize({}), {});
});
