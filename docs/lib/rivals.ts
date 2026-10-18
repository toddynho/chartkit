import { headline } from "./benchmarks";
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
    bundleNote: `Line chart with React external. ChartKit’s minimal line is ${headline.lineGzipBytes} bytes and does not require React.`,
    ssr: "The round 13 harness got an empty wrapper, not a chart, without a DOM. ChartKit wrote SVG in 0.85 ms mean.",
    agent:
      "Recharts was in the 2026-10-16 eval, which round 13 did not re-run: 42/42 with no docs and 42/42 with docs, at 223.3 / 236.6 mean first-try output tokens. ChartKit was 20/42 with no docs, 42/42 after repair() with no model call, and 42/42 with the docs at 139.4 / 131.1 tokens.",
    betterWhen: [
      "You need a hover tooltip, a click handler, or a legend that toggles a series. ChartKit accepts those fields and warns CK3011. It does not draw them.",
      "You want radar, treemap, or sankey. ChartKit does not draw those.",
      "The app is already React and the team wants <LineChart> props, not a JSON spec.",
      "You care about the 1,000-point aligned update. ChartKit loses that cell to uPlot: 1.5 vs 1.2 on even x, 1.6 vs 1.4 on jittered x, and 1.6 vs 1.4 on gapped timestamps. Round 13 did not publish a Recharts millisecond for that cell.",
    ],
    chartkitWhen: [
      "The same chart has to render in Vue, Svelte, or without a framework.",
      "The HTML response has to contain the SVG. Recharts did not produce one in this harness.",
      `Bundle size matters. ${headline.lineGzipBytes} bytes against 95,807 with React still external.`,
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
    description: "Canvas charts and a plugin ecosystem. No chart without a DOM in this harness.",
    bundleBytes: 49234,
    bundleNote: `Line chart, gzip -9. ChartKit’s line entry is ${headline.lineGzipBytes} bytes.`,
    ssr: "No chart without a DOM in this harness. ChartKit wrote SVG in 0.85 ms mean.",
    agent:
      "Chart.js was in the 2026-10-16 eval, which round 13 did not re-run: 42/42 with no docs and 42/42 with docs, at 294.6 / 260.9 mean first-try output tokens. ChartKit’s official first try used 131.1 tokens.",
    betterWhen: [
      "You want the plugin set: zoom, annotation, datalabels, and a canvas tooltip. This tree does not draw zoom or tooltips.",
      "The first hover has to be a few milliseconds. At 100,000 points uPlot paints the first hover in 4, 4.6, or 4.9 ms. ChartKit paints it in 20.8, 15.9, or 16.5 ms. Chart.js’s steady painted hover is 20.3 ms; ChartKit’s is 16.5 ms.",
      "Do not pick Chart.js for the round 13 aligned update. ChartKit is faster in all 12 of those cells. Even 1,000 points is 1.5 ms against Chart.js at 5.3 ms. The library that wins the small updates is uPlot.",
    ],
    chartkitWhen: [
      "The page is server-rendered and the chart has to be in the HTML.",
      "You want one spec for React, Vue, Svelte, and a plain element.",
      `${headline.lineGzipBytes} bytes is the budget and 49,234 is not.`,
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
    bundleNote: `echarts/core plus one series. ChartKit’s line entry is ${headline.lineGzipBytes} bytes. ChartKit /all is 26,715.`,
    ssr: "ECharts SVG SSR was 6.65 ms mean and 6.38 ms median. ChartKit was 0.85 ms mean and 0.85 ms median.",
    agent:
      "ECharts was in the 2026-10-16 eval, which round 13 did not re-run: 42/42 in every column, at 334.2 / 367.2 mean first-try output tokens. That is the highest token count in the eval. ChartKit’s official first try used 131.1.",
    betterWhen: [
      "You need a chart ChartKit does not draw: a map, a graph, a sankey, a treemap, or brush selection.",
      "You need dataZoom or a tooltip. ChartKit validates zoom and tooltip and does not draw them (CK3011).",
      "The 1,000-point aligned update matters, and you are comparing with uPlot. ChartKit loses that cell (1.5 vs 1.2 on even x). At 1,000,000 even points ChartKit wins the update, 10.7 vs 11.2. This page does not claim ECharts wins either cell. ECharts has no browser millisecond in the round 13 rows. Its steady painted hover at 100k is 2,881.4 ms.",
    ],
    chartkitWhen: [
      `A modular line at 162,391 bytes is too large. ChartKit’s line is ${headline.lineGzipBytes}.`,
      "Server render time matters. 0.85 ms against 6.65 ms.",
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
    bundleNote: `Line chart with React external. ChartKit’s minimal line is ${headline.lineGzipBytes} bytes and does not require React.`,
    ssr: "Nivo did render SVG. Round 13 mean is 92.29 ms and the median is 90.89 ms. ChartKit was 0.85 ms mean. Do not cite the old 113 ms figure for this round.",
    agent:
      "Nivo was not in the agent eval. Round 13 did not add it. This page does not invent a 42-task score. The eval covered ChartKit, Recharts, ECharts, and Chart.js only.",
    betterWhen: [
      "You want a Nivo chart ChartKit does not draw, such as a choropleth, a funnel, or circle packing, and the app is React.",
      "You want a hover tooltip and a rich legend. ChartKit does not draw those.",
      "The 1,000-point aligned update is the cell you care about, and the comparison is uPlot, not Nivo. ChartKit loses it (1.5 vs 1.2 on even x). Round 13 has no Nivo browser row, so this page does not invent one.",
    ],
    chartkitWhen: [
      "You are not on React, or you do not want React in the bundle.",
      "Server render has to stay under a millisecond. 0.85 ms against 92.29 ms.",
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
