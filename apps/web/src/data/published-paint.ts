import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "../lib/repo-root";

export type PublishedPaintCell = {
  library: string;
  state: "ok" | "dnf" | "na" | "absent";
  initialMs: number | null;
  updateMs: number | null;
  text: string;
  title: string;
};

export type PublishedPaintRow = {
  chart: string;
  label: string;
  points: number;
  pointsLabel: string;
  sampling: string;
  cells: PublishedPaintCell[];
};

export type PublishedPaint = {
  measuredAt: string;
  measuredOn: string;
  samples: number;
  libraries: string[];
  rows: PublishedPaintRow[];
  caption: string;
  notes: string[];
  missingChartKit: string[];
};

/** Paint matrix published in catalog/public/benchmarks.json, built from bench/results/paint.json. */
export function loadPublishedPaint(): PublishedPaint {
  const file = JSON.parse(readFileSync(join(repoRoot(), "catalog/public/benchmarks.json"), "utf8")) as { paint?: PublishedPaint };
  const paint = file.paint;
  if (!paint || !Array.isArray(paint.rows) || !Array.isArray(paint.libraries) || typeof paint.caption !== "string") {
    throw new Error("catalog/public/benchmarks.json is missing the paint matrix");
  }
  if (paint.missingChartKit?.length) {
    throw new Error(`paint matrix has no ChartKit ok cell for ${paint.missingChartKit.join(", ")}`);
  }
  return paint;
}
