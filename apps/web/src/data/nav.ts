export type NavItem = {
  href: string;
  label: string;
};

/** Site header. The docs sidebar lives in `docs-catalog.ts`. */
export const primaryNav: NavItem[] = [
  { href: "/docs", label: "Docs" },
  { href: "/cloud", label: "Cloud" },
  { href: "/docs/validate", label: "Agents" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#gallery", label: "Gallery" },
];
