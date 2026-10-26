import type { APIRoute } from "astro";
import { JSON_TYPE, artifact } from "../lib/artifacts";

export const GET: APIRoute = () => artifact("catalog/public/benchmarks.schema.json", JSON_TYPE, true);
