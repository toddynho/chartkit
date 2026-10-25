import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./repo-root";

function readGenerated(name: string): string {
  const file = join(repoRoot(), "apps/web/.generated", name);
  if (!existsSync(file)) throw new Error(`Missing ${file}. Run npm run paint --workspace=chartkit-web`);
  return readFileSync(file, "utf8");
}

export interface Painted {
  spec: unknown;
  svg: string;
  alt: string;
  preset?: boolean;
}

export interface CompareCounts {
  win: number;
  loss: number;
  tie: number;
  unknown: number;
}

export interface CompareLibrary {
  id: string;
  name: string;
  package: string;
  version: string;
  dateChecked: string;
  docs: string;
  escapeHatch: string;
  license: string;
}

export interface CompareIndex {
  dateChecked: string;
  chartkitRechecked: string;
  chartkitCommit: string;
  rivals: ({ library: CompareLibrary } & CompareCounts)[];
}

export interface CompareRow {
  id: string;
  label: string;
  badge: string;
  ours: string;
  theirs: string;
  tier: string | null;
  option: string;
  verified: string;
  strength: string;
  source: string;
}

export interface ComparePage {
  library: CompareLibrary;
  chartkitCommit: string;
  chartkitRechecked: string;
  counts: CompareCounts;
  size: string;
  perf: string;
  loss: CompareRow[];
  win: CompareRow[];
  unknown: CompareRow[];
  tie: CompareRow[];
}

export function loadCompareIndex(): CompareIndex {
  return JSON.parse(readGenerated("compare/index.json")) as CompareIndex;
}

export function loadCompare(id: string): ComparePage {
  if (!/^[a-z0-9]+$/.test(id)) throw new Error(`Unknown library: ${id}`);
  return JSON.parse(readGenerated(`compare/${id}.json`)) as ComparePage;
}

export interface MapCard extends Painted {
  preset: boolean;
}

export interface MapsFile {
  world: MapCard;
  us: MapCard;
  cities: MapCard;
  board: string;
  bars: Record<string, string>;
  initial: string;
}

export function loadMaps(): MapsFile {
  return JSON.parse(readGenerated("maps.json")) as MapsFile;
}

export interface DemoFile {
  kpis: Painted[];
  throughput: Painted;
  services: Painted;
}

export function loadDemo(): DemoFile {
  return JSON.parse(readGenerated("demo.json")) as DemoFile;
}

export interface InteractionFile {
  navigator: Painted;
  synced: Painted[];
  sales: Painted;
}

export function loadInteraction(): InteractionFile {
  return JSON.parse(readGenerated("interaction.json")) as InteractionFile;
}

export interface LayoutsFile {
  rule: string;
  facet: Painted;
  dashboard: Painted;
  wide: Painted;
  narrow: Painted;
  rtl: Painted;
  hebrew: Painted;
}

export function loadLayouts(): LayoutsFile {
  return JSON.parse(readGenerated("layouts.json")) as LayoutsFile;
}

export interface SpecIndex {
  pages: { type: string; title: string; summary: string }[];
}

export interface SpecPage {
  type: string;
  title: string;
  summary: string;
  fields: string[];
  example: string;
  chart: Painted;
}

export function loadSpecIndex(): SpecIndex {
  return JSON.parse(readGenerated("spec/index.json")) as SpecIndex;
}

export function loadSpec(type: string): SpecPage {
  if (!/^[a-z0-9-]+$/.test(type)) throw new Error(`Unknown spec: ${type}`);
  return JSON.parse(readGenerated(`spec/${type}.json`)) as SpecPage;
}

export interface LookChart extends Painted {
  title: string;
  preset: boolean;
}

export interface ThemingFile {
  swatch: Painted;
  looks: { id: string; label: string; detail: string; charts: LookChart[] }[];
  tokens: { token: string; role: string }[];
  themes: string[];
}

export function loadTheming(): ThemingFile {
  return JSON.parse(readGenerated("theming.json")) as ThemingFile;
}

export interface ConvertWarning {
  code: string;
  path: string;
  message: string;
}

export interface ConvertSample {
  id: string;
  label: string;
  source: string;
  detected: string | null;
  spec: unknown;
  svg: string;
  warnings: ConvertWarning[];
}

export interface ConvertFile {
  samples: ConvertSample[];
  coverage: Record<string, { mapped: string[]; unsupported: string[] }>;
}

export function loadConvert(): ConvertFile {
  return JSON.parse(readGenerated("convert.json")) as ConvertFile;
}

export interface WhenToUseFile {
  faqs: { question: string; answer: string }[];
  jsonLd: unknown;
}

export function loadWhenToUse(): WhenToUseFile {
  return JSON.parse(readGenerated("when-to-use.json")) as WhenToUseFile;
}

export function loadReference(): { types: { type: string; summary: string }[] } {
  return JSON.parse(readGenerated("reference.json")) as { types: { type: string; summary: string }[] };
}

export function loadCloudDocs(): { snippets: { img: string; fetch: string; clean: string } } {
  return JSON.parse(readGenerated("cloud-docs.json")) as { snippets: { img: string; fetch: string; clean: string } };
}
