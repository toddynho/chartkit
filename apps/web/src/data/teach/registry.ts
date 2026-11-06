import { areaRangeTeach } from "./area-range.ts";
import { barListTeach } from "./bar-list.ts";
import { barRangeTeach } from "./bar-range.ts";
import { barTeach } from "./bar.ts";
import { boxplotTeach } from "./boxplot.ts";
import { bulletTeach } from "./bullet.ts";
import { candlestickTeach } from "./candlestick.ts";
import { choroplethTeach } from "./choropleth.ts";
import { comboTeach } from "./combo.ts";
import { densityTeach } from "./density.ts";
import { donutTeach } from "./donut.ts";
import { errorbarTeach } from "./errorbar.ts";
import { funnelTeach } from "./funnel.ts";
import { ganttTeach } from "./gantt.ts";
import { gaugeTeach } from "./gauge.ts";
import { heatmapTeach } from "./heatmap.ts";
import { histogramTeach } from "./histogram.ts";
import { journeyTeach } from "./journey.ts";
import { kpiTeach } from "./kpi.ts";
import { lineTeach } from "./line.ts";
import { mapPointsTeach } from "./map-points.ts";
import { miniAreaTeach } from "./mini-area.ts";
import { pieTeach } from "./pie.ts";
import { progressRingTeach } from "./progress-ring.ts";
import { quadrantTeach } from "./quadrant.ts";
import { radarTeach } from "./radar.ts";
import { radialBarTeach } from "./radial-bar.ts";
import { roseTeach } from "./rose.ts";
import { sankeyTeach } from "./sankey.ts";
import { scatterTeach } from "./scatter.ts";
import { sparklineTeach } from "./sparkline.ts";
import { spikeTeach } from "./spike.ts";
import { stackedAreaTeach } from "./stacked-area.ts";
import { streamgraphTeach } from "./streamgraph.ts";
import { stripTeach } from "./strip.ts";
import { sunburstTeach } from "./sunburst.ts";
import { timelineTeach } from "./timeline.ts";
import { treeTeach } from "./tree.ts";
import { treemapTeach } from "./treemap.ts";
import { vennTeach } from "./venn.ts";
import { waterfallTeach } from "./waterfall.ts";
import type { TeachModule } from "./types.ts";

/**
 * Chart types that use the teaching kit.
 * A later type adds its module here. [type].astro renders the kit when this lookup hits.
 * Area is not a module: /docs/charts/area stays the filled-line note.
 */
export const teachModules: Record<string, TeachModule> = {
  donut: donutTeach,
  pie: pieTeach,
  line: lineTeach,
  bar: barTeach,
  scatter: scatterTeach,
  combo: comboTeach,
  "stacked-area": stackedAreaTeach,
  funnel: funnelTeach,
  treemap: treemapTeach,
  sunburst: sunburstTeach,
  rose: roseTeach,
  "radial-bar": radialBarTeach,
  sankey: sankeyTeach,
  waterfall: waterfallTeach,
  tree: treeTeach,
  streamgraph: streamgraphTeach,
  gantt: ganttTeach,
  timeline: timelineTeach,
  quadrant: quadrantTeach,
  venn: vennTeach,
  journey: journeyTeach,
  "area-range": areaRangeTeach,
  "bar-range": barRangeTeach,
  errorbar: errorbarTeach,
  sparkline: sparklineTeach,
  "mini-area": miniAreaTeach,
  spike: spikeTeach,
  "bar-list": barListTeach,
  heatmap: heatmapTeach,
  radar: radarTeach,
  candlestick: candlestickTeach,
  gauge: gaugeTeach,
  kpi: kpiTeach,
  "progress-ring": progressRingTeach,
  bullet: bulletTeach,
  choropleth: choroplethTeach,
  "map-points": mapPointsTeach,
  histogram: histogramTeach,
  density: densityTeach,
  boxplot: boxplotTeach,
  strip: stripTeach,
};

export function teachModule(type: string): TeachModule | undefined {
  return teachModules[type];
}
