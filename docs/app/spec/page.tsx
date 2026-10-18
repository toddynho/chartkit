import Link from "next/link";
import { specPages } from "@/lib/spec-charts";

export default function SpecIndexPage() {
  return (
    <article className="prose wrap">
      <h1 id="spec">JSON spec charts</h1>
      <p className="lead">
        These types use the same v1 spec in React, Vue, Svelte, and vanilla. The chart type goes in <code>type</code>. <code>a11y.alt</code> is required.
      </p>
      <ul>
        {Object.entries(specPages).map(([type, page]) => (
          <li key={type}>
            <Link href={`/spec/${type}`}>{page.title}</Link>
            <span> — {page.summary}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
