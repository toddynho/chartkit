import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { benchmarksMarkdown, benchmarksPayload, benchmarksSchema } from "./benchmarks-doc.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "content"), { recursive: true });
const json = `${JSON.stringify(benchmarksPayload(), null, 2)}\n`;
const schema = `${JSON.stringify(benchmarksSchema, null, 2)}\n`;
writeFileSync(join(root, "public/benchmarks.json"), json);
writeFileSync(join(root, "public/benchmarks.schema.json"), schema);
writeFileSync(join(root, "content/benchmarks.md"), benchmarksMarkdown());
console.log(`wrote benchmarks.json (${json.length} bytes), benchmarks.md, benchmarks.schema.json`);
