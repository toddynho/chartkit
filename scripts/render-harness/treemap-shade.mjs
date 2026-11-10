/**
 * Nested treemap siblings need a real lightness spread, black-or-white ink
 * chosen by contrast, and a gap of at least 1px. A flat fill fails the spread.
 * This claim is not allowlisted.
 */
import { contrast, resolvePaint } from "./colors.mjs";

const SPREAD = 12;

export function treemapShadeProblems(svg) {
  if (!svg || !svg.includes('data-ck-type="treemap"')) return [];
  const nodes = rects(svg);
  if (!nodes.some((node) => node.path.length >= 2)) return [];
  const problems = [];
  const groups = new Map();
  for (const node of nodes) {
    if (node.path.length < 2) continue;
    const key = node.path.slice(0, -1).join(" / ");
    const list = groups.get(key) ?? [];
    list.push(node);
    groups.set(key, list);
  }
  for (const [key, list] of groups) {
    if (list.length < 2) continue;
    for (const mode of ["light", "dark"]) {
      const lights = list.map((node) => lightness(node.fill, mode)).filter((value) => value != null);
      if (lights.length < 2) continue;
      const span = Math.max(...lights) - Math.min(...lights);
      if (span < SPREAD) problems.push(`${key} siblings span ${span.toFixed(1)} L* in ${mode} mode, need ${SPREAD}`);
    }
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const gap = gutter(list[i], list[j]);
        if (gap == null) continue;
        if (gap < 1) problems.push(`${nameOf(list[i])} is not separated from ${nameOf(list[j])}`);
      }
    }
  }
  for (const text of texts(svg)) {
    const node = smallestContaining(nodes, text);
    if (!node || node.path.length < 2) continue;
    for (const mode of ["light", "dark"]) {
      const bg = resolvePaint(node.fill, mode);
      const ink = resolvePaint(text.fill, mode);
      if (!bg || !ink) continue;
      const black = contrast(rgb(0), bg);
      const white = contrast(rgb(255), bg);
      const want = black >= white ? "#000000" : "#ffffff";
      const got = hex(ink);
      if (got !== want) problems.push(`${nameOf(node)} ink is ${got} in ${mode} mode, contrast wants ${want}`);
      const ratio = contrast(ink, bg);
      if (ratio != null && ratio < 4.5) problems.push(`${nameOf(node)} ink is ${ratio.toFixed(2)}:1 in ${mode} mode`);
    }
  }
  const labels = texts(svg);
  for (const list of groups.values()) {
    for (const mode of ["light", "dark"]) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const left = lightness(list[i].fill, mode);
          const right = lightness(list[j].fill, mode);
          if (left == null || right == null || Math.abs(left - right) >= 8) continue;
          const a = painted(list[i], labels, mode);
          const b = painted(list[j], labels, mode);
          if (a && b && a !== b) problems.push(`${nameOf(list[i])} and ${nameOf(list[j])} flip ink across ${Math.abs(left - right).toFixed(1)} L*`);
        }
      }
    }
  }
  return problems;
}

function painted(node, labels, mode) {
  const text = labels.find((item) => item.x >= node.x - 1 && item.x <= node.x + node.w + 1 && item.y >= node.y - 1 && item.y <= node.y + node.h + 4);
  if (!text) return null;
  const ink = resolvePaint(text.fill, mode);
  return ink ? hex(ink) : null;
}

function gutter(a, b) {
  const xGap = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w);
  const yGap = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h);
  if (xGap < 0 && yGap < 0) return Math.max(xGap, yGap);
  if (yGap < 0) return xGap;
  if (xGap < 0) return yGap;
  if (xGap > 8 && yGap > 8) return null;
  return Math.min(xGap, yGap);
}

function lightness(fill, mode) {
  const color = resolvePaint(fill, mode);
  if (!color || color.a < 0.5) return null;
  const lin = (channel) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const y = 0.2126 * lin(color.r) + 0.7152 * lin(color.g) + 0.0722 * lin(color.b);
  return y <= 0.008856 ? y * 903.3 : 116 * Math.cbrt(y) - 16;
}

function rgb(channel) {
  return { r: channel, g: channel, b: channel, a: 1 };
}

function hex(color) {
  const n = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  const value = `#${n(color.r)}${n(color.g)}${n(color.b)}`;
  return value === "#ffffff" ? "#ffffff" : value === "#000000" ? "#000000" : value;
}

function smallestContaining(nodes, text) {
  let best = null;
  for (const node of nodes) {
    if (text.x < node.x - 1 || text.x > node.x + node.w + 1) continue;
    if (text.y < node.y - 1 || text.y > node.y + node.h + 4) continue;
    if (!best || node.w * node.h < best.w * best.h) best = node;
  }
  return best;
}

function nameOf(node) {
  return node.path.join(" / ") || "tile";
}

function rects(svg) {
  const nodes = [];
  for (const match of svg.matchAll(/<rect\b[^>]*>/g)) {
    const tag = match[0];
    if (!/data-ck-mark="(?:tile|group)"/.test(tag)) continue;
    const label = decode(/aria-label="([^"]*)"/.exec(tag)?.[1] ?? "").split(":")[0] ?? "";
    nodes.push({
      path: label.split(" / ").map((part) => part.trim()).filter(Boolean),
      x: num(tag, "x"),
      y: num(tag, "y"),
      w: num(tag, "width"),
      h: num(tag, "height"),
      fill: /(?:^|\s)fill="([^"]*)"/.exec(tag)?.[1] ?? "",
    });
  }
  return nodes;
}

function texts(svg) {
  const out = [];
  for (const match of svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)) {
    const tag = match[0];
    out.push({
      x: num(tag, "x"),
      y: num(tag, "y"),
      fill: /(?:^|\s)fill="([^"]*)"/.exec(tag)?.[1] ?? "",
    });
  }
  return out;
}

function num(tag, name) {
  return Number(new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1] ?? 0);
}

function decode(text) {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}
