import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/CodeBlock";
import { FrameworkTabs } from "@/components/FrameworkTabs";
import { LiveSpec } from "@/components/LiveSpec";
import { pageMeta } from "@/lib/site";
import { minimalSpec } from "@/lib/specs";
import { FRAMEWORKS, frameworkDocs, snippetsFor, type FrameworkId } from "@/lib/snippets";

const ids = new Set(FRAMEWORKS.map((item) => item.id));

export function generateStaticParams() {
  return FRAMEWORKS.filter((item) => item.id !== "server").map((item) => ({ framework: item.id }));
}

export function generateMetadata({ params }: { params: { framework: string } }) {
  const doc = frameworkDocs[params.framework as FrameworkId];
  if (!doc || params.framework === "server") return {};
  return pageMeta(doc.title, doc.lede, `/docs/${params.framework}`);
}

export default function FrameworkPage({ params }: { params: { framework: string } }) {
  if (!ids.has(params.framework as FrameworkId) || params.framework === "server") notFound();
  const id = params.framework as FrameworkId;
  const doc = frameworkDocs[id];
  return (
    <>
      <h1>{doc.title}</h1>
      <p>{doc.lede}</p>
      <h2>Install</h2>
      <CodeBlock code={doc.install} label="shell" />
      <p>
        Packages publish as <code>@chartkitdev/*</code>. The adapter depends on <code>@chartkitdev/core</code>.
      </p>
      <h2>The spec</h2>
      <FrameworkTabs snippets={snippetsFor(minimalSpec)} />
      <LiveSpec spec={minimalSpec} />
      <h2>On the server</h2>
      <CodeBlock code={doc.server} label={id} />
    </>
  );
}
