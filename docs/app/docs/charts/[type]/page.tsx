import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/CodeBlock";
import { FrameworkTabs } from "@/components/FrameworkTabs";
import { ChartView } from "@/lib/chart";
import { pageMeta } from "@/lib/site";
import { snippetsFor } from "@/lib/snippets";
import { chartTypes, examplesForType, playgroundHref } from "@/lib/specs";

export function generateStaticParams() {
  return chartTypes.map((item) => ({ type: item.type }));
}

export function generateMetadata({ params }: { params: { type: string } }) {
  const doc = chartTypes.find((item) => item.type === params.type);
  if (!doc) return {};
  return pageMeta(doc.title, doc.summary, `/docs/charts/${doc.type}`);
}

export default function ChartTypePage({ params }: { params: { type: string } }) {
  const doc = chartTypes.find((item) => item.type === params.type);
  if (!doc) notFound();
  const related = examplesForType(doc.type);
  const primary = related[0];
  if (!primary) notFound();

  return (
    <>
      <h1>{doc.title}</h1>
      <p>{doc.summary}</p>
      <ChartView spec={primary.spec} />
      <p>
        <Link href={playgroundHref(primary.spec)}>Open in the playground</Link>
        {" · "}
        <Link href={`/examples/${primary.slug}`}>Edit {primary.title}</Link>
      </p>
      <h2>Spec</h2>
      <CodeBlock code={JSON.stringify(primary.spec, null, 2)} label="json" />
      <FrameworkTabs snippets={snippetsFor(primary.spec)} />
      <h2>Notes</h2>
      <ul>
        {doc.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <h2>Accessibility</h2>
      <p>
        <code>a11y.alt</code> is required. The SVG has <code>role=&quot;img&quot;</code> and <code>aria-label</code> set
        to that sentence, plus a <code>title</code> and <code>desc</code>. Keyboard navigation and a data table are in
        the schema and not drawn yet, so the alt sentence has to carry the chart.
      </p>
      {related.length > 1 ? (
        <>
          <h2>More {doc.title.toLowerCase()} examples</h2>
          <ul>
            {related.slice(1).map((example) => (
              <li key={example.slug}>
                <Link href={`/examples/${example.slug}`}>{example.title}</Link> — {example.blurb}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}
