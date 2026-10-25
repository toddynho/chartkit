import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { APIRoute } from "astro";
import { MARKDOWN, artifact } from "../../lib/artifacts";
import { repoRoot } from "../../lib/repo-root";

export function getStaticPaths() {
  const dir = join(repoRoot(), "docs/public/showcase");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => ({ params: { slug: name.slice(0, -3) } }));
}

/** Markdown twins Next serves from docs/public/showcase. */
export const GET: APIRoute = ({ params }) => {
  const slug = params.slug;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return new Response("Not found", { status: 404 });
  return artifact(`docs/public/showcase/${slug}.md`, MARKDOWN);
};
