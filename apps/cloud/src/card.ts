/**
 * Share-card layout helpers. The card is a PNG only, so nothing here has to keep the SVG interactive.
 * draw.ts decides the frame; this file answers three questions about a drawing:
 * how far it must be enlarged for its type to be legible, whether its title and subtitle need more lines,
 * and whether every piece of text ends up inside the card.
 */
import { CARD_HEIGHT, CARD_LABEL_MIN, CARD_TITLE_MIN, CARD_WIDTH, CARD_ZOOM, CARD_ZOOM_MAX } from "./watermark.ts";

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Width of one line of text as it will be painted. */
export type MeasureLine = (text: string, attrs: string) => Promise<number>;

/** Gap kept between a wrapped line and the edge of the drawing, in layout units. */
const HEADING_EDGE = 8;
const LINE_HEIGHT = 1.25;

const SHAPE = "rect|path|circle|ellipse|line|polyline|polygon|image|use";
const SHAPES = new RegExp(`<(?:${SHAPE})\\b[^>]*?(?:\\/>|>[\\s\\S]*?<\\/(?:${SHAPE})>)`, "g");
const NESTED = /<svg x="0" y="0" width="(\d+)" height="(\d+)" viewBox="([^"]+)" preserveAspectRatio="xMidYMid meet">/;

/** The zoom at which the smallest type in this drawing meets the card floor, in quarter steps. */
export function cardZoom(drawn: string, title: unknown): number {
  const heading = typeof title === "string" && title ? findText(drawn, title) : null;
  let need = CARD_ZOOM;
  for (const match of drawn.matchAll(/<text\b([^>]*)>/g)) {
    const size = fontSize(match[1] ?? "");
    if (!(size > 0)) continue;
    const floor = heading && match.index === heading.start ? CARD_TITLE_MIN : CARD_LABEL_MIN;
    need = Math.max(need, floor / size);
  }
  return Math.min(CARD_ZOOM_MAX, Math.ceil(need * 4 - 1e-9) / 4);
}

/** How much a card SVG enlarges its layout frame. 1 for an SVG that fitCard did not nest. */
export function cardScale(card: string): number {
  const nested = NESTED.exec(card);
  if (!nested) return 1;
  const [, , width = 1, height = 1] = (nested[3] ?? "").split(/\s+/).map(Number);
  return Math.min(Number(nested[1]) / width, Number(nested[2]) / height);
}

/**
 * The card with only its text left, and the nested layout frame turned into a group.
 * The nested <svg> clips what leaves it. A group with the same transform does not, so text past the edge still has a box.
 * Coordinates in the result are card pixels.
 */
export function cardTextOnly(card: string): string {
  const bare = card.replace(SHAPES, "");
  const nested = NESTED.exec(bare);
  if (!nested) return bare;
  const [minX = 0, minY = 0] = (nested[3] ?? "").split(/\s+/).map(Number);
  const outerClose = bare.lastIndexOf("</svg>");
  const innerClose = bare.lastIndexOf("</svg>", outerClose - 1);
  if (innerClose < 0) return bare;
  const group = `<g transform="scale(${cardScale(bare)}) translate(${-minX} ${-minY})">`;
  return `${bare.slice(0, nested.index)}${group}${bare.slice(nested.index + nested[0].length, innerClose)}</g>${bare.slice(innerClose + "</svg>".length)}`;
}

/** True when a box of painted text, in card pixels, is inside the card. */
export function insideCard(box: Box | undefined): boolean {
  if (!box) return true;
  return box.x >= 0 && box.y >= 0 && box.x + box.width <= CARD_WIDTH && box.y + box.height <= CARD_HEIGHT;
}

export interface HeadingPlan {
  /** Lines for the title and the subtitle. One line means the text is left as the library drew it. */
  title: string[];
  subtitle: string[];
  /** Height the extra lines need, in layout units. The chart is laid out this much shorter and moved down. */
  extra: number;
}

/**
 * The library draws a title and a subtitle on one line each, however long.
 * On the card's narrow layout frame a long one would run off the right edge, so it is broken into lines here.
 * Returns null when both already fit, or when a single word is wider than the frame.
 */
export async function planHeading(drawn: string, title: unknown, subtitle: unknown, width: number, measure: MeasureLine): Promise<HeadingPlan | null> {
  const plan: HeadingPlan = { title: [], subtitle: [], extra: 0 };
  for (const [key, value] of [["title", title], ["subtitle", subtitle]] as const) {
    if (typeof value !== "string" || !value.trim()) continue;
    const found = findText(drawn, value);
    if (!found) continue;
    const lines = await breakLines(value, found.attrs, room(found.attrs, width), measure);
    if (!lines) return null;
    plan[key] = lines;
    plan.extra += (lines.length - 1) * lineHeight(found.attrs);
  }
  return plan.extra > 0 ? plan : null;
}

/**
 * Rewrite a drawing that was laid out `plan.extra` shorter than the frame: the title and subtitle get their lines,
 * and everything else moves down by the height those lines add. The background rect stays on the whole frame.
 */
export function applyHeading(drawn: string, plan: HeadingPlan, title: unknown, subtitle: unknown): string {
  const open = drawn.match(/<svg\b[^>]*>/)?.[0];
  const close = drawn.lastIndexOf("</svg>");
  if (!open || close < 0) return drawn;
  let body = drawn.slice(open.length, close);
  let lifted = plan.extra;
  for (const [lines, value] of [[plan.title, title], [plan.subtitle, subtitle]] as const) {
    if (typeof value !== "string" || lines.length === 0) continue;
    const found = findText(body, value);
    if (!found) continue;
    const x = attr(found.attrs, "x") ?? "0";
    const y = Number(attr(found.attrs, "y") ?? 0);
    const step = lineHeight(found.attrs);
    // The group below moves everything down by plan.extra. A heading goes back up to where its first line belongs.
    const attrs = found.attrs.replace(/\by="[^"]*"/, `y="${trim(y - lifted)}"`);
    const spans = lines.map((line, index) => `<tspan x="${x}"${index ? ` dy="${step}"` : ""}>${escapeXml(line)}</tspan>`).join("");
    body = `${body.slice(0, found.start)}<text${attrs}>${spans}</text>${body.slice(found.end)}`;
    lifted -= (lines.length - 1) * step;
  }
  const bleed = body.match(/<rect width="100%" height="100%" fill="[^"]*"\s*\/>/)?.[0] ?? "";
  if (bleed) body = body.replace(bleed, "");
  return `${grow(open, plan.extra)}${bleed}<g transform="translate(0 ${plan.extra})">${body}</g></svg>`;
}

function grow(open: string, extra: number): string {
  let next = open.replace(/\bheight="([0-9.]+)"/, (_whole, height: string) => `height="${trim(Number(height) + extra)}"`);
  next = next.replace(/\bviewBox="([^"]+)"/, (whole, box: string) => {
    const parts = box.trim().split(/[\s,]+/).map(Number);
    if (parts.length !== 4) return whole;
    return `viewBox="${parts[0]} ${parts[1]} ${parts[2]} ${trim((parts[3] ?? 0) + extra)}"`;
  });
  return next;
}

async function breakLines(text: string, attrs: string, width: number, measure: MeasureLine): Promise<string[] | null> {
  if ((await measure(text, attrs)) <= width) return [text];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let from = 0;
  while (from < words.length) {
    // The longest run of words from `from` that fits, found by bisection so a long title costs few measurements.
    let low = 1;
    let high = words.length - from;
    if ((await measure(words[from] ?? "", attrs)) > width) return null;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if ((await measure(words.slice(from, from + middle).join(" "), attrs)) <= width) low = middle;
      else high = middle - 1;
    }
    lines.push(words.slice(from, from + low).join(" "));
    from += low;
  }
  return lines;
}

/** Width a heading may use, from its anchor to the edge it grows toward. */
function room(attrs: string, width: number): number {
  const x = Number(attr(attrs, "x") ?? 0);
  const anchor = attr(attrs, "text-anchor") ?? "start";
  if (anchor === "end") return x - HEADING_EDGE;
  if (anchor === "middle") return 2 * (Math.min(x, width - x) - HEADING_EDGE);
  return width - x - HEADING_EDGE;
}

function lineHeight(attrs: string): number {
  return Math.round((fontSize(attrs) || 12) * LINE_HEIGHT);
}

/** The single <text> whose whole content is this string, as the library writes a title. */
function findText(svg: string, content: string): { start: number; end: number; attrs: string } | null {
  const tail = `>${escapeXml(content)}</text>`;
  const at = svg.indexOf(tail);
  if (at < 0) return null;
  const start = svg.lastIndexOf("<text", at);
  if (start < 0 || svg.indexOf(">", start) !== at) return null;
  return { start, end: at + tail.length, attrs: svg.slice(start + "<text".length, at) };
}

function fontSize(attrs: string): number {
  return Number(attr(attrs, "font-size") ?? NaN);
}

function attr(attrs: string, name: string): string | undefined {
  return new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(attrs)?.[1];
}

function trim(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
