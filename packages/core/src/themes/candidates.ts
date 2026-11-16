/**
 * Soft, refined, and editorial token sheets.
 * The same colours are registered by themes/soft, themes/refined, and themes/editorial. This module
 * stays out of the line bundle: the sheet renderer and the sync test import it.
 * The stylesheet at themes/candidates.css is the optional card and the scheme override.
 *
 * Series fills keep their hue. Text that sits on a fill is darkened separately.
 * A series color used as a graphic is judged at 3:1 against the page.
 * --ck-track is the gauge and progress-ring track.
 */

export interface LookGeometry {
  strokeWidth: number;
  cornerRadius: number;
  gap: number;
  fillOpacity: number;
  points: "none" | "always";
  pointSize: number;
}

export interface LookTokens {
  background: string;
  surface: string;
  text: string;
  muted: string;
  grid: string;
  axis: string;
  track: string;
  accent: string;
  positive: string;
  negative: string;
  series: readonly string[];
  lines: readonly string[];
  sequential: readonly string[];
  diverging: readonly string[];
}

export interface CandidateLook {
  id: "refined" | "editorial" | "soft";
  title: string;
  note: string;
  geometry: LookGeometry;
  fontFamily: string;
  light: LookTokens;
  dark: LookTokens;
}

/** Review sheets inherit the page font. Charts do the same unless a spec sets a family. */
const font = "inherit";

export const candidates: readonly CandidateLook[] = [
  {
    id: "refined",
    title: "Refined neutral",
    note: "Vercel and shadcn: white card, zinc ink, hairline grid, thin line, small bar radius.",
    geometry: { strokeWidth: 1.75, cornerRadius: 4, gap: 0.22, fillOpacity: 0.18, points: "none", pointSize: 3 },
    fontFamily: font,
    light: {
      background: "#ffffff",
      surface: "#fafafa",
      text: "#18181b",
      muted: "#71717a",
      grid: "rgba(24, 24, 27, 0.05)",
      axis: "rgba(24, 24, 27, 0.16)",
      track: "rgba(24, 24, 27, 0.12)",
      accent: "#3472d7",
      positive: "#047857",
      negative: "#e11d48",
      series: ["#3b82f6", "#e11d48", "#c08b04", "#0fa875", "#7c3aed", "#0ea2b8", "#ef6e05", "#ec4899"],
      lines: ["#3b82f6", "#be123c", "#d97706", "#047857", "#7c3aed", "#0891b2", "#c2410c", "#ec4899"],
      sequential: ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#2563eb", "#1e3a8a"],
      diverging: ["#be123c", "#fb7185", "#fecdd3", "#d4d4d8", "#a7f3d0", "#34d399", "#047857"],
    },
    dark: {
      background: "#09090b",
      surface: "#18181b",
      text: "#fafafa",
      muted: "#a1a1aa",
      grid: "rgba(250, 250, 250, 0.06)",
      axis: "rgba(250, 250, 250, 0.16)",
      track: "rgba(250, 250, 250, 0.16)",
      accent: "#60a5fa",
      positive: "#34d399",
      negative: "#fb7185",
      series: ["#60a5fa", "#fb7185", "#fcd34d", "#6ee7b7", "#8b5cf6", "#22d3ee", "#fb923c", "#f472b6"],
      lines: ["#60a5fa", "#fb7185", "#fcd34d", "#6ee7b7", "#8b5cf6", "#22d3ee", "#fb923c", "#f472b6"],
      sequential: ["#1e3a8a", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"],
      diverging: ["#fecdd3", "#fb7185", "#9f1239", "#52525b", "#065f46", "#34d399", "#a7f3d0"],
    },
  },
  {
    id: "editorial",
    title: "Vivid editorial",
    note: "Stripe and Observable: ink titles, indigo lead, heavier line, small points, tight bars.",
    geometry: { strokeWidth: 2.25, cornerRadius: 2, gap: 0.18, fillOpacity: 0.28, points: "always", pointSize: 3 },
    fontFamily: font,
    light: {
      background: "#ffffff",
      surface: "#f6f9fc",
      text: "#0a2540",
      muted: "#425466",
      grid: "rgba(10, 37, 64, 0.06)",
      axis: "rgba(10, 37, 64, 0.18)",
      track: "rgba(10, 37, 64, 0.12)",
      accent: "#4f46e5",
      positive: "#047857",
      negative: "#e11d48",
      series: ["#4f46e5", "#f66906", "#059669", "#c08b04", "#e11d48", "#0ea2b8", "#a855f7", "#ec4899"],
      lines: ["#4f46e5", "#ea580c", "#059669", "#d97706", "#e11d48", "#0891b2", "#7c3aed", "#ec4899"],
      sequential: ["#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#4f46e5", "#312e81"],
      diverging: ["#9f1239", "#fb7185", "#fecdd3", "#e2e8f0", "#bfdbfe", "#3b82f6", "#1e3a8a"],
    },
    dark: {
      background: "#0b1020",
      surface: "#12182b",
      text: "#f6f9fc",
      muted: "#adbdcc",
      grid: "rgba(246, 249, 252, 0.07)",
      axis: "rgba(246, 249, 252, 0.18)",
      track: "rgba(246, 249, 252, 0.16)",
      accent: "#c4b5fd",
      positive: "#34d399",
      negative: "#fb7185",
      series: ["#c4b5fd", "#fb923c", "#34d399", "#fcd34d", "#fda4af", "#0891b2", "#818cf8", "#f43f5e"],
      lines: ["#c4b5fd", "#fb923c", "#34d399", "#fcd34d", "#fda4af", "#0891b2", "#818cf8", "#f43f5e"],
      sequential: ["#312e81", "#4338ca", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"],
      diverging: ["#fecdd3", "#fda4af", "#9f1239", "#334155", "#1e3a8a", "#60a5fa", "#dbeafe"],
    },
  },
  {
    id: "soft",
    title: "Soft modern",
    note: "Apple and Tremor: gray card on the page, round bar caps, quiet grid, saturated rings.",
    geometry: { strokeWidth: 2, cornerRadius: 8, gap: 0.34, fillOpacity: 0.22, points: "none", pointSize: 3 },
    fontFamily: font,
    light: {
      background: "#f5f5f7",
      surface: "#ffffff",
      text: "#1d1d1f",
      muted: "#6e6e73",
      grid: "rgba(0, 0, 0, 0.09)",
      axis: "rgba(0, 0, 0, 0.2)",
      track: "rgba(0, 0, 0, 0.10)",
      accent: "#2f6fe4",
      positive: "#15803d",
      negative: "#be123c",
      series: ["#2f6fe4", "#e2622a", "#0f9d83", "#b7791f", "#d9488f", "#3f8f2f", "#8b5cf6", "#d14343"],
      lines: ["#2f6fe4", "#e2622a", "#0f9d83", "#b7791f", "#d9488f", "#3f8f2f", "#8b5cf6", "#d14343"],
      sequential: ["#dcfce7", "#86efac", "#4ade80", "#22c55e", "#15803d", "#14532d"],
      diverging: ["#be123c", "#ff8a9a", "#ffd0d6", "#d2d2d7", "#bbf7d0", "#34c759", "#166534"],
    },
    dark: {
      background: "#1c1c1e",
      surface: "#2c2c2e",
      text: "#f5f5f7",
      muted: "#98989d",
      grid: "rgba(245, 245, 247, 0.12)",
      axis: "rgba(245, 245, 247, 0.24)",
      track: "rgba(245, 245, 247, 0.16)",
      accent: "#4a8ff0",
      positive: "#30d158",
      negative: "#ff453a",
      series: ["#4a8ff0", "#e06a35", "#1aa37e", "#c08318", "#dd5f97", "#4aa040", "#9180ea", "#e66767"],
      lines: ["#4a8ff0", "#e06a35", "#1aa37e", "#c08318", "#dd5f97", "#4aa040", "#9180ea", "#e66767"],
      sequential: ["#14532d", "#166534", "#22c55e", "#4ade80", "#86efac", "#dcfce7"],
      diverging: ["#ffd0d6", "#ff8a9a", "#9f1239", "#3a3a3c", "#166534", "#30d158", "#bbf7d0"],
    },
  },
];
