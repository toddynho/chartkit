"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { chartTypes } from "@/lib/specs";

const start = [
  { href: "/docs", label: "Getting started" },
  { href: "/docs/react", label: "React" },
  { href: "/docs/vue", label: "Vue" },
  { href: "/docs/svelte", label: "Svelte" },
  { href: "/docs/vanilla", label: "Vanilla" },
  { href: "/docs/spec", label: "Spec reference" },
  { href: "/docs/theming", label: "Theming" },
  { href: "/docs/migrate", label: "Migrate from v0" },
  { href: "/docs/mermaid", label: "Mermaid or Markdown" },
];

export function DocsNav() {
  const path = usePathname() ?? "";
  const links = (
    <>
      <p className="nav-label">Start</p>
      <ul>
        {start.map((item) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={path === item.href ? "page" : undefined}>
              {item.label}
            </Link>
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
