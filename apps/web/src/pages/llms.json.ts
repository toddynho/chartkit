import type { APIRoute } from "astro";
import { JSON_TYPE, artifact } from "../lib/artifacts";

export const GET: APIRoute = () => artifact("catalog/public/llms.json", JSON_TYPE, true);
