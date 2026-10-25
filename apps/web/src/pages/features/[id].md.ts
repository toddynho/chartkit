import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { APIRoute } from "astro";
import { MARKDOWN, artifact } from "../../lib/artifacts";
import { repoRoot } from "../../lib/repo-root";

export function getStaticPaths() {
  const dir = join(repoRoot(), "docs/public/features");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => ({ params: { id: name.slice(0, -3) } }));
}

/** Markdown twins Next serves from docs/public/features. Ids keep their dots. */
export const GET: APIRoute = ({ params }) => {
  const id = params.id;
  if (!id || !/^[a-z0-9.-]+$/.test(id)) return new Response("Not found", { status: 404 });
  return artifact(`docs/public/features/${id}.md`, MARKDOWN);
};
