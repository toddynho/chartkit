import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { perfParagraph, sizeParagraph } from "@/lib/measured";
import { callFor, compareRows, matrix, optionText, type CompareRow } from "@/lib/matrix";
import { pageMeta } from "@/lib/site";

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
                  <StatusBadge status={row.ours.status} />
                  {row.feature.badge !== row.ours.status ? (
                    <span className="cell-note">
                      badge {row.feature.badge}; ranks as {row.ours.status}
                    </span>
                  ) : null}
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
  for (const row of rows) {
    const again = callFor(row.ours.status, row.theirs.status);
    if (again !== row.call) throw new Error(`${library.id} ${row.feature.id} ranks as ${again} but the row says ${row.call}`);
  }
  const theirAhead = rows.filter((row) => row.call === "loss");
  const chartkitAhead = rows.filter((row) => row.call === "win");
  const unknown = rows.filter((row) => row.call === "unknown");
  const same = rows.filter((row) => row.call === "tie");
  if (theirAhead.length + chartkitAhead.length + unknown.length + same.length !== rows.length) {
    throw new Error(`${library.id} compare rows do not add up`);
  }

  return (
    <div className="wrap section prose wide">
      <p className="kicker">
        <Link href="/compare">Compare</Link>
      </p>
      <h1>ChartKit vs {library.name}</h1>
      <p className="lede">
        {library.name} {library.version}, checked {library.dateChecked}. {theirAhead.length} features where {library.name}{" "}
        ranks higher, {chartkitAhead.length} where ChartKit ranks higher, {same.length} the same, {unknown.length} with an
        unknown cell. Ranks are native, then partial, plugin, manual, and none. Unknown is not a win. The ChartKit column
        is that matrix status. A warns badge is a none cell that validate() warns about, so it ranks as none. Each heading
        count is the number of rows in that table.
      </p>
      <p>
        Package <code>{library.package}</code>. Licence {library.license}. Escape hatch: {library.escapeHatch}.{" "}
        <a href={library.docs}>Docs</a>. Cells for {library.name} are type or schema checks, not render tests. ChartKit
        was rechecked {data.chartkitRechecked} against main <code>{data.chartkitCommit}</code>.
      </p>
      <p>{sizeParagraph(library)}</p>
      <p>
        {perfParagraph(library.id, library.name)} <Link href="/benchmarks">Full timings</Link>.
      </p>
      <Section title={`${library.name} ahead`} rows={theirAhead} library={library.name} />
      <Section title="ChartKit ahead" rows={chartkitAhead} library={library.name} />
      <Section title="Unverified" rows={unknown} library={library.name} />
      <Section title="Same status" rows={same} library={library.name} />
    </div>
  );
}
