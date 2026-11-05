/** Presets whose paint is a single scheme. light-dark presets stay on both. */
export const DARK_PRESETS = new Set([
  "midnight",
  "emerald",
  "mono",
  "slate",
  "arctic",
  "orchid",
  "obsidian",
  "neon",
  "mocha",
  "owl",
  "retro",
  "copper",
  "rose",
  "tape",
]);

export const LIGHT_PRESETS = new Set(["sunset", "silver", "pearl", "latte"]);

export const LIGHT_PAGE = "#ffffff";
export const DARK_PAGE = "#0c0c0c";

export function themePreset(spec) {
  const theme = spec?.theme;
  if (typeof theme === "string") return theme;
  if (theme && typeof theme === "object" && typeof theme.preset === "string") return theme.preset;
  return "";
}

export function themeMode(spec) {
  const theme = spec?.theme;
  if (theme && typeof theme === "object" && typeof theme.mode === "string") return theme.mode;
  return "";
}

/** Schemes a contrast check should score. Auto and light-dark presets get both. */
export function schemeModes(spec) {
  const mode = themeMode(spec);
  const preset = themePreset(spec);
  if (mode === "dark" || DARK_PRESETS.has(preset)) return ["dark"];
  if (mode === "light" || LIGHT_PRESETS.has(preset)) return ["light"];
  return ["light", "dark"];
}

/** Snapshot scheme. Auto resolves light, which is the default page. */
export function rasterDark(spec) {
  const modes = schemeModes(spec);
  return modes.length === 1 && modes[0] === "dark";
}
