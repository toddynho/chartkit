/** Dashboard theme tokens from the handoff `data()` array, plus `dark` for the bar. */

export interface DashTheme {
  bg: string;
  chrome: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  accent3: string;
  grid: string;
  up: string;
  down: string;
  radius: number;
  gap: number;
  row: number;
  navActive: string;
  dark?: boolean;
  h1?: number;
  chipR?: number;
  shadow?: string;
  labelCase?: string;
  labelTrack?: string | number;
  mapBg?: string;
  font?: string;
  pad?: number;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Token overrides every panel shares.
 * `track` and `lines` are not spec fields: lines follow `series` at resolve time,
 * and the gauge track comes from the light or midnight preset (`mode`).
 *
 * Charts inherit the shell font (`--d-font` on the dashboard layout). All ten
 * seeds leave `theme.font` unset, so that shell is Geist: stripe, ga, grafana,
 * linear, plausible, robinhood, sentry, shopify, datadog, and vercel. A seed
 * that sets `theme.font` changes the shell, and the charts follow it. Writing
 * Geist onto the spec would block that.
 */
export function tokensFrom(theme: DashTheme): Record<string, unknown> {
  return {
    background: "transparent",
    surface: theme.surface,
    text: theme.text,
    muted: theme.muted,
    grid: theme.grid,
    axis: theme.border,
    accent: theme.accent,
    positive: theme.up,
    negative: theme.down,
    series: [theme.accent, theme.accent2, theme.accent3, theme.muted],
  };
}

export function themeSpec(theme: DashTheme): Record<string, unknown> {
  return {
    preset: theme.dark ? "midnight" : "soft",
    mode: theme.dark ? "dark" : "light",
    tokens: tokensFrom(theme),
  };
}

/** Object printed by the Theme drawer: the chartkit.theme() input from the handoff. */
export function themeDocument(theme: DashTheme, name: string): Record<string, unknown> {
  return {
    name,
    font: theme.font ?? "Geist, sans-serif",
    color: {
      background: theme.bg,
      surface: theme.surface,
      chrome: theme.chrome,
      border: theme.border,
      text: theme.text,
      muted: theme.muted,
      accent: theme.accent,
      accent2: theme.accent2,
      accent3: theme.accent3,
      grid: theme.grid,
      positive: theme.up,
      negative: theme.down,
    },
    shape: {
      radius: theme.radius,
      gap: theme.gap,
      panelPadding: 14,
      shadow: theme.shadow ?? "none",
    },
    label: {
      case: theme.labelCase ?? "none",
      tracking: theme.labelTrack ?? 0,
    },
  };
}

export function layoutOf(panel: Record<string, unknown>): { col: number; row: number } {
  const layout = isRecord(panel.layout) ? panel.layout : {};
  const col = typeof layout.col === "number" ? layout.col : 12;
  const row = typeof layout.row === "number" ? layout.row : 3;
  return { col, row };
}

export function summaryOf(panel: Record<string, unknown>): { value: string; delta?: string } | null {
  if (!isRecord(panel.summary) || typeof panel.summary.value !== "string") return null;
  return {
    value: panel.summary.value,
    delta: typeof panel.summary.delta === "string" ? panel.summary.delta : undefined,
  };
}

export function panelTitle(panel: Record<string, unknown>): string {
  return typeof panel.title === "string" && panel.title ? panel.title : "Untitled panel";
}

export function panelBackground(panel: Record<string, unknown>, theme: DashTheme): string {
  if (typeof panel.bg === "string" && panel.bg) return panel.bg;
  if (panel.type === "choropleth" && theme.mapBg) return theme.mapBg;
  return theme.surface;
}

/**
 * ChartSpec that validate() and render() see.
 * Drops the frame-only fields (`summary`, `bg`, grid `col`/`row`, and `title`,
 * which the frame draws) and applies the dashboard theme to every view.
 */
function withColorRange(encoding: unknown, field: string, range: string[]): Record<string, unknown> {
  const next = isRecord(encoding) ? { ...encoding } : {};
  const color: Record<string, unknown> = isRecord(next.color) ? { ...next.color } : { field };
  delete color.title;
  if (!color.range) color.range = range;
  next.color = color;
  return next;
}

export function renderSpec(panel: Record<string, unknown>, theme: DashTheme, id: string): Record<string, unknown> {
  const spec: Record<string, unknown> = { ...panel, id };
  delete spec.summary;
  delete spec.bg;
  delete spec.title;
  const layout = isRecord(spec.layout) ? spec.layout : undefined;
  const concat = layout && isRecord(layout.concat) ? layout.concat : undefined;
  const themeObject = themeSpec(theme);
  if (concat && Array.isArray(concat.views)) {
    spec.layout = {
      concat: {
        ...concat,
        views: concat.views.map((view) => (isRecord(view) ? { ...view, theme: themeObject } : view)),
      },
    };
  } else {
    delete spec.layout;
  }
  spec.theme = themeObject;
  if (spec.type === "heatmap") spec.encoding = withColorRange(spec.encoding, "value", [theme.accent3, theme.accent]);
  if (spec.type === "choropleth") {
    spec.encoding = withColorRange(spec.encoding, "users", [theme.accent3, theme.accent]);
    if (theme.mapBg) {
      const tokens = isRecord(themeObject.tokens) ? themeObject.tokens : {};
      spec.theme = { ...themeObject, tokens: { ...tokens, background: theme.mapBg } };
    }
  }
  const { col, row } = layoutOf(panel);
  const summary = summaryOf(panel);
  const width = Math.max(280, col * 92);
  const chrome = 28 + (summary ? 44 : 0);
  const height = Math.max(72, row * theme.row - chrome);
  spec.size = { width, height: spec.type === "choropleth" ? Math.max(height, 300) : height };
  return spec;
}
