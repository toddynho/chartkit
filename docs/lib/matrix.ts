import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface MatrixCell {
  status: string;
  tier: string | null;
  apiPaths: string[];
  verified: string;
  strength: string;
  source: string[];
  note?: string;
  assessed?: string;
}

export interface MatrixFeature {
  id: string;
  category: string;
  label: string;
  desc: string;
  agentRelevance: number;
  badge: string;
  spec: Record<string, unknown> | null;
  cells: Record<string, MatrixCell>;
}

export interface BundleGzip {
  minimalLine?: number | null;
  fullEntry?: number | null;
  source?: string;
  commit?: string;
  coreCommit?: string;
  measured?: string;
  method?: string;
  note?: string;
  harnessLine?: number | null;
  sizeScriptAll?: number | null;
  reactExternal?: boolean;
  jsGzipBytes?: number | null;
  cssGzipBytes?: number | null;
  priorExtract?: { minimalLine?: number | null; fullEntry?: number | null; measured?: string; note?: string } | null;
}

export interface MatrixLibrary {
  id: string;
  name: string;
  package: string;
  version: string;
  dateChecked: string;
  docs: string;
  escapeHatch: string;
  license: string;
  bundleGzip?: BundleGzip | null;
}

export interface MatrixFile {
  schemaVersion: string;
  generated: string;
  methodology: string;
  chartkitCommit: string;
  chartkitRechecked: string;
  dateChecked: string;
  synonymsNote: string;
  libraries: MatrixLibrary[];
  notScored: { id: string; name: string; reason: string }[];
  taxonomy: { id: string; label: string; desc: string }[];
  features: MatrixFeature[];
  synonyms: Record<string, string[]>;
  coverage: {
    cells: number;
    strong: number;
    weak: number;
    absence: number;
    unknown: number;
    byStatus: Record<string, number>;
  };
}

const RANK: Record<string, number> = {
  native: 5,
  partial: 4,
  plugin: 3,
  manual: 2,
  none: 1,
  unknown: 0,
};

export function rankStatus(status: string): number {
  return RANK[status] ?? 0;
}

export function callFor(ours: string | undefined, theirs: string | undefined): Call {
  if (!ours || !theirs || ours === "unknown" || theirs === "unknown") return "unknown";
  const theirRank = rankStatus(theirs);
  const ourRank = rankStatus(ours);
  if (theirRank > ourRank) return "loss";
  if (ourRank > theirRank) return "win";
  return "tie";
}

let cached: MatrixFile | null = null;

export function matrix(): MatrixFile {
  if (!cached) {
    const path = join(process.cwd(), "public/features.json");
    cached = JSON.parse(readFileSync(path, "utf8")) as MatrixFile;
  }
  return cached;
}

export function featureById(id: string): MatrixFeature | null {
  return matrix().features.find((feature) => feature.id === id) ?? null;
}

export function librariesExceptChartkit(): MatrixLibrary[] {
  return matrix().libraries.filter((library) => library.id !== "chartkit");
}

export function optionText(cell: MatrixCell | undefined): string {
  const paths = cell?.apiPaths ?? [];
  const concrete = paths.filter((path) => !path.startsWith("~"));
  const shown = (concrete.length ? concrete : paths).slice(0, 2);
  return shown.length ? shown.join(", ") : "—";
}

export type Call = "loss" | "win" | "tie" | "unknown";

export interface CompareRow {
  feature: MatrixFeature;
  ours: MatrixCell;
  theirs: MatrixCell;
  call: Call;
}

export function compareRows(libraryId: string): CompareRow[] {
  return matrix().features.map((feature) => {
    const ours = feature.cells.chartkit;
    const theirs = feature.cells[libraryId];
    return { feature, ours, theirs, call: callFor(ours?.status, theirs?.status) };
  });
}

export function tally(rows: CompareRow[]) {
  return {
    loss: rows.filter((row) => row.call === "loss").length,
    win: rows.filter((row) => row.call === "win").length,
    tie: rows.filter((row) => row.call === "tie").length,
    unknown: rows.filter((row) => row.call === "unknown").length,
  };
}
