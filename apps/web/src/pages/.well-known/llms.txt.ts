import type { APIRoute } from "astro";
import { TEXT, artifact } from "../../lib/artifacts";

/** Same bytes as /llms.txt. A static meta-refresh redirect would hand agents HTML. */
export const GET: APIRoute = () => artifact("catalog/public/llms.txt", TEXT);
