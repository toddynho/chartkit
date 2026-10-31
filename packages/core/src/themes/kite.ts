import { definePreset, registerGeometry } from "../theme";

function ld(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

function ldList(light: readonly string[], dark: readonly string[]): string[] {
  return light.map((color, index) => ld(color, dark[index] ?? color));
}

const lightSeries = ["#c43766", "#2a5bd0", "#9a6a08", "#0d7a58", "#a33b88", "#7a4030"];
const darkSeries = ["#ff8fb0", "#8eb0ff", "#f0c14a", "#7ddec0", "#fff6ee", "#f0b090"];

/** Cream paper in daylight, plum dusk at night. Fruit colours that still separate. */
export const kite = definePreset("kite", {
  background: ld("#fff6ee", "#2a2340"),
  surface: ld("#fffaf6", "#352b4e"),
  text: ld("#2a211c", "#fff6ee"),
  muted: ld("#5e493f", "#d9cde4"),
  grid: ld("rgba(42, 33, 28, 0.10)", "rgba(255, 246, 238, 0.12)"),
  axis: ld("rgba(42, 33, 28, 0.28)", "rgba(255, 246, 238, 0.28)"),
  track: ld("rgba(42, 33, 28, 0.08)", "rgba(255, 246, 238, 0.12)"),
  accent: ld("#c43766", "#ff8fb0"),
  positive: ld("#2a5bd0", "#8eb0ff"),
  negative: ld("#c43766", "#ff8fb0"),
  series: ldList(lightSeries, darkSeries),
  lines: ldList(lightSeries, darkSeries),
  fontFamily: "Nunito, ui-sans-serif, sans-serif",
});

registerGeometry("kite", {
  strokeWidth: 2.6,
  compactStroke: 2.25,
  cornerRadius: 14,
  gap: 0.4,
  fillOpacity: 0.3,
  points: "none",
  pointSize: 4,
});
