import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { dataDir } from "./paths.js";

export interface ExampleFile {
  file: string;
  type: string;
  id?: string;
  spec: Record<string, unknown>;
}

let cached: ExampleFile[] | null = null;

export function loadExamples(): ExampleFile[] {
  if (cached) return cached;
  const dir = join(dataDir(), "examples");
  const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
  cached = files.map((file) => {
    const spec = JSON.parse(readFileSync(join(dir, file), "utf8")) as Record<string, unknown>;
    const type = typeof spec.type === "string" ? spec.type : "";
    const id = typeof spec.id === "string" ? spec.id : undefined;
    return { file, type, id, spec };
  });
  return cached;
}

export function listChartTypes(): { types: { type: string; files: string[] }[] } {
  const types: { type: string; files: string[] }[] = [];
  for (const example of loadExamples()) {
    const existing = types.find((item) => item.type === example.type);
    if (existing) existing.files.push(example.file);
    else types.push({ type: example.type, files: [example.file] });
  }
  return { types };
}

export interface ExampleResult {
  match: "type" | "file";
  type: string;
  examples: { file: string; id?: string; spec: Record<string, unknown> }[];
}

export function getExample(type: string): ExampleResult | { error: string; types: string[] } {
  const needle = type.trim().toLowerCase().replace(/\.json$/, "");
  const examples = loadExamples();
  const byName = examples.filter((example) => {
    const file = example.file.toLowerCase().replace(/\.json$/, "");
    return file === needle || example.id?.toLowerCase() === needle;
  });
  const chosen = byName.length ? byName : examples.filter((example) => example.type.toLowerCase() === needle);
  if (!chosen.length) {
    return {
      error: `No example named ${JSON.stringify(type)}.`,
      types: [...new Set(examples.map((example) => example.type))],
    };
  }
  return {
    match: byName.length ? "file" : "type",
    type: chosen[0]?.type ?? needle,
    examples: chosen.map((example) => {
      const item: ExampleResult["examples"][number] = { file: example.file, spec: example.spec };
      if (example.id) item.id = example.id;
      return item;
    }),
  };
}
