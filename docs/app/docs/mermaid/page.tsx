import { CodeBlock } from "@/components/CodeBlock";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Use Mermaid or Markdown",
  "Turn Mermaid chart syntax and Markdown fences into ChartKit specs and SVG.",
  "/docs/mermaid",
);

const xy = `xychart-beta
    title "Weekly orders"
    x-axis [Mon, Tue, Wed, Thu, Fri]
    y-axis "Orders"
    bar "Placed" [12, 18, 15, 22, 30]
    line "Shipped" [10, 14, 16, 20, 28]`;

export default function MermaidPage() {
  return (
    <>
      <h1>Use Mermaid or Markdown</h1>
      <p>
        <code>fromMermaid</code> reads the chart syntax models already write and returns a ChartKit v1 spec plus
        warnings. <code>toSpec</code> accepts that syntax or a ChartKit JSON object. The converters live in{" "}
        <code>@chartkitdev/core/mermaid</code> and are not part of the line bundle.
      </p>
      <CodeBlock
        label="ts"
        code={`import { fromMermaid, toSpec } from "@chartkitdev/core/mermaid";

const { spec, warnings } = fromMermaid(\`${xy}\`);`}
      />
      <h2>Charts</h2>
      <p>Supported Mermaid 11/12 charts:</p>
      <ul>
        <li>
          <code>xychart</code> and <code>xychart-beta</code>: bar and line series, a title, categories or a numeric
          x range, and a horizontal bar chart.
        </li>
        <li>
          <code>pie</code>, including <code>showData</code> (legend values on a pie).
        </li>
        <li>
          <code>sankey-beta</code> CSV rows.
        </li>
        <li>
          <code>radar-beta</code>.
        </li>
        <li>
          <code>treemap-beta</code>.
        </li>
        <li>
          <code>quadrantChart</code>, drawn as a scatter with quadrant labels and reference lines.
        </li>
      </ul>
      <p>
        A frontmatter title, <code>accTitle</code>, and <code>accDescr</code> are read. <code>accDescr</code> or the
        title becomes <code>a11y.alt</code>. If neither is present, ChartKit writes one factual sentence from the
        data. Unknown syntax returns a <code>CK8004</code> warning. Flowcharts and other diagrams return{" "}
        <code>CK8003</code> and no spec.
      </p>
      <img src="/mermaid-sheet.png" alt="Mermaid source beside the ChartKit chart for each supported kind, in light mode." />
      <h2>Markdown</h2>
      <p>
        In the browser, <code>autoRender</code> from <code>@chartkitdev/vanilla/auto</code> mounts{" "}
        <code>pre.chartkit</code> and <code>code.language-chartkit</code>. Mermaid fences are opt-in.
      </p>
      <CodeBlock
        label="ts"
        code={`import { autoRender } from "@chartkitdev/vanilla/auto";

autoRender(document, { mermaid: true });`}
      />
      <p>
        <code>dist/chartkit.global.js</code> is the one-file build: <code>ChartKit.autoRender</code>,{" "}
        <code>ChartKit.fromMermaid</code>, and <code>ChartKit.toSpec</code>.{" "}
        <code>dist/chartkit.auto.global.js</code> is the same auto-render without the Mermaid parser. With{" "}
        <code>data-chartkit-mermaid</code> and a Mermaid block on the page, it loads the sibling{" "}
        <code>chartkit.mermaid.global.js</code>. Unsupported Mermaid blocks stay as source.
      </p>
      <CodeBlock
        label="html"
        code={`<script src="chartkit.global.js" data-chartkit-mermaid></script>
<pre class="mermaid"><code>pie
    title Share of workshop hours
    "Design": 42
    "Build": 35
</code></pre>`}
      />
      <p>
        <code>@chartkitdev/markdown</code> turns the same fences into server SVG. Pass{" "}
        <code>allowDangerousHtml</code> to remark-rehype so the HTML node is kept.
      </p>
      <CodeBlock
        label="ts"
        code={`import { rehypeChartkit, remarkChartkit } from "@chartkitdev/markdown";

remark().use(remarkParse).use(remarkChartkit).use(remarkRehype, { allowDangerousHtml: true });
rehype().use(rehypeParse).use(rehypeChartkit);`}
      />
      <h2>Limits</h2>
      <p>
        A y-axis range on <code>xychart</code> is stored as <code>encoding.y.scale.domain</code> and warned. Bar and
        line charts size the axis from the data, and <code>axes.y</code> has no min or max. Radar has no min or max
        either, so it draws to the largest value, with a polygon graticule. A treemap keeps one group level. Quadrant
        point radius is not drawn. <code>showData</code> prints the value in the legend.
      </p>
      <h2>Security</h2>
      <p>
        Fence text is data. The SVG renderer escapes labels, and Mermaid <code>click</code> and <code>href</code>{" "}
        lines are dropped rather than written as links. Sources longer than 100,000 characters are refused (
        <code>CK8001</code>). Charts keep at most 2,000 points (<code>CK8002</code>). Pass <code>maxSource</code> and{" "}
        <code>maxPoints</code> to change either cap. The global script does not scan Mermaid fences unless the script
        tag sets <code>data-chartkit-mermaid</code>.
      </p>
    </>
  );
}
