import Link from "next/link";
import { headline } from "@/lib/benchmarks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Compare",
  "ChartKit compared with Recharts, Chart.js, ECharts, and uPlot. Wins, gaps, and what the client runtime draws.",
  "/compare",
);

const rows = [
  ["Line, area, bar", "Yes", "Yes", "Yes", "Yes", "Line"],
  ["Donut", "Yes", "Yes", "Yes", "Yes", "No"],
  ["Scatter", "Yes", "Yes", "Yes", "Yes", "Yes"],
  ["Heatmap", "Yes", "No", "DIY", "Yes", "No"],
  ["Combo / dual axis", "Yes", "Yes", "Yes", "Yes", "DIY"],
  ["Gauge, KPI, sparkline", "Yes", "Partial", "Partial", "Yes", "Partial"],
  ["Candlestick", "Yes", "No", "Plugin", "Yes", "DIY"],
  ["Radar, treemap, sankey", "Yes", "Yes", "Partial", "Yes", "No"],
  ["Funnel", "Yes", "No", "No", "Yes", "No"],
  ["Tooltips", "Client runtime", "Yes", "Yes", "Yes", "Yes"],
  ["Zoom and pan", "Client runtime", "No", "Plugin", "Yes", "Yes"],
  ["Annotations", "Yes", "Yes", "Plugin", "Yes", "Yes"],
  ["SSR without a DOM", `Yes, ${headline.ssrLabel}`, "Empty wrapper", "No", "Yes, 6.65 ms", "No"],
  ["repair(), no docs", headline.repair, "No repair", "No repair", "No repair", "No repair"],
  ["Line chart, gzip", `${headline.lineGzipLabel} (${headline.lineGzipBytes} B)`, "96 KB, React external", "49 KB", "162 KB", `${headline.nextGzipBytes} B`],
];

export default function ComparePage() {
  return (
    <div className="wrap section prose wide">
      <h1>Compare</h1>
      <p className="lede">
        A short, honest cut of the round 13 matrix. Tooltip, zoom, pan, brush, and animation run in the client
        runtime when the spec sets them. The static SVG does not paint those. Radar, treemap, sankey, and funnel are
        drawn. Keyboard access stays off unless set. Annotations, log scales, time axes, and bar series are drawn.
        Cells for other libraries come from their docs and are point-in-time. ChartKit’s line chart is still the
        smallest; uPlot is next at {headline.nextGzipBytes} bytes.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th> </th>
              <th>ChartKit</th>
              <th>Recharts</th>
              <th>Chart.js</th>
              <th>ECharts</th>
              <th>uPlot</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>One library at a time</h2>
      <ul>
        <li>
          <Link href="/compare/recharts">ChartKit vs Recharts</Link>
        </li>
        <li>
          <Link href="/compare/chartjs">ChartKit vs Chart.js</Link>
        </li>
        <li>
          <Link href="/compare/echarts">ChartKit vs ECharts</Link>
        </li>
        <li>
          <Link href="/compare/nivo">ChartKit vs Nivo</Link>
        </li>
      </ul>
      <p>
        The timed comparison, including the losses, is on <Link href="/benchmarks">Benchmarks</Link>.{" "}
        <Link href="/when-to-use">When to use ChartKit</Link>.
      </p>
    </div>
  );
}
