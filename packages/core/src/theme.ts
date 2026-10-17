/** Preset fallbacks. Paint uses `var(--ck-*)` first so a host can override every token. */

export interface PresetTokens {
  background: string;
  surface: string;
  text: string;
  muted: string;
  grid: string;
  axis: string;
  accent: string;
  positive: string;
  negative: string;
  series: string[];
}

/** Built in. Every other preset is an opt-in import that calls `definePreset`. */
export const midnight: PresetTokens = {
  background: "#0c0c0c",
  surface: "#1a1a1a",
  text: "#ffffff",
  muted: "#8a8a8a",
  grid: "#1f1f1f",
  axis: "#262626",
  accent: "#22d3ee",
  positive: "#4ade80",
  negative: "#f87171",
  series: ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#14b8a6", "#f43f5e", "#8b5cf6"],
};

const presets = new Map<string, PresetTokens>([["midnight", midnight]]);

export function registerPreset(name: string, tokens: PresetTokens): PresetTokens {
  presets.set(name, tokens);
  return tokens;
}

/** Merge a preset onto midnight and register it. Unchanged tokens stay on the base. */
export function definePreset(name: string, delta: Partial<PresetTokens>): PresetTokens {
  return registerPreset(name, {
    ...midnight,
    ...delta,
    series: delta.series ?? midnight.series,
  });
}

export function resolvePreset(theme: unknown): PresetTokens {
  const baseName = presetName(theme);
  const base = presets.get(baseName) ?? midnight;
  const tokens = themeRecord(theme);
  if (!tokens) return base;
  return {
    ...base,
    background: colorOverride(tokens.background) ?? base.background,
    surface: colorOverride(tokens.surface) ?? base.surface,
    text: colorOverride(tokens.text) ?? base.text,
    muted: colorOverride(tokens.muted) ?? base.muted,
    grid: colorOverride(tokens.grid) ?? base.grid,
    axis: colorOverride(tokens.axis) ?? base.axis,
    accent: colorOverride(tokens.accent) ?? base.accent,
    positive: colorOverride(tokens.positive) ?? base.positive,
    negative: colorOverride(tokens.negative) ?? base.negative,
    series: Array.isArray(tokens.series)
      ? tokens.series.filter((item): item is string => typeof item === "string" && item.length > 0)
      : base.series,
  };
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
};

/** A CSS color, a var(), or a theme token name (`series-3`, `positive`, …). */
export function paint(color: string | undefined, preset: PresetTokens, seriesIndex = 0): string {
  if (!color) {
    const fallback = preset.series[seriesIndex % preset.series.length] ?? preset.accent;
    return cssVar(`series-${seriesIndex + 1}`, fallback);
  }
  const seriesMatch = /^series-(\d+)$/.exec(color);
  if (seriesMatch) {
    const n = Number(seriesMatch[1]);
    const fallback = preset.series[(n - 1) % preset.series.length] ?? preset.accent;
    return cssVar(`series-${n}`, fallback);
  }
  const key = TOKEN_KEYS[color];
  if (key) {
    const fallback = preset[key];
    return cssVar(color, typeof fallback === "string" ? fallback : preset.accent);
  }
  return color;
}

function presetName(theme: unknown): string {
  if (typeof theme === "string" && theme !== "auto" && presets.has(theme)) return theme;
  if (isRecord(theme) && typeof theme.preset === "string" && theme.preset !== "auto" && presets.has(theme.preset)) {
    return theme.preset;
  }
  return "midnight";
}

function themeRecord(theme: unknown): Record<string, unknown> | undefined {
  if (!isRecord(theme) || !isRecord(theme.tokens)) return undefined;
  return theme.tokens;
}

function colorOverride(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  if (value.startsWith("var(") || value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl") || value.startsWith("oklch")) {
    return value;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
