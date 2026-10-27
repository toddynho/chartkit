import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./repo-root";

type MatrixLib = { id: string; bundleGzip?: { minimalLine?: number } };

let rivals: MatrixLib[] | null = null;

function matrix(): MatrixLib[] {
  if (!rivals) {
    const file = JSON.parse(readFileSync(join(repoRoot(), "catalog/data/matrix/matrix.json"), "utf8")) as {
      libraries: MatrixLib[];
    };
    rivals = file.libraries;
  }
  return rivals;
}

export function rivalLineBytes(id: string): number | null {
  const n = matrix().find((lib) => lib.id === id)?.bundleGzip?.minimalLine;
  return typeof n === "number" ? n : null;
}

export function chartkitLineBytes(): number {
  const file = JSON.parse(readFileSync(join(repoRoot(), "catalog/public/benchmarks.json"), "utf8")) as {
    headline: { lineGzipBytes: number };
  };
  return file.headline.lineGzipBytes;
}

export function kb(bytes: number): string {
  return `${(bytes / 1000).toFixed(1)} KB`;
}
