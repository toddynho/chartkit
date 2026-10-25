import type { APIRoute } from "astro";
import { TEXT, artifact } from "../lib/artifacts";

export const GET: APIRoute = () => artifact("docs/public/llms-full.txt", TEXT);
