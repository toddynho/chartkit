import { minimalSpec } from "./specs";
import { snippetsFor } from "./snippets";

export interface Rival {
  slug: string;
  name: string;
  npm: string;
  description: string;
  bundleBytes: number | null;
  bundleNote: string;
  ssr: string;
  agent: string;
  betterWhen: string[];
  chartkitWhen: string[];
  theirCode: string;
  theirLabel: string;
  interaction: string;
}

const spec = {
  ...minimalSpec,
  id: "compare-quarters",
  a11y: { alt: "Units rose from 40 in Q1 to 62 in Q4, with a dip to 48 in Q3." },
};

export const sameSpec = spec;
export const chartkitCode = snippetsFor(spec).react;

const dataComment = "Same quarters as the ChartKit spec above.";

export const rivals: Rival[] = [
  {
    slug: "recharts",
    name: "Recharts",
    npm: "recharts",
    description: "React components on SVG. The usual pick when a React app wants hover tooltips and a component API.",
    bundleBytes: 95807,
    bundleNote: "Line chart with React external. ChartKit’s minimal line is 12,171 bytes and does not require React.",
    ssr: "The round 7 harness got an empty wrapper, not a chart, without a DOM. ChartKit wrote SVG in 0.95 ms mean.",
    agent:
      "Recharts was in the round 7 eval: 42/42 with no docs and 42/42 with docs, at 223.3 / 236.6 mean first-try output tokens. ChartKit was 20/42 with no docs, 42/42 after repair() with no model call, and 42/42 with the docs at 139.4 / 131.1 tokens.",
    betterWhen: [
      "You need a hover tooltip, a click handler, or a legend that toggles a series. ChartKit accepts those fields and warns CK3011. It does not draw them.",
      "You want radar, treemap, or sankey. ChartKit does not draw those.",
      "The app is already React and the team wants <LineChart> props, not a JSON spec.",
      "You care about the 1,000-point update. ChartKit is last of the seven there. Round 7 did not publish a Recharts millisecond for that cell. Round 6’s fastest 1k update was Recharts at 15.30 ms. Do not cite a round 7 Recharts time this file does not have.",
    ],
    chartkitWhen: [
      "The same chart has to render in Vue, Svelte, or without a framework.",
      "The HTML response has to contain the SVG. Recharts did not produce one in this harness.",
      "Bundle size matters. 12,171 bytes against 95,807 with React still external.",
      "An agent should validate and repair a spec instead of guessing component props.",
    ],
    interaction: "Tooltips are drawn. Zoom and pan are not part of the core chart.",
    theirLabel: "tsx",
    theirCode: `import { LineChart, Line, XAxis, YAxis } from "recharts";

// ${dataComment}
const data = [
  { quarter: "Q1", units: 40 },
  { quarter: "Q2", units: 55 },
  { quarter: "Q3", units: 48 },
  { quarter: "Q4", units: 62 },
];

export function Panel() {
  return (
    <LineChart width={640} height={280} data={data}>
      <XAxis dataKey="quarter" />
      <YAxis />
      <Line dataKey="units" />
    </LineChart>
  );
}
`,
  },
  {
    slug: "chartjs",
    name: "Chart.js",
    npm: "chart.js",
    description: "Canvas charts and a plugin ecosystem. Fast updates in this harness, and no chart without a DOM.",
    bundleBytes: 49234,
    bundleNote: "Line chart, gzip -9. ChartKit’s minimal line is 12,171 bytes.",
    ssr: "No chart without a DOM in this harness. ChartKit wrote SVG in 0.95 ms mean.",
    agent:
      "Chart.js was in the round 7 eval: 42/42 with no docs and 42/42 with docs, at 294.6 / 260.9 mean first-try output tokens. ChartKit’s official first try used 131.1 tokens.",
    betterWhen: [
      "You want the plugin set: zoom, annotation, datalabels, and a canvas tooltip. ChartKit does not draw zoom or tooltips.",
      "The 1,000-point update matters. Chart.js was the fastest on the full run at 20.2 ms. ChartKit was 32.8 ms and last of seven.",
      "The 10,000-point update matters. Chart.js was the fastest on the full run at 18.5 ms. ChartKit was 30.7 ms. Those update cells sit on a two-frame wait, so treat a few milliseconds as noise, and still do not call ChartKit the winner.",
    ],
    chartkitWhen: [
      "The page is server-rendered and the chart has to be in the HTML.",
      "You want one spec for React, Vue, Svelte, and a plain element.",
      "12,171 bytes is the budget and 49,234 is not.",
    ],
    interaction: "Canvas tooltips are drawn. Zoom and annotation are plugins.",
    theirLabel: "js",
    theirCode: `import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

// ${dataComment}
new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [{ data: [40, 55, 48, 62] }],
  },
});
`,
  },
  {
    slug: "echarts",
    name: "ECharts",
    npm: "echarts",
    description: "The large catalog: maps, graphs, brush, and dataZoom. Bigger and slower to server-render in this harness.",
    bundleBytes: 162391,
    bundleNote: "echarts/core plus one series. ChartKit’s minimal line is 12,171 bytes. ChartKit /all is 22,864.",
    ssr: "ECharts SVG SSR was 9.04 ms mean on the full run and 8.42 ms on the quiet box. ChartKit was 0.95 ms and 1.22 ms.",
    agent:
      "ECharts was in the round 7 eval: 42/42 in every column, at 334.2 / 367.2 mean first-try output tokens. That is the highest token count in the eval. ChartKit’s official first try used 131.1.",
    betterWhen: [
      "You need a chart ChartKit does not draw: a map, a graph, a sankey, a treemap, or brush selection.",
      "You need dataZoom or a tooltip. ChartKit validates zoom and tooltip and does not draw them (CK3011).",
      "The 1,000,000-point update matters more than the initial draw, and you are comparing with uPlot rather than with ChartKit. ChartKit loses that cell to uPlot. This page does not claim ECharts wins it. The published fastest update at 1M is uPlot at 29.2 ms.",
    ],
    chartkitWhen: [
      "A modular line at 162,391 bytes is too large. ChartKit’s line is 12,171.",
      "Server render time matters. 0.95 ms against 9.04 ms.",
      "The agent should spend fewer output tokens. 131 against 367 on the official first try.",
    ],
    interaction: "Tooltip, dataZoom, and brush are part of the library.",
    theirLabel: "js",
    theirCode: `import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([LineChart, GridComponent, CanvasRenderer]);

// ${dataComment}
chart.setOption({
  xAxis: { type: "category", data: ["Q1", "Q2", "Q3", "Q4"] },
  yAxis: { type: "value" },
  series: [{ type: "line", data: [40, 55, 48, 62] }],
});
`,
  },
  {
    slug: "nivo",
    name: "Nivo",
    npm: "@nivo/line",
    description: "React charts with a wide catalog. In the browser harness, not in the agent eval.",
    bundleBytes: 95493,
    bundleNote: "Line chart with React external. ChartKit’s minimal line is 12,171 bytes and does not require React.",
    ssr: "Nivo did render SVG. The full run, on a loaded box, was 113 ms mean. Round 6 on a quieter box was 52.91 ms. ChartKit was 0.95 ms on the round 7 full run. Do not cite 113 ms as a quiet-box number.",
    agent:
      "Nivo was not in the round 7 agent eval. This page does not invent a 42-task score for it. The eval covered ChartKit, Recharts, ECharts, and Chart.js only.",
    betterWhen: [
      "You want a Nivo chart ChartKit does not draw, such as a choropleth, a funnel, or circle packing, and the app is React.",
      "You want a hover tooltip and a rich legend. ChartKit does not draw those.",
      "The quiet-box 1,000-point update is the cell you care about. Nivo was the fastest update in that rerun at 19.4 ms. ChartKit was 31.9 ms on that rerun and last of seven on the full run (32.8 ms).",
    ],
    chartkitWhen: [
      "You are not on React, or you do not want React in the bundle.",
      "Server render has to stay under a millisecond. 0.95 ms against 113 ms on the loaded full run, or against 52.91 ms in round 6.",
      "An agent needs a schema and repair(). Nivo was not measured on that eval.",
    ],
    interaction: "Hover tooltips and a rich legend are drawn.",
    theirLabel: "tsx",
    theirCode: `import { ResponsiveLine } from "@nivo/line";

// ${dataComment}
const data = [
  {
    id: "units",
    data: [
      { x: "Q1", y: 40 },
      { x: "Q2", y: 55 },
      { x: "Q3", y: 48 },
      { x: "Q4", y: 62 },
    ],
  },
];

export function Panel() {
  return <ResponsiveLine data={data} />;
}
`,
  },
];

export function rivalBySlug(slug: string): Rival | undefined {
  return rivals.find((rival) => rival.slug === slug);
}
