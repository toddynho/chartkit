import Link from "next/link";
import { compareRows, librariesExceptChartkit, matrix, tally } from "@/lib/matrix";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Compare",
  "ChartKit against 20 charting libraries. Every feature row is in the table, losses next to wins, with verification and source.",
  "/compare",
);

export default function ComparePage() {
  const data = matrix();
  const rivals = librariesExceptChartkit().map((library) => {
    const rows = compareRows(library.id);
    return { library, ...tally(rows) };
  });

  return (
    <div className="wrap section prose wide">
      <h1>Compare</h1>
      <p className="lede">
        ChartKit against {rivals.length} libraries, generated from the feature matrix. A loss is a feature the other
        library scores higher on. A win is the reverse. Unknown cells are not counted as either. Nothing is dropped to
        make the list shorter.
      </p>
      <p>
        Other libraries were checked on {data.dateChecked} against types and schemas, not by rendering, so a typed
        option can overstate what draws. ChartKit was rechecked on {data.chartkitRechecked} against main{" "}
        <code>{data.chartkitCommit}</code>. Radar, treemap, sankey, and funnel are native. Tooltips, zoom, and pan are
        native in the client runtime. The static SVG does not paint them.{" "}
        <Link href="/features#method">Method</Link>. <a href="/features.json">features.json</a>. Timed numbers, including
        the losses, stay on <Link href="/benchmarks">Benchmarks</Link>.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Library</th>
              <th>Version</th>
              <th className="num">ChartKit ahead</th>
              <th className="num">ChartKit behind</th>
              <th className="num">Same</th>
              <th className="num">Unknown</th>
            </tr>
          </thead>
          <tbody>
            {rivals.map(({ library, win, loss, tie, unknown }) => (
              <tr key={library.id}>
                <th scope="row">
                  <Link href={`/compare/${library.id}`}>{library.name}</Link>
                </th>
                <td>{library.version}</td>
                <td className="num win">{win}</td>
                <td className="num loss">{loss}</td>
                <td className="num">{tie}</td>
                <td className="num">{unknown}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
