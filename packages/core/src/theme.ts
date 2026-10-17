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

/**
 * Default when theme is omitted or "auto".
 * Fallbacks use light-dark() so prefers-color-scheme (and a color-scheme on an ancestor) wins.
 * cssVar() still prefers --ck-*, so a host override beats these.
 */
export const auto: PresetTokens = {
  background: "transparent",
  surface: "light-dark(#ffffff, #0f172a)",
  text: "light-dark(#0f172a, #f8fafc)",
  muted: "light-dark(#64748b, #94a3b8)",
  grid: "light-dark(rgb(15 23 42 / 0.08), rgb(248 250 252 / 0.12))",
  axis: "light-dark(rgb(15 23 42 / 0.18), rgb(248 250 252 / 0.22))",
  accent: "light-dark(#0f766e, #2dd4bf)",
  positive: "light-dark(#047857, #34d399)",
  negative: "light-dark(#be123c, #fb7185)",
  series: [
    "light-dark(#0f766e, #2dd4bf)",
    "light-dark(#1d4ed8, #60a5fa)",
    "light-dark(#b45309, #fbbf24)",
    "light-dark(#be123c, #fb7185)",
    "light-dark(#6d28d9, #c4b5fd)",
    "light-dark(#047857, #34d399)",
    "light-dark(#0369a1, #38bdf8)",
    "light-dark(#a16207, #fcd34d)",
  ],
};

const presets = new Map<string, PresetTokens>([
  ["midnight", midnight],
  ["auto", auto],
]);

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

/** Series paint: host --ck-series-N, then shadcn --chart-N, then the preset. */
function seriesPaint(n: number, preset: PresetTokens): string {
  const index = ((n - 1) % preset.series.length + preset.series.length) % preset.series.length;
  const fallback = preset.series[index] ?? preset.accent;
  return `var(--ck-series-${n}, var(--chart-${n}, ${fallback}))`;
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
  if (typeof theme === "string") {
    if (theme === "auto") return "auto";
    return presets.has(theme) ? theme : "midnight";
  }
  if (isRecord(theme) && typeof theme.preset === "string") {
    if (theme.preset === "auto") return "auto";
    return presets.has(theme.preset) ? theme.preset : "midnight";
  }
  return "auto";
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
