import { SITE } from "./site";

export interface FooterLink {
  href: string;
  label: string;
  hint: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  note?: string;
  links: FooterLink[];
}

export const FOOTER: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { href: "/docs", label: "Docs", hint: "Getting started" },
      { href: "/examples", label: "Examples", hint: "One spec per chart" },
      { href: "/showcase", label: "Showcase", hint: "Finished charts" },
      { href: "/dashboards", label: "Dashboards", hint: "Product-style pages" },
      { href: "/playground", label: "Playground", hint: "Edit a spec" },
      { href: "/convert", label: "Convert", hint: "Chart.js, Recharts, ECharts" },
      { href: "/cloud", label: "Cloud", hint: "Hosted SVG and PNG" },
      { href: `${SITE.github}/blob/main/ROADMAP.md`, label: "Roadmap", hint: "Planned work", external: true },
    ],
  },
  {
    title: "Compare",
    links: [
      { href: "/benchmarks", label: "Benchmarks", hint: "Size, speed, and agents" },
      { href: "/features", label: "Features", hint: "Support matrix" },
      { href: "/compare", label: "Compare", hint: "Side by side" },
      { href: "/when-to-use", label: "When to use", hint: "Where ChartKit fits" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "/large", label: "Large data", hint: "A million points" },
      { href: "/interaction", label: "Interaction", hint: "Hover, zoom, and drill" },
      { href: "/layouts", label: "Layout", hint: "Facet, concat, and direction" },
      { href: "/maps", label: "Maps", hint: "Choropleth and points" },
      { href: "/demo", label: "Demo", hint: "One composed page" },
    ],
  },
  {
    title: "For agents",
    note: "Machine-readable files for AI coding agents",
    links: [
      { href: "/llms.txt", label: "llms.txt", hint: "compact API guide" },
      { href: "/llms-full.txt", label: "llms-full.txt", hint: "full field rules" },
      { href: "/features.json", label: "features.json", hint: "feature matrix" },
      { href: "/showcase.json", label: "showcase.json", hint: "example catalog" },
      { href: "/benchmarks.json", label: "benchmarks.json", hint: "benchmark numbers" },
      { href: "/benchmarks.md", label: "benchmarks.md", hint: "methodology" },
      { href: "/schema/v1.json", label: "JSON Schema", hint: "v1 schema" },
      { href: "/agents", label: "Agents", hint: "validate, then repair" },
      { href: "/docs/mcp", label: "MCP server", hint: "tools for coding agents" },
    ],
  },
];
