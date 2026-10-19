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
    const widths = [...fitted.matchAll(/<rect x="[^"]+" y="[^"]+" width="([^"]+)" height="\1"/g)].map((mark) => Number(mark[1]));
    const cell = Math.max(...widths);
    expect(cell).toBeGreaterThan(18);
    const boxes = [...fitted.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g)];
    let right = 0;
    let bottom = 0;
    for (const box of boxes) {
      if (box[3] === "100%") continue;
      right = Math.max(right, Number(box[1]) + Number(box[3]));
      bottom = Math.max(bottom, Number(box[2]) + Number(box[4]));
    }
    expect(right).toBeGreaterThan(320);
    expect(bottom).toBeGreaterThan(180);
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
