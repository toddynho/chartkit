import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { LiveSpec } from "@/components/LiveSpec";
import { pageMeta } from "@/lib/site";
import { minimalSpec } from "@/lib/specs";

export const metadata = pageMeta(
  "Getting started",
  "Install ChartKit and render a JSON spec to SVG in React, Vue, Svelte, vanilla JavaScript, or Node.",
  "/docs",
);

export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting started</h1>
      <p>
        ChartKit v1 is a JSON spec plus <code>@chartkitdev/core</code>. The core has zero dependencies, validates the
        spec, and renders SVG. Adapters for React, Vue, Svelte, and the plain DOM pass that spec through. They do not
        add chart logic.
      </p>
      <h2>Install the core</h2>
      <CodeBlock code={"npm install @chartkitdev/core"} label="shell" />
      <CodeBlock
        code={`import { render } from "@chartkitdev/core/all";
import { validate, repair } from "@chartkitdev/core/validate";

const result = validate(spec);
const svg = render(result.ok ? spec : repair(spec).spec);`}
        label="ts"
      />
      <p>
        <code>render</code> from <code>@chartkitdev/core/all</code> registers every chart. For a smaller page, build a
        renderer with only the charts you import:
      </p>
      <CodeBlock
        code={`import { createRenderer } from "@chartkitdev/core";
import { line } from "@chartkitdev/core/charts/line";

const render = createRenderer([line]);`}
        label="ts"
      />
      <h2>A valid spec</h2>
      <ul>
        <li>
          <code>version</code> is <code>&quot;1&quot;</code>. <code>a11y.alt</code> is one sentence and is required.
        </li>
        <li>
          <code>data</code> is an array of row objects, not <code>{`{ values: [...] }`}</code>. Sparkline, mini-area,
          and spike may use a number array.
        </li>
        <li>
          The chart type goes in <code>type</code>. <code>mark</code> is an options object.
        </li>
        <li>
          Gauge, kpi, and progress-ring put the number in <code>metric</code>.
        </li>
      </ul>
      <LiveSpec spec={minimalSpec} />
      <h2>Pick a framework</h2>
      <ul>
        <li>
          <Link href="/docs/react">React</Link>
        </li>
        <li>
          <Link href="/docs/vue">Vue</Link>
        </li>
        <li>
          <Link href="/docs/svelte">Svelte</Link>
        </li>
        <li>
          <Link href="/docs/vanilla">Vanilla</Link>
        </li>
      </ul>
      <p>
        Then read the <Link href="/docs/spec">spec reference</Link>, the{" "}
        <Link href="/docs/theming">theming tokens</Link>, or the{" "}
        <Link href="/examples">examples</Link>.
      </p>
    </>
  );
}
