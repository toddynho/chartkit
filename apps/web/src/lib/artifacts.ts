import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./repo-root";

const cache = "public, max-age=86400";

/** Bytes of a repo file, with the same content-type Next sends for that artifact. */
export function artifact(relativePath: string, contentType: string, cors = false): Response {
  const body = readFileSync(join(repoRoot(), relativePath));
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": cache,
  };
  if (cors) headers["Access-Control-Allow-Origin"] = "*";
  return new Response(body, { headers });
}

export const TEXT = "text/plain; charset=utf-8";
export const JSON_TYPE = "application/json; charset=utf-8";
export const MARKDOWN = "text/markdown; charset=utf-8";
