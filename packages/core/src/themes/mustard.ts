import { definePreset, registerGeometry } from "../theme";

/**
 * Frozen createTheme({ brand: "#ca8a04" }).
 * Light and dark are the review-page swatches. Pattern tiles are not painted.
 */
function ld(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function ldList(light: readonly string[], dark: readonly string[]): string[] {
  return light.map((color, index) => ld(color, dark[index] ?? color));
}

const lightSeries = ["#ba8116", "#0f4f64", "#6a6c43", "#594da8", "#7f1843", "#4f8070", "#7a4124", "#396695"];
const darkSeries = ["#c98a0e", "#7ed8fc", "#cfd35e", "#928aea", "#e89fb4", "#a4d8c5", "#ee8f61", "#7bb6f5"];

export const mustard = definePreset("mustard", {
  background: ld("#fcf6ee", "#23190a"),
  surface: ld("#ffffff", "#30271b"),
  text: ld("#2f281e", "#f6f1eb"),
  muted: ld("#645c51", "#bdb6ad"),
  grid: ld("rgba(47, 40, 30, 0.12)", "rgba(246, 241, 235, 0.16)"),
  axis: ld("rgba(47, 40, 30, 0.38)", "rgba(246, 241, 235, 0.42)"),
  track: ld("rgba(47, 40, 30, 0.1)", "rgba(246, 241, 235, 0.1)"),
  accent: ld("#ba8116", "#c98a0e"),
  positive: ld("#1b589e", "#7eb6ff"),
  negative: ld("#a83825", "#f47d67"),
  series: ldList(lightSeries, darkSeries),
  lines: ldList(lightSeries, darkSeries),
  fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif",
});

registerGeometry("mustard", {
  strokeWidth: 2,
  compactStroke: 2,
  cornerRadius: 8,
  gap: 0.34,
  fillOpacity: 0.22,
  points: "none",
  pointSize: 3,
});
