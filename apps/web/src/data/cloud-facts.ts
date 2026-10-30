import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../lib/repo-root";

/** The rate limit the Cloud service enforces. Read from the source constant. */
export function freeRenderLimit(): number {
  const text = readFileSync(join(repoRoot(), "apps/cloud/src/limit.ts"), "utf8");
  const match = text.match(/export const FREE_LIMIT = (\d+);/);
  if (!match?.[1]) throw new Error("apps/cloud/src/limit.ts is missing FREE_LIMIT");
  return Number(match[1]);
}
