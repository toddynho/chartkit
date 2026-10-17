import { DocsNav } from "@/components/DocsNav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wrap docs">
      <DocsNav />
      <article className="prose">{children}</article>
    </div>
  );
}
