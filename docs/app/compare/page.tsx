import Link from "next/link";
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
  ["Annotations", "In the spec, not drawn", "Yes", "Plugin", "Yes", "Yes"],
  ["SSR without a DOM", "Yes, 0.62 ms", "Empty wrapper", "No", "Yes, 5.32 ms", "No"],
  ["JSON spec and repair()", "Yes", "No", "No", "No", "No"],
  ["Line chart, gzip", "8.7 KB", "100 KB", "49 KB", "163 KB", "24 KB"],
];

export default function ComparePage() {
  return (
    <div className="wrap section prose wide">
      <h1>Compare</h1>
      <p className="lede">
        A short, honest cut of the October 2026 matrix. “In the spec, not drawn” means <code>validate()</code> accepts
        the field and the SVG renderer ignores it. Cells for other libraries come from their docs and are point-in-time.
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
