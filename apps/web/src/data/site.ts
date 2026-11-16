import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../lib/repo-root";

function coreVersion(): string {
  const pkg = JSON.parse(readFileSync(join(repoRoot(), "packages/core/package.json"), "utf8")) as { version?: string };
  if (!pkg.version) throw new Error("packages/core/package.json is missing version");
  return pkg.version;
}

export const SITE = {
  name: "ChartKit",
  url: "https://chartkit.dev",
  version: coreVersion(),
  description:
    "Charts an agent can write and a server can render. One JSON spec, validated and repaired locally, drawn as SVG in React, Vue, Svelte, Astro, vanilla JavaScript, or Node.",
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
