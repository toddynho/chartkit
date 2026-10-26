import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  BenchmarksPage,
  ExampleFile,
  ExamplesIndex,
  FeatureFile,
  FeatureIndex,
  HomeStory,
  PlaygroundFile,
  ShowcaseBoard,
  ShowcaseIndex,
} from "./surface-types";
import { repoRoot } from "./repo-root";

function generated(dir: string, name: string): string {
  return join(repoRoot(), "apps/web/.generated", dir, name);
}

function readGenerated(dir: string, name: string): string {
  const file = generated(dir, name);
  if (!existsSync(file)) throw new Error(`Missing ${file}. Run npm run paint --workspace=chartkit-web`);
  return readFileSync(file, "utf8");
}

export function loadShowcaseIndex(): ShowcaseIndex {
  return JSON.parse(readGenerated("showcase", "index.json")) as ShowcaseIndex;
}

export function loadShowcase(slug: string): ShowcaseBoard {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Unknown showcase board: ${slug}`);
  return JSON.parse(readGenerated("showcase", `${slug}.json`)) as ShowcaseBoard;
}

export function loadExamplesIndex(): ExamplesIndex {
  return JSON.parse(readGenerated("examples", "index.json")) as ExamplesIndex;
}

export function loadExample(slug: string): ExampleFile {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Unknown example: ${slug}`);
  return JSON.parse(readGenerated("examples", `${slug}.json`)) as ExampleFile;
}

export function loadFeatureIndex(): FeatureIndex {
  return JSON.parse(readGenerated("features", "index.json")) as FeatureIndex;
}

export function loadFeature(id: string): FeatureFile {
  if (!/^[a-z0-9.-]+$/.test(id)) throw new Error(`Unknown feature: ${id}`);
  return JSON.parse(readGenerated("features", `${id}.json`)) as FeatureFile;
}

export function loadBenchmarksPage(): BenchmarksPage {
  return JSON.parse(readGenerated("benchmarks", "page.json")) as BenchmarksPage;
}

export function loadHomeStory(): HomeStory {
  return JSON.parse(readGenerated("home", "story.json")) as HomeStory;
}

export function loadPlayground(): PlaygroundFile {
  return JSON.parse(readGenerated("playground", "hero.json")) as PlaygroundFile;
}
