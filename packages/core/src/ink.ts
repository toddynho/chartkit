type RGB = [number, number, number];

type Node =
  | { kind: "rgb"; rgb: RGB }
  | { kind: "ld"; light: Node; dark: Node }
  | { kind: "mix"; amount: number; base: Node; into: Node }
  | { kind: "var"; fallback: Node | null };

const INKS: Array<[string, RGB]> = [
  ["#1d1d1f", [29, 29, 31]],
  ["#f5f5f7", [245, 245, 247]],
  ["#000000", [0, 0, 0]],
  ["#ffffff", [255, 255, 255]],
];

/** Branch hue, mixed toward the page. Siblings at one depth shift that mix so neighbours do not match. */
export function siblingFill(base: string, depth: number, index: number, count: number): string {
  if (depth <= 0) return base;
  const depthMix = Math.max(48, 78 - (depth - 1) * 12);
  const shift = count <= 1 ? 0 : Math.round((index - (count - 1) / 2) * (18 / Math.max(1, count - 1)));
  const mix = Math.min(88, Math.max(46, depthMix + shift));
  return `color-mix(in srgb, ${base} ${mix}%, light-dark(#ffffff, #1c1c1e))`;
}

/**
 * Text colour for a fill. Uses the colour the SVG actually paints: the
 * fallback inside var(), each side of light-dark(), and color-mix().
 * Prefers #1d1d1f or #f5f5f7 when that clears 4.5:1, otherwise black or white.
 */
export function labelInk(fill: string): string {
  const pair = resolve(fill);
  if (!pair) return "light-dark(#1d1d1f, #f5f5f7)";
  const light = choose(pair.light);
  const dark = choose(pair.dark);
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

/** Lower of the light-scheme and dark-scheme contrast ratios for labelInk(fill). */
export function labelContrast(fill: string): number {
  const pair = resolve(fill);
  if (!pair) return 1;
  return Math.min(ratio(inkRgb(choose(pair.light)), pair.light), ratio(inkRgb(choose(pair.dark)), pair.dark));
}

function choose(bg: RGB): string {
  for (const [hex, rgb] of INKS) if (ratio(rgb, bg) >= 4.5) return hex;
  let best = INKS[0][0];
  let bestRatio = 0;
  for (const [hex, rgb] of INKS) {
    const value = ratio(rgb, bg);
    if (value > bestRatio) {
      best = hex;
      bestRatio = value;
    }
  }
  return best;
}

function inkRgb(hex: string): RGB {
  return INKS.find((item) => item[0] === hex)?.[1] ?? INKS[0][1];
}

function ratio(ink: RGB, bg: RGB): number {
  const a = lum(ink);
  const b = lum(bg);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

function lum(rgb: RGB): number {
  const f = (channel: number) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}

function resolve(fill: string): { light: RGB; dark: RGB } | null {
  const parsed = read(fill.trim(), 0);
  if (!parsed) return null;
  const light = paint(parsed.node, "light");
  const dark = paint(parsed.node, "dark");
  if (!light || !dark) return null;
  return { light, dark };
}

function paint(node: Node, scheme: "light" | "dark"): RGB | null {
  if (node.kind === "rgb") return node.rgb;
  if (node.kind === "var") return node.fallback ? paint(node.fallback, scheme) : null;
  if (node.kind === "ld") return paint(scheme === "light" ? node.light : node.dark, scheme);
  const base = paint(node.base, scheme);
  const into = paint(node.into, scheme);
  if (!base || !into) return null;
  const p = node.amount / 100;
  return [base[0] * p + into[0] * (1 - p), base[1] * p + into[1] * (1 - p), base[2] * p + into[2] * (1 - p)];
}

function read(s: string, i: number): { node: Node; i: number } | null {
  while (s[i] === " ") i += 1;
  if (s.startsWith("light-dark(", i)) {
    const light = read(s, i + "light-dark(".length);
    if (!light) return null;
    const dark = read(s, comma(s, light.i));
    if (!dark) return null;
    return { node: { kind: "ld", light: light.node, dark: dark.node }, i: close(s, dark.i) };
  }
  if (s.startsWith("color-mix(in srgb,", i)) {
    const base = read(s, i + "color-mix(in srgb,".length);
    if (!base) return null;
    let at = base.i;
    while (s[at] === " ") at += 1;
    const amount = /^(\d+(?:\.\d+)?)%/.exec(s.slice(at));
    if (!amount) return null;
    const into = read(s, comma(s, at + amount[0].length));
    if (!into) return null;
    return { node: { kind: "mix", amount: Number(amount[1]), base: base.node, into: into.node }, i: close(s, into.i) };
  }
  if (s.startsWith("var(", i)) {
    let at = i + 4;
    while (at < s.length && s[at] !== "," && s[at] !== ")") at += 1;
    if (s[at] === ",") {
      const fallback = read(s, at + 1);
      if (!fallback) return null;
      return { node: { kind: "var", fallback: fallback.node }, i: close(s, fallback.i) };
    }
    return { node: { kind: "var", fallback: null }, i: close(s, at) };
  }
  const hex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/.exec(s.slice(i));
  if (hex) return { node: { kind: "rgb", rgb: hexRgb(hex[1]) }, i: i + hex[0].length };
  const rgb = /^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)/.exec(s.slice(i));
  if (rgb) {
    const end = s.indexOf(")", i);
    if (end < 0) return null;
    return { node: { kind: "rgb", rgb: [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] }, i: end + 1 };
  }
  return null;
}

function comma(s: string, i: number): number {
  while (s[i] === " ") i += 1;
  return s[i] === "," ? i + 1 : i;
}

function close(s: string, i: number): number {
  while (s[i] === " ") i += 1;
  return s[i] === ")" ? i + 1 : i;
}

function hexRgb(hex: string): RGB {
  const full = hex.length === 3 ? hex.split("").map((ch) => ch + ch).join("") : hex;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}
