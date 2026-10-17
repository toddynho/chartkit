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

const midnightSeries = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#14b8a6", "#f43f5e", "#8b5cf6"];

/** Opt-in dark card. Unknown preset names still resolve here. */
export const midnight: PresetTokens = {
  background: "#0c0c0c",
  surface: "#1a1a1a",
  text: "#ffffff",
  muted: "#8a8a8a",
  grid: "#1f1f1f",
  axis: "#262626",
  track: "#1f1f1f",
  accent: "#22d3ee",
  positive: "#4ade80",
  negative: "#f87171",
  series: midnightSeries,
  lines: midnightSeries,
};

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
  grid: ld("rgb(0 0 0 / 0.05)", "rgb(245 245 247 / 0.07)"),
  axis: ld("rgb(0 0 0 / 0.14)", "rgb(245 245 247 / 0.16)"),
  track: ld("rgb(0 0 0 / 0.10)", "rgb(245 245 247 / 0.16)"),
  accent: ld("#007aff", "#0a84ff"),
  positive: ld("#047857", "#30d158"),
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

export const refined: PresetTokens = {
  background: "transparent",
  surface: ld("#fafafa", "#18181b"),
  text: ld("#18181b", "#fafafa"),
  muted: ld("#71717a", "#a1a1aa"),
  grid: ld("rgb(24 24 27 / 0.05)", "rgb(250 250 250 / 0.06)"),
  axis: ld("rgb(24 24 27 / 0.16)", "rgb(250 250 250 / 0.16)"),
  track: ld("rgb(24 24 27 / 0.12)", "rgb(250 250 250 / 0.16)"),
  accent: ld("#3b82f6", "#60a5fa"),
  positive: ld("#047857", "#34d399"),
  negative: ld("#e11d48", "#fb7185"),
  series: ldList(
    ["#3b82f6", "#e11d48", "#fbbf24", "#10b981", "#7c3aed", "#22d3ee", "#fb923c", "#ec4899"],
    ["#60a5fa", "#fb7185", "#fcd34d", "#6ee7b7", "#8b5cf6", "#22d3ee", "#fb923c", "#f472b6"],
  ),
  lines: ldList(
    ["#3b82f6", "#be123c", "#d97706", "#047857", "#7c3aed", "#0891b2", "#c2410c", "#ec4899"],
    ["#60a5fa", "#fb7185", "#fcd34d", "#6ee7b7", "#8b5cf6", "#22d3ee", "#fb923c", "#f472b6"],
  ),
};

export const editorial: PresetTokens = {
  background: "transparent",
  surface: ld("#f6f9fc", "#12182b"),
  text: ld("#0a2540", "#f6f9fc"),
  muted: ld("#425466", "#adbdcc"),
  grid: ld("rgb(10 37 64 / 0.06)", "rgb(246 249 252 / 0.07)"),
  axis: ld("rgb(10 37 64 / 0.18)", "rgb(246 249 252 / 0.18)"),
  track: ld("rgb(10 37 64 / 0.12)", "rgb(246 249 252 / 0.16)"),
  accent: ld("#4f46e5", "#c4b5fd"),
  positive: ld("#047857", "#34d399"),
  negative: ld("#e11d48", "#fb7185"),
  series: ldList(
    ["#4f46e5", "#f97316", "#059669", "#fbbf24", "#e11d48", "#22d3ee", "#a855f7", "#ec4899"],
    ["#c4b5fd", "#fb923c", "#34d399", "#fcd34d", "#fda4af", "#0891b2", "#818cf8", "#f43f5e"],
  ),
  lines: ldList(
    ["#4f46e5", "#ea580c", "#059669", "#d97706", "#e11d48", "#0891b2", "#7c3aed", "#ec4899"],
    ["#c4b5fd", "#fb923c", "#34d399", "#fcd34d", "#fda4af", "#0891b2", "#818cf8", "#f43f5e"],
  ),
};

const softGeometry: PresetGeometry = {
  strokeWidth: 2,
  compactStroke: 2,
  cornerRadius: 8,
  gap: 0.34,
  fillOpacity: 0.22,
  points: "none",
  pointSize: 3,
};

const geometries = new Map<string, PresetGeometry>([
  ["auto", softGeometry],
  ["soft", softGeometry],
  [
    "refined",
    { strokeWidth: 1.75, compactStroke: 1.75, cornerRadius: 4, gap: 0.22, fillOpacity: 0.18, points: "none", pointSize: 3 },
  ],
  [
    "editorial",
    { strokeWidth: 2.25, compactStroke: 2.25, cornerRadius: 2, gap: 0.18, fillOpacity: 0.28, points: "always", pointSize: 3 },
  ],
]);

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

const presets = new Map<string, PresetTokens>([
  ["midnight", midnight],
  ["auto", auto],
  ["soft", auto],
  ["refined", refined],
  ["editorial", editorial],
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
    track: colorOverride(tokens.track) ?? base.track,
    series: Array.isArray(tokens.series)
      ? tokens.series.filter((item): item is string => typeof item === "string" && item.length > 0)
      : base.series,
    lines: Array.isArray(tokens.lines)
      ? tokens.lines.filter((item): item is string => typeof item === "string" && item.length > 0)
      : Array.isArray(tokens.series)
        ? tokens.series.filter((item): item is string => typeof item === "string" && item.length > 0)
        : base.lines,
  };
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

/** Series paint: host --ck-series-N, then shadcn --chart-N, then the preset. */
function seriesPaint(n: number, preset: PresetTokens): string {
  const index = ((n - 1) % preset.series.length + preset.series.length) % preset.series.length;
  const fallback = preset.series[index] ?? preset.accent;
  return `var(--ck-series-${n}, var(--chart-${n}, ${fallback}))`;
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

function ld(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function ldList(light: readonly string[], dark: readonly string[]): string[] {
  return light.map((color, index) => ld(color, dark[index] ?? color));
}
