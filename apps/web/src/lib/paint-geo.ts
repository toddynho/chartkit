import type { RailIssue, RailResult } from "./chartkit";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isGeoSpec(spec: Record<string, unknown>): boolean {
  return spec.type === "choropleth" || spec.type === "map-points";
}

/**
 * Validate and render a choropleth or map-points spec with @chartkitdev/geo.
 * Core validate accepts these types and then core render draws an error chart.
 * Warnings from the geo checker still return the SVG.
 */
export async function paintGeo(spec: Record<string, unknown>): Promise<RailResult> {
  const geo = await import("@chartkitdev/geo");
  const type = typeof spec.type === "string" ? spec.type : "";
  const checked = geo.validate(spec);
  const svg = await geo.render(spec);
  const issues: RailIssue[] = checked.warnings.map((item) => ({
    code: item.code,
    path: item.path || "/",
    message: item.message,
    severity: item.severity,
  }));
  const theme = typeof spec.theme === "string" ? spec.theme : "soft";
  const title = typeof spec.title === "string" && spec.title ? spec.title : type || "Map";
  const broken =
    !svg.includes(`data-ck-type="${type}"`) || svg.includes("Unknown atlas.") || svg.includes("Expected type");
  if (!isRecord(spec) || broken || !checked.ok) {
    return {
      ok: false,
      svg,
      status: "400",
      title,
      badge: `${type || "map"} · geo`,
      theme,
      issues,
      footer: "Map did not render with @chartkitdev/geo",
    };
  }
  return {
    ok: true,
    svg,
    status: "200",
    title,
    badge: `${type} · geo`,
    theme,
    issues,
    footer: issues.length
      ? `Rendered with @chartkitdev/geo · ${issues.length} warning${issues.length === 1 ? "" : "s"}`
      : "rendered with @chartkitdev/geo",
  };
}
