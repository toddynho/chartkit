import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { headline } from "@/lib/benchmarks";
import { compareRows, matrix, optionText, tally, type CompareRow } from "@/lib/matrix";
import { pageMeta } from "@/lib/site";

const MEASURED: Record<string, string> = {
  uplot: `Round 13, measured 2026-10-18 on phase 2 d8dcc5a. ChartKit’s line entry is ${headline.lineGzipBytes} bytes gzip. uPlot is ${headline.nextGzipBytes}. ChartKit wins all 12 initial-render cells. The aligned update wins 6 of 12 and loses 6: even 1k 1.5 vs 1.2, even 10k 1.9 vs 1.7, jittered 1k 1.6 vs 1.4, gapped 1k 1.6 vs 1.4, gapped 10k 1.9 vs 1.6, gapped 100k 3.5 vs 3.4. Steady hover at 100k is 16.5 vs 16.2. First hover painted medians are 20.8, 15.9, and 16.5 ms against uPlot 4, 4.6, and 4.9. uPlot did not produce a chart without a DOM. Server render of a 1,000 point line is ${headline.ssrLabel} mean.`,
  chartjs:
    "Round 13 line gzip is 14,858 bytes against Chart.js 49,234. In the 12 published aligned-update cells ChartKit is faster than Chart.js on both the initial and the update. Even 1,000,000 points: Chart.js updates in 189.8 ms. Steady hover at 100k is 16.5 vs 20.3. Chart.js did not produce a chart without a DOM.",
  plot: "Round 13 line gzip is 14,858 bytes against Observable Plot 97,215. In the 12 published aligned-update cells ChartKit is faster than Plot on both the initial and the update. Even 1,000,000 points: Plot updates in 1,295.8 ms. Steady hover at 100k is 16.5 vs 28.3. Plot did not produce a chart without a DOM.",
  recharts:
    "Round 13 line gzip is 14,858 bytes against Recharts 95,807 with React external. Recharts returned an empty wrapper without a DOM. Steady hover at 100k is 16.5 vs 28.9. Recharts is not in the round 13 browser initial or update rows, so this page does not give it a millisecond for those.",
  echarts:
    "Round 13 line gzip is 14,858 bytes against ECharts 162,391. Server render of a 1,000 point line is 0.85 ms mean against ECharts 6.65 ms mean (median 6.38). Steady hover at 100k is 16.5 vs 2,881.4 painted. ECharts is not in the round 13 browser initial or update rows.",
  nivo: "Round 13 line gzip is 14,858 bytes against Nivo 95,493 with React external. Server render of a 1,000 point line is 0.85 ms mean against Nivo 92.29 ms mean (median 90.89). Nivo is not in the round 13 browser initial or update rows.",
};

export function generateStaticParams() {
  return matrix()
    .libraries.filter((library) => library.id !== "chartkit")
    .map((library) => ({ slug: library.id }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const library = matrix().libraries.find((item) => item.id === params.slug);
  if (!library) return {};
  return pageMeta(
    `ChartKit vs ${library.name}`,
    `Every scored feature for ChartKit and ${library.name}, with losses, wins, verification, and source.`,
    `/compare/${library.id}`,
  );
}

function Section({ title, rows, library }: { title: string; rows: CompareRow[]; library: string }) {
  if (rows.length === 0) return null;
  return (
    <section>
      <h2>
        {title} ({rows.length})
      </h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>ChartKit</th>
              <th>{library}</th>
              <th>Their option</th>
              <th>Their check</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature.id}>
                <th scope="row">
                  <Link href={`/features/${row.feature.id}`}>{row.feature.label}</Link>
                </th>
                <td>
                  <StatusBadge status={row.feature.badge} />
                </td>
                <td>
                  <StatusBadge status={row.theirs.status} />
                  {row.theirs.tier ? ` ${row.theirs.tier}` : ""}
                </td>
                <td>
                  <code>{optionText(row.theirs)}</code>
                </td>
                <td>
                  {row.theirs.verified} ({row.theirs.strength})
                </td>
                <td>
                  <code>{row.theirs.source[0] ?? "—"}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function CompareLibraryPage({ params }: { params: { slug: string } }) {
  const data = matrix();
  const library = data.libraries.find((item) => item.id === params.slug);
  if (!library || library.id === "chartkit") notFound();
  const rows = compareRows(library.id);
  const counts = tally(rows);
  const measured = MEASURED[library.id];

  return (
    <div className="wrap section prose wide">
      <p className="kicker">
        <Link href="/compare">Compare</Link>
      </p>
      <h1>ChartKit vs {library.name}</h1>
      <p className="lede">
        {library.name} {library.version}, checked {library.dateChecked}. {counts.loss} features where {library.name}{" "}
        ranks higher, {counts.win} where ChartKit ranks higher, {counts.tie} the same, {counts.unknown} with an unknown
        cell. Ranks are native, then partial, plugin, manual, and none. Unknown is not a win.
      </p>
      <p>
        Package <code>{library.package}</code>. Licence {library.license}. Escape hatch: {library.escapeHatch}.{" "}
        <a href={library.docs}>Docs</a>. Cells for {library.name} are type or schema checks, not render tests. ChartKit
        was rechecked {data.chartkitRechecked} against main <code>{data.chartkitCommit}</code>.
      </p>
      {measured ? (
        <p>
          {measured} <Link href="/benchmarks">Full timings</Link>.
        </p>
      ) : (
        <p>
          Round 13 did not publish a bundle, server-render, or browser time for {library.name}. This page does not
          invent one. <Link href="/benchmarks">Benchmarks</Link> lists who was measured.
        </p>
      )}
      <Section title={`${library.name} ahead`} rows={rows.filter((row) => row.call === "loss")} library={library.name} />
      <Section title="ChartKit ahead" rows={rows.filter((row) => row.call === "win")} library={library.name} />
      <Section title="Unverified" rows={rows.filter((row) => row.call === "unknown")} library={library.name} />
      <Section title="Same status" rows={rows.filter((row) => row.call === "tie")} library={library.name} />
    </div>
  );
}
