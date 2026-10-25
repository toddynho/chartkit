import type { APIRoute } from "astro";
import { JSON_TYPE, artifact } from "../../lib/artifacts";

/** v1 JSON Schema from packages/core. */
export const GET: APIRoute = () => artifact("packages/core/schema/chartkit.schema.json", JSON_TYPE, true);
