// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createRenderer } from "../render";
import { line } from "../charts/line";
import { render } from "../extra";
import { attach } from "../interact";
import { validate } from "../validate";

const alt = "Search is the largest share.";

function pie(mark: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) {
  return {
    version: "1",
    type: "pie",
    data: [
      { label: "Search", value: 42 },
      { label: "Direct", value: 28 },
      { label: "Social", value: 18 },
      { label: "Email", value: 4 },
    ],
    encoding: { x: "label", y: "value" },
    mark,
    a11y: { alt },
    size: { width: 420, height: 280 },
    ...extra,
  };
}

describe("pie", () => {
  it("draws a solid pie, and a donut keeps its hole", () => {
    const solid = render(pie());
    const holed = render({ ...pie(), type: "donut" });
    expect(solid).toContain('data-ck-type="pie"');
    expect(solid).not.toContain(">92<");
    expect(holed).toContain('data-ck-type="donut"');
    expect(holed).toContain(">92<");
    expect(validate(pie()).ok).toBe(true);
  });

  it("honours start angle, pad, sort, other, and explode", () => {
    const base = render(pie());
    const turned = render(pie({ startAngle: 90 }));
    const padded = render(pie({ padAngle: 8 }));
    const sorted = render(pie({ sort: "asc" }));
    const folded = render(pie({ other: { threshold: 0.1, label: "Rest" } }));
    const popped = render(pie({ explode: ["Email"], offset: 16 }));
    expect(turned).not.toBe(base);
    expect(padded).not.toBe(base);
    expect(sorted).not.toBe(base);
    expect(folded).toContain("Rest");
    expect(folded).not.toContain("Email");
    expect(popped).not.toBe(base);
    expect(popped).toContain('data-ck-name="Email"');
  });

  it("draws leader lines on pie and donut outside labels", () => {
    const labeled = render(pie({ labels: true }));
    const donut = render({ ...pie({ labels: true, labelPosition: "outside" }), type: "donut" });
    expect(labeled.match(/<polyline /g)?.length).toBe(4);
    expect(donut.match(/<polyline /g)?.length).toBe(4);
    const radius = Number(labeled.match(/A ([\d.]+) [\d.]+/)?.[1]);
    expect(radius).toBeGreaterThan(40);
    const placed = [...labeled.matchAll(/<text x="[^"]+" y="([^"]+)" text-anchor="(start|end)" dominant-baseline="middle"/g)];
    const bySide = new Map<string, number[]>();
    for (const row of placed) {
      const side = row[2] ?? "";
      const list = bySide.get(side) ?? [];
      list.push(Number(row[1]));
      bySide.set(side, list);
    }
    expect(bySide.get("start")?.length).toBeGreaterThan(0);
    expect(bySide.get("end")?.length).toBeGreaterThan(0);
    for (const list of bySide.values()) expect(new Set(list.map((y) => Math.round(y))).size).toBe(list.length);
    const lines = [...labeled.matchAll(/<polyline points="([^"]+)"/g)];
    expect(lines.length).toBe(4);
    for (const line of lines) {
      const points = (line[1] ?? "").split(" ").map((pair) => pair.split(",").map(Number));
      const first = points[0];
      expect(first).toBeTruthy();
      for (const point of points.slice(1)) {
        const span = Math.hypot((point[0] ?? 0) - (first?.[0] ?? 0), (point[1] ?? 0) - (first?.[1] ?? 0));
        expect(span).toBeLessThan(48);
      }
    }
  });

  it("nudges an exploded slice a few pixels along its bisector", () => {
    const popped = render(pie({ explode: ["Email"], offset: 8 }));
    const centers = [...popped.matchAll(/<path d="M ([\d.]+) ([\d.]+)[^"]*"[^>]* data-ck-name="([^"]+)"/g)].map((row) => ({
      x: Number(row[1]),
      y: Number(row[2]),
      name: row[3],
    }));
    const email = centers.find((item) => item.name === "Email");
    const home = centers.find((item) => item.name === "Search");
    expect(email && home).toBeTruthy();
    const distance = Math.hypot((email?.x ?? 0) - (home?.x ?? 0), (email?.y ?? 0) - (home?.y ?? 0));
    expect(distance).toBeGreaterThan(6);
    expect(distance).toBeLessThan(12);
  });

  it("folds small slices into Other and paints shared rule colours with a seam", () => {
    const folded = render(pie({ sort: "desc", other: { threshold: 0.1, label: "Other" }, labels: true }));
    expect(folded).toContain(">Other<");
    expect(folded).not.toContain(">Email<");
    const rules = { colorRules: [{ color: "accent", gt: 30 }, { color: "negative", lt: 10 }] };
    const data = [
      { label: "Search", value: 42 },
      { label: "Direct", value: 28 },
      { label: "Social", value: 18 },
      { label: "Email", value: 4 },
      { label: "Ads", value: 3 },
    ];
    const ruled = render({ ...pie(rules), data });
    const midnight = render({ ...pie(rules), data, theme: "midnight" });
    for (const svg of [ruled, midnight]) {
      expect(svg).toContain("var(--ck-accent");
      expect(svg).toContain("var(--ck-negative");
      expect(svg).toContain("var(--ck-series-2");
      expect(svg).toContain('stroke="var(--ck-background');
    }
  });
});

describe("colour", () => {
  const rows = [
    { month: "Jan", revenue: 1000, cost: -200, region: "NA" },
    { month: "Feb", revenue: 3000, cost: 400, region: "EU" },
    { month: "Mar", revenue: 1800, cost: 100, region: "NA" },
  ];

  it("colours bars, line points, scatter, and slices from rules, a field, and a palette", () => {
    const rules = [{ color: "negative", test: "negative" as const }, { color: "accent", gt: 2000 }];
    const bars = render({
      version: "1",
      type: "bar",
      data: rows,
      encoding: { x: "month", y: "cost" },
      mark: { colorRules: rules },
      a11y: { alt: "January cost is negative." },
      size: { width: 420, height: 220 },
    });
    expect(bars).toContain("var(--ck-negative");
    expect(bars).toContain('data-ck-i="0"');
    const lineSvg = render({
      version: "1",
      type: "line",
      data: rows,
      encoding: { x: "month", y: "revenue" },
      mark: { colorRules: [{ color: "#c026d3", gt: 2000 }], palette: ["#111111", "#222222"] },
      a11y: { alt: "February revenue is above the line." },
      size: { width: 420, height: 220 },
    });
    expect(lineSvg).toContain('stroke="#111111"');
    expect(lineSvg).not.toContain("--ck-series-");
    expect(lineSvg).toContain("#c026d3");
    const dots = render({
      version: "1",
      type: "scatter",
      data: rows,
      encoding: { x: "revenue", y: "cost", color: { field: "region", domain: ["EU", "NA"], range: ["#0ea5e9", "#f59e0b"] } },
      a11y: { alt: "NA and EU sit apart." },
      size: { width: 420, height: 220 },
    });
    expect(dots).toContain("#f59e0b");
    expect(dots).toContain("#0ea5e9");
    const slices = render({
      ...pie(),
      encoding: { x: "label", y: "value", color: { field: "label", range: ["#111111", "#222222", "#333333", "#444444"] } },
      mark: { colorRules: [{ color: "accent", gt: 40 }] },
    });
    expect(slices).toContain("var(--ck-accent");
    expect(slices).toContain("#222222");
  });

  it("keeps the small line renderer and colours its points", () => {
    const draw = createRenderer([line]);
    const spec = {
      version: "1",
      type: "line",
      data: rows,
      encoding: { x: "month", y: "revenue" },
      mark: { palette: ["#0f766e"], colorRules: [{ color: "#b45309", gt: 2000 }] },
      a11y: { alt: "February is the high month." },
      size: { width: 420, height: 220 },
    };
    const svg = draw(spec);
    expect(svg).toContain('data-ck-type="line"');
    expect(svg).not.toContain("ck-chart-error");
    expect(svg).toContain("#0f766e");
    expect(svg).toContain("#b45309");
    expect(draw({ ...spec, type: "pie" })).toContain("ck-chart-error");
  });

  it("uses the resolved colour in the legend, tooltip, and click", () => {
    const spec = {
      ...pie({ colorRules: [{ color: "#be123c", gt: 30 }] }),
      legend: { position: "bottom" as const },
    };
    const markup = render(spec);
    const host = document.createElement("div");
    host.innerHTML = markup;
    document.body.append(host);
    const clicks: { color?: string; series?: string }[] = [];
    host.addEventListener("seriesclick", ((event: CustomEvent) => clicks.push(event.detail)) as EventListener);
    const handle = attach(host, spec, { render: () => markup });
    const path = host.querySelector('path[data-ck-name="Search"]');
    expect(path?.getAttribute("fill")).toBe("#be123c");
    const swatch = [...host.querySelectorAll("rect")].find((node) => node.getAttribute("fill") === "#be123c");
    expect(swatch).toBeTruthy();
    path?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(clicks[0]).toMatchObject({ series: "Search", color: "#be123c" });
    path?.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 40, clientY: 40 }));
    expect(host.querySelector(".ck-tip i")?.getAttribute("style")).toContain("#be123c");
    handle.destroy();
    host.remove();
  });
});
