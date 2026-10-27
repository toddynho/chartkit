export type NavItem = {
  href: string;
  label: string;
};

/** Marketing header. Examples and Try Cloud stay off the bar. */
export const primaryNav: NavItem[] = [
  { href: "/cloud", label: "Cloud" },
  { href: "/dashboards", label: "Dashboards" },
  { href: "/agents", label: "Agents" },
  { href: "/gallery", label: "Gallery" },
  { href: "/docs", label: "Docs" },
];

/** Docs header drops Dashboards; Docs stays in the list. */
export const docsNavLinks: NavItem[] = [
  { href: "/cloud", label: "Cloud" },
  { href: "/agents", label: "Agents" },
  { href: "/gallery", label: "Gallery" },
  { href: "/docs", label: "Docs" },
];
