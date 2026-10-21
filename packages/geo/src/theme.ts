export interface Chrome {
  water: string;
  nodata: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  scheme: "light" | "dark" | "";
}

const NAMED: Record<string, [string, string, string]> = {
  midnight: ["#0c0c0c", "#ffffff", "#8a8a8a"],
  obsidian: ["#282c34", "#abb2bf", "#828997"],
  neon: ["#1a1b26", "#c0caf5", "#565f89"],
  mocha: ["#1e1e2e", "#cdd6f4", "#a6adc8"],
  slate: ["#0d1117", "#f0f6fc", "#8b949e"],
  owl: ["#011627", "#d6deeb", "#7fdbca"],
  retro: ["#262335", "#ffffff", "#848bbd"],
  mono: ["#000000", "#ededed", "#888888"],
  arctic: ["#2e3440", "#eceff4", "#d8dee9"],
  copper: ["#282828", "#ebdbb2", "#a89984"],
  emerald: ["#0a0a0a", "#fafafa", "#a3a3a3"],
  orchid: ["#282a36", "#f8f8f2", "#6272a4"],
  rose: ["#191724", "#e0def4", "#908caa"],
  latte: ["#eff1f5", "#4c4f69", "#6c6f85"],
  pearl: ["#fafafa", "#383a42", "#696c77"],
  silver: ["#ffffff", "#24292f", "#586069"],
  sunset: ["#ffffff", "#111827", "#6b7280"],
};

const DARK = new Set(["midnight", "obsidian", "neon", "mocha", "slate", "owl", "retro", "mono", "arctic", "copper", "emerald", "orchid", "rose"]);

function mix(a: string, b: string, t: number): string {
  const channel = (hex: string, index: number) => Number.parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  const c = (index: number) => channel(a, index) + (channel(b, index) - channel(a, index)) * t;
  return `#${hex(c(0))}${hex(c(1))}${hex(c(2))}`;
}

function solid(bg: string, text: string, muted: string, dark: boolean): Chrome {
  return {
    water: dark ? mix(bg, "#16324a", 0.55) : mix(bg, "#c5dff0", 0.72),
    nodata: dark ? mix(bg, text, 0.14) : mix(bg, "#5b6b7c", 0.12),
    border: dark ? mix(bg, text, 0.42) : mix(bg, "#1d1d1f", 0.28),
    text,
    muted,
    accent: dark ? "#7eb6ff" : "#2b6cb0",
    scheme: dark ? "dark" : "light",
  };
}

const SOFT: Chrome = {
  water: "light-dark(#d7ebf6, #10202c)",
  nodata: "light-dark(#e7edf2, #243140)",
  border: "light-dark(#7d93a8, #8aa0b4)",
  text: "light-dark(#1d1d1f, #f5f5f7)",
  muted: "light-dark(#6e6e73, #98989d)",
  accent: "light-dark(#2b6cb0, #7eb6ff)",
  scheme: "",
};

export function chromeFor(theme: unknown): Chrome {
  const name = typeof theme === "string" ? theme.toLowerCase() : "soft";
  if (name === "" || name === "soft" || name === "auto" || name === "refined" || name === "editorial") return SOFT;
  const named = NAMED[name];
  if (!named) return SOFT;
  return solid(named[0], named[1], named[2], DARK.has(name));
}
