/**
 * Copy the published matrix, llms.txt, the JSON Schema, and the example specs
 * into packages/mcp/data. The server reads only this directory. Nothing is fetched.
 * features.json is copied byte for byte. Do not hand-edit the copy.
 */
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(pkgRoot, "../..");
const dataDir = join(pkgRoot, "data");
const examplesDir = join(dataDir, "examples");

rmSync(dataDir, { recursive: true, force: true });
mkdirSync(examplesDir, { recursive: true });

cpSync(join(repoRoot, "catalog/public/features.json"), join(dataDir, "features.json"));
cpSync(join(repoRoot, "catalog/public/llms.txt"), join(dataDir, "llms.txt"));
cpSync(join(repoRoot, "packages/core/schema/chartkit.schema.json"), join(dataDir, "schema.json"));

const examples = readdirSync(join(repoRoot, "packages/core/examples")).filter((name) => name.endsWith(".json"));
if (examples.length === 0) throw new Error("packages/core/examples has no JSON specs");
for (const name of examples) {
  cpSync(join(repoRoot, "packages/core/examples", name), join(examplesDir, name));
}
