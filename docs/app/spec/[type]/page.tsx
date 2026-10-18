import Link from "next/link";
import { notFound } from "next/navigation";
import { specPages } from "@/lib/spec-charts";

export function generateStaticParams() {
  return Object.keys(specPages).map((type) => ({ type }));
}

export default function SpecTypePage({ params }: { params: { type: string } }) {
  const page = specPages[params.type];
  if (!page) notFound();
  return (
    <article className="prose wrap">
      <p>
        <Link href="/spec">Spec</Link>
      </p>
      <h1 id={params.type}>{page.title}</h1>
      <p className="lead">{page.summary}</p>
      <h2 id="fields">Fields</h2>
      <ul>
        {page.fields.map((field) => (
          <li key={field}>{field}</li>
        ))}
      </ul>
      <h2 id="example">Example</h2>
      <pre>
        <code>{page.example}</code>
      </pre>
      <p>
        The same object is the <code>spec</code> prop for <code>@chartkitdev/react</code>, <code>@chartkitdev/vue</code>, and <code>@chartkitdev/svelte</code>, and the argument to <code>mount</code> in <code>@chartkitdev/vanilla</code>.
      </p>
    </article>
  );
}
