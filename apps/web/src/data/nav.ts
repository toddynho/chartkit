export type NavItem = {
  href: string;
  label: string;
};

/** Lean header. Pricing lives on /cloud#pricing. Compare lives in the footer. */
export const primaryNav: NavItem[] = [
  { href: "/cloud", label: "Cloud" },
  { href: "/dashboards", label: "Dashboards" },
  { href: "/agents", label: "Agents" },
  { href: "/gallery", label: "Gallery" },
  { href: "/examples", label: "Examples" },
  { href: "/docs", label: "Docs" },
];
