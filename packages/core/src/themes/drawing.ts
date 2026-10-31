/**
 * Colours from a drawing. SVG fills are read as text. A raster needs pixels
 * the caller already has, or a browser canvas. Node does not decode PNG or JPEG.
 */

import { canonicalHex } from "./hex";

const MAX_EDGE = 48;

/** Pull hex fills out of an SVG mark. White and black are skipped. Up to four colours, most frequent first. */
export function colorsFromSvg(svg: string): string[] {
  const found = svg.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) ?? [];
  const counts = new Map<string, number>();
  for (const raw of found) {
    const hex = canonicalHex(raw);
    if (!hex || hex === "#ffffff" || hex === "#000000") continue;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .map(([hex]) => hex)
    .slice(0, 4);
}

/** Dominant colours from RGBA pixels (a canvas getImageData buffer). Near-white and transparent pixels are skipped. */
export function sampleImageData(data: ArrayLike<number>): string[] {
  const counts = new Map<string, number>();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] ?? 0;
    if (a < 128) continue;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    if (r > 245 && g > 245 && b > 245) continue;
    const hex = "#" + [r, g, b].map((v) => (v & 0xf8).toString(16).padStart(2, "0")).join("");
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .map(([hex]) => hex)
    .slice(0, 3);
}

/**
 * Sample a bitmap in the browser, scaled so the long edge is 48px.
 * Throws in Node: there is no PNG or JPEG decoder in this package.
 */
export async function colorsFromBitmap(source: Blob): Promise<string[]> {
  const CanvasCtor = typeof OffscreenCanvas === "function" ? OffscreenCanvas : null;
  const bitmapFn = typeof createImageBitmap === "function" ? createImageBitmap : null;
  if (!CanvasCtor || !bitmapFn) {
    throw new Error("Raster sampling needs a browser canvas. Pass pixels to sampleImageData, or an SVG string to colorsFromSvg. Node does not decode PNG or JPEG here.");
  }
  const bitmap = await bitmapFn(source);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height, 1));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new CanvasCtor(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Raster sampling needs a 2D canvas.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  if (typeof bitmap.close === "function") bitmap.close();
  return sampleImageData(pixels);
}

export const SAMPLE_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="20" cy="24" r="14" fill="#0f766e"/><rect x="30" y="28" width="26" height="22" fill="#ca8a04"/><path d="M8 52 L24 36 L40 52 Z" fill="#f43f5e"/></svg>`;
