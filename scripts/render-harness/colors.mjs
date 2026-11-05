/** Resolve the colours an SVG actually paints, then score WCAG contrast. */

export function resolvePaint(input, mode) {
  if (!input) return null;
  let text = String(input).trim();
  if (!text || text.startsWith("url(")) return null;
  text = resolveLightDark(text, mode === "dark");
  text = resolveVars(text);
  text = resolveMix(text);
  return parseColor(text.trim());
}

export function contrast(a, b) {
  if (!a || !b || a.a === 0 || b.a === 0) return null;
  const left = relLum(flatten(a));
  const right = relLum(flatten(b));
  const [hi, lo] = left > right ? [left, right] : [right, left];
  return (hi + 0.05) / (lo + 0.05);
}

export function flatten(color, page) {
  if (!page || color.a >= 0.999) return color;
  const a = color.a;
  return {
    r: Math.round(color.r * a + page.r * (1 - a)),
    g: Math.round(color.g * a + page.g * (1 - a)),
    b: Math.round(color.b * a + page.b * (1 - a)),
    a: 1,
  };
}

export function hexOf(color) {
  const n = (v) => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, "0");
  return `#${n(color.r)}${n(color.g)}${n(color.b)}`;
}

function relLum(color) {
  const lin = (channel) => {
    const x = channel / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(color.r) + 0.7152 * lin(color.g) + 0.0722 * lin(color.b);
}

export function parseColor(input) {
  if (!input) return null;
  const text = input.trim().toLowerCase();
  if (text === "transparent" || text === "none") return { r: 0, g: 0, b: 0, a: 0 };
  if (text === "currentcolor") return null;
  const hex = /^#([0-9a-f]{3,8})$/.exec(text);
  if (hex) {
    let raw = hex[1];
    if (raw.length === 3 || raw.length === 4) raw = [...raw].map((ch) => ch + ch).join("");
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    const a = raw.length >= 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(text);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    let a = parts[3] === undefined ? 1 : Number(parts[3]);
    if (String(parts[3] ?? "").endsWith("%")) a = Number(parts[3]) / 100;
    if (a > 1) a = a / 255;
    if (![r, g, b].every(Number.isFinite)) return null;
    return { r, g, b, a: Number.isFinite(a) ? a : 1 };
  }
  return null;
}

function resolveLightDark(input, dark) {
  const token = "light-dark(";
  let out = "";
  for (let i = 0; i < input.length; i++) {
    if (input.startsWith(token, i)) {
      const open = i + token.length - 1;
      const end = matchingParen(input, open);
      if (end < 0) {
        out += input[i];
        continue;
      }
      const inside = input.slice(open + 1, end);
      const comma = splitTop(inside);
      const light = comma < 0 ? inside : inside.slice(0, comma);
      const night = comma < 0 ? inside : inside.slice(comma + 1);
      out += resolveLightDark((dark ? night : light).trim(), dark);
      i = end;
      continue;
    }
    out += input[i];
  }
  return out;
}

function resolveMix(input) {
  const token = "color-mix(in srgb,";
  let out = "";
  for (let i = 0; i < input.length; i++) {
    if (input.startsWith(token, i)) {
      const open = i + "color-mix".length;
      const end = matchingParen(input, open);
      if (end < 0) {
        out += input[i];
        continue;
      }
      const body = input.slice(open + 1, end).replace(/^\s*in srgb,\s*/, "");
      const colors = body.split(",").map((part) => part.trim()).filter(Boolean);
      const amount = Number((colors[0]?.match(/(\d+(?:\.\d+)?)%/) ?? [])[1]);
      const base = (colors[0] ?? "").replace(/\s+\d+(?:\.\d+)?%$/, "");
      const into = colors[1] ?? "";
      const a = parseColor(resolveMix(base));
      const b = parseColor(resolveMix(into));
      if (!a || !b || !Number.isFinite(amount)) {
        out += input[i];
        continue;
      }
      const p = amount / 100;
      const mix = (left, right) => Math.round(left * p + right * (1 - p));
      out += `#${[mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
      i = end;
      continue;
    }
    out += input[i];
  }
  return out;
}

function resolveVars(input) {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    if (input.startsWith("var(", i)) {
      const open = i + 3;
      const end = matchingParen(input, open);
      if (end < 0) {
        out += input[i];
        continue;
      }
      const inside = input.slice(open + 1, end);
      const comma = splitTop(inside);
      const fallback = comma < 0 ? "" : inside.slice(comma + 1);
      out += resolveVars(fallback.trim());
      i = end;
      continue;
    }
    out += input[i];
  }
  return out;
}

function matchingParen(value, open) {
  let depth = 0;
  for (let i = open; i < value.length; i++) {
    if (value[i] === "(") depth += 1;
    else if (value[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitTop(inside) {
  let depth = 0;
  for (let i = 0; i < inside.length; i++) {
    const ch = inside[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (ch === "," && depth === 0) return i;
  }
  return -1;
}
