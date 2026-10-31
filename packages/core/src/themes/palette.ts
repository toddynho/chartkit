/**
 * Derive an 8-colour categorical palette from one or more brand colours.
 * Opt-in. Not imported by the line, all, or validate bundles, and not the default theme.
 * Reference backgrounds are white and near-black. Every returned colour clears 3:1 against that background.
 */

import { contrast, delta, hexToOklch, oklchToHex, simulate, type Oklch } from "./color-math";

export type BrandScheme = "light" | "dark";

export const BRAND_REFERENCE_BACKGROUND = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

const OFFSETS = [0, 150, 35, 210, 285, 95, 330, 175];

export function paletteFromBrand(brand: string | readonly string[], scheme: BrandScheme = "light"): string[] {
  if (scheme !== "light" && scheme !== "dark") {
    throw new TypeError('scheme must be "light" or "dark"');
  }
  const inputs = (typeof brand === "string" ? [brand] : [...brand]).map(parseHex);
  if (inputs.length === 0) throw new TypeError("brand colour is required");
  const background = BRAND_REFERENCE_BACKGROUND[scheme];
  const anchor = inputs[0].C < 0.02 ? { ...inputs[0], H: 250 } : inputs[0];
  const chosen: string[] = [];
  for (let index = 0; index < 8; index++) {
    const source = index < inputs.length ? inputs[index] : null;
    const hue = source ? (source.C < 0.02 ? anchor.H : source.H) : (anchor.H + OFFSETS[index]) % 360;
    const hex = source ? closestPassing(source, hue, background, chosen) : spread(hue, anchor.C, scheme, background, chosen);
    chosen.push(hex);
  }
  return chosen;
}

function closestPassing(source: Oklch, hue: number, background: string, taken: readonly string[]): string {
  const origin = oklchToHex(source.L, source.C, source.H) ?? "#000000";
  let best: string | null = null;
  let bestDistance = Infinity;
  for (let L = 0.32; L <= 0.9; L += 0.015) {
    for (let C = 0.16; C >= 0.04; C -= 0.01) {
      const hex = oklchToHex(round3(L), round3(C), hue);
      if (!hex || taken.includes(hex) || contrast(hex, background) < 3.1) continue;
      const distance = delta(hex, origin);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = hex;
      }
    }
  }
  if (!best) throw new TypeError("brand colour has no in-gamut match at 3:1");
  return best;
}

function spread(hue: number, chroma: number, scheme: BrandScheme, background: string, taken: readonly string[]): string {
  const targetC = Math.min(0.14, Math.max(0.08, chroma || 0.1));
  const [l0, l1] = scheme === "dark" ? [0.68, 0.86] : [0.4, 0.58];
  let best: string | null = null;
  let bestScore = -1;
  for (let L = l0; L <= l1; L += 0.02) {
    for (let C = targetC; C >= 0.06; C -= 0.01) {
      const hex = oklchToHex(round3(L), round3(C), hue);
      if (!hex || taken.includes(hex) || contrast(hex, background) < 3.1) continue;
      const score = minDistance(hex, taken);
      if (score > bestScore) {
        bestScore = score;
        best = hex;
      }
    }
  }
  if (!best) throw new TypeError("could not place a palette colour");
  return best;
}

function parseHex(input: string): Oklch {
  const raw = input.trim();
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(raw);
  if (!match) throw new TypeError(`brand colour must be a hex value, received ${input}`);
  const body = match[1].length === 3 ? [...match[1]].map((char) => char + char).join("") : match[1];
  return hexToOklch("#" + body.toLowerCase());
}

function minDistance(hex: string, taken: readonly string[]): number {
  let score = Infinity;
  for (const other of taken) {
    score = Math.min(score, delta(hex, other));
    score = Math.min(score, delta(simulate(hex, "protan"), simulate(other, "protan")));
    score = Math.min(score, delta(simulate(hex, "deutan"), simulate(other, "deutan")));
    score = Math.min(score, delta(simulate(hex, "tritan"), simulate(other, "tritan")));
  }
  return score;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
