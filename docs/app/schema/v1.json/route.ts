import { readFileSync } from "node:fs";
import { join } from "node:path";

export function GET() {
  const file = join(process.cwd(), "..", "packages", "core", "schema", "chartkit.schema.json");
  const body = readFileSync(file, "utf8");
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
