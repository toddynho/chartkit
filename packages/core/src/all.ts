import { createRenderer, register, type ChartRenderer } from "./render";
import { registerPreset } from "./theme";
import { themes } from "./themes/all";
import { line } from "./charts/line";
import { bar } from "./charts/bar";
import { donut } from "./charts/donut";
import { pie } from "./charts/pie";
import { stackedArea } from "./charts/stacked-area";
import { scatter } from "./charts/scatter";
import { combo } from "./charts/combo";
import { heatmap } from "./charts/heatmap";
import { gauge } from "./charts/gauge";
import { kpi } from "./charts/kpi";
import { sparkline } from "./charts/sparkline";
import { miniArea } from "./charts/mini-area";
import { progressRing } from "./charts/progress-ring";
import { spike } from "./charts/spike";
import { candlestick } from "./charts/candlestick";
import { mountAxes } from "./axis-extra";

/** Core v1 charts. Histogram through waterfall live in `@chartkitdev/core/extra`. */
export const charts = [line, bar, donut, pie, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick] as const;

for (const [name, preset] of Object.entries(themes)) registerPreset(name, preset);
mountAxes();
register(...charts);

const EXTRA_TYPES = new Set(["histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall", "gantt", "timeline", "quadrant", "venn", "journey", "area-range", "bar-range", "errorbar"]);

/** True for a phase-3 type. Those renderers load from `@chartkitdev/core/charts/<type>`. */
export function isExtra(type: string): boolean {
  return EXTRA_TYPES.has(type);
}

const adopted: ChartRenderer[] = [];
let draw = createRenderer(charts);

/**
 * Add one phase-3 chart to this entry's renderer.
 * The shared `register()` does not see it, and `@chartkitdev/core/all` stays free of those modules until this runs.
 */
export function adopt(chart: ChartRenderer): void {
  if (adopted.some((item) => item.name === chart.name)) return;
  adopted.push(chart);
  draw = createRenderer([...charts, ...adopted]);
}

/** Zero-config renderer for the core set. Phase 3 types join after `adopt`. */
export function render(spec: unknown, target?: Parameters<typeof draw>[1]): string {
  return draw(spec, target);
}

const jobs = new WeakMap<object, number>();
const tips = new WeakMap<object, { destroy(): void }>();

/**
 * Draw one phase-3 chart into `el`. Returns false for a core type so the caller keeps its own renderer.
 * The chart module and the mark tooltip load on demand. `painted` runs after the SVG is in `el`, including a later spec that replaces it.
 */
export function open(el: { innerHTML: string }, spec: { type?: string }, painted?: () => void): boolean {
  const type = spec.type;
  if (!type || !EXTRA_TYPES.has(type)) return false;
  const token = (jobs.get(el) ?? 0) + 1;
  jobs.set(el, token);
  void import("./load").then(async (mod) => {
    if (jobs.get(el) !== token) return;
    const chart = await mod.load(type);
    if (jobs.get(el) !== token || !chart) return;
    adopt(chart);
    el.innerHTML = draw(spec);
    painted?.();
    if (jobs.get(el) !== token) return;
    if (typeof (el as { addEventListener?: unknown }).addEventListener !== "function") return;
    const { attach } = await import("./extra-tip");
    if (jobs.get(el) !== token) return;
    tips.get(el)?.destroy();
    tips.set(el, attach(el as never));
  });
  return true;
}

export { register, createRenderer };
export { line, bar, donut, pie, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick };
export { themes };
