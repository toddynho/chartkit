import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>ChartKit</strong>
        <p>One JSON spec. SVG out. Any framework.</p>
      </div>
      <nav aria-label="Footer">
        <Link href="/docs">Docs</Link>
        <Link href="/examples">Examples</Link>
        <Link href="/showcase">Showcase</Link>
        <Link href="/playground">Playground</Link>
        <Link href="/benchmarks">Benchmarks</Link>
        <Link href="/agents">Agents</Link>
        <Link href="/features">Features</Link>
        <Link href="/compare">Compare</Link>
        <a href={`${SITE.github}/blob/main/ROADMAP.md`}>Roadmap</a>
        <Link href="/when-to-use">When to use</Link>
        <Link href="/demo">Demo</Link>
        <Link href="/large">Large data</Link>
        <a href="/llms.txt">llms.txt</a>
        <a href="/features.json">features.json</a>
        <a href="/showcase.json">showcase.json</a>
        <a href="/benchmarks.json">benchmarks.json</a>
        <a href="/benchmarks.md">benchmarks.md</a>
        <a href="/llms-full.txt">llms-full.txt</a>
        <a href="/schema/v1.json">Schema</a>
      </nav>
      <p className="legal">© 2026 ChartKit. MIT license.</p>
    </footer>
  );
}
