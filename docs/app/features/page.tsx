import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { matrix } from "@/lib/matrix";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Features",
  "263 charting features across ChartKit and 20 other libraries, with status, verification, and source for every cell.",
  "/features",
);

export default function FeaturesPage() {
  const data = matrix();
  const byCategory = new Map<string, typeof data.features>();
  for (const feature of data.features) {
    const list = byCategory.get(feature.category) ?? [];
    list.push(feature);
    byCategory.set(feature.category, list);
  }
  const chartkit = data.libraries.find((library) => library.id === "chartkit");

  return (
    <div className="wrap section prose wide">
      <h1>Feature matrix</h1>
      <p className="lede">
        {data.features.length} features in {data.taxonomy.length} categories, scored for ChartKit and{" "}
        {data.libraries.length - 1} other libraries. Every cell has a status, a verification level, and a source.
        Unknown stays unknown.
      </p>
      <p>
        Machine-readable copy: <a href="/features.json">features.json</a> ({data.schemaVersion}, generated {data.generated}
        ). Each feature also has a <Link href="/features/axis.title.md">Markdown</Link> twin for agents. ChartKit on this
        file is {chartkit?.version}, rechecked {data.chartkitRechecked}.
      </p>
      <ul className="counts">
        <li>
          <b>{data.coverage.strong}</b> strong
        </li>
        <li>
          <b>{data.coverage.weak}</b> weak
        </li>
        <li>
          <b>{data.coverage.absence}</b> absence-checked none
        </li>
        <li>
          <b>{data.coverage.unknown}</b> unknown
        </li>
      </ul>
      {data.taxonomy.map((category) => (
        <section key={category.id} id={category.id}>
          <h2>{category.label}</h2>
          <p>{category.desc}</p>
          <ul className="feature-list">
            {(byCategory.get(category.id) ?? []).map((feature) => (
              <li key={feature.id}>
                <Link href={`/features/${feature.id}`}>{feature.label}</Link>
                <StatusBadge status={feature.badge} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section id="method">
        <h2>Method</h2>
        <p>
          Other libraries were checked on {data.dateChecked} against the shipped TypeScript types or, for Plotly, the
          plot schema. That is not a render test. A typed option can be incomplete, which favours those libraries when
          you compare. ChartKit is held to a runtime probe: the status is native only when changing the option changes
          the SVG. ChartKit was rechecked on {data.chartkitRechecked} against main <code>{data.chartkitCommit}</code>.
          Axis titles, ticks, rotation, side, nice, reverse, padding, description, and legend values draw through{" "}
          <code>createRenderer([line])</code>. <code>mark.labels</code> on line, stacked-area, and scatter warns CK3012
          and is not drawn. Bar and donut still draw labels.
        </p>
        <p>
          Statuses are native, partial, plugin, manual, none, and unknown. Verification <code>dts-path</code>,{" "}
          <code>schema-path</code>, <code>dts-index</code>, <code>runtime-probe</code>, and <code>source-review</code>{" "}
          are strong. <code>dts-absence</code> is a moderate check that a none claim did not match an identifier.{" "}
          <code>dts-grep</code>, <code>dts-mechanism</code>, <code>npm</code>, and <code>doc-cited</code> are weak.{" "}
          <code>conflict</code> and <code>unverified</code> are unknown. Of {data.coverage.cells} cells, the coverage
          block in <a href="/features.json">features.json</a> is the count.
        </p>
        <p>{data.synonymsNote}</p>
        <p>
          The source files live in <code>docs/data/matrix/</code>. <code>npm run matrix:refresh</code> rewrites this
          page&apos;s data. Refresh monthly, or when a scored library ships a release, then re-check the ChartKit
          column against current main before publishing. The steps are in <code>docs/data/matrix/README.md</code>.
        </p>
        {chartkit?.bundleGzip?.minimalLine != null ? (
          <p>
            ChartKit line gzip in <a href="/features.json">features.json</a> is{" "}
            {chartkit.bundleGzip.minimalLine.toLocaleString("en-US")} bytes from {chartkit.bundleGzip.source}, commit{" "}
            <code>{chartkit.bundleGzip.commit}</code>, measured {chartkit.bundleGzip.measured}. {chartkit.bundleGzip.method}{" "}
            {chartkit.bundleGzip.note} Libraries the bench remeasured store that run on <code>bundleGzip</code>. The rest
            keep the matrix extract and say so on <code>bundleGzip.measured</code>.
          </p>
        ) : null}
        <h3>Not scored</h3>
        <ul>
          {data.notScored.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong> — {item.reason}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
