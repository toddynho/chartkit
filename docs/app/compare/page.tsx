import Link from "next/link";
import { headline } from "@/lib/benchmarks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Compare",
  "ChartKit compared with Recharts, Chart.js, ECharts, and uPlot. Wins, gaps, and features that are in the spec but not drawn.",
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
  ["Radar, treemap, sankey", "No", "Yes", "Partial", "Yes", "No"],
  ["Tooltips", "In the spec, not drawn", "Yes", "Yes", "Yes", "Yes"],
  ["Zoom and pan", "In the spec, not drawn", "No", "Plugin", "Yes", "Yes"],
  ["Annotations", "Yes", "Yes", "Plugin", "Yes", "Yes"],
  ["SSR without a DOM", `Yes, ${headline.ssrLabel}`, "Empty wrapper", "No", "Yes, 9.04 ms", "No"],
  ["repair(), no docs", headline.repair, "No repair", "No repair", "No repair", "No repair"],
  ["Line chart, gzip", `${headline.lineGzipLabel} (${headline.lineGzipBytes} B)`, "96 KB, React external", "49 KB", "162 KB", `${headline.nextGzipBytes} B`],
];

export default function ComparePage() {
  return (
    <div className="wrap section prose wide">
      <h1>Compare</h1>
      <p className="lede">
        A short, honest cut of the round 7 matrix. “In the spec, not drawn” means the field validates and the SVG
        renderer does not paint it. Turning tooltip, zoom, pan, brush, animation, or keyboard access on warns CK3011.
        Annotations, log scales, time axes, and bar series are drawn. Cells for other libraries come from their docs
        and are point-in-time. ChartKit’s line chart is still the smallest; uPlot is next at {headline.nextGzipBytes}{" "}
        bytes.
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
      <p>
        The timed comparison, including the losses at 1M points, is on <Link href="/benchmarks">Benchmarks</Link>.
      </p>
    </div>
  );
}
