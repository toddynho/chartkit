import type { Diagnostic } from "./diagnostics";
import { arrangeNow, type Draw } from "./layout-hook";
import { cssVar } from "./theme";
import { esc, font, isRecord } from "./svg";

/** A container element. `HTMLElement` satisfies this; tests can pass a plain object. */
export interface RenderTarget {
  innerHTML: string;
}

export interface ChartRenderer {
  /** Import binding, such as `line` or `stackedArea`. */
  name: string;
  types: readonly string[];
  render: (spec: Record<string, unknown>) => string | null;
}

const registry = new Map<string, ChartRenderer>();

/**
 * Add chart types to the shared `render()` registry.
 * Importing a chart module does not register it; call this or `createRenderer`.
 */
export function register(...charts: ChartRenderer[]): void {
  for (const chart of charts) {
    for (const type of chart.types) registry.set(type, chart);
  }
}

/** A renderer that only knows the charts you pass. It does not touch the shared registry. */
export function createRenderer(charts: readonly ChartRenderer[]): (spec: unknown, target?: RenderTarget | null) => string {
  const map = new Map<string, ChartRenderer>();
  for (const chart of charts) {
    for (const type of chart.types) map.set(type, chart);
  }
  return (spec, target) => renderWith(map, spec, target);
}

/**
 * Render with the shared registry. Does not validate and does not import the schema.
 * Unknown or unregistered types return an error SVG and do not throw.
 * When `target` is set, its `innerHTML` is replaced with the SVG.
 */
export function render(spec: unknown, target?: RenderTarget | null): string {
  return renderWith(registry, spec, target);
}

function renderWith(map: Map<string, ChartRenderer>, spec: unknown, target?: RenderTarget | null): string {
  let svg: string;
  try {
    if (!isRecord(spec) || (typeof spec.type !== "string" && !concatReady(spec))) {
      svg = errorSvg([
        {
          code: "CK1010",
          severity: "error",
          message: "chart spec must be an object with a string type",
          path: "",
          hint: 'import { render } from "@chartkitdev/core/all" registers every v1 chart.',
        },
      ]);
    } else if (typeof spec.type !== "string") {
      const draw: Draw = (next) => {
        const type = typeof next.type === "string" ? next.type : "";
        const inner = map.get(type);
        return inner ? inner.render(next) : null;
      };
      svg = arrangeNow(spec, draw) ?? errorSvg([
        {
          code: "CK1010",
          severity: "error",
          message: "composed charts need the layout pass",
          path: "/layout/concat",
          hint: 'import { render } from "@chartkitdev/core/all", or call mountLayout() before render().',
        },
      ]);
    } else {
      const chart = map.get(spec.type);
      if (!chart) svg = errorSvg([unregistered(spec.type)]);
      else {
        const hostType = spec.type;
        const draw: Draw = (next) => {
          const type = typeof next.type === "string" ? next.type : hostType;
          const inner = map.get(type) ?? chart;
          return inner.render(next);
        };
        const laid = isRecord(spec.layout) ? arrangeNow(spec, draw) : null;
        svg = laid ?? chart.render(spec) ?? errorSvg([undrawable(spec.type)]);
      }
    }
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
  svg = stampInteraction(svg, spec);
  if (target) target.innerHTML = svg;
  return svg;
}

/** Records navigator, sync, and drilldown on the SVG. The controls mount on the client. */
function stampInteraction(svg: string, spec: unknown): string {
  if (!svg.startsWith("<svg") || !isRecord(spec) || !isRecord(spec.interaction)) return svg;
  const interaction = spec.interaction;
  const attrs: string[] = [];
  const nav = interaction.navigator;
  if (nav === true || isRecord(nav)) {
    attrs.push('data-ck-nav="1"');
    if (isRecord(nav) && typeof nav.height === "number" && Number.isFinite(nav.height)) attrs.push(`data-ck-nav-h="${Math.round(nav.height)}"`);
  }
  if (typeof interaction.sync === "string" && interaction.sync.length > 0) attrs.push(`data-ck-sync="${esc(interaction.sync)}"`);
  const drill = interaction.drilldown;
  if (isRecord(drill) && isRecord(drill.children)) {
    const keys = Object.keys(drill.children);
    if (keys.length) attrs.push(`data-ck-drill="${esc(keys.join(","))}"`);
  }
  if (!attrs.length) return svg;
  return `<svg ${attrs.join(" ")}${svg.slice(4)}`;
}

function concatReady(spec: Record<string, unknown>): boolean {
  const layout = isRecord(spec.layout) ? spec.layout : undefined;
  const concat = layout && isRecord(layout.concat) ? layout.concat : undefined;
  return !!concat && Array.isArray(concat.views) && concat.views.some((view) => isRecord(view));
}

function unregistered(type: string): Diagnostic {
  return {
    code: "CK1010",
    severity: "error",
    message: `no renderer registered for type "${type}"`,
    path: "/type",
    hint: hintFor(type),
  };
}

function undrawable(type: string): Diagnostic {
  return {
    code: "CK1006",
    severity: "error",
    message: `renderer for "${type}" could not draw this spec`,
    path: "",
    hint: 'import { validate } from "@chartkitdev/core/validate" to see why.',
  };
}

function hintFor(type: string): string {
  const known = " line bar donut stacked-area scatter combo heatmap gauge kpi sparkline mini-area progress-ring spike candlestick histogram boxplot radar funnel treemap sankey bullet waterfall ";
  const binding = type.replace(/-([a-z])/g, (_match, char: string) => char.toUpperCase());
  const entry = known.includes(" " + type + " ") ? "all" : "extra";
  return `import { ${binding} } from "@chartkitdev/core/charts/${type}"; register(${binding}); or "@chartkitdev/core/${entry}".`;
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
