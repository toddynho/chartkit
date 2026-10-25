import type { APIRoute } from "astro";
import { MARKDOWN, artifact } from "../lib/artifacts";

/** Benchmarks write-up from catalog/content/benchmarks.md. */
export const GET: APIRoute = () => artifact("catalog/content/benchmarks.md", MARKDOWN);
