import type { Metadata } from "next";

export const SITE = {
  name: "ChartKit",
  url: "https://chartkit.dev",
  description:
    "A fast, tiny JSON-spec charting library for React, Vue, Svelte, and vanilla JavaScript. Agents validate and repair the spec, then render SVG.",
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
  { href: "/examples", label: "Examples" },
  { href: "/playground", label: "Playground" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/features", label: "Features" },
  { href: "/agents", label: "Agents" },
] as const;

export const THEME_BOOT = `(function(){try{var s=localStorage.getItem("ck-theme");var dark=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;
