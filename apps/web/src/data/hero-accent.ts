import { SERIES } from "./marketing-theme";

/**
 * Homepage hero color for direction A.
 * Single-series types take the next marketing color in catalog order.
 * Multi-series types keep the full palette. Candle, waterfall, and gantt
 * keep green/red semantics (gantt's active bar stays the lead blue).
 * #7fb0f5 is 2.1:1 on the page, so that slot is pulled toward ink until it clears 3:1.
 */

const MULTI = new Set([
  "line",
  "pie",
  "donut",
  "stacked-area",
  "combo",
  "bullet",
  "radial-bar",
  "boxplot",
  "rose",
  "sankey",
  "treemap",
  "sunburst",
  "venn",
  "timeline",
  "journey",
]);

const SEMANTIC = new Set(["candlestick", "waterfall", "gantt"]);

/** These read accent, not series. */
const ACCENT = new Set(["gauge", "quadrant", "map-points"]);

/** Sequential ramps do not read series tokens. The range is that one hue. */
const RAMP = new Set(["heatmap", "choropleth"]);

/** Also paints accent: timeline events, waterfall totals, gantt's active bar. */
const ACCENT_TOO = new Set(["timeline", "waterfall", "gantt"]);

const POSITIVE = "#1f8a4c";
const NEGATIVE = "#e24b4b";
const LEAD = SERIES[0];

export type HeroPaint = {
  tokens?: Record<string, string | string[]>;
  range?: string[];
};

function mix(base: string, toward: string, amount: number): string {
  const channel = (hex: string) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  const from = channel(base);
  const to = channel(toward);
  const mixed = from.map((value, index) => Math.round(value + ((to[index] ?? value) - value) * amount));
  return `#${mixed.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

/** Palette slot 8 is too light to be a mark on its own. */
function ink(color: string): string {
  return color.toLowerCase() === "#7fb0f5" ? mix(color, "#141416", 0.21) : color;
}

function rampOf(color: string): string[] {
  return [mix(color, "#ffffff", 0.82), mix(color, "#ffffff", 0.42), color];
}

export function heroPaints(types: readonly string[]): Map<string, HeroPaint> {
  const paints = new Map<string, HeroPaint>();
  let cursor = 0;
  for (const type of types) {
    if (SEMANTIC.has(type)) {
      const tokens: Record<string, string | string[]> = { positive: POSITIVE, negative: NEGATIVE };
      if (ACCENT_TOO.has(type)) tokens.accent = LEAD;
      paints.set(type, { tokens });
      continue;
    }
    if (MULTI.has(type)) {
      const tokens: Record<string, string | string[]> = { series: [...SERIES] };
      if (ACCENT_TOO.has(type)) tokens.accent = LEAD;
      paints.set(type, { tokens });
      continue;
    }
    const color = ink(SERIES[cursor % SERIES.length] ?? LEAD);
    cursor += 1;
    if (RAMP.has(type)) {
      paints.set(type, { range: rampOf(color) });
      continue;
    }
    paints.set(type, { tokens: ACCENT.has(type) ? { accent: color } : { series: [color] } });
  }
  return paints;
}

export function applyHeroColor(spec: Record<string, unknown>, paint: HeroPaint): Record<string, unknown> {
  const next: Record<string, unknown> = { ...spec };
  if (paint.tokens) next.theme = { tokens: paint.tokens };
  if (!paint.range) return next;
  const encoding = { ...(isRecord(spec.encoding) ? spec.encoding : {}) };
  const color = encoding.color;
  const field = typeof color === "string" ? color : isRecord(color) && typeof color.field === "string" ? color.field : "";
  if (!field) throw new Error(`${String(spec.type)} has no color field for its ramp`);
  encoding.color = { field, range: paint.range };
  next.encoding = encoding;
  return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
