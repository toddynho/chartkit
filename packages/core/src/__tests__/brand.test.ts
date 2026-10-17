import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createRenderer } from "../render";
import { line } from "../charts/line";
import { auto, resolvePreset } from "../theme";
import { BRAND_REFERENCE_BACKGROUND, paletteFromBrand } from "../themes/brand";
import { candidates } from "../themes/candidates";

function srgbToLinear(channel: number): number {
  const x = channel / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function relLum(hex: string): number {
  const channels = [1, 3, 5].map((index) => srgbToLinear(parseInt(hex.slice(index, index + 2), 16)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const left = relLum(a);
  const right = relLum(b);
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
}

describe("paletteFromBrand", () => {
  it("returns eight colours that clear 3:1 on the reference background", () => {
    const light = paletteFromBrand("#635bff");
    const dark = paletteFromBrand("#635bff", "dark");
    expect(light).toHaveLength(8);
    expect(new Set(light).size).toBe(8);
    expect(dark).toHaveLength(8);
    for (const color of light) expect(contrast(color, BRAND_REFERENCE_BACKGROUND.light)).toBeGreaterThanOrEqual(3);
    for (const color of dark) expect(contrast(color, BRAND_REFERENCE_BACKGROUND.dark)).toBeGreaterThanOrEqual(3);
    expect(light).not.toEqual(dark);
    expect(paletteFromBrand("#635bff")).toEqual(light);
    expect(paletteFromBrand("#635bff")[0]).not.toBe(paletteFromBrand("#0f766e")[0]);
  });

  it("keeps a second brand hue and rejects a bare word", () => {
    const derived = paletteFromBrand(["#635bff", "#ff5a36"], "light");
    expect(derived).toHaveLength(8);
    expect(derived[0]).not.toBe(derived[1]);
    expect(() => paletteFromBrand("blurple")).toThrow(TypeError);
  });

  it("paints through the existing tokens override and leaves auto as the default", () => {
    const series = paletteFromBrand("#635bff");
    expect(resolvePreset(undefined)).toEqual(auto);
    expect(resolvePreset({ preset: "auto", tokens: { series } }).series).toEqual(series);
    const svg = createRenderer([line])({
      version: "1",
      type: "line",
      data: [
        { quarter: "Q1", units: 10 },
        { quarter: "Q2", units: 14 },
      ],
      encoding: { x: "quarter", y: "units" },
      theme: { preset: "auto", tokens: { series } },
      a11y: { alt: "Units rose from Q1 to Q2." },
    });
    expect(svg).toContain(series[0]);
  });
});

describe("candidate looks", () => {
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../themes/candidates.css"), "utf8");

  it("keeps every categorical, sequential, and diverging stop at 3:1 in the stylesheet", () => {
    expect(candidates).toHaveLength(3);
    for (const look of candidates) {
      for (const scheme of ["light", "dark"] as const) {
        const tokens = look[scheme];
        const swatches = [...tokens.series, ...tokens.sequential, ...tokens.diverging];
        expect(new Set(tokens.series).size).toBeGreaterThanOrEqual(8);
        for (const color of swatches) {
          expect(color).toMatch(/^#[0-9a-f]{6}$/);
          expect(contrast(color, tokens.background)).toBeGreaterThanOrEqual(3);
          expect(css).toContain(color);
        }
        expect(css).toContain(`data-ck-theme="${look.id}"`);
        expect(css).toContain(`data-ck-scheme="${scheme}"`);
      }
    }
  });
});
