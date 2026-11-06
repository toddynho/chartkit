import assert from "node:assert/strict";
import test from "node:test";
import { checkSvg } from "./geometry.mjs";
import { loadRuntime } from "./load.mjs";

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);
const GEO = new Set(["choropleth", "map-points"]);

test("switching between every pair of type families validates and renders", async () => {
  const runtime = await loadRuntime();
  const examples = runtime.galleryExamples.map((item) => ({ type: item.type, spec: item.spec }));
  const failures = [];

  for (const source of runtime.TYPE_FAMILIES) {
    for (const target of runtime.TYPE_FAMILIES) {
      const spec = sourceSpec(runtime, examples, source);
      const nextType = target.types[0];
      const label = `${source.id} -> ${target.id} (${spec.type} -> ${nextType})`;
      try {
        const next = runtime.switchChartType(spec, nextType, examples, { fromType: spec.type });
        await assertChart(runtime, next, label, failures);
      } catch (error) {
        failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  for (const family of runtime.TYPE_FAMILIES) {
    for (const fromType of family.types) {
      for (const nextType of family.types) {
        if (fromType === nextType) continue;
        const spec = runtime.firstSpec(fromType, examples);
        assert.ok(spec, `missing example for ${fromType}`);
        const label = `${family.id} ${fromType} -> ${nextType}`;
        try {
          const next = runtime.switchChartType(spec, nextType, examples, { fromType });
          await assertChart(runtime, next, label, failures);
          if (keptRows(spec, next)) assertLabels(spec, next, label, failures);
        } catch (error) {
          failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  }

  assert.equal(failures.length, 0, failures.slice(0, 24).join("\n"));
});

test("bar keeps its categories for bar-list and loads a sankey example otherwise", async () => {
  const runtime = await loadRuntime();
  const examples = runtime.galleryExamples.map((item) => ({ type: item.type, spec: item.spec }));
  const bar = runtime.firstSpec("bar", examples);
  const listed = runtime.switchChartType(bar, "bar-list", examples, { fromType: "bar" });
  assert.equal(listed.type, "bar-list");
  assert.deepEqual(listed.data, bar.data);
  assert.equal(listed.encoding.x, bar.encoding.x);
  assert.equal(listed.data[0].month, "Jan");
  assert.equal(listed.mark?.orientation, undefined);

  const lined = runtime.switchChartType(bar, "line", examples, { fromType: "bar" });
  assert.deepEqual(lined.data, bar.data);
  assert.equal(lined.encoding.y, "signups");

  const flowed = runtime.switchChartType(bar, "sankey", examples, { fromType: "bar" });
  assert.equal(flowed.type, "sankey");
  assert.notDeepEqual(flowed.data, bar.data);
  assert.equal(typeof flowed.encoding.source, "string");
  assert.ok(flowed.data.some((row) => row.from === "Mill"));

  const wide = {
    version: "1",
    type: "bar",
    title: "Northstar launch window",
    data: [
      { region: "Northstar launch window label", revenue: 12 },
      { region: "South", revenue: 4 },
    ],
    encoding: { x: "region", y: "revenue" },
    mark: { orientation: "horizontal" },
    a11y: { alt: "Northstar launch window label leads South." },
  };
  for (const nextType of ["bar-list", "line", "pie", "donut", "funnel", "stacked-area"]) {
    const next = runtime.switchChartType(wide, nextType, examples, { fromType: "bar" });
    assert.equal(next.data[0].region, "Northstar launch window label", nextType);
    assert.equal(next.data[1].region, "South", nextType);
    assert.equal(next.a11y.alt, wide.a11y.alt, nextType);
    assert.equal(next.title, wide.title, nextType);
  }

  const sized = runtime.switchChartType(bar, "sankey", examples, { fromType: "bar", keepSize: true });
  assert.equal(sized.size.width, bar.size.width);
  assert.equal(sized.size.height, bar.size.height);
  const fresh = runtime.switchChartType({ ...bar, size: { width: 640, height: 320 } }, "gauge", examples, { fromType: "bar" });
  assert.equal(fresh.size, undefined);
  assert.equal(fresh.type, "gauge");
  assert.equal(typeof fresh.metric.value, "number");
});

test("strip and box plot trade the group and the value without renaming them", async () => {
  const runtime = await loadRuntime();
  const examples = runtime.galleryExamples.map((item) => ({ type: item.type, spec: item.spec }));
  const box = runtime.firstSpec("boxplot", examples);
  const strip = runtime.switchChartType(box, "strip", examples, { fromType: "boxplot" });
  assert.equal(strip.encoding.y, box.encoding.x);
  assert.equal(strip.encoding.x, box.encoding.y);
  assert.deepEqual(strip.data, box.data);
  const back = runtime.switchChartType(strip, "boxplot", examples, { fromType: "strip" });
  assert.equal(back.encoding.x, box.encoding.x);
  assert.equal(back.encoding.y, box.encoding.y);
});

function sourceSpec(runtime, examples, family) {
  for (const type of family.types) {
    const spec = runtime.firstSpec(type, examples);
    if (spec) return spec;
  }
  throw new Error(`no spec for family ${family.id}`);
}

async function assertChart(runtime, spec, label, failures) {
  const type = spec.type;
  const result = GEO.has(type) ? runtime.validateGeo(spec) : PHASE4.has(type) ? runtime.validatePhase4(spec) : runtime.validate(spec);
  if (!result.ok) {
    const message = (result.errors ?? []).map((item) => `${item.code} ${item.path} ${item.message}`).join("; ");
    failures.push(`${label} invalid: ${message}`);
    return;
  }
  let svg = "";
  try {
    if (GEO.has(type)) svg = await runtime.renderGeo(spec);
    else if (type === "bar-list") svg = runtime.renderBarList(spec) ?? "";
    else svg = runtime.render(spec);
  } catch (error) {
    failures.push(`${label} threw: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }
  if (!svg.includes("<svg") || svg.includes("ck-chart-error")) {
    failures.push(`${label} did not render`);
    return;
  }
  const findings = checkSvg(svg, spec).filter((item) => item.check === "empty-chart" || item.check === "bad-number" || item.check === "render-exception");
  if (findings.length) failures.push(`${label} ${findings.map((item) => item.check).join(",")}: ${findings[0].detail}`);
}

function keptRows(source, next) {
  return Array.isArray(source.data) && source.data.every((row) => row && typeof row === "object") && Array.isArray(next.data);
}

function assertLabels(source, next, label, failures) {
  if (!keptRows(source, next)) return;
  if (JSON.stringify(source.data) !== JSON.stringify(next.data)) return;
  const strings = [];
  for (const row of source.data) {
    for (const value of Object.values(row)) if (typeof value === "string") strings.push(value);
  }
  const rendered = JSON.stringify(next.data);
  for (const value of strings) {
    if (!rendered.includes(JSON.stringify(value))) failures.push(`${label} lost label ${value}`);
  }
}
