import type { APIRoute } from "astro";
import { JSON_TYPE, artifact } from "../../lib/artifacts";

/** Same file Next reads in docs/app/schema/v1.json/route.ts. */
export const GET: APIRoute = () => artifact("packages/core/schema/chartkit.schema.json", JSON_TYPE, true);
