/** Handoff palette. Series stay inside blue, pale blue, tint, and ink. */
export const brandTheme = {
  preset: "soft",
  mode: "light",
  tokens: {
    background: "transparent",
    text: "#17181a",
    muted: "#8b8d93",
    grid: "#ebebe8",
    axis: "#e6e6e2",
    accent: "#0a63e6",
    positive: "#0a63e6",
    negative: "#17181a",
    series: ["#0a63e6", "#7fb0f5", "#cfe0fa", "#17181a"],
  },
} as const;

export const BRAND = ["#0a63e6", "#7fb0f5", "#cfe0fa", "#17181a"] as const;
