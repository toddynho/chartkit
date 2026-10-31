/**
 * OKLCH, WCAG contrast, and colour-blind simulation shared by paletteFromBrand and createTheme.
 * Opt-in. The line bundle does not import this file.
 */

export interface Oklch {
  L: number;
  C: number;
  H: number;
}

interface Lab {
  L: number;
  a: number;
  b: number;
}

export type Deficiency = "protan" | "deutan" | "tritan";

export function hexToOklch(hex: string): Oklch {
  const lab = oklab(hex);
  let H = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L: lab.L, C: Math.hypot(lab.a, lab.b), H };
}

export function contrast(a: string, b: string): number {
  const left = relLum(a);
  const right = relLum(b);
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
}

export function delta(a: string, b: string): number {
  const left = oklab(a);
  const right = oklab(b);
  return Math.hypot(left.L - right.L, left.a - right.a, left.b - right.b);
}

export function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

export function minPair(colors: readonly string[], kind: Deficiency): { min: number; left: number; right: number } {
  let min = Infinity;
  let left = 0;
  let right = 1;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const score = delta(simulate(colors[i], kind), simulate(colors[j], kind));
      if (score < min) {
        min = score;
        left = i;
        right = j;
      }
    }
  }
  return { min, left, right };
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

export function simulate(hex: string, kind: Deficiency): string {
  const lin = hexToRgb(hex).map(srgbToLinear);
  const matrix = MAT[kind];
  const out = [0, 1, 2].map((row) => matrix[row][0] * lin[0] + matrix[row][1] * lin[1] + matrix[row][2] * lin[2]);
  return rgbToHex(linearToSrgb(out[0]), linearToSrgb(out[1]), linearToSrgb(out[2]));
}

export function oklchToHex(L: number, C: number, H: number): string | null {
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

function srgbToLinear(channel: number): number {
  const x = channel / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number): number {
  const c = Math.min(1, Math.max(0, channel));
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

function relLum(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
