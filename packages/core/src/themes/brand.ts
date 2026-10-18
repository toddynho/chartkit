/**
 * Derive an 8-colour categorical palette from one or more brand colours.
 * Opt-in. Not imported by the line, all, or validate bundles, and not the default theme.
 * Reference backgrounds are white and near-black. Every returned colour clears 3:1 against that background.
 */

export type BrandScheme = "light" | "dark";

export const BRAND_REFERENCE_BACKGROUND = {
  light: "#ffffff",
  dark: "#09090b",
} as const;

const OFFSETS = [0, 150, 35, 210, 285, 95, 330, 175];

interface Lab {
  L: number;
  a: number;
  b: number;
}

interface Oklch {
  L: number;
  C: number;
  H: number;
}

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
    const hex = source
      ? closestPassing(source, hue, background, chosen)
      : spread(hue, anchor.C, scheme, background, chosen);
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

function hexToOklch(hex: string): Oklch {
  const lab = oklab(hex);
  let H = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L: lab.L, C: Math.hypot(lab.a, lab.b), H };
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

function srgbToLinear(channel: number): number {
  const x = channel / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number): number {
  const c = Math.min(1, Math.max(0, channel));
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
}

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

function relLum(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const left = relLum(a);
  const right = relLum(b);
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
}

function oklab(hex: string): Lab {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function delta(a: string, b: string): number {
  const left = oklab(a);
  const right = oklab(b);
  return Math.hypot(left.L - right.L, left.a - right.a, left.b - right.b);
}

const MAT = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
} as const;

function simulate(hex: string, kind: keyof typeof MAT): string {
  const lin = hexToRgb(hex).map(srgbToLinear);
  const matrix = MAT[kind];
  const out = [0, 1, 2].map((row) => matrix[row][0] * lin[0] + matrix[row][1] * lin[1] + matrix[row][2] * lin[2]);
  return rgbToHex(linearToSrgb(out[0]), linearToSrgb(out[1]), linearToSrgb(out[2]));
}

function oklchToHex(L: number, C: number, H: number): string | null {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  if ([r, g, bl].some((value) => value < -0.001 || value > 1.001)) return null;
  return rgbToHex(linearToSrgb(r), linearToSrgb(g), linearToSrgb(bl));
}
