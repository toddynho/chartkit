/** Server-only mark. The open-source library does not draw this. */

const MARK = "chartkit.dev";
const BAND = 16;
const HREF = "https://chartkit.dev/cloud";

/**
 * Outer margin on every Cloud SVG so a chat embed is not flush with the image edge.
 * The library drawing stays put. Only the viewBox (and a numeric width/height) grows.
 * Top is larger than the sides: axis titles sit near y=0 and the watermark already
 * opens the bottom. A percentage width is left alone so a responsive embed still stretches.
 */
export const EMBED_PAD_TOP = 24;
export const EMBED_PAD_X = 16;
export const EMBED_PAD_BOTTOM = 12;

const LIGHT = new Set(["", "auto", "soft", "refined", "editorial"]);

export function themeIsDark(theme: string | undefined, svg: string): boolean {
  if (theme && !LIGHT.has(theme)) return true;
  return svg.includes("var(--ck-background, #0c0c0c)") || svg.includes("var(--ck-text, #ffffff)");
}

/** Pad a library SVG for inline embed, and reserve the watermark band when asked. */
export function presentSvg(svg: string, options: { watermark: boolean; dark: boolean }): string {
  const openMatch = svg.match(/<svg\b[^>]*>/);
  const close = svg.lastIndexOf("</svg>");
  if (!openMatch || close < 0) return svg;
  const open = openMatch[0];
  const box = viewBox(open);
  const x0 = box?.x ?? 0;
  const y0 = box?.y ?? 0;
  const width = box?.w ?? numericAttr(open, "width") ?? 640;
  const height = box?.h ?? numericAttr(open, "height") ?? 360;
  const extraBottom = EMBED_PAD_BOTTOM + (options.watermark ? BAND : 0);
  let nextOpen = setAttr(
    open,
    "viewBox",
    `${trimNum(x0 - EMBED_PAD_X)} ${trimNum(y0 - EMBED_PAD_TOP)} ${trimNum(width + EMBED_PAD_X * 2)} ${trimNum(height + EMBED_PAD_TOP + extraBottom)}`,
  );
  nextOpen = setAttr(nextOpen, "data-ck-embed", "1");
  const widthAttr = attr(open, "width");
  if (widthAttr && /^[0-9.]+$/.test(widthAttr)) nextOpen = setAttr(nextOpen, "width", trimNum(Number(widthAttr) + EMBED_PAD_X * 2));
  const heightAttr = attr(open, "height");
  if (heightAttr && /^[0-9.]+$/.test(heightAttr)) nextOpen = setAttr(nextOpen, "height", trimNum(Number(heightAttr) + EMBED_PAD_TOP + extraBottom));
  const updated = svg.replace(open, nextOpen);
  if (!options.watermark) return updated;
  const fill = options.dark ? "#9a9a9a" : "#6e6e73";
  const x = trimNum(x0 + width - 8);
  const y = trimNum(y0 + height + 12);
  const mark = `<a data-ck-watermark="1" href="${HREF}" target="_blank" rel="noopener"><text x="${x}" y="${y}" text-anchor="end" font-size="10" font-family="Inter, Roboto, sans-serif" fill="${fill}">${MARK}</text></a>`;
  const shifted = close + (nextOpen.length - open.length);
  return `${updated.slice(0, shifted)}${mark}${updated.slice(shifted)}`;
}

export function stripWatermark(svg: string): string {
  return svg.replace(/\s*<a\b[^>]*\bdata-ck-watermark="1"[\s\S]*?<\/a>/, "");
}

/** Chart drawing with the embed margin and the reserved band folded back. */
export function chartBody(svg: string): { drawing: string; width: number; height: number } {
  const open = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
  const box = viewBox(open);
  const marked = Boolean(svg.match(/data-ck-watermark="1"/));
  const embed = attr(open, "data-ck-embed") === "1";
  let height = box?.h ?? numericAttr(open, "height") ?? 0;
  let width = box?.w ?? numericAttr(open, "width") ?? 0;
  if (embed) {
    width -= EMBED_PAD_X * 2;
    height -= EMBED_PAD_TOP + EMBED_PAD_BOTTOM;
  }
  if (marked) height -= BAND;
  const drawing = stripWatermark(svg).replace(/<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { drawing, width, height };
}

function viewBox(open: string): { x: number; y: number; w: number; h: number } | null {
  const value = attr(open, "viewBox");
  if (!value) return null;
  const parts = value.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return null;
  return { x: parts[0] ?? 0, y: parts[1] ?? 0, w: parts[2] ?? 0, h: parts[3] ?? 0 };
}

function attr(open: string, name: string): string | undefined {
  return open.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

function numericAttr(open: string, name: string): number | undefined {
  const value = attr(open, name);
  if (!value || !/^[0-9.]+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function setAttr(open: string, name: string, value: string): string {
  if (new RegExp(`\\b${name}="`).test(open)) return open.replace(new RegExp(`\\b${name}="[^"]*"`), `${name}="${value}"`);
  return open.replace("<svg", `<svg ${name}="${value}"`);
}

function trimNum(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}
