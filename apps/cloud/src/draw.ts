import { createHash } from "node:crypto";
import { render } from "@chartkitdev/core/extra";
import { repair, type RepairResult } from "@chartkitdev/core/validate";
import { repairPhase4 } from "@chartkitdev/core/validate/phase4";
import { canonical } from "./charts.ts";
import { rasterize } from "./png.ts";
import { presentSvg, themeIsDark } from "./watermark.ts";

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

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
}

/**
 * Opaque stand-in for the white page Soft was designed to sit on.
 * Chat lightboxes are often black; a transparent plot leaves dark axis ink on that black.
 */
export const CLOUD_PLATE = "#ffffff";

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
  const framed = withFrame(input, frame);
  const checked = check(framed);
  const spec = applyCloudPlate(checked.spec, frame);
  const result = spec === checked.spec ? checked : { ...checked, spec };
  const drawn = result.ok ? render(result.spec) : "";
  const failed = !result.ok || drawn.includes("ck-chart-error");
  const dark = failed ? false : themeIsDark(frame.theme, drawn);
  const theme = isRecord(result.spec) ? result.spec.theme : undefined;
  const plate = failed ? CLOUD_PLATE : explicitBackground(theme) ?? (dark ? "#0c0c0c" : CLOUD_PLATE);
  const svg = presentSvg(failed ? errorPicture(result) : drawn, {
    watermark: failed || frame.watermark,
    dark,
    plate,
  });
  const size = svgSize(svg);
  if (frame.format === "png") {
    const png = await rasterize(svg, frame.scale);
    return { status: failed ? 422 : 200, svg, body: png, contentType: "image/png", result, width: size.width, height: size.height };
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
  return { format, w, h, scale: scale ?? 1, theme, background, watermark: true };
}

function check(spec: unknown): RepairResult {
  const type = isRecord(spec) && typeof spec.type === "string" ? spec.type : "";
  return PHASE4.has(type) ? repairPhase4(spec) : repair(spec);
}

function withFrame(spec: unknown, frame: Frame): unknown {
  if (!isRecord(spec)) return spec;
  const next: Record<string, unknown> = { ...spec };
  if (frame.theme) next.theme = frame.theme;
  if (frame.w || frame.h) {
    const size = isRecord(next.size) ? { ...next.size } : {};
    if (frame.w) size.width = frame.w;
    if (frame.h) size.height = frame.h;
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
        `<text x="24" y="${64 + index * 22}" font-size="14" font-family="Inter, Roboto, sans-serif" fill="#1d1d1f">${escapeXml(line)}</text>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240" role="img"><title>ChartKit could not draw this spec</title><rect width="640" height="240" fill="#ffffff"/><text x="24" y="36" font-size="16" font-weight="650" font-family="Inter, Roboto, sans-serif" fill="#1d1d1f">ChartKit could not draw this spec</text>${text}</svg>`;
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
