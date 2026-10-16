import type { Diagnostic } from "./diagnostics";
import { cssVar } from "./theme";
import { validate } from "./validate";
import { renderCandlestick } from "./renderers/candlestick";
import { renderCartesian } from "./renderers/cartesian";
import { renderDonut } from "./renderers/donut";
import { renderGauge } from "./renderers/gauge";
import { renderHeatmap } from "./renderers/heatmap";
import { renderKpi } from "./renderers/kpi";
import { renderProgressRing } from "./renderers/progress-ring";
import { renderScatter } from "./renderers/scatter";
import { renderSpike } from "./renderers/spike";
import { esc, font, isRecord } from "./svg";

/** A container element. `HTMLElement` satisfies this; tests can pass a plain object. */
export interface RenderTarget {
  innerHTML: string;
}

const BY_TYPE: Record<string, (spec: Record<string, unknown>) => string | null> = {
  donut: renderDonut,
  scatter: renderScatter,
  heatmap: renderHeatmap,
  gauge: renderGauge,
  kpi: renderKpi,
  "progress-ring": renderProgressRing,
  spike: renderSpike,
  candlestick: renderCandlestick,
};

/**
 * Render a spec to an SVG string. Never throws: validation errors become an inline error state.
 * Warnings still render. When `target` is set, its `innerHTML` is replaced with the SVG.
 *
 * Each chart type lives in its own module. This dispatcher is the only place that references
 * all of them, so bundling one renderer module does not pull the others in.
 */
export function render(spec: unknown, target?: RenderTarget | null): string {
  let svg: string;
  try {
    const result = validate(spec);
    if (!result.ok) svg = errorSvg(result.errors);
    else svg = draw(spec);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    svg = errorSvg([
      {
        code: "CK1006",
        severity: "error",
        message: `render failed: ${message}`,
        path: "",
      },
    ]);
  }
  if (target) target.innerHTML = svg;
  return svg;
}

function draw(spec: unknown): string {
  if (!isRecord(spec) || typeof spec.type !== "string") return errorSvg([]);
  const cartesian = renderCartesian(spec);
  if (cartesian) return cartesian;
  const renderType = BY_TYPE[spec.type];
  if (renderType) {
    const svg = renderType(spec);
    if (svg) return svg;
  }
  return pendingSvg(spec);
}

function pendingSvg(spec: Record<string, unknown>): string {
  const type = typeof spec.type === "string" ? spec.type : "chart";
  const alt = isRecord(spec.a11y) && typeof spec.a11y.alt === "string" ? spec.a11y.alt : "";
  const message = `SVG renderer for "${type}" is not in this build yet.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="80" viewBox="0 0 640 80" role="img" aria-label="${esc(alt || message)}" class="ck-chart" data-ck-type="${esc(type)}" data-ck-renderer="pending"><title>${esc(alt || message)}</title><desc>${esc(alt)}</desc><text x="16" y="44" fill="${cssVar("text", "#111827")}" font-size="14" font-family="${font()}">${esc(message)}</text></svg>`;
}

function errorSvg(errors: Diagnostic[]): string {
  const lines = (errors.length > 0 ? errors : [{ code: "CK1006", message: "invalid chart spec", severity: "error" as const, path: "" }]).slice(0, 6);
  const height = 28 + lines.length * 22;
  const label = `error[${lines[0].code}]: ${lines[0].message}`;
  const text = lines
    .map((line, index) => {
      const hint = line.hint ? ` — ${line.hint}` : "";
      return `<text x="16" y="${32 + index * 22}" fill="${cssVar("text", "#111827")}" font-size="13" font-family="${font()}">${esc(`error[${line.code}]: ${line.message}${hint}`)}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="${height}" viewBox="0 0 720 ${height}" role="img" aria-label="${esc(label)}" class="ck-chart ck-chart-error">${text}</svg>`;
}
