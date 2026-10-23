import Link from "next/link";
import { ChartView } from "@/components/ChartView";
import { heroSpec, chartTypes, examples } from "@/lib/specs";
import { snippetsFor } from "@/lib/snippets";
import { FrameworkTabs } from "@/components/FrameworkTabs";
import { LiveSpec } from "@/components/LiveSpec";
import { ThemeShowcase } from "@/components/ThemeShowcase";
import { lookPanels } from "@/lib/looks";

const previewSlugs = [
  "channels-bar",
  "traffic-donut",
  "orders-combo",
  "capacity-gauge",
  "load-grid",
  "week-candles",
  "checkout-histogram",
  "close-boxplot",
  "model-radar",
  "signup-funnel",
  "inventory-treemap",
  "mill-sankey",
  "revenue-bullet",
  "quarter-waterfall",
];

export default function HomePage() {
  const previews = previewSlugs
    .map((slug) => examples.find((example) => example.slug === slug))
    .filter((example): example is NonNullable<typeof example> => Boolean(example));

  return (
    <div className="wrap">
      <section className="hero">
        <div>
          <p className="kicker">ChartKit v1</p>
          <h1>Charts become data.</h1>
          <p className="lede">
            An agent or your backend can write a chart. The spec is JSON, so a server, a database, an LLM, or Mermaid
            can produce it. The same object renders in React, Vue, Svelte, vanilla JavaScript, and server SVG.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/docs">
              Get started
            </Link>
            <Link className="btn btn-ghost" href="/convert">
              Convert a chart
            </Link>
          </div>
          <div className="stats">
            <Link className="stat" href="/benchmarks#agents">
              <b>42/42</b>
              <span>with the docs, first try. Mean 132.4 output tokens</span>
            </Link>
            <Link className="stat" href="/agents">
              <b>repair()</b>
              <span>no docs, 21/42 to 42/42, no model call</span>
            </Link>
          </div>
          <p>
            <Link href="/benchmarks#agents">See full benchmarks, losses included</Link>
          </p>
        </div>
      </section>
      <div className="hero-stage">
        <LiveSpec spec={heroSpec} mode="hero" />
      </div>

      <section className="section" aria-labelledby="why-switch">
        <h2 id="why-switch">Why switch</h2>
        <div className="grid-2">
          <article className="card">
            <h3>Agents get it right</h3>
            <p>
              With <code>llms.txt</code> in the prompt, agents write a valid ChartKit chart first try on 42 of 42
              tasks, at a mean of 132.4 output tokens. <code>repair()</code> takes a no-docs run from 21/42 to 42/42
              with no model call.
            </p>
            <p>
              <Link href="/benchmarks#agents">See full benchmarks, losses included</Link>
              {" · "}
              <Link href="/agents">The agent loop</Link>
            </p>
          </article>
          <article className="card">
            <h3>Charts from anywhere</h3>
            <p>
              A spec can come from a server render, a database row, LLM output, or Mermaid. The page does not need a
              new chart component for each of those sources.
            </p>
            <p>
              <Link href="/docs/mermaid">Mermaid and Markdown</Link>
              {" · "}
              <Link href="/docs">Render a spec</Link>
            </p>
          </article>
          <article className="card">
            <h3>One spec</h3>
            <p>
              The same JSON renders in React, Vue, Svelte, vanilla JavaScript, and as server SVG. Adapters and the
              server render share the object.
            </p>
            <p>
              <Link href="/docs/react">React</Link>
              {" · "}
              <Link href="/docs/vue">Vue</Link>
              {" · "}
              <Link href="/docs/svelte">Svelte</Link>
              {" · "}
              <Link href="/docs/vanilla">Vanilla</Link>
            </p>
          </article>
          <article className="card">
            <h3>Easy restyling</h3>
            <p>
              Theme tokens restyle every chart that shares the spec. Soft is the default. Refined, editorial, and
              midnight are built in. A brand palette overrides the tokens.
            </p>
            <p>
              <Link href="/docs/theming">Theme tokens</Link>
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="switching">
        <h2 id="switching">Switching is cheap</h2>
        <p className="lede">Move one chart. Leave the rest of the page on the library it already uses.</p>
        <div className="grid-3">
          <article className="card">
            <h3>Convert a config</h3>
            <p>
              Paste Chart.js, Recharts, or ECharts. The converter shows that library's chart beside the ChartKit chart,
              with the spec, the warnings, and a diff.
            </p>
            <Link href="/convert">Open the converter</Link>
          </article>
          <article className="card">
            <h3>Read the guide</h3>
            <p>
              <Link href="/docs/migrate/chartjs">Chart.js</Link>
              {", "}
              <Link href="/docs/migrate/recharts">Recharts</Link>
              {", and "}
              <Link href="/docs/migrate/echarts">ECharts</Link>
              . Each guide lists what maps and what comes back as a warning.
            </p>
          </article>
          <article className="card">
            <h3>One chart at a time</h3>
            <p>Render a single spec from React, Vue, Svelte, or vanilla. The other charts on the page can stay.</p>
            <Link href="/docs">Getting started</Link>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>Soft, then the other looks</h2>
        <p className="lede">
          The same two charts. Soft is what you get when <code>theme</code> is omitted. Refined and editorial are built
          in. Midnight is the opt-in dark card.
        </p>
        <ThemeShowcase looks={lookPanels()} />
        <p>
          <Link href="/docs/theming">Theme tokens and a brand palette</Link>
        </p>
      </section>

      <section className="section">
        <h2>The same spec, every framework</h2>
        <p className="lede">The tabs remember your choice. The chart above is this object.</p>
        <FrameworkTabs snippets={snippetsFor(heroSpec)} />
      </section>

      <section className="section">
        <h2>Agents validate, then repair</h2>
        <div className="grid-3">
          <article className="card">
            <h3>llms.txt</h3>
            <p>The spec, the repair loop, and one example of each chart type. The old file scored 18/42. This one is the docs the eval uses.</p>
            <a href="/llms.txt">Read llms.txt</a>
          </article>
          <article className="card">
            <h3>validate()</h3>
            <p>Structural checks from the JSON Schema, plus data-aware diagnostics, in one pass. A missing alt text is an error, not a warning you can skip.</p>
            <Link href="/docs/spec">Spec reference</Link>
          </article>
          <article className="card">
            <h3>repair()</h3>
            <p>
              Applies the safe patches validate already produced. It does not invent data. With no docs, repair() takes
              21/42 to 42/42 with no model call. With the docs, the first try is already 42/42.
            </p>
            <Link href="/agents">The agent loop</Link>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>Twenty-two chart types</h2>
        <p className="lede">
          Server-rendered SVG, with tooltip, crosshair, and the rest of the interaction layer after the page hydrates.
          Histogram through waterfall load their chart modules on demand.
        </p>
        <ul className="type-list">
          {chartTypes.map((item) => (
            <li key={item.type}>
              <Link href={`/docs/charts/${item.type}`}>{item.title}</Link>
            </li>
          ))}
        </ul>
        <div className="gallery">
          {previews.map((example) => (
            <article className="card" key={example.slug}>
              <ChartView spec={example.spec} />
              <h3>{example.title}</h3>
              <p>{example.blurb}</p>
              <Link href={`/examples/${example.slug}`}>Edit this spec</Link>
            </article>
          ))}
        </div>
        <p>
          <Link href="/examples">All examples</Link>
          {" · "}
          <Link href="/demo">Dashboard demo</Link>
          {" · "}
          <Link href="/compare">How it compares</Link>
        </p>
      </section>
    </div>
  );
}
