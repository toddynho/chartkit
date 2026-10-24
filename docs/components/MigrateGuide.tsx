import { coverage } from "@chartkitdev/convert";
import Link from "next/link";
import { CodeBlock } from "./CodeBlock";

type Source = keyof typeof coverage;

const copy: Record<
  Source,
  { title: string; intro: string; call: string; note: string }
> = {
  chartjs: {
    title: "Migrate from Chart.js",
    intro:
      "fromChartJs reads a Chart.js configuration object, including new Chart(ctx, config) and a const config = { ... } assignment. v3 options.plugins and options.scales are the primary path. v2 options.title, options.legend, and scales.xAxes or yAxes are read and reported as a partial map.",
    call: `import { fromChartJs } from "@chartkitdev/convert";

const { spec, warnings } = fromChartJs(config);`,
    note: "Radar, polarArea, time-scale adapters, plugins such as annotation, scriptable options, canvas gradients, and a third y axis come back as warnings. A per-point colour array keeps the first colour and warns. A stack id is a stack group: series that share it stack, and a stack id used once stays beside the others.",
  },
  recharts: {
    title: "Migrate from Recharts",
    intro:
      "fromRecharts reads JSX, or an object with chart, data, and children. LineChart, AreaChart, BarChart, PieChart, ScatterChart, and ComposedChart are the mapped roots. A missing Legend or Tooltip becomes legend: false or tooltip: false, which matches the Recharts default of leaving those components out.",
    call: `import { fromRecharts } from "@chartkitdev/convert";

const { spec, warnings } = fromRecharts(jsx);`,
    note: "Pie innerRadius in pixels is divided by 100 and stored as a fraction, which is an approximation. RadialBarChart, Brush, ErrorBar, LabelList, custom shapes, JSX spreads, and unbound identifiers are warnings. ReferenceLine and ReferenceArea become rule and band annotations.",
  },
  echarts: {
    title: "Migrate from ECharts",
    intro:
      "fromECharts reads an option object: series, xAxis, yAxis, title, legend, and tooltip. areaStyle becomes an area. A radius array becomes a donut. markLine and markArea become rule and band annotations. smooth becomes curve: monotone.",
    call: `import { fromECharts } from "@chartkitdev/convert";

const { spec, warnings } = fromECharts(option);`,
    note: "A stack name is a stack group. Series that share it stack, and a series without one stays unstacked, including a line beside a stacked area. Heatmap, gauge, candlestick, radar, graph, map, visualMap, dataZoom, toolbox, and symbolSize functions are warnings.",
  },
};

export function MigrateGuide({ source }: { source: Source }) {
  const page = copy[source];
  const table = coverage[source];
  return (
    <>
      <h1>{page.title}</h1>
      <p>{page.intro}</p>
      <p>
        The result is passed through <code>validate()</code> and <code>repair()</code>. A key the converter does not
        understand is a structured warning. It is not dropped quietly. <code>@chartkitdev/convert</code> is unpublished
        and is not part of the ChartKit bundles.
      </p>
      <CodeBlock label="ts" code={page.call} />
      <h2>Mapped</h2>
      <ul>
        {table.mapped.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2>Warned, not mapped</h2>
      <ul>
        {table.unsupported.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>{page.note}</p>
      <p>
        <Link href={`/convert?source=${source}`}>Try this source in the converter</Link>
        {". "}
        Replace one chart at a time. <Link href="/docs">Getting started</Link> renders a single spec beside the charts
        you already have.
      </p>
    </>
  );
}
