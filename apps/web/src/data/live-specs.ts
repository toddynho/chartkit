import areaRange from "../../../../packages/core/examples/30-area-range.json";
import bar from "../../../../packages/core/examples/03-bar.json";
import barRange from "../../../../packages/core/examples/31-bar-range.json";
import boxplot from "../../../../packages/core/examples/17-boxplot.json";
import bullet from "../../../../packages/core/examples/22-bullet.json";
import candlestick from "../../../../packages/core/examples/11-candlestick.json";
import combo from "../../../../packages/core/examples/07-combo.json";
import donut from "../../../../packages/core/examples/04-donut.json";
import errorbar from "../../../../packages/core/examples/32-errorbar.json";
import funnel from "../../../../packages/core/examples/19-funnel.json";
import gantt from "../../../../packages/core/examples/24-gantt.json";
import gauge from "../../../../packages/core/examples/09-gauge.json";
import heatmap from "../../../../packages/core/examples/08-heatmap.json";
import histogram from "../../../../packages/core/examples/16-histogram.json";
import journey from "../../../../packages/core/examples/28-journey.json";
import kpi from "../../../../packages/core/examples/10-kpi.json";
import line from "../../../../packages/core/examples/01-minimal-line.json";
import miniArea from "../../../../packages/core/examples/13-mini-area.json";
import pie from "../../../../packages/core/examples/29-pie.json";
import progressRing from "../../../../packages/core/examples/15-progress-ring.json";
import quadrant from "../../../../packages/core/examples/26-quadrant.json";
import radar from "../../../../packages/core/examples/18-radar.json";
import radialBar from "../../../../packages/core/examples/34-radial-bar.json";
import rose from "../../../../packages/core/examples/35-rose.json";
import sankey from "../../../../packages/core/examples/21-sankey.json";
import scatter from "../../../../packages/core/examples/06-scatter.json";
import sparkline from "../../../../packages/core/examples/12-sparkline.json";
import spike from "../../../../packages/core/examples/14-spike.json";
import stackedArea from "../../../../packages/core/examples/05-stacked-area.json";
import timeline from "../../../../packages/core/examples/25-timeline.json";
import treemap from "../../../../packages/core/examples/20-treemap.json";
import venn from "../../../../packages/core/examples/27-venn.json";
import waterfall from "../../../../packages/core/examples/23-waterfall.json";
import { densifyDemo } from "./dense-series";

export type LiveSpec = Record<string, unknown>;

const railSize = { width: 480, height: 260 };

function dress(raw: object, extra: LiveSpec = {}): LiveSpec {
  const spec = { ...(raw as LiveSpec) };
  delete spec.$schema;
  spec.theme = "soft";
  spec.size = railSize;
  return { ...spec, ...extra, theme: extra.theme ?? "soft", size: extra.size ?? railSize };
}

const lineMark = { curve: "monotone", points: "always", area: false };

const byType: Record<string, LiveSpec> = {
  line: dress(line, { title: "Revenue", mark: lineMark }),
  bar: dress(bar, { legend: true }),
  pie: dress(pie, { legend: true }),
  donut: dress(donut, { legend: true }),
  "stacked-area": dress(stackedArea),
  scatter: dress(scatter),
  combo: dress(combo),
  heatmap: dress(heatmap),
  gauge: dress(gauge),
  kpi: dress(kpi),
  sparkline: dress(sparkline, { size: { width: 480, height: 120 } }),
  "mini-area": dress(miniArea, { size: { width: 480, height: 120 } }),
  "progress-ring": dress(progressRing),
  spike: dress(spike),
  candlestick: dress(candlestick),
  histogram: dress(histogram),
  boxplot: dress(boxplot),
  radar: dress(radar),
  funnel: dress(funnel),
  treemap: dress(treemap),
  sankey: dress(sankey),
  bullet: dress(bullet),
  waterfall: dress(waterfall),
  "area-range": dress(areaRange),
  "bar-range": dress(barRange),
  errorbar: dress(errorbar),
  gantt: dress(gantt),
  timeline: dress(timeline),
  quadrant: dress(quadrant),
  venn: dress(venn),
  journey: dress(journey),
  "radial-bar": dress(radialBar),
  rose: dress(rose),
};

/** Filled line. There is no `type: "area"`. */
byType.area = dress(line, {
  title: "Filled line",
  type: "line",
  mark: { curve: "monotone", points: "always", area: true },
});

export function specForType(type: string): LiveSpec {
  return byType[type] ?? byType.line;
}

/** Docs try-it copy. Core examples stay short; this clone is the dense series. */
export function docsSpecForType(type: string): LiveSpec {
  return densifyDemo(specForType(type));
}

export const trySamples = {
  line: docsSpecForType("line"),
  bar: docsSpecForType("bar"),
  donut: docsSpecForType("donut"),
} as const;
