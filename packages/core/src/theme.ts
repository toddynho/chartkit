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

function preset(
  background: string,
  surface: string,
  text: string,
  muted: string,
  grid: string,
  axis: string,
  accent: string,
  positive: string,
  negative: string,
  series: string[],
): PresetTokens {
  return { background, surface, text, muted, grid, axis, accent, positive, negative, series };
}

export const PRESETS: Record<string, PresetTokens> = {
  midnight: preset("#0c0c0c", "#1a1a1a", "#ffffff", "#8a8a8a", "#1f1f1f", "#262626", "#22d3ee", "#4ade80", "#f87171", ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#14b8a6", "#f43f5e", "#8b5cf6"]),
  emerald: preset("#0a0a0a", "#171717", "#fafafa", "#737373", "#1a1a1a", "#262626", "#06b6d4", "#10b981", "#ef4444", ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f43f5e", "#a855f7"]),
  mono: preset("#000000", "#111111", "#ededed", "#888888", "#222222", "#333333", "#ffffff", "#50e3c2", "#ee0000", ["#50e3c2", "#0070f3", "#7928ca", "#f5a623", "#ff0080"]),
  slate: preset("#0d1117", "#21262d", "#f0f6fc", "#8b949e", "#21262d", "#30363d", "#58a6ff", "#3fb950", "#f85149", ["#3fb950", "#58a6ff", "#a371f7", "#d29922", "#f778ba", "#39d353", "#f85149", "#bc8cff"]),
  arctic: preset("#2e3440", "#434c5e", "#eceff4", "#d8dee9", "#3b4252", "#4c566a", "#88c0d0", "#a3be8c", "#bf616a", ["#88c0d0", "#81a1c1", "#b48ead", "#ebcb8b", "#a3be8c"]),
  orchid: preset("#282a36", "#44475a", "#f8f8f2", "#6272a4", "#343746", "#44475a", "#bd93f9", "#50fa7b", "#ff5555", ["#50fa7b", "#8be9fd", "#bd93f9", "#ffb86c", "#ff79c6"]),
  obsidian: preset("#282c34", "#2c313a", "#abb2bf", "#828997", "#2c313a", "#3e4451", "#61afef", "#98c379", "#e06c75", ["#98c379", "#61afef", "#c678dd", "#e5c07b", "#e06c75"]),
  neon: preset("#1a1b26", "#24283b", "#c0caf5", "#565f89", "#1f2335", "#292e42", "#7aa2f7", "#9ece6a", "#f7768e", ["#9ece6a", "#7aa2f7", "#bb9af7", "#e0af68", "#f7768e"]),
  mocha: preset("#1e1e2e", "#313244", "#cdd6f4", "#a6adc8", "#313244", "#45475a", "#89b4fa", "#a6e3a1", "#f38ba8", ["#a6e3a1", "#89b4fa", "#cba6f7", "#fab387", "#f38ba8"]),
  owl: preset("#011627", "#112630", "#d6deeb", "#7fdbca", "#0b2942", "#1d3b53", "#82aaff", "#22da6e", "#ef5350", ["#22da6e", "#82aaff", "#c792ea", "#ffcb8b", "#f78c6c"]),
  retro: preset("#262335", "#34294f", "#ffffff", "#848bbd", "#34294f", "#495495", "#ff7edb", "#72f1b8", "#fe4450", ["#72f1b8", "#36f9f6", "#fe4450", "#fede5d", "#ff7edb"]),
  copper: preset("#282828", "#3c3836", "#ebdbb2", "#a89984", "#3c3836", "#504945", "#fabd2f", "#b8bb26", "#fb4934", ["#b8bb26", "#83a598", "#d3869b", "#fabd2f", "#fb4934"]),
  rose: preset("#191724", "#26233a", "#e0def4", "#908caa", "#26233a", "#403d52", "#c4a7e7", "#9ccfd8", "#eb6f92", ["#31748f", "#9ccfd8", "#c4a7e7", "#f6c177", "#ebbcba"]),
  sunset: preset("#ffffff", "#ffffff", "#111827", "#6b7280", "#f3f4f6", "#e5e7eb", "#f59e0b", "#10b981", "#ef4444", ["#059669", "#0284c7", "#7c3aed", "#d97706", "#db2777", "#0891b2", "#dc2626", "#9333ea"]),
  silver: preset("#ffffff", "#ffffff", "#24292f", "#57606a", "#eaeef2", "#d0d7de", "#0969da", "#1a7f37", "#cf222e", ["#1a7f37", "#0969da", "#8250df", "#bf8700", "#cf222e"]),
  pearl: preset("#fafafa", "#ffffff", "#383a42", "#696c77", "#f0f0f1", "#e5e5e6", "#4078f2", "#50a14f", "#e45649", ["#50a14f", "#4078f2", "#a626a4", "#c18401", "#e45649"]),
  latte: preset("#eff1f5", "#ffffff", "#4c4f69", "#6c6f85", "#e6e9ef", "#ccd0da", "#1e66f5", "#40a02b", "#d20f39", ["#40a02b", "#1e66f5", "#8839ef", "#df8e1d", "#d20f39"]),
};

export function resolvePreset(theme: unknown): PresetTokens {
  const baseName = presetName(theme);
  const base = PRESETS[baseName] ?? PRESETS.midnight;
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
  if (typeof theme === "string" && theme !== "auto" && PRESETS[theme]) return theme;
  if (isRecord(theme) && typeof theme.preset === "string" && theme.preset !== "auto" && PRESETS[theme.preset]) {
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
