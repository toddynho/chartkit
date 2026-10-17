import Link from "next/link";
import { ChartView } from "@/lib/chart";
import { heroSpec, examples } from "@/lib/specs";
import { snippetsFor } from "@/lib/snippets";
import { FrameworkTabs } from "@/components/FrameworkTabs";
import { LiveSpec } from "@/components/LiveSpec";

const previewSlugs = ["channels-bar", "traffic-donut", "orders-combo", "capacity-gauge", "load-grid", "week-candles"];

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
              <b>8.7 KB</b>
              <span>gzip, line chart</span>
            </Link>
            <Link className="stat" href="/benchmarks">
              <b>0.62 ms</b>
              <span>server render</span>
            </Link>
            <Link className="stat" href="/benchmarks#agents">
              <b>42 / 42</b>
              <span>agent eval with the docs</span>
            </Link>
          </div>
        </div>
        <LiveSpec spec={heroSpec} />
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
            <p>Applies the safe patches validate already produced. It does not invent data. With no docs, repair() takes a first try from 21/42 to 42/42.</p>
            <Link href="/agents">The agent loop</Link>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>Fourteen chart types</h2>
        <p className="lede">Server-rendered SVG. Edit any of them.</p>
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
