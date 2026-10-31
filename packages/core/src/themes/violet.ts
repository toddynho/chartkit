import { definePreset, registerGeometry } from "../theme";

/**
 * Frozen createTheme({ brand: "#6d28d9" }).
 * Light and dark are the review-page swatches. Pattern tiles are not painted.
 */
function ld(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function ldList(light: readonly string[], dark: readonly string[]): string[] {
  return light.map((color, index) => ld(color, dark[index] ?? color));
}

const lightSeries = ["#694bb5", "#946d11", "#682b68", "#1c5619", "#238197", "#7c504b", "#3c578a", "#646108"];
const darkSeries = ["#6b5d9e", "#eec474", "#ad8cac", "#60ae5b", "#5eddfe", "#d5a39c", "#8bb1f7", "#c1bd45"];

export const violet = definePreset("violet", {
  background: ld("#f7f5fe", "#1b1827"),
  surface: ld("#ffffff", "#292734"),
  text: ld("#292732", "#f2f1f8"),
  muted: ld("#5e5c68", "#b7b6c0"),
  grid: ld("rgba(41, 39, 50, 0.12)", "rgba(242, 241, 248, 0.16)"),
  axis: ld("rgba(41, 39, 50, 0.38)", "rgba(242, 241, 248, 0.42)"),
  track: ld("rgba(41, 39, 50, 0.1)", "rgba(242, 241, 248, 0.1)"),
  accent: ld("#694bb5", "#6b5d9e"),
  positive: ld("#1b589e", "#7eb6ff"),
  negative: ld("#a83825", "#f47d67"),
  series: ldList(lightSeries, darkSeries),
  lines: ldList(lightSeries, darkSeries),
  fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif",
});

registerGeometry("violet", {
  strokeWidth: 2,
  compactStroke: 2,
  cornerRadius: 8,
  gap: 0.34,
  fillOpacity: 0.22,
  points: "none",
  pointSize: 3,
});
