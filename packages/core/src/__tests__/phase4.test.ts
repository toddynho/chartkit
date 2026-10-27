// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render as renderAll } from "../all";
import { render } from "../extra";
import { distanceFor, intersectionArea, lensCenter, regionCenter, regionMargin } from "../renderers/extra/venn";
import { repairPhase4, validatePhase4 } from "../validate-phase4";
import { validate, validateAsync } from "../validate";

const examples = join(dirname(fileURLToPath(import.meta.url)), "../../examples");
const phase4 = ["24-gantt.json", "25-timeline.json", "26-quadrant.json", "27-venn.json", "28-journey.json"];

function load(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(examples, name), "utf8")) as Record<string, unknown>;
}

describe("phase 4 charts", () => {
  for (const name of phase4) {
    it(`${name} validates, repeats, and draws a Soft SVG`, () => {
      const spec = load(name);
      const result = validatePhase4(spec);
      expect(result.errors, JSON.stringify(result.errors)).toEqual([]);
      const svg = render(spec);
      expect(render(spec)).toBe(svg);
      expect(svg).not.toContain("ck-chart-error");
      expect(svg).not.toContain("NaN");
      expect(svg).toContain(`data-ck-type="${spec.type}"`);
      expect(svg).toContain("var(--ck-");
      expect(svg).toContain("light-dark(");
      expect(svg).not.toMatch(/\b(window|document|Math\.random|Date\.now)\b/);
      const miss = renderAll(spec);
      expect(miss).toContain("CK1010");
      expect(miss).toContain(`@chartkitdev/core/charts/${spec.type}`);
      expect(miss).toContain("@chartkitdev/core/extra");
      expect(miss).not.toContain("@chartkitdev/core/all");
    });
  }

  it("draws the gantt marks", () => {
    const svg = render(load("24-gantt.json"));
    expect(svg).toContain('data-ck-mark="milestone"');
    expect(svg).toContain('data-ck-mark="dependency"');
    expect(svg).toContain('data-ck-mark="today"');
    expect(svg).toContain("Today");
    expect(svg).toContain("var(--ck-positive");
    expect(svg).toContain("var(--ck-negative");
    expect(svg).toContain("Write the spec");
    expect(svg.match(/data-ck-mark="bar"/g)?.length).toBe(6);
  });

  it("draws the timeline with eras and both label sides", () => {
    const svg = render(load("25-timeline.json"));
    expect(svg.match(/data-ck-mark="period"/g)?.length).toBe(3);
    expect(svg.match(/data-ck-mark="event"/g)?.length).toBe(6);
    expect(svg).toContain("Series A");
    expect(svg).toContain("ChartKit");
  });

  it("draws four quadrants and sized points", () => {
    const svg = render(load("26-quadrant.json"));
    expect(svg.match(/data-ck-mark="quadrant"/g)?.length).toBe(4);
    expect(svg.match(/data-ck-mark="point"/g)?.length).toBe(7);
    expect(svg).toContain("Quick wins");
    expect(svg).toContain("Effort against impact");
    expect(svg).toContain("Low effort");
    expect(svg).toContain("High impact");
    expect(svg).toContain('r="18"');
  });

  it("draws a 2-set venn in proportion and says when 3 sets are approximate", () => {
    const pair = render({
      version: "1",
      type: "venn",
      data: [
        { set: "Search", size: 100 },
        { set: "Filters", size: 25 },
        { set: "Search+Filters", size: 10 },
      ],
      encoding: { x: "set", y: "size" },
      a11y: { alt: "Search is the larger set." },
    });
    const radii = [...pair.matchAll(/<circle\b[^>]*>/g)]
      .map((match) => match[0])
      .filter((tag) => tag.includes('data-ck-mark="set"'))
      .map((tag) => Number(/r="([0-9.]+)"/.exec(tag)?.[1]));
    expect(radii).toHaveLength(2);
    expect(radii[0] / radii[1]).toBeCloseTo(2, 1);
    expect(pair).not.toContain("approximate");
    const trio = render(load("27-venn.json"));
    expect(trio.match(/data-ck-mark="set"/g)?.length).toBe(3);
    expect(trio).toContain("3-set areas are approximate");
    expect(trio).toContain("90");
  });

  it("centers venn counts in the overlap they describe", () => {
    const pair = render({
      version: "1",
      type: "venn",
      data: [
        { set: "Search", size: 100 },
        { set: "Filters", size: 25 },
        { set: "Search+Filters", size: 10 },
      ],
      encoding: { x: "set", y: "size" },
      a11y: { alt: "Search is the larger set." },
    });
    const pairCircles = readCircles(pair);
    const pairLabel = readOverlaps(pair)[0];
    expect(pairLabel?.text).toBe("10");
    expect(pairLabel?.middle).toBe(true);
    for (const circle of pairCircles) expect(distance(pairLabel, circle)).toBeLessThan(circle.r - 8);
    const smaller = pairCircles[0].r < pairCircles[1].r ? pairCircles[0] : pairCircles[1];
    const midX = (pairCircles[0].x + pairCircles[1].x) / 2;
    expect(Math.abs(pairLabel.x - smaller.x)).toBeLessThan(Math.abs(midX - smaller.x) - 4);

    const trio = render(load("27-venn.json"));
    const circles = readCircles(trio);
    const labels = readOverlaps(trio);
    expect(labels.map((label) => label.text)).toEqual(["410", "220", "140", "90"]);
    expect(labels.every((label) => label.middle)).toBe(true);
    for (const label of labels) {
      const inside = circles.filter((circle) => label.sets.includes(circle.name));
      const outside = circles.filter((circle) => !label.sets.includes(circle.name));
      expect(inside).toHaveLength(label.sets.length);
      for (const circle of inside) expect(distance(label, circle)).toBeLessThan(circle.r - 8);
      for (const circle of outside) expect(distance(label, circle)).toBeGreaterThan(circle.r + 6);
    }
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) expect(distance(labels[i], labels[j])).toBeGreaterThan(28);
    }
    const names = readNames(trio);
    expect(names.map((label) => label.text).sort()).toEqual(["Filters", "Saved views", "Search"]);
    for (const label of names) {
      const own = circles.find((circle) => circle.name === label.text);
      expect(own).toBeTruthy();
      expect(boxClearsCircle(label, own!, 4)).toBe(true);
      for (const count of labels) expect(boxesHit(label, count)).toBe(false);
    }
  });

  it("finds the visual center of a lens and of a three-circle region", () => {
    const wide = { x: 0, y: 0, r: 10 };
    const narrow = { x: 12, y: 0, r: 6 };
    const lens = lensCenter(wide, narrow);
    expect(lens).toEqual({ x: 8, y: 0 });
    expect(regionMargin(lens, [wide, narrow], [])).toBeCloseTo(2, 5);

    const circles = [
      { x: 0, y: 0, r: 6 },
      { x: 6, y: 0, r: 6 },
      { x: 3, y: 5.2, r: 6 },
    ];
    expect(nearBest(regionCenter(circles, []), circles, [])).toBe(true);
    const exclusive = [circles[0], circles[1]];
    const cut = [circles[2]];
    const pair = regionCenter(exclusive, cut);
    expect(nearBest(pair, exclusive, cut)).toBe(true);
    expect(regionMargin(pair, exclusive, cut)).toBeGreaterThan(0.4);
    expect(pair.y).toBeLessThan(-0.2);
  });

  it("keeps two-circle overlap close to the requested area", () => {
    const distance = distanceFor(10, 8, 40);
    expect(intersectionArea(10, 8, distance)).toBeCloseTo(40, 0);
  });

  it("draws a journey face for each score and actor chips", () => {
    const svg = render(load("28-journey.json"));
    expect(svg.match(/data-ck-mark="face"/g)?.length).toBe(9);
    expect(svg).toContain('data-ck-mark="actor"');
    expect(svg).toContain("Fix a declined card");
    expect(svg).toContain("Payments");
    expect(svg).toContain("var(--ck-negative");
    expect(svg).toContain("var(--ck-positive");
  });

  it("refuses a fourth venn set and repairs it away", () => {
    const spec = {
      version: "1",
      type: "venn",
      data: [
        { set: "Search", size: 10 },
        { set: "Filters", size: 8 },
        { set: "Sort", size: 6 },
        { set: "Notify", size: 4 },
      ],
      encoding: { x: "set", y: "size" },
      a11y: { alt: "Four features is too many for one venn." },
    };
    const result = validatePhase4(spec);
    const error = result.errors.find((item) => item.code === "CK1407");
    expect(error?.hint).toContain("split");
    expect(error?.fix?.[0]).toMatchObject({ op: "remove" });
    const svg = render(spec);
    expect(svg).toContain("ck-chart-error");
    expect(svg).toContain("Notify");
    const repaired = repairPhase4(spec);
    expect(repaired.ok, JSON.stringify(repaired.errors)).toBe(true);
    expect((repaired.spec as { data: { set: string }[] }).data.some((row) => row.set === "Notify")).toBe(false);
  });

  it("repairs gantt, timeline, quadrant, and journey with JSON Patch", () => {
    const gantt = repairPhase4({
      version: "1",
      type: "gantt-chart",
      data: [
        { id: "spec", task: "Spec", section: "Plan", start: "2026-03-13", end: "2026-03-02", status: "done" },
        { id: "ship", task: "Ship", section: "Launch", start: "2026-04-06", milestone: true, status: "crit", depends: "missing" },
      ],
      encoding: { x: "task", y: "section", open: "start", close: "end", color: "status", source: "id", target: "depends" },
      a11y: { alt: "Ship follows the spec." },
    });
    expect(gantt.ok, JSON.stringify(gantt.errors)).toBe(true);
    expect((gantt.spec as { type: string }).type).toBe("gantt");
    const rows = (gantt.spec as { data: { start: string; end?: string; depends?: string }[] }).data;
    expect(rows[0].start < (rows[0].end ?? "")).toBe(true);
    expect(rows[1].depends).toBe("");

    const timeline = repairPhase4({
      version: "1",
      type: "timeline",
      data: [
        { label: "Founded", date: "2014-04-02" },
        { label: "Series A", kind: "period", start: "2019-01-01", end: "2016-01-01" },
      ],
      encoding: { x: "label" },
      a11y: { alt: "The company started in 2014." },
    });
    expect(timeline.ok, JSON.stringify(timeline.errors)).toBe(true);
    const period = (timeline.spec as { data: { start: string; end: string }[] }).data[1];
    expect(period.start < period.end).toBe(true);

    const quadrant = repairPhase4({
      version: "1",
      type: "quadrant",
      data: [{ name: "SSO", x: 1.4, y: -0.2 }],
      encoding: { x: "x", y: "y" },
      a11y: { alt: "SSO sits outside the default square." },
    });
    expect(quadrant.ok, JSON.stringify(quadrant.errors)).toBe(true);
    expect((quadrant.spec as { data: { x: number; y: number }[] }).data[0]).toEqual({ name: "SSO", x: 1, y: 0 });

    const named = repairPhase4({
      version: "1",
      type: "quadrant",
      subtitle: "Quick wins|Big bets|Fill-ins|Thankless",
      data: [{ name: "SSO", x: 0.2, y: 0.8 }],
      encoding: { x: "x", y: "y" },
      a11y: { alt: "SSO is a quick win." },
    });
    expect(named.ok, JSON.stringify(named.errors)).toBe(true);
    expect(named.spec).toMatchObject({
      quadrants: ["Quick wins", "Big bets", "Fill-ins", "Thankless"],
    });
    expect((named.spec as { subtitle?: string }).subtitle).toBeUndefined();

    const journey = repairPhase4({
      version: "1",
      type: "user-journey",
      data: [{ step: "Enter the card", score: 9, actors: "Shopper" }],
      encoding: { x: "step", y: "score", color: "actors" },
      a11y: { alt: "Entering a card is painful." },
    });
    expect(journey.ok, JSON.stringify(journey.errors)).toBe(true);
    expect((journey.spec as { type: string; data: { score: number; section: string }[] }).type).toBe("journey");
    expect((journey.spec as { data: { score: number; section: string }[] }).data[0]).toMatchObject({ score: 5, section: "Journey" });
  });

  it("still requires alt text through the phase-4 validator", () => {
    const spec = load("28-journey.json");
    delete (spec.a11y as { alt?: string }).alt;
    const result = validatePhase4(spec);
    expect(result.errors.some((error) => error.code === "CK1004")).toBe(true);
    expect(validate(spec).errors.some((error) => error.code === "CK1005")).toBe(false);
    expect(validate(spec).errors.some((error) => error.code === "CK1004")).toBe(true);
  });

  it("accepts the five types in validate() and checks fields in validateAsync()", async () => {
    const spec = load("24-gantt.json");
    const sync = validate(spec);
    expect(sync.ok).toBe(true);
    expect(sync.errors.some((error) => error.code === "CK1005")).toBe(false);
    expect(sync.warnings.some((warning) => warning.code === "CK1011")).toBe(true);
    const checked = await validateAsync(spec);
    expect(checked.ok).toBe(true);
    expect(checked.warnings.some((warning) => warning.code === "CK1011")).toBe(false);

    const undated = {
      version: "1",
      type: "gantt",
      data: [{ task: "Write the spec", section: "Plan" }],
      a11y: { alt: "The spec has no dates." },
    };
    expect(validate(undated).errors.some((error) => error.code === "CK1005")).toBe(false);
    const asyncUndated = await validateAsync(undated);
    expect(asyncUndated.ok).toBe(false);
    expect(asyncUndated.errors.some((error) => error.code === "CK1401" || error.code === "CK1402")).toBe(true);

    const quadrant = validate(load("26-quadrant.json"));
    expect(quadrant.errors.some((error) => error.code === "CK1002" && error.path === "/quadrants")).toBe(false);
    expect(quadrant.errors.some((error) => error.code === "CK1005")).toBe(false);
  });

  it("shows a gantt tooltip from the extra-tip path", async () => {
    const { attach } = await import("../extra-tip");
    const host = document.createElement("div");
    host.innerHTML = render(load("24-gantt.json"));
    document.body.append(host);
    const ctl = attach(host);
    const mark = host.querySelector('[data-ck-mark="bar"]');
    expect(mark).toBeTruthy();
    mark?.dispatchEvent(new PointerEvent("pointermove", { clientX: 240, clientY: 120, bubbles: true }));
    const tip = document.querySelector("[data-ck-extra-tip]") as HTMLElement;
    expect(tip.style.display).toBe("block");
    expect(tip.textContent).toContain("Write the spec");
    ctl.destroy();
    host.remove();
  });
});

interface Spot {
  x: number;
  y: number;
  text: string;
  sets: string[];
  middle: boolean;
  hw: number;
  hh: number;
}

interface CircleSpot {
  name: string;
  x: number;
  y: number;
  r: number;
}

function readCircles(svg: string): CircleSpot[] {
  return [...svg.matchAll(/<circle\b[^>]*data-ck-mark="set"[^>]*>/g)].map((match) => {
    const tag = match[0];
    const label = /aria-label="([^"]+)"/.exec(tag)?.[1] ?? "";
    return {
      name: label.split(":")[0],
      x: numAttr(tag, "cx"),
      y: numAttr(tag, "cy"),
      r: numAttr(tag, "r"),
    };
  });
}

function readOverlaps(svg: string): Spot[] {
  return [...svg.matchAll(/<text\b([^>]*data-ck-mark="overlap"[^>]*)>([\s\S]*?)<\/text>/g)].map((match) => {
    const attrs = match[1];
    const text = match[2].replace(/<title>[\s\S]*?<\/title>/g, "").trim();
    const label = /aria-label="([^"]+)"/.exec(attrs)?.[1] ?? "";
    const sets = label.slice(0, label.lastIndexOf(":")).split("+").map((part) => part.trim());
    return { x: numAttr(attrs, "x"), y: numAttr(attrs, "y"), text, sets, middle: attrs.includes('dominant-baseline="middle"'), hw: text.length * 4.2, hh: 7 };
  });
}

function readNames(svg: string): Spot[] {
  return [...svg.matchAll(/<text\b([^>]*)>([^<]+)<\/text>/g)]
    .filter((match) => !match[1].includes("data-ck-mark") && ["Search", "Filters", "Saved views"].includes(match[2]))
    .map((match) => ({
      x: numAttr(match[1], "x"),
      y: numAttr(match[1], "y"),
      text: match[2],
      sets: [],
      middle: match[1].includes('dominant-baseline="middle"'),
      hw: match[2].length * 4.4,
      hh: 8,
    }));
}

function numAttr(tag: string, name: string): number {
  return Number(new RegExp(`${name}="([^"]+)"`).exec(tag)?.[1]);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function boxesHit(a: Spot, b: Spot): boolean {
  return Math.abs(a.x - b.x) < a.hw + b.hw && Math.abs(a.y - b.y) < a.hh + b.hh;
}

function boxClearsCircle(label: Spot, circle: CircleSpot, gap: number): boolean {
  const x = Math.max(label.x - label.hw, Math.min(circle.x, label.x + label.hw));
  const y = Math.max(label.y - label.hh, Math.min(circle.y, label.y + label.hh));
  return Math.hypot(circle.x - x, circle.y - y) >= circle.r + gap;
}

function nearBest(point: { x: number; y: number }, interior: { x: number; y: number; r: number }[], exterior: { x: number; y: number; r: number }[]): boolean {
  let best = -Infinity;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const circle of interior) {
    minX = Math.min(minX, circle.x - circle.r);
    minY = Math.min(minY, circle.y - circle.r);
    maxX = Math.max(maxX, circle.x + circle.r);
    maxY = Math.max(maxY, circle.y + circle.r);
  }
  for (let x = minX; x <= maxX; x += 0.3) {
    for (let y = minY; y <= maxY; y += 0.3) best = Math.max(best, regionMargin({ x, y }, interior, exterior));
  }
  return regionMargin(point, interior, exterior) >= best - 0.45;
}
