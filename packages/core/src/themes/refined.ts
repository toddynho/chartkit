import { registerGeometry, registerPreset, type PresetTokens } from "../theme";

function ld(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function ldList(light: readonly string[], dark: readonly string[]): string[] {
  return light.map((color, index) => ld(color, dark[index] ?? color));
}

export const refined: PresetTokens = {
  background: "transparent",
  surface: ld("#fafafa", "#18181b"),
  text: ld("#18181b", "#fafafa"),
  muted: ld("#71717a", "#a1a1aa"),
  grid: ld("rgba(24, 24, 27, 0.05)", "rgba(250, 250, 250, 0.06)"),
  axis: ld("rgba(24, 24, 27, 0.16)", "rgba(250, 250, 250, 0.16)"),
  track: ld("rgba(24, 24, 27, 0.12)", "rgba(250, 250, 250, 0.16)"),
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

registerPreset("refined", refined);
registerGeometry("refined", {
  strokeWidth: 1.75,
  compactStroke: 1.75,
  cornerRadius: 4,
  gap: 0.22,
  fillOpacity: 0.18,
  points: "none",
  pointSize: 3,
});
