import type { APIRoute } from "astro";
import { JSON_TYPE, artifact } from "../lib/artifacts";

export const GET: APIRoute = () => artifact("catalog/public/features.json", JSON_TYPE, true);
