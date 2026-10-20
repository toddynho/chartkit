import { CodeBlock } from "@/components/CodeBlock";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Web component",
  "A framework-free <chart-kit> element. Pass a JSON spec, reflect a theme, and hydrate server-rendered SVG.",
  "/docs/web-component",
);

const script = `<script type="module">
  import "@chartkitdev/element";
</script>

<chart-kit theme="soft">
  <script type="application/json">
    {"version":"1","type":"line","data":[{"week":"W1","baskets":12},{"week":"W4","baskets":22}],"encoding":{"x":"week","y":"baskets"},"a11y":{"alt":"Baskets rose."}}
  </script>
</chart-kit>`;

const property = `import "@chartkitdev/element";

const chart = document.querySelector("chart-kit");
chart.spec = spec;
chart.theme = "midnight";
chart.addEventListener("pointclick", (event) => console.log(event.detail));
chart.addEventListener("select", (event) => console.log(event.detail));`;

const server = `import { renderToString } from "@chartkitdev/element/ssr";

const html = renderToString(spec);`;

export default function WebComponentPage() {
  return (
    <>
      <h1>Web component</h1>
      <div className="note">
        <strong>Install: coming soon</strong>
        <code>@chartkitdev/element</code> is not on npm yet. Todd publishes it. Until then, build it from this repo
        and load <code>packages/element/dist/index.js</code>.
      </div>
      <p>
        <code>&lt;chart-kit&gt;</code> is a thin wrapper around <code>@chartkitdev/core</code>, in the same role as the
        Vue, Svelte, and vanilla adapters. It does not add spec keys.
      </p>
      <h2>Spec</h2>
      <p>The element reads the spec from the first of these that is set:</p>
      <ul>
        <li>
          the <code>spec</code> property, a chart object
        </li>
        <li>
          the <code>spec</code> attribute, a JSON string
        </li>
        <li>
          a child <code>&lt;script type=&quot;application/json&quot;&gt;</code>
        </li>
      </ul>
      <p>Changing any of those redraws the chart. The property wins over the attribute and the script.</p>
      <p>
        Leave <code>size.width</code> unset and the element measures its content box, then redraws through a{" "}
        <code>ResizeObserver</code> when the box changes. A numeric <code>size.width</code> stays as written.
      </p>
      <CodeBlock code={script} label="html" />
      <h2>Theme</h2>
      <p>
        <code>theme</code> reflects as an attribute. Setting it overrides <code>spec.theme</code>. A theme name already
        on the spec is copied onto the attribute when the attribute is empty.
      </p>
      <h2>Events</h2>
      <p>
        A mark click bubbles as <code>pointclick</code>. When the spec sets <code>interaction.select</code>, the same
        gesture also fires <code>select</code>. Both are DOM <code>CustomEvent</code>s, and <code>detail</code> is the
        core payload. Removing the element from the document drops the listeners and the interact controller.
      </p>
      <CodeBlock code={property} label="js" />
      <h2>Server HTML</h2>
      <p>
        <code>renderToString</code> from <code>@chartkitdev/element/ssr</code> returns the element with the SVG already
        inside, including histogram through journey. On the client, that SVG node is patched in place. Histogram
        through journey still load through <code>@chartkitdev/core/load</code> when the SVG was not already there.
      </p>
      <CodeBlock code={server} label="js" />
      <h2>Plain HTML</h2>
      <p>
        <code>packages/element/example/index.html</code> has no build step. Serve the repository and open that file.
        Its import map points at the built <code>dist</code> files.
      </p>
    </>
  );
}
