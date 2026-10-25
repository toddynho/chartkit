import type { APIRoute } from "astro";
import { MARKDOWN, artifact } from "../lib/artifacts";

/** The benchmarks write-up Next reads from docs/content/benchmarks.md. */
export const GET: APIRoute = () => artifact("docs/content/benchmarks.md", MARKDOWN);
