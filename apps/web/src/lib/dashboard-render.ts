import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { validate } from "@chartkitdev/core/validate";
import { render as renderGeo, validate as validateGeo } from "@chartkitdev/geo";
import { isRecord, renderSpec, type DashTheme } from "./dashboard-spec.ts";

export interface SpecIssue {
  code: string;
  path: string;
  message: string;
  severity: string;
}

export interface PanelDraw {
  svg: string;
  type: string;
  errors: SpecIssue[];
  warnings: SpecIssue[];
}

function issue(item: { code: string; path: string; message: string; severity: string }): SpecIssue {
  return { code: item.code, path: item.path || "/", message: item.message, severity: item.severity };
}

function typeOf(spec: Record<string, unknown>): string {
  if (typeof spec.type === "string" && spec.type) return spec.type;
  return "concat";
}

/** Validate, then draw. Map panels go through @chartkitdev/geo. */
export async function drawPanel(panel: Record<string, unknown>, theme: DashTheme, id: string): Promise<PanelDraw> {
  const spec = renderSpec(panel, theme, id);
  const type = typeOf(spec);
  const map = type === "choropleth" || type === "map-points";
  const core = validate(spec);
  const geo = map ? validateGeo(spec) : null;
  const errors = [...core.errors.map(issue), ...(geo ? geo.errors.map(issue) : [])];
  const warnings = [...core.warnings.map(issue)];
  if (geo) {
    for (const item of geo.warnings) {
      const next = issue(item);
      if (!warnings.some((have) => have.code === next.code && have.path === next.path && have.message === next.message)) {
        warnings.push(next);
      }
    }
  }
  if (errors.length) return { svg: "", type, errors, warnings };
  const svg = map
    ? await renderGeo(spec)
    : type === "bar-list" && isRecord(spec)
      ? (renderBarList(spec) ?? "")
      : isExtra(type)
        ? renderExtra(spec)
        : renderCore(spec);
  if (!svg.includes("<svg") || svg.includes("ck-chart-error")) {
    errors.push({ code: "CK1010", path: "/type", message: `${type} did not render`, severity: "error" });
    return { svg: "", type, errors, warnings };
  }
  return { svg, type, errors, warnings };
}
