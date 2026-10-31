import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createRenderer } from "../render";
import { bar } from "../charts/bar";
import { repair, validate } from "../validate";
import { resolveGeometry, resolvePreset } from "../theme";
import { contrast, delta, minPair, simulate } from "../themes/color-math";
import { SAMPLE_MARK, colorsFromBitmap, colorsFromSvg, createTheme, sampleImageData, tokensFromBrand } from "../themes/brand";
import { kite } from "../themes/kite";
import { mustard } from "../themes/mustard";
import { tape } from "../themes/tape";
import { violet } from "../themes/violet";

const here = dirname(fileURLToPath(import.meta.url));

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

describe("createTheme", () => {
  it("freezes mustard to the review swatches and the measured checks", () => {
    const theme = createTheme({ brand: "#ca8a04" });
    expect(theme.light.series).toEqual(["#ba8116", "#0f4f64", "#6a6c43", "#594da8", "#7f1843", "#4f8070", "#7a4124", "#396695"]);
    expect(theme.dark.series).toEqual(["#c98a0e", "#7ed8fc", "#cfd35e", "#928aea", "#e89fb4", "#a4d8c5", "#ee8f61", "#7bb6f5"]);
    expect(theme.light.background).toBe("#fcf6ee");
    expect(theme.light.text).toBe("#2f281e");
    expect(theme.light.muted).toBe("#645c51");
    expect(theme.light.positive).toBe("#1b589e");
    expect(theme.light.negative).toBe("#a83825");
    expect(theme.dark.background).toBe("#23190a");
    expect(theme.textures.id).toBe("riso");
    expect(round1(theme.checks.lightText)).toBe(13.6);
    expect(round1(theme.checks.lightMuted)).toBe(6.1);
    expect(round1(theme.checks.lightSeriesMin)).toBe(3.1);
    expect(round1(theme.checks.darkText)).toBe(15.4);
    expect(round1(theme.checks.darkMuted)).toBe(8.6);
    expect(round1(theme.checks.darkSeriesMin)).toBe(5.8);
    expect(round3(theme.checks.deutan)).toBe(0.056);
    expect(round3(theme.checks.protan)).toBe(0.073);
    expect(round3(theme.checks.semanticDeutan)).toBe(0.232);
    expect(round3(theme.checks.semanticProtan)).toBe(0.19);
    expect(theme.checks.lightText).toBeGreaterThanOrEqual(7);
    expect(theme.checks.lightMuted).toBeGreaterThanOrEqual(4.5);
    expect(theme.checks.darkText).toBeGreaterThanOrEqual(7);
    expect(theme.checks.darkMuted).toBeGreaterThanOrEqual(4.5);
    expect(theme.checks.lightSeriesMin).toBeGreaterThanOrEqual(3);
    expect(theme.checks.darkSeriesMin).toBeGreaterThanOrEqual(3);
  });

  it("freezes violet the same way", () => {
    const theme = createTheme({ brand: "#6d28d9" });
    expect(theme.light.series).toEqual(["#694bb5", "#946d11", "#682b68", "#1c5619", "#238197", "#7c504b", "#3c578a", "#646108"]);
    expect(theme.dark.series).toEqual(["#6b5d9e", "#eec474", "#ad8cac", "#60ae5b", "#5eddfe", "#d5a39c", "#8bb1f7", "#c1bd45"]);
    expect(theme.light.background).toBe("#f7f5fe");
    expect(theme.dark.background).toBe("#1b1827");
    expect(theme.textures.id).toBe("riso");
    expect(round1(theme.checks.lightText)).toBe(13.6);
    expect(round1(theme.checks.lightMuted)).toBe(6.1);
    expect(round1(theme.checks.lightSeriesMin)).toBe(4.2);
    expect(round1(theme.checks.darkText)).toBe(15.5);
    expect(round1(theme.checks.darkMuted)).toBe(8.7);
    expect(round1(theme.checks.darkSeriesMin)).toBe(3.1);
    expect(round3(theme.checks.deutan)).toBe(0.061);
    expect(round3(theme.checks.protan)).toBe(0.058);
    expect(round3(theme.checks.semanticDeutan)).toBe(0.232);
    expect(round3(theme.checks.semanticProtan)).toBe(0.19);
  });

  it("keeps the named presets equal to those derived tokens", () => {
    for (const [preset, brand] of [
      [mustard, "#ca8a04"],
      [violet, "#6d28d9"],
    ] as const) {
      const derived = tokensFromBrand(createTheme({ brand }));
      for (const key of ["background", "surface", "text", "muted", "grid", "axis", "track", "accent", "positive", "negative", "series", "lines"] as const) {
        expect(preset[key]).toEqual(derived[key]);
      }
    }
    expect(mustard.fontFamily).toBe("Geist, ui-sans-serif, system-ui, sans-serif");
    expect(resolveGeometry("mustard").cornerRadius).toBe(8);
    expect(resolveGeometry("violet").fillOpacity).toBe(0.22);
  });

  it("rejects a bare word and expands a short hex", () => {
    expect(() => createTheme({ brand: "mustard" })).toThrow(TypeError);
    expect(createTheme({ brand: "#abc" }).brand).toEqual(["#aabbcc"]);
  });
});

describe("theme.brand on a spec", () => {
  const spec = {
    version: "1" as const,
    type: "bar" as const,
    data: [
      { library: "ChartKit", bytes: 32110 },
      { library: "uPlot", bytes: 24054 },
    ],
    encoding: { x: "library", y: "bytes" },
    theme: { brand: "ca8a04" },
    a11y: { alt: "ChartKit's published line bundle is 32,110 bytes gzip. uPlot is 24,054." },
  };

  it("repairs a missing hash and renders the derived surface", () => {
    const broken = validate(spec);
    expect(broken.ok).toBe(false);
    expect(broken.errors.some((error) => error.code === "CK3085" && error.path === "/theme/brand")).toBe(true);
    const fixed = repair(spec);
    expect(fixed.ok).toBe(true);
    expect(fixed.spec).toMatchObject({ theme: { brand: "#ca8a04" } });
    const svg = createRenderer([bar])(fixed.spec);
    expect(svg).toContain("#fcf6ee");
    expect(svg).toContain("#ba8116");
  });

  it("forces the dark scheme when mode is dark", () => {
    const tokens = resolvePreset({ brand: "#ca8a04", mode: "dark" });
    expect(tokens.background).toBe("#23190a");
    expect(tokens.series[0]).toBe("#c98a0e");
    expect(tokens.background).not.toContain("light-dark");
  });
});

describe("drawings", () => {
  it("reads svg fills and skips white and black", () => {
    expect(colorsFromSvg(SAMPLE_MARK)).toEqual(["#0f766e", "#ca8a04", "#f43f5e"]);
    expect(colorsFromSvg(`<svg><rect fill="#fff"/><rect fill="#000"/><circle fill="#abc"/></svg>`)).toEqual(["#aabbcc"]);
  });

  it("counts pixels and refuses to decode a raster in Node", async () => {
    const pixels = new Uint8ClampedArray([10, 20, 30, 255, 10, 20, 30, 255, 250, 250, 250, 255, 0, 0, 0, 10]);
    expect(sampleImageData(pixels)).toEqual(["#081018"]);
    await expect(colorsFromBitmap(new Blob(["not a png"]))).rejects.toThrow(/browser canvas/);
  });
});

describe("tape and kite", () => {
  it("keeps tape dark, hairline, and apart for deuteranopia", () => {
    expect(tape.background).toBe("#14120e");
    expect(tape.positive).toBe("#4d8eef");
    expect(tape.negative).toBe("#e07a4c");
    expect(tape.fontFamily).toContain("Geist Mono");
    const geometry = resolveGeometry("tape");
    expect(geometry.strokeWidth).toBe(1.5);
    expect(geometry.cornerRadius).toBe(1);
    expect(geometry.gap).toBe(0.12);
    expect(geometry.points).toBe("none");
    expect(round1(contrast(tape.text, tape.background))).toBe(16.3);
    expect(round1(contrast(tape.muted, tape.background))).toBe(9.6);
    expect(round1(Math.min(...tape.series.map((color) => contrast(color, tape.background))))).toBe(5.7);
    expect(round3(minPair(tape.series, "deutan").min)).toBe(0.064);
    expect(round3(minPair(tape.series, "protan").min)).toBe(0.084);
    expect(round3(delta(simulate(tape.positive, "deutan"), simulate(tape.negative, "deutan")))).toBe(0.277);
    expect(round3(delta(simulate(tape.positive, "protan"), simulate(tape.negative, "protan")))).toBe(0.24);
  });

  it("keeps kite's cream and plum pair", () => {
    expect(kite.background).toBe("light-dark(#fff6ee, #2a2340)");
    expect(kite.fontFamily).toContain("Nunito");
    expect(resolveGeometry("kite")).toMatchObject({ strokeWidth: 2.6, cornerRadius: 14, gap: 0.4, points: "none" });
    expect(round1(contrast("#2a211c", "#fff6ee"))).toBe(14.8);
    expect(round1(contrast("#5e493f", "#fff6ee"))).toBe(7.9);
    expect(round1(contrast("#fff6ee", "#2a2340"))).toBe(13.9);
    expect(round1(contrast("#d9cde4", "#2a2340"))).toBe(9.8);
    expect(round3(minPair(["#c43766", "#2a5bd0", "#9a6a08", "#0d7a58", "#a33b88", "#7a4030"], "deutan").min)).toBe(0.059);
    expect(round3(minPair(["#ff8fb0", "#8eb0ff", "#f0c14a", "#7ddec0", "#fff6ee", "#f0b090"], "deutan").min)).toBe(0.046);
  });
});

describe("line bundle", () => {
  it("does not import the brand math or the new preset colours", () => {
    const themeSrc = readFileSync(join(here, "../theme.ts"), "utf8");
    expect(themeSrc).not.toContain("create-theme");
    expect(themeSrc).not.toContain("color-math");
    const features = readFileSync(join(here, "../features.ts"), "utf8");
    expect(features).not.toContain("mustard");
    expect(features).not.toContain("tape");
    const all = readFileSync(join(here, "../themes/all.ts"), "utf8");
    expect(all).not.toContain("create-theme");
    expect(all).not.toContain("themes/brand");
  });
});
