import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartView } from "@/components/ChartView";
import { StatusBadge } from "@/components/StatusBadge";
import { featureById, matrix, optionText } from "@/lib/matrix";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return matrix().features.map((feature) => ({ id: feature.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const feature = featureById(params.id);
  if (!feature) return {};
  return pageMeta(feature.label, `${feature.desc} ChartKit: ${feature.badge}.`, `/features/${feature.id}`);
}

export default function FeaturePage({ params }: { params: { id: string } }) {
  const feature = featureById(params.id);
  if (!feature) notFound();
  const data = matrix();
  const chartkit = feature.cells.chartkit;
  const specText = feature.spec ? JSON.stringify(feature.spec, null, 2) : "";

  return (
    <div className="wrap section prose wide">
      <p className="kicker">
        <Link href="/features">Features</Link>
        {" · "}
        <Link href={`/features#${feature.category}`}>{feature.category}</Link>
      </p>
      <h1>{feature.label}</h1>
      <p>
        <StatusBadge status={feature.badge} />
      </p>
      <p className="lede">{feature.desc}</p>
      <p>
        Matrix status <code>{chartkit.status}</code>
        {chartkit.tier ? ` (${chartkit.tier})` : ""}. Verification <code>{chartkit.verified}</code> ({chartkit.strength}
        ).
        {chartkit.apiPaths.length ? (
          <>
            {" "}
            ChartKit option: <code>{chartkit.apiPaths.join(", ")}</code>.
          </>
        ) : null}
      </p>
      {chartkit.note ? <p>{chartkit.note}</p> : null}
      {chartkit.assessed ? <p>Unverified claim: {chartkit.assessed}</p> : null}
      {chartkit.source.length ? (
        <p>
          Source: <code>{chartkit.source.join(", ")}</code>
        </p>
      ) : null}
      {feature.spec ? (
        <>
          <h2>ChartKit spec</h2>
          {feature.id === "type.map.choropleth" || feature.id === "type.map.points" ? (
            <p>
              Rendered by <code>@chartkitdev/geo</code>. Core <code>validate()</code> does not accept map types. The geo
              package has its own <code>validate()</code> (CK3050–CK3056). The SVG is the server render.
            </p>
          ) : (
            <p>Passed <code>validate()</code> during <code>npm run matrix:refresh</code>. The SVG is the server render.</p>
          )}
          <ChartView spec={feature.spec} />
          <pre className="spec-block">
            <code>{specText}</code>
          </pre>
        </>
      ) : (
        <p>
          {feature.badge === "warns"
            ? "No spec snippet. The option is accepted and validate() warns. It is not drawn."
            : feature.badge === "none"
              ? "No spec snippet. ChartKit does not support this."
              : feature.badge === "unknown"
                ? "No spec snippet. This ChartKit cell is unknown."
                : "No spec snippet. This row is not a single chart option validate() can show."}
        </p>
      )}
      <h2>Other libraries</h2>
      <p>
        Option names are the paths recorded in the matrix. A grep-only cell names the identifier that matched, not a
        render test. Markdown copy: <a href={`/features/${feature.id}.md`}>{feature.id}.md</a>.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Library</th>
              <th>Status</th>
              <th>Option</th>
              <th>Verification</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {data.libraries
              .filter((library) => library.id !== "chartkit")
              .map((library) => {
                const cell = feature.cells[library.id];
                return (
                  <tr key={library.id}>
                    <th scope="row">
                      <Link href={`/compare/${library.id}`}>{library.name}</Link>
                    </th>
                    <td>
                      <StatusBadge status={cell.status} />
                      {cell.tier ? ` ${cell.tier}` : ""}
                    </td>
                    <td>
                      <code>{optionText(cell)}</code>
                      {cell.note ? <span className="cell-note">{cell.note}</span> : null}
                    </td>
                    <td>
                      {cell.verified} ({cell.strength})
                    </td>
                    <td>
                      <code>{cell.source[0] ?? "—"}</code>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
