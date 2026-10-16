/**
 * Write src/generated/schema.runtime.json from schema/chartkit.schema.json.
 * Drops annotations the walker never reads. Property names such as `title`
 * and `description` stay. The published schema file is unchanged.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(readFileSync(join(root, "schema/chartkit.schema.json"), "utf8"));

const annotations = new Set(["description", "title", "examples", "markdownDescription", "$comment", "default"]);
const bags = new Set(["properties", "$defs", "patternProperties", "dependentSchemas"]);

function stripSchema(node) {
  if (Array.isArray(node)) return node.map(stripSchema);
  if (!node || typeof node !== "object") return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (annotations.has(key)) continue;
    if (bags.has(key) && value && typeof value === "object" && !Array.isArray(value)) {
      const bag = {};
      for (const [name, child] of Object.entries(value)) bag[name] = stripSchema(child);
      out[key] = bag;
      continue;
    }
    out[key] = stripSchema(value);
  }
  return out;
}

const { $schema, $id, ...rest } = schema;
void $schema;
void $id;
const slim = stripSchema(rest);
const json = JSON.stringify(slim);
writeFileSync(join(root, "src/generated/schema.runtime.json"), json);
console.log(`schema.runtime.json ${json.length} bytes`);
