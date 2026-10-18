import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { pageMeta } from "@/lib/site";
import { chartTypes } from "@/lib/specs";

export const metadata = pageMeta(
  "Spec reference",
  "The ChartKit v1 JSON spec: required alt text, 22 chart types, and the validate and repair loop.",
  "/docs/spec",
);

export default function SpecPage() {
  return (
    <>
      <h1>Spec reference</h1>
      <p>
        The schema is <a href="/schema/v1.json">chartkit.dev/schema/v1.json</a>. <code>validate()</code> checks the
        schema and the data. <code>render()</code> does not validate. Unknown types return an error SVG and do not
        throw.
      </p>
      <div className="note">
        <strong>Accepted, not drawn yet</strong>
        Tooltip, zoom, pan, brush, animation, interactive legends, and keyboard or data-table accessibility are in the
        schema. Turning one on warns CK3011, because the SVG does not paint it yet. Annotations, log scales, time
        axes, and bar series are drawn. The examples on this site are charts the renderer draws.
      </div>
      <h2>Repair loop</h2>
      <CodeBlock
        code={`import { repair, validate } from "@chartkitdev/core/validate";
import { render } from "@chartkitdev/core/all";

const result = validate(spec);
if (!result.ok) {
  const fixed = repair(spec);
  if (fixed.ok) render(fixed.spec);
}`}
        label="ts"
      />
      <p>
        <code>repair</code> applies the safe JSON Patch on each error and returns <code>{`{ spec, ok, errors, applied }`}</code>.
        The input is not mutated. It does not invent data. A missing or unknown <code>type</code> is reported first.
      </p>
      <h2>Rules</h2>
      <ul>
        <li>
          <code>version</code> is <code>&quot;1&quot;</code>. <code>a11y.alt</code> is one sentence and is required.
        </li>
        <li>
          <code>data</code> is an array of rows. It is not <code>{`{ "values": [...] }`}</code>. Large data may use{" "}
          <code>{`{ "columns": { "field": [] } }`}</code>.
        </li>
        <li>
          <code>type</code> is the chart. <code>mark</code> is options: curve, sampling, stack, layout. Not a string.
        </li>
        <li>
          Gauge, kpi, and progress-ring use <code>metric</code>: value, min, max, delta, label.
        </li>
        <li>
          Donut uses <code>encoding.x</code> for the slice label and <code>encoding.y</code> for the value.
        </li>
        <li>
          A second axis is <code>encoding.*.axis: &quot;y2&quot;</code>. Titles go in <code>axes.y2.title</code>.
        </li>
        <li>
          Field types are quantitative, temporal, ordinal, or nominal.
        </li>
        <li>
          <code>mark.sampling</code> defaults to <code>auto</code> and downsamples line-like charts above twice the plot
          width. <code>none</code> draws every point and is much slower at 100k and 1M.
        </li>
      </ul>
      <h2>Chart types</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>What it draws</th>
            </tr>
          </thead>
          <tbody>
            {chartTypes.map((item) => (
              <tr key={item.type}>
                <td>
                  <Link href={`/docs/charts/${item.type}`}>{item.type}</Link>
                </td>
                <td>{item.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
