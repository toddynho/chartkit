import { describe, expect, it } from "vitest";
import { createRenderer } from "../render";
import { line } from "../charts/line";
import { render } from "../extra";
import { repair, validate } from "../validate";

const alt = "Revenue dips, spikes, and returns to the floor.";

function lineSpec(mark: Record<string, unknown>, theme?: string) {
  return {
    version: "1",
    type: "line",
    data: [
      { month: "Jan", revenue: 0 },
      { month: "Feb", revenue: 0 },
      { month: "Mar", revenue: 48 },
      { month: "Apr", revenue: 0 },
      { month: "May", revenue: 2 },
    ],
    encoding: { x: "month", y: "revenue" },
    mark,
    ...(theme ? { theme } : {}),
    a11y: { alt },
    size: { width: 420, height: 220 },
  };
}

function bezierYs(d: string): number[] {
  const tokens = d.match(/[MLC]|-?\d*\.?\d+/g) ?? [];
  const samples: number[] = [];
  let i = 0;
  let y0 = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === "M" || token === "L") {
      y0 = Number(tokens[i + 2]);
      samples.push(y0);
      i += 3;
    } else if (token === "C") {
      const y1 = Number(tokens[i + 2]);
      const y2 = Number(tokens[i + 4]);
      const y3 = Number(tokens[i + 6]);
      for (let step = 1; step <= 24; step++) {
        const t = step / 24;
        const u = 1 - t;
        samples.push(u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3);
      }
      y0 = y3;
      i += 7;
    } else i += 1;
  }
  return samples;
}

function endpointYs(d: string): number[] {
  const tokens = d.match(/[MLC]|-?\d*\.?\d+/g) ?? [];
  const ends: number[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === "M" || token === "L") {
      ends.push(Number(tokens[i + 2]));
      i += 3;
    } else if (token === "C") {
      ends.push(Number(tokens[i + 6]));
      i += 7;
    } else i += 1;
  }
  return ends;
}

function dayCells(svg: string): { x: number; y: number; w: number; h: number }[] {
  const cells: { x: number; y: number; w: number; h: number }[] = [];
  for (const box of svg.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"([^>]*)>/g)) {
    if (box[3] === "100%" || box[5].includes("data-ck-scale") || !box[5].includes("aria-label")) continue;
    cells.push({ x: Number(box[1]), y: Number(box[2]), w: Number(box[3]), h: Number(box[4]) });
  }
  return cells;
}

function pathYs(d: string): { end: number[]; control: number[] } {
  const nums = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  const end: number[] = [];
  const control: number[] = [];
  if (nums.length >= 2) end.push(nums[1]);
  for (let i = 2; i + 5 < nums.length; i += 6) {
    control.push(nums[i + 1], nums[i + 3]);
    end.push(nums[i + 5]);
  }
  return { end, control };
}

describe("core gaps", () => {
  it("paints mark.glow with one filter, and only when it is set", () => {
    const plain = render(lineSpec({}));
    const glow = render(lineSpec({ glow: true }));
    const night = render(lineSpec({ glow: true }, "midnight"));
    expect(plain).not.toContain("feGaussianBlur");
    expect(glow.match(/<filter /g)).toHaveLength(1);
    expect(glow).toContain("feGaussianBlur");
    expect(glow).toContain('filter="url(#');
    expect(night).toContain('stdDeviation="3"');
    expect(glow).toContain('stdDeviation="1.8"');
    const draw = createRenderer([line]);
    expect(draw(lineSpec({ glow: true }))).toContain("feGaussianBlur");
  });

  it("keeps a smooth curve inside the data and repairs curve smooth to monotone", () => {
    const monotone = render(lineSpec({ curve: "monotone", points: "none" }));
    const smooth = render(lineSpec({ curve: "smooth", points: "none" }));
    const d = /<path d="([^"]+)" fill="none"/.exec(monotone)?.[1] ?? "";
    const smoothD = /<path d="([^"]+)" fill="none"/.exec(smooth)?.[1] ?? "";
    expect(d).toContain("C ");
    expect(smoothD).toBe(d);
    const { end, control } = pathYs(d);
    const lo = Math.min(...end);
    const hi = Math.max(...end);
    expect(control.length).toBeGreaterThan(0);
    for (const y of control) {
      expect(y).toBeGreaterThanOrEqual(lo - 0.05);
      expect(y).toBeLessThanOrEqual(hi + 0.05);
    }
    const spike = render({
      version: "1",
      type: "line",
      data: [
        { day: "2026-03-02", errors: 4 },
        { day: "2026-03-03", errors: 6 },
        { day: "2026-03-04", errors: 3 },
        { day: "2026-03-05", errors: 8 },
        { day: "2026-03-06", errors: 5 },
        { day: "2026-03-09", errors: 7 },
        { day: "2026-03-10", errors: 210 },
        { day: "2026-03-11", errors: 6 },
        { day: "2026-03-12", errors: 4 },
        { day: "2026-03-13", errors: 9 },
        { day: "2026-03-16", errors: 2 },
        { day: "2026-03-17", errors: 5 },
      ],
      encoding: { x: { field: "day", type: "temporal" }, y: "errors" },
      mark: { points: "none" },
      a11y: { alt: "Errors spike to 210 on 10 March and return to the baseline." },
      size: { width: 640, height: 280 },
    });
    const named = render({
      version: "1",
      type: "line",
      data: [
        { day: "2026-03-02", errors: 8 },
        { day: "2026-03-03", errors: 8 },
        { day: "2026-03-04", errors: 8 },
        { day: "2026-03-05", errors: 96 },
        { day: "2026-03-06", errors: 8 },
        { day: "2026-03-09", errors: 8 },
        { day: "2026-03-10", errors: 9 },
      ],
      encoding: { x: { field: "day", type: "temporal" }, y: "errors" },
      mark: { curve: "monotone", points: "none" },
      a11y: { alt: "A flat week with one spike to 96." },
      size: { width: 640, height: 280 },
    });
    for (const svg of [spike, named]) {
      const path = [...svg.matchAll(/<path d="([^"]+)" fill="none"/g)].map((match) => match[1]).find((item) => item.includes("C ")) ?? "";
      const samples = bezierYs(path);
      const ends = endpointYs(path);
      const low = Math.min(...ends);
      const high = Math.max(...ends);
      expect(samples.length).toBeGreaterThan(ends.length);
      for (const y of samples) {
        expect(y).toBeGreaterThanOrEqual(low - 0.05);
        expect(y).toBeLessThanOrEqual(high + 0.05);
      }
    }
    const spec = lineSpec({ curve: "smooth" });
    const error = validate(spec).errors.find((item) => item.code === "CK1007" && item.path === "/mark/curve");
    expect(error?.fix).toEqual([{ op: "replace", path: "/mark/curve", value: "monotone" }]);
    expect(repair(spec).spec).toMatchObject({ mark: { curve: "monotone" } });
  });

  it("draws a funnel legend when one is requested", () => {
    const spec = {
      version: "1",
      type: "funnel",
      title: "Signup",
      data: [
        { stage: "Visit", count: 80 },
        { stage: "Start", count: 40 },
        { stage: "Pay", count: 12 },
      ],
      encoding: { x: "stage", y: "count" },
      a11y: { alt: "12 of 80 visits pay." },
    };
    const plain = render(spec);
    expect(plain).not.toContain("data-ck-legend");
    const top = render({ ...spec, legend: { position: "top" } });
    expect(top).toContain('data-ck-legend="top"');
    expect(top).toContain("Visit");
    expect(top).toContain("Pay");
    const right = render({ ...spec, legend: { position: "right" } });
    expect(right).toContain('data-ck-legend="right"');
    expect(right).not.toBe(top);
    const hidden = render({ ...spec, legend: { position: "top", show: false } });
    expect(hidden).not.toContain("data-ck-legend");
  });

  it("grows calendar cells to a fixed size and keeps 12px cells when size is omitted", () => {
    const data = Array.from({ length: 70 }, (_, index) => {
      const day = new Date(Date.UTC(2026, 0, 5 + index));
      return { date: day.toISOString().slice(0, 10), value: (index % 5) + 1 };
    });
    const spec = {
      version: "1",
      type: "heatmap",
      data,
      encoding: { x: "date", color: "value" },
      mark: { layout: "calendar", weeks: 10 },
      a11y: { alt: "Daily values across ten weeks." },
    };
    const loose = render(spec);
    const fitted = render({ ...spec, size: { width: 640, height: 280 } });
    expect(loose).toContain('width="12"');
    expect(fitted).toContain('viewBox="0 0 640 280"');
    const fittedCells = dayCells(fitted);
    expect(Math.max(...fittedCells.map((cell) => cell.w))).toBeGreaterThan(18);
    const fittedRight = Math.max(...fittedCells.map((cell) => cell.x + cell.w));
    const fittedBottom = Math.max(...fittedCells.map((cell) => cell.y + cell.h));
    expect(fittedRight).toBeGreaterThan(600);
    expect(fittedBottom).toBeGreaterThan(180);
    const repro = render({
      version: "1",
      type: "heatmap",
      data: [
        { day: "2026-04-06", baskets: 4 },
        { day: "2026-04-07", baskets: 14 },
      ],
      encoding: {
        x: { field: "day", type: "temporal" },
        color: { field: "baskets", scale: { type: "threshold", thresholds: [6, 12] } },
      },
      mark: { layout: "calendar", weeks: 12 },
      size: { width: 720, height: 220 },
      a11y: { alt: "Two April days, one below 6 baskets and one at 14." },
    });
    expect(repro).toContain('viewBox="0 0 720 220"');
    const legend = /<g data-ck-scale="threshold">([\s\S]*?)<\/g>/.exec(repro)?.[1] ?? "";
    expect(legend).toContain("&lt;6");
    expect(legend).toContain("6–12");
    expect(legend).toContain("≥12");
    expect(legend).not.toContain(">4<");
    expect(legend).not.toContain(">14<");
    const binX = Number(/<rect x="([^"]+)"[^>]*data-ck-scale="bin"/.exec(repro)?.[1]);
    expect(binX).toBeLessThan(80);
    const cells = dayCells(repro);
    const left = Math.min(...cells.map((cell) => cell.x));
    const right = Math.max(...cells.map((cell) => cell.x + cell.w));
    expect(right).toBeGreaterThan(680);
    expect(right - left).toBeGreaterThan(600);
    const grid = validate({
      version: "1",
      type: "heatmap",
      data: [{ x: "A", y: "North", v: 1 }],
      encoding: { x: "x", y: "y", color: "v" },
      mark: { weeks: 12 },
      a11y: { alt: "One cell." },
    });
    expect(grid.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/mark/weeks")).toBe(true);
  });
});
