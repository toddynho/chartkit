import type { PresetTokens } from "../theme";

const midnightSeries = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#14b8a6", "#f43f5e", "#8b5cf6"];

/** Opt-in dark card. Token data only, so a default-theme bundle does not register it. */
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
