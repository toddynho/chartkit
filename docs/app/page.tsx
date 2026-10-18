import Link from "next/link";
import { ChartView } from "@/components/ChartView";
import { headline } from "@/lib/benchmarks";
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
          <h1>Charts from one JSON spec.</h1>
          <p className="lede">
            Any framework. Built for agents. ChartKit is a fast, tiny charting library: one JSON spec renders SVG in
            React, Vue, Svelte, or the plain DOM, and AI agents get it right.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/docs">
              Get started
            </Link>
            <Link className="btn btn-ghost" href="/examples">
              Browse examples
            </Link>
          </div>
          <div className="stats">
            <Link className="stat" href="/benchmarks">
              <b>{headline.lineGzipLabel}</b>
              <span>gzip, line chart. Next is {headline.nextLib} at {headline.nextGzipBytes} B</span>
            </Link>
            <Link className="stat" href="/benchmarks">
              <b>{headline.ssrLabel}</b>
              <span>server render</span>
            </Link>
            <Link className="stat" href="/benchmarks#agents">
              <b>{headline.repair}</b>
              <span>repair(), no docs, first try</span>
            </Link>
          </div>
        </div>
      </section>
      <div className="hero-stage">
        <LiveSpec spec={heroSpec} mode="hero" />
      </div>

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
              Applies the safe patches validate already produced. It does not invent data. With no docs, repair() takes a
              first try from {headline.repairFrom} to {headline.repairTo}.
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
