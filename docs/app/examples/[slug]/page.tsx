import Link from "next/link";
import { notFound } from "next/navigation";
import { FrameworkTabs } from "@/components/FrameworkTabs";
import { LiveSpec } from "@/components/LiveSpec";
import { pageMeta } from "@/lib/site";
import { snippetsFor } from "@/lib/snippets";
import { exampleBySlug, examples, playgroundHref } from "@/lib/specs";

export function generateStaticParams() {
  return examples.map((example) => ({ slug: example.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const example = exampleBySlug(params.slug);
  if (!example) return {};
  return pageMeta(example.title, example.blurb, `/examples/${example.slug}`);
}

export default function ExamplePage({ params }: { params: { slug: string } }) {
  const example = exampleBySlug(params.slug);
  if (!example) notFound();
  return (
    <div className="wrap section prose wide">
      <p className="kicker">{example.type}</p>
      <h1>{example.title}</h1>
      <p className="lede">{example.blurb}</p>
      <LiveSpec spec={example.spec} />
      <p>
        <Link href={playgroundHref(example.spec)}>Open in the playground</Link>
        {" · "}
        <Link href={`/docs/charts/${example.type}`}>{example.type} reference</Link>
      </p>
      <h2>Same spec</h2>
      <FrameworkTabs snippets={snippetsFor(example.spec)} />
    </div>
  );
}
