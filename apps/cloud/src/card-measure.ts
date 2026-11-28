/**
 * Test helpers that measure a share card the way it is painted.
 * Text boxes come from resvg's own text layout with the bundled faces, not from an estimate.
 */
import { inflateSync } from "node:zlib";
import { cardScale, cardTextOnly, type Box } from "./card.ts";
import { inkBox } from "./png.ts";

export interface CardText {
  content: string;
  /** font-size attribute, in layout units. */
  size: number;
  /** font-size in card pixels: the attribute times the zoom. */
  px: number;
  /** Ink box in card pixels, from resvg. Undefined for text that paints nothing. */
  box?: Box;
}

export interface CardMeasure {
  zoom: number;
  texts: CardText[];
}

const TEXT = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;

/** Every text element of a card SVG, with its size and its painted box in card pixels. */
export async function measureCard(svg: string): Promise<CardMeasure> {
  const zoom = cardScale(svg);
  const bare = cardTextOnly(svg);
  const texts: CardText[] = [];
  for (const [index, match] of [...bare.matchAll(TEXT)].entries()) {
    let seen = -1;
    const only = bare.replace(TEXT, (whole) => (++seen === index ? whole : ""));
    const size = Number(/\bfont-size="([0-9.]+)"/.exec(match[1] ?? "")?.[1] ?? NaN);
    texts.push({
      content: (match[2] ?? "").replace(/<\/tspan><tspan/g, "</tspan> <tspan").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&"),
      size,
      px: size * zoom,
      box: await inkBox(only),
    });
  }
  return { zoom, texts };
}

export interface Pixels {
  width: number;
  height: number;
  /** RGBA, row by row. */
  data: Uint8Array;
}

/** Decode an 8-bit RGBA, non-interlaced PNG, which is what resvg writes. */
export function decodePng(bytes: Uint8Array): Pixels {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (bytes[24] !== 8 || bytes[25] !== 6 || bytes[28] !== 0) throw new Error("expected an 8-bit RGBA PNG without interlace");
  const parts: Uint8Array[] = [];
  for (let at = 8; at < bytes.length; ) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    if (type === "IDAT") parts.push(bytes.subarray(at + 8, at + 8 + length));
    at += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(parts));
  const stride = width * 4;
  const data = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)] ?? 0;
    const row = y * stride;
    for (let x = 0; x < stride; x++) {
      const value = raw[y * (stride + 1) + 1 + x] ?? 0;
      const left = x >= 4 ? (data[row + x - 4] ?? 0) : 0;
      const up = y > 0 ? (data[row - stride + x] ?? 0) : 0;
      const upLeft = x >= 4 && y > 0 ? (data[row - stride + x - 4] ?? 0) : 0;
      let predicted = 0;
      if (filter === 1) predicted = left;
      else if (filter === 2) predicted = up;
      else if (filter === 3) predicted = (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        predicted = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      data[row + x] = (value + predicted) & 0xff;
    }
  }
  return { width, height, data };
}

/** Pixels in the outer `ring` of the image that are not the color of the top-left pixel. */
export function inkInRing(image: Pixels, ring: number): number {
  const { width, height, data } = image;
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x >= ring && x < width - ring && y >= ring && y < height - ring) continue;
      const at = (y * width + x) * 4;
      if (data[at] !== data[0] || data[at + 1] !== data[1] || data[at + 2] !== data[2] || data[at + 3] !== data[3]) count += 1;
    }
  }
  return count;
}
