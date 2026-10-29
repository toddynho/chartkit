import { registerGeometry, registerPreset, type PresetTokens } from "../theme";

function ld(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function ldList(light: readonly string[], dark: readonly string[]): string[] {
  return light.map((color, index) => ld(color, dark[index] ?? color));
}

export const editorial: PresetTokens = {
  background: "transparent",
  surface: ld("#f6f9fc", "#12182b"),
  text: ld("#0a2540", "#f6f9fc"),
  muted: ld("#425466", "#adbdcc"),
  grid: ld("rgba(10, 37, 64, 0.06)", "rgba(246, 249, 252, 0.07)"),
  axis: ld("rgba(10, 37, 64, 0.18)", "rgba(246, 249, 252, 0.18)"),
  track: ld("rgba(10, 37, 64, 0.12)", "rgba(246, 249, 252, 0.16)"),
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

registerPreset("editorial", editorial);
registerGeometry("editorial", {
  strokeWidth: 2.25,
  compactStroke: 2.25,
  cornerRadius: 2,
  gap: 0.18,
  fillOpacity: 0.28,
  points: "always",
  pointSize: 3,
});
