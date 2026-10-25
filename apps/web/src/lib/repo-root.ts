import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/** Repo root, whether Astro's cwd is `apps/web` or the workspace root. */
export function repoRoot(): string {
  let dir = process.cwd();
  for (let hop = 0; hop < 6; hop++) {
    if (existsSync(join(dir, "docs/public/llms.txt")) && existsSync(join(dir, "apps/web/package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`Could not find the ChartKit repo root from ${process.cwd()}`);
}
