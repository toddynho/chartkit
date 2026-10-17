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

/** Core v1 charts. Histogram through waterfall live in `@chartkitdev/core/extra`. */
export const charts = [line, bar, donut, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick] as const;

for (const [name, preset] of Object.entries(themes)) registerPreset(name, preset);
register(...charts);

/** Zero-config renderer for the core set. Phase 3 types: `@chartkitdev/core/extra`. */
export const render = createRenderer(charts);

export { register, createRenderer };
export { line, bar, donut, stackedArea, scatter, combo, heatmap, gauge, kpi, sparkline, miniArea, progressRing, spike, candlestick };
export { themes };
