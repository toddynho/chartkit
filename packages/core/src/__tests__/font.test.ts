import { describe, expect, it } from "vitest";
import { bar } from "../charts/bar";
import { pie } from "../charts/pie";
import { kpi } from "../charts/kpi";
import { heatmap } from "../charts/heatmap";
import { bakeFontFallback, FONT_FALLBACK, FONT_INHERIT } from "../font";
import { createRenderer } from "../render";
import { toSVG } from "../export";
import { resolvePreset } from "../theme";
import "../themes/mustard";
import { validate } from "../validate";

const render = createRenderer([bar, pie, kpi, heatmap]);

const alt = "Values rose.";

function lineSpec(theme?: unknown) {
  return {
    version: "1",
    type: "bar",
    data: [
      { month: "Jan", revenue: 10 },
      { month: "Feb", revenue: 14 },
    ],
    encoding: { x: "month", y: "revenue" },
    title: "Revenue",
    a11y: { alt },
    ...(theme ? { theme } : {}),
  };
}

describe("font inherit", () => {
  it("uses the page font unless a family is set", () => {
    const svg = render(lineSpec());
    expect(svg).toContain(`font-family:${FONT_INHERIT}`);
    expect(svg).not.toContain("system-ui");
    expect(svg).not.toContain("--ck-font-family:");
    for (const spec of [
      { ...lineSpec(), type: "pie", encoding: { x: "month", y: "revenue" } },
      {
        version: "1",
        type: "kpi",
        metric: { value: 12, label: "Open" },
        a11y: { alt },
      },
      {
        version: "1",
        type: "heatmap",
        data: [{ row: "A", col: "Mon", n: 1 }],
        encoding: { x: "col", y: "row", color: "n" },
        a11y: { alt },
      },
    ]) {
      expect(render(spec)).toContain(`font-family:${FONT_INHERIT}`);
    }
  });

  it("writes an explicit family and rejects a bad one as CK3086", () => {
    const svg = render(lineSpec({ tokens: { fontFamily: "Georgia, serif" } }));
    expect(svg).toContain("--ck-font-family:Georgia, serif");
    expect(svg).toContain(`font-family:${FONT_INHERIT}`);
    const bad = validate(lineSpec({ tokens: { fontFamily: 'Georgia";color:red' } }));
    expect(bad.errors.some((error) => error.code === "CK3086" && error.path === "/theme/tokens/fontFamily")).toBe(true);
    expect(render(lineSpec({ tokens: { fontFamily: "x".repeat(81) } }))).not.toContain("--ck-font-family:");
    const empty = validate(lineSpec({ tokens: { fontFamily: "  " } }));
    expect(empty.errors.some((error) => error.code === "CK3086")).toBe(true);
  });

  it("lets inherit clear a preset family", () => {
    expect(resolvePreset({ preset: "mustard" }).fontFamily).toContain("Geist");
    expect(resolvePreset({ preset: "mustard", tokens: { fontFamily: "inherit" } }).fontFamily).toBeUndefined();
    const svg = render(lineSpec({ preset: "mustard", tokens: { fontFamily: "inherit" } }));
    expect(svg).not.toContain("Geist");
    expect(svg).toContain(`font-family:${FONT_INHERIT}`);
  });

  it("bakes the fallback into standalone SVG and leaves an override", () => {
    const baked = bakeFontFallback(render(lineSpec()) ?? "");
    expect(baked).toContain(`font-family:${FONT_FALLBACK}`);
    expect(baked).not.toContain("inherit");
    const named = bakeFontFallback(render(lineSpec({ tokens: { fontFamily: "Georgia, serif" } })) ?? "");
    expect(named).toContain("font-family:Georgia, serif");
    expect(named).not.toContain(FONT_INHERIT);
    expect(toSVG(`<svg style="font-family:${FONT_INHERIT}"></svg>`)).toContain(`font-family:${FONT_FALLBACK}`);
  });
});
