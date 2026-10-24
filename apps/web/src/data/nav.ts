export type NavItem = {
  href: string;
  label: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Docs information architecture for the Astro shell. Chart-type pages exist; the nav lists a short set. */
export const docsNav: NavGroup[] = [
  {
    label: "Start",
    items: [
      { href: "/docs", label: "Getting started" },
      { href: "/docs/install", label: "Install" },
    ],
  },
  {
    label: "Concepts",
    items: [
      { href: "/docs/concepts", label: "Overview" },
      { href: "/docs/concepts/spec", label: "The spec" },
      { href: "/docs/concepts/adapters", label: "Adapters" },
      { href: "/docs/concepts/themes", label: "Themes" },
    ],
  },
  {
    label: "Chart types",
    items: [
      { href: "/docs/charts", label: "All types" },
      { href: "/docs/charts/line", label: "Line" },
      { href: "/docs/charts/bar", label: "Bar" },
      { href: "/docs/charts/donut", label: "Donut" },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/docs/reference", label: "Overview" },
      { href: "/docs/reference/try", label: "Try it" },
      { href: "/docs/reference/validate", label: "Validate and repair" },
    ],
  },
  {
    label: "Agents",
    items: [
      { href: "/docs/agents", label: "The agent loop" },
      { href: "/docs/agents/mcp", label: "MCP" },
      { href: "/docs/agents/llms", label: "llms.txt" },
    ],
  },
];

export const primaryNav: NavItem[] = [
  { href: "/docs", label: "Docs" },
  { href: "/cloud", label: "Cloud" },
  { href: "/docs/agents", label: "Agents" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#gallery", label: "Gallery" },
];
