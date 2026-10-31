/**
 * Theme from a brand. Builds on paletteFromBrand, then fits the colours to
 * the tinted surface and a colour-blind-safe up/down pair. Adjustments are
 * returned so a host can show what moved.
 *
 * paletteFromBrand keeps each colour at 3:1 on white or #09090b. This step
 * rechecks the tinted surface and chooses the semantic pair.
 *
 * Opt-in, via @chartkitdev/core/themes/brand. The line bundle does not import it.
 * Pattern tiles are a suggestion only. The renderer does not paint them.
 */
import { registerBrandTheme } from "../feature-hooks";
import type { PresetTokens } from "../theme";
import { contrast, delta, hexToOklch, hexToRgb, minPair, oklchToHex, simulate } from "./color-math";
import { canonicalHex } from "./hex";
import { paletteFromBrand, type BrandScheme } from "./palette";

export interface Adjustment {
  role: string;
  from: string;
  to: string;
  reason: string;
}

export interface BrandMode {
  background: string;
  surface: string;
  text: string;
  muted: string;
  grid: string;
  axis: string;
  track: string;
  accent: string;
  positive: string;
  negative: string;
  neutral: string;
  series: string[];
}

export interface BrandTextures {
  id: "riso" | "blueprint" | "newsprint";
  tiles: string[];
  dashes: string[];
  grain: boolean;
  why: string;
}

export interface BrandChecks {
  lightText: number;
  darkText: number;
  lightMuted: number;
  darkMuted: number;
  lightSeriesMin: number;
  darkSeriesMin: number;
  deutan: number;
  protan: number;
  semanticDeutan: number;
  semanticProtan: number;
}

export interface BrandTheme {
  brand: string[];
  light: BrandMode;
  dark: BrandMode;
  textures: BrandTextures;
  adjustments: Adjustment[];
  checks: BrandChecks;
}

const DASHES = ["", "7 4", "2 3", "8 3 2 3", "12 3 2 3 2 3", "4 2", "1.5 3", "5 3"];

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function paint(L: number, C: number, H: number): string | null {
  let hue = H % 360;
  if (hue < 0) hue += 360;
  return oklchToHex(round(L), round(C), hue);
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Walk lightness until the colour clears `min` against `bg`. */
function fitContrast(hex: string, bg: string, min: number, prefer: "darken" | "lighten"): { hex: string; changed: boolean } {
  if (contrast(hex, bg) >= min) return { hex, changed: false };
  const src = hexToOklch(hex);
  const step = prefer === "darken" ? -0.02 : 0.02;
  for (let i = 1; i <= 24; i++) {
    const L = src.L + step * i;
    if (L < 0.18 || L > 0.92) break;
    for (let c = src.C; c >= 0.03; c -= 0.01) {
      const next = paint(L, c, src.H);
      if (next && contrast(next, bg) >= min) return { hex: next, changed: next.toLowerCase() !== hex.toLowerCase() };
    }
  }
  return { hex, changed: false };
}

function nudgeHue(hex: string, bg: string, degrees: number, min: number): string {
  const src = hexToOklch(hex);
  for (const deltaH of [degrees, -degrees, degrees * 2, -degrees * 2]) {
    for (let c = src.C; c >= 0.04; c -= 0.015) {
      const next = paint(src.L, c, src.H + deltaH);
      if (next && contrast(next, bg) >= min) return next;
    }
  }
  return hex;
}

function separate(colors: string[], bg: string, adjustments: Adjustment[], scheme: BrandScheme): string[] {
  const next = colors.slice();
  for (let pass = 0; pass < 3; pass++) {
    let worstI = -1;
    let worstJ = -1;
    let worst = Infinity;
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        const deutan = delta(simulate(next[i], "deutan"), simulate(next[j], "deutan"));
        const protan = delta(simulate(next[i], "protan"), simulate(next[j], "protan"));
        const score = Math.min(deutan, protan);
        if (score < worst) {
          worst = score;
          worstI = i;
          worstJ = j;
        }
      }
    }
    if (worst >= 0.05 || worstJ < 0) break;
    const before = next[worstJ];
    const after = nudgeHue(before, bg, 18 + pass * 8, 3.05);
    if (after.toLowerCase() === before.toLowerCase()) break;
    next[worstJ] = after;
    adjustments.push({
      role: `${scheme} series ${worstJ + 1}`,
      from: before,
      to: after,
      reason: `Moved off series ${worstI + 1}. Closest pair under deuteranopia/protanopia was Δ ${worst.toFixed(3)}; the floor used here is 0.05.`,
    });
  }
  return next;
}

function semantic(bg: string, scheme: BrandScheme, brandHue: number): { positive: string; negative: string } {
  const light = scheme === "light";
  const posL = light ? 0.46 : 0.78;
  const negL = light ? 0.5 : 0.72;
  // Blue and vermillion stay apart for the common deficiencies. A blue brand
  // can keep its own hue for "up"; red and green brands should not.
  const posHue = brandHue > 200 && brandHue < 280 ? brandHue : 255;
  const positive = paint(posL, 0.13, posHue) ?? (light ? "#0366a8" : "#7eb6ff");
  const negative = paint(negL, 0.15, 32) ?? (light ? "#c4501a" : "#ff8a4c");
  return {
    positive: fitContrast(positive, bg, 3.1, light ? "darken" : "lighten").hex,
    negative: fitContrast(negative, bg, 3.1, light ? "darken" : "lighten").hex,
  };
}

function mode(brand: string[], scheme: BrandScheme, adjustments: Adjustment[]): BrandMode {
  const anchor = hexToOklch(brand[0]);
  const light = scheme === "light";
  let background = paint(light ? 0.975 : 0.22, light ? 0.012 : 0.03, anchor.H) ?? (light ? "#f6f5f3" : "#16181c");
  if (light && contrast(background, "#000000") < 1.05) background = "#f6f5f3";
  const surface = paint(light ? 0.995 : 0.28, light ? 0.006 : 0.025, anchor.H) ?? (light ? "#ffffff" : "#22242a");
  let text = paint(light ? 0.28 : 0.96, light ? 0.02 : 0.01, anchor.H) ?? (light ? "#1a1918" : "#f5f4f2");
  const textFit = fitContrast(text, background, 7, light ? "darken" : "lighten");
  if (textFit.changed) {
    adjustments.push({ role: `${scheme} text`, from: text, to: textFit.hex, reason: `Raised text contrast to 7:1 on ${background}.` });
    text = textFit.hex;
  }
  let muted = paint(light ? 0.48 : 0.78, light ? 0.02 : 0.015, anchor.H) ?? (light ? "#5c574f" : "#c8c2b8");
  const mutedFit = fitContrast(muted, background, 4.5, light ? "darken" : "lighten");
  if (mutedFit.changed) {
    adjustments.push({ role: `${scheme} muted`, from: muted, to: mutedFit.hex, reason: "Tick labels are 11px, so muted ink has to clear WCAG AA 4.5:1." });
    muted = mutedFit.hex;
  }
  let series = paletteFromBrand(brand, scheme);
  series = series.map((color, index) => {
    const fitted = fitContrast(color, background, 3.05, light ? "darken" : "lighten");
    if (fitted.changed) {
      adjustments.push({
        role: `${scheme} series ${index + 1}`,
        from: color,
        to: fitted.hex,
        reason: `paletteFromBrand cleared 3:1 on ${light ? "white" : "#09090b"}. This surface is ${background}, so the colour was adjusted.`,
      });
    }
    return fitted.hex;
  });
  series = separate(series, background, adjustments, scheme);
  const pair = semantic(background, scheme, anchor.H);
  const semD = delta(simulate(pair.positive, "deutan"), simulate(pair.negative, "deutan"));
  const semP = delta(simulate(pair.positive, "protan"), simulate(pair.negative, "protan"));
  if (Math.min(semD, semP) < 0.12) {
    const before = pair.negative;
    pair.negative = nudgeHue(pair.negative, background, 24, 3.1);
    if (pair.negative !== before) {
      adjustments.push({
        role: `${scheme} negative`,
        from: before,
        to: pair.negative,
        reason: "Up and down were too close under a simulated deficiency, so the down colour moved toward orange.",
      });
    }
  }
  return {
    background,
    surface,
    text,
    muted,
    grid: rgba(text, light ? 0.12 : 0.16),
    axis: rgba(text, light ? 0.38 : 0.42),
    track: rgba(text, 0.1),
    accent: series[0] ?? pair.positive,
    positive: pair.positive,
    negative: pair.negative,
    neutral: muted,
    series,
  };
}

function suggest(brand: string): BrandTextures {
  const { H, C } = hexToOklch(brand);
  if (H >= 155 && H <= 255) {
    return {
      id: "blueprint",
      tiles: ["hatch", "hatch-back", "crosshatch", "dots", "pinstripe", "grid", "wave", "stipple"],
      dashes: DASHES,
      grain: false,
      why: "A cool brand reads as a drawing. Hatch angle is a second encoding if the chart is printed in one color.",
    };
  }
  if (C >= 0.08 && (H < 110 || H > 270)) {
    return {
      id: "riso",
      tiles: ["dots", "hatch", "pinstripe", "crosshatch", "stipple", "grid", "wave", "hatch-back"],
      dashes: DASHES,
      grain: false,
      why: "A warm, high-chroma brand behaves like a spot ink. Dots and hatches keep extra series apart when the palette runs out of hues.",
    };
  }
  return {
    id: "newsprint",
    tiles: ["stipple", "dots", "hatch", "crosshatch", "pinstripe", "grid", "wave", "hatch-back"],
    dashes: DASHES,
    grain: true,
    why: "Density and a paper grain carry series that sit near the brand hue. Grain is one filter on the chart, not one per mark.",
  };
}

export function createTheme(input: { brand: string | readonly string[] }): BrandTheme {
  const brand = (typeof input.brand === "string" ? [input.brand] : [...input.brand]).map((color) => {
    const hex = canonicalHex(color);
    if (!hex || !color.trim().startsWith("#")) throw new TypeError(`brand colour must be hex, received ${color}`);
    return hex;
  });
  if (brand.length === 0) throw new TypeError("brand colour is required");
  const adjustments: Adjustment[] = [];
  const anchor = brand[0];
  const light = mode(brand, "light", adjustments);
  const dark = mode(brand, "dark", adjustments);
  if (light.series[0] && light.series[0].toLowerCase() !== anchor) {
    adjustments.unshift({
      role: "brand anchor",
      from: anchor,
      to: light.series[0],
      reason: "The lead series is the brand pulled to a lightness that clears 3:1 on the light surface and stays in gamut.",
    });
  }
  return {
    brand,
    light,
    dark,
    textures: suggest(anchor),
    adjustments,
    checks: {
      lightText: contrast(light.text, light.background),
      darkText: contrast(dark.text, dark.background),
      lightMuted: contrast(light.muted, light.background),
      darkMuted: contrast(dark.muted, dark.background),
      lightSeriesMin: Math.min(...light.series.map((color) => contrast(color, light.background))),
      darkSeriesMin: Math.min(...dark.series.map((color) => contrast(color, dark.background))),
      deutan: minPair(light.series, "deutan").min,
      protan: minPair(light.series, "protan").min,
      semanticDeutan: delta(simulate(light.positive, "deutan"), simulate(light.negative, "deutan")),
      semanticProtan: delta(simulate(light.positive, "protan"), simulate(light.negative, "protan")),
    },
  };
}

function ld(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function ldList(light: readonly string[], dark: readonly string[]): string[] {
  const n = Math.max(light.length, dark.length);
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(ld(light[i] ?? light[light.length - 1], dark[i] ?? dark[dark.length - 1]));
  return out;
}

/** Preset tokens for a derived theme. `auto` keeps both schemes in light-dark(). */
export function tokensFromBrand(theme: BrandTheme, colorMode: "light" | "dark" | "auto" = "auto"): PresetTokens {
  const light = theme.light;
  const dark = theme.dark;
  const pick = (key: keyof BrandMode): string => {
    const left = light[key];
    const right = dark[key];
    if (Array.isArray(left) || Array.isArray(right)) return "";
    if (colorMode === "light") return left;
    if (colorMode === "dark") return right;
    return ld(left, right);
  };
  const series = colorMode === "light" ? light.series : colorMode === "dark" ? dark.series : ldList(light.series, dark.series);
  return {
    background: pick("background"),
    surface: pick("surface"),
    text: pick("text"),
    muted: pick("muted"),
    grid: pick("grid"),
    axis: pick("axis"),
    track: pick("track"),
    accent: pick("accent"),
    positive: pick("positive"),
    negative: pick("negative"),
    series,
    lines: series,
  };
}

/** Let resolvePreset honour theme.brand. Called when this module is imported. */
export function installBrandTheme(): void {
  registerBrandTheme((brand, colorMode) => tokensFromBrand(createTheme({ brand }), colorMode));
}
