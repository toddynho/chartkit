import { createRenderer, register } from "./render";
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
import { histogram } from "./charts/histogram";
import { boxplot } from "./charts/boxplot";
import { radar } from "./charts/radar";
import { funnel } from "./charts/funnel";
import { treemap } from "./charts/treemap";
import { sankey } from "./charts/sankey";

/** Every v1 chart. Importing this module registers them and every theme preset. */
export const charts = [line, bar, donut, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick, histogram, boxplot, radar, funnel, treemap, sankey] as const;

for (const [name, preset] of Object.entries(themes)) registerPreset(name, preset);
register(...charts);

/** Zero-config renderer. Agents and quick starts should use this entry. */
export const render = createRenderer(charts);

export { register, createRenderer };
export { line, bar, donut, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick, histogram, boxplot, radar, funnel, treemap, sankey };
export { themes };
