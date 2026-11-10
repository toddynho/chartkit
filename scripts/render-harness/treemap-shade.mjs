/**
 * Nested treemap tiles have to read as separate components.
 * At depth 2 or greater, a group and the tiles inside it must not resolve to
 * one light-mode fill, and each child must sit apart from its parent by an
 * opaque stroke or a gap that shows a different colour.
 * This claim is not allowlisted.
 */
import { hexOf, resolvePaint } from "./colors.mjs";

const VISIBLE = 18;

export function treemapShadeProblems(svg) {
  if (!svg || !svg.includes('data-ck-type="treemap"')) return [];
  const nodes = rects(svg);
  if (!nodes.some((node) => node.path.length >= 2)) return [];
  const problems = [];
  for (const parent of nodes) {
    const children = nodes.filter((child) => direct(parent, child, nodes));
    if (!children.length) continue;
    if (!children.some((child) => child.path.length >= 2) && parent.path.length < 2) continue;
    const fills = [parent, ...children].map((node) => paintHex(node.fill));
    if (new Set(fills).size < 2) {
      problems.push(`${nameOf(parent)} paints one fill on the group and its children`);
    }
    for (const child of children) {
      if (separated(parent, child)) continue;
      problems.push(`${nameOf(child)} is not separated from ${nameOf(parent)}`);
    }
  }
  return problems;
}

function separated(parent, child) {
  const stroke = resolvePaint(child.stroke, "light");
  const fill = resolvePaint(child.fill, "light");
  const parentFill = resolvePaint(parent.fill, "light");
  const stroked = stroke && stroke.a > 0.5 && child.sw >= 1 && distance(stroke, fill) >= VISIBLE;
  const inset =
    child.x >= parent.x + 2 - 0.05 &&
    child.y >= parent.y + 2 - 0.05 &&
    child.x + child.w <= parent.x + parent.w - 2 + 0.05 &&
    child.y + child.h <= parent.y + parent.h - 2 + 0.05;
  const gap = inset && distance(parentFill, fill) >= VISIBLE;
  return Boolean(stroked || gap);
}

function paintHex(fill) {
  const color = resolvePaint(fill, "light");
  if (!color || color.a < 0.5) return "none";
  return hexOf(color);
}

function distance(a, b) {
  if (!a || !b || a.a < 0.5 || b.a < 0.5) return 0;
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function nameOf(node) {
  return node.path.join(" / ") || "group";
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
      stroke: /(?:^|\s)stroke="([^"]*)"/.exec(tag)?.[1] ?? "",
      sw: Number(/stroke-width="([^"]*)"/.exec(tag)?.[1] ?? 0),
    });
  }
  return nodes;
}

function direct(parent, child, nodes) {
  if (!holds(parent, child)) return false;
  return !nodes.some((mid) => mid !== parent && mid !== child && holds(parent, mid) && holds(mid, child));
}

function holds(parent, child) {
  return (
    child.x >= parent.x - 0.05 &&
    child.y >= parent.y - 0.05 &&
    child.x + child.w <= parent.x + parent.w + 0.05 &&
    child.y + child.h <= parent.y + parent.h + 0.05 &&
    child.w * child.h < parent.w * parent.h - 0.5
  );
}

function num(tag, name) {
  return Number(new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1] ?? 0);
}

function decode(text) {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}
