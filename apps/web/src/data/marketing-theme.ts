/**
 * Homepage and showcase series.
 * Series 1 stays brand blue. Later series are warm accents so multi-series
 * and categorical charts are not a single blue ramp.
 * Gallery thumbs keep the restrained blue ramp in `galleryTheme`.
 */
export const SERIES = [
  "#0a63e6",
  "#e07a2f",
  "#1f8a4c",
  "#7a4de0",
  "#e24b4b",
  "#c9891a",
  "#0e8a8a",
  "#7fb0f5",
] as const;

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
    positive: "#1f8a4c",
    negative: "#e24b4b",
    series: [...SERIES],
  },
} as const;

/** Gallery cards stay on the blue / pale / tint / ink ramp from the gallery handoff. */
export const galleryTheme = {
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

export const BRAND = SERIES;
