import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { APIRoute } from "astro";
import { MARKDOWN, artifact } from "../../lib/artifacts";
import { repoRoot } from "../../lib/repo-root";

export function getStaticPaths() {
  const dir = join(repoRoot(), "docs/public/dashboards");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => ({ params: { slug: name.slice(0, -3) } }));
}

/** The markdown files Next serves from docs/public/dashboards. */
export const GET: APIRoute = ({ params }) => {
  const slug = params.slug;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return new Response("Not found", { status: 404 });
  return artifact(`docs/public/dashboards/${slug}.md`, MARKDOWN);
};
