/**
 * Candidate default looks for Todd to pick from.
 * Not registered, not imported by the line bundle, and not the default.
 * The stylesheet at themes/candidates.css is the same tokens as CSS variables.
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
  accent: string;
  positive: string;
  negative: string;
  series: readonly string[];
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
    note: "shadcn and Vercel: white card, zinc ink, hairline grid, thin line, small bar radius.",
    geometry: { strokeWidth: 1.75, cornerRadius: 4, gap: 0.22, fillOpacity: 0.14, points: "none", pointSize: 3 },
    fontFamily: font,
    light: {
      background: "#ffffff",
      surface: "#fafafa",
      text: "#18181b",
      muted: "#71717a",
      grid: "rgb(24 24 27 / 0.08)",
      axis: "rgb(24 24 27 / 0.18)",
      accent: "#436f9e",
      positive: "#548556",
      negative: "#894840",
      series: ["#436f9e", "#894840", "#6d4e83", "#548556", "#026e5b", "#795616", "#258598", "#9d6184"],
      sequential: ["#517dae", "#4671a2", "#3b6695", "#2f5a89", "#244f7c", "#184470"],
      diverging: ["#7b4263", "#8d5375", "#9d6184", "#757575", "#2f8974", "#1b7a66", "#066755"],
    },
    dark: {
      background: "#09090b",
      surface: "#18181b",
      text: "#fafafa",
      muted: "#a1a1aa",
      grid: "rgb(250 250 250 / 0.08)",
      axis: "rgb(250 250 250 / 0.18)",
      accent: "#88bcf6",
      positive: "#7fb980",
      negative: "#feb1a6",
      series: ["#88bcf6", "#feb1a6", "#ab87c7", "#7fb980", "#49ac95", "#ba904c", "#a1d1dd", "#d58eb6"],
      sequential: ["#6396ce", "#6fa2db", "#7cafe8", "#88bcf6", "#9ac8fd", "#b0d5fe"],
      diverging: ["#fab0d9", "#df97c0", "#c57fa6", "#868686", "#49ac95", "#64c6ad", "#7fe0c7"],
    },
  },
  {
    id: "editorial",
    title: "Vivid editorial",
    note: "Stripe and Observable: ink titles, saturated series, heavier line, small points, tight bars.",
    geometry: { strokeWidth: 2.25, cornerRadius: 2, gap: 0.18, fillOpacity: 0.24, points: "always", pointSize: 3 },
    fontFamily: font,
    light: {
      background: "#ffffff",
      surface: "#f6f9fc",
      text: "#0a2540",
      muted: "#425466",
      grid: "rgb(10 37 64 / 0.08)",
      axis: "rgb(10 37 64 / 0.22)",
      accent: "#4555a6",
      positive: "#0a6f50",
      negative: "#99393b",
      series: ["#4555a6", "#99393b", "#0a6f50", "#b35c29", "#8a3c77", "#037a84", "#6f5c01", "#527a19"],
      sequential: ["#5c6eba", "#5162ad", "#4757a1", "#3c4b94", "#324087", "#29347b"],
      diverging: ["#8f3738", "#a34949", "#b05454", "#757575", "#2c8766", "#117555", "#076246"],
    },
    dark: {
      background: "#0b1020",
      surface: "#12182b",
      text: "#f6f9fc",
      muted: "#adbdcc",
      grid: "rgb(246 249 252 / 0.10)",
      axis: "rgb(246 249 252 / 0.22)",
      accent: "#9fb3fc",
      positive: "#56d1a3",
      negative: "#dd7573",
      series: ["#9fb3fc", "#dd7573", "#56d1a3", "#e98d5b", "#dc86c4", "#3bdfef", "#d1b64a", "#abd87c"],
      sequential: ["#798ddc", "#8499e9", "#90a6f7", "#9fb3fe", "#b1c1fc", "#c2cffd"],
      diverging: ["#fdb5b2", "#f4918e", "#d87876", "#8a8a8a", "#4bae87", "#66c7a0", "#80e2b9"],
    },
  },
  {
    id: "soft",
    title: "Soft modern",
    note: "Tremor and Apple: warm gray page, round bar caps, quiet grid, no point markers.",
    geometry: { strokeWidth: 2, cornerRadius: 8, gap: 0.34, fillOpacity: 0.2, points: "none", pointSize: 3 },
    fontFamily: font,
    light: {
      background: "#f5f5f7",
      surface: "#ffffff",
      text: "#1d1d1f",
      muted: "#6e6e73",
      grid: "rgb(0 0 0 / 0.06)",
      axis: "rgb(0 0 0 / 0.14)",
      accent: "#407cb2",
      positive: "#297e54",
      negative: "#8f414e",
      series: ["#407cb2", "#297e54", "#a56632", "#6c4d8d", "#8f414e", "#0a6c66", "#5a66a8", "#50671b"],
      sequential: ["#3f8c63", "#328058", "#24744d", "#136842", "#085c38", "#00502f"],
      diverging: ["#863e49", "#994f59", "#aa5d68", "#6f6f6f", "#3b8960", "#2b7a52", "#136842"],
    },
    dark: {
      background: "#1c1c1e",
      surface: "#2c2c2e",
      text: "#f5f5f7",
      muted: "#98989d",
      grid: "rgb(245 245 247 / 0.10)",
      axis: "rgb(245 245 247 / 0.18)",
      accent: "#5e9ed9",
      positive: "#93ebb9",
      negative: "#e48a95",
      series: ["#5e9ed9", "#93ebb9", "#fdb57e", "#e0c8fe", "#e48a95", "#52cec4", "#a3b2fe", "#89a455"],
      sequential: ["#58a57b", "#65b187", "#71be93", "#7ecb9f", "#8bd8ab", "#97e5b8"],
      diverging: ["#fdb4bc", "#e996a0", "#ce7e88", "#929292", "#5eab81", "#77c599", "#91dfb2"],
    },
  },
];
