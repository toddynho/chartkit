import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { APIRoute } from "astro";
import { repoRoot } from "../lib/repo-root";

/** The Mermaid sheet Next serves from docs/public. One file, both apps. */
export const GET: APIRoute = () => {
  const bytes = readFileSync(join(repoRoot(), "docs/public/mermaid-sheet.png"));
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
