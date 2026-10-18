import Link from "next/link";
import { ChartView } from "@/components/ChartView";
import { pageMeta } from "@/lib/site";
import { exampleGroups, examples } from "@/lib/specs";

export const metadata = pageMeta(
  "Examples",
  "A gallery of ChartKit specs, including histogram, box plot, radar, funnel, treemap, sankey, bullet, and waterfall.",
  "/examples",
);

export default function ExamplesPage() {
  return (
    <div className="wrap section">
      <h1>Examples</h1>
      <p className="lede">
        Every card is a v1 spec, rendered to SVG on the server. Open one to edit the JSON and see the chart update.
      </p>
      <nav className="filters" aria-label="Example groups">
        {exampleGroups.map((group) => (
          <a key={group} href={`#${group.toLowerCase().replace(/\s+/g, "-")}`}>
            {group}
          </a>
        ))}
      </nav>
      {exampleGroups.map((group) => (
        <section key={group} id={group.toLowerCase().replace(/\s+/g, "-")} className="section">
          <h2>{group}</h2>
          <div className="gallery">
            {examples
              .filter((example) => example.group === group)
              .map((example) => (
                <article className="card" key={example.slug}>
                  <ChartView spec={example.spec} />
                  <h3>{example.title}</h3>
                  <p>{example.blurb}</p>
                  <Link href={`/examples/${example.slug}`}>Edit spec</Link>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
