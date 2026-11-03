export type NavItem = {
  href: string;
  label: string;
};

/** Marketing header. Features stay off the bar. Docs is the starting point. */
export const primaryNav: NavItem[] = [
  { href: "/cloud", label: "Cloud" },
  { href: "/dashboards", label: "Dashboards" },
  { href: "/agents", label: "Agents" },
  { href: "/gallery", label: "Gallery" },
  { href: "/playground", label: "Playground" },
  { href: "/docs", label: "Docs" },
];

/** Docs header drops Dashboards; Docs stays in the list. */
export const docsNavLinks: NavItem[] = [
  { href: "/cloud", label: "Cloud" },
  { href: "/agents", label: "Agents" },
  { href: "/gallery", label: "Gallery" },
  { href: "/playground", label: "Playground" },
  { href: "/docs", label: "Docs" },
];
