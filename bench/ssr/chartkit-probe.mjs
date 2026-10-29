import { createRenderer } from "../../packages/core/src/render.ts";
import { chartSpec } from "../browser/chart-specs.mjs";
import { makeChartData } from "../lib/shapes.mjs";
import { line } from "../../packages/core/src/charts/line.ts";
import { bar } from "../../packages/core/src/charts/bar.ts";
import { pie } from "../../packages/core/src/charts/pie.ts";
import { donut } from "../../packages/core/src/charts/donut.ts";
import { stackedArea } from "../../packages/core/src/charts/stacked-area.ts";
import { scatter } from "../../packages/core/src/charts/scatter.ts";
import { combo } from "../../packages/core/src/charts/combo.ts";
import { heatmap } from "../../packages/core/src/charts/heatmap.ts";
import { gauge } from "../../packages/core/src/charts/gauge.ts";
import { kpi } from "../../packages/core/src/charts/kpi.ts";
import { sparkline } from "../../packages/core/src/charts/sparkline.ts";
import { miniArea } from "../../packages/core/src/charts/mini-area.ts";
import { progressRing } from "../../packages/core/src/charts/progress-ring.ts";
import { spike } from "../../packages/core/src/charts/spike.ts";
import { candlestick } from "../../packages/core/src/charts/candlestick.ts";
import { histogram } from "../../packages/core/src/charts/histogram.ts";
import { boxplot } from "../../packages/core/src/charts/boxplot.ts";
import { radar } from "../../packages/core/src/charts/radar.ts";
import { funnel } from "../../packages/core/src/charts/funnel.ts";
import { treemap } from "../../packages/core/src/charts/treemap.ts";
import { sankey } from "../../packages/core/src/charts/sankey.ts";
import { bullet } from "../../packages/core/src/charts/bullet.ts";
import { waterfall } from "../../packages/core/src/charts/waterfall.ts";
import { areaRange } from "../../packages/core/src/charts/area-range.ts";
import { barRange } from "../../packages/core/src/charts/bar-range.ts";
import { errorbar } from "../../packages/core/src/charts/errorbar.ts";
import { gantt } from "../../packages/core/src/charts/gantt.ts";
import { timeline } from "../../packages/core/src/charts/timeline.ts";
import { quadrant } from "../../packages/core/src/charts/quadrant.ts";
import { venn } from "../../packages/core/src/charts/venn.ts";
import { journey } from "../../packages/core/src/charts/journey.ts";
import { radialBar } from "../../packages/core/src/charts/radial-bar.ts";
import { rose } from "../../packages/core/src/charts/rose.ts";
import { sunburst } from "../../packages/core/src/charts/sunburst.ts";
import { barList } from "../../packages/core/src/charts/bar-list.ts";

const charts = {
  line,
  bar,
  pie,
  donut,
  "stacked-area": stackedArea,
  scatter,
  combo,
  heatmap,
  gauge,
  kpi,
  sparkline,
  "mini-area": miniArea,
  "progress-ring": progressRing,
  spike,
  candlestick,
  histogram,
  boxplot,
  radar,
  funnel,
  treemap,
  sankey,
  bullet,
  waterfall,
  "area-range": areaRange,
  "bar-range": barRange,
  errorbar,
  gantt,
  timeline,
  quadrant,
  venn,
  journey,
  "radial-bar": radialBar,
  rose,
  sunburst,
  "bar-list": barList,
};

export function prepareChartkit(chart, points) {
  const impl = charts[chart];
  if (!impl) throw new Error(`unsupported: ChartKit has no ${chart} renderer`);
  const payload = makeChartData(chart, points, 1);
  const spec = chartSpec(chart, payload);
  const render = createRenderer([impl]);
  return () => {
    const svg = render(spec);
    if (!svg || !svg.includes("<svg") || svg.includes("ck-chart-error")) {
      const text = String(svg ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
      throw new Error(text || "chart did not render");
    }
    return svg.length;
  };
}
