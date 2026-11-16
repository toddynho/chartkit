/**
 * Comparison-chart colors.
 * ChartKit stays the saturated primary blue.
 * Each other library is a different hue, desaturated so the blue still leads.
 * `fill` is the mark (dot or band). `ink` is the label, at least 5.5:1 on #fff and #f5f5f7.
 * `band` is the light range wash behind a token row.
 */

export type RivalSwatch = { fill: string; ink: string; band: string };

const CHARTKIT: RivalSwatch = {
  fill: "#0a63e6",
  ink: "#0a63e6",
  band: "rgba(10, 99, 230, 0.18)",
};

const RIVALS: Record<string, RivalSwatch> = {
  uPlot: { fill: "#598a91", ink: "#345e65", band: "#e1edef" },
  "Chart.js": { fill: "#b06d98", ink: "#6a2f54", band: "#efe1ea" },
  Plot: { fill: "#7d894d", ink: "#5d6831", band: "#ecefe1" },
  "Observable Plot": { fill: "#7d894d", ink: "#5d6831", band: "#ecefe1" },
  Recharts: { fill: "#4d896b", ink: "#31684d", band: "#e1efe8" },
  ECharts: { fill: "#826ea6", ink: "#463465", band: "#e6e1ef" },
  Nivo: { fill: "#b67154", ink: "#6d402c", band: "#efe5e1" },
  "Vega-Lite": { fill: "#a68a4d", ink: "#6b5520", band: "#efeadf" },
  Victory: { fill: "#a66e6e", ink: "#6a3434", band: "#efe1e1" },
  ApexCharts: { fill: "#6e8f9e", ink: "#3c5a68", band: "#e1eaef" },
  "MUI X Charts": { fill: "#8a8a8f", ink: "#55555a", band: "#e9e9ec" },
};

export function rivalSwatch(name: string): RivalSwatch {
  if (name === "ChartKit") return CHARTKIT;
  const swatch = RIVALS[name];
  if (!swatch) throw new Error(`No comparison color for ${name}`);
  return swatch;
}
