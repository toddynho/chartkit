export const SITE = {
  name: "ChartKit",
  url: "https://chartkit.dev",
  description:
    "JSON-spec charts. An agent, a server, a database, or Mermaid can write the spec. The same object renders in React, Vue, Svelte, vanilla JavaScript, and server SVG.",
  github: "https://github.com/toddynho/chartkit",
} as const;

/** Drop a trailing slash so canonicals match the public URLs. Root stays `/`. */
export function canonicalPath(pathname: string): string {
  if (pathname === "/") return "/";
  return pathname.replace(/\/$/, "");
}

export function isCurrent(href: string, pathname: string): boolean {
  return canonicalPath(pathname) === href;
}
