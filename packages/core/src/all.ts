import { createRenderer, register, type ChartRenderer } from "./render";
import { registerPreset } from "./theme";
import { themes } from "./themes/all";
import { line } from "./charts/line";
import { bar } from "./charts/bar";
import { donut } from "./charts/donut";
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

/** Core v1 charts. Histogram through waterfall live in `@chartkitdev/core/extra`. */
export const charts = [line, bar, donut, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick] as const;

for (const [name, preset] of Object.entries(themes)) registerPreset(name, preset);
register(...charts);

const EXTRA_TYPES = new Set(["histogram", "boxplot", "radar", "funnel", "treemap", "sankey", "bullet", "waterfall"]);

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

export { register, createRenderer };
export { line, bar, donut, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick };
export { themes };
