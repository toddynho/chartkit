import { createHash } from "node:crypto";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { repair, type RepairResult } from "@chartkitdev/core/validate";
import { repairPhase4 } from "@chartkitdev/core/validate/phase4";
import { bakeFontFallback } from "../../../packages/core/src/font.ts";
import { resolvePreset } from "../../../packages/core/src/theme.ts";
import { canonical } from "./charts.ts";
import { applyHeading, cardTextOnly, cardZoom, insideCard, planHeading } from "./card.ts";
import { FONT_FALLBACK, inkBox, rasterize } from "./png.ts";
import { CARD_HEIGHT, CARD_WIDTH, CARD_ZOOM, cardDrawingSize, presentSvg, themeIsDark } from "./watermark.ts";

export const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

export interface Frame {
  w?: number;
  h?: number;
  scale: number;
  theme?: string;
  /**
   * Plate color written to theme.tokens.background.
   * Omitted on a transparent Soft/Refined/Editorial preset becomes CLOUD_PLATE.
   */
  background?: string;
  format: "svg" | "png";
  watermark: boolean;
  /**
   * Draw the 1200×628 share card. The handler forces scale 1 and PNG, and drops w and h.
   * drawSpec picks the layout frame: see drawCard.
   */
  card?: boolean;
}

/**
 * Opaque stand-in for the white page Soft was designed to sit on.
 * Chat lightboxes are often black; a transparent plot leaves dark axis ink on that black.
 */
export const CLOUD_PLATE = "#ffffff";

/** Longest side of a drawing, in SVG units. The `w` and `h` parameters and `spec.size` share it. */
export const MAX_SIDE = 4096;
/**
 * Most pixels one PNG may hold: width x height x scale squared.
 * resvg keeps the whole bitmap in memory and a Workers isolate has about 128 MB, so this is well under 4096 x 4096.
 * 4,000,000 covers 1600 x 1200 at scale 1 and 1200 x 800 at scale 2.
 */
export const MAX_PNG_PIXELS = 4_000_000;
/** Most rows in `spec.data`. The 1 MB body cap alone still lets through enough rows to take seconds to draw. */
export const MAX_ROWS = 20_000;

const TRANSPARENT_PRESETS = new Set(["auto", "soft", "refined", "editorial"]);

export interface Drawn {
  status: number;
  svg: string;
  body: Uint8Array;
  contentType: string;
  result: RepairResult;
  width: number;
  height: number;
}

export async function drawSpec(input: unknown, frame: Frame): Promise<Drawn> {
  const composed = frame.card ? await composeCard(input, frame) : compose(input, frame);
  const { result, failed, family, svg } = composed;
  const size = svgSize(svg);
  if (frame.format === "png") {
    try {
      // The error picture is a fixed 640 x 240, so it is drawn at scale 1 whatever the request asked for.
      const png = await rasterize(svg, failed ? 1 : frame.scale, family);
      return { status: failed ? 422 : 200, svg, body: png, contentType: "image/png", result, width: size.width, height: size.height };
    } catch {
      if (failed) throw new Error("could not rasterize the error picture");
      const broken = failResult(result, cloudError("", "the PNG could not be rasterized", "Ask for format=svg, or a smaller size or scale."));
      const picture = bakeFontFallback(presentSvg(errorPicture(broken), { watermark: true, dark: false, plate: CLOUD_PLATE }), "");
      const pictureSize = svgSize(picture);
      const png = await rasterize(picture, 1, "");
      return { status: 422, svg: picture, body: png, contentType: "image/png", result: broken, width: pictureSize.width, height: pictureSize.height };
    }
  }
  return {
    status: failed ? 422 : 200,
    svg,
    body: new TextEncoder().encode(svg),
    contentType: "image/svg+xml; charset=utf-8",
    result,
    width: size.width,
    height: size.height,
  };
}

interface Composed {
  /** The Cloud SVG: the library drawing, or the error picture, with the margin, the plate, and the mark. */
  svg: string;
  /** The library drawing alone. Empty when the spec could not be drawn. */
  drawn: string;
  result: RepairResult;
  failed: boolean;
  family: string;
}

/**
 * Repair, check the limits, draw, and dress the drawing as a Cloud SVG. No rasterizing.
 * `redraw` edits the library drawing before it is dressed. Only the share card passes one.
 */
function compose(input: unknown, frame: Frame, redraw?: (drawn: string) => string): Composed {
  const framed = withFrame(input, frame);
  const checked = check(framed);
  const spec = applyCloudPlate(checked.spec, frame);
  let result = spec === checked.spec ? checked : { ...checked, spec };
  const tooBig = result.ok ? overLimit(result.spec) : null;
  if (tooBig) result = failResult(result, tooBig);
  let drawn = "";
  if (result.ok) {
    try {
      drawn = render(result.spec);
    } catch {
      result = failResult(result, cloudError("/type", "the renderer failed on this spec"));
    }
  }
  const failure = result.ok ? drawFailure(result.spec, drawn) ?? pngOverLimit(drawn, frame) : null;
  if (failure) result = failResult(result, failure);
  const failed = !result.ok;
  if (!failed && redraw) drawn = redraw(drawn);
  const dark = failed ? false : themeIsDark(frame.theme, drawn);
  const theme = isRecord(result.spec) ? result.spec.theme : undefined;
  const plate = failed ? CLOUD_PLATE : explicitBackground(theme) ?? (dark ? "#0c0c0c" : CLOUD_PLATE);
  const family = failed || !isRecord(result.spec) ? "" : resolvePreset(result.spec.theme).fontFamily ?? "";
  const svg = bakeFontFallback(
    presentSvg(failed ? errorPicture(result) : drawn, {
      watermark: failed || frame.watermark,
      dark,
      plate,
    }),
    family,
  );
  return { svg, drawn: failed ? "" : drawn, result, failed, family };
}

/** Smaller zooms tried, in order, when text does not fit the card at the legibility floor. 1 is the card laid out at full size. */
const CARD_FALLBACK_ZOOMS = [1.75, 1.5, 1.25, 1];
/** A wrapped title may not squeeze the chart below this layout height. A smaller zoom is used instead. */
const CARD_MIN_CHART_HEIGHT = 150;

/**
 * The share card is its own frame. It ignores the size in the spec and in the request.
 *
 * The chart is laid out on a frame CARD_ZOOM times smaller than 1200×628, so the library places every
 * label for that width, and fitCard enlarges the result to the card. A 568 px wide layout shown at twice
 * the size has type twice as large: the library's 15 px title is 30 px and its 10 to 12 px labels 20 to 24.
 * A spec that asks for smaller type (theme.tokens.fontSize under 10) is drawn with 10 on the card alone.
 * If a renderer still draws something smaller, the frame shrinks further, up to CARD_ZOOM_MAX (see cardZoom).
 *
 * Text is never cut off to get there. A title or subtitle too long for the frame is broken into lines
 * (see card.ts). If any text would still leave the card, the frame grows a step at a time, which
 * trades type size for room. At zoom 1 the card is what it was before the floor existed.
 */
async function composeCard(sent: unknown, frame: Frame): Promise<Composed> {
  const input = cardInput(sent);
  const first = cardAt(input, frame, CARD_ZOOM);
  if (first.failed) return first;
  const spec = isRecord(first.result.spec) ? first.result.spec : {};
  const floor = cardZoom(first.drawn, spec.title);
  const zooms = [floor, ...CARD_FALLBACK_ZOOMS.filter((zoom) => zoom < floor)];
  let card = first;
  for (const zoom of zooms) {
    const plain = zoom === CARD_ZOOM ? first : cardAt(input, frame, zoom);
    if (plain.failed) continue;
    card = await wrapHeading(input, frame, zoom, plain);
    card = { ...card, svg: fitCard(card.svg) };
    if (insideCard(await inkBox(cardTextOnly(card.svg), card.family))) return card;
  }
  return card;
}

/**
 * Smallest theme.tokens.fontSize a card is drawn with. At 10 the library's title is 14 px and its smallest
 * label 9 px, which CARD_ZOOM turns into the 28 px and 18 px floor.
 */
const CARD_MIN_FONT_TOKEN = 10;

/** The spec as sent, except that a font token under the floor is raised for this render. Only the card's own drawing sees it. */
function cardInput(input: unknown): unknown {
  if (!isRecord(input) || !isRecord(input.theme) || !isRecord(input.theme.tokens)) return input;
  const size = input.theme.tokens.fontSize;
  if (typeof size !== "number" || !(size < CARD_MIN_FONT_TOKEN)) return input;
  return { ...input, theme: { ...input.theme, tokens: { ...input.theme.tokens, fontSize: CARD_MIN_FONT_TOKEN } } };
}

function cardAt(input: unknown, frame: Frame, zoom: number, shorter = 0, redraw?: (drawn: string) => string): Composed {
  const layout = cardDrawingSize(frame.watermark, zoom);
  const cardFrame: Frame = { ...frame, w: Math.round(layout.width), h: Math.round(layout.height) - shorter, scale: 1, format: "png" };
  return compose(input, cardFrame, redraw);
}

/** Lay the chart out again, shorter, when its title or subtitle needs more than one line on this frame. */
async function wrapHeading(input: unknown, frame: Frame, zoom: number, plain: Composed): Promise<Composed> {
  const spec = isRecord(plain.result.spec) ? plain.result.spec : {};
  const layout = cardDrawingSize(frame.watermark, zoom);
  const measure = async (text: string, attrs: string): Promise<number> => {
    const size = /(?:^|\s)font-size="([^"]*)"/.exec(attrs)?.[1] ?? "12";
    const weight = /(?:^|\s)font-weight="([^"]*)"/.exec(attrs)?.[1] ?? "400";
    const line = `<svg xmlns="http://www.w3.org/2000/svg" width="8000" height="200"><text x="0" y="100" font-size="${size}" font-weight="${weight}" font-family="${plain.family || FONT_FALLBACK}">${escapeXml(text)}</text></svg>`;
    const box = await inkBox(line, plain.family);
    return box ? box.x + box.width : 0;
  };
  const plan = await planHeading(plain.drawn, spec.title, spec.subtitle, Math.round(layout.width), measure);
  if (!plan || Math.round(layout.height) - plan.extra < CARD_MIN_CHART_HEIGHT) return plain;
  const wrapped = cardAt(input, frame, zoom, plan.extra, (drawn) => applyHeading(drawn, plan, spec.title, spec.subtitle));
  return wrapped.failed ? plain : wrapped;
}

export function repairSpec(input: unknown, frame: Pick<Frame, "w" | "h" | "theme">): RepairResult {
  return check(withFrame(input, { ...frame, format: "svg", scale: 1, watermark: false }));
}

export function cacheKey(input: unknown, frame: Frame, state: string): string {
  return createHash("sha256").update(canonical({ input, frame, state })).digest("hex");
}

export function parseSpec(raw: string): unknown | Error {
  const text = raw.trim();
  if (!text) return new Error("missing spec");
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      return JSON.parse(text) as unknown;
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }
  try {
    const pad = text.replace(/-/g, "+").replace(/_/g, "/");
    const padded = pad + "=".repeat((4 - (pad.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

export function readFrame(source: { get(name: string): string | null }): Frame | string {
  const format = source.get("format") || "svg";
  if (format !== "svg" && format !== "png") return "format must be svg or png";
  const w = readNumber(source.get("w"), 4096);
  const h = readNumber(source.get("h"), 4096);
  const scale = readNumber(source.get("scale"), 4);
  if (w === "bad" || h === "bad" || scale === "bad") return "w, h, and scale must be numbers in range";
  const theme = source.get("theme") || undefined;
  if (theme && !/^[A-Za-z0-9-]{1,32}$/.test(theme)) return "theme must be a short name";
  const background = readBackground(source.get("background"));
  if (background === "bad") return "background must be a CSS color such as #ffffff, rgb(), hsl(), oklch(), or transparent";
  const frame: Frame = { format, w, h, scale: scale ?? 1, theme, background, watermark: true };
  if (source.get("card") === "1") frame.card = true;
  return frame;
}

/** Enlarge the layout frame to the card. The nested viewBox is the zoom, so the PNG is 1200×628 at scale 1. */
function fitCard(svg: string): string {
  const size = svgSize(svg);
  if (size.width === CARD_WIDTH && size.height === CARD_HEIGHT) return svg;
  const open = svg.match(/<svg\b[^>]*>/)?.[0];
  const close = svg.lastIndexOf("</svg>");
  if (!open || close < 0) return svg;
  const box = open.match(/\bviewBox="([^"]+)"/)?.[1] ?? `0 0 ${size.width || CARD_WIDTH} ${size.height || CARD_HEIGHT}`;
  const inner = svg.slice(open.length, close);
  // A layout frame that is not exactly the card's shape leaves a strip under a fraction of a pixel. Paint it the plate color.
  const fill = svg.match(/<rect data-ck-plate="[^"]*"[^>]*\bfill="([^"]*)"/)?.[1];
  const plate = fill ? `<rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${fill}" />` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" role="img">${plate}<svg x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="${box}" preserveAspectRatio="xMidYMid meet">${inner}</svg></svg>`;
}

function check(spec: unknown): RepairResult {
  const type = isRecord(spec) && typeof spec.type === "string" ? spec.type : "";
  return PHASE4.has(type) ? repairPhase4(spec) : repair(spec);
}

/**
 * Gallery charts the extra bundle leaves on their own entry.
 * bar-list stays out of line and all. Cloud still draws the docs try-it spec.
 */
function render(spec: unknown): string {
  if (isRecord(spec) && spec.type === "bar-list") return renderBarList(spec) ?? "";
  return renderExtra(spec);
}

/** Repair can accept a type the worker cannot draw. Say so instead of a generic picture. */
function drawFailure(spec: unknown, drawn: string): RepairResult["errors"][number] | null {
  if (drawn && !drawn.includes("ck-chart-error")) return null;
  const type = isRecord(spec) && typeof spec.type === "string" ? spec.type : "unknown";
  const unsupported = !drawn || drawn.includes("no renderer registered");
  return {
    code: unsupported ? "CK1010" : "CK1006",
    severity: "error",
    path: "/type",
    message: unsupported ? `type "${type}" is unsupported on Cloud` : `renderer for "${type}" could not draw this spec`,
    hint: unsupported ? "This type is not loaded by the Cloud worker." : undefined,
  };
}

/** CK1006 with a Cloud-specific message: the spec is valid, but this service will not draw it. */
function cloudError(path: string, message: string, hint?: string): RepairResult["errors"][number] {
  return { code: "CK1006", severity: "error", path, message, hint };
}

/** Limits that are known before drawing: the frame and the row count. */
function overLimit(spec: unknown): RepairResult["errors"][number] | null {
  if (!isRecord(spec)) return null;
  if (isRecord(spec.size)) {
    for (const side of ["width", "height"] as const) {
      const value = spec.size[side];
      if (typeof value === "number" && value > MAX_SIDE) {
        return cloudError(`/size/${side}`, `size.${side} is ${value}; Cloud draws at most ${MAX_SIDE}`, `Set size.${side} to ${MAX_SIDE} or less.`);
      }
    }
  }
  if (Array.isArray(spec.data) && spec.data.length > MAX_ROWS) {
    return cloudError("/data", `data has ${spec.data.length} rows; Cloud draws at most ${MAX_ROWS}`, "Aggregate or sample the rows before sending them.");
  }
  return null;
}

/** A PNG holds width x height x scale squared pixels in memory. Checked against the drawn size, not the request. */
function pngOverLimit(drawn: string, frame: Frame): RepairResult["errors"][number] | null {
  if (frame.format !== "png") return null;
  const size = svgSize(drawn);
  const pixels = size.width * size.height * frame.scale * frame.scale;
  if (pixels <= MAX_PNG_PIXELS) return null;
  return cloudError(
    "/size",
    `a ${size.width} x ${size.height} PNG at scale ${frame.scale} is ${Math.round(pixels).toLocaleString("en-US")} pixels; Cloud draws at most ${MAX_PNG_PIXELS.toLocaleString("en-US")}`,
    "Lower w, h or scale, or ask for format=svg, which has no pixel limit.",
  );
}

function failResult(result: RepairResult, error: RepairResult["errors"][number]): RepairResult {
  return {
    ...result,
    ok: false,
    errors: [error, ...result.errors],
    diagnostics: [error, ...result.diagnostics],
  };
}

function withFrame(spec: unknown, frame: Frame): unknown {
  if (!isRecord(spec)) return spec;
  const next: Record<string, unknown> = { ...spec };
  if (frame.theme) next.theme = frame.theme;
  if (frame.w || frame.h || frame.card) {
    const size = isRecord(next.size) ? { ...next.size } : {};
    if (frame.w) size.width = frame.w;
    if (frame.h) size.height = frame.h;
    if (frame.card) {
      delete size.minHeight;
      delete size.aspectRatio;
    }
    next.size = size;
  }
  return next;
}

/**
 * Soft, Refined, and Editorial leave the plot transparent so a web page shows through.
 * A Cloud file has no page. Paint #ffffff unless the agent set a color, or the preset is already opaque.
 * `background=transparent` keeps the clear plot. `theme=midnight` keeps its dark plate.
 */
function applyCloudPlate(spec: unknown, frame: Frame): unknown {
  if (!isRecord(spec)) return spec;
  const color = frame.background ?? (explicitBackground(spec.theme) ? undefined : transparentPreset(spec.theme) ? CLOUD_PLATE : undefined);
  if (!color) return spec;
  return { ...spec, theme: themeWithBackground(spec.theme, color) };
}

function explicitBackground(theme: unknown): string | undefined {
  if (!isRecord(theme) || !isRecord(theme.tokens)) return undefined;
  const value = theme.tokens.background;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Mirrors resolvePreset: unknown names and mode "dark" use midnight, which is already opaque. */
function transparentPreset(theme: unknown): boolean {
  const name = presetName(theme);
  const mode = isRecord(theme) && (theme.mode === "dark" || theme.mode === "light") ? theme.mode : "auto";
  const known = name === "midnight" || TRANSPARENT_PRESETS.has(name);
  if (!known) return false;
  if (mode === "dark" && name !== "midnight") return false;
  if (mode === "light" && name === "midnight") return true;
  return TRANSPARENT_PRESETS.has(name);
}

function presetName(theme: unknown): string {
  if (typeof theme === "string" && theme) return theme;
  if (isRecord(theme) && typeof theme.preset === "string" && theme.preset) return theme.preset;
  return "auto";
}

function themeWithBackground(theme: unknown, color: string): Record<string, unknown> {
  if (typeof theme === "string" && theme) return { preset: theme, tokens: { background: color } };
  if (!isRecord(theme)) return { preset: "soft", tokens: { background: color } };
  const tokens = isRecord(theme.tokens) ? { ...theme.tokens, background: color } : { background: color };
  const preset = typeof theme.preset === "string" && theme.preset ? theme.preset : "soft";
  return { ...theme, preset, tokens };
}

/** Same colors core will keep on theme.tokens.background. Named colors such as white are rejected. */
function readBackground(value: string | null): string | undefined | "bad" {
  if (value == null || value === "") return undefined;
  const color = value.trim();
  if (color.length > 80 || !/^(?:var\(|#|rgb|hsl|oklch|transparent$)/.test(color)) return "bad";
  return color;
}

function errorPicture(result: RepairResult): string {
  const lines = result.errors.map((error) => `${error.code} ${error.message}`);
  const shown = lines.slice(0, 6);
  if (lines.length > shown.length) shown.push(`${lines.length - shown.length} more`);
  if (shown.length === 0) shown.push("The spec is not drawable.");
  const text = shown
    .map(
      (line, index) =>
        `<text x="24" y="${64 + index * 22}" font-size="14" font-family="${FONT_FALLBACK}" fill="#1d1d1f">${escapeXml(line)}</text>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240" role="img"><title>ChartKit could not draw this spec</title><rect width="640" height="240" fill="#ffffff"/><text x="24" y="36" font-size="16" font-weight="650" font-family="${FONT_FALLBACK}" fill="#1d1d1f">ChartKit could not draw this spec</text>${text}</svg>`;
}

function svgSize(svg: string): { width: number; height: number } {
  const open = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
  const box = open.match(/\bviewBox="([^"]+)"/)?.[1]?.trim().split(/[\s,]+/).map(Number) ?? [];
  const width = numberAttr(open, "width") ?? (box.length === 4 ? box[2] : 0);
  const height = numberAttr(open, "height") ?? (box.length === 4 ? box[3] : 0);
  return { width: width || 0, height: height || 0 };
}

function numberAttr(open: string, name: string): number | undefined {
  const value = open.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
  if (!value || value.endsWith("%")) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readNumber(value: string | null, max: number): number | undefined | "bad" {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > max) return "bad";
  return parsed;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
