import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { APIRoute } from "astro";
import { repoRoot } from "../lib/repo-root";

/** Mermaid sheet from catalog/public. */
export const GET: APIRoute = () => {
  const bytes = readFileSync(join(repoRoot(), "catalog/public/mermaid-sheet.png"));
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
