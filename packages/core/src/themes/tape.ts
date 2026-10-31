import { definePreset, registerGeometry } from "../theme";

/**
 * Trading desk after the close. Dark only.
 * Up and down are blue and clay, so a deuteranopic book can still separate them.
 */
export const tape = definePreset("tape", {
  background: "#14120e",
  surface: "#1e1b16",
  text: "#f3efe4",
  muted: "#c4b8a4",
  grid: "#2c2822",
  axis: "#4a4338",
  track: "#2c2822",
  accent: "#e0a31d",
  positive: "#4d8eef",
  negative: "#e07a4c",
  series: ["#e0a31d", "#4d8eef", "#de708c", "#5dccc0", "#c4b6f2", "#f0d48a", "#f6f1e8"],
  lines: ["#e0a31d", "#4d8eef", "#de708c", "#5dccc0", "#c4b6f2", "#f0d48a", "#f6f1e8"],
  fontFamily: "'Geist Mono', ui-monospace, monospace",
});

registerGeometry("tape", {
  strokeWidth: 1.5,
  compactStroke: 1.25,
  cornerRadius: 1,
  gap: 0.12,
  fillOpacity: 0.14,
  points: "none",
  pointSize: 2,
});
