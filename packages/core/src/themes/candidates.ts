/**
 * Soft, refined, and editorial token sheets.
 * The same colours are registered in theme.ts (light-dark pairs). This module
 * stays out of the line bundle: the sheet renderer and the sync test import it.
 * The stylesheet at themes/candidates.css is the optional card and the scheme override.
 *
 * Series fills are vivid (Tailwind / shadcn 400–600, Stripe, Apple). They are
 * not all required to clear 3:1. --ck-line-* is the stroke used at ≤2px and
 * does clear 3:1. --ck-track is the gauge and progress-ring track.
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

const font = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

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
      grid: "rgb(24 24 27 / 0.05)",
      axis: "rgb(24 24 27 / 0.16)",
      track: "rgb(24 24 27 / 0.12)",
      accent: "#3b82f6",
      positive: "#047857",
      negative: "#e11d48",
      series: ["#3b82f6", "#e11d48", "#fbbf24", "#10b981", "#7c3aed", "#22d3ee", "#fb923c", "#ec4899"],
      lines: ["#3b82f6", "#be123c", "#d97706", "#047857", "#7c3aed", "#0891b2", "#c2410c", "#ec4899"],
      sequential: ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#2563eb", "#1e3a8a"],
      diverging: ["#be123c", "#fb7185", "#fecdd3", "#d4d4d8", "#a7f3d0", "#34d399", "#047857"],
    },
    dark: {
      background: "#09090b",
      surface: "#18181b",
      text: "#fafafa",
      muted: "#a1a1aa",
      grid: "rgb(250 250 250 / 0.06)",
      axis: "rgb(250 250 250 / 0.16)",
      track: "rgb(250 250 250 / 0.16)",
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
      grid: "rgb(10 37 64 / 0.06)",
      axis: "rgb(10 37 64 / 0.18)",
      track: "rgb(10 37 64 / 0.12)",
      accent: "#4f46e5",
      positive: "#047857",
      negative: "#e11d48",
      series: ["#4f46e5", "#f97316", "#059669", "#fbbf24", "#e11d48", "#22d3ee", "#a855f7", "#ec4899"],
      lines: ["#4f46e5", "#ea580c", "#059669", "#d97706", "#e11d48", "#0891b2", "#7c3aed", "#ec4899"],
      sequential: ["#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#4f46e5", "#312e81"],
      diverging: ["#9f1239", "#fb7185", "#fecdd3", "#e2e8f0", "#bfdbfe", "#3b82f6", "#1e3a8a"],
    },
    dark: {
      background: "#0b1020",
      surface: "#12182b",
      text: "#f6f9fc",
      muted: "#adbdcc",
      grid: "rgb(246 249 252 / 0.07)",
      axis: "rgb(246 249 252 / 0.18)",
      track: "rgb(246 249 252 / 0.16)",
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
      grid: "rgb(0 0 0 / 0.05)",
      axis: "rgb(0 0 0 / 0.14)",
      track: "rgb(0 0 0 / 0.10)",
      accent: "#007aff",
      positive: "#047857",
      negative: "#be123c",
      series: ["#007aff", "#34c759", "#ff9500", "#af52de", "#ff2d55", "#32ade6", "#65a30d", "#ff6723"],
      lines: ["#007aff", "#248a3d", "#c93400", "#af52de", "#ff2d55", "#0071a4", "#4d7c0f", "#9a3412"],
      sequential: ["#dcfce7", "#86efac", "#4ade80", "#22c55e", "#15803d", "#14532d"],
      diverging: ["#be123c", "#ff8a9a", "#ffd0d6", "#d2d2d7", "#bbf7d0", "#34c759", "#166534"],
    },
    dark: {
      background: "#1c1c1e",
      surface: "#2c2c2e",
      text: "#f5f5f7",
      muted: "#98989d",
      grid: "rgb(245 245 247 / 0.07)",
      axis: "rgb(245 245 247 / 0.16)",
      track: "rgb(245 245 247 / 0.16)",
      accent: "#0a84ff",
      positive: "#30d158",
      negative: "#ff453a",
      series: ["#0a84ff", "#30d158", "#ff9f0a", "#bf5af2", "#ff375f", "#64d2ff", "#a3e635", "#ff6961"],
      lines: ["#0a84ff", "#30d158", "#ff9f0a", "#bf5af2", "#ff375f", "#64d2ff", "#a3e635", "#ff6961"],
      sequential: ["#14532d", "#166534", "#22c55e", "#4ade80", "#86efac", "#dcfce7"],
      diverging: ["#ffd0d6", "#ff8a9a", "#9f1239", "#3a3a3c", "#166534", "#30d158", "#bbf7d0"],
    },
  },
];
