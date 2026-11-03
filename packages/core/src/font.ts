import type { Diagnostic } from "./diagnostics";

/**
 * Family when nothing can inherit: a saved SVG, `toSVG` of a string,
 * and Cloud PNG. The first name is the slot a later Cloud font set fills
 * (Inter). This file does not ship font bytes.
 */
export const FONT_FALLBACK = "Inter, ui-sans-serif, system-ui, sans-serif";

/**
 * DOM default. A host `--ck-font-family` wins. Otherwise the page font.
 * Inline style, so it works for an SVG in light DOM or a shadow tree:
 * `font-family` inherits across the shadow boundary.
 */
export const FONT_INHERIT = "var(--ck-font-family, inherit)";

const FONT_MAX = 80;

export interface FontFamily {
  family: string;
  /** The value was the keyword inherit. */
  inherit: boolean;
  ok: boolean;
}

/** A theme.tokens.fontFamily value. Invalid values are CK3086. */
export function readFontFamily(value: unknown): FontFamily {
  if (typeof value !== "string") return { family: "", inherit: false, ok: false };
  const text = value.trim();
  if (!text || text.length > FONT_MAX || /[<>";{}\\]|[\n\r]/.test(text)) return { family: "", inherit: false, ok: false };
  if (text === "inherit") return { family: "", inherit: true, ok: true };
  return { family: text, inherit: false, ok: true };
}

export function font(): string {
  return FONT_INHERIT;
}

/** Root SVG style. `family` is written as --ck-font-family so a host variable can still be overridden by the spec. */
export function fontStyle(family?: string): string {
  const base = `font-family:${FONT_INHERIT};font-variant-numeric:tabular-nums;font-feature-settings:'tnum'`;
  return family ? `${base};--ck-font-family:${family}` : base;
}

/**
 * Width of `count` glyphs at `px` per glyph.
 * Server renders stay on that estimate so SSR is deterministic.
 * In a browser, digits of the page font wider than the estimate scale it up
 * (capped) so a serif does not collide. Narrower fonts keep the estimate.
 */
let widen = 1;
let saw = false;

export function ch(count: number, px: number): number {
  if (!saw && typeof document !== "undefined") {
    saw = true;
    try {
      if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return count * px * widen;
      const ctx = document.createElement("canvas").getContext("2d");
      const family = getComputedStyle(document.documentElement).fontFamily;
      if (ctx && family) {
        ctx.font = `11px ${family}`;
        const width = ctx.measureText("0000000000").width;
        if (width > 72) widen = Math.min(1.8, width / 67);
      }
    } catch {
      /* keep the estimate */
    }
  }
  return count * px * widen;
}

/** Replace the inherit default with a real family. An explicit --ck-font-family is kept. */
export function bakeFontFallback(svg: string): string {
  const match = /--ck-font-family:([^;}"]+)/.exec(svg);
  const named = match?.[1]?.trim() ?? "";
  const family = named && named !== "inherit" ? named : FONT_FALLBACK;
  return svg.split(`font-family:${FONT_INHERIT}`).join(`font-family:${family}`);
}

export function fontFamilyCheck(spec: unknown, diagnostics: Diagnostic[]): void {
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) return;
  const theme = (spec as { theme?: unknown }).theme;
  if (!theme || typeof theme !== "object" || Array.isArray(theme)) return;
  const tokens = (theme as { tokens?: unknown }).tokens;
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens) || !("fontFamily" in tokens)) return;
  const value = (tokens as { fontFamily?: unknown }).fontFamily;
  if (typeof value !== "string" || readFontFamily(value).ok) return;
  diagnostics.push({
    code: "CK3086",
    severity: "error",
    message: "fontFamily must be a CSS font-family of at most 80 characters",
    path: "/theme/tokens/fontFamily",
    hint: "A family list such as Georgia, serif. inherit uses the page font. Double quotes, <, >, ;, {, }, and \\ are rejected.",
  });
}
