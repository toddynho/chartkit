import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderToSvg as angularSvg } from "../../../angular/src/render.js";
import { renderToString as astroSvg } from "../../../astro/src/render.js";
import { drawSpec } from "../../../../apps/cloud/src/draw.ts";
import { renderToString as elementSvg } from "../../../element/src/ssr.ts";
import { renderToSvg as qwikSvg } from "../../../qwik/src/render.js";
import { renderToString as reactSvg } from "../../../react/src/ssr.ts";
import { renderToSvg as solidSvg } from "../../../solid/src/render.js";
import { renderToString as vanillaSvg } from "../../../vanilla/src/ssr.ts";
import { render } from "../extra";
import { repair, validate } from "../validate";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function load(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, "examples", name), "utf8")) as Record<string, unknown>;
}

describe("strip", () => {
  it("draws the benchmark with a median tick, a range band, and the compare bracket", () => {
    const spec = load("36-strip.json");
    const result = validate(spec);
    expect(result.errors, JSON.stringify(result.errors)).toEqual([]);
    const svg = render(spec) ?? "";
    expect(svg).toContain('data-ck-type="strip"');
    expect(svg.match(/data-ck-mark="point"/g)?.length).toBe(45);
    expect(svg.match(/data-ck-mark="summary"/g)?.length).toBe(5);
    expect(svg.match(/data-ck-mark="band"/g)?.length).toBe(5);
    expect(svg).toContain('data-ck-mark="compare"');
    expect(svg).toContain("3.5× fewer than Plot, next best");
    expect(svg).toContain("ChartKit");
    expect(svg).toContain("Claude Haiku 4.5, ChartKit, 133");
    const points = [...svg.matchAll(/data-ck-mark="point"/g)].map((match) => match.index ?? 0);
    expect(points).toEqual([...points].sort((a, b) => a - b));
    const chartkit = svg.indexOf('data-ck-group="ChartKit"');
    const plot = svg.indexOf('data-ck-group="Plot"');
    expect(chartkit).toBeGreaterThan(-1);
    expect(chartkit).toBeLessThan(plot);
  });

  it("hides the summary and the band when every group has one point, and repair says so", () => {
    const spec = load("37-strip-dot.json");
    const result = validate(spec);
    expect(result.ok).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "CK3091")).toBe(true);
    const svg = render(spec) ?? "";
    expect(svg).not.toContain('data-ck-mark="summary"');
    expect(svg).not.toContain('data-ck-mark="band"');
    expect(svg.match(/data-ck-mark="point"/g)?.length).toBe(3);
    const fixed = repair(spec);
    expect(fixed.applied.some((op) => op.path === "/mark")).toBe(true);
    expect(fixed.spec).toMatchObject({ mark: { summary: "none", band: "none" } });
    expect(validate(fixed.spec).warnings.some((warning) => warning.code === "CK3091")).toBe(false);
  });

  it("draws a vertical strip with a color legend and an IQR band", () => {
    const spec = load("38-strip-vertical.json");
    const result = validate(spec);
    expect(result.errors, JSON.stringify(result.errors)).toEqual([]);
    const svg = render(spec) ?? "";
    expect(svg.match(/data-ck-mark="band"/g)?.length).toBe(2);
    expect(svg).toContain("Weeknight");
    expect(svg).toContain("Saturday");
  });

  it("warns when the group channel is numeric, when the value is not, and past 12 groups", () => {
    const numeric = validate({
      version: "1",
      type: "strip",
      data: [
        { g: 1, v: 4 },
        { g: 1, v: 8 },
        { g: 2, v: 5 },
      ],
      encoding: { x: "v", y: "g" },
      a11y: { alt: "Two numeric groups." },
    });
    expect(numeric.warnings.some((warning) => warning.code === "CK3087")).toBe(true);
    expect(render(numeric.ok ? {
      version: "1",
      type: "strip",
      data: [
        { g: 1, v: 4 },
        { g: 1, v: 8 },
        { g: 2, v: 5 },
      ],
      encoding: { x: "v", y: "g" },
      a11y: { alt: "Two numeric groups." },
    } : {})).toContain('data-ck-group="1"');

    const text = validate({
      version: "1",
      type: "strip",
      data: [
        { g: "A", v: "low" },
        { g: "A", v: "high" },
      ],
      encoding: { x: "v", y: "g" },
      a11y: { alt: "No numbers." },
    });
    expect(text.errors.some((error) => error.code === "CK3088")).toBe(true);

    const many = Array.from({ length: 13 }, (_, index) => ({ g: `G${index}`, v: index + 1 }));
    const wide = validate({
      version: "1",
      type: "strip",
      data: many,
      encoding: { x: "v", y: "g" },
      a11y: { alt: "Thirteen groups." },
    });
    expect(wide.warnings.some((warning) => warning.code === "CK3089")).toBe(true);
    expect(wide.warnings.find((warning) => warning.code === "CK3091")).toBeTruthy();
  });

  it("drops a band that no group can draw, and keeps one when some groups can", () => {
    const short = {
      version: "1",
      type: "strip",
      data: [
        { g: "A", v: 1 },
        { g: "A", v: 2 },
        { g: "B", v: 3 },
        { g: "B", v: 4 },
      ],
      encoding: { x: "v", y: "g" },
      mark: { band: "range" },
      a11y: { alt: "Too few for a band." },
    };
    const warned = validate(short);
    expect(warned.warnings.some((warning) => warning.code === "CK3090")).toBe(true);
    expect(repair(short).spec).toMatchObject({ mark: { band: "none" } });
    const mixed = {
      ...short,
      data: [...(short.data as object[]), { g: "A", v: 5 }],
    };
    const kept = validate(mixed);
    expect(kept.warnings.some((warning) => warning.code === "CK3090" && !warning.fix)).toBe(true);
    const svg = render(mixed) ?? "";
    expect(svg.match(/data-ck-mark="band"/g)?.length).toBe(1);
  });

  it("jitters only the points that collide, and a number moves every point", () => {
    const spec = {
      version: "1",
      type: "strip",
      data: [
        { g: "A", v: 10 },
        { g: "A", v: 10 },
        { g: "A", v: 80 },
      ],
      encoding: { x: "v", y: "g" },
      mark: { summary: "none", jitter: "none" },
      a11y: { alt: "Two points share 10." },
      size: { width: 420, height: 180 },
    };
    const still = render(spec) ?? "";
    const auto = render({ ...spec, mark: { summary: "none", jitter: "auto" } }) ?? "";
    const forced = render({ ...spec, mark: { summary: "none", jitter: 8 } }) ?? "";
    const ys = (svg: string) => [...svg.matchAll(/cy="([^"]+)"/g)].map((match) => Number(match[1]));
    expect(new Set(ys(still)).size).toBeLessThan(new Set(ys(auto)).size);
    expect(forced).not.toBe(auto);
    expect(render(spec)).toBe(render(spec));
  });

  it("removes a highlight and a compare note that do not belong", () => {
    const spec = {
      version: "1",
      type: "strip",
      data: [
        { g: "A", v: 1 },
        { g: "A", v: 3 },
      ],
      encoding: { x: "v", y: "g" },
      mark: { highlight: "Missing" },
      a11y: { alt: "A has two points." },
    };
    expect(validate(spec).warnings.some((warning) => warning.code === "CK3092")).toBe(true);
    expect(repair(spec).spec).toMatchObject({ mark: {} });
    const line = {
      version: "1",
      type: "line",
      data: [
        { month: "Jan", revenue: 1 },
        { month: "Feb", revenue: 2 },
      ],
      encoding: { x: "month", y: "revenue", label: "month" },
      annotations: [{ type: "compare", from: { group: "A", at: "summary" }, to: { group: "B", at: "summary" }, label: "note" }],
      a11y: { alt: "Revenue rose." },
    };
    const checked = validate(line);
    expect(checked.warnings.some((warning) => warning.code === "CK3093")).toBe(true);
    expect(checked.warnings.some((warning) => warning.code === "CK3094")).toBe(true);
    const fixed = repair(line);
    expect((fixed.spec as { annotations?: unknown }).annotations).toBeUndefined();
    expect((fixed.spec as { encoding: { label?: string } }).encoding.label).toBeUndefined();
  });

  it("places a log scale on the midpoint and clamps a point past the domain", () => {
    const spec = {
      version: "1",
      type: "strip",
      data: [
        { g: "line", v: 10 },
        { g: "line", v: 100 },
        { g: "line", v: 10000 },
      ],
      encoding: {
        x: { field: "v", scale: { type: "log", domain: [10, 1000], clamp: true } },
        y: "g",
      },
      mark: { summary: "none", jitter: "none" },
      a11y: { alt: "Log scale from 10 to 1000. 10000 is past the edge." },
      size: { width: 420, height: 160 },
    };
    const svg = render(spec) ?? "";
    const xs = [...svg.matchAll(/cx="([^"]+)"/g)].map((match) => Number(match[1]));
    expect(xs).toHaveLength(3);
    const [slow, mid, pinned] = xs;
    expect(slow).toBeLessThan(mid ?? 0);
    expect(mid).toBeLessThan(pinned ?? 0);
    expect(Math.abs((mid ?? 0) - ((slow ?? 0) + (pinned ?? 0)) / 2)).toBeLessThan(1.5);
    expect(svg).toContain("10000");
    expect(svg).not.toContain('data-ck-mark="summary"');
  });

  it("uses the first observation as the end label when the summary is hidden", () => {
    const spec = {
      version: "1",
      type: "strip",
      data: [
        { g: "line", v: 14.2, name: "ChartKit" },
        { g: "line", v: 1884.3, name: "Recharts" },
      ],
      encoding: { x: "v", y: "g", label: "name" },
      mark: { summary: "none", jitter: "none" },
      a11y: { alt: "ChartKit is 14.2." },
      size: { width: 420, height: 160 },
    };
    const svg = render(spec) ?? "";
    expect(svg).toContain(">14.2<");
    expect(svg).toContain("ChartKit, line, 14.2");
    expect(svg).not.toContain('data-ck-mark="summary"');
  });

  it("paints the same SVG from every adapter, in light and in dark", async () => {
    const spec = load("37-strip-dot.json");
    const core = render(spec) ?? "";
    const inner = (html: string) => html.slice(html.indexOf("<svg"), html.lastIndexOf("</svg>") + 6);
    expect(reactSvg(spec)).toBe(core);
    expect(vanillaSvg(spec)).toBe(core);
    expect(astroSvg(spec)).toBe(core);
    expect(angularSvg(spec)).toBe(core);
    expect(qwikSvg(spec)).toBe(core);
    expect(solidSvg(spec)).toBe(core);
    expect(inner(elementSvg(spec))).toBe(core);
    const svelte = readFileSync(join(root, "../svelte/src/ssr.js"), "utf8");
    const vue = readFileSync(join(root, "../vue/src/ssr.ts"), "utf8");
    expect(svelte).toContain("renderExtra");
    expect(vue).toContain("renderExtra");
    const cloud = await drawSpec(spec, { format: "svg", scale: 1, watermark: false });
    expect(cloud.svg).toContain('data-ck-type="strip"');
    expect(cloud.svg.match(/data-ck-mark="point"/g)?.length).toBe(core.match(/data-ck-mark="point"/g)?.length);
    const bench = load("36-strip.json");
    const light = render(bench) ?? "";
    const dark = render({ ...bench, theme: "midnight" }) ?? "";
    const obsidian = render({ ...bench, theme: "obsidian" }) ?? "";
    for (const svg of [light, dark, obsidian]) {
      expect(svg).toContain("var(--ck-accent,");
      expect(svg).toContain("var(--ck-text,");
      expect(svg).toContain("var(--ck-muted,");
    }
    expect(dark).not.toBe(light);
  });
});
