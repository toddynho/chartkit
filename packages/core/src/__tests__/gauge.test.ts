import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../all";

const example = join(dirname(fileURLToPath(import.meta.url)), "../../examples/09-gauge.json");

function attrs(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const match of source.matchAll(/([\w:-]+)="([^"]*)"/g)) out[match[1]] = match[2];
  return out;
}

function marks(svg: string, name: string): Record<string, string>[] {
  const found: Record<string, string>[] = [];
  for (const match of svg.matchAll(/<(\w+)\b([^>]*?)\/?>/g)) {
    if (!match[2].includes(`data-ck-mark="${name}"`)) continue;
    found.push(attrs(match[2]));
  }
  return found;
}

function angleAt(cx: number, cy: number, x: number, y: number): number {
  return (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
}

function angDiff(a: number, b: number): number {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d <= -180) d += 360;
  return Math.abs(d);
}

function pathEnd(d: string): { x: number; y: number; r: number } {
  const nums = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((item) => Number(item[0]));
  return { x: nums[nums.length - 2], y: nums[nums.length - 1], r: nums[2] };
}

const capacity = {
  version: "1",
  type: "gauge",
  metric: {
    label: "Capacity",
    value: 72,
    min: 0,
    max: 100,
    target: 80,
    format: "integer",
    bands: [
      { from: 0, to: 50, color: "negative", label: "Low" },
      { from: 50, to: 100, color: "positive", label: "OK" },
    ],
  },
  size: { width: 320, height: 200 },
  a11y: { alt: "Capacity is 72 out of 100, below the target of 80." },
};

describe("gauge", () => {
  it("aligns ticks, needle, and fill, and keeps the readout off the caption", () => {
    const svg = render(capacity);
    const hub = marks(svg, "gauge-hub")[0];
    const cx = Number(hub.cx);
    const cy = Number(hub.cy);
    const track = pathEnd(marks(svg, "gauge-track")[0].d);
    const value = pathEnd(marks(svg, "gauge-value")[0].d);
    const needle = marks(svg, "gauge-needle")[0];
    const start = -135;
    const span = 270;
    const valueAngle = start + 0.72 * span;

    expect(angDiff(angleAt(cx, cy, value.x, value.y), valueAngle)).toBeLessThan(0.6);
    expect(angDiff(angleAt(cx, cy, Number(needle.x2), Number(needle.y2)), valueAngle)).toBeLessThan(0.6);
    expect(Math.hypot(Number(needle.x2) - cx, Number(needle.y2) - cy)).toBeCloseTo(track.r - Number(marks(svg, "gauge-track")[0]["stroke-width"]) / 2, 1);

    const expected = [0, 0.25, 0.5, 0.75, 1].map((t) => start + t * span);
    const ticks = marks(svg, "gauge-tick");
    expect(ticks).toHaveLength(5);
    ticks.forEach((tick, index) => {
      const inner = angleAt(cx, cy, Number(tick.x1), Number(tick.y1));
      const outer = angleAt(cx, cy, Number(tick.x2), Number(tick.y2));
      expect(angDiff(inner, expected[index])).toBeLessThan(0.6);
      expect(angDiff(outer, expected[index])).toBeLessThan(0.6);
      const outerR = Math.hypot(Number(tick.x2) - cx, Number(tick.y2) - cy);
      expect(outerR).toBeGreaterThan(track.r + Number(marks(svg, "gauge-track")[0]["stroke-width"]) / 2);
    });

    for (const label of ["0", "25", "50", "75", "100"]) expect(svg).toContain(`>${label}<`);

    const readout = marks(svg, "gauge-readout")[0];
    const caption = marks(svg, "gauge-caption")[0];
    const valueSize = Number(readout["font-size"]);
    const labelSize = Number(caption["font-size"]);
    expect(valueSize).toBeGreaterThan(labelSize + 12);
    expect(Number(caption.y) - Number(readout.y)).toBeGreaterThan(valueSize / 2 + labelSize / 2 + 8);
    expect(svg).toContain(">72<");
    expect(svg).toContain(">Capacity<");

    expect(svg.match(/<circle\b/g)).toHaveLength(1);
    expect(svg).not.toContain("--ck-accent");
    expect(svg).toContain('data-ck-target="80"');
    expect(Number(marks(svg, "gauge-track")[0]["stroke-width"])).toBeGreaterThanOrEqual(18);
    expect(marks(svg, "gauge-track")[0]["stroke-linecap"]).toBe("butt");
    expect(marks(svg, "gauge-value")[0]["stroke-linecap"]).toBe("butt");
  });

  it("keeps the same agreement on the example and the homepage size", () => {
    const raw = JSON.parse(readFileSync(example, "utf8")) as Record<string, unknown>;
    for (const spec of [raw, { ...raw, size: { width: 480, height: 260 } }]) {
      const svg = render(spec);
      const hub = marks(svg, "gauge-hub")[0];
      const cx = Number(hub.cx);
      const cy = Number(hub.cy);
      const value = pathEnd(marks(svg, "gauge-value")[0].d);
      const needle = marks(svg, "gauge-needle")[0];
      const valueAngle = -135 + 0.72 * 270;
      expect(angDiff(angleAt(cx, cy, value.x, value.y), valueAngle)).toBeLessThan(0.6);
      expect(angDiff(angleAt(cx, cy, Number(needle.x2), Number(needle.y2)), valueAngle)).toBeLessThan(0.6);
      const readout = marks(svg, "gauge-readout")[0];
      const caption = marks(svg, "gauge-caption")[0];
      expect(Number(caption.y) - Number(readout.y)).toBeGreaterThan(Number(readout["font-size"]) / 2 + Number(caption["font-size"]) / 2 + 8);
      expect(svg.match(/<circle\b/g)).toHaveLength(1);
    }
  });

  it("honors an explicit arc width and draws no value arc at the minimum", () => {
    const wide = render({ ...capacity, mark: { strokeWidth: 8 } });
    expect(marks(wide, "gauge-track")[0]["stroke-width"]).toBe("8");
    const empty = render({ ...capacity, metric: { ...capacity.metric, value: 0 } });
    expect(marks(empty, "gauge-value")).toHaveLength(0);
    const full = render({ ...capacity, metric: { ...capacity.metric, value: 100 } });
    const hub = marks(full, "gauge-hub")[0];
    const end = pathEnd(marks(full, "gauge-value")[0].d);
    expect(angDiff(angleAt(Number(hub.cx), Number(hub.cy), end.x, end.y), 135)).toBeLessThan(0.6);
  });

  it("insets round caps so the visual tip still sits on the value", () => {
    const svg = render({ ...capacity, mark: { linecap: "round" } });
    const hub = marks(svg, "gauge-hub")[0];
    const cx = Number(hub.cx);
    const cy = Number(hub.cy);
    const track = marks(svg, "gauge-track")[0];
    const radius = pathEnd(track.d).r;
    const stroke = Number(track["stroke-width"]);
    const overhang = (Math.atan2(stroke / 2, radius) * 180) / Math.PI;
    const pathAngle = angleAt(cx, cy, pathEnd(marks(svg, "gauge-value")[0].d).x, pathEnd(marks(svg, "gauge-value")[0].d).y);
    const valueAngle = -135 + 0.72 * 270;
    expect(angDiff(pathAngle + overhang, valueAngle)).toBeLessThan(0.75);
    const needle = marks(svg, "gauge-needle")[0];
    expect(angDiff(angleAt(cx, cy, Number(needle.x2), Number(needle.y2)), valueAngle)).toBeLessThan(0.6);
  });
});
