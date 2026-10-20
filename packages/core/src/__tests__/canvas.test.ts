import { describe, expect, it } from "vitest";
import { applyPatch } from "../repair";
import { renderLine } from "../renderers/cartesian";
import { renderBar } from "../renderers/cartesian";
import { renderCandlestick } from "../renderers/candlestick";
import { renderHeatmap } from "../renderers/heatmap";
import { renderScatter } from "../renderers/scatter";
import { renderStackedArea } from "../renderers/cartesian";
import { CANVAS_AT } from "../render-mode";
import { repair, validate } from "../validate";

const alt = "The series is drawn.";

function line(extra: Record<string, unknown> = {}, n = 4) {
  const data = Array.from({ length: n }, (_, i) => ({ x: i, y: Math.round(Math.sin(i / 3) * 10 + 20) }));
  return {
    version: "1",
    type: "line",
    data,
    encoding: { x: "x", y: "y" },
    a11y: { alt },
    size: { width: 320, height: 180 },
    ...extra,
  };
}

describe("canvas render mode", () => {
  it("keeps svg as the default and stamps canvas marks without dropping the description", () => {
    const svg = renderLine(line());
    const canvas = renderLine(line({ render: "canvas" }));
    expect(svg).not.toContain('data-ck-render="canvas"');
    expect(svg).not.toContain("data-ck-layer");
    expect(canvas).toContain('data-ck-render="canvas"');
    expect(canvas).toContain('data-ck-layer="marks"');
    expect(canvas).toContain("<desc>");
    expect(canvas).toContain('aria-label="The series is drawn."');
    expect(canvas).toContain("<text ");
    expect(validate(line({ render: "canvas" })).ok).toBe(true);
  });

  it("auto stays on svg under the threshold and moves to canvas above it", () => {
    expect(renderLine(line({ render: "auto" }, 12))).not.toContain('data-ck-render="canvas"');
    expect(renderLine(line({ render: "auto" }, CANVAS_AT))).toContain('data-ck-render="canvas"');
  });

  it("covers area, scatter, bar, heatmap, and candlestick", () => {
    const rows = [
      { x: "A", y: 2, v: 1, o: 4, h: 6, l: 3, c: 5 },
      { x: "B", y: 5, v: 4, o: 5, h: 7, l: 4, c: 6 },
    ];
    const base = { version: "1", render: "canvas", a11y: { alt }, size: { width: 320, height: 180 } };
    expect(renderStackedArea({ ...base, type: "stacked-area", data: rows, encoding: { x: "x", y: ["y", "v"] } })).toContain('data-ck-layer="marks"');
    expect(renderScatter({ ...base, type: "scatter", data: rows, encoding: { x: "y", y: "v" } })).toContain('data-ck-layer="marks"');
    expect(renderBar({ ...base, type: "bar", data: rows, encoding: { x: "x", y: "y" } })).toContain('data-ck-layer="marks"');
    expect(renderHeatmap({ ...base, type: "heatmap", data: rows, encoding: { x: "x", y: "y", color: "v" } })).toContain('data-ck-layer="marks"');
    expect(renderCandlestick({ ...base, type: "candlestick", data: rows, encoding: { x: "x", open: "o", high: "h", low: "l", close: "c" } })).toContain('data-ck-layer="marks"');
  });

  it("lets data.sampling override mark.sampling", () => {
    const n = 400;
    const xs = Array.from({ length: n }, (_, i) => i);
    const ys = Array.from({ length: n }, (_, i) => (i % 17) + Math.sin(i) * 4);
    const spec = {
      version: "1",
      type: "line",
      data: { columns: { x: xs, y: ys }, sampling: "none" },
      encoding: { x: "x", y: "y" },
      mark: { sampling: "minmax", curve: "linear", points: "none" },
      a11y: { alt },
      size: { width: 120, height: 80 },
    };
    const forced = renderLine(spec);
    const sampled = renderLine({ ...spec, data: { columns: { x: xs, y: ys }, sampling: "lttb" } });
    expect(forced.length).toBeGreaterThan(sampled.length);
  });
});

describe("large-data warnings", () => {
  const big = line({ mark: { sampling: "none" } }, CANVAS_AT);

  it("warns CK3031 on a large svg series and the patch selects canvas", () => {
    const result = validate(big);
    const warning = result.warnings.find((item) => item.code === "CK3031");
    expect(warning?.fix).toEqual([{ op: "add", path: "/render", value: "canvas" }]);
    const spec = structuredClone(big);
    expect(applyPatch(spec, warning!.fix![0])).toBe(true);
    expect(validate(spec).warnings.some((item) => item.code === "CK3031")).toBe(false);
    expect(renderLine(spec as Record<string, unknown>)).toContain('data-ck-render="canvas"');
  });

  it("warns CK3032 when sampling is none and the patch sets lttb", () => {
    const result = validate(big);
    const warning = result.warnings.find((item) => item.code === "CK3032");
    expect(warning?.path).toBe("/mark/sampling");
    expect(warning?.fix?.[0]).toEqual({ op: "replace", path: "/mark/sampling", value: "lttb" });
    const columnar = line({ data: { columns: { x: big.data.map((row) => row.x), y: big.data.map((row) => row.y) }, sampling: "none" } }, CANVAS_AT);
    const other = validate(columnar).warnings.find((item) => item.code === "CK3032");
    expect(other?.path).toBe("/data/sampling");
  });

  it("warns CK3033 for canvas on a type without a painter", () => {
    const spec = {
      version: "1",
      type: "donut",
      render: "canvas",
      data: [
        { x: "A", y: 2 },
        { x: "B", y: 3 },
      ],
      encoding: { x: "x", y: "y" },
      a11y: { alt },
    };
    const warning = validate(spec).warnings.find((item) => item.code === "CK3033");
    expect(warning?.fix).toEqual([{ op: "replace", path: "/render", value: "svg" }]);
    expect(repair(spec).spec).toBeTruthy();
    expect(validate(line()).ok).toBe(true);
  });
});
