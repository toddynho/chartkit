import type { PresetTokens } from "./theme";
import { paint } from "./theme";

/** A cell that is already a colour, not a category name. */
const PAINT = /^(?:#|rgb|hsl|oklch|var\(|series-\d+$|positive$|negative$|accent$|text$|muted$|grid$|background$|surface$)/i;

export interface ColorRule {
  test?: string;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  eq?: number;
  color?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function paintLike(value: unknown): boolean {
  return typeof value === "string" && PAINT.test(value.trim());
}

/** True when the column is colours rather than a series split. */
export function isPaintColumn(column: ArrayLike<unknown>): boolean {
  let paints = 0;
  let text = 0;
  for (let i = 0; i < column.length; i++) {
    const cell = column[i];
    if (typeof cell !== "string" || !cell.trim()) continue;
    text += 1;
    if (paintLike(cell)) paints += 1;
  }
  return text > 0 && paints === text;
}

/** `mark.palette` replaces the theme series list for this spec. Tokens stay when it is omitted. */
export function withPalette(preset: PresetTokens, mark: unknown): PresetTokens {
  if (!isRecord(mark) || !Array.isArray(mark.palette)) return preset;
  const series = mark.palette.filter((item): item is string => typeof item === "string" && item.length > 0);
  if (!series.length) return preset;
  return { ...preset, series, lines: series, explicit: true };
}

export function readRules(mark: unknown): ColorRule[] {
  if (!isRecord(mark) || !Array.isArray(mark.colorRules)) return [];
  const rules: ColorRule[] = [];
  for (const item of mark.colorRules) {
    if (!isRecord(item) || typeof item.color !== "string") continue;
    rules.push({
      test: typeof item.test === "string" ? item.test : undefined,
      lt: typeof item.lt === "number" ? item.lt : undefined,
      lte: typeof item.lte === "number" ? item.lte : undefined,
      gt: typeof item.gt === "number" ? item.gt : undefined,
      gte: typeof item.gte === "number" ? item.gte : undefined,
      eq: typeof item.eq === "number" ? item.eq : undefined,
      color: item.color,
    });
  }
  return rules;
}

function matches(value: number, rule: ColorRule): boolean {
  if (typeof rule.color !== "string") return false;
  if (rule.test === "negative" && !(value < 0)) return false;
  if (rule.test === "positive" && !(value > 0)) return false;
  if (typeof rule.lt === "number" && !(value < rule.lt)) return false;
  if (typeof rule.lte === "number" && !(value <= rule.lte)) return false;
  if (typeof rule.gt === "number" && !(value > rule.gt)) return false;
  if (typeof rule.gte === "number" && !(value >= rule.gte)) return false;
  if (typeof rule.eq === "number" && value !== rule.eq) return false;
  return true;
}

/** True when one finite value satisfies the rule. */
export function ruleMatchesAny(rule: ColorRule, values: ArrayLike<number | null>): boolean {
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value === "number" && Number.isFinite(value) && matches(value, rule)) return true;
  }
  return false;
}

/** First matching rule wins. A rule with only `color` matches every value. */
export function matchRule(value: number, rules: ColorRule[], preset: PresetTokens): string | null {
  for (const rule of rules) {
    if (!matches(value, rule)) continue;
    return paint(rule.color, preset, 0);
  }
  return null;
}

export interface ColorAsk {
  count: number;
  values: ArrayLike<number | null>;
  labels: string[];
  raw: ArrayLike<unknown> | null;
  range?: string[];
  domain?: string[];
  constant?: string;
  rules: ColorRule[];
  preset: PresetTokens;
  fallback: string;
  /** Colour by the category label when the colour field is x, or when domain/range is set. */
  categorical: boolean;
}

function seenIndex(seen: Map<string, number>, text: string): number {
  const known = seen.get(text);
  if (known !== undefined) return known;
  const next = seen.size;
  seen.set(text, next);
  return next;
}

/**
 * One colour per point. Null when the spec does not ask for a point colour,
 * so the series colour stays the only paint.
 */
export function resolveColors(ask: ColorAsk): string[] | null {
  const asked = Boolean(ask.constant || ask.raw || ask.domain || (ask.categorical && ask.range) || ask.rules.length);
  if (!asked && !ask.categorical) return null;
  if (!asked && ask.categorical && !ask.raw) return null;
  const seen = new Map<string, number>();
  const out: string[] = [];
  for (let i = 0; i < ask.count; i++) {
    let color = ask.fallback;
    if (ask.constant) color = paint(ask.constant, ask.preset, 0);
    const cell = ask.raw ? ask.raw[i] : ask.categorical ? ask.labels[i] : undefined;
    if (!ask.constant && cell != null && String(cell) !== "") {
      const text = String(cell);
      if (paintLike(text)) color = paint(text, ask.preset, i);
      else {
        const listed = ask.domain ? ask.domain.indexOf(text) : -1;
        const at = listed >= 0 ? listed : seenIndex(seen, text);
        color = paint(ask.range?.[at], ask.preset, at);
      }
    }
    const value = ask.values[i];
    if (typeof value === "number" && Number.isFinite(value)) {
      const ruled = matchRule(value, ask.rules, ask.preset);
      if (ruled) color = ruled;
    }
    out.push(color);
  }
  return out;
}
