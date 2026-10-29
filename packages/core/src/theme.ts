import { geometries, presets, registerGeometry, registerPreset } from "./feature-hooks";
import { midnight as midnightBase } from "./themes/midnight-tokens";

export { registerGeometry, registerPreset };

/** Preset fallbacks. Paint uses `var(--ck-*)` first so a host can override every token. */

export interface PresetTokens {
  background: string;
  surface: string;
  text: string;
  muted: string;
  grid: string;
  axis: string;
  /** Gauge and progress-ring track. Hosts override with --ck-track. */
  track: string;
  accent: string;
  positive: string;
  negative: string;
  /** Fills. Hosts override with --ck-series-N. */
  series: string[];
  /** Strokes at or under 2px. Hosts override with --ck-line-N. */
  lines: string[];
  /**
   * Series came from mark.palette. Paint those colours directly so a host
   * --ck-series-N does not cover the spec. Unset for theme tokens.
   */
  explicit?: boolean;
  /** Written onto the chart as --ck-font-family when the spec sets it. */
  fontFamily?: string;
  /** Tick and axis-title size in px. Omitted keeps the 11px default. */
  fontSize?: number;
}

/** Render-time geometry. Gap moves bar positions, so it is chosen here rather than live from CSS. */
export interface PresetGeometry {
  strokeWidth: number;
  /** Sparkline and mini-area stroke when mark.strokeWidth is omitted. */
  compactStroke: number;
  cornerRadius: number;
  gap: number;
  fillOpacity: number;
  points: "none" | "hover" | "always";
  pointSize: number;
}

/**
 * Soft, the default when theme is omitted, "auto", or "soft".
 * The plot fill is transparent so a white page and any other page show through.
 * The #f5f5f7 / #1c1c1e card is optional: set --ck-background, or use the stylesheet.
 * Colour fallbacks use light-dark() so the page color-scheme wins. --ck-* still wins over these.
 */
export const auto: PresetTokens = {
  background: "transparent",
  surface: ld("#ffffff", "#2c2c2e"),
  text: ld("#1d1d1f", "#f5f5f7"),
  muted: ld("#6e6e73", "#98989d"),
  grid: ld("rgba(0, 0, 0, 0.16)", "rgba(245, 245, 247, 0.22)"),
  axis: ld("rgba(0, 0, 0, 0.14)", "rgba(245, 245, 247, 0.16)"),
  track: ld("rgba(0, 0, 0, 0.10)", "rgba(245, 245, 247, 0.16)"),
  accent: ld("#007aff", "#0a84ff"),
  positive: ld("#15803d", "#30d158"),
  negative: ld("#be123c", "#ff453a"),
  series: ldList(
    ["#007aff", "#34c759", "#ff9500", "#af52de", "#ff2d55", "#32ade6", "#65a30d", "#ff6723"],
    ["#0a84ff", "#30d158", "#ff9f0a", "#bf5af2", "#ff375f", "#64d2ff", "#a3e635", "#ff6961"],
  ),
  lines: ldList(
    ["#007aff", "#248a3d", "#c93400", "#af52de", "#ff2d55", "#0071a4", "#4d7c0f", "#9a3412"],
    ["#0a84ff", "#30d158", "#ff9f0a", "#bf5af2", "#ff375f", "#64d2ff", "#a3e635", "#ff6961"],
  ),
};

/** Same tokens as auto. Named so `theme: "soft"` does not fall through to midnight. */
export const soft: PresetTokens = auto;

const softGeometry: PresetGeometry = {
  strokeWidth: 2,
  compactStroke: 2,
  cornerRadius: 8,
  gap: 0.34,
  fillOpacity: 0.22,
  points: "none",
  pointSize: 3,
};

registerGeometry("auto", softGeometry);
registerGeometry("soft", softGeometry);

/** Geometry for midnight and for presets that do not name their own. */
const legacyGeometry: PresetGeometry = {
  strokeWidth: 2,
  compactStroke: 1.5,
  cornerRadius: 3,
  gap: 0.25,
  fillOpacity: 0.28,
  points: "hover",
  pointSize: 3,
};

registerPreset("auto", auto);
registerPreset("soft", soft);

/** Merge a preset onto midnight and register it. Unchanged tokens stay on the base. */
export function definePreset(name: string, delta: Partial<PresetTokens>): PresetTokens {
  return registerPreset(name, {
    ...midnightBase,
    ...delta,
    series: delta.series ?? midnightBase.series,
  });
}

export function resolvePreset(theme: unknown): PresetTokens {
  const name = presetName(theme);
  const mode = isRecord(theme) && theme.mode === "dark" ? "dark" : isRecord(theme) && theme.mode === "light" ? "light" : "auto";
  const midnight = presets.get("midnight");
  let base = presets.get(name) ?? midnight ?? auto;
  if (mode === "dark" && name !== "midnight" && midnight) base = midnight;
  else if (mode === "light" && name === "midnight") base = auto;
  const tokens = themeRecord(theme);
  if (!tokens) return base;
  const next: PresetTokens = { ...base };
  for (const key of Object.keys(TOKEN_KEYS) as (keyof PresetTokens)[]) {
    const color = colorOverride(tokens[key]);
    if (typeof color === "string") next[key] = color as never;
  }
  if (Array.isArray(tokens.series)) next.series = tokens.series.filter((item): item is string => typeof item === "string" && item.length > 0);
  if (Array.isArray(tokens.lines)) next.lines = tokens.lines.filter((item): item is string => typeof item === "string" && item.length > 0);
  else if (Array.isArray(tokens.series)) next.lines = next.series;
  const family = typeFamily(tokens.fontFamily);
  if (family) next.fontFamily = family;
  const size = typeSize(tokens.fontSize);
  if (size) next.fontSize = size;
  return next;
}

function typeFamily(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim().replace(/["<>;]/g, "");
  return text.length > 0 && text.length <= 80 ? text : "";
}

function typeSize(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return;
  const size = Math.round(value);
  return size >= 6 && size <= 32 ? size : undefined;
}

export function resolveGeometry(theme: unknown): PresetGeometry {
  return geometries.get(presetName(theme)) ?? legacyGeometry;
}

export function cssVar(token: string, fallback: string): string {
  return `var(--ck-${token}, ${fallback})`;
}

const TOKEN_KEYS: Record<string, keyof PresetTokens> = {
  background: "background",
  surface: "surface",
  text: "text",
  muted: "muted",
  grid: "grid",
  axis: "axis",
  accent: "accent",
  positive: "positive",
  negative: "negative",
  track: "track",
};

/** Series paint: host --ck-series-N, then shadcn --chart-N, then the preset. A spec palette skips the variables. */
function seriesPaint(n: number, preset: PresetTokens): string {
  const index = ((n - 1) % preset.series.length + preset.series.length) % preset.series.length;
  const fallback = preset.series[index] ?? preset.accent;
  if (preset.explicit) return literalPaint(fallback, preset);
  return `var(--ck-series-${n}, var(--chart-${n}, ${fallback}))`;
}

/** A palette entry: a token still tracks the theme, a CSS colour stays itself. */
function literalPaint(color: string, preset: PresetTokens): string {
  const key = TOKEN_KEYS[color];
  if (key && key !== "series" && key !== "lines") {
    const fallback = preset[key];
    return cssVar(color, typeof fallback === "string" ? fallback : preset.accent);
  }
  return color;
}

/**
 * Stroke for a line at or under 2px. Hosts can set --ck-line-N to a darker
 * variant; when that variable is unset the series colour is used, so the
 * default paint does not change.
 */
export function lineStroke(color: string, width: number, lines?: readonly string[]): string {
  if (!(width <= 2)) return color;
  const match = /^var\(--ck-series-(\d+),/.exec(color);
  if (!match) return color;
  const index = Number(match[1]) - 1;
  const fallback = lines && lines.length > 0 ? lines[(index % lines.length + lines.length) % lines.length] : color;
  return `var(--ck-line-${match[1]}, ${fallback})`;
}

/** A CSS color, a var(), or a theme token name (`series-3`, `positive`, …). */
export function paint(color: string | undefined, preset: PresetTokens, seriesIndex = 0): string {
  if (!color) return seriesPaint(seriesIndex + 1, preset);
  const seriesMatch = /^series-(\d+)$/.exec(color);
  if (seriesMatch) return seriesPaint(Number(seriesMatch[1]), preset);
  const chartVar = /^var\(--chart-(\d+)\)$/.exec(color.trim());
  if (chartVar) return seriesPaint(Number(chartVar[1]), preset);
  const key = TOKEN_KEYS[color];
  if (key) {
    const fallback = preset[key];
    return cssVar(color, typeof fallback === "string" ? fallback : preset.accent);
  }
  const bare = /^var\(--[A-Za-z0-9-_]+\)$/.exec(color.trim());
  if (bare) {
    const fallback = preset.series[seriesIndex % preset.series.length] ?? preset.accent;
    return `${color.trim().slice(0, -1)}, ${fallback})`;
  }
  return color;
}

function presetName(theme: unknown): string {
  const name = typeof theme === "string" ? theme : isRecord(theme) && typeof theme.preset === "string" ? theme.preset : null;
  if (name === null || name === "auto") return "auto";
  if (name === "soft") return presets.has("soft") ? "soft" : "auto";
  if (presets.has(name)) return name;
  return presets.has("midnight") ? "midnight" : "auto";
}

function themeRecord(theme: unknown): Record<string, unknown> | undefined {
  if (!isRecord(theme) || !isRecord(theme.tokens)) return undefined;
  return theme.tokens;
}

function colorOverride(value: unknown): string | undefined {
  return typeof value === "string" && /^(?:var\(|#|rgb|hsl|oklch|transparent$)/.test(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ld(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function ldList(light: readonly string[], dark: readonly string[]): string[] {
  return light.map((color, index) => ld(color, dark[index] ?? color));
}
