/**
 * Phone-width spec fit from docs/components/DashboardStage.tsx.
 * Kept here so the Astro paint step matches the Next dashboard pages.
 */

export type DashTheme = "soft" | "midnight";

export interface DashThemes {
  soft: Record<string, unknown>;
  midnight: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function withTheme(spec: Record<string, unknown>, theme: DashTheme, themes: DashThemes): Record<string, unknown> {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (type === "choropleth" || type === "map-points") return { ...spec, theme };
  return { ...spec, theme: themes[theme] };
}

/** Phone width redraws wide charts so labels stay at body size and ticks thin out. */
export function fitMobile(spec: Record<string, unknown>): Record<string, unknown> {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (type === "kpi") return { ...spec, size: { width: 168, height: 104 } };
  if (type === "bar-list") {
    const currentSize = isRecord(spec.size) ? spec.size : {};
    const height = typeof currentSize.height === "number" ? currentSize.height : 180;
    return { ...spec, size: { width: 340, height } };
  }
  if (type === "donut" || type === "pie") return { ...spec, size: { width: 340, height: 420 } };
  if (type === "choropleth" || type === "map-points") return { ...spec, size: { width: 360, height: 280 } };
  const current = isRecord(spec.size) ? spec.size : {};
  const height = typeof current.height === "number" ? current.height : 240;
  if (height < 120) return spec;
  const axes = isRecord(spec.axes) ? spec.axes : {};
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const temporalX = isRecord(encoding.x) && encoding.x.type === "temporal";
  const axis = (value: unknown, hold: boolean) => {
    if (value === false) return false;
    const currentAxis = isRecord(value) ? value : {};
    if (hold || Array.isArray(currentAxis.ticks) || currentAxis.ticks === "ends") return currentAxis;
    return { ...currentAxis, ticks: 4 };
  };
  return {
    ...spec,
    size: { width: 360, height: 240 },
    axes: { ...axes, x: axis(axes.x, temporalX), y: axis(axes.y, false) },
  };
}

export function present(
  spec: Record<string, unknown>,
  theme: DashTheme,
  themes: DashThemes,
  narrow: boolean,
  themed?: DashThemes,
): Record<string, unknown> {
  const next = themed ? themed[theme] : withTheme(spec, theme, themes);
  return narrow ? fitMobile(next) : next;
}
