export type NavItem = {
  href: string;
  label: string;
};

/** Site header. The docs sidebar lives in `docs-catalog.ts`. */
export const primaryNav: NavItem[] = [
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cloud", label: "Cloud" },
  { href: "/agents", label: "Agents" },
  { href: "/gallery", label: "Gallery" },
];

/** Batch 2 product pages. They live in the header More menu so the bar stays one line. */
export const moreNav: NavItem[] = [
  { href: "/showcase", label: "Showcase" },
  { href: "/examples", label: "Examples" },
  { href: "/features", label: "Features" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/playground", label: "Playground" },
  { href: "/convert", label: "Convert" },
  { href: "/compare", label: "Compare" },
  { href: "/maps", label: "Maps" },
  { href: "/demo", label: "Demo" },
  { href: "/large", label: "Large data" },
  { href: "/interaction", label: "Interaction" },
  { href: "/layouts", label: "Layout" },
  { href: "/when-to-use", label: "When to use" },
];
