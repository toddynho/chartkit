import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { pageMeta } from "@/lib/site";
import { chartTypes } from "@/lib/specs";

export const metadata = pageMeta(
  "Spec reference",
  "The ChartKit v1 JSON spec: required alt text, 27 chart types, and the validate and repair loop.",
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
        <strong>Client behavior</strong>
        Tooltip, zoom, pan, brush, and animation duration run in <code>@chartkitdev/core/interact</code>. The tooltip
        defaults on for line, bar, area, scatter, combo, and donut. <code>a11y.keyboard</code>, <code>a11y.dataTable</code>,
        and <code>legend.interactive</code> stay off unless set, because turning them on loads extra interaction code.
        The static SVG records those choices in <code>data-ck-intent</code>. <code>tooltip.fields</code> chooses the
        rows and their order. A string is a field name. An object sets <code>title</code> and a <code>format</code>{" "}
        preset. <code>tooltip.position</code> is <code>auto</code>, <code>top</code>, <code>bottom</code>,{" "}
        <code>left</code>, or <code>right</code>. <code>tooltip.crosshairLabel</code> prints the hovered x value on the
        guide. <code>animation.easing</code>, <code>interaction.select</code>, and <code>theme.tokens.fontFamily</code>{" "}
        warn CK3012. Axis titles, tick counts, rotation, side, reversed and un-niced scales, padding, min height, and{" "}
        <code>a11y.description</code> are drawn.
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
          A y range is <code>encoding.y.scale.domain</code>: <code>[min, max]</code>. Either end may be{" "}
          <code>null</code> to stay automatic, as in <code>[0, null]</code>. A y2 channel uses the same domain for
          the combo&apos;s second axis. Ticks stay inside that range, and points outside it are clipped to the plot.
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
