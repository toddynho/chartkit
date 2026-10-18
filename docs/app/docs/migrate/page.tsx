import { CodeBlock } from "@/components/CodeBlock";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Migrate from v0",
  "Move from @derpdaderp/chartkit to the @chartkitdev packages and the v1 JSON spec.",
  "/docs/migrate",
);

export default function MigratePage() {
  return (
    <>
      <h1>Migrate from v0</h1>
      <p>
        ChartKit v0 was a React component library published as <code>@derpdaderp/chartkit</code>. v1 keeps a React
        adapter and adds a JSON spec that Vue, Svelte, vanilla DOM, and Node all render.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Before</th>
              <th>After</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>@derpdaderp/chartkit</code>
              </td>
              <td>
                <code>@chartkitdev/react</code> for components, <code>@chartkitdev/core</code> for the spec
              </td>
            </tr>
            <tr>
              <td>Component props such as dataKey and leftAxis</td>
              <td>
                A spec: version, type, data, encoding, a11y.alt
              </td>
            </tr>
            <tr>
              <td>React only</td>
              <td>React, Vue, Svelte, vanilla, and renderToString</td>
            </tr>
          </tbody>
        </table>
      </div>
      <CodeBlock
        code={`npm uninstall @derpdaderp/chartkit
npm install @chartkitdev/react @chartkitdev/core`}
        label="shell"
      />
      <p>
        <code>@chartkitdev/react</code> still exports <code>LineChart</code>, <code>KpiCard</code>, and the other
        dashboard components. Their props are not spec keys. New code should pass <code>spec</code> to{" "}
        <code>Chart</code>. A compatibility shim remains available as <code>@derpdaderp/chartkit</code> for existing
        imports.
      </p>
    </>
  );
}
