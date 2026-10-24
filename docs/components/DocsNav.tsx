"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { chartTypes } from "@/lib/specs";
import { SITE } from "@/lib/site";

const start: { href: string; label: string; external?: boolean }[] = [
  { href: "/docs", label: "Getting started" },
  { href: "/docs/react", label: "React" },
  { href: "/docs/vue", label: "Vue" },
  { href: "/docs/svelte", label: "Svelte" },
  { href: "/docs/vanilla", label: "Vanilla" },
  { href: "/docs/web-component", label: "Web component" },
  { href: "/docs/spec", label: "Spec reference" },
  { href: "/docs/theming", label: "Theming" },
  { href: "/docs/migrate", label: "Migrate from v0" },
  { href: "/docs/mermaid", label: "Mermaid or Markdown" },
  { href: "/docs/migrate/chartjs", label: "From Chart.js" },
  { href: "/docs/migrate/recharts", label: "From Recharts" },
  { href: "/docs/migrate/echarts", label: "From ECharts" },
  { href: "/docs/mcp", label: "MCP server" },
  { href: `${SITE.github}/blob/main/ROADMAP.md`, label: "Roadmap", external: true },
];

export function DocsNav() {
  const path = usePathname() ?? "";
  const links = (
    <>
      <p className="nav-label">Start</p>
      <ul>
        {start.map((item) => (
          <li key={item.href}>
            {item.external ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <Link href={item.href} aria-current={path === item.href ? "page" : undefined}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
      <p className="nav-label">Chart types</p>
      <ul>
        {chartTypes.map((item) => {
          const href = `/docs/charts/${item.type}`;
          return (
            <li key={item.type}>
              <Link href={href} aria-current={path === href ? "page" : undefined}>
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <>
      <details className="docs-jump">
        <summary>Documentation sections</summary>
        <nav aria-label="Documentation">{links}</nav>
      </details>
      <nav className="docs-side" aria-label="Documentation">
        {links}
      </nav>
    </>
  );
}
