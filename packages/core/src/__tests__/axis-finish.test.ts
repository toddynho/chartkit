// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { line } from "../charts/line";
import { render } from "../extra";
import { attach, patchSvg } from "../interact";
import { createRenderer } from "../render";
import { repair, validate } from "../validate";

const alt = "Revenue rose from January to March.";

function spec(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    version: "1",
    type: "line",
    data: [
      { month: "Jan", revenue: 10, other: 4 },
      { month: "Feb", revenue: 14, other: 6 },
      { month: "Mar", revenue: 9, other: 5 },
    ],
    encoding: { x: "month", y: [{ field: "revenue" }, { field: "other", axis: "y2" }] },
    axes: { y2: true },
    a11y: { alt },
    size: { width: 420, height: 240 },
    ...extra,
  };
}

function attr(svg: string, title: string, name: "x" | "y"): string {
  const hit = svg.match(new RegExp(`<text ([^>]*)>${title}</text>`));
  const found = hit?.[1]?.match(new RegExp(`${name}="([^"]+)"`));
  return found?.[1] ?? "";
}

describe("axis finishing", () => {
  const draw = createRenderer([line]);

  it("keeps a time axis on a line-and-area combo and can label only the ends", () => {
    const days = ["2025-10-01", "2025-10-02", "2025-10-03", "2025-10-04"];
    const ticks = [Date.parse("2025-10-01T00:00:00Z"), Date.parse("2025-10-04T00:00:00Z")];
    const svg = render({
      version: "1",
      type: "combo",
      data: days.map((date, index) => ({ date, gross: 10 + index, prior: 8 + index })),
      encoding: {
        x: { field: "date", type: "temporal" },
        y: [
          { field: "gross", mark: "area" },
          { field: "prior", mark: "line", dash: "dashed" },
        ],
      },
      axes: { x: { ticks }, y: { title: "", labels: false, grid: false } },
      legend: { show: false },
      a11y: { alt },
      size: { width: 420, height: 220 },
    });
    expect(svg).toContain("Oct");
    expect(svg).not.toContain(">This period<");
    const labels = [...svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((match) => match[1]);
    expect(labels.filter((label) => label.includes("Oct"))).toHaveLength(2);
  });

  it("treats an empty axis title as hidden and still copies a missing title from the series", () => {
    const hidden = draw({
      ...spec({ legend: { show: false }, axes: { y: { title: "" }, y2: false } }),
      encoding: { x: "month", y: { field: "revenue", title: "This period" } },
    });
    expect(hidden).not.toContain(">This period<");
    const copied = draw({
      ...spec({ legend: { show: false }, axes: { y2: false } }),
      encoding: { x: "month", y: { field: "revenue", title: "This period" } },
    });
    expect(copied).toContain(">This period<");
  });

  it("places titles, rotates y, wraps ticks, draws the baseline, and marks ticks on x, y, and y2", () => {
    const shared = {
      titlePosition: "start" as const,
      titleRotate: 0,
      labelWidth: 40,
      labelLines: 2,
      line: { show: true, dash: "dashed", width: 2 },
      tickMarks: "outside" as const,
      tickLength: 8,
    };
    const chart = spec({
      data: [
        { month: "North warehouse lane", revenue: 10, other: 4 },
        { month: "South warehouse lane", revenue: 14, other: 6 },
        { month: "East warehouse lane", revenue: 9, other: 5 },
      ],
      axes: {
        x: { title: "Month", ...shared, titlePosition: "end" },
        y: { title: "Revenue", ...shared, titlePosition: "start" },
        y2: { title: "Other", ...shared, titlePosition: "end", titleRotate: 0 },
      },
    });
    const full = render(chart);
    const small = draw(chart);
    for (const svg of [full, small]) {
      expect(svg).toBeTruthy();
      expect(attr(svg!, "Month", "x")).not.toBe("");
      expect(svg).toContain('text-anchor="end"');
      expect(svg).toContain("<tspan");
      expect(svg).toMatch(/data-ck-axis="line"[^>]*stroke-dasharray="4 3"/);
      expect(svg).toContain('stroke-width="2"');
      expect((svg!.match(/<line /g) ?? []).length).toBeGreaterThan(4);
    }
    const off = draw(spec());
    expect(off).not.toContain('data-ck-axis="line"');
    const inside = draw(spec({ axes: { x: { tickMarks: "inside", tickLength: 6 }, y: { tickMarks: "none" }, y2: { tickMarks: "outside", tickLength: 5 } } }));
    expect(inside).not.toBe(off);
    const yOf = (at: string) => Number(attr(draw(spec({ axes: { y: { title: "Revenue", titlePosition: at }, y2: { title: "Other", titlePosition: at } } }))!, "Revenue", "y"));
    expect(yOf("start")).toBeGreaterThan(yOf("center"));
    expect(yOf("center")).toBeGreaterThan(yOf("end"));
    const center = Number(attr(draw(spec({ axes: { x: { title: "Month", titlePosition: "center" }, y2: true } }))!, "Month", "x"));
    const end = Number(attr(draw(spec({ axes: { x: { title: "Month", titlePosition: "end" }, y2: true } }))!, "Month", "x"));
    const start = Number(attr(draw(spec({ axes: { x: { title: "Month", titlePosition: "start" }, y2: true } }))!, "Month", "x"));
    expect(start).toBeLessThan(center);
    expect(center).toBeLessThan(end);
    const spun = draw(spec({ axes: { y: { title: "Revenue", titleRotate: 12 }, y2: { title: "Other", titleRotate: -12 } } }));
    expect(spun).toContain("rotate(12");
    expect(spun).toContain("rotate(-12");
  });

  it("skips crowded ticks unless autoSkip is false", () => {
    const data = Array.from({ length: 8 }, (_, index) => ({ month: `Warehouse ${index + 1} north`, revenue: 80 + index * 20 }));
    const body = {
      version: "1",
      type: "line",
      data,
      encoding: { x: "month", y: "revenue" },
      a11y: { alt },
      size: { width: 280, height: 150 },
    };
    const skipped = draw({ ...body, axes: { x: { autoSkip: true }, y: { ticks: 14, autoSkip: true } } });
    const every = draw({ ...body, axes: { x: { autoSkip: false }, y: { ticks: 14, autoSkip: false } } });
    const xSkip = skipped?.match(/Warehouse/g)?.length ?? 0;
    const xAll = every?.match(/Warehouse/g)?.length ?? 0;
    expect(xSkip).toBeGreaterThan(0);
    expect(xSkip).toBeLessThan(xAll);
    expect(xAll).toBe(8);
    expect((every?.match(/<text /g) ?? []).length).toBeGreaterThan((skipped?.match(/<text /g) ?? []).length);
  });

  it("repairs titleAnchor and tickSize onto the axis fields", () => {
    const broken = spec({ axes: { x: { titleAnchor: "middle", tickSize: 6 }, y2: true } });
    const result = validate(broken);
    expect(result.ok).toBe(false);
    const fixed = repair(broken);
    expect(fixed.ok).toBe(true);
    const axes = (fixed.spec as { axes: { x: { titlePosition: string; tickLength: number } } }).axes.x;
    expect(axes.titlePosition).toBe("center");
    expect(axes.tickLength).toBe(6);
  });
});

describe("sankey cycles", () => {
  it("keeps a cycle out of the last column and draws the back edge as a return link", () => {
    const svg = render({
      version: "1",
      type: "sankey",
      data: [
        { source: "Lantern", target: "Quay", value: 4 },
        { source: "Quay", target: "Lantern", value: 2 },
        { source: "Lantern", target: "Market", value: 3 },
        { source: "Market", target: "Quay", value: 1 },
      ],
      encoding: { source: "source", target: "target", y: "value" },
      a11y: { alt: "Lantern and Quay trade flow, and both reach the market." },
      size: { width: 640, height: 360 },
    });
    expect(svg).toContain('data-ck-return="1"');
    expect(svg).toContain("Quay → Lantern");
    const ribbon = svg?.match(/d="([^"]+)"[^>]*data-ck-return="1"/)?.[1] ?? "";
    const coords = ribbon.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    const ys = coords.filter((_, index) => index % 2 === 1);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(8);
    const xs = [...(svg ?? "").matchAll(/data-ck-mark="node"/g)].map((hit) => {
      const tag = (svg ?? "").slice(Math.max(0, hit.index! - 360), hit.index);
      return Number(tag.match(/x="([^"]+)"/)?.[1]);
    });
    expect(xs.length).toBe(3);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(40);
  });
});

describe("named extra marks", () => {
  it("selects sankey nodes and links and shows a waterfall tooltip", () => {
    const sankey = {
      version: "1",
      type: "sankey",
      data: [
        { source: "Lantern", target: "Quay", value: 4 },
        { source: "Quay", target: "Lantern", value: 2 },
      ],
      encoding: { source: "source", target: "target", y: "value" },
      a11y: { alt: "Lantern and Quay exchange flow." },
      interaction: { select: "point" },
    };
    const host = document.createElement("div");
    document.body.append(host);
    patchSvg(host, render(sankey)!);
    const clicks: { series: string; index: number }[] = [];
    host.addEventListener("pointclick", ((event: CustomEvent) => clicks.push(event.detail)) as EventListener);
    const ctl = attach(host, sankey, { render });
    host.querySelector('[data-ck-name="Lantern"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    host.querySelector('[data-ck-name="Quay → Lantern"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(clicks.map((item) => item.series)).toEqual(["Lantern", "Quay → Lantern"]);
    ctl.destroy();
    host.remove();

    const water = {
      version: "1",
      type: "waterfall",
      data: [
        { step: "Open", amount: 10, total: true },
        { step: "Add", amount: 4 },
        { step: "End", amount: 14, total: true },
      ],
      encoding: { x: "step", y: "amount" },
      mark: { total: "total" },
      a11y: { alt: "The total ends at 14 after one gain." },
      interaction: { select: "point" },
    };
    const card = document.createElement("div");
    document.body.append(card);
    patchSvg(card, render(water)!);
    const bars: { series: string }[] = [];
    card.addEventListener("pointclick", ((event: CustomEvent) => bars.push(event.detail)) as EventListener);
    const waterCtl = attach(card, water, { render });
    const bar = card.querySelector('[data-ck-name="Add"]');
    expect(bar).toBeTruthy();
    bar?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(bars[0]?.series).toBe("Add");
    bar?.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 80, clientY: 40 }));
    const tip = card.querySelector("[data-ck-tip]");
    expect(tip?.textContent).toContain("Add");
    expect(tip?.textContent).toContain("4");
    waterCtl.destroy();
    card.remove();
  });
});
