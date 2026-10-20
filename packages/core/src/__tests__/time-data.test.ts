/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { bar } from "../charts/bar";
import { line } from "../charts/line";
import { readData } from "../data";
import { attach } from "../interact";
import { createRenderer } from "../render";
import { formatTimeLabel } from "../renderers/cartesian";
import { applyTransforms } from "../transform";
import { repair, validate } from "../validate";

const drawLine = createRenderer([line]);
const drawBar = createRenderer([bar]);

function labels(svg: string): string[] {
  return [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((match) => match[1]);
}

const alt = "Server load across the spring-forward.";

function hourly(zone?: string) {
  const stamps = ["2026-03-08T05:00:00Z", "2026-03-08T06:00:00Z", "2026-03-08T07:00:00Z", "2026-03-08T08:00:00Z"];
  return {
    version: "1",
    type: "line",
    data: stamps.map((t, index) => ({ t, load: 40 + index })),
    encoding: { x: { field: "t", type: "temporal" }, y: "load" },
    timezone: zone,
    size: { width: 640, height: 280 },
    a11y: { alt },
  };
}

describe("timezone", () => {
  it("labels a New York spring-forward without a 2 AM tick and matches a second render", () => {
    const span = 3 * 60 * 60 * 1000;
    const ny = (stamp: string) => formatTimeLabel(Date.parse(stamp), span, "en-US", undefined, "America/New_York");
    expect(ny("2026-03-08T05:00:00Z")).toBe("12:00 AM");
    expect(ny("2026-03-08T06:00:00Z")).toBe("01:00 AM");
    expect(ny("2026-03-08T07:00:00Z")).toBe("03:00 AM");
    expect(ny("2026-03-08T08:00:00Z")).toBe("04:00 AM");
    expect(ny("2026-11-01T05:00:00Z")).toBe("01:00 AM");
    expect(ny("2026-11-01T06:00:00Z")).toBe("01:00 AM");
    expect(formatTimeLabel(Date.parse("2026-03-08T07:00:00Z"), span, "en-US", undefined)).toBe("07:00 AM");

    const spec = hourly("America/New_York");
    const first = drawLine(spec);
    const second = drawLine(spec);
    expect(second).toBe(first);
    const text = labels(first);
    expect(text).toContain("01:00 AM");
    expect(text).toContain("03:00 AM");
    expect(text.join(" ")).not.toContain("02:00 AM");
    expect(labels(drawLine(hourly()))).toEqual(labels(drawLine(hourly("UTC"))));
    expect(labels(drawLine(hourly()))).toContain("07:00 AM");
  });

  it("CK3020 removes an unknown zone and CK3021 warns when x is not temporal", () => {
    const spec = hourly("Mars/Olympus");
    const result = validate(spec);
    expect(result.ok).toBe(false);
    expect(result.errors.find((error) => error.code === "CK3020")?.fix).toEqual([{ op: "remove", path: "/timezone" }]);
    const fixed = repair(spec);
    expect(fixed.ok).toBe(true);
    expect(fixed.spec).not.toHaveProperty("timezone");
    expect(fixed.applied).toEqual([{ op: "remove", path: "/timezone" }]);

    const barSpec = {
      version: "1",
      type: "bar",
      data: [{ lane: "A", n: 1 }],
      encoding: { x: "lane", y: "n" },
      timezone: "America/New_York",
      a11y: { alt: "One lane of load." },
    };
    const unused = validate(barSpec);
    expect(unused.ok).toBe(true);
    expect(unused.warnings.some((warning) => warning.code === "CK3021" && warning.path === "/timezone")).toBe(true);
    const dated = validate(hourly("America/New_York"));
    expect(dated.warnings.some((warning) => warning.code === "CK3021")).toBe(false);
  });

  it("formats the tooltip instant in the spec zone", () => {
    const spec = hourly("America/New_York");
    const host = document.createElement("div");
    host.innerHTML = drawLine(spec);
    document.body.append(host);
    const svg = host.querySelector("svg") as SVGSVGElement;
    const plot = svg.querySelector("clipPath rect");
    const x = Number(plot?.getAttribute("x")) + Number(plot?.getAttribute("width")) * 0.2;
    attach(host, spec, { render: drawLine });
    svg.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: 80, bubbles: true }));
    const tip = host.querySelector("[data-ck-tip]");
    expect(tip?.textContent ?? "").toMatch(/Mar 8/);
    expect(tip?.textContent ?? "").not.toMatch(/07:00/);
    host.remove();
  });
});

describe("sort and transform", () => {
  const rows = [
    { month: "Jan", revenue: 1000, region: "NA" },
    { month: "Feb", revenue: 3000, region: "EU" },
    { month: "Mar", revenue: 1800, region: "NA" },
  ];

  it("sorts a bar by value descending and rejects an unknown field", () => {
    const spec = {
      version: "1",
      type: "bar",
      data: rows,
      encoding: { x: "month", y: "revenue" },
      sort: { by: "value", order: "descending" },
      a11y: { alt: "February leads." },
      size: { width: 420, height: 240 },
    };
    const text = labels(drawBar(spec)).join(" ");
    expect(text.indexOf("Feb")).toBeLessThan(text.indexOf("Mar"));
    expect(text.indexOf("Mar")).toBeLessThan(text.indexOf("Jan"));
    const missing = validate({ ...spec, sort: { field: "nope", order: "ascending" } });
    expect(missing.errors.find((error) => error.code === "CK3022")?.fix).toEqual([{ op: "remove", path: "/sort" }]);
    expect(repair({ ...spec, sort: { field: "nope" } }).spec).not.toHaveProperty("sort");
  });

  it("filters, rolls a mean, and aggregates", () => {
    const base = { version: "1" as const, type: "line" as const, data: rows, encoding: { x: "month", y: "revenue" }, a11y: { alt: "Revenue." }, size: { width: 420, height: 220 } };
    const filtered = labels(drawLine({ ...base, transform: [{ type: "filter", field: "region", eq: "EU" }] })).join(" ");
    expect(filtered).toContain("Feb");
    expect(filtered).not.toContain("Jan");

    const days = Array.from({ length: 10 }, (_, index) => ({ day: `2026-02-${String(index + 1).padStart(2, "0")}`, units: index + 1 }));
    const read = readData(days);
    expect(read.ok).toBe(true);
    if (!read.ok) return;
    const rolled = applyTransforms(read.table, [{ type: "window", field: "units", size: 7, op: "mean", as: "roll" }]);
    expect(rolled.columns.roll[5]).toBeNull();
    expect(rolled.columns.roll[6]).toBe(4);
    expect(rolled.columns.roll[9]).toBe(7);
    const overlay = drawLine({
      version: "1",
      type: "line",
      data: days,
      encoding: { x: { field: "day", type: "temporal" }, y: ["units", "roll"] },
      transform: [{ type: "window", field: "units", size: 7, op: "mean", as: "roll" }],
      a11y: { alt: "Units and a seven-day mean." },
      size: { width: 640, height: 280 },
    });
    expect(overlay.match(/<path /g)?.length ?? 0).toBeGreaterThan(1);

    const source = readData(rows);
    expect(source.ok).toBe(true);
    if (!source.ok) return;
    const groupedTable = applyTransforms(source.table, [{ type: "aggregate", group: "region", op: "sum", field: "revenue", as: "total" }]);
    expect(groupedTable.columns.total[0]).toBe(2800);
    expect(groupedTable.columns.total[1]).toBe(3000);
    const meanTable = applyTransforms(source.table, [{ type: "aggregate", group: "region", op: "mean", field: "revenue", as: "avg" }]);
    expect(meanTable.columns.avg[0]).toBe(1400);
    const countTable = applyTransforms(source.table, [{ type: "aggregate", group: "region", op: "count", as: "n" }]);
    expect(countTable.columns.n[0]).toBe(2);
    expect(countTable.columns.n[1]).toBe(1);
    const grouped = drawBar({
      version: "1",
      type: "bar",
      data: rows,
      encoding: { x: "region", y: "total" },
      transform: [{ type: "aggregate", group: "region", op: "sum", field: "revenue", as: "total" }],
      mark: { labels: true },
      a11y: { alt: "NA and EU totals." },
      size: { width: 420, height: 240 },
    });
    expect(labels(grouped).join(" ")).toContain("2,800");
    const counted = validate({
      version: "1",
      type: "bar",
      data: rows,
      encoding: { x: "region", y: "n" },
      transform: [{ type: "aggregate", group: "region", op: "count", as: "n" }],
      a11y: { alt: "Two regions counted." },
    });
    expect(counted.ok, JSON.stringify(counted.errors)).toBe(true);
    const broken = validate({ ...base, transform: [{ type: "window", field: "missing", size: 7, as: "roll" }] });
    expect(broken.errors.find((error) => error.code === "CK3024")?.fix).toEqual([{ op: "remove", path: "/transform/0" }]);
    const repaired = repair({ ...base, transform: [{ type: "window", field: "missing", size: 7, as: "roll" }] });
    expect((repaired.spec as { transform?: unknown }).transform).toEqual([]);
    expect(repaired.ok).toBe(true);
  });
});
