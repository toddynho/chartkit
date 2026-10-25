import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DashboardIndex, PaintedBoard } from "./dashboard-types";
import { repoRoot } from "./repo-root";

function generated(name: string): string {
  return join(repoRoot(), "apps/web/.generated/dashboards", name);
}

function readGenerated(name: string): string {
  const file = generated(name);
  if (!existsSync(file)) throw new Error(`Missing ${file}. Run npm run paint --workspace=chartkit-web`);
  return readFileSync(file, "utf8");
}

export function loadIndex(): DashboardIndex {
  return JSON.parse(readGenerated("index.json")) as DashboardIndex;
}

export function loadBoard(slug: string): PaintedBoard {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Unknown dashboard: ${slug}`);
  return JSON.parse(readGenerated(`${slug}.json`)) as PaintedBoard;
}
