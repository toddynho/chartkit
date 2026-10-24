import type { Metadata } from "next";

export const SITE = {
  name: "ChartKit",
  url: "https://chartkit.dev",
  description:
    "JSON-spec charts. An agent, a server, a database, or Mermaid can write the spec. The same object renders in React, Vue, Svelte, vanilla JavaScript, and server SVG.",
  github: "https://github.com/toddynho/chartkit",
};

export function pageMeta(title: string, description: string, path: string): Metadata {
  const url = `${SITE.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ChartKit`,
      description,
      url,
      siteName: "ChartKit",
      type: "website",
    },
  };
}

export const NAV = [
  { href: "/docs", label: "Docs" },
  { href: "/convert", label: "Convert" },
  { href: "/examples", label: "Examples" },
  { href: "/showcase", label: "Showcase" },
  { href: "/dashboards", label: "Dashboards" },
  { href: "/playground", label: "Playground" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/features", label: "Features" },
  { href: "/agents", label: "Agents" },
  { href: "/cloud", label: "Cloud" },
] as const;

export const THEME_BOOT = `(function(){try{var s=localStorage.getItem("ck-theme");var dark=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;
