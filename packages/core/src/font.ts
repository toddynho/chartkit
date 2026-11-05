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
 * In a browser, `render()` measures the chart's resolved family once:
 * the spec or preset family, else `--ck-font-family` on the chart's
 * container (inherited from an ancestor), else the page font.
 * Digits wider than the estimate scale it up (capped). Narrower fonts
 * keep the estimate. `document.fonts.ready` measures that family again
 * and redraws each mounted chart once when the factor changes.
 */
const factors = new Map<string, number>();
let active = 1;
let currentFamily = "";
let currentFactor = 1;
let fontsSettled = false;
let fontsListening = false;

interface FontJob {
  family: string;
  used: number;
  rerun: () => void;
}

const fontJobs = new Map<object, FontJob>();

function jsdom(): boolean {
  return typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent);
}

function probe(family: string): number {
  if (typeof document === "undefined" || jsdom() || !family) return 1;
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return 1;
    ctx.font = `11px ${family}`;
    const width = ctx.measureText("0000000000").width;
    if (width > 72) return Math.min(1.8, width / 67);
  } catch {
    /* keep the estimate */
  }
  return 1;
}

function hostFamily(target: unknown): string {
  if (typeof document === "undefined" || typeof getComputedStyle !== "function") return "";
  const node = target && typeof target === "object" && (target as Element).nodeType === 1 ? (target as Element) : document.documentElement;
  if (!node) return "";
  const style = getComputedStyle(node);
  const named = style.getPropertyValue("--ck-font-family").trim();
  if (named && named !== "inherit") return named;
  return style.fontFamily.trim();
}

/** One read of the chart family, before layout. `ch()` does not touch the DOM. */
export function armFontMeasure(specFamily: string, target: unknown): void {
  if (typeof document === "undefined" || jsdom()) {
    active = 1;
    currentFamily = "";
    currentFactor = 1;
    return;
  }
  const family = specFamily || hostFamily(target);
  const key = family || "::estimate";
  let factor = factors.get(key);
  if (factor === undefined) {
    factor = probe(family);
    factors.set(key, factor);
  }
  active = factor;
  currentFamily = family;
  currentFactor = factor;
}

/**
 * After `document.fonts.ready`, remeasure this chart's family once.
 * A second layout runs only when the width factor changed, and only once per target.
 */
export function noteFontRedraw(target: object, rerun: () => void): void {
  if (fontsSettled || typeof document === "undefined" || jsdom() || !document.fonts) return;
  fontJobs.set(target, { family: currentFamily, used: currentFactor, rerun });
  if (fontsListening) return;
  fontsListening = true;
  void document.fonts.ready.then(() => {
    fontsSettled = true;
    const pending = [...fontJobs.entries()];
    fontJobs.clear();
    const changed = new Set<string>();
    const seen = new Set<string>();
    for (const [, job] of pending) {
      if (seen.has(job.family)) continue;
      seen.add(job.family);
      const next = probe(job.family);
      const key = job.family || "::estimate";
      const prev = factors.get(key) ?? job.used;
      factors.set(key, next);
      if (Math.abs(next - prev) > 0.001) changed.add(job.family);
    }
    const ran = new Set<object>();
    for (const [key, job] of pending) {
      if (!changed.has(job.family) || ran.has(key)) continue;
      ran.add(key);
      job.rerun();
    }
  });
}

export function ch(count: number, px: number): number {
  return count * px * active;
}

/**
 * Replace the inherit default with a real family.
 * An explicit `--ck-font-family` wins, then `requested` (the theme family),
 * then the standalone Inter stack.
 */
export function bakeFontFallback(svg: string, requested = ""): string {
  const match = /--ck-font-family:([^;}"]+)/.exec(svg);
  const named = match?.[1]?.trim() ?? "";
  const ask = requested.trim();
  const family = named && named !== "inherit" ? named : ask && ask !== "inherit" ? ask : FONT_FALLBACK;
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
