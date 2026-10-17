import Link from "next/link";

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
        <Link href="/playground">Playground</Link>
        <Link href="/benchmarks">Benchmarks</Link>
        <Link href="/agents">Agents</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/demo">Demo</Link>
        <a href="/llms.txt">llms.txt</a>
        <a href="/llms-full.txt">llms-full.txt</a>
        <a href="/schema/v1.json">Schema</a>
      </nav>
      <p className="legal">© 2026 ChartKit. MIT license.</p>
    </footer>
  );
}
